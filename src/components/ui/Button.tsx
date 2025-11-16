import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  onClick,
  type = 'button',
  className = '',
}) => {
  const variants = {
    tap: { scale: 0.95 },
    hover: { scale: 1.02, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
  };

  const baseClasses = 'btn-premium relative overflow-hidden group transition-all duration-300 transform focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    warning: 'btn-warning',
    danger: 'btn-danger',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    md: 'px-4 py-2.5 text-sm min-h-[44px]',
    lg: 'px-6 py-3 text-base min-h-[48px]',
    xl: 'px-8 py-4 text-lg min-h-[52px]',
  };

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();

  return (
    <motion.button
      variants={variants}
      whileTap={disabled || loading ? undefined : "tap"}
      whileHover={disabled || loading ? undefined : "hover"}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, rotate: -180 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 180 }}
            className="flex items-center justify-center"
          >
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Chargement...
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2"
          >
            {icon && iconPosition === 'left' && (
              <motion.span layoutId="icon-left">{icon}</motion.span>
            )}
            {children}
            {icon && iconPosition === 'right' && (
              <motion.span layoutId="icon-right">{icon}</motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 bg-white opacity-0 rounded-xl"
        whileTap={{ opacity: 0.1, scale: 0.95 }}
        transition={{ duration: 0.1 }}
      />
    </motion.button>
  );
};

export default Button;