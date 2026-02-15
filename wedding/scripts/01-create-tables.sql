-- Create guests table to store guest information and passwords
CREATE TABLE IF NOT EXISTS guests (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  invited_to_rehearsal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create rsvps table to store RSVP responses
CREATE TABLE IF NOT EXISTS rsvps (
  id SERIAL PRIMARY KEY,
  guest_id INTEGER REFERENCES guests(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  attendance VARCHAR(10) CHECK (attendance IN ('yes', 'no')),
  guest_count INTEGER DEFAULT 1,
  dietary_restrictions TEXT,
  song_request VARCHAR(255),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create rehearsal_dinner_rsvps table for rehearsal dinner responses
CREATE TABLE IF NOT EXISTS rehearsal_dinner_rsvps (
  id SERIAL PRIMARY KEY,
  guest_id INTEGER REFERENCES guests(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  attendance VARCHAR(10) CHECK (attendance IN ('yes', 'no')),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);
CREATE INDEX IF NOT EXISTS idx_rsvps_guest_id ON rsvps(guest_id);
CREATE INDEX IF NOT EXISTS idx_rehearsal_rsvps_guest_id ON rehearsal_dinner_rsvps(guest_id);
