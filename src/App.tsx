import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MolandakHouse } from './components/MolandakHouse';
import { ChogHouse } from './components/ChogHouse';
import { MoyakiHouse } from './components/MoyakiHouse';
import GasPriceChart from './components/GasPriceChart';
import TokenLeaderboard from './components/TokenList';
import DappsList from './components/DappsList';
import { FaPlay, FaPause } from 'react-icons/fa';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { FaGithub } from 'react-icons/fa';
import { createPublicClient, http, defineChain } from 'viem';
import { useAccount, useWriteContract } from 'wagmi';
import axios from 'axios';

// Define Monad chain
const monad = defineChain({
  id: 1337,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MONAD',
  },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
    public: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://explorer.monad.xyz' },
  },
});

interface TokenInfo {
  name: string;
  logo: string;
}

interface TokenActivity extends TokenInfo {
  count: number;
  address: string;
  symbol: string;
  totalSupply: string;
  holders: number;
}

interface DappActivity {
  name: string;
  logo: string;
  count: number;
  address: string;
}

export type HouseName = 'Molandak' | 'Chog' | 'Moyaki' | null;

const TOKEN_CONTRACTS: Record<string, TokenInfo> = {
  '0xe0590015a873bf326bd645c3e1266d4db41c4e6b': { name: 'Chog', logo: '/logos/chog.png' },
  '0xfe140e1dce99be9f4f15d657cd9b7bf622270c50': { name: 'Moyaki', logo: '/logos/moyaki.png' },
  '0x0F0BDEbF0F83cD1EE3974779Bcb7315f9808c714': { name: 'Molandak', logo: '/logos/molandak.png' },
  '0xb2f82D0f38dc453D596Ad40A37799446Cc89274A': { name: 'aprMON', logo: '/logos/aprmon.png' },
  '0xaEef2f6B429Cb59C9B2D7bB2141ADa993E8571c3': { name: 'gMON', logo: '/logos/gmon.png' },
  '0x3a98250F98Dd388C211206983453837C8365BDc1': { name: 'shMON', logo: '/logos/shmon.png' },
  '0xe1d2439b75fb9746E7Bc6cB777Ae10AA7f7ef9c5': { name: 'sMON', logo: '/logos/smon.png' }
};

const DAPPS_CONTRACTS: Record<string, { name: string; logo: string }> = {
  '0x88B96aF200c8a9c35442C8AC6cd3D22695AaE4F0': { name: 'Ambient', logo: '/logos/ambient.png' },
  '0xCa810D095e90Daae6e867c19DF6D9A8C56db2c89': { name: 'Bean', logo: '/logos/bean.png' },
  '0xcBE623D259261FFa0CFAff44484bFF46c1b7D6c2': { name: 'Talentum', logo: '/logos/talentum.png' },
  '0xF6FFe4f3FdC8BBb7F70FFD48e61f17D1e343dDfD': { name: 'iZUMi', logo: '/logos/izumi.png' },
  '0xb6091233aAcACbA45225a2B2121BBaC807aF4255': { name: 'OctoSwap', logo: '/logos/octoswap.png' },
  '0x64Aff7245EbdAAECAf266852139c67E4D8DBa4de': { name: 'Madness', logo: '/logos/madness.png' },
  '0x4267F317adee7C6478a5EE92985c2BD5D855E274': { name: 'Flap', logo: '/logos/flap.png' },
  '0xc816865f172d640d93712C68a7E1F83F3fA63235': { name: 'Kuru', logo: '/logos/kuru.png' },
  '0x3aE6D8A282D67893e17AA70ebFFb33EE5aa65893': { name: 'Uniswap', logo: '/logos/uniswap.png' }
};

const client = createPublicClient({ 
  chain: monad, 
  transport: http('https://testnet-rpc.monad.xyz', {
    timeout: 30000,
    retryCount: 3
  })
});

const getInitialState = (): TokenActivity[] => 
  Object.entries(TOKEN_CONTRACTS).map(([address, data]) => ({ 
    ...data, 
    count: 0,
    address,
    symbol: data.name,
    totalSupply: '0',
    holders: 0
  }));

interface BlockInfo {
  number: number;
  hash: string;
  transactions: number;
}

// Interface untuk data pattern
interface PatternData {
  colors: string[];
  positions: number[];
}

// ABI untuk smart contract
const NFT_CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "uri",
        "type": "string"
      }
    ],
    "name": "safeMint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

const NFT_CONTRACT_ADDRESS = '0xF0c89D2756cbAb0c34D1811a30e81b504E7a65B3';

type UploadToIPFSResult = string;
const uploadToIPFS = async (
  data: string | object,
  isJson: boolean = false,
  jwt: string
): Promise<UploadToIPFSResult> => {
  const pinataEndpoint = isJson
    ? 'https://api.pinata.cloud/pinning/pinJSONToIPFS'
    : 'https://api.pinata.cloud/pinning/pinFileToIPFS';

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${jwt}`,
  };

  let body;
  if (isJson) {
    body = data;
  } else {
    const svgString = typeof data === 'string' ? data : '';
    const formData = new FormData();
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    formData.append('file', blob, 'mystic-pattern.svg');
    body = formData;
  }

  try {
    const response = await axios.post(pinataEndpoint, body, { headers });
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
};

// Interface untuk response dari backend
interface BackendResponse {
  popularTokens: {
    address: string;
    name: string;
    logo: string;
    count: string | number;
  }[];
  popularDapps: {
    address: string;
    name: string;
    logo: string;
    count: string | number;
  }[];
}

export default function App() {
  const [pledgedHouse, setPledgedHouse] = useState<HouseName>(null);
  const [totalTxCount, setTotalTxCount] = useState<number>(0);
  const [latestBlockHash, setLatestBlockHash] = useState<string | null>(null);
  const [recentBlocks, setRecentBlocks] = useState<BlockInfo[]>([]);
  const [heartbeatTrigger, setHeartbeatTrigger] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTPS, setCurrentTPS] = useState<number>(0);
  const [lastKnownTxHash, setLastKnownTxHash] = useState<string | null>(null);
  const [gasPriceHistory, setGasPriceHistory] = useState<number[]>([]);
  const prevTimestampRef = useRef<bigint | null>(null);
  const [tokenActivity, setTokenActivity] = useState<TokenActivity[]>(getInitialState());
  const [dappActivity, setDappActivity] = useState<DappActivity[]>(
    Object.entries(DAPPS_CONTRACTS).map(([address, data]) => ({
      ...data,
      count: 0,
      address
    }))
  );
  const audioRef = useRef<HTMLAudioElement>(null);
  const [mysticPatternData, setMysticPatternData] = useState<PatternData | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  const [mintedMetadata, setMintedMetadata] = useState<any | null>(null);
  const [showMintModal, setShowMintModal] = useState(false);

  // Effect untuk watchBlocks dan real-time stats
  useEffect(() => {
    const unwatch = client.watchBlocks({
      includeTransactions: true,
      onBlock: async (block) => {
        try {
          // Update block info
          setLatestBlockHash(block.hash);
          setTotalTxCount(prev => prev + (block.transactions?.length || 0));
          
          // Calculate TPS
          if (prevTimestampRef.current) {
            const timeDiff = Number(block.timestamp - prevTimestampRef.current);
            const txCount = block.transactions?.length || 0;
            const tps = timeDiff > 0 ? txCount / timeDiff : 0;
            setCurrentTPS(tps);
          }
          prevTimestampRef.current = block.timestamp;

          // Update gas price history
          if (block.baseFeePerGas) {
            const gasPrice = Number(block.baseFeePerGas) / 1e9; // Convert to Gwei
            setGasPriceHistory(prev => {
              const newHistory = [...prev, gasPrice];
              // Keep only last 100 entries
              return newHistory.slice(-100);
            });
          }

          // Update recent blocks
          setRecentBlocks(prev => {
            const newBlock = {
              number: Number(block.number),
              hash: block.hash,
              transactions: block.transactions?.length || 0
            };
            return [newBlock, ...prev].slice(0, 10);
          });

          // Update heartbeat for UI animations
          setHeartbeatTrigger(prev => prev + 1);
          setLastKnownTxHash(block.hash);

          // Update mystic pattern data for NFT minting
          if (block.hash) {
            const patternData = generatePatternFromHash(block.hash);
            setMysticPatternData(patternData);
          }

        } catch (error) {
          console.error('Error processing block:', error);
        }
      },
    });

    return () => {
      unwatch();
    };
  }, []);

  // Effect untuk inisialisasi data gas price
  useEffect(() => {
    const initializeGasPriceData = async () => {
      try {
        const block = await client.getBlock();
        if (block.baseFeePerGas) {
          const gasPrice = Number(block.baseFeePerGas) / 1e9;
          setGasPriceHistory([gasPrice]);
        }
      } catch (error) {
        console.error('Error initializing gas price data:', error);
      }
    };

    initializeGasPriceData();
  }, []);

  // Effect untuk mengambil data leaderboard dari backend
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://monad-backend.ddns.net';
        console.log('🔍 [DEBUG] Environment variables:', {
          VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
          API_BASE_URL
        });
        console.log('🔍 [DEBUG] Fetching data from:', `${API_BASE_URL}/api/data`);
        
        const response = await axios.get<BackendResponse>(`${API_BASE_URL}/api/data`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('📥 [DEBUG] Response status:', response.status);
        console.log('📥 [DEBUG] Response headers:', response.headers);
        console.log('📥 [DEBUG] Response data:', JSON.stringify(response.data, null, 2));
        
        if (!response.data?.popularTokens || !response.data?.popularDapps) {
          console.error('❌ [DEBUG] Invalid response format from backend');
          return;
        }

        // Update token activity
        setTokenActivity(prevState => {
          console.log('🔄 [DEBUG] Previous token state:', JSON.stringify(prevState, null, 2));
          const newState = prevState.map(token => {
            const backendToken = response.data.popularTokens.find(
              t => t.address.toLowerCase() === token.address.toLowerCase()
            );
            // Pastikan count selalu berupa angka
            const count = backendToken?.count ? Number(backendToken.count) : 0;
            console.log('🔄 [DEBUG] Token update:', { 
              token: token.address, 
              backendToken: backendToken ? JSON.stringify(backendToken) : 'not found',
              count
            });
            return {
              ...token,
              count
            };
          });
          console.log('✅ [DEBUG] New token state:', JSON.stringify(newState, null, 2));
          return newState;
        });

        // Update dapp activity
        setDappActivity(prevState => {
          console.log('🔄 [DEBUG] Previous dapp state:', JSON.stringify(prevState, null, 2));
          const newState = prevState.map(dapp => {
            const backendDapp = response.data.popularDapps.find(
              d => d.address.toLowerCase() === dapp.address.toLowerCase()
            );
            // Pastikan count selalu berupa angka
            const count = backendDapp?.count ? Number(backendDapp.count) : 0;
            console.log('🔄 [DEBUG] Dapp update:', { 
              dapp: dapp.address, 
              backendDapp: backendDapp ? JSON.stringify(backendDapp) : 'not found',
              count
            });
            return {
              ...dapp,
              count
            };
          });
          console.log('✅ [DEBUG] New dapp state:', JSON.stringify(newState, null, 2));
          return newState;
        });
      } catch (error) {
        console.error('❌ [DEBUG] Error fetching leaderboard data:', error);
        if (axios.isAxiosError(error)) {
          console.error('❌ [DEBUG] Axios error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers
          });
        }
      }
    };

    // Fetch immediately and then every 10 seconds
    fetchLeaderboardData();
    const intervalId = setInterval(fetchLeaderboardData, 10000);

    return () => clearInterval(intervalId);
  }, []);

  // Fungsi helper untuk generate pattern dari hash
  const generatePatternFromHash = (hash: string): PatternData => {
    const colors = ['#9333ea', '#06b6d4', '#ec4899', '#6366f1', '#a855f7', '#22d3ee', '#f472b6', '#818cf8'];
    const positions: number[] = [];
    
    for (let i = 0; i < 32; i++) {
      const charCode = hash.charCodeAt((i * 2) + 2 % hash.length) || Math.floor(Math.random() * 256);
      positions.push(charCode % colors.length);
    }
    
    return { colors, positions };
  };

  // Fungsi helper untuk generate SVG
  const generateSvgFromPattern = (pattern: PatternData): string => {
    const { colors, positions } = pattern;
    const svgContent = `
      <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#111827"/>
        ${positions.map((pos, i) => {
          const row = Math.floor(i / 8);
          const col = i % 8;
          const x = col * 50;
          const y = row * 50;
          return `<rect x="${x}" y="${y}" width="50" height="50" fill="${colors[pos]}" />`;
        }).join('')}
      </svg>
    `;
    return svgContent;
  };

  // Fungsi handleMint yang lengkap
  const handleMint = async () => {
    if (!address) {
      alert('Please connect your wallet first.');
      return;
    }
    if (isMinting) return;

    setIsMinting(true);
    console.log('Minting process started...');

    const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
    if (!PINATA_JWT) {
      alert('Error: Kunci JWT Pinata tidak ditemukan.');
      setIsMinting(false);
      return;
    }

    const blockHash = latestBlockHash;
    if (!blockHash) {
      alert('Error: Hash blok terbaru tidak ditemukan untuk dijadikan metadata.');
      setIsMinting(false);
      return;
    }

    try {
      // 1. Membuat gambar SVG
      console.log('1. Membuat gambar SVG...');
      if (!mysticPatternData) {
        alert('Data Mystic Pattern tidak tersedia. Silakan tunggu block baru.');
        setIsMinting(false);
        return;
      }
      const svgContent = generateSvgFromPattern(mysticPatternData);

      // 2. Upload SVG ke IPFS via uploadToIPFS
      console.log('2. Meng-upload gambar ke IPFS...');
      const imageHash = await uploadToIPFS(svgContent, false, PINATA_JWT);
      const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageHash}`;

      // 3. Membuat metadata
      console.log('3. Membuat metadata...');
      const metadata = {
        name: `Mystic Pattern #${blockHash.slice(0, 8)}`,
        description: `A unique visual fingerprint of a Monad Block, generated by Monad Allegiance.`,
        image: imageUrl,
        attributes: [{ trait_type: 'Block Hash', value: blockHash }]
      };

      // 4. Upload metadata ke IPFS via uploadToIPFS
      console.log('4. Meng-upload metadata ke IPFS...');
      const metadataHash = await uploadToIPFS(metadata, true, PINATA_JWT);
      const metadataUrl = `ipfs://${metadataHash}`;
      console.log(`Metadata uploaded. URI: ${metadataUrl}`);

      // 5. Panggil smart contract
      console.log('5. Meminta konfirmasi transaksi dari wallet...');
      writeContract(
        {
          address: NFT_CONTRACT_ADDRESS,
          abi: NFT_CONTRACT_ABI,
          functionName: 'safeMint',
          args: [address, metadataUrl],
        },
        {
          onSuccess: (hash) => {
            console.log('Transaction sent! Hash:', hash);
            setMintedMetadata({
              image: metadata.image,
              txHash: hash
            });
            setShowMintModal(true);
            setIsMinting(false);
          },
          onError: (error) => {
            console.error('Smart contract interaction failed:', error);
            alert('Gagal mengirim transaksi. Cek console untuk detail.');
            setIsMinting(false);
          }
        }
      );
    } catch (error) {
      console.error('Proses upload ke IPFS gagal:', error);
      alert('Terjadi kesalahan saat upload ke IPFS. Cek console.');
      setIsMinting(false);
    }
  };

  const handlePledge = (house: HouseName) => {
    setPledgedHouse(house);
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.log('Autoplay prevented:', error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 md:p-8">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src="/music/background-music.mp3"
        loop
        preload="auto"
      />
      
      <motion.div 
        className="container mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.header 
          className="text-center mb-12 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-4xl font-bold text-purple-400">Monad Allegiance</h1>
          <motion.p 
            className="text-xl text-gray-300 mt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Pledge your allegiance and witness the power of Monad.
          </motion.p>
          <motion.div 
            className="mt-6 flex justify-center items-center space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <ConnectButton />
            <button
              onClick={togglePlayPause}
              className="p-2 rounded-full bg-purple-600/30 hover:bg-purple-600/50 transition-colors duration-300"
              title={isPlaying ? "Pause Music" : "Play Music"}
            >
              {isPlaying ? (
                <FaPause className="w-5 h-5 text-purple-300" />
              ) : (
                <FaPlay className="w-5 h-5 text-purple-300" />
              )}
            </button>
            <a 
              href="https://github.com/deseti" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              <FaGithub size={32} />
            </a>
          </motion.div>
        </motion.header>

        {/* Network Stats */}
        <motion.div 
          className="grid md:grid-cols-3 gap-6 mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
            <h3 className="text-lg font-semibold text-purple-300 mb-2 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
              Current Block
            </h3>
            <p className="text-3xl font-mono text-cyan-400">{recentBlocks[0]?.number?.toString() || 'Loading...'}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
            <h3 className="text-lg font-semibold text-purple-300 mb-2 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
              </svg>
              Total Transactions
            </h3>
            <p className="text-3xl font-mono text-cyan-400">{totalTxCount.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
            <h3 className="text-lg font-semibold text-purple-300 mb-2 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 5.314l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
              Latest Block Hash
            </h3>
            <p className="text-sm font-mono text-cyan-400 break-all">{latestBlockHash ? `${latestBlockHash.slice(0, 10)}...${latestBlockHash.slice(-8)}` : 'N/A'}</p>
          </div>
        </motion.div>

        <motion.div 
          className="flex flex-col lg:flex-row gap-8 mb-12 items-center lg:items-stretch"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <MolandakHouse 
            handlePledge={handlePledge} 
            isPledged={pledgedHouse === 'Molandak'}
            transactionCount={totalTxCount}
            heartbeatTrigger={heartbeatTrigger}
            tps={currentTPS}
          />
          <ChogHouse 
            handlePledge={handlePledge} 
            isPledged={pledgedHouse === 'Chog'}
            heartbeatTrigger={heartbeatTrigger}
            latestTxHash={lastKnownTxHash}
          />
          <MoyakiHouse 
            handlePledge={handlePledge}
            isPledged={pledgedHouse === 'Moyaki'}
            blockHash={latestBlockHash}
            heartbeatTrigger={heartbeatTrigger}
            handleMint={handleMint}
            isMinting={isMinting}
          />
        </motion.div>

        {/* Token Leaderboard */}
        <motion.div 
          className="bg-gray-800 p-6 rounded-xl shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <TokenLeaderboard tokenActivity={tokenActivity} />
        </motion.div>

        {/* Dapps List */}
        <motion.div 
          className="bg-gray-800 p-6 rounded-xl shadow-xl mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <DappsList dappActivity={dappActivity} />
        </motion.div>

        {/* Gas Price Chart */}
        <motion.div 
          className="bg-gray-800 p-6 rounded-xl shadow-xl mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
        >
          <h2 className="text-2xl font-bold text-purple-400 mb-4 text-center">Gas Price Over Time</h2>
          <GasPriceChart gasPriceHistory={gasPriceHistory} />
        </motion.div>
      </motion.div>

      {showMintModal && mintedMetadata && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl shadow-xl max-w-md w-full text-center relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={() => setShowMintModal(false)}
            >✕</button>
            <blockquote className="italic text-lg text-purple-300 mb-4">“Congratulations! Your Mystic Pattern NFT has been minted successfully.”</blockquote>
            <img
              src={mintedMetadata.image}
              alt="Minted NFT"
              className="mx-auto mb-4 rounded-lg border border-purple-500"
              style={{ maxHeight: 200 }}
            />
            <a
              href={`https://testnet.monadexplorer.com/tx/${mintedMetadata.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 underline block mb-2"
            >
              View Mint Transaction
            </a>
            <a
              href={mintedMetadata.image}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 underline"
            >
              View Image
            </a>
          </div>
        </div>
      )}
    </div>
  );
}