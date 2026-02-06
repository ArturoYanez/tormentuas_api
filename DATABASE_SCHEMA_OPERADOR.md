# Esquema de Base de Datos - Usuario Operador

Este documento detalla todas las tablas necesarias para soportar las funcionalidades del usuario operador en la plataforma de trading.

---

## 1. OPERADORES Y AUTENTICACIÓN

### `operators`
Tabla principal de operadores.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) UNIQUE | Usuario base |
| employee_id | VARCHAR(20) UNIQUE | ID de empleado |
| first_name | VARCHAR(100) | Nombre |
| last_name | VARCHAR(100) | Apellido |
| email | VARCHAR(255) UNIQUE | Email corporativo |
| phone | VARCHAR(20) | Teléfono |
| avatar_url | VARCHAR(500) | URL del avatar |
| department | ENUM('trading','support','risk','compliance') | Departamento |
| position | VARCHAR(100) | Cargo |
| status | ENUM('available','busy','away','offline') | Estado actual |
| status_message | VARCHAR(200) | Mensaje de estado |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| created_at | TIMESTAMP | Fecha de registro |
| updated_at | TIMESTAMP | Última actualización |

### `operator_sessions`
Sesiones activas del operador.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| device | VARCHAR(200) | Dispositivo/navegador |
| ip_address | VARCHAR(45) | Dirección IP |
| location | VARCHAR(100) | Ubicación geográfica |
| token | VARCHAR(500) | Token de sesión |
| is_current | BOOLEAN DEFAULT FALSE | Sesión actual |
| last_active_at | TIMESTAMP | Última actividad |
| created_at | TIMESTAMP | Fecha de creación |
| expires_at | TIMESTAMP | Fecha de expiración |

### `operator_settings`
Configuraciones del operador.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) UNIQUE | Operador |
| theme | ENUM('dark','light') DEFAULT 'dark' | Tema |
| language | VARCHAR(5) DEFAULT 'es' | Idioma |
| timezone | VARCHAR(50) | Zona horaria |
| notifications_enabled | BOOLEAN DEFAULT TRUE | Notificaciones activas |
| auto_refresh | BOOLEAN DEFAULT TRUE | Auto-refrescar datos |
| sound_alerts | BOOLEAN DEFAULT FALSE | Alertas de sonido |
| email_alerts | BOOLEAN DEFAULT TRUE | Alertas por email |
| font_size | ENUM('small','medium','large') DEFAULT 'medium' | Tamaño de fuente |
| density | ENUM('compact','normal') DEFAULT 'normal' | Densidad de UI |
| do_not_disturb | BOOLEAN DEFAULT FALSE | No molestar |
| do_not_disturb_start | TIME | Inicio no molestar |
| do_not_disturb_end | TIME | Fin no molestar |
| session_timeout | INTEGER DEFAULT 30 | Timeout de sesión (min) |

### `operator_work_schedule`
Horario de trabajo del operador.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| day_of_week | INTEGER | Día de la semana (0-6) |
| start_time | TIME | Hora de inicio |
| end_time | TIME | Hora de fin |
| is_working_day | BOOLEAN DEFAULT TRUE | Día laboral |

---

## 2. PERMISOS Y ROLES DEL OPERADOR

### `operator_permissions`
Permisos específicos del operador.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| permission_id | INTEGER REFERENCES permissions(id) | Permiso |
| granted_by | INTEGER REFERENCES operators(id) | Otorgado por |
| granted_at | TIMESTAMP | Fecha de otorgamiento |

### `permissions`
Catálogo de permisos disponibles.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(100) UNIQUE | Nombre del permiso |
| code | VARCHAR(50) UNIQUE | Código del permiso |
| category | VARCHAR(50) | Categoría |
| description | TEXT | Descripción |
| is_active | BOOLEAN DEFAULT TRUE | Activo |

### `operator_roles`
Roles de operador.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(100) UNIQUE | Nombre del rol |
| description | TEXT | Descripción |
| permissions | JSONB | Lista de permisos |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| created_at | TIMESTAMP | Fecha de creación |

---

## 3. GESTIÓN DE TORNEOS POR OPERADOR

### `operator_tournament_actions`
Acciones del operador sobre torneos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| tournament_id | INTEGER REFERENCES tournaments(id) | Torneo |
| action | ENUM('create','edit','delete','pause','resume','cancel','duplicate') | Acción |
| old_data | JSONB | Datos anteriores |
| new_data | JSONB | Datos nuevos |
| reason | TEXT | Razón de la acción |
| created_at | TIMESTAMP | Fecha de acción |

### `tournament_operator_assignments`
Asignación de torneos a operadores.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| tournament_id | INTEGER REFERENCES tournaments(id) | Torneo |
| operator_id | INTEGER REFERENCES operators(id) | Operador asignado |
| role | ENUM('manager','monitor','support') | Rol en el torneo |
| assigned_by | INTEGER REFERENCES operators(id) | Asignado por |
| assigned_at | TIMESTAMP | Fecha de asignación |

### `participant_disqualifications`
Descalificaciones de participantes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| tournament_id | INTEGER REFERENCES tournaments(id) | Torneo |
| participant_id | INTEGER REFERENCES tournament_participants(id) | Participante |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| operator_id | INTEGER REFERENCES operators(id) | Operador que descalifica |
| reason | TEXT | Razón de descalificación |
| evidence | JSONB | Evidencia (screenshots, logs) |
| is_permanent | BOOLEAN DEFAULT FALSE | Descalificación permanente |
| created_at | TIMESTAMP | Fecha de descalificación |

### `tournament_manual_additions`
Adiciones manuales de usuarios a torneos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| tournament_id | INTEGER REFERENCES tournaments(id) | Torneo |
| user_id | INTEGER REFERENCES users(id) | Usuario agregado |
| operator_id | INTEGER REFERENCES operators(id) | Operador que agrega |
| reason | TEXT | Razón de la adición |
| waived_entry_fee | BOOLEAN DEFAULT FALSE | Entrada gratuita |
| created_at | TIMESTAMP | Fecha de adición |

---

## 4. GESTIÓN DE USUARIOS POR OPERADOR

### `user_notes`
Notas del operador sobre usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| note | TEXT | Contenido de la nota |
| priority | ENUM('low','medium','high','critical') | Prioridad |
| is_pinned | BOOLEAN DEFAULT FALSE | Fijada |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### `user_balance_adjustments`
Ajustes de balance realizados por operadores.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| wallet_id | INTEGER REFERENCES wallets(id) | Billetera |
| type | ENUM('add','subtract') | Tipo de ajuste |
| amount | DECIMAL(18,8) | Monto |
| previous_balance | DECIMAL(18,8) | Balance anterior |
| new_balance | DECIMAL(18,8) | Nuevo balance |
| reason | TEXT | Razón del ajuste |
| category | ENUM('bonus','correction','refund','penalty','other') | Categoría |
| approved_by | INTEGER REFERENCES operators(id) | Aprobado por (si requiere) |
| created_at | TIMESTAMP | Fecha del ajuste |

### `user_status_changes`
Cambios de estado de usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| previous_status | ENUM('active','suspended','pending','blocked') | Estado anterior |
| new_status | ENUM('active','suspended','pending','blocked') | Nuevo estado |
| reason | TEXT | Razón del cambio |
| duration_hours | INTEGER | Duración (si temporal) |
| expires_at | TIMESTAMP | Fecha de expiración |
| created_at | TIMESTAMP | Fecha del cambio |

### `user_trading_blocks`
Bloqueos de trading de usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| block_type | ENUM('full','symbol','amount','time') | Tipo de bloqueo |
| blocked_symbols | JSONB | Símbolos bloqueados |
| max_amount | DECIMAL(18,8) | Monto máximo permitido |
| reason | TEXT | Razón del bloqueo |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| expires_at | TIMESTAMP | Fecha de expiración |
| created_at | TIMESTAMP | Fecha de creación |

### `user_risk_assessments`
Evaluaciones de riesgo de usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| operator_id | INTEGER REFERENCES operators(id) | Operador evaluador |
| previous_level | ENUM('low','medium','high','critical') | Nivel anterior |
| new_level | ENUM('low','medium','high','critical') | Nuevo nivel |
| factors | JSONB | Factores de riesgo |
| notes | TEXT | Notas de evaluación |
| created_at | TIMESTAMP | Fecha de evaluación |

---

## 5. CONTROL DE OPERACIONES (TRADES)

### `trade_interventions`
Intervenciones del operador en operaciones.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| trade_id | INTEGER REFERENCES trades(id) | Operación |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| action | ENUM('cancel','force_win','force_loss','refund','flag','unflag') | Acción |
| original_result | ENUM('pending','won','lost') | Resultado original |
| new_result | ENUM('cancelled','won','lost','refunded') | Nuevo resultado |
| original_profit | DECIMAL(18,8) | Profit original |
| new_profit | DECIMAL(18,8) | Nuevo profit |
| reason | TEXT | Razón de intervención |
| approved_by | INTEGER REFERENCES operators(id) | Aprobado por |
| created_at | TIMESTAMP | Fecha de intervención |

### `trade_flags`
Marcadores de operaciones sospechosas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| trade_id | INTEGER REFERENCES trades(id) | Operación |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| flag_type | ENUM('suspicious','pattern','timing','amount','other') | Tipo de flag |
| reason | TEXT | Razón del flag |
| severity | ENUM('low','medium','high','critical') | Severidad |
| is_resolved | BOOLEAN DEFAULT FALSE | Resuelto |
| resolved_by | INTEGER REFERENCES operators(id) | Resuelto por |
| resolution_notes | TEXT | Notas de resolución |
| created_at | TIMESTAMP | Fecha de flag |
| resolved_at | TIMESTAMP | Fecha de resolución |

### `trade_cancellations`
Historial de cancelaciones de operaciones.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| trade_id | INTEGER REFERENCES trades(id) | Operación |
| user_id | INTEGER REFERENCES users(id) | Usuario afectado |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| original_amount | DECIMAL(18,8) | Monto original |
| refunded_amount | DECIMAL(18,8) | Monto reembolsado |
| reason | TEXT | Razón de cancelación |
| cancellation_type | ENUM('user_request','operator_decision','system','fraud') | Tipo |
| created_at | TIMESTAMP | Fecha de cancelación |

### `forced_trade_results`
Resultados forzados de operaciones.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| trade_id | INTEGER REFERENCES trades(id) | Operación |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| original_result | ENUM('pending','won','lost') | Resultado original |
| forced_result | ENUM('won','lost') | Resultado forzado |
| original_profit | DECIMAL(18,8) | Profit original |
| forced_profit | DECIMAL(18,8) | Profit forzado |
| reason | TEXT | Razón |
| approved_by | INTEGER REFERENCES operators(id) | Aprobado por |
| created_at | TIMESTAMP | Fecha |

---

## 6. SISTEMA DE ALERTAS

### `operator_alerts`
Alertas para operadores.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| type | ENUM('suspicious','high_volume','win_streak','pattern','system','fraud','compliance') | Tipo |
| severity | ENUM('low','medium','high','critical') | Severidad |
| title | VARCHAR(200) | Título |
| message | TEXT | Mensaje |
| user_id | INTEGER REFERENCES users(id) | Usuario relacionado |
| trade_id | INTEGER REFERENCES trades(id) | Operación relacionada |
| data | JSONB | Datos adicionales |
| is_read | BOOLEAN DEFAULT FALSE | Leída |
| is_resolved | BOOLEAN DEFAULT FALSE | Resuelta |
| assigned_to | INTEGER REFERENCES operators(id) | Asignada a |
| resolved_by | INTEGER REFERENCES operators(id) | Resuelta por |
| resolution_notes | TEXT | Notas de resolución |
| created_at | TIMESTAMP | Fecha de creación |
| read_at | TIMESTAMP | Fecha de lectura |
| resolved_at | TIMESTAMP | Fecha de resolución |

### `alert_thresholds`
Umbrales de alertas configurables.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| alert_type | VARCHAR(50) | Tipo de alerta |
| threshold_name | VARCHAR(100) | Nombre del umbral |
| threshold_value | DECIMAL(18,8) | Valor del umbral |
| comparison | ENUM('gt','gte','lt','lte','eq') | Comparación |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| created_by | INTEGER REFERENCES operators(id) | Creado por |
| updated_at | TIMESTAMP | Última actualización |

### `operator_alert_settings`
Configuración de alertas por operador.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| alert_type | VARCHAR(50) | Tipo de alerta |
| is_enabled | BOOLEAN DEFAULT TRUE | Habilitada |
| email_notification | BOOLEAN DEFAULT TRUE | Notificar por email |
| push_notification | BOOLEAN DEFAULT TRUE | Notificar por push |
| sound_notification | BOOLEAN DEFAULT FALSE | Notificar con sonido |
| custom_threshold | DECIMAL(18,8) | Umbral personalizado |

### `alert_escalations`
Escalaciones de alertas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| alert_id | INTEGER REFERENCES operator_alerts(id) | Alerta |
| escalated_from | INTEGER REFERENCES operators(id) | Escalado desde |
| escalated_to | INTEGER REFERENCES operators(id) | Escalado a |
| reason | TEXT | Razón de escalación |
| created_at | TIMESTAMP | Fecha de escalación |

---

## 7. CONFIGURACIÓN DE ACTIVOS

### `asset_configurations`
Configuraciones de activos por operador.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| trading_pair_id | INTEGER REFERENCES trading_pairs(id) | Par de trading |
| operator_id | INTEGER REFERENCES operators(id) | Operador que configura |
| payout_percentage | DECIMAL(5,2) | Porcentaje de payout |
| min_investment | DECIMAL(18,8) | Inversión mínima |
| max_investment | DECIMAL(18,8) | Inversión máxima |
| is_enabled | BOOLEAN DEFAULT TRUE | Habilitado |
| trading_hours_start | TIME | Hora de inicio |
| trading_hours_end | TIME | Hora de fin |
| reason | TEXT | Razón del cambio |
| created_at | TIMESTAMP | Fecha de configuración |

### `asset_status_changes`
Historial de cambios de estado de activos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| trading_pair_id | INTEGER REFERENCES trading_pairs(id) | Par de trading |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| previous_status | BOOLEAN | Estado anterior |
| new_status | BOOLEAN | Nuevo estado |
| reason | TEXT | Razón del cambio |
| created_at | TIMESTAMP | Fecha del cambio |

### `payout_adjustments`
Ajustes de payout por operador.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| trading_pair_id | INTEGER REFERENCES trading_pairs(id) | Par de trading |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| previous_payout | DECIMAL(5,2) | Payout anterior |
| new_payout | DECIMAL(5,2) | Nuevo payout |
| reason | TEXT | Razón del ajuste |
| approved_by | INTEGER REFERENCES operators(id) | Aprobado por |
| effective_from | TIMESTAMP | Efectivo desde |
| effective_until | TIMESTAMP | Efectivo hasta |
| created_at | TIMESTAMP | Fecha de creación |

---

## 8. CHAT INTERNO DEL EQUIPO

### `team_chat_rooms`
Salas de chat del equipo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(100) | Nombre de la sala |
| type | ENUM('general','operators','support','admin','private') | Tipo |
| description | TEXT | Descripción |
| is_active | BOOLEAN DEFAULT TRUE | Activa |
| created_by | INTEGER REFERENCES operators(id) | Creado por |
| created_at | TIMESTAMP | Fecha de creación |

### `team_chat_messages`
Mensajes del chat interno.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| room_id | INTEGER REFERENCES team_chat_rooms(id) | Sala |
| sender_id | INTEGER REFERENCES operators(id) | Remitente |
| sender_role | ENUM('operator','admin','support') | Rol del remitente |
| message | TEXT | Contenido del mensaje |
| reply_to | INTEGER REFERENCES team_chat_messages(id) | Respuesta a |
| is_edited | BOOLEAN DEFAULT FALSE | Editado |
| is_deleted | BOOLEAN DEFAULT FALSE | Eliminado |
| created_at | TIMESTAMP | Fecha de envío |
| edited_at | TIMESTAMP | Fecha de edición |

### `team_chat_attachments`
Archivos adjuntos del chat.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| message_id | INTEGER REFERENCES team_chat_messages(id) | Mensaje |
| file_type | ENUM('image','document','video','audio') | Tipo de archivo |
| file_name | VARCHAR(255) | Nombre del archivo |
| file_url | VARCHAR(500) | URL del archivo |
| file_size | INTEGER | Tamaño en bytes |
| created_at | TIMESTAMP | Fecha de subida |

### `team_chat_reactions`
Reacciones a mensajes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| message_id | INTEGER REFERENCES team_chat_messages(id) | Mensaje |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| emoji | VARCHAR(10) | Emoji de reacción |
| created_at | TIMESTAMP | Fecha de reacción |

### `team_chat_read_status`
Estado de lectura de mensajes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| room_id | INTEGER REFERENCES team_chat_rooms(id) | Sala |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| last_read_message_id | INTEGER REFERENCES team_chat_messages(id) | Último mensaje leído |
| last_read_at | TIMESTAMP | Fecha de última lectura |

### `team_chat_mentions`
Menciones en el chat.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| message_id | INTEGER REFERENCES team_chat_messages(id) | Mensaje |
| mentioned_operator_id | INTEGER REFERENCES operators(id) | Operador mencionado |
| is_read | BOOLEAN DEFAULT FALSE | Leída |
| created_at | TIMESTAMP | Fecha de mención |

---

## 9. LOGS DE ACTIVIDAD DEL OPERADOR

### `operator_activity_logs`
Registro de actividad del operador.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| action | VARCHAR(100) | Acción realizada |
| action_category | ENUM('user','trade','tournament','asset','alert','system','chat','settings') | Categoría |
| target_type | VARCHAR(50) | Tipo de entidad afectada |
| target_id | INTEGER | ID de entidad afectada |
| target_name | VARCHAR(200) | Nombre de entidad |
| old_data | JSONB | Datos anteriores |
| new_data | JSONB | Datos nuevos |
| ip_address | VARCHAR(45) | IP del operador |
| user_agent | TEXT | User agent |
| session_id | INTEGER REFERENCES operator_sessions(id) | Sesión |
| created_at | TIMESTAMP | Fecha de acción |

### `operator_login_history`
Historial de inicios de sesión.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| ip_address | VARCHAR(45) | Dirección IP |
| device | VARCHAR(200) | Dispositivo/navegador |
| location | VARCHAR(100) | Ubicación geográfica |
| status | ENUM('success','failed','blocked','2fa_required') | Estado del intento |
| failure_reason | VARCHAR(100) | Razón del fallo |
| two_factor_used | BOOLEAN DEFAULT FALSE | 2FA usado |
| created_at | TIMESTAMP | Fecha del intento |

### `operator_action_approvals`
Aprobaciones de acciones sensibles.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| action_type | VARCHAR(100) | Tipo de acción |
| requested_by | INTEGER REFERENCES operators(id) | Solicitado por |
| approved_by | INTEGER REFERENCES operators(id) | Aprobado por |
| target_type | VARCHAR(50) | Tipo de entidad |
| target_id | INTEGER | ID de entidad |
| request_data | JSONB | Datos de la solicitud |
| status | ENUM('pending','approved','rejected','expired') | Estado |
| rejection_reason | TEXT | Razón de rechazo |
| requested_at | TIMESTAMP | Fecha de solicitud |
| resolved_at | TIMESTAMP | Fecha de resolución |

---

## 10. MONITOREO EN TIEMPO REAL

### `live_monitoring_sessions`
Sesiones de monitoreo en vivo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| monitoring_type | ENUM('trades','users','alerts','system') | Tipo de monitoreo |
| filters | JSONB | Filtros aplicados |
| started_at | TIMESTAMP | Inicio de sesión |
| ended_at | TIMESTAMP | Fin de sesión |

### `monitored_users`
Usuarios bajo monitoreo especial.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| operator_id | INTEGER REFERENCES operators(id) | Operador que monitorea |
| reason | TEXT | Razón del monitoreo |
| priority | ENUM('low','medium','high','critical') | Prioridad |
| monitoring_type | ENUM('all_activity','trades_only','deposits','withdrawals') | Tipo |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| expires_at | TIMESTAMP | Fecha de expiración |
| created_at | TIMESTAMP | Fecha de inicio |

### `real_time_statistics`
Estadísticas en tiempo real.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| stat_type | VARCHAR(50) | Tipo de estadística |
| stat_key | VARCHAR(100) | Clave |
| stat_value | DECIMAL(18,8) | Valor |
| period | ENUM('minute','hour','day','week','month') | Período |
| recorded_at | TIMESTAMP | Fecha de registro |

### `operator_dashboard_widgets`
Widgets del dashboard del operador.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| widget_type | VARCHAR(50) | Tipo de widget |
| position | INTEGER | Posición |
| size | ENUM('small','medium','large') | Tamaño |
| config | JSONB | Configuración |
| is_visible | BOOLEAN DEFAULT TRUE | Visible |

---

## 11. REPORTES DEL OPERADOR

### `operator_reports`
Reportes generados por operadores.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| report_type | ENUM('daily','weekly','monthly','custom','incident') | Tipo |
| title | VARCHAR(200) | Título |
| description | TEXT | Descripción |
| data | JSONB | Datos del reporte |
| filters | JSONB | Filtros aplicados |
| file_url | VARCHAR(500) | URL del archivo |
| format | ENUM('pdf','csv','excel','json') | Formato |
| status | ENUM('generating','completed','failed') | Estado |
| created_at | TIMESTAMP | Fecha de creación |
| completed_at | TIMESTAMP | Fecha de completado |

### `scheduled_reports`
Reportes programados.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| report_type | VARCHAR(50) | Tipo de reporte |
| schedule | ENUM('daily','weekly','monthly') | Frecuencia |
| day_of_week | INTEGER | Día de la semana (0-6) |
| day_of_month | INTEGER | Día del mes (1-31) |
| time | TIME | Hora de generación |
| recipients | JSONB | Destinatarios |
| filters | JSONB | Filtros |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| last_run_at | TIMESTAMP | Última ejecución |
| next_run_at | TIMESTAMP | Próxima ejecución |

### `report_exports`
Exportaciones de datos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| export_type | ENUM('users','trades','transactions','alerts','logs') | Tipo |
| filters | JSONB | Filtros aplicados |
| file_url | VARCHAR(500) | URL del archivo |
| format | ENUM('csv','excel','json') | Formato |
| row_count | INTEGER | Número de filas |
| status | ENUM('pending','processing','completed','failed') | Estado |
| created_at | TIMESTAMP | Fecha de solicitud |
| completed_at | TIMESTAMP | Fecha de completado |
| expires_at | TIMESTAMP | Fecha de expiración |

---

## 12. SEGURIDAD DEL OPERADOR

### `operator_trusted_devices`
Dispositivos de confianza del operador.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| device_id | VARCHAR(200) | ID del dispositivo |
| device_name | VARCHAR(100) | Nombre del dispositivo |
| browser | VARCHAR(50) | Navegador |
| os | VARCHAR(50) | Sistema operativo |
| is_trusted | BOOLEAN DEFAULT TRUE | De confianza |
| last_used_at | TIMESTAMP | Último uso |
| created_at | TIMESTAMP | Fecha de registro |

### `operator_security_questions`
Preguntas de seguridad del operador.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| question | VARCHAR(200) | Pregunta |
| answer_hash | VARCHAR(255) | Respuesta hasheada |
| position | INTEGER | Orden |
| created_at | TIMESTAMP | Fecha de creación |

### `operator_two_factor`
Configuración 2FA del operador.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) UNIQUE | Operador |
| is_enabled | BOOLEAN DEFAULT FALSE | 2FA activo |
| secret | VARCHAR(100) | Secreto TOTP |
| backup_codes | JSONB | Códigos de respaldo |
| last_used_at | TIMESTAMP | Último uso |
| enabled_at | TIMESTAMP | Fecha de activación |

### `operator_security_settings`
Configuración de seguridad del operador.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) UNIQUE | Operador |
| login_alerts | BOOLEAN DEFAULT TRUE | Alertas de login |
| new_device_alert | BOOLEAN DEFAULT TRUE | Alerta nuevo dispositivo |
| failed_login_lock | BOOLEAN DEFAULT TRUE | Bloqueo por intentos fallidos |
| max_failed_attempts | INTEGER DEFAULT 5 | Máximo intentos fallidos |
| lock_duration_minutes | INTEGER DEFAULT 30 | Duración del bloqueo |
| require_2fa_for_sensitive | BOOLEAN DEFAULT TRUE | Requerir 2FA para acciones sensibles |
| ip_whitelist | JSONB | Lista blanca de IPs |
| updated_at | TIMESTAMP | Última actualización |

### `operator_password_history`
Historial de contraseñas del operador.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| password_hash | VARCHAR(255) | Hash de contraseña |
| created_at | TIMESTAMP | Fecha de cambio |

---

## 13. NOTIFICACIONES DEL OPERADOR

### `operator_notifications`
Notificaciones del operador.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| type | ENUM('alert','system','chat','task','reminder') | Tipo |
| title | VARCHAR(200) | Título |
| message | TEXT | Mensaje |
| data | JSONB | Datos adicionales |
| priority | ENUM('low','medium','high','urgent') | Prioridad |
| is_read | BOOLEAN DEFAULT FALSE | Leída |
| is_dismissed | BOOLEAN DEFAULT FALSE | Descartada |
| action_url | VARCHAR(500) | URL de acción |
| created_at | TIMESTAMP | Fecha de creación |
| read_at | TIMESTAMP | Fecha de lectura |

### `operator_notification_preferences`
Preferencias de notificaciones.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) UNIQUE | Operador |
| email_enabled | BOOLEAN DEFAULT TRUE | Email activo |
| push_enabled | BOOLEAN DEFAULT TRUE | Push activo |
| desktop_enabled | BOOLEAN DEFAULT TRUE | Desktop activo |
| alerts_enabled | BOOLEAN DEFAULT TRUE | Alertas activas |
| chat_enabled | BOOLEAN DEFAULT TRUE | Chat activo |
| system_enabled | BOOLEAN DEFAULT TRUE | Sistema activo |
| quiet_hours_enabled | BOOLEAN DEFAULT FALSE | Horas silenciosas |
| quiet_hours_start | TIME | Inicio horas silenciosas |
| quiet_hours_end | TIME | Fin horas silenciosas |

---

## 14. TAREAS Y ASIGNACIONES

### `operator_tasks`
Tareas asignadas a operadores.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| title | VARCHAR(200) | Título |
| description | TEXT | Descripción |
| assigned_to | INTEGER REFERENCES operators(id) | Asignado a |
| assigned_by | INTEGER REFERENCES operators(id) | Asignado por |
| priority | ENUM('low','medium','high','urgent') | Prioridad |
| status | ENUM('pending','in_progress','completed','cancelled') | Estado |
| due_date | TIMESTAMP | Fecha límite |
| related_type | VARCHAR(50) | Tipo relacionado |
| related_id | INTEGER | ID relacionado |
| completed_at | TIMESTAMP | Fecha de completado |
| created_at | TIMESTAMP | Fecha de creación |

### `operator_task_comments`
Comentarios en tareas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| task_id | INTEGER REFERENCES operator_tasks(id) | Tarea |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| comment | TEXT | Comentario |
| created_at | TIMESTAMP | Fecha de comentario |

### `shift_handovers`
Traspasos de turno.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| from_operator_id | INTEGER REFERENCES operators(id) | Operador saliente |
| to_operator_id | INTEGER REFERENCES operators(id) | Operador entrante |
| notes | TEXT | Notas del traspaso |
| pending_alerts | JSONB | Alertas pendientes |
| pending_tasks | JSONB | Tareas pendientes |
| important_users | JSONB | Usuarios importantes |
| acknowledged | BOOLEAN DEFAULT FALSE | Reconocido |
| acknowledged_at | TIMESTAMP | Fecha de reconocimiento |
| created_at | TIMESTAMP | Fecha de traspaso |

---

## 15. PATRONES Y DETECCIÓN DE FRAUDE

### `fraud_patterns`
Patrones de fraude detectados.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(100) | Nombre del patrón |
| description | TEXT | Descripción |
| pattern_type | ENUM('timing','amount','win_rate','ip','device','behavior') | Tipo |
| detection_rules | JSONB | Reglas de detección |
| severity | ENUM('low','medium','high','critical') | Severidad |
| auto_action | ENUM('none','flag','suspend','block') | Acción automática |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| created_by | INTEGER REFERENCES operators(id) | Creado por |
| created_at | TIMESTAMP | Fecha de creación |

### `fraud_detections`
Detecciones de fraude.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| pattern_id | INTEGER REFERENCES fraud_patterns(id) | Patrón detectado |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| trade_id | INTEGER REFERENCES trades(id) | Operación |
| confidence_score | DECIMAL(5,2) | Puntuación de confianza |
| evidence | JSONB | Evidencia |
| status | ENUM('pending','confirmed','false_positive','resolved') | Estado |
| reviewed_by | INTEGER REFERENCES operators(id) | Revisado por |
| action_taken | VARCHAR(100) | Acción tomada |
| notes | TEXT | Notas |
| detected_at | TIMESTAMP | Fecha de detección |
| reviewed_at | TIMESTAMP | Fecha de revisión |

### `user_behavior_analysis`
Análisis de comportamiento de usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| analysis_type | VARCHAR(50) | Tipo de análisis |
| metrics | JSONB | Métricas analizadas |
| anomalies | JSONB | Anomalías detectadas |
| risk_score | DECIMAL(5,2) | Puntuación de riesgo |
| analyzed_at | TIMESTAMP | Fecha de análisis |

---

## 16. CONFIGURACIÓN DE ATAJOS DE TECLADO

### `operator_keyboard_shortcuts`
Atajos de teclado personalizados.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| action | VARCHAR(100) | Acción |
| shortcut | VARCHAR(50) | Combinación de teclas |
| is_enabled | BOOLEAN DEFAULT TRUE | Habilitado |
| created_at | TIMESTAMP | Fecha de creación |

### `default_keyboard_shortcuts`
Atajos de teclado por defecto.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| action | VARCHAR(100) | Acción |
| shortcut | VARCHAR(50) | Combinación de teclas |
| description | VARCHAR(200) | Descripción |
| category | VARCHAR(50) | Categoría |
| is_active | BOOLEAN DEFAULT TRUE | Activo |

---

## 17. AUDITORÍA DE ACCIONES SENSIBLES

### `sensitive_action_logs`
Registro de acciones sensibles.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| action_type | VARCHAR(100) | Tipo de acción |
| target_type | VARCHAR(50) | Tipo de objetivo |
| target_id | INTEGER | ID del objetivo |
| action_data | JSONB | Datos de la acción |
| ip_address | VARCHAR(45) | IP |
| user_agent | TEXT | User agent |
| two_factor_verified | BOOLEAN DEFAULT FALSE | 2FA verificado |
| approval_id | INTEGER REFERENCES operator_action_approvals(id) | Aprobación |
| created_at | TIMESTAMP | Fecha de acción |

### `data_access_logs`
Registro de acceso a datos sensibles.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| data_type | VARCHAR(50) | Tipo de dato |
| data_id | INTEGER | ID del dato |
| access_type | ENUM('view','export','modify') | Tipo de acceso |
| fields_accessed | JSONB | Campos accedidos |
| ip_address | VARCHAR(45) | IP |
| created_at | TIMESTAMP | Fecha de acceso |

---

## 18. MÉTRICAS DE RENDIMIENTO DEL OPERADOR

### `operator_performance_metrics`
Métricas de rendimiento.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| period_start | DATE | Inicio del período |
| period_end | DATE | Fin del período |
| alerts_resolved | INTEGER DEFAULT 0 | Alertas resueltas |
| avg_resolution_time | INTEGER | Tiempo promedio resolución (min) |
| users_managed | INTEGER DEFAULT 0 | Usuarios gestionados |
| trades_reviewed | INTEGER DEFAULT 0 | Operaciones revisadas |
| tournaments_managed | INTEGER DEFAULT 0 | Torneos gestionados |
| tasks_completed | INTEGER DEFAULT 0 | Tareas completadas |
| login_hours | DECIMAL(10,2) | Horas conectado |
| created_at | TIMESTAMP | Fecha de cálculo |

### `operator_daily_stats`
Estadísticas diarias del operador.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| date | DATE | Fecha |
| login_time | TIME | Hora de entrada |
| logout_time | TIME | Hora de salida |
| active_minutes | INTEGER DEFAULT 0 | Minutos activo |
| actions_count | INTEGER DEFAULT 0 | Acciones realizadas |
| alerts_handled | INTEGER DEFAULT 0 | Alertas manejadas |
| chat_messages | INTEGER DEFAULT 0 | Mensajes de chat |

---

## ÍNDICES RECOMENDADOS

```sql
-- Operators
CREATE INDEX idx_operators_user_id ON operators(user_id);
CREATE INDEX idx_operators_status ON operators(status);
CREATE INDEX idx_operators_department ON operators(department);

-- Operator Sessions
CREATE INDEX idx_operator_sessions_operator_id ON operator_sessions(operator_id);
CREATE INDEX idx_operator_sessions_token ON operator_sessions(token);

-- Operator Activity Logs
CREATE INDEX idx_operator_activity_logs_operator_id ON operator_activity_logs(operator_id);
CREATE INDEX idx_operator_activity_logs_action ON operator_activity_logs(action);
CREATE INDEX idx_operator_activity_logs_created_at ON operator_activity_logs(created_at);
CREATE INDEX idx_operator_activity_logs_target ON operator_activity_logs(target_type, target_id);

-- User Notes
CREATE INDEX idx_user_notes_user_id ON user_notes(user_id);
CREATE INDEX idx_user_notes_operator_id ON user_notes(operator_id);

-- User Balance Adjustments
CREATE INDEX idx_user_balance_adjustments_user_id ON user_balance_adjustments(user_id);
CREATE INDEX idx_user_balance_adjustments_operator_id ON user_balance_adjustments(operator_id);
CREATE INDEX idx_user_balance_adjustments_created_at ON user_balance_adjustments(created_at);

-- Trade Interventions
CREATE INDEX idx_trade_interventions_trade_id ON trade_interventions(trade_id);
CREATE INDEX idx_trade_interventions_operator_id ON trade_interventions(operator_id);
CREATE INDEX idx_trade_interventions_created_at ON trade_interventions(created_at);

-- Trade Flags
CREATE INDEX idx_trade_flags_trade_id ON trade_flags(trade_id);
CREATE INDEX idx_trade_flags_is_resolved ON trade_flags(is_resolved);

-- Operator Alerts
CREATE INDEX idx_operator_alerts_type ON operator_alerts(type);
CREATE INDEX idx_operator_alerts_severity ON operator_alerts(severity);
CREATE INDEX idx_operator_alerts_is_resolved ON operator_alerts(is_resolved);
CREATE INDEX idx_operator_alerts_assigned_to ON operator_alerts(assigned_to);
CREATE INDEX idx_operator_alerts_created_at ON operator_alerts(created_at);

-- Team Chat Messages
CREATE INDEX idx_team_chat_messages_room_id ON team_chat_messages(room_id);
CREATE INDEX idx_team_chat_messages_sender_id ON team_chat_messages(sender_id);
CREATE INDEX idx_team_chat_messages_created_at ON team_chat_messages(created_at);

-- Monitored Users
CREATE INDEX idx_monitored_users_user_id ON monitored_users(user_id);
CREATE INDEX idx_monitored_users_operator_id ON monitored_users(operator_id);
CREATE INDEX idx_monitored_users_is_active ON monitored_users(is_active);

-- Fraud Detections
CREATE INDEX idx_fraud_detections_user_id ON fraud_detections(user_id);
CREATE INDEX idx_fraud_detections_status ON fraud_detections(status);
CREATE INDEX idx_fraud_detections_detected_at ON fraud_detections(detected_at);

-- Operator Tasks
CREATE INDEX idx_operator_tasks_assigned_to ON operator_tasks(assigned_to);
CREATE INDEX idx_operator_tasks_status ON operator_tasks(status);
CREATE INDEX idx_operator_tasks_due_date ON operator_tasks(due_date);

-- Tournament Actions
CREATE INDEX idx_operator_tournament_actions_tournament_id ON operator_tournament_actions(tournament_id);
CREATE INDEX idx_operator_tournament_actions_operator_id ON operator_tournament_actions(operator_id);

-- Participant Disqualifications
CREATE INDEX idx_participant_disqualifications_tournament_id ON participant_disqualifications(tournament_id);
CREATE INDEX idx_participant_disqualifications_user_id ON participant_disqualifications(user_id);

-- Login History
CREATE INDEX idx_operator_login_history_operator_id ON operator_login_history(operator_id);
CREATE INDEX idx_operator_login_history_created_at ON operator_login_history(created_at);

-- Sensitive Action Logs
CREATE INDEX idx_sensitive_action_logs_operator_id ON sensitive_action_logs(operator_id);
CREATE INDEX idx_sensitive_action_logs_action_type ON sensitive_action_logs(action_type);
CREATE INDEX idx_sensitive_action_logs_created_at ON sensitive_action_logs(created_at);
```

---

## RELACIONES PRINCIPALES

```
operators (1) ─────────── (N) operator_sessions
operators (1) ─────────── (1) operator_settings
operators (1) ─────────── (N) operator_work_schedule
operators (1) ─────────── (N) operator_permissions
operators (1) ─────────── (N) operator_activity_logs
operators (1) ─────────── (N) operator_login_history
operators (1) ─────────── (N) operator_notifications
operators (1) ─────────── (1) operator_notification_preferences
operators (1) ─────────── (N) operator_trusted_devices
operators (1) ─────────── (N) operator_security_questions
operators (1) ─────────── (1) operator_two_factor
operators (1) ─────────── (1) operator_security_settings
operators (1) ─────────── (N) operator_keyboard_shortcuts

operators (1) ─────────── (N) user_notes
operators (1) ─────────── (N) user_balance_adjustments
operators (1) ─────────── (N) user_status_changes
operators (1) ─────────── (N) user_trading_blocks
operators (1) ─────────── (N) user_risk_assessments

operators (1) ─────────── (N) trade_interventions
operators (1) ─────────── (N) trade_flags
operators (1) ─────────── (N) trade_cancellations
operators (1) ─────────── (N) forced_trade_results

operators (1) ─────────── (N) operator_alerts (assigned_to)
operators (1) ─────────── (N) operator_alert_settings
operators (1) ─────────── (N) alert_escalations

operators (1) ─────────── (N) operator_tournament_actions
operators (1) ─────────── (N) tournament_operator_assignments
operators (1) ─────────── (N) participant_disqualifications
operators (1) ─────────── (N) tournament_manual_additions

operators (1) ─────────── (N) asset_configurations
operators (1) ─────────── (N) asset_status_changes
operators (1) ─────────── (N) payout_adjustments

operators (1) ─────────── (N) team_chat_messages
operators (1) ─────────── (N) team_chat_reactions
operators (1) ─────────── (N) team_chat_mentions

operators (1) ─────────── (N) operator_tasks (assigned_to)
operators (1) ─────────── (N) operator_task_comments
operators (1) ─────────── (N) shift_handovers

operators (1) ─────────── (N) monitored_users
operators (1) ─────────── (N) fraud_detections (reviewed_by)

operators (1) ─────────── (N) operator_reports
operators (1) ─────────── (N) scheduled_reports
operators (1) ─────────── (N) report_exports

operators (1) ─────────── (N) operator_performance_metrics
operators (1) ─────────── (N) operator_daily_stats

operators (1) ─────────── (N) sensitive_action_logs
operators (1) ─────────── (N) data_access_logs
operators (1) ─────────── (N) operator_action_approvals

team_chat_rooms (1) ───── (N) team_chat_messages
team_chat_messages (1) ── (N) team_chat_attachments
team_chat_messages (1) ── (N) team_chat_reactions
team_chat_messages (1) ── (N) team_chat_mentions

operator_tasks (1) ────── (N) operator_task_comments

fraud_patterns (1) ────── (N) fraud_detections

operator_alerts (1) ───── (N) alert_escalations
```

---

## RESUMEN DE TABLAS

| Sección | Tablas | Descripción |
|---------|--------|-------------|
| 1. Operadores y Autenticación | 4 | operators, operator_sessions, operator_settings, operator_work_schedule |
| 2. Permisos y Roles | 3 | operator_permissions, permissions, operator_roles |
| 3. Gestión de Torneos | 4 | operator_tournament_actions, tournament_operator_assignments, participant_disqualifications, tournament_manual_additions |
| 4. Gestión de Usuarios | 5 | user_notes, user_balance_adjustments, user_status_changes, user_trading_blocks, user_risk_assessments |
| 5. Control de Operaciones | 4 | trade_interventions, trade_flags, trade_cancellations, forced_trade_results |
| 6. Sistema de Alertas | 4 | operator_alerts, alert_thresholds, operator_alert_settings, alert_escalations |
| 7. Configuración de Activos | 3 | asset_configurations, asset_status_changes, payout_adjustments |
| 8. Chat Interno | 6 | team_chat_rooms, team_chat_messages, team_chat_attachments, team_chat_reactions, team_chat_read_status, team_chat_mentions |
| 9. Logs de Actividad | 3 | operator_activity_logs, operator_login_history, operator_action_approvals |
| 10. Monitoreo en Tiempo Real | 4 | live_monitoring_sessions, monitored_users, real_time_statistics, operator_dashboard_widgets |
| 11. Reportes | 3 | operator_reports, scheduled_reports, report_exports |
| 12. Seguridad | 5 | operator_trusted_devices, operator_security_questions, operator_two_factor, operator_security_settings, operator_password_history |
| 13. Notificaciones | 2 | operator_notifications, operator_notification_preferences |
| 14. Tareas y Asignaciones | 3 | operator_tasks, operator_task_comments, shift_handovers |
| 15. Detección de Fraude | 3 | fraud_patterns, fraud_detections, user_behavior_analysis |
| 16. Atajos de Teclado | 2 | operator_keyboard_shortcuts, default_keyboard_shortcuts |
| 17. Auditoría | 2 | sensitive_action_logs, data_access_logs |
| 18. Métricas de Rendimiento | 2 | operator_performance_metrics, operator_daily_stats |

**Total: 62 tablas**

---

## NOTAS ADICIONALES

### Acciones que requieren aprobación:
- Ajustes de balance superiores a cierto monto
- Forzar resultado de operaciones
- Bloquear usuarios
- Cambios de payout
- Descalificaciones de torneos

### Acciones que requieren 2FA:
- Ajustes de balance
- Forzar resultados
- Bloquear usuarios
- Exportar datos sensibles
- Cambiar configuración de seguridad

### Datos sensibles que se registran:
- Acceso a información financiera de usuarios
- Visualización de datos personales
- Exportación de datos
- Modificación de operaciones
- Cambios de estado de usuarios


---

## 19. GRÁFICOS Y ESTADÍSTICAS DEL DASHBOARD

### `dashboard_chart_data`
Datos de gráficos del dashboard.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| chart_type | ENUM('operations','volume','users','revenue') | Tipo de gráfico |
| period | ENUM('hour','day','week','month') | Período |
| data_point | TIMESTAMP | Punto de datos |
| wins | INTEGER DEFAULT 0 | Victorias |
| losses | INTEGER DEFAULT 0 | Pérdidas |
| volume | DECIMAL(18,8) DEFAULT 0 | Volumen |
| revenue | DECIMAL(18,8) DEFAULT 0 | Ingresos |
| created_at | TIMESTAMP | Fecha de registro |

### `volume_by_asset`
Volumen por activo para gráficos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| symbol | VARCHAR(20) | Par de trading |
| period | ENUM('hour','day','week','month') | Período |
| period_start | TIMESTAMP | Inicio del período |
| volume | DECIMAL(18,8) DEFAULT 0 | Volumen |
| trades_count | INTEGER DEFAULT 0 | Número de operaciones |
| wins | INTEGER DEFAULT 0 | Victorias |
| losses | INTEGER DEFAULT 0 | Pérdidas |

### `operator_quick_actions`
Acciones rápidas del dashboard.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| action_type | VARCHAR(50) | Tipo de acción |
| action_label | VARCHAR(100) | Etiqueta |
| action_icon | VARCHAR(50) | Icono |
| action_url | VARCHAR(200) | URL de acción |
| position | INTEGER | Posición |
| is_visible | BOOLEAN DEFAULT TRUE | Visible |

---

## 20. CONFIGURACIÓN DE FILTROS Y BÚSQUEDAS

### `saved_filters`
Filtros guardados por operador.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| filter_name | VARCHAR(100) | Nombre del filtro |
| filter_type | ENUM('users','operations','tournaments','alerts') | Tipo |
| filter_config | JSONB | Configuración del filtro |
| is_default | BOOLEAN DEFAULT FALSE | Por defecto |
| created_at | TIMESTAMP | Fecha de creación |

### `search_history`
Historial de búsquedas del operador.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| search_type | ENUM('users','operations','tournaments') | Tipo |
| search_query | VARCHAR(200) | Consulta |
| results_count | INTEGER | Resultados encontrados |
| created_at | TIMESTAMP | Fecha de búsqueda |

---

## 21. SISTEMA DE INFORMACIÓN Y VERSIONES

### `system_info`
Información del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| version | VARCHAR(20) | Versión del sistema |
| last_update | TIMESTAMP | Última actualización |
| server_name | VARCHAR(50) | Nombre del servidor |
| server_region | VARCHAR(50) | Región del servidor |
| is_maintenance | BOOLEAN DEFAULT FALSE | En mantenimiento |

### `server_status`
Estado del servidor en tiempo real.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| server_name | VARCHAR(50) | Nombre del servidor |
| status | ENUM('online','offline','degraded','maintenance') | Estado |
| latency_ms | INTEGER | Latencia en ms |
| cpu_usage | DECIMAL(5,2) | Uso de CPU % |
| memory_usage | DECIMAL(5,2) | Uso de memoria % |
| active_connections | INTEGER | Conexiones activas |
| last_check | TIMESTAMP | Última verificación |

### `system_announcements`
Anuncios del sistema para operadores.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| title | VARCHAR(200) | Título |
| message | TEXT | Mensaje |
| type | ENUM('info','warning','critical','maintenance') | Tipo |
| target_roles | JSONB | Roles objetivo |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| starts_at | TIMESTAMP | Inicio |
| ends_at | TIMESTAMP | Fin |
| created_by | INTEGER REFERENCES operators(id) | Creado por |
| created_at | TIMESTAMP | Fecha de creación |

---

## 22. EXPORTACIÓN Y DESCARGA DE DATOS

### `export_templates`
Plantillas de exportación.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(100) | Nombre de la plantilla |
| export_type | ENUM('users','operations','transactions','alerts') | Tipo |
| columns | JSONB | Columnas a exportar |
| default_filters | JSONB | Filtros por defecto |
| format | ENUM('csv','excel','json','pdf') | Formato |
| is_system | BOOLEAN DEFAULT FALSE | Plantilla del sistema |
| created_by | INTEGER REFERENCES operators(id) | Creado por |
| created_at | TIMESTAMP | Fecha de creación |

### `download_queue`
Cola de descargas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| export_type | VARCHAR(50) | Tipo de exportación |
| file_name | VARCHAR(255) | Nombre del archivo |
| file_url | VARCHAR(500) | URL del archivo |
| file_size | INTEGER | Tamaño en bytes |
| status | ENUM('queued','processing','completed','failed','expired') | Estado |
| progress | INTEGER DEFAULT 0 | Progreso % |
| error_message | TEXT | Mensaje de error |
| created_at | TIMESTAMP | Fecha de solicitud |
| completed_at | TIMESTAMP | Fecha de completado |
| expires_at | TIMESTAMP | Fecha de expiración |

---

## 23. LOGS DE OPERACIONES EN TIEMPO REAL

### `real_time_operation_logs`
Logs de operaciones en tiempo real.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| trade_id | INTEGER REFERENCES trades(id) | Operación |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| symbol | VARCHAR(20) | Par |
| direction | ENUM('up','down') | Dirección |
| amount | DECIMAL(18,8) | Monto |
| result | ENUM('pending','won','lost','cancelled') | Resultado |
| profit | DECIMAL(18,8) | Profit |
| is_flagged | BOOLEAN DEFAULT FALSE | Marcada |
| flag_reason | VARCHAR(200) | Razón del flag |
| open_time | TIMESTAMP | Hora de apertura |
| close_time | TIMESTAMP | Hora de cierre |

### `operation_feed_settings`
Configuración del feed de operaciones.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) UNIQUE | Operador |
| auto_refresh | BOOLEAN DEFAULT TRUE | Auto-refrescar |
| refresh_interval | INTEGER DEFAULT 5 | Intervalo en segundos |
| show_flagged_only | BOOLEAN DEFAULT FALSE | Solo marcadas |
| show_pending_only | BOOLEAN DEFAULT FALSE | Solo pendientes |
| sound_on_flag | BOOLEAN DEFAULT TRUE | Sonido al marcar |
| max_items | INTEGER DEFAULT 50 | Máximo de items |

---

## 24. GESTIÓN DE USUARIOS AVANZADA

### `user_verification_overrides`
Sobrescrituras de verificación de usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| verification_type | ENUM('kyc','email','phone','2fa') | Tipo |
| previous_status | BOOLEAN | Estado anterior |
| new_status | BOOLEAN | Nuevo estado |
| reason | TEXT | Razón |
| approved_by | INTEGER REFERENCES operators(id) | Aprobado por |
| created_at | TIMESTAMP | Fecha |

### `user_level_overrides`
Sobrescrituras de nivel de usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| previous_level | VARCHAR(20) | Nivel anterior |
| new_level | VARCHAR(20) | Nuevo nivel |
| reason | TEXT | Razón |
| is_permanent | BOOLEAN DEFAULT FALSE | Permanente |
| expires_at | TIMESTAMP | Fecha de expiración |
| created_at | TIMESTAMP | Fecha |

### `user_payout_overrides`
Sobrescrituras de payout por usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| symbol | VARCHAR(20) | Par (null = todos) |
| payout_adjustment | DECIMAL(5,2) | Ajuste de payout % |
| reason | TEXT | Razón |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| expires_at | TIMESTAMP | Fecha de expiración |
| created_at | TIMESTAMP | Fecha |

---

## 25. COMUNICACIÓN CON USUARIOS

### `operator_user_messages`
Mensajes del operador a usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| subject | VARCHAR(200) | Asunto |
| message | TEXT | Mensaje |
| message_type | ENUM('info','warning','action_required','promotional') | Tipo |
| is_read | BOOLEAN DEFAULT FALSE | Leído |
| read_at | TIMESTAMP | Fecha de lectura |
| created_at | TIMESTAMP | Fecha de envío |

### `bulk_messages`
Mensajes masivos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| subject | VARCHAR(200) | Asunto |
| message | TEXT | Mensaje |
| target_criteria | JSONB | Criterios de selección |
| recipients_count | INTEGER | Número de destinatarios |
| sent_count | INTEGER DEFAULT 0 | Enviados |
| status | ENUM('draft','sending','completed','cancelled') | Estado |
| created_at | TIMESTAMP | Fecha de creación |
| sent_at | TIMESTAMP | Fecha de envío |

---

## 26. CONFIGURACIÓN DE VOLATILIDAD

### `asset_volatility_settings`
Configuración de volatilidad por activo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| trading_pair_id | INTEGER REFERENCES trading_pairs(id) | Par |
| volatility_level | ENUM('low','medium','high','extreme') | Nivel |
| spread_adjustment | DECIMAL(5,2) | Ajuste de spread |
| payout_adjustment | DECIMAL(5,2) | Ajuste de payout |
| max_position_size | DECIMAL(18,8) | Tamaño máximo de posición |
| is_auto | BOOLEAN DEFAULT TRUE | Automático |
| updated_by | INTEGER REFERENCES operators(id) | Actualizado por |
| updated_at | TIMESTAMP | Última actualización |

### `volatility_alerts`
Alertas de volatilidad.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| symbol | VARCHAR(20) | Par |
| previous_level | ENUM('low','medium','high','extreme') | Nivel anterior |
| new_level | ENUM('low','medium','high','extreme') | Nuevo nivel |
| change_percentage | DECIMAL(10,4) | Cambio % |
| is_acknowledged | BOOLEAN DEFAULT FALSE | Reconocida |
| acknowledged_by | INTEGER REFERENCES operators(id) | Reconocida por |
| created_at | TIMESTAMP | Fecha de alerta |

---

## ÍNDICES ADICIONALES

```sql
-- Dashboard Charts
CREATE INDEX idx_dashboard_chart_data_type_period ON dashboard_chart_data(chart_type, period);
CREATE INDEX idx_volume_by_asset_symbol_period ON volume_by_asset(symbol, period);

-- Saved Filters
CREATE INDEX idx_saved_filters_operator_id ON saved_filters(operator_id);
CREATE INDEX idx_saved_filters_type ON saved_filters(filter_type);

-- Search History
CREATE INDEX idx_search_history_operator_id ON search_history(operator_id);

-- Export Queue
CREATE INDEX idx_download_queue_operator_id ON download_queue(operator_id);
CREATE INDEX idx_download_queue_status ON download_queue(status);

-- Real Time Logs
CREATE INDEX idx_real_time_operation_logs_trade_id ON real_time_operation_logs(trade_id);
CREATE INDEX idx_real_time_operation_logs_is_flagged ON real_time_operation_logs(is_flagged);

-- User Overrides
CREATE INDEX idx_user_verification_overrides_user_id ON user_verification_overrides(user_id);
CREATE INDEX idx_user_level_overrides_user_id ON user_level_overrides(user_id);
CREATE INDEX idx_user_payout_overrides_user_id ON user_payout_overrides(user_id);

-- Messages
CREATE INDEX idx_operator_user_messages_user_id ON operator_user_messages(user_id);
CREATE INDEX idx_operator_user_messages_operator_id ON operator_user_messages(operator_id);
CREATE INDEX idx_bulk_messages_operator_id ON bulk_messages(operator_id);

-- Volatility
CREATE INDEX idx_asset_volatility_settings_pair_id ON asset_volatility_settings(trading_pair_id);
CREATE INDEX idx_volatility_alerts_symbol ON volatility_alerts(symbol);
```

---

## RESUMEN ACTUALIZADO DE TABLAS

| Sección | Tablas | Descripción |
|---------|--------|-------------|
| 1. Operadores y Autenticación | 4 | operators, operator_sessions, operator_settings, operator_work_schedule |
| 2. Permisos y Roles | 3 | operator_permissions, permissions, operator_roles |
| 3. Gestión de Torneos | 4 | operator_tournament_actions, tournament_operator_assignments, participant_disqualifications, tournament_manual_additions |
| 4. Gestión de Usuarios | 5 | user_notes, user_balance_adjustments, user_status_changes, user_trading_blocks, user_risk_assessments |
| 5. Control de Operaciones | 4 | trade_interventions, trade_flags, trade_cancellations, forced_trade_results |
| 6. Sistema de Alertas | 4 | operator_alerts, alert_thresholds, operator_alert_settings, alert_escalations |
| 7. Configuración de Activos | 3 | asset_configurations, asset_status_changes, payout_adjustments |
| 8. Chat Interno | 6 | team_chat_rooms, team_chat_messages, team_chat_attachments, team_chat_reactions, team_chat_read_status, team_chat_mentions |
| 9. Logs de Actividad | 3 | operator_activity_logs, operator_login_history, operator_action_approvals |
| 10. Monitoreo en Tiempo Real | 4 | live_monitoring_sessions, monitored_users, real_time_statistics, operator_dashboard_widgets |
| 11. Reportes | 3 | operator_reports, scheduled_reports, report_exports |
| 12. Seguridad | 5 | operator_trusted_devices, operator_security_questions, operator_two_factor, operator_security_settings, operator_password_history |
| 13. Notificaciones | 2 | operator_notifications, operator_notification_preferences |
| 14. Tareas y Asignaciones | 3 | operator_tasks, operator_task_comments, shift_handovers |
| 15. Detección de Fraude | 3 | fraud_patterns, fraud_detections, user_behavior_analysis |
| 16. Atajos de Teclado | 2 | operator_keyboard_shortcuts, default_keyboard_shortcuts |
| 17. Auditoría | 2 | sensitive_action_logs, data_access_logs |
| 18. Métricas de Rendimiento | 2 | operator_performance_metrics, operator_daily_stats |
| 19. Gráficos Dashboard | 3 | dashboard_chart_data, volume_by_asset, operator_quick_actions |
| 20. Filtros y Búsquedas | 2 | saved_filters, search_history |
| 21. Sistema e Info | 3 | system_info, server_status, system_announcements |
| 22. Exportación | 2 | export_templates, download_queue |
| 23. Logs Tiempo Real | 2 | real_time_operation_logs, operation_feed_settings |
| 24. Gestión Usuarios Avanzada | 3 | user_verification_overrides, user_level_overrides, user_payout_overrides |
| 25. Comunicación Usuarios | 2 | operator_user_messages, bulk_messages |
| 26. Volatilidad | 2 | asset_volatility_settings, volatility_alerts |

**Total: 81 tablas**


---

## 27. CAMBIO DE CONTRASEÑA Y RECUPERACIÓN

### `operator_password_reset_tokens`
Tokens de recuperación de contraseña.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| token | VARCHAR(255) UNIQUE | Token de reset |
| is_used | BOOLEAN DEFAULT FALSE | Usado |
| expires_at | TIMESTAMP | Fecha de expiración |
| created_at | TIMESTAMP | Fecha de creación |
| used_at | TIMESTAMP | Fecha de uso |

### `password_change_requests`
Solicitudes de cambio de contraseña.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| status | ENUM('pending','completed','expired','cancelled') | Estado |
| ip_address | VARCHAR(45) | IP de solicitud |
| user_agent | TEXT | User agent |
| created_at | TIMESTAMP | Fecha de solicitud |
| completed_at | TIMESTAMP | Fecha de completado |

---

## 28. DUPLICACIÓN DE TORNEOS

### `tournament_duplications`
Historial de duplicaciones de torneos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| original_tournament_id | INTEGER REFERENCES tournaments(id) | Torneo original |
| new_tournament_id | INTEGER REFERENCES tournaments(id) | Torneo duplicado |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| changes_made | JSONB | Cambios realizados |
| created_at | TIMESTAMP | Fecha de duplicación |

---

## 29. PREMIOS DE TORNEOS POR OPERADOR

### `tournament_prize_configurations`
Configuración de premios de torneos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| tournament_id | INTEGER REFERENCES tournaments(id) | Torneo |
| position | INTEGER | Posición (1, 2, 3...) |
| prize_amount | DECIMAL(18,8) | Monto del premio |
| prize_type | ENUM('cash','bonus','merchandise','other') | Tipo de premio |
| prize_description | TEXT | Descripción del premio |
| configured_by | INTEGER REFERENCES operators(id) | Configurado por |
| created_at | TIMESTAMP | Fecha de configuración |
| updated_at | TIMESTAMP | Última actualización |

### `tournament_prize_distributions`
Distribución de premios ejecutada.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| tournament_id | INTEGER REFERENCES tournaments(id) | Torneo |
| user_id | INTEGER REFERENCES users(id) | Usuario ganador |
| position | INTEGER | Posición final |
| prize_amount | DECIMAL(18,8) | Monto del premio |
| prize_type | ENUM('cash','bonus','merchandise','other') | Tipo |
| status | ENUM('pending','distributed','failed') | Estado |
| distributed_by | INTEGER REFERENCES operators(id) | Distribuido por |
| distributed_at | TIMESTAMP | Fecha de distribución |
| transaction_id | INTEGER REFERENCES transactions(id) | Transacción asociada |

---

## 30. CATEGORÍAS DE TORNEOS

### `tournament_categories`
Categorías de torneos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(50) UNIQUE | Nombre (forex, crypto, stocks, mixed) |
| display_name | VARCHAR(100) | Nombre para mostrar |
| description | TEXT | Descripción |
| icon | VARCHAR(50) | Icono |
| color | VARCHAR(20) | Color |
| allowed_symbols | JSONB | Símbolos permitidos |
| is_active | BOOLEAN DEFAULT TRUE | Activa |
| position | INTEGER | Orden |

### `tournament_featured`
Torneos destacados.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| tournament_id | INTEGER REFERENCES tournaments(id) | Torneo |
| featured_by | INTEGER REFERENCES operators(id) | Destacado por |
| position | INTEGER | Posición en destacados |
| starts_at | TIMESTAMP | Inicio de destacado |
| ends_at | TIMESTAMP | Fin de destacado |
| created_at | TIMESTAMP | Fecha de creación |

---

## 31. PAUSAS Y REANUDACIONES DE TORNEOS

### `tournament_pauses`
Historial de pausas de torneos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| tournament_id | INTEGER REFERENCES tournaments(id) | Torneo |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| reason | TEXT | Razón de la pausa |
| paused_at | TIMESTAMP | Fecha de pausa |
| resumed_at | TIMESTAMP | Fecha de reanudación |
| resumed_by | INTEGER REFERENCES operators(id) | Reanudado por |
| duration_minutes | INTEGER | Duración de la pausa |

---

## 32. ESTADÍSTICAS DE OPERACIONES POR PERÍODO

### `operations_hourly_stats`
Estadísticas por hora.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| hour_start | TIMESTAMP | Inicio de la hora |
| total_trades | INTEGER DEFAULT 0 | Total operaciones |
| wins | INTEGER DEFAULT 0 | Victorias |
| losses | INTEGER DEFAULT 0 | Pérdidas |
| pending | INTEGER DEFAULT 0 | Pendientes |
| cancelled | INTEGER DEFAULT 0 | Canceladas |
| total_volume | DECIMAL(18,8) DEFAULT 0 | Volumen total |
| total_profit | DECIMAL(18,8) DEFAULT 0 | Profit total |
| total_loss | DECIMAL(18,8) DEFAULT 0 | Pérdida total |
| unique_users | INTEGER DEFAULT 0 | Usuarios únicos |

### `operations_daily_stats`
Estadísticas diarias.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| date | DATE | Fecha |
| total_trades | INTEGER DEFAULT 0 | Total operaciones |
| wins | INTEGER DEFAULT 0 | Victorias |
| losses | INTEGER DEFAULT 0 | Pérdidas |
| cancelled | INTEGER DEFAULT 0 | Canceladas |
| flagged | INTEGER DEFAULT 0 | Marcadas |
| total_volume | DECIMAL(18,8) DEFAULT 0 | Volumen total |
| total_profit | DECIMAL(18,8) DEFAULT 0 | Profit total |
| total_loss | DECIMAL(18,8) DEFAULT 0 | Pérdida total |
| unique_users | INTEGER DEFAULT 0 | Usuarios únicos |
| avg_trade_amount | DECIMAL(18,8) DEFAULT 0 | Monto promedio |

### `operations_weekly_stats`
Estadísticas semanales.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| week_start | DATE | Inicio de semana |
| week_end | DATE | Fin de semana |
| total_trades | INTEGER DEFAULT 0 | Total operaciones |
| wins | INTEGER DEFAULT 0 | Victorias |
| losses | INTEGER DEFAULT 0 | Pérdidas |
| total_volume | DECIMAL(18,8) DEFAULT 0 | Volumen total |
| net_profit | DECIMAL(18,8) DEFAULT 0 | Profit neto |
| unique_users | INTEGER DEFAULT 0 | Usuarios únicos |
| new_users | INTEGER DEFAULT 0 | Usuarios nuevos |

### `operations_monthly_stats`
Estadísticas mensuales.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| year | INTEGER | Año |
| month | INTEGER | Mes |
| total_trades | INTEGER DEFAULT 0 | Total operaciones |
| wins | INTEGER DEFAULT 0 | Victorias |
| losses | INTEGER DEFAULT 0 | Pérdidas |
| total_volume | DECIMAL(18,8) DEFAULT 0 | Volumen total |
| net_profit | DECIMAL(18,8) DEFAULT 0 | Profit neto |
| unique_users | INTEGER DEFAULT 0 | Usuarios únicos |
| new_users | INTEGER DEFAULT 0 | Usuarios nuevos |
| avg_daily_volume | DECIMAL(18,8) DEFAULT 0 | Volumen diario promedio |

---

## 33. RESUMEN DE TORNEOS PARA REPORTES

### `tournament_summary_stats`
Resumen estadístico de torneos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| tournament_id | INTEGER REFERENCES tournaments(id) | Torneo |
| total_participants | INTEGER DEFAULT 0 | Total participantes |
| active_participants | INTEGER DEFAULT 0 | Participantes activos |
| disqualified_participants | INTEGER DEFAULT 0 | Descalificados |
| total_trades | INTEGER DEFAULT 0 | Total operaciones |
| total_volume | DECIMAL(18,8) DEFAULT 0 | Volumen total |
| avg_profit_per_user | DECIMAL(18,8) DEFAULT 0 | Profit promedio |
| top_profit | DECIMAL(18,8) DEFAULT 0 | Mayor profit |
| lowest_profit | DECIMAL(18,8) DEFAULT 0 | Menor profit |
| calculated_at | TIMESTAMP | Fecha de cálculo |

---

## 34. USUARIOS ACTIVOS EN TIEMPO REAL

### `active_users_snapshot`
Snapshot de usuarios activos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| snapshot_time | TIMESTAMP | Hora del snapshot |
| total_active | INTEGER DEFAULT 0 | Total activos |
| trading_now | INTEGER DEFAULT 0 | Operando ahora |
| in_tournament | INTEGER DEFAULT 0 | En torneo |
| by_country | JSONB | Por país |
| by_device | JSONB | Por dispositivo |

### `user_online_status`
Estado online de usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) UNIQUE | Usuario |
| is_online | BOOLEAN DEFAULT FALSE | Online |
| last_activity | TIMESTAMP | Última actividad |
| current_page | VARCHAR(100) | Página actual |
| device_type | ENUM('web','ios','android','desktop') | Tipo de dispositivo |
| ip_address | VARCHAR(45) | IP |

---

## 35. CONFIGURACIÓN DE ALERTAS AVANZADA

### `alert_rules`
Reglas de alertas personalizadas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(100) | Nombre de la regla |
| description | TEXT | Descripción |
| alert_type | VARCHAR(50) | Tipo de alerta |
| conditions | JSONB | Condiciones |
| actions | JSONB | Acciones a ejecutar |
| severity | ENUM('low','medium','high','critical') | Severidad |
| is_active | BOOLEAN DEFAULT TRUE | Activa |
| created_by | INTEGER REFERENCES operators(id) | Creado por |
| created_at | TIMESTAMP | Fecha de creación |

### `alert_action_history`
Historial de acciones de alertas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| alert_id | INTEGER REFERENCES operator_alerts(id) | Alerta |
| action_type | VARCHAR(50) | Tipo de acción |
| action_data | JSONB | Datos de la acción |
| executed_by | INTEGER REFERENCES operators(id) | Ejecutado por |
| executed_at | TIMESTAMP | Fecha de ejecución |
| result | ENUM('success','failed','pending') | Resultado |
| error_message | TEXT | Mensaje de error |

---

## 36. WIN STREAKS Y PATRONES

### `user_win_streaks`
Rachas de victorias de usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| streak_count | INTEGER | Número de victorias consecutivas |
| streak_start | TIMESTAMP | Inicio de la racha |
| streak_end | TIMESTAMP | Fin de la racha |
| total_profit | DECIMAL(18,8) | Profit total de la racha |
| symbols_traded | JSONB | Símbolos operados |
| is_active | BOOLEAN DEFAULT TRUE | Racha activa |
| flagged | BOOLEAN DEFAULT FALSE | Marcada como sospechosa |
| reviewed_by | INTEGER REFERENCES operators(id) | Revisado por |

### `trading_patterns`
Patrones de trading detectados.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| pattern_type | VARCHAR(50) | Tipo de patrón |
| pattern_description | TEXT | Descripción |
| confidence_score | DECIMAL(5,2) | Puntuación de confianza |
| trades_involved | JSONB | Operaciones involucradas |
| detected_at | TIMESTAMP | Fecha de detección |
| status | ENUM('pending','confirmed','dismissed') | Estado |
| reviewed_by | INTEGER REFERENCES operators(id) | Revisado por |
| review_notes | TEXT | Notas de revisión |

---

## 37. RESUMEN DE USUARIOS PARA OPERADOR

### `user_summary_cache`
Cache de resumen de usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) UNIQUE | Usuario |
| total_balance | DECIMAL(18,8) | Balance total |
| demo_balance | DECIMAL(18,8) | Balance demo |
| total_trades | INTEGER | Total operaciones |
| win_rate | DECIMAL(5,2) | Win rate |
| total_deposits | DECIMAL(18,8) | Total depósitos |
| total_withdrawals | DECIMAL(18,8) | Total retiros |
| risk_level | ENUM('low','medium','high','critical') | Nivel de riesgo |
| last_trade_at | TIMESTAMP | Última operación |
| last_deposit_at | TIMESTAMP | Último depósito |
| notes_count | INTEGER DEFAULT 0 | Número de notas |
| flags_count | INTEGER DEFAULT 0 | Número de flags |
| updated_at | TIMESTAMP | Última actualización |

---

## 38. HISTORIAL DE ACCIONES EN OPERACIONES

### `trade_action_history`
Historial de acciones en operaciones.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| trade_id | INTEGER REFERENCES trades(id) | Operación |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| action | VARCHAR(50) | Acción realizada |
| previous_state | JSONB | Estado anterior |
| new_state | JSONB | Nuevo estado |
| reason | TEXT | Razón |
| ip_address | VARCHAR(45) | IP |
| created_at | TIMESTAMP | Fecha de acción |

---

## 39. CONFIGURACIÓN DE HORARIOS DE TRADING

### `trading_schedule_overrides`
Sobrescrituras de horarios de trading.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| trading_pair_id | INTEGER REFERENCES trading_pairs(id) | Par |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| override_type | ENUM('close','extend','restrict') | Tipo |
| original_start | TIME | Hora inicio original |
| original_end | TIME | Hora fin original |
| new_start | TIME | Nueva hora inicio |
| new_end | TIME | Nueva hora fin |
| reason | TEXT | Razón |
| effective_date | DATE | Fecha efectiva |
| is_recurring | BOOLEAN DEFAULT FALSE | Recurrente |
| created_at | TIMESTAMP | Fecha de creación |

---

## 40. LÍMITES DE INVERSIÓN POR OPERADOR

### `investment_limit_overrides`
Sobrescrituras de límites de inversión.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| trading_pair_id | INTEGER REFERENCES trading_pairs(id) | Par |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| previous_min | DECIMAL(18,8) | Mínimo anterior |
| previous_max | DECIMAL(18,8) | Máximo anterior |
| new_min | DECIMAL(18,8) | Nuevo mínimo |
| new_max | DECIMAL(18,8) | Nuevo máximo |
| reason | TEXT | Razón |
| approved_by | INTEGER REFERENCES operators(id) | Aprobado por |
| effective_from | TIMESTAMP | Efectivo desde |
| effective_until | TIMESTAMP | Efectivo hasta |
| created_at | TIMESTAMP | Fecha de creación |

---

## ÍNDICES ADICIONALES (SECCIONES 27-40)

```sql
-- Password Reset
CREATE INDEX idx_operator_password_reset_tokens_operator_id ON operator_password_reset_tokens(operator_id);
CREATE INDEX idx_operator_password_reset_tokens_token ON operator_password_reset_tokens(token);

-- Tournament Duplications
CREATE INDEX idx_tournament_duplications_original_id ON tournament_duplications(original_tournament_id);
CREATE INDEX idx_tournament_duplications_operator_id ON tournament_duplications(operator_id);

-- Prize Configurations
CREATE INDEX idx_tournament_prize_configurations_tournament_id ON tournament_prize_configurations(tournament_id);
CREATE INDEX idx_tournament_prize_distributions_tournament_id ON tournament_prize_distributions(tournament_id);
CREATE INDEX idx_tournament_prize_distributions_user_id ON tournament_prize_distributions(user_id);

-- Tournament Pauses
CREATE INDEX idx_tournament_pauses_tournament_id ON tournament_pauses(tournament_id);

-- Operations Stats
CREATE INDEX idx_operations_hourly_stats_hour_start ON operations_hourly_stats(hour_start);
CREATE INDEX idx_operations_daily_stats_date ON operations_daily_stats(date);
CREATE INDEX idx_operations_weekly_stats_week_start ON operations_weekly_stats(week_start);
CREATE INDEX idx_operations_monthly_stats_year_month ON operations_monthly_stats(year, month);

-- Active Users
CREATE INDEX idx_active_users_snapshot_time ON active_users_snapshot(snapshot_time);
CREATE INDEX idx_user_online_status_user_id ON user_online_status(user_id);
CREATE INDEX idx_user_online_status_is_online ON user_online_status(is_online);

-- Alert Rules
CREATE INDEX idx_alert_rules_alert_type ON alert_rules(alert_type);
CREATE INDEX idx_alert_rules_is_active ON alert_rules(is_active);

-- Win Streaks
CREATE INDEX idx_user_win_streaks_user_id ON user_win_streaks(user_id);
CREATE INDEX idx_user_win_streaks_is_active ON user_win_streaks(is_active);
CREATE INDEX idx_trading_patterns_user_id ON trading_patterns(user_id);

-- User Summary Cache
CREATE INDEX idx_user_summary_cache_user_id ON user_summary_cache(user_id);
CREATE INDEX idx_user_summary_cache_risk_level ON user_summary_cache(risk_level);

-- Trade Action History
CREATE INDEX idx_trade_action_history_trade_id ON trade_action_history(trade_id);
CREATE INDEX idx_trade_action_history_operator_id ON trade_action_history(operator_id);

-- Trading Schedule
CREATE INDEX idx_trading_schedule_overrides_pair_id ON trading_schedule_overrides(trading_pair_id);

-- Investment Limits
CREATE INDEX idx_investment_limit_overrides_pair_id ON investment_limit_overrides(trading_pair_id);
```

---

## RESUMEN FINAL DE TABLAS

| Sección | Tablas | Descripción |
|---------|--------|-------------|
| 1. Operadores y Autenticación | 4 | operators, operator_sessions, operator_settings, operator_work_schedule |
| 2. Permisos y Roles | 3 | operator_permissions, permissions, operator_roles |
| 3. Gestión de Torneos | 4 | operator_tournament_actions, tournament_operator_assignments, participant_disqualifications, tournament_manual_additions |
| 4. Gestión de Usuarios | 5 | user_notes, user_balance_adjustments, user_status_changes, user_trading_blocks, user_risk_assessments |
| 5. Control de Operaciones | 4 | trade_interventions, trade_flags, trade_cancellations, forced_trade_results |
| 6. Sistema de Alertas | 4 | operator_alerts, alert_thresholds, operator_alert_settings, alert_escalations |
| 7. Configuración de Activos | 3 | asset_configurations, asset_status_changes, payout_adjustments |
| 8. Chat Interno | 6 | team_chat_rooms, team_chat_messages, team_chat_attachments, team_chat_reactions, team_chat_read_status, team_chat_mentions |
| 9. Logs de Actividad | 3 | operator_activity_logs, operator_login_history, operator_action_approvals |
| 10. Monitoreo en Tiempo Real | 4 | live_monitoring_sessions, monitored_users, real_time_statistics, operator_dashboard_widgets |
| 11. Reportes | 3 | operator_reports, scheduled_reports, report_exports |
| 12. Seguridad | 5 | operator_trusted_devices, operator_security_questions, operator_two_factor, operator_security_settings, operator_password_history |
| 13. Notificaciones | 2 | operator_notifications, operator_notification_preferences |
| 14. Tareas y Asignaciones | 3 | operator_tasks, operator_task_comments, shift_handovers |
| 15. Detección de Fraude | 3 | fraud_patterns, fraud_detections, user_behavior_analysis |
| 16. Atajos de Teclado | 2 | operator_keyboard_shortcuts, default_keyboard_shortcuts |
| 17. Auditoría | 2 | sensitive_action_logs, data_access_logs |
| 18. Métricas de Rendimiento | 2 | operator_performance_metrics, operator_daily_stats |
| 19. Gráficos Dashboard | 3 | dashboard_chart_data, volume_by_asset, operator_quick_actions |
| 20. Filtros y Búsquedas | 2 | saved_filters, search_history |
| 21. Sistema e Info | 3 | system_info, server_status, system_announcements |
| 22. Exportación | 2 | export_templates, download_queue |
| 23. Logs Tiempo Real | 2 | real_time_operation_logs, operation_feed_settings |
| 24. Gestión Usuarios Avanzada | 3 | user_verification_overrides, user_level_overrides, user_payout_overrides |
| 25. Comunicación Usuarios | 2 | operator_user_messages, bulk_messages |
| 26. Volatilidad | 2 | asset_volatility_settings, volatility_alerts |
| 27. Contraseña y Recuperación | 2 | operator_password_reset_tokens, password_change_requests |
| 28. Duplicación Torneos | 1 | tournament_duplications |
| 29. Premios Torneos | 2 | tournament_prize_configurations, tournament_prize_distributions |
| 30. Categorías Torneos | 2 | tournament_categories, tournament_featured |
| 31. Pausas Torneos | 1 | tournament_pauses |
| 32. Estadísticas Operaciones | 4 | operations_hourly_stats, operations_daily_stats, operations_weekly_stats, operations_monthly_stats |
| 33. Resumen Torneos | 1 | tournament_summary_stats |
| 34. Usuarios Activos | 2 | active_users_snapshot, user_online_status |
| 35. Alertas Avanzadas | 2 | alert_rules, alert_action_history |
| 36. Win Streaks y Patrones | 2 | user_win_streaks, trading_patterns |
| 37. Resumen Usuarios | 1 | user_summary_cache |
| 38. Historial Acciones Trades | 1 | trade_action_history |
| 39. Horarios Trading | 1 | trading_schedule_overrides |
| 40. Límites Inversión | 1 | investment_limit_overrides |

**Total: 103 tablas**

---

## NOTAS FINALES

### Funcionalidades cubiertas:
- ✅ Dashboard con estadísticas y gráficos (día/semana/mes)
- ✅ Gestión completa de torneos (CRUD, pausar, duplicar, destacar)
- ✅ Configuración de premios por posición
- ✅ Gestión de participantes (descalificar, agregar manualmente)
- ✅ Gestión de usuarios (notas, balance, estado, bloqueos, riesgo)
- ✅ Control de operaciones (cancelar, forzar resultado, marcar)
- ✅ Sistema de alertas con umbrales configurables
- ✅ Detección de win streaks y patrones sospechosos
- ✅ Configuración de activos (payout, límites, horarios, volatilidad)
- ✅ Chat interno del equipo con reacciones y menciones
- ✅ Monitoreo en tiempo real de operaciones y usuarios
- ✅ Reportes y exportaciones (CSV, Excel, JSON, PDF)
- ✅ Seguridad (2FA, sesiones, dispositivos, preguntas de seguridad)
- ✅ Configuración de apariencia (tema, fuente, densidad)
- ✅ Configuración de notificaciones y modo no molestar
- ✅ Configuración regional (idioma, zona horaria)
- ✅ Atajos de teclado personalizables
- ✅ Información del sistema y estado del servidor
- ✅ Métricas de rendimiento del operador
- ✅ Traspasos de turno entre operadores


---

## 41. REGLAS DE TORNEOS

### `tournament_rules_templates`
Plantillas de reglas de torneos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(100) | Nombre de la plantilla |
| description | TEXT | Descripción |
| rules_text | TEXT | Texto de las reglas |
| category | ENUM('forex','crypto','stocks','mixed') | Categoría |
| is_default | BOOLEAN DEFAULT FALSE | Por defecto |
| created_by | INTEGER REFERENCES operators(id) | Creado por |
| created_at | TIMESTAMP | Fecha de creación |

### `tournament_rules_history`
Historial de cambios en reglas de torneos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| tournament_id | INTEGER REFERENCES tournaments(id) | Torneo |
| previous_rules | TEXT | Reglas anteriores |
| new_rules | TEXT | Nuevas reglas |
| changed_by | INTEGER REFERENCES operators(id) | Cambiado por |
| reason | TEXT | Razón del cambio |
| changed_at | TIMESTAMP | Fecha del cambio |

---

## 42. BALANCE INICIAL DE TORNEOS

### `tournament_initial_balance_config`
Configuración de balance inicial de torneos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| tournament_id | INTEGER REFERENCES tournaments(id) | Torneo |
| initial_balance | DECIMAL(18,8) | Balance inicial |
| currency | VARCHAR(10) DEFAULT 'USD' | Moneda |
| allow_rebuy | BOOLEAN DEFAULT FALSE | Permitir rebuy |
| rebuy_cost | DECIMAL(18,8) | Costo de rebuy |
| max_rebuys | INTEGER DEFAULT 0 | Máximo de rebuys |
| configured_by | INTEGER REFERENCES operators(id) | Configurado por |
| created_at | TIMESTAMP | Fecha de configuración |

---

## 43. CUOTA DE ENTRADA DE TORNEOS

### `tournament_entry_fee_config`
Configuración de cuota de entrada.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| tournament_id | INTEGER REFERENCES tournaments(id) | Torneo |
| entry_fee | DECIMAL(18,8) | Cuota de entrada |
| currency | VARCHAR(10) DEFAULT 'USD' | Moneda |
| early_bird_discount | DECIMAL(5,2) | Descuento early bird % |
| early_bird_until | TIMESTAMP | Hasta cuándo aplica |
| vip_discount | DECIMAL(5,2) | Descuento VIP % |
| referral_discount | DECIMAL(5,2) | Descuento por referido % |
| configured_by | INTEGER REFERENCES operators(id) | Configurado por |
| created_at | TIMESTAMP | Fecha de configuración |

### `tournament_entry_payments`
Pagos de entrada a torneos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| tournament_id | INTEGER REFERENCES tournaments(id) | Torneo |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| amount_paid | DECIMAL(18,8) | Monto pagado |
| discount_applied | DECIMAL(18,8) | Descuento aplicado |
| discount_type | VARCHAR(50) | Tipo de descuento |
| payment_method | VARCHAR(50) | Método de pago |
| transaction_id | INTEGER REFERENCES transactions(id) | Transacción |
| status | ENUM('pending','completed','refunded','failed') | Estado |
| paid_at | TIMESTAMP | Fecha de pago |

---

## 44. PARTICIPANTES DE TORNEOS DETALLADO

### `tournament_participant_details`
Detalles extendidos de participantes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| participant_id | INTEGER REFERENCES tournament_participants(id) | Participante |
| tournament_id | INTEGER REFERENCES tournaments(id) | Torneo |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| current_balance | DECIMAL(18,8) | Balance actual |
| initial_balance | DECIMAL(18,8) | Balance inicial |
| total_trades | INTEGER DEFAULT 0 | Total operaciones |
| winning_trades | INTEGER DEFAULT 0 | Operaciones ganadas |
| losing_trades | INTEGER DEFAULT 0 | Operaciones perdidas |
| total_profit | DECIMAL(18,8) DEFAULT 0 | Profit total |
| total_loss | DECIMAL(18,8) DEFAULT 0 | Pérdida total |
| net_profit | DECIMAL(18,8) DEFAULT 0 | Profit neto |
| profit_percentage | DECIMAL(10,4) DEFAULT 0 | Porcentaje de profit |
| current_rank | INTEGER | Posición actual |
| best_rank | INTEGER | Mejor posición |
| worst_rank | INTEGER | Peor posición |
| last_trade_at | TIMESTAMP | Última operación |
| updated_at | TIMESTAMP | Última actualización |

### `tournament_participant_trades`
Operaciones de participantes en torneos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| participant_id | INTEGER REFERENCES tournament_participants(id) | Participante |
| tournament_id | INTEGER REFERENCES tournaments(id) | Torneo |
| trade_id | INTEGER REFERENCES trades(id) | Operación |
| symbol | VARCHAR(20) | Par |
| direction | ENUM('up','down') | Dirección |
| amount | DECIMAL(18,8) | Monto |
| result | ENUM('won','lost','pending','cancelled') | Resultado |
| profit | DECIMAL(18,8) | Profit |
| balance_before | DECIMAL(18,8) | Balance antes |
| balance_after | DECIMAL(18,8) | Balance después |
| rank_before | INTEGER | Posición antes |
| rank_after | INTEGER | Posición después |
| created_at | TIMESTAMP | Fecha de operación |

---

## 45. FECHAS DE TORNEOS

### `tournament_dates`
Fechas importantes de torneos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| tournament_id | INTEGER REFERENCES tournaments(id) | Torneo |
| registration_start | TIMESTAMP | Inicio de registro |
| registration_end | TIMESTAMP | Fin de registro |
| trading_start | TIMESTAMP | Inicio de trading |
| trading_end | TIMESTAMP | Fin de trading |
| results_announcement | TIMESTAMP | Anuncio de resultados |
| prize_distribution | TIMESTAMP | Distribución de premios |
| configured_by | INTEGER REFERENCES operators(id) | Configurado por |
| created_at | TIMESTAMP | Fecha de configuración |

### `tournament_date_changes`
Cambios en fechas de torneos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| tournament_id | INTEGER REFERENCES tournaments(id) | Torneo |
| date_type | VARCHAR(50) | Tipo de fecha |
| previous_date | TIMESTAMP | Fecha anterior |
| new_date | TIMESTAMP | Nueva fecha |
| reason | TEXT | Razón del cambio |
| changed_by | INTEGER REFERENCES operators(id) | Cambiado por |
| changed_at | TIMESTAMP | Fecha del cambio |
| notified_participants | BOOLEAN DEFAULT FALSE | Participantes notificados |

---

## 46. MÁXIMO DE PARTICIPANTES

### `tournament_capacity_config`
Configuración de capacidad de torneos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| tournament_id | INTEGER REFERENCES tournaments(id) | Torneo |
| max_participants | INTEGER | Máximo de participantes |
| min_participants | INTEGER | Mínimo de participantes |
| waitlist_enabled | BOOLEAN DEFAULT FALSE | Lista de espera habilitada |
| waitlist_max | INTEGER | Máximo en lista de espera |
| auto_start_on_min | BOOLEAN DEFAULT FALSE | Iniciar al alcanzar mínimo |
| configured_by | INTEGER REFERENCES operators(id) | Configurado por |
| created_at | TIMESTAMP | Fecha de configuración |

### `tournament_waitlist`
Lista de espera de torneos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| tournament_id | INTEGER REFERENCES tournaments(id) | Torneo |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| position | INTEGER | Posición en lista |
| status | ENUM('waiting','admitted','expired','cancelled') | Estado |
| added_at | TIMESTAMP | Fecha de adición |
| admitted_at | TIMESTAMP | Fecha de admisión |
| notified | BOOLEAN DEFAULT FALSE | Notificado |

---

## 47. OPERACIONES POR TIPO (BUY/SELL)

### `operation_type_stats`
Estadísticas por tipo de operación.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| date | DATE | Fecha |
| symbol | VARCHAR(20) | Par |
| buy_count | INTEGER DEFAULT 0 | Operaciones buy |
| sell_count | INTEGER DEFAULT 0 | Operaciones sell |
| buy_volume | DECIMAL(18,8) DEFAULT 0 | Volumen buy |
| sell_volume | DECIMAL(18,8) DEFAULT 0 | Volumen sell |
| buy_wins | INTEGER DEFAULT 0 | Wins en buy |
| sell_wins | INTEGER DEFAULT 0 | Wins en sell |
| buy_losses | INTEGER DEFAULT 0 | Losses en buy |
| sell_losses | INTEGER DEFAULT 0 | Losses en sell |

---

## 48. DURACIÓN DE OPERACIONES

### `operation_duration_config`
Configuración de duraciones de operaciones.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| trading_pair_id | INTEGER REFERENCES trading_pairs(id) | Par |
| duration_seconds | INTEGER | Duración en segundos |
| is_enabled | BOOLEAN DEFAULT TRUE | Habilitada |
| payout_adjustment | DECIMAL(5,2) | Ajuste de payout |
| min_amount | DECIMAL(18,8) | Monto mínimo |
| max_amount | DECIMAL(18,8) | Monto máximo |
| configured_by | INTEGER REFERENCES operators(id) | Configurado por |
| created_at | TIMESTAMP | Fecha de configuración |

### `operation_duration_stats`
Estadísticas por duración.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| date | DATE | Fecha |
| duration_seconds | INTEGER | Duración |
| total_trades | INTEGER DEFAULT 0 | Total operaciones |
| wins | INTEGER DEFAULT 0 | Victorias |
| losses | INTEGER DEFAULT 0 | Pérdidas |
| total_volume | DECIMAL(18,8) DEFAULT 0 | Volumen total |

---

## 49. RAZONES DE FLAG EN OPERACIONES

### `flag_reasons`
Catálogo de razones de flag.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| code | VARCHAR(50) UNIQUE | Código |
| name | VARCHAR(100) | Nombre |
| description | TEXT | Descripción |
| severity | ENUM('low','medium','high','critical') | Severidad |
| auto_action | ENUM('none','alert','suspend','block') | Acción automática |
| is_active | BOOLEAN DEFAULT TRUE | Activa |
| created_at | TIMESTAMP | Fecha de creación |

### `operation_flag_details`
Detalles de flags en operaciones.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| trade_id | INTEGER REFERENCES trades(id) | Operación |
| flag_reason_id | INTEGER REFERENCES flag_reasons(id) | Razón |
| custom_reason | TEXT | Razón personalizada |
| evidence | JSONB | Evidencia |
| flagged_by | INTEGER REFERENCES operators(id) | Marcado por |
| flagged_at | TIMESTAMP | Fecha de flag |
| reviewed | BOOLEAN DEFAULT FALSE | Revisado |
| reviewed_by | INTEGER REFERENCES operators(id) | Revisado por |
| reviewed_at | TIMESTAMP | Fecha de revisión |
| review_notes | TEXT | Notas de revisión |
| action_taken | VARCHAR(100) | Acción tomada |

---

## 50. PAÍSES DE USUARIOS

### `user_country_stats`
Estadísticas por país.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| country_code | VARCHAR(5) | Código de país |
| country_name | VARCHAR(100) | Nombre del país |
| total_users | INTEGER DEFAULT 0 | Total usuarios |
| active_users | INTEGER DEFAULT 0 | Usuarios activos |
| total_volume | DECIMAL(18,8) DEFAULT 0 | Volumen total |
| total_deposits | DECIMAL(18,8) DEFAULT 0 | Total depósitos |
| total_withdrawals | DECIMAL(18,8) DEFAULT 0 | Total retiros |
| updated_at | TIMESTAMP | Última actualización |

---

## 51. VERIFICACIÓN DE USUARIOS

### `user_verification_status`
Estado de verificación de usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) UNIQUE | Usuario |
| email_verified | BOOLEAN DEFAULT FALSE | Email verificado |
| phone_verified | BOOLEAN DEFAULT FALSE | Teléfono verificado |
| identity_verified | BOOLEAN DEFAULT FALSE | Identidad verificada |
| address_verified | BOOLEAN DEFAULT FALSE | Dirección verificada |
| verification_level | INTEGER DEFAULT 0 | Nivel de verificación |
| last_verification_at | TIMESTAMP | Última verificación |
| verified_by | INTEGER REFERENCES operators(id) | Verificado por |

---

## 52. DEPÓSITOS Y RETIROS DE USUARIOS (VISTA OPERADOR)

### `user_financial_summary`
Resumen financiero de usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) UNIQUE | Usuario |
| total_deposits | DECIMAL(18,8) DEFAULT 0 | Total depósitos |
| total_withdrawals | DECIMAL(18,8) DEFAULT 0 | Total retiros |
| pending_deposits | DECIMAL(18,8) DEFAULT 0 | Depósitos pendientes |
| pending_withdrawals | DECIMAL(18,8) DEFAULT 0 | Retiros pendientes |
| net_deposits | DECIMAL(18,8) DEFAULT 0 | Depósitos netos |
| first_deposit_at | TIMESTAMP | Primer depósito |
| last_deposit_at | TIMESTAMP | Último depósito |
| first_withdrawal_at | TIMESTAMP | Primer retiro |
| last_withdrawal_at | TIMESTAMP | Último retiro |
| updated_at | TIMESTAMP | Última actualización |

---

## 53. ÚLTIMO LOGIN DE USUARIOS

### `user_login_tracking`
Seguimiento de login de usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| login_at | TIMESTAMP | Fecha de login |
| logout_at | TIMESTAMP | Fecha de logout |
| session_duration | INTEGER | Duración en minutos |
| ip_address | VARCHAR(45) | IP |
| device | VARCHAR(200) | Dispositivo |
| location | VARCHAR(100) | Ubicación |
| pages_visited | INTEGER DEFAULT 0 | Páginas visitadas |
| trades_made | INTEGER DEFAULT 0 | Operaciones realizadas |

---

## 54. FECHA DE REGISTRO DE USUARIOS

### `user_registration_stats`
Estadísticas de registro de usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| date | DATE | Fecha |
| new_registrations | INTEGER DEFAULT 0 | Nuevos registros |
| verified_users | INTEGER DEFAULT 0 | Usuarios verificados |
| first_deposits | INTEGER DEFAULT 0 | Primeros depósitos |
| by_country | JSONB | Por país |
| by_referral | INTEGER DEFAULT 0 | Por referido |
| by_organic | INTEGER DEFAULT 0 | Orgánicos |

---

## 55. TOASTS Y NOTIFICACIONES DEL SISTEMA

### `system_toasts`
Toasts del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| message | VARCHAR(500) | Mensaje |
| type | ENUM('success','error','warning','info') | Tipo |
| action | VARCHAR(100) | Acción relacionada |
| target | VARCHAR(100) | Objetivo |
| details | TEXT | Detalles |
| shown_at | TIMESTAMP | Fecha de muestra |

---

## 56. SIDEBAR Y NAVEGACIÓN

### `operator_navigation_history`
Historial de navegación del operador.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| view | VARCHAR(50) | Vista |
| previous_view | VARCHAR(50) | Vista anterior |
| time_spent | INTEGER | Tiempo en segundos |
| navigated_at | TIMESTAMP | Fecha de navegación |

### `operator_favorite_views`
Vistas favoritas del operador.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| view | VARCHAR(50) | Vista |
| position | INTEGER | Posición |
| created_at | TIMESTAMP | Fecha de creación |

---

## 57. ADJUNTOS EN CHAT

### `chat_file_uploads`
Archivos subidos en chat.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| message_id | INTEGER REFERENCES team_chat_messages(id) | Mensaje |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| file_type | ENUM('image','document','video','audio','other') | Tipo |
| file_name | VARCHAR(255) | Nombre |
| file_url | VARCHAR(500) | URL |
| file_size | INTEGER | Tamaño en bytes |
| mime_type | VARCHAR(100) | Tipo MIME |
| thumbnail_url | VARCHAR(500) | URL de miniatura |
| uploaded_at | TIMESTAMP | Fecha de subida |

---

## 58. INDICADOR DE TYPING EN CHAT

### `chat_typing_status`
Estado de escritura en chat.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| room_id | INTEGER REFERENCES team_chat_rooms(id) | Sala |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| is_typing | BOOLEAN DEFAULT FALSE | Escribiendo |
| started_at | TIMESTAMP | Inicio |
| updated_at | TIMESTAMP | Última actualización |

---

## 59. PERÍODO DE GRÁFICOS

### `chart_period_preferences`
Preferencias de período de gráficos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) UNIQUE | Operador |
| default_period | ENUM('day','week','month','year') | Período por defecto |
| operations_chart_period | ENUM('day','week','month') | Período gráfico operaciones |
| volume_chart_period | ENUM('day','week','month') | Período gráfico volumen |
| updated_at | TIMESTAMP | Última actualización |

---

## 60. INTERVALO DE AUTO-REFRESH

### `auto_refresh_config`
Configuración de auto-refresh.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) UNIQUE | Operador |
| is_enabled | BOOLEAN DEFAULT TRUE | Habilitado |
| interval_seconds | INTEGER DEFAULT 5 | Intervalo en segundos |
| refresh_operations | BOOLEAN DEFAULT TRUE | Refrescar operaciones |
| refresh_alerts | BOOLEAN DEFAULT TRUE | Refrescar alertas |
| refresh_users | BOOLEAN DEFAULT FALSE | Refrescar usuarios |
| refresh_stats | BOOLEAN DEFAULT TRUE | Refrescar estadísticas |
| updated_at | TIMESTAMP | Última actualización |

---

## ÍNDICES ADICIONALES (SECCIONES 41-60)

```sql
-- Tournament Rules
CREATE INDEX idx_tournament_rules_history_tournament_id ON tournament_rules_history(tournament_id);

-- Tournament Entry
CREATE INDEX idx_tournament_entry_payments_tournament_id ON tournament_entry_payments(tournament_id);
CREATE INDEX idx_tournament_entry_payments_user_id ON tournament_entry_payments(user_id);

-- Participant Details
CREATE INDEX idx_tournament_participant_details_tournament_id ON tournament_participant_details(tournament_id);
CREATE INDEX idx_tournament_participant_details_user_id ON tournament_participant_details(user_id);
CREATE INDEX idx_tournament_participant_trades_tournament_id ON tournament_participant_trades(tournament_id);

-- Tournament Dates
CREATE INDEX idx_tournament_dates_tournament_id ON tournament_dates(tournament_id);
CREATE INDEX idx_tournament_date_changes_tournament_id ON tournament_date_changes(tournament_id);

-- Waitlist
CREATE INDEX idx_tournament_waitlist_tournament_id ON tournament_waitlist(tournament_id);
CREATE INDEX idx_tournament_waitlist_user_id ON tournament_waitlist(user_id);

-- Operation Stats
CREATE INDEX idx_operation_type_stats_date ON operation_type_stats(date);
CREATE INDEX idx_operation_type_stats_symbol ON operation_type_stats(symbol);
CREATE INDEX idx_operation_duration_stats_date ON operation_duration_stats(date);

-- Flag Details
CREATE INDEX idx_operation_flag_details_trade_id ON operation_flag_details(trade_id);
CREATE INDEX idx_operation_flag_details_flagged_by ON operation_flag_details(flagged_by);

-- User Stats
CREATE INDEX idx_user_country_stats_country_code ON user_country_stats(country_code);
CREATE INDEX idx_user_financial_summary_user_id ON user_financial_summary(user_id);
CREATE INDEX idx_user_login_tracking_user_id ON user_login_tracking(user_id);
CREATE INDEX idx_user_registration_stats_date ON user_registration_stats(date);

-- Navigation
CREATE INDEX idx_operator_navigation_history_operator_id ON operator_navigation_history(operator_id);

-- Chat
CREATE INDEX idx_chat_file_uploads_message_id ON chat_file_uploads(message_id);
CREATE INDEX idx_chat_typing_status_room_id ON chat_typing_status(room_id);
```

---

## RESUMEN FINAL ACTUALIZADO

| Sección | Tablas | Descripción |
|---------|--------|-------------|
| 1-40 | 103 | Secciones anteriores |
| 41. Reglas Torneos | 2 | tournament_rules_templates, tournament_rules_history |
| 42. Balance Inicial | 1 | tournament_initial_balance_config |
| 43. Cuota Entrada | 2 | tournament_entry_fee_config, tournament_entry_payments |
| 44. Participantes Detallado | 2 | tournament_participant_details, tournament_participant_trades |
| 45. Fechas Torneos | 2 | tournament_dates, tournament_date_changes |
| 46. Capacidad Torneos | 2 | tournament_capacity_config, tournament_waitlist |
| 47. Tipos Operación | 1 | operation_type_stats |
| 48. Duración Operaciones | 2 | operation_duration_config, operation_duration_stats |
| 49. Razones Flag | 2 | flag_reasons, operation_flag_details |
| 50. Países Usuarios | 1 | user_country_stats |
| 51. Verificación Usuarios | 1 | user_verification_status |
| 52. Finanzas Usuarios | 1 | user_financial_summary |
| 53. Login Tracking | 1 | user_login_tracking |
| 54. Registro Stats | 1 | user_registration_stats |
| 55. Toasts Sistema | 1 | system_toasts |
| 56. Navegación | 2 | operator_navigation_history, operator_favorite_views |
| 57. Adjuntos Chat | 1 | chat_file_uploads |
| 58. Typing Chat | 1 | chat_typing_status |
| 59. Período Gráficos | 1 | chart_period_preferences |
| 60. Auto-Refresh | 1 | auto_refresh_config |

**Total: 128 tablas**


---

## 61. AVATAR Y PERFIL DEL OPERADOR

### `operator_avatars`
Avatares del operador.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| file_url | VARCHAR(500) | URL del archivo |
| file_name | VARCHAR(255) | Nombre del archivo |
| file_size | INTEGER | Tamaño en bytes |
| is_current | BOOLEAN DEFAULT FALSE | Avatar actual |
| uploaded_at | TIMESTAMP | Fecha de subida |

### `operator_profile_changes`
Historial de cambios de perfil.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| field_changed | VARCHAR(50) | Campo cambiado |
| old_value | TEXT | Valor anterior |
| new_value | TEXT | Nuevo valor |
| changed_at | TIMESTAMP | Fecha del cambio |

---

## 62. TELÉFONO DEL OPERADOR

### `operator_phone_numbers`
Números de teléfono del operador.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| phone_number | VARCHAR(20) | Número |
| country_code | VARCHAR(5) | Código de país |
| type | ENUM('mobile','office','home') | Tipo |
| is_primary | BOOLEAN DEFAULT FALSE | Principal |
| is_verified | BOOLEAN DEFAULT FALSE | Verificado |
| verified_at | TIMESTAMP | Fecha de verificación |
| created_at | TIMESTAMP | Fecha de creación |

---

## 63. BALANCE DEMO DE USUARIOS

### `user_demo_balance_tracking`
Seguimiento de balance demo de usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| demo_balance | DECIMAL(18,8) | Balance demo actual |
| initial_demo_balance | DECIMAL(18,8) | Balance demo inicial |
| resets_count | INTEGER DEFAULT 0 | Número de resets |
| last_reset_at | TIMESTAMP | Último reset |
| total_demo_profit | DECIMAL(18,8) DEFAULT 0 | Profit total demo |
| total_demo_loss | DECIMAL(18,8) DEFAULT 0 | Pérdida total demo |
| updated_at | TIMESTAMP | Última actualización |

---

## 64. WIN RATE DE USUARIOS

### `user_win_rate_history`
Historial de win rate de usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| date | DATE | Fecha |
| win_rate | DECIMAL(5,2) | Win rate del día |
| total_trades | INTEGER | Total operaciones |
| wins | INTEGER | Victorias |
| losses | INTEGER | Pérdidas |
| calculated_at | TIMESTAMP | Fecha de cálculo |

---

## 65. NIVEL DE RIESGO DE USUARIOS

### `user_risk_level_history`
Historial de nivel de riesgo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| previous_level | ENUM('low','medium','high','critical') | Nivel anterior |
| new_level | ENUM('low','medium','high','critical') | Nuevo nivel |
| reason | TEXT | Razón del cambio |
| factors | JSONB | Factores considerados |
| changed_by | INTEGER REFERENCES operators(id) | Cambiado por |
| auto_changed | BOOLEAN DEFAULT FALSE | Cambio automático |
| changed_at | TIMESTAMP | Fecha del cambio |

### `risk_level_criteria`
Criterios de nivel de riesgo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| level | ENUM('low','medium','high','critical') | Nivel |
| criteria_name | VARCHAR(100) | Nombre del criterio |
| criteria_type | VARCHAR(50) | Tipo de criterio |
| threshold_value | DECIMAL(18,8) | Valor umbral |
| comparison | ENUM('gt','gte','lt','lte','eq') | Comparación |
| weight | DECIMAL(5,2) | Peso en cálculo |
| is_active | BOOLEAN DEFAULT TRUE | Activo |

---

## 66. OD-ID DE USUARIOS

### `user_od_ids`
Identificadores OD de usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) UNIQUE | Usuario |
| od_id | VARCHAR(20) UNIQUE | ID OD (OD-XXXXXX) |
| generated_at | TIMESTAMP | Fecha de generación |

---

## 67. PAYOUT DE OPERACIONES

### `operation_payout_config`
Configuración de payout por operación.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| trading_pair_id | INTEGER REFERENCES trading_pairs(id) | Par |
| duration_seconds | INTEGER | Duración |
| base_payout | DECIMAL(5,2) | Payout base % |
| volatility_adjustment | DECIMAL(5,2) | Ajuste por volatilidad |
| time_adjustment | DECIMAL(5,2) | Ajuste por hora |
| final_payout | DECIMAL(5,2) | Payout final % |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| configured_by | INTEGER REFERENCES operators(id) | Configurado por |
| created_at | TIMESTAMP | Fecha de configuración |

### `payout_history`
Historial de cambios de payout.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| trading_pair_id | INTEGER REFERENCES trading_pairs(id) | Par |
| previous_payout | DECIMAL(5,2) | Payout anterior |
| new_payout | DECIMAL(5,2) | Nuevo payout |
| reason | TEXT | Razón del cambio |
| changed_by | INTEGER REFERENCES operators(id) | Cambiado por |
| changed_at | TIMESTAMP | Fecha del cambio |

---

## 68. HORA DE APERTURA Y CIERRE DE OPERACIONES

### `operation_times`
Tiempos de operaciones.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| trade_id | INTEGER REFERENCES trades(id) | Operación |
| open_time | TIMESTAMP | Hora de apertura |
| scheduled_close_time | TIMESTAMP | Hora de cierre programada |
| actual_close_time | TIMESTAMP | Hora de cierre real |
| duration_seconds | INTEGER | Duración en segundos |
| early_close | BOOLEAN DEFAULT FALSE | Cierre anticipado |
| early_close_reason | VARCHAR(100) | Razón de cierre anticipado |

---

## 69. PROFIT Y LOSS DE OPERACIONES

### `operation_pnl_details`
Detalles de P&L de operaciones.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| trade_id | INTEGER REFERENCES trades(id) | Operación |
| invested_amount | DECIMAL(18,8) | Monto invertido |
| payout_percentage | DECIMAL(5,2) | Porcentaje de payout |
| potential_profit | DECIMAL(18,8) | Profit potencial |
| actual_profit | DECIMAL(18,8) | Profit real |
| actual_loss | DECIMAL(18,8) | Pérdida real |
| net_result | DECIMAL(18,8) | Resultado neto |
| balance_before | DECIMAL(18,8) | Balance antes |
| balance_after | DECIMAL(18,8) | Balance después |

---

## 70. CATEGORÍAS DE ACTIVOS

### `asset_categories`
Categorías de activos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(50) UNIQUE | Nombre (forex, crypto, stocks, commodities) |
| display_name | VARCHAR(100) | Nombre para mostrar |
| description | TEXT | Descripción |
| icon | VARCHAR(50) | Icono |
| color | VARCHAR(20) | Color |
| is_active | BOOLEAN DEFAULT TRUE | Activa |
| position | INTEGER | Orden |

### `asset_category_stats`
Estadísticas por categoría de activo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| category_id | INTEGER REFERENCES asset_categories(id) | Categoría |
| date | DATE | Fecha |
| total_trades | INTEGER DEFAULT 0 | Total operaciones |
| total_volume | DECIMAL(18,8) DEFAULT 0 | Volumen total |
| wins | INTEGER DEFAULT 0 | Victorias |
| losses | INTEGER DEFAULT 0 | Pérdidas |
| unique_users | INTEGER DEFAULT 0 | Usuarios únicos |

---

## 71. NOMBRE Y SÍMBOLO DE ACTIVOS

### `asset_details`
Detalles de activos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| trading_pair_id | INTEGER REFERENCES trading_pairs(id) UNIQUE | Par |
| symbol | VARCHAR(20) | Símbolo (EUR/USD) |
| name | VARCHAR(100) | Nombre completo |
| base_currency | VARCHAR(10) | Moneda base |
| quote_currency | VARCHAR(10) | Moneda cotización |
| description | TEXT | Descripción |
| icon_url | VARCHAR(500) | URL del icono |
| decimal_places | INTEGER DEFAULT 5 | Decimales |
| pip_value | DECIMAL(18,8) | Valor del pip |

---

## 72. HABILITACIÓN DE ACTIVOS

### `asset_enable_disable_history`
Historial de habilitación/deshabilitación.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| trading_pair_id | INTEGER REFERENCES trading_pairs(id) | Par |
| previous_status | BOOLEAN | Estado anterior |
| new_status | BOOLEAN | Nuevo estado |
| reason | TEXT | Razón |
| changed_by | INTEGER REFERENCES operators(id) | Cambiado por |
| changed_at | TIMESTAMP | Fecha del cambio |
| auto_changed | BOOLEAN DEFAULT FALSE | Cambio automático |

---

## 73. VOLATILIDAD DE ACTIVOS

### `asset_volatility_history`
Historial de volatilidad.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| trading_pair_id | INTEGER REFERENCES trading_pairs(id) | Par |
| timestamp | TIMESTAMP | Marca de tiempo |
| volatility_level | ENUM('low','medium','high','extreme') | Nivel |
| volatility_value | DECIMAL(10,4) | Valor numérico |
| price_change_percent | DECIMAL(10,4) | Cambio de precio % |
| volume | DECIMAL(18,8) | Volumen |

---

## 74. SEVERIDAD DE ALERTAS

### `alert_severity_config`
Configuración de severidad de alertas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| severity | ENUM('low','medium','high','critical') | Severidad |
| display_name | VARCHAR(50) | Nombre para mostrar |
| color | VARCHAR(20) | Color |
| icon | VARCHAR(50) | Icono |
| auto_escalate_after | INTEGER | Escalar después de (min) |
| requires_immediate_action | BOOLEAN DEFAULT FALSE | Requiere acción inmediata |
| notification_channels | JSONB | Canales de notificación |

---

## 75. TIPOS DE ALERTAS

### `alert_types_config`
Configuración de tipos de alertas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| type | VARCHAR(50) UNIQUE | Tipo (suspicious, high_volume, win_streak, pattern, system) |
| display_name | VARCHAR(100) | Nombre para mostrar |
| description | TEXT | Descripción |
| default_severity | ENUM('low','medium','high','critical') | Severidad por defecto |
| auto_detect | BOOLEAN DEFAULT TRUE | Detección automática |
| detection_rules | JSONB | Reglas de detección |
| is_active | BOOLEAN DEFAULT TRUE | Activo |

---

## 76. LECTURA DE ALERTAS

### `alert_read_status`
Estado de lectura de alertas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| alert_id | INTEGER REFERENCES operator_alerts(id) | Alerta |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| read_at | TIMESTAMP | Fecha de lectura |
| time_to_read | INTEGER | Tiempo hasta lectura (seg) |

---

## 77. RESOLUCIÓN DE ALERTAS

### `alert_resolutions`
Resoluciones de alertas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| alert_id | INTEGER REFERENCES operator_alerts(id) | Alerta |
| resolved_by | INTEGER REFERENCES operators(id) | Resuelto por |
| resolution_type | ENUM('dismissed','actioned','escalated','auto_resolved') | Tipo |
| resolution_notes | TEXT | Notas |
| actions_taken | JSONB | Acciones tomadas |
| time_to_resolve | INTEGER | Tiempo hasta resolución (seg) |
| resolved_at | TIMESTAMP | Fecha de resolución |

---

## 78. ROLES EN CHAT (OPERATOR/ADMIN/SUPPORT)

### `chat_user_roles`
Roles de usuarios en chat.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| role | ENUM('operator','admin','support','system') | Rol |
| display_name | VARCHAR(100) | Nombre para mostrar |
| can_send_messages | BOOLEAN DEFAULT TRUE | Puede enviar mensajes |
| can_delete_messages | BOOLEAN DEFAULT FALSE | Puede eliminar mensajes |
| can_pin_messages | BOOLEAN DEFAULT FALSE | Puede fijar mensajes |
| can_create_rooms | BOOLEAN DEFAULT FALSE | Puede crear salas |

---

## 79. REACCIONES EN CHAT

### `chat_reaction_types`
Tipos de reacciones disponibles.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| emoji | VARCHAR(10) | Emoji |
| name | VARCHAR(50) | Nombre |
| shortcode | VARCHAR(50) | Código corto |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| position | INTEGER | Orden |

---

## 80. MENSAJES NO LEÍDOS

### `unread_message_counts`
Conteo de mensajes no leídos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| room_id | INTEGER REFERENCES team_chat_rooms(id) | Sala |
| unread_count | INTEGER DEFAULT 0 | Mensajes no leídos |
| last_read_at | TIMESTAMP | Última lectura |
| updated_at | TIMESTAMP | Última actualización |

---

## 81. BADGES EN MENÚ

### `menu_badges`
Badges del menú lateral.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| menu_item | VARCHAR(50) | Item del menú |
| badge_count | INTEGER DEFAULT 0 | Conteo del badge |
| badge_type | ENUM('count','dot','none') | Tipo de badge |
| updated_at | TIMESTAMP | Última actualización |

---

## 82. ESTADÍSTICAS DEL DASHBOARD

### `dashboard_stats_cache`
Cache de estadísticas del dashboard.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| stat_key | VARCHAR(50) | Clave de estadística |
| stat_value | DECIMAL(18,8) | Valor |
| stat_label | VARCHAR(100) | Etiqueta |
| stat_icon | VARCHAR(50) | Icono |
| stat_color | VARCHAR(20) | Color |
| change_percent | DECIMAL(10,4) | Cambio porcentual |
| change_direction | ENUM('up','down','neutral') | Dirección del cambio |
| calculated_at | TIMESTAMP | Fecha de cálculo |
| expires_at | TIMESTAMP | Fecha de expiración |

---

## 83. ACCIONES RÁPIDAS DEL DASHBOARD

### `quick_action_logs`
Logs de acciones rápidas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| action_type | VARCHAR(50) | Tipo de acción |
| action_target | VARCHAR(100) | Objetivo |
| action_data | JSONB | Datos de la acción |
| executed_at | TIMESTAMP | Fecha de ejecución |
| result | ENUM('success','failed','cancelled') | Resultado |

---

## 84. GRÁFICO DE OPERACIONES (WINS/LOSSES)

### `operations_chart_cache`
Cache de datos del gráfico de operaciones.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| period | ENUM('day','week','month') | Período |
| label | VARCHAR(20) | Etiqueta (Lun, Mar, etc.) |
| position | INTEGER | Posición en el gráfico |
| wins | INTEGER DEFAULT 0 | Victorias |
| losses | INTEGER DEFAULT 0 | Pérdidas |
| calculated_at | TIMESTAMP | Fecha de cálculo |

---

## 85. GRÁFICO DE VOLUMEN POR ACTIVO (DOUGHNUT)

### `volume_chart_cache`
Cache de datos del gráfico de volumen.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| symbol | VARCHAR(20) | Par |
| volume_percentage | DECIMAL(5,2) | Porcentaje del volumen |
| volume_amount | DECIMAL(18,8) | Monto del volumen |
| color | VARCHAR(20) | Color en el gráfico |
| position | INTEGER | Posición |
| calculated_at | TIMESTAMP | Fecha de cálculo |

---

## 86. FEED EN VIVO DE OPERACIONES

### `live_feed_config`
Configuración del feed en vivo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) UNIQUE | Operador |
| max_items | INTEGER DEFAULT 50 | Máximo de items |
| show_flagged_highlight | BOOLEAN DEFAULT TRUE | Resaltar marcadas |
| show_user_details | BOOLEAN DEFAULT TRUE | Mostrar detalles de usuario |
| show_profit_loss | BOOLEAN DEFAULT TRUE | Mostrar P&L |
| auto_scroll | BOOLEAN DEFAULT TRUE | Auto-scroll |
| sound_on_new | BOOLEAN DEFAULT FALSE | Sonido en nueva operación |

---

## 87. RESUMEN DE REPORTES

### `report_summary_stats`
Estadísticas de resumen de reportes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| report_type | VARCHAR(50) | Tipo de reporte |
| period_start | DATE | Inicio del período |
| period_end | DATE | Fin del período |
| total_tournaments | INTEGER DEFAULT 0 | Total torneos |
| active_tournaments | INTEGER DEFAULT 0 | Torneos activos |
| total_prize_pool | DECIMAL(18,8) DEFAULT 0 | Premio total |
| total_participants | INTEGER DEFAULT 0 | Total participantes |
| total_users | INTEGER DEFAULT 0 | Total usuarios |
| active_users | INTEGER DEFAULT 0 | Usuarios activos |
| total_operations | INTEGER DEFAULT 0 | Total operaciones |
| total_volume | DECIMAL(18,8) DEFAULT 0 | Volumen total |
| calculated_at | TIMESTAMP | Fecha de cálculo |

---

## 88. LOGS DEL OPERADOR (ACTIVITY LOG)

### `operator_action_log_details`
Detalles de logs de acciones.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| log_id | INTEGER REFERENCES operator_activity_logs(id) | Log |
| action | VARCHAR(100) | Acción |
| target | VARCHAR(100) | Objetivo |
| details | TEXT | Detalles |
| timestamp | TIMESTAMP | Marca de tiempo |
| formatted_time | VARCHAR(20) | Hora formateada |

---

## 89. TABS DE CONFIGURACIÓN

### `settings_tab_preferences`
Preferencias de tabs de configuración.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) UNIQUE | Operador |
| default_tab | ENUM('profile','security','notifications','appearance','advanced') | Tab por defecto |
| last_visited_tab | VARCHAR(50) | Último tab visitado |
| collapsed_sections | JSONB | Secciones colapsadas |
| updated_at | TIMESTAMP | Última actualización |

---

## 90. TABS DE FORMULARIO DE TORNEO

### `tournament_form_preferences`
Preferencias del formulario de torneo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) UNIQUE | Operador |
| default_tab | ENUM('basic','details','rewards') | Tab por defecto |
| remember_last_values | BOOLEAN DEFAULT FALSE | Recordar últimos valores |
| default_category | VARCHAR(20) | Categoría por defecto |
| default_status | VARCHAR(20) | Estado por defecto |
| updated_at | TIMESTAMP | Última actualización |

---

## 91. MODAL DE CAMBIO DE CONTRASEÑA

### `password_change_attempts`
Intentos de cambio de contraseña.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| status | ENUM('success','failed_current','failed_mismatch','failed_weak') | Estado |
| ip_address | VARCHAR(45) | IP |
| user_agent | TEXT | User agent |
| attempted_at | TIMESTAMP | Fecha del intento |

---

## 92. FILTROS DE OPERACIONES POR ACTIVO

### `operation_asset_filter_preferences`
Preferencias de filtro por activo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) UNIQUE | Operador |
| default_filter | VARCHAR(20) DEFAULT 'all' | Filtro por defecto |
| favorite_assets | JSONB | Activos favoritos |
| hidden_assets | JSONB | Activos ocultos |
| updated_at | TIMESTAMP | Última actualización |

---

## 93. RANGO DE FECHAS DE OPERACIONES

### `operation_date_range_preferences`
Preferencias de rango de fechas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) UNIQUE | Operador |
| default_range | ENUM('today','yesterday','week','month','custom') | Rango por defecto |
| custom_start | DATE | Inicio personalizado |
| custom_end | DATE | Fin personalizado |
| updated_at | TIMESTAMP | Última actualización |

---

## 94. CONFIGURACIÓN DE BLOQUEO POR INTENTOS FALLIDOS

### `failed_login_lock_config`
Configuración de bloqueo por intentos fallidos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| max_failed_attempts | INTEGER DEFAULT 5 | Máximo intentos |
| lock_duration_minutes | INTEGER DEFAULT 30 | Duración del bloqueo |
| reset_after_minutes | INTEGER DEFAULT 60 | Reset después de |
| notify_on_lock | BOOLEAN DEFAULT TRUE | Notificar al bloquear |
| notify_admin | BOOLEAN DEFAULT TRUE | Notificar al admin |
| is_active | BOOLEAN DEFAULT TRUE | Activo |

### `operator_login_locks`
Bloqueos de login de operadores.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| failed_attempts | INTEGER DEFAULT 0 | Intentos fallidos |
| locked_at | TIMESTAMP | Fecha de bloqueo |
| locked_until | TIMESTAMP | Bloqueado hasta |
| unlock_reason | VARCHAR(100) | Razón de desbloqueo |
| unlocked_by | INTEGER REFERENCES operators(id) | Desbloqueado por |
| unlocked_at | TIMESTAMP | Fecha de desbloqueo |

---

## 95. EXPORTACIÓN DE CONFIGURACIÓN

### `settings_exports`
Exportaciones de configuración.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| export_type | ENUM('full','settings_only','profile_only') | Tipo |
| file_url | VARCHAR(500) | URL del archivo |
| file_name | VARCHAR(255) | Nombre del archivo |
| file_size | INTEGER | Tamaño en bytes |
| exported_at | TIMESTAMP | Fecha de exportación |
| expires_at | TIMESTAMP | Fecha de expiración |

### `settings_imports`
Importaciones de configuración.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| file_name | VARCHAR(255) | Nombre del archivo |
| status | ENUM('pending','success','failed','partial') | Estado |
| imported_settings | JSONB | Configuraciones importadas |
| errors | JSONB | Errores |
| imported_at | TIMESTAMP | Fecha de importación |

---

## 96. RESET DE CONFIGURACIÓN

### `settings_reset_history`
Historial de resets de configuración.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| reset_type | ENUM('full','partial') | Tipo de reset |
| previous_settings | JSONB | Configuración anterior |
| reset_at | TIMESTAMP | Fecha de reset |
| reason | TEXT | Razón |

---

## 97. INFORMACIÓN DEL SISTEMA

### `system_version_info`
Información de versión del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| version | VARCHAR(20) | Versión |
| release_date | DATE | Fecha de lanzamiento |
| release_notes | TEXT | Notas de la versión |
| is_current | BOOLEAN DEFAULT FALSE | Versión actual |
| created_at | TIMESTAMP | Fecha de creación |

### `system_update_history`
Historial de actualizaciones del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| from_version | VARCHAR(20) | Versión anterior |
| to_version | VARCHAR(20) | Nueva versión |
| updated_at | TIMESTAMP | Fecha de actualización |
| updated_by | INTEGER REFERENCES operators(id) | Actualizado por |
| status | ENUM('success','failed','rolled_back') | Estado |
| notes | TEXT | Notas |

---

## 98. LATENCIA DEL SERVIDOR

### `server_latency_logs`
Logs de latencia del servidor.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| server_name | VARCHAR(50) | Nombre del servidor |
| latency_ms | INTEGER | Latencia en ms |
| status | ENUM('good','warning','critical') | Estado |
| measured_at | TIMESTAMP | Fecha de medición |

---

## 99. CONEXIÓN DEL SERVIDOR

### `server_connection_status`
Estado de conexión del servidor.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| server_name | VARCHAR(50) | Nombre del servidor |
| is_connected | BOOLEAN DEFAULT TRUE | Conectado |
| connection_quality | ENUM('excellent','good','fair','poor') | Calidad |
| last_ping_at | TIMESTAMP | Último ping |
| disconnected_at | TIMESTAMP | Fecha de desconexión |
| reconnected_at | TIMESTAMP | Fecha de reconexión |

---

## 100. NOMBRE DEL SERVIDOR

### `server_registry`
Registro de servidores.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| server_name | VARCHAR(50) UNIQUE | Nombre (prod-mx-01) |
| display_name | VARCHAR(100) | Nombre para mostrar |
| region | VARCHAR(50) | Región |
| ip_address | VARCHAR(45) | IP |
| port | INTEGER | Puerto |
| type | ENUM('primary','secondary','backup') | Tipo |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| created_at | TIMESTAMP | Fecha de creación |

---

## ÍNDICES ADICIONALES (SECCIONES 61-100)

```sql
-- Operator Profile
CREATE INDEX idx_operator_avatars_operator_id ON operator_avatars(operator_id);
CREATE INDEX idx_operator_profile_changes_operator_id ON operator_profile_changes(operator_id);
CREATE INDEX idx_operator_phone_numbers_operator_id ON operator_phone_numbers(operator_id);

-- User Tracking
CREATE INDEX idx_user_demo_balance_tracking_user_id ON user_demo_balance_tracking(user_id);
CREATE INDEX idx_user_win_rate_history_user_id ON user_win_rate_history(user_id);
CREATE INDEX idx_user_risk_level_history_user_id ON user_risk_level_history(user_id);
CREATE INDEX idx_user_od_ids_user_id ON user_od_ids(user_id);
CREATE INDEX idx_user_od_ids_od_id ON user_od_ids(od_id);

-- Operations
CREATE INDEX idx_operation_payout_config_pair_id ON operation_payout_config(trading_pair_id);
CREATE INDEX idx_payout_history_pair_id ON payout_history(trading_pair_id);
CREATE INDEX idx_operation_times_trade_id ON operation_times(trade_id);
CREATE INDEX idx_operation_pnl_details_trade_id ON operation_pnl_details(trade_id);

-- Assets
CREATE INDEX idx_asset_details_pair_id ON asset_details(trading_pair_id);
CREATE INDEX idx_asset_enable_disable_history_pair_id ON asset_enable_disable_history(trading_pair_id);
CREATE INDEX idx_asset_volatility_history_pair_id ON asset_volatility_history(trading_pair_id);
CREATE INDEX idx_asset_category_stats_category_id ON asset_category_stats(category_id);

-- Alerts
CREATE INDEX idx_alert_read_status_alert_id ON alert_read_status(alert_id);
CREATE INDEX idx_alert_read_status_operator_id ON alert_read_status(operator_id);
CREATE INDEX idx_alert_resolutions_alert_id ON alert_resolutions(alert_id);

-- Chat
CREATE INDEX idx_unread_message_counts_operator_id ON unread_message_counts(operator_id);
CREATE INDEX idx_unread_message_counts_room_id ON unread_message_counts(room_id);

-- Dashboard
CREATE INDEX idx_dashboard_stats_cache_stat_key ON dashboard_stats_cache(stat_key);
CREATE INDEX idx_quick_action_logs_operator_id ON quick_action_logs(operator_id);
CREATE INDEX idx_operations_chart_cache_period ON operations_chart_cache(period);
CREATE INDEX idx_volume_chart_cache_symbol ON volume_chart_cache(symbol);

-- Reports
CREATE INDEX idx_report_summary_stats_report_type ON report_summary_stats(report_type);

-- Settings
CREATE INDEX idx_settings_exports_operator_id ON settings_exports(operator_id);
CREATE INDEX idx_settings_imports_operator_id ON settings_imports(operator_id);
CREATE INDEX idx_settings_reset_history_operator_id ON settings_reset_history(operator_id);

-- Server
CREATE INDEX idx_server_latency_logs_server_name ON server_latency_logs(server_name);
CREATE INDEX idx_server_connection_status_operator_id ON server_connection_status(operator_id);

-- Login Locks
CREATE INDEX idx_operator_login_locks_operator_id ON operator_login_locks(operator_id);
CREATE INDEX idx_password_change_attempts_operator_id ON password_change_attempts(operator_id);
```

---

## RESUMEN FINAL COMPLETO

| Sección | Tablas | Descripción |
|---------|--------|-------------|
| 1. Operadores y Autenticación | 4 | operators, operator_sessions, operator_settings, operator_work_schedule |
| 2. Permisos y Roles | 3 | operator_permissions, permissions, operator_roles |
| 3. Gestión de Torneos | 4 | operator_tournament_actions, tournament_operator_assignments, participant_disqualifications, tournament_manual_additions |
| 4. Gestión de Usuarios | 5 | user_notes, user_balance_adjustments, user_status_changes, user_trading_blocks, user_risk_assessments |
| 5. Control de Operaciones | 4 | trade_interventions, trade_flags, trade_cancellations, forced_trade_results |
| 6. Sistema de Alertas | 4 | operator_alerts, alert_thresholds, operator_alert_settings, alert_escalations |
| 7. Configuración de Activos | 3 | asset_configurations, asset_status_changes, payout_adjustments |
| 8. Chat Interno | 6 | team_chat_rooms, team_chat_messages, team_chat_attachments, team_chat_reactions, team_chat_read_status, team_chat_mentions |
| 9. Logs de Actividad | 3 | operator_activity_logs, operator_login_history, operator_action_approvals |
| 10. Monitoreo en Tiempo Real | 4 | live_monitoring_sessions, monitored_users, real_time_statistics, operator_dashboard_widgets |
| 11. Reportes | 3 | operator_reports, scheduled_reports, report_exports |
| 12. Seguridad | 5 | operator_trusted_devices, operator_security_questions, operator_two_factor, operator_security_settings, operator_password_history |
| 13. Notificaciones | 2 | operator_notifications, operator_notification_preferences |
| 14. Tareas y Asignaciones | 3 | operator_tasks, operator_task_comments, shift_handovers |
| 15. Detección de Fraude | 3 | fraud_patterns, fraud_detections, user_behavior_analysis |
| 16. Atajos de Teclado | 2 | operator_keyboard_shortcuts, default_keyboard_shortcuts |
| 17. Auditoría | 2 | sensitive_action_logs, data_access_logs |
| 18. Métricas de Rendimiento | 2 | operator_performance_metrics, operator_daily_stats |
| 19. Gráficos Dashboard | 3 | dashboard_chart_data, volume_by_asset, operator_quick_actions |
| 20. Filtros y Búsquedas | 2 | saved_filters, search_history |
| 21. Sistema e Info | 3 | system_info, server_status, system_announcements |
| 22. Exportación | 2 | export_templates, download_queue |
| 23. Logs Tiempo Real | 2 | real_time_operation_logs, operation_feed_settings |
| 24. Gestión Usuarios Avanzada | 3 | user_verification_overrides, user_level_overrides, user_payout_overrides |
| 25. Comunicación Usuarios | 2 | operator_user_messages, bulk_messages |
| 26. Volatilidad | 2 | asset_volatility_settings, volatility_alerts |
| 27. Contraseña y Recuperación | 2 | operator_password_reset_tokens, password_change_requests |
| 28. Duplicación Torneos | 1 | tournament_duplications |
| 29. Premios Torneos | 2 | tournament_prize_configurations, tournament_prize_distributions |
| 30. Categorías Torneos | 2 | tournament_categories, tournament_featured |
| 31. Pausas Torneos | 1 | tournament_pauses |
| 32. Estadísticas Operaciones | 4 | operations_hourly_stats, operations_daily_stats, operations_weekly_stats, operations_monthly_stats |
| 33. Resumen Torneos | 1 | tournament_summary_stats |
| 34. Usuarios Activos | 2 | active_users_snapshot, user_online_status |
| 35. Alertas Avanzadas | 2 | alert_rules, alert_action_history |
| 36. Win Streaks y Patrones | 2 | user_win_streaks, trading_patterns |
| 37. Resumen Usuarios | 1 | user_summary_cache |
| 38. Historial Acciones Trades | 1 | trade_action_history |
| 39. Horarios Trading | 1 | trading_schedule_overrides |
| 40. Límites Inversión | 1 | investment_limit_overrides |
| 41. Reglas Torneos | 2 | tournament_rules_templates, tournament_rules_history |
| 42. Balance Inicial | 1 | tournament_initial_balance_config |
| 43. Cuota Entrada | 2 | tournament_entry_fee_config, tournament_entry_payments |
| 44. Participantes Detallado | 2 | tournament_participant_details, tournament_participant_trades |
| 45. Fechas Torneos | 2 | tournament_dates, tournament_date_changes |
| 46. Capacidad Torneos | 2 | tournament_capacity_config, tournament_waitlist |
| 47. Tipos Operación | 1 | operation_type_stats |
| 48. Duración Operaciones | 2 | operation_duration_config, operation_duration_stats |
| 49. Razones Flag | 2 | flag_reasons, operation_flag_details |
| 50. Países Usuarios | 1 | user_country_stats |
| 51. Verificación Usuarios | 1 | user_verification_status |
| 52. Finanzas Usuarios | 1 | user_financial_summary |
| 53. Login Tracking | 1 | user_login_tracking |
| 54. Registro Stats | 1 | user_registration_stats |
| 55. Toasts Sistema | 1 | system_toasts |
| 56. Navegación | 2 | operator_navigation_history, operator_favorite_views |
| 57. Adjuntos Chat | 1 | chat_file_uploads |
| 58. Typing Chat | 1 | chat_typing_status |
| 59. Período Gráficos | 1 | chart_period_preferences |
| 60. Auto-Refresh | 1 | auto_refresh_config |
| 61. Avatar y Perfil | 2 | operator_avatars, operator_profile_changes |
| 62. Teléfono Operador | 1 | operator_phone_numbers |
| 63. Balance Demo | 1 | user_demo_balance_tracking |
| 64. Win Rate | 1 | user_win_rate_history |
| 65. Nivel de Riesgo | 2 | user_risk_level_history, risk_level_criteria |
| 66. OD-ID | 1 | user_od_ids |
| 67. Payout Operaciones | 2 | operation_payout_config, payout_history |
| 68. Tiempos Operaciones | 1 | operation_times |
| 69. P&L Operaciones | 1 | operation_pnl_details |
| 70. Categorías Activos | 2 | asset_categories, asset_category_stats |
| 71. Detalles Activos | 1 | asset_details |
| 72. Habilitación Activos | 1 | asset_enable_disable_history |
| 73. Volatilidad Activos | 1 | asset_volatility_history |
| 74. Severidad Alertas | 1 | alert_severity_config |
| 75. Tipos Alertas | 1 | alert_types_config |
| 76. Lectura Alertas | 1 | alert_read_status |
| 77. Resolución Alertas | 1 | alert_resolutions |
| 78. Roles Chat | 1 | chat_user_roles |
| 79. Reacciones Chat | 1 | chat_reaction_types |
| 80. Mensajes No Leídos | 1 | unread_message_counts |
| 81. Badges Menú | 1 | menu_badges |
| 82. Stats Dashboard | 1 | dashboard_stats_cache |
| 83. Acciones Rápidas | 1 | quick_action_logs |
| 84. Gráfico Operaciones | 1 | operations_chart_cache |
| 85. Gráfico Volumen | 1 | volume_chart_cache |
| 86. Feed en Vivo | 1 | live_feed_config |
| 87. Resumen Reportes | 1 | report_summary_stats |
| 88. Logs Operador | 1 | operator_action_log_details |
| 89. Tabs Configuración | 1 | settings_tab_preferences |
| 90. Tabs Formulario Torneo | 1 | tournament_form_preferences |
| 91. Cambio Contraseña | 1 | password_change_attempts |
| 92. Filtros por Activo | 1 | operation_asset_filter_preferences |
| 93. Rango Fechas | 1 | operation_date_range_preferences |
| 94. Bloqueo Login | 2 | failed_login_lock_config, operator_login_locks |
| 95. Export/Import Config | 2 | settings_exports, settings_imports |
| 96. Reset Config | 1 | settings_reset_history |
| 97. Info Sistema | 2 | system_version_info, system_update_history |
| 98. Latencia Servidor | 1 | server_latency_logs |
| 99. Conexión Servidor | 1 | server_connection_status |
| 100. Registro Servidores | 1 | server_registry |

**TOTAL FINAL: 168 tablas**

color | VARCHAR(20) | Color |
| position | INTEGER | Posición |
| calculated_at | TIMESTAMP | Fecha de cálculo |

---

## 86. FEED EN VIVO DE OPERACIONES

### `live_operations_feed`
Feed en vivo de operaciones.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| trade_id | INTEGER REFERENCES trades(id) | Operación |
| user_od_id | VARCHAR(20) | OD-ID del usuario |
| user_name | VARCHAR(100) | Nombre del usuario |
| symbol | VARCHAR(20) | Par |
| direction | ENUM('up','down') | Dirección |
| amount | DECIMAL(18,8) | Monto |
| payout | DECIMAL(5,2) | Payout % |
| result | ENUM('pending','won','lost','cancelled') | Resultado |
| profit | DECIMAL(18,8) | Profit |
| is_flagged | BOOLEAN DEFAULT FALSE | Marcada |
| flag_reason | VARCHAR(200) | Razón del flag |
| open_time | TIMESTAMP | Hora de apertura |
| close_time | TIMESTAMP | Hora de cierre |
| duration_seconds | INTEGER | Duración |
| created_at | TIMESTAMP | Fecha de registro |

---

## 87. CONEXIÓN Y LATENCIA DEL SISTEMA

### `system_connection_status`
Estado de conexión del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| connection_type | ENUM('websocket','api','database','price_feed') | Tipo |
| status | ENUM('connected','disconnected','degraded','reconnecting') | Estado |
| latency_ms | INTEGER | Latencia en ms |
| last_ping | TIMESTAMP | Último ping |
| last_pong | TIMESTAMP | Último pong |
| error_message | TEXT | Mensaje de error |
| reconnect_attempts | INTEGER DEFAULT 0 | Intentos de reconexión |
| updated_at | TIMESTAMP | Última actualización |

### `latency_history`
Historial de latencia.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| connection_type | VARCHAR(50) | Tipo de conexión |
| latency_ms | INTEGER | Latencia en ms |
| recorded_at | TIMESTAMP | Fecha de registro |

---

## 88. VERSIÓN DEL SISTEMA

### `system_versions`
Versiones del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| version | VARCHAR(20) | Versión |
| release_date | DATE | Fecha de lanzamiento |
| changelog | TEXT | Registro de cambios |
| is_current | BOOLEAN DEFAULT FALSE | Versión actual |
| deployed_by | INTEGER REFERENCES operators(id) | Desplegado por |
| deployed_at | TIMESTAMP | Fecha de despliegue |

---

## 89. SERVIDORES Y REGIONES

### `server_regions`
Regiones de servidores.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| region_code | VARCHAR(20) | Código de región |
| region_name | VARCHAR(100) | Nombre de región |
| server_count | INTEGER DEFAULT 0 | Número de servidores |
| is_active | BOOLEAN DEFAULT TRUE | Activa |
| primary_server | VARCHAR(100) | Servidor principal |

---

## 90. COPIAR OD-ID

### `od_id_copy_logs`
Logs de copia de OD-ID.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) | Operador |
| user_od_id | VARCHAR(20) | OD-ID copiado |
| copied_at | TIMESTAMP | Fecha de copia |
| context | VARCHAR(50) | Contexto (users, operations, etc.) |

---

## 91. HISTORIAL DE BALANCE DE USUARIOS

### `user_balance_history`
Historial de balance de usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| balance_type | ENUM('real','demo') | Tipo de balance |
| previous_balance | DECIMAL(18,8) | Balance anterior |
| new_balance | DECIMAL(18,8) | Nuevo balance |
| change_amount | DECIMAL(18,8) | Monto del cambio |
| change_type | ENUM('trade','deposit','withdrawal','adjustment','bonus','refund') | Tipo de cambio |
| reference_id | INTEGER | ID de referencia |
| reference_type | VARCHAR(50) | Tipo de referencia |
| created_at | TIMESTAMP | Fecha del cambio |

---

## 92. OPERACIONES DE USUARIOS (VISTA OPERADOR)

### `user_operations_view`
Vista de operaciones de usuarios para operador.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| user_od_id | VARCHAR(20) | OD-ID |
| total_operations | INTEGER DEFAULT 0 | Total operaciones |
| pending_operations | INTEGER DEFAULT 0 | Operaciones pendientes |
| won_operations | INTEGER DEFAULT 0 | Operaciones ganadas |
| lost_operations | INTEGER DEFAULT 0 | Operaciones perdidas |
| cancelled_operations | INTEGER DEFAULT 0 | Operaciones canceladas |
| flagged_operations | INTEGER DEFAULT 0 | Operaciones marcadas |
| total_volume | DECIMAL(18,8) DEFAULT 0 | Volumen total |
| total_profit | DECIMAL(18,8) DEFAULT 0 | Profit total |
| total_loss | DECIMAL(18,8) DEFAULT 0 | Pérdida total |
| updated_at | TIMESTAMP | Última actualización |

---

## 93. AGREGAR USUARIO A TORNEO

### `tournament_user_additions`
Adiciones de usuarios a torneos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| tournament_id | INTEGER REFERENCES tournaments(id) | Torneo |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| added_by | INTEGER REFERENCES operators(id) | Agregado por |
| entry_fee_waived | BOOLEAN DEFAULT FALSE | Cuota exenta |
| custom_initial_balance | DECIMAL(18,8) | Balance inicial personalizado |
| reason | TEXT | Razón de la adición |
| added_at | TIMESTAMP | Fecha de adición |

---

## 94. BLOQUEO DE TRADING DE USUARIOS

### `user_trading_restrictions`
Restricciones de trading de usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| restriction_type | ENUM('full_block','symbol_block','amount_limit','time_limit') | Tipo |
| blocked_symbols | JSONB | Símbolos bloqueados |
| max_trade_amount | DECIMAL(18,8) | Monto máximo por operación |
| max_daily_volume | DECIMAL(18,8) | Volumen máximo diario |
| allowed_hours_start | TIME | Hora inicio permitida |
| allowed_hours_end | TIME | Hora fin permitida |
| reason | TEXT | Razón |
| created_by | INTEGER REFERENCES operators(id) | Creado por |
| is_active | BOOLEAN DEFAULT TRUE | Activa |
| expires_at | TIMESTAMP | Fecha de expiración |
| created_at | TIMESTAMP | Fecha de creación |

---

## 95. SUSPENSIÓN DE USUARIOS

### `user_suspensions`
Suspensiones de usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| suspended_by | INTEGER REFERENCES operators(id) | Suspendido por |
| reason | TEXT | Razón |
| suspension_type | ENUM('temporary','permanent','pending_review') | Tipo |
| duration_hours | INTEGER | Duración en horas |
| started_at | TIMESTAMP | Inicio de suspensión |
| ends_at | TIMESTAMP | Fin de suspensión |
| lifted_at | TIMESTAMP | Fecha de levantamiento |
| lifted_by | INTEGER REFERENCES operators(id) | Levantado por |
| lift_reason | TEXT | Razón del levantamiento |

---

## 96. ACTIVACIÓN DE USUARIOS

### `user_activations`
Activaciones de usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| activated_by | INTEGER REFERENCES operators(id) | Activado por |
| previous_status | ENUM('suspended','blocked','pending') | Estado anterior |
| reason | TEXT | Razón de activación |
| conditions | TEXT | Condiciones de activación |
| activated_at | TIMESTAMP | Fecha de activación |

---

## 97. DISPOSITIVOS DE USUARIOS

### `user_devices`
Dispositivos de usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| device_id | VARCHAR(200) | ID del dispositivo |
| device_type | ENUM('web','ios','android','desktop') | Tipo |
| device_name | VARCHAR(100) | Nombre |
| browser | VARCHAR(50) | Navegador |
| os | VARCHAR(50) | Sistema operativo |
| is_trusted | BOOLEAN DEFAULT FALSE | De confianza |
| last_used_at | TIMESTAMP | Último uso |
| first_seen_at | TIMESTAMP | Primera vez visto |
| ip_address | VARCHAR(45) | IP |
| location | VARCHAR(100) | Ubicación |

---

## 98. EMAILS DE USUARIOS

### `user_email_history`
Historial de emails de usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| previous_email | VARCHAR(255) | Email anterior |
| new_email | VARCHAR(255) | Nuevo email |
| changed_by | INTEGER REFERENCES operators(id) | Cambiado por |
| reason | TEXT | Razón del cambio |
| verified | BOOLEAN DEFAULT FALSE | Verificado |
| changed_at | TIMESTAMP | Fecha del cambio |

---

## 99. TELÉFONOS DE USUARIOS

### `user_phone_history`
Historial de teléfonos de usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| previous_phone | VARCHAR(20) | Teléfono anterior |
| new_phone | VARCHAR(20) | Nuevo teléfono |
| changed_by | INTEGER REFERENCES operators(id) | Cambiado por |
| reason | TEXT | Razón del cambio |
| verified | BOOLEAN DEFAULT FALSE | Verificado |
| changed_at | TIMESTAMP | Fecha del cambio |

---

## 100. CONFIGURACIÓN DE TEMA Y APARIENCIA

### `operator_appearance_settings`
Configuración de apariencia del operador.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| operator_id | INTEGER REFERENCES operators(id) UNIQUE | Operador |
| theme | ENUM('dark','light','system') DEFAULT 'dark' | Tema |
| accent_color | VARCHAR(20) DEFAULT 'purple' | Color de acento |
| font_size | ENUM('small','medium','large') DEFAULT 'medium' | Tamaño de fuente |
| density | ENUM('compact','normal','comfortable') DEFAULT 'normal' | Densidad |
| sidebar_collapsed | BOOLEAN DEFAULT FALSE | Sidebar colapsado |
| animations_enabled | BOOLEAN DEFAULT TRUE | Animaciones |
| high_contrast | BOOLEAN DEFAULT FALSE | Alto contraste |
| updated_at | TIMESTAMP | Última actualización |

---

## ÍNDICES ADICIONALES (SECCIONES 86-100)

```sql
-- Live Feed
CREATE INDEX idx_live_operations_feed_trade_id ON live_operations_feed(trade_id);
CREATE INDEX idx_live_operations_feed_created_at ON live_operations_feed(created_at);
CREATE INDEX idx_live_operations_feed_is_flagged ON live_operations_feed(is_flagged);

-- System Connection
CREATE INDEX idx_system_connection_status_type ON system_connection_status(connection_type);
CREATE INDEX idx_latency_history_type ON latency_history(connection_type);
CREATE INDEX idx_latency_history_recorded_at ON latency_history(recorded_at);

-- User Balance History
CREATE INDEX idx_user_balance_history_user_id ON user_balance_history(user_id);
CREATE INDEX idx_user_balance_history_created_at ON user_balance_history(created_at);

-- User Operations View
CREATE INDEX idx_user_operations_view_user_id ON user_operations_view(user_id);

-- Tournament Additions
CREATE INDEX idx_tournament_user_additions_tournament_id ON tournament_user_additions(tournament_id);
CREATE INDEX idx_tournament_user_additions_user_id ON tournament_user_additions(user_id);

-- Trading Restrictions
CREATE INDEX idx_user_trading_restrictions_user_id ON user_trading_restrictions(user_id);
CREATE INDEX idx_user_trading_restrictions_is_active ON user_trading_restrictions(is_active);

-- Suspensions
CREATE INDEX idx_user_suspensions_user_id ON user_suspensions(user_id);
CREATE INDEX idx_user_suspensions_ends_at ON user_suspensions(ends_at);

-- Devices
CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX idx_user_devices_device_id ON user_devices(device_id);
```

---

## RESUMEN FINAL COMPLETO

| Sección | Tablas | Descripción |
|---------|--------|-------------|
| 1. Operadores y Autenticación | 4 | operators, operator_sessions, operator_settings, operator_work_schedule |
| 2. Permisos y Roles | 3 | operator_permissions, permissions, operator_roles |
| 3. Gestión de Torneos | 4 | operator_tournament_actions, tournament_operator_assignments, participant_disqualifications, tournament_manual_additions |
| 4. Gestión de Usuarios | 5 | user_notes, user_balance_adjustments, user_status_changes, user_trading_blocks, user_risk_assessments |
| 5. Control de Operaciones | 4 | trade_interventions, trade_flags, trade_cancellations, forced_trade_results |
| 6. Sistema de Alertas | 4 | operator_alerts, alert_thresholds, operator_alert_settings, alert_escalations |
| 7. Configuración de Activos | 3 | asset_configurations, asset_status_changes, payout_adjustments |
| 8. Chat Interno | 6 | team_chat_rooms, team_chat_messages, team_chat_attachments, team_chat_reactions, team_chat_read_status, team_chat_mentions |
| 9. Logs de Actividad | 3 | operator_activity_logs, operator_login_history, operator_action_approvals |
| 10. Monitoreo en Tiempo Real | 4 | live_monitoring_sessions, monitored_users, real_time_statistics, operator_dashboard_widgets |
| 11. Reportes | 3 | operator_reports, scheduled_reports, report_exports |
| 12. Seguridad | 5 | operator_trusted_devices, operator_security_questions, operator_two_factor, operator_security_settings, operator_password_history |
| 13. Notificaciones | 2 | operator_notifications, operator_notification_preferences |
| 14. Tareas y Asignaciones | 3 | operator_tasks, operator_task_comments, shift_handovers |
| 15. Detección de Fraude | 3 | fraud_patterns, fraud_detections, user_behavior_analysis |
| 16. Atajos de Teclado | 2 | operator_keyboard_shortcuts, default_keyboard_shortcuts |
| 17. Auditoría | 2 | sensitive_action_logs, data_access_logs |
| 18. Métricas de Rendimiento | 2 | operator_performance_metrics, operator_daily_stats |
| 19. Gráficos Dashboard | 3 | dashboard_chart_data, volume_by_asset, operator_quick_actions |
| 20. Filtros y Búsquedas | 2 | saved_filters, search_history |
| 21. Sistema e Info | 3 | system_info, server_status, system_announcements |
| 22. Exportación | 2 | export_templates, download_queue |
| 23. Logs Tiempo Real | 2 | real_time_operation_logs, operation_feed_settings |
| 24. Gestión Usuarios Avanzada | 3 | user_verification_overrides, user_level_overrides, user_payout_overrides |
| 25. Comunicación Usuarios | 2 | operator_user_messages, bulk_messages |
| 26. Volatilidad | 2 | asset_volatility_settings, volatility_alerts |
| 27. Contraseña y Recuperación | 2 | operator_password_reset_tokens, password_change_requests |
| 28. Duplicación Torneos | 1 | tournament_duplications |
| 29. Premios Torneos | 2 | tournament_prize_configurations, tournament_prize_distributions |
| 30. Categorías Torneos | 2 | tournament_categories, tournament_featured |
| 31. Pausas Torneos | 1 | tournament_pauses |
| 32. Estadísticas Operaciones | 4 | operations_hourly_stats, operations_daily_stats, operations_weekly_stats, operations_monthly_stats |
| 33. Resumen Torneos | 1 | tournament_summary_stats |
| 34. Usuarios Activos | 2 | active_users_snapshot, user_online_status |
| 35. Alertas Avanzadas | 2 | alert_rules, alert_action_history |
| 36. Win Streaks y Patrones | 2 | user_win_streaks, trading_patterns |
| 37. Resumen Usuarios | 1 | user_summary_cache |
| 38. Historial Acciones Trades | 1 | trade_action_history |
| 39. Horarios Trading | 1 | trading_schedule_overrides |
| 40. Límites Inversión | 1 | investment_limit_overrides |
| 41. Reglas Torneos | 2 | tournament_rules_templates, tournament_rules_history |
| 42. Balance Inicial | 1 | tournament_initial_balance_config |
| 43. Cuota Entrada | 2 | tournament_entry_fee_config, tournament_entry_payments |
| 44. Participantes Detallado | 2 | tournament_participant_details, tournament_participant_trades |
| 45. Fechas Torneos | 2 | tournament_dates, tournament_date_changes |
| 46. Capacidad Torneos | 2 | tournament_capacity_config, tournament_waitlist |
| 47. Tipos Operación | 1 | operation_type_stats |
| 48. Duración Operaciones | 2 | operation_duration_config, operation_duration_stats |
| 49. Razones Flag | 2 | flag_reasons, operation_flag_details |
| 50. Países Usuarios | 1 | user_country_stats |
| 51. Verificación Usuarios | 1 | user_verification_status |
| 52. Finanzas Usuarios | 1 | user_financial_summary |
| 53. Login Tracking | 1 | user_login_tracking |
| 54. Registro Stats | 1 | user_registration_stats |
| 55. Toasts Sistema | 1 | system_toasts |
| 56. Navegación | 2 | operator_navigation_history, operator_favorite_views |
| 57. Adjuntos Chat | 1 | chat_file_uploads |
| 58. Typing Chat | 1 | chat_typing_status |
| 59. Período Gráficos | 1 | chart_period_preferences |
| 60. Auto-Refresh | 1 | auto_refresh_config |
| 61. Avatar Operador | 2 | operator_avatars, operator_profile_changes |
| 62. Teléfono Operador | 1 | operator_phone_numbers |
| 63. Balance Demo | 1 | user_demo_balance_tracking |
| 64. Win Rate | 1 | user_win_rate_history |
| 65. Nivel Riesgo | 2 | user_risk_level_history, risk_level_criteria |
| 66. OD-ID | 1 | user_od_ids |
| 67. Payout Operaciones | 2 | operation_payout_config, payout_history |
| 68. Tiempos Operaciones | 1 | operation_times |
| 69. P&L Operaciones | 1 | operation_pnl_details |
| 70. Categorías Activos | 2 | asset_categories, asset_category_stats |
| 71. Detalles Activos | 1 | asset_details |
| 72. Habilitación Activos | 1 | asset_enable_disable_history |
| 73. Volatilidad Activos | 1 | asset_volatility_history |
| 74. Severidad Alertas | 1 | alert_severity_config |
| 75. Tipos Alertas | 1 | alert_types_config |
| 76. Lectura Alertas | 1 | alert_read_status |
| 77. Resolución Alertas | 1 | alert_resolutions |
| 78. Roles Chat | 1 | chat_user_roles |
| 79. Reacciones Chat | 1 | chat_reaction_types |
| 80. Mensajes No Leídos | 1 | unread_message_counts |
| 81. Badges Menú | 1 | menu_badges |
| 82. Stats Dashboard | 1 | dashboard_stats_cache |
| 83. Acciones Rápidas | 1 | quick_action_logs |
| 84. Gráfico Operaciones | 1 | operations_chart_cache |
| 85. Gráfico Volumen | 1 | volume_chart_cache |
| 86. Feed en Vivo | 1 | live_operations_feed |
| 87. Conexión Sistema | 2 | system_connection_status, latency_history |
| 88. Versión Sistema | 1 | system_versions |
| 89. Servidores | 1 | server_regions |
| 90. Copiar OD-ID | 1 | od_id_copy_logs |
| 91. Historial Balance | 1 | user_balance_history |
| 92. Operaciones Usuario | 1 | user_operations_view |
| 93. Agregar a Torneo | 1 | tournament_user_additions |
| 94. Restricciones Trading | 1 | user_trading_restrictions |
| 95. Suspensiones | 1 | user_suspensions |
| 96. Activaciones | 1 | user_activations |
| 97. Dispositivos Usuario | 1 | user_devices |
| 98. Emails Usuario | 1 | user_email_history |
| 99. Teléfonos Usuario | 1 | user_phone_history |
| 100. Apariencia | 1 | operator_appearance_settings |

**TOTAL FINAL: 143 tablas**

---

## FUNCIONALIDADES CUBIERTAS

### Panel de Operador:
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gráficos de operaciones (wins/losses por día/semana/mes)
- ✅ Gráfico de volumen por activo (doughnut)
- ✅ Gestión completa de torneos (CRUD, pausar, duplicar, destacar)
- ✅ Configuración de premios por posición
- ✅ Gestión de participantes (descalificar, agregar manualmente)
- ✅ Gestión de usuarios (notas, balance, estado, bloqueos, riesgo)
- ✅ Control de operaciones (cancelar, forzar resultado, marcar)
- ✅ Sistema de alertas con umbrales configurables
- ✅ Detección de win streaks y patrones sospechosos
- ✅ Configuración de activos (payout, límites, horarios, volatilidad)
- ✅ Chat interno del equipo con reacciones y menciones
- ✅ Monitoreo en tiempo real de operaciones y usuarios
- ✅ Reportes y exportaciones (CSV, Excel, JSON, PDF)
- ✅ Seguridad (2FA, sesiones, dispositivos, preguntas de seguridad)
- ✅ Configuración de apariencia (tema, fuente, densidad)
- ✅ Configuración de notificaciones y modo no molestar
- ✅ Configuración regional (idioma, zona horaria)
- ✅ Atajos de teclado personalizables
- ✅ Información del sistema y estado del servidor
- ✅ Métricas de rendimiento del operador
- ✅ Traspasos de turno entre operadores
- ✅ Feed en vivo de operaciones
- ✅ Auto-refresh configurable
- ✅ Badges en menú lateral
- ✅ Historial de balance de usuarios
- ✅ Suspensión y activación de usuarios
- ✅ Restricciones de trading por usuario
- ✅ Agregar usuarios a torneos manualmente
- ✅ Copiar OD-ID
- ✅ Ver operaciones de usuario específico
- ✅ Historial de cambios de email/teléfono

### Datos de Usuario Visibles:
- ✅ OD-ID único
- ✅ Nombre y datos de contacto
- ✅ Balance real y demo
- ✅ Total de operaciones y win rate
- ✅ Depósitos y retiros totales
- ✅ Nivel de riesgo
- ✅ Estado de verificación
- ✅ Último login
- ✅ Fecha de registro
- ✅ País
- ✅ Dispositivos utilizados

### Datos de Operación Visibles:
- ✅ ID de operación
- ✅ Usuario (OD-ID y nombre)
- ✅ Activo/Par
- ✅ Tipo (buy/sell)
- ✅ Monto
- ✅ Resultado (pending/won/lost/cancelled)
- ✅ Profit/Loss
- ✅ Payout %
- ✅ Hora de apertura y cierre
- ✅ Duración
- ✅ Estado de flag

### Datos de Torneo Visibles:
- ✅ Nombre y descripción
- ✅ Categoría
- ✅ Premio total
- ✅ Cuota de entrada
- ✅ Participantes actuales/máximos
- ✅ Estado (activo/próximo/finalizado/pausado)
- ✅ Fechas de inicio y fin
- ✅ Balance inicial
- ✅ Reglas
- ✅ Destacado
- ✅ Premios por posición

### Datos de Activo Visibles:
- ✅ Símbolo y nombre
- ✅ Categoría
- ✅ Payout %
- ✅ Inversión mínima/máxima
- ✅ Horarios de trading
- ✅ Volatilidad
- ✅ Estado (habilitado/deshabilitado)

### Datos de Alerta Visibles:
- ✅ Tipo de alerta
- ✅ Severidad
- ✅ Mensaje
- ✅ Usuario relacionado
- ✅ Fecha/hora
- ✅ Estado (leída/resuelta)
- ✅ Asignación
