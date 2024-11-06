

# Update packages and install Tesseract
apt-get update && apt-get install -y tesseract-ocr

# Run any additional build steps if needed
# e.g., Django migrations or static file collection
python manage.py migrate
python manage.py collectstatic --noinput
