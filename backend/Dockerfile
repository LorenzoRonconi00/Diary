# backend/Dockerfile - Versione semplificata (senza build)
FROM node:18-alpine

# Imposta la directory di lavoro
WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Installa solo le dipendenze di produzione
RUN npm ci --only=production

# Copia tutto il codice (incluso dist/ già compilato)
COPY . .

# Esponi la porta
EXPOSE 3000

# Comando di avvio
CMD ["npm", "start"]