require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Email configuration with Nodemailer
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify email configuration
emailTransporter.verify((error, success) => {
  if (error) {
    console.error('Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Twilio configuration
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// API endpoint to handle booking submission
app.post('/api/submit-booking', async (req, res) => {
  try {
    const bookingData = req.body;
    
    console.log('Processing booking for:', bookingData.fullName);
    
    // Send Email (Required - must succeed)
    const emailResult = await sendEmail(bookingData);
    console.log('✅ Email sent successfully');
    
    // Send SMS to customer (Required - must succeed)
    const smsResult = await sendSMSToCustomer(bookingData);
    console.log('✅ SMS sent to customer successfully');
    
    // Send WhatsApp to admin (Optional - failure won't affect overall success)
    let whatsappResult = null;
    try {
      whatsappResult = await sendWhatsAppToAdmin(bookingData);
      console.log('✅ Admin WhatsApp sent successfully');
    } catch (whatsappError) {
      console.warn('⚠️ Admin WhatsApp sending failed (optional):', whatsappError.message);
      whatsappResult = { status: 'failed', error: whatsappError.message };
    }
    
    res.json({
      success: true,
      message: 'Booking submitted successfully',
      email: emailResult,
      sms: smsResult,
      whatsapp: whatsappResult
    });
    
  } catch (error) {
    console.error('❌ Error processing booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process booking',
      error: error.message
    });
  }
});

// Function to send email using Nodemailer
async function sendEmail(data) {
  const mailOptions = {
    from: `"World Cancer Day Campaign" <${process.env.EMAIL_USER}>`,
    to: process.env.TO_EMAIL,
    subject: 'SPOTMAS Test Booking - World Cancer Day Campaign',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(to right, #a855c5, #d946b4);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            background: #fff;
            padding: 30px;
            border: 1px solid #ddd;
            border-top: none;
          }
          .info-row {
            display: flex;
            padding: 12px 0;
            border-bottom: 1px solid #eee;
          }
          .info-label {
            font-weight: bold;
            width: 180px;
            color: #555;
          }
          .info-value {
            flex: 1;
            color: #333;
          }
          .discount {
            background: #fee2e2;
            color: #dc2626;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin: 20px 0;
          }
          .action-box {
            background: #f0f9ff;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎗️ New SPOTMAS Test Booking</h1>
            <p>World Cancer Day Campaign</p>
          </div>
          <div class="content">
            <h2 style="color: #a855c5; margin-top: 0;">Booking Details</h2>
            
            <div class="info-row">
              <div class="info-label">Full Name:</div>
              <div class="info-value">${data.fullName}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Date of Birth/Age:</div>
              <div class="info-value">${data.dob}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Gender:</div>
              <div class="info-value">${data.gender}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Contact Number:</div>
              <div class="info-value">${data.contact}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Address:</div>
              <div class="info-value">${data.address}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">City/State:</div>
              <div class="info-value">${data.city}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Pincode:</div>
              <div class="info-value">${data.pincode}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Risk Factors:</div>
              <div class="info-value">${data.riskFactors}</div>
            </div>
            
            <div class="discount">
              🎁 Discount Eligible: ${data.discount}
            </div>
            
            <div class="action-box">
              <strong>⚡ Action Required:</strong><br>
              Please arrange sample collection at the earliest convenience.
            </div>
            
            <p><strong>Important Notes:</strong></p>
            <ul>
              <li>Consent Form & Doctor's Prescription required during sample collection</li>
              <li>Contact: +91 90132 75668</li>
              <li>Email: infoin@genesolutions.com</li>
            </ul>
          </div>
          <div class="footer">
            <p>This is an automated email from the World Cancer Day Campaign - SPOTMAS Test Booking System</p>
            <p>Booking Date: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            <p>&copy; ${new Date().getFullYear()} Gene Solutions India. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  const info = await emailTransporter.sendMail(mailOptions);
  return { messageId: info.messageId, status: 'sent' };
}

// Function to send WhatsApp to admin using Twilio
async function sendWhatsAppToAdmin(data) {
  const message = `*🎗️ SPOTMAS Test Booking*
*World Cancer Day Campaign*

📋 *New Booking Received*
━━━━━━━━━━━━━━━━━━━━━

👤 *Name:* ${data.fullName}
📅 *DOB/Age:* ${data.dob}
⚥ *Gender:* ${data.gender}
📞 *Contact:* ${data.contact}
📍 *Address:* ${data.address}
🏙️ *City/State:* ${data.city}
📮 *Pincode:* ${data.pincode}
🎁 *Discount:* ${data.discount}
⚠️ *Risk Factors:* ${data.riskFactors}

━━━━━━━━━━━━━━━━━━━━━
✅ *Action Required:*
Please arrange sample collection ASAP.

📝 *Important:*
• Consent Form required
• Doctor's Prescription required

_Automated - ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}_`;

  const whatsappMessage = await twilioClient.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to: process.env.TWILIO_WHATSAPP_TO,
    body: message
  });
  
  return { messageSid: whatsappMessage.sid, status: 'sent' };
}

// Function to send SMS confirmation to customer
async function sendSMSToCustomer(data) {
  // Format the customer's phone number for SMS
  // Assuming Indian numbers - adjust country code as needed
  let customerNumber = data.contact.trim();
  
  // Remove any spaces, dashes, or special characters
  customerNumber = customerNumber.replace(/[\s\-\(\)]/g, '');
  
  // Add country code if not present
  if (!customerNumber.startsWith('+')) {
    if (customerNumber.startsWith('91')) {
      customerNumber = '+' + customerNumber;
    } else if (customerNumber.startsWith('0')) {
      customerNumber = '+91' + customerNumber.substring(1);
    } else {
      customerNumber = '+91' + customerNumber;
    }
  }
  
  const message = `SPOTMAS Test Booking Confirmed!

Dear ${data.fullName},

Thank you for booking with us for World Cancer Day Campaign.

Booking Details:
- Name: ${data.fullName}
- DOB/Age: ${data.dob}
- Discount: ${data.discount}

Our team will contact you soon to schedule sample collection.

Please keep ready:
- Signed Consent Form
- Doctor's Prescription

Contact: +91 90132 75668
Email: infoin@genesolutions.com

- Gene Solutions India`;

  const smsMessage = await twilioClient.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number for SMS
    to: customerNumber,
    body: message
  });
  
  return { 
    messageSid: smsMessage.sid, 
    status: 'sent',
    sentTo: customerNumber
  };
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═════════════════════════════════════════════════════════════╗
║   SPOTMAS Booking System Server                             ║
║   World Cancer Day Campaign                                 ║
╠═════════════════════════════════════════════════════════════╣
║   Status: RUNNING                                           ║
║   Port: ${PORT}                                                ║
║   Health Check: http://localhost:${PORT}/api/health            ║
║   API Endpoint: http://localhost:${PORT}/api/submit-booking    ║
╚═════════════════════════════════════════════════════════════╝
  `);
});
