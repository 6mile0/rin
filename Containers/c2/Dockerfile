FROM ubuntu:22.04

RUN apt-get update && apt-get install -y build-essential
RUN echo '#!/bin/bash\nexec /bin/bash -l -c "$*"' > /entrypoint.sh && \
    chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["cd /run", "&&", "g++ -o main.out main.c", "&&", "./main.out", "<", "input.txt"]