FROM node:18-alpine
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm install

# Copy all source code
COPY . .

# Build React app
RUN npm run build

# Install serve to serve static files
RUN npm install -g serve

CMD ["serve", "-s", "build", "-l", "8080"]
