# Usa un'immagine nginx leggera
FROM nginx:alpine

# Copia i file del frontend nella directory di nginx per la pubblicazione
COPY . /usr/share/nginx/html

# Rimuove la configurazione di default
RUN rm /etc/nginx/conf.d/default.conf
