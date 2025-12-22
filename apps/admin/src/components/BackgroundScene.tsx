import { motion } from 'framer-motion';

export function BackgroundScene() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Large translucent glass panel */}
      <div className="absolute inset-6 rounded-[40px] bg-white/5 backdrop-blur-md border border-white/10" />

      {/* Floating shapes */}
      <motion.div
        className="absolute top-20 left-10 w-96 h-96 rounded-full bg-[#18F59B]/15 blur-[60px]"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-32 right-16 w-80 h-80 rounded-full bg-[#0E5146]/20 blur-[50px]"
        animate={{
          y: [0, 15, 0],
          x: [0, -8, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/4 w-72 h-72 rounded-full bg-[#18F59B]/10 blur-[40px]"
        animate={{
          y: [0, -15, 0],
          x: [0, 12, 0],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-20 left-1/3 w-64 h-64 rounded-full bg-[#0A3D35]/25 blur-[45px]"
        animate={{
          y: [0, 20, 0],
          x: [0, -10, 0],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Abstract curves/blobs */}
      <motion.svg
        className="absolute top-0 right-0 w-96 h-96 opacity-20"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d="M200 50 Q250 100 300 150 T400 200 Q350 250 300 300 T200 350 Q150 300 100 250 T0 200 Q50 150 100 100 T200 50"
          stroke="#18F59B"
          strokeWidth="2"
          fill="none"
          animate={{
            pathLength: [0, 1, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.svg>
    </div>
  );
}

