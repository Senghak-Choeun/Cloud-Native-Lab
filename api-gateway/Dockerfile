FROM node:24-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY index.js ./

USER node

EXPOSE 4000

CMD ["node", "index.js"]
