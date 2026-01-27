// API Base URL
const API_BASE_URL = 'https://genesolution.vercel.app';
let discount = '25'; // Default discount

console.log('📋 Booking script loaded successfully');
console.log('🌐 API URL:', API_BASE_URL);

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
    // Hide form and show success message
    if (bookingForm) bookingForm.style.display = 'none';
    if (submissionStatus) submissionStatus.style.display = 'block';
  } else {
    console.log('📝 Fresh booking page - showing form');
    // Show form and hide success message
    if (bookingForm) bookingForm.style.display = 'block';
    if (submissionStatus) submissionStatus.style.display = 'none';
  }
  
  // Display discount information
  const discountElement = document.getElementById('discountInfo');
  if (discountElement && !isAlreadySubmitted) {
    discountElement.textContent = `You are eligible for ${discount}% discount on SPOTMAS test`;
  }
  
  // Test API connection on page load
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

// Form submission handler
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  console.log('✅ Booking form found, attaching submit handler');
  
  bookingForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    console.log('📝 Form submitted');
    
    // Collect form data
    const formData = {
      fullName: document.getElementById('fullName').value,
      dob: document.getElementById('dob').value,
      gender: document.getElementById('gender').value,
      contact: document.getElementById('contact').value,
      address: document.getElementById('address').value,
      city: document.getElementById('city').value,
      pincode: document.getElementById('pincode').value,
      discount: discount + '%',
      submittedAt: new Date().toISOString()
    };
    
    // Collect risk factors
    const riskFactors = [];
    document.querySelectorAll('input[name="riskFactors"]:checked').forEach(cb => {
      riskFactors.push(cb.value);
    });
    
    const otherRisk = document.getElementById('otherRisk').value;
    if (otherRisk) {
      riskFactors.push('Others: ' + otherRisk);
    }
    
    formData.riskFactors = riskFactors.join(', ') || 'None';
    
    console.log('📤 Sending booking data:', formData);
    
    // Store data
    sessionStorage.setItem('bookingData', JSON.stringify(formData));
    
    // Show loading state
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '⏳ Submitting booking...';
    submitBtn.disabled = true;
    
    try {
      // THIS IS WHERE WE CALL THE API
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
        console.log('📱 WhatsApp sent:', result.whatsapp?.status);
        
        // Store success flags (both session and local storage for persistence)
        sessionStorage.setItem('bookingSuccess', 'true');
        localStorage.setItem('bookingSubmitted', 'true');
        
        // Redirect to confirmation page
        console.log('🔄 Redirecting to confirmation page...');
        window.location.href = 'confirmation.html';
      } else {
        throw new Error(result.message || 'Failed to submit booking');
      }
      
    } catch (error) {
      console.error('❌ Error submitting booking:', error);
      
      // Reset button
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      
      // Show error message
      showError(error);
    }
  });
} else {
  console.error('❌ Booking form not found! Make sure element with id="bookingForm" exists');
}

// Function to display error message
function showError(error) {
  // Remove existing error if any
  const existingError = document.getElementById('errorMessage');
  if (existingError) {
    existingError.remove();
  }
  
  // Create error message div
  const errorDiv = document.createElement('div');
  errorDiv.id = 'errorMessage';
  errorDiv.style.cssText = `
    background: #fee2e2; 
    color: #dc2626; 
    padding: 20px; 
    border-radius: 8px; 
    margin: 20px 0; 
    border-left: 4px solid #dc2626;
  `;
  
  let errorHTML = '';
  
  if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
    errorHTML = `
      <strong>⚠️ Server Connection Error</strong>
      <p style="margin: 10px 0;">Cannot connect to the booking server. Please ensure:</p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li><strong>The Node.js server is running</strong> - Open terminal and run: <code style="background: rgba(0,0,0,0.1); padding: 2px 6px; border-radius: 3px;">npm start</code></li>
        <li>Server URL: <code style="background: rgba(0,0,0,0.1); padding: 2px 6px; border-radius: 3px;">${API_BASE_URL}/api/submit-booking</code></li>
        <li>Check browser console (F12) for more details</li>
      </ul>
    `;
  } else {
    errorHTML = `
      <strong>⚠️ Submission Error</strong>
      <p style="margin: 10px 0;">${error.message}</p>
    `;
  }
  
  errorHTML += `
    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #fca5a5;">
      <p style="margin: 0;"><strong>Need help?</strong></p>
      <p style="margin: 5px 0;">
        📞 Phone: <a href="tel:+919013275668" style="color: #dc2626; font-weight: bold;">+91 90132 75668</a><br>
        📧 Email: <a href="mailto:infoin@genesolutions.com" style="color: #dc2626; font-weight: bold;">infoin@genesolutions.com</a>
      </p>
    </div>
  `;
  
  errorDiv.innerHTML = errorHTML;
  
  // Insert error before submit button
  const form = document.getElementById('bookingForm');
  if (form) {
    const submitBtn = form.querySelector('.submit-btn');
    form.insertBefore(errorDiv, submitBtn);
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
