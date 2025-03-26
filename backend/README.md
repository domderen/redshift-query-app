# Redshift Query App - Backend

This is the backend service for the Redshift Query Application. It provides an API to execute SQL queries against a Redshift database and handle special processing for the `invoices` table to include S3 image URLs.

## Setup

1. Create a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables:

   ```bash
   cp .env.example .env
   ```
   Then edit the `.env` file with your actual Redshift and AWS credentials.

## Running the Application

Start the FastAPI server:

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload
```

The API will be available at [http://localhost:8000](http://localhost:8000)

## API Endpoints

- `GET /`: Health check endpoint
- `POST /execute-query`: Execute a SQL query against Redshift
  - Request body: `{ "query": "SELECT * FROM your_table" }`
  - Response: JSON with query results

## Special Handling for invoices Table

When a query includes the `invoices` table, the API will automatically process the results to include S3 image URLs based on the `image_path` column in the table.
