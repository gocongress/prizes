# Build
FROM localhost/microservice-build as build
ENV NODE_ENV=development
WORKDIR /app
COPY package.json tsconfig.json eslint.config.js vite.config.ts index.html ./
RUN npm install
WORKDIR /app/public
COPY public .

# Run
FROM localhost/microservice-build
WORKDIR /workspace/app/player
COPY --from=build /app /workspace/app/player
COPY /src ./src
EXPOSE 3002
WORKDIR /workspace
CMD [ "npm", "run", "dev" , "-w", "app/player" ]
