// src/components/MoyakiHouse.tsx

import { useState, useEffect } from 'react';
import type { HouseName } from '../App';

interface HouseProps {
  handlePledge: (houseName: HouseName) => void;
  isPledged: boolean;
  blockHash: string | null;
  heartbeatTrigger: number;
  handleMint: () => void;
  isMinting: boolean;
}

// Komponen helper untuk membuat pola visual dari hash
const MysticPattern = ({ hash }: { hash: string | null }) => {
  if (!hash) {
    return <div className='grid grid-cols-8 gap-1 p-1 h-[40px] items-center text-xs text-gray-500 animate-pulse'>Generating Mystic Pattern...</div>;
  }
  
  const colors = ['bg-purple-600', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500', 'bg-purple-400', 'bg-cyan-400', 'bg-pink-400', 'bg-indigo-400'];
  
  return (
    <div className='grid grid-cols-8 gap-1 p-1 my-2'>
      {Array.from({ length: 32 }).map((_, i) => {
        const charCode = hash.charCodeAt((i * 2) + 2 % hash.length) || Math.floor(Math.random() * 256); // Ensure charCode is always valid
        const colorIndex = charCode % colors.length;
        return <div key={i} className={`w-full h-5 rounded-sm ${colors[colorIndex]} transition-all duration-500 ease-in-out`}></div>
      })}
    </div>
  )
}

export function MoyakiHouse({ handlePledge, isPledged, blockHash, heartbeatTrigger, handleMint, isMinting }: HouseProps) {
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
        src="/images/moyaki.png"
        alt="House of Moyaki" 
        className="w-24 h-24 mx-auto mb-4 object-cover rounded-full border-2 border-purple-500/50" 
      />
      
      <h2 className="text-3xl font-bold text-purple-400 font-sans">House of Moyaki</h2>
      <p className="mt-1 text-gray-400 mb-6">The Mysterious</p>
      
      <div className="bg-black/30 p-6 rounded-lg mb-6 flex-grow flex flex-col justify-center">
        <h3 className="font-bold text-xl text-purple-300 mb-2">
          Mystic Pattern
        </h3>
        <MysticPattern hash={blockHash} />
        <p className="text-xs text-gray-400 mt-1">Block Essence (Hash):</p>
        <p className="text-sm font-mono break-all text-cyan-400">{blockHash ? `${blockHash.slice(0,10)}...${blockHash.slice(-8)}` : 'N/A'}</p>
        <span className='text-xs text-cyan-300 animate-pulse mt-1'>Pattern Evolving with each Block</span>
      </div>
      
      <button 
        onClick={isPledged ? handleMint : () => handlePledge('Moyaki')}
        disabled={isMinting}
        className={`mt-auto w-full ${
          isPledged 
            ? 'bg-cyan-600 hover:bg-cyan-700' 
            : 'bg-purple-600 hover:bg-purple-700'
        } text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 ${
          isMinting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isMinting 
          ? 'Minting...' 
          : isPledged 
            ? 'Mint Mystic Pattern' 
            : 'Pledge Allegiance'
        }
      </button>
      {isPledged && (
        <p className="mt-3 text-sm text-cyan-300 italic">After pledging, you can mint your unique Mystic Pattern as an NFT. Click "Mint Mystic Pattern" to claim your on-chain generative art!</p>
      )}
    </div>
  );
}