// script.js

// Element references
const fileInput = document.getElementById("fileUpload");
const uploadButton = document.getElementById("uploadButton");
const showHideButton = document.getElementById("showHideButton");
const removeOneButton = document.getElementById("removeOneButton");
const removeAllButton = document.getElementById("removeAllButton");
const output = document.getElementById("output");
const uploadedImages = document.getElementById("uploadedImages");
const extractedText = document.getElementById("extractedText");

// Array to store image data URLs
let uploadedImageUrls = [];

// Upload Button Event Listener
uploadButton.addEventListener("click", async () => {
    let files = fileInput.files;

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

// Show/Hide Button Event Listener
showHideButton.addEventListener("click", () => {
    if (uploadedImages.style.display === "none") {
        uploadedImages.style.display = "block";
        showHideButton.textContent = "Hide Uploaded Images";
    } else {
        uploadedImages.style.display = "none";
        showHideButton.textContent = "Show Uploaded Images";
    }
});

// Remove Last Image Button Event Listener
removeOneButton.addEventListener("click", () => {
    if (uploadedImages.children.length > 0) {
        uploadedImages.removeChild(uploadedImages.lastChild);
        uploadedImageUrls.pop();
    }
});

// Remove All Images Button Event Listener
removeAllButton.addEventListener("click", () => {
    uploadedImages.innerHTML = "";
    uploadedImageUrls = [];
});

// Night Mode Toggle
const nightModeToggle = document.getElementById("nightModeToggle");
const nightModeIcon = document.getElementById("nightModeIcon");

let isNightMode = false;

nightModeToggle.addEventListener("click", () => {
    isNightMode = !isNightMode;
    document.body.classList.toggle("night-mode", isNightMode);
    nightModeIcon.classList.toggle("fa-moon", isNightMode);
    nightModeIcon.classList.toggle("fa-sun", !isNightMode);
});

// OCR Find Text Button Event Listener
const findButton = document.getElementById("findButton");

findButton.addEventListener("click", async () => {
  try {
    const response = await fetch('/build/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken, // CSRF token added here
      },
      body: JSON.stringify({ image_urls: uploadedImageUrls }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    extractedText.value = result.text;

  } catch (error) {
    console.error('Error during fetch:', error);
    alert("An error occurred while processing the OCR request.");
  }
});
