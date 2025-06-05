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
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.organizations VALUES (1, 'Colegio San Patricio', 'Av. Siempreviva 742, Springfield', '555-1234', true, '2025-05-11 01:43:15.58073-04', NULL);


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.courses VALUES (9, '2° BÁSICO A', 1, '2025-05-31 19:07:28.904-04', '2025-05-31 19:07:28.904-04');
INSERT INTO public.courses VALUES (11, '1° BÁSICO A', 1, '2025-05-31 20:18:30.98-04', '2025-05-31 20:18:30.98-04');
INSERT INTO public.courses VALUES (12, '1° BÁSICO C', 1, '2025-05-31 20:18:31.019-04', '2025-05-31 20:18:31.019-04');
INSERT INTO public.courses VALUES (13, '2° BÁSICO B', 1, '2025-05-31 20:18:31.03-04', '2025-05-31 20:18:31.03-04');
INSERT INTO public.courses VALUES (14, '2° BÁSICO C', 1, '2025-05-31 20:18:31.039-04', '2025-05-31 20:18:31.039-04');
INSERT INTO public.courses VALUES (15, '3° BÁSICO A', 1, '2025-05-31 20:18:31.05-04', '2025-05-31 20:18:31.05-04');
INSERT INTO public.courses VALUES (16, '3° BÁSICO B', 1, '2025-05-31 20:18:31.058-04', '2025-05-31 20:18:31.058-04');
INSERT INTO public.courses VALUES (17, '3° BÁSICO C', 1, '2025-05-31 20:18:31.069-04', '2025-05-31 20:18:31.069-04');
INSERT INTO public.courses VALUES (18, '4° BÁSICO A', 1, '2025-05-31 20:18:31.077-04', '2025-05-31 20:18:31.077-04');
INSERT INTO public.courses VALUES (19, '4° BÁSICO B', 1, '2025-05-31 20:18:31.087-04', '2025-05-31 20:18:31.087-04');
INSERT INTO public.courses VALUES (20, '4° BÁSICO C', 1, '2025-05-31 20:18:31.097-04', '2025-05-31 20:18:31.097-04');
INSERT INTO public.courses VALUES (21, '5° BÁSICO A', 1, '2025-05-31 20:18:31.106-04', '2025-05-31 20:18:31.106-04');
INSERT INTO public.courses VALUES (22, '5° BÁSICO B', 1, '2025-05-31 20:18:31.116-04', '2025-05-31 20:18:31.116-04');
INSERT INTO public.courses VALUES (23, '5° BÁSICO C', 1, '2025-05-31 20:18:31.123-04', '2025-05-31 20:18:31.123-04');
INSERT INTO public.courses VALUES (24, '6° BÁSICO A', 1, '2025-05-31 20:18:31.134-04', '2025-05-31 20:18:31.134-04');
INSERT INTO public.courses VALUES (25, '6° BÁSICO B', 1, '2025-05-31 20:18:31.142-04', '2025-05-31 20:18:31.142-04');
INSERT INTO public.courses VALUES (26, '6° BÁSICO C', 1, '2025-05-31 20:18:31.155-04', '2025-05-31 20:18:31.155-04');
INSERT INTO public.courses VALUES (27, '7° BÁSICO A', 1, '2025-05-31 20:18:31.167-04', '2025-05-31 20:18:31.167-04');
INSERT INTO public.courses VALUES (28, '7° BÁSICO B', 1, '2025-05-31 20:18:31.182-04', '2025-05-31 20:18:31.182-04');
INSERT INTO public.courses VALUES (29, '7° BÁSICO C', 1, '2025-05-31 20:18:31.193-04', '2025-05-31 20:18:31.193-04');
INSERT INTO public.courses VALUES (30, '3° BÁSICO D', 1, '2025-06-02 00:45:32.7-04', '2025-06-02 00:45:32.7-04');
INSERT INTO public.courses VALUES (8, '1° BÁSICO B', 1, '2025-05-31 19:01:56.187-04', '2025-06-02 00:48:54.676-04');


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.roles VALUES (1, 'PARENT', 'Usuario con acceso a funciones de apoderado en el sistema. Son los usuarios que tienen un hijo en la organización, además de contar con delegados y contactos de emergencia.', '2025-04-29 19:25:26.807644-04', NULL);
INSERT INTO public.roles VALUES (2, 'INSPECTOR', 'Usuario con permisos para realizar el escaneo del código QR o ingreso manual del retiro', '2025-04-29 19:25:26.807644-04', NULL);
INSERT INTO public.roles VALUES (3, 'ADMIN', 'Usuario con acceso completo al sistema y funciones administrativas.', '2025-04-29 19:25:26.807644-04', NULL);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users VALUES (1, '11111111-1', 'testtallerinf@gmail.com', '$2b$12$0mD8vSzRfwGHPWju/wxJI.VTQs9J6eT4DeARBkpranMc/f9izYCdO', 'GONZALO ESTEBAN', 'ESCOBAR MENDOZA', '987654321', true, '2025-06-03 22:12:51.865-04', '2025-04-29 19:44:22.076088-04', 0, false, NULL, '2025-06-03 22:12:51.866-04', NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (3, '33333333-3', 'testtallerinf@gmail.com', '$2b$12$0mD8vSzRfwGHPWju/wxJI.VTQs9J6eT4DeARBkpranMc/f9izYCdO', 'RENATA ', 'CARRASCO FUENZALIDA', 'NO TIENE', true, '2025-06-03 22:16:33.528-04', '2025-04-29 19:44:22.076088-04', 0, false, NULL, '2025-06-03 22:16:33.528-04', NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES (2, '22222222-2', 'testtallerinf@gmail.com', '$2b$12$0mD8vSzRfwGHPWju/wxJI.VTQs9J6eT4DeARBkpranMc/f9izYCdO', 'ALEJANDRA CATALINA', 'PEREZ REBOLLEDO', '987654321', true, '2025-04-29 19:44:22.076088-04', '2025-05-11 23:11:17.119-04', 0, false, NULL, '2025-06-02 01:57:50.864-04', NULL, NULL, NULL, NULL);


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.students VALUES (2, '21111111-1', 'CARLOS', 'VALDEBENITO PEREZ', '2015-03-10', 1, 2, '2025-05-14 20:56:29.174376-04', 8, NULL);
INSERT INTO public.students VALUES (1, '22222222-2', 'ANA', 'QUIROZ ESCOBAR', '2015-01-15', 1, 1, '2025-05-14 20:56:29.174376-04', 9, NULL);
INSERT INTO public.students VALUES (4, '24444444-4', 'KELLER', 'CARO CARRASCO', '2018-05-28', 1, 3, '2025-05-18 12:36:31.271-04', 8, '2025-05-18 12:36:31.271-04');
INSERT INTO public.students VALUES (3, '23333333-3', 'CRISTIÁN', 'CARRASCO CARRASCO', '2019-08-29', 1, 3, '2025-05-18 12:36:31.295-04', 9, '2025-05-18 12:36:31.295-04');


--
-- Data for Name: user_organization_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_organization_roles VALUES (1, 1, 3, '2025-05-12 19:28:41.660825-04', '2025-05-12 19:28:41.660825-04');
INSERT INTO public.user_organization_roles VALUES (2, 1, 2, '2025-05-12 19:28:41.660825-04', '2025-05-12 19:28:41.660825-04');
INSERT INTO public.user_organization_roles VALUES (3, 1, 1, '2025-05-12 19:28:41.660825-04', '2025-05-12 19:28:41.660825-04');


--
-- Data for Name: withdrawal_reasons; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.withdrawal_reasons VALUES (1, 'CITA MÉDICA', '2025-05-30 16:54:24.698568-04', '2025-05-30 16:54:24.698568-04');
INSERT INTO public.withdrawal_reasons VALUES (2, 'EMERGENCIA FAMILIAR', '2025-05-30 16:54:24.698568-04', '2025-05-30 16:54:24.698568-04');
INSERT INTO public.withdrawal_reasons VALUES (3, 'FIN DE JORNADA ESCOLAR', '2025-05-30 16:54:24.698568-04', '2025-05-30 16:54:24.698568-04');
INSERT INTO public.withdrawal_reasons VALUES (4, 'ACTIVIDAD EXTRACURRICULAR', '2025-05-30 16:54:24.698568-04', '2025-05-30 16:54:24.698568-04');
INSERT INTO public.withdrawal_reasons VALUES (5, 'SALIDA EDUCATIVA', '2025-05-30 16:54:24.698568-04', '2025-05-30 16:54:24.698568-04');
INSERT INTO public.withdrawal_reasons VALUES (6, 'MALESTAR DEL ESTUDIANTE', '2025-05-30 16:54:24.698568-04', '2025-05-30 16:54:24.698568-04');
INSERT INTO public.withdrawal_reasons VALUES (7, 'OTRO (ESPECIFICAR)', '2025-05-30 16:54:24.698568-04', '2025-05-30 16:54:24.698568-04');


--
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.courses_id_seq', 31, true);


--
-- Name: organizations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.organizations_id_seq', 35, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 9, true);


--
-- Name: students_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.students_id_seq', 94, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 76, true);


--
-- Name: withdrawal_reasons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.withdrawal_reasons_id_seq', 7, true);


--
-- PostgreSQL database dump complete
--

