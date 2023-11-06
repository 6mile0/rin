FROM ubuntu:22.04

RUN apt-get update && apt-get -y upgrade
RUN apt-get install -y curl wget

RUN echo '#!/bin/bash\nexec /bin/bash -l -c "$*"' > /entrypoint.sh && \
    chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["cd /run", "&&", "cp main.sh /tmp/main.sh", "&&", "sh /tmp/main.sh"]
