# Uso e instrucciones - Tormentus

Este documento resume cómo ejecutar localmente los servicios añadidos, usar `docker-compose`, y cómo funcionan los pipelines CI que se han añadido.

## Requisitos

- Docker & Docker Compose (recomendado)
- Go 1.25.x
- Node.js 18+ y npm
- Git

## Archivos relevantes

- `.env.example` — plantilla de variables de entorno (no contiene secretos). Copiar a `.env` para local.
- `docker-compose.yml` — orquesta `postgres`, `backend` y `frontend` para desarrollo.
- `.github/workflows/ci.yml` — workflow de CI: ejecuta tests Go y build del frontend.
- `CONTRIBUTING.md` — guía para contribuir.

### Nota sobre control de versiones
Si quieres evitar subir secretos o cambios locales accidentales, asegúrate de que `.gitignore` incluye `.env`, `docker-compose.override.yml` y otros archivos locales. Añadir una entrada no deshace el seguimiento de un archivo ya versionado (usa `git rm --cached <file>` si necesitas dejar de trackearlo).

## Ejecutar con Docker Compose (desarrollo)

1. Copia la plantilla de entorno:

```bash
cp .env.example .env
# en Windows PowerShell:
# copy .env.example .env
```

2. Inicia servicios:

```bash
docker-compose up -d --build
```

3. Ver logs:

```bash
docker-compose logs -f
```

4. Parar y eliminar contenedores:

```bash
docker-compose down
```

Si prefieres usar `docker-compose.override.yml` para ajustes locales, crea ese archivo y añade `docker-compose.override.yml` a `.gitignore`.

## Ejecutar local (sin Docker)

Backend:

```bash
# instalar dependencias
go mod download
# ejecutar
go run cmd/api/main.go
```

Frontend (desarrollo):

```bash
cd frontend
npm install
npm run dev
```

Frontend (build):

```bash
cd frontend
npm ci
npm run build
```

## Ver y ejecutar el pipeline CI localmente

El workflow está en `.github/workflows/ci.yml`. Para simular GitHub Actions localmente puedes usar `nektos/act` (opcional):

```bash
# instalar act
# https://github.com/nektos/act
act -j test-backend
```

Nota: ejecutar workflows con `act` requiere imágenes y permisos adicionales; usarlo sólo para pruebas locales.

## Qué hace el CI

- `test-backend`: instala Go, ejecuta `gofmt`, `go vet` y `go test ./...`.
- `build-frontend`: instala Node.js y construye la app en `frontend/`.
- `docker-compose-check`: tarea ligera para recordar validar `docker-compose.yml`.

## Buenas prácticas

- Nunca commitees `.env` con secretos reales.
- Mantén `.env.example` actualizado con las variables necesarias.
- Ejecuta tests y linters antes de abrir PRs.
- Si un archivo ya está versionado y quieres que deje de estarlo: `git rm --cached <file>` y luego commitea.

## Si quieres que haga esto por ti

Puedo:

- Añadir una plantilla de PR (`.github/PULL_REQUEST_TEMPLATE.md`).
- Añadir workflows adicionales (lint, security scan, release).
- Crear `docker-compose.override.yml` de ejemplo para desarrollo.

Indica qué prefieres y lo añado.
