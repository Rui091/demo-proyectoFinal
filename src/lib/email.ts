import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

interface EmailParams {
  to: string;
  nombre: string;
  apellido: string;
  status?: string;
  qrCode?: string;
  origin?: string;
  destination?: string;
}

export async function sendRequestStatusEmail(params: EmailParams) {
  const { to, nombre, apellido, status, qrCode, origin, destination } = params;
  
  if (!status) {
    console.error('Status is required for status update email');
    return { success: false, error: 'Status is required' };
  }
  
  // Check if API key is configured
  const apiKey = import.meta.env.VITE_RESEND_API_KEY;
  if (!apiKey || apiKey === 'your-resend-api-key') {
    console.error('❌ Resend API key not configured');
    return { success: false, error: 'Resend API key not configured in .env' };
  }
  
  console.log('📧 Sending status update email to:', to);
  console.log('Status:', status);
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Transport System <onboarding@resend.dev>',
      to: [to],
      subject: `Estado de Solicitud Actualizado: ${status.toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
              .status-pending { background: #fbbf24; color: #78350f; }
              .status-assigned { background: #3b82f6; color: white; }
              .status-in_progress { background: #f59e0b; color: white; }
              .status-delivered { background: #10b981; color: white; }
              .status-cancelled { background: #ef4444; color: white; }
              .qr-code { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; border: 2px dashed #667eea; }
              .info-row { margin: 10px 0; }
              .info-label { font-weight: bold; color: #667eea; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">🚁 Sistema de Transporte PUJ Cali</h1>
                <p style="margin: 10px 0 0 0;">Actualización de Estado</p>
              </div>
              <div class="content">
                <h2>Hola ${nombre} ${apellido},</h2>
                <p>El estado de tu solicitud de transporte ha sido actualizado:</p>
                
                <div class="status-badge status-${status}">
                  ${status.replace('_', ' ').toUpperCase()}
                </div>
                
                ${origin && destination ? `
                  <div class="info-row">
                    <span class="info-label">Origen:</span> ${origin}
                  </div>
                  <div class="info-row">
                    <span class="info-label">Destino:</span> ${destination}
                  </div>
                ` : ''}
                
                ${qrCode ? `
                  <div class="qr-code">
                    <div style="font-size: 14px; color: #667eea; margin-bottom: 10px;">Código QR para Recepción</div>
                    ${qrCode}
                  </div>
                  <p style="font-size: 12px; color: #6b7280;">
                    <strong>Importante:</strong> Presenta este código QR al recibir tu paquete.
                  </p>
                ` : ''}
                
                <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                  Gracias por usar nuestro sistema de transporte automatizado.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export async function sendRequestCreatedEmail(params: EmailParams) {
  const { to, nombre, apellido, qrCode, origin, destination } = params;
  
  // Check if API key is configured
  const apiKey = import.meta.env.VITE_RESEND_API_KEY;
  if (!apiKey || apiKey === 'your-resend-api-key') {
    console.error('❌ Resend API key not configured');
    return { success: false, error: 'Resend API key not configured in .env' };
  }
  
  console.log('📧 Sending request created email to:', to);
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Transport System <onboarding@resend.dev>',
      to: [to],
      subject: 'Solicitud de Transporte Creada',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .qr-code { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; border: 2px dashed #667eea; }
              .info-row { margin: 10px 0; }
              .info-label { font-weight: bold; color: #667eea; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">🚁 Sistema de Transporte PUJ Cali</h1>
                <p style="margin: 10px 0 0 0;">Confirmación de Solicitud</p>
              </div>
              <div class="content">
                <h2>Hola ${nombre} ${apellido},</h2>
                <p>Tu solicitud de transporte ha sido creada exitosamente.</p>
                
                <div class="info-row">
                  <span class="info-label">Origen:</span> ${origin}
                </div>
                <div class="info-row">
                  <span class="info-label">Destino:</span> ${destination}
                </div>
                
                ${qrCode ? `
                  <div class="qr-code">
                    <div style="font-size: 14px; color: #667eea; margin-bottom: 10px;">Código QR para Recepción</div>
                    ${qrCode}
                  </div>
                  <p style="font-size: 12px; color: #6b7280;">
                    <strong>Importante:</strong> Guarda este código QR. Lo necesitarás para recibir tu paquete.
                  </p>
                ` : ''}
                
                <p style="margin-top: 30px;">
                  Te notificaremos por email cuando el estado de tu solicitud cambie.
                </p>
                
                <p style="color: #6b7280; font-size: 14px;">
                  Gracias por usar nuestro sistema de transporte automatizado.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
