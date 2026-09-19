import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import axios from 'axios';

// Fix double slashes in URLs caused by trailing slashes in env variables
axios.interceptors.request.use(config => {
  if (config.url) {
    config.url = config.url.replace(/([^:]\/)\/+/g, "$1");
  }
  return config;
});

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
