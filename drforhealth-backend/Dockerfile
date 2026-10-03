FROM node:20-alpine

# Application directory
WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy backend application
COPY . .

# Backend port
EXPOSE 5000

# Production environment
ENV application_name=drforhealth_b

# Start application
CMD ["node", "server.js"]