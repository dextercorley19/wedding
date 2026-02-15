-- Insert development guest with password "wedding2025" for testing
INSERT INTO guests (name, email, password, invited_to_rehearsal) 
VALUES 
  ('Test Guest', 'test@example.com', 'wedding2025', TRUE),
  ('John Smith', 'john@example.com', 'john2025', FALSE),
  ('Jane Doe', 'jane@example.com', 'jane2025', TRUE)
ON CONFLICT (email) DO NOTHING;
