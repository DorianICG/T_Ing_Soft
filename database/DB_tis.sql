PGDMP                      }            DB_tis    17.4    17.4 �    5           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            6           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            7           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            8           1262    66282    DB_tis    DATABASE     n   CREATE DATABASE "DB_tis" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'es-CL';
    DROP DATABASE "DB_tis";
                     postgres    false                        2615    2200    public    SCHEMA     2   -- *not* creating schema, since initdb creates it
 2   -- *not* dropping schema, since initdb creates it
                     postgres    false            9           0    0    SCHEMA public    COMMENT         COMMENT ON SCHEMA public IS '';
                        postgres    false    5            :           0    0    SCHEMA public    ACL     +   REVOKE USAGE ON SCHEMA public FROM PUBLIC;
                        postgres    false    5            �           1247    91694    ticket_status    TYPE     Z   CREATE TYPE public.ticket_status AS ENUM (
    'open',
    'in progress',
    'closed'
);
     DROP TYPE public.ticket_status;
       public               postgres    false    5            �            1255    83503    clean_expired_qr_codes()    FUNCTION     4  CREATE FUNCTION public.clean_expired_qr_codes() RETURNS integer
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
 /   DROP FUNCTION public.clean_expired_qr_codes();
       public               postgres    false    5            �            1255    66283    log_audit()    FUNCTION     �  CREATE FUNCTION public.log_audit() RETURNS trigger
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
 "   DROP FUNCTION public.log_audit();
       public               postgres    false    5            �            1255    67118 *   uppercase_emergency_contact_details_func()    FUNCTION     J  CREATE FUNCTION public.uppercase_emergency_contact_details_func() RETURNS trigger
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
 A   DROP FUNCTION public.uppercase_emergency_contact_details_func();
       public               postgres    false    5            �            1255    67116 (   uppercase_first_last_name_columns_func()    FUNCTION     Q  CREATE FUNCTION public.uppercase_first_last_name_columns_func() RETURNS trigger
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
 ?   DROP FUNCTION public.uppercase_first_last_name_columns_func();
       public               postgres    false    5            �            1255    67115    uppercase_name_column_func()    FUNCTION     �   CREATE FUNCTION public.uppercase_name_column_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.name IS NOT NULL THEN
        NEW.name = UPPER(NEW.name);
    END IF;
    RETURN NEW;
END;
$$;
 3   DROP FUNCTION public.uppercase_name_column_func();
       public               postgres    false    5            �            1255    67117 %   uppercase_organization_details_func()    FUNCTION     6  CREATE FUNCTION public.uppercase_organization_details_func() RETURNS trigger
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
 <   DROP FUNCTION public.uppercase_organization_details_func();
       public               postgres    false    5            �            1259    66284    SequelizeMeta    TABLE     R   CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);
 #   DROP TABLE public."SequelizeMeta";
       public         heap r       postgres    false    5            �            1259    66287 	   audit_log    TABLE     �   CREATE TABLE public.audit_log (
    id integer NOT NULL,
    table_name character varying(50),
    record_id integer,
    action character varying(10),
    user_id integer,
    changed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.audit_log;
       public         heap r       postgres    false    5            �            1259    66291    audit_log_id_seq    SEQUENCE     �   CREATE SEQUENCE public.audit_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.audit_log_id_seq;
       public               postgres    false    5    218            ;           0    0    audit_log_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.audit_log_id_seq OWNED BY public.audit_log.id;
          public               postgres    false    219            �            1259    66292    courses    TABLE       CREATE TABLE public.courses (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    organization_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.courses;
       public         heap r       postgres    false    5            �            1259    66297    courses_id_seq    SEQUENCE     �   CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.courses_id_seq;
       public               postgres    false    220    5            <           0    0    courses_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;
          public               postgres    false    221            �            1259    66298 	   delegates    TABLE     e  CREATE TABLE public.delegates (
    id integer NOT NULL,
    parent_user_id integer NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(50),
    relationship_to_student character varying(100),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.delegates;
       public         heap r       postgres    false    5            �            1259    66303    delegates_id_seq    SEQUENCE     �   CREATE SEQUENCE public.delegates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.delegates_id_seq;
       public               postgres    false    5    222            =           0    0    delegates_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.delegates_id_seq OWNED BY public.delegates.id;
          public               postgres    false    223            �            1259    66304    emergency_contacts    TABLE     �  CREATE TABLE public.emergency_contacts (
    id integer NOT NULL,
    parent_user_id integer NOT NULL,
    name character varying(100) NOT NULL,
    phone character varying(20) NOT NULL,
    relationship character varying(50) NOT NULL,
    is_verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone
);
 &   DROP TABLE public.emergency_contacts;
       public         heap r       postgres    false    5            �            1259    66309    emergency_contacts_id_seq    SEQUENCE     �   CREATE SEQUENCE public.emergency_contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public.emergency_contacts_id_seq;
       public               postgres    false    5    224            >           0    0    emergency_contacts_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE public.emergency_contacts_id_seq OWNED BY public.emergency_contacts.id;
          public               postgres    false    225            �            1259    66315    organizations    TABLE     ,  CREATE TABLE public.organizations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    address text,
    phone character varying(20),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone
);
 !   DROP TABLE public.organizations;
       public         heap r       postgres    false    5            �            1259    66322    organizations_id_seq    SEQUENCE     �   CREATE SEQUENCE public.organizations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.organizations_id_seq;
       public               postgres    false    226    5            ?           0    0    organizations_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.organizations_id_seq OWNED BY public.organizations.id;
          public               postgres    false    227            �            1259    66323    qr_authorizations    TABLE     �  CREATE TABLE public.qr_authorizations (
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
 %   DROP TABLE public.qr_authorizations;
       public         heap r       postgres    false    5            �            1259    66328    qr_authorizations_id_seq    SEQUENCE     �   CREATE SEQUENCE public.qr_authorizations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.qr_authorizations_id_seq;
       public               postgres    false    5    228            @           0    0    qr_authorizations_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.qr_authorizations_id_seq OWNED BY public.qr_authorizations.id;
          public               postgres    false    229            �            1259    66329    roles    TABLE     �   CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(20) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone
);
    DROP TABLE public.roles;
       public         heap r       postgres    false    5            �            1259    66335    roles_id_seq    SEQUENCE     �   CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.roles_id_seq;
       public               postgres    false    5    230            A           0    0    roles_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;
          public               postgres    false    231            �            1259    66336    students    TABLE     �  CREATE TABLE public.students (
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
    DROP TABLE public.students;
       public         heap r       postgres    false    5            �            1259    66340    students_id_seq    SEQUENCE     �   CREATE SEQUENCE public.students_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.students_id_seq;
       public               postgres    false    232    5            B           0    0    students_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.students_id_seq OWNED BY public.students.id;
          public               postgres    false    233            �            1259    91702    support_tickets    TABLE     �  CREATE TABLE public.support_tickets (
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
 #   DROP TABLE public.support_tickets;
       public         heap r       postgres    false    920    5    920            �            1259    91701    support_tickets_id_ticket_seq    SEQUENCE     �   CREATE SEQUENCE public.support_tickets_id_ticket_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 4   DROP SEQUENCE public.support_tickets_id_ticket_seq;
       public               postgres    false    243    5            C           0    0    support_tickets_id_ticket_seq    SEQUENCE OWNED BY     _   ALTER SEQUENCE public.support_tickets_id_ticket_seq OWNED BY public.support_tickets.id_ticket;
          public               postgres    false    242            �            1259    66341    ticket_number_seq    SEQUENCE     }   CREATE SEQUENCE public.ticket_number_seq
    START WITH 1000
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.ticket_number_seq;
       public               postgres    false    5            �            1259    91720    tutorial_videos    TABLE     �  CREATE TABLE public.tutorial_videos (
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
 #   DROP TABLE public.tutorial_videos;
       public         heap r       postgres    false    5            �            1259    91719    tutorial_videos_id_seq    SEQUENCE     �   CREATE SEQUENCE public.tutorial_videos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.tutorial_videos_id_seq;
       public               postgres    false    5    245            D           0    0    tutorial_videos_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.tutorial_videos_id_seq OWNED BY public.tutorial_videos.id;
          public               postgres    false    244            �            1259    66342    user_organization_roles    TABLE       CREATE TABLE public.user_organization_roles (
    user_id integer NOT NULL,
    organization_id integer NOT NULL,
    role_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
 +   DROP TABLE public.user_organization_roles;
       public         heap r       postgres    false    5            �            1259    91732    user_tutorial_views    TABLE     �   CREATE TABLE public.user_tutorial_views (
    user_id integer NOT NULL,
    tutorial_video_id integer NOT NULL,
    viewed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
 '   DROP TABLE public.user_tutorial_views;
       public         heap r       postgres    false    5            �            1259    66347    users    TABLE     �  CREATE TABLE public.users (
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
    DROP TABLE public.users;
       public         heap r       postgres    false    5            �            1259    66358    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public               postgres    false    236    5            E           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public               postgres    false    237            �            1259    66359    withdrawal_reasons    TABLE     �   CREATE TABLE public.withdrawal_reasons (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
 &   DROP TABLE public.withdrawal_reasons;
       public         heap r       postgres    false    5            �            1259    66364    withdrawal_reasons_id_seq    SEQUENCE     �   CREATE SEQUENCE public.withdrawal_reasons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public.withdrawal_reasons_id_seq;
       public               postgres    false    5    238            F           0    0    withdrawal_reasons_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE public.withdrawal_reasons_id_seq OWNED BY public.withdrawal_reasons.id;
          public               postgres    false    239            �            1259    66365    withdrawals    TABLE        CREATE TABLE public.withdrawals (
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
    DROP TABLE public.withdrawals;
       public         heap r       postgres    false    5            �            1259    66371    withdrawals_id_seq    SEQUENCE     �   CREATE SEQUENCE public.withdrawals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.withdrawals_id_seq;
       public               postgres    false    5    240            G           0    0    withdrawals_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.withdrawals_id_seq OWNED BY public.withdrawals.id;
          public               postgres    false    241            �           2604    66372    audit_log id    DEFAULT     l   ALTER TABLE ONLY public.audit_log ALTER COLUMN id SET DEFAULT nextval('public.audit_log_id_seq'::regclass);
 ;   ALTER TABLE public.audit_log ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    219    218            �           2604    66373 
   courses id    DEFAULT     h   ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);
 9   ALTER TABLE public.courses ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    221    220            �           2604    66374    delegates id    DEFAULT     l   ALTER TABLE ONLY public.delegates ALTER COLUMN id SET DEFAULT nextval('public.delegates_id_seq'::regclass);
 ;   ALTER TABLE public.delegates ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    223    222            �           2604    66375    emergency_contacts id    DEFAULT     ~   ALTER TABLE ONLY public.emergency_contacts ALTER COLUMN id SET DEFAULT nextval('public.emergency_contacts_id_seq'::regclass);
 D   ALTER TABLE public.emergency_contacts ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    225    224            �           2604    66377    organizations id    DEFAULT     t   ALTER TABLE ONLY public.organizations ALTER COLUMN id SET DEFAULT nextval('public.organizations_id_seq'::regclass);
 ?   ALTER TABLE public.organizations ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    227    226            �           2604    66378    qr_authorizations id    DEFAULT     |   ALTER TABLE ONLY public.qr_authorizations ALTER COLUMN id SET DEFAULT nextval('public.qr_authorizations_id_seq'::regclass);
 C   ALTER TABLE public.qr_authorizations ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    229    228            �           2604    66379    roles id    DEFAULT     d   ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);
 7   ALTER TABLE public.roles ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    231    230            �           2604    66380    students id    DEFAULT     j   ALTER TABLE ONLY public.students ALTER COLUMN id SET DEFAULT nextval('public.students_id_seq'::regclass);
 :   ALTER TABLE public.students ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    233    232                        2604    91705    support_tickets id_ticket    DEFAULT     �   ALTER TABLE ONLY public.support_tickets ALTER COLUMN id_ticket SET DEFAULT nextval('public.support_tickets_id_ticket_seq'::regclass);
 H   ALTER TABLE public.support_tickets ALTER COLUMN id_ticket DROP DEFAULT;
       public               postgres    false    242    243    243                       2604    91723    tutorial_videos id    DEFAULT     x   ALTER TABLE ONLY public.tutorial_videos ALTER COLUMN id SET DEFAULT nextval('public.tutorial_videos_id_seq'::regclass);
 A   ALTER TABLE public.tutorial_videos ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    244    245    245            �           2604    66381    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    237    236            �           2604    66382    withdrawal_reasons id    DEFAULT     ~   ALTER TABLE ONLY public.withdrawal_reasons ALTER COLUMN id SET DEFAULT nextval('public.withdrawal_reasons_id_seq'::regclass);
 D   ALTER TABLE public.withdrawal_reasons ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    239    238            �           2604    66383    withdrawals id    DEFAULT     p   ALTER TABLE ONLY public.withdrawals ALTER COLUMN id SET DEFAULT nextval('public.withdrawals_id_seq'::regclass);
 =   ALTER TABLE public.withdrawals ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    241    240                      0    66284    SequelizeMeta 
   TABLE DATA           /   COPY public."SequelizeMeta" (name) FROM stdin;
    public               postgres    false    217                   0    66287 	   audit_log 
   TABLE DATA           [   COPY public.audit_log (id, table_name, record_id, action, user_id, changed_at) FROM stdin;
    public               postgres    false    218   %                0    66292    courses 
   TABLE DATA           T   COPY public.courses (id, name, organization_id, created_at, updated_at) FROM stdin;
    public               postgres    false    220   �*                0    66298 	   delegates 
   TABLE DATA           u   COPY public.delegates (id, parent_user_id, name, phone, relationship_to_student, created_at, updated_at) FROM stdin;
    public               postgres    false    222   �+                0    66304    emergency_contacts 
   TABLE DATA           �   COPY public.emergency_contacts (id, parent_user_id, name, phone, relationship, is_verified, created_at, updated_at) FROM stdin;
    public               postgres    false    224   ,                0    66315    organizations 
   TABLE DATA           d   COPY public.organizations (id, name, address, phone, is_active, created_at, updated_at) FROM stdin;
    public               postgres    false    226   5,                 0    66323    qr_authorizations 
   TABLE DATA           �   COPY public.qr_authorizations (id, code, student_id, generated_by_user_id, reason_id, expires_at, is_used, created_at, custom_withdrawal_reason, assigned_delegate_id, updated_at) FROM stdin;
    public               postgres    false    228   �,      "          0    66329    roles 
   TABLE DATA           N   COPY public.roles (id, name, description, created_at, updated_at) FROM stdin;
    public               postgres    false    230   �,      $          0    66336    students 
   TABLE DATA           �   COPY public.students (id, rut, first_name, last_name, birth_date, organization_id, parent_user_id, created_at, course_id, updated_at) FROM stdin;
    public               postgres    false    232   �-      /          0    91702    support_tickets 
   TABLE DATA           �   COPY public.support_tickets (id_ticket, user_id, description, attachment, tracking_number, status, admin_response, created_at, responded_at) FROM stdin;
    public               postgres    false    243   �.      1          0    91720    tutorial_videos 
   TABLE DATA           {   COPY public.tutorial_videos (id, title, description, url, duration_seconds, is_active, created_at, updated_at) FROM stdin;
    public               postgres    false    245   �.      '          0    66342    user_organization_roles 
   TABLE DATA           l   COPY public.user_organization_roles (user_id, organization_id, role_id, created_at, updated_at) FROM stdin;
    public               postgres    false    235   �/      2          0    91732    user_tutorial_views 
   TABLE DATA           T   COPY public.user_tutorial_views (user_id, tutorial_video_id, viewed_at) FROM stdin;
    public               postgres    false    246   .0      (          0    66347    users 
   TABLE DATA             COPY public.users (id, rut, email, password_hash, first_name, last_name, phone, is_active, last_login, created_at, failed_login_attempts, account_locked, last_failed_login, updated_at, mfa_code_hash, mfa_code_expires_at, reset_password_token_hash, reset_password_expires_at) FROM stdin;
    public               postgres    false    236   y0      *          0    66359    withdrawal_reasons 
   TABLE DATA           N   COPY public.withdrawal_reasons (id, name, created_at, updated_at) FROM stdin;
    public               postgres    false    238   �1      ,          0    66365    withdrawals 
   TABLE DATA           �  COPY public.withdrawals (id, qr_authorization_id, student_id, organization_approver_user_id, reason_id, method, contact_verified, created_at, retriever_user_id, retriever_delegate_id, retriever_emergency_contact_id, retriever_name_if_other, guardian_authorizer_user_id, guardian_authorizer_emergency_contact_id, custom_withdrawal_reason, organization_id, retriever_rut_if_other, retriever_relationship_if_other, withdrawal_time, notes, updated_at, status) FROM stdin;
    public               postgres    false    240   �2      H           0    0    audit_log_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.audit_log_id_seq', 468, true);
          public               postgres    false    219            I           0    0    courses_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.courses_id_seq', 31, true);
          public               postgres    false    221            J           0    0    delegates_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.delegates_id_seq', 1, false);
          public               postgres    false    223            K           0    0    emergency_contacts_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public.emergency_contacts_id_seq', 1, false);
          public               postgres    false    225            L           0    0    organizations_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.organizations_id_seq', 35, true);
          public               postgres    false    227            M           0    0    qr_authorizations_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.qr_authorizations_id_seq', 9, true);
          public               postgres    false    229            N           0    0    roles_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.roles_id_seq', 9, true);
          public               postgres    false    231            O           0    0    students_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.students_id_seq', 94, true);
          public               postgres    false    233            P           0    0    support_tickets_id_ticket_seq    SEQUENCE SET     K   SELECT pg_catalog.setval('public.support_tickets_id_ticket_seq', 9, true);
          public               postgres    false    242            Q           0    0    ticket_number_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.ticket_number_seq', 1000, false);
          public               postgres    false    234            R           0    0    tutorial_videos_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.tutorial_videos_id_seq', 3, true);
          public               postgres    false    244            S           0    0    users_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.users_id_seq', 76, true);
          public               postgres    false    237            T           0    0    withdrawal_reasons_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.withdrawal_reasons_id_seq', 7, true);
          public               postgres    false    239            U           0    0    withdrawals_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.withdrawals_id_seq', 6, true);
          public               postgres    false    241                       2606    66385     SequelizeMeta SequelizeMeta_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);
 N   ALTER TABLE ONLY public."SequelizeMeta" DROP CONSTRAINT "SequelizeMeta_pkey";
       public                 postgres    false    217                       2606    66387    audit_log audit_log_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.audit_log DROP CONSTRAINT audit_log_pkey;
       public                 postgres    false    218                       2606    66389 (   courses courses_name_organization_id_key 
   CONSTRAINT     t   ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_name_organization_id_key UNIQUE (name, organization_id);
 R   ALTER TABLE ONLY public.courses DROP CONSTRAINT courses_name_organization_id_key;
       public                 postgres    false    220    220                       2606    66391    courses courses_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.courses DROP CONSTRAINT courses_pkey;
       public                 postgres    false    220                       2606    66393    delegates delegates_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.delegates
    ADD CONSTRAINT delegates_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.delegates DROP CONSTRAINT delegates_pkey;
       public                 postgres    false    222            !           2606    66395 *   emergency_contacts emergency_contacts_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public.emergency_contacts
    ADD CONSTRAINT emergency_contacts_pkey PRIMARY KEY (id);
 T   ALTER TABLE ONLY public.emergency_contacts DROP CONSTRAINT emergency_contacts_pkey;
       public                 postgres    false    224            $           2606    66399     organizations organizations_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.organizations DROP CONSTRAINT organizations_pkey;
       public                 postgres    false    226            +           2606    66401 ,   qr_authorizations qr_authorizations_code_key 
   CONSTRAINT     g   ALTER TABLE ONLY public.qr_authorizations
    ADD CONSTRAINT qr_authorizations_code_key UNIQUE (code);
 V   ALTER TABLE ONLY public.qr_authorizations DROP CONSTRAINT qr_authorizations_code_key;
       public                 postgres    false    228            -           2606    66403 (   qr_authorizations qr_authorizations_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.qr_authorizations
    ADD CONSTRAINT qr_authorizations_pkey PRIMARY KEY (id);
 R   ALTER TABLE ONLY public.qr_authorizations DROP CONSTRAINT qr_authorizations_pkey;
       public                 postgres    false    228            /           2606    66405    roles roles_name_key 
   CONSTRAINT     O   ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);
 >   ALTER TABLE ONLY public.roles DROP CONSTRAINT roles_name_key;
       public                 postgres    false    230            1           2606    66407    roles roles_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.roles DROP CONSTRAINT roles_pkey;
       public                 postgres    false    230            7           2606    66409    students students_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.students DROP CONSTRAINT students_pkey;
       public                 postgres    false    232            9           2606    66411    students students_rut_key 
   CONSTRAINT     S   ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_rut_key UNIQUE (rut);
 C   ALTER TABLE ONLY public.students DROP CONSTRAINT students_rut_key;
       public                 postgres    false    232            Y           2606    91711 $   support_tickets support_tickets_pkey 
   CONSTRAINT     i   ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id_ticket);
 N   ALTER TABLE ONLY public.support_tickets DROP CONSTRAINT support_tickets_pkey;
       public                 postgres    false    243            [           2606    91713 3   support_tickets support_tickets_tracking_number_key 
   CONSTRAINT     y   ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_tracking_number_key UNIQUE (tracking_number);
 ]   ALTER TABLE ONLY public.support_tickets DROP CONSTRAINT support_tickets_tracking_number_key;
       public                 postgres    false    243            ]           2606    91731 $   tutorial_videos tutorial_videos_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.tutorial_videos
    ADD CONSTRAINT tutorial_videos_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.tutorial_videos DROP CONSTRAINT tutorial_videos_pkey;
       public                 postgres    false    245            U           2606    66718 .   withdrawals uq_withdrawals_qr_authorization_id 
   CONSTRAINT     x   ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT uq_withdrawals_qr_authorization_id UNIQUE (qr_authorization_id);
 X   ALTER TABLE ONLY public.withdrawals DROP CONSTRAINT uq_withdrawals_qr_authorization_id;
       public                 postgres    false    240            >           2606    91692 4   user_organization_roles user_organization_roles_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.user_organization_roles
    ADD CONSTRAINT user_organization_roles_pkey PRIMARY KEY (user_id, organization_id);
 ^   ALTER TABLE ONLY public.user_organization_roles DROP CONSTRAINT user_organization_roles_pkey;
       public                 postgres    false    235    235            _           2606    91737 ,   user_tutorial_views user_tutorial_views_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.user_tutorial_views
    ADD CONSTRAINT user_tutorial_views_pkey PRIMARY KEY (user_id, tutorial_video_id);
 V   ALTER TABLE ONLY public.user_tutorial_views DROP CONSTRAINT user_tutorial_views_pkey;
       public                 postgres    false    246    246            B           2606    66415    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public                 postgres    false    236            D           2606    66417    users users_rut_key 
   CONSTRAINT     M   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_rut_key UNIQUE (rut);
 =   ALTER TABLE ONLY public.users DROP CONSTRAINT users_rut_key;
       public                 postgres    false    236            F           2606    66419 .   withdrawal_reasons withdrawal_reasons_name_key 
   CONSTRAINT     i   ALTER TABLE ONLY public.withdrawal_reasons
    ADD CONSTRAINT withdrawal_reasons_name_key UNIQUE (name);
 X   ALTER TABLE ONLY public.withdrawal_reasons DROP CONSTRAINT withdrawal_reasons_name_key;
       public                 postgres    false    238            H           2606    66421 *   withdrawal_reasons withdrawal_reasons_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public.withdrawal_reasons
    ADD CONSTRAINT withdrawal_reasons_pkey PRIMARY KEY (id);
 T   ALTER TABLE ONLY public.withdrawal_reasons DROP CONSTRAINT withdrawal_reasons_pkey;
       public                 postgres    false    238            W           2606    66423    withdrawals withdrawals_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.withdrawals DROP CONSTRAINT withdrawals_pkey;
       public                 postgres    false    240                       1259    66928    idx_audit_log_changed_at    INDEX     T   CREATE INDEX idx_audit_log_changed_at ON public.audit_log USING btree (changed_at);
 ,   DROP INDEX public.idx_audit_log_changed_at;
       public                 postgres    false    218                       1259    66425 "   idx_audit_log_table_name_record_id    INDEX     i   CREATE INDEX idx_audit_log_table_name_record_id ON public.audit_log USING btree (table_name, record_id);
 6   DROP INDEX public.idx_audit_log_table_name_record_id;
       public                 postgres    false    218    218                       1259    66426    idx_audit_log_user_id    INDEX     N   CREATE INDEX idx_audit_log_user_id ON public.audit_log USING btree (user_id);
 )   DROP INDEX public.idx_audit_log_user_id;
       public                 postgres    false    218                       1259    66427    idx_courses_organization_id    INDEX     Z   CREATE INDEX idx_courses_organization_id ON public.courses USING btree (organization_id);
 /   DROP INDEX public.idx_courses_organization_id;
       public                 postgres    false    220                       1259    66428    idx_delegates_parent_user_id    INDEX     \   CREATE INDEX idx_delegates_parent_user_id ON public.delegates USING btree (parent_user_id);
 0   DROP INDEX public.idx_delegates_parent_user_id;
       public                 postgres    false    222            "           1259    66429 %   idx_emergency_contacts_parent_user_id    INDEX     n   CREATE INDEX idx_emergency_contacts_parent_user_id ON public.emergency_contacts USING btree (parent_user_id);
 9   DROP INDEX public.idx_emergency_contacts_parent_user_id;
       public                 postgres    false    224            %           1259    83502    idx_qr_authorizations_code    INDEX     X   CREATE INDEX idx_qr_authorizations_code ON public.qr_authorizations USING btree (code);
 .   DROP INDEX public.idx_qr_authorizations_code;
       public                 postgres    false    228            &           1259    67047     idx_qr_authorizations_expires_at    INDEX     d   CREATE INDEX idx_qr_authorizations_expires_at ON public.qr_authorizations USING btree (expires_at);
 4   DROP INDEX public.idx_qr_authorizations_expires_at;
       public                 postgres    false    228            '           1259    66433 "   idx_qr_authorizations_generated_by    INDEX     p   CREATE INDEX idx_qr_authorizations_generated_by ON public.qr_authorizations USING btree (generated_by_user_id);
 6   DROP INDEX public.idx_qr_authorizations_generated_by;
       public                 postgres    false    228            (           1259    66434    idx_qr_authorizations_reason_id    INDEX     b   CREATE INDEX idx_qr_authorizations_reason_id ON public.qr_authorizations USING btree (reason_id);
 3   DROP INDEX public.idx_qr_authorizations_reason_id;
       public                 postgres    false    228            )           1259    66435     idx_qr_authorizations_student_id    INDEX     d   CREATE INDEX idx_qr_authorizations_student_id ON public.qr_authorizations USING btree (student_id);
 4   DROP INDEX public.idx_qr_authorizations_student_id;
       public                 postgres    false    228            2           1259    66436    idx_students_course_id    INDEX     P   CREATE INDEX idx_students_course_id ON public.students USING btree (course_id);
 *   DROP INDEX public.idx_students_course_id;
       public                 postgres    false    232            3           1259    66437    idx_students_organization_id    INDEX     \   CREATE INDEX idx_students_organization_id ON public.students USING btree (organization_id);
 0   DROP INDEX public.idx_students_organization_id;
       public                 postgres    false    232            4           1259    66438    idx_students_parent_user_id    INDEX     Z   CREATE INDEX idx_students_parent_user_id ON public.students USING btree (parent_user_id);
 /   DROP INDEX public.idx_students_parent_user_id;
       public                 postgres    false    232            5           1259    66439    idx_students_rut    INDEX     D   CREATE INDEX idx_students_rut ON public.students USING btree (rut);
 $   DROP INDEX public.idx_students_rut;
       public                 postgres    false    232            :           1259    66440 +   idx_user_organization_roles_organization_id    INDEX     z   CREATE INDEX idx_user_organization_roles_organization_id ON public.user_organization_roles USING btree (organization_id);
 ?   DROP INDEX public.idx_user_organization_roles_organization_id;
       public                 postgres    false    235            ;           1259    66441 #   idx_user_organization_roles_role_id    INDEX     j   CREATE INDEX idx_user_organization_roles_role_id ON public.user_organization_roles USING btree (role_id);
 7   DROP INDEX public.idx_user_organization_roles_role_id;
       public                 postgres    false    235            <           1259    66442 #   idx_user_organization_roles_user_id    INDEX     j   CREATE INDEX idx_user_organization_roles_user_id ON public.user_organization_roles USING btree (user_id);
 7   DROP INDEX public.idx_user_organization_roles_user_id;
       public                 postgres    false    235            ?           1259    66443    idx_users_email    INDEX     B   CREATE INDEX idx_users_email ON public.users USING btree (email);
 #   DROP INDEX public.idx_users_email;
       public                 postgres    false    236            @           1259    66444    idx_users_rut    INDEX     >   CREATE INDEX idx_users_rut ON public.users USING btree (rut);
 !   DROP INDEX public.idx_users_rut;
       public                 postgres    false    236            I           1259    66993    idx_withdrawals_created_at    INDEX     X   CREATE INDEX idx_withdrawals_created_at ON public.withdrawals USING btree (created_at);
 .   DROP INDEX public.idx_withdrawals_created_at;
       public                 postgres    false    240            J           1259    66446 8   idx_withdrawals_guardian_authorizer_emergency_contact_id    INDEX     �   CREATE INDEX idx_withdrawals_guardian_authorizer_emergency_contact_id ON public.withdrawals USING btree (guardian_authorizer_emergency_contact_id);
 L   DROP INDEX public.idx_withdrawals_guardian_authorizer_emergency_contact_id;
       public                 postgres    false    240            K           1259    66447 +   idx_withdrawals_guardian_authorizer_user_id    INDEX     z   CREATE INDEX idx_withdrawals_guardian_authorizer_user_id ON public.withdrawals USING btree (guardian_authorizer_user_id);
 ?   DROP INDEX public.idx_withdrawals_guardian_authorizer_user_id;
       public                 postgres    false    240            L           1259    66448 -   idx_withdrawals_organization_approver_user_id    INDEX     ~   CREATE INDEX idx_withdrawals_organization_approver_user_id ON public.withdrawals USING btree (organization_approver_user_id);
 A   DROP INDEX public.idx_withdrawals_organization_approver_user_id;
       public                 postgres    false    240            M           1259    66449 #   idx_withdrawals_qr_authorization_id    INDEX     j   CREATE INDEX idx_withdrawals_qr_authorization_id ON public.withdrawals USING btree (qr_authorization_id);
 7   DROP INDEX public.idx_withdrawals_qr_authorization_id;
       public                 postgres    false    240            N           1259    66450    idx_withdrawals_reason_id    INDEX     V   CREATE INDEX idx_withdrawals_reason_id ON public.withdrawals USING btree (reason_id);
 -   DROP INDEX public.idx_withdrawals_reason_id;
       public                 postgres    false    240            O           1259    66451 %   idx_withdrawals_retriever_delegate_id    INDEX     n   CREATE INDEX idx_withdrawals_retriever_delegate_id ON public.withdrawals USING btree (retriever_delegate_id);
 9   DROP INDEX public.idx_withdrawals_retriever_delegate_id;
       public                 postgres    false    240            P           1259    66452 .   idx_withdrawals_retriever_emergency_contact_id    INDEX     �   CREATE INDEX idx_withdrawals_retriever_emergency_contact_id ON public.withdrawals USING btree (retriever_emergency_contact_id);
 B   DROP INDEX public.idx_withdrawals_retriever_emergency_contact_id;
       public                 postgres    false    240            Q           1259    66453 !   idx_withdrawals_retriever_user_id    INDEX     f   CREATE INDEX idx_withdrawals_retriever_user_id ON public.withdrawals USING btree (retriever_user_id);
 5   DROP INDEX public.idx_withdrawals_retriever_user_id;
       public                 postgres    false    240            R           1259    83501    idx_withdrawals_status    INDEX     P   CREATE INDEX idx_withdrawals_status ON public.withdrawals USING btree (status);
 *   DROP INDEX public.idx_withdrawals_status;
       public                 postgres    false    240            S           1259    66454    idx_withdrawals_student_id    INDEX     X   CREATE INDEX idx_withdrawals_student_id ON public.withdrawals USING btree (student_id);
 .   DROP INDEX public.idx_withdrawals_student_id;
       public                 postgres    false    240            z           2620    67119 &   courses trigger_uppercase_courses_name    TRIGGER     �   CREATE TRIGGER trigger_uppercase_courses_name BEFORE INSERT OR UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.uppercase_name_column_func();
 ?   DROP TRIGGER trigger_uppercase_courses_name ON public.courses;
       public               postgres    false    220    248            {           2620    67120 *   delegates trigger_uppercase_delegates_name    TRIGGER     �   CREATE TRIGGER trigger_uppercase_delegates_name BEFORE INSERT OR UPDATE ON public.delegates FOR EACH ROW EXECUTE FUNCTION public.uppercase_name_column_func();
 C   DROP TRIGGER trigger_uppercase_delegates_name ON public.delegates;
       public               postgres    false    222    248            |           2620    67121 ?   emergency_contacts trigger_uppercase_emergency_contacts_details    TRIGGER     �   CREATE TRIGGER trigger_uppercase_emergency_contacts_details BEFORE INSERT OR UPDATE ON public.emergency_contacts FOR EACH ROW EXECUTE FUNCTION public.uppercase_emergency_contact_details_func();
 X   DROP TRIGGER trigger_uppercase_emergency_contacts_details ON public.emergency_contacts;
       public               postgres    false    224    251            }           2620    67122 5   organizations trigger_uppercase_organizations_details    TRIGGER     �   CREATE TRIGGER trigger_uppercase_organizations_details BEFORE INSERT OR UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.uppercase_organization_details_func();
 N   DROP TRIGGER trigger_uppercase_organizations_details ON public.organizations;
       public               postgres    false    226    250            ~           2620    67123 "   roles trigger_uppercase_roles_name    TRIGGER     �   CREATE TRIGGER trigger_uppercase_roles_name BEFORE INSERT OR UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.uppercase_name_column_func();
 ;   DROP TRIGGER trigger_uppercase_roles_name ON public.roles;
       public               postgres    false    248    230                       2620    67124 )   students trigger_uppercase_students_names    TRIGGER     �   CREATE TRIGGER trigger_uppercase_students_names BEFORE INSERT OR UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.uppercase_first_last_name_columns_func();
 B   DROP TRIGGER trigger_uppercase_students_names ON public.students;
       public               postgres    false    232    249            �           2620    67125 #   users trigger_uppercase_users_names    TRIGGER     �   CREATE TRIGGER trigger_uppercase_users_names BEFORE INSERT OR UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.uppercase_first_last_name_columns_func();
 <   DROP TRIGGER trigger_uppercase_users_names ON public.users;
       public               postgres    false    249    236            �           2620    67126 <   withdrawal_reasons trigger_uppercase_withdrawal_reasons_name    TRIGGER     �   CREATE TRIGGER trigger_uppercase_withdrawal_reasons_name BEFORE INSERT OR UPDATE ON public.withdrawal_reasons FOR EACH ROW EXECUTE FUNCTION public.uppercase_name_column_func();
 U   DROP TRIGGER trigger_uppercase_withdrawal_reasons_name ON public.withdrawal_reasons;
       public               postgres    false    238    248            �           2620    66455    users users_audit    TRIGGER     ~   CREATE TRIGGER users_audit AFTER INSERT OR DELETE OR UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.log_audit();
 *   DROP TRIGGER users_audit ON public.users;
       public               postgres    false    247    236            �           2620    66456    withdrawals withdrawals_audit    TRIGGER     �   CREATE TRIGGER withdrawals_audit AFTER INSERT OR DELETE OR UPDATE ON public.withdrawals FOR EACH ROW EXECUTE FUNCTION public.log_audit();
 6   DROP TRIGGER withdrawals_audit ON public.withdrawals;
       public               postgres    false    240    247            `           2606    66457 $   courses courses_organization_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
 N   ALTER TABLE ONLY public.courses DROP CONSTRAINT courses_organization_id_fkey;
       public               postgres    false    220    226    4900            a           2606    66462 '   delegates delegates_parent_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.delegates
    ADD CONSTRAINT delegates_parent_user_id_fkey FOREIGN KEY (parent_user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 Q   ALTER TABLE ONLY public.delegates DROP CONSTRAINT delegates_parent_user_id_fkey;
       public               postgres    false    4930    236    222            b           2606    66472 /   emergency_contacts fk_emergency_contacts_parent    FK CONSTRAINT     �   ALTER TABLE ONLY public.emergency_contacts
    ADD CONSTRAINT fk_emergency_contacts_parent FOREIGN KEY (parent_user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 Y   ALTER TABLE ONLY public.emergency_contacts DROP CONSTRAINT fk_emergency_contacts_parent;
       public               postgres    false    4930    236    224            c           2606    66633 )   qr_authorizations fk_qr_assigned_delegate    FK CONSTRAINT     �   ALTER TABLE ONLY public.qr_authorizations
    ADD CONSTRAINT fk_qr_assigned_delegate FOREIGN KEY (assigned_delegate_id) REFERENCES public.delegates(id) ON UPDATE CASCADE ON DELETE SET NULL;
 S   ALTER TABLE ONLY public.qr_authorizations DROP CONSTRAINT fk_qr_assigned_delegate;
       public               postgres    false    228    222    4894            d           2606    66719 )   qr_authorizations fk_qr_generated_by_user    FK CONSTRAINT     �   ALTER TABLE ONLY public.qr_authorizations
    ADD CONSTRAINT fk_qr_generated_by_user FOREIGN KEY (generated_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
 S   ALTER TABLE ONLY public.qr_authorizations DROP CONSTRAINT fk_qr_generated_by_user;
       public               postgres    false    228    4930    236            g           2606    66477    students fk_students_course    FK CONSTRAINT     �   ALTER TABLE ONLY public.students
    ADD CONSTRAINT fk_students_course FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE SET NULL;
 E   ALTER TABLE ONLY public.students DROP CONSTRAINT fk_students_course;
       public               postgres    false    220    4891    232            h           2606    66482     students fk_students_parent_user    FK CONSTRAINT     �   ALTER TABLE ONLY public.students
    ADD CONSTRAINT fk_students_parent_user FOREIGN KEY (parent_user_id) REFERENCES public.users(id) ON DELETE SET NULL;
 J   ALTER TABLE ONLY public.students DROP CONSTRAINT fk_students_parent_user;
       public               postgres    false    4930    232    236            m           2606    66704 '   withdrawals fk_withdrawals_organization    FK CONSTRAINT     �   ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT fk_withdrawals_organization FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 Q   ALTER TABLE ONLY public.withdrawals DROP CONSTRAINT fk_withdrawals_organization;
       public               postgres    false    226    4900    240            n           2606    66709 !   withdrawals fk_withdrawals_reason    FK CONSTRAINT     �   ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT fk_withdrawals_reason FOREIGN KEY (reason_id) REFERENCES public.withdrawal_reasons(id) ON UPDATE CASCADE ON DELETE SET NULL;
 K   ALTER TABLE ONLY public.withdrawals DROP CONSTRAINT fk_withdrawals_reason;
       public               postgres    false    238    240    4936            e           2606    66497 2   qr_authorizations qr_authorizations_reason_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.qr_authorizations
    ADD CONSTRAINT qr_authorizations_reason_id_fkey FOREIGN KEY (reason_id) REFERENCES public.withdrawal_reasons(id);
 \   ALTER TABLE ONLY public.qr_authorizations DROP CONSTRAINT qr_authorizations_reason_id_fkey;
       public               postgres    false    4936    228    238            f           2606    66502 3   qr_authorizations qr_authorizations_student_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.qr_authorizations
    ADD CONSTRAINT qr_authorizations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);
 ]   ALTER TABLE ONLY public.qr_authorizations DROP CONSTRAINT qr_authorizations_student_id_fkey;
       public               postgres    false    228    232    4919            i           2606    66507 &   students students_organization_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);
 P   ALTER TABLE ONLY public.students DROP CONSTRAINT students_organization_id_fkey;
       public               postgres    false    226    232    4900            w           2606    91714 ,   support_tickets support_tickets_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 V   ALTER TABLE ONLY public.support_tickets DROP CONSTRAINT support_tickets_user_id_fkey;
       public               postgres    false    243    236    4930            j           2606    66517 D   user_organization_roles user_organization_roles_organization_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.user_organization_roles
    ADD CONSTRAINT user_organization_roles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
 n   ALTER TABLE ONLY public.user_organization_roles DROP CONSTRAINT user_organization_roles_organization_id_fkey;
       public               postgres    false    226    235    4900            k           2606    66522 <   user_organization_roles user_organization_roles_role_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.user_organization_roles
    ADD CONSTRAINT user_organization_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;
 f   ALTER TABLE ONLY public.user_organization_roles DROP CONSTRAINT user_organization_roles_role_id_fkey;
       public               postgres    false    4913    235    230            l           2606    66527 <   user_organization_roles user_organization_roles_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.user_organization_roles
    ADD CONSTRAINT user_organization_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 f   ALTER TABLE ONLY public.user_organization_roles DROP CONSTRAINT user_organization_roles_user_id_fkey;
       public               postgres    false    4930    235    236            x           2606    91743 >   user_tutorial_views user_tutorial_views_tutorial_video_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.user_tutorial_views
    ADD CONSTRAINT user_tutorial_views_tutorial_video_id_fkey FOREIGN KEY (tutorial_video_id) REFERENCES public.tutorial_videos(id) ON DELETE CASCADE;
 h   ALTER TABLE ONLY public.user_tutorial_views DROP CONSTRAINT user_tutorial_views_tutorial_video_id_fkey;
       public               postgres    false    245    246    4957            y           2606    91738 4   user_tutorial_views user_tutorial_views_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.user_tutorial_views
    ADD CONSTRAINT user_tutorial_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 ^   ALTER TABLE ONLY public.user_tutorial_views DROP CONSTRAINT user_tutorial_views_user_id_fkey;
       public               postgres    false    4930    236    246            o           2606    66532 E   withdrawals withdrawals_guardian_authorizer_emergency_contact_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_guardian_authorizer_emergency_contact_id_fkey FOREIGN KEY (guardian_authorizer_emergency_contact_id) REFERENCES public.emergency_contacts(id) ON DELETE SET NULL;
 o   ALTER TABLE ONLY public.withdrawals DROP CONSTRAINT withdrawals_guardian_authorizer_emergency_contact_id_fkey;
       public               postgres    false    224    240    4897            p           2606    66537 8   withdrawals withdrawals_guardian_authorizer_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_guardian_authorizer_user_id_fkey FOREIGN KEY (guardian_authorizer_user_id) REFERENCES public.users(id) ON DELETE SET NULL;
 b   ALTER TABLE ONLY public.withdrawals DROP CONSTRAINT withdrawals_guardian_authorizer_user_id_fkey;
       public               postgres    false    236    240    4930            q           2606    66542 )   withdrawals withdrawals_processed_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_processed_by_fkey FOREIGN KEY (organization_approver_user_id) REFERENCES public.users(id);
 S   ALTER TABLE ONLY public.withdrawals DROP CONSTRAINT withdrawals_processed_by_fkey;
       public               postgres    false    236    4930    240            r           2606    66547 0   withdrawals withdrawals_qr_authorization_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_qr_authorization_id_fkey FOREIGN KEY (qr_authorization_id) REFERENCES public.qr_authorizations(id);
 Z   ALTER TABLE ONLY public.withdrawals DROP CONSTRAINT withdrawals_qr_authorization_id_fkey;
       public               postgres    false    228    240    4909            s           2606    66557 2   withdrawals withdrawals_retriever_delegate_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_retriever_delegate_id_fkey FOREIGN KEY (retriever_delegate_id) REFERENCES public.delegates(id) ON DELETE SET NULL;
 \   ALTER TABLE ONLY public.withdrawals DROP CONSTRAINT withdrawals_retriever_delegate_id_fkey;
       public               postgres    false    222    4894    240            t           2606    66562 ;   withdrawals withdrawals_retriever_emergency_contact_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_retriever_emergency_contact_id_fkey FOREIGN KEY (retriever_emergency_contact_id) REFERENCES public.emergency_contacts(id) ON DELETE SET NULL;
 e   ALTER TABLE ONLY public.withdrawals DROP CONSTRAINT withdrawals_retriever_emergency_contact_id_fkey;
       public               postgres    false    4897    224    240            u           2606    66567 .   withdrawals withdrawals_retriever_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_retriever_user_id_fkey FOREIGN KEY (retriever_user_id) REFERENCES public.users(id) ON DELETE SET NULL;
 X   ALTER TABLE ONLY public.withdrawals DROP CONSTRAINT withdrawals_retriever_user_id_fkey;
       public               postgres    false    240    4930    236            v           2606    66572 '   withdrawals withdrawals_student_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);
 Q   ALTER TABLE ONLY public.withdrawals DROP CONSTRAINT withdrawals_student_id_fkey;
       public               postgres    false    4919    232    240                  x������ � �            x�����-;���<�y��-�5<AD�8;AA��|}�R�Y���Iw�7��YI*u��������ۿ���������?����0��*�����B�RɩV��0�MP�6��W������?}G �^�6�,�	�CH�RB6"/J?��J�¶qm(c��C(�^��D5e4����%��4>	H�� xn��s�,f���ƍSn�[H�J�}}�� [��%}�o"�b������E|��-��ő�޿�����ŶЋ��E��[����A:¼% �}LD���G�V�p���=��}�q�{89�J@��fa�~�r:�ڱ!z��@�Q�QGѶ���\"�X$�F��8����¢�5�{���W�e3���a�Ftg�� ��a�DՇm,����j�Ft'iS_��щ�)� Q7�BGh�&��IG�6߽w٪$v����'�}R���˺����wDM��0��j�;"����\m~R�����rq�O�6=���\0�@�}��N������ףR�#�s�#�KL��|ݖ��-��C�P<p�D}�J��At.	jK}�Xn!�b�o�w�[��R?�|���W��c��K֑:E�(�U�.��1Ͻ�ј�����I��u�s���C�i�ɑy�? [F3��C��-j���!���&��{�U��"�$�J��7�����������왛�=�{�#��	�O?Ͻ�@H#�ٽ~�{�#�k%{8�s�D4ᩂ������Y%$�>)_�}M���r�&��n�GQ��|Q�eG�n����D�s���#��
���j�;��{Ι�[��wD��@�s)W��F�>�r���ԗh@���\��"Z��M]�'I�j�J6{d7�r����8C�d�\o>�TLR�@�7��~��aכ�6��t��_o�"��6d�z����^o~ ����R�7_ݘ�0�}��^o>g�. �������wDOxV�@�`j)%�c�����r���َ�4uI�b7v?�ܒ���_�o���^�������yq��n�}��H�(Z�r��B�&��]9�D���r�)V�T�F�j�r�;½
iŶ�#{����i���n.m���E�w�̃���?�ぐ�$Kx݇�6��(�Y��U��ȳ�~]e���zdϬ4Ȯ�����1Ir�'�Fw3I�݄D��ly@̇�0"��[��\3ZX��h{r)�b,!Fr��fZ�X�z�1]����#�V�u���"�Z��Ov%
�� D�Wtݪ�\9���4�L}���t`S��-�ȥ+nT�,�8�80�h(E �@pd���n���p_�����),C��hXScKq�a�S��k=����Xȩ��k����?��kIZ)^�|���r#K�)�K &L)��S[��1^�g��м�)^�gږ+��v��tF�%w� ��?0��|���9�^�g�������|���6�8�\�AG�n��x�
��h����҅8�lK�Q���Z�G��հ[�B<"�%5��\yg��Y
q~�M��B�3W�`09�|���2�K�����Bg49d-?<e��
�d=q�F|�
z��(I�a��n\�W��7����<%bK��hB-|R���+g ]�6��'�Wf ]t�D�l���8�Rg�� ���y�h�>��c�i��k +3�ߦk�'��%���  �ZVQk.��Vv��]�(R�������F49�xU�Rde�7��TH$�QY��`���5�ıK;���t�-I�k=���ф�dk�F1�����YJ�3fi��A?��x�Zj��~:LQ7y�R$<2���-Dȋ�Җ�
,U�`��� D�Yʄ�X�ci�P��R'�~��K�)<���
�5�~�������6N�A���,��#S*�YJ���) V)�j�:c�n���Wm)���e�5���Z8��jqZ${K����۫(H�za0��e�,�9��
,�3_�9	�8V��������-%�`̽Y���ߗ��Y[�I�]���q�hXO4G}��wM�sf��A]�����x놟�G�݋fJ~�o��i��J�nv��w��?����$i�V������m�억;��<M���	����hߤ������}��fyX)�9=��%�h��:��4E��e�guG��L{���4��|��?��zo�6o�3me:��յ��L \m�Y��	�4g�h���\�ô4�Θ�Z�؎��:c]-�U���Ai�|P��CbŌ�;��٧�љ^ge�X�������E�.e>c(�&M�pg��{g�j"e\��!�a��8�nw�hn��MC��φ�#d���rB�	�GH���W�������l���\قM��h�U$:��s����j>&����҇��� լK�:�><�]���wC�9�]r�7����to�of�;T�$Ek�[����ػ��-����e�.ii��:����P�ȳ`��ϡ��g�4���P�Hi/pq��L��c$�-������?z~��L�i62�w~��og�`�&�ƅ�Y�g��C&�zƄK��Ь�.�sI��.%�`��=R�0�Y	gZ:$�������*�b.�e$.5?g��s)-�sa�f;P��3�tF�x��Ѻ�����<��!�ѩ��Y'�uLG��nt���d��ȫ����ro3U���8d?:�?5��,�b�&����q��#v}��G�>�!�V��ϡ��8�?:�YU,ZAD��N}�bi���ǧ.���E����s��#�� �6䐆��h�<7"�ji�a8�?��C�F����6�].K��8���;fK7=�(1��1þ�"a�K��ͰVպ
~���ߛѼI��ۙU�@0&�hݚ�W�(+��4�c�鬊ɁpژB�Ƽ�%���Ԣ~�3�Wݡ�H�M�Z��m�U{�`�n��D�[��� ��I}4�����?�������O��bvO����&_ȳ�$[�M��1��<;O�-^z��h�?v0~��W����u�:#�_�k:����%�-j����nC�3��@��]}_á�w��t��tI�ϼ�C��j�'%lp��r�^�:	�"/G;UPN�����������!yC�+^{����J����[��N��w*������.��ހz#mmE���
{D�C$�C\C�M�4g������|Jb�p��������t�W���h_�eW!�t���m��C������w�9ÞBqPN��Rc-Q���B9�G�jr{8�GF�1�a��P��M����!'�}@�Rr	�)��> M���2�L��`4�h�vC�̓�> -��Jrh<-���e*9R����?��zpgB?�!rG,"c�y1�ӧ�x��nm+Za
)�Q�Ǌ��'	�	l�"s0��1���Т۰#��ZӪ�kvf^c�Z ~)Li^c���t%�c��ʇ'��=�ZǤaم;Bd}�Ć�Ш+�hO��(}��-��g�I�{H��`��IO~ވO~�p
O~�pO~�xd���а����#��4��#��H| �<�	4�Hz 9�	4�i~ ��Cy ����݁����-���݃��ʇ$Il���}�=܇��x����`�.Ilo��d!v��'1Ĩf4�I~`FC��fć��>4*��4�Iy�OC���4�Iy�OC��>��Z���;�l�-l�'�C8����"��䊱v��-^�}ri�1�����J��w蓟�ٜ��	`�_�?Z�Z�W�>Y�S��Ն1l�O.ҼM����}��O9\��}�9>C�hXL��
)>L��,q���-:w��CG�Q.jN#����Zjc.jN�*��}L��]Ԝ�/�L%���B��֏ͺ��/�,�w��<�����Т_q0�����PӢaq0b�~�A��ŝ�.i�f�҂����1o�@|g����4��<P��-:��N.��\�A��R*��3���)���C͍¬�0�?e���bSr��G:w"҃ZrJ�PI��C#X|
r�o��<�o�&�,Z`\% �  g�x�HC�̟2��7���4���)��7�>q���L�O��-	�_N�P&���,�!)�d���BX�.С�"ʧ����x�>�n�S��
	؃�i���!�B.�ѻCrn�Δ�%�vH�enE�RZ��!M�Y.�_h����\�䚱����74��<K �B�uX����xz?���J������\r@���&A���^����d��P�>Z�gg(�k�a+��F@p�0�����C�\A��L�ZN�[�9�ƥ�H|b�95*1�Uİ0���1P���d�iZv�܂,w�tÛn��R. ���� n9�0!aY��3�0J�ܰ����n�AmKM7�W|�4z0�m�k�\��=H�0�Ƌ�{��&�Ht�tOc���il���e[�h��!S�����u@=��{ v��I�=���H��ytޟ��n�3�7A=�5g��,��K�r�����OnޚKK��r���T[�$�r�����d���Y�.�Ϭ�{�N6{�UoHz��hC�,��1���}�O܇��}�O܇��mhH��4Ü@#�8M'�H(N�	��70z���|����P,'�䔙?��3�z���,�Z���W�2�'�s�}w�+��C'�H������}�;������v��2,�y�:M���sc?OW��C~wH>`�J80�����-��o�vF��C"��y0�?�0eo���~�������93�`ƜY��	�T��S��5̰��Pg���Rֱ��'�e�F~�,U�	���ɽ�Zm'�,U&�Ւl�'�'���wF�D����F
�%Yx��%�k�qgؚ�#�_k�;c*`���\����\�#(����4MڄR	�Y����}L���B�q>�3"��K����a$������?�Q���         -  x���;R1c�s�qI���$D�\�q�[v�����K�_s���l�o/���ɉSִrZ�,�:���7�+�?�8�"�.����<����\5�Yڱ�H�	ې(@O�h4p���	s��¿�s]��'M6���>�I1"�qX�a��3a�@�@$͈`ZŢ�Hو`Zâ6E�҉4�D���4,�)
F��Dᵞ�4�|&-����&#�iQ�h �lD0-�2iq�LZ��?i5"�VqZ�i͈`Zç66���.�^]�{L=�����v{��|��R{�>�q�=� �qX            x������ � �            x������ � �         k   x���
�  �s��|@�D-���G�k/��hk���o���u/�VL��%�M�Z��&-��Jמq�~�t5=����"bه7x�b�_F�9����Dc�a}��c~v��             x������ � �      "     x��P�N�@>�O1 T@�F�+޸Lv�:fw��nM�m|�/�R��^���w���e��C���8@�( <�N�8
�	�M� 9 �C$�l�H��$�%�L.�������5:�@���] j��g/�l#��]��:�x?�*J�C�|M)Y9,'��xP�`4���y9-��W��8�پ��lUm�˛���[C�rH�zOhR�CA�#9����k�����q��E��=E��w��lq{��~[W�m�4�������-��{������E��_��      $   �   x���1n�0Eg�� ��lɛ�j0bX��tr���+�2���LMH0������Oy�/E�o��<�d���ei=��lFߏ;�z4�W%c!CZ|]�Zn:oS9�� J�"�!Ɲ�]:8�e�u?�h)5	vg��A����x��h��ډǦ�Mۄ�:o���g������& ����Ǧ�wJ�?	�N�      /      x������ � �      1   �   x����M�0��=���)��
1B�Jp��k�Hql�N]�a����(B������GG�)���@v������B	=����
d���C"1$2 �dx	�:����K)�5Ly�����=ܟֻMQE?��	.PF���b��I"�Q�Qղ����a�L�k�����o�ކ����e��֝���q!o�l�Ӵ�쏄�"���F��ϔ�J}���J��b��oȚ�      '   >   x�3�4�4�4202�50�54R0��2��21�333� �����2�`D�	�@)2!F��� Ɔ%      2   ;   x�3�4�4202�50�50V02�25�22�37��50�2�4B�6�2��3�4I��qqq ���      (   A  x����O�0�s�W��u�}�Ϟ춊#��25.��A��z�8�p1ᥧ~��|ޣ��eS�-7��t�(��Uu����u�:�С�!�4��M��]�߻��~��כ�����/o��j0�V�|�<j��j,r�娐�PH��R�z,P��2��G@���o�8�Q'��+��\"L#��!�O°I	��D����u�s,�X[6;�H%
�Q"�5_��fY*�ҸȤ��>g�� ������ڲ�<^�˾P�8��y�J#���X�L��=��}��M)�)�4p(���ʽ�{�޳��=q,��(���      *   �   x���;�0�9=EF��J(�,�EFy 'E\�sq1�X2[���w����y;FPC7��3����.fZ��d/��s�M��͠(�\)"�^!�g�*qT+G�HߒDp�)c�� ?؁��,��0n��Q<�B�a�PצU<�������b�*��R����/�c�:5M�Oy.      ,      x������ � �     