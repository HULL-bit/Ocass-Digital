import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { useWebSocket } from '../hooks/useWebSocket'; // Disabled to avoid circular dependency
import apiService from '../services/api/realApi';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'entrepreneur' | 'client';
  avatar?: string;
  company?: {
    id: string;
    name: string;
    logo?: string;
  };
  permissions: string[];
  preferences: {
    language: string;
    currency: string;
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Initialize WebSocket connection when user is authenticated (disabled for now to avoid circular dependency)
  // const { isConnected } = useWebSocket(user?.id || '');
  const isConnected = false;

  useEffect(() => {
    // Simulation de vérification du token au démarrage
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          
          // Vérifier et corriger la structure des données utilisateur
          if (userData && !userData.role && userData.type_utilisateur) {
            userData.role = userData.type_utilisateur;
          }
          
          // Vérifier que l'utilisateur a un rôle valide
          if (userData && userData.role) {
            setUser(userData);
          } else {
            console.warn('Données utilisateur invalides, nettoyage...');
            localStorage.clear();
          }
        } catch (error) {
          console.error('Erreur lors de la restauration de la session:', error);
          localStorage.clear();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Log WebSocket connection status
  useEffect(() => {
    if (user && isConnected) {
      console.log(`WebSocket connecté pour l'utilisateur ${user.firstName}`);
    }
  }, [user, isConnected]);

  const login = async (email: string, password: string, role: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const response = await apiService.login(email, password, role);
      
      if (response && response.user) {
        const userData = {
          id: response.user.id,
          email: response.user.email,
          firstName: response.user.first_name || response.user.nom_complet?.split(' ')[0] || '',
          lastName: response.user.last_name || response.user.nom_complet?.split(' ').slice(1).join(' ') || '',
          role: response.user.type_utilisateur,
          avatar: response.user.avatar,
          company: response.user.entreprise ? {
            id: response.user.entreprise.id,
            name: response.user.entreprise.nom,
            logo: response.user.entreprise.logo,
          } : undefined,
          permissions: response.permissions || [],
          preferences: {
            language: response.user.langue || 'fr',
            currency: response.user.entreprise?.devise_principale || 'XOF',
            theme: response.user.theme_interface || 'light',
            notifications: response.user.notifications_email !== undefined ? response.user.notifications_email : true,
          },
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};