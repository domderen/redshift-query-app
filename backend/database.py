import os
from dotenv import load_dotenv
import sqlalchemy
from sqlalchemy import create_engine
import pandas as pd

# Load environment variables
load_dotenv()

# Redshift connection parameters
REDSHIFT_HOST = os.getenv("REDSHIFT_HOST", "postgres")
REDSHIFT_PORT = os.getenv("REDSHIFT_PORT", "5432")
REDSHIFT_DATABASE = os.getenv("REDSHIFT_DATABASE", "redshift_db")
REDSHIFT_USER = os.getenv("REDSHIFT_USER", "redshift_user")
REDSHIFT_PASSWORD = os.getenv("REDSHIFT_PASSWORD", "redshift_password")

# Create connection string
connection_string = f"postgresql://{REDSHIFT_USER}:{REDSHIFT_PASSWORD}@{REDSHIFT_HOST}:{REDSHIFT_PORT}/{REDSHIFT_DATABASE}"

def get_redshift_engine():
    """Create and return a SQLAlchemy engine for Redshift connection."""
    try:
        engine = create_engine(connection_string)
        return engine
    except Exception as e:
        print(f"Error creating Redshift engine: {e}")
        raise

def execute_query(query: str, return_df=True):
    """Execute a SQL query on Redshift.
    
    Args:
        query: SQL query to execute
        return_df: If True, returns results as a pandas DataFrame. If False, executes the query without returning results.
    
    Returns:
        For SELECT queries (return_df=True): pandas DataFrame with query results
        For non-SELECT queries (return_df=False): True if successful
    """
    try:
        engine = get_redshift_engine()
        if return_df:
            # For SELECT queries
            df = pd.read_sql(query, engine)
            return df
        else:
            # For non-SELECT queries (INSERT, UPDATE, DELETE)
            with engine.begin() as connection:
                connection.execute(query)
            return True
    except Exception as e:
        print(f"Error executing query: {e}")
        raise
