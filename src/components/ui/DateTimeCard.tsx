import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';

interface DateTimeCardProps {
  className?: string;
  userRole?: 'admin' | 'entrepreneur' | 'client';
}

const DateTimeCard: React.FC<DateTimeCardProps> = ({ className = '', userRole = 'client' }) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Mettre à jour la date et l'heure toutes les secondes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const periods = [
    { value: 'today', label: "Aujourd'hui" },
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'year', label: 'Cette année' },
  ];

  // Messages spécifiques selon le rôle
  const getStatusMessage = () => {
    const hour = currentDateTime.getHours();
    
    switch (userRole) {
      case 'entrepreneur':
        if (hour >= 8 && hour < 18) {
          return { message: "OCASS DIGITALE- Magasin Ouvert ", color: "text-white dark:text-gray-800" };
        } else if (hour >= 18 && hour < 22) {
          return { message: "OCASS DIGITALE- Magasin Ouvert", color: "text-white dark:text-gray-800" };
        } else {
          return { message: "OCASS DIGITALE- Magasin Ouvert", color: "text-white dark:text-gray-800" };
        }
      case 'admin':
        return { message: "PLATFORME OCASS DIGITALE", color: "text-white dark:text-gray-800" };
      case 'client':
        if (hour >= 6 && hour < 12) {
          return { message: " OCASS DIGITALE, Decouvrez toutes sortes de produits", color: "text-gray-900 dark:text-white" };
        } else if (hour >= 12 && hour < 18) {
          return { message: "OCASS DIGITALE, Decouvrez toutes sortes de produits", color: "text-gray-900 dark:text-white" };
        } else if (hour >= 18 && hour < 22) {
          return { message: "OCASS DIGITALE, Decouvrez toutes sortes de produits", color: "text-gray-900 dark:text-white" };
        } else {
          return { message: "OCASS DIGITALE, Decouvrez toutes sortes de produits", color: "text-gray-900 dark:text-white"};
        }
      default:
        return { message: "Bienvenue sur votre plateforme Ocass Digital", color: "text-gray-900 dark:text-white"};
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full bg-gradient-to-r from-white via-blue-50 to-blue-100 dark:from-gray-100 dark:via-blue-200 dark:to-blue-300 rounded-2xl shadow-xl border border-blue-300 dark:border-blue-400 p-16 min-h-[200px] ${className}`}
    >
      <div className="flex flex-col space-y-6">
        {/* Date, Heure et Filtres - En haut */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
          {/* Date et Heure */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-8">
          {/* Date */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4 px-6 py-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-blue-400 dark:border-blue-500"
          >
            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {currentDateTime.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </motion.div>
          
          {/* Heure */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center space-x-4 px-6 py-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-blue-400 dark:border-blue-500"
          >
            <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900 dark:text-white font-mono">
                {currentDateTime.toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Périodes */}
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-4">
          {periods.map((period, index) => (
            <motion.button
              key={period.value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl shadow-md border border-blue-400 dark:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-800 dark:hover:text-blue-200 transition-all duration-300 text-base font-medium"
            >
              {period.label}
            </motion.button>
          ))}
        </div>
        </div>

        {/* Message de statut - En bas */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <div className={`text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 text-white px-8 py-6 rounded-2xl shadow-2xl border border-gray-600 dark:border-gray-500 transform hover:scale-105 transition-all duration-300`}>
            {statusInfo.message}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DateTimeCard;
