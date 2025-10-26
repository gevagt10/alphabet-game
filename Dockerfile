# ---------- Build Stage ----------
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code
COPY . .

# Build React app (Tailwind CSS is compiled here)
RUN npm run build

# ---------- Production Stage ----------
FROM node:18-alpine

WORKDIR /app

# Install serve to serve the build folder
RUN npm install -g serve

# Copy build folder from build stage
COPY --from=build /app/build ./build

# Expose port 8080
EXPOSE 8080

# Serve the React app
CMD ["serve", "-s", "build", "-l", "8080"]
