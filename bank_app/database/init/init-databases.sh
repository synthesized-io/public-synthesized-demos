#!/bin/bash
set -e

BANK_DB_USER="${BANK_DB_USER:-$POSTGRES_USER}"
BANK_DB_PASSWORD="${BANK_DB_PASSWORD:-$POSTGRES_PASSWORD}"
BANK_DB_NAME="${POSTGRES_DB:-bank}"
BANK_DB_LAYOUT="${BANK_DB_LAYOUT:-schemas}"

# Create the runtime user when it is different from the bootstrap Postgres user.
if [ "$BANK_DB_USER" != "$POSTGRES_USER" ]; then
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
        --set=bank_db_user="$BANK_DB_USER" \
        --set=bank_db_password="$BANK_DB_PASSWORD" <<-'EOSQL'
            CREATE ROLE :"bank_db_user" WITH LOGIN PASSWORD :'bank_db_password';
EOSQL
    echo "Created runtime database user: $BANK_DB_USER"
fi

echo "Using database: $BANK_DB_NAME"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$BANK_DB_NAME" \
    --set=bank_db_name="$BANK_DB_NAME" \
    --set=bank_db_user="$BANK_DB_USER" <<-'EOSQL'
        GRANT CONNECT ON DATABASE :"bank_db_name" TO :"bank_db_user";
        GRANT CREATE ON DATABASE :"bank_db_name" TO :"bank_db_user";
EOSQL

load_schema_sql() {
    local database_name="$1"
    local schema_name="$2"
    local sql_file="$3"

    sed \
        -e "s/CREATE SCHEMA IF NOT EXISTS bank/CREATE SCHEMA IF NOT EXISTS ${schema_name}/g" \
        -e "s/\\bbank\\./${schema_name}./g" \
        "$sql_file" | psql -v ON_ERROR_STOP=1 --username "$BANK_DB_USER" --dbname "$database_name"
}

create_runtime_database() {
    local database_name="$1"

    if ! psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '${database_name}'" | grep -q 1; then
        createdb --username "$POSTGRES_USER" --owner "$BANK_DB_USER" "$database_name"
    fi

    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$database_name" \
        --set=db_name="$database_name" \
        --set=bank_db_user="$BANK_DB_USER" <<-'EOSQL'
            GRANT CONNECT ON DATABASE :"db_name" TO :"bank_db_user";
            GRANT CREATE ON DATABASE :"db_name" TO :"bank_db_user";
EOSQL
}

if [ "$BANK_DB_LAYOUT" = "databases" ]; then
    for DB_NAME in small testing prod; do
        echo "Initializing $DB_NAME database..."
        create_runtime_database "$DB_NAME"
        load_schema_sql "$DB_NAME" public /docker-entrypoint-initdb.d/sql/init_bank_db.sql
        if [ "$DB_NAME" = "small" ]; then
            load_schema_sql "$DB_NAME" public /docker-entrypoint-initdb.d/sql/seed_bank_db.sql
        elif [ "$DB_NAME" = "prod" ]; then
            load_schema_sql "$DB_NAME" public /docker-entrypoint-initdb.d/sql/prod_bank_db.sql
        fi
    done

    echo "Database initialization completed"
    exit 0
fi

load_schema_sql_legacy() {
    local schema_name="$1"
    local sql_file="$2"

    sed \
        -e "s/CREATE SCHEMA IF NOT EXISTS bank/CREATE SCHEMA IF NOT EXISTS ${schema_name}/g" \
        -e "s/\\bbank\\./${schema_name}./g" \
        "$sql_file" | psql -v ON_ERROR_STOP=1 --username "$BANK_DB_USER" --dbname "$BANK_DB_NAME"
}

# Initialize each schema with appropriate data.
for SCHEMA in seed testing prod; do
    echo "Initializing $SCHEMA schema..."
    load_schema_sql_legacy "$SCHEMA" /docker-entrypoint-initdb.d/sql/init_bank_db.sql
    if [ "$SCHEMA" = "seed" ]; then
        load_schema_sql_legacy "$SCHEMA" /docker-entrypoint-initdb.d/sql/seed_bank_db.sql
    elif [ "$SCHEMA" = "prod" ]; then
        load_schema_sql_legacy "$SCHEMA" /docker-entrypoint-initdb.d/sql/prod_bank_db.sql
    fi

done

echo "Database initialization completed"
