import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller, FieldValues, Path } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import Button from '../ui/Button';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'file';
  placeholder?: string;
  options?: { label: string; value: any }[];
  validation?: any;
  icon?: ReactNode;
  description?: string;
  rows?: number;
}

interface AnimatedFormProps<T extends FieldValues> {
  fields: FormField[];
  onSubmit: (data: T) => void | Promise<void>;
  validationSchema?: yup.ObjectSchema<any>;
  defaultValues?: Partial<T>;
  submitLabel?: string;
  loading?: boolean;
  className?: string;
  title?: string;
  description?: string;
  columns?: 1 | 2 | 3;
}

function AnimatedForm<T extends FieldValues>({
  fields,
  onSubmit,
  validationSchema,
  defaultValues,
  submitLabel = 'Enregistrer',
  loading = false,
  className = '',
  title,
  description,
  columns = 1,
}: AnimatedFormProps<T>) {
  const [showPasswords, setShowPasswords] = React.useState<Record<string, boolean>>({});

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
    setValue,
  } = useForm<T>({
    resolver: validationSchema ? yupResolver(validationSchema) : undefined,
    defaultValues: defaultValues as any,
    mode: 'onChange',
  });

  const togglePasswordVisibility = (fieldName: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const getGridCols = () => {
    switch (columns) {
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      default:
        return 'grid-cols-1';
    }
  };

  const renderField = (field: FormField, index: number) => {
    const error = errors[field.name as Path<T>];
    const hasError = !!error;
    const isPasswordField = field.type === 'password';
    const showPassword = showPasswords[field.name];

    return (
      <motion.div
        key={field.name}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={field.type === 'checkbox' ? 'col-span-full' : ''}
      >
        <Controller
          name={field.name as Path<T>}
          control={control}
          render={({ field: { onChange, value, name } }) => (
            <div className="space-y-2">
              {field.type !== 'checkbox' && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {field.label}
                  {field.validation?.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
              )}

              <div className="relative">
                {/* Text Input */}
                {(field.type === 'text' || field.type === 'email' || field.type === 'number') && (
                  <>
                    {field.icon && (
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {field.icon}
                      </div>
                    )}
                    <motion.input
                      type={field.type}
                      value={value || ''}
                      onChange={onChange}
                      placeholder={field.placeholder}
                      className={`
                        input-premium w-full transition-all duration-300
                        ${field.icon ? 'pl-10' : ''}
                        ${hasError 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                          : 'focus:border-primary-500 focus:ring-primary-500/20'
                        }
                      `}
                      whileFocus={{ scale: 1.02 }}
                    />
                  </>
                )}

                {/* Password Input */}
                {field.type === 'password' && (
                  <>
                    {field.icon && (
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {field.icon}
                      </div>
                    )}
                    <motion.input
                      type={showPassword ? 'text' : 'password'}
                      value={value || ''}
                      onChange={onChange}
                      placeholder={field.placeholder}
                      className={`
                        input-premium w-full pr-10 transition-all duration-300
                        ${field.icon ? 'pl-10' : ''}
                        ${hasError 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                          : 'focus:border-primary-500 focus:ring-primary-500/20'
                        }
                      `}
                      whileFocus={{ scale: 1.02 }}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(field.name)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </>
                )}

                {/* Select */}
                {field.type === 'select' && (
                  <motion.select
                    value={value || ''}
                    onChange={onChange}
                    className={`
                      input-premium w-full transition-all duration-300
                      ${hasError 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                        : 'focus:border-primary-500 focus:ring-primary-500/20'
                      }
                    `}
                    whileFocus={{ scale: 1.02 }}
                  >
                    <option value="">{field.placeholder || `Sélectionnez ${field.label.toLowerCase()}`}</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </motion.select>
                )}

                {/* Textarea */}
                {field.type === 'textarea' && (
                  <motion.textarea
                    value={value || ''}
                    onChange={onChange}
                    placeholder={field.placeholder}
                    rows={field.rows || 4}
                    className={`
                      input-premium w-full resize-none transition-all duration-300
                      ${hasError 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                        : 'focus:border-primary-500 focus:ring-primary-500/20'
                      }
                    `}
                    whileFocus={{ scale: 1.02 }}
                  />
                )}

                {/* Checkbox */}
                {field.type === 'checkbox' && (
                  <motion.label
                    className="flex items-start space-x-3 cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                  >
                    <input
                      type="checkbox"
                      checked={value || false}
                      onChange={(e) => onChange(e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {field.label}
                      </span>
                      {field.description && (
                        <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                      )}
                    </div>
                  </motion.label>
                )}

                {/* File Input */}
                {field.type === 'file' && (
                  <motion.div
                    className={`
                      border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300
                      ${hasError 
                        ? 'border-red-300 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary-500 bg-gray-50 dark:bg-gray-700'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                  >
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        onChange(file);
                      }}
                      className="hidden"
                      id={field.name}
                      accept="image/*"
                    />
                    <label htmlFor={field.name} className="cursor-pointer">
                      <div className="w-12 h-12 mx-auto mb-3 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        {field.icon || <Eye className="w-6 h-6 text-primary-600" />}
                      </div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {field.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {field.placeholder || 'Cliquez pour sélectionner un fichier'}
                      </p>
                    </label>
                  </motion.div>
                )}

                {/* Success/Error Icons */}
                <AnimatePresence>
                  {!hasError && value && field.type !== 'checkbox' && field.type !== 'file' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Field Description */}
              {field.description && field.type !== 'checkbox' && (
                <p className="text-xs text-gray-500">{field.description}</p>
              )}

              {/* Error Message */}
              <AnimatePresence>
                {hasError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center space-x-2 text-red-600 dark:text-red-400"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error?.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        />
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden ${className}`}
    >
      {/* Header */}
      {(title || description) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-dark-800 dark:to-dark-700"
        >
          {title && (
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        <div className={`grid ${getGridCols()} gap-6 mb-6`}>
          {fields.map((field, index) => renderField(field, index))}
        </div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: fields.length * 0.1 + 0.2 }}
          className="flex justify-end space-x-3"
        >
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={!isValid || loading}
            icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
            className="min-w-[120px]"
          >
            {loading ? 'Enregistrement...' : submitLabel}
          </Button>
        </motion.div>

        {/* Form Status */}
        <AnimatePresence>
          {isDirty && !isValid && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-700 dark:text-yellow-400">
                  Veuillez corriger les erreurs avant de continuer
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
}

export default AnimatedForm;