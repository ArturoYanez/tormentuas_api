# TORMENTUS Frontend

Frontend de la plataforma de trading TORMENTUS construido con React, TypeScript y Tailwind CSS.

## Stack Tecnológico

- **React 18** - Framework principal
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **React Router DOM** - Navegación
- **Chart.js** - Gráficos
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos

## Instalación

```bash
cd frontend
npm install
```

## Desarrollo

```bash
npm run dev
```

El frontend se ejecutará en `http://localhost:3000` y se conectará al backend en `http://localhost:8080`.

## Build

```bash
npm run build
```

## Estructura

```
src/
├── components/
│   ├── modals/          # Modales (verificación, etc.)
│   └── platform/        # Componentes de la plataforma
├── context/             # Context API (Auth)
├── hooks/               # Custom hooks
├── lib/                 # API client y tipos
└── pages/               # Páginas principales
```

## Usuarios por Defecto

| Email | Password | Rol |
|-------|----------|-----|
| admin@tormentus.com | password123 | Admin |
| operator@tormentus.com | password123 | Operador |
| accountant@tormentus.com | password123 | Contador |
| support@tormentus.com | password123 | Soporte |

## Rutas

| Ruta | Descripción | Rol |
|------|-------------|-----|
| `/` | Landing page | Público |
| `/auth` | Login/Registro | Público |
| `/platform` | Plataforma de trading | Usuario |
| `/account` | Gestión de cuenta | Usuario |
| `/admin` | Panel de administración | Admin |
| `/operator` | Panel de operador | Operador |
| `/accountant` | Panel de contador | Contador |
| `/support` | Panel de soporte | Soporte |
