#!/bin/bash

# Salir inmediatamente si un comando falla
set -e

# Ejecutar las migraciones de la base de datos
echo "Running database migrations..."
alembic upgrade head

# Iniciar la aplicación principal (Uvicorn)
# exec "$@" permite pasar los argumentos del CMD del Dockerfile a este script
exec "$@"