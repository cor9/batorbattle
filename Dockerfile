FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY server.js ./

# Expose port
EXPOSE 8181

# Set environment variables (can be overridden in App Runner)
ENV NODE_ENV=production
ENV PORT=8181

# Start server
CMD ["node", "server.js"]

