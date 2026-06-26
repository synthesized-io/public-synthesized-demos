#!/bin/bash
set -e

# Create the three required databases
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE healthcare_seed;
    CREATE DATABASE healthcare_testing;
    CREATE DATABASE healthcare_prod;
EOSQL

echo "Created databases: healthcare_seed, healthcare_testing, healthcare_prod"

# Initialize each database with schema and appropriate data
for DB in healthcare_seed healthcare_testing healthcare_prod; do
    echo "Initializing $DB database..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DB" < /docker-entrypoint-initdb.d/sql/init_healthcare_db.sql
    if [ "$DB" = "healthcare_seed" ] || [ "$DB" = "healthcare_testing" ]; then
        psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DB" < /docker-entrypoint-initdb.d/sql/seed_healthcare_db.sql
    fi
done

echo "Database initialization completed"
