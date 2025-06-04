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

  // Common styles
  const bubbleBaseStyle = 'px-4 py-2.5 rounded-xl text-base font-normal leading-relaxed shadow-sm';
  
  // Specific styles
  const userBubbleStyle = `bg-userBubble text-white ${bubbleBaseStyle}`;
  const assistantBubbleStyle = `bg-botBubble text-text ${bubbleBaseStyle}`;

  const bubbleClasses = isUser ? userBubbleStyle : assistantBubbleStyle;
  const alignmentClass = isUser ? 'self-end' : 'self-start';

  return (
    // Container applies alignment and animation
    <div className={`${alignmentClass} motion-safe:animate-slide-in-up`}>
      {/* Message Content */}
      <div className={bubbleClasses}>
        {isLoading ? (
          <TypingIndicator />
        ) : (
          // Apply whitespace-pre-wrap to render newlines
          <div className="font-sans text-sm leading-relaxed text-inherit whitespace-pre-wrap">
            {message.role === 'assistant' && message.content.includes("I'm Isinka") 
              ? message.content.replace("I'm Isinka", "I'm Jarvis")
              : message.content}
          </div>
        )}
      </div>
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