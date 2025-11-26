# Build
FROM localhost/microservice-build AS build
WORKDIR /app
COPY package.json tsconfig.json ./
RUN npm install

# Run
FROM localhost/microservice-build
ENV NODE_ENV=development
WORKDIR /workspace/app/api
COPY --from=build /app /workspace/app/api
COPY /src ./src
EXPOSE 3001
WORKDIR /workspace
CMD [ "npm", "run", "dev", "-w", "app/api" ]
