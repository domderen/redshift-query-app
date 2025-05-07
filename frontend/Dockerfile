FROM node:16-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Set permissions and use node user
RUN chown -R node:node /app
USER node

# Install dependencies
RUN npm install

# We don't copy the code here as we'll mount it as a volume
EXPOSE 3000

# Run in development mode with hot reloading
CMD ["npm", "start"]
