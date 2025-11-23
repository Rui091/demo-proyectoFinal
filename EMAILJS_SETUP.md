# Configuración de EmailJS para Sistema de Transporte

Esta guía te ayudará a configurar EmailJS para enviar notificaciones por email sin necesidad de un dominio propio.

## 📋 Requisitos Previos

- Cuenta de email (Gmail, Outlook, etc.)
- Acceso a internet

## 🚀 Paso 1: Crear Cuenta en EmailJS

1. Ve a [https://www.emailjs.com/](https://www.emailjs.com/)
2. Haz clic en **"Sign Up"**
3. Regístrate con tu email
4. Verifica tu cuenta desde el email de confirmación

## 📧 Paso 2: Configurar Servicio de Email

1. Una vez dentro, ve a **"Email Services"**
2. Haz clic en **"Add New Service"**
3. Selecciona tu proveedor de email (Gmail, Outlook, Yahoo, etc.)
4. Sigue las instrucciones para conectar tu cuenta
5. **Copia el Service ID** que aparece (ejemplo: `service_abc123`)

## 📝 Paso 3: Crear Plantilla de "Solicitud Creada"

1. Ve a **"Email Templates"**
2. Haz clic en **"Create New Template"**
3. Nombra la plantilla: `transport_request_created`
4. En el campo **Subject**, escribe:

   ```
   Solicitud de Transporte Creada
   ```

5. En el campo **Content**, pega el siguiente HTML:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
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
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px;
        border-radius: 10px 10px 0 0;
      }
      .content {
        background: #f9fafb;
        padding: 30px;
        border-radius: 0 0 10px 10px;
      }
      .info-row {
        margin: 10px 0;
      }
      .info-label {
        font-weight: bold;
        color: #667eea;
      }
      .qr-container {
        background: white;
        padding: 20px;
        border-radius: 10px;
        margin: 20px 0;
        text-align: center;
        border: 2px dashed #667eea;
      }
      .qr-title {
        font-size: 14px;
        color: #667eea;
        margin-bottom: 15px;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 style="margin: 0;">🚁 Sistema de Transporte PUJ Cali</h1>
        <p style="margin: 10px 0 0 0;">Confirmación de Solicitud</p>
      </div>
      <div class="content">
        <h2>Hola {{nombre}} {{apellido}},</h2>
        <p>Tu solicitud de transporte ha sido creada exitosamente.</p>

        <div class="info-row">
          <span class="info-label">Origen:</span> {{origin}}
        </div>
        <div class="info-row">
          <span class="info-label">Destino:</span> {{destination}}
        </div>

        <div class="qr-container">
          <div class="qr-title">Código QR para Recepción</div>
          <img
            src="{{qr_url}}"
            alt="QR Code"
            style="width: 200px; height: 200px;"
          />
        </div>
        <p style="font-size: 12px; color: #6b7280;">
          <strong>Importante:</strong> Guarda este código QR. Lo necesitarás
          para recibir tu paquete.
        </p>

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
```

6. **Copia el Template ID** que aparece (ejemplo: `template_xyz789`)

## 📝 Paso 4: Crear Plantilla de "Estado Actualizado"

1. Crea otra plantilla nueva
2. Nombra la plantilla: `transport_status_update`
3. En el campo **Subject**, escribe:

   ```
   Estado de Solicitud Actualizado: {{status}}
   ```

4. En el campo **Content**, pega el siguiente HTML:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
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
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px;
        border-radius: 10px 10px 0 0;
      }
      .content {
        background: #f9fafb;
        padding: 30px;
        border-radius: 0 0 10px 10px;
      }
      .status-badge {
        display: inline-block;
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: bold;
        margin: 10px 0;
        background: #3b82f6;
        color: white;
      }
      .info-row {
        margin: 10px 0;
      }
      .info-label {
        font-weight: bold;
        color: #667eea;
      }
      .qr-container {
        background: white;
        padding: 20px;
        border-radius: 10px;
        margin: 20px 0;
        text-align: center;
        border: 2px dashed #667eea;
      }
      .qr-title {
        font-size: 14px;
        color: #667eea;
        margin-bottom: 15px;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 style="margin: 0;">🚁 Sistema de Transporte PUJ Cali</h1>
        <p style="margin: 10px 0 0 0;">Actualización de Estado</p>
      </div>
      <div class="content">
        <h2>Hola {{nombre}} {{apellido}},</h2>
        <p>El estado de tu solicitud de transporte ha sido actualizado:</p>

        <div class="status-badge">{{status}}</div>

        <div class="info-row">
          <span class="info-label">Origen:</span> {{origin}}
        </div>
        <div class="info-row">
          <span class="info-label">Destino:</span> {{destination}}
        </div>

        <div class="qr-container">
          <div class="qr-title">Código QR para Recepción</div>
          <img
            src="{{qr_url}}"
            alt="QR Code"
            style="width: 200px; height: 200px;"
          />
        </div>
        <p style="font-size: 12px; color: #6b7280;">
          <strong>Importante:</strong> Presenta este código QR al recibir tu
          paquete.
        </p>

        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
          Gracias por usar nuestro sistema de transporte automatizado.
        </p>
      </div>
    </div>
  </body>
</html>
```

5. **Copia el Template ID** que aparece

## 🔑 Paso 5: Obtener Public Key

1. Ve a **"Account"** → **"General"**
2. Busca la sección **"Public Key"**
3. **Copia tu Public Key** (ejemplo: `user_abc123xyz`)

## ⚙️ Paso 6: Configurar Variables de Entorno

Actualiza tu archivo `.env` con los valores que copiaste:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID_CREATED=template_xyz789
VITE_EMAILJS_TEMPLATE_ID_STATUS=template_abc456
VITE_EMAILJS_PUBLIC_KEY=user_abc123xyz
```

## ✅ Verificación

Una vez configurado todo:

1. Inicia tu aplicación: `pnpm dev`
2. Crea una nueva solicitud de transporte
3. Deberías recibir un email de confirmación con el código QR
4. Cambia el estado de la solicitud
5. Deberías recibir un email de actualización

## 📊 Límites del Plan Gratuito

- **200 emails/mes** gratis
- Suficiente para desarrollo y pruebas
- Si necesitas más, puedes actualizar a un plan pago

## 🆘 Solución de Problemas

### No recibo emails

1. Verifica que las variables de entorno estén correctamente configuradas
2. Revisa la consola del navegador para ver errores
3. Verifica que el servicio de email esté conectado en EmailJS
4. Revisa la carpeta de spam

### Error "Public Key is required"

- Asegúrate de haber copiado correctamente el Public Key
- Verifica que la variable `VITE_EMAILJS_PUBLIC_KEY` esté en el archivo `.env`

### Los QR no se muestran

- Verifica que la URL del QR se esté generando correctamente
- Revisa que QuickChart esté disponible (https://quickchart.io)

## 📚 Recursos

- [Documentación de EmailJS](https://www.emailjs.com/docs/)
- [QuickChart QR API](https://quickchart.io/documentation/qr-codes/)
