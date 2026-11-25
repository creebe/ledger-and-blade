import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import { ExpApp } from './ui/expeditions/ExpApp';
import { trialOn } from './features';
import './styles.css';

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {trialOn() ? <ExpApp /> : <App />}
  </StrictMode>,
);
