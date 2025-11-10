# Utiliser Node.js 25.1 Alpine comme image de base
FROM node:25.1-alpine

# Installer les dépendances système nécessaires pour puppeteer et sqlite3
RUN apk add --no-cache \
    chromium \
    nss \
    ca-certificates \
    ttf-freefont \
    font-noto-emoji 

# Définir les variables d'environnement pour Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances de production
RUN npm ci --only=production

# Copier le reste des fichiers de l'application
COPY . .

# Créer le répertoire pour la base de données et définir les permissions
RUN mkdir -p /app/db && \
    chown -R node:node /app

# Passer à l'utilisateur non-root
USER node

# Démarrer l'application
CMD ["node", "OPM-Stats.js"]
