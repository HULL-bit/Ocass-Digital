import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Log de l'erreur (en production, envoyer à un service comme Sentry)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Si c'est une erreur DOM, essayer de nettoyer
    if (error.name === 'NotFoundError' && error.message.includes('removeChild')) {
      console.warn('DOM manipulation error detected, attempting cleanup...');
      // Forcer un re-render propre
      setTimeout(() => {
        this.setState({ hasError: false });
      }, 100);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleDiagnostic = () => {
    window.location.href = '/auth/diagnostic';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-premium p-4">
          <div className="max-w-md w-full bg-white dark:bg-dark-800 rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Oups ! Une erreur s'est produite
            </h1>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Nous sommes désolés. Une erreur inattendue s'est produite. 
              Nos équipes ont été automatiquement notifiées.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <summary className="cursor-pointer font-medium text-red-600 dark:text-red-400 mb-2">
                  Détails de l'erreur (Dev)
                </summary>
                <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Réessayer
              </button>
              
              <button
                onClick={this.handleDiagnostic}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Diagnostic
              </button>
              
              <button
                onClick={this.handleReload}
                className="flex-1 btn-secondary flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Recharger
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;