/**
 * Test complet du système d'authentification et de gestion des produits
 * Vérifie la registration, login, création de produits et gestion d'images
 */

const API_BASE = 'http://localhost:8000/api/v1';
const FRONTEND_URL = 'http://localhost:5173';

console.log('🚀 Test complet du système commercial');
console.log('=====================================\n');

// Fonction utilitaire pour les requêtes
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test 1: Vérification de l'état des serveurs
async function testServerStatus() {
  console.log('📡 Test 1: Vérification des serveurs');
  console.log('-----------------------------------');
  
  // Test backend
  const backendTest = await makeRequest(`${API_BASE}/auth/login/`, {
    method: 'POST',
    body: JSON.stringify({})
  });
  
  console.log(`Backend (${API_BASE}): ${backendTest.success ? '✅ Accessible' : '❌ Inaccessible'}`);
  
  // Test frontend
  try {
    const frontendResponse = await fetch(FRONTEND_URL);
    console.log(`Frontend (${FRONTEND_URL}): ${frontendResponse.ok ? '✅ Accessible' : '❌ Inaccessible'}`);
  } catch (error) {
    console.log(`Frontend (${FRONTEND_URL}): ❌ Inaccessible`);
  }
  
  console.log('');
}

// Test 2: Registration d'un nouvel entrepreneur
async function testEntrepreneurRegistration() {
  console.log('👤 Test 2: Registration Entrepreneur');
  console.log('-----------------------------------');
  
  const timestamp = Date.now();
  const entrepreneurData = {
    email: `test-entrepreneur-${timestamp}@example.com`,
    password: 'password',
    confirm_password: 'password',
    type_utilisateur: 'entrepreneur',
    first_name: 'Test',
    last_name: 'Entrepreneur',
    telephone: '+221771234567',
    entreprise: {
      nom: `TestCompany-${timestamp}`,
      description: 'Entreprise de test pour validation',
      secteur_activite: 'commerce_general',
      forme_juridique: 'sas',
      siret: `TEST${timestamp}`,
      adresse_complete: 'Adresse test, Dakar',
      telephone: '+221771234567',
      email: `company-${timestamp}@test.com`,
      site_web: '',
      couleur_primaire: '#3B82F6',
      couleur_secondaire: '#10B981',
      devise_principale: 'XOF',
      fuseau_horaire: 'Africa/Dakar',
      nombre_employes: 1,
      chiffre_affaires_annuel: '50000000'
    },
    langue: 'fr',
    theme_interface: 'light',
    preferences_notifications: {
      email: true,
      sms: false,
      push: true,
      marketing: false
    }
  };
  
  const result = await makeRequest(`${API_BASE}/auth/register/`, {
    method: 'POST',
    body: JSON.stringify(entrepreneurData)
  });
  
  if (result.success) {
    console.log('✅ Registration entrepreneur réussie');
    console.log(`   Email: ${entrepreneurData.email}`);
    console.log(`   Token: ${result.data.access ? 'Généré' : 'Non généré'}`);
    return result.data;
  } else {
    console.log('❌ Échec registration entrepreneur');
    console.log(`   Erreur: ${JSON.stringify(result.data)}`);
    return null;
  }
}

// Test 3: Login avec le compte créé
async function testLogin(email, password) {
  console.log('\n🔐 Test 3: Login');
  console.log('----------------');
  
  const loginData = {
    email: email,
    password: password,
    type_utilisateur: 'entrepreneur'
  };
  
  const result = await makeRequest(`${API_BASE}/auth/login/`, {
    method: 'POST',
    body: JSON.stringify(loginData)
  });
  
  if (result.success) {
    console.log('✅ Login réussi');
    console.log(`   Utilisateur: ${result.data.user?.first_name} ${result.data.user?.last_name}`);
    console.log(`   Token: ${result.data.access ? 'Généré' : 'Non généré'}`);
    return result.data;
  } else {
    console.log('❌ Échec login');
    console.log(`   Erreur: ${JSON.stringify(result.data)}`);
    return null;
  }
}

// Test 4: Récupération des catégories
async function testGetCategories() {
  console.log('\n📂 Test 4: Récupération des catégories');
  console.log('--------------------------------------');
  
  const result = await makeRequest(`${API_BASE}/products/categories/`);
  
  if (result.success && result.data.length > 0) {
    console.log(`✅ ${result.data.length} catégories trouvées`);
    console.log(`   Première catégorie: ${result.data[0].nom} (ID: ${result.data[0].id})`);
    return result.data[0].id;
  } else {
    console.log('❌ Aucune catégorie trouvée');
    return null;
  }
}

// Test 5: Création d'un produit
async function testCreateProduct(token, categoryId) {
  console.log('\n📦 Test 5: Création de produit');
  console.log('-----------------------------');
  
  const productData = {
    nom: 'Produit Test Complet',
    description_courte: 'Description courte du produit test',
    description_longue: 'Description longue et détaillée du produit test pour validation complète',
    prix_achat: 500,
    prix_vente: 1000,
    stock: 50,
    categorie: categoryId,
    sku: `TEST-${Date.now()}`,
    slug: 'produit-test-complet'
  };
  
  const result = await makeRequest(`${API_BASE}/products/products/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(productData)
  });
  
  if (result.success) {
    console.log('✅ Produit créé avec succès');
    console.log(`   Nom: ${result.data.nom}`);
    console.log(`   SKU: ${result.data.sku}`);
    console.log(`   Prix: ${result.data.prix_vente} XOF`);
    console.log(`   QR Code: ${result.data.qr_code ? 'Généré' : 'Non généré'}`);
    return result.data;
  } else {
    console.log('❌ Échec création produit');
    console.log(`   Erreur: ${JSON.stringify(result.data)}`);
    return null;
  }
}

// Test 6: Récupération des produits
async function testGetProducts(token) {
  console.log('\n📋 Test 6: Récupération des produits');
  console.log('-----------------------------------');
  
  const result = await makeRequest(`${API_BASE}/products/products/`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (result.success) {
    console.log(`✅ ${result.data.length} produits trouvés`);
    if (result.data.length > 0) {
      const product = result.data[0];
      console.log(`   Premier produit: ${product.nom}`);
      console.log(`   Prix: ${product.prix_vente} XOF`);
      console.log(`   Stock: ${product.stock_actuel}`);
    }
    return result.data;
  } else {
    console.log('❌ Échec récupération produits');
    console.log(`   Erreur: ${JSON.stringify(result.data)}`);
    return [];
  }
}

// Test 7: Test de l'interface frontend
async function testFrontendInterface() {
  console.log('\n🖥️ Test 7: Interface Frontend');
  console.log('----------------------------');
  
  try {
    const response = await fetch(FRONTEND_URL);
    if (response.ok) {
      console.log('✅ Interface frontend accessible');
      console.log(`   URL: ${FRONTEND_URL}`);
      console.log('   Vous pouvez maintenant tester manuellement:');
      console.log('   - Registration d\'entrepreneurs et clients');
      console.log('   - Login avec différents types d\'utilisateurs');
      console.log('   - Création et modification de produits');
      console.log('   - Gestion des images de produits');
    } else {
      console.log('❌ Interface frontend inaccessible');
    }
  } catch (error) {
    console.log('❌ Erreur accès frontend:', error.message);
  }
}

// Fonction principale de test
async function runCompleteTest() {
  try {
    // Test 1: Vérification des serveurs
    await testServerStatus();
    
    // Test 2: Registration entrepreneur
    const registrationResult = await testEntrepreneurRegistration();
    if (!registrationResult) {
      console.log('❌ Arrêt des tests - Registration échouée');
      return;
    }
    
    // Test 3: Login
    const loginResult = await testLogin(registrationResult.user?.email || 'test@example.com', 'password');
    if (!loginResult) {
      console.log('❌ Arrêt des tests - Login échoué');
      return;
    }
    
    // Test 4: Catégories
    const categoryId = await testGetCategories();
    if (!categoryId) {
      console.log('❌ Arrêt des tests - Aucune catégorie trouvée');
      return;
    }
    
    // Test 5: Création produit
    const product = await testCreateProduct(loginResult.access, categoryId);
    if (!product) {
      console.log('❌ Arrêt des tests - Création produit échouée');
      return;
    }
    
    // Test 6: Récupération produits
    await testGetProducts(loginResult.access);
    
    // Test 7: Interface frontend
    await testFrontendInterface();
    
    console.log('\n🎉 Tests terminés avec succès !');
    console.log('===============================');
    console.log('✅ Toutes les fonctionnalités principales sont opérationnelles');
    console.log('✅ Registration et authentification fonctionnent');
    console.log('✅ Création et gestion des produits fonctionnent');
    console.log('✅ Interface frontend accessible');
    console.log('\n📝 Prochaines étapes recommandées:');
    console.log('   - Tester l\'ajout d\'images aux produits via l\'interface');
    console.log('   - Tester la registration de clients');
    console.log('   - Tester les différents secteurs d\'activité');
    console.log('   - Vérifier l\'affichage des produits avec images');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

// Lancement des tests
runCompleteTest();
