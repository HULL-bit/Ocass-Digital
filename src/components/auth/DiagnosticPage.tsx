import React, { useState, useEffect } from 'react';

const DiagnosticPage: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<any>({});

  useEffect(() => {
    const runDiagnostics = async () => {
      const results: any = {};

      // Test 1: Vérifier le localStorage
      try {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        results.localStorage = {
          user: user ? 'Present' : 'Missing',
          token: token ? 'Present' : 'Missing',
          userData: user ? JSON.parse(user) : null
        };
      } catch (error) {
        results.localStorage = { error: error.message };
      }

      // Test 2: Vérifier l'API backend
      try {
        const response = await fetch('http://localhost:8001/api/v1/auth/login/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'admin@platform.com',
            password: 'admin123',
            type_utilisateur: 'admin'
          })
        });
        results.api = {
          status: response.status,
          ok: response.ok,
          url: 'http://localhost:8001/api/v1/auth/login/'
        };
      } catch (error) {
        results.api = { error: error.message };
      }

      // Test 3: Vérifier le frontend
      results.frontend = {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };

      setDiagnostics(results);
    };

    runDiagnostics();
  }, []);

  const clearAll = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Diagnostic de l'Application</h1>
        
        <div className="grid gap-6">
          {/* LocalStorage */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">LocalStorage</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(diagnostics.localStorage, null, 2)}
            </pre>
          </div>

          {/* API Backend */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">API Backend</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(diagnostics.api, null, 2)}
            </pre>
          </div>

          {/* Frontend */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Frontend</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(diagnostics.frontend, null, 2)}
            </pre>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={clearAll}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Nettoyer tout et rediriger
          </button>
          <button
            onClick={() => window.location.href = '/auth/login'}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Aller à la connexion
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Recharger la page
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticPage;
