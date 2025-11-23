import emailjs from '@emailjs/browser';

interface EmailParams {
  to: string;
  nombre: string;
  apellido: string;
  status?: string;
  qrCode?: string;
  origin?: string;
  destination?: string;
}

// Initialize EmailJS with your public key
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID_STATUS = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_STATUS;
const TEMPLATE_ID_CREATED = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CREATED;

// Initialize EmailJS
if (EMAILJS_PUBLIC_KEY) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

/**
 * Generate QR code URL using QuickChart API
 * @param data - Data to encode in QR code
 * @returns URL of the QR code image
 */
function generateQRCodeURL(data: string): string {
  const encodedData = encodeURIComponent(data);
  return `https://quickchart.io/qr?text=${encodedData}&size=200&margin=2`;
}

/**
 * Send email notification when request status is updated
 */
export async function sendRequestStatusEmail(params: EmailParams) {
  const { to, nombre, apellido, status, qrCode, origin, destination } = params;
  
  if (!status) {
    console.error('Status is required for status update email');
    return { success: false, error: 'Status is required' };
  }
  
  // Check if EmailJS is configured
  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !TEMPLATE_ID_STATUS) {
    console.error('❌ EmailJS not configured. Please check your .env file');
    return { 
      success: false, 
      error: 'EmailJS not configured. Please add VITE_EMAILJS_* variables to .env' 
    };
  }
  
  console.log('📧 Sending status update email to:', to);
  console.log('Status:', status);
  
  try {
    // Generate QR code URL
    const qrData = qrCode || `REQUEST-${Date.now()}`;
    const qrUrl = generateQRCodeURL(qrData);
    
    // Prepare template parameters
    const templateParams = {
      to_email: to,
      nombre,
      apellido,
      status: status.replace('_', ' ').toUpperCase(),
      origin: origin || 'N/A',
      destination: destination || 'N/A',
      qr_url: qrUrl,
    };
    
    // Send email using EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATE_ID_STATUS,
      templateParams
    );
    
    console.log('✅ Email sent successfully:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error };
  }
}

/**
 * Send email notification when a new request is created
 */
export async function sendRequestCreatedEmail(params: EmailParams) {
  const { to, nombre, apellido, qrCode, origin, destination } = params;
  
  // Check if EmailJS is configured
  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !TEMPLATE_ID_CREATED) {
    console.error('❌ EmailJS not configured. Please check your .env file');
    return { 
      success: false, 
      error: 'EmailJS not configured. Please add VITE_EMAILJS_* variables to .env' 
    };
  }
  
  console.log('📧 Sending request created email to:', to);
  
  try {
    // Generate QR code URL
    const qrData = qrCode || `REQUEST-${Date.now()}`;
    const qrUrl = generateQRCodeURL(qrData);
    
    // Prepare template parameters
    const templateParams = {
      to_email: to,
      nombre,
      apellido,
      origin: origin || 'N/A',
      destination: destination || 'N/A',
      qr_url: qrUrl,
    };
    
    // Send email using EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATE_ID_CREATED,
      templateParams
    );
    
    console.log('✅ Email sent successfully:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error };
  }
}
