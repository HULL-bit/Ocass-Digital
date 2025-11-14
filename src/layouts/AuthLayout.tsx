import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoginPage from '../pages/auth/LoginPage';
import TestLoginPage from '../pages/auth/TestLoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import UnauthorizedPage from '../pages/auth/UnauthorizedPage';
import ForceLogout from '../components/auth/ForceLogout';
import ResetApp from '../components/auth/ResetApp';
import DiagnosticPage from '../components/auth/DiagnosticPage';

const AuthLayout: React.FC = () => {
  
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <Routes>
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/force-logout" element={<ForceLogout />} />
          <Route path="/reset" element={<ResetApp />} />
          <Route path="/diagnostic" element={<DiagnosticPage />} />
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </motion.div>
    </div>
  );
};

export default AuthLayout;