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
- **Base de Datos**: PostgreSQL 17
- **Autenticación**: JWT con bcrypt para hashing de contraseñas
- **Frontend**: HTML5, CSS3, Templates Go
- **Contenedorización**: Docker & Docker Compose

## 📁 Estructura del Proyecto

```
tormentus/
├── cmd/api/                 # Punto de entrada de la aplicación
│   └── main.go
├── internal/
│   ├── handlers/            # Handlers HTTP
│   │   └── auth.go
│   ├── models/              # Modelos de datos
│   │   └── user.go
│   └── database/            # Configuración de base de datos
│       └── postgres.go
├── migrations/              # Scripts de migración de base de datos
│   └── 001_create_users_table.sql
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

- `POST /api/auth/register` - Registro de usuario (con validación y hash de contraseña)
- `POST /api/auth/login` - Inicio de sesión (con validación de email)
- `GET /api/auth/profile` - Obtener perfil de usuario

### Base de Datos

- Conexión a PostgreSQL implementada
- Migraciones automáticas para creación de tablas de usuarios

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

- `DATABASE_URL`: URL de conexión a PostgreSQL
- `JWT_SECRET`: Clave secreta para JWT
- `PORT`: Puerto del servidor (por defecto 8080)

## 🧪 Estado del Proyecto

- ✅ Estructura básica implementada
- ✅ Autenticación básica (registro y login implementados)
- ✅ Conexión a base de datos PostgreSQL
- ✅ Migraciones de base de datos
- ✅ Frontend landing page
- ✅ Configuración Docker
- 🔄 JWT tokens reales (mock actual)
- 🔄 Funcionalidades de trading (pendiente)

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

---

**Nota**: Este proyecto está en desarrollo activo. Las funcionalidades pueden cambiar sin previo aviso.