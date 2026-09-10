# Multi-stage Bun production image for high-concurrency WebSocket server
FROM oven/bun:latest AS base
WORKDIR /app

# Install production dependencies
COPY package.json bun.lock ./
RUN bun install --production

# Copy server code
COPY server.ts ./

# Expose server port
ENV PORT=3001
EXPOSE 3001

# Start the high-performance WebSocket server
CMD ["bun", "run", "server.ts"]
