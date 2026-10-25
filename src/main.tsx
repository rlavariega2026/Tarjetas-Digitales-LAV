import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Registrar la PWA dentro de su propia ruta para permitir instalación y actualización.
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/tarjetas-digitales/sw.js', {
      scope: '/tarjetas-digitales/',
      updateViaCache: 'none',
    }).catch((error) => console.error('No se pudo registrar la PWA:', error));
  });
}

createRoot(document.getElementById('root')!).render(<App />);
