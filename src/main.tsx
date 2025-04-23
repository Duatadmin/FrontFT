import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import Dashboard from './pages/dashboard'
import EnhancedDashboard from './pages/EnhancedDashboard'
import DiaryPage from './pages/DiaryPage'
import './index.css'
import './styles/animations.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashboard" element={<EnhancedDashboard />} />
        <Route path="/dashboard-old" element={<Dashboard />} />
        <Route path="/diary" element={<DiaryPage />} />
        <Route path="*" element={<div className="flex items-center justify-center h-screen bg-background text-text">Page not found</div>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
