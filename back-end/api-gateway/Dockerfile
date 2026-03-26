FROM node:22.22.2-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

FROM base AS dev
EXPOSE 8080
CMD ["npm", "run", "dev"]

FROM base AS build
RUN npm run build 

FROM node:22.22.2-alpine AS prod
WORKDIR /app
COPY package*.json ./

RUN npm install --omit=dev 

COPY --from=build /app/dist ./dist

EXPOSE 8080
CMD ["npm", "run", "start"]