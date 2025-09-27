import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  previousValue?: number;
  format?: 'number' | 'currency' | 'percentage';
  currency?: string;
  icon?: ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  loading?: boolean;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  previousValue,
  format = 'number',
  currency = 'XOF',
  icon,
  color = 'primary',
  loading = false,
  onClick,
}) => {
  const colorClasses = {
    primary: {
      bg: 'from-primary-500 to-electric-500',
      icon: 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400',
      trend: 'text-primary-600',
    },
    success: {
      bg: 'from-green-500 to-emerald-500',
      icon: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
      trend: 'text-green-600',
    },
    warning: {
      bg: 'from-amber-500 to-gold-500',
      icon: 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400',
      trend: 'text-amber-600',
    },
    danger: {
      bg: 'from-red-500 to-pink-500',
      icon: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
      trend: 'text-red-600',
    },
    info: {
      bg: 'from-cyan-500 to-blue-500',
      icon: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-400',
      trend: 'text-cyan-600',
    },
  };

  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return `${val.toLocaleString()} ${currency}`;
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString();
    }
  };

  const calculateTrend = () => {
    if (previousValue === undefined) return null;
    
    const change = value - previousValue;
    const percentage = previousValue !== 0 ? (change / previousValue) * 100 : 0;
    
    return {
      change,
      percentage,
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    };
  };

  const trend = calculateTrend();

  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    
    switch (trend.direction) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      className={`
        metric-card relative overflow-hidden cursor-pointer
        ${onClick ? 'hover:shadow-2xl' : ''}
      `}
      onClick={onClick}
    >
      {/* Gradient background */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colorClasses[color].bg}`} />
      
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color].icon}`}>
          {loading ? (
            <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              {icon}
            </motion.div>
          )}
        </div>
        
        {trend && (
          <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-medium">
              {Math.abs(trend.percentage).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </h3>
        
        <motion.div
          key={value}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="text-2xl font-bold text-gray-900 dark:text-white"
        >
          {loading ? (
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ) : (
            <CountUp
              end={value}
              duration={1.5}
              formattingFn={formatValue}
              preserveValue
            />
          )}
        </motion.div>
        
        {trend && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '' : '±'}
            {formatValue(Math.abs(trend.change))} par rapport à la période précédente
          </p>
        )}
      </div>

      {/* Progress bar */}
      <motion.div
        className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
      >
        <motion.div
          className={`h-full bg-gradient-to-r ${colorClasses[color].bg}`}
          initial={{ width: 0 }}
          animate={{ width: loading ? '50%' : '75%' }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </motion.div>

      {/* Hover effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
        whileHover={{ opacity: 0.1, x: ['-100%', '100%'] }}
        transition={{ duration: 0.6 }}
      />
    </motion.div>
  );
};

export default MetricCard;