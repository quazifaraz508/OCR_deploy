const fileInput = document.getElementById("fileUpload");
const uploadButton = document.getElementById("uploadButton");
const showHideButton = document.getElementById("showHideButton");
const removeOneButton = document.getElementById("removeOneButton");
const removeAllButton = document.getElementById("removeAllButton");
const output = document.getElementById("output");
const uploadedImages = document.getElementById("uploadedImages");
const extractedText = document.getElementById("extractedText");
const nightModeToggle = document.getElementById("nightModeToggle");
const nightModeIcon = document.getElementById("nightModeIcon");
const findButton = document.getElementById("findButton");

// Getting CSRF token from the hidden input
const csrftoken = document.getElementById('csrf_token').value;

let uploadedImageUrls = [];
let isNightMode = false;

// Upload button handler
uploadButton.addEventListener("click", async () => {
    const files = fileInput.files;
    if (files.length === 0) {
        alert("Please select at least one image.");
        return;
    }
    for (let file of files) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageDataUrl = e.target.result;
            uploadedImageUrls.push(imageDataUrl);
            const img = document.createElement("img");
            img.src = imageDataUrl;
            uploadedImages.appendChild(img);
            uploadedImages.scrollTop = uploadedImages.scrollHeight;
        };
        reader.onerror = (err) => {
            console.error("Error reading file:", err);
            alert("An error occurred while reading the file.");
        };
        reader.readAsDataURL(file);
    }
});

// Show/Hide button handler
showHideButton.addEventListener("click", () => {
    if (uploadedImages.style.display === "none") {
        uploadedImages.style.display = "block";
        showHideButton.textContent = "Hide Uploaded Images";
    } else {
        uploadedImages.style.display = "none";
        showHideButton.textContent = "Show Uploaded Images";
    }
});

// Remove one button handler
removeOneButton.addEventListener("click", () => {
    if (uploadedImages.children.length > 0) {
        uploadedImages.removeChild(uploadedImages.lastChild);
        uploadedImageUrls.pop();
    }
});

// Remove all button handler
removeAllButton.addEventListener("click", () => {
    uploadedImages.innerHTML = "";
    uploadedImageUrls = [];
});

// Night mode toggle
nightModeToggle.addEventListener("click", () => {
    isNightMode = !isNightMode;
    document.body.classList.toggle("night-mode", isNightMode);
    nightModeIcon.classList.toggle("fa-moon", isNightMode);
    nightModeIcon.classList.toggle("fa-sun", !isNightMode);
});

// Find button handler for OCR
findButton.addEventListener("click", async () => {
    extractedText.value = ""; // Clear previous results

    if (uploadedImageUrls.length === 0) {
        alert("No images uploaded!");
        return; // Prevent fetch if no images
    }

    try {
        const response = await fetch('/build/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify({ image_urls: uploadedImageUrls }),
        });

        const result = await response.json();
        if (result.text) {
            // Display each OCR result in the textarea
            result.text.forEach((text, index) => {
                extractedText.value += `Image ${index + 1}:\n${text}\n\n`;
            });
        } else if (result.error) {
            console.error("OCR processing error:", result.error);
            alert("An error occurred while processing the images.");
        }
    } catch (error) {
        console.error("Error in fetch:", error);
        alert("An error occurred while fetching OCR results.");
    }
});
