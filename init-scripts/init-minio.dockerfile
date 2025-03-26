FROM minio/mc

RUN apk add --no-cache imagemagick bash

COPY 02-init-minio.sh /usr/local/bin/init-minio.sh
RUN chmod +x /usr/local/bin/init-minio.sh

ENTRYPOINT ["/usr/local/bin/init-minio.sh"]
