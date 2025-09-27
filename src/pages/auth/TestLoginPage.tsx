import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

const TestLoginPage: React.FC = () => {
  console.log('TestLoginPage component is rendering');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'admin',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('TestLoginPage handleSubmit called with:', formData);

    try {
      // Test direct de l'API
      const response = await fetch('http://localhost:8000/api/v1/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          type_utilisateur: formData.role
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data);
        
        // Sauvegarder les données
        localStorage.setItem('token', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        alert('Connexion réussie !');
        navigate(`/${formData.role}`);
      } else {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
        alert('Échec de la connexion: ' + (errorData.detail || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Erreur de connexion: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="glass-morphism rounded-3xl p-8 shadow-2xl"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-primary-500 to-electric-500 flex items-center justify-center shadow-lg"
        >
          <img 
            src="/logo.svg" 
            alt="OCASS DIGITAL Logo" 
            className="w-12 h-12"
          />
        </motion.div>
        
        <h1 className="text-3xl font-bold gradient-text mb-2">
          Test de Connexion
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Test direct de l'API d'authentification
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Selection */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Vous êtes :
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'admin', label: 'Admin', icon: '👑' },
              { value: 'entrepreneur', label: 'Entrepreneur', icon: '💼' },
              { value: 'client', label: 'Client', icon: '🛍️' },
            ].map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: role.value }))}
                className={`p-3 rounded-xl text-sm font-medium transition-all ${
                  formData.role === role.value
                    ? 'bg-primary-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <div className="text-lg mb-1">{role.icon}</div>
                {role.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Email */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="input-premium pl-10"
              placeholder="votre@email.com"
              required
            />
          </div>
        </motion.div>

        {/* Password */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="input-premium pl-10 pr-10"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          type="submit"
          disabled={loading}
          className="w-full btn-primary relative overflow-hidden group"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Test de connexion...
            </div>
          ) : (
            <div className="flex items-center justify-center group">
              Tester la connexion
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </motion.button>

        {/* Test Credentials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center space-y-2"
        >
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="font-semibold mb-2">Comptes de test :</p>
            <div className="space-y-1 text-xs">
              <p><strong>Admin:</strong> admin@platform.com / admin123</p>
              <p><strong>Entrepreneur:</strong> entrepreneur@demo.com / password</p>
              <p><strong>Client:</strong> client@example.com / password</p>
            </div>
          </div>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default TestLoginPage;