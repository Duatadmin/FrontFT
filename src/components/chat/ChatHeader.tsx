import React from 'react';
// @ts-ignore
import Logo from '../../../Logo.svg';

const ChatHeader: React.FC = () => {
  return (
    <header
      className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 bg-white/5 backdrop-blur-md transition-all duration-150 border border-white/10"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        height: 'calc(env(safe-area-inset-top) + 64px)'
      }}
    >
      <div className="flex-1" />
      <div className="flex justify-center flex-1">
        <img src={Logo} alt="Jarvis Logo" className="h-8 w-auto filter invert" />
      </div>
      <div className="flex-1" />
    </header>
  );
};

export default ChatHeader;