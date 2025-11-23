# Configuración de Supabase Edge Function para Emails

## Paso 1: Instalar Supabase CLI

```bash
# Windows (usando npm)
npm install -g supabase

# Verificar instalación
supabase --version
```

## Paso 2: Inicializar Supabase en tu proyecto

```bash
cd "c:\Users\Ruiyu\OneDrive\Documents\Procesos y diseno de software\ProyectoFinal"
supabase init
```

## Paso 3: Crear la Edge Function

```bash
supabase functions new send-email
```

Esto creará: `supabase/functions/send-email/index.ts`

## Paso 4: Código de la Edge Function

Copia este código en `supabase/functions/send-email/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface EmailRequest {
  to: string;
  nombre: string;
  apellido: string;
  status?: string;
  qrCode?: string;
  origin?: string;
  destination?: string;
  type: "created" | "status_update";
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const emailData: EmailRequest = await req.json();

    let subject = "";
    let html = "";

    if (emailData.type === "created") {
      subject = "Solicitud de Transporte Creada";
      html = `
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
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">🚁 Sistema de Transporte PUJ Cali</h1>
                <p style="margin: 10px 0 0 0;">Confirmación de Solicitud</p>
              </div>
              <div class="content">
                <h2>Hola ${emailData.nombre} ${emailData.apellido},</h2>
                <p>Tu solicitud de transporte ha sido creada exitosamente.</p>
                <p><strong>Origen:</strong> ${emailData.origin}</p>
                <p><strong>Destino:</strong> ${emailData.destination}</p>
                ${
                  emailData.qrCode
                    ? `
                  <div class="qr-code">
                    <div style="font-size: 14px; color: #667eea; margin-bottom: 10px;">Código QR</div>
                    ${emailData.qrCode}
                  </div>
                `
                    : ""
                }
                <p>Gracias por usar nuestro sistema.</p>
              </div>
            </div>
          </body>
        </html>
      `;
    } else {
      subject = `Estado Actualizado: ${emailData.status?.toUpperCase()}`;
      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; background: #3b82f6; color: white; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">🚁 Sistema de Transporte PUJ Cali</h1>
                <p style="margin: 10px 0 0 0;">Actualización de Estado</p>
              </div>
              <div class="content">
                <h2>Hola ${emailData.nombre} ${emailData.apellido},</h2>
                <p>El estado de tu solicitud ha cambiado a:</p>
                <div class="status-badge">${emailData.status?.toUpperCase()}</div>
                ${
                  emailData.qrCode
                    ? `<p><strong>Código QR:</strong> ${emailData.qrCode}</p>`
                    : ""
                }
                <p>Gracias por usar nuestro sistema.</p>
              </div>
            </div>
          </body>
        </html>
      `;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Transport System <onboarding@resend.dev>",
        to: [emailData.to],
        subject,
        html,
      }),
    });

    const data = await res.json();

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
```

## Paso 5: Configurar secrets en Supabase

```bash
# Login a Supabase
supabase login

# Link a tu proyecto (usa tu project ID)
supabase link --project-ref tzibtrmdzjjjbonkhyeh

# Configurar el secret de Resend
supabase secrets set RESEND_API_KEY=re_RD2ksPd7_EsopyPGvRgq9LoM75aqD21Go
```

## Paso 6: Deploy de la función

```bash
supabase functions deploy send-email
```

## Paso 7: Obtener la URL de la función

Después del deploy, verás algo como:

```
Function URL: api_key
```

## Paso 8: Actualizar el código del frontend

Reemplaza el contenido de `src/lib/email.ts` con llamadas a la Edge Function.

---

**¿Quieres que ejecute estos pasos automáticamente?**

Necesitarás:

1. Estar logueado en Supabase CLI
2. Tu Project ID de Supabase

Dime si quieres que proceda o si prefieres hacerlo manualmente siguiendo esta guía.
