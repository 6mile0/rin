FROM node:lts-slim

# アップデート及びなでしこ3のインストール
RUN npm update -g npm
RUN npm install -g nadesiko3

RUN echo '#!/bin/bash\nexec /bin/bash -l -c "$*"' > /entrypoint.sh && \
    chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["cd /run", "&&", "cnako3 main.nako3", "<", "input.txt"]