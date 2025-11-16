import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# --- INICIO DE CAMBIOS ---
# 1. Añadir el path de tu app para que Alembic pueda encontrar los modelos
import sys
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), '..')))

# 2. Importar tu Base declarativa y la configuración de la app
from app.db.database import Base
from app.core.config import settings
from app.db import models
# --- FIN DE CAMBIOS ---


# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# --- INICIO DE CAMBIOS ---
# 3. Configurar la URL de la base de datos desde tus settings, no desde alembic.ini
# Esto asegura que Alembic y tu App usen SIEMPRE la misma base de datos.
config.set_main_option('sqlalchemy.url', settings.DATABASE_URL)
# --- FIN DE CAMBIOS ---

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
# --- INICIO DE CAMBIOS ---
# 4. Apuntar target_metadata a los metadatos de tu Base.
# ¡Este es el paso clave para que la autogeneración funcione!
target_metadata = Base.metadata
# --- FIN DE CAMBIOS ---

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
