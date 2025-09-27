import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center shadow-2xl">
          <ShieldX className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Accès refusé
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page. 
          Veuillez contacter l'administrateur ou vérifier vos droits d'accès.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/auth/force-logout"
            className="btn-primary flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Déconnexion forcée
          </Link>
          
          <Link
            to="/auth/login"
            className="btn-secondary flex items-center justify-center"
          >
            <Home className="w-4 h-4 mr-2" />
            Retour connexion
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default UnauthorizedPage;