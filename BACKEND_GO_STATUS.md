# Estado del Backend Go - Tormentus Trading Platform

## Resumen General

El backend está construido en **Go 1.25.1** usando **Gin** como framework web, **PostgreSQL** como base de datos (con pgx), y **WebSockets** para comunicación en tiempo real.

---

## Estructura del Proyecto

```
├── cmd/api/main.go              # Punto de entrada
├── pkg/config/                  # Configuración
├── internal/
│   ├── auth/                    # JWT y tokens
│   ├── database/                # Conexión DB y migraciones
│   ├── handlers/                # Controladores HTTP
│   ├── middleware/              # Middlewares
│   ├── models/                  # Modelos de datos
│   ├── repositories/            # Acceso a datos
│   ├── services/                # Servicios de negocio
│   ├── trading/                 # Motor de trading
│   └── websocket/               # WebSocket hub
├── web/                         # Templates HTML
└── migrations/                  # Migraciones SQL
```

---

## Componentes Implementados

### 1. Configuración (`pkg/config`)
- ✅ Carga de variables de entorno
- ✅ Configuración de DB (host, port, user, password, name)
- ✅ Puerto del servidor

### 2. Base de Datos (`internal/database`)
- ✅ Pool de conexiones PostgreSQL (pgxpool)
- ✅ Conexión sql.DB para migraciones
- ✅ Ejecución automática de migraciones al iniciar

### 3. Autenticación (`internal/auth`)
- ✅ JWT Manager (generación y verificación)
- ✅ Claims con userID y email
- ✅ Refresh Token Manager (estructura básica)

### 4. Middleware (`internal/middleware`)
- ✅ AuthMiddleware - Verificación de JWT
- ✅ AuthMiddlewareWithRepo - JWT + datos de usuario desde DB
- ✅ Extracción de userID, email, role, isVerified al contexto

### 5. Modelos (`internal/models`)

| Modelo | Campos Principales |
|--------|-------------------|
| **User** | id, email, password, firstName, lastName, role, balance, demoBalance, isVerified, verificationStatus, totalDeposits, totalWithdrawals, totalTrades, winRate, consecutiveWins |
| **Trade** | id, userID, symbol, direction (up/down), amount, entryPrice, exitPrice, duration, status, payout, profit, isManipulated, isDemo, tournamentID |
| **TradeStats** | totalTrades, wins, losses, winRate, totalProfit, totalVolume |
| **Tournament** | id, name, description, entryFee, startingBalance, prizePool, maxParticipants, status, startsAt, endsAt |
| **TournamentParticipant** | id, tournamentID, userID, balance, profit, tradesCount, winsCount, rank |
| **PriceData** | symbol, price, bid, ask, high24h, low24h, change24h, volume |
| **CandleData** | symbol, open, high, low, close, volume |
| **UserVerification** | id, userID, documentType, documentFront, documentBack, selfieWithDoc, status, rejectionReason |

**Roles de Usuario:**
- `user`, `admin`, `operator`, `accountant`, `support`

### 6. Repositorios (`internal/repositories`)

#### UserRepository
- ✅ `CreateUser()` - Crear usuario
- ✅ `GetUserByEmail()` - Buscar por email
- ✅ `GetUserByID()` - Buscar por ID
- ✅ `UpdateBalance()` - Actualizar balance (live/demo)
- ✅ `UpdateTradeStats()` - Actualizar estadísticas de trading
- ✅ `GetBalance()` - Obtener balance

#### TradeRepository (NUEVO)
- ✅ `CreateTrade()` - Crear operación en DB
- ✅ `GetTradeByID()` - Obtener trade por ID
- ✅ `GetUserTrades()` - Historial de trades con paginación
- ✅ `GetActiveTrades()` - Trades activos del usuario
- ✅ `UpdateTrade()` - Actualizar resultado del trade
- ✅ `GetUserTradeStats()` - Estadísticas de trading
- ✅ `GetRecentWinners()` - Ganadores recientes (para algoritmo)

### 7. Handlers (`internal/handlers`)

#### AuthHandler
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/auth/login` | POST | Login con email/password |
| `/api/auth/register` | POST | Registro de usuario |
| `/api/protected/profile` | GET | Obtener perfil (autenticado) |

#### TradingHandler (ACTUALIZADO)
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/prices` | GET | Todos los precios |
| `/api/prices/:symbol` | GET | Precio de un símbolo |
| `/api/markets` | GET | Lista de mercados |
| `/api/markets/:market/prices` | GET | Precios por mercado |
| `/api/protected/trades` | POST | Colocar operación (persiste en DB) |
| `/api/protected/trades/active` | GET | Trades activos del usuario |
| `/api/protected/trades/history` | GET | Historial de trades (NUEVO) |
| `/api/protected/trades/stats` | GET | Estadísticas de trading (NUEVO) |
| `/api/protected/trades/:id` | DELETE | Cancelar trade |

#### TournamentHandler
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/tournaments` | GET | Lista de torneos |
| `/api/tournaments/:id` | GET | Detalle de torneo |
| `/api/tournaments/:id/leaderboard` | GET | Ranking del torneo |
| `/api/tournaments/prizes` | GET | Distribución de premios |
| `/api/protected/tournaments/:id/join` | POST | Unirse a torneo |
| `/api/protected/tournaments/my` | GET | Mis torneos |

#### VerificationHandler
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/protected/verification/status` | GET | Estado de verificación |
| `/api/protected/verification/check` | GET | Verificar si puede operar |
| `/api/protected/verification/submit` | POST | Enviar documentos |
| `/api/admin/verifications/pending` | GET | Verificaciones pendientes |
| `/api/admin/verifications/approve` | POST | Aprobar verificación |
| `/api/admin/verifications/reject` | POST | Rechazar verificación |

#### WebSocketHandler
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/ws` | WS | Conexión WebSocket |
| `/api/ws/stats` | GET | Estadísticas de conexiones |

### 8. Servicios (`internal/services`)

#### PriceService
- ✅ Generación de precios simulados (38 activos)
- ✅ Actualización cada 500ms
- ✅ Variación aleatoria ±0.1%
- ✅ Broadcast via WebSocket
- ✅ Soporte para manipulación de precios

**Mercados soportados:**
- **Crypto:** BTC, ETH, BNB, SOL, XRP, DOGE, ADA, AVAX, DOT, LINK
- **Forex:** EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD, USD/CAD, NZD/USD, EUR/GBP, EUR/JPY, GBP/JPY
- **Commodities:** XAU, XAG, WTI, BRENT, XPT, XPD, NG, COPPER
- **Stocks:** SPY, QQQ, DIA, AAPL, GOOGL, MSFT, AMZN, TSLA, NVDA, META

### 9. Motor de Trading (`internal/trading`)

#### TradingEngine (ACTUALIZADO)
- ✅ Colocación de trades con persistencia en DB
- ✅ Procesamiento de trades expirados
- ✅ Actualización de balance en DB al cerrar trade
- ✅ Actualización de estadísticas de usuario
- ✅ Cancelación de trades
- ✅ Notificación de resultados via WebSocket
- ✅ Limpieza periódica de registros

#### TradingAlgorithm (Manipulación)
- ✅ **20% ganadores** (15% pequeños inversores, 5% grandes)
- ✅ **80% perdedores**
- ✅ Solo 2% de ganadores anteriores pueden repetir en 24h
- ✅ Historial de ganadores por usuario
- ✅ Manipulación de precios para asegurar resultados

### 10. WebSocket (`internal/websocket`)

#### Hub
- ✅ Registro/desregistro de clientes
- ✅ Suscripción por símbolo
- ✅ Broadcast de precios
- ✅ Broadcast de velas
- ✅ Broadcast de resultados de trades
- ✅ Heartbeat cada 30 segundos

#### Client
- ✅ Lectura de mensajes (subscribe/unsubscribe)
- ✅ Escritura de mensajes
- ✅ Ping/Pong para mantener conexión

---

## Frontend - Conexión con Backend

### Autenticación (`useAuth.ts`)
- ✅ Login con backend real (fallback a mock si no disponible)
- ✅ Registro con backend real
- ✅ Refresh de datos de usuario desde backend
- ✅ Persistencia de token en localStorage

### Trading (`Platform.tsx`)
- ✅ Colocación de trades via API backend
- ✅ Verificación de balance antes de operar
- ✅ Actualización de balance local al abrir trade
- ✅ Fallback a simulación local si backend no disponible
- ✅ Soporte para cuenta demo y live

### API Client (`api.ts`)
- ✅ Interceptor de autenticación (Bearer token)
- ✅ Manejo de errores 401 (logout automático)
- ✅ Endpoints de trading actualizados

---

## Dependencias Principales

```go
github.com/gin-gonic/gin v1.9.1        // Framework web
github.com/golang-jwt/jwt/v5 v5.3.0    // JWT
github.com/gorilla/websocket v1.5.1    // WebSocket
github.com/jackc/pgx/v5 v5.7.6         // PostgreSQL driver
golang.org/x/crypto v0.43.0            // Bcrypt
```

---

## Rutas Disponibles

### Públicas
```
GET  /                              # Landing page
GET  /login                         # Página de login
GET  /register                      # Página de registro
GET  /dashboard                     # Dashboard
GET  /ws                            # WebSocket
POST /api/auth/login                # Login
POST /api/auth/register             # Registro
GET  /api/prices                    # Todos los precios
GET  /api/prices/:symbol            # Precio específico
GET  /api/markets                   # Lista de mercados
GET  /api/markets/:market/prices    # Precios por mercado
GET  /api/tournaments               # Lista de torneos
GET  /api/tournaments/:id           # Detalle de torneo
GET  /api/tournaments/:id/leaderboard
GET  /api/tournaments/prizes
GET  /api/ws/stats                  # Stats WebSocket
```

### Protegidas (requieren JWT)
```
GET    /api/protected/profile
GET    /api/protected/verification/status
GET    /api/protected/verification/check
POST   /api/protected/verification/submit
POST   /api/protected/trades
GET    /api/protected/trades/active
GET    /api/protected/trades/history    # NUEVO
GET    /api/protected/trades/stats      # NUEVO
DELETE /api/protected/trades/:id
POST   /api/protected/tournaments/:id/join
GET    /api/protected/tournaments/my
```

### Admin
```
GET  /api/admin/verifications/pending
POST /api/admin/verifications/approve
POST /api/admin/verifications/reject
```

---

## Pendiente por Implementar

### Alta Prioridad
- [ ] Repositorios para torneos, verificaciones (actualmente en memoria)
- [ ] Persistencia de torneos en DB
- [ ] Refresh tokens con Redis/DB
- [ ] Middleware de verificación de roles (admin, operator, etc.)
- [ ] Wallet/Balance management
- [ ] Depósitos y retiros

### Media Prioridad
- [ ] Conexión a APIs reales de precios (Binance, etc.)
- [ ] Sistema de bonos
- [ ] Sistema de referidos
- [ ] Notificaciones push
- [ ] Chat de soporte

### Baja Prioridad
- [ ] Rate limiting
- [ ] Logging estructurado
- [ ] Métricas/Monitoring
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Documentación Swagger/OpenAPI

---

## Cómo Ejecutar

```bash
# Variables de entorno
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=tormentus_user
export DB_PASSWORD=tormentus_password
export DB_NAME=tormentus_dev
export SERVER_PORT=8080

# Ejecutar backend
go run cmd/api/main.go

# Ejecutar frontend (en otra terminal)
cd frontend
npm run dev
```

---

## Migraciones

El sistema ejecuta automáticamente las migraciones en `./migrations/` al iniciar.

**Módulos de migraciones:**
- `migrations/cliente/` - 91 tablas
- `migrations/contador/` - 96 tablas
- `migrations/operador/` - 146 tablas
- `migrations/soporte/` - 111 tablas
