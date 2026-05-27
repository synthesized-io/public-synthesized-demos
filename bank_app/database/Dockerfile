FROM postgres:15-alpine

COPY init/ /docker-entrypoint-initdb.d/
COPY sql/ /docker-entrypoint-initdb.d/sql/

RUN chmod +x /docker-entrypoint-initdb.d/*.sh
