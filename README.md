# Redshift Query Application

A web application for executing SQL queries against a Redshift database and displaying results in a table format. The application includes special handling for the `invoices` table to display images from S3.

## Project Structure

The project consists of two main components:

- **Backend**: A FastAPI application that connects to Redshift, executes SQL queries, and handles S3 image URLs
- **Frontend**: A React application that provides a SQL editor and displays query results

## Prerequisites

- Python 3.8+
- Node.js 14+
- npm 6+
- Access to a Redshift database
- AWS credentials for S3 access

## Setup and Installation

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file with your actual Redshift and AWS credentials.

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

## Running the Application

### Start the Backend

1. From the backend directory:

   ```bash
   python main.py
   ```

   Or using uvicorn directly:

   ```bash
   uvicorn main:app --reload
   ```

   The API will be available at [http://localhost:8000](http://localhost:8000)

### Start the Frontend

1. From the frontend directory:

   ```bash
   npm start
   ```

   The React app will be available at [http://localhost:3000](http://localhost:3000)

## Features

- Write and execute SQL queries against a Redshift database
- View query results in a tabular format
- Special handling for `invoices` table to display S3 images
- Modern and responsive UI built with React and Bootstrap

## Special Handling for invoices Table

When a query includes the `invoices` table, the application will automatically process the results to include S3 image URLs. The backend generates presigned URLs for S3 objects, and the frontend displays these images in the table.

## License

This project is licensed under the MIT License.
