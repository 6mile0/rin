FROM ubuntu:22.04

RUN apt-get update && apt-get upgrade -y
RUN apt-get install sqlite3 -y

RUN echo '#!/bin/bash\nexec /bin/bash -l -c "$*"' > /entrypoint.sh && \
    chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["cd /run", "&&", "sqlite3 /tmp/main.sqlite3 < main.sql", "&&", "sqlite3 /tmp/main.sqlite3"]
