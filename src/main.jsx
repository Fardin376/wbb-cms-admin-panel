// Add this at the very top of the file
window.global = window;

import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './Router';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
