FROM python:3.8-slim
RUN pip install --no-cache-dir --upgrade pip
RUN pip install numpy scipy
RUN echo '#!/bin/bash\nexec /bin/bash -l -c "$*"' > /entrypoint.sh && \
    chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["cd /run", "&&", "python", "main.py", "<", "input.txt"]