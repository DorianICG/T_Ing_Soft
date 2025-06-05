--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: ticket_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.ticket_status AS ENUM (
    'open',
    'in progress',
    'closed'
);


--
-- Name: clean_expired_qr_codes(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.clean_expired_qr_codes() RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM qr_authorizations 
    WHERE expires_at < NOW() AND is_used = false;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;


--
-- Name: log_audit(); Type: FUNCTION; Schema: public; Owner: -
--

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


--
-- Name: uppercase_emergency_contact_details_func(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.uppercase_emergency_contact_details_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.name IS NOT NULL THEN
        NEW.name = UPPER(NEW.name);
    END IF;
    IF NEW.relationship IS NOT NULL THEN
        NEW.relationship = UPPER(NEW.relationship);
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: uppercase_first_last_name_columns_func(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.uppercase_first_last_name_columns_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.first_name IS NOT NULL THEN
        NEW.first_name = UPPER(NEW.first_name);
    END IF;
    IF NEW.last_name IS NOT NULL THEN
        NEW.last_name = UPPER(NEW.last_name);
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: uppercase_name_column_func(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.uppercase_name_column_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.name IS NOT NULL THEN
        NEW.name = UPPER(NEW.name);
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: uppercase_organization_details_func(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.uppercase_organization_details_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.name IS NOT NULL THEN
        NEW.name = UPPER(NEW.name);
    END IF;
    IF NEW.address IS NOT NULL THEN
        NEW.address = UPPER(NEW.address);
    END IF;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_log (
    id integer NOT NULL,
    table_name character varying(50),
    record_id integer,
    action character varying(10),
    user_id integer,
    changed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_log_id_seq OWNED BY public.audit_log.id;


--
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    organization_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- Name: delegates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.delegates (
    id integer NOT NULL,
    parent_user_id integer NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(50),
    relationship_to_student character varying(100),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: delegates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.delegates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: delegates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.delegates_id_seq OWNED BY public.delegates.id;


--
-- Name: emergency_contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.emergency_contacts (
    id integer NOT NULL,
    parent_user_id integer NOT NULL,
    name character varying(100) NOT NULL,
    phone character varying(20) NOT NULL,
    relationship character varying(50) NOT NULL,
    is_verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone
);


--
-- Name: emergency_contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.emergency_contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: emergency_contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.emergency_contacts_id_seq OWNED BY public.emergency_contacts.id;


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organizations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    address text,
    phone character varying(20),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone
);


--
-- Name: organizations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.organizations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: organizations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.organizations_id_seq OWNED BY public.organizations.id;


--
-- Name: qr_authorizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.qr_authorizations (
    id integer NOT NULL,
    code character varying(255) NOT NULL,
    student_id integer NOT NULL,
    generated_by_user_id integer NOT NULL,
    reason_id integer NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    is_used boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    custom_withdrawal_reason text,
    assigned_delegate_id integer,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_qr_reason_provided CHECK (((reason_id IS NOT NULL) OR ((custom_withdrawal_reason IS NOT NULL) AND (custom_withdrawal_reason <> ''::text))))
);


--
-- Name: qr_authorizations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.qr_authorizations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: qr_authorizations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.qr_authorizations_id_seq OWNED BY public.qr_authorizations.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(20) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.students (
    id integer NOT NULL,
    rut character varying(20) NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    birth_date date,
    organization_id integer NOT NULL,
    parent_user_id integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    course_id integer NOT NULL,
    updated_at timestamp with time zone
);


--
-- Name: students_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.students_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.students_id_seq OWNED BY public.students.id;


--
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_tickets (
    id_ticket integer NOT NULL,
    user_id integer NOT NULL,
    description text NOT NULL,
    attachment character varying(255),
    tracking_number character varying(50) NOT NULL,
    status public.ticket_status DEFAULT 'open'::public.ticket_status,
    admin_response text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    responded_at timestamp without time zone
);


--
-- Name: support_tickets_id_ticket_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.support_tickets_id_ticket_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: support_tickets_id_ticket_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.support_tickets_id_ticket_seq OWNED BY public.support_tickets.id_ticket;


--
-- Name: ticket_number_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ticket_number_seq
    START WITH 1000
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tutorial_videos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tutorial_videos (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    url character varying(500) NOT NULL,
    duration_seconds integer NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT tutorial_videos_duration_seconds_check CHECK ((duration_seconds <= 300))
);


--
-- Name: tutorial_videos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tutorial_videos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tutorial_videos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tutorial_videos_id_seq OWNED BY public.tutorial_videos.id;


--
-- Name: user_organization_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_organization_roles (
    user_id integer NOT NULL,
    organization_id integer NOT NULL,
    role_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: user_tutorial_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_tutorial_views (
    user_id integer NOT NULL,
    tutorial_video_id integer NOT NULL,
    viewed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    rut character varying(10) NOT NULL,
    email character varying(100) DEFAULT 'NO TIENE'::character varying NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    phone character varying(15) DEFAULT 'NO TIENE'::character varying NOT NULL,
    is_active boolean DEFAULT true,
    last_login timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    failed_login_attempts integer DEFAULT 0,
    account_locked boolean DEFAULT false,
    last_failed_login timestamp with time zone,
    updated_at timestamp with time zone,
    mfa_code_hash character varying(255),
    mfa_code_expires_at timestamp with time zone,
    reset_password_token_hash character varying(255),
    reset_password_expires_at timestamp with time zone
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: withdrawal_reasons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.withdrawal_reasons (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: withdrawal_reasons_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.withdrawal_reasons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: withdrawal_reasons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.withdrawal_reasons_id_seq OWNED BY public.withdrawal_reasons.id;


--
-- Name: withdrawals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.withdrawals (
    id integer NOT NULL,
    qr_authorization_id integer,
    student_id integer NOT NULL,
    organization_approver_user_id integer NOT NULL,
    reason_id integer NOT NULL,
    method character varying(10) NOT NULL,
    contact_verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    retriever_user_id integer,
    retriever_delegate_id integer,
    retriever_emergency_contact_id integer,
    retriever_name_if_other character varying(255),
    guardian_authorizer_user_id integer,
    guardian_authorizer_emergency_contact_id integer,
    custom_withdrawal_reason text,
    organization_id integer,
    retriever_rut_if_other character varying(20),
    retriever_relationship_if_other character varying(100),
    withdrawal_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    notes text,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    CONSTRAINT chk_retriever_type CHECK ((((retriever_user_id IS NOT NULL) AND (retriever_delegate_id IS NULL) AND (retriever_emergency_contact_id IS NULL) AND (retriever_name_if_other IS NULL)) OR ((retriever_user_id IS NULL) AND (retriever_delegate_id IS NOT NULL) AND (retriever_emergency_contact_id IS NULL) AND (retriever_name_if_other IS NULL)) OR ((retriever_user_id IS NULL) AND (retriever_delegate_id IS NULL) AND (retriever_emergency_contact_id IS NOT NULL) AND (retriever_name_if_other IS NULL)) OR ((retriever_user_id IS NULL) AND (retriever_delegate_id IS NULL) AND (retriever_emergency_contact_id IS NULL) AND (retriever_name_if_other IS NOT NULL)) OR ((retriever_user_id IS NULL) AND (retriever_delegate_id IS NULL) AND (retriever_emergency_contact_id IS NULL) AND (retriever_name_if_other IS NULL)))),
    CONSTRAINT chk_retriever_type_exclusive CHECK (((((
CASE
    WHEN (retriever_user_id IS NOT NULL) THEN 1
    ELSE 0
END +
CASE
    WHEN (retriever_delegate_id IS NOT NULL) THEN 1
    ELSE 0
END) +
CASE
    WHEN (retriever_emergency_contact_id IS NOT NULL) THEN 1
    ELSE 0
END) +
CASE
    WHEN (retriever_name_if_other IS NOT NULL) THEN 1
    ELSE 0
END) <= 1)),
    CONSTRAINT chk_withdrawal_method_values CHECK (((method)::text = ANY ((ARRAY['QR'::character varying, 'MANUAL'::character varying])::text[]))),
    CONSTRAINT chk_withdrawal_reason_logic CHECK (((qr_authorization_id IS NOT NULL) OR ((reason_id IS NOT NULL) OR ((custom_withdrawal_reason IS NOT NULL) AND (custom_withdrawal_reason <> ''::text))))),
    CONSTRAINT chk_withdrawal_reason_provided CHECK (((reason_id IS NOT NULL) OR ((custom_withdrawal_reason IS NOT NULL) AND (custom_withdrawal_reason <> ''::text)) OR (qr_authorization_id IS NOT NULL))),
    CONSTRAINT withdrawals_method_check CHECK (((method)::text = ANY (ARRAY[('QR'::character varying)::text, ('MANUAL'::character varying)::text]))),
    CONSTRAINT withdrawals_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'DENIED'::character varying])::text[])))
);


--
-- Name: withdrawals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.withdrawals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: withdrawals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.withdrawals_id_seq OWNED BY public.withdrawals.id;


--
-- Name: audit_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log ALTER COLUMN id SET DEFAULT nextval('public.audit_log_id_seq'::regclass);


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: delegates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delegates ALTER COLUMN id SET DEFAULT nextval('public.delegates_id_seq'::regclass);


--
-- Name: emergency_contacts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emergency_contacts ALTER COLUMN id SET DEFAULT nextval('public.emergency_contacts_id_seq'::regclass);


--
-- Name: organizations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations ALTER COLUMN id SET DEFAULT nextval('public.organizations_id_seq'::regclass);


--
-- Name: qr_authorizations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qr_authorizations ALTER COLUMN id SET DEFAULT nextval('public.qr_authorizations_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: students id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students ALTER COLUMN id SET DEFAULT nextval('public.students_id_seq'::regclass);


--
-- Name: support_tickets id_ticket; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets ALTER COLUMN id_ticket SET DEFAULT nextval('public.support_tickets_id_ticket_seq'::regclass);


--
-- Name: tutorial_videos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutorial_videos ALTER COLUMN id SET DEFAULT nextval('public.tutorial_videos_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: withdrawal_reasons id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawal_reasons ALTER COLUMN id SET DEFAULT nextval('public.withdrawal_reasons_id_seq'::regclass);


--
-- Name: withdrawals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals ALTER COLUMN id SET DEFAULT nextval('public.withdrawals_id_seq'::regclass);


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: courses courses_name_organization_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_name_organization_id_key UNIQUE (name, organization_id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: delegates delegates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delegates
    ADD CONSTRAINT delegates_pkey PRIMARY KEY (id);


--
-- Name: emergency_contacts emergency_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emergency_contacts
    ADD CONSTRAINT emergency_contacts_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: qr_authorizations qr_authorizations_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qr_authorizations
    ADD CONSTRAINT qr_authorizations_code_key UNIQUE (code);


--
-- Name: qr_authorizations qr_authorizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qr_authorizations
    ADD CONSTRAINT qr_authorizations_pkey PRIMARY KEY (id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: students students_rut_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_rut_key UNIQUE (rut);


--
-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id_ticket);


--
-- Name: support_tickets support_tickets_tracking_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_tracking_number_key UNIQUE (tracking_number);


--
-- Name: tutorial_videos tutorial_videos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutorial_videos
    ADD CONSTRAINT tutorial_videos_pkey PRIMARY KEY (id);


--
-- Name: withdrawals uq_withdrawals_qr_authorization_id; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT uq_withdrawals_qr_authorization_id UNIQUE (qr_authorization_id);


--
-- Name: user_organization_roles user_organization_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_organization_roles
    ADD CONSTRAINT user_organization_roles_pkey PRIMARY KEY (user_id, organization_id);


--
-- Name: user_tutorial_views user_tutorial_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tutorial_views
    ADD CONSTRAINT user_tutorial_views_pkey PRIMARY KEY (user_id, tutorial_video_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_rut_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_rut_key UNIQUE (rut);


--
-- Name: withdrawal_reasons withdrawal_reasons_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawal_reasons
    ADD CONSTRAINT withdrawal_reasons_name_key UNIQUE (name);


--
-- Name: withdrawal_reasons withdrawal_reasons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawal_reasons
    ADD CONSTRAINT withdrawal_reasons_pkey PRIMARY KEY (id);


--
-- Name: withdrawals withdrawals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_pkey PRIMARY KEY (id);


--
-- Name: idx_audit_log_changed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_log_changed_at ON public.audit_log USING btree (changed_at);


--
-- Name: idx_audit_log_table_name_record_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_log_table_name_record_id ON public.audit_log USING btree (table_name, record_id);


--
-- Name: idx_audit_log_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_log_user_id ON public.audit_log USING btree (user_id);


--
-- Name: idx_courses_organization_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_courses_organization_id ON public.courses USING btree (organization_id);


--
-- Name: idx_delegates_parent_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_delegates_parent_user_id ON public.delegates USING btree (parent_user_id);


--
-- Name: idx_emergency_contacts_parent_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_emergency_contacts_parent_user_id ON public.emergency_contacts USING btree (parent_user_id);


--
-- Name: idx_qr_authorizations_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_qr_authorizations_code ON public.qr_authorizations USING btree (code);


--
-- Name: idx_qr_authorizations_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_qr_authorizations_expires_at ON public.qr_authorizations USING btree (expires_at);


--
-- Name: idx_qr_authorizations_generated_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_qr_authorizations_generated_by ON public.qr_authorizations USING btree (generated_by_user_id);


--
-- Name: idx_qr_authorizations_reason_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_qr_authorizations_reason_id ON public.qr_authorizations USING btree (reason_id);


--
-- Name: idx_qr_authorizations_student_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_qr_authorizations_student_id ON public.qr_authorizations USING btree (student_id);


--
-- Name: idx_students_course_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_students_course_id ON public.students USING btree (course_id);


--
-- Name: idx_students_organization_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_students_organization_id ON public.students USING btree (organization_id);


--
-- Name: idx_students_parent_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_students_parent_user_id ON public.students USING btree (parent_user_id);


--
-- Name: idx_students_rut; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_students_rut ON public.students USING btree (rut);


--
-- Name: idx_user_organization_roles_organization_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_organization_roles_organization_id ON public.user_organization_roles USING btree (organization_id);


--
-- Name: idx_user_organization_roles_role_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_organization_roles_role_id ON public.user_organization_roles USING btree (role_id);


--
-- Name: idx_user_organization_roles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_organization_roles_user_id ON public.user_organization_roles USING btree (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_rut; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_rut ON public.users USING btree (rut);


--
-- Name: idx_withdrawals_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_withdrawals_created_at ON public.withdrawals USING btree (created_at);


--
-- Name: idx_withdrawals_guardian_authorizer_emergency_contact_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_withdrawals_guardian_authorizer_emergency_contact_id ON public.withdrawals USING btree (guardian_authorizer_emergency_contact_id);


--
-- Name: idx_withdrawals_guardian_authorizer_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_withdrawals_guardian_authorizer_user_id ON public.withdrawals USING btree (guardian_authorizer_user_id);


--
-- Name: idx_withdrawals_organization_approver_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_withdrawals_organization_approver_user_id ON public.withdrawals USING btree (organization_approver_user_id);


--
-- Name: idx_withdrawals_qr_authorization_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_withdrawals_qr_authorization_id ON public.withdrawals USING btree (qr_authorization_id);


--
-- Name: idx_withdrawals_reason_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_withdrawals_reason_id ON public.withdrawals USING btree (reason_id);


--
-- Name: idx_withdrawals_retriever_delegate_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_withdrawals_retriever_delegate_id ON public.withdrawals USING btree (retriever_delegate_id);


--
-- Name: idx_withdrawals_retriever_emergency_contact_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_withdrawals_retriever_emergency_contact_id ON public.withdrawals USING btree (retriever_emergency_contact_id);


--
-- Name: idx_withdrawals_retriever_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_withdrawals_retriever_user_id ON public.withdrawals USING btree (retriever_user_id);


--
-- Name: idx_withdrawals_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_withdrawals_status ON public.withdrawals USING btree (status);


--
-- Name: idx_withdrawals_student_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_withdrawals_student_id ON public.withdrawals USING btree (student_id);


--
-- Name: courses trigger_uppercase_courses_name; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_uppercase_courses_name BEFORE INSERT OR UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.uppercase_name_column_func();


--
-- Name: delegates trigger_uppercase_delegates_name; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_uppercase_delegates_name BEFORE INSERT OR UPDATE ON public.delegates FOR EACH ROW EXECUTE FUNCTION public.uppercase_name_column_func();


--
-- Name: emergency_contacts trigger_uppercase_emergency_contacts_details; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_uppercase_emergency_contacts_details BEFORE INSERT OR UPDATE ON public.emergency_contacts FOR EACH ROW EXECUTE FUNCTION public.uppercase_emergency_contact_details_func();


--
-- Name: organizations trigger_uppercase_organizations_details; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_uppercase_organizations_details BEFORE INSERT OR UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.uppercase_organization_details_func();


--
-- Name: roles trigger_uppercase_roles_name; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_uppercase_roles_name BEFORE INSERT OR UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.uppercase_name_column_func();


--
-- Name: students trigger_uppercase_students_names; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_uppercase_students_names BEFORE INSERT OR UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.uppercase_first_last_name_columns_func();


--
-- Name: users trigger_uppercase_users_names; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_uppercase_users_names BEFORE INSERT OR UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.uppercase_first_last_name_columns_func();


--
-- Name: withdrawal_reasons trigger_uppercase_withdrawal_reasons_name; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_uppercase_withdrawal_reasons_name BEFORE INSERT OR UPDATE ON public.withdrawal_reasons FOR EACH ROW EXECUTE FUNCTION public.uppercase_name_column_func();


--
-- Name: users users_audit; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER users_audit AFTER INSERT OR DELETE OR UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.log_audit();


--
-- Name: withdrawals withdrawals_audit; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER withdrawals_audit AFTER INSERT OR DELETE OR UPDATE ON public.withdrawals FOR EACH ROW EXECUTE FUNCTION public.log_audit();


--
-- Name: courses courses_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: delegates delegates_parent_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delegates
    ADD CONSTRAINT delegates_parent_user_id_fkey FOREIGN KEY (parent_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: emergency_contacts fk_emergency_contacts_parent; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emergency_contacts
    ADD CONSTRAINT fk_emergency_contacts_parent FOREIGN KEY (parent_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: qr_authorizations fk_qr_assigned_delegate; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qr_authorizations
    ADD CONSTRAINT fk_qr_assigned_delegate FOREIGN KEY (assigned_delegate_id) REFERENCES public.delegates(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: qr_authorizations fk_qr_generated_by_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qr_authorizations
    ADD CONSTRAINT fk_qr_generated_by_user FOREIGN KEY (generated_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: students fk_students_course; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT fk_students_course FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE SET NULL;


--
-- Name: students fk_students_parent_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT fk_students_parent_user FOREIGN KEY (parent_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: withdrawals fk_withdrawals_organization; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT fk_withdrawals_organization FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: withdrawals fk_withdrawals_reason; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT fk_withdrawals_reason FOREIGN KEY (reason_id) REFERENCES public.withdrawal_reasons(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: qr_authorizations qr_authorizations_reason_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qr_authorizations
    ADD CONSTRAINT qr_authorizations_reason_id_fkey FOREIGN KEY (reason_id) REFERENCES public.withdrawal_reasons(id);


--
-- Name: qr_authorizations qr_authorizations_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qr_authorizations
    ADD CONSTRAINT qr_authorizations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: students students_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: support_tickets support_tickets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_organization_roles user_organization_roles_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_organization_roles
    ADD CONSTRAINT user_organization_roles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: user_organization_roles user_organization_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_organization_roles
    ADD CONSTRAINT user_organization_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_organization_roles user_organization_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_organization_roles
    ADD CONSTRAINT user_organization_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_tutorial_views user_tutorial_views_tutorial_video_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tutorial_views
    ADD CONSTRAINT user_tutorial_views_tutorial_video_id_fkey FOREIGN KEY (tutorial_video_id) REFERENCES public.tutorial_videos(id) ON DELETE CASCADE;


--
-- Name: user_tutorial_views user_tutorial_views_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tutorial_views
    ADD CONSTRAINT user_tutorial_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: withdrawals withdrawals_guardian_authorizer_emergency_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_guardian_authorizer_emergency_contact_id_fkey FOREIGN KEY (guardian_authorizer_emergency_contact_id) REFERENCES public.emergency_contacts(id) ON DELETE SET NULL;


--
-- Name: withdrawals withdrawals_guardian_authorizer_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_guardian_authorizer_user_id_fkey FOREIGN KEY (guardian_authorizer_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: withdrawals withdrawals_processed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_processed_by_fkey FOREIGN KEY (organization_approver_user_id) REFERENCES public.users(id);


--
-- Name: withdrawals withdrawals_qr_authorization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_qr_authorization_id_fkey FOREIGN KEY (qr_authorization_id) REFERENCES public.qr_authorizations(id);


--
-- Name: withdrawals withdrawals_retriever_delegate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_retriever_delegate_id_fkey FOREIGN KEY (retriever_delegate_id) REFERENCES public.delegates(id) ON DELETE SET NULL;


--
-- Name: withdrawals withdrawals_retriever_emergency_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_retriever_emergency_contact_id_fkey FOREIGN KEY (retriever_emergency_contact_id) REFERENCES public.emergency_contacts(id) ON DELETE SET NULL;


--
-- Name: withdrawals withdrawals_retriever_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_retriever_user_id_fkey FOREIGN KEY (retriever_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: withdrawals withdrawals_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- PostgreSQL database dump complete
--

