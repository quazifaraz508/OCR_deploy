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

# Set Tesseract command path if not in PATH
tesseract_path = os.environ.get('TESSERACT_PATH', '/usr/bin/tesseract')  # Replace with actual path
pytesseract.pytesseract.tesseract_cmd = tesseract_path

def homePage(request):
    return render(request, "main.html")

def OCR_model(inp_img):
    try:
        ocr_result = pytesseract.image_to_string(inp_img)
        return ocr_result
    except Exception as e:
        print(f"Error during OCR: {e}")
        return None

# views.py
@require_http_methods(['POST'])
def OCR_build(request):
    try:
        data = json.loads(request.body)
        image_urls = data.get('image_urls', [])
        ocr_results = []

        for url in image_urls:
            try:
                if url.startswith('data:image/jpeg;base64,') or url.startswith('data:image/png;base64,'):
                    image_data = base64.b64decode(url.split(',')[1])
                    img = Image.open(BytesIO(image_data))
                else:
                    response = requests.get(url, timeout=10)  # Adjust timeout if needed
                    response.raise_for_status()
                    img = Image.open(BytesIO(response.content))

                ocr_text = OCR_model(img)
                if ocr_text:
                    ocr_results.append(ocr_text)
                else:
                    ocr_results.append(f"Failed to process image: {url}")
            except Exception as img_error:
                print(f"Error processing image {url}: {img_error}")
                ocr_results.append(f"Error processing image: {img_error}")

        return JsonResponse({'text': ocr_results}, status=200)

    except Exception as e:
        print(f"Unexpected error: {e}")
        return JsonResponse({'error': f"An error occurred: {str(e)}"}, status=500)
