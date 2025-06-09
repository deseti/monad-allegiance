// src/components/MolandakHouse.tsx

import { useState, useEffect } from 'react';
import type { HouseName } from '../App'; // Asumsi 'HouseName' diekspor dari App.tsx

// Menentukan properti (props) yang diterima oleh komponen ini
interface HouseProps {
  handlePledge: (houseName: HouseName) => void;
  isPledged: boolean;
  transactionCount: number;
  heartbeatTrigger: number;
  tps: number;
}

export function MolandakHouse({ handlePledge, isPledged, transactionCount, heartbeatTrigger, tps }: HouseProps) {
  const [pulseEffectClass, setPulseEffectClass] = useState('');
  const pledgedStyles = isPledged 
    ? 'shadow-lg shadow-purple-500/60 ring-2 ring-purple-400' 
    : 'ring-1 ring-gray-700';
  
  // Effect untuk heartbeat animation
  useEffect(() => {
    setPulseEffectClass('shadow-lg shadow-cyan-400/50 scale-105');
    
    const timer = setTimeout(() => {
      setPulseEffectClass('');
    }, 600);

    return () => clearTimeout(timer);
  }, [heartbeatTrigger]);

  return (
    <div className={`rounded-xl p-6 w-full lg:w-1/3 flex flex-col text-center bg-gradient-to-br from-gray-900 to-gray-800 hover:shadow-purple-500/40 hover:shadow-2xl transition-all duration-300 ${pledgedStyles} ${pulseEffectClass}`}>
      
      <img 
        src="/images/molandak.png"
        alt="House of Molandak" 
        className="w-24 h-24 mx-auto mb-4 object-cover rounded-full border-2 border-purple-500/50" 
      />
      
      <h2 className="text-3xl font-bold text-purple-400 font-sans">House of Molandak</h2>
      <p className="mt-1 text-gray-400 mb-6">The Thriving House</p>
      
      <div className="space-y-4">
        <h3 className="font-bold text-xl mb-3 text-purple-300 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
          </svg>
          Live Network Speed
          <span className="ml-2 text-xs text-green-400 animate-pulse">● Live</span>
        </h3>
        <p className="text-sm text-gray-400">Current TPS:</p>
        <p className="text-4xl font-mono my-2 text-cyan-400">
          {isNaN(tps) || tps === 0 ? '0.0' : tps.toFixed(1)} TPS
        </p>
        <div className="w-full bg-gray-700 rounded-full h-3 my-2">
          <div 
            className="h-3 rounded-full transition-all duration-300" 
            style={{ 
              width: `${Math.min((tps / 100) * 100, 100)}%`,
              backgroundColor: tps > 50 ? '#22c55e' : tps > 20 ? '#eab308' : '#ef4444'
            }}
          ></div>
        </div>
        <p className="text-sm text-gray-400 mt-2">Total Transactions:</p>
        <p className="text-2xl font-mono text-cyan-400">{transactionCount.toLocaleString('en-US')}</p>
      </div>
      
      <button 
        onClick={() => handlePledge('Molandak')}
        className={`mt-auto w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 ${isPledged ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={isPledged}
      >
        {isPledged ? 'Pledged to Molandak' : 'Pledge Allegiance'}
      </button>
    </div>
  );
}