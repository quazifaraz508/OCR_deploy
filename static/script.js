// script.js
const fileInput = document.getElementById("fileUpload");
const uploadButton = document.getElementById("uploadButton");
const showHideButton = document.getElementById("showHideButton");
const removeOneButton = document.getElementById("removeOneButton");
const removeAllButton = document.getElementById("removeAllButton");
const output = document.getElementById("output");
const uploadedImages = document.getElementById("uploadedImages");
const extractedText = document.getElementById("extractedText");

let uploadedImageUrls = [];

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
            uploadedImages.scrollTop = uploadedImages.scrollHeight; // Add this line
        };

        reader.onerror = (err) => {
            console.error("Error reading file:", err);
            alert("An error occurred while reading the file.");
        };

        reader.readAsDataURL(file);
    }
});

showHideButton.addEventListener("click", () => {
    if (uploadedImages.style.display === "none") {
        uploadedImages.style.display = "block";
        showHideButton.textContent = "Hide Uploaded Images";
    } else {
        uploadedImages.style.display = "none";
        showHideButton.textContent = "Show Uploaded Images";
    }
});

removeOneButton.addEventListener("click", () => {
    if (uploadedImages.children.length > 0) {
        uploadedImages.removeChild(uploadedImages.lastChild);
        uploadedImageUrls.pop();
    }
});

removeAllButton.addEventListener("click", () => {
    uploadedImages.innerHTML = "";
    uploadedImageUrls = [];
});

// script.js
const nightModeToggle = document.getElementById("nightModeToggle");
const nightModeIcon = document.getElementById("nightModeIcon");

let isNightMode = false;

nightModeToggle.addEventListener("click", () => {
    isNightMode = !isNightMode;
    
    document.body.classList.toggle("night-mode", isNightMode);
    
    // Change icon based on mode
    if (isNightMode) {
        nightModeIcon.classList.remove("fa-sun");
        nightModeIcon.classList.add("fa-moon");
    } else {
        nightModeIcon.classList.remove("fa-moon");
        nightModeIcon.classList.add("fa-sun");
    }
});

const findButton = document.getElementById("findButton");

findButton.addEventListener("click", async () => {
  const imageDataUrls = uploadedImageUrls; // assuming this is the array of image URLs
  const response = await fetch('/build/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken,
    },
    body: JSON.stringify({ image_urls: imageDataUrls }),
  });

  const result = await response.json();
  extractedText.value = result.text;
});