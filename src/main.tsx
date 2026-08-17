import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import * as Sentry from "@sentry/react";
import ErrorFallback from './components/ErrorFallback'
import './index.css'

Sentry.init({
  dsn: "https://6cbe67fe7375a7dc8ef4273020d80791@o4511924551811072.ingest.us.sentry.io/4511924553842689",
  dataCollection: {
    // userInfo: false,
    // httpBodies: []
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={({ error, resetError }) => <ErrorFallback error={error as Error} resetError={resetError} />}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
)

// Forcefully unregister any service workers to ensure the latest code is always fetched
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
  // Clear any existing PWA caches to forcefully vanish old versions
  caches.keys().then((keyList) => {
    return Promise.all(keyList.map((key) => {
      return caches.delete(key);
    }));
  });
}
