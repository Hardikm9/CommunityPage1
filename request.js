// Global variables
let currentLocation = null;
let isSubmitting = false;

// Initialize page
document.addEventListener("DOMContentLoaded", function() {
  initializeLocationService();
  initializeForm();
});

function initializeLocationService() {
  const getLocationBtn = document.getElementById("getLocation");
  const locationStatus = document.getElementById("locationStatus");
  
  getLocationBtn.addEventListener("click", function() {
    if (navigator.geolocation) {
      // Modern loading state
      locationStatus.className = 'location-status';
      locationStatus.innerHTML = "📍 Getting your location...";
      getLocationBtn.innerHTML = `
        <span class="loading"></span>
        Getting Location...
      `;
      getLocationBtn.disabled = true;
      getLocationBtn.classList.add('loading');
      
      navigator.geolocation.getCurrentPosition(
        function(position) {
          currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          
          locationStatus.className = 'location-status success';
          locationStatus.innerHTML = `✅ Location captured (±${Math.round(position.coords.accuracy)}m accuracy)`;
          getLocationBtn.innerHTML = `
            <span class="icon">📍</span>
            Location Captured
          `;
          getLocationBtn.classList.remove('loading');
          getLocationBtn.classList.add('success');
          
          // Try to get address from coordinates (optional enhancement)
          reverseGeocode(currentLocation);
        },
        function(error) {
          let errorMsg = "❌ Unable to get location: ";
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMsg += "Location access denied";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg += "Location unavailable";
              break;
            case error.TIMEOUT:
              errorMsg += "Location request timed out";
              break;
          }
          locationStatus.className = 'location-status error';
          locationStatus.innerHTML = errorMsg;
          getLocationBtn.innerHTML = `
            <span class="icon">🎯</span>
            Get Current Location
          `;
          getLocationBtn.disabled = false;
          getLocationBtn.classList.remove('loading');
        }
      );
    } else {
      locationStatus.className = 'location-status error';
      locationStatus.innerHTML = "❌ Geolocation not supported by this browser";
    }
  });
}

function reverseGeocode(location) {
  // Simple reverse geocoding using a public API (optional)
  // In a real app, you'd use Google Maps API or similar
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.latitude}&longitude=${location.longitude}&localityLanguage=en`;
  
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data && data.locality) {
        const manualLocationInput = document.getElementById("manualLocation");
        manualLocationInput.value = `${data.locality}, ${data.principalSubdivision}`;
        // Add styling class to highlight detected location
        manualLocationInput.classList.add('location-detected');
        
        // Update location status with more detailed info
        const locationStatus = document.getElementById("locationStatus");
        locationStatus.className = 'location-status success';
        locationStatus.innerHTML = `✅ Location: ${data.locality}, ${data.principalSubdivision}`;
      }
    })
    .catch(err => {
      console.log("Reverse geocoding failed:", err);
    });
}

function initializeForm() {
  const form = document.getElementById("requestForm");
  const submitBtn = document.getElementById("submitBtn");
  const statusDiv = document.getElementById("status");
  
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    const formData = {
      description: document.getElementById("description").value.trim(),
      category: document.getElementById("category").value,
      priority: document.getElementById("priority").value,
      manualLocation: document.getElementById("manualLocation").value.trim(),
      images: document.getElementById("image").files
    };
    
    // Validation
    if (!formData.description) {
      showStatus("❌ Please provide a description of the problem", "error");
      return;
    }
    
    if (!formData.category) {
      showStatus("❌ Please select a problem category", "error");
      return;
    }
    
    if (!formData.priority) {
      showStatus("❌ Please select a priority level", "error");
      return;
    }
    
    if (formData.images.length === 0) {
      showStatus("❌ Please upload at least one image", "error");
      return;
    }
    
    // Start submission process with modern loading state
    isSubmitting = true;
    submitBtn.classList.add('loading');
    submitBtn.innerHTML = '<span class="loading"></span> Submitting Report...';
    submitBtn.disabled = true;
    
    // Add loading state to form
    form.style.pointerEvents = 'none';
    form.style.opacity = '0.7';
    
    processImages(formData.images, function(images) {
      submitProblem(formData, images);
    });
  });
}

function processImages(files, callback) {
  let images = [];
  let loaded = 0;
  
  for (let i = 0; i < files.length; i++) {
    const reader = new FileReader();
    reader.onloadend = function() {
      images.push({
        data: reader.result,
        name: files[i].name,
        size: files[i].size,
        type: files[i].type
      });
      loaded++;
      
      if (loaded === files.length) {
        callback(images);
      }
    };
    reader.readAsDataURL(files[i]);
  }
}

function submitProblem(formData, images) {
  const problems = JSON.parse(localStorage.getItem("problems")) || [];
  
  const newProblem = {
    id: Date.now(),
    description: formData.description,
    category: formData.category,
    priority: formData.priority,
    status: "Pending",
    submittedOn: new Date().toLocaleDateString(),
    resolvedOn: null,
    images: images,
    location: currentLocation,
    manualLocation: formData.manualLocation,
    submittedAt: new Date().toISOString()
  };
  
  problems.push(newProblem);
  localStorage.setItem("problems", JSON.stringify(problems));
  
  // Success feedback with enhanced notifications
  showStatus("✅ Problem report submitted successfully!", "success");
  
  // Use enhanced notification system
  if (window.sendNotification) {
    window.sendNotification(
      "Report Submitted! 🌱",
      `Your ${formData.category} issue has been reported successfully. We'll update you on the progress.`,
      { tag: "problem-submitted" }
    );
  }
  
  // Show toast notification
  if (window.showToast) {
    window.showToast(
      `🌱 Your ${formData.category} report has been submitted! Track progress in the Listed Problems page.`,
      'success',
      7000
    );
  }
  
  // Reset form
  setTimeout(() => {
    document.getElementById("requestForm").reset();
    resetLocationState();
    resetSubmitButton();
    isSubmitting = false;
  }, 2000);
}

function resetLocationState() {
  currentLocation = null;
  const getLocationBtn = document.getElementById("getLocation");
  const locationStatus = document.getElementById("locationStatus");
  const manualLocationInput = document.getElementById("manualLocation");
  
  getLocationBtn.innerHTML = `
    <span class="icon">🎯</span>
    Get Current Location
  `;
  getLocationBtn.disabled = false;
  getLocationBtn.classList.remove('loading', 'success');
  
  locationStatus.className = 'location-status';
  locationStatus.innerHTML = "";
  
  // Remove location styling class when resetting
  if (manualLocationInput) {
    manualLocationInput.classList.remove('location-detected');
    manualLocationInput.value = '';
  }
}

function resetSubmitButton() {
  const submitBtn = document.getElementById("submitBtn");
  const form = document.getElementById("requestForm");
  
  submitBtn.classList.remove('loading');
  submitBtn.innerHTML = '<span class="btn-text">Submit Report</span>';
  submitBtn.disabled = false;
  
  form.style.pointerEvents = '';
  form.style.opacity = '';
  
  isSubmitting = false;
}

function showStatus(message, type) {
  const statusDiv = document.getElementById("status");
  statusDiv.className = `status-message ${type} show`;
  statusDiv.textContent = message;
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    statusDiv.classList.remove("show");
  }, 5000);
}

// Add modern form interactions
document.addEventListener('DOMContentLoaded', function() {
  // Add floating label effects
  const inputs = document.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
      if (!this.value) {
        this.parentElement.classList.remove('focused');
      }
    });
    
    // Check if input has value on page load
    if (input.value) {
      input.parentElement.classList.add('focused');
    }
  });
  
  // Add file upload preview
  const fileInput = document.getElementById('image');
  if (fileInput) {
    fileInput.addEventListener('change', function() {
      const files = this.files;
      if (files.length > 0) {
        let fileText = files.length === 1 ? '1 file selected' : `${files.length} files selected`;
        // You can add preview functionality here
        console.log(`Files selected: ${fileText}`);
      }
    });
  }
});

