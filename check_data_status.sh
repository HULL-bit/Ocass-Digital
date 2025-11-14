#!/bin/bash
# Script simple pour vérifier rapidement l'état des données

echo "=========================================="
echo "VÉRIFICATION DE L'ÉTAT DES DONNÉES"
echo "=========================================="
echo ""

# Vérifier si le mot de passe est fourni
if [ -z "$1" ]; then
    echo "Usage: $0 <mot_de_passe_postgres_local>"
    echo ""
    echo "Ou utilisez la variable d'environnement:"
    echo "  export PGPASSWORD=<mot_de_passe>"
    echo "  $0"
    exit 1
fi

LOCAL_PASSWORD="$1"

echo "📊 Comptage des enregistrements dans la base LOCALE..."
echo ""

# Tables principales à vérifier
TABLES=(
    "users_utilisateurpersonnalise"
    "products_produit"
    "sales_vente"
    "customers_client"
    "companies_entreprise"
    "inventory_stock"
)

LOCAL_TOTALS=0
for table in "${TABLES[@]}"; do
    count=$(PGPASSWORD=$LOCAL_PASSWORD psql -h localhost -U postgres -d BaseMeoire -t -c "SELECT COUNT(*) FROM \"$table\";" 2>/dev/null | xargs)
    if [ ! -z "$count" ]; then
        echo "   $table: $count"
        LOCAL_TOTALS=$((LOCAL_TOTALS + count))
    fi
done

echo ""
echo "📊 Comptage des enregistrements dans RENDER..."
echo ""

RENDER_PASSWORD="cPS9UdVWB53U5ffKCkXXkeWCGp2Y9FWE"
RENDER_TOTALS=0
for table in "${TABLES[@]}"; do
    count=$(PGPASSWORD=$RENDER_PASSWORD psql -h dpg-d4big5umcj7s73fh8nq0-a.oregon-postgres.render.com -U commercial_platform_pro_user -d commercial_platform_pro -t -c "SELECT COUNT(*) FROM \"$table\";" 2>/dev/null | xargs)
    if [ ! -z "$count" ]; then
        echo "   $table: $count"
        RENDER_TOTALS=$((RENDER_TOTALS + count))
    fi
done

echo ""
echo "=========================================="
echo "RÉSUMÉ"
echo "=========================================="
echo "Total enregistrements (LOCALE):  $LOCAL_TOTALS"
echo "Total enregistrements (RENDER):  $RENDER_TOTALS"
echo ""

if [ $LOCAL_TOTALS -gt $RENDER_TOTALS ]; then
    DIFF=$((LOCAL_TOTALS - RENDER_TOTALS))
    echo "⚠️  Il manque $DIFF enregistrements dans Render!"
    echo ""
    echo "Vous devez exporter les données:"
    echo "  ./export_local_db.sh"
    echo "  ./import_to_render.sh <fichier_dump>"
elif [ $LOCAL_TOTALS -eq $RENDER_TOTALS ]; then
    echo "✅ Les données semblent identiques!"
else
    echo "ℹ️  Render a plus de données que la base locale."
fi

