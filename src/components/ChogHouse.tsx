// src/components/ChogHouse.tsx

import { useState, useEffect } from 'react';
import type { HouseName } from '../App';

interface HouseProps {
  handlePledge: (house: HouseName) => void;
  isPledged: boolean;
  heartbeatTrigger: number;
  latestTxHash: string | null;
}

export function ChogHouse({ handlePledge, isPledged, heartbeatTrigger, latestTxHash }: HouseProps) {
  const [pulseEffectClass, setPulseEffectClass] = useState('');

  // Efek denyut (pulse) pada background lingkaran gambar saat heartbeatTrigger berubah
  useEffect(() => {
    setPulseEffectClass('shadow-lg shadow-cyan-400/50 scale-105');
    const timer = setTimeout(() => {
      setPulseEffectClass('');
    }, 600);
    return () => clearTimeout(timer);
  }, [heartbeatTrigger]);

  return (
    <div className={`rounded-xl p-6 w-full lg:w-1/3 flex flex-col text-center bg-gradient-to-br from-gray-900 to-gray-800 hover:shadow-purple-500/40 hover:shadow-2xl transition-all duration-300 ${pulseEffectClass}`}>
      {/* Logo Chog dengan efek background lingkaran gelap dan pulse */}
      <div className="relative mb-4 flex items-center justify-center mx-auto">
        <span className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-purple-900/80 to-gray-900/80"></span>
        <img
          src="/logos/chog.png"
          alt="Chog Logo"
          className="w-24 h-24 object-cover rounded-full border-2 border-purple-500/50 bg-gray-900 relative z-10"
          onError={e => {
            const target = e.target as HTMLImageElement;
            target.src = '/logos/default-token.png';
          }}
        />
      </div>
      {/* Judul dan Subjudul */}
      <h2 className="text-2xl font-bold text-purple-400 mb-1 text-center">Chog House</h2>
      <p className="text-gray-400 mb-6 text-center">The Action House</p>

      {/* Konten utama: latest transaction hash */}
      <div className="bg-black/30 p-6 rounded-lg mb-6 w-full flex-grow flex flex-col justify-center items-center">
        <h3 className="font-bold text-xl mb-3 text-purple-300 flex items-center justify-center gap-2">
          Latest Transaction Hash
          <span className="text-xs text-green-400 animate-pulse ml-2">● Live</span>
        </h3>
        <div className="text-sm font-mono text-cyan-400 break-all text-center">
          {latestTxHash ? `${latestTxHash.slice(0, 10)}...${latestTxHash.slice(-8)}` : '-'}
        </div>
      </div>

      {/* Tombol pledge */}
      <button
        onClick={() => handlePledge('Chog')}
        className={`mt-auto w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 ${isPledged ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={isPledged}
      >
        {isPledged ? 'Pledged to Chog' : 'Pledge Allegiance'}
      </button>
    </div>
  );
}