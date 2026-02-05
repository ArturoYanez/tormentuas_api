# Guía de Configuración - Tormentus Trading Platform

Esta guía te ayudará a configurar el proyecto desde cero.

## 📋 Requisitos Previos

### Software Necesario

- **Go 1.25.1 o superior** - [Descargar](https://golang.org/dl/)
- **PostgreSQL 17** - [Descargar](https://www.postgresql.org/download/)
- **Node.js 18+ y npm** - [Descargar](https://nodejs.org/)
- **Git** - [Descargar](https://git-scm.com/)

### Opcional (Recomendado)

- **Docker & Docker Compose** - [Descargar](https://www.docker.com/)
- **Visual Studio Code** - [Descargar](https://code.visualstudio.com/)
- **Postman o Insomnia** - Para probar la API

---

## 🚀 Instalación Rápida

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd tormentus
```

### 2. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar el archivo .env con tus valores
# En Windows: notepad .env
# En Linux/Mac: nano .env
```

### 3. Configurar Base de Datos

#### Opción A: Con Docker (Recomendado)

```bash
# Iniciar PostgreSQL con Docker
docker-compose up -d postgres

# Verificar que esté corriendo
docker-compose ps
```

#### Opción B: PostgreSQL Local

```bash
# Crear base de datos
psql -U postgres
CREATE DATABASE tormentus_dev;
CREATE USER tormentus_user WITH PASSWORD 'tormentus_password';
GRANT ALL PRIVILEGES ON DATABASE tormentus_dev TO tormentus_user;
\q
```

### 4. Instalar Dependencias del Backend

```bash
# Descargar módulos de Go
go mod download

# Verificar instalación
go mod verify
```

### 5. Instalar Dependencias del Frontend

```bash
# Ir al directorio del frontend
cd frontend

# Instalar dependencias
npm install

# Volver al directorio raíz
cd ..
```

### 6. Ejecutar Migraciones

Las migraciones se ejecutan automáticamente al iniciar el backend, pero puedes verificarlas:

```bash
# Las migraciones están en ./migrations/
# Se ejecutarán automáticamente al iniciar el servidor
```

### 7. Iniciar el Proyecto

#### Terminal 1: Backend

```bash
# Desde el directorio raíz
go run cmd/api/main.go
```

Deberías ver:
```
Conectado a PostgreSQL exitosamente
Iniciando migraciones... Total de archivos: 485
Migraciones completadas: 485 ejecutadas, 0 omitidas
WebSocket Hub iniciado
Servicio de precios iniciado
Repositorios inicializados
Motor de trading iniciado
Servidor iniciado en http://localhost:8080
```

#### Terminal 2: Frontend

```bash
# Desde el directorio raíz
cd frontend
npm run dev
```

Deberías ver:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 8. Verificar Instalación

Abre tu navegador y visita:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080/api/prices
- **WebSocket**: ws://localhost:8080/ws

---

## 🔧 Configuración Detallada

### Variables de Entorno Importantes

#### Base de Datos

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=tormentus_user
DB_PASSWORD=tormentus_password
DB_NAME=tormentus_dev
```

#### JWT

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=24h
```

#### CORS

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Usuarios por Defecto

El sistema crea automáticamente estos usuarios (password: `password123`):

| Email | Password | Rol |
|-------|----------|-----|
| admin@tormentus.com | password123 | admin |
| operator@tormentus.com | password123 | operator |
| accountant@tormentus.com | password123 | accountant |
| support@tormentus.com | password123 | support |
| user@tormentus.com | password123 | client |

---

## 🐳 Configuración con Docker

### Docker Compose Completo

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ CUIDADO: Elimina datos)
docker-compose down -v
```

### Servicios Disponibles

- **PostgreSQL**: Puerto 5432
- **Backend Go**: Puerto 8080
- **Frontend React**: Puerto 5173 (si se configura)

---

## 🧪 Verificación de la Instalación

### 1. Verificar Backend

```bash
# Probar endpoint público
curl http://localhost:8080/api/prices

# Probar login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@tormentus.com","password":"password123"}'
```

### 2. Verificar Base de Datos

```bash
# Conectar a PostgreSQL
psql -h localhost -U tormentus_user -d tormentus_dev

# Ver tablas
\dt

# Ver migraciones ejecutadas
SELECT * FROM schema_migrations ORDER BY executed_at DESC LIMIT 10;

# Salir
\q
```

### 3. Verificar Frontend

Abre http://localhost:5173 en tu navegador y verifica:

- ✅ La página de inicio carga correctamente
- ✅ Puedes navegar a /login
- ✅ Puedes hacer login con user@tormentus.com / password123
- ✅ El dashboard carga después del login

---

## 🔍 Solución de Problemas

### Error: "Cannot connect to database"

**Solución:**
```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps
# o
sudo systemctl status postgresql

# Verificar credenciales en .env
cat .env | grep DB_
```

### Error: "Port 8080 already in use"

**Solución:**
```bash
# Cambiar puerto en .env
SERVER_PORT=8081

# O matar el proceso que usa el puerto
# Windows:
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:8080 | xargs kill -9
```

### Error: "Migrations failed"

**Solución:**
```bash
# Resetear migraciones (⚠️ SOLO EN DESARROLLO)
psql -h localhost -U tormentus_user -d tormentus_dev
DROP TABLE schema_migrations;
\q

# Reiniciar backend
go run cmd/api/main.go
```

### Error: "Module not found" en Frontend

**Solución:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Error: "go.mod not found"

**Solución:**
```bash
# Inicializar módulo Go
go mod init tormentus
go mod tidy
```

---

## 📚 Estructura de Directorios

```
tormentus/
├── cmd/api/              # Punto de entrada del backend
├── internal/             # Código interno del backend
│   ├── auth/            # Autenticación JWT
│   ├── database/        # Conexión y migraciones
│   ├── handlers/        # Controladores HTTP
│   ├── middleware/      # Middlewares
│   ├── models/          # Modelos de datos
│   ├── repositories/    # Acceso a datos
│   ├── services/        # Lógica de negocio
│   ├── trading/         # Motor de trading
│   └── websocket/       # WebSocket
├── pkg/                 # Paquetes públicos
│   └── config/         # Configuración
├── migrations/          # Migraciones SQL (485+ archivos)
├── frontend/            # Frontend React
│   ├── src/            # Código fuente
│   └── public/         # Archivos estáticos
├── web/                 # Templates HTML (opcional)
├── .env.example         # Ejemplo de variables de entorno
├── .gitignore          # Archivos ignorados por Git
├── go.mod              # Dependencias Go
├── go.sum              # Checksums de dependencias
└── docker-compose.yml  # Configuración Docker
```

---

## 🔐 Seguridad

### Antes de Producción

1. **Cambiar JWT_SECRET** en `.env`
2. **Cambiar contraseñas** de usuarios por defecto
3. **Configurar HTTPS** (usar nginx o Caddy)
4. **Habilitar rate limiting**
5. **Configurar firewall** (solo puertos necesarios)
6. **Backup automático** de base de datos
7. **Monitoreo y logs** (Sentry, Prometheus)

### Recomendaciones

- ❌ **NO** commitear archivos `.env`
- ❌ **NO** usar contraseñas por defecto en producción
- ❌ **NO** exponer puerto de PostgreSQL públicamente
- ✅ **SÍ** usar HTTPS en producción
- ✅ **SÍ** hacer backups regulares
- ✅ **SÍ** monitorear logs de seguridad

---

## 📖 Recursos Adicionales

- [Documentación del Backend](BACKEND_GO_STATUS.md)
- [Documentación de Migraciones](MIGRATION_FIX_SUMMARY.md)
- [README Principal](README.md)

---

## 🆘 Soporte

Si encuentras problemas:

1. Revisa esta guía completa
2. Verifica los logs del backend y frontend
3. Consulta la documentación en `/docs`
4. Abre un issue en GitHub

---

**¡Listo!** Ahora deberías tener el proyecto funcionando correctamente. 🎉
