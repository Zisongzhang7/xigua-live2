# Stage 1: Build frontend
FROM node:lts-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Run a single Node server (static + API)
FROM node:lts-alpine

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0
ENV SERVE_STATIC=1

# Copy server + built assets
COPY --from=build /app/dist /app/dist
COPY --from=build /app/server /app/server

# Ensure data dir exists (for prd-notes.json)
RUN mkdir -p /app/server/data

EXPOSE 8080

CMD ["node", "server/index.mjs"]
