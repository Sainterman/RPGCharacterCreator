FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src
RUN npm run build
RUN chown -R node:node /app
USER node
EXPOSE 3001
CMD ["node", "dist/index.js"]
