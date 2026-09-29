# Etapa 1: Build de la app React
FROM node:20-alpine AS build
WORKDIR /app

# Copiamos manifiestos de dependencias
COPY package*.json ./

# Instalamos dependencias forzando los binarios opcionales para Alpine
RUN npm install --include=optional

# Copiamos el resto del código fuente (ignorando node_modules gracias a .dockerignore)
COPY . .

# Compilamos la aplicación
RUN npx vite build

# Etapa 2: Servidor Nginx para archivos estáticos
FROM nginx:alpine AS final
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]