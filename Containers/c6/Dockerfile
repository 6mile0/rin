FROM ubuntu:22.04

RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y mysql-server

RUN echo '#!/bin/bash\nexec /bin/bash -l -c "$*"' > /entrypoint.sh && \
    chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["mkdir /var/run/mysqld", "&&", "chown mysql:mysql /var/run/mysqld", "&&", "service mysql start", "&&", "cd /run", "&&", "mysql < main.sql"]
