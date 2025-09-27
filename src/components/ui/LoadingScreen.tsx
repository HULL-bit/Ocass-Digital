import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Zap } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Chargement...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-premium">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative mb-8"
        >
          {/* Logo animé */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-primary-500 to-electric-500 flex items-center justify-center shadow-xl"
          >
            <Zap className="w-10 h-10 text-white" />
          </motion.div>

          {/* Effet de pulsation */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 w-20 h-20 mx-auto rounded-2xl bg-primary-500 opacity-20"
          />
        </motion.div>

        {/* Spinner principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center space-x-3 mb-6"
        >
          <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
          <span className="text-lg font-medium text-white">{message}</span>
        </motion.div>

        {/* Barre de progression animée */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-64 h-1 mx-auto bg-gray-700 rounded-full overflow-hidden"
        >
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="h-full w-1/3 bg-gradient-to-r from-primary-500 to-electric-500 rounded-full"
          />
        </motion.div>

        {/* Points animés */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center space-x-1 mt-6"
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: index * 0.2,
              }}
              className="w-2 h-2 bg-primary-500 rounded-full"
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen;