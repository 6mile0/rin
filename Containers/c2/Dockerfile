FROM ubuntu:22.04

RUN apt-get update && apt-get install -y build-essential
RUN echo '#!/bin/bash\nexec /bin/bash -l -c "$*"' > /entrypoint.sh && \
    chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["cd /run", "&&", "g++ -o /tmp/main.out main.c", "&&", "cd /tmp", "&&", "./main.out", "<", "/run/input.txt"]
