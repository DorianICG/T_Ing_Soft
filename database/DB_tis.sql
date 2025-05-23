PGDMP                      }            DB_tis    17.4    17.4 �    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            �           1262    66282    DB_tis    DATABASE     n   CREATE DATABASE "DB_tis" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'es-CL';
    DROP DATABASE "DB_tis";
                     postgres    false                        2615    2200    public    SCHEMA     2   -- *not* creating schema, since initdb creates it
 2   -- *not* dropping schema, since initdb creates it
                     postgres    false            �           0    0    SCHEMA public    COMMENT         COMMENT ON SCHEMA public IS '';
                        postgres    false    5                        0    0    SCHEMA public    ACL     +   REVOKE USAGE ON SCHEMA public FROM PUBLIC;
                        postgres    false    5            �            1255    66283    log_audit()    FUNCTION     �  CREATE FUNCTION public.log_audit() RETURNS trigger
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
       public               postgres    false    218    5                       0    0    audit_log_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.audit_log_id_seq OWNED BY public.audit_log.id;
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
       public               postgres    false    220    5                       0    0    courses_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;
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
       public               postgres    false    5    222                       0    0    delegates_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.delegates_id_seq OWNED BY public.delegates.id;
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
       public               postgres    false    5    224                       0    0    emergency_contacts_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE public.emergency_contacts_id_seq OWNED BY public.emergency_contacts.id;
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
       public               postgres    false    5    226                       0    0    organizations_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.organizations_id_seq OWNED BY public.organizations.id;
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
       public               postgres    false    228    5                       0    0    qr_authorizations_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.qr_authorizations_id_seq OWNED BY public.qr_authorizations.id;
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
       public               postgres    false    230    5                       0    0    roles_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;
          public               postgres    false    231            �            1259    66336    students    TABLE     �  CREATE TABLE public.students (
    id integer NOT NULL,
    rut character varying(20) NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    birth_date date,
    organization_id integer NOT NULL,
    parent_user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    course_id integer,
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
       public               postgres    false    5    232                       0    0    students_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.students_id_seq OWNED BY public.students.id;
          public               postgres    false    233            �            1259    66341    ticket_number_seq    SEQUENCE     }   CREATE SEQUENCE public.ticket_number_seq
    START WITH 1000
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.ticket_number_seq;
       public               postgres    false    5            �            1259    66342    user_organization_roles    TABLE       CREATE TABLE public.user_organization_roles (
    user_id integer NOT NULL,
    organization_id integer NOT NULL,
    role_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
 +   DROP TABLE public.user_organization_roles;
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
       public               postgres    false    5    236            	           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public               postgres    false    237            �            1259    66359    withdrawal_reasons    TABLE     -  CREATE TABLE public.withdrawal_reasons (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    requires_contact_verification boolean DEFAULT false,
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
       public               postgres    false    238    5            
           0    0    withdrawal_reasons_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE public.withdrawal_reasons_id_seq OWNED BY public.withdrawal_reasons.id;
          public               postgres    false    239            �            1259    66365    withdrawals    TABLE       CREATE TABLE public.withdrawals (
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
    CONSTRAINT withdrawals_method_check CHECK (((method)::text = ANY (ARRAY[('QR'::character varying)::text, ('MANUAL'::character varying)::text])))
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
       public               postgres    false    240    5                       0    0    withdrawals_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.withdrawals_id_seq OWNED BY public.withdrawals.id;
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
       public               postgres    false    233    232            �           2604    66381    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    237    236            �           2604    66382    withdrawal_reasons id    DEFAULT     ~   ALTER TABLE ONLY public.withdrawal_reasons ALTER COLUMN id SET DEFAULT nextval('public.withdrawal_reasons_id_seq'::regclass);
 D   ALTER TABLE public.withdrawal_reasons ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    239    238            �           2604    66383    withdrawals id    DEFAULT     p   ALTER TABLE ONLY public.withdrawals ALTER COLUMN id SET DEFAULT nextval('public.withdrawals_id_seq'::regclass);
 =   ALTER TABLE public.withdrawals ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    241    240            �          0    66284    SequelizeMeta 
   TABLE DATA           /   COPY public."SequelizeMeta" (name) FROM stdin;
    public               postgres    false    217   ��       �          0    66287 	   audit_log 
   TABLE DATA           [   COPY public.audit_log (id, table_name, record_id, action, user_id, changed_at) FROM stdin;
    public               postgres    false    218   ��       �          0    66292    courses 
   TABLE DATA           T   COPY public.courses (id, name, organization_id, created_at, updated_at) FROM stdin;
    public               postgres    false    220   l�       �          0    66298 	   delegates 
   TABLE DATA           u   COPY public.delegates (id, parent_user_id, name, phone, relationship_to_student, created_at, updated_at) FROM stdin;
    public               postgres    false    222   ��       �          0    66304    emergency_contacts 
   TABLE DATA           �   COPY public.emergency_contacts (id, parent_user_id, name, phone, relationship, is_verified, created_at, updated_at) FROM stdin;
    public               postgres    false    224   ��       �          0    66315    organizations 
   TABLE DATA           d   COPY public.organizations (id, name, address, phone, is_active, created_at, updated_at) FROM stdin;
    public               postgres    false    226   �       �          0    66323    qr_authorizations 
   TABLE DATA           �   COPY public.qr_authorizations (id, code, student_id, generated_by_user_id, reason_id, expires_at, is_used, created_at, custom_withdrawal_reason, assigned_delegate_id, updated_at) FROM stdin;
    public               postgres    false    228   �       �          0    66329    roles 
   TABLE DATA           N   COPY public.roles (id, name, description, created_at, updated_at) FROM stdin;
    public               postgres    false    230   (�       �          0    66336    students 
   TABLE DATA           �   COPY public.students (id, rut, first_name, last_name, birth_date, organization_id, parent_user_id, created_at, course_id, updated_at) FROM stdin;
    public               postgres    false    232   S�       �          0    66342    user_organization_roles 
   TABLE DATA           l   COPY public.user_organization_roles (user_id, organization_id, role_id, created_at, updated_at) FROM stdin;
    public               postgres    false    235   1�       �          0    66347    users 
   TABLE DATA             COPY public.users (id, rut, email, password_hash, first_name, last_name, phone, is_active, last_login, created_at, failed_login_attempts, account_locked, last_failed_login, updated_at, mfa_code_hash, mfa_code_expires_at, reset_password_token_hash, reset_password_expires_at) FROM stdin;
    public               postgres    false    236   a�       �          0    66359    withdrawal_reasons 
   TABLE DATA           m   COPY public.withdrawal_reasons (id, name, requires_contact_verification, created_at, updated_at) FROM stdin;
    public               postgres    false    238   �       �          0    66365    withdrawals 
   TABLE DATA           �  COPY public.withdrawals (id, qr_authorization_id, student_id, organization_approver_user_id, reason_id, method, contact_verified, created_at, retriever_user_id, retriever_delegate_id, retriever_emergency_contact_id, retriever_name_if_other, guardian_authorizer_user_id, guardian_authorizer_emergency_contact_id, custom_withdrawal_reason, organization_id, retriever_rut_if_other, retriever_relationship_if_other, withdrawal_time, notes, updated_at) FROM stdin;
    public               postgres    false    240   8�                  0    0    audit_log_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.audit_log_id_seq', 225, true);
          public               postgres    false    219                       0    0    courses_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.courses_id_seq', 6, true);
          public               postgres    false    221                       0    0    delegates_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.delegates_id_seq', 1, false);
          public               postgres    false    223                       0    0    emergency_contacts_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public.emergency_contacts_id_seq', 1, false);
          public               postgres    false    225                       0    0    organizations_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.organizations_id_seq', 35, true);
          public               postgres    false    227                       0    0    qr_authorizations_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.qr_authorizations_id_seq', 1, false);
          public               postgres    false    229                       0    0    roles_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.roles_id_seq', 9, true);
          public               postgres    false    231                       0    0    students_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.students_id_seq', 14, true);
          public               postgres    false    233                       0    0    ticket_number_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.ticket_number_seq', 1000, false);
          public               postgres    false    234                       0    0    users_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.users_id_seq', 31, true);
          public               postgres    false    237                       0    0    withdrawal_reasons_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public.withdrawal_reasons_id_seq', 1, false);
          public               postgres    false    239                       0    0    withdrawals_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.withdrawals_id_seq', 1, false);
          public               postgres    false    241            �           2606    66385     SequelizeMeta SequelizeMeta_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);
 N   ALTER TABLE ONLY public."SequelizeMeta" DROP CONSTRAINT "SequelizeMeta_pkey";
       public                 postgres    false    217            �           2606    66387    audit_log audit_log_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.audit_log DROP CONSTRAINT audit_log_pkey;
       public                 postgres    false    218            �           2606    66389 (   courses courses_name_organization_id_key 
   CONSTRAINT     t   ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_name_organization_id_key UNIQUE (name, organization_id);
 R   ALTER TABLE ONLY public.courses DROP CONSTRAINT courses_name_organization_id_key;
       public                 postgres    false    220    220            �           2606    66391    courses courses_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.courses DROP CONSTRAINT courses_pkey;
       public                 postgres    false    220            �           2606    66393    delegates delegates_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.delegates
    ADD CONSTRAINT delegates_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.delegates DROP CONSTRAINT delegates_pkey;
       public                 postgres    false    222                       2606    66395 *   emergency_contacts emergency_contacts_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public.emergency_contacts
    ADD CONSTRAINT emergency_contacts_pkey PRIMARY KEY (id);
 T   ALTER TABLE ONLY public.emergency_contacts DROP CONSTRAINT emergency_contacts_pkey;
       public                 postgres    false    224                       2606    66399     organizations organizations_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.organizations DROP CONSTRAINT organizations_pkey;
       public                 postgres    false    226            
           2606    66401 ,   qr_authorizations qr_authorizations_code_key 
   CONSTRAINT     g   ALTER TABLE ONLY public.qr_authorizations
    ADD CONSTRAINT qr_authorizations_code_key UNIQUE (code);
 V   ALTER TABLE ONLY public.qr_authorizations DROP CONSTRAINT qr_authorizations_code_key;
       public                 postgres    false    228                       2606    66403 (   qr_authorizations qr_authorizations_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.qr_authorizations
    ADD CONSTRAINT qr_authorizations_pkey PRIMARY KEY (id);
 R   ALTER TABLE ONLY public.qr_authorizations DROP CONSTRAINT qr_authorizations_pkey;
       public                 postgres    false    228                       2606    66405    roles roles_name_key 
   CONSTRAINT     O   ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);
 >   ALTER TABLE ONLY public.roles DROP CONSTRAINT roles_name_key;
       public                 postgres    false    230                       2606    66407    roles roles_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.roles DROP CONSTRAINT roles_pkey;
       public                 postgres    false    230                       2606    66409    students students_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.students DROP CONSTRAINT students_pkey;
       public                 postgres    false    232                       2606    66411    students students_rut_key 
   CONSTRAINT     S   ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_rut_key UNIQUE (rut);
 C   ALTER TABLE ONLY public.students DROP CONSTRAINT students_rut_key;
       public                 postgres    false    232            3           2606    66718 .   withdrawals uq_withdrawals_qr_authorization_id 
   CONSTRAINT     x   ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT uq_withdrawals_qr_authorization_id UNIQUE (qr_authorization_id);
 X   ALTER TABLE ONLY public.withdrawals DROP CONSTRAINT uq_withdrawals_qr_authorization_id;
       public                 postgres    false    240                       2606    66413 4   user_organization_roles user_organization_roles_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.user_organization_roles
    ADD CONSTRAINT user_organization_roles_pkey PRIMARY KEY (user_id, organization_id, role_id);
 ^   ALTER TABLE ONLY public.user_organization_roles DROP CONSTRAINT user_organization_roles_pkey;
       public                 postgres    false    235    235    235            !           2606    66415    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public                 postgres    false    236            #           2606    66417    users users_rut_key 
   CONSTRAINT     M   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_rut_key UNIQUE (rut);
 =   ALTER TABLE ONLY public.users DROP CONSTRAINT users_rut_key;
       public                 postgres    false    236            %           2606    66419 .   withdrawal_reasons withdrawal_reasons_name_key 
   CONSTRAINT     i   ALTER TABLE ONLY public.withdrawal_reasons
    ADD CONSTRAINT withdrawal_reasons_name_key UNIQUE (name);
 X   ALTER TABLE ONLY public.withdrawal_reasons DROP CONSTRAINT withdrawal_reasons_name_key;
       public                 postgres    false    238            '           2606    66421 *   withdrawal_reasons withdrawal_reasons_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public.withdrawal_reasons
    ADD CONSTRAINT withdrawal_reasons_pkey PRIMARY KEY (id);
 T   ALTER TABLE ONLY public.withdrawal_reasons DROP CONSTRAINT withdrawal_reasons_pkey;
       public                 postgres    false    238            5           2606    66423    withdrawals withdrawals_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.withdrawals DROP CONSTRAINT withdrawals_pkey;
       public                 postgres    false    240            �           1259    66928    idx_audit_log_changed_at    INDEX     T   CREATE INDEX idx_audit_log_changed_at ON public.audit_log USING btree (changed_at);
 ,   DROP INDEX public.idx_audit_log_changed_at;
       public                 postgres    false    218            �           1259    66425 "   idx_audit_log_table_name_record_id    INDEX     i   CREATE INDEX idx_audit_log_table_name_record_id ON public.audit_log USING btree (table_name, record_id);
 6   DROP INDEX public.idx_audit_log_table_name_record_id;
       public                 postgres    false    218    218            �           1259    66426    idx_audit_log_user_id    INDEX     N   CREATE INDEX idx_audit_log_user_id ON public.audit_log USING btree (user_id);
 )   DROP INDEX public.idx_audit_log_user_id;
       public                 postgres    false    218            �           1259    66427    idx_courses_organization_id    INDEX     Z   CREATE INDEX idx_courses_organization_id ON public.courses USING btree (organization_id);
 /   DROP INDEX public.idx_courses_organization_id;
       public                 postgres    false    220            �           1259    66428    idx_delegates_parent_user_id    INDEX     \   CREATE INDEX idx_delegates_parent_user_id ON public.delegates USING btree (parent_user_id);
 0   DROP INDEX public.idx_delegates_parent_user_id;
       public                 postgres    false    222                       1259    66429 %   idx_emergency_contacts_parent_user_id    INDEX     n   CREATE INDEX idx_emergency_contacts_parent_user_id ON public.emergency_contacts USING btree (parent_user_id);
 9   DROP INDEX public.idx_emergency_contacts_parent_user_id;
       public                 postgres    false    224                       1259    67047     idx_qr_authorizations_expires_at    INDEX     d   CREATE INDEX idx_qr_authorizations_expires_at ON public.qr_authorizations USING btree (expires_at);
 4   DROP INDEX public.idx_qr_authorizations_expires_at;
       public                 postgres    false    228                       1259    66433 "   idx_qr_authorizations_generated_by    INDEX     p   CREATE INDEX idx_qr_authorizations_generated_by ON public.qr_authorizations USING btree (generated_by_user_id);
 6   DROP INDEX public.idx_qr_authorizations_generated_by;
       public                 postgres    false    228                       1259    66434    idx_qr_authorizations_reason_id    INDEX     b   CREATE INDEX idx_qr_authorizations_reason_id ON public.qr_authorizations USING btree (reason_id);
 3   DROP INDEX public.idx_qr_authorizations_reason_id;
       public                 postgres    false    228                       1259    66435     idx_qr_authorizations_student_id    INDEX     d   CREATE INDEX idx_qr_authorizations_student_id ON public.qr_authorizations USING btree (student_id);
 4   DROP INDEX public.idx_qr_authorizations_student_id;
       public                 postgres    false    228                       1259    66436    idx_students_course_id    INDEX     P   CREATE INDEX idx_students_course_id ON public.students USING btree (course_id);
 *   DROP INDEX public.idx_students_course_id;
       public                 postgres    false    232                       1259    66437    idx_students_organization_id    INDEX     \   CREATE INDEX idx_students_organization_id ON public.students USING btree (organization_id);
 0   DROP INDEX public.idx_students_organization_id;
       public                 postgres    false    232                       1259    66438    idx_students_parent_user_id    INDEX     Z   CREATE INDEX idx_students_parent_user_id ON public.students USING btree (parent_user_id);
 /   DROP INDEX public.idx_students_parent_user_id;
       public                 postgres    false    232                       1259    66439    idx_students_rut    INDEX     D   CREATE INDEX idx_students_rut ON public.students USING btree (rut);
 $   DROP INDEX public.idx_students_rut;
       public                 postgres    false    232                       1259    66440 +   idx_user_organization_roles_organization_id    INDEX     z   CREATE INDEX idx_user_organization_roles_organization_id ON public.user_organization_roles USING btree (organization_id);
 ?   DROP INDEX public.idx_user_organization_roles_organization_id;
       public                 postgres    false    235                       1259    66441 #   idx_user_organization_roles_role_id    INDEX     j   CREATE INDEX idx_user_organization_roles_role_id ON public.user_organization_roles USING btree (role_id);
 7   DROP INDEX public.idx_user_organization_roles_role_id;
       public                 postgres    false    235                       1259    66442 #   idx_user_organization_roles_user_id    INDEX     j   CREATE INDEX idx_user_organization_roles_user_id ON public.user_organization_roles USING btree (user_id);
 7   DROP INDEX public.idx_user_organization_roles_user_id;
       public                 postgres    false    235                       1259    66443    idx_users_email    INDEX     B   CREATE INDEX idx_users_email ON public.users USING btree (email);
 #   DROP INDEX public.idx_users_email;
       public                 postgres    false    236                       1259    66444    idx_users_rut    INDEX     >   CREATE INDEX idx_users_rut ON public.users USING btree (rut);
 !   DROP INDEX public.idx_users_rut;
       public                 postgres    false    236            (           1259    66993    idx_withdrawals_created_at    INDEX     X   CREATE INDEX idx_withdrawals_created_at ON public.withdrawals USING btree (created_at);
 .   DROP INDEX public.idx_withdrawals_created_at;
       public                 postgres    false    240            )           1259    66446 8   idx_withdrawals_guardian_authorizer_emergency_contact_id    INDEX     �   CREATE INDEX idx_withdrawals_guardian_authorizer_emergency_contact_id ON public.withdrawals USING btree (guardian_authorizer_emergency_contact_id);
 L   DROP INDEX public.idx_withdrawals_guardian_authorizer_emergency_contact_id;
       public                 postgres    false    240            *           1259    66447 +   idx_withdrawals_guardian_authorizer_user_id    INDEX     z   CREATE INDEX idx_withdrawals_guardian_authorizer_user_id ON public.withdrawals USING btree (guardian_authorizer_user_id);
 ?   DROP INDEX public.idx_withdrawals_guardian_authorizer_user_id;
       public                 postgres    false    240            +           1259    66448 -   idx_withdrawals_organization_approver_user_id    INDEX     ~   CREATE INDEX idx_withdrawals_organization_approver_user_id ON public.withdrawals USING btree (organization_approver_user_id);
 A   DROP INDEX public.idx_withdrawals_organization_approver_user_id;
       public                 postgres    false    240            ,           1259    66449 #   idx_withdrawals_qr_authorization_id    INDEX     j   CREATE INDEX idx_withdrawals_qr_authorization_id ON public.withdrawals USING btree (qr_authorization_id);
 7   DROP INDEX public.idx_withdrawals_qr_authorization_id;
       public                 postgres    false    240            -           1259    66450    idx_withdrawals_reason_id    INDEX     V   CREATE INDEX idx_withdrawals_reason_id ON public.withdrawals USING btree (reason_id);
 -   DROP INDEX public.idx_withdrawals_reason_id;
       public                 postgres    false    240            .           1259    66451 %   idx_withdrawals_retriever_delegate_id    INDEX     n   CREATE INDEX idx_withdrawals_retriever_delegate_id ON public.withdrawals USING btree (retriever_delegate_id);
 9   DROP INDEX public.idx_withdrawals_retriever_delegate_id;
       public                 postgres    false    240            /           1259    66452 .   idx_withdrawals_retriever_emergency_contact_id    INDEX     �   CREATE INDEX idx_withdrawals_retriever_emergency_contact_id ON public.withdrawals USING btree (retriever_emergency_contact_id);
 B   DROP INDEX public.idx_withdrawals_retriever_emergency_contact_id;
       public                 postgres    false    240            0           1259    66453 !   idx_withdrawals_retriever_user_id    INDEX     f   CREATE INDEX idx_withdrawals_retriever_user_id ON public.withdrawals USING btree (retriever_user_id);
 5   DROP INDEX public.idx_withdrawals_retriever_user_id;
       public                 postgres    false    240            1           1259    66454    idx_withdrawals_student_id    INDEX     X   CREATE INDEX idx_withdrawals_student_id ON public.withdrawals USING btree (student_id);
 .   DROP INDEX public.idx_withdrawals_student_id;
       public                 postgres    false    240            M           2620    66455    users users_audit    TRIGGER     ~   CREATE TRIGGER users_audit AFTER INSERT OR DELETE OR UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.log_audit();
 *   DROP TRIGGER users_audit ON public.users;
       public               postgres    false    242    236            N           2620    66456    withdrawals withdrawals_audit    TRIGGER     �   CREATE TRIGGER withdrawals_audit AFTER INSERT OR DELETE OR UPDATE ON public.withdrawals FOR EACH ROW EXECUTE FUNCTION public.log_audit();
 6   DROP TRIGGER withdrawals_audit ON public.withdrawals;
       public               postgres    false    240    242            6           2606    66457 $   courses courses_organization_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
 N   ALTER TABLE ONLY public.courses DROP CONSTRAINT courses_organization_id_fkey;
       public               postgres    false    226    4868    220            7           2606    66462 '   delegates delegates_parent_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.delegates
    ADD CONSTRAINT delegates_parent_user_id_fkey FOREIGN KEY (parent_user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 Q   ALTER TABLE ONLY public.delegates DROP CONSTRAINT delegates_parent_user_id_fkey;
       public               postgres    false    4897    222    236            8           2606    66472 /   emergency_contacts fk_emergency_contacts_parent    FK CONSTRAINT     �   ALTER TABLE ONLY public.emergency_contacts
    ADD CONSTRAINT fk_emergency_contacts_parent FOREIGN KEY (parent_user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 Y   ALTER TABLE ONLY public.emergency_contacts DROP CONSTRAINT fk_emergency_contacts_parent;
       public               postgres    false    224    4897    236            9           2606    66633 )   qr_authorizations fk_qr_assigned_delegate    FK CONSTRAINT     �   ALTER TABLE ONLY public.qr_authorizations
    ADD CONSTRAINT fk_qr_assigned_delegate FOREIGN KEY (assigned_delegate_id) REFERENCES public.delegates(id) ON UPDATE CASCADE ON DELETE SET NULL;
 S   ALTER TABLE ONLY public.qr_authorizations DROP CONSTRAINT fk_qr_assigned_delegate;
       public               postgres    false    4862    228    222            :           2606    66719 )   qr_authorizations fk_qr_generated_by_user    FK CONSTRAINT     �   ALTER TABLE ONLY public.qr_authorizations
    ADD CONSTRAINT fk_qr_generated_by_user FOREIGN KEY (generated_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
 S   ALTER TABLE ONLY public.qr_authorizations DROP CONSTRAINT fk_qr_generated_by_user;
       public               postgres    false    236    228    4897            =           2606    66477    students fk_students_course    FK CONSTRAINT     �   ALTER TABLE ONLY public.students
    ADD CONSTRAINT fk_students_course FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE SET NULL;
 E   ALTER TABLE ONLY public.students DROP CONSTRAINT fk_students_course;
       public               postgres    false    4859    220    232            >           2606    66482     students fk_students_parent_user    FK CONSTRAINT     �   ALTER TABLE ONLY public.students
    ADD CONSTRAINT fk_students_parent_user FOREIGN KEY (parent_user_id) REFERENCES public.users(id) ON DELETE SET NULL;
 J   ALTER TABLE ONLY public.students DROP CONSTRAINT fk_students_parent_user;
       public               postgres    false    236    4897    232            C           2606    66704 '   withdrawals fk_withdrawals_organization    FK CONSTRAINT     �   ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT fk_withdrawals_organization FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 Q   ALTER TABLE ONLY public.withdrawals DROP CONSTRAINT fk_withdrawals_organization;
       public               postgres    false    226    240    4868            D           2606    66709 !   withdrawals fk_withdrawals_reason    FK CONSTRAINT     �   ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT fk_withdrawals_reason FOREIGN KEY (reason_id) REFERENCES public.withdrawal_reasons(id) ON UPDATE CASCADE ON DELETE SET NULL;
 K   ALTER TABLE ONLY public.withdrawals DROP CONSTRAINT fk_withdrawals_reason;
       public               postgres    false    238    4903    240            ;           2606    66497 2   qr_authorizations qr_authorizations_reason_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.qr_authorizations
    ADD CONSTRAINT qr_authorizations_reason_id_fkey FOREIGN KEY (reason_id) REFERENCES public.withdrawal_reasons(id);
 \   ALTER TABLE ONLY public.qr_authorizations DROP CONSTRAINT qr_authorizations_reason_id_fkey;
       public               postgres    false    238    228    4903            <           2606    66502 3   qr_authorizations qr_authorizations_student_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.qr_authorizations
    ADD CONSTRAINT qr_authorizations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);
 ]   ALTER TABLE ONLY public.qr_authorizations DROP CONSTRAINT qr_authorizations_student_id_fkey;
       public               postgres    false    4886    228    232            ?           2606    66507 &   students students_organization_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);
 P   ALTER TABLE ONLY public.students DROP CONSTRAINT students_organization_id_fkey;
       public               postgres    false    232    4868    226            @           2606    66517 D   user_organization_roles user_organization_roles_organization_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.user_organization_roles
    ADD CONSTRAINT user_organization_roles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
 n   ALTER TABLE ONLY public.user_organization_roles DROP CONSTRAINT user_organization_roles_organization_id_fkey;
       public               postgres    false    226    4868    235            A           2606    66522 <   user_organization_roles user_organization_roles_role_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.user_organization_roles
    ADD CONSTRAINT user_organization_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;
 f   ALTER TABLE ONLY public.user_organization_roles DROP CONSTRAINT user_organization_roles_role_id_fkey;
       public               postgres    false    230    235    4880            B           2606    66527 <   user_organization_roles user_organization_roles_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.user_organization_roles
    ADD CONSTRAINT user_organization_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 f   ALTER TABLE ONLY public.user_organization_roles DROP CONSTRAINT user_organization_roles_user_id_fkey;
       public               postgres    false    235    236    4897            E           2606    66532 E   withdrawals withdrawals_guardian_authorizer_emergency_contact_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_guardian_authorizer_emergency_contact_id_fkey FOREIGN KEY (guardian_authorizer_emergency_contact_id) REFERENCES public.emergency_contacts(id) ON DELETE SET NULL;
 o   ALTER TABLE ONLY public.withdrawals DROP CONSTRAINT withdrawals_guardian_authorizer_emergency_contact_id_fkey;
       public               postgres    false    4865    224    240            F           2606    66537 8   withdrawals withdrawals_guardian_authorizer_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_guardian_authorizer_user_id_fkey FOREIGN KEY (guardian_authorizer_user_id) REFERENCES public.users(id) ON DELETE SET NULL;
 b   ALTER TABLE ONLY public.withdrawals DROP CONSTRAINT withdrawals_guardian_authorizer_user_id_fkey;
       public               postgres    false    240    4897    236            G           2606    66542 )   withdrawals withdrawals_processed_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_processed_by_fkey FOREIGN KEY (organization_approver_user_id) REFERENCES public.users(id);
 S   ALTER TABLE ONLY public.withdrawals DROP CONSTRAINT withdrawals_processed_by_fkey;
       public               postgres    false    236    240    4897            H           2606    66547 0   withdrawals withdrawals_qr_authorization_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_qr_authorization_id_fkey FOREIGN KEY (qr_authorization_id) REFERENCES public.qr_authorizations(id);
 Z   ALTER TABLE ONLY public.withdrawals DROP CONSTRAINT withdrawals_qr_authorization_id_fkey;
       public               postgres    false    4876    240    228            I           2606    66557 2   withdrawals withdrawals_retriever_delegate_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_retriever_delegate_id_fkey FOREIGN KEY (retriever_delegate_id) REFERENCES public.delegates(id) ON DELETE SET NULL;
 \   ALTER TABLE ONLY public.withdrawals DROP CONSTRAINT withdrawals_retriever_delegate_id_fkey;
       public               postgres    false    4862    240    222            J           2606    66562 ;   withdrawals withdrawals_retriever_emergency_contact_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_retriever_emergency_contact_id_fkey FOREIGN KEY (retriever_emergency_contact_id) REFERENCES public.emergency_contacts(id) ON DELETE SET NULL;
 e   ALTER TABLE ONLY public.withdrawals DROP CONSTRAINT withdrawals_retriever_emergency_contact_id_fkey;
       public               postgres    false    4865    240    224            K           2606    66567 .   withdrawals withdrawals_retriever_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_retriever_user_id_fkey FOREIGN KEY (retriever_user_id) REFERENCES public.users(id) ON DELETE SET NULL;
 X   ALTER TABLE ONLY public.withdrawals DROP CONSTRAINT withdrawals_retriever_user_id_fkey;
       public               postgres    false    236    240    4897            L           2606    66572 '   withdrawals withdrawals_student_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);
 Q   ALTER TABLE ONLY public.withdrawals DROP CONSTRAINT withdrawals_student_id_fkey;
       public               postgres    false    232    240    4886            �      x������ � �      �   �	  x���M�%���ݫ�\��sg�A&F�83O��ٿEU݂ߕT�Q�?�J�ɣ�o������~�ǯ���_�}���o��~N�3����T_�G*9Պ�΃�Ǆ"?&��U�������/!X^F/NU5�=!,)��:����Rz%yq;��F�k㟗 �^��$5ev�^J��6���� z	MLs�-v2�ߡMSn�GH;J�B�|I� LG�I"�C�UnV:b�l��,N,?B��dTY���衔,v_7a�� �a�Vc+m�HGT�DĹ��i�a1�(��L=��6�z�+T4����Ӈ����.����r!A;��E�R��{Bю���m�%�H�#���5��A��%ٓ�P�`\�"�"%���1��j8f鲚�")�b\0��� ��QX������
�ewE�:�~�w9�%���]��w� ߊ_��Ev��R�b�P$��#��td�my��,GT6�Ѧ7����E���j��������U)5���?���GX:�
A�T�p�Z����O�%Qm����#'��F����z����[��w��c��#�H�"�*]*�y�sտ!�y�,�g�R ��s߾�K�i�)�yɿ!BGfO��K��#i��K���P���ت�a�W�CJ�E���"��Wd����3�^����\�i�~����*�AL9T?�U������(Gy.�wO5�@�G2�JJ�5)�em��^R.=��\�c ��{��ˎ�e���^���e���a#������9g�Ȼ����}/e�7Ҹ���]�ԗ� �EE*���RHE4Ie|�R�w��)V��W�ߥ�r4#e|����l�?t���a��o�����}���m�J��>����r��?��\zu���C�Pð��a�_�W2(ϗ��~ �aCX�G�� aj)el�A�����*�>�~��b�'� ��-�{����
�����A��K���"��o��4�ֶ�={iE�uՄ��ͷe�)>�T�1����}G�O!�x(;��=��K"�p�K��)���>!�?E�����B�%�����.d�J��0�[�<���ɧc�Pd��PdW�tFS��T,�͓�	�h&�#������!��'���5
s(ٞ�`�hgsM)?b�!7e	�<fZ�q���B1�2�����W@d(E;����[���Nh���3����t��@��6�ȥ\Rq�:�:p1r��-��)h#hY	��~�LĔ���dP֐li�mZւ`�+������y�yɩF9�ѡ8����^K���N��r�q#�hS��z@nLC��Vkx��;=&���3��Ӄ`ڑ+C����Ag�zs�a �����*��y��� r;3GC�̃87�MXg �4�գ��Ui��tѹ��DH6��d?T�2�j��:����xG�HH�6�٩A0���s~��4`�%8��\�P�c?;5 S�jJCAtW:��P1~D�N��
�d�8�F� z��$ٸ� J�ݴԘ�IdA�y FH�A��6����֕P�xL�a��M�UP7ݽ+7�>��\��J�.���4�a1蓭��b�y�;q�J��m8�8�!���q�(X�\�o[�A0D����8[�A0�F��^�x�%[��G񘚠A������\SJ:�`����ۛD*��O�:h�ܶk2��z�0K�p�,� �;�wMHԫ�GH��e
dt��K���TI��0	/�^�޶�pph����^Ө=K�0ou�M6]����/F�dh��Š�Q��j���S)2�z��N�A���,��;S�YZ���; >)�B��
�qS��o�S[��o�Yj���-��~j�8m4{K�03��׫1�,���T��]��vY���ku�d<��dA0�o%�������C&}_z��m�7��T	�u.Ӱ~�4bh5��q΃��@>A�"�������~~tA��h����v�~�tB�R��������ï!]jIB�VMt�H>����+k�ܢM���	����@g��0|�9sƨ� ���2�9\pt�yL�myY���Zh���e�w�D0h��+1���%X����GA��OF��?�3m�:N�g�C�ԙ@�
�Yj��Y�A0ݴL��0�8-Ӡ3��ǀ�i���Z�\)�J��G� d>̠���\��Q��s�H�p�v�B�� .m|��K��S�0>�e�>LM&lX�l>N�'��
�]-��������!�w�ї�e��'�����*�t����>��C�@v��C�w=����/�.��c�
����~�j|�u9}��vݠ�qt�����k�jE5���.��c��P��Y1��ѽ;Y~�P�M��ݾY��PKM�+4~�}��oY%�v1�����<�*h�����y�T~V�~?���'Y��<      �   b   x�3�(��M-�Wp:��839_��Ӑ����T��T��D��������X����(h�W���<'��3��>#
�3��>J�3��>c
�3��>J̋���� �%m�      �      x������ � �      �      x������ � �      �   �   x�m�=o�0@g�+n/ cl\�"�D]�J�Y�`�%G�`���֕?V��TU���{�*�[�ma�>08=jK[	�V_�6�!H�r.N�ˬ�����X�I �2QдV@���]%J�Le]PN�o#/~��`R,'�ux�ok�Ш8����>��,�V4�|�j���C&���O���I��(8���0�^�	'8���G$O	u/�����x�x�e�[�Н�,�~ ��Q�      �      x������ � �      �     x��P�N�@>�O1 T@�F�+޸Lv�:fw��nM�m|�/�R��^���w���e��C���8@�( <�N�8
�	�M� 9 �C$�l�H��$�%�L.�������5:�@���] j��g/�l#��]��:�x?�*J�C�|M)Y9,'��xP�`4���y9-��W��8�پ��lUm�˛���[C�rH�zOhR�CA�#9����k�����q��E��=E��w��lq{��~[W�m�4�������-��{������E��_��      �   �   x���;�1��s���#?bFС-�����ģY�]nD1G��0�d�E�&�5���o��r˻+�!)2{	�9~	Ml4�q�6j;B�~�Y4, TkPazJ0O������s�O�� 1�X���m�`�ms���l�W'��H����j�`��K�`V�����1*}���y���t�	~����Z��g�_o��y ��X�      �      x������ D�q��"<6�e���E+��b%����\|Ʌ����xqm(M9���U�W	݁]}��q8h��K��)R����.�Rdwv�Nq:��ս՝��{����ft��`�/��J_�MRS�։_$�2��SaM5H�<H�ukn���%B���
i@Ce��g��K�BBԼ��K��
6��G"v_�fy)M,�u�Q"�.�N�#�����,�V�9/c6K;�V7�G���跢��F���h�(-ݽ�$�x���	~$>�e�y�����*��      �   �  x���K{�H��տ"�ފԁ\5�FP��l@PN�迚�l��}e:�і$��t]��'\wU=<���u���f��u�Wd���ũ�^�pab�Y�]C��:7�䝪Re�%�s@�mhxK�?=Oˍu�؅��ZV�Z�:��9�C�GB�'5$?@�AH!�)/I지�D�A<j�BJ�(⋂����"��,@���;�~7]φ�iP���ҥ�w�h�l?���~��V�����R�K��~�%�:�SL��9Y�@0���B22�a5���^pM.B1&��;pbF�~�y���"V��j���ޛ�W��аhlQ��uC��l����߰0�@��w����Q��ܳ�#��❋��8o��a�8�`h+�b�{��u�c؃�S�hGd�U�yL?��YB?�-�z�< � �4'ɨ��^qN |]����>8�_�8�a����D'#�37�u��o�ffg`'���=���ء��S��
@���~W�D���o�&�9��E`B�b"L1��z���1h�������N� �sy^�����S#����d�<�I�O�^�a������� �2���
���`l&{מ�6�V�<�Ma�r�j�Ҳ�ӳS޵Hw2���yӷ~��GʑO9���s�Zq�-���
D���R-ct4��B�I��H�x�i��:�궀]�i�%Ō��4Wm�����g�����T��b�ޏ���q�҃(�	Q�b��
+��oNi�I�p�8|��^)�.�u�ժ'�3�)"���zE�̲���Qg}Tl�g�H��K�<L,;���~�:VPm+}�:X2j�AD��2���fW�2F"&��=d+o�哃���$�V'����5�d��iw�iw��T�`g�|�'�����A��q���g���zX�GQ�r�pWZ�^q��)�DXgP����O܍�U�ܲ����6ָ�K����BI���v�� �,�AX׎���%rYs�������ٕdn�P��ɻ۸Q\o�
��X#��f]�ɍp���\m��`�Ț��A�¹=��l?)O�}�#۩�S��_;�&>[�Bl�lUUZ�.Z����j ����\�_3�e>�{���k�ˊU0���B]���I�Ci��NE���`����a��������t��g]�L�bm�{��	��o�=b��$KDb��3������L{jJ���5�s���Ք�&g��5��-68�0�G[r�'F�;6�T���C׿��� �Wܸ��UA� �1�/�V/�=<�t��Gj����}ZKn��eZ��5��q�Μ�id�>�e´�C�/��jq���\fEʐ���fs��mKc1l�ٮ���7*�r�e}�Ж��7�V4�X��(J{����O��M_.ckE��]>�K]�ٺ��Uׁ�F��n���Ag'�!EU����s��)l"��Cw5q\d���)��WV�d�_{v;+�����!��=�?�~PI����Iq�- (ɐ�?|E1L�!����(���X�HN�G��s�D�+���j�ɞ�,6=`�c����W���X��	��6e�M̳���\���)��A};ߖn��{��7�Y�.�������H���R����>�q���3e���K��~2��� un7𬙀̄�$V���d+�2�BY_&-�s�-L>���=:�p(o�h��]�(#���V��/��4ޤ�[�?^���V׊|�50�Tm��b�c%�vQv����i�(����2͙O'�XW�����3��pEVom'es���_���?_�d��m�Wܰ�@��(�bM��{1�;�(��ɣ����c��ϻ9Q&MT�0��4�q�+��b-��?@.~O�_f)������ъ�E�F��'@�W�-������ڔ�t*���~��m�-�&�02Sn>�/ò�A}�����_��E��d�Q\���}���Qk�      �      x������ � �      �      x������ � �     