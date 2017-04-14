FROM node:7

RUN apt-get update && apt-get install -y  --no-install-recommends supervisor python-pip && \
pip install supervisor-stdout &&\ 
apt-get remove -y python-pip  && \
rm -rf /var/lib/apt/lists/*


ADD . /app
RUN chmod 700 /app/bin/www
WORKDIR /app
RUN npm install



EXPOSE 8080
VOLUME /app/config
RUN mkdir -p /var/log/supervisor/ /var/run/supervisor

COPY ./docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

ENTRYPOINT ["/usr/bin/supervisord"]