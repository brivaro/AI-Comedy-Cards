# Etapa 1: Construcción de la aplicación React
FROM node:20-alpine AS build

# Establecer el directorio de trabajo
WORKDIR /app

# Habilitar pnpm usando Corepack
RUN corepack enable

# Copiar los archivos que definen las dependencias
COPY package.json pnpm-lock.yaml ./

# CORRECCIÓN: Usamos --prod=false para forzar la instalación de devDependencies
# a pesar de que NODE_ENV=production en la imagen base.
RUN pnpm install --frozen-lockfile --prod=false

# Copiar el resto del código fuente de la aplicación
# Gracias al .dockerignore, esto no copiará node_modules ni dist
COPY . ./
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Construir la aplicación para producción
RUN pnpm run build

# Etapa 2: Servir la aplicación con Nginx
FROM nginx:1.23-alpine

# Copiar los archivos construidos desde la etapa de build
COPY --from=build /app/dist /usr/share/nginx/html

# Copia nuestro archivo de configuración personalizado de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]