# Contribuir a Tormentus

Gracias por tu interés en contribuir. Sigue estas pautas para acelerar las revisiones y facilitar la integración.

## Flujo de trabajo

1. Fork del repositorio.
2. Crea una rama descriptiva:
   - `feature/<descripción-corta>`
   - `fix/<descripción-corta>`
   - `chore/<descripción-corta>`
3. Realiza cambios con commits atómicos y mensajes claros.
4. Abre un Pull Request desde tu rama hacia `main` o la rama de desarrollo indicada.

## Formato de commits

- Usa mensajes cortos y descriptivos.
- Ejemplos:
  - `feat(auth): add refresh token rotation`
  - `fix(api): validate email on registration`
  - `chore(ci): add github actions workflow`

## Requisitos antes de abrir un PR

- Ejecuta `go fmt ./...` y `go vet ./...` para el backend.
- Ejecuta `npm run build` en `frontend` si modificas código del frontend.
- Añade o actualiza tests unitarios para cambios relevantes.
- Asegúrate de no comprometer secretos (`.env`, claves, tokens).

## Pruebas y linters

- Backend:
  ```bash
  go test ./... -v
  go fmt ./...
  go vet ./...
  ```

- Frontend:
  ```bash
  cd frontend
  npm install
  npm run build
  # (añade comandos de test si hay una suite)
  ```

## Estilo de código

- Backend: sigue convenciones de Go (gofmt, goimports).
- Frontend: usa lint/format configurado en el proyecto (prettier/eslint si aplica).

## Pull Request

- Describe claramente el propósito del cambio y los pasos para probarlo.
- Indica si el cambio requiere migraciones de BD y añade instrucciones.
- Si el PR afecta al schema, incluye cambios en `migrations/` siguiendo la convención del proyecto.

## Responsabilidades del revisor

- Verificar que los tests pasan y que no se exponen secretos.
- Revisar seguridad y validaciones para cambios en auth/DB.
- Sugerir mejoras y pequeñas modificaciones antes del merge.

## Código de Conducta

Respetamos a todos los colaboradores. Por favor, sigue las normas básicas de respeto y colaboración. Para comportamiento problemático, abre un issue privado al maintainer.

---

Si quieres, puedo añadir una plantilla de Pull Request (`.github/PULL_REQUEST_TEMPLATE.md`) y flujos de CI (GitHub Actions) básicos. Indica si lo quieres y qué checks mínimos deseas (tests backend, build frontend, linting, etc.).
