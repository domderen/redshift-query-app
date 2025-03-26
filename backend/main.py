from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
import pandas as pd
import boto3
import os
import json
from dotenv import load_dotenv
from database import execute_query

# Load environment variables
load_dotenv()

# AWS S3 configuration
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "minio_user")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "minio_password")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
AWS_ENDPOINT_URL = os.getenv("AWS_ENDPOINT_URL", "http://minio:9000")
S3_BUCKET = os.getenv("S3_BUCKET", "redshift-app-bucket")

# Initialize S3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION,
    endpoint_url=AWS_ENDPOINT_URL,
    # For local MinIO, we need to disable these checks
    verify=False,
    config=boto3.session.Config(signature_version='s3v4')
)

app = FastAPI(title="Redshift Query API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str

class FeatureUpdateRequest(BaseModel):
    approvable_id: int
    features: Dict[str, Any]

@app.get("/")
async def root():
    return {"message": "Redshift Query API is running"}

@app.post("/update-features")
async def update_features(request: FeatureUpdateRequest):
    try:
        # Check if the approvable exists
        check_query = f"SELECT id FROM invoices WHERE id = {request.approvable_id}"
        result = execute_query(check_query)
        
        if result.empty:
            raise HTTPException(status_code=404, detail=f"Approvable with ID {request.approvable_id} not found")
        
        # Convert features to JSON string
        features_json = json.dumps(request.features)
        
        # Check if features entry already exists
        check_features_query = f"SELECT id FROM invoices_features WHERE approvable_id = {request.approvable_id}"
        features_result = execute_query(check_features_query)
        
        if features_result.empty:
            # Insert new features
            insert_query = f"INSERT INTO invoices_features (approvable_id, features) VALUES ({request.approvable_id}, '{features_json}'::jsonb)"
            execute_query(insert_query, return_df=False)
        else:
            # Update existing features
            update_query = f"UPDATE invoices_features SET features = '{features_json}'::jsonb, updated_at = CURRENT_TIMESTAMP WHERE approvable_id = {request.approvable_id}"
            execute_query(update_query, return_df=False)
        
        return {"success": True, "message": "Features updated successfully"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/execute-query")
async def run_query(request: QueryRequest):
    try:
        # Execute the query
        df = execute_query(request.query)
        
        # Check if the query is for invoices table
        if "invoices" in request.query.lower():
            # Process the dataframe to add S3 image URLs
            df = process_invoices(df)
        
        # Convert DataFrame to JSON
        result = df.to_dict(orient="records")
        columns = df.columns.tolist()
        
        return {
            "success": True,
            "data": result,
            "columns": columns
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def process_invoices(df):
    """
    Process invoices table results to add S3 image URLs and features.
    This function assumes there's a column in the dataframe that can be used
    to construct the S3 path for the image.
    """
    # Add image URLs
    if 'image_path' in df.columns:
        # Generate presigned URLs for each image path
        df['image_url'] = df['image_path'].apply(
            lambda path: generate_presigned_url(path) if path else None
        )
    
    # Add features for each approvable item
    if 'id' in df.columns:
        # Fetch features for all approvable IDs in the result
        approvable_ids = df['id'].tolist()
        features_df = fetch_features_for_approvables(approvable_ids)
        
        # Map features to the main dataframe
        df['features'] = df['id'].apply(
            lambda id: features_df.get(id, {})
        )
    
    return df

def fetch_features_for_approvables(approvable_ids):
    """
    Fetch features for a list of approvable IDs and return as a dictionary
    mapping approvable_id to features.
    """
    if not approvable_ids:
        return {}
    
    # Construct a query to get features for all IDs
    ids_str = ','.join(str(id) for id in approvable_ids)
    query = f"SELECT approvable_id, features FROM invoices_features WHERE approvable_id IN ({ids_str})"
    
    try:
        features_df = execute_query(query)
        # Convert to dictionary mapping ID to features
        features_map = {}
        for _, row in features_df.iterrows():
            features_map[row['approvable_id']] = row['features']
        return features_map
    except Exception as e:
        print(f"Error fetching features: {e}")
        return {}

def generate_presigned_url(object_key, expiration=3600):
    """Generate a presigned URL for an S3 object."""
    try:
        response = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': S3_BUCKET,
                'Key': object_key
            },
            ExpiresIn=expiration
        )
        return response
    except Exception as e:
        print(f"Error generating presigned URL: {e}")
        return None

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
