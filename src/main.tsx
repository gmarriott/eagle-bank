import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@/styles/global.css';

/**
 * In this project the MSW mock is the backend, start the worker in all environments
 * lets the deployed static build run end-to-end with no server.
 */
async function enableMocking() {
  const { worker } = await import('@/mocks/browser');
  return worker.start({
    /**
    * onUnhandledRequest - (fonts, the worker script itself) load normally while /api/* is intercepted.
    */
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  });
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
