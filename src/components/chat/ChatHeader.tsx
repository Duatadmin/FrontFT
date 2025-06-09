import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, ChevronRight } from 'lucide-react';
import { NowSpeakingBadge } from './NowSpeakingBadge';
// @ts-ignore
import Logo from '../../../Logo.svg';

const ChatHeader: React.FC = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
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
        <button
          onClick={() => navigate('/dashboard')}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative overflow-hidden group flex items-center bg-gradient-to-r from-[#10a37f] to-[#5533ff] text-white rounded-full py-2 px-3 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
        >
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#5533ff] to-[#10a37f] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <span className="relative flex items-center">
            <BarChart3 size={18} className="mr-2" />
            <span className="font-medium">Dashboard</span>
            <ChevronRight size={16} className={`ml-1 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
          </span>
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;