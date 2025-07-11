import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { logger } from './utils/logger';

// Initialize logging
logger.info('config', 'Application initializing');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

logger.info('config', 'Application rendered');