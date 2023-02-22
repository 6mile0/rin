FROM openjdk:21-slim

RUN apt-get update
RUN echo '#!/bin/bash\nexec /bin/bash -l -c "$*"' > /entrypoint.sh && \
    chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["cd /run", "&&", "javac Main.java", "&&", "java Main", "<", "input.txt"]