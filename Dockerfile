FROM node:14-alpine AS compilation

#Working directory
WORKDIR /temp/compilation

COPY . .

#SECOND DOT IS THE WORKING DIRECTORY or destination
#1ST DOT REFERES TO THE DIRECTORY RELATIVE TO THE DOCKER FILE/source directory

RUN yarn
RUN yarn tsc

FROM node:14-alpine AS build

WORKDIR /temp/build

COPY . .

RUN yarn --production

FROM node:14-alpine AS production

ENV NODE_ENV production

WORKDIR /app


COPY --from=compilation /temp/compilation/dist dist
COPY --from=build /temp/build/node_modules node_modules

COPY bin bin
COPY public public
COPY views views
COPY package.json package.json

EXPOSE 3000

CMD ["yarn", "start"]

