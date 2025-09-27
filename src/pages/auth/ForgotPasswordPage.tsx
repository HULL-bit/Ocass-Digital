import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simuler l'envoi d'email
    setSent(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-morphism rounded-3xl p-8 shadow-2xl"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
          <Mail className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {sent ? 'Email envoyé !' : 'Mot de passe oublié ?'}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {sent
            ? 'Vérifiez votre boîte email pour les instructions de réinitialisation'
            : 'Entrez votre email pour recevoir un lien de réinitialisation'
          }
        </p>
      </div>

      {!sent ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-premium pl-10"
                placeholder="votre@email.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-primary group"
          >
            <div className="flex items-center justify-center">
              Envoyer le lien
              <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </form>
      ) : (
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <Send className="w-10 h-10 text-green-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Si un compte existe avec l'email <strong>{email}</strong>, vous recevrez un lien de réinitialisation dans quelques minutes.
          </p>
        </div>
      )}

      <div className="mt-6 text-center">
        <Link
          to="/auth/login"
          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Retour à la connexion
        </Link>
      </div>
    </motion.div>
  );
};

export default ForgotPasswordPage;