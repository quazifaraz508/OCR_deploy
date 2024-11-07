# Use an official Python runtime as a parent image
FROM python:3.10

# Set the working directory in the container
WORKDIR /ocr_model

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Install Tesseract OCR
RUN apt-get update && apt-get install -y tesseract-ocr

# Copy the current directory contents into the container at /ocr_model
COPY . /ocr_model


# Run the Django server with Gunicorn
CMD ["gunicorn", "ocr_model.wsgi:application", "--bind", "0.0.0.0:8000"]
