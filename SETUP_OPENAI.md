# 🚀 Configuration de l'IA OpenAI - Guide Rapide

## ⚡ Configuration Rapide

### 1. Créer le fichier `.env`

Créez un fichier `.env` à la racine du projet avec ce contenu :

```env
# Configuration OpenAI
VITE_OPENAI_API_KEY=sk-your-api-key-here

# Configuration API Backend
VITE_API_BASE_URL=http://localhost:8000/api

# Configuration WebSocket
VITE_WS_URL=ws://localhost:8000/ws
```

### 2. Obtenir une clé API OpenAI

1. **Allez sur** [OpenAI Platform](https://platform.openai.com/)
2. **Créez un compte** ou connectez-vous
3. **Allez dans** "API Keys" dans le menu
4. **Cliquez sur** "Create new secret key"
5. **Copiez la clé** (elle commence par `sk-`)
6. **Remplacez** `sk-your-api-key-here` par votre vraie clé

### 3. Redémarrer le serveur

```bash
npm run dev
```

## 🔧 Mode de Fonctionnement

### ✅ Avec IA (Recommandé)
- Réponses intelligentes et contextuelles
- Comprend le contexte de la conversation
- Propose des actions appropriées
- Coût : ~$0.001 par conversation

### 🔄 Sans IA (Fallback)
- Réponses prédéfinies intelligentes
- Fonctionne sans connexion internet
- Basculage automatique en cas d'erreur
- Gratuit

## 🎯 Test Rapide

1. **Ouvrez** la page Support
2. **Vérifiez** que le bouton "IA Activée" est vert
3. **Tapez** un message dans le chat
4. **Observez** la réponse intelligente de l'IA

## 🚨 Dépannage

### Erreur "Clé API non configurée"
- ✅ Vérifiez que le fichier `.env` existe
- ✅ Vérifiez que `VITE_OPENAI_API_KEY` est défini
- ✅ Redémarrez le serveur (`npm run dev`)

### L'IA ne répond pas
- ✅ Le mode fallback s'active automatiquement
- ✅ Vérifiez la console pour les erreurs
- ✅ Le chat fonctionne toujours avec les réponses prédéfinies

### Bouton "IA Désactivée"
- ✅ Cliquez sur le bouton pour réactiver
- ✅ Vérifiez votre configuration `.env`
- ✅ Redémarrez le serveur

## 💡 Conseils

- **Développement** : Utilisez le mode fallback pour tester
- **Production** : Activez l'IA pour une meilleure expérience
- **Coûts** : L'IA est optimisée pour minimiser les coûts
- **Sécurité** : Ne commitez jamais votre clé API

## 🎉 C'est tout !

Votre bot IA est maintenant configuré et prêt à répondre intelligemment aux questions des clients !
