import React from 'react';

interface AppProviderProps {
  children: React.ReactNode;
}

// Simple wrapper component that doesn't use Chakra UI
export const ChakraProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <div className="app-wrapper">
      {children}
    </div>
  );
};

export default ChakraProvider;
