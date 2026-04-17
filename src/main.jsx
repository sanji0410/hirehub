// main.jsx
// Application entry point — mounts React app and imports global styles

import { StrictMode } from 'react';
import { createRoot }  from 'react-dom/client';
import './styles/global.css';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
