# Redshift Query Application

A web application for executing SQL queries against a Redshift database and displaying results in a table format. The application includes special handling for the `invoices` table to display images from S3.

## Project Structure

The project consists of two main components:

- **Backend**: A FastAPI application that connects to Redshift, executes SQL queries, and handles S3 image URLs
- **Frontend**: A React application that provides a SQL editor and displays query results

## Prerequisites

- Docker and Docker Compose
- Git (for cloning the repository)

## Setup and Running the Application

The entire application is containerized using Docker, making it extremely easy to set up and run.

### Quick Start

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd redshift-query-app
   ```

2. Start all services with a single command:

   ```bash
   docker compose up -d
   ```

   This command will:
   - Start a PostgreSQL database (Redshift emulator)
   - Start a MinIO server (S3 emulator)
   - Initialize the database with sample tables and data
   - Upload sample invoice images to MinIO
   - Start the FastAPI backend in development mode
   - Start the React frontend in development mode

3. Access the application:

   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8000](http://localhost:8000)
   - MinIO Console: [http://localhost:9001](http://localhost:9001) (Username: minio_user, Password: minio_password)

### Development Mode

The application runs in development mode by default, which means:

- Any changes to the backend code will automatically reload the server
- Any changes to the frontend code will be immediately reflected in the browser
- Local code is mounted as volumes in the containers

## Features

- Write and execute SQL queries against a Redshift database
- View query results in a tabular format
- Special handling for `invoices` table to display S3 images
- Modern and responsive UI built with React and Bootstrap

## Special Handling for invoices Table

When a query includes the `invoices` table, the application will automatically process the results to include S3 image URLs. The backend generates presigned URLs for S3 objects, and the frontend displays these images in the table.

## License

This project is licensed under the MIT License.
