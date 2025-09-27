/**
 * Test simple d'authentification
 */

const API_BASE_URL = 'http://localhost:8000/api/v1';

async function testSimpleAuth() {
    console.log('🔐 TEST SIMPLE D\'AUTHENTIFICATION');
    console.log('=' .repeat(50));

    const testAccounts = [
        {
            name: 'Admin Principal',
            email: 'admin@platform.com',
            password: 'password',
            type: 'admin'
        },
        {
            name: 'Admin 1',
            email: 'admin1@platform.com',
            password: 'password',
            type: 'admin'
        },
        {
            name: 'Entrepreneur Pharmacie',
            email: 'fatou@pharmaciemoderne.sn',
            password: 'password',
            type: 'entrepreneur'
        },
        {
            name: 'Client Principal',
            email: 'client1@example.com',
            password: 'password',
            type: 'client'
        }
    ];

    for (const account of testAccounts) {
        console.log(`\n🧪 Test: ${account.name}`);
        console.log(`   📧 Email: ${account.email}`);
        console.log(`   🔑 Mot de passe: ${account.password}`);
        console.log(`   🎭 Type: ${account.type}`);
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: account.email,
                    password: account.password,
                    type_utilisateur: account.type
                })
            });

            const data = await response.json();
            const success = response.ok;

            if (success) {
                console.log(`   ✅ Connexion réussie`);
                console.log(`   👤 Utilisateur: ${data.user.nom_complet}`);
                console.log(`   🎭 Rôle: ${data.user.type_utilisateur}`);
                console.log(`   🔑 Token: ${data.access.substring(0, 20)}...`);
            } else {
                console.log(`   ❌ Échec de connexion`);
                console.log(`   📝 Erreur: ${JSON.stringify(data)}`);
            }

        } catch (error) {
            console.log(`   💥 Erreur réseau: ${error.message}`);
        }
    }

    console.log('\n📊 RÉSUMÉ');
    console.log('=' .repeat(50));
    console.log('✅ Tous les comptes devraient fonctionner');
    console.log('🔑 Mot de passe: password pour tous');
    console.log('🎯 Vérifiez que le backend fonctionne correctement');
}

// Exécuter le test
testSimpleAuth().catch(console.error);
