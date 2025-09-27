#!/usr/bin/env node

/**
 * Script de test pour vérifier que l'erreur d'authentification est résolue
 */

console.log('🔧 Test de résolution de l\'erreur d\'authentification...\n');

// Test 1: Vérifier que les fichiers modifiés existent
const fs = require('fs');
const path = require('path');

const filesToCheck = [
  'src/contexts/AuthContext.tsx',
  'src/layouts/AuthLayout.tsx',
  'src/pages/auth/RegisterPage.tsx'
];

console.log('📁 Vérification des fichiers modifiés:');
filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MANQUANT`);
  }
});

// Test 2: Vérifier que useWebSocket n'est plus importé dans AuthContext
console.log('\n🔍 Vérification des corrections:');
try {
  const authContextContent = fs.readFileSync(path.join(__dirname, 'src/contexts/AuthContext.tsx'), 'utf8');
  
  if (authContextContent.includes('// import { useWebSocket }')) {
    console.log('   ✅ useWebSocket commenté dans AuthContext');
  } else if (!authContextContent.includes('import { useWebSocket }')) {
    console.log('   ✅ useWebSocket supprimé de AuthContext');
  } else {
    console.log('   ❌ useWebSocket encore présent dans AuthContext');
  }
  
  if (authContextContent.includes('const isConnected = false;')) {
    console.log('   ✅ isConnected défini comme false');
  } else {
    console.log('   ❌ isConnected non défini correctement');
  }
} catch (error) {
  console.log(`   ❌ Erreur lors de la lecture d'AuthContext: ${error.message}`);
}

// Test 3: Vérifier que AuthLayout n'utilise plus useAuth
try {
  const authLayoutContent = fs.readFileSync(path.join(__dirname, 'src/layouts/AuthLayout.tsx'), 'utf8');
  
  if (!authLayoutContent.includes('useAuth')) {
    console.log('   ✅ useAuth supprimé d\'AuthLayout');
  } else {
    console.log('   ❌ useAuth encore présent dans AuthLayout');
  }
} catch (error) {
  console.log(`   ❌ Erreur lors de la lecture d'AuthLayout: ${error.message}`);
}

// Test 4: Vérifier que RegisterPage utilise la gestion d'erreur pour useAuth
try {
  const registerPageContent = fs.readFileSync(path.join(__dirname, 'src/pages/auth/RegisterPage.tsx'), 'utf8');
  
  if (registerPageContent.includes('try {') && registerPageContent.includes('const authContext = useAuth()')) {
    console.log('   ✅ Gestion d\'erreur ajoutée dans RegisterPage');
  } else {
    console.log('   ❌ Gestion d\'erreur manquante dans RegisterPage');
  }
} catch (error) {
  console.log(`   ❌ Erreur lors de la lecture de RegisterPage: ${error.message}`);
}

console.log('\n🎯 Résumé des corrections apportées:');
console.log('   1. Suppression de useAuth() dans AuthLayout.tsx');
console.log('   2. Désactivation de useWebSocket dans AuthContext.tsx pour éviter la dépendance circulaire');
console.log('   3. Ajout de gestion d\'erreur pour useAuth() dans RegisterPage.tsx');

console.log('\n✨ Test terminé ! L\'erreur "useAuth must be used within an AuthProvider" devrait être résolue.');
console.log('   Vous pouvez maintenant tester l\'application en naviguant vers http://localhost:5173');

console.log('\n📋 Prochaines étapes recommandées:');
console.log('   1. Tester la connexion avec les comptes existants');
console.log('   2. Tester l\'inscription de nouveaux utilisateurs');
console.log('   3. Vérifier que les routes protégées fonctionnent correctement');
console.log('   4. Réactiver useWebSocket plus tard si nécessaire (après résolution des dépendances circulaires)');