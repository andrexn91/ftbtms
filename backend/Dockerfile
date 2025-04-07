# Usa l'immagine di Node.js
FROM node:16-alpine

# Imposta la directory di lavoro nel container
WORKDIR /app

# Copia il package.json e package-lock.json per installare le dipendenze
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia tutto il resto del codice del backend
COPY . .

# Esponi la porta su cui il server girerà (modifica se necessario)
EXPOSE 3000

# Avvia il server
CMD ["node", "server.js"]
