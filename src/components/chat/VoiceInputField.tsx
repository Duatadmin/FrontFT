import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { SendHorizonal, Mic, Plus, Globe, MoreHorizontal } from 'lucide-react'; 
import { 
  getVoiceModule, 
  onVoiceState, 
  startVoiceRecording,
  stopVoiceRecording
} from '../../voice/singleton';
import { setTranscriptTarget } from '../voice';
import { AudioVisualizer } from '../voice';
import { clsx as cx } from 'clsx';

interface VoiceInputFieldProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onTtsPlaybackStart?: () => void;
  onTtsPlaybackEnd?: () => void;
}

const VoiceInputField: React.FC<VoiceInputFieldProps> = ({ 
  onSendMessage, 
  isLoading
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Unique ID for transcript targeting
  const chatInputId = 'chat-input';
  
  // Initialize voice module on component mount
  useEffect(() => {
    try {
      // Initialize voice module
      getVoiceModule();
      
      // Set transcript target
      setTranscriptTarget(chatInputId);
      
      // Listen for state changes
      onVoiceState((state) => {
        setIsListening(state === 'recording');
      });
      
      console.log('Voice module initialized in voice input field');
    } catch (error) {
      console.error('Failed to initialize voice module in voice input field:', error);
    }
  }, []);
  
  // Handle final transcript
  useEffect(() => {
    const handleFinalTranscript = () => {
      const finalTranscript = document.getElementById(`${chatInputId}-final`);
      if (finalTranscript && finalTranscript.textContent) {
        const transcript = finalTranscript.textContent.trim();
        if (transcript) {
          onSendMessage(transcript);
          // Clear the transcript
          finalTranscript.textContent = '';
        }
      }
    };
    
    // Listen for mutations to the final transcript element
    const observer = new MutationObserver(handleFinalTranscript);
    const finalTranscriptEl = document.getElementById(`${chatInputId}-final`);
    
    if (finalTranscriptEl) {
      observer.observe(finalTranscriptEl, { childList: true, characterData: true, subtree: true });
    } else {
      // Create the transcript containers if they don't exist yet
      const transcriptContainer = document.createElement('div');
      transcriptContainer.style.display = 'none';
      
      const interimEl = document.createElement('div');
      interimEl.id = `${chatInputId}-interim`;
      
      const finalEl = document.createElement('div');
      finalEl.id = `${chatInputId}-final`;
      
      transcriptContainer.appendChild(interimEl);
      transcriptContainer.appendChild(finalEl);
      document.body.appendChild(transcriptContainer);
      
      // Now observe the final element
      observer.observe(finalEl, { childList: true, characterData: true, subtree: true });
    }
    
    return () => observer.disconnect();
  }, [onSendMessage]);

  // Auto-resize textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 128; // Max height ~ 5 rows
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      // Show scrollbar if content exceeds max height
      textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  }, [inputValue]);

  const handleSend = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput && !isLoading) {
      onSendMessage(trimmedInput);
      setInputValue('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.overflowY = 'hidden';
        // Briefly delay focus to allow potential layout shifts
        setTimeout(() => textareaRef.current?.focus(), 0);
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent default newline on Enter
      handleSend();
    }
    // Shift+Enter will create a newline by default
  };

  const toggleMic = async () => {
    if (isListening) {
      await stopVoiceRecording();
    } else {
      await startVoiceRecording();
    }
  };

  return (
    <div className="sticky bottom-0 z-10 bg-gradient-to-t from-background via-background/95 to-background/0 pt-2 pb-2"
       style={{ paddingBottom: `calc(0.5rem + var(--safe-area-inset-bottom))` }}>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center p-2 bg-gray-900 rounded-xl border border-gray-700">
          {/* Attach Button */}
          <button className="text-white mr-2">
            <Plus size={20} />
          </button>
          
          {/* Search Button */}
          <button className="flex items-center text-white mr-2">
            <Globe size={20} /> 
            <span className="ml-1 hidden sm:inline">Search</span>
          </button>
          
          {/* More Options Button */}
          <button className="text-white mr-2">
            <MoreHorizontal size={20} />
          </button>
          
          {/* Input Area */}
          <div className="flex-grow mx-2 relative">
            {!isListening ? (
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Send a message..."
                className="w-full bg-transparent text-white outline-none resize-none py-2 px-0 border-none"
                rows={1}
                disabled={isLoading}
                autoComplete="off"
                style={{ scrollbarWidth: 'thin' }}
              />
            ) : (
              <div className="h-10 flex items-center justify-center">
                <AudioVisualizer 
                  width={180} 
                  height={30}
                  barColor="#00FFCC"
                  barCount={30}
                />
                <span id={`${chatInputId}-interim`} className="absolute text-white/70 text-sm"></span>
              </div>
            )}
          </div>
          
          {/* Mic Button */}
          <button 
            onClick={toggleMic}
            className={cx(
              'p-2 rounded-full transition-all mr-2',
              isListening 
                ? 'bg-primary text-white scale-105 shadow-[0_0_6px_rgba(0,255,204,0.5)]' 
                : 'text-white hover:bg-gray-800'
            )}
            aria-label={isListening ? "Stop recording" : "Start recording"}
          >
            <Mic size={20} />
          </button>
          
          {/* Send Button */}
          <button
            onClick={handleSend}
            className={cx(
              "p-2 rounded-full transition-all",
              inputValue.trim() && !isLoading 
                ? "bg-white text-black hover:opacity-80 active:scale-95" 
                : "bg-gray-800 text-gray-500 cursor-not-allowed opacity-60"
            )}
            disabled={!inputValue.trim() || isLoading}
            aria-label="Send message"
          >
            <SendHorizonal size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceInputField;
