-- =====================================================
-- MIGRACIÓN MAESTRA - USUARIO CONTADOR
-- Ejecuta todas las tablas en orden correcto
-- =====================================================

-- Este archivo sirve como referencia del orden de ejecución
-- Las migraciones individuales están en archivos separados

-- ORDEN DE EJECUCIÓN:

-- SECCIÓN 1: CONTADORES Y PERSONAL (3 tablas)
-- 001_accountants.sql
-- 002_accountant_permissions.sql
-- 003_accountant_shifts.sql

-- SECCIÓN 2: GESTIÓN DE RETIROS (4 tablas)
-- 004_withdrawal_requests.sql
-- 005_withdrawal_processing_queue.sql
-- 006_withdrawal_approvals.sql
-- 007_withdrawal_limits.sql

-- SECCIÓN 3: GESTIÓN DE DEPÓSITOS (3 tablas)
-- 008_deposit_requests.sql
-- 009_deposit_confirmations.sql
-- 010_deposit_addresses.sql

-- SECCIÓN 4: PREMIOS DE TORNEOS (2 tablas)
-- 011_tournament_prizes.sql
-- 012_prize_payments.sql

-- SECCIÓN 5: USUARIOS FINANCIEROS (4 tablas)
-- 013_user_financial_profiles.sql
-- 014_user_balance_adjustments.sql
-- 015_user_financial_transactions.sql
-- 016_user_financial_suspensions.sql

-- SECCIÓN 6: COMISIONES (4 tablas)
-- 017_commission_types.sql
-- 018_commissions.sql
-- 019_commission_reports.sql
-- 020_commission_distributions.sql

-- SECCIÓN 7: FACTURACIÓN (5 tablas)
-- 021_invoices.sql
-- 022_invoice_line_items.sql
-- 023_invoice_reminders.sql
-- 024_invoice_payments.sql
-- 025_vendors.sql

-- SECCIÓN 8: CONCILIACIÓN BANCARIA (5 tablas)
-- 026_reconciliations.sql
-- 027_reconciliation_items.sql
-- 028_reconciliation_discrepancies.sql
-- 029_bank_statements.sql
-- 030_bank_transactions.sql

-- SECCIÓN 9: REPORTES FINANCIEROS (5 tablas)
-- 031_financial_reports.sql
-- 032_daily_financial_summaries.sql
-- 033_weekly_financial_summaries.sql
-- 034_monthly_financial_summaries.sql
-- 035_report_exports.sql

-- SECCIÓN 10: AUDITORÍA FINANCIERA (4 tablas)
-- 036_audit_logs.sql
-- 037_audit_trails.sql
-- 038_audit_reviews.sql
-- 039_compliance_checks.sql

-- SECCIÓN 11: ALERTAS SOSPECHOSAS (4 tablas)
-- 040_suspicious_alerts.sql
-- 041_suspicious_patterns.sql
-- 042_user_risk_profiles.sql
-- 043_fraud_investigations.sql

-- SECCIÓN 12: CHAT INTERNO (4 tablas)
-- 044_internal_chat_messages.sql
-- 045_internal_chat_contacts.sql
-- 046_internal_chat_groups.sql
-- 047_internal_chat_group_members.sql

-- SECCIÓN 13: CONFIGURACIÓN DEL CONTADOR (3 tablas)
-- 048_accountant_settings.sql
-- 049_accountant_notification_settings.sql
-- 050_accountant_approval_limits.sql

-- SECCIÓN 14: SEGURIDAD DEL CONTADOR (6 tablas)
-- 051_accountant_sessions.sql
-- 052_accountant_login_history.sql
-- 053_accountant_trusted_devices.sql
-- 054_accountant_two_factor.sql
-- 055_accountant_security_questions.sql
-- 056_accountant_activity_logs.sql

-- SECCIÓN 15: MÉTRICAS Y ESTADÍSTICAS (4 tablas)
-- 057_platform_metrics.sql
-- 058_financial_kpis.sql
-- 059_transaction_statistics.sql
-- 060_user_statistics.sql

-- SECCIÓN 16: EXPORTACIONES (2 tablas)
-- 061_data_exports.sql
-- 062_scheduled_exports.sql

-- SECCIÓN 17: PROVEEDORES DE PAGO (3 tablas)
-- 063_payment_providers.sql
-- 064_payment_provider_transactions.sql
-- 065_payment_provider_balances.sql

-- SECCIÓN 18: GASTOS OPERATIVOS (3 tablas)
-- 066_operating_expenses.sql
-- 067_expense_categories.sql
-- 068_expense_budgets.sql

-- SECCIÓN 19: CUENTAS BANCARIAS (2 tablas)
-- 069_bank_accounts.sql
-- 070_bank_account_movements.sql

-- SECCIÓN 20: NOTIFICACIONES (2 tablas)
-- 071_accountant_notifications.sql
-- 072_notification_templates.sql

-- SECCIÓN 21: PERFIL DEL CONTADOR (2 tablas)
-- 073_accountant_profiles.sql
-- 074_accountant_certifications.sql

-- SECCIÓN 22: TAREAS Y WORKFLOW (4 tablas)
-- 075_accountant_tasks.sql
-- 076_approval_workflows.sql
-- 077_approval_requests.sql
-- 078_approval_steps.sql

-- SECCIÓN 23: REPORTES PERSONALIZADOS (3 tablas)
-- 079_custom_reports.sql
-- 080_report_templates.sql
-- 081_report_schedules.sql

-- SECCIÓN 24: FLUJO DE CAJA (2 tablas)
-- 082_cash_flow_records.sql
-- 083_cash_flow_projections.sql

-- SECCIÓN 25: ARCHIVOS COMPARTIDOS (2 tablas)
-- 084_chat_attachments.sql
-- 085_chat_shared_files.sql

-- SECCIÓN 26: BLOQUEOS Y RESTRICCIONES (2 tablas)
-- 086_user_blocks.sql
-- 087_financial_restrictions.sql

-- SECCIÓN 27: IMPUESTOS Y RETENCIONES (3 tablas)
-- 088_tax_configurations.sql
-- 089_tax_withholdings.sql
-- 090_tax_reports.sql

-- SECCIÓN 28: MONEDAS Y TIPOS DE CAMBIO (3 tablas)
-- 091_currencies.sql
-- 092_exchange_rates.sql
-- 093_exchange_rate_history.sql

-- SECCIÓN 29: LÍMITES Y UMBRALES (2 tablas)
-- 094_transaction_limits.sql
-- 095_threshold_alerts.sql

-- SECCIÓN 30: NOTIFICACIONES SILENCIADAS (1 tabla)
-- 096_muted_notifications.sql

-- =====================================================
-- TOTAL: 96 tablas para el usuario contador
-- =====================================================
