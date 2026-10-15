# Use a Node.js base image with Alpine for a lightweight build
FROM node:20.11.0-alpine

# Set the working directory in the container
WORKDIR /ticket-tracker

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm i

# Copy the rest of the application files 
COPY . .

# Compile TypeScript (if needed)
RUN npx tsc


# Start the application
CMD npm run dev