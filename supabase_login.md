(async () => {
  const supabaseUrl = 'https://usmbvieiwmnzbqbhhbob.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzbWJ2aWVpd21uemJxYmhoYm9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2ODI4MTAsImV4cCI6MjA2MDI1ODgxMH0.FfVUzMRINatMJKm4mR6BHVN4FuK9Khe-CubmWmsy9KI';

  const ensureSupabaseClient = () => {
    return new Promise((resolve, reject) => {
      if (window.supabase) {
        console.log("Supabase client already present.");
        resolve(window.supabase);
        return;
      }

      if (window.supabaseJs) {
        try {
          window.supabase = window.supabaseJs.createClient(supabaseUrl, supabaseAnonKey);
          console.log("Supabase client ready (supabaseJs was already loaded).");
          resolve(window.supabase);
        } catch (e) {
          console.error("Error creating Supabase client from existing supabaseJs:", e);
          reject(e);
        }
        return;
      }
      
      console.log("Supabase client not found, injecting script...");
      const script = document.createElement('script');
      script.type = 'module';
      script.innerHTML = `
        import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
        window.supabaseJs = { createClient };
        const supabaseGlobalScriptEvent = new CustomEvent('supabaseJsLoaded');
        window.dispatchEvent(supabaseGlobalScriptEvent);
      `;
      
      window.addEventListener('supabaseJsLoaded', () => {
        try {
          if (window.supabaseJs && typeof window.supabaseJs.createClient === 'function') {
            window.supabase = window.supabaseJs.createClient(supabaseUrl, supabaseAnonKey);
            console.log("Supabase client ready (dynamically injected and loaded).");
            resolve(window.supabase);
          } else {
            console.error("supabaseJs or createClient not found after script load.");
            reject(new Error("supabaseJs or createClient not found after script load."));
          }
        } catch (e) {
          console.error("Error creating Supabase client after dynamic load:", e);
          reject(e);
        }
      }, { once: true });

      script.onerror = (err) => {
        console.error("Failed to load Supabase script:", err);
        reject(err);
      };
      document.head.appendChild(script);
    });
  };

  try {
    await ensureSupabaseClient();
    if (window.supabase) {
      const { data, error } = await window.supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
      } else {
        console.log("Current session:", data.session);
      }
    } else {
      console.error("window.supabase is not available after ensuring client.");
    }
  } catch (err) {
    console.error("An error occurred in the Supabase setup:", err);
  }
})();