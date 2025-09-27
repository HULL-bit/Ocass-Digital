/**
 * Test simple de création de produit
 */

const API_BASE_URL = 'http://localhost:8000/api/v1';

async function testSimpleProduct() {
    console.log('🧪 TEST SIMPLE DE CRÉATION DE PRODUIT');
    console.log('=' .repeat(50));

    try {
        // 1. Créer un entrepreneur
        console.log('\n1️⃣ Création entrepreneur...');
        const entrepreneurData = {
            email: `test-entrepreneur-${Date.now()}@example.com`,
            first_name: 'Test',
            last_name: 'Entrepreneur',
            type_utilisateur: 'entrepreneur',
            telephone: '+221771234567',
            password: 'password123',
            confirm_password: 'password123'
        };

        const registerResponse = await fetch(`${API_BASE_URL}/auth/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entrepreneurData)
        });

        if (!registerResponse.ok) {
            const error = await registerResponse.json();
            console.log('❌ Échec création entrepreneur:', JSON.stringify(error, null, 2));
            return;
        }

        const registerData = await registerResponse.json();
        console.log('✅ Entrepreneur créé avec succès');
        console.log(`🔑 Token complet: ${registerData.access}`);

        // 2. Tester la création de produit
        console.log('\n2️⃣ Test création produit...');
        const productData = {
            nom: 'Produit Test Simple',
            slug: `produit-test-simple-${Date.now()}`,
            description_courte: 'Description courte',
            categorie: 'f12fea23-3389-4489-b4e6-596a11bbbafe', // UUID de la première catégorie
            sku: `TEST-${Date.now()}`,
            prix_achat: 1000,
            prix_vente: 1500,
            statut: 'actif'
        };

        const productResponse = await fetch(`${API_BASE_URL}/products/products/`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${registerData.access}`
            },
            body: JSON.stringify(productData)
        });

        console.log(`📊 Status: ${productResponse.status}`);
        console.log(`📊 Headers:`, Object.fromEntries(productResponse.headers.entries()));

        const productResult = await productResponse.text();
        console.log(`📊 Response:`, productResult.substring(0, 200) + '...');

        if (productResponse.ok) {
            const product = JSON.parse(productResult);
            console.log('✅ Produit créé avec succès');
            console.log(`📦 Produit: ${product.nom} (${product.sku})`);
        } else {
            console.log('❌ Échec création produit');
        }

    } catch (error) {
        console.log('💥 Erreur:', error.message);
    }
}

testSimpleProduct().catch(console.error);
