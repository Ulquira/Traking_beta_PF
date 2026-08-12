import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Index from '@/pages/Index'
import Seguimiento from '@/pages/Seguimiento'
import './index.css'
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/ThemeProvider'
import '@/lib/firebaseConfig' // Inicializar Firebase Analytics

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(err => {
    console.error('Service Worker registration failed:', err);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="win-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/seguimiento/:token" element={<Seguimiento />} />
          <Route path="/admin" element={<div className="p-10 min-h-screen text-center text-xl">Admin Page</div>} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
)