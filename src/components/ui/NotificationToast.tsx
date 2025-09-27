import React from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: 'from-green-500 to-emerald-500',
    error: 'from-red-500 to-pink-500',
    warning: 'from-amber-500 to-orange-500',
    info: 'from-blue-500 to-cyan-500',
  };

  const Icon = icons[notification.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className="w-96 max-w-sm bg-white dark:bg-dark-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
    >
      {/* Barre colorée en haut */}
      <div className={`h-1 bg-gradient-to-r ${colors[notification.type]}`} />
      
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icône */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-r ${colors[notification.type]} flex items-center justify-center`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          
          {/* Contenu */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {notification.title}
            </h3>
            {notification.message && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {notification.message}
              </p>
            )}
            
            {/* Action */}
            {notification.action && (
              <button
                onClick={notification.action.onClick}
                className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                {notification.action.label}
              </button>
            )}
          </div>
          
          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationToast;