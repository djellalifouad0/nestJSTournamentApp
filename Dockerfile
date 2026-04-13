# Stage 1: base
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: development
FROM base AS dev
COPY . .
CMD ["npm", "run", "start:dev"]

# Stage 3: build
FROM base AS build
COPY . .
RUN npm run build

# Stage 4: production
FROM node:20-alpine AS prod
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
EXPOSE 3000
CMD ["node", "dist/main.js"]
