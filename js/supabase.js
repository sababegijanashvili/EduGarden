// js/supabase.js – Global Supabase client and utilities
// Load Supabase client (assumes supabase-js is included via CDN in index.html)
// Make sure to include <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> before this script.

// Initialize Supabase client (replace with your actual Supabase URL and anon key)
const SUPABASE_URL = 'https://exoyfpqfgixofsuginxx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UExfTnoTaFgieljt6oiZ8Q_m0f2raxy';
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Simple toast implementation
window.showToast = function (message, type = 'info') {
  // Ensure a container exists
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.minWidth = '200px';
  toast.style.marginTop = '8px';
  toast.style.padding = '12px 16px';
  toast.style.borderRadius = '6px';
  toast.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
  toast.style.color = '#fff';
  toast.style.background = type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#333';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.3s';
  container.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity = '1'; });
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => container.removeChild(toast), 300);
  }, 3000);
};

// Language change callback registry
window.__languageChangeCallbacks = [];
window.registerLanguageChange = function (cb) {
  if (typeof cb === 'function') {
    window.__languageChangeCallbacks.push(cb);
  }
};

// Extend switchLanguage to trigger callbacks (patched in language.js)
