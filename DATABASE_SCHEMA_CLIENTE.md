# Esquema de Base de Datos - Usuario Cliente

Este documento detalla todas las tablas necesarias para soportar las funcionalidades del usuario cliente en la plataforma de trading.

---

## 1. USUARIOS Y AUTENTICACIÓN

### `users`
Tabla principal de usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| email | VARCHAR(255) UNIQUE | Email del usuario |
| password_hash | VARCHAR(255) | Contraseña hasheada |
| name | VARCHAR(100) | Nombre completo |
| phone | VARCHAR(20) | Teléfono |
| country | VARCHAR(50) | País |
| avatar_url | VARCHAR(500) | URL del avatar |
| level | ENUM('bronce','plata','oro','platino','diamante') | Nivel de usuario |
| role | ENUM('client','operator','support','accountant','admin') | Rol |
| status | ENUM('active','suspended','banned') | Estado de cuenta |
| email_verified | BOOLEAN DEFAULT FALSE | Email verificado |
| phone_verified | BOOLEAN DEFAULT FALSE | Teléfono verificado |
| two_factor_enabled | BOOLEAN DEFAULT FALSE | 2FA activo |
| two_factor_secret | VARCHAR(100) | Secreto 2FA |
| referral_code | VARCHAR(20) UNIQUE | Código de referido |
| referred_by | INTEGER REFERENCES users(id) | Referido por |
| created_at | TIMESTAMP | Fecha de registro |
| updated_at | TIMESTAMP | Última actualización |
| last_login_at | TIMESTAMP | Último login |

### `user_sessions`
Sesiones activas del usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| device | VARCHAR(100) | Dispositivo/navegador |
| ip_address | VARCHAR(45) | Dirección IP |
| location | VARCHAR(100) | Ubicación geográfica |
| token | VARCHAR(500) | Token de sesión |
| is_current | BOOLEAN | Sesión actual |
| last_active_at | TIMESTAMP | Última actividad |
| created_at | TIMESTAMP | Fecha de creación |
| expires_at | TIMESTAMP | Fecha de expiración |

### `user_settings`
Configuraciones del usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) UNIQUE | Usuario |
| theme | ENUM('dark','light','system') DEFAULT 'dark' | Tema |
| language | VARCHAR(5) DEFAULT 'es' | Idioma |
| timezone | VARCHAR(50) | Zona horaria |
| currency | VARCHAR(5) DEFAULT 'USD' | Moneda preferida |
| compact_mode | BOOLEAN DEFAULT FALSE | Modo compacto |
| default_amount | DECIMAL(10,2) DEFAULT 10 | Monto por defecto |
| default_duration | INTEGER DEFAULT 60 | Duración por defecto (seg) |
| confirm_trades | BOOLEAN DEFAULT TRUE | Confirmar operaciones |
| sound_effects | BOOLEAN DEFAULT TRUE | Efectos de sonido |
| show_balance | BOOLEAN DEFAULT TRUE | Mostrar balance |
| show_activity | BOOLEAN DEFAULT TRUE | Mostrar actividad |
| show_tutorials | BOOLEAN DEFAULT TRUE | Mostrar tutoriales |

---

## 2. KYC Y VERIFICACIÓN

### `kyc_documents`
Documentos de verificación KYC.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| type | ENUM('identity','address','selfie') | Tipo de documento |
| file_name | VARCHAR(255) | Nombre del archivo |
| file_url | VARCHAR(500) | URL del archivo |
| status | ENUM('pending','approved','rejected') | Estado |
| rejection_reason | TEXT | Razón de rechazo |
| reviewed_by | INTEGER REFERENCES users(id) | Revisado por |
| reviewed_at | TIMESTAMP | Fecha de revisión |
| uploaded_at | TIMESTAMP | Fecha de subida |

### `kyc_status`
Estado general de verificación KYC.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) UNIQUE | Usuario |
| status | ENUM('none','pending','approved','rejected') | Estado general |
| identity_verified | BOOLEAN DEFAULT FALSE | Identidad verificada |
| address_verified | BOOLEAN DEFAULT FALSE | Domicilio verificado |
| selfie_verified | BOOLEAN DEFAULT FALSE | Selfie verificado |
| verification_level | INTEGER DEFAULT 0 | Nivel de verificación (0-3) |
| updated_at | TIMESTAMP | Última actualización |

---

## 3. BILLETERA Y FINANZAS

### `wallets`
Billeteras del usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| type | ENUM('live','demo','tournament') | Tipo de billetera |
| balance | DECIMAL(18,8) DEFAULT 0 | Balance actual |
| currency | VARCHAR(10) DEFAULT 'USD' | Moneda |
| is_active | BOOLEAN DEFAULT TRUE | Activa |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### `transactions`
Historial de transacciones.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| wallet_id | INTEGER REFERENCES wallets(id) | Billetera |
| type | ENUM('deposit','withdrawal','bonus','trade_profit','trade_loss','transfer','refund') | Tipo |
| amount | DECIMAL(18,8) | Monto |
| currency | VARCHAR(10) | Moneda |
| status | ENUM('pending','completed','failed','cancelled') | Estado |
| tx_hash | VARCHAR(100) | Hash de transacción (crypto) |
| address | VARCHAR(100) | Dirección (crypto) |
| network | VARCHAR(20) | Red (TRC20, ERC20, etc.) |
| fee | DECIMAL(18,8) DEFAULT 0 | Comisión |
| notes | TEXT | Notas |
| processed_by | INTEGER REFERENCES users(id) | Procesado por |
| processed_at | TIMESTAMP | Fecha de proceso |
| created_at | TIMESTAMP | Fecha de creación |

### `deposit_addresses`
Direcciones de depósito por usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| currency | VARCHAR(10) | Criptomoneda |
| network | VARCHAR(20) | Red |
| address | VARCHAR(100) | Dirección |
| qr_code_url | VARCHAR(500) | URL del código QR |
| min_deposit | DECIMAL(18,8) | Depósito mínimo |
| created_at | TIMESTAMP | Fecha de creación |

### `withdrawal_requests`
Solicitudes de retiro.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| wallet_id | INTEGER REFERENCES wallets(id) | Billetera |
| amount | DECIMAL(18,8) | Monto |
| currency | VARCHAR(10) | Moneda |
| network | VARCHAR(20) | Red |
| address | VARCHAR(100) | Dirección destino |
| fee | DECIMAL(18,8) | Comisión |
| status | ENUM('pending','processing','completed','rejected','cancelled') | Estado |
| rejection_reason | TEXT | Razón de rechazo |
| processed_by | INTEGER REFERENCES users(id) | Procesado por |
| processed_at | TIMESTAMP | Fecha de proceso |
| created_at | TIMESTAMP | Fecha de solicitud |

---

## 4. TRADING Y OPERACIONES

### `trades`
Operaciones de trading.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| wallet_id | INTEGER REFERENCES wallets(id) | Billetera usada |
| symbol | VARCHAR(20) | Par de trading |
| direction | ENUM('up','down') | Dirección |
| amount | DECIMAL(18,8) | Monto invertido |
| entry_price | DECIMAL(18,8) | Precio de entrada |
| exit_price | DECIMAL(18,8) | Precio de salida |
| payout_percentage | DECIMAL(5,2) | Porcentaje de payout |
| profit | DECIMAL(18,8) | Ganancia/pérdida |
| status | ENUM('active','won','lost','cancelled','refunded') | Estado |
| duration | INTEGER | Duración en segundos |
| tournament_id | INTEGER REFERENCES tournaments(id) | Torneo (si aplica) |
| created_at | TIMESTAMP | Fecha de apertura |
| expires_at | TIMESTAMP | Fecha de expiración |
| closed_at | TIMESTAMP | Fecha de cierre |

### `trade_markers`
Marcadores de operaciones en el gráfico.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| trade_id | INTEGER REFERENCES trades(id) | Operación |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| symbol | VARCHAR(20) | Par |
| price | DECIMAL(18,8) | Precio de entrada |
| direction | ENUM('up','down') | Dirección |
| amount | DECIMAL(18,8) | Monto |
| candle_time | TIMESTAMP | Tiempo de la vela |
| created_at | TIMESTAMP | Fecha de creación |

### `price_alerts`
Alertas de precio configuradas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| symbol | VARCHAR(20) | Par |
| condition | ENUM('above','below') | Condición |
| price | DECIMAL(18,8) | Precio objetivo |
| is_active | BOOLEAN DEFAULT TRUE | Activa |
| triggered | BOOLEAN DEFAULT FALSE | Activada |
| triggered_at | TIMESTAMP | Fecha de activación |
| created_at | TIMESTAMP | Fecha de creación |

### `chart_drawings`
Dibujos guardados en el gráfico.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| symbol | VARCHAR(20) | Par |
| type | ENUM('horizontal','trend','fibonacci','rectangle') | Tipo |
| data | JSONB | Datos del dibujo |
| color | VARCHAR(20) | Color |
| created_at | TIMESTAMP | Fecha de creación |

### `user_favorites`
Pares favoritos del usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| symbol | VARCHAR(20) | Par |
| position | INTEGER | Posición en lista |
| created_at | TIMESTAMP | Fecha de creación |

---

## 5. BONOS Y PROMOCIONES

### `bonuses`
Bonos disponibles en la plataforma.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(100) | Nombre del bono |
| description | TEXT | Descripción |
| type | ENUM('welcome','deposit','loyalty','promo','cashback') | Tipo |
| amount | DECIMAL(18,8) | Monto fijo |
| percentage | DECIMAL(5,2) | Porcentaje del depósito |
| min_deposit | DECIMAL(18,8) | Depósito mínimo |
| max_bonus | DECIMAL(18,8) | Bono máximo |
| rollover_multiplier | INTEGER | Multiplicador de rollover |
| code | VARCHAR(20) UNIQUE | Código promocional |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| starts_at | TIMESTAMP | Fecha de inicio |
| expires_at | TIMESTAMP | Fecha de expiración |
| created_at | TIMESTAMP | Fecha de creación |

### `user_bonuses`
Bonos asignados a usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| bonus_id | INTEGER REFERENCES bonuses(id) | Bono |
| amount | DECIMAL(18,8) | Monto del bono |
| rollover_required | DECIMAL(18,8) | Volumen requerido |
| rollover_completed | DECIMAL(18,8) DEFAULT 0 | Volumen completado |
| status | ENUM('active','completed','cancelled','expired') | Estado |
| activated_at | TIMESTAMP | Fecha de activación |
| completed_at | TIMESTAMP | Fecha de completado |
| expires_at | TIMESTAMP | Fecha de expiración |
| created_at | TIMESTAMP | Fecha de creación |

### `promo_codes`
Códigos promocionales usados.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| code | VARCHAR(20) | Código usado |
| bonus_id | INTEGER REFERENCES bonuses(id) | Bono aplicado |
| used_at | TIMESTAMP | Fecha de uso |

---

## 6. REFERIDOS

### `referrals`
Registro de referidos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| referrer_id | INTEGER REFERENCES users(id) | Usuario que refiere |
| referred_id | INTEGER REFERENCES users(id) | Usuario referido |
| status | ENUM('pending','active','inactive') | Estado |
| total_deposits | DECIMAL(18,8) DEFAULT 0 | Total depositado |
| total_commission | DECIMAL(18,8) DEFAULT 0 | Comisión total generada |
| created_at | TIMESTAMP | Fecha de registro |

### `referral_commissions`
Comisiones de referidos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| referrer_id | INTEGER REFERENCES users(id) | Usuario que recibe |
| referred_id | INTEGER REFERENCES users(id) | Usuario que genera |
| type | ENUM('signup','deposit','trade') | Tipo de comisión |
| amount | DECIMAL(18,8) | Monto |
| percentage | DECIMAL(5,2) | Porcentaje aplicado |
| source_amount | DECIMAL(18,8) | Monto origen |
| status | ENUM('pending','paid','cancelled') | Estado |
| paid_at | TIMESTAMP | Fecha de pago |
| created_at | TIMESTAMP | Fecha de creación |

### `referral_tiers`
Niveles del programa de referidos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(50) | Nombre del nivel |
| min_referrals | INTEGER | Mínimo de referidos |
| deposit_commission | DECIMAL(5,2) | % comisión depósitos |
| trade_commission | DECIMAL(5,2) | % comisión trading |
| signup_bonus | DECIMAL(18,8) | Bono por registro |

---

## 7. NOTIFICACIONES

### `notifications`
Notificaciones del usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| type | ENUM('trade','bonus','tournament','system','alert','deposit','withdrawal') | Tipo |
| title | VARCHAR(200) | Título |
| message | TEXT | Mensaje |
| data | JSONB | Datos adicionales |
| is_read | BOOLEAN DEFAULT FALSE | Leída |
| read_at | TIMESTAMP | Fecha de lectura |
| created_at | TIMESTAMP | Fecha de creación |

### `notification_settings`
Configuración de notificaciones.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) UNIQUE | Usuario |
| email_enabled | BOOLEAN DEFAULT TRUE | Email activo |
| push_enabled | BOOLEAN DEFAULT TRUE | Push activo |
| sms_enabled | BOOLEAN DEFAULT FALSE | SMS activo |
| trades_enabled | BOOLEAN DEFAULT TRUE | Notif. operaciones |
| deposits_enabled | BOOLEAN DEFAULT TRUE | Notif. depósitos |
| withdrawals_enabled | BOOLEAN DEFAULT TRUE | Notif. retiros |
| promotions_enabled | BOOLEAN DEFAULT FALSE | Notif. promociones |
| news_enabled | BOOLEAN DEFAULT FALSE | Notif. noticias |
| price_alerts_enabled | BOOLEAN DEFAULT TRUE | Alertas de precio |

---

## 8. TORNEOS

### `tournaments`
Torneos disponibles.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| title | VARCHAR(100) | Título |
| description | TEXT | Descripción |
| type | ENUM('free','paid') | Tipo |
| entry_fee | DECIMAL(18,8) DEFAULT 0 | Costo de entrada |
| prize_pool | DECIMAL(18,8) | Premio total |
| initial_balance | DECIMAL(18,8) | Balance inicial |
| max_participants | INTEGER | Máximo participantes |
| min_participants | INTEGER | Mínimo participantes |
| status | ENUM('upcoming','active','finished','cancelled') | Estado |
| starts_at | TIMESTAMP | Fecha de inicio |
| ends_at | TIMESTAMP | Fecha de fin |
| created_at | TIMESTAMP | Fecha de creación |

### `tournament_participants`
Participantes de torneos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| tournament_id | INTEGER REFERENCES tournaments(id) | Torneo |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| balance | DECIMAL(18,8) | Balance actual |
| profit | DECIMAL(18,8) DEFAULT 0 | Ganancia/pérdida |
| rank | INTEGER | Posición actual |
| trades_count | INTEGER DEFAULT 0 | Número de operaciones |
| joined_at | TIMESTAMP | Fecha de inscripción |

### `tournament_prizes`
Premios de torneos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| tournament_id | INTEGER REFERENCES tournaments(id) | Torneo |
| position | INTEGER | Posición |
| prize_amount | DECIMAL(18,8) | Monto del premio |
| prize_type | ENUM('cash','bonus','other') | Tipo de premio |

---

## 9. ACADEMIA

### `courses`
Cursos de la academia.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| title | VARCHAR(200) | Título |
| description | TEXT | Descripción |
| category | ENUM('basics','technical','strategies','psychology') | Categoría |
| level | ENUM('beginner','intermediate','advanced') | Nivel |
| duration_minutes | INTEGER | Duración en minutos |
| thumbnail_url | VARCHAR(500) | URL de miniatura |
| is_premium | BOOLEAN DEFAULT FALSE | Es premium |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| position | INTEGER | Orden |
| created_at | TIMESTAMP | Fecha de creación |

### `course_lessons`
Lecciones de cursos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| course_id | INTEGER REFERENCES courses(id) | Curso |
| title | VARCHAR(200) | Título |
| content | TEXT | Contenido |
| video_url | VARCHAR(500) | URL del video |
| duration_minutes | INTEGER | Duración |
| position | INTEGER | Orden |
| created_at | TIMESTAMP | Fecha de creación |

### `user_course_progress`
Progreso del usuario en cursos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| course_id | INTEGER REFERENCES courses(id) | Curso |
| lessons_completed | INTEGER DEFAULT 0 | Lecciones completadas |
| progress_percentage | DECIMAL(5,2) DEFAULT 0 | Porcentaje de progreso |
| completed | BOOLEAN DEFAULT FALSE | Completado |
| completed_at | TIMESTAMP | Fecha de completado |
| started_at | TIMESTAMP | Fecha de inicio |
| updated_at | TIMESTAMP | Última actualización |

### `user_lesson_progress`
Progreso por lección.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| lesson_id | INTEGER REFERENCES course_lessons(id) | Lección |
| completed | BOOLEAN DEFAULT FALSE | Completada |
| watch_time_seconds | INTEGER DEFAULT 0 | Tiempo visto |
| completed_at | TIMESTAMP | Fecha de completado |

### `tutorial_videos`
Videos tutoriales independientes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| title | VARCHAR(200) | Título |
| description | TEXT | Descripción |
| video_url | VARCHAR(500) | URL del video |
| thumbnail_url | VARCHAR(500) | Miniatura |
| duration | VARCHAR(10) | Duración (formato mm:ss) |
| category | VARCHAR(50) | Categoría |
| views_count | INTEGER DEFAULT 0 | Vistas |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| created_at | TIMESTAMP | Fecha de creación |

### `glossary_terms`
Términos del glosario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| term | VARCHAR(100) | Término |
| definition | TEXT | Definición |
| category | VARCHAR(50) | Categoría |
| created_at | TIMESTAMP | Fecha de creación |

### `user_certificates`
Certificados obtenidos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| course_id | INTEGER REFERENCES courses(id) | Curso |
| certificate_url | VARCHAR(500) | URL del certificado |
| issued_at | TIMESTAMP | Fecha de emisión |

---

## 10. MERCADOS Y ACTIVOS

### `markets`
Mercados disponibles.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(50) | Nombre |
| type | ENUM('crypto','forex','commodities','stocks','indices') | Tipo |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| position | INTEGER | Orden |

### `trading_pairs`
Pares de trading.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| market_id | INTEGER REFERENCES markets(id) | Mercado |
| symbol | VARCHAR(20) UNIQUE | Símbolo (BTC/USDT) |
| base_asset | VARCHAR(10) | Activo base |
| quote_asset | VARCHAR(10) | Activo cotización |
| payout_percentage | DECIMAL(5,2) | Payout % |
| min_amount | DECIMAL(18,8) | Monto mínimo |
| max_amount | DECIMAL(18,8) | Monto máximo |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| is_popular | BOOLEAN DEFAULT FALSE | Popular |
| position | INTEGER | Orden |

---

## 11. SOPORTE Y AYUDA

### `support_tickets`
Tickets de soporte del usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| subject | VARCHAR(200) | Asunto del ticket |
| description | TEXT | Descripción del problema |
| category | ENUM('account','deposit','withdrawal','trading','technical','other') | Categoría |
| priority | ENUM('low','medium','high','urgent') | Prioridad |
| status | ENUM('open','in_progress','waiting_user','resolved','closed') | Estado |
| assigned_to | INTEGER REFERENCES users(id) | Agente asignado |
| resolved_at | TIMESTAMP | Fecha de resolución |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### `support_messages`
Mensajes del chat de soporte.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| ticket_id | INTEGER REFERENCES support_tickets(id) | Ticket asociado |
| sender_id | INTEGER REFERENCES users(id) | Remitente |
| sender_type | ENUM('user','agent','system') | Tipo de remitente |
| message | TEXT | Contenido del mensaje |
| attachments | JSONB | Archivos adjuntos |
| is_read | BOOLEAN DEFAULT FALSE | Leído |
| created_at | TIMESTAMP | Fecha de envío |

### `support_video_calls`
Videollamadas de soporte programadas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| ticket_id | INTEGER REFERENCES support_tickets(id) | Ticket asociado (opcional) |
| agent_id | INTEGER REFERENCES users(id) | Agente asignado |
| scheduled_at | TIMESTAMP | Fecha y hora programada |
| duration_minutes | INTEGER DEFAULT 30 | Duración estimada |
| meeting_url | VARCHAR(500) | URL de la reunión |
| status | ENUM('scheduled','in_progress','completed','cancelled','no_show') | Estado |
| notes | TEXT | Notas de la llamada |
| created_at | TIMESTAMP | Fecha de creación |
| completed_at | TIMESTAMP | Fecha de finalización |

### `faqs`
Preguntas frecuentes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| question | VARCHAR(500) | Pregunta |
| answer | TEXT | Respuesta |
| category | VARCHAR(50) | Categoría (Cuenta, Finanzas, Trading, etc.) |
| position | INTEGER | Orden de visualización |
| views_count | INTEGER DEFAULT 0 | Veces vista |
| helpful_count | INTEGER DEFAULT 0 | Marcada como útil |
| is_active | BOOLEAN DEFAULT TRUE | Activa |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### `support_ratings`
Calificaciones del soporte.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| ticket_id | INTEGER REFERENCES support_tickets(id) | Ticket |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| agent_id | INTEGER REFERENCES users(id) | Agente calificado |
| rating | INTEGER CHECK (rating >= 1 AND rating <= 5) | Calificación (1-5) |
| comment | TEXT | Comentario opcional |
| created_at | TIMESTAMP | Fecha de calificación |

---

## 12. TORNEOS (ADICIONAL)

### `tournament_rebuys`
Historial de re-buys en torneos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| tournament_id | INTEGER REFERENCES tournaments(id) | Torneo |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| participant_id | INTEGER REFERENCES tournament_participants(id) | Participación |
| amount | DECIMAL(18,8) | Costo del re-buy |
| balance_restored | DECIMAL(18,8) | Balance restaurado |
| rebuy_number | INTEGER | Número de re-buy (1ro, 2do, etc.) |
| created_at | TIMESTAMP | Fecha del re-buy |

### `tournament_rules`
Reglas específicas de torneos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| tournament_id | INTEGER REFERENCES tournaments(id) | Torneo |
| rule_text | VARCHAR(500) | Texto de la regla |
| position | INTEGER | Orden |

### `tournament_leaderboard_snapshots`
Snapshots del leaderboard para historial.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| tournament_id | INTEGER REFERENCES tournaments(id) | Torneo |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| rank | INTEGER | Posición |
| balance | DECIMAL(18,8) | Balance en ese momento |
| profit | DECIMAL(18,8) | Ganancia |
| profit_percent | DECIMAL(10,4) | Porcentaje de ganancia |
| trades_count | INTEGER | Número de operaciones |
| snapshot_at | TIMESTAMP | Fecha del snapshot |

---

## 13. CONFIGURACIÓN DE PLATAFORMA

### `platform_settings`
Configuraciones globales de la plataforma.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| key | VARCHAR(100) UNIQUE | Clave de configuración |
| value | TEXT | Valor |
| type | ENUM('string','number','boolean','json') | Tipo de dato |
| description | TEXT | Descripción |
| updated_by | INTEGER REFERENCES users(id) | Actualizado por |
| updated_at | TIMESTAMP | Última actualización |

### `trading_hours`
Horarios de trading por mercado.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| market_id | INTEGER REFERENCES markets(id) | Mercado |
| day_of_week | INTEGER | Día de la semana (0-6) |
| open_time | TIME | Hora de apertura |
| close_time | TIME | Hora de cierre |
| is_closed | BOOLEAN DEFAULT FALSE | Cerrado todo el día |

### `maintenance_windows`
Ventanas de mantenimiento programadas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| title | VARCHAR(200) | Título |
| description | TEXT | Descripción |
| starts_at | TIMESTAMP | Inicio |
| ends_at | TIMESTAMP | Fin |
| affected_services | JSONB | Servicios afectados |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| created_by | INTEGER REFERENCES users(id) | Creado por |
| created_at | TIMESTAMP | Fecha de creación |

---

## 14. AUDITORÍA Y LOGS

### `activity_logs`
Registro de actividad del usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| action | VARCHAR(100) | Acción realizada |
| entity_type | VARCHAR(50) | Tipo de entidad |
| entity_id | INTEGER | ID de entidad |
| old_data | JSONB | Datos anteriores |
| new_data | JSONB | Datos nuevos |
| ip_address | VARCHAR(45) | IP |
| user_agent | TEXT | User agent |
| created_at | TIMESTAMP | Fecha |

### `login_history`
Historial de inicios de sesión.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| ip_address | VARCHAR(45) | Dirección IP |
| device | VARCHAR(200) | Dispositivo/navegador |
| location | VARCHAR(100) | Ubicación geográfica |
| status | ENUM('success','failed','blocked') | Estado del intento |
| failure_reason | VARCHAR(100) | Razón del fallo |
| created_at | TIMESTAMP | Fecha del intento |

### `security_events`
Eventos de seguridad.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| event_type | ENUM('password_change','2fa_enabled','2fa_disabled','suspicious_login','account_locked') | Tipo de evento |
| description | TEXT | Descripción |
| ip_address | VARCHAR(45) | IP |
| metadata | JSONB | Datos adicionales |
| created_at | TIMESTAMP | Fecha |

---

## 15. CHAT EN VIVO

### `live_chat_sessions`
Sesiones de chat en vivo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| agent_id | INTEGER REFERENCES users(id) | Agente asignado |
| status | ENUM('waiting','active','closed') | Estado |
| started_at | TIMESTAMP | Inicio de la sesión |
| ended_at | TIMESTAMP | Fin de la sesión |
| rating | INTEGER | Calificación (1-5) |
| created_at | TIMESTAMP | Fecha de creación |

### `live_chat_messages`
Mensajes del chat en vivo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| session_id | INTEGER REFERENCES live_chat_sessions(id) | Sesión |
| sender_id | INTEGER REFERENCES users(id) | Remitente |
| sender_type | ENUM('user','agent','bot') | Tipo |
| message | TEXT | Mensaje |
| attachments | JSONB | Archivos adjuntos |
| created_at | TIMESTAMP | Fecha de envío |

---

## 16. SISTEMA DE NIVELES Y GAMIFICACIÓN

### `user_levels`
Niveles de usuario y beneficios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(50) | Nombre (Bronce, Plata, Oro, etc.) |
| min_volume | DECIMAL(18,8) | Volumen mínimo requerido |
| min_deposits | DECIMAL(18,8) | Depósitos mínimos |
| payout_bonus | DECIMAL(5,2) | Bonus de payout % |
| withdrawal_priority | BOOLEAN DEFAULT FALSE | Retiros prioritarios |
| personal_manager | BOOLEAN DEFAULT FALSE | Manager personal |
| cashback_percentage | DECIMAL(5,2) | Porcentaje de cashback |
| icon_url | VARCHAR(500) | URL del icono |
| color | VARCHAR(20) | Color del nivel |
| position | INTEGER | Orden |

### `user_achievements`
Logros desbloqueados por usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| achievement_id | INTEGER REFERENCES achievements(id) | Logro |
| unlocked_at | TIMESTAMP | Fecha de desbloqueo |

### `achievements`
Catálogo de logros disponibles.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(100) | Nombre del logro |
| description | TEXT | Descripción |
| icon_url | VARCHAR(500) | URL del icono |
| category | VARCHAR(50) | Categoría |
| requirement_type | VARCHAR(50) | Tipo de requisito |
| requirement_value | INTEGER | Valor requerido |
| reward_type | ENUM('bonus','badge','payout_boost') | Tipo de recompensa |
| reward_value | DECIMAL(18,8) | Valor de recompensa |
| is_active | BOOLEAN DEFAULT TRUE | Activo |

---

## 17. COMUNICACIONES MASIVAS

### `announcements`
Anuncios de la plataforma.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| title | VARCHAR(200) | Título |
| content | TEXT | Contenido |
| type | ENUM('info','warning','promotion','maintenance') | Tipo |
| target_audience | ENUM('all','verified','vip','new_users') | Audiencia |
| is_popup | BOOLEAN DEFAULT FALSE | Mostrar como popup |
| starts_at | TIMESTAMP | Fecha de inicio |
| ends_at | TIMESTAMP | Fecha de fin |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| created_by | INTEGER REFERENCES users(id) | Creado por |
| created_at | TIMESTAMP | Fecha de creación |

### `user_announcement_reads`
Registro de anuncios leídos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| announcement_id | INTEGER REFERENCES announcements(id) | Anuncio |
| read_at | TIMESTAMP | Fecha de lectura |

### `email_templates`
Plantillas de email.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(100) | Nombre de la plantilla |
| subject | VARCHAR(200) | Asunto |
| body_html | TEXT | Cuerpo HTML |
| body_text | TEXT | Cuerpo texto plano |
| variables | JSONB | Variables disponibles |
| is_active | BOOLEAN DEFAULT TRUE | Activa |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### `email_logs`
Registro de emails enviados.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario destinatario |
| template_id | INTEGER REFERENCES email_templates(id) | Plantilla usada |
| subject | VARCHAR(200) | Asunto |
| status | ENUM('sent','delivered','bounced','failed') | Estado |
| sent_at | TIMESTAMP | Fecha de envío |
| opened_at | TIMESTAMP | Fecha de apertura |

---

## ÍNDICES RECOMENDADOS

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_referred_by ON users(referred_by);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_level ON users(level);

-- Trades
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_symbol ON trades(symbol);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_trades_created_at ON trades(created_at);
CREATE INDEX idx_trades_tournament_id ON trades(tournament_id);

-- Transactions
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);

-- Referrals
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON referrals(referred_id);

-- User Bonuses
CREATE INDEX idx_user_bonuses_user_id ON user_bonuses(user_id);
CREATE INDEX idx_user_bonuses_status ON user_bonuses(status);

-- Support Tickets
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_assigned_to ON support_tickets(assigned_to);

-- Support Messages
CREATE INDEX idx_support_messages_ticket_id ON support_messages(ticket_id);

-- Live Chat
CREATE INDEX idx_live_chat_sessions_user_id ON live_chat_sessions(user_id);
CREATE INDEX idx_live_chat_sessions_agent_id ON live_chat_sessions(agent_id);
CREATE INDEX idx_live_chat_messages_session_id ON live_chat_messages(session_id);

-- Tournaments
CREATE INDEX idx_tournament_participants_tournament_id ON tournament_participants(tournament_id);
CREATE INDEX idx_tournament_participants_user_id ON tournament_participants(user_id);
CREATE INDEX idx_tournament_rebuys_tournament_id ON tournament_rebuys(tournament_id);

-- Price Alerts
CREATE INDEX idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX idx_price_alerts_symbol ON price_alerts(symbol);
CREATE INDEX idx_price_alerts_is_active ON price_alerts(is_active);

-- User Sessions
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);

-- KYC Documents
CREATE INDEX idx_kyc_documents_user_id ON kyc_documents(user_id);
CREATE INDEX idx_kyc_documents_status ON kyc_documents(status);

-- Activity Logs
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Login History
CREATE INDEX idx_login_history_user_id ON login_history(user_id);
CREATE INDEX idx_login_history_created_at ON login_history(created_at);

-- Announcements
CREATE INDEX idx_announcements_is_active ON announcements(is_active);
CREATE INDEX idx_announcements_starts_at ON announcements(starts_at);
```

---

## RELACIONES PRINCIPALES

```
users (1) ─────────── (N) wallets
users (1) ─────────── (N) trades
users (1) ─────────── (N) transactions
users (1) ─────────── (N) notifications
users (1) ─────────── (N) user_bonuses
users (1) ─────────── (N) referrals (como referrer)
users (1) ─────────── (1) referrals (como referred)
users (1) ─────────── (N) kyc_documents
users (1) ─────────── (1) user_settings
users (1) ─────────── (1) notification_settings
users (1) ─────────── (N) user_sessions
users (1) ─────────── (N) price_alerts
users (1) ─────────── (N) user_course_progress
users (1) ─────────── (N) tournament_participants
users (1) ─────────── (N) support_tickets
users (1) ─────────── (N) live_chat_sessions
users (1) ─────────── (N) user_achievements
users (1) ─────────── (N) login_history

tournaments (1) ───── (N) tournament_participants
tournaments (1) ───── (N) tournament_prizes
tournaments (1) ───── (N) tournament_rebuys
tournaments (1) ───── (N) tournament_rules

courses (1) ────────── (N) course_lessons
courses (1) ────────── (N) user_course_progress

bonuses (1) ────────── (N) user_bonuses

markets (1) ────────── (N) trading_pairs
markets (1) ────────── (N) trading_hours

support_tickets (1) ── (N) support_messages
support_tickets (1) ── (1) support_ratings
support_tickets (1) ── (N) support_video_calls

live_chat_sessions (1) (N) live_chat_messages

announcements (1) ──── (N) user_announcement_reads
```

---

## RESUMEN DE TABLAS

| Sección | Tablas | Descripción |
|---------|--------|-------------|
| 1. Usuarios | 3 | users, user_sessions, user_settings |
| 2. KYC | 2 | kyc_documents, kyc_status |
| 3. Billetera | 4 | wallets, transactions, deposit_addresses, withdrawal_requests |
| 4. Trading | 5 | trades, trade_markers, price_alerts, chart_drawings, user_favorites |
| 5. Bonos | 3 | bonuses, user_bonuses, promo_codes |
| 6. Referidos | 3 | referrals, referral_commissions, referral_tiers |
| 7. Notificaciones | 2 | notifications, notification_settings |
| 8. Torneos | 3 | tournaments, tournament_participants, tournament_prizes |
| 9. Academia | 7 | courses, course_lessons, user_course_progress, user_lesson_progress, tutorial_videos, glossary_terms, user_certificates |
| 10. Mercados | 2 | markets, trading_pairs |
| 11. Soporte | 5 | support_tickets, support_messages, support_video_calls, faqs, support_ratings |
| 12. Torneos (Adicional) | 3 | tournament_rebuys, tournament_rules, tournament_leaderboard_snapshots |
| 13. Configuración | 3 | platform_settings, trading_hours, maintenance_windows |
| 14. Auditoría | 3 | activity_logs, login_history, security_events |
| 15. Chat en Vivo | 2 | live_chat_sessions, live_chat_messages |
| 16. Gamificación | 3 | user_levels, user_achievements, achievements |
| 17. Comunicaciones | 4 | announcements, user_announcement_reads, email_templates, email_logs |

**Total: 57 tablas**

---

## 18. GRÁFICOS Y ANÁLISIS

### `chart_layouts`
Layouts de gráficos guardados por el usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| name | VARCHAR(100) | Nombre del layout |
| symbol | VARCHAR(20) | Par principal |
| timeframe | VARCHAR(10) | Temporalidad (1m, 5m, 1h, etc.) |
| chart_type | ENUM('candles','line','area','bars') | Tipo de gráfico |
| indicators | JSONB | Indicadores configurados |
| drawings | JSONB | Dibujos guardados |
| split_mode | ENUM('single','horizontal','vertical','grid') | Modo de división |
| is_default | BOOLEAN DEFAULT FALSE | Layout por defecto |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### `chart_screenshots`
Capturas de pantalla de gráficos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| symbol | VARCHAR(20) | Par |
| image_url | VARCHAR(500) | URL de la imagen |
| notes | TEXT | Notas del usuario |
| created_at | TIMESTAMP | Fecha de captura |

### `chart_comparisons`
Comparaciones de activos guardadas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| primary_symbol | VARCHAR(20) | Símbolo principal |
| secondary_symbol | VARCHAR(20) | Símbolo de comparación |
| name | VARCHAR(100) | Nombre de la comparación |
| created_at | TIMESTAMP | Fecha de creación |

### `backtesting_sessions`
Sesiones de backtesting/replay.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| symbol | VARCHAR(20) | Par |
| start_date | TIMESTAMP | Fecha de inicio del replay |
| end_date | TIMESTAMP | Fecha de fin del replay |
| speed | DECIMAL(5,2) | Velocidad de reproducción |
| trades_made | INTEGER DEFAULT 0 | Operaciones realizadas |
| profit_loss | DECIMAL(18,8) DEFAULT 0 | Ganancia/pérdida simulada |
| status | ENUM('active','paused','completed') | Estado |
| created_at | TIMESTAMP | Fecha de creación |

---

## 19. MÉTODOS DE PAGO

### `payment_methods`
Métodos de pago disponibles.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(100) | Nombre (USDT TRC20, Bitcoin, etc.) |
| type | ENUM('crypto','fiat','ewallet') | Tipo |
| symbol | VARCHAR(10) | Símbolo (USDT, BTC, etc.) |
| network | VARCHAR(20) | Red (TRC20, ERC20, etc.) |
| icon_url | VARCHAR(500) | URL del icono |
| min_deposit | DECIMAL(18,8) | Depósito mínimo |
| max_deposit | DECIMAL(18,8) | Depósito máximo |
| min_withdrawal | DECIMAL(18,8) | Retiro mínimo |
| max_withdrawal | DECIMAL(18,8) | Retiro máximo |
| deposit_fee | DECIMAL(18,8) | Comisión de depósito |
| withdrawal_fee | DECIMAL(18,8) | Comisión de retiro |
| processing_time | VARCHAR(50) | Tiempo de procesamiento |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| position | INTEGER | Orden |

### `user_payment_addresses`
Direcciones de pago guardadas del usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| payment_method_id | INTEGER REFERENCES payment_methods(id) | Método de pago |
| address | VARCHAR(200) | Dirección |
| label | VARCHAR(100) | Etiqueta (Mi wallet principal, etc.) |
| is_verified | BOOLEAN DEFAULT FALSE | Verificada |
| is_default | BOOLEAN DEFAULT FALSE | Por defecto |
| created_at | TIMESTAMP | Fecha de creación |

---

## 20. ESTADÍSTICAS DEL USUARIO

### `user_statistics`
Estadísticas generales del usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) UNIQUE | Usuario |
| total_trades | INTEGER DEFAULT 0 | Total de operaciones |
| won_trades | INTEGER DEFAULT 0 | Operaciones ganadas |
| lost_trades | INTEGER DEFAULT 0 | Operaciones perdidas |
| win_rate | DECIMAL(5,2) DEFAULT 0 | Porcentaje de acierto |
| total_volume | DECIMAL(18,8) DEFAULT 0 | Volumen total operado |
| total_profit | DECIMAL(18,8) DEFAULT 0 | Ganancia total |
| total_loss | DECIMAL(18,8) DEFAULT 0 | Pérdida total |
| net_profit | DECIMAL(18,8) DEFAULT 0 | Ganancia neta |
| best_trade | DECIMAL(18,8) DEFAULT 0 | Mejor operación |
| worst_trade | DECIMAL(18,8) DEFAULT 0 | Peor operación |
| avg_trade_amount | DECIMAL(18,8) DEFAULT 0 | Monto promedio |
| avg_trade_duration | INTEGER DEFAULT 0 | Duración promedio (seg) |
| favorite_symbol | VARCHAR(20) | Par más operado |
| favorite_direction | ENUM('up','down') | Dirección preferida |
| current_streak | INTEGER DEFAULT 0 | Racha actual |
| best_streak | INTEGER DEFAULT 0 | Mejor racha |
| tournaments_participated | INTEGER DEFAULT 0 | Torneos participados |
| tournaments_won | INTEGER DEFAULT 0 | Torneos ganados |
| updated_at | TIMESTAMP | Última actualización |

### `user_daily_statistics`
Estadísticas diarias del usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| date | DATE | Fecha |
| trades_count | INTEGER DEFAULT 0 | Operaciones del día |
| won_count | INTEGER DEFAULT 0 | Ganadas |
| lost_count | INTEGER DEFAULT 0 | Perdidas |
| volume | DECIMAL(18,8) DEFAULT 0 | Volumen del día |
| profit | DECIMAL(18,8) DEFAULT 0 | Ganancia del día |
| loss | DECIMAL(18,8) DEFAULT 0 | Pérdida del día |
| net | DECIMAL(18,8) DEFAULT 0 | Neto del día |

### `user_symbol_statistics`
Estadísticas por símbolo del usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| symbol | VARCHAR(20) | Par |
| trades_count | INTEGER DEFAULT 0 | Total operaciones |
| won_count | INTEGER DEFAULT 0 | Ganadas |
| lost_count | INTEGER DEFAULT 0 | Perdidas |
| win_rate | DECIMAL(5,2) DEFAULT 0 | Porcentaje de acierto |
| total_profit | DECIMAL(18,8) DEFAULT 0 | Ganancia total |
| updated_at | TIMESTAMP | Última actualización |

---

## 21. PIN Y SEGURIDAD ADICIONAL

### `user_pins`
PIN de seguridad del usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) UNIQUE | Usuario |
| pin_hash | VARCHAR(255) | PIN hasheado |
| is_enabled | BOOLEAN DEFAULT FALSE | PIN activo |
| failed_attempts | INTEGER DEFAULT 0 | Intentos fallidos |
| locked_until | TIMESTAMP | Bloqueado hasta |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### `withdrawal_limits`
Límites de retiro por nivel de usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| level_id | INTEGER REFERENCES user_levels(id) | Nivel de usuario |
| daily_limit | DECIMAL(18,8) | Límite diario |
| weekly_limit | DECIMAL(18,8) | Límite semanal |
| monthly_limit | DECIMAL(18,8) | Límite mensual |
| single_transaction_limit | DECIMAL(18,8) | Límite por transacción |

### `user_withdrawal_usage`
Uso de límites de retiro del usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| daily_used | DECIMAL(18,8) DEFAULT 0 | Usado hoy |
| weekly_used | DECIMAL(18,8) DEFAULT 0 | Usado esta semana |
| monthly_used | DECIMAL(18,8) DEFAULT 0 | Usado este mes |
| last_reset_daily | DATE | Último reset diario |
| last_reset_weekly | DATE | Último reset semanal |
| last_reset_monthly | DATE | Último reset mensual |

---

## 22. CASHBACK Y RECOMPENSAS

### `cashback_transactions`
Transacciones de cashback.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| trade_id | INTEGER REFERENCES trades(id) | Operación origen |
| amount | DECIMAL(18,8) | Monto de cashback |
| percentage | DECIMAL(5,2) | Porcentaje aplicado |
| status | ENUM('pending','credited','cancelled') | Estado |
| credited_at | TIMESTAMP | Fecha de acreditación |
| created_at | TIMESTAMP | Fecha de creación |

### `loyalty_points`
Puntos de lealtad del usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) UNIQUE | Usuario |
| points_balance | INTEGER DEFAULT 0 | Balance de puntos |
| total_earned | INTEGER DEFAULT 0 | Total ganado |
| total_spent | INTEGER DEFAULT 0 | Total gastado |
| updated_at | TIMESTAMP | Última actualización |

### `loyalty_point_transactions`
Historial de puntos de lealtad.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| type | ENUM('earned','spent','expired','bonus') | Tipo |
| points | INTEGER | Puntos |
| description | VARCHAR(200) | Descripción |
| reference_type | VARCHAR(50) | Tipo de referencia (trade, deposit, etc.) |
| reference_id | INTEGER | ID de referencia |
| created_at | TIMESTAMP | Fecha |

### `loyalty_rewards`
Catálogo de recompensas canjeables.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(100) | Nombre de la recompensa |
| description | TEXT | Descripción |
| points_required | INTEGER | Puntos requeridos |
| reward_type | ENUM('bonus','payout_boost','free_trade','merchandise') | Tipo |
| reward_value | DECIMAL(18,8) | Valor de la recompensa |
| stock | INTEGER | Stock disponible (-1 = ilimitado) |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| created_at | TIMESTAMP | Fecha de creación |

---

## ÍNDICES ADICIONALES

```sql
-- Chart Layouts
CREATE INDEX idx_chart_layouts_user_id ON chart_layouts(user_id);

-- User Statistics
CREATE INDEX idx_user_statistics_user_id ON user_statistics(user_id);
CREATE INDEX idx_user_daily_statistics_user_date ON user_daily_statistics(user_id, date);
CREATE INDEX idx_user_symbol_statistics_user_symbol ON user_symbol_statistics(user_id, symbol);

-- Payment Methods
CREATE INDEX idx_user_payment_addresses_user_id ON user_payment_addresses(user_id);

-- Cashback
CREATE INDEX idx_cashback_transactions_user_id ON cashback_transactions(user_id);
CREATE INDEX idx_loyalty_point_transactions_user_id ON loyalty_point_transactions(user_id);

-- Backtesting
CREATE INDEX idx_backtesting_sessions_user_id ON backtesting_sessions(user_id);
```

---

## RESUMEN ACTUALIZADO DE TABLAS

| Sección | Tablas | Descripción |
|---------|--------|-------------|
| 1. Usuarios | 3 | users, user_sessions, user_settings |
| 2. KYC | 2 | kyc_documents, kyc_status |
| 3. Billetera | 4 | wallets, transactions, deposit_addresses, withdrawal_requests |
| 4. Trading | 5 | trades, trade_markers, price_alerts, chart_drawings, user_favorites |
| 5. Bonos | 3 | bonuses, user_bonuses, promo_codes |
| 6. Referidos | 3 | referrals, referral_commissions, referral_tiers |
| 7. Notificaciones | 2 | notifications, notification_settings |
| 8. Torneos | 3 | tournaments, tournament_participants, tournament_prizes |
| 9. Academia | 7 | courses, course_lessons, user_course_progress, user_lesson_progress, tutorial_videos, glossary_terms, user_certificates |
| 10. Mercados | 2 | markets, trading_pairs |
| 11. Soporte | 5 | support_tickets, support_messages, support_video_calls, faqs, support_ratings |
| 12. Torneos (Adicional) | 3 | tournament_rebuys, tournament_rules, tournament_leaderboard_snapshots |
| 13. Configuración | 3 | platform_settings, trading_hours, maintenance_windows |
| 14. Auditoría | 3 | activity_logs, login_history, security_events |
| 15. Chat en Vivo | 2 | live_chat_sessions, live_chat_messages |
| 16. Gamificación | 3 | user_levels, user_achievements, achievements |
| 17. Comunicaciones | 4 | announcements, user_announcement_reads, email_templates, email_logs |
| 18. Gráficos | 4 | chart_layouts, chart_screenshots, chart_comparisons, backtesting_sessions |
| 19. Métodos de Pago | 2 | payment_methods, user_payment_addresses |
| 20. Estadísticas | 3 | user_statistics, user_daily_statistics, user_symbol_statistics |
| 21. Seguridad | 3 | user_pins, withdrawal_limits, user_withdrawal_usage |
| 22. Cashback/Lealtad | 4 | cashback_transactions, loyalty_points, loyalty_point_transactions, loyalty_rewards |

**Total: 73 tablas**

---

## 23. INDICADORES Y CONFIGURACIÓN DE GRÁFICOS

### `chart_indicators`
Indicadores disponibles en la plataforma.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(50) | Nombre (SMA, EMA, RSI, etc.) |
| display_name | VARCHAR(100) | Nombre para mostrar |
| category | ENUM('trend','momentum','volatility','volume') | Categoría |
| default_params | JSONB | Parámetros por defecto |
| description | TEXT | Descripción |
| is_premium | BOOLEAN DEFAULT FALSE | Solo premium |
| is_active | BOOLEAN DEFAULT TRUE | Activo |

### `user_indicator_settings`
Configuración de indicadores del usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| indicator_id | INTEGER REFERENCES chart_indicators(id) | Indicador |
| symbol | VARCHAR(20) | Par (null = global) |
| params | JSONB | Parámetros personalizados |
| color | VARCHAR(20) | Color |
| is_visible | BOOLEAN DEFAULT TRUE | Visible |
| created_at | TIMESTAMP | Fecha de creación |

---

## 24. HISTORIAL DE PRECIOS

### `price_history`
Historial de precios para gráficos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| symbol | VARCHAR(20) | Par |
| timeframe | VARCHAR(10) | Temporalidad (1m, 5m, 1h, etc.) |
| open_time | TIMESTAMP | Tiempo de apertura |
| open | DECIMAL(18,8) | Precio apertura |
| high | DECIMAL(18,8) | Precio máximo |
| low | DECIMAL(18,8) | Precio mínimo |
| close | DECIMAL(18,8) | Precio cierre |
| volume | DECIMAL(18,8) | Volumen |

### `price_ticks`
Ticks de precio en tiempo real.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| symbol | VARCHAR(20) | Par |
| price | DECIMAL(18,8) | Precio |
| bid | DECIMAL(18,8) | Precio bid |
| ask | DECIMAL(18,8) | Precio ask |
| volume | DECIMAL(18,8) | Volumen |
| timestamp | TIMESTAMP | Marca de tiempo |

---

## 25. COPIAR TRADING (COPY TRADING)

### `copy_traders`
Traders disponibles para copiar.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario trader |
| display_name | VARCHAR(100) | Nombre público |
| bio | TEXT | Biografía |
| avatar_url | VARCHAR(500) | Avatar |
| win_rate | DECIMAL(5,2) | Porcentaje de acierto |
| total_profit | DECIMAL(18,8) | Ganancia total |
| total_trades | INTEGER | Total operaciones |
| followers_count | INTEGER DEFAULT 0 | Seguidores |
| min_copy_amount | DECIMAL(18,8) | Monto mínimo para copiar |
| profit_share | DECIMAL(5,2) | % de ganancia compartida |
| is_verified | BOOLEAN DEFAULT FALSE | Verificado |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| created_at | TIMESTAMP | Fecha de registro |

### `copy_followers`
Seguidores de copy trading.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| follower_id | INTEGER REFERENCES users(id) | Usuario seguidor |
| trader_id | INTEGER REFERENCES copy_traders(id) | Trader seguido |
| copy_amount | DECIMAL(18,8) | Monto a copiar |
| copy_percentage | DECIMAL(5,2) | % del monto del trader |
| max_daily_trades | INTEGER | Máximo trades diarios |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| total_profit | DECIMAL(18,8) DEFAULT 0 | Ganancia total |
| total_loss | DECIMAL(18,8) DEFAULT 0 | Pérdida total |
| created_at | TIMESTAMP | Fecha de inicio |

### `copy_trades`
Operaciones copiadas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| original_trade_id | INTEGER REFERENCES trades(id) | Trade original |
| copied_trade_id | INTEGER REFERENCES trades(id) | Trade copiado |
| follower_id | INTEGER REFERENCES users(id) | Seguidor |
| trader_id | INTEGER REFERENCES copy_traders(id) | Trader |
| copy_amount | DECIMAL(18,8) | Monto copiado |
| profit_share_amount | DECIMAL(18,8) | Monto compartido |
| created_at | TIMESTAMP | Fecha |

---

## 26. SEÑALES DE TRADING

### `trading_signals`
Señales de trading.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| symbol | VARCHAR(20) | Par |
| direction | ENUM('up','down') | Dirección |
| entry_price | DECIMAL(18,8) | Precio de entrada |
| target_price | DECIMAL(18,8) | Precio objetivo |
| stop_loss | DECIMAL(18,8) | Stop loss |
| timeframe | VARCHAR(10) | Temporalidad |
| confidence | DECIMAL(5,2) | Confianza % |
| source | ENUM('ai','analyst','algorithm') | Fuente |
| status | ENUM('active','hit_target','hit_stop','expired') | Estado |
| expires_at | TIMESTAMP | Expiración |
| created_at | TIMESTAMP | Fecha de creación |

### `user_signal_subscriptions`
Suscripciones a señales.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| signal_type | ENUM('all','crypto','forex','commodities') | Tipo |
| auto_trade | BOOLEAN DEFAULT FALSE | Auto-operar |
| auto_trade_amount | DECIMAL(18,8) | Monto auto |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| created_at | TIMESTAMP | Fecha |

---

## 27. DEMO Y PRÁCTICA

### `demo_resets`
Historial de resets de cuenta demo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| previous_balance | DECIMAL(18,8) | Balance anterior |
| new_balance | DECIMAL(18,8) | Nuevo balance |
| reset_at | TIMESTAMP | Fecha de reset |

### `practice_challenges`
Desafíos de práctica.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(100) | Nombre |
| description | TEXT | Descripción |
| target_profit | DECIMAL(18,8) | Objetivo de ganancia |
| max_trades | INTEGER | Máximo de operaciones |
| time_limit_hours | INTEGER | Límite de tiempo |
| reward_type | ENUM('bonus','badge','points') | Tipo de recompensa |
| reward_value | DECIMAL(18,8) | Valor de recompensa |
| is_active | BOOLEAN DEFAULT TRUE | Activo |

### `user_practice_progress`
Progreso en desafíos de práctica.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| challenge_id | INTEGER REFERENCES practice_challenges(id) | Desafío |
| current_profit | DECIMAL(18,8) DEFAULT 0 | Ganancia actual |
| trades_made | INTEGER DEFAULT 0 | Operaciones realizadas |
| status | ENUM('in_progress','completed','failed') | Estado |
| started_at | TIMESTAMP | Fecha de inicio |
| completed_at | TIMESTAMP | Fecha de completado |

---

## 28. DISPOSITIVOS Y TOKENS

### `user_devices`
Dispositivos registrados del usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| device_id | VARCHAR(200) | ID del dispositivo |
| device_name | VARCHAR(100) | Nombre del dispositivo |
| device_type | ENUM('web','ios','android','desktop') | Tipo |
| push_token | VARCHAR(500) | Token para push notifications |
| is_trusted | BOOLEAN DEFAULT FALSE | Dispositivo confiable |
| last_used_at | TIMESTAMP | Último uso |
| created_at | TIMESTAMP | Fecha de registro |

### `refresh_tokens`
Tokens de refresco para autenticación.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| token | VARCHAR(500) UNIQUE | Token |
| device_id | INTEGER REFERENCES user_devices(id) | Dispositivo |
| expires_at | TIMESTAMP | Expiración |
| revoked_at | TIMESTAMP | Fecha de revocación |
| created_at | TIMESTAMP | Fecha de creación |

---

## 29. PAÍSES Y RESTRICCIONES

### `countries`
Países disponibles.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| code | VARCHAR(3) UNIQUE | Código ISO |
| name | VARCHAR(100) | Nombre |
| phone_code | VARCHAR(10) | Código telefónico |
| currency | VARCHAR(5) | Moneda local |
| is_restricted | BOOLEAN DEFAULT FALSE | Restringido |
| kyc_required | BOOLEAN DEFAULT TRUE | KYC requerido |
| is_active | BOOLEAN DEFAULT TRUE | Activo |

### `country_restrictions`
Restricciones por país.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| country_id | INTEGER REFERENCES countries(id) | País |
| restriction_type | ENUM('deposit','withdrawal','trading','registration') | Tipo |
| reason | TEXT | Razón |
| created_at | TIMESTAMP | Fecha |

---

## 30. TÉRMINOS Y CONDICIONES

### `legal_documents`
Documentos legales.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| type | ENUM('terms','privacy','risk','aml','cookies') | Tipo |
| title | VARCHAR(200) | Título |
| content | TEXT | Contenido |
| version | VARCHAR(20) | Versión |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| published_at | TIMESTAMP | Fecha de publicación |
| created_at | TIMESTAMP | Fecha de creación |

### `user_legal_acceptances`
Aceptaciones de documentos legales.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| document_id | INTEGER REFERENCES legal_documents(id) | Documento |
| ip_address | VARCHAR(45) | IP |
| accepted_at | TIMESTAMP | Fecha de aceptación |

---

## RESUMEN FINAL DE TABLAS

| Sección | Tablas | Descripción |
|---------|--------|-------------|
| 1. Usuarios | 3 | users, user_sessions, user_settings |
| 2. KYC | 2 | kyc_documents, kyc_status |
| 3. Billetera | 4 | wallets, transactions, deposit_addresses, withdrawal_requests |
| 4. Trading | 5 | trades, trade_markers, price_alerts, chart_drawings, user_favorites |
| 5. Bonos | 3 | bonuses, user_bonuses, promo_codes |
| 6. Referidos | 3 | referrals, referral_commissions, referral_tiers |
| 7. Notificaciones | 2 | notifications, notification_settings |
| 8. Torneos | 3 | tournaments, tournament_participants, tournament_prizes |
| 9. Academia | 7 | courses, course_lessons, user_course_progress, user_lesson_progress, tutorial_videos, glossary_terms, user_certificates |
| 10. Mercados | 2 | markets, trading_pairs |
| 11. Soporte | 5 | support_tickets, support_messages, support_video_calls, faqs, support_ratings |
| 12. Torneos (Adicional) | 3 | tournament_rebuys, tournament_rules, tournament_leaderboard_snapshots |
| 13. Configuración | 3 | platform_settings, trading_hours, maintenance_windows |
| 14. Auditoría | 3 | activity_logs, login_history, security_events |
| 15. Chat en Vivo | 2 | live_chat_sessions, live_chat_messages |
| 16. Gamificación | 3 | user_levels, user_achievements, achievements |
| 17. Comunicaciones | 4 | announcements, user_announcement_reads, email_templates, email_logs |
| 18. Gráficos | 4 | chart_layouts, chart_screenshots, chart_comparisons, backtesting_sessions |
| 19. Métodos de Pago | 2 | payment_methods, user_payment_addresses |
| 20. Estadísticas | 3 | user_statistics, user_daily_statistics, user_symbol_statistics |
| 21. Seguridad | 3 | user_pins, withdrawal_limits, user_withdrawal_usage |
| 22. Cashback/Lealtad | 4 | cashback_transactions, loyalty_points, loyalty_point_transactions, loyalty_rewards |
| 23. Indicadores | 2 | chart_indicators, user_indicator_settings |
| 24. Historial Precios | 2 | price_history, price_ticks |
| 25. Copy Trading | 3 | copy_traders, copy_followers, copy_trades |
| 26. Señales | 2 | trading_signals, user_signal_subscriptions |
| 27. Demo/Práctica | 3 | demo_resets, practice_challenges, user_practice_progress |
| 28. Dispositivos | 2 | user_devices, refresh_tokens |
| 29. Países | 2 | countries, country_restrictions |
| 30. Legal | 2 | legal_documents, user_legal_acceptances |

**Total: 91 tablas**
