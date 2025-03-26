FROM node:16-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

# We don't copy the code here as we'll mount it as a volume

EXPOSE 3000

# Run in development mode with hot reloading
CMD ["npm", "start"]
