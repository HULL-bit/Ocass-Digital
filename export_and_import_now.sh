#!/bin/bash
# Script pour exporter et importer immédiatement avec mot de passe en argument

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <mot_de_passe_postgres_local>"
    echo ""
    echo "Ce script va:"
    echo "1. Exporter la base de données locale"
    echo "2. Importer les données dans Render"
    exit 1
fi

LOCAL_PASSWORD="$1"
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

# Étape 1: Export
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DUMP_FILE="commercial_platform_local_${TIMESTAMP}.dump"

echo "📦 Export de la base locale..."
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
    echo "❌ Erreur lors de l'export"
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
    echo "❌ Erreur lors de l'import"
    exit 1
}

echo ""
echo "=========================================="
echo "✅ EXPORT ET IMPORT TERMINÉS AVEC SUCCÈS!"
echo "=========================================="
echo ""
echo "Fichier créé: $DUMP_FILE"
echo "Toutes les données ont été copiées vers Render!"
echo ""
echo "Vous pouvez maintenant déployer votre application sur Render."

