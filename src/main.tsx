import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import Dashboard from './pages/dashboard'
import EnhancedDashboard from './pages/EnhancedDashboard'
import DiaryPage from './pages/DiaryPage'
import EnhancedDiaryPage from './pages/EnhancedDiaryPage'
import TestPage from './pages/TestPage'
import ProgramsPageSkeleton from './components/skeletons/ProgramsPageSkeleton'

// Import ProgramsPage with proper lazy-loading
const ProgramsPage = React.lazy(() => {
  // Preload the component for smoother transitions and prevent flicker
  return import('./pages/programs');
});

// Preload the Programs page module in the background
// This helps eliminate layout flicker by having the module ready
// when the user clicks on Programs navigation
const preloadPrograms = () => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'script';
  link.href = '/assets/programs-chunk.js'; // This is an approximation, Vite might use a different naming
  document.head.appendChild(link);
};

// Trigger preload when the app loads
window.addEventListener('load', preloadPrograms);

import './index.css'
import './styles/animations.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashboard" element={<EnhancedDashboard />} />
        <Route path="/dashboard-old" element={<Dashboard />} />
        <Route path="/diary" element={<EnhancedDiaryPage />} />
        <Route path="/diary-old" element={<DiaryPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/programs" element={
          <React.Suspense fallback={<ProgramsPageSkeleton />}>
            <ProgramsPage />
          </React.Suspense>
        } />
        <Route path="*" element={<div className="flex items-center justify-center h-screen bg-background text-text">Page not found</div>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
