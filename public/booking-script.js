// API Base URL
const API_BASE_URL = 'https://genesolution.vercel.app';
let discount = '25'; // Default discount

console.log('📋 Booking script loaded successfully');
console.log('🌐 API URL:', API_BASE_URL);

// Validation patterns and rules
const validation = {
  fullName: {
    pattern: /^[A-Za-z\s]{3,}$/,
    message: 'Name must contain only letters and spaces (min 3 characters)'
  },
  dob: {
    pattern: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
    message: 'Date must be in DD/MM/YYYY format (e.g., 15/01/1990)'
  },
  age: {
    pattern: /^[1-9][0-9]?$|^1[01][0-9]$|^120$/,
    message: 'Age must be between 1 and 120'
  },
  contact: {
    pattern: /^[6-9]\d{9}$/,
    message: 'Mobile number must be 10 digits starting with 6, 7, 8, or 9'
  },
  pincode: {
    pattern: /^\d{6}$/,
    message: 'Pincode must be exactly 6 digits'
  },
  address: {
    minLength: 10,
    message: 'Address must be at least 10 characters'
  },
  city: {
    minLength: 3,
    message: 'City/State must be at least 3 characters'
  }
};

// Check if booking was already submitted
window.addEventListener('DOMContentLoaded', async function() {
  // Get discount from sessionStorage
  discount = sessionStorage.getItem('discount') || '25';
  
  // Check if user has already submitted
  const isAlreadySubmitted = localStorage.getItem('bookingSubmitted');
  const bookingForm = document.getElementById('bookingForm');
  const submissionStatus = document.getElementById('submissionStatus');
  
  if (isAlreadySubmitted) {
    console.log('✅ Booking already submitted - showing success page');
    if (bookingForm) bookingForm.style.display = 'none';
    if (submissionStatus) submissionStatus.style.display = 'block';
  } else {
    console.log('📝 Fresh booking page - showing form');
    if (bookingForm) bookingForm.style.display = 'block';
    if (submissionStatus) submissionStatus.style.display = 'none';
  }
  
  // Display discount information
  const discountElement = document.getElementById('discountInfo');
  if (discountElement && !isAlreadySubmitted) {
    discountElement.textContent = `🎁 You are eligible for ${discount}% discount on SPOTMAS test`;
  }
  
  // Set up real-time validation
  setupRealtimeValidation();
  
  // Auto-format DOB input
  setupDOBFormatting();
  
  // Handle age/DOB relationship
  setupAgeOrDOB();
  
  // Test API connection
  try {
    console.log('🔍 Testing API connection...');
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();
    console.log('✅ API is accessible:', data);
  } catch (error) {
    console.error('❌ API connection test failed:', error);
    console.error('⚠️ Make sure the Node.js server is running: npm start');
  }
});

// Real-time validation setup
function setupRealtimeValidation() {
  const inputs = document.querySelectorAll('input, select, textarea');
  
  inputs.forEach(input => {
    // Validate on blur
    input.addEventListener('blur', function() {
      validateField(this);
    });
    
    // Remove error on focus
    input.addEventListener('focus', function() {
      const formGroup = this.closest('.form-group');
      if (formGroup) {
        formGroup.classList.remove('error');
      }
    });
    
    // Validate on input for certain fields
    if (['contact', 'pincode', 'age'].includes(input.id)) {
      input.addEventListener('input', function() {
        // Remove non-numeric characters
        if (this.type === 'tel' || this.type === 'number' || this.id === 'pincode') {
          this.value = this.value.replace(/\D/g, '');
        }
        
        // Limit length
        if (this.id === 'contact' && this.value.length > 10) {
          this.value = this.value.slice(0, 10);
        }
        if (this.id === 'pincode' && this.value.length > 6) {
          this.value = this.value.slice(0, 6);
        }
        if (this.id === 'age' && this.value.length > 3) {
          this.value = this.value.slice(0, 3);
        }
      });
    }
  });
}

// DOB auto-formatting
function setupDOBFormatting() {
  const dobInput = document.getElementById('dob');
  if (!dobInput) return;
  
  dobInput.addEventListener('input', function(e) {
    let value = this.value.replace(/\D/g, ''); // Remove non-digits
    
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    if (value.length >= 5) {
      value = value.slice(0, 5) + '/' + value.slice(5);
    }
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    
    this.value = value;
  });
}

// Age or DOB handling
function setupAgeOrDOB() {
  const dobInput = document.getElementById('dob');
  const ageInput = document.getElementById('age');
  
  if (!dobInput || !ageInput) return;
  
  dobInput.addEventListener('input', function() {
    if (this.value) {
      ageInput.value = '';
      ageInput.removeAttribute('required');
      dobInput.setAttribute('required', 'required');
    } else {
      ageInput.setAttribute('required', 'required');
    }
  });
  
  ageInput.addEventListener('input', function() {
    if (this.value) {
      dobInput.value = '';
      dobInput.removeAttribute('required');
      ageInput.setAttribute('required', 'required');
    } else {
      dobInput.setAttribute('required', 'required');
    }
  });
}

// Validate individual field
function validateField(field) {
  const fieldId = field.id;
  const fieldValue = field.value.trim();
  const formGroup = field.closest('.form-group');
  const errorMessage = document.getElementById(`${fieldId}-error`);
  
  if (!formGroup || !errorMessage) return true;
  
  // Clear previous error
  formGroup.classList.remove('error');
  errorMessage.textContent = '';
  
  // Check if field is required and empty
  if (field.hasAttribute('required') && !fieldValue) {
    showError(formGroup, errorMessage, 'This field is required');
    return false;
  }
  
  // Skip validation if field is empty and not required
  if (!fieldValue && !field.hasAttribute('required')) {
    return true;
  }
  
  // Validate based on field rules
  const rules = validation[fieldId];
  if (!rules) return true;
  
  // Pattern validation
  if (rules.pattern && !rules.pattern.test(fieldValue)) {
    showError(formGroup, errorMessage, rules.message);
    return false;
  }
  
  // Length validation
  if (rules.minLength && fieldValue.length < rules.minLength) {
    showError(formGroup, errorMessage, rules.message);
    return false;
  }
  
  // Special validation for DOB
  if (fieldId === 'dob' && fieldValue) {
    const isValidDate = validateDOB(fieldValue);
    if (!isValidDate) {
      showError(formGroup, errorMessage, 'Please enter a valid date');
      return false;
    }
  }
  
  return true;
}

// Validate DOB
function validateDOB(dob) {
  const parts = dob.split('/');
  if (parts.length !== 3) return false;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  
  // Check ranges
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > new Date().getFullYear()) {
    return false;
  }
  
  // Check if date is valid
  const date = new Date(year, month - 1, day);
  return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
}

// Show error
function showError(formGroup, errorElement, message) {
  formGroup.classList.add('error');
  errorElement.textContent = message;
}

// Form submission handler
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  console.log('✅ Booking form found, attaching submit handler');
  
  bookingForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    console.log('📝 Form submitted');
    
    // Validate all fields
    let isValid = true;
    const fields = this.querySelectorAll('input:not([type="checkbox"]), select, textarea');
    
    fields.forEach(field => {
      if (!validateField(field)) {
        isValid = false;
      }
    });
    
    // Check if either DOB or Age is filled
    const dobValue = document.getElementById('dob').value.trim();
    const ageValue = document.getElementById('age').value.trim();
    
    if (!dobValue && !ageValue) {
      const dobGroup = document.getElementById('dob').closest('.form-group');
      const dobError = document.getElementById('dob-error');
      showError(dobGroup, dobError, 'Please enter either Date of Birth or Age');
      isValid = false;
    }
    
    if (!isValid) {
      console.log('❌ Form validation failed');
      // Scroll to first error
      const firstError = document.querySelector('.form-group.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    // Collect form data
    const formData = {
      fullName: document.getElementById('fullName').value.trim(),
      dob: dobValue || `Age: ${ageValue}`,
      gender: document.getElementById('gender').value,
      contact: document.getElementById('contact').value.trim(),
      address: document.getElementById('address').value.trim(),
      city: document.getElementById('city').value.trim(),
      pincode: document.getElementById('pincode').value.trim(),
      discount: discount + '%',
      submittedAt: new Date().toISOString()
    };
    
    // Collect risk factors
    const riskFactors = [];
    document.querySelectorAll('input[name="riskFactors"]:checked').forEach(cb => {
      riskFactors.push(cb.value);
    });
    
    const otherRisk = document.getElementById('otherRisk').value.trim();
    if (otherRisk) {
      riskFactors.push('Others: ' + otherRisk);
    }
    
    formData.riskFactors = riskFactors.join(', ') || 'None';
    
    console.log('📤 Sending booking data:', formData);
    
    // Store data
    sessionStorage.setItem('bookingData', JSON.stringify(formData));
    
    // Show loading state
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="btn-text">⏳ Submitting...</span>';
    submitBtn.disabled = true;
    
    try {
      console.log('🚀 Calling API:', `${API_BASE_URL}/api/submit-booking`);
      
      const response = await fetch(`${API_BASE_URL}/api/submit-booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      console.log('📥 Response received. Status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📥 Response data:', result);
      
      if (result.success) {
        console.log('✅ Booking submitted successfully!');
        console.log('📧 Email sent:', result.email?.status);
        console.log('📱 SMS sent:', result.sms?.status);
        console.log('💬 WhatsApp sent:', result.whatsapp?.status);
        
        // Store success flags
        sessionStorage.setItem('bookingSuccess', 'true');
        localStorage.setItem('bookingSubmitted', 'true');
        
        // Show success message
        bookingForm.style.display = 'none';
        document.getElementById('submissionStatus').style.display = 'block';
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(result.message || 'Failed to submit booking');
      }
      
    } catch (error) {
      console.error('❌ Error submitting booking:', error);
      
      // Reset button
      submitBtn.innerHTML = originalHTML;
      submitBtn.disabled = false;
      
      // Show error message
      showFormError(error);
    }
  });
} else {
  console.error('❌ Booking form not found!');
}

// Function to display form error message
function showFormError(error) {
  // Remove existing error if any
  const existingError = document.getElementById('formErrorMessage');
  if (existingError) {
    existingError.remove();
  }
  
  // Create error message div
  const errorDiv = document.createElement('div');
  errorDiv.id = 'formErrorMessage';
  errorDiv.style.cssText = `
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    color: #991b1b;
    padding: 20px 25px;
    border-radius: 12px;
    margin: 20px 0;
    border-left: 4px solid #dc2626;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    animation: fadeInUp 0.3s ease-out;
  `;
  
  let errorHTML = '';
  
  if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
    errorHTML = `
      <div style="display: flex; gap: 15px; align-items: start;">
        <span style="font-size: 28px;">⚠️</span>
        <div style="flex: 1;">
          <strong style="display: block; font-size: 18px; margin-bottom: 10px;">Server Connection Error</strong>
          <p style="margin: 10px 0; line-height: 1.6;">Cannot connect to the booking server. Please ensure:</p>
          <ul style="margin: 10px 0 15px 20px; padding: 0; line-height: 1.8;">
            <li><strong>The Node.js server is running</strong></li>
            <li>Run in terminal: <code style="background: rgba(0,0,0,0.1); padding: 4px 8px; border-radius: 4px; font-family: monospace;">npm start</code></li>
            <li>Server URL: <code style="background: rgba(0,0,0,0.1); padding: 4px 8px; border-radius: 4px; font-family: monospace;">${API_BASE_URL}</code></li>
          </ul>
          <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #fca5a5;">
            <p style="margin: 0; font-weight: 600;">Need immediate help?</p>
            <p style="margin: 8px 0 0;">
              📞 <a href="tel:+919013275668" style="color: #dc2626; font-weight: 700; text-decoration: none;">+91 90132 75668</a> | 
              📧 <a href="mailto:infoin@genesolutions.com" style="color: #dc2626; font-weight: 700; text-decoration: none;">infoin@genesolutions.com</a>
            </p>
          </div>
        </div>
      </div>
    `;
  } else {
    errorHTML = `
      <div style="display: flex; gap: 15px; align-items: start;">
        <span style="font-size: 28px;">⚠️</span>
        <div style="flex: 1;">
          <strong style="display: block; font-size: 18px; margin-bottom: 10px;">Submission Error</strong>
          <p style="margin: 10px 0; line-height: 1.6;">${error.message}</p>
          <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #fca5a5;">
            <p style="margin: 0; font-weight: 600;">Need help?</p>
            <p style="margin: 8px 0 0;">
              📞 <a href="tel:+919013275668" style="color: #dc2626; font-weight: 700; text-decoration: none;">+91 90132 75668</a> | 
              📧 <a href="mailto:infoin@genesolutions.com" style="color: #dc2626; font-weight: 700; text-decoration: none;">infoin@genesolutions.com</a>
            </p>
          </div>
        </div>
      </div>
    `;
  }
  
  errorDiv.innerHTML = errorHTML;
  
  // Insert error before submit button
  const form = document.getElementById('bookingForm');
  if (form) {
    const submitBtn = form.querySelector('.submit-btn');
    form.insertBefore(errorDiv, submitBtn);
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
