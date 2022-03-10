FROM node:16 AS build

WORKDIR /src

COPY package*.json ./
RUN echo nameserver 1.1.1.1 > /etc/resolv.conf && \
    npm install

COPY . ./
RUN npm run build

FROM nginx:1.20 AS run

COPY docker-entrypoint.d/ /docker-entrypoint.d/
RUN rm /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
RUN chmod +x /docker-entrypoint.d/*.sh
COPY --from=build /src/dist/ /usr/share/nginx/html/
