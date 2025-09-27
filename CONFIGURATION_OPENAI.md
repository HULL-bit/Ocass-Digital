# Configuration de l'IA OpenAI pour le Support Client

## 🚀 Installation et Configuration

### 1. Obtenir une clé API OpenAI

1. Allez sur [OpenAI Platform](https://platform.openai.com/)
2. Créez un compte ou connectez-vous
3. Allez dans la section "API Keys"
4. Créez une nouvelle clé API
5. Copiez la clé (elle commence par `sk-`)

### 2. Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet avec :

```env
# Configuration OpenAI
VITE_OPENAI_API_KEY=sk-your-api-key-here

# Configuration API Backend
VITE_API_BASE_URL=http://localhost:8000/api

# Configuration WebSocket
VITE_WS_URL=ws://localhost:8000/ws
```

### 3. Redémarrer le serveur de développement

```bash
npm run dev
```

## 🤖 Fonctionnalités de l'IA

### Réponses Intelligentes
- **Analyse contextuelle** : L'IA comprend le contexte de la conversation
- **Réponses naturelles** : Utilise GPT-3.5-turbo pour des réponses humaines
- **Actions intelligentes** : Propose des actions basées sur le contenu

### Modes de Fonctionnement

#### Mode IA Activé (par défaut)
- Utilise l'API OpenAI pour des réponses intelligentes
- Analyse le contexte de la conversation
- Propose des actions appropriées

#### Mode IA Désactivé
- Utilise les réponses prédéfinies
- Fonctionne sans connexion internet
- Fallback en cas d'erreur API

### Gestion des Erreurs

- **Fallback automatique** : Si l'IA échoue, bascule vers les réponses prédéfinies
- **Indicateur de chargement** : Affiche quand l'IA traite la demande
- **Messages d'erreur** : Informe l'utilisateur en cas de problème

## 💰 Coûts OpenAI

### Modèle GPT-3.5-turbo
- **Coût** : ~$0.002 par 1K tokens
- **Limite** : 500 tokens par réponse
- **Estimation** : ~$0.001 par conversation

### Optimisations
- Limite de 500 tokens par réponse
- Contexte limité aux 6 derniers messages
- Fallback pour réduire les appels API

## 🔧 Personnalisation

### Modifier le prompt système

Dans `src/services/api/openaiService.ts`, modifiez la variable `systemPrompt` :

```typescript
const systemPrompt = `Tu es un assistant client intelligent et professionnel pour une plateforme e-commerce. 
// Votre prompt personnalisé ici
`;
```

### Changer le modèle

```typescript
// Dans openaiService.ts
async generateSupportResponse(userMessage: string, context: string = '') {
  return this.chatCompletion(messages, 'gpt-4'); // Changer le modèle
}
```

### Ajuster les paramètres

```typescript
const response = await this.makeRequest('/chat/completions', {
  model: 'gpt-3.5-turbo',
  messages,
  max_tokens: 500,        // Longueur max de la réponse
  temperature: 0.7,      // Créativité (0-1)
  presence_penalty: 0.1,  // Éviter la répétition
  frequency_penalty: 0.1 // Éviter la répétition
});
```

## 🛡️ Sécurité

### Protection de la clé API
- **Jamais** commiter la clé API dans le code
- Utiliser les variables d'environnement
- Ajouter `.env` au `.gitignore`

### Limitation des appels
- Rate limiting automatique
- Gestion des erreurs réseau
- Fallback en cas de problème

## 📊 Monitoring

### Logs de débogage
```javascript
// Dans la console du navigateur
console.log('Réponse IA:', aiResponse);
console.log('Erreur IA:', error);
```

### Métriques utiles
- Nombre d'appels API
- Taux de succès/échec
- Temps de réponse moyen

## 🚨 Dépannage

### Erreur "Clé API non configurée"
1. Vérifiez que le fichier `.env` existe
2. Vérifiez que `VITE_OPENAI_API_KEY` est défini
3. Redémarrez le serveur de développement

### Erreur "Erreur OpenAI"
1. Vérifiez que votre clé API est valide
2. Vérifiez que vous avez des crédits sur votre compte OpenAI
3. Vérifiez votre connexion internet

### L'IA ne répond pas
1. Vérifiez la console pour les erreurs
2. Le mode fallback devrait s'activer automatiquement
3. Vérifiez que l'API OpenAI est accessible

## 🎯 Exemples d'utilisation

### Questions sur les commandes
```
Utilisateur: "Ma commande n'est pas arrivée"
IA: "Je comprends votre préoccupation. Pour vous aider à suivre votre commande, j'ai besoin du numéro de commande. Vous pouvez le trouver dans votre email de confirmation..."
```

### Questions sur les paiements
```
Utilisateur: "J'ai été débité deux fois"
IA: "Je m'excuse pour ce problème de double facturation. C'est une situation que nous prenons très au sérieux. Pouvez-vous me donner le numéro de commande concernée pour que je puisse vérifier et initier un remboursement..."
```

### Questions générales
```
Utilisateur: "Comment fonctionne votre programme de fidélité ?"
IA: "Notre programme de fidélité vous permet d'accumuler des points à chaque achat. Ces points peuvent être échangés contre des récompenses, des réductions ou des produits gratuits..."
```
