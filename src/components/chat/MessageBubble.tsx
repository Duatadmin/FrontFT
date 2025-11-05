import React from 'react';
import { Message } from '../../types';
// Removed User/Bot icons

// Simplified Loading Indicator
const TypingIndicator: React.FC = () => (
  <div className="flex space-x-1 items-center p-1">
    <span className="h-1.5 w-1.5 bg-current rounded-full animate-bounce-dot [animation-delay:-0.3s]"></span>
    <span className="h-1.5 w-1.5 bg-current rounded-full animate-bounce-dot [animation-delay:-0.15s]"></span>
    <span className="h-1.5 w-1.5 bg-current rounded-full animate-bounce-dot"></span>
  </div>
);

interface MessageBubbleProps {
  message: Message;
  isLoading?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLoading = false }) => {
  const isUser = message.role === 'user';

  // Common styles inspired by ChatInput
  const bubbleBaseStyle = 'px-4 py-2.5 rounded-3xl text-base font-normal leading-relaxed backdrop-blur-md border border-white/10 transition-all duration-150 max-w-[75%] min-w-[12.5%]';
  
  // Specific styles
  const userBubbleStyle = `bg-[#DFF250]/30 text-white ${bubbleBaseStyle}`; // Olive tint for user messages
  const assistantBubbleStyle = `bg-white/5 text-text ${bubbleBaseStyle}`; // Matches ChatInput bg

  const bubbleKindStyle = isUser ? userBubbleStyle : assistantBubbleStyle;
  const alignmentClass = isUser ? 'self-end' : 'self-start';

  return (
    <div
      className={`${bubbleKindStyle} ${alignmentClass} motion-safe:animate-slide-in-up`}
    >
      {isLoading ? (
        <TypingIndicator />
      ) : (
        <div className="font-sans text-sm leading-relaxed text-inherit whitespace-pre-wrap break-words">
          {message.role === 'assistant' && message.content.includes("I'm Isinka")
            ? message.content.replace("I'm Isinka", "I'm Jarvis")
            : message.content}
        </div>
      )}
    </div>
  );
};

// Custom Prose styles (add to index.css or keep here if simple)
/*
@layer components {
  .prose-chat {
    @apply prose-p:my-0 prose-headings:my-0 prose-ul:my-0 prose-ol:my-0 prose-li:my-0;
    @apply prose-blockquote:my-0 prose-pre:my-0 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none;
    color: inherit; // Inherit text color from bubble
  }
  .prose-chat code {
     @apply text-xs px-1 py-0.5 bg-black/20 rounded;
  }
}
*/

export default MessageBubble; 