from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
import pytesseract
from PIL import Image
from io import BytesIO
import base64
import requests
import json
import os

# Set Tesseract command path if not in PATH
tesseract_path = os.environ.get('TESSERACT_PATH', '/usr/bin/tesseract')  # Replace with actual path
pytesseract.pytesseract.tesseract_cmd = tesseract_path

def OCR_model(inp_img):
    try:
        ocr_result = pytesseract.image_to_string(inp_img)
        return ocr_result
    except Exception as e:
        print(f"Error during OCR: {e}")
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
                # Handle base64 encoded images or URL-based images
                if url.startswith('data:image/jpeg;base64,') or url.startswith('data:image/png;base64,'):
                    # Decode the base64 image data
                    image_data = base64.b64decode(url.split(',')[1])
                    img = Image.open(BytesIO(image_data))
                else:
                    # Fetch the image from the URL
                    response = requests.get(url)
                    response.raise_for_status()
                    img = Image.open(BytesIO(response.content))
                
                # Perform OCR
                ocr_text = OCR_model(img)
                if ocr_text:
                    ocr_results.append(ocr_text)
                else:
                    ocr_results.append(f"Failed to process image: {url}")
            except Exception as img_error:
                # Log image-specific errors
                print(f"Error processing image {url}: {img_error}")
                ocr_results.append(f"Error processing image: {img_error}")

        # Return the OCR results for all images as a JSON response
        return JsonResponse({'text': ocr_results})

    except Exception as e:
        # Log unexpected errors and return proper response
        print(f"Unexpected error: {e}")
        return JsonResponse({'error': f"An error occurred: {str(e)}"}, status=500)
