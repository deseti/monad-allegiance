// src/main.tsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import semua yang kita butuhkan dari library
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme // <-- 1. IMPORT darkTheme DARI RAINBOWKIT
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

// ... (kode untuk mendefinisikan monadTestnet tetap sama)
const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' },
  },
};

// ... (kode untuk konfigurasi wagmi tetap sama)
const config = getDefaultConfig({
  appName: 'Monad Allegiance',
  projectId: 'b848be06b00556581862fde65bcd9c55',
  chains: [monadTestnet],
  ssr: false,
});

const queryClient = new QueryClient();

// Render aplikasi kita
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* 2. GUNAKAN darkTheme DAN SESUAIKAN WARNANYA DI SINI */}
        <RainbowKitProvider 
          theme={darkTheme({
            accentColor: '#8b5cf6', // Warna ungu (mirip dengan purple-500 di Tailwind)
            accentColorForeground: 'white', // Warna teks di atas warna ungu
            borderRadius: 'medium', // Membuat sudut sedikit lebih tumpul
          })}
        >
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
)