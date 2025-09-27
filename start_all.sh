#!/bin/bash

echo "🚀 Démarrage complet de la Plateforme Commerciale Révolutionnaire"
echo "=================================================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Vérification des prérequis...${NC}"

# Vérifier Python
if command -v python3 &> /dev/null; then
    echo -e "${GREEN}✅ Python3 disponible${NC}"
else
    echo -e "${RED}❌ Python3 non trouvé${NC}"
    exit 1
fi

# Vérifier Node.js
if command -v node &> /dev/null; then
    echo -e "${GREEN}✅ Node.js disponible${NC}"
else
    echo -e "${RED}❌ Node.js non trouvé${NC}"
    exit 1
fi

echo -e "\n${PURPLE}🔧 Configuration Backend Django...${NC}"

# Aller dans le répertoire backend
cd backend

# Installer les dépendances Python (si requirements.txt existe)
if [ -f "requirements/development.txt" ]; then
    echo -e "${YELLOW}📦 Installation des dépendances Python...${NC}"
    pip install -r requirements/development.txt
fi

# Créer les migrations
echo -e "${YELLOW}🗄️ Création des migrations...${NC}"
python manage.py makemigrations
python manage.py migrate

# Créer le superutilisateur
echo -e "${YELLOW}👑 Création du superutilisateur...${NC}"
python scripts/create_superuser.py

# Peupler la base de données
echo -e "${YELLOW}📊 Peuplement de la base de données...${NC}"
python scripts/populate_test_data.py

# Ajouter plus de données
echo -e "${YELLOW}📈 Ajout de données supplémentaires...${NC}"
python scripts/add_more_test_data.py

# Retourner à la racine
cd ..

echo -e "\n${CYAN}⚡ Configuration Frontend React...${NC}"

# Installer les dépendances Node.js
echo -e "${YELLOW}📦 Installation des dépendances Node.js...${NC}"
npm install

echo -e "\n${GREEN}🎉 Configuration terminée avec succès !${NC}"
echo -e "\n${BLUE}📋 Informations importantes:${NC}"
echo -e "${CYAN}   🌐 Backend Django: http://localhost:8000${NC}"
echo -e "${CYAN}   📚 Documentation API: http://localhost:8000/api/docs/${NC}"
echo -e "${CYAN}   🔧 Admin Django: http://localhost:8000/admin/${NC}"
echo -e "${CYAN}   ⚡ Frontend React: http://localhost:5173${NC}"

echo -e "\n${PURPLE}🔐 Comptes de test disponibles:${NC}"
echo -e "${GREEN}   👑 Admin: admin@platform.com / password${NC}"
echo -e "${GREEN}   💼 Entrepreneur 1: marie@boutiquemarie.sn / password${NC}"
echo -e "${GREEN}   💼 Entrepreneur 2: amadou@techsolutions.sn / password${NC}"
echo -e "${GREEN}   💼 Entrepreneur 3: fatou@pharmaciemoderne.sn / password${NC}"
echo -e "${GREEN}   🛍️ Client 1: client1@example.com / password${NC}"
echo -e "${GREEN}   🛍️ Client 2: client2@example.com / password${NC}"
echo -e "${GREEN}   🛍️ Client 3: client3@example.com / password${NC}"

echo -e "\n${YELLOW}🚀 Pour démarrer les services:${NC}"
echo -e "${CYAN}   Backend: cd backend && python manage.py runserver${NC}"
echo -e "${CYAN}   Frontend: npm run dev${NC}"

echo -e "\n${GREEN}🎯 La Plateforme Commerciale Révolutionnaire est prête !${NC}"