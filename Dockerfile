FROM node:latest as builder

COPY package*.json ./

RUN npm install --only=production && \
    npm cache clean

COPY . .

EXPOSE 8080

CMD [ "node", "app.js" ]