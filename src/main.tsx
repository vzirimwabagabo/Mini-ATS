import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Handle dynamic module load errors caused by new deployments (stale chunk hashes)
window.addEventListener('vite:preloadError', (event) => {
  console.warn('[Vite] Dynamic import chunk load error detected. Reloading page with latest deployment assets…', event);
  window.location.reload();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
