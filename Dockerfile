# Use a Python base image
FROM python:3.8-slim

# Install Tesseract OCR (for OCR functionality)
RUN apt-get update && apt-get install -y tesseract-ocr

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements.txt file into the container
COPY requirements.txt .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application files into the container
COPY . .

# Expose the port your app will run on (adjust if your app uses a different port)
EXPOSE 8000

# Command to run your app using app.py (if your app is a Flask or other Python app)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
