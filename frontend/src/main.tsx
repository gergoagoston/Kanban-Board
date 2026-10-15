// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client';
import App from './components/App';
import axios from 'axios';
import './style/App.css';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
axios.defaults.headers['Content-Type'] = import.meta.env.VITE_AXIOS_CONTENT_TYPE || 'application/json';

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <App />,
  //  </StrictMode>
);
