from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.http import JsonResponse
import json
from django.views.decorators.http import require_http_methods
import pytesseract

pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'


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
    try:
        data = json.loads(request.body)
        image_urls = data.get('image_urls', [])
        result = ''
        
        for url in image_urls:
            if url.startswith('data:image/jpeg;base64,'):
                # Decode the base64 encoded image data
                image_data = base64.b64decode(url.split(',')[1])
                img = Image.open(BytesIO(image_data))
            else:
                response = requests.get(url)
                response.raise_for_status()  # Check if the request was successful
                img = Image.open(BytesIO(response.content))

            result += pytesseract.image_to_string(img)
        
        return JsonResponse({'text': result})
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
