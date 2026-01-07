# Use LTS version
FROM node:lts-alpine as build

WORKDIR /app

# Copy package definition files
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx config for Cloud Run (Must listen on port 8080)
RUN echo 'server { \
    listen 8080; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Modify main nginx.conf to run as non-root (optional but good for security, though not strictly required for port 8080 binding if root)
# For simplicity, we just expose 8080 which is what Cloud Run expects by default.
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
