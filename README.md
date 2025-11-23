# Sistema de Transporte Centralizado - PUJ Cali

Sistema de gestión centralizada para el transporte universitario con drones y robots autónomos en la Pontificia Universidad Javeriana Cali.

## 🚀 Características

- ✅ **Autenticación con 2FA** usando Supabase MFA (TOTP/Google Authenticator)
- ✅ **Gestión de Dispositivos** (Drones y Robots)
- ✅ **Mapa Interactivo** con ubicación en tiempo real de dispositivos
- ✅ **Gestión de Solicitudes** de transporte
- ✅ **Audit Log** para trazabilidad de acciones
- ✅ **Dashboard** con estadísticas en tiempo real
- ✅ **Locaciones del Campus** predefinidas

## 🛠️ Tecnologías

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Mapas**: Leaflet + React-Leaflet
- **Autenticación**: Supabase MFA (TOTP)
- **Package Manager**: pnpm

## 📦 Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/Rui091/demo-proyectoFinal.git
cd demo-proyectoFinal
```

2. **Instalar dependencias**

```bash
pnpm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

4. **Configurar Supabase**

Ejecuta el script SQL en tu proyecto de Supabase:

```bash
# Abre el SQL Editor en Supabase y ejecuta el contenido de:
supabase_schema.sql
```

5. **Ejecutar en desarrollo**

```bash
pnpm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🗺️ Coordenadas del Campus

**Pontificia Universidad Javeriana Cali**

- Latitud: `3.3487° N`
- Longitud: `76.5316° W`

### Locaciones Disponibles

- Cedro rosado
- Almendros
- Palmas
- Lagos
- Saman
- Educacion continua
- Guduales
- Guayacanes
- Facultad
- Edificio administrativo
- Edificio financiero
- Biblioteca
- Capilla

## 👤 Usuarios de Prueba

Para probar la aplicación, necesitas crear un usuario en Supabase y configurarlo como admin:

```sql
-- Actualizar rol de usuario a admin
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'tu_user_id';
```

## 🔐 Configurar 2FA

1. Inicia sesión con tu cuenta
2. Ve a **Security Settings** en el menú lateral
3. Haz clic en **Enable 2FA**
4. Escanea el código QR con Google Authenticator
5. Ingresa el código de verificación

## 📱 Funcionalidades Principales

### Dashboard

- Estadísticas en tiempo real
- Mapa interactivo con ubicación de dispositivos
- Actividad reciente

### Gestión de Dispositivos

- Registrar nuevos drones/robots
- Ver inventario completo
- Filtrar por estado (disponible, ocupado, mantenimiento)
- Asignar ubicaciones con coordenadas GPS

### Gestión de Solicitudes

- Crear solicitudes de transporte
- Validación de capacidad de carga
- Seguimiento de estado
- Notificaciones por email (simuladas)

### Audit Log

- Registro de todas las acciones
- Trazabilidad completa
- Filtrado por tipo de acción

## 🏗️ Estructura del Proyecto

```
ProyectoFinal/
├── src/
│   ├── components/      # Componentes React
│   ├── context/         # Context providers (Auth, Toast)
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilidades (Supabase client)
│   ├── pages/           # Páginas de la aplicación
│   └── index.css        # Estilos globales
├── supabase_schema.sql  # Schema de base de datos
├── .env.example         # Ejemplo de variables de entorno
└── README.md
```

## 🚀 Deployment

### Build para producción

```bash
pnpm run build
```

Los archivos compilados estarán en la carpeta `dist/`

### Deploy en Vercel/Netlify

1. Conecta tu repositorio de GitHub
2. Configura las variables de entorno
3. Deploy automático en cada push a `main`

## 📝 Licencia

Este proyecto fue desarrollado como parte del curso de Procesos y Diseño de Software en la Pontificia Universidad Javeriana Cali.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría hacer.

## 📧 Contacto

Para preguntas o soporte, contacta al equipo de desarrollo.
