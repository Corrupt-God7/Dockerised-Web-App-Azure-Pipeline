# ---- Build stage ----
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first to leverage Docker layer caching
COPY app/package*.json ./
RUN npm install --omit=dev

# Copy application source
COPY app/ .

# ---- Runtime stage ----
FROM node:20-alpine AS runtime

# Run as a non-root user for better container security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app
COPY --from=build /app .

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

USER appuser

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "index.js"]
