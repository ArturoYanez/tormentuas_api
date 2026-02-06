# Tormentus

Plataforma de trading cripto avanzada construida con Go y Gin, diseñada para ofrecer operaciones seguras y de alta velocidad.

## 🚀 Características

- **Ejecución Rápida**: Latencia menor a 1ms
- **Seguridad Bancaria**: Encriptación de grado militar
- **Análisis Avanzado**: Herramientas profesionales de trading
- **API RESTful**: Endpoints limpios y bien documentados
- **Frontend Moderno**: Interfaz web responsiva con CSS moderno

## 🛠️ Tecnologías Utilizadas

- **Backend**: Go 1.25.1 con Gin Framework
- **Base de Datos**: PostgreSQL 17 con pgx driver
- **Autenticación**: JWT (golang-jwt/jwt/v5) + Refresh Tokens con bcrypt para hashing de contraseñas
- **Arquitectura**: Patrón Repository, Dependency Injection, Clean Architecture
- **Frontend**: HTML5, CSS3, Templates Go
- **Contenedorización**: Docker & Docker Compose
- **Configuración**: Variables de entorno con godotenv

## 📁 Estructura del Proyecto

```
tormentus/
├── cmd/api/                 # Punto de entrada de la aplicación
│   └── main.go
├── internal/
│   ├── auth/                # Gestión de autenticación JWT y Refresh Tokens
│   │   ├── jwt.go
│   │   └── refresh_token.go
│   ├── database/            # Configuración y migraciones de BD
│   │   ├── migrate.go
│   │   └── postgres.go
│   ├── handlers/            # Handlers HTTP
│   │   └── auth.go
│   ├── middleware/          # Middlewares de autenticación
│   │   └── auth.go
│   ├── models/              # Modelos de datos
│   │   └── user.go
│   └── repositories/        # Capa de acceso a datos
│       ├── postgres_user_repository.go
│       ├── refresh_token_repository.go
│       └── user_repository.go
├── migrations/              # Scripts de migración de base de datos
│   └── 001_create_users_table.sql
# Tormentus

Plataforma de trading por módulos desarrollada en Go (Gin) con frontend en React/Vite.

Este README contiene instrucciones de instalación, ejecución, documentación básica del API y un plan de próximos pasos recomendados para el desarrollo.

---

## Resumen rápido

- Backend: Go 1.25.1 + Gin
- Base de datos: PostgreSQL (pgx)
- Frontend: React + Vite + TypeScript
- Autenticación: JWT + Refresh Tokens
- Migraciones: carpeta `migrations/` (múltiples scripts SQL)

---

## Estructura principal

- `cmd/api/` — Entrada del servidor (`main.go`)
- `internal/` — Código del backend (auth, database, handlers, middleware, models, repositories, services, trading, websocket)
- `migrations/` — Scripts SQL (gran historial)
- `frontend/` — Aplicación React (Vite + TypeScript)
- `web/` — Plantillas HTML / recursos estáticos del servidor
- `pkg/` — Paquetes reutilizables (p. ej. `pkg/config`)
- `go.mod` — Módulo y dependencias Go

---

## Requisitos

- Go 1.25.1 (para desarrollo del backend)
- Node.js 18+ y npm (para el frontend)
- PostgreSQL 17 (o servicio equivalente vía Docker)
- Git

Recomendado: Docker + Docker Compose para reproducibilidad en desarrollo y CI.

---

## Quickstart (desarrollo)

Clona y arranca backend y frontend en dos terminales:

Backend:
```bash
git clone <url-del-repo>
cd <repo-root>
go mod download
go run cmd/api/main.go
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Endpoints típicos:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080`

---

## Variables de entorno recomendadas

Crear `.env` (no commitear) con al menos:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=tormentus_user
DB_PASSWORD=tormentus_password
DB_NAME=tormentus_dev
SERVER_PORT=8080
JWT_SECRET=change_me_in_production
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Si aún no existe, añadir un `.env.example` al repo con estos valores (placeholder).

---

## Migraciones

La carpeta `migrations/` contiene numerosos archivos SQL (histórico extenso). El backend tiene lógica para ejecutar migraciones al arrancar; recomendamos:

- Revisar y consolidar migraciones antiguas cuando sea posible.
- Ejecutar migraciones en entorno de staging antes de producción.

Para contar migraciones localmente:

```bash
ls -1 migrations | wc -l
```

---

## API (resumen)

- `POST /api/auth/register` — Registrar usuario
- `POST /api/auth/login` — Login (devuelve JWT + refresh token)
- `POST /api/auth/refresh` — Refrescar token
- `GET /api/protected/profile` — Ruta protegida (requiere Authorization header)

Usar header: `Authorization: Bearer <token>`

---

## Estado del proyecto (observaciones)

- Backend: estructura modular en `internal/`.
- Autenticación: implementada con JWT y refresh tokens.
- Migraciones: existe un gran histórico SQL en `migrations/`.
- Frontend: proyecto React + Vite con `frontend/package.json`.
- `docker-compose.yml` aparece en la documentación pero no se encontró en el repo raíz; confirmar si debe añadirse.

---

## Próximos pasos recomendados (priorizados)

1. Añadir o confirmar `docker-compose.yml` y `Dockerfile`s (backend y frontend).
2. Añadir `.env.example` y un `docs/ENV.md` describiendo variables.
3. Implementar tests y pipeline CI (GitHub Actions) para `go test ./...` y `npm run build`.
4. Añadir OpenAPI/Swagger para documentar el API.
5. Auditar y consolidar migraciones grandes; asegurar idempotencia.
6. Añadir observabilidad: logs estructurados, métricas (Prometheus) y trazas.
7. Completar y testear el módulo `trading/` y el repositorio de refresh tokens.
8. Agregar `CONTRIBUTING.md` y plantilla de PR/ISSUE.

---

## Checklist para PRs

- Tests añadidos o actualizado coverage
- Documentación actualizada (README/docs)
- Migraciones verificadas
- No secrets commiteados

---

## Cómo contribuir

1. Fork → rama descriptiva → commits limpios → PR
2. Incluye descripción y pasos para probar los cambios

---

## Contacto

Abrir issues en el repositorio para bugs o solicitudes.

---

Si quieres, puedo:

- Añadir un `docker-compose.yml` de ejemplo.
- Crear `.env.example` y `CONTRIBUTING.md`.
- Configurar un pipeline de GitHub Actions básico.

Indica qué prefieres que haga a continuación.