#!/bin/bash
set -e

# Wait for MinIO to be ready
echo "Waiting for MinIO to be ready..."
sleep 5

# Install MinIO client
echo "Installing MinIO client..."
wget https://dl.min.io/client/mc/release/linux-amd64/mc -O /usr/local/bin/mc
chmod +x /usr/local/bin/mc

# Configure MinIO client
echo "Configuring MinIO client..."
mc alias set myminio http://minio:9000 minio_user minio_password

# Create bucket if it doesn't exist
echo "Creating bucket..."
mc mb myminio/redshift-app-bucket --ignore-existing

# Run the Python script to generate and upload invoice images
echo "Generating and uploading invoice images..."
python /app/upload-sample-images.py

echo "MinIO initialization completed successfully!"
