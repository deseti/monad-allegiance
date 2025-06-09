import React from 'react';
import { motion } from 'framer-motion';

interface Dapp {
  address: string;
  name: string;
  logo: string;
  count: number;
}

interface DappsListProps {
  dappActivity: Dapp[];
}

const DappsList: React.FC<DappsListProps> = ({ dappActivity }) => {
  // Urutkan dapps berdasarkan jumlah transaksi
  const sortedDapps = [...dappActivity].sort((a, b) => Number(b.count) - Number(a.count));

  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-xl">
      <h3 className="text-lg sm:text-xl font-semibold text-purple-300 mb-4 text-center sm:text-left">Popular Dapps List</h3>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="min-w-full inline-block align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-3 py-3 text-left text-xs sm:text-sm font-semibold text-purple-300">Dapp</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs sm:text-sm font-semibold text-purple-300 hidden sm:table-cell">Alamat Kontrak</th>
                  <th scope="col" className="px-3 py-3 text-center text-xs sm:text-sm font-semibold text-purple-300">Aktivitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {sortedDapps.map((dapp, idx) => (
                  <motion.tr
                    key={dapp.address}
                    layout
                    transition={{ layout: { duration: 0.5, type: "spring" } }}
                    whileHover={{ scale: 1.03, boxShadow: "0 2px 8px #a78bfa" }}
                  >
                    <td className="px-3 py-3 whitespace-nowrap">
                      <motion.div
                        animate={idx === 0 ? { scale: [1, 1.08, 1] } : {}}
                        transition={idx === 0 ? { repeat: Infinity, duration: 1.2 } : {}}
                      >
                        <div className="flex items-center gap-2">
                          <motion.div
                            className="relative w-8 h-8 sm:w-10 sm:h-10"
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            <img 
                              src={dapp.logo}
                              alt={dapp.name}
                              className="w-full h-full rounded-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/logos/default-dapp.png';
                              }}
                            />
                            {dapp.count > 0 && (
                              <motion.div
                                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                              />
                            )}
                          </motion.div>
                          <div>
                            <div className="font-semibold text-purple-300 text-sm sm:text-base">
                              {idx === 0 && <span className="mr-1">🔥</span>}{dapp.name}
                            </div>
                            <div className="text-gray-400 text-xs sm:hidden">{dapp.address.slice(0, 6)}...{dapp.address.slice(-4)}</div>
                          </div>
                        </div>
                      </motion.div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-300 hidden sm:table-cell">
                      <code className="text-xs sm:text-sm">{dapp.address.slice(0, 10)}...{dapp.address.slice(-8)}</code>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-center">
                      <motion.div 
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs sm:text-sm font-semibold bg-green-500/20 text-green-400"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        {dapp.count} tx
                      </motion.div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DappsList; 