import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import AutoSyncManager from './components/sync/AutoSyncManager';
import AdminLayout from './layouts/AdminLayout';
import EntrepreneurLayout from './layouts/EntrepreneurLayout';
import ClientLayout from './layouts/ClientLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingScreen from './components/ui/LoadingScreen';
import ErrorBoundary from './components/ui/ErrorBoundary';
import ParticlesBackground from './components/ui/ParticlesBackground';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <AutoSyncManager>
                <Router>
                  <div className="min-h-screen bg-gradient-premium dark:bg-dark-900 transition-all duration-500">
                    <ParticlesBackground />
                  <Routes>
                    {/* Routes d'authentification */}
                    <Route path="/auth/*" element={<AuthLayout />} />
                    
                    {/* Routes Admin */}
                    <Route 
                      path="/admin/*" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <AdminLayout />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Routes Entrepreneur */}
                    <Route 
                      path="/entrepreneur/*" 
                      element={
                        <ProtectedRoute requiredRole="entrepreneur">
                          <EntrepreneurLayout />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Routes Client */}
                    <Route 
                      path="/client/*" 
                      element={
                        <ProtectedRoute requiredRole="client">
                          <ClientLayout />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Redirection par défaut */}
                    <Route path="/" element={<Navigate to="/auth/login" replace />} />
                    <Route path="*" element={<Navigate to="/auth/login" replace />} />
                  </Routes>
                </div>
              </Router>
              
              {/* Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--toast-bg)',
                    color: 'var(--toast-color)',
                    borderRadius: '12px',
                    padding: '16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#ffffff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#ffffff',
                    },
                  },
                }}
              />
              </AutoSyncManager>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;