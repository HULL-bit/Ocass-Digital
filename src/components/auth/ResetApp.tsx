import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ResetApp: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    // Clear any cached data
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    console.log('Complete app reset performed');
    
    // Force page reload to clear all state
    setTimeout(() => {
      window.location.href = '/auth/login';
    }, 2000);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Réinitialisation complète</h1>
        <p className="text-gray-600 mb-4">
          Nettoyage de toutes les données et redémarrage...
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-sm text-gray-500 mt-4">
          Redirection vers la page de connexion...
        </p>
      </div>
    </div>
  );
};

export default ResetApp;
