import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

interface AnimatedLogoProps {
  size?: 'large' | 'default';
}

const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ size = 'default' }) => {
  const [particles, setParticles] = useState<any[]>([]);
  const particleId = React.useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Create a burst of particles
      const newParticles = Array.from({ length: 12 }).map(() => {
        const angle = Math.random() * 360;
        const radius = size === 'large' ? 60 : 40;
        const endRadius = radius + (Math.random() * 30 + 20);
        const char = Math.random() > 0.5 ? '❤️' : '✨';
        const scale = Math.random() * 0.5 + 0.5;
        
        return {
          id: particleId.current++,
          char,
          x: Math.cos(angle) * endRadius,
          y: Math.sin(angle) * endRadius,
          scale,
        };
      });
      setParticles(prev => [...prev, ...newParticles]);
    }, 2000);

    return () => clearInterval(interval);
  }, [size]);

  const removeParticle = (id: number) => {
    setParticles(prev => prev.filter(p => p.id !== id));
  };

  const sizes = {
    large: {
      font: 'text-4xl',
      heart: 'w-8 h-8',
      jump: -15,
    },
    default: {
      font: 'text-3xl',
      heart: 'w-7 h-7',
      jump: -10,
    },
  };
  const currentSize = size === 'large' ? sizes.large : sizes.default;

  return (
    <div className={`relative flex justify-center items-center ${currentSize.font} font-bold`}>
      <span className="text-primary">P</span>
      
      <motion.div
        className="relative mx-2 flex items-center justify-center"
        animate={{
          y: [0, currentSize.jump, 0],
          rotate: [0, 360],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: 'loop',
          ease: 'easeInOut',
        }}
      >
        <Heart className={`${currentSize.heart} text-primary fill-current`} />
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.span
              key={particle.id}
              className="absolute"
              initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              animate={{
                x: particle.x,
                y: particle.y,
                scale: 0,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1,
                ease: 'easeOut',
              }}
              onAnimationComplete={() => removeParticle(particle.id)}
              style={{ fontSize: `${particle.scale * 1.5}rem` }}
            >
              {particle.char}
            </motion.span>
          ))}
        </AnimatePresence>
      </motion.div>

      <span className="text-primary">H</span>
    </div>
  );
};

export default AnimatedLogo;