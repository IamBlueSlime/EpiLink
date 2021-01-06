FROM node:lts as builder
WORKDIR /app

COPY ./package.json ./package-lock.json ./
RUN npm install

COPY ./tsconfig.json ./tsconfig.build.json ./nest-cli.json ./
COPY ./src ./src
RUN npm run build
RUN npm prune --production

FROM node:lts-alpine
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

CMD [ "node", "dist/main.js" ]
