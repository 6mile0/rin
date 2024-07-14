FROM ubuntu:24.04

RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y locales \
    && sed -i -E 's/# (ja_JP.UTF-8)/\1/' /etc/locale.gen \
    && locale-gen \
    && update-locale LANG=ja_JP.UTF-8 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
ENV LC_ALL ja_JP.UTF-8
RUN apt-get update && apt-get install -y openjdk-21-jdk
RUN echo '#!/bin/bash\nexec /bin/bash -l -c "$*"' > /entrypoint.sh && \
    chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["cd /run", "&&", "javac -d /tmp Main.java", "&&", "cd /tmp" , "&&" ,"java Main", "<", "/run/input.txt"]
