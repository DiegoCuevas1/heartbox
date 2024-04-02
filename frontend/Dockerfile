# Use the official Node.js image as a base image
FROM node:18.17-alpine

# Set the working directory in the container
WORKDIR /frontend

# Copy package.json and package-lock.json (if present) to /app
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to /app
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Run the app
CMD ["npm", "start"]
