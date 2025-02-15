FROM ubuntu:latest
LABEL authors="Javi"

ENTRYPOINT ["top", "-b"]

# Step 1: Set up the Node.js environment
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the Next.js app
RUN npm run build

# Step 2: Run the application
FROM node:18-alpine AS runner

WORKDIR /app

# Copy the built app from the build step
COPY --from=build /app/.next /app/.next
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]