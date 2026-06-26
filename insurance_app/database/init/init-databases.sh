#!/bin/bash
set -e

# Create the three required databases
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE insurance_seed;
    CREATE DATABASE insurance_testing;
    CREATE DATABASE insurance_prod;
EOSQL

echo "Created databases: insurance_seed, insurance_testing, insurance_prod"

# Initialize each database with schema and appropriate data
for DB in insurance_seed insurance_testing insurance_prod; do
    echo "Initializing $DB database..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DB" < /docker-entrypoint-initdb.d/sql/init_insurance_db.sql
    if [ "$DB" = "insurance_seed" ] || [ "$DB" = "insurance_testing" ]; then
        psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DB" < /docker-entrypoint-initdb.d/sql/seed_insurance_db.sql
    fi
done

echo "Database initialization completed"
