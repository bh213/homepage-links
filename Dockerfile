FROM node:7

RUN apt-get update && apt-get install -y supervisor python-pip
RUN pip install supervisor-stdout

ADD . /app
RUN chmod 700 /app/bin/www
WORKDIR /app
RUN npm install



EXPOSE 8080
VOLUME /app/config
RUN mkdir -p /var/log/supervisor/ /var/run/supervisor

COPY ./docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

ENTRYPOINT ["/usr/bin/supervisord"]