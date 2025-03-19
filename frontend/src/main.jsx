import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
  </React.StrictMode>,
)
