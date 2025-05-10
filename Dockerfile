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
# Remove default nginx config to prevent conflicts
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Default value for NGINX worker processes (can be overridden in Railway dashboard)
ENV NGINX_WORKER_PROCESSES=1

# Substitute environment variables in the nginx.conf
RUN envsubst '${NGINX_WORKER_PROCESSES}' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.subst && \
    mv /etc/nginx/conf.d/default.conf.subst /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
