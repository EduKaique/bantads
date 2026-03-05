FROM node:22.22-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install 

RUN npm install -g @angular/cli@20

COPY . .

EXPOSE 4200

CMD ["ng", "serve", "--host", "0.0.0.0", "--poll", "2000", "--disable-host-check"]