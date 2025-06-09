import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GasPriceData {
  price: number;
  timestamp: number;
}

interface GasPriceChartProps {
  gasPriceHistory: number[];
}

const GasPriceChart = ({ gasPriceHistory }: GasPriceChartProps) => {
  const [gasPrices, setGasPrices] = useState<GasPriceData[]>([]);
  const [hoveredPrice, setHoveredPrice] = useState<GasPriceData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'stable'>('stable');
  const [priceChange, setPriceChange] = useState<number>(0);

  useEffect(() => {
    // Inisialisasi dengan data dari prop
    if (gasPriceHistory.length > 0) {
      const initialPrices = gasPriceHistory.map((price, index) => ({
        price,
        timestamp: Date.now() - (gasPriceHistory.length - index) * 3000
      }));
      setGasPrices(initialPrices);
    }

    // Fungsi untuk menghasilkan gas price yang realistis
    const generateRealisticGasPrice = (lastPrice: number) => {
      // Variasi harga antara -5 sampai +5 Gwei
      const variation = (Math.random() * 10 - 5);
      let newPrice = lastPrice + variation;
      
      // Batasi harga antara 10 dan 100 Gwei
      newPrice = Math.max(10, Math.min(100, newPrice));
      
      // Tambahkan sedikit noise untuk membuat lebih realistis
      newPrice += (Math.random() - 0.5) * 2;
      
      return Number(newPrice.toFixed(1));
    };

    // Update gas price setiap 3 detik
    const interval = setInterval(() => {
      setGasPrices(prev => {
        const lastPrice = prev.length > 0 ? prev[prev.length - 1].price : 30;
        const newPrice = generateRealisticGasPrice(lastPrice);
        
        const newPrices = [...prev, {
          price: newPrice,
          timestamp: Date.now()
        }].slice(-20); // Simpan 20 data point terakhir

        // Hitung arah dan perubahan harga
        if (newPrices.length >= 2) {
          const currentPrice = newPrices[newPrices.length - 1].price;
          const previousPrice = newPrices[newPrices.length - 2].price;
          const change = currentPrice - previousPrice;
          setPriceChange(change);
          
          if (change > 0.5) setPriceDirection('up');
          else if (change < -0.5) setPriceDirection('down');
          else setPriceDirection('stable');
        }

        return newPrices;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const maxPrice = Math.max(...gasPrices.map(d => d.price));
  const minPrice = Math.min(...gasPrices.map(d => d.price));
  const currentPrice = gasPrices[gasPrices.length - 1]?.price || 0;

  const calculatePath = (data: GasPriceData[]) => {
    if (data.length === 0) return '';
    
    const width = 600;
    const height = 150;
    const padding = 30;
    
    const xStep = (width - padding * 2) / (data.length - 1);
    const yScale = (height - padding * 2) / (maxPrice - minPrice);
    
    const points = data.map((point, index) => {
      const x = padding + index * xStep;
      const y = height - padding - (point.price - minPrice) * yScale;
      return `${x},${y}`;
    });
    
    return points.map((point, index) => 
      index === 0 ? `M ${point}` : `L ${point}`
    ).join(' ');
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;
    
    const width = rect.width;
    const padding = 30;
    const xStep = (width - padding * 2) / (gasPrices.length - 1);
    const index = Math.round((x - padding) / xStep);
    
    if (index >= 0 && index < gasPrices.length) {
      setHoveredPrice(gasPrices[index]);
      setTooltipPosition({
        x: event.clientX,
        y: event.clientY
      });
    }
  };

  return (
    <div className="relative">
      <div className="mb-4 text-center">
        <h3 className="text-sm text-gray-400 mb-1">Current Gas Price</h3>
        <motion.div 
          key={currentPrice}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            scale: priceDirection === 'up' ? [1, 1.1, 1] : 
                   priceDirection === 'down' ? [1, 0.9, 1] : 1
          }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold text-purple-400 flex items-center justify-center gap-2"
        >
          {currentPrice.toFixed(1)} 
          <motion.span 
            animate={{ 
              y: priceDirection === 'up' ? [-2, 0, -2] : 
                  priceDirection === 'down' ? [2, 0, 2] : 0
            }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-lg text-gray-400"
          >
            Gwei
          </motion.span>
          {priceChange !== 0 && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-sm ${priceChange > 0 ? 'text-green-400' : 'text-red-400'}`}
            >
              {priceChange > 0 ? '↑' : '↓'} {Math.abs(priceChange).toFixed(1)}
            </motion.span>
          )}
        </motion.div>
      </div>

      <div className="relative bg-gray-700/30 rounded-lg p-3">
        <svg
          width="100%"
          height="200"
          viewBox="0 0 600 200"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredPrice(null)}
          className="w-full"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y-axis labels */}
          <text x="15" y="25" className="text-[10px] fill-gray-400">
            {maxPrice.toFixed(1)}
          </text>
          <text x="15" y="100" className="text-[10px] fill-gray-400">
            {(maxPrice / 2).toFixed(1)}
          </text>
          <text x="15" y="175" className="text-[10px] fill-gray-400">
            {minPrice.toFixed(1)}
          </text>

          {/* Area Chart */}
          <motion.path
            d={calculatePath(gasPrices)}
            fill="url(#areaGradient)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: 1,
              d: calculatePath(gasPrices)
            }}
            transition={{ 
              duration: 1.5, 
              ease: "easeInOut",
              repeat: 0
            }}
          />

          {/* Line Chart */}
          <motion.path
            d={calculatePath(gasPrices)}
            fill="none"
            stroke="rgb(139, 92, 246)"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: 1,
              d: calculatePath(gasPrices)
            }}
            transition={{ 
              duration: 1.5, 
              ease: "easeInOut",
              repeat: 0
            }}
          />

          {/* Live Indicator */}
          <motion.circle
            cx={570}
            cy={175 - (currentPrice - minPrice) * (150 / (maxPrice - minPrice))}
            r="4"
            fill="rgb(139, 92, 246)"
            initial={{ scale: 1 }}
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          <AnimatePresence>
            {hoveredPrice && (
              <>
                <motion.line
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  x1={tooltipPosition.x}
                  y1="25"
                  x2={tooltipPosition.x}
                  y2="175"
                  stroke="rgba(139, 92, 246, 0.3)"
                  strokeWidth="1"
                  strokeDasharray="4"
                />
                <motion.circle
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: 1
                  }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  cx={tooltipPosition.x}
                  cy={175 - (hoveredPrice.price - minPrice) * (150 / (maxPrice - minPrice))}
                  r="4"
                  fill="rgb(139, 92, 246)"
                />
              </>
            )}
          </AnimatePresence>
        </svg>

        <AnimatePresence>
          {hoveredPrice && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bg-gray-800 text-white px-3 py-2 rounded-lg text-sm shadow-lg z-10"
              style={{
                left: tooltipPosition.x,
                top: tooltipPosition.y - 40,
                transform: 'translateX(-50%)'
              }}
            >
              {hoveredPrice.price.toFixed(1)} Gwei
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex justify-center space-x-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
          <span className="text-gray-400">Low (≤20)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
          <span className="text-gray-400">Med (21-50)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
          <span className="text-gray-400">High ({'>'}50)</span>
        </div>
      </div>
    </div>
  );
};

export default GasPriceChart;