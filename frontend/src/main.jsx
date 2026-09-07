import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>

  <App/>
   
  </StrictMode>,
)
