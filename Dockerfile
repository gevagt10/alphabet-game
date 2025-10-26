# Use Node.js Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install serve globally
COPY package.json package-lock.json ./
RUN npm install -g serve

# Copy all files
COPY . .

# Build React app
RUN npm install && npm run build

# Serve the build folder
CMD ["serve", "-s", "build", "-l", "8080"]
