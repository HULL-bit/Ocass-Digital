#!/bin/bash
# Script maître pour déployer sur Render
# Ce script automatise tout le processus d'export et d'import

set -e  # Arrêter en cas d'erreur

echo "=========================================="
echo "  DÉPLOIEMENT SUR RENDER - SCRIPT MAÎTRE"
echo "=========================================="
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
LOCAL_DB_NAME="BaseMeoire"
LOCAL_DB_USER="postgres"
RENDER_DB_URL="postgresql://commercial_platform_pro_user:cPS9UdVWB53U5ffKCkXXkeWCGp2Y9FWE@dpg-d4big5umcj7s73fh8nq0-a.oregon-postgres.render.com/commercial_platform_pro"

# Fonction pour afficher les messages
info() {
    echo -e "${GREEN}✓${NC} $1"
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

# Étape 1: Vérifier les prérequis
echo "📋 Vérification des prérequis..."
command -v pg_dump >/dev/null 2>&1 || error "pg_dump n'est pas installé"
command -v pg_restore >/dev/null 2>&1 || error "pg_restore n'est pas installé"
command -v psql >/dev/null 2>&1 || error "psql n'est pas installé"
info "Tous les outils PostgreSQL sont installés"

# Étape 2: Tester la connexion Render
echo ""
echo "🔌 Test de connexion à Render..."
python3 test_render_db_connection.py
if [ $? -eq 0 ]; then
    info "Connexion Render réussie"
else
    warn "Connexion Render échouée - continuons quand même..."
fi

# Étape 3: Exporter la base locale
echo ""
echo "📦 Export de la base de données locale..."
read -sp "Mot de passe PostgreSQL pour $LOCAL_DB_USER: " DB_PASSWORD
echo ""

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DUMP_FILE="commercial_platform_local_${TIMESTAMP}.dump"

PGPASSWORD=$DB_PASSWORD pg_dump \
    --host=localhost \
    --port=5432 \
    --username=$LOCAL_DB_USER \
    --dbname=$LOCAL_DB_NAME \
    --format=custom \
    --no-owner \
    --no-privileges \
    --verbose \
    --file="$DUMP_FILE" 2>&1 | grep -v "password" || error "Échec de l'export"

if [ -f "$DUMP_FILE" ]; then
    FILE_SIZE=$(du -h "$DUMP_FILE" | cut -f1)
    info "Export réussi: $DUMP_FILE ($FILE_SIZE)"
else
    error "Le fichier d'export n'a pas été créé"
fi

# Étape 4: Importer dans Render
echo ""
read -p "Voulez-vous importer maintenant dans Render? (o/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[OoYy]$ ]]; then
    echo "🔄 Import vers Render..."
    
    RENDER_DB_HOST="dpg-d4big5umcj7s73fh8nq0-a.oregon-postgres.render.com"
    RENDER_DB_PORT="5432"
    RENDER_DB_NAME="commercial_platform_pro"
    RENDER_DB_USER="commercial_platform_pro_user"
    RENDER_DB_PASSWORD="cPS9UdVWB53U5ffKCkXXkeWCGp2Y9FWE"
    
    PGPASSWORD=$RENDER_DB_PASSWORD pg_restore \
        --host=$RENDER_DB_HOST \
        --port=$RENDER_DB_PORT \
        --username=$RENDER_DB_USER \
        --dbname=$RENDER_DB_NAME \
        --clean \
        --if-exists \
        --no-owner \
        --no-privileges \
        --verbose \
        "$DUMP_FILE" 2>&1 | grep -v "password" || error "Échec de l'import"
    
    info "Import réussi dans Render!"
else
    warn "Import ignoré. Vous pouvez l'importer plus tard avec:"
    echo "   ./import_to_render.sh $DUMP_FILE"
fi

# Résumé
echo ""
echo "=========================================="
echo "  ✅ PROCESSUS TERMINÉ"
echo "=========================================="
echo ""
echo "Fichier créé: $DUMP_FILE"
echo ""
echo "Prochaines étapes:"
echo "1. Vérifiez que les données sont bien dans Render"
echo "2. Déployez votre application sur Render"
echo "3. Configurez les variables d'environnement"
echo ""
echo "Consultez GUIDE_DEPLOIEMENT_RENDER.md pour plus de détails"

