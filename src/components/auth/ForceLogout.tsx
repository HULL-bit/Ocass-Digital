import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ForceLogout: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    console.log('Force logout completed, redirecting to login...');
    
    // Redirect to login
    setTimeout(() => {
      navigate('/auth/login', { replace: true });
    }, 1000);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Déconnexion en cours...</h1>
        <p className="text-gray-600 mb-4">
          Nettoyage des données de session...
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
};

export default ForceLogout;
