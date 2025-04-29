-- TABLA DE ROLES (con SERIAL)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE, -- ADMIN, STAFF, PARENT
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLA DE USUARIOS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    rut VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    role_id INTEGER NOT NULL REFERENCES roles(id),
    is_active BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0, 
    account_locked BOOLEAN DEFAULT FALSE,   
    last_failed_login TIMESTAMP,             
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLA DE ORGANIZACIONES (Colegios)
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLA DE ESTUDIANTES
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    rut VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    birth_date DATE,
    grade VARCHAR(10),
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    parent_id INTEGER NOT NULL REFERENCES users(id), -- Apoderado principal
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLA DE MOTIVOS DE RETIRO
CREATE TABLE withdrawal_reasons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    requires_contact_verification BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLA DE AUTORIZACIONES QR
CREATE TABLE qr_authorizations (
    id SERIAL PRIMARY KEY,
    code VARCHAR(255) UNIQUE NOT NULL,
    student_id INTEGER NOT NULL REFERENCES students(id),
    generated_by INTEGER NOT NULL REFERENCES users(id),
    reason_id INTEGER NOT NULL REFERENCES withdrawal_reasons(id),
    expires_at TIMESTAMP NOT NULL, -- Validez de 8 horas
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLA DE RETIROS
CREATE TABLE withdrawals (
    id SERIAL PRIMARY KEY,
    qr_authorization_id INTEGER REFERENCES qr_authorizations(id), -- NULL para manual
    student_id INTEGER NOT NULL REFERENCES students(id),
    processed_by INTEGER NOT NULL REFERENCES users(id), -- Inspector que validó
    reason_id INTEGER NOT NULL REFERENCES withdrawal_reasons(id),
    method VARCHAR(10) NOT NULL CHECK (method IN ('QR', 'MANUAL')),
    contact_verified BOOLEAN DEFAULT FALSE, -- Para retiros manuales
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLA DE CONTACTOS DE EMERGENCIA
CREATE TABLE emergency_contacts (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    relationship VARCHAR(50) NOT NULL, -- "Tío", "Vecino", etc.
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_parent ON students(parent_id);
CREATE INDEX idx_qr_expiration ON qr_authorizations(expires_at) WHERE is_used = false;
CREATE INDEX idx_qr_code ON qr_authorizations(code);
CREATE INDEX idx_student_org ON students(organization_id);
CREATE INDEX idx_withdrawal_date ON withdrawals(created_at);

-- FUNCIÓN PARA GENERAR UN CÓDGIO QR SEGURO CON ID ESTUDIANTE Y TIMESTAMP
CREATE OR REPLACE FUNCTION generate_secure_qr(
    p_student_id INT,
    p_generated_by INT,
    p_reason_id INT
) RETURNS VARCHAR(255) AS $$
DECLARE
    v_code VARCHAR(255);
BEGIN
    -- Genera un código único con prefijo escolar y timestamp
    v_code := 'SCH-' || p_student_id || '-' || 
              encode(gen_random_bytes(6), 'hex') || 
              EXTRACT(EPOCH FROM NOW())::INT;
    
    INSERT INTO qr_authorizations (
        code, student_id, generated_by, reason_id, expires_at
    ) VALUES (
        v_code, p_student_id, p_generated_by, p_reason_id,
        NOW() + INTERVAL '8 hours'
    );
    
    RETURN v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FUNCIÓN PARA VALIDAR EL CÓDIGO QR
CREATE OR REPLACE FUNCTION validate_qr_retrieval(
    p_qr_code VARCHAR(255),
    p_inspector_id INT
) RETURNS JSON AS $$
DECLARE
    v_auth RECORD;
    v_result JSON;
BEGIN
    -- Busca el QR no expirado
    SELECT * INTO v_auth FROM qr_authorizations 
    WHERE code = p_qr_code 
      AND is_used = FALSE 
      AND expires_at > NOW();
    
    IF v_auth IS NULL THEN
        RETURN json_build_object('success', FALSE, 'error', 'Código QR inválido o expirado');
    END IF;
    
    -- Registra el retiro
    INSERT INTO withdrawals (
        qr_authorization_id, student_id, processed_by, reason_id, method
    ) VALUES (
        v_auth.id, v_auth.student_id, p_inspector_id, v_auth.reason_id, 'QR'
    );
    
    -- Marca QR como usado
    UPDATE qr_authorizations SET is_used = TRUE WHERE id = v_auth.id;
    
    -- Devuelve datos del estudiante
    SELECT json_build_object(
        'success', TRUE,
        'student_name', s.first_name || ' ' || s.last_name,
        'grade', s.grade
    ) INTO v_result
    FROM students s WHERE s.id = v_auth.student_id;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;


-- FUNCIÓN PARA EL RETIRO MANUAL CON VERIFICACIÓN
CREATE OR REPLACE PROCEDURE process_manual_retrieval(
    p_student_id INT,
    p_inspector_id INT,
    p_reason_id INT,
    p_contact_phone VARCHAR(20)  -- Se removió la coma aquí
) AS $$
DECLARE
    v_contact_valid BOOLEAN := FALSE;
BEGIN
    -- Verifica si el teléfono es contacto de emergencia
    SELECT EXISTS (
        SELECT 1 FROM emergency_contacts 
        WHERE parent_id = (SELECT parent_id FROM students WHERE id = p_student_id)
        AND phone = p_contact_phone
    ) INTO v_contact_valid;
    
    IF NOT v_contact_valid THEN
        RAISE EXCEPTION 'El contacto no está autorizado para retirar al estudiante';
    END IF;
    
    -- Registra el retiro
    INSERT INTO withdrawals (
        student_id, processed_by, reason_id, method, contact_verified
    ) VALUES (
        p_student_id, p_inspector_id, p_reason_id, 'MANUAL', TRUE
    );
END;
$$ LANGUAGE plpgsql;

-- AUDITORÍA CAMBIOS 
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50),
    record_id INT,
    action VARCHAR(10), -- INSERT/UPDATE/DELETE
    user_id INT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, record_id, action, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', current_user_id());
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, record_id, action, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', current_user_id());
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, record_id, action, user_id)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', current_user_id());
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a tablas clave
CREATE TRIGGER users_audit
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER withdrawals_audit
AFTER INSERT OR UPDATE OR DELETE ON withdrawals
FOR EACH ROW EXECUTE FUNCTION log_audit();


CREATE SEQUENCE ticket_number_seq
START WITH 1000
INCREMENT BY 1;

CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS VARCHAR(10) AS $$
BEGIN
    RETURN 'TICKET-' || nextval('ticket_number_seq');
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION daily_withdrawals_report(p_date DATE)
RETURNS TABLE (
    student_name VARCHAR(101),
    grade VARCHAR(10),
    retrieval_time TIMESTAMP,
    method VARCHAR(10),
    authorized_by VARCHAR(101)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.first_name || ' ' || s.last_name AS student_name,
        s.grade,
        w.created_at AS retrieval_time,
        w.method,
        u.first_name || ' ' || u.last_name AS authorized_by
    FROM withdrawals w
    JOIN students s ON w.student_id = s.id
    JOIN users u ON w.processed_by = u.id
    WHERE DATE(w.created_at) = p_date
    ORDER BY w.created_at DESC;
END;
$$ LANGUAGE plpgsql;