# ---- Stage 1: Build Next.js ----
FROM node:20-alpine AS node-builder

WORKDIR /app/web

COPY services/web/package*.json ./
RUN npm ci

COPY services/web/ .
RUN npm run build


# ---- Final Stage: Node + Python ----
FROM node:20-slim

WORKDIR /app

# Install Python
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Copy built Next.js app
COPY --from=node-builder /app/web /app/web
WORKDIR /app/web
RUN npm ci --omit=dev

# Setup Python service
WORKDIR /app
COPY services/python_service/requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

COPY services/python_service ./python_service

# Startup script
COPY start.sh .
RUN chmod +x start.sh

EXPOSE 3000

CMD ["./start.sh"]