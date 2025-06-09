import { createPublicClient, http } from 'viem';

export const monadClient = createPublicClient({
  chain: {
    id: 80001, // Ganti dengan chainId Monad Testnet jika ada, atau biarkan custom
    name: 'Monad Testnet',
    nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://testnet-rpc.monad.xyz'] }
    },
  },
  transport: http(),
});
