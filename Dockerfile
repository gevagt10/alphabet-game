# Step 1: Use a lightweight Node image
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Build the React app (Tailwind CSS is compiled here)
RUN npm run build

# ----------------------------
# Step 2: Production image
FROM node:18-alpine

WORKDIR /app

# Install serve globally to serve the build folder
RUN npm install -g serve

# Copy the build folder from previous stage
COPY --from=build /app/build ./build

# Expose port
EXPOSE 8080

# Serve the app
CMD ["serve", "-s", "build", "-l", "8080"]
