import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import './styles/theme.css';
import './styles/app.css';
import { App } from './App';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root mount node #root is missing');
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);
