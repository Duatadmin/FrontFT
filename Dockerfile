FROM node:20-alpine as build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy app source
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:stable-alpine as production
COPY --from=build /app/dist /usr/share/nginx/html
# Remove default nginx configs to prevent conflicts
RUN rm -f /etc/nginx/conf.d/default.conf
RUN rm -f /etc/nginx/nginx.conf

# Copy our nginx configurations
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx.main.conf /etc/nginx/nginx.conf

# Default value for NGINX worker processes (can be overridden in Railway dashboard)
ENV NGINX_WORKER_PROCESSES=1

# Substitute environment variables in the nginx configuration files
RUN envsubst '${NGINX_WORKER_PROCESSES}' < /etc/nginx/nginx.conf > /etc/nginx/nginx.conf.subst && \
    mv /etc/nginx/nginx.conf.subst /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
