import React from 'react';
import { NowSpeakingBadge } from './NowSpeakingBadge';
// @ts-ignore
import Logo from '../../../Logo.svg';

const ChatHeader: React.FC = () => {
  return (
    <header
      className="fixed top-0 left-0 w-full z-50 bg-background border-b border-gray-700 flex justify-between items-center px-4"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        height: 'calc(env(safe-area-inset-top) + 64px)'
      }}
    >
      <div className="flex-1 flex items-center gap-2">
        <NowSpeakingBadge />
      </div>
      <div className="flex justify-center flex-1">
        <img src={Logo} alt="Jarvis Logo" className="h-8 w-auto filter invert" />
      </div>
      <div className="flex justify-end flex-1">
        {/* Dashboard button removed as requested */}
      </div>
    </header>
  );
};

export default ChatHeader;