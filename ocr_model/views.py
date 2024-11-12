from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.shortcuts import render
import pytesseract
from PIL import Image
from io import BytesIO
import base64
import requests
import json
import os
import time
import logging

# Configure logger
logger = logging.getLogger(__name__)

# Set Tesseract command path if not in PATH
tesseract_path = os.environ.get('TESSERACT_PATH', '/usr/bin/tesseract')  # Replace with actual path
pytesseract.pytesseract.tesseract_cmd = tesseract_path

# Fetch image with retries
def fetch_image(url, retries=3):
    for attempt in range(retries):
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching {url}: {e}. Retrying... ({attempt + 1}/{retries})")
            time.sleep(2)  # Wait before retrying
    return None  # Return None if all retries fail

# Render the home page
def homePage(request):
    return render(request, "main.html")

# Perform OCR on an image
def OCR_model(inp_img):
    try:
        ocr_result = pytesseract.image_to_string(inp_img)
        return ocr_result
    except Exception as e:
        logger.error(f"Error during OCR: {e}")
        return None

@require_http_methods(['POST'])
def OCR_build(request):
    try:
        # Parse the JSON request body
        data = json.loads(request.body)
        image_urls = data.get('image_urls', [])
        ocr_results = []

        for url in image_urls:
            try:
                # Check if image is base64 encoded or URL
                if url.startswith('data:image/jpeg;base64,') or url.startswith('data:image/png;base64,'):
                    image_data = base64.b64decode(url.split(',')[1])
                    img = Image.open(BytesIO(image_data))
                else:
                    # Fetch the image from URL
                    response = fetch_image(url)
                    if response is not None:
                        img = Image.open(BytesIO(response.content))
                    else:
                        ocr_results.append(f"Failed to fetch image after retries: {url}")
                        continue  # Skip to the next image if fetching fails

                # Perform OCR and add result
                ocr_text = OCR_model(img)
                if ocr_text:
                    ocr_results.append(ocr_text)
                else:
                    ocr_results.append(f"Failed to process image: {url}")

            except Exception as img_error:
                logger.error(f"Error processing image {url}: {img_error}")
                ocr_results.append(f"Error processing image: {img_error}")

        return JsonResponse({'text': ocr_results}, status=200)

    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {e}")
        return JsonResponse({'error': 'Invalid JSON request'}, status=400)

    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return JsonResponse({'error': f"An internal server error occurred: {str(e)}"}, status=500)
