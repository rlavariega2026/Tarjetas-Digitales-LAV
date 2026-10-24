import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// El editor debe cargar siempre la versión publicada, no una copia vieja del service worker.
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations
        .filter((registration) => registration.scope.includes('/tarjetas-digitales/'))
        .forEach((registration) => void registration.unregister());
    }).catch(() => undefined);

    if ('caches' in window) {
      caches.keys().then((keys) => Promise.all(
        keys
          .filter((key) => /workbox|tarjetas-digitales/i.test(key))
          .map((key) => caches.delete(key))
      )).catch(() => undefined);
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
