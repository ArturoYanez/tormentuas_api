# Reporte de Errores Solucionados en Migraciones

Este documento detalla los errores encontrados y corregidos en los archivos de la carpeta `migrations`.

---

## Error 1: Referencias a tablas inexistentes en 005_support_agent_tables.sql

**Error encontrado:** La migración `005_support_agent_tables.sql` realizaba operaciones sobre las tablas `faq_articles` y `faq_categories` sin verificar si existían. Esto provocaba fallos cuando la migración se ejecutaba en un orden donde dichas tablas aún no habían sido creadas (por ejemplo, en flujos donde 005 se ejecuta antes de 008 o 027).

**Archivo afectado:** `migrations/005_support_agent_tables.sql`

### Versión anterior:

```sql
-- Agregar columna is_published a faq_articles si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'faq_articles' AND column_name = 'is_published') THEN
        ALTER TABLE faq_articles ADD COLUMN is_published BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Insertar algunas plantillas de ejemplo
INSERT INTO support_templates (name, shortcut, category, content, variables) VALUES
...
ON CONFLICT DO NOTHING;

-- Insertar algunas categorías de FAQ si no existen
INSERT INTO faq_categories (name, slug, description) VALUES
...
ON CONFLICT DO NOTHING;

-- Insertar algunas FAQs de ejemplo
INSERT INTO faq_articles (category_id, title, slug, content, is_published) VALUES
...
ON CONFLICT DO NOTHING;
```

### Código solucionado:

```sql
-- Agregar columna is_published a faq_articles si la tabla existe y la columna no existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'faq_articles')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'faq_articles' AND column_name = 'is_published') THEN
        ALTER TABLE faq_articles ADD COLUMN is_published BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Insertar plantillas de ejemplo usando INSERT...SELECT con WHERE NOT EXISTS (evita duplicados sin ON CONFLICT)
INSERT INTO support_templates (name, shortcut, category, content, variables)
SELECT * FROM (VALUES (...)) AS v(name, shortcut, category, content, variables)
WHERE NOT EXISTS (SELECT 1 FROM support_templates WHERE shortcut = v.shortcut);

-- Insertar categorías y FAQs solo si las tablas existen
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'faq_categories') THEN
        INSERT INTO faq_categories ...
        WHERE NOT EXISTS (SELECT 1 FROM faq_categories WHERE slug = v.slug);
    END IF;
    IF EXISTS (... faq_articles ...) AND EXISTS (... faq_categories ...) THEN
        INSERT INTO faq_articles ...
        WHERE NOT EXISTS (SELECT 1 FROM faq_articles WHERE slug = v.slug);
    END IF;
END $$;
```

**Resumen:** Se añadieron comprobaciones de existencia de tablas antes de cualquier operación sobre `faq_articles` y `faq_categories`, y se reemplazaron los `INSERT ... ON CONFLICT DO NOTHING` por `INSERT ... SELECT` con `WHERE NOT EXISTS` para evitar duplicados sin depender de restricciones únicas.

---

## Error 2: Creación de índices sin IF NOT EXISTS en 027_faq_categories.sql

**Error encontrado:** El índice se creaba con `CREATE INDEX` sin `IF NOT EXISTS`, lo que provocaba un error al ejecutar la migración más de una vez si el índice ya existía.

**Archivo afectado:** `migrations/027_faq_categories.sql`

### Versión anterior:

```sql
CREATE INDEX idx_faq_categories_slug ON faq_categories(slug);
```

### Código solucionado:

```sql
CREATE INDEX IF NOT EXISTS idx_faq_categories_slug ON faq_categories(slug);
```

---

## Error 3: Creación de índices sin IF NOT EXISTS en 026_faqs.sql

**Error encontrado:** Los índices se creaban sin `IF NOT EXISTS`, provocando errores en ejecuciones repetidas de la migración.

**Archivo afectado:** `migrations/026_faqs.sql`

### Versión anterior:

```sql
CREATE INDEX idx_faqs_category ON faqs(category);
CREATE INDEX idx_faqs_is_published ON faqs(is_published);
```

### Código solucionado:

```sql
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_is_published ON faqs(is_published);
```

---

## Error 4: Creación de índice sin IF NOT EXISTS en 028_faq_feedback.sql

**Error encontrado:** El índice se creaba sin `IF NOT EXISTS`, provocando errores en ejecuciones repetidas.

**Archivo afectado:** `migrations/028_faq_feedback.sql`

### Versión anterior:

```sql
CREATE INDEX idx_faq_feedback_faq_id ON faq_feedback(faq_id);
```

### Código solucionado:

```sql
CREATE INDEX IF NOT EXISTS idx_faq_feedback_faq_id ON faq_feedback(faq_id);
```

---

## Resumen de correcciones

| Archivo | Tipo de error | Solución |
|---------|---------------|----------|
| 005_support_agent_tables.sql | Referencias a tablas inexistentes | Comprobación de existencia de tablas y uso de INSERT...SELECT con WHERE NOT EXISTS |
| 027_faq_categories.sql | Índice sin IF NOT EXISTS | Añadido IF NOT EXISTS |
| 026_faqs.sql | Índices sin IF NOT EXISTS | Añadido IF NOT EXISTS |
| 028_faq_feedback.sql | Índice sin IF NOT EXISTS | Añadido IF NOT EXISTS |

---

*Documento generado automáticamente durante la revisión de migraciones.*
