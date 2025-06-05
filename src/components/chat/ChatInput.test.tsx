import { describe, test, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatInput from './ChatInput'; // Adjusted import path assuming test is in same dir

// Mock hooks
const mockToggleVoice = vi.fn();
const mockToggleWalkie = vi.fn();

vi.mock('../../hooks/useVoicePlayback', () => ({
  useVoicePlayback: () => ({
    voiceEnabled: false,
    toggleVoice: mockToggleVoice,
  }),
}));

vi.mock('../../hooks/useWalkie', () => ({
  useWalkie: () => ({
    isWalkieActive: false,
    isListening: false,
    toggleWalkie: mockToggleWalkie,
    transcript: '',
    error: null,
  }),
}));

// Mock initVoiceModule from ../voice to prevent side effects if it's called
// Assuming ChatInput is in src/components/chat/ChatInput.tsx
// and voice is in src/components/voice/
// so the relative path from ChatInput.test.tsx (in src/components/chat/)
// to src/components/voice/ would be '../voice'
vi.mock('../voice', () => ({
  initVoiceModule: vi.fn(() => Promise.resolve()),
}));

// Mock react-router-dom for the Link component in DashboardButton
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'), // import and retain default behavior
  Link: ({ children, to }: { children: React.ReactNode, to: string }) => <a href={to}>{children}</a>,
}));


describe('ChatInput Component', () => {
  const mockOnSendMessage = vi.fn();
  const defaultProps = {
    onSendMessage: mockOnSendMessage,
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders correctly and matches snapshot', () => {
    const { container } = render(<ChatInput {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });

  test('input field updates value on change', () => {
    render(<ChatInput {...defaultProps} />);
    const textarea = screen.getByPlaceholderText('Ask anything...') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Hello there' } });
    expect(textarea.value).toBe('Hello there');
  });

  test('calls onSendMessage when SendButton is clicked with input', () => {
    render(<ChatInput {...defaultProps} />);
    const textarea = screen.getByPlaceholderText('Ask anything...') as HTMLTextAreaElement;
    const sendButton = screen.getByLabelText('Send message');

    fireEvent.change(textarea, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
    expect((textarea as HTMLTextAreaElement).value).toBe(''); // Assuming input clears on send
  });

  test('SendButton is disabled when input is empty', () => {
    render(<ChatInput {...defaultProps} />);
    const sendButton = screen.getByLabelText('Send message');
    expect(sendButton).toBeDisabled();
  });

  test('SendButton is enabled when input is not empty', () => {
    render(<ChatInput {...defaultProps} />);
    const textarea = screen.getByPlaceholderText('Ask anything...') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Not empty' } });
    const sendButton = screen.getByLabelText('Send message');
    expect(sendButton).not.toBeDisabled();
  });

  test('calls toggleVoice when VoiceModeToggle is clicked', () => {
    render(<ChatInput {...defaultProps} />);
    const voiceToggle = screen.getByLabelText('Enable voice mode'); // Initial label
    fireEvent.click(voiceToggle);
    expect(mockToggleVoice).toHaveBeenCalledTimes(1);
  });

  test('calls toggleWalkie when WalkieTalkieButton is clicked', () => {
    render(<ChatInput {...defaultProps} />);
    const walkieButton = screen.getByLabelText('Start voice input'); // Initial label
    fireEvent.click(walkieButton);
    expect(mockToggleWalkie).toHaveBeenCalledTimes(1);
  });

  test('DashboardButton renders and links to /dashboard', () => {
    render(<ChatInput {...defaultProps} />);
    const dashboardButton = screen.getByLabelText('Open Dashboard') as HTMLAnchorElement;
    expect(dashboardButton).toBeInTheDocument();
    expect(dashboardButton.getAttribute('href')).toBe('/dashboard');
  });

});
