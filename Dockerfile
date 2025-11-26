FROM docker.io/node:22-slim
ENV NODE_ENV=development
WORKDIR /workspace
COPY package.json package-lock.json tsconfig.json ./
RUN npm install

