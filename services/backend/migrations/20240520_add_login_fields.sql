-- Agregar campos para RQ-001 y RF-005
ALTER TABLE users 
ADD COLUMN failed_login_attempts INT DEFAULT 0,
ADD COLUMN account_locked BOOLEAN DEFAULT FALSE,
ADD COLUMN last_failed_login TIMESTAMP;

-- Crear tabla para CAPTCHA (RF-004)
CREATE TABLE login_challenges (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  captcha_token VARCHAR(100) NOT NULL,
  solved BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL
);
