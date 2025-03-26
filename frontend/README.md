# Redshift Query App - Frontend

This is the frontend for the Redshift Query Application. It provides a user interface for writing SQL queries against a Redshift database and displaying the results in a table format. The application has special handling for the `invoices` table to display images from S3.

## Features

- SQL query editor with syntax highlighting
- Execute queries against a Redshift database
- Display query results in a table format
- Special handling for `invoices` table to display S3 images
- Responsive design that works on desktop and mobile devices

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Backend API running (see the backend README for setup instructions)

## Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm start
   ```

   This will run the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Building for Production

To build the app for production, run:

```bash
npm run build
```

This will create a `build` folder with optimized production files.

## Usage

1. Enter your SQL query in the editor
2. Click "Execute Query" to run the query
3. View the results in the table below
4. For queries on the `invoices` table, images will be displayed in the `image_url` column

## Configuration

The application is configured to connect to the backend API at `http://localhost:8000`. If your backend is running on a different URL, you'll need to update the `axios.post` URL in the `App.js` file.

## Dependencies

- React
- axios (for API requests)
- react-bootstrap (for UI components)
- @monaco-editor/react (for SQL editor)
