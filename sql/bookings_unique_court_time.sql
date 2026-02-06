-- Verhindert Doppelbuchungen auf Datenbank-Ebene
-- Hinweis: Falls bereits Duplikate existieren, muessen diese vorher bereinigt werden.
ALTER TABLE bookings
ADD CONSTRAINT unique_court_time UNIQUE (court_id, start_time);
