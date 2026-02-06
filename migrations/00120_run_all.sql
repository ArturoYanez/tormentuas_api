-- =====================================================
-- MIGRACIÓN MAESTRA - USUARIO OPERADOR
-- Ejecuta todas las tablas en orden correcto
-- =====================================================

-- Este archivo sirve como referencia del orden de ejecución
-- Las migraciones individuales están en archivos separados

-- ORDEN DE EJECUCIÓN:

-- SECCIÓN 1: OPERADORES Y AUTENTICACIÓN (4 tablas)
-- 001_operators.sql
-- 002_operator_sessions.sql
-- 003_operator_settings.sql
-- 004_operator_work_schedule.sql

-- SECCIÓN 2: PERMISOS Y ROLES (3 tablas)
-- 005_permissions.sql
-- 006_operator_permissions.sql
-- 007_operator_roles.sql

-- SECCIÓN 3: GESTIÓN DE TORNEOS (4 tablas)
-- 008_operator_tournament_actions.sql
-- 009_tournament_operator_assignments.sql
-- 010_participant_disqualifications.sql
-- 011_tournament_manual_additions.sql

-- SECCIÓN 4: GESTIÓN DE USUARIOS (5 tablas)
-- 012_operator_user_notes.sql
-- 013_operator_balance_adjustments.sql
-- 014_user_status_changes.sql
-- 015_user_trading_blocks.sql
-- 016_user_risk_assessments.sql

-- SECCIÓN 5: CONTROL DE OPERACIONES (4 tablas)
-- 017_trade_interventions.sql
-- 018_trade_flags.sql
-- 019_trade_cancellations.sql
-- 020_forced_trade_results.sql

-- SECCIÓN 6: SISTEMA DE ALERTAS (4 tablas)
-- 021_operator_alerts.sql
-- 022_alert_thresholds.sql
-- 023_operator_alert_settings.sql
-- 024_alert_escalations.sql

-- SECCIÓN 7: CONFIGURACIÓN DE ACTIVOS (3 tablas)
-- 025_asset_configurations.sql
-- 026_asset_status_changes.sql
-- 027_payout_adjustments.sql

-- SECCIÓN 8: CHAT INTERNO (6 tablas)
-- 028_team_chat_rooms.sql
-- 029_team_chat_messages.sql
-- 030_team_chat_attachments.sql
-- 031_team_chat_reactions.sql
-- 032_team_chat_read_status.sql
-- 033_team_chat_mentions.sql

-- SECCIÓN 9: LOGS DE ACTIVIDAD (3 tablas)
-- 034_operator_activity_logs.sql
-- 035_operator_login_history.sql
-- 036_operator_action_approvals.sql

-- SECCIÓN 10: MONITOREO EN TIEMPO REAL (4 tablas)
-- 037_live_monitoring_sessions.sql
-- 038_monitored_users.sql
-- 039_real_time_statistics.sql
-- 040_operator_dashboard_widgets.sql

-- SECCIÓN 11: REPORTES (3 tablas)
-- 041_operator_reports.sql
-- 042_operator_scheduled_reports.sql
-- 043_operator_report_exports.sql

-- SECCIÓN 12: SEGURIDAD (5 tablas)
-- 044_operator_trusted_devices.sql
-- 045_operator_security_questions.sql
-- 046_operator_two_factor.sql
-- 047_operator_security_settings.sql
-- 048_operator_password_history.sql

-- SECCIÓN 13: NOTIFICACIONES (2 tablas)
-- 049_operator_notifications.sql
-- 050_operator_notification_preferences.sql

-- SECCIÓN 14: TAREAS Y ASIGNACIONES (3 tablas)
-- 051_operator_tasks.sql
-- 052_operator_task_comments.sql
-- 053_shift_handovers.sql

-- SECCIÓN 15: DETECCIÓN DE FRAUDE (3 tablas)
-- 054_fraud_patterns.sql
-- 055_fraud_detections.sql
-- 056_user_behavior_analysis.sql

-- SECCIÓN 16: ATAJOS DE TECLADO (2 tablas)
-- 057_operator_keyboard_shortcuts.sql
-- 058_default_keyboard_shortcuts.sql

-- SECCIÓN 17: AUDITORÍA (2 tablas)
-- 059_sensitive_action_logs.sql
-- 060_data_access_logs.sql

-- SECCIÓN 18: MÉTRICAS DE RENDIMIENTO (2 tablas)
-- 061_operator_performance_metrics.sql
-- 062_operator_daily_stats.sql

-- SECCIÓN 19: GRÁFICOS Y ESTADÍSTICAS (3 tablas)
-- 063_dashboard_chart_data.sql
-- 064_volume_by_asset.sql
-- 065_operator_quick_actions.sql

-- SECCIÓN 20: FILTROS Y BÚSQUEDAS (2 tablas)
-- 066_saved_filters.sql
-- 067_search_history.sql

-- SECCIÓN 21: SISTEMA E INFORMACIÓN (3 tablas)
-- 068_system_info.sql
-- 069_server_status.sql
-- 070_system_announcements.sql

-- SECCIÓN 22: EXPORTACIÓN Y DESCARGAS (2 tablas)
-- 071_export_templates.sql
-- 072_download_queue.sql

-- SECCIÓN 23: LOGS EN TIEMPO REAL (2 tablas)
-- 073_real_time_operation_logs.sql
-- 074_operation_feed_settings.sql

-- SECCIÓN 24: GESTIÓN AVANZADA DE USUARIOS (3 tablas)
-- 075_user_verification_overrides.sql
-- 076_user_level_overrides.sql
-- 077_user_payout_overrides.sql

-- SECCIÓN 25: COMUNICACIÓN CON USUARIOS (2 tablas)
-- 078_operator_user_messages.sql
-- 079_bulk_messages.sql

-- SECCIÓN 26: CONFIGURACIÓN DE VOLATILIDAD (2 tablas)
-- 080_asset_volatility_settings.sql
-- 081_volatility_alerts.sql

-- SECCIÓN 27: SEGURIDAD ADICIONAL (2 tablas)
-- 082_operator_password_reset_tokens.sql
-- 083_password_change_requests.sql

-- SECCIÓN 28: TORNEOS AVANZADOS (12 tablas)
-- 084_tournament_duplications.sql
-- 085_tournament_prize_configurations.sql
-- 086_tournament_prize_distributions.sql
-- 087_tournament_categories.sql
-- 088_tournament_featured.sql
-- 089_tournament_pauses.sql
-- 090_operations_hourly_stats.sql
-- 091_operations_daily_stats.sql
-- 092_operations_weekly_stats.sql
-- 093_operations_monthly_stats.sql
-- 094_tournament_summary_stats.sql
-- 095_active_users_snapshot.sql

-- SECCIÓN 29: MONITOREO DE USUARIOS (5 tablas)
-- 096_user_online_status.sql
-- 097_alert_rules.sql
-- 098_alert_action_history.sql
-- 099_user_win_streaks.sql
-- 100_trading_patterns.sql

-- SECCIÓN 30: CACHÉ Y RESUMEN (6 tablas)
-- 101_user_summary_cache.sql
-- 102_trade_action_history.sql
-- 103_trading_schedule_overrides.sql
-- 104_investment_limit_overrides.sql
-- 105_tournament_rules_templates.sql
-- 106_tournament_rules_history.sql

-- SECCIÓN 31: CONFIGURACIÓN DE TORNEOS (9 tablas)
-- 107_tournament_initial_balance_config.sql
-- 108_tournament_entry_fee_config.sql
-- 109_tournament_entry_payments.sql
-- 110_tournament_participant_details.sql
-- 111_tournament_participant_trades.sql
-- 112_tournament_dates.sql
-- 113_tournament_date_changes.sql
-- 114_tournament_capacity_config.sql
-- 115_tournament_waitlist.sql

-- SECCIÓN 32: ESTADÍSTICAS DE OPERACIONES (5 tablas)
-- 116_operation_type_stats.sql
-- 117_operation_duration_config.sql
-- 118_operation_duration_stats.sql
-- 119_flag_reasons.sql
-- 120_operation_flag_details.sql

-- SECCIÓN 33: ESTADÍSTICAS DE USUARIOS (5 tablas)
-- 121_user_country_stats.sql
-- 122_user_verification_status.sql
-- 123_user_financial_summary.sql
-- 124_user_login_tracking.sql
-- 125_user_registration_stats.sql

-- SECCIÓN 34: UI Y NAVEGACIÓN (7 tablas)
-- 126_system_toasts.sql
-- 127_operator_navigation_history.sql
-- 128_operator_favorite_views.sql
-- 129_chat_file_uploads.sql
-- 130_chat_typing_status.sql
-- 131_chart_period_preferences.sql
-- 132_auto_refresh_config.sql

-- SECCIÓN 35: PERFIL DEL OPERADOR (3 tablas)
-- 133_operator_avatars.sql
-- 134_operator_profile_changes.sql
-- 135_operator_phone_numbers.sql

-- SECCIÓN 36: SEGUIMIENTO DE USUARIOS (3 tablas)
-- 136_user_demo_balance_tracking.sql
-- 137_user_win_rate_history.sql
-- 138_user_risk_level_history.sql

-- SECCIÓN 37: CONFIGURACIÓN DE RIESGO Y PAYOUT (3 tablas)
-- 139_risk_level_criteria.sql
-- 140_operation_payout_config.sql
-- 141_payout_history.sql

-- SECCIÓN 38: OPERACIONES Y ACTIVOS (5 tablas)
-- 142_operation_times.sql
-- 143_operation_pnl_details.sql
-- 144_asset_categories.sql
-- 145_asset_category_stats.sql
-- 146_asset_details.sql

-- =====================================================
-- TOTAL: 146 tablas para el usuario operador
-- =====================================================
