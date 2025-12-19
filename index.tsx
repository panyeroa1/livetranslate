import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // While we don't create CSS files, this is often expected by build tools. We rely on Tailwind script in HTML mostly, but good practice to have if we added custom styles in a style block in index.html

// Injecting the styles defined in index.html into a style tag for consistency if this were a bundled app, 
// but since we use the HTML template directly, we just render.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
