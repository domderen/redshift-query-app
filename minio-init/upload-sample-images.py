#!/usr/bin/env python3
import boto3
import io
import os
import random
from datetime import datetime, timedelta
from PIL import Image, ImageDraw, ImageFont

# Create a sample invoice image
def create_invoice_image(invoice_number, size=(800, 1000)):
    # Create a white background image
    img = Image.new('RGB', size, color='white')
    draw = ImageDraw.Draw(img)
    
    # Try to use a standard font, fall back to default if not available
    try:
        title_font = ImageFont.truetype('Arial', 24)
        header_font = ImageFont.truetype('Arial', 18)
        normal_font = ImageFont.truetype('Arial', 14)
    except IOError:
        title_font = ImageFont.load_default()
        header_font = ImageFont.load_default()
        normal_font = ImageFont.load_default()
    
    # Generate random invoice data
    invoice_date = datetime.now() - timedelta(days=random.randint(1, 30))
    due_date = invoice_date + timedelta(days=30)
    customer_id = f"CUST-{random.randint(1000, 9999)}"
    total_amount = random.randint(100, 5000) + random.random()
    
    # Draw invoice header
    draw.text((40, 40), "INVOICE", fill="black", font=title_font)
    draw.text((40, 80), f"Invoice #: INV-{invoice_number}", fill="black", font=header_font)
    draw.text((40, 110), f"Date: {invoice_date.strftime('%Y-%m-%d')}", fill="black", font=normal_font)
    draw.text((40, 140), f"Due Date: {due_date.strftime('%Y-%m-%d')}", fill="black", font=normal_font)
    
    # Draw customer info
    draw.text((40, 190), "Bill To:", fill="black", font=header_font)
    draw.text((40, 220), f"Customer ID: {customer_id}", fill="black", font=normal_font)
    draw.text((40, 250), f"Example Customer {invoice_number}", fill="black", font=normal_font)
    draw.text((40, 280), "123 Example Street", fill="black", font=normal_font)
    draw.text((40, 310), "Example City, EX 12345", fill="black", font=normal_font)
    
    # Draw invoice items header
    draw.line([(40, 370), (760, 370)], fill="black", width=2)
    draw.text((40, 380), "Description", fill="black", font=header_font)
    draw.text((400, 380), "Quantity", fill="black", font=header_font)
    draw.text((500, 380), "Unit Price", fill="black", font=header_font)
    draw.text((650, 380), "Amount", fill="black", font=header_font)
    draw.line([(40, 410), (760, 410)], fill="black", width=2)
    
    # Draw invoice items
    y_pos = 430
    subtotal = 0
    
    for i in range(1, 4):
        item_price = random.randint(50, 500) + random.random()
        quantity = random.randint(1, 5)
        amount = item_price * quantity
        subtotal += amount
        
        draw.text((40, y_pos), f"Product or Service {i}", fill="black", font=normal_font)
        draw.text((400, y_pos), f"{quantity}", fill="black", font=normal_font)
        draw.text((500, y_pos), f"${item_price:.2f}", fill="black", font=normal_font)
        draw.text((650, y_pos), f"${amount:.2f}", fill="black", font=normal_font)
        
        y_pos += 40
    
    # Draw totals
    draw.line([(40, y_pos + 20), (760, y_pos + 20)], fill="black", width=1)
    draw.text((500, y_pos + 40), "Subtotal:", fill="black", font=header_font)
    draw.text((650, y_pos + 40), f"${subtotal:.2f}", fill="black", font=header_font)
    
    tax = subtotal * 0.1
    draw.text((500, y_pos + 80), "Tax (10%):", fill="black", font=header_font)
    draw.text((650, y_pos + 80), f"${tax:.2f}", fill="black", font=header_font)
    
    total = subtotal + tax
    draw.text((500, y_pos + 120), "Total:", fill="black", font=title_font)
    draw.text((650, y_pos + 120), f"${total:.2f}", fill="black", font=title_font)
    
    # Draw footer
    draw.text((40, y_pos + 200), "Thank you for your business!", fill="black", font=header_font)
    
    # Add a status stamp based on invoice number
    status = ['PENDING', 'APPROVED', 'REJECTED'][invoice_number % 3]
    stamp_color = {'PENDING': 'blue', 'APPROVED': 'green', 'REJECTED': 'red'}[status]
    
    # Rotate and draw the status stamp
    draw.text((550, 200), status, fill=stamp_color, font=title_font)
    
    # Convert to bytes
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='WEBP', quality=90)
    img_byte_arr.seek(0)
    return img_byte_arr

# Connect to MinIO
s3_client = boto3.client(
    's3',
    endpoint_url=os.environ.get('AWS_ENDPOINT_URL'),
    aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
    region_name=os.environ.get('AWS_REGION')
)

bucket_name = os.environ.get('S3_BUCKET')

# Create bucket if it doesn't exist
try:
    s3_client.head_bucket(Bucket=bucket_name)
    print(f"Bucket '{bucket_name}' already exists")
except:
    s3_client.create_bucket(Bucket=bucket_name)
    print(f"Created bucket '{bucket_name}'")

# Create and upload sample invoice images
for i in range(1, 4):
    # Create invoice image with different status based on index
    image_data = create_invoice_image(i)
    object_key = f'product-images/photo{i}.webp'
    
    s3_client.upload_fileobj(
        image_data,
        'redshift-app-bucket',
        object_key,
        ExtraArgs={'ContentType': 'image/webp'}
    )
    print(f"Uploaded invoice {i} as {object_key}")

print("Sample invoice images uploaded successfully!")
