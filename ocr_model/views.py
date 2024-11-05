from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.http import JsonResponse
import json
from django.views.decorators.http import require_http_methods
import pytesseract

def homePage(request):
    return render(request, "main.html")

def OCR_model(inp_img):
    ocr_result = pytesseract.image_to_string(inp_img)
    return ocr_result

import requests
from PIL import Image
from io import BytesIO

import base64
import requests
from PIL import Image
from io import BytesIO

@require_http_methods(['POST'])
def OCR_build(request):
    data = json.loads(request.body)
    image_urls = data.get('image_urls', [])
    result = ''
    for url in image_urls:
        if url.startswith('data:image/jpeg;base64,'):
            # Decode the base64 encoded image data
            image_data = base64.b64decode(url.split(',')[1])
            # Save the image data to a file
            with open('image.jpg', 'wb') as f:
                f.write(image_data)
            # Use the file path as the URL for the requests.get() function
            img = Image.open('image.jpg')
            result += pytesseract.image_to_string(img)
        else:
            response = requests.get(url)
            img = Image.open(BytesIO(response.content))
            result += pytesseract.image_to_string(img)
    return JsonResponse({'text': result})
    