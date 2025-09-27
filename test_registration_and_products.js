/**
 * Test de création de comptes et de produits
 */

const API_BASE_URL = 'http://localhost:8000/api/v1';

async function testRegistrationAndProducts() {
    console.log('🧪 TEST DE CRÉATION DE COMPTES ET PRODUITS');
    console.log('=' .repeat(60));

    // Test 1: Création d'un compte entrepreneur
    console.log('\n1️⃣ TEST CRÉATION ENTREPRENEUR');
    try {
        const entrepreneurData = {
            email: `test-entrepreneur-${Date.now()}@example.com`,
            first_name: 'Test',
            last_name: 'Entrepreneur',
            type_utilisateur: 'entrepreneur',
            telephone: '+221771234567',
            password: 'password123',
            confirm_password: 'password123'
        };

        const response = await fetch(`${API_BASE_URL}/auth/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entrepreneurData)
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Création entrepreneur réussie');
            console.log(`👤 Utilisateur: ${data.user.nom_complet}`);
            console.log(`🎭 Type: ${data.user.type_utilisateur}`);
            console.log(`🔑 Token: ${data.access.substring(0, 20)}...`);
            
            // Test 2: Création d'un produit avec ce compte
            console.log('\n2️⃣ TEST CRÉATION PRODUIT');
            await testProductCreation(data.access);
            
        } else {
            console.log('❌ Échec création entrepreneur');
            console.log('📝 Erreur:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.log('💥 Erreur réseau:', error.message);
    }

    // Test 3: Création d'un compte client
    console.log('\n3️⃣ TEST CRÉATION CLIENT');
    try {
        const clientData = {
            email: `test-client-${Date.now()}@example.com`,
            first_name: 'Test',
            last_name: 'Client',
            type_utilisateur: 'client',
            telephone: '+221771234568',
            password: 'password123',
            confirm_password: 'password123'
        };

        const response = await fetch(`${API_BASE_URL}/auth/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clientData)
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Création client réussie');
            console.log(`👤 Utilisateur: ${data.user.nom_complet}`);
            console.log(`🎭 Type: ${data.user.type_utilisateur}`);
        } else {
            console.log('❌ Échec création client');
            console.log('📝 Erreur:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.log('💥 Erreur réseau:', error.message);
    }
}

async function testProductCreation(accessToken) {
    try {
        // D'abord, récupérer les catégories disponibles
        const categoriesResponse = await fetch(`${API_BASE_URL}/products/categories/`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        let categorieId = 1; // ID par défaut
        if (categoriesResponse.ok) {
            const categories = await categoriesResponse.json();
            if (categories.results && categories.results.length > 0) {
                categorieId = categories.results[0].id;
            }
        } else {
            console.log('⚠️ Impossible de récupérer les catégories, utilisation de l\'ID par défaut');
        }

        const productData = {
            nom: 'Produit Test',
            slug: `produit-test-${Date.now()}`,
            description_courte: 'Description courte du produit test',
            description_longue: 'Description longue du produit test',
            categorie: categorieId,
            sku: `TEST-${Date.now()}`,
            prix_achat: 1000,
            prix_vente: 1500,
            tva_taux: 18,
            stock_minimum: 10,
            statut: 'actif',
            visible_catalogue: true
        };

        const response = await fetch(`${API_BASE_URL}/products/products/`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(productData)
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Création produit réussie');
            console.log(`📦 Produit: ${data.nom} (${data.sku})`);
            console.log(`💰 Prix: ${data.prix_vente} XOF`);
            
            // Test modification du produit
            console.log('\n4️⃣ TEST MODIFICATION PRODUIT');
            await testProductUpdate(data.id, accessToken);
            
        } else {
            console.log('❌ Échec création produit');
            console.log('📝 Erreur:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.log('💥 Erreur création produit:', error.message);
    }
}

async function testProductUpdate(productId, accessToken) {
    try {
        const updateData = {
            nom: 'Produit Test Modifié',
            description_courte: 'Description modifiée',
            prix_vente: 2000
        };

        const response = await fetch(`${API_BASE_URL}/products/products/${productId}/`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(updateData)
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Modification produit réussie');
            console.log(`📦 Produit modifié: ${data.nom}`);
            console.log(`💰 Nouveau prix: ${data.prix_vente} XOF`);
        } else {
            console.log('❌ Échec modification produit');
            console.log('📝 Erreur:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.log('💥 Erreur modification produit:', error.message);
    }
}

// Exécuter le test
testRegistrationAndProducts().catch(console.error);
