'use client';

import { motion } from 'framer-motion';

interface LoadingAnimationProps {
  progress: number;
}

export function LoadingAnimation({ progress }: LoadingAnimationProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4 z-50">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 1 + 'px',
              height: Math.random() * 4 + 1 + 'px',
              background: `radial-gradient(circle, rgba(251, 191, 36, ${Math.random() * 0.5}) 0%, transparent 70%)`,
            }}
            initial={{ 
              x: Math.random() * 1920,
              y: 1080 + Math.random() * 100,
            }}
            animate={{ 
              y: -100,
              x: Math.random() * 1920,
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-2xl w-full relative"
      >
        {/* Molecular Animation */}
        <motion.div className="mb-8 relative h-40 flex items-center justify-center">
          <div className="absolute inset-0">
            {/* DNA Helix Structure */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
              <defs>
                <linearGradient id="dnaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              
              {/* DNA Strands */}
              {[...Array(2)].map((_, i) => (
                <motion.path
                  key={i}
                  d={`M ${50 + i * 100} 0 Q ${100} ${50} ${50 + i * 100} ${100} T ${50 + i * 100} ${200}`}
                  fill="none"
                  stroke="url(#dnaGradient)"
                  strokeWidth="2"
                  opacity="0.6"
                  initial={{ pathLength: 0 }}
                  animate={{ 
                    pathLength: 1,
                    rotate: i === 0 ? 360 : -360,
                  }}
                  transition={{
                    pathLength: { duration: 3, repeat: Infinity, ease: "linear" },
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  }}
                  style={{ originX: '50%', originY: '50%' }}
                />
              ))}
              
              {/* Connecting Nodes */}
              {[...Array(8)].map((_, i) => (
                <motion.circle
                  key={i}
                  cx={100}
                  cy={25 * i}
                  r="3"
                  fill="#fbbf24"
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.25,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </svg>

            {/* Rotating Molecular Rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute border rounded-full"
                  style={{
                    width: `${(i + 1) * 35}px`,
                    height: `${(i + 1) * 35}px`,
                    borderColor: i % 2 === 0 ? 'rgba(251, 191, 36, 0.3)' : 'rgba(245, 158, 11, 0.2)',
                    borderWidth: '1px',
                  }}
                  animate={{ 
                    rotate: i % 2 === 0 ? [0, 360] : [360, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    rotate: {
                      duration: 15 + (i * 5),
                      repeat: Infinity,
                      ease: "linear"
                    },
                    scale: {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.5,
                    }
                  }}
                />
              ))}
            </div>

            {/* Central Core */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                className="w-8 h-8 rounded-full"
                style={{
                  background: 'radial-gradient(circle, #fbbf24 0%, #f59e0b 50%, transparent 70%)',
                  filter: 'blur(4px)',
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Main heading with enhanced gradient */}
        <motion.h2 
          className="text-3xl md:text-4xl lg:text-5xl font-light tracking-wide mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="relative">
            <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
              ANALYSERAR DINA SVAR
            </span>
            {/* Glow effect */}
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 opacity-50 blur-xl"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </span>
        </motion.h2>

        {/* Animated subtitle */}
        <motion.p
          className="text-gray-400 text-lg mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Vår AI skapar en 
          <motion.span
            className="text-amber-400 mx-1"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            personlig
          </motion.span>
          hudvårdsprofil för dig
        </motion.p>

        {/* Progress container */}
        <div className="relative max-w-md mx-auto">
          {/* Progress percentage with enhanced styling */}
          <motion.div 
            className="text-7xl font-light text-center mb-8 relative"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
          >
            <span className="relative z-10 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
              {Math.round(progress)}
            </span>
            <span className="text-3xl text-amber-400/60 ml-1">%</span>
            
            {/* Background glow for percentage */}
            <motion.div
              className="absolute inset-0 bg-amber-400/20 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>

          {/* Enhanced progress bar */}
          <div className="relative">
            {/* Background track with gradient */}
            <div className="w-full h-3 bg-gradient-to-r from-gray-800/30 to-gray-900/50 rounded-full overflow-hidden backdrop-blur-sm shadow-inner">
              {/* Animated gradient fill */}
              <motion.div 
                className="h-full rounded-full relative overflow-hidden shadow-lg"
                style={{
                  width: `${progress}%`,
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {/* Multi-layer gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500" />
                
                {/* Inner highlight */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent" />
                
                {/* Animated shimmer */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                  animate={{
                    x: ['-200%', '200%'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: 1,
                  }}
                />
              </motion.div>
            </div>

            {/* Glow effect under progress bar */}
            <motion.div 
              className="absolute top-1 h-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 blur-sm"
              style={{
                width: `${progress}%`,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>

          {/* Dynamic loading messages */}
          <motion.div 
            className="mt-8 text-sm text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <motion.p
              key={Math.floor(progress / 25)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="font-light tracking-wide"
            >
              {progress < 25 && "🧬 Analyserar din hudtyp och DNA-profil..."}
              {progress >= 25 && progress < 50 && "🔬 Matchar med våra naturliga ingredienser..."}
              {progress >= 50 && progress < 75 && "✨ Skapar din personliga hudvårdsformel..."}
              {progress >= 75 && "🎯 Förbereder dina skräddarsydda resultat..."}
            </motion.p>
          </motion.div>
        </div>

        {/* Bottom decorative elements */}
        <motion.div 
          className="mt-12 flex justify-center items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {/* Animated dots */}
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          {/* Brand text */}
          <motion.p
            className="text-xs text-gray-600 tracking-widest uppercase"
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            1753 Skincare
          </motion.p>

          {/* More animated dots */}
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: (4 - i) * 0.15,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 