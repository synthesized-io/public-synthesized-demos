# Multi-stage Docker build for React application
FROM node:18-alpine AS build
WORKDIR /app

# Accept build arguments for environment variables
ARG REACT_APP_BACKEND_URL
ARG REACT_APP_FRONTEND_URL

# Set environment variables for the build
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ENV REACT_APP_FRONTEND_URL=$REACT_APP_FRONTEND_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Runtime stage with nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built React app from build stage
COPY --from=build /app/build .

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
ENTRYPOINT ["nginx", "-g", "daemon off;"]