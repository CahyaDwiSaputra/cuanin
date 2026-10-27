FROM node:20-alpine

WORKDIR /app

# Install dependencies first for layer caching
COPY package*.json ./
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Expose server port
EXPOSE 4000

ENV PORT=4000 \
    NODE_ENV=production

CMD ["node", "src/server.js"]
