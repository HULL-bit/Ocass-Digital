// Test de l'authentification frontend
const API_BASE_URL = 'http://localhost:8000/api/v1';

async function testLogin(email, password, type_utilisateur) {
  console.log(`🔐 Test de connexion pour ${email}`);
  
  try {
    const loginData = { email, password, type_utilisateur };
    console.log('Données envoyées:', loginData);
    
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });
    
    console.log('Status de la réponse:', response.status);
    console.log('Headers de la réponse:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur 400 détectée:', errorData);
      throw new Error(`Erreur ${response.status}: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    console.log('✅ Connexion réussie:', {
      user: data.user?.email,
      role: data.user?.type_utilisateur,
      token: data.access ? 'Présent' : 'Absent'
    });
    
    return data;
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    throw error;
  }
}

// Tests
async function runTests() {
  console.log('🚀 Test Frontend d\'Authentification');
  console.log('=' * 50);
  
  const testCases = [
    { email: 'client1@example.com', password: 'password', type_utilisateur: 'client' },
    { email: 'client@example.com', password: 'password', type_utilisateur: 'client' },
    { email: 'admin@platform.com', password: 'admin123', type_utilisateur: 'admin' }
  ];
  
  for (const testCase of testCases) {
    try {
      await testLogin(testCase.email, testCase.password, testCase.type_utilisateur);
      console.log(`✅ ${testCase.email} - Succès\n`);
    } catch (error) {
      console.log(`❌ ${testCase.email} - Échec: ${error.message}\n`);
    }
  }
}

// Exécuter les tests
runTests().catch(console.error);
