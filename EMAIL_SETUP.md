# Configuración de Emails Reales con Resend

Para enviar emails reales, necesitas configurar Resend (servicio gratuito de emails).

## Paso 1: Crear cuenta en Resend

1. Ve a [https://resend.com](https://resend.com)
2. Crea una cuenta gratuita
3. Verifica tu email
4. Obtén tu API Key desde el dashboard

## Paso 2: Agregar API Key al .env

```env
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
```

## Paso 3: Instalar dependencia

```bash
pnpm add resend
```

## Paso 4: Crear servicio de email

Crea el archivo `src/lib/email.ts`:

```typescript
import { Resend } from "resend";

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export async function sendRequestEmail(
  to: string,
  nombre: string,
  apellido: string,
  status: string,
  qrCode: string
) {
  try {
    await resend.emails.send({
      from: "Transport System <onboarding@resend.dev>",
      to: [to],
      subject: `Request Status Update: ${status}`,
      html: `
        <h1>Hola ${nombre} ${apellido}</h1>
        <p>El estado de tu solicitud ha cambiado a: <strong>${status.toUpperCase()}</strong></p>
        <p>Código QR para recepción: <strong>${qrCode}</strong></p>
        <p>Gracias por usar nuestro sistema de transporte.</p>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
```

## Paso 5: Usar en useRequests.ts

Reemplaza las notificaciones simuladas con:

```typescript
import { sendRequestEmail } from "../lib/email";

// En createRequest y updateStatus:
await sendRequestEmail(
  request.correo,
  request.nombre,
  request.apellido,
  status,
  request.qr_code || ""
);
```

## Limitaciones del Plan Gratuito

- 100 emails/día
- Solo puedes enviar desde `onboarding@resend.dev`
- Para usar tu propio dominio, necesitas el plan de pago

## Alternativa: Supabase Edge Functions

Si prefieres usar Supabase, puedes crear una Edge Function que envíe emails usando Resend desde el backend.

¿Quieres que implemente alguna de estas opciones?
