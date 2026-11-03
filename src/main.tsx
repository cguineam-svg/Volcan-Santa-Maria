import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import './index.css';
import App from './App.tsx';
import { ToastProvider } from './components/Toast.tsx';
import { AuthProvider } from './features/auth/AuthProvider.tsx';
import { ThemeProvider } from './features/theme/ThemeProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js');
    // Asks the browser not to evict the saved map and app when storage runs low.
    void navigator.storage?.persist?.();
  });
}
