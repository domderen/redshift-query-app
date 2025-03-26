FROM python:3.9-slim

WORKDIR /app

# Install dependencies
RUN apt-get update && \
    apt-get install -y wget && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install boto3 for S3 operations
RUN pip install --no-cache-dir boto3 pillow

# Copy initialization script and Python script
COPY init-minio.sh /app/
COPY upload-sample-images.py /app/

# Make script executable
RUN chmod +x /app/init-minio.sh

CMD ["/app/init-minio.sh"]
