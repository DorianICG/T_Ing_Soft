

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;




ALTER SCHEMA public OWNER TO postgres;



COMMENT ON SCHEMA public IS '';



CREATE FUNCTION public.daily_withdrawals_report(p_date date) RETURNS TABLE(student_name character varying, grade character varying, retrieval_time timestamp without time zone, method character varying, authorized_by character varying)
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.daily_withdrawals_report(p_date date) OWNER TO postgres;


CREATE FUNCTION public.generate_secure_qr(p_student_id integer, p_generated_by integer, p_reason_id integer) RETURNS character varying
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_code VARCHAR(255);
BEGIN
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
$$;


ALTER FUNCTION public.generate_secure_qr(p_student_id integer, p_generated_by integer, p_reason_id integer) OWNER TO postgres;


CREATE FUNCTION public.generate_ticket_number() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN 'TICKET-' || nextval('ticket_number_seq');
END;
$$;


ALTER FUNCTION public.generate_ticket_number() OWNER TO postgres;


CREATE FUNCTION public.log_audit() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_user_id INT;
BEGIN
    BEGIN
        v_user_id := current_setting('myapp.current_user_id')::INT;
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL; 
    END;

    IF v_user_id IS NULL THEN
        RAISE NOTICE 'myapp.current_user_id no está definido para la auditoría en tabla %', TG_TABLE_NAME;
    END IF;

    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, record_id, action, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', v_user_id);
        RETURN NEW; 
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, record_id, action, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', v_user_id); 
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, record_id, action, user_id)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', v_user_id);
        RETURN OLD; 
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.log_audit() OWNER TO postgres;

CREATE PROCEDURE public.process_manual_retrieval(IN p_student_id integer, IN p_inspector_id integer, IN p_reason_id integer, IN p_contact_phone character varying)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_contact_valid BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM emergency_contacts 
        WHERE parent_id = (SELECT parent_id FROM students WHERE id = p_student_id)
        AND phone = p_contact_phone
    ) INTO v_contact_valid;
    
    IF NOT v_contact_valid THEN
        RAISE EXCEPTION 'El contacto no está autorizado para retirar al estudiante';
    END IF;
    
    INSERT INTO withdrawals (
        student_id, processed_by, reason_id, method, contact_verified
    ) VALUES (
        p_student_id, p_inspector_id, p_reason_id, 'MANUAL', TRUE
    );
END;
$$;


ALTER PROCEDURE public.process_manual_retrieval(IN p_student_id integer, IN p_inspector_id integer, IN p_reason_id integer, IN p_contact_phone character varying) OWNER TO postgres;


CREATE FUNCTION public.validate_qr_retrieval(p_qr_code character varying, p_inspector_id integer) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_auth RECORD;
    v_result JSON;
BEGIN
    SELECT * INTO v_auth FROM qr_authorizations 
    WHERE code = p_qr_code 
      AND is_used = FALSE 
      AND expires_at > NOW();
    
    IF v_auth IS NULL THEN
        RETURN json_build_object('success', FALSE, 'error', 'Código QR inválido o expirado');
    END IF;
    
    INSERT INTO withdrawals (
        qr_authorization_id, student_id, processed_by, reason_id, method
    ) VALUES (
        v_auth.id, v_auth.student_id, p_inspector_id, v_auth.reason_id, 'QR'
    );
    
    UPDATE qr_authorizations SET is_used = TRUE WHERE id = v_auth.id;
    
    SELECT json_build_object(
        'success', TRUE,
        'student_name', s.first_name || ' ' || s.last_name,
        'grade', s.grade
    ) INTO v_result
    FROM students s WHERE s.id = v_auth.student_id;
    
    RETURN v_result;
END;
$$;


ALTER FUNCTION public.validate_qr_retrieval(p_qr_code character varying, p_inspector_id integer) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;



CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


ALTER TABLE public."SequelizeMeta" OWNER TO postgres;


CREATE TABLE public.audit_log (
    id integer NOT NULL,
    table_name character varying(50),
    record_id integer,
    action character varying(10),
    user_id integer,
    changed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_log OWNER TO postgres;


CREATE SEQUENCE public.audit_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_log_id_seq OWNER TO postgres;


ALTER SEQUENCE public.audit_log_id_seq OWNED BY public.audit_log.id;


CREATE TABLE public.emergency_contacts (
    id integer NOT NULL,
    parent_id integer NOT NULL,
    name character varying(100) NOT NULL,
    phone character varying(20) NOT NULL,
    relationship character varying(50) NOT NULL,
    is_verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.emergency_contacts OWNER TO postgres;

CREATE SEQUENCE public.emergency_contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.emergency_contacts_id_seq OWNER TO postgres;

ALTER SEQUENCE public.emergency_contacts_id_seq OWNED BY public.emergency_contacts.id;

CREATE TABLE public.login_challenges (
    id integer NOT NULL,
    user_id integer,
    captcha_token character varying(100) NOT NULL,
    solved boolean DEFAULT false,
    expires_at timestamp without time zone NOT NULL
);


ALTER TABLE public.login_challenges OWNER TO postgres;


CREATE SEQUENCE public.login_challenges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.login_challenges_id_seq OWNER TO postgres;


ALTER SEQUENCE public.login_challenges_id_seq OWNED BY public.login_challenges.id;


CREATE TABLE public.organizations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    address text,
    phone character varying(20),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.organizations OWNER TO postgres;


CREATE SEQUENCE public.organizations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.organizations_id_seq OWNER TO postgres;


ALTER SEQUENCE public.organizations_id_seq OWNED BY public.organizations.id;


CREATE TABLE public.qr_authorizations (
    id integer NOT NULL,
    code character varying(255) NOT NULL,
    student_id integer NOT NULL,
    generated_by integer NOT NULL,
    reason_id integer NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    is_used boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.qr_authorizations OWNER TO postgres;


CREATE SEQUENCE public.qr_authorizations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.qr_authorizations_id_seq OWNER TO postgres;

ALTER SEQUENCE public.qr_authorizations_id_seq OWNED BY public.qr_authorizations.id;


CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(20) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone
);


ALTER TABLE public.roles OWNER TO postgres;


CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;


ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


CREATE TABLE public.students (
    id integer NOT NULL,
    rut character varying(20) NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    birth_date date,
    organization_id integer NOT NULL,
    parent_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.students OWNER TO postgres;


CREATE SEQUENCE public.students_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.students_id_seq OWNER TO postgres;


ALTER SEQUENCE public.students_id_seq OWNED BY public.students.id;


CREATE SEQUENCE public.ticket_number_seq
    START WITH 1000
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ticket_number_seq OWNER TO postgres;


CREATE TABLE public.users (
    id integer NOT NULL,
    rut character varying(10) NOT NULL,
    email character varying(100) DEFAULT 'NO TIENE'::character varying NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    phone character varying(15) DEFAULT 'NO TIENE'::character varying NOT NULL,
    role_id integer NOT NULL,
    is_active boolean DEFAULT true,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    failed_login_attempts integer DEFAULT 0,
    account_locked boolean DEFAULT false,
    last_failed_login timestamp without time zone,
    updated_at timestamp without time zone,
    mfa_code_hash character varying(255),
    mfa_code_expires_at timestamp without time zone,
    reset_password_token_hash character varying(255),
    reset_password_expires_at timestamp without time zone
);


ALTER TABLE public.users OWNER TO postgres;


CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;


ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


CREATE TABLE public.withdrawal_reasons (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    requires_contact_verification boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.withdrawal_reasons OWNER TO postgres;


CREATE SEQUENCE public.withdrawal_reasons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.withdrawal_reasons_id_seq OWNER TO postgres;


ALTER SEQUENCE public.withdrawal_reasons_id_seq OWNED BY public.withdrawal_reasons.id;


CREATE TABLE public.withdrawals (
    id integer NOT NULL,
    qr_authorization_id integer,
    student_id integer NOT NULL,
    processed_by integer NOT NULL,
    reason_id integer NOT NULL,
    method character varying(10) NOT NULL,
    contact_verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT withdrawals_method_check CHECK (((method)::text = ANY ((ARRAY['QR'::character varying, 'MANUAL'::character varying])::text[])))
);


ALTER TABLE public.withdrawals OWNER TO postgres;


CREATE SEQUENCE public.withdrawals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.withdrawals_id_seq OWNER TO postgres;


ALTER SEQUENCE public.withdrawals_id_seq OWNED BY public.withdrawals.id;

ALTER TABLE ONLY public.audit_log ALTER COLUMN id SET DEFAULT nextval('public.audit_log_id_seq'::regclass);

ALTER TABLE ONLY public.emergency_contacts ALTER COLUMN id SET DEFAULT nextval('public.emergency_contacts_id_seq'::regclass);

ALTER TABLE ONLY public.login_challenges ALTER COLUMN id SET DEFAULT nextval('public.login_challenges_id_seq'::regclass);

ALTER TABLE ONLY public.organizations ALTER COLUMN id SET DEFAULT nextval('public.organizations_id_seq'::regclass);

ALTER TABLE ONLY public.qr_authorizations ALTER COLUMN id SET DEFAULT nextval('public.qr_authorizations_id_seq'::regclass);

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);

ALTER TABLE ONLY public.students ALTER COLUMN id SET DEFAULT nextval('public.students_id_seq'::regclass);

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);

ALTER TABLE ONLY public.withdrawal_reasons ALTER COLUMN id SET DEFAULT nextval('public.withdrawal_reasons_id_seq'::regclass);

ALTER TABLE ONLY public.withdrawals ALTER COLUMN id SET DEFAULT nextval('public.withdrawals_id_seq'::regclass);

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.emergency_contacts
    ADD CONSTRAINT emergency_contacts_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.login_challenges
    ADD CONSTRAINT login_challenges_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.qr_authorizations
    ADD CONSTRAINT qr_authorizations_code_key UNIQUE (code);

ALTER TABLE ONLY public.qr_authorizations
    ADD CONSTRAINT qr_authorizations_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_rut_key UNIQUE (rut);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_rut_key UNIQUE (rut);

ALTER TABLE ONLY public.withdrawal_reasons
    ADD CONSTRAINT withdrawal_reasons_name_key UNIQUE (name);

ALTER TABLE ONLY public.withdrawal_reasons
    ADD CONSTRAINT withdrawal_reasons_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_pkey PRIMARY KEY (id);

CREATE INDEX idx_qr_code ON public.qr_authorizations USING btree (code);

CREATE INDEX idx_qr_expiration ON public.qr_authorizations USING btree (expires_at) WHERE (is_used = false);

CREATE INDEX idx_student_org ON public.students USING btree (organization_id);

CREATE INDEX idx_student_parent ON public.students USING btree (parent_id);

CREATE INDEX idx_withdrawal_date ON public.withdrawals USING btree (created_at);

CREATE TRIGGER users_audit AFTER INSERT OR DELETE OR UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.log_audit();

CREATE TRIGGER withdrawals_audit AFTER INSERT OR DELETE OR UPDATE ON public.withdrawals FOR EACH ROW EXECUTE FUNCTION public.log_audit();

ALTER TABLE ONLY public.emergency_contacts
    ADD CONSTRAINT emergency_contacts_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.login_challenges
    ADD CONSTRAINT login_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.qr_authorizations
    ADD CONSTRAINT qr_authorizations_generated_by_fkey FOREIGN KEY (generated_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.qr_authorizations
    ADD CONSTRAINT qr_authorizations_reason_id_fkey FOREIGN KEY (reason_id) REFERENCES public.withdrawal_reasons(id);

ALTER TABLE ONLY public.qr_authorizations
    ADD CONSTRAINT qr_authorizations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.users(id);

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_qr_authorization_id_fkey FOREIGN KEY (qr_authorization_id) REFERENCES public.qr_authorizations(id);

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_reason_id_fkey FOREIGN KEY (reason_id) REFERENCES public.withdrawal_reasons(id);

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


