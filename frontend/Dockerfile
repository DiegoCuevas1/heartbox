# Use Node.js as base image
FROM node:latest

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the Next.js app for production
RUN npm run build

# Expose the port Next.js will run on
EXPOSE 3000

# Command to run the Next.js app in production
CMD ["npm", "start"]