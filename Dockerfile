FROM node:7
EXPOSE 3000
ADD . /app
RUN chmod 700 /app/bin/www
WORKDIR /app
RUN npm install

VOLUME /app/config

ENTRYPOINT /app/bin/www