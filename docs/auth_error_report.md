# Reporte: Corrección de errores en autenticación

Este documento resume los errores detectados durante la compilación inicial, la causa raíz de cada uno, y la solución aplicada con su justificación.

Fecha: 2025-11-05
Autor: (automatizado) Correcciones aplicadas

---

## Resumen de acciones

- Se corrigieron varios errores en `internal/handlers/auth.go` relacionados con nombres de variables, uso de mayúsculas/minúsculas (casing), llamadas a métodos de paquetes estándar (`time`, `http`), y respuestas JSON mal formadas.
- Se actualizó `cmd/api/main.go` para inicializar un `RefreshTokenManager` y pasar `nil` como `RefreshTokenRepository` (ya que no había implementación concreta en el repositorio) a `NewAuthHandler`.
- Se añadió la lógica para generar refresh tokens de forma opcional (cuando existe el manager) y almacenar condicionalmente si existe un repo.
- Se compiló exitosamente el proyecto después de las correcciones (`go build ./...`).

---

## Errores originales (capturados por `go build`)

Lista original extraída de la compilación:

```
internal\handlers\auth.go:58:2: declared and not used: token
internal\handlers\auth.go:70:21: undefined: accessToken
internal\handlers\auth.go:71:21: undefined: refreshToken
internal\handlers\auth.go:138:2: declared and not used: token
internal\handlers\auth.go:149:21: undefined: accessToken
internal\handlers\auth.go:150:21: undefined: refreshToken
internal\handlers\auth.go:197:75: undefined: time.now (but have Now)
internal\handlers\auth.go:203:17: h.UserRepo undefined (type *AuthHandler has no field or method UserRepo, but does have field userRepo)
internal\handlers\auth.go:203:48: c.Request.context undefined (type *http.Request has no field or method context, but does have method Context)
internal\handlers\auth.go:214:14: undefined: http.StatusOk (but have StatusOK)
internal\handlers\auth.go:214:14: too many errors
```

---

## Causa, análisis y soluciones aplicadas

A continuación se listan los errores individuales, la causa raíz y la solución concreta aplicada.

### 1) "declared and not used: token"
- Causa: En `Login` y `Register` se declaraba la variable `token` con el valor devuelto por el generador JWT, pero luego la respuesta JSON referenciaba otras variables (`accessToken`) en lugar de usar `token`. En Go, declarar variables sin usarlas produce error de compilación.
- Solución aplicada: Renombré la variable retornada por `Generate` a `accessToken` en `Login` para que el nombre sea el usado posteriormente; en `Register` usé la variable `token` directamente en la respuesta (y corregí la consistencia a `access_token`). Esto evita variables declaradas sin uso.
- Por qué esta solución: Mantener nombres claros (`accessToken`) mejora la legibilidad y evita errores por variables no usadas. También elimina duplicidad de nombres.

### 2) "undefined: accessToken" / "undefined: refreshToken"
- Causa: El código intentaba construir la respuesta JSON usando `accessToken` y `refreshToken` pero dichas variables no estaban definidas en el ámbito (scope) en el punto donde se usaban. Esto vino de cambios parciales en el código que quedaron inconsistentes.
- Solución aplicada: Generé `accessToken` usando `h.jwtManager.Generate(...)` y creé `refreshToken` mediante `h.refreshTokenManager.GenerateRefreshToken()` (cuando el manager está presente). Además, añadí lógica condicional para almacenar el refresh token si existía un repositorio.
- Por qué esta solución: Se debe garantizar que las variables existan antes de usarlas. Separar claramente la generación de access y refresh tokens refleja la arquitectura: el JWT manager emite el access token y un manager separado (o repo) maneja refresh tokens.

### 3) "undefined: time.now (but have Now)"
- Causa: Uso de `time.now()` (con `n` minúscula). En el paquete estándar `time` la función es `Now()` con N mayúscula.
- Solución aplicada: Reemplacé `time.now()` por `time.Now()` y usé `time.Now().Add(...)` donde fue necesario.
- Por qué esta solución: Es una corrección directa de casing en la API estándar de Go.

### 4) "h.UserRepo undefined (type *AuthHandler has no field or method UserRepo, but does have field userRepo)"
- Causa: Acceso a campo con nombre incorrecto (`UserRepo` en vez de `userRepo`). En Go el nombre es sensible a mayúsculas/minúsculas; además, se mezcló la convención de nombres.
- Solución aplicada: Unifiqué los nombres del struct `AuthHandler` a `userRepo`, `refreshTokenRepo`, `jwtManager` y `refreshTokenManager` (todos en camelCase no exportados). También actualicé el constructor `NewAuthHandler` para asignar correctamente las dependencias y actualicé todas las referencias a `h.userRepo`.
- Por qué esta solución: Mantener nombres consistentes evita errores de compilación y deja claro qué campos son internos (no exportados). También permite el uso correcto de los métodos en `userRepo`.

### 5) "c.Request.context undefined (type *http.Request has no field or method context, but does have method Context)"
- Causa: Se intentó usar `c.Request.context` con minúscula; el método correcto es `c.Request.Context()`.
- Solución aplicada: Reemplacé `c.Request.context` por `c.Request.Context()` en todas las llamadas.
- Por qué esta solución: Usar la API correcta del paquete `net/http` es necesario para pasar correctamente el context.

### 6) "undefined: http.StatusOk (but have StatusOK)"
- Causa: Uso de `http.StatusOk` (Ok en lugar de OK). La constante correcta es `http.StatusOK`.
- Solución aplicada: Reemplacé `http.StatusOk` por `http.StatusOK` y `http.StatusOk` por `http.StatusOK` en respuestas JSON.
- Por qué esta solución: Corrección directa de casing para la constante estándar.

### 7) Otros problemas: Respuestas JSON mal formadas y etiquetas JSON incorrectas
- Observaciones encontradas:
  - Falta de comas en literales `gin.H` que rompían el bloque de la respuesta.
  - Tags de struct con espacios erróneos: `json: "refresh_token" binding: "required"` en vez de `json:"refresh_token" binding:"required"`.
- Solución aplicada: Corregí la sintaxis de los literales `gin.H` (añadiendo comas y corchetes correctamente) y corregí las etiquetas `json`/`binding` en el `RefreshToken` request.
- Por qué esta solución: Errores de sintaxis impiden la compilación; corregir etiquetas permite que Gin haga el binding correctamente.

### 8) Ausencia de implementación de `RefreshTokenRepository`
- Causa: El proyecto define la interfaz `RefreshTokenRepository` pero no encuentra una implementación concreta (por ejemplo, un repositorio Postgres para refresh tokens). El `main` original no inicializaba ese repo.
- Solución aplicada: Hice que `AuthHandler` soporte un `refreshTokenRepo` opcional y añadí `refreshTokenManager` para la generación del token. En `main.go` inicialicé el `RefreshTokenManager` y pasé `nil` para el repo (documentando que el almacenamiento no está implementado). En el endpoint `RefreshToken`, si no existe el repo, se devuelve HTTP 501 Not Implemented.
- Por qué esta solución: Evita romper la compilación mientras se preserva la intención arquitectónica. Permite que la aplicación genere refresh tokens aunque no se persistan aún, y deja claro que la verificación/almacenamiento de refresh tokens requiere una implementación adicional.

---

## Cambios aplicados (lista de archivos y propósito)

- `internal/handlers/auth.go` — Correcciones de variables, nombres de campos, uso de time.Now, StatusOK, JSON responses, generación condicional de refresh tokens y verificación condicional del repo.
- `cmd/api/main.go` — Inicialización de `RefreshTokenManager` y llamada actualizada a `handlers.NewAuthHandler(..., nil, ..., refreshManager)`.
- (Nuevo) `docs/auth_error_report.md` — Este reporte explicando causas y soluciones.

---

## Validación

- Comando ejecutado: `go build ./...` desde la raíz del proyecto. Después de las correcciones, la compilación terminó sin errores (build limpio).
- No se cambiaron las interfaces públicas de repositorios existentes; se añadió soporte opcional para el `RefreshTokenRepository`.

---

## Recomendaciones siguientes

1. Implementar un `PostgresRefreshTokenRepository` (o Redis) que persista `models.RefreshToken` y permita la verificación en el endpoint `RefreshToken`.
2. Exponer el `tokenDuration` del `JWTManager` (o crear un método) para devolver `expires_in` dinámicamente en lugar de usar el valor hardcodeado `3600`.
3. Añadir tests unitarios para:
   - Login: generación de access y refresh tokens, y almacenamiento condicional.
   - Register: creación de usuario + tokens.
   - RefreshToken: flujo completo con un repo de prueba en memoria.
4. Ejecutar `gofmt` y un linter (`go vet`, `golangci-lint`) para detectar inconsistencias adicionales.

---

Si quieres, puedo:
- Implementar el `PostgresRefreshTokenRepository` y añadir migración SQL para la tabla `refresh_tokens`.
- Añadir tests unitarios y una implementación en memoria para acelerar el desarrollo.

Fin del reporte.
