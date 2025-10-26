import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricDisplayProps {
  value: number;
  previousValue: number;
  format?: 'currency' | 'number' | 'percentage';
  currency?: string;
  showChange?: boolean;
  className?: string;
}

/**
 * Composant pour afficher les métriques avec les variations cohérentes
 */
const MetricDisplay: React.FC<MetricDisplayProps> = ({
  value,
  previousValue,
  format = 'number',
  currency = 'XOF',
  showChange = true,
  className = ''
}) => {
  const change = value - previousValue;
  const changePercentage = previousValue > 0 ? (change / previousValue) * 100 : 0;
  const isPositive = change >= 0;

  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return `${val.toLocaleString()} ${currency}`;
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'number':
      default:
        return val.toLocaleString();
    }
  };

  const formatChange = (change: number) => {
    if (format === 'currency') {
      return `${change >= 0 ? '+' : ''}${change.toLocaleString()} ${currency}`;
    } else if (format === 'percentage') {
      return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    } else {
      return `${change >= 0 ? '+' : ''}${change.toLocaleString()}`;
    }
  };

  return (
    <div className={`metric-display ${className}`}>
      <div className="flex items-center justify-between">
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {formatValue(value)}
        </div>
        {showChange && (
          <div className={`flex items-center space-x-1 ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {formatChange(change)}
            </span>
          </div>
        )}
      </div>
      {showChange && (
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {isPositive ? '+' : ''}{changePercentage.toFixed(1)}% par rapport à la période précédente
        </div>
      )}
    </div>
  );
};

export default MetricDisplay;
