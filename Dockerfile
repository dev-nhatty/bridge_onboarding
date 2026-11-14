FROM node:20-slim
WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages ./packages
RUN npm install && npm run build

ENV NODE_ENV=production \
    PORT=3000 \
    DB_PATH=/data/bridge.db
VOLUME /data
EXPOSE 3000
CMD ["npm", "start"]
