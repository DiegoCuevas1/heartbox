# Use the official Node.js 18 image as a base
FROM node:18-alpine AS development

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the local code to the container
COPY . .

# Expose port 3000 to the outside world
EXPOSE 3000

# Start the Next.js development server
CMD ["npm", "run", "dev"]
