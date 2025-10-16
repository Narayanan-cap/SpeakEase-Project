FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install dotenv dd-trace

COPY . .

EXPOSE 3000

CMD ["npm", "start"]