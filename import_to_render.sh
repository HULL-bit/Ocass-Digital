#!/bin/bash
# Script pour importer la base de données dans Render

# Configuration de la base de données Render
RENDER_DB_URL="postgresql://commercial_platform_pro_user:cPS9UdVWB53U5ffKCkXXkeWCGp2Y9FWE@dpg-d4big5umcj7s73fh8nq0-a.oregon-postgres.render.com/commercial_platform_pro"

# Extraire les informations de connexion depuis l'URL
RENDER_DB_HOST="dpg-d4big5umcj7s73fh8nq0-a.oregon-postgres.render.com"
RENDER_DB_PORT="5432"
RENDER_DB_NAME="commercial_platform_pro"
RENDER_DB_USER="commercial_platform_pro_user"
RENDER_DB_PASSWORD="cPS9UdVWB53U5ffKCkXXkeWCGp2Y9FWE"

echo "=========================================="
echo "Import vers la base de données Render"
echo "=========================================="
echo "Host: $RENDER_DB_HOST"
echo "Database: $RENDER_DB_NAME"
echo ""

# Demander le fichier de dump à importer
if [ -z "$1" ]; then
    echo "Usage: $0 <fichier_dump.dump>"
    echo ""
    echo "Fichiers disponibles:"
    ls -lh commercial_platform_local_*.dump 2>/dev/null || echo "Aucun fichier .dump trouvé"
    exit 1
fi

DUMP_FILE="$1"

if [ ! -f "$DUMP_FILE" ]; then
    echo "❌ Erreur: Le fichier $DUMP_FILE n'existe pas"
    exit 1
fi

echo "📦 Fichier à importer: $DUMP_FILE"
echo ""

# Vérifier si c'est un fichier custom ou SQL
if [[ "$DUMP_FILE" == *.dump ]]; then
    echo "🔄 Import en format custom..."
    
    # Utiliser pg_restore pour les fichiers custom
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
        "$DUMP_FILE"
    
    RESTORE_STATUS=$?
else
    echo "🔄 Import en format SQL..."
    
    # Utiliser psql pour les fichiers SQL
    PGPASSWORD=$RENDER_DB_PASSWORD psql \
        --host=$RENDER_DB_HOST \
        --port=$RENDER_DB_PORT \
        --username=$RENDER_DB_USER \
        --dbname=$RENDER_DB_NAME \
        --file="$DUMP_FILE"
    
    RESTORE_STATUS=$?
fi

if [ $RESTORE_STATUS -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ Import terminé avec succès!"
    echo "=========================================="
    echo "La base de données Render a été mise à jour."
else
    echo ""
    echo "=========================================="
    echo "❌ Erreur lors de l'import"
    echo "=========================================="
    exit 1
fi

