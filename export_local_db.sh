#!/bin/bash
# Script pour exporter la base de données PostgreSQL locale

# Configuration de la base de données locale
LOCAL_DB_NAME="BaseMeoire"
LOCAL_DB_USER="postgres"
LOCAL_DB_HOST="localhost"
LOCAL_DB_PORT="5432"

# Nom du fichier de sauvegarde
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DUMP_FILE="commercial_platform_local_${TIMESTAMP}.dump"
SQL_FILE="commercial_platform_local_${TIMESTAMP}.sql"

echo "=========================================="
echo "Export de la base de données locale"
echo "=========================================="
echo "Base de données: $LOCAL_DB_NAME"
echo "Fichier de dump: $DUMP_FILE"
echo "Fichier SQL: $SQL_FILE"
echo ""

# Demander le mot de passe PostgreSQL
read -sp "Mot de passe PostgreSQL pour $LOCAL_DB_USER: " DB_PASSWORD
echo ""

# Exporter en format custom (recommandé pour PostgreSQL)
echo "📦 Export en format custom (recommandé)..."
PGPASSWORD=$DB_PASSWORD pg_dump \
    --host=$LOCAL_DB_HOST \
    --port=$LOCAL_DB_PORT \
    --username=$LOCAL_DB_USER \
    --dbname=$LOCAL_DB_NAME \
    --format=custom \
    --no-owner \
    --no-privileges \
    --verbose \
    --file="$DUMP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Export custom réussi: $DUMP_FILE"
else
    echo "❌ Erreur lors de l'export custom"
    exit 1
fi

# Exporter aussi en format SQL (pour compatibilité)
echo ""
echo "📦 Export en format SQL (compatibilité)..."
PGPASSWORD=$DB_PASSWORD pg_dump \
    --host=$LOCAL_DB_HOST \
    --port=$LOCAL_DB_PORT \
    --username=$LOCAL_DB_USER \
    --dbname=$LOCAL_DB_NAME \
    --format=plain \
    --no-owner \
    --no-privileges \
    --verbose \
    --file="$SQL_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Export SQL réussi: $SQL_FILE"
else
    echo "❌ Erreur lors de l'export SQL"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ Export terminé avec succès!"
echo "=========================================="
echo "Fichiers créés:"
echo "  - $DUMP_FILE (format custom, recommandé)"
echo "  - $SQL_FILE (format SQL)"
echo ""
echo "Vous pouvez maintenant importer ces fichiers dans Render."

