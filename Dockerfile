# Menggunakan base image yang sudah include puppeteer & chromium
FROM ghcr.io/puppeteer/puppeteer:latest

USER root

# Memperbaiki sintaks instalasi package (Python, Make, G++ untuk build bcrypt/scrypt)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Salin package.json lebih dulu agar build lebih cepat (caching)
COPY package*.json ./

# Install semua dependensi
RUN npm install

# Salin semua source code
COPY . .

# Build project (TypeScript ke JavaScript)
RUN npm run build

# Pastikan folder session WhatsApp bisa ditulisi
RUN mkdir -p .wwebjs_auth && chmod -R 777 .wwebjs_auth

# Jalankan aplikasi
CMD ["node", "dist/index.js"]