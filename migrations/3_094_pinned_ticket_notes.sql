-- Notas ancladas en tickets
CREATE TABLE IF NOT EXISTS pinned_ticket_notes (
    id SERIAL PRIMARY KEY,
    note_id INTEGER REFERENCES ticket_internal_notes(id) ON DELETE CASCADE,
    ticket_id INTEGER REFERENCES support_tickets(id),
    pinned_by INTEGER REFERENCES support_agents(id),
    pinned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pinned_ticket_notes_ticket_id ON pinned_ticket_notes(ticket_id);
