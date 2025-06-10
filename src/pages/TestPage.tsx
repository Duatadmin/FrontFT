import React from 'react';
import { useAuthGuard } from '../hooks/useAuthGuard';

const TestPage: React.FC = () => {
  useAuthGuard();
  return (
    <div className="flex items-center justify-center h-screen text-text">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Test Page</h1>
        <p>If you can see this, the app is working correctly.</p>
      </div>
    </div>
  );
};

export default TestPage;
