FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./backend/
COPY frontend/package.json frontend/package-lock.json ./frontend/

RUN npm ci --prefix backend \
  && npm ci --prefix frontend

COPY . .

RUN npm run build --prefix frontend

ENV NODE_ENV=production
ENV PORT=4000
ENV DB_PATH=/data/money-book.db

EXPOSE 4000

CMD ["node", "backend/src/server.js"]
