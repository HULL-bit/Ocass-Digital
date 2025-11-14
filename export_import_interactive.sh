#!/bin/bash
# Script interactif pour exporter et importer avec demande sécurisée du mot de passe

set -e

LOCAL_DB_NAME="BaseMeoire"
LOCAL_DB_USER="postgres"

# Configuration Render
RENDER_DB_HOST="dpg-d4big5umcj7s73fh8nq0-a.oregon-postgres.render.com"
RENDER_DB_PORT="5432"
RENDER_DB_NAME="commercial_platform_pro"
RENDER_DB_USER="commercial_platform_pro_user"
RENDER_DB_PASSWORD="cPS9UdVWB53U5ffKCkXXkeWCGp2Y9FWE"

echo "=========================================="
echo "EXPORT ET IMPORT VERS RENDER"
echo "=========================================="
echo ""

# Demander le mot de passe de manière sécurisée
read -sp "Mot de passe PostgreSQL pour $LOCAL_DB_USER: " LOCAL_PASSWORD
echo ""
echo ""

# Étape 1: Export
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DUMP_FILE="commercial_platform_local_${TIMESTAMP}.dump"

echo "📦 Export de la base locale ($LOCAL_DB_NAME)..."
PGPASSWORD=$LOCAL_PASSWORD pg_dump \
    --host=localhost \
    --port=5432 \
    --username=$LOCAL_DB_USER \
    --dbname=$LOCAL_DB_NAME \
    --format=custom \
    --no-owner \
    --no-privileges \
    --verbose \
    --file="$DUMP_FILE" 2>&1 | grep -v "password" || {
    echo ""
    echo "❌ Erreur lors de l'export"
    echo "Vérifiez que:"
    echo "  - PostgreSQL est démarré"
    echo "  - Le mot de passe est correct"
    echo "  - La base de données '$LOCAL_DB_NAME' existe"
    exit 1
}

if [ ! -f "$DUMP_FILE" ]; then
    echo "❌ Le fichier d'export n'a pas été créé"
    exit 1
fi

FILE_SIZE=$(du -h "$DUMP_FILE" | cut -f1)
echo "✅ Export réussi: $DUMP_FILE ($FILE_SIZE)"
echo ""

# Étape 2: Import
echo "🔄 Import vers Render..."
echo "   Host: $RENDER_DB_HOST"
echo "   Database: $RENDER_DB_NAME"
echo ""

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
    "$DUMP_FILE" 2>&1 | grep -v "password" || {
    echo ""
    echo "❌ Erreur lors de l'import"
    echo "Vérifiez que:"
    echo "  - La connexion à Render fonctionne"
    echo "  - La base de données Render est active"
    exit 1
}

echo ""
echo "=========================================="
echo "✅ EXPORT ET IMPORT TERMINÉS AVEC SUCCÈS!"
echo "=========================================="
echo ""
echo "Fichier de sauvegarde: $DUMP_FILE"
echo "Toutes les données ont été copiées vers Render!"
echo ""
echo "Prochaines étapes:"
echo "1. Vérifiez les données sur Render"
echo "2. Déployez votre application sur Render"
echo ""


