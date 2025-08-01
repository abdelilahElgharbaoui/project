-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  department VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  capacity INTEGER NOT NULL,
  floor INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available',
  equipment TEXT[],
  last_maintenance DATE,
  next_maintenance DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  scenario VARCHAR(100),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create stock table
CREATE TABLE IF NOT EXISTS stock (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit VARCHAR(20) NOT NULL,
  min_threshold INTEGER DEFAULT 10,
  supplier VARCHAR(100),
  last_restocked DATE,
  expiry_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create maintenance table
CREATE TABLE IF NOT EXISTS maintenance (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  status VARCHAR(20) DEFAULT 'scheduled',
  assigned_to INTEGER REFERENCES users(id),
  cost DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password, first_name, last_name, role, department) 
VALUES (
  'admin@hospital.com', 
  '$2b$12$QOROO2D7eWeCKZy7nBVrPO6grbF3FVh6DgsjGIGK3ty8jYd4KZtxu', -- admin123
  'Admin',
  'Système',
  'admin',
  'Administration'
) ON CONFLICT (email) DO NOTHING;

-- Insert default user (password: user123)
INSERT INTO users (email, password, first_name, last_name, role, department) 
VALUES (
  'user@hospital.com', 
  '$2b$12$Xa6nOCFz2RQ0iW.Dkz/9z.LUOFA.sLmOqxZqGqonTOUVx7kD4NFbW', -- user123
  'Utilisateur',
  'Test',
  'user',
  'Médecine'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample rooms
INSERT INTO rooms (name, type, capacity, floor, status, equipment, last_maintenance, next_maintenance) VALUES
('Salle 101', 'consultation', 4, 1, 'available', ARRAY['Lit médical', 'Moniteur cardiaque', 'Sphygmomanomètre'], '2024-01-15', '2024-04-15'),
('Salle 102', 'surgery', 6, 1, 'available', ARRAY['Table d''opération', 'Lampe chirurgicale', 'Écran de monitoring'], '2024-01-20', '2024-04-20'),
('Salle 201', 'emergency', 8, 2, 'available', ARRAY['Défibrillateur', 'Respirateur', 'Moniteur multi-paramètres'], '2024-01-10', '2024-04-10'),
('Salle 202', 'meeting', 12, 2, 'available', ARRAY['Projecteur', 'Table de conférence', 'Système audio'], '2024-01-25', '2024-04-25'),
('Salle 301', 'imaging', 3, 3, 'maintenance', ARRAY['Scanner CT', 'Écran de contrôle', 'Table d''examen'], '2024-01-05', '2024-04-05')
ON CONFLICT DO NOTHING;

-- Insert sample stock items
INSERT INTO stock (name, category, quantity, unit, min_threshold, supplier, last_restocked, expiry_date) VALUES
('Gants latex', 'Protection', 500, 'paires', 100, 'MedSupply Co.', '2024-01-20', '2025-01-20'),
('Seringues 10ml', 'Injection', 200, 'unités', 50, 'MedSupply Co.', '2024-01-18', '2026-01-18'),
('Pansements', 'Soins', 300, 'unités', 75, 'HealthCare Ltd.', '2024-01-22', '2025-06-22'),
('Antibiotiques', 'Médicaments', 150, 'boîtes', 30, 'PharmaCorp', '2024-01-15', '2024-12-15'),
('Sérum physiologique', 'Fluides', 100, 'bouteilles', 25, 'MedSupply Co.', '2024-01-19', '2024-08-19')
ON CONFLICT DO NOTHING; 