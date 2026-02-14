# Esquema de Base de Datos - Usuario Soporte

Este documento detalla todas las tablas necesarias para soportar las funcionalidades del usuario soporte en la plataforma de trading.

---

## 1. AGENTES DE SOPORTE Y AUTENTICACIÓN

### `support_agents`
Tabla principal de agentes de soporte.

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
| bio | TEXT | Biografía/descripción |
| department | ENUM('support','vip_support','technical') | Departamento |
| position | VARCHAR(100) | Cargo |
| status | ENUM('available','busy','away','dnd','offline') | Estado actual |
| status_message | VARCHAR(200) | Mensaje de estado |
| languages | JSONB | Idiomas que maneja |
| specializations | JSONB | Especializaciones (retiros, verificación, etc.) |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| created_at | TIMESTAMP | Fecha de registro |
| updated_at | TIMESTAMP | Última actualización |

### `support_agent_sessions`
Sesiones activas del agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| device | VARCHAR(200) | Dispositivo/navegador |
| ip_address | VARCHAR(45) | Dirección IP |
| location | VARCHAR(100) | Ubicación geográfica |
| token | VARCHAR(500) | Token de sesión |
| is_current | BOOLEAN DEFAULT FALSE | Sesión actual |
| last_active_at | TIMESTAMP | Última actividad |
| created_at | TIMESTAMP | Fecha de creación |
| expires_at | TIMESTAMP | Fecha de expiración |

### `support_agent_settings`
Configuraciones del agente de soporte.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) UNIQUE | Agente |
| theme | ENUM('dark','light') DEFAULT 'dark' | Tema |
| language | VARCHAR(5) DEFAULT 'es' | Idioma |
| timezone | VARCHAR(50) | Zona horaria |
| notifications_enabled | BOOLEAN DEFAULT TRUE | Notificaciones activas |
| email_notifications | BOOLEAN DEFAULT TRUE | Notificaciones por email |
| push_notifications | BOOLEAN DEFAULT TRUE | Notificaciones push |
| sound_enabled | BOOLEAN DEFAULT TRUE | Sonidos activos |
| auto_refresh | BOOLEAN DEFAULT TRUE | Auto-refrescar datos |
| auto_assign | BOOLEAN DEFAULT TRUE | Auto-asignación de tickets |
| notification_schedule_start | TIME | Inicio horario notificaciones |
| notification_schedule_end | TIME | Fin horario notificaciones |
| sla_alert_frequency | INTEGER DEFAULT 15 | Frecuencia alertas SLA (min) |
| show_online_status | BOOLEAN DEFAULT TRUE | Mostrar estado en línea |
| share_stats | BOOLEAN DEFAULT TRUE | Compartir estadísticas |
| activity_visible | BOOLEAN DEFAULT TRUE | Actividad visible |
| signature | TEXT | Firma de mensajes |
| away_message | TEXT | Mensaje de ausencia |
| out_of_hours_message | TEXT | Mensaje fuera de horario |
| auto_greeting | TEXT | Saludo automático |
| auto_closing_message | TEXT | Mensaje de cierre |
| updated_at | TIMESTAMP | Última actualización |

---

## 2. HORARIOS Y DISPONIBILIDAD

### `support_agent_schedule`
Horario de trabajo del agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| day_of_week | INTEGER | Día de la semana (0-6) |
| is_working_day | BOOLEAN DEFAULT TRUE | Día laboral |
| start_time | TIME | Hora de inicio |
| end_time | TIME | Hora de fin |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### `support_agent_breaks`
Pausas programadas del agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| name | VARCHAR(100) | Nombre de la pausa |
| start_time | TIME | Hora de inicio |
| end_time | TIME | Hora de fin |
| is_active | BOOLEAN DEFAULT TRUE | Activa |
| created_at | TIMESTAMP | Fecha de creación |

### `support_agent_vacations`
Vacaciones y ausencias del agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| start_date | DATE | Fecha de inicio |
| end_date | DATE | Fecha de fin |
| reason | VARCHAR(200) | Razón |
| status | ENUM('pending','approved','rejected') | Estado |
| approved_by | INTEGER REFERENCES support_agents(id) | Aprobado por |
| created_at | TIMESTAMP | Fecha de creación |

---

## 3. GESTIÓN DE TICKETS

### `support_tickets`
Tickets de soporte.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| ticket_number | VARCHAR(20) UNIQUE | Número de ticket (TKT-XXXXX) |
| user_id | INTEGER REFERENCES users(id) | Usuario cliente |
| user_od_id | VARCHAR(20) | OD ID del usuario |
| subject | VARCHAR(200) | Asunto |
| description | TEXT | Descripción inicial |
| category | ENUM('withdrawal','deposit','account','trading','technical','verification','bonus','other') | Categoría |
| priority | ENUM('urgent','high','medium','low') | Prioridad |
| status | ENUM('open','in_progress','waiting','escalated','resolved','closed') | Estado |
| assigned_to | INTEGER REFERENCES support_agents(id) | Agente asignado |
| escalated_to | VARCHAR(50) | Escalado a (operador/admin) |
| escalated_by | INTEGER REFERENCES support_agents(id) | Escalado por |
| escalation_reason | TEXT | Razón de escalación |
| language | VARCHAR(5) DEFAULT 'es' | Idioma del ticket |
| sla_deadline | TIMESTAMP | Fecha límite SLA |
| sla_breached | BOOLEAN DEFAULT FALSE | SLA incumplido |
| waiting_since | TIMESTAMP | Esperando respuesta desde |
| first_response_at | TIMESTAMP | Primera respuesta |
| resolved_at | TIMESTAMP | Fecha de resolución |
| closed_at | TIMESTAMP | Fecha de cierre |
| rating | INTEGER | Calificación (1-5) |
| rating_comment | TEXT | Comentario de calificación |
| merged_into | INTEGER REFERENCES support_tickets(id) | Fusionado en |
| source | ENUM('web','chat','email','phone') DEFAULT 'web' | Origen |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### `ticket_messages`
Mensajes de tickets.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| ticket_id | INTEGER REFERENCES support_tickets(id) | Ticket |
| sender_type | ENUM('user','support','system') | Tipo de remitente |
| sender_id | INTEGER | ID del remitente |
| sender_name | VARCHAR(100) | Nombre del remitente |
| message | TEXT | Contenido del mensaje |
| is_read | BOOLEAN DEFAULT FALSE | Leído |
| suggested_response | TEXT | Respuesta sugerida por IA |
| created_at | TIMESTAMP | Fecha de envío |

### `ticket_attachments`
Archivos adjuntos de tickets.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| ticket_id | INTEGER REFERENCES support_tickets(id) | Ticket |
| message_id | INTEGER REFERENCES ticket_messages(id) | Mensaje |
| file_name | VARCHAR(255) | Nombre del archivo |
| file_url | VARCHAR(500) | URL del archivo |
| file_type | VARCHAR(50) | Tipo MIME |
| file_size | INTEGER | Tamaño en bytes |
| uploaded_by | INTEGER | ID del que subió |
| created_at | TIMESTAMP | Fecha de subida |

### `ticket_internal_notes`
Notas internas de tickets.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| ticket_id | INTEGER REFERENCES support_tickets(id) | Ticket |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| note | TEXT | Contenido de la nota |
| is_pinned | BOOLEAN DEFAULT FALSE | Fijada |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### `ticket_history`
Historial de cambios en tickets.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| ticket_id | INTEGER REFERENCES support_tickets(id) | Ticket |
| action | VARCHAR(100) | Acción realizada |
| performed_by | INTEGER | ID del que realizó |
| performed_by_name | VARCHAR(100) | Nombre del que realizó |
| performed_by_type | ENUM('user','support','system') | Tipo |
| old_value | TEXT | Valor anterior |
| new_value | TEXT | Valor nuevo |
| details | TEXT | Detalles adicionales |
| created_at | TIMESTAMP | Fecha de acción |

### `ticket_collaborators`
Colaboradores en tickets.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| ticket_id | INTEGER REFERENCES support_tickets(id) | Ticket |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente colaborador |
| added_by | INTEGER REFERENCES support_agents(id) | Añadido por |
| role | ENUM('viewer','contributor') DEFAULT 'contributor' | Rol |
| created_at | TIMESTAMP | Fecha de adición |

### `ticket_tags`
Tags de tickets.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| ticket_id | INTEGER REFERENCES support_tickets(id) | Ticket |
| tag | VARCHAR(50) | Tag |
| added_by | INTEGER REFERENCES support_agents(id) | Añadido por |
| created_at | TIMESTAMP | Fecha de adición |

### `ticket_merges`
Historial de fusiones de tickets.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| source_ticket_id | INTEGER | Ticket origen (fusionado) |
| target_ticket_id | INTEGER REFERENCES support_tickets(id) | Ticket destino |
| merged_by | INTEGER REFERENCES support_agents(id) | Fusionado por |
| reason | TEXT | Razón de fusión |
| created_at | TIMESTAMP | Fecha de fusión |

### `ticket_transfers`
Historial de transferencias de tickets.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| ticket_id | INTEGER REFERENCES support_tickets(id) | Ticket |
| from_agent_id | INTEGER REFERENCES support_agents(id) | Agente origen |
| to_agent_id | INTEGER REFERENCES support_agents(id) | Agente destino |
| reason | TEXT | Razón de transferencia |
| created_at | TIMESTAMP | Fecha de transferencia |

### `ticket_escalations`
Historial de escalaciones de tickets.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| ticket_id | INTEGER REFERENCES support_tickets(id) | Ticket |
| escalated_by | INTEGER REFERENCES support_agents(id) | Escalado por |
| escalated_to | VARCHAR(50) | Escalado a (operador/admin) |
| escalated_to_id | INTEGER | ID del destinatario |
| reason | TEXT | Razón de escalación |
| priority_before | VARCHAR(20) | Prioridad anterior |
| priority_after | VARCHAR(20) | Prioridad después |
| resolved | BOOLEAN DEFAULT FALSE | Resuelto |
| resolved_at | TIMESTAMP | Fecha de resolución |
| resolution_notes | TEXT | Notas de resolución |
| created_at | TIMESTAMP | Fecha de escalación |

---

## 4. CHAT EN VIVO

### `live_chat_sessions`
Sesiones de chat en vivo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| session_id | VARCHAR(50) UNIQUE | ID de sesión |
| user_id | INTEGER REFERENCES users(id) | Usuario cliente |
| user_od_id | VARCHAR(20) | OD ID del usuario |
| user_name | VARCHAR(100) | Nombre del usuario |
| user_email | VARCHAR(255) | Email del usuario |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente asignado |
| status | ENUM('waiting','active','ended','abandoned') | Estado |
| language | VARCHAR(5) DEFAULT 'es' | Idioma |
| waiting_time_seconds | INTEGER DEFAULT 0 | Tiempo en espera |
| duration_seconds | INTEGER DEFAULT 0 | Duración total |
| rating | INTEGER | Calificación (1-5) |
| rating_comment | TEXT | Comentario de calificación |
| converted_to_ticket | INTEGER REFERENCES support_tickets(id) | Ticket creado |
| source | ENUM('web','mobile','widget') DEFAULT 'web' | Origen |
| user_agent | TEXT | User agent |
| ip_address | VARCHAR(45) | IP del usuario |
| started_at | TIMESTAMP | Inicio de sesión |
| accepted_at | TIMESTAMP | Aceptado por agente |
| ended_at | TIMESTAMP | Fin de sesión |
| created_at | TIMESTAMP | Fecha de creación |

### `live_chat_messages`
Mensajes del chat en vivo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| session_id | INTEGER REFERENCES live_chat_sessions(id) | Sesión |
| sender_type | ENUM('user','support','bot','system') | Tipo de remitente |
| sender_id | INTEGER | ID del remitente |
| sender_name | VARCHAR(100) | Nombre del remitente |
| message | TEXT | Contenido del mensaje |
| is_read | BOOLEAN DEFAULT FALSE | Leído |
| created_at | TIMESTAMP | Fecha de envío |

### `live_chat_attachments`
Archivos adjuntos del chat en vivo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| session_id | INTEGER REFERENCES live_chat_sessions(id) | Sesión |
| message_id | INTEGER REFERENCES live_chat_messages(id) | Mensaje |
| file_name | VARCHAR(255) | Nombre del archivo |
| file_url | VARCHAR(500) | URL del archivo |
| file_type | VARCHAR(50) | Tipo MIME |
| file_size | INTEGER | Tamaño en bytes |
| created_at | TIMESTAMP | Fecha de subida |

### `live_chat_notes`
Notas del agente sobre el chat.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| session_id | INTEGER REFERENCES live_chat_sessions(id) | Sesión |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| note | TEXT | Contenido de la nota |
| created_at | TIMESTAMP | Fecha de creación |

### `live_chat_transfers`
Transferencias de chat entre agentes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| session_id | INTEGER REFERENCES live_chat_sessions(id) | Sesión |
| from_agent_id | INTEGER REFERENCES support_agents(id) | Agente origen |
| to_agent_id | INTEGER REFERENCES support_agents(id) | Agente destino |
| reason | TEXT | Razón de transferencia |
| accepted | BOOLEAN DEFAULT FALSE | Aceptado |
| created_at | TIMESTAMP | Fecha de transferencia |

### `chat_queue`
Cola de chats en espera.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| session_id | INTEGER REFERENCES live_chat_sessions(id) UNIQUE | Sesión |
| priority | INTEGER DEFAULT 0 | Prioridad en cola |
| language | VARCHAR(5) | Idioma preferido |
| category | VARCHAR(50) | Categoría estimada |
| entered_at | TIMESTAMP | Entrada a la cola |
| assigned_at | TIMESTAMP | Asignado a agente |

---

## 5. COLA SLA Y PRIORIZACIÓN

### `sla_policies`
Políticas de SLA.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(100) | Nombre de la política |
| category | VARCHAR(50) | Categoría de ticket |
| priority | VARCHAR(20) | Prioridad |
| first_response_hours | INTEGER | Horas para primera respuesta |
| resolution_hours | INTEGER | Horas para resolución |
| is_active | BOOLEAN DEFAULT TRUE | Activa |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### `sla_breaches`
Incumplimientos de SLA.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| ticket_id | INTEGER REFERENCES support_tickets(id) | Ticket |
| policy_id | INTEGER REFERENCES sla_policies(id) | Política |
| breach_type | ENUM('first_response','resolution') | Tipo de incumplimiento |
| expected_at | TIMESTAMP | Fecha esperada |
| breached_at | TIMESTAMP | Fecha de incumplimiento |
| time_exceeded_minutes | INTEGER | Minutos excedidos |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente asignado |
| created_at | TIMESTAMP | Fecha de registro |

### `ticket_queue_priority`
Priorización de cola de tickets.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| ticket_id | INTEGER REFERENCES support_tickets(id) UNIQUE | Ticket |
| sla_status | ENUM('ok','warning','critical','breached') | Estado SLA |
| sla_minutes_remaining | INTEGER | Minutos restantes |
| priority_score | INTEGER | Puntuación de prioridad |
| calculated_at | TIMESTAMP | Fecha de cálculo |

---

## 6. FAQs

### `faqs`
Preguntas frecuentes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| question | VARCHAR(500) | Pregunta |
| answer | TEXT | Respuesta |
| category | VARCHAR(50) | Categoría |
| language | VARCHAR(5) DEFAULT 'es' | Idioma |
| views_count | INTEGER DEFAULT 0 | Veces vista |
| helpful_count | INTEGER DEFAULT 0 | Marcada como útil |
| not_helpful_count | INTEGER DEFAULT 0 | Marcada como no útil |
| is_published | BOOLEAN DEFAULT TRUE | Publicada |
| display_order | INTEGER | Orden de visualización |
| created_by | INTEGER REFERENCES support_agents(id) | Creado por |
| updated_by | INTEGER REFERENCES support_agents(id) | Actualizado por |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### `faq_categories`
Categorías de FAQs.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(100) | Nombre |
| slug | VARCHAR(100) UNIQUE | Slug URL |
| description | TEXT | Descripción |
| icon | VARCHAR(50) | Icono |
| display_order | INTEGER | Orden |
| is_active | BOOLEAN DEFAULT TRUE | Activa |
| created_at | TIMESTAMP | Fecha de creación |

### `faq_feedback`
Feedback de FAQs.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| faq_id | INTEGER REFERENCES faqs(id) | FAQ |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| is_helpful | BOOLEAN | Fue útil |
| comment | TEXT | Comentario |
| created_at | TIMESTAMP | Fecha de feedback |

---

## 7. PLANTILLAS DE RESPUESTA

### `support_templates`
Plantillas de respuesta.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(100) | Nombre |
| shortcut | VARCHAR(20) | Atajo (ej: /saludo) |
| category | VARCHAR(50) | Categoría |
| content | TEXT | Contenido de la plantilla |
| variables | JSONB | Variables disponibles |
| language | VARCHAR(5) DEFAULT 'es' | Idioma |
| usage_count | INTEGER DEFAULT 0 | Veces usada |
| is_favorite | BOOLEAN DEFAULT FALSE | Favorita |
| is_global | BOOLEAN DEFAULT FALSE | Global (todos los agentes) |
| created_by | INTEGER REFERENCES support_agents(id) | Creado por |
| updated_by | INTEGER REFERENCES support_agents(id) | Actualizado por |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### `template_categories`
Categorías de plantillas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(100) | Nombre |
| description | TEXT | Descripción |
| display_order | INTEGER | Orden |
| is_active | BOOLEAN DEFAULT TRUE | Activa |
| created_at | TIMESTAMP | Fecha de creación |

### `agent_template_favorites`
Plantillas favoritas por agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| template_id | INTEGER REFERENCES support_templates(id) | Plantilla |
| created_at | TIMESTAMP | Fecha de marcado |

### `template_usage_log`
Log de uso de plantillas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| template_id | INTEGER REFERENCES support_templates(id) | Plantilla |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| ticket_id | INTEGER REFERENCES support_tickets(id) | Ticket (si aplica) |
| chat_session_id | INTEGER REFERENCES live_chat_sessions(id) | Chat (si aplica) |
| used_at | TIMESTAMP | Fecha de uso |

---

## 8. RESPUESTAS RÁPIDAS (CANNED RESPONSES)

### `canned_responses`
Respuestas rápidas predefinidas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| shortcut | VARCHAR(20) UNIQUE | Atajo (ej: /hola) |
| title | VARCHAR(100) | Título |
| content | TEXT | Contenido |
| category | VARCHAR(50) | Categoría |
| language | VARCHAR(5) DEFAULT 'es' | Idioma |
| is_global | BOOLEAN DEFAULT TRUE | Global |
| created_by | INTEGER REFERENCES support_agents(id) | Creado por |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### `quick_replies`
Respuestas rápidas para chat.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| text | TEXT | Texto de la respuesta |
| category | VARCHAR(50) | Categoría |
| display_order | INTEGER | Orden |
| is_active | BOOLEAN DEFAULT TRUE | Activa |
| created_at | TIMESTAMP | Fecha de creación |

---

## 9. BASE DE CONOCIMIENTO

### `knowledge_articles`
Artículos de la base de conocimiento.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| title | VARCHAR(200) | Título |
| slug | VARCHAR(200) UNIQUE | Slug URL |
| content | TEXT | Contenido (Markdown) |
| excerpt | TEXT | Extracto/resumen |
| category_id | INTEGER REFERENCES knowledge_categories(id) | Categoría |
| author_id | INTEGER REFERENCES support_agents(id) | Autor |
| views_count | INTEGER DEFAULT 0 | Vistas |
| is_published | BOOLEAN DEFAULT FALSE | Publicado |
| is_internal | BOOLEAN DEFAULT TRUE | Solo interno |
| language | VARCHAR(5) DEFAULT 'es' | Idioma |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |
| published_at | TIMESTAMP | Fecha de publicación |

### `knowledge_categories`
Categorías de artículos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(100) | Nombre |
| slug | VARCHAR(100) UNIQUE | Slug URL |
| description | TEXT | Descripción |
| icon | VARCHAR(50) | Icono |
| parent_id | INTEGER REFERENCES knowledge_categories(id) | Categoría padre |
| display_order | INTEGER | Orden |
| is_active | BOOLEAN DEFAULT TRUE | Activa |
| created_at | TIMESTAMP | Fecha de creación |

### `knowledge_article_tags`
Tags de artículos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| article_id | INTEGER REFERENCES knowledge_articles(id) | Artículo |
| tag | VARCHAR(50) | Tag |
| created_at | TIMESTAMP | Fecha de creación |

### `knowledge_related_articles`
Artículos relacionados.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| article_id | INTEGER REFERENCES knowledge_articles(id) | Artículo |
| related_article_id | INTEGER REFERENCES knowledge_articles(id) | Artículo relacionado |
| created_at | TIMESTAMP | Fecha de relación |

### `knowledge_article_views`
Registro de vistas de artículos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| article_id | INTEGER REFERENCES knowledge_articles(id) | Artículo |
| viewer_id | INTEGER | ID del que vio |
| viewer_type | ENUM('agent','user') | Tipo de viewer |
| viewed_at | TIMESTAMP | Fecha de vista |

---

## 10. MACROS Y AUTOMATIZACIÓN

### `support_macros`
Macros de acciones automatizadas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(100) | Nombre del macro |
| description | TEXT | Descripción |
| is_global | BOOLEAN DEFAULT FALSE | Global |
| created_by | INTEGER REFERENCES support_agents(id) | Creado por |
| usage_count | INTEGER DEFAULT 0 | Veces usado |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### `macro_actions`
Acciones de macros.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| macro_id | INTEGER REFERENCES support_macros(id) | Macro |
| action_type | ENUM('reply','status','tag','assign','priority','escalate') | Tipo de acción |
| action_value | TEXT | Valor de la acción |
| action_order | INTEGER | Orden de ejecución |
| created_at | TIMESTAMP | Fecha de creación |

### `macro_usage_log`
Log de uso de macros.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| macro_id | INTEGER REFERENCES support_macros(id) | Macro |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| ticket_id | INTEGER REFERENCES support_tickets(id) | Ticket |
| used_at | TIMESTAMP | Fecha de uso |

---

## 11. NOTAS DEL AGENTE

### `agent_personal_notes`
Notas personales del agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| content | TEXT | Contenido de la nota |
| color | VARCHAR(20) DEFAULT '#3b82f6' | Color de la nota |
| is_pinned | BOOLEAN DEFAULT FALSE | Fijada |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### `user_notes_by_agent`
Notas del agente sobre usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| note | TEXT | Contenido de la nota |
| is_important | BOOLEAN DEFAULT FALSE | Importante |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

---

## 12. CALIFICACIONES Y SATISFACCIÓN

### `ticket_ratings`
Calificaciones de tickets.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| ticket_id | INTEGER REFERENCES support_tickets(id) UNIQUE | Ticket |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente calificado |
| rating | INTEGER CHECK (rating >= 1 AND rating <= 5) | Calificación |
| comment | TEXT | Comentario |
| categories | JSONB | Categorías calificadas |
| created_at | TIMESTAMP | Fecha de calificación |

### `chat_ratings`
Calificaciones de chats.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| session_id | INTEGER REFERENCES live_chat_sessions(id) UNIQUE | Sesión |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente calificado |
| rating | INTEGER CHECK (rating >= 1 AND rating <= 5) | Calificación |
| comment | TEXT | Comentario |
| created_at | TIMESTAMP | Fecha de calificación |

### `rating_requests`
Solicitudes de calificación enviadas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| ticket_id | INTEGER REFERENCES support_tickets(id) | Ticket |
| chat_session_id | INTEGER REFERENCES live_chat_sessions(id) | Chat |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| sent_at | TIMESTAMP | Fecha de envío |
| responded_at | TIMESTAMP | Fecha de respuesta |
| is_responded | BOOLEAN DEFAULT FALSE | Respondida |

---

## 13. CHAT INTERNO DEL EQUIPO

### `internal_chat_rooms`
Salas de chat interno.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(100) | Nombre de la sala |
| type | ENUM('general','direct','announcements','department') | Tipo |
| description | TEXT | Descripción |
| is_active | BOOLEAN DEFAULT TRUE | Activa |
| created_by | INTEGER REFERENCES support_agents(id) | Creado por |
| created_at | TIMESTAMP | Fecha de creación |

### `internal_chat_members`
Miembros de salas de chat.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| room_id | INTEGER REFERENCES internal_chat_rooms(id) | Sala |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| role | ENUM('admin','member') DEFAULT 'member' | Rol |
| joined_at | TIMESTAMP | Fecha de unión |
| last_read_at | TIMESTAMP | Última lectura |

### `internal_chat_messages`
Mensajes del chat interno.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| room_id | INTEGER REFERENCES internal_chat_rooms(id) | Sala |
| sender_id | INTEGER REFERENCES support_agents(id) | Remitente |
| sender_role | ENUM('support','operator','admin') | Rol del remitente |
| message | TEXT | Contenido del mensaje |
| reply_to | INTEGER REFERENCES internal_chat_messages(id) | Respuesta a |
| is_edited | BOOLEAN DEFAULT FALSE | Editado |
| is_deleted | BOOLEAN DEFAULT FALSE | Eliminado |
| is_pinned | BOOLEAN DEFAULT FALSE | Fijado |
| created_at | TIMESTAMP | Fecha de envío |
| edited_at | TIMESTAMP | Fecha de edición |

### `internal_chat_attachments`
Archivos adjuntos del chat interno.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| message_id | INTEGER REFERENCES internal_chat_messages(id) | Mensaje |
| file_name | VARCHAR(255) | Nombre del archivo |
| file_url | VARCHAR(500) | URL del archivo |
| file_type | VARCHAR(50) | Tipo MIME |
| file_size | INTEGER | Tamaño en bytes |
| created_at | TIMESTAMP | Fecha de subida |

### `internal_chat_reactions`
Reacciones a mensajes internos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| message_id | INTEGER REFERENCES internal_chat_messages(id) | Mensaje |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| emoji | VARCHAR(10) | Emoji de reacción |
| created_at | TIMESTAMP | Fecha de reacción |

### `internal_chat_mentions`
Menciones en el chat interno.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| message_id | INTEGER REFERENCES internal_chat_messages(id) | Mensaje |
| mentioned_agent_id | INTEGER REFERENCES support_agents(id) | Agente mencionado |
| is_read | BOOLEAN DEFAULT FALSE | Leída |
| created_at | TIMESTAMP | Fecha de mención |

### `internal_chat_read_status`
Estado de lectura del chat interno.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| room_id | INTEGER REFERENCES internal_chat_rooms(id) | Sala |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| last_read_message_id | INTEGER REFERENCES internal_chat_messages(id) | Último mensaje leído |
| last_read_at | TIMESTAMP | Fecha de última lectura |

---

## 14. NOTIFICACIONES DEL AGENTE

### `agent_notifications`
Notificaciones del agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| type | ENUM('ticket','chat','sla','escalation','system','rating','mention') | Tipo |
| title | VARCHAR(200) | Título |
| message | TEXT | Mensaje |
| data | JSONB | Datos adicionales |
| link | VARCHAR(500) | Enlace relacionado |
| is_read | BOOLEAN DEFAULT FALSE | Leída |
| read_at | TIMESTAMP | Fecha de lectura |
| created_at | TIMESTAMP | Fecha de creación |

### `agent_notification_preferences`
Preferencias de notificación por tipo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| notification_type | VARCHAR(50) | Tipo de notificación |
| email_enabled | BOOLEAN DEFAULT TRUE | Email activo |
| push_enabled | BOOLEAN DEFAULT TRUE | Push activo |
| sound_enabled | BOOLEAN DEFAULT TRUE | Sonido activo |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

---

## 15. REPORTES Y ESTADÍSTICAS

### `agent_daily_stats`
Estadísticas diarias del agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| date | DATE | Fecha |
| tickets_assigned | INTEGER DEFAULT 0 | Tickets asignados |
| tickets_resolved | INTEGER DEFAULT 0 | Tickets resueltos |
| tickets_escalated | INTEGER DEFAULT 0 | Tickets escalados |
| chats_handled | INTEGER DEFAULT 0 | Chats atendidos |
| avg_response_time_minutes | DECIMAL(10,2) | Tiempo promedio respuesta |
| avg_resolution_time_minutes | DECIMAL(10,2) | Tiempo promedio resolución |
| sla_compliance_rate | DECIMAL(5,2) | Tasa cumplimiento SLA |
| avg_rating | DECIMAL(3,2) | Calificación promedio |
| ratings_count | INTEGER DEFAULT 0 | Número de calificaciones |
| online_time_minutes | INTEGER DEFAULT 0 | Tiempo en línea |
| created_at | TIMESTAMP | Fecha de registro |

### `agent_performance_metrics`
Métricas de rendimiento del agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| period | ENUM('daily','weekly','monthly') | Período |
| period_start | DATE | Inicio del período |
| period_end | DATE | Fin del período |
| total_tickets | INTEGER DEFAULT 0 | Total tickets |
| resolved_tickets | INTEGER DEFAULT 0 | Tickets resueltos |
| escalated_tickets | INTEGER DEFAULT 0 | Tickets escalados |
| total_chats | INTEGER DEFAULT 0 | Total chats |
| avg_first_response_minutes | DECIMAL(10,2) | Promedio primera respuesta |
| avg_resolution_minutes | DECIMAL(10,2) | Promedio resolución |
| sla_compliance_percentage | DECIMAL(5,2) | % cumplimiento SLA |
| satisfaction_score | DECIMAL(3,2) | Puntuación satisfacción |
| created_at | TIMESTAMP | Fecha de cálculo |

### `support_reports`
Reportes generados.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente que generó |
| report_type | ENUM('overview','tickets','agents','satisfaction','sla','custom') | Tipo |
| title | VARCHAR(200) | Título |
| period | ENUM('today','week','month','quarter','custom') | Período |
| date_from | DATE | Fecha desde |
| date_to | DATE | Fecha hasta |
| filters | JSONB | Filtros aplicados |
| data | JSONB | Datos del reporte |
| file_url | VARCHAR(500) | URL del archivo |
| format | ENUM('pdf','csv','excel') | Formato |
| status | ENUM('generating','completed','failed') | Estado |
| created_at | TIMESTAMP | Fecha de creación |
| completed_at | TIMESTAMP | Fecha de completado |

### `scheduled_reports`
Reportes programados.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| report_type | VARCHAR(50) | Tipo de reporte |
| schedule | ENUM('daily','weekly','monthly') | Frecuencia |
| day_of_week | INTEGER | Día de la semana (0-6) |
| day_of_month | INTEGER | Día del mes (1-31) |
| time | TIME | Hora de generación |
| recipients | JSONB | Destinatarios (emails) |
| filters | JSONB | Filtros |
| format | ENUM('pdf','csv','excel') | Formato |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| last_run_at | TIMESTAMP | Última ejecución |
| next_run_at | TIMESTAMP | Próxima ejecución |
| created_at | TIMESTAMP | Fecha de creación |

### `ticket_category_stats`
Estadísticas por categoría de ticket.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| date | DATE | Fecha |
| category | VARCHAR(50) | Categoría |
| total_tickets | INTEGER DEFAULT 0 | Total tickets |
| resolved_tickets | INTEGER DEFAULT 0 | Resueltos |
| avg_resolution_minutes | DECIMAL(10,2) | Promedio resolución |
| sla_breaches | INTEGER DEFAULT 0 | Incumplimientos SLA |
| created_at | TIMESTAMP | Fecha de registro |

### `hourly_ticket_distribution`
Distribución horaria de tickets.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| date | DATE | Fecha |
| hour | INTEGER | Hora (0-23) |
| tickets_created | INTEGER DEFAULT 0 | Tickets creados |
| tickets_resolved | INTEGER DEFAULT 0 | Tickets resueltos |
| chats_started | INTEGER DEFAULT 0 | Chats iniciados |
| created_at | TIMESTAMP | Fecha de registro |

---

## 16. SEGURIDAD DEL AGENTE

### `agent_trusted_devices`
Dispositivos de confianza del agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| device_id | VARCHAR(200) | ID del dispositivo |
| device_name | VARCHAR(100) | Nombre del dispositivo |
| browser | VARCHAR(50) | Navegador |
| os | VARCHAR(50) | Sistema operativo |
| is_trusted | BOOLEAN DEFAULT TRUE | De confianza |
| last_used_at | TIMESTAMP | Último uso |
| created_at | TIMESTAMP | Fecha de registro |

### `agent_login_history`
Historial de inicios de sesión.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| ip_address | VARCHAR(45) | Dirección IP |
| device | VARCHAR(200) | Dispositivo/navegador |
| location | VARCHAR(100) | Ubicación geográfica |
| status | ENUM('success','failed','blocked') | Estado del intento |
| failure_reason | VARCHAR(100) | Razón del fallo |
| is_current | BOOLEAN DEFAULT FALSE | Sesión actual |
| created_at | TIMESTAMP | Fecha del intento |

### `agent_two_factor`
Configuración 2FA del agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) UNIQUE | Agente |
| is_enabled | BOOLEAN DEFAULT FALSE | 2FA activo |
| secret | VARCHAR(100) | Secreto TOTP |
| backup_codes | JSONB | Códigos de respaldo |
| backup_codes_used | INTEGER DEFAULT 0 | Códigos usados |
| last_used_at | TIMESTAMP | Último uso |
| enabled_at | TIMESTAMP | Fecha de activación |

### `agent_security_questions`
Preguntas de seguridad del agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| question | VARCHAR(200) | Pregunta |
| answer_hash | VARCHAR(255) | Respuesta hasheada |
| position | INTEGER | Orden |
| created_at | TIMESTAMP | Fecha de creación |

### `agent_password_history`
Historial de contraseñas del agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| password_hash | VARCHAR(255) | Hash de contraseña |
| created_at | TIMESTAMP | Fecha de cambio |

---

## 17. LOGS DE ACTIVIDAD

### `agent_activity_logs`
Registro de actividad del agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| action | VARCHAR(100) | Acción realizada |
| action_category | ENUM('ticket','chat','user','faq','template','knowledge','settings','system') | Categoría |
| target_type | VARCHAR(50) | Tipo de entidad afectada |
| target_id | INTEGER | ID de entidad afectada |
| target_name | VARCHAR(200) | Nombre de entidad |
| old_data | JSONB | Datos anteriores |
| new_data | JSONB | Datos nuevos |
| ip_address | VARCHAR(45) | IP del agente |
| user_agent | TEXT | User agent |
| session_id | INTEGER REFERENCES support_agent_sessions(id) | Sesión |
| created_at | TIMESTAMP | Fecha de acción |

### `agent_status_history`
Historial de cambios de estado.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| previous_status | VARCHAR(20) | Estado anterior |
| new_status | VARCHAR(20) | Nuevo estado |
| status_message | VARCHAR(200) | Mensaje de estado |
| duration_minutes | INTEGER | Duración en estado anterior |
| created_at | TIMESTAMP | Fecha de cambio |

---

## 18. INTEGRACIONES Y API

### `agent_api_tokens`
Tokens de API del agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| name | VARCHAR(100) | Nombre del token |
| token_hash | VARCHAR(255) | Hash del token |
| token_prefix | VARCHAR(20) | Prefijo visible |
| permissions | JSONB | Permisos del token |
| last_used_at | TIMESTAMP | Último uso |
| expires_at | TIMESTAMP | Fecha de expiración |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| created_at | TIMESTAMP | Fecha de creación |

### `agent_webhooks`
Webhooks configurados por el agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| url | VARCHAR(500) | URL del webhook |
| events | JSONB | Eventos suscritos |
| secret | VARCHAR(100) | Secreto para firma |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| last_triggered_at | TIMESTAMP | Último disparo |
| failure_count | INTEGER DEFAULT 0 | Fallos consecutivos |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### `webhook_logs`
Logs de webhooks.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| webhook_id | INTEGER REFERENCES agent_webhooks(id) | Webhook |
| event | VARCHAR(50) | Evento |
| payload | JSONB | Payload enviado |
| response_status | INTEGER | Código de respuesta |
| response_body | TEXT | Cuerpo de respuesta |
| success | BOOLEAN | Exitoso |
| created_at | TIMESTAMP | Fecha de envío |

---

## 19. BÚSQUEDA GLOBAL

### `search_index`
Índice de búsqueda global.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| entity_type | ENUM('ticket','user','faq','article','template') | Tipo de entidad |
| entity_id | INTEGER | ID de la entidad |
| title | VARCHAR(500) | Título/nombre |
| content | TEXT | Contenido indexado |
| metadata | JSONB | Metadatos adicionales |
| search_vector | TSVECTOR | Vector de búsqueda |
| updated_at | TIMESTAMP | Última actualización |

### `search_history`
Historial de búsquedas del agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| query | VARCHAR(200) | Consulta de búsqueda |
| results_count | INTEGER | Número de resultados |
| clicked_result_type | VARCHAR(50) | Tipo de resultado clickeado |
| clicked_result_id | INTEGER | ID del resultado clickeado |
| created_at | TIMESTAMP | Fecha de búsqueda |

---

## 20. ATAJOS DE TECLADO

### `keyboard_shortcuts`
Atajos de teclado personalizados.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| action | VARCHAR(100) | Acción |
| keys | VARCHAR(50) | Combinación de teclas |
| is_custom | BOOLEAN DEFAULT FALSE | Personalizado |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### `default_shortcuts`
Atajos de teclado por defecto.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| action | VARCHAR(100) | Acción |
| description | VARCHAR(200) | Descripción |
| keys | VARCHAR(50) | Combinación de teclas |
| is_editable | BOOLEAN DEFAULT TRUE | Editable |
| created_at | TIMESTAMP | Fecha de creación |

---

## 21. TAGS Y ETIQUETAS

### `available_tags`
Tags disponibles para tickets.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(50) UNIQUE | Nombre del tag |
| color | VARCHAR(20) | Color del tag |
| description | TEXT | Descripción |
| usage_count | INTEGER DEFAULT 0 | Veces usado |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| created_by | INTEGER REFERENCES support_agents(id) | Creado por |
| created_at | TIMESTAMP | Fecha de creación |

---

## 22. VIDEOLLAMADAS DE SOPORTE

### `support_video_calls`
Videollamadas de soporte.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| ticket_id | INTEGER REFERENCES support_tickets(id) | Ticket asociado |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| scheduled_at | TIMESTAMP | Fecha programada |
| duration_minutes | INTEGER DEFAULT 30 | Duración estimada |
| meeting_url | VARCHAR(500) | URL de la reunión |
| status | ENUM('scheduled','in_progress','completed','cancelled','no_show') | Estado |
| notes | TEXT | Notas de la llamada |
| recording_url | VARCHAR(500) | URL de grabación |
| started_at | TIMESTAMP | Inicio real |
| ended_at | TIMESTAMP | Fin real |
| created_at | TIMESTAMP | Fecha de creación |

---

## 23. DETECCIÓN DE IDIOMA

### `language_detection_log`
Log de detección de idioma.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| ticket_id | INTEGER REFERENCES support_tickets(id) | Ticket |
| chat_session_id | INTEGER REFERENCES live_chat_sessions(id) | Chat |
| detected_language | VARCHAR(5) | Idioma detectado |
| confidence | DECIMAL(5,4) | Confianza de detección |
| text_sample | TEXT | Muestra de texto |
| created_at | TIMESTAMP | Fecha de detección |

---

## 24. SUGERENCIAS DE IA

### `ai_response_suggestions`
Sugerencias de respuesta por IA.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| ticket_id | INTEGER REFERENCES support_tickets(id) | Ticket |
| message_id | INTEGER REFERENCES ticket_messages(id) | Mensaje del usuario |
| suggested_response | TEXT | Respuesta sugerida |
| confidence | DECIMAL(5,4) | Confianza |
| was_used | BOOLEAN DEFAULT FALSE | Fue usada |
| was_modified | BOOLEAN DEFAULT FALSE | Fue modificada |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente que usó |
| created_at | TIMESTAMP | Fecha de sugerencia |
| used_at | TIMESTAMP | Fecha de uso |

---

## 25. PERMISOS Y ROLES

### `support_roles`
Roles de soporte.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(100) UNIQUE | Nombre del rol |
| description | TEXT | Descripción |
| permissions | JSONB | Lista de permisos |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### `agent_roles`
Asignación de roles a agentes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| role_id | INTEGER REFERENCES support_roles(id) | Rol |
| assigned_by | INTEGER REFERENCES support_agents(id) | Asignado por |
| assigned_at | TIMESTAMP | Fecha de asignación |

### `support_permissions`
Catálogo de permisos de soporte.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(100) UNIQUE | Nombre del permiso |
| code | VARCHAR(50) UNIQUE | Código del permiso |
| category | VARCHAR(50) | Categoría |
| description | TEXT | Descripción |
| is_active | BOOLEAN DEFAULT TRUE | Activo |

---

## 26. COLA DE ASIGNACIÓN AUTOMÁTICA

### `auto_assignment_rules`
Reglas de asignación automática.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(100) | Nombre de la regla |
| conditions | JSONB | Condiciones (categoría, idioma, etc.) |
| assignment_type | ENUM('round_robin','least_busy','skill_based') | Tipo de asignación |
| target_agents | JSONB | Agentes objetivo |
| priority | INTEGER | Prioridad de la regla |
| is_active | BOOLEAN DEFAULT TRUE | Activa |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### `agent_workload`
Carga de trabajo actual del agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) UNIQUE | Agente |
| active_tickets | INTEGER DEFAULT 0 | Tickets activos |
| active_chats | INTEGER DEFAULT 0 | Chats activos |
| max_tickets | INTEGER DEFAULT 10 | Máximo tickets |
| max_chats | INTEGER DEFAULT 3 | Máximo chats |
| is_accepting_new | BOOLEAN DEFAULT TRUE | Acepta nuevos |
| updated_at | TIMESTAMP | Última actualización |

---

## 27. EXPORTACIÓN DE DATOS

### `data_exports`
Exportaciones de datos solicitadas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| export_type | ENUM('tickets','users','chats','reports','all') | Tipo |
| filters | JSONB | Filtros aplicados |
| format | ENUM('csv','excel','json','pdf') | Formato |
| file_url | VARCHAR(500) | URL del archivo |
| file_size | INTEGER | Tamaño en bytes |
| row_count | INTEGER | Número de filas |
| status | ENUM('pending','processing','completed','failed') | Estado |
| error_message | TEXT | Mensaje de error |
| created_at | TIMESTAMP | Fecha de solicitud |
| completed_at | TIMESTAMP | Fecha de completado |
| expires_at | TIMESTAMP | Fecha de expiración |

---

## 28. CONFIGURACIÓN DE CATEGORÍAS

### `ticket_categories`
Categorías de tickets configurables.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(100) | Nombre |
| slug | VARCHAR(100) UNIQUE | Slug |
| description | TEXT | Descripción |
| icon | VARCHAR(50) | Icono |
| color | VARCHAR(20) | Color |
| sla_hours | INTEGER | Horas SLA por defecto |
| default_priority | VARCHAR(20) | Prioridad por defecto |
| auto_assign_to | INTEGER REFERENCES support_agents(id) | Auto-asignar a |
| parent_id | INTEGER REFERENCES ticket_categories(id) | Categoría padre |
| display_order | INTEGER | Orden |
| is_active | BOOLEAN DEFAULT TRUE | Activa |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

---

## 29. SATISFACCIÓN DEL CLIENTE

### `csat_surveys`
Encuestas de satisfacción.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| ticket_id | INTEGER REFERENCES support_tickets(id) | Ticket |
| chat_session_id | INTEGER REFERENCES live_chat_sessions(id) | Chat |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| overall_rating | INTEGER | Calificación general (1-5) |
| response_time_rating | INTEGER | Calificación tiempo respuesta |
| resolution_rating | INTEGER | Calificación resolución |
| professionalism_rating | INTEGER | Calificación profesionalismo |
| would_recommend | BOOLEAN | Recomendaría |
| feedback | TEXT | Comentarios |
| created_at | TIMESTAMP | Fecha de encuesta |

### `nps_scores`
Puntuaciones NPS.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| score | INTEGER CHECK (score >= 0 AND score <= 10) | Puntuación NPS |
| feedback | TEXT | Comentarios |
| source | ENUM('ticket','chat','email','app') | Origen |
| created_at | TIMESTAMP | Fecha de registro |

---

## 30. ANUNCIOS Y COMUNICACIONES

### `support_announcements`
Anuncios para el equipo de soporte.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| title | VARCHAR(200) | Título |
| content | TEXT | Contenido |
| type | ENUM('info','warning','urgent','update') | Tipo |
| priority | ENUM('low','medium','high') | Prioridad |
| target_departments | JSONB | Departamentos objetivo |
| is_pinned | BOOLEAN DEFAULT FALSE | Fijado |
| is_active | BOOLEAN DEFAULT TRUE | Activo |
| created_by | INTEGER REFERENCES support_agents(id) | Creado por |
| starts_at | TIMESTAMP | Fecha de inicio |
| expires_at | TIMESTAMP | Fecha de expiración |
| created_at | TIMESTAMP | Fecha de creación |

### `announcement_reads`
Lecturas de anuncios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| announcement_id | INTEGER REFERENCES support_announcements(id) | Anuncio |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| read_at | TIMESTAMP | Fecha de lectura |

---

## RESUMEN DE TABLAS

| Sección | Número de Tablas |
|---------|------------------|
| 1. Agentes de Soporte y Autenticación | 3 |
| 2. Horarios y Disponibilidad | 3 |
| 3. Gestión de Tickets | 8 |
| 4. Chat en Vivo | 6 |
| 5. Cola SLA y Priorización | 3 |
| 6. FAQs | 3 |
| 7. Plantillas de Respuesta | 4 |
| 8. Respuestas Rápidas | 2 |
| 9. Base de Conocimiento | 5 |
| 10. Macros y Automatización | 3 |
| 11. Notas del Agente | 2 |
| 12. Calificaciones y Satisfacción | 3 |
| 13. Chat Interno del Equipo | 6 |
| 14. Notificaciones del Agente | 2 |
| 15. Reportes y Estadísticas | 6 |
| 16. Seguridad del Agente | 5 |
| 17. Logs de Actividad | 2 |
| 18. Integraciones y API | 3 |
| 19. Búsqueda Global | 2 |
| 20. Atajos de Teclado | 2 |
| 21. Tags y Etiquetas | 1 |
| 22. Videollamadas de Soporte | 1 |
| 23. Detección de Idioma | 1 |
| 24. Sugerencias de IA | 1 |
| 25. Permisos y Roles | 3 |
| 26. Cola de Asignación Automática | 2 |
| 27. Exportación de Datos | 1 |
| 28. Configuración de Categorías | 1 |
| 29. Satisfacción del Cliente | 2 |
| 30. Anuncios y Comunicaciones | 2 |
| 31. Indicador de Escritura (Typing) | 1 |
| 32. Mensajes Anclados (Pinned) | 2 |
| 33. Importación de Datos | 1 |
| 34. Respuestas Rápidas para Chat | 2 |
| 35. Notas de Chat | 1 |
| 36. Emojis y Reacciones | 2 |
| 37. Contactos Directos (Chat Interno) | 2 |
| 38. Filtros Guardados | 2 |
| 39. Selección Múltiple y Acciones en Lote | 1 |
| 40. Toasts y Notificaciones en Tiempo Real | 2 |
| 41. Estadísticas de Dashboard | 2 |
| 42. Actividad Reciente del Sistema | 2 |
| 43. Distribución por Prioridad | 1 |
| 44. Configuración de Auto-Refresh | 1 |
| 45. Información de Usuario en Tickets | 2 |
| 46. Tabs y Navegación | 2 |
| 47. Conversión de Chat a Ticket | 1 |
| 48. Solicitudes de Calificación | 2 |
| 49. Detección de Idioma Automática | 2 |
| 50. Gráficos y Reportes Visuales | 2 |
| **TOTAL** | **120 tablas** |

---

## ÍNDICES RECOMENDADOS

```sql
-- Tickets
CREATE INDEX idx_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX idx_tickets_status ON support_tickets(status);
CREATE INDEX idx_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_tickets_category ON support_tickets(category);
CREATE INDEX idx_tickets_sla_deadline ON support_tickets(sla_deadline);
CREATE INDEX idx_tickets_created_at ON support_tickets(created_at);

-- Chat en vivo
CREATE INDEX idx_live_chat_user_id ON live_chat_sessions(user_id);
CREATE INDEX idx_live_chat_agent_id ON live_chat_sessions(agent_id);
CREATE INDEX idx_live_chat_status ON live_chat_sessions(status);

-- Mensajes
CREATE INDEX idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX idx_chat_messages_session_id ON live_chat_messages(session_id);

-- Estadísticas
CREATE INDEX idx_agent_daily_stats_agent_date ON agent_daily_stats(agent_id, date);

-- Búsqueda
CREATE INDEX idx_search_vector ON search_index USING GIN(search_vector);

-- Actividad
CREATE INDEX idx_activity_logs_agent_id ON agent_activity_logs(agent_id);
CREATE INDEX idx_activity_logs_created_at ON agent_activity_logs(created_at);

-- Chat interno
CREATE INDEX idx_internal_messages_room_id ON internal_chat_messages(room_id);
CREATE INDEX idx_internal_messages_sender_id ON internal_chat_messages(sender_id);
CREATE INDEX idx_internal_direct_messages_sender ON internal_direct_messages(sender_id);
CREATE INDEX idx_internal_direct_messages_receiver ON internal_direct_messages(receiver_id, receiver_type);

-- Notificaciones
CREATE INDEX idx_agent_notifications_agent_id ON agent_notifications(agent_id);
CREATE INDEX idx_agent_notifications_is_read ON agent_notifications(is_read);
CREATE INDEX idx_realtime_queue_agent ON realtime_notifications_queue(agent_id, is_delivered);

-- FAQs y Knowledge
CREATE INDEX idx_faqs_category ON faqs(category);
CREATE INDEX idx_knowledge_articles_category ON knowledge_articles(category_id);
CREATE INDEX idx_knowledge_articles_published ON knowledge_articles(is_published);

-- Templates y Macros
CREATE INDEX idx_templates_category ON support_templates(category);
CREATE INDEX idx_templates_shortcut ON support_templates(shortcut);
CREATE INDEX idx_macros_created_by ON support_macros(created_by);

-- SLA
CREATE INDEX idx_sla_breaches_ticket ON sla_breaches(ticket_id);
CREATE INDEX idx_ticket_queue_priority ON ticket_queue_priority(sla_status);

-- Calificaciones
CREATE INDEX idx_ticket_ratings_agent ON ticket_ratings(agent_id);
CREATE INDEX idx_chat_ratings_agent ON chat_ratings(agent_id);
CREATE INDEX idx_csat_surveys_agent ON csat_surveys(agent_id);

-- Seguridad
CREATE INDEX idx_login_history_agent ON agent_login_history(agent_id);
CREATE INDEX idx_trusted_devices_agent ON agent_trusted_devices(agent_id);

-- Filtros guardados
CREATE INDEX idx_saved_filters_agent ON saved_ticket_filters(agent_id);

-- Dashboard
CREATE INDEX idx_dashboard_widgets_agent ON dashboard_widgets(agent_id);
CREATE INDEX idx_dashboard_stats_cache ON dashboard_stats_cache(agent_id, stat_type);

-- Actividad del sistema
CREATE INDEX idx_system_activity_created ON system_activity_feed(created_at);
CREATE INDEX idx_system_activity_type ON system_activity_feed(activity_type);

-- Conversiones
CREATE INDEX idx_chat_ticket_conversions ON chat_to_ticket_conversions(chat_session_id);

-- Reportes
CREATE INDEX idx_reports_agent ON support_reports(agent_id);
CREATE INDEX idx_reports_type ON support_reports(report_type);
CREATE INDEX idx_scheduled_reports_next ON scheduled_reports(next_run_at);
```

---

## NOTAS DE IMPLEMENTACIÓN

1. **Relaciones con tablas existentes**: Este esquema se relaciona con las tablas de `users` del esquema del cliente y con las tablas de `operators` del esquema del operador.

2. **Escalaciones**: Los tickets pueden escalarse a operadores o administradores, creando una relación entre los tres esquemas.

3. **Chat interno**: El chat interno permite comunicación entre agentes de soporte, operadores y administradores.

4. **SLA**: Las políticas de SLA deben configurarse según las necesidades del negocio y pueden variar por categoría y prioridad.

5. **Búsqueda**: Se recomienda usar PostgreSQL con extensión `pg_trgm` para búsquedas de texto completo.

6. **Caché**: Se recomienda implementar caché (Redis) para estadísticas en tiempo real y cola de tickets.

7. **WebSockets**: El chat en vivo y las notificaciones en tiempo real requieren implementación de WebSockets.


---

## 31. INDICADOR DE ESCRITURA (TYPING)

### `chat_typing_status`
Estado de escritura en chats.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| session_id | INTEGER REFERENCES live_chat_sessions(id) | Sesión de chat |
| user_id | INTEGER REFERENCES users(id) | Usuario escribiendo |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente escribiendo |
| is_typing | BOOLEAN DEFAULT FALSE | Está escribiendo |
| started_at | TIMESTAMP | Inicio de escritura |
| updated_at | TIMESTAMP | Última actualización |

---

## 32. MENSAJES ANCLADOS (PINNED)

### `pinned_internal_messages`
Mensajes anclados del chat interno.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| message_id | INTEGER REFERENCES internal_chat_messages(id) | Mensaje |
| room_id | INTEGER REFERENCES internal_chat_rooms(id) | Sala |
| pinned_by | INTEGER REFERENCES support_agents(id) | Anclado por |
| pinned_at | TIMESTAMP | Fecha de anclaje |

### `pinned_ticket_notes`
Notas ancladas en tickets.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| note_id | INTEGER REFERENCES ticket_internal_notes(id) | Nota |
| ticket_id | INTEGER REFERENCES support_tickets(id) | Ticket |
| pinned_by | INTEGER REFERENCES support_agents(id) | Anclado por |
| pinned_at | TIMESTAMP | Fecha de anclaje |

---

## 33. IMPORTACIÓN DE DATOS

### `data_imports`
Importaciones de datos realizadas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| import_type | ENUM('templates','faqs','knowledge','canned_responses') | Tipo |
| file_name | VARCHAR(255) | Nombre del archivo |
| file_url | VARCHAR(500) | URL del archivo |
| records_total | INTEGER | Total de registros |
| records_imported | INTEGER | Registros importados |
| records_failed | INTEGER | Registros fallidos |
| errors | JSONB | Errores encontrados |
| status | ENUM('pending','processing','completed','failed') | Estado |
| created_at | TIMESTAMP | Fecha de importación |
| completed_at | TIMESTAMP | Fecha de completado |

---

## 34. RESPUESTAS RÁPIDAS PARA CHAT (QUICK REPLIES)

### `chat_quick_replies`
Respuestas rápidas para chat en vivo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| text | TEXT | Texto de la respuesta |
| category | VARCHAR(50) | Categoría |
| language | VARCHAR(5) DEFAULT 'es' | Idioma |
| display_order | INTEGER | Orden de visualización |
| usage_count | INTEGER DEFAULT 0 | Veces usada |
| is_active | BOOLEAN DEFAULT TRUE | Activa |
| created_by | INTEGER REFERENCES support_agents(id) | Creado por |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### `agent_quick_reply_favorites`
Respuestas rápidas favoritas del agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| quick_reply_id | INTEGER REFERENCES chat_quick_replies(id) | Respuesta rápida |
| created_at | TIMESTAMP | Fecha de marcado |

---

## 35. NOTAS DE CHAT

### `live_chat_agent_notes`
Notas del agente sobre sesiones de chat.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| session_id | INTEGER REFERENCES live_chat_sessions(id) | Sesión de chat |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| note | TEXT | Contenido de la nota |
| is_pinned | BOOLEAN DEFAULT FALSE | Fijada |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

---

## 36. EMOJIS Y REACCIONES

### `emoji_picker_history`
Historial de emojis usados por el agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| emoji | VARCHAR(10) | Emoji |
| usage_count | INTEGER DEFAULT 1 | Veces usado |
| last_used_at | TIMESTAMP | Último uso |

### `message_reactions`
Reacciones a mensajes de tickets/chats.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| message_type | ENUM('ticket','chat','internal') | Tipo de mensaje |
| message_id | INTEGER | ID del mensaje |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| emoji | VARCHAR(10) | Emoji de reacción |
| created_at | TIMESTAMP | Fecha de reacción |

---

## 37. CONTACTOS DIRECTOS (CHAT INTERNO)

### `internal_direct_contacts`
Contactos directos para chat interno.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| contact_id | INTEGER | ID del contacto (agente/operador/admin) |
| contact_type | ENUM('support','operator','admin') | Tipo de contacto |
| contact_name | VARCHAR(100) | Nombre del contacto |
| is_favorite | BOOLEAN DEFAULT FALSE | Favorito |
| last_message_at | TIMESTAMP | Último mensaje |
| unread_count | INTEGER DEFAULT 0 | Mensajes no leídos |
| created_at | TIMESTAMP | Fecha de creación |

### `internal_direct_messages`
Mensajes directos entre agentes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| sender_id | INTEGER REFERENCES support_agents(id) | Remitente |
| receiver_id | INTEGER | Receptor |
| receiver_type | ENUM('support','operator','admin') | Tipo de receptor |
| message | TEXT | Contenido del mensaje |
| is_read | BOOLEAN DEFAULT FALSE | Leído |
| read_at | TIMESTAMP | Fecha de lectura |
| is_deleted_sender | BOOLEAN DEFAULT FALSE | Eliminado por remitente |
| is_deleted_receiver | BOOLEAN DEFAULT FALSE | Eliminado por receptor |
| reply_to | INTEGER REFERENCES internal_direct_messages(id) | Respuesta a |
| created_at | TIMESTAMP | Fecha de envío |

---

## 38. FILTROS GUARDADOS

### `saved_ticket_filters`
Filtros de tickets guardados por el agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| name | VARCHAR(100) | Nombre del filtro |
| filters | JSONB | Configuración de filtros |
| is_default | BOOLEAN DEFAULT FALSE | Filtro por defecto |
| usage_count | INTEGER DEFAULT 0 | Veces usado |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### `saved_queue_filters`
Filtros de cola guardados.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| name | VARCHAR(100) | Nombre del filtro |
| filters | JSONB | Configuración de filtros |
| sort_by | VARCHAR(50) | Ordenar por |
| is_default | BOOLEAN DEFAULT FALSE | Filtro por defecto |
| created_at | TIMESTAMP | Fecha de creación |

---

## 39. SELECCIÓN MÚLTIPLE Y ACCIONES EN LOTE

### `bulk_action_history`
Historial de acciones en lote.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| action_type | ENUM('assign','escalate','close','tag','priority','transfer') | Tipo de acción |
| ticket_ids | JSONB | IDs de tickets afectados |
| ticket_count | INTEGER | Número de tickets |
| action_details | JSONB | Detalles de la acción |
| status | ENUM('pending','completed','partial','failed') | Estado |
| success_count | INTEGER DEFAULT 0 | Exitosos |
| failed_count | INTEGER DEFAULT 0 | Fallidos |
| created_at | TIMESTAMP | Fecha de acción |
| completed_at | TIMESTAMP | Fecha de completado |

---

## 40. TOASTS Y NOTIFICACIONES EN TIEMPO REAL

### `agent_toast_preferences`
Preferencias de toasts del agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) UNIQUE | Agente |
| show_success | BOOLEAN DEFAULT TRUE | Mostrar éxito |
| show_error | BOOLEAN DEFAULT TRUE | Mostrar error |
| show_info | BOOLEAN DEFAULT TRUE | Mostrar info |
| duration_ms | INTEGER DEFAULT 3000 | Duración en ms |
| position | ENUM('top-right','top-left','bottom-right','bottom-left') DEFAULT 'top-right' | Posición |
| updated_at | TIMESTAMP | Última actualización |

### `realtime_notifications_queue`
Cola de notificaciones en tiempo real.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| notification_type | VARCHAR(50) | Tipo de notificación |
| title | VARCHAR(200) | Título |
| message | TEXT | Mensaje |
| data | JSONB | Datos adicionales |
| priority | ENUM('low','normal','high','urgent') DEFAULT 'normal' | Prioridad |
| is_delivered | BOOLEAN DEFAULT FALSE | Entregada |
| delivered_at | TIMESTAMP | Fecha de entrega |
| created_at | TIMESTAMP | Fecha de creación |
| expires_at | TIMESTAMP | Fecha de expiración |

---

## 41. ESTADÍSTICAS DE DASHBOARD

### `dashboard_widgets`
Widgets del dashboard del agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| widget_type | VARCHAR(50) | Tipo de widget |
| title | VARCHAR(100) | Título |
| position_x | INTEGER | Posición X |
| position_y | INTEGER | Posición Y |
| width | INTEGER DEFAULT 1 | Ancho |
| height | INTEGER DEFAULT 1 | Alto |
| config | JSONB | Configuración |
| is_visible | BOOLEAN DEFAULT TRUE | Visible |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### `dashboard_stats_cache`
Caché de estadísticas del dashboard.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| stat_type | VARCHAR(50) | Tipo de estadística |
| stat_value | JSONB | Valor de la estadística |
| period | VARCHAR(20) | Período |
| calculated_at | TIMESTAMP | Fecha de cálculo |
| expires_at | TIMESTAMP | Fecha de expiración |

---

## 42. ACTIVIDAD RECIENTE DEL SISTEMA

### `system_activity_feed`
Feed de actividad del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| activity_type | VARCHAR(50) | Tipo de actividad |
| icon | VARCHAR(50) | Icono |
| color | VARCHAR(20) | Color |
| title | VARCHAR(200) | Título |
| description | TEXT | Descripción |
| entity_type | VARCHAR(50) | Tipo de entidad |
| entity_id | INTEGER | ID de entidad |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente relacionado |
| is_global | BOOLEAN DEFAULT FALSE | Visible para todos |
| created_at | TIMESTAMP | Fecha de actividad |

### `agent_activity_feed_reads`
Lecturas del feed de actividad.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| last_read_activity_id | INTEGER REFERENCES system_activity_feed(id) | Última actividad leída |
| read_at | TIMESTAMP | Fecha de lectura |

---

## 43. DISTRIBUCIÓN POR PRIORIDAD

### `priority_distribution_stats`
Estadísticas de distribución por prioridad.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| date | DATE | Fecha |
| hour | INTEGER | Hora (0-23) |
| urgent_count | INTEGER DEFAULT 0 | Tickets urgentes |
| high_count | INTEGER DEFAULT 0 | Tickets alta prioridad |
| medium_count | INTEGER DEFAULT 0 | Tickets media prioridad |
| low_count | INTEGER DEFAULT 0 | Tickets baja prioridad |
| created_at | TIMESTAMP | Fecha de registro |

---

## 44. CONFIGURACIÓN DE AUTO-REFRESH

### `agent_auto_refresh_settings`
Configuración de auto-refresh del agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) UNIQUE | Agente |
| is_enabled | BOOLEAN DEFAULT TRUE | Activo |
| interval_seconds | INTEGER DEFAULT 60 | Intervalo en segundos |
| refresh_tickets | BOOLEAN DEFAULT TRUE | Refrescar tickets |
| refresh_chats | BOOLEAN DEFAULT TRUE | Refrescar chats |
| refresh_queue | BOOLEAN DEFAULT TRUE | Refrescar cola |
| refresh_stats | BOOLEAN DEFAULT TRUE | Refrescar estadísticas |
| last_refresh_at | TIMESTAMP | Último refresh |
| updated_at | TIMESTAMP | Última actualización |

---

## 45. INFORMACIÓN DE USUARIO EN TICKETS

### `ticket_user_context`
Contexto del usuario en tickets.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| ticket_id | INTEGER REFERENCES support_tickets(id) UNIQUE | Ticket |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| user_balance | DECIMAL(15,2) | Balance al momento |
| user_demo_balance | DECIMAL(15,2) | Balance demo |
| user_total_deposits | DECIMAL(15,2) | Total depósitos |
| user_total_withdrawals | DECIMAL(15,2) | Total retiros |
| user_status | VARCHAR(20) | Estado del usuario |
| user_verified | BOOLEAN | Verificado |
| user_risk_level | VARCHAR(20) | Nivel de riesgo |
| user_ticket_count | INTEGER | Número de tickets |
| user_avg_rating | DECIMAL(3,2) | Calificación promedio |
| captured_at | TIMESTAMP | Fecha de captura |

### `user_recent_activity_snapshot`
Snapshot de actividad reciente del usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| ticket_id | INTEGER REFERENCES support_tickets(id) | Ticket |
| user_id | INTEGER REFERENCES users(id) | Usuario |
| activity_type | VARCHAR(50) | Tipo de actividad |
| activity_details | TEXT | Detalles |
| activity_timestamp | TIMESTAMP | Fecha de actividad |
| created_at | TIMESTAMP | Fecha de captura |

---

## 46. TABS Y NAVEGACIÓN

### `agent_tab_preferences`
Preferencias de tabs del agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) UNIQUE | Agente |
| default_view | VARCHAR(50) DEFAULT 'dashboard' | Vista por defecto |
| ticket_default_tab | VARCHAR(50) DEFAULT 'conversation' | Tab por defecto en tickets |
| user_default_tab | VARCHAR(50) DEFAULT 'info' | Tab por defecto en usuarios |
| settings_default_tab | VARCHAR(50) DEFAULT 'profile' | Tab por defecto en settings |
| sidebar_collapsed | BOOLEAN DEFAULT FALSE | Sidebar colapsado |
| updated_at | TIMESTAMP | Última actualización |

### `agent_recent_views`
Vistas recientes del agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| view_type | VARCHAR(50) | Tipo de vista |
| entity_type | VARCHAR(50) | Tipo de entidad |
| entity_id | INTEGER | ID de entidad |
| entity_name | VARCHAR(200) | Nombre de entidad |
| viewed_at | TIMESTAMP | Fecha de vista |

---

## 47. CONVERSIÓN DE CHAT A TICKET

### `chat_to_ticket_conversions`
Conversiones de chat a ticket.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| chat_session_id | INTEGER REFERENCES live_chat_sessions(id) | Sesión de chat |
| ticket_id | INTEGER REFERENCES support_tickets(id) | Ticket creado |
| converted_by | INTEGER REFERENCES support_agents(id) | Convertido por |
| reason | TEXT | Razón de conversión |
| messages_transferred | INTEGER | Mensajes transferidos |
| created_at | TIMESTAMP | Fecha de conversión |

---

## 48. SOLICITUDES DE CALIFICACIÓN

### `rating_request_templates`
Plantillas de solicitud de calificación.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(100) | Nombre |
| message | TEXT | Mensaje de solicitud |
| language | VARCHAR(5) DEFAULT 'es' | Idioma |
| is_default | BOOLEAN DEFAULT FALSE | Por defecto |
| is_active | BOOLEAN DEFAULT TRUE | Activa |
| created_at | TIMESTAMP | Fecha de creación |

### `rating_request_log`
Log de solicitudes de calificación.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| ticket_id | INTEGER REFERENCES support_tickets(id) | Ticket |
| chat_session_id | INTEGER REFERENCES live_chat_sessions(id) | Chat |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| template_id | INTEGER REFERENCES rating_request_templates(id) | Plantilla usada |
| sent_at | TIMESTAMP | Fecha de envío |
| responded | BOOLEAN DEFAULT FALSE | Respondida |
| responded_at | TIMESTAMP | Fecha de respuesta |
| rating_received | INTEGER | Calificación recibida |

---

## 49. DETECCIÓN DE IDIOMA AUTOMÁTICA

### `language_detection_settings`
Configuración de detección de idioma.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| is_enabled | BOOLEAN DEFAULT TRUE | Activa |
| min_confidence | DECIMAL(5,4) DEFAULT 0.7 | Confianza mínima |
| supported_languages | JSONB | Idiomas soportados |
| fallback_language | VARCHAR(5) DEFAULT 'es' | Idioma por defecto |
| auto_translate | BOOLEAN DEFAULT FALSE | Auto-traducir |
| updated_at | TIMESTAMP | Última actualización |

### `language_keywords`
Palabras clave por idioma para detección.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| language | VARCHAR(5) | Idioma |
| keywords | JSONB | Palabras clave |
| weight | DECIMAL(3,2) DEFAULT 1.0 | Peso |
| created_at | TIMESTAMP | Fecha de creación |

---

## 50. GRÁFICOS Y REPORTES VISUALES

### `chart_configurations`
Configuraciones de gráficos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| chart_type | ENUM('line','bar','doughnut','pie','area') | Tipo de gráfico |
| chart_name | VARCHAR(100) | Nombre |
| data_source | VARCHAR(50) | Fuente de datos |
| config | JSONB | Configuración del gráfico |
| is_favorite | BOOLEAN DEFAULT FALSE | Favorito |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### `report_chart_data`
Datos de gráficos para reportes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| report_id | INTEGER REFERENCES support_reports(id) | Reporte |
| chart_type | VARCHAR(50) | Tipo de gráfico |
| labels | JSONB | Etiquetas |
| datasets | JSONB | Conjuntos de datos |
| options | JSONB | Opciones del gráfico |
| created_at | TIMESTAMP | Fecha de creación |

---

## 34. DUPLICACIÓN DE CONTENIDO

### `content_duplications`
Historial de duplicaciones de contenido.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| content_type | ENUM('faq','template','article') | Tipo de contenido |
| original_id | INTEGER | ID original |
| duplicate_id | INTEGER | ID de la copia |
| duplicated_by | INTEGER REFERENCES support_agents(id) | Duplicado por |
| created_at | TIMESTAMP | Fecha de duplicación |

---

## 35. ACCIONES RÁPIDAS

### `quick_actions`
Acciones rápidas configurables.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| name | VARCHAR(100) | Nombre de la acción |
| icon | VARCHAR(50) | Icono |
| action_type | ENUM('navigate','execute','open_modal') | Tipo de acción |
| action_value | VARCHAR(200) | Valor de la acción |
| display_order | INTEGER | Orden de visualización |
| is_active | BOOLEAN DEFAULT TRUE | Activa |
| created_at | TIMESTAMP | Fecha de creación |

### `agent_quick_actions`
Acciones rápidas personalizadas por agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| action_id | INTEGER REFERENCES quick_actions(id) | Acción |
| is_visible | BOOLEAN DEFAULT TRUE | Visible |
| display_order | INTEGER | Orden personalizado |
| created_at | TIMESTAMP | Fecha de configuración |

---

## 36. HISTORIAL DE COPIAS AL PORTAPAPELES

### `clipboard_history`
Historial de copias al portapapeles.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| content_type | ENUM('ticket_link','chat_transcript','faq_answer','template','article') | Tipo |
| content_id | INTEGER | ID del contenido |
| content_preview | TEXT | Vista previa del contenido |
| copied_at | TIMESTAMP | Fecha de copia |

---

## 37. FILTROS GUARDADOS

### `saved_filters`
Filtros guardados por el agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| name | VARCHAR(100) | Nombre del filtro |
| filter_type | ENUM('tickets','users','chats','queue') | Tipo de filtro |
| filters | JSONB | Configuración de filtros |
| is_default | BOOLEAN DEFAULT FALSE | Filtro por defecto |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

---

## 38. ORDENAMIENTO PERSONALIZADO

### `custom_sort_preferences`
Preferencias de ordenamiento por agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| view_type | ENUM('tickets','users','faqs','templates','knowledge','queue') | Vista |
| sort_field | VARCHAR(50) | Campo de ordenamiento |
| sort_direction | ENUM('asc','desc') | Dirección |
| updated_at | TIMESTAMP | Última actualización |

---

## 39. VISTAS PERSONALIZADAS

### `custom_views`
Vistas personalizadas del agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| view_type | ENUM('templates','knowledge','faqs') | Tipo de vista |
| view_mode | ENUM('grid','list','compact') | Modo de visualización |
| columns_visible | JSONB | Columnas visibles |
| updated_at | TIMESTAMP | Última actualización |

---

## 40. ACTIVIDAD RECIENTE DEL SISTEMA

### `system_activity_feed`
Feed de actividad reciente del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| activity_type | ENUM('ticket_resolved','ticket_escalated','chat_started','rating_received','collaborator_added','sla_breach') | Tipo |
| title | VARCHAR(200) | Título |
| description | TEXT | Descripción |
| icon | VARCHAR(50) | Icono |
| color | VARCHAR(20) | Color |
| related_type | VARCHAR(50) | Tipo de entidad relacionada |
| related_id | INTEGER | ID de entidad relacionada |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente relacionado |
| created_at | TIMESTAMP | Fecha de actividad |

---

## 41. ESTADÍSTICAS DE DASHBOARD

### `dashboard_stats_cache`
Caché de estadísticas del dashboard.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| stat_type | VARCHAR(50) | Tipo de estadística |
| stat_value | DECIMAL(18,4) | Valor |
| period | ENUM('today','week','month') | Período |
| calculated_at | TIMESTAMP | Fecha de cálculo |
| expires_at | TIMESTAMP | Fecha de expiración |

### `dashboard_widgets`
Widgets del dashboard del agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| widget_type | VARCHAR(50) | Tipo de widget |
| position | INTEGER | Posición |
| size | ENUM('small','medium','large') | Tamaño |
| config | JSONB | Configuración |
| is_visible | BOOLEAN DEFAULT TRUE | Visible |
| created_at | TIMESTAMP | Fecha de creación |

---

## 42. COMPARACIÓN DE REPORTES

### `report_comparisons`
Comparaciones de reportes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| report_type | VARCHAR(50) | Tipo de reporte |
| period_1_start | DATE | Inicio período 1 |
| period_1_end | DATE | Fin período 1 |
| period_2_start | DATE | Inicio período 2 |
| period_2_end | DATE | Fin período 2 |
| comparison_data | JSONB | Datos de comparación |
| created_at | TIMESTAMP | Fecha de creación |

---

## 43. CONTACTOS INTERNOS

### `internal_contacts`
Contactos internos del agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| contact_id | INTEGER | ID del contacto |
| contact_type | ENUM('support','operator','admin') | Tipo de contacto |
| contact_name | VARCHAR(100) | Nombre |
| is_favorite | BOOLEAN DEFAULT FALSE | Favorito |
| last_message_at | TIMESTAMP | Último mensaje |
| unread_count | INTEGER DEFAULT 0 | Mensajes no leídos |
| created_at | TIMESTAMP | Fecha de creación |

### `direct_messages`
Mensajes directos entre agentes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| sender_id | INTEGER REFERENCES support_agents(id) | Remitente |
| receiver_id | INTEGER | Receptor |
| receiver_type | ENUM('support','operator','admin') | Tipo de receptor |
| message | TEXT | Contenido del mensaje |
| is_read | BOOLEAN DEFAULT FALSE | Leído |
| read_at | TIMESTAMP | Fecha de lectura |
| created_at | TIMESTAMP | Fecha de envío |

---

## 44. EMOJIS Y REACCIONES

### `emoji_usage`
Uso de emojis por agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| emoji | VARCHAR(10) | Emoji |
| usage_count | INTEGER DEFAULT 1 | Veces usado |
| last_used_at | TIMESTAMP | Último uso |

### `message_reactions`
Reacciones a mensajes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| message_id | INTEGER | ID del mensaje |
| message_type | ENUM('internal','ticket','chat') | Tipo de mensaje |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| reaction | VARCHAR(10) | Reacción (emoji) |
| created_at | TIMESTAMP | Fecha de reacción |

---

## 45. AUTO-REFRESH Y SINCRONIZACIÓN

### `auto_refresh_settings`
Configuración de auto-refresh por agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) UNIQUE | Agente |
| is_enabled | BOOLEAN DEFAULT TRUE | Habilitado |
| interval_seconds | INTEGER DEFAULT 60 | Intervalo en segundos |
| views_enabled | JSONB | Vistas con auto-refresh |
| updated_at | TIMESTAMP | Última actualización |

### `last_sync_timestamps`
Timestamps de última sincronización.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| sync_type | VARCHAR(50) | Tipo de sincronización |
| last_sync_at | TIMESTAMP | Última sincronización |
| next_sync_at | TIMESTAMP | Próxima sincronización |

---

## 46. PRUEBA DE PLANTILLAS

### `template_test_history`
Historial de pruebas de plantillas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| template_id | INTEGER REFERENCES support_templates(id) | Plantilla |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| variables_used | JSONB | Variables usadas |
| rendered_content | TEXT | Contenido renderizado |
| tested_at | TIMESTAMP | Fecha de prueba |

---

## 47. COMPARTIR ARTÍCULOS

### `article_shares`
Historial de artículos compartidos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| article_id | INTEGER REFERENCES knowledge_articles(id) | Artículo |
| shared_by | INTEGER REFERENCES support_agents(id) | Compartido por |
| shared_to | VARCHAR(50) | Compartido a (ticket/chat/email) |
| shared_to_id | INTEGER | ID del destino |
| shared_at | TIMESTAMP | Fecha de compartir |

---

## 48. TIEMPO EN LÍNEA

### `agent_online_sessions`
Sesiones en línea del agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| started_at | TIMESTAMP | Inicio de sesión |
| ended_at | TIMESTAMP | Fin de sesión |
| duration_minutes | INTEGER | Duración en minutos |
| status_changes | JSONB | Cambios de estado durante la sesión |

### `agent_time_tracking`
Seguimiento de tiempo del agente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL PRIMARY KEY | ID único |
| agent_id | INTEGER REFERENCES support_agents(id) | Agente |
| date | DATE | Fecha |
| total_online_minutes | INTEGER DEFAULT 0 | Minutos en línea |
| total_available_minutes | INTEGER DEFAULT 0 | Minutos disponible |
| total_busy_minutes | INTEGER DEFAULT 0 | Minutos ocupado |
| total_away_minutes | INTEGER DEFAULT 0 | Minutos ausente |
| total_dnd_minutes | INTEGER DEFAULT 0 | Minutos no molestar |
| tickets_handled | INTEGER DEFAULT 0 | Tickets manejados |
| chats_handled | INTEGER DEFAULT 0 | Chats manejados |
| created_at | TIMESTAMP | Fecha de registro |

---

## RESUMEN ACTUALIZADO DE TABLAS

| Sección | Número de Tablas |
|---------|------------------|
| 1-30. Secciones anteriores | 86 |
| 31. Indicador de Escritura | 1 |
| 32. Mensajes Anclados | 2 |
| 33. Importación de Datos | 1 |
| 34. Duplicación de Contenido | 1 |
| 35. Acciones Rápidas | 2 |
| 36. Historial de Copias | 1 |
| 37. Filtros Guardados | 1 |
| 38. Ordenamiento Personalizado | 1 |
| 39. Vistas Personalizadas | 1 |
| 40. Actividad Reciente | 1 |
| 41. Estadísticas de Dashboard | 2 |
| 42. Comparación de Reportes | 1 |
| 43. Contactos Internos | 2 |
| 44. Emojis y Reacciones | 2 |
| 45. Auto-Refresh | 2 |
| 46. Prueba de Plantillas | 1 |
| 47. Compartir Artículos | 1 |
| 48. Tiempo en Línea | 2 |
| **TOTAL** | **111 tablas** |
