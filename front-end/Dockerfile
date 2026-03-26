FROM node:22.22.2-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install -g @angular/cli@20
COPY . .

FROM base AS dev
EXPOSE 4200

CMD ["ng", "serve", "--host", "0.0.0.0", "--poll", "2000", "--disable-host-check"]

FROM base AS build
RUN ng build --configuration production

FROM nginx:alpine AS prod
RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist/front-end/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]