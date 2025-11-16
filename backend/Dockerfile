FROM python:3.10-slim

WORKDIR /app

# Instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código de la aplicación
COPY ./app /app/app

# --- NUEVO: Copiar Alembic y el script de arranque ---
COPY alembic.ini .
COPY alembic /app/alembic
COPY startup.sh .
RUN chmod +x startup.sh
# --------------------------------------------------

EXPOSE 8000

# --- NUEVO: Usar el script de arranque como ENTRYPOINT ---
# El CMD ahora se pasará como argumento al startup.sh
ENTRYPOINT ["./startup.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]