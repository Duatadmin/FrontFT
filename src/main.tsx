import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Keep BrowserRouter
import AppRouter from './routes/AppRouter'; // Import AppRouter

// CSS imports remain
import './index.css';
import './styles/animations.css';

// Attempt to import supabase client and render app
// This is to catch critical errors during Supabase client initialization
const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    // Dynamically import supabase to catch initialization errors here
    const { supabase } = await import('./lib/supabase');
    
    // Ensure supabase object is valid (it might not be if import itself failed silently or threw an error caught by dynamic import)
    if (!supabase || !supabase.auth) {
        throw new Error('Supabase client failed to initialize correctly.');
    }

    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <BrowserRouter>
          <AppRouter /> {/* AppRouter now handles all routes */}
        </BrowserRouter>
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to initialize the application:', error);
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; background-color: #121212; color: #f0f0f0;">
        <h1>Application Error</h1>
        <p>Could not initialize the application. Please check the console for more details.</p>
        <p style="color: #ff6b6b; margin-top: 10px;">${error instanceof Error ? error.message : 'An unknown error occurred.'}</p>
      </div>
    `;
  }
} else {
  console.error('Failed to find the root element. The application cannot start.');
}