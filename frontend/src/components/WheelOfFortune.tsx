import React, { useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Zap } from 'lucide-react';
import { WheelPrize, SpinResult } from '../types';

interface WheelOfFortuneProps {
  prizes: WheelPrize[];
  onSpin: () => Promise<SpinResult>;
  canSpin: boolean;
  isSpinning: boolean;
}

export const WheelOfFortune: React.FC<WheelOfFortuneProps> = ({
  prizes,
  onSpin,
  canSpin,
  isSpinning
}) => {
  const [result, setResult] = useState<SpinResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const wheelControls = useAnimation();
  const wheelRef = useRef<HTMLDivElement>(null);

  const handleSpin = async () => {
    if (!canSpin || isSpinning) return;

    try {
      setShowResult(false);
      setResult(null);

      // Get spin result from API first
      const spinResult = await onSpin();
      
      // Calculate total rotation (multiple full spins + final angle)
      const fullSpins = 3; // 3 full rotations
      const totalRotation = currentRotation + (fullSpins * 360) + spinResult.angle;
      
      // Animate to final position
      await wheelControls.start({
        rotate: totalRotation,
        transition: { 
          duration: 3,
          ease: [0.25, 0.46, 0.45, 0.94] // Ease-out-quad
        }
      });

      // Update current rotation for next spin
      setCurrentRotation(totalRotation % 360);

      // Show result after animation
      setTimeout(() => {
        setResult(spinResult);
        setShowResult(true);
      }, 500);

    } catch (error) {
      console.error('Spin failed:', error);
      // Reset on error
      wheelControls.set({ rotate: currentRotation });
    }
  };

  const sectorAngle = 360 / prizes.length;

  return (
    <div className="flex flex-col items-center space-y-8 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-2xl font-bold text-white">Ваш шанс сегодня</h1>
        <div className="flex items-center justify-center space-x-2">
          <span className="text-green-400">🍀</span>
          <span className="text-white text-sm">1 вращение доступно</span>
        </div>
      </motion.div>

      {/* 3D Wheel Container */}
      <div className="relative perspective-1000">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full border-4 border-green-500 shadow-2xl animate-pulse"></div>
        
        {/* Sparkle effects */}
        <div className="absolute top-2 left-2 w-2 h-2 bg-pink-400 rounded-full animate-ping"></div>
        <div className="absolute top-2 right-2 w-1 h-1 bg-green-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-2 left-2 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
        
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6 z-20">
          <div className="relative">
            <div className="w-0 h-0 border-l-8 border-r-8 border-b-20 border-l-transparent border-r-transparent border-b-pink-500 drop-shadow-lg"></div>
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-5 border-r-5 border-b-15 border-l-transparent border-r-transparent border-b-white"></div>
          </div>
        </div>

        {/* Main Wheel */}
        <motion.div
          ref={wheelRef}
          animate={wheelControls}
          className="relative w-80 h-80 rounded-full border-4 border-white shadow-2xl overflow-hidden"
          style={{
            background: `conic-gradient(from 0deg, ${prizes.map((prize, index) => {
              const startAngle = index * sectorAngle;
              const endAngle = (index + 1) * sectorAngle;
              const color = index % 2 === 0 ? '#ec4899' : '#10b981';
              return `${color} ${startAngle}deg ${endAngle}deg`;
            }).join(', ')})`
          }}
        >
          {/* Prize Labels */}
              {prizes.map((prize, index) => {
            const rotation = index * sectorAngle + sectorAngle / 2;
            const radius = 120; // Distance from center
            const x = 50 + (radius * Math.cos((rotation - 90) * Math.PI / 180));
            const y = 50 + (radius * Math.sin((rotation - 90) * Math.PI / 180));
            
            return (
              <div
                key={prize.id}
                className="absolute text-white font-bold text-center"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: '12px',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  zIndex: 10
                }}
              >
                <div className="flex flex-col items-center space-y-1">
                  <div className="text-lg">
                    {prize.type === 'petals' && '🌸'}
                    {prize.type === 'discount' && '🎫'}
                    {prize.type === 'gift' && '🎁'}
                  </div>
                  <div className="text-xs font-semibold whitespace-nowrap">
                    {prize.label}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Center Circle */}
          <div className="absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-gray-200 z-20">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-green-500 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Spin Button */}
      <motion.button
        onClick={handleSpin}
        disabled={!canSpin || isSpinning}
        whileHover={canSpin ? { scale: 1.05 } : {}}
        whileTap={canSpin ? { scale: 0.95 } : {}}
        className={`px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 button-3d ${
          canSpin 
            ? 'bg-gradient-to-r from-pink-500 to-green-500 text-white hover:shadow-xl glow-effect shimmer' 
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isSpinning ? (
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Вращение...</span>
          </div>
        ) : canSpin ? (
          <div className="flex items-center space-x-2">
            <span className="text-lg">🎡</span>
            <span>Крутить колесо</span>
          </div>
        ) : (
          'Нет доступных спинов'
        )}
      </motion.button>

      {/* Result Modal */}
      {showResult && result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6"
          onClick={() => setShowResult(false)}
        >
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            className="card p-8 text-center space-y-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-6xl mb-4">
              {result.prize.type === 'petals' && '🌸'}
              {result.prize.type === 'discount' && '🎫'}
              {result.prize.type === 'gift' && '🎁'}
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Поздравляем!
              </h3>
              <p className="text-lg text-gray-300">
                Вы выиграли: <span className="font-semibold text-pink-400">{result.prize.label}</span>
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowResult(false)}
              className="w-full bg-gradient-to-r from-pink-500 to-green-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
            >
              Отлично! 🎉
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};