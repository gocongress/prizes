# Build
FROM localhost/microservice-build AS build
ENV NODE_ENV=development
WORKDIR /app
COPY package.json tsconfig.json tsconfig.app.json tsconfig.node.json eslint.config.js vite.config.ts index.html ./
RUN npm install
WORKDIR /app/public
COPY public .

# Run
FROM localhost/microservice-build
WORKDIR /workspace/app/admin
COPY --from=build /app /workspace/app/admin
COPY /src ./src
EXPOSE 3001
WORKDIR /workspace
CMD [ "npm", "run", "dev" , "-w", "app/admin" ]
