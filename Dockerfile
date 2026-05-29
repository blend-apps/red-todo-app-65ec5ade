# ── Production Dockerfile ─────────────────────────────────────────────────────
# Multi-stage build: deps layer separated from source so code changes don't
# bust the npm install cache layer.
#
# Build:  docker build -t red-todo-app .
# Run:    docker run -p 3000:3000 -v $(pwd)/data:/app/data red-todo-app

FROM node:22-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:22-slim
WORKDIR /app

# Create a non-root user for security
RUN useradd -m -u 1001 appuser

# Copy deps and source
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY server.js db.js ./
COPY public/ ./public/

# Data directory (mount a volume here for persistence)
RUN mkdir -p /app/data && chown -R appuser:appuser /app
VOLUME ["/app/data"]

USER appuser

ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/app/data/todos.db

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
