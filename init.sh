# 引数受け取り
DOCKER_FILE_SPACE=$1/Containers
cd $DOCKER_FILE_SPACE/c1 && docker build -t rin/c1 .
cd $DOCKER_FILE_SPACE/c2 && docker build -t rin/c2 .
cd $DOCKER_FILE_SPACE/c3 && docker build -t rin/c3 .
cd $DOCKER_FILE_SPACE/c5 && docker build -t rin/c5 .
cd $DOCKER_FILE_SPACE/c6 && docker build -t rin/c6 .
cd $DOCKER_FILE_SPACE/c7 && docker build -t rin/c7 .
