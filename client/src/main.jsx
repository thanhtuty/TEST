import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './style.css'
import { BrowserRouter } from "react-router"
import { CartProvider } from "./context/CartContext.jsx";
createRoot(document.getElementById('root')).render(
   <React.StrictMode>
    <CartProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </CartProvider>
  </React.StrictMode>
)
