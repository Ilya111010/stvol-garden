import React from 'react';
import { motion } from 'framer-motion';

interface PetalIconProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export const PetalIcon: React.FC<PetalIconProps> = ({ 
  size = 24, 
  className = "",
  animate = false 
}) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      animate={animate ? {
        rotate: [0, 5, -5, 0],
        scale: [1, 1.1, 1],
      } : {}}
      transition={animate ? {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      } : {}}
    >
      {/* Flower petal shape */}
      <path
        d="M12 2C8.5 2 6 4.5 6 8C6 9.5 6.5 10.8 7.3 11.8C6.5 12.8 6 14.1 6 15.5C6 18.5 8.5 21 12 21C15.5 21 18 18.5 18 15.5C18 14.1 17.5 12.8 16.7 11.8C17.5 10.8 18 9.5 18 8C18 4.5 15.5 2 12 2Z"
        fill="currentColor"
        fillOpacity="0.8"
      />
      {/* Inner highlight */}
      <path
        d="M12 4C10 4 8.5 5.5 8.5 7.5C8.5 8.5 8.8 9.3 9.3 10C8.8 10.7 8.5 11.5 8.5 12.5C8.5 14.5 10 16 12 16C14 16 15.5 14.5 15.5 12.5C15.5 11.5 15.2 10.7 14.7 10C15.2 9.3 15.5 8.5 15.5 7.5C15.5 5.5 14 4 12 4Z"
        fill="white"
        fillOpacity="0.3"
      />
      {/* Center dot */}
      <circle
        cx="12"
        cy="10"
        r="1.5"
        fill="currentColor"
        fillOpacity="0.6"
      />
    </motion.svg>
  );
};