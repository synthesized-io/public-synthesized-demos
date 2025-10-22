#!/bin/bash
set -e

# Create the three required databases
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE bank_seed;
    CREATE DATABASE bank_testing;
    CREATE DATABASE bank_prod;
EOSQL

echo "Created databases: bank_seed, bank_testing, bank_prod"

# Initialize each database with schema and appropriate data
for DB in bank_seed bank_testing bank_prod; do
    echo "Initializing $DB database..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DB" < /docker-entrypoint-initdb.d/sql/init_bank_db.sql
    if [ "$DB" = "bank_seed" ]; then
        psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DB" < /docker-entrypoint-initdb.d/sql/seed_bank_db.sql
    elif [ "$DB" = "bank_prod" ]; then
        psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DB" < /docker-entrypoint-initdb.d/sql/prod_bank_db.sql
    fi
done

echo "Database initialization completed"