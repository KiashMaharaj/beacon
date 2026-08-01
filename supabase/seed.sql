-- Beacon: optional seed data for a populated demo environment.
-- Run against a Supabase project AFTER creating a demo auth user and
-- replacing the reporter_id below with that user's uuid.
-- (The app also ships with in-memory demo data for zero-config exploration.)

-- Example (uncomment and set a real reporter uuid):
-- insert into public.pet_reports (reporter_id, kind, status, name, species, breed, colour, age, size, description, photo_url, last_seen_at, last_seen_lat, last_seen_lng, location_label, alert_radius_km, contact_pref)
-- values
--   ('00000000-0000-0000-0000-000000000000', 'missing', 'active', 'Biscuit', 'dog', 'Golden Retriever', 'Golden', '3 years', 'large', 'Very friendly, responds to his name, wearing a blue collar.', null, now() - interval '6 hours', 51.5074, -0.1278, 'Riverside Park', 3, 'in_app');
