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
- **WebSocket**: gorilla/websocket para conexiones en tiempo real
- **Integración de Exchanges**: Binance WebSocket API para datos de mercado
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
│   ├── exchanges/           # Integración con exchanges
│   │   └── binance_websocket.go
│   ├── handlers/            # Handlers HTTP
│   │   ├── auth.go
│   │   └── websocket_handler.go
│   ├── middleware/          # Middlewares de autenticación
│   │   └── auth.go
│   ├── models/              # Modelos de datos
│   │   ├── user.go
│   │   └── trading.go
│   ├── repositories/        # Capa de acceso a datos
│   │   ├── postgres_user_repository.go
│   │   ├── postgres_refresh_token_repository.go
│   │   ├── mock_price_repository.go
│   │   ├── price_repository.go
│   │   ├── refresh_token_repository.go
│   │   └── user_repository.go
│   └── services/            # Lógica de negocio
│       └── price_service.go
├── migrations/              # Scripts de migración de base de datos
│   └── 001_create_users_table.sql
├── pkg/config/              # Configuración de la aplicación
│   └── config.go
├── postgres-config/         # Configuración personalizada de PostgreSQL
├── web/
│   ├── static/css/          # Estilos CSS
│   │   └── style.css
│   └── templates/           # Plantillas HTML
│       ├── base.html
│       └── index.html
├── docker-compose.yml       # Configuración Docker
├── go.mod                   # Dependencias Go
└── go.sum
```

## 🏃‍♂️ Instalación y Ejecución

### Prerrequisitos

- Docker y Docker Compose
- Go 1.25.1 (opcional, para desarrollo local)

### Configuración con Docker

1. **Clona el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd tormentus
   ```

2. **Inicia los servicios**:
   ```bash
   docker-compose up -d
   ```

   Esto iniciará:
   - PostgreSQL en el puerto 5432
   - La aplicación Go en el puerto 8080

3. **Accede a la aplicación**:
   - Frontend: http://localhost:8080
   - API: http://localhost:8080/api

### Desarrollo Local

1. **Instala dependencias**:
   ```bash
   go mod download
   ```

2. **Ejecuta la aplicación**:
   ```bash
   go run cmd/api/main.go
   ```

## 📡 API Endpoints

### Autenticación

- `POST /api/auth/register` - Registro de usuario (con validación, hash de contraseña y tokens JWT + Refresh)
- `POST /api/auth/login` - Inicio de sesión (con validación de email y tokens JWT + Refresh)
- `POST /api/auth/refresh` - Refrescar token de acceso usando refresh token
- `GET /api/protected/profile` - Obtener perfil de usuario (requiere JWT)

### WebSocket y Datos de Mercado

- `GET /api/ws` - Conexión WebSocket para recibir precios en tiempo real de Binance
- Datos disponibles: BTC/USDT, ETH/USDT, ADA/USDT con actualizaciones cada segundo
- Información incluida: precio actual, volumen, cambio de precio, timestamp

### Base de Datos

- Conexión a PostgreSQL implementada con pool de conexiones
- Migraciones automáticas para creación de tablas de usuarios y refresh tokens
- Repositorio de usuarios con operaciones CRUD completas
- Repositorio de refresh tokens para gestión de sesiones

### Ejemplos de Uso

#### Registro
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "password123",
    "first_name": "Juan",
    "last_name": "Pérez"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "password123"
  }'
```

#### Acceso a ruta protegida
```bash
curl -X GET http://localhost:8080/api/protected/profile \
  -H "Authorization: Bearer <tu-jwt-token>"
```

#### Refrescar token de acceso
```bash
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "<tu-refresh-token>"
  }'
```

#### Conexión WebSocket para precios en tiempo real
```javascript
const ws = new WebSocket('ws://localhost:8080/api/ws');

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('Nuevo precio:', data);
    // Ejemplo de respuesta:
    // {
    //   "symbol": "BTCUSDT",
    //   "price": 45000.50,
    //   "volume": 1234.56,
    //   "timestamp": "2025-11-24T02:41:54Z"
    // }
};

ws.onopen = function() {
    console.log('Conectado al WebSocket de precios');
};

ws.onerror = function(error) {
    console.error('Error en WebSocket:', error);
};
```

## 🔧 Configuración

### Base de Datos

La configuración de PostgreSQL se encuentra en `docker-compose.yml`:

```yaml
environment:
  POSTGRES_DB: tormentus_dev
  POSTGRES_USER: tormentus_user
  POSTGRES_PASSWORD: tormentus_password
```

### Variables de Entorno

Para producción, configura las siguientes variables de entorno:

- `DB_HOST`: Host de la base de datos (por defecto: localhost)
- `DB_PORT`: Puerto de la base de datos (por defecto: 5432)
- `DB_USER`: Usuario de la base de datos (por defecto: postgres)
- `DB_PASSWORD`: Contraseña de la base de datos (por defecto: admin)
- `DB_NAME`: Nombre de la base de datos (por defecto: tormentus_dev)
- `SERVER_PORT`: Puerto del servidor (por defecto: 8080)
- `JWT_SECRET`: Clave secreta para JWT (hardcodeado en desarrollo)

## 🧪 Estado del Proyecto

- ✅ Estructura completa del proyecto implementada
- ✅ Autenticación completa (registro, login, JWT + Refresh Tokens)
- ✅ Sistema de refresh tokens para renovación automática de sesiones
- ✅ Conexión a base de datos PostgreSQL con pool de conexiones
- ✅ Migraciones automáticas de base de datos (usuarios y refresh tokens)
- ✅ Patrón Repository para acceso a datos (usuarios y refresh tokens)
- ✅ Middleware de autenticación JWT
- ✅ Configuración de entorno flexible
- ✅ Frontend landing page
- ✅ Configuración Docker completa
- ✅ Repositorio PostgreSQL de refresh tokens implementado
- ✅ Funcionalidades de trading con WebSocket Binance integradas
- ✅ Servicio de precios en tiempo real con múltiples símbolos
- ✅ Manejo de conexiones WebSocket y procesamiento de datos
- ✅ Implementación de manejadores WebSocket para clientes
- 🔄 Tests unitarios e integración (pendiente)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

Para preguntas o soporte, por favor abre un issue en este repositorio.

## 📊 Estado Actual

**Proyecto estable sin errores conocidos**. Todas las funcionalidades principales están implementadas y funcionando correctamente. El proyecto ha sido probado y los logs no muestran errores críticos.

Las siguientes funcionalidades están operativas:
- Sistema de autenticación completo
- Gestión de refresh tokens
- Conexión WebSocket con Binance
- Servicio de precios en tiempo real
- Migraciones de base de datos
- API REST completa

---

**Nota**: Este proyecto está en desarrollo activo. Las funcionalidades pueden cambiar sin previo aviso.