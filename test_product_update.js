/**
 * Test de modification de produit
 */

const API_BASE_URL = 'http://localhost:8000/api/v1';

async function testProductUpdate() {
    console.log('🧪 TEST DE MODIFICATION DE PRODUIT');
    console.log('=' .repeat(50));

    try {
        // 1. Créer un entrepreneur
        console.log('\n1️⃣ Création entrepreneur...');
        const entrepreneurData = {
            email: `test-entrepreneur-update-${Date.now()}@example.com`,
            first_name: 'Test',
            last_name: 'Update',
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

        // 2. Créer un produit
        console.log('\n2️⃣ Création produit...');
        const productData = {
            nom: 'Produit Original',
            slug: `produit-original-${Date.now()}`,
            description_courte: 'Description originale',
            categorie: 'f12fea23-3389-4489-b4e6-596a11bbbafe',
            sku: `ORIG-${Date.now()}`,
            prix_achat: 1000,
            prix_vente: 1500,
            statut: 'actif'
        };

        const createResponse = await fetch(`${API_BASE_URL}/products/products/`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${registerData.access}`
            },
            body: JSON.stringify(productData)
        });

        if (!createResponse.ok) {
            const error = await createResponse.text();
            console.log('❌ Échec création produit:', error.substring(0, 200));
            return;
        }

        const createdProduct = await createResponse.json();
        console.log('✅ Produit créé avec succès');
        console.log(`📦 Produit: ${createdProduct.nom} (${createdProduct.sku})`);

        // 3. Modifier le produit
        console.log('\n3️⃣ Modification produit...');
        const updateData = {
            nom: 'Produit Modifié',
            description_courte: 'Description modifiée',
            prix_vente: 2000,
            prix_promotion: 1800
        };

        const updateResponse = await fetch(`${API_BASE_URL}/products/products/${createdProduct.id}/`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${registerData.access}`
            },
            body: JSON.stringify(updateData)
        });

        console.log(`📊 Status: ${updateResponse.status}`);

        if (updateResponse.ok) {
            const updatedProduct = await updateResponse.json();
            console.log('✅ Produit modifié avec succès');
            console.log(`📦 Nouveau nom: ${updatedProduct.nom}`);
            console.log(`💰 Nouveau prix: ${updatedProduct.prix_vente} XOF`);
            console.log(`🏷️ Prix promo: ${updatedProduct.prix_promotion} XOF`);
        } else {
            const error = await updateResponse.text();
            console.log('❌ Échec modification produit');
            console.log('📝 Erreur:', error.substring(0, 200));
        }

    } catch (error) {
        console.log('💥 Erreur:', error.message);
    }
}

testProductUpdate().catch(console.error);
