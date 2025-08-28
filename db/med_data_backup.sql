--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

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
-- Name: generate_hn_number(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_hn_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.hn_number := '9000' || LPAD(NEW.patient_id::TEXT, 4, '0');
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.generate_hn_number() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: adr_registry; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.adr_registry (
    adr_id integer NOT NULL,
    med_id integer NOT NULL,
    patient_id integer NOT NULL,
    description text NOT NULL,
    "time" timestamp without time zone NOT NULL
);


ALTER TABLE public.adr_registry OWNER TO postgres;

--
-- Name: adr_registry_adr_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.adr_registry_adr_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.adr_registry_adr_id_seq OWNER TO postgres;

--
-- Name: adr_registry_adr_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.adr_registry_adr_id_seq OWNED BY public.adr_registry.adr_id;


--
-- Name: allergy_registry; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.allergy_registry (
    allr_id integer NOT NULL,
    med_id integer NOT NULL,
    patient_id integer NOT NULL,
    symptoms text NOT NULL
);


ALTER TABLE public.allergy_registry OWNER TO postgres;

--
-- Name: allergy_registry_allr_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.allergy_registry_allr_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.allergy_registry_allr_id_seq OWNER TO postgres;

--
-- Name: allergy_registry_allr_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.allergy_registry_allr_id_seq OWNED BY public.allergy_registry.allr_id;


--
-- Name: error_medication; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.error_medication (
    err_med_id integer NOT NULL,
    "time" timestamp without time zone NOT NULL,
    patient_id integer NOT NULL,
    doctor_id integer NOT NULL,
    med_id integer NOT NULL,
    description text NOT NULL,
    resolved boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.error_medication OWNER TO postgres;

--
-- Name: error_medication_err_med_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.error_medication_err_med_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.error_medication_err_med_id_seq OWNER TO postgres;

--
-- Name: error_medication_err_med_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.error_medication_err_med_id_seq OWNED BY public.error_medication.err_med_id;


--
-- Name: med_cut_off_period; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.med_cut_off_period (
    med_period_id integer NOT NULL,
    period_day integer NOT NULL,
    period_month integer NOT NULL,
    period_time_h integer NOT NULL,
    period_time_m integer NOT NULL,
    sub_warehouse_id integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone
);


ALTER TABLE public.med_cut_off_period OWNER TO postgres;

--
-- Name: med_cut_off_period_med_period_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.med_cut_off_period_med_period_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.med_cut_off_period_med_period_id_seq OWNER TO postgres;

--
-- Name: med_cut_off_period_med_period_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.med_cut_off_period_med_period_id_seq OWNED BY public.med_cut_off_period.med_period_id;


--
-- Name: med_delivery; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.med_delivery (
    delivery_id integer NOT NULL,
    patient_id integer NOT NULL,
    delivery_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    delivery_method text NOT NULL,
    receiver_name text NOT NULL,
    receiver_phone text NOT NULL,
    address text NOT NULL,
    note text,
    status text DEFAULT 'Pending'::text,
    medicine_list jsonb
);


ALTER TABLE public.med_delivery OWNER TO postgres;

--
-- Name: med_delivery_delivery_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.med_delivery_delivery_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.med_delivery_delivery_id_seq OWNER TO postgres;

--
-- Name: med_delivery_delivery_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.med_delivery_delivery_id_seq OWNED BY public.med_delivery.delivery_id;


--
-- Name: med_evaluation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.med_evaluation (
    me_id integer NOT NULL,
    med_id integer NOT NULL,
    description text
);


ALTER TABLE public.med_evaluation OWNER TO postgres;

--
-- Name: med_evaluation_me_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.med_evaluation_me_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.med_evaluation_me_id_seq OWNER TO postgres;

--
-- Name: med_evaluation_me_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.med_evaluation_me_id_seq OWNED BY public.med_evaluation.me_id;


--
-- Name: med_interaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.med_interaction (
    interaction_id integer NOT NULL,
    med_id_1 integer NOT NULL,
    med_id_2 integer NOT NULL,
    description text NOT NULL,
    severity text,
    evidence_level text,
    source_reference text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    interaction_type text,
    CONSTRAINT med_interaction_interaction_type_check CHECK ((interaction_type = ANY (ARRAY['compatible'::text, 'incompatible'::text, 'neutral'::text, 'unknown'::text])))
);


ALTER TABLE public.med_interaction OWNER TO postgres;

--
-- Name: med_interaction_interacton_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.med_interaction_interacton_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.med_interaction_interacton_id_seq OWNER TO postgres;

--
-- Name: med_interaction_interacton_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.med_interaction_interacton_id_seq OWNED BY public.med_interaction.interaction_id;


--
-- Name: med_order_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.med_order_history (
    history_id integer NOT NULL,
    "time" timestamp without time zone NOT NULL,
    patient_id integer,
    doctor_id integer,
    description text,
    medicines jsonb
);


ALTER TABLE public.med_order_history OWNER TO postgres;

--
-- Name: med_order_history_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.med_order_history_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.med_order_history_history_id_seq OWNER TO postgres;

--
-- Name: med_order_history_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.med_order_history_history_id_seq OWNED BY public.med_order_history.history_id;


--
-- Name: med_order_rights; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.med_order_rights (
    med_rights_id integer NOT NULL,
    doctor_rights boolean DEFAULT false,
    dentist_rights boolean DEFAULT false,
    phamarcist_rights boolean DEFAULT false,
    psychohiatrist_rights boolean DEFAULT false
);


ALTER TABLE public.med_order_rights OWNER TO postgres;

--
-- Name: med_order_rights_med_rights_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.med_order_rights_med_rights_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.med_order_rights_med_rights_id_seq OWNER TO postgres;

--
-- Name: med_order_rights_med_rights_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.med_order_rights_med_rights_id_seq OWNED BY public.med_order_rights.med_rights_id;


--
-- Name: med_problem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.med_problem (
    mp_id integer NOT NULL,
    med_id integer NOT NULL,
    description text NOT NULL,
    usage_id integer,
    problem_type text,
    reported_by integer,
    reported_at timestamp without time zone DEFAULT now(),
    is_resolved boolean DEFAULT false
);


ALTER TABLE public.med_problem OWNER TO postgres;

--
-- Name: med_probolem_mp_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.med_probolem_mp_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.med_probolem_mp_id_seq OWNER TO postgres;

--
-- Name: med_probolem_mp_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.med_probolem_mp_id_seq OWNED BY public.med_problem.mp_id;


--
-- Name: med_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.med_requests (
    request_id integer NOT NULL,
    med_id integer NOT NULL,
    quantity integer NOT NULL,
    unit text NOT NULL,
    requested_by integer NOT NULL,
    approved_by integer,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    request_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    approved_time timestamp without time zone,
    dispensed_time timestamp without time zone,
    note text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT med_requests_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.med_requests OWNER TO postgres;

--
-- Name: med_requests_request_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.med_requests_request_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.med_requests_request_id_seq OWNER TO postgres;

--
-- Name: med_requests_request_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.med_requests_request_id_seq OWNED BY public.med_requests.request_id;


--
-- Name: med_stock_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.med_stock_history (
    history_id integer NOT NULL,
    med_id integer,
    change_type character varying(50) NOT NULL,
    quantity_change integer NOT NULL,
    balance_after integer NOT NULL,
    reference_id integer,
    "time" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.med_stock_history OWNER TO postgres;

--
-- Name: med_stock_history_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.med_stock_history_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.med_stock_history_history_id_seq OWNER TO postgres;

--
-- Name: med_stock_history_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.med_stock_history_history_id_seq OWNED BY public.med_stock_history.history_id;


--
-- Name: med_table; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.med_table (
    med_id integer NOT NULL,
    med_name text NOT NULL,
    med_generic_name text,
    med_severity text NOT NULL,
    med_counting_unit text NOT NULL,
    med_marketing_name text NOT NULL,
    med_thai_name text,
    med_cost_price double precision NOT NULL,
    med_selling_price double precision NOT NULL,
    med_medium_price double precision NOT NULL,
    med_dosage_form text,
    med_medical_category text,
    med_essential_med_list "char",
    med_out_of_stock boolean DEFAULT false NOT NULL,
    med_replacement text,
    "med_TMT_GP_name" text,
    "med_TMT_TP_name" text,
    med_quantity integer,
    med_dose_dialogue text,
    "med_TMT_code" text,
    "med_TPU_code" text,
    med_pregnancy_cagetory "char",
    med_set_new_price boolean DEFAULT false NOT NULL,
    "mde_dispence_IPD_freq" integer,
    med_mfg date NOT NULL,
    med_exp date NOT NULL
);


ALTER TABLE public.med_table OWNER TO postgres;

--
-- Name: med_table_med_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.med_table_med_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.med_table_med_id_seq OWNER TO postgres;

--
-- Name: med_table_med_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.med_table_med_id_seq OWNED BY public.med_table.med_id;


--
-- Name: med_usage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.med_usage (
    usage_id integer NOT NULL,
    patient_id integer NOT NULL,
    med_id integer NOT NULL,
    order_datetime timestamp without time zone DEFAULT now(),
    start_datetime timestamp without time zone,
    end_datetime timestamp without time zone,
    dosage text,
    frequency text,
    route text,
    usage_status text DEFAULT 'ongoing'::text,
    note text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.med_usage OWNER TO postgres;

--
-- Name: med_usage_usage_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.med_usage_usage_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.med_usage_usage_id_seq OWNER TO postgres;

--
-- Name: med_usage_usage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.med_usage_usage_id_seq OWNED BY public.med_usage.usage_id;


--
-- Name: medicine_order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medicine_order (
    order_id integer NOT NULL,
    med_id_list text NOT NULL,
    patient_id integer NOT NULL,
    doctor_name text NOT NULL,
    description text NOT NULL,
    "time" timestamp without time zone
);


ALTER TABLE public.medicine_order OWNER TO postgres;

--
-- Name: medicine_order_order_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medicine_order_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medicine_order_order_id_seq OWNER TO postgres;

--
-- Name: medicine_order_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medicine_order_order_id_seq OWNED BY public.medicine_order.order_id;


--
-- Name: medicines_TEST; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."medicines_TEST" (
    med_id integer NOT NULL,
    med_name text,
    med_generic_name text,
    med_scientific_name text,
    med_description text,
    med_dosage text,
    med_side_effect text,
    med_interaction text,
    med_price double precision,
    med_type text,
    med_type_th text
);


ALTER TABLE public."medicines_TEST" OWNER TO postgres;

--
-- Name: medicines_med_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medicines_med_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medicines_med_id_seq OWNER TO postgres;

--
-- Name: medicines_med_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medicines_med_id_seq OWNED BY public."medicines_TEST".med_id;


--
-- Name: overdue_med; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.overdue_med (
    overdue_id integer NOT NULL,
    med_id integer NOT NULL,
    "time" date NOT NULL,
    dispense_status boolean DEFAULT false NOT NULL,
    patient_id integer
);


ALTER TABLE public.overdue_med OWNER TO postgres;

--
-- Name: overdue_med_overdue_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.overdue_med_overdue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.overdue_med_overdue_id_seq OWNER TO postgres;

--
-- Name: overdue_med_overdue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.overdue_med_overdue_id_seq OWNED BY public.overdue_med.overdue_id;


--
-- Name: patient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient (
    patient_id integer NOT NULL,
    national_id text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    gender text NOT NULL,
    birthday date NOT NULL,
    age_y integer DEFAULT 0 NOT NULL,
    age_m integer DEFAULT 0 NOT NULL,
    age_d integer DEFAULT 0 NOT NULL,
    blood_group "char",
    "PMH" text,
    phone text,
    height double precision,
    weight double precision,
    bmi double precision,
    patient_addr_id integer,
    hn_number text NOT NULL,
    allergy_id integer,
    first_name_eng character varying(100) DEFAULT ''::character varying NOT NULL,
    last_name_eng character varying(100) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE public.patient OWNER TO postgres;

--
-- Name: patient_address; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient_address (
    address_id integer NOT NULL,
    patient_addr_id integer NOT NULL,
    house_number text NOT NULL,
    village_number integer,
    sub_district text NOT NULL,
    district text NOT NULL,
    province text NOT NULL,
    road text,
    postal_code character varying(10) NOT NULL
);


ALTER TABLE public.patient_address OWNER TO postgres;

--
-- Name: patient_address_address_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patient_address_address_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patient_address_address_id_seq OWNER TO postgres;

--
-- Name: patient_address_address_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patient_address_address_id_seq OWNED BY public.patient_address.address_id;


--
-- Name: rad_registry; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rad_registry (
    rad_id integer NOT NULL,
    med_id integer NOT NULL,
    patient_id integer NOT NULL,
    description text NOT NULL,
    acceptance boolean DEFAULT false NOT NULL,
    acceptance_time timestamp without time zone NOT NULL,
    specimen text,
    pathogenic text,
    indications text,
    indications_criteria text,
    submission_time timestamp without time zone
);


ALTER TABLE public.rad_registry OWNER TO postgres;

--
-- Name: rad_regisrty_rad_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rad_regisrty_rad_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rad_regisrty_rad_id_seq OWNER TO postgres;

--
-- Name: rad_regisrty_rad_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rad_regisrty_rad_id_seq OWNED BY public.rad_registry.rad_id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    "roleID" integer DEFAULT 0 NOT NULL,
    role_name text NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: sticker_form; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sticker_form (
    stk_id integer NOT NULL,
    fstk_form text
);


ALTER TABLE public.sticker_form OWNER TO postgres;

--
-- Name: sticker_form_stk_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sticker_form_stk_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sticker_form_stk_id_seq OWNER TO postgres;

--
-- Name: sticker_form_stk_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sticker_form_stk_id_seq OWNED BY public.sticker_form.stk_id;


--
-- Name: sub_warehouse; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sub_warehouse (
    sub_warehouse_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true
);


ALTER TABLE public.sub_warehouse OWNER TO postgres;

--
-- Name: sub_warehouse_sub_warehouse_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sub_warehouse_sub_warehouse_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sub_warehouse_sub_warehouse_id_seq OWNER TO postgres;

--
-- Name: sub_warehouse_sub_warehouse_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sub_warehouse_sub_warehouse_id_seq OWNED BY public.sub_warehouse.sub_warehouse_id;


--
-- Name: temp_humidity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.temp_humidity (
    "time" timestamp without time zone NOT NULL,
    tempetature double precision NOT NULL,
    humidity double precision NOT NULL
);


ALTER TABLE public.temp_humidity OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    uid integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    "roleID" integer NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_uid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_uid_seq OWNER TO postgres;

--
-- Name: users_uid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_uid_seq OWNED BY public.users.uid;


--
-- Name: adr_registry adr_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adr_registry ALTER COLUMN adr_id SET DEFAULT nextval('public.adr_registry_adr_id_seq'::regclass);


--
-- Name: allergy_registry allr_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.allergy_registry ALTER COLUMN allr_id SET DEFAULT nextval('public.allergy_registry_allr_id_seq'::regclass);


--
-- Name: error_medication err_med_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.error_medication ALTER COLUMN err_med_id SET DEFAULT nextval('public.error_medication_err_med_id_seq'::regclass);


--
-- Name: med_cut_off_period med_period_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_cut_off_period ALTER COLUMN med_period_id SET DEFAULT nextval('public.med_cut_off_period_med_period_id_seq'::regclass);


--
-- Name: med_delivery delivery_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_delivery ALTER COLUMN delivery_id SET DEFAULT nextval('public.med_delivery_delivery_id_seq'::regclass);


--
-- Name: med_evaluation me_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_evaluation ALTER COLUMN me_id SET DEFAULT nextval('public.med_evaluation_me_id_seq'::regclass);


--
-- Name: med_interaction interaction_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_interaction ALTER COLUMN interaction_id SET DEFAULT nextval('public.med_interaction_interacton_id_seq'::regclass);


--
-- Name: med_order_history history_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_order_history ALTER COLUMN history_id SET DEFAULT nextval('public.med_order_history_history_id_seq'::regclass);


--
-- Name: med_order_rights med_rights_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_order_rights ALTER COLUMN med_rights_id SET DEFAULT nextval('public.med_order_rights_med_rights_id_seq'::regclass);


--
-- Name: med_problem mp_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_problem ALTER COLUMN mp_id SET DEFAULT nextval('public.med_probolem_mp_id_seq'::regclass);


--
-- Name: med_requests request_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_requests ALTER COLUMN request_id SET DEFAULT nextval('public.med_requests_request_id_seq'::regclass);


--
-- Name: med_stock_history history_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_stock_history ALTER COLUMN history_id SET DEFAULT nextval('public.med_stock_history_history_id_seq'::regclass);


--
-- Name: med_table med_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_table ALTER COLUMN med_id SET DEFAULT nextval('public.med_table_med_id_seq'::regclass);


--
-- Name: med_usage usage_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_usage ALTER COLUMN usage_id SET DEFAULT nextval('public.med_usage_usage_id_seq'::regclass);


--
-- Name: medicine_order order_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine_order ALTER COLUMN order_id SET DEFAULT nextval('public.medicine_order_order_id_seq'::regclass);


--
-- Name: medicines_TEST med_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."medicines_TEST" ALTER COLUMN med_id SET DEFAULT nextval('public.medicines_med_id_seq'::regclass);


--
-- Name: overdue_med overdue_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.overdue_med ALTER COLUMN overdue_id SET DEFAULT nextval('public.overdue_med_overdue_id_seq'::regclass);


--
-- Name: patient_address address_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_address ALTER COLUMN address_id SET DEFAULT nextval('public.patient_address_address_id_seq'::regclass);


--
-- Name: rad_registry rad_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rad_registry ALTER COLUMN rad_id SET DEFAULT nextval('public.rad_regisrty_rad_id_seq'::regclass);


--
-- Name: sticker_form stk_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sticker_form ALTER COLUMN stk_id SET DEFAULT nextval('public.sticker_form_stk_id_seq'::regclass);


--
-- Name: sub_warehouse sub_warehouse_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_warehouse ALTER COLUMN sub_warehouse_id SET DEFAULT nextval('public.sub_warehouse_sub_warehouse_id_seq'::regclass);


--
-- Name: users uid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN uid SET DEFAULT nextval('public.users_uid_seq'::regclass);


--
-- Data for Name: adr_registry; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.adr_registry (adr_id, med_id, patient_id, description, "time") FROM stdin;
\.


--
-- Data for Name: allergy_registry; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.allergy_registry (allr_id, med_id, patient_id, symptoms) FROM stdin;
11	1	1	ผื่นแดง คัน
13	3	3	หายใจติดขัด
14	4	4	หน้าบวม ตาบวม
16	6	6	คันผิวหนัง ผื่นลมพิษ
17	7	7	ปวดท้อง ท้องเสีย
19	9	9	มีไข้ หนาวสั่น
12	2	20	เวียนศีรษะ คลื่นไส้
15	5	11	แน่นหน้าอก หายใจลำบาก
18	8	16	บวมริมฝีปาก คันคอ
20	10	5	ช็อคหมดสติ
21	13	1	อาเจียน
\.


--
-- Data for Name: error_medication; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.error_medication (err_med_id, "time", patient_id, doctor_id, med_id, description, resolved, created_at, updated_at) FROM stdin;
1	2025-06-15 10:29:07.723	1	0	6	ดดดด	f	2025-06-15 17:29:11.594578	2025-06-15 17:29:11.594578
2	2025-06-15 10:29:34.023	1	0	4	อะไร	f	2025-06-15 17:29:39.621145	2025-06-15 17:29:39.621145
3	2025-06-16 08:41:53.282	2	0	3	nnn	f	2025-06-16 15:41:55.902327	2025-06-16 15:41:55.902327
4	2025-06-16 08:45:53.971	8	0	16	,,,,	f	2025-06-16 15:45:56.931617	2025-06-16 15:45:56.931617
5	2025-06-16 09:12:41.704	10	0	19	llllllllll	f	2025-06-16 16:12:45.998588	2025-06-16 16:12:45.998588
6	2025-06-19 18:05:08.344	1	0	2		f	2025-06-20 01:05:11.486744	2025-06-20 01:05:11.486744
\.


--
-- Data for Name: med_cut_off_period; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.med_cut_off_period (med_period_id, period_day, period_month, period_time_h, period_time_m, sub_warehouse_id, is_active, created_at, updated_at) FROM stdin;
16	15	6	9	0	1	t	2025-06-13 14:38:34.509613	2025-06-13 14:38:34.509613
17	1	1	14	30	1	t	2025-06-13 14:38:34.509613	2025-06-13 14:38:34.509613
18	30	3	8	45	1	f	2025-06-13 14:38:34.509613	2025-06-13 14:38:34.509613
19	10	12	16	0	1	t	2025-06-13 14:38:34.509613	2025-06-13 14:38:34.509613
20	20	9	13	15	1	t	2025-06-13 14:38:34.509613	2025-06-13 14:38:34.509613
\.


--
-- Data for Name: med_delivery; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.med_delivery (delivery_id, patient_id, delivery_date, delivery_method, receiver_name, receiver_phone, address, note, status, medicine_list) FROM stdin;
17	11	2025-04-30 15:50:07.219356		ธนกร ศรีสวัสดิ์	0912345678	90/4 หมู่ null ถนนเพชรเกษม ตำบลโพธาราม, อำเภอโพธาราม, จังหวัดราชบุรี 70120		Pending	\N
18	1	2025-04-30 15:54:15.742841	ขนส่งโดย Kerry Express	สมชาย ใจดี	0812345678	99/1 หมู่ 3 ถนนเพชรเกษม ตำบลหนองแขม อำเภอหนองแขม จังหวัดกรุงเทพมหานคร 10160	กรุณาจัดส่งช่วงเย็น	Pending	\N
22	8	2025-04-30 17:22:30.75093		ศิริพร ไพศาล	0867788990	159 หมู่ 2 ถนนสุขุมวิท, ตำบลบ้านบึง, อำเภอบ้านบึง, จังหวัดชลบุรี 20170	gggggg	Delivered	[{"med_id": 1, "quantity": 3}, {"med_id": 2, "quantity": 7}, {"med_id": 3, "quantity": 1}]
25	2	2025-07-09 12:46:41.603263		สมหญิง สวยงาม	0897654321	45 หมู่ null ถนนลาดพร้าว 101, ตำบลลาดพร้าว, อำเภอจตุจักร, จังหวัดกรุงเทพมหานคร 10900		Delivered	[{"med_id": 1, "quantity": 13}, {"med_id": 14, "quantity": 1}]
21	8	2025-04-30 17:03:26.911195	ddddd	ศิริพร ไพศาล	0867788990	159 หมู่ 2 ถนนสุขุมวิท, ตำบลบ้านบึง, อำเภอบ้านบึง, จังหวัดชลบุรี 20170	sdv	Delivered	[{"med_id": 9, "quantity": 3}]
26	10	2025-08-09 11:01:16.817003	รับที่โรงพยาบาล	วราภรณ์ เพียรดี	0889900112	35/7 หมู่ 4 ถนนกาญจนบุรี-ไทรโยค, ตำบลท่าม่วง, อำเภอท่าม่วง, จังหวัดกาญจนบุรี 71110		delivered	[{"med_id": 1, "quantity": 1}, {"med_id": 2, "quantity": 3}]
24	4	2025-05-18 15:35:08.229691	เดิน	อรทัย บุญมาก	0823344556	22/5 หมู่ 5 ถนนพุทธมณฑลสาย 2, ตำบลบางแค, อำเภอบางแค, จังหวัดกรุงเทพมหานคร 10160		Delivered	[{"med_id": 3, "quantity": 4}, {"med_id": 6, "quantity": 1}]
16	6	2025-04-30 15:49:42.006074		ชลธิชา สมสุข	0845566778	56/9 หมู่ null ถนนบรมราชชนนี ตำบลศาลายา, อำเภอพุทธมณฑล, จังหวัดนครปฐม 73170	test note	Delivered	[{"med_id": 3, "quantity": 4}]
20	1	2025-04-30 17:02:47.58075	ขนส่งโดย Kerry Express	สมชาย ใจดี	0812345678	99/1 หมู่ 3 ถนนเพชรเกษม ตำบลหนองแขม อำเภอหนองแขม จังหวัดกรุงเทพมหานคร 10160	กรุณาจัดส่งช่วงเย็น	delivered	[]
19	1	2025-04-30 16:52:15.977098	ขนส่งโดย Kerry Express	สมชาย ใจดี	0812345678	99/1 หมู่ 3 ถนนเพชรเกษม ตำบลหนองแขม อำเภอหนองแขม จังหวัดกรุงเทพมหานคร 10160	กรุณาจัดส่งช่วงเย็น	delivering	[]
\.


--
-- Data for Name: med_evaluation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.med_evaluation (me_id, med_id, description) FROM stdin;
\.


--
-- Data for Name: med_interaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.med_interaction (interaction_id, med_id_1, med_id_2, description, severity, evidence_level, source_reference, created_at, updated_at, is_active, interaction_type) FROM stdin;
2	3	4	Concurrent use of Amoxicillin and Aspirin may increase the chance of allergic reactions.	Moderate	Case Report	https://pubmed.ncbi.nlm.nih.gov/234567	2025-05-27 14:10:12.856418	2025-05-27 14:10:12.856418	t	\N
6	5	20	Cetirizine and Ranitidine may interact to increase central nervous system depression in sensitive patients.	Mild	Case reports	ClinPharm Reference v2.3	2025-05-28 16:15:55.829228	2025-05-28 16:15:55.829228	t	\N
7	25	17	Using Metoprolol with Amlodipine may lead to additive effects in reducing blood pressure and heart rate.	Moderate	Hospital data review	Internal Medicine Journal 2021	2025-05-28 16:15:55.829228	2025-05-28 16:15:55.829228	t	\N
8	13	29	Fluoxetine may inhibit the metabolism of Simvastatin, increasing the risk of statin-induced side effects.	Moderate	Pharmacokinetic studies	JAMA 2020; 324(5): 482–490	2025-05-28 16:15:55.829228	2025-05-28 16:15:55.829228	t	\N
9	19	7	Combining Spironolactone with Losartan can increase the risk of hyperkalemia.	Severe	Clinical observations	British Medical Journal, Vol. 375	2025-05-28 16:15:55.829228	2025-05-28 16:15:55.829228	t	\N
3	5	6	Cetirizine with Metformin has no known severe interaction but monitor for dizziness.	Mild	Expert Opinion		2025-05-27 14:10:12.856418	2025-05-27 14:10:12.856418	t	\N
10	15	21	Concurrent use of Enalapril and Allopurinol may increase the risk of hypersensitivity reactions.	Moderate	Drug safety advisory	FDA Drug Interaction Bulletin Q3-2022	2025-05-28 16:15:55.829228	2025-05-28 16:15:55.829228	t	\N
23	10	1	cccc	\N	\N	\N	2025-05-28 18:19:48.662784	2025-05-28 18:19:48.662784	t	\N
1	1	2	Paracetamol may increase the risk of gastrointestinal bleeding when used with Ibuprofen.	Moderate	Clinical Trial	https://pubmed.ncbi.nlm.nih.gov/123456	2025-05-27 14:10:12.856418	2025-05-27 14:10:12.856418	t	\N
26	1	13	wsgvwsdves	Moderate	egewefcs		2025-06-20 20:19:46.919909	2025-06-20 20:19:46.919909	f	compatible
\.


--
-- Data for Name: med_order_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.med_order_history (history_id, "time", patient_id, doctor_id, description, medicines) FROM stdin;
1	2025-04-04 23:09:43.999567	4	0	มีอาการท้องเสียและปวดท้อง	[{"med_id": 14, "quantity": 2}, {"med_id": 1, "quantity": 5}, {"med_id": 23, "quantity": 1}, {"med_id": 28, "quantity": 2}, {"med_id": 17, "quantity": 4}]
2	2025-04-04 23:10:13.229115	10	0	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 11, "quantity": 4}, {"med_id": 19, "quantity": 3}, {"med_id": 6, "quantity": 3}, {"med_id": 17, "quantity": 4}]
3	2025-04-05 20:51:59.375426	7	0	มีอาการท้องเสียและปวดท้อง	[{"med_id": 12, "quantity": 1}]
4	2025-04-05 22:19:24.091012	7	0	มีอาการท้องเสียและปวดท้อง	[{"med_id": 2, "quantity": 3}, {"med_id": 19, "quantity": 4}, {"med_id": 16, "quantity": 3}]
5	2025-04-05 22:21:31.626757	15	0	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 8, "quantity": 4}, {"med_id": 15, "quantity": 4}, {"med_id": 20, "quantity": 3}, {"med_id": 13, "quantity": 1}, {"med_id": 3, "quantity": 4}]
6	2025-04-05 22:23:12.335047	14	0	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 3, "quantity": 2}, {"med_id": 30, "quantity": 4}, {"med_id": 14, "quantity": 3}, {"med_id": 22, "quantity": 5}, {"med_id": 23, "quantity": 2}]
7	2025-04-06 09:42:22.859126	14	0	มีอาการท้องเสียและปวดท้อง	[{"med_id": 20, "quantity": 3}]
8	2025-04-06 11:01:45.006445	1	0	มีอาการท้องเสียและปวดท้อง	[{"med_id": 5, "quantity": 2}, {"med_id": 8, "quantity": 4}, {"med_id": 14, "quantity": 1}, {"med_id": 20, "quantity": 1}, {"med_id": 4, "quantity": 3}]
9	2025-04-14 11:50:03.342879	1	0	มีอาการท้องเสียและปวดท้อง	[{"med_id": 4, "quantity": 12}]
10	2025-04-16 12:52:31.397698	10	0	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 7, "quantity": 2}, {"med_id": 29, "quantity": 2}, {"med_id": 28, "quantity": 4}, {"med_id": 15, "quantity": 1}, {"med_id": 21, "quantity": 1}]
11	2025-04-28 21:18:56.588469	1	0	มีอาการไข้และปวดหัว	[{"med_id": 20, "quantity": 5}, {"med_id": 7, "quantity": 4}, {"med_id": 13, "quantity": 1}, {"med_id": 3, "quantity": 2}, {"med_id": 25, "quantity": 4}]
12	2025-04-29 01:34:18.76084	1	0	มีอาการไข้และปวดหัว	[{"med_id": 12, "quantity": 3}, {"med_id": 8, "quantity": 3}, {"med_id": 21, "quantity": 5}, {"med_id": 27, "quantity": 4}]
13	2025-04-29 01:35:34.830577	2	0	มีอาการท้องเสียและปวดท้อง	[{"med_id": 3, "quantity": 1}]
14	2025-04-29 01:39:15.901166	4	0	มีอาการไข้และปวดหัว	[{"med_id": 4, "quantity": 3}, {"med_id": 7, "quantity": 2}, {"med_id": 6, "quantity": 1}, {"med_id": 27, "quantity": 1}]
15	2025-04-29 01:40:15.822363	8	0	มีอาการไอและเจ็บคอ	[{"med_id": 5, "quantity": 3}, {"med_id": 10, "quantity": 4}, {"med_id": 16, "quantity": 5}, {"med_id": 18, "quantity": 2}, {"med_id": 23, "quantity": 3}]
16	2025-04-29 01:44:06.646946	1	0	มีอาการไข้และปวดหัว	[{"med_id": 13, "quantity": 4}, {"med_id": 19, "quantity": 5}, {"med_id": 20, "quantity": 4}, {"med_id": 5, "quantity": 3}, {"med_id": 26, "quantity": 3}]
17	2025-05-02 16:13:54.170077	6	0	มีอาการท้องเสียและปวดท้อง	[{"med_id": 6, "quantity": 1}, {"med_id": 22, "quantity": 1}, {"med_id": 25, "quantity": 2}, {"med_id": 16, "quantity": 2}]
18	2025-05-02 16:16:40.894024	1	0	มีอาการไอและเจ็บคอ	[{"med_id": 13, "quantity": 1}, {"med_id": 2, "quantity": 3}, {"med_id": 29, "quantity": 5}, {"med_id": 16, "quantity": 2}]
19	2025-05-24 21:23:22.737022	1	0	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 29, "quantity": 1}, {"med_id": 27, "quantity": 1}, {"med_id": 25, "quantity": 3}, {"med_id": 1, "quantity": 3}, {"med_id": 3, "quantity": 8}]
20	2025-05-24 21:30:13.813068	1	0	มีอาการไอและเจ็บคอ	[{"med_id": 29, "quantity": 1}, {"med_id": 27, "quantity": 1}, {"med_id": 25, "quantity": 3}, {"med_id": 1, "quantity": 3}, {"med_id": 3, "quantity": 8}, {"med_id": 3, "quantity": 4}]
21	2025-05-24 21:42:29.653726	1	0	มีอาการท้องเสียและปวดท้อง	[{"med_id": 23, "quantity": 2}, {"med_id": 30, "quantity": 1}, {"med_id": 16, "quantity": 1}, {"med_id": 6, "quantity": 2}, {"med_id": 2, "quantity": 5}]
22	2025-05-24 21:43:07.17409	2	0	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 16, "quantity": 3}, {"med_id": 27, "quantity": 2}]
47	2025-07-28 22:21:55.750439	1	0	มีอาการไอและเจ็บคอ	[{"med_id": 17, "quantity": 2}]
48	2025-08-06 15:05:15.21009	1	0	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 13, "quantity": 2}]
23	2025-05-24 23:06:11.22912	1	0	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 7, "quantity": 2}, {"med_id": 1, "quantity": 5}, {"med_id": 8, "quantity": 4}, {"med_id": 3, "quantity": 1}, {"med_id": 10, "quantity": 2}]
24	2025-05-24 23:23:49.123696	1	0	มีอาการท้องเสียและปวดท้อง	[{"med_id": 10, "quantity": 5}, {"med_id": 2, "quantity": 5}]
25	2025-05-24 23:28:35.917135	7	0	มีอาการไข้และปวดหัว	[{"med_id": 25, "quantity": 30}, {"med_id": 27, "quantity": 4}, {"med_id": 3, "quantity": 1}, {"med_id": 24, "quantity": 1}, {"med_id": 2, "quantity": 5}]
26	2025-05-25 14:26:50.759981	1	0	มีอาการท้องเสียและปวดท้อง	[{"med_id": 25, "quantity": 5}, {"med_id": 24, "quantity": 2}, {"med_id": 9, "quantity": 3}, {"med_id": 14, "quantity": 2}, {"med_id": 4, "quantity": 1}, {"med_id": 1, "quantity": 5}]
27	2025-05-25 14:26:53.674546	1	0	มีอาการท้องเสียและปวดท้อง	[{"med_id": 25, "quantity": 5}, {"med_id": 24, "quantity": 2}, {"med_id": 9, "quantity": 3}, {"med_id": 14, "quantity": 2}, {"med_id": 4, "quantity": 1}, {"med_id": 1, "quantity": 5}]
28	2025-05-25 14:30:38.122111	1	0	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 27, "quantity": 2}, {"med_id": 25, "quantity": 3}]
29	2025-05-25 14:30:43.403365	1	0	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 27, "quantity": 2}, {"med_id": 25, "quantity": 3}]
30	2025-05-25 14:32:52.586783	1	0	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 9, "quantity": 4}, {"med_id": 21, "quantity": 3}, {"med_id": 17, "quantity": 2}, {"med_id": 13, "quantity": 2}]
31	2025-05-25 14:32:58.87506	1	0	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 9, "quantity": 5}]
32	2025-05-25 14:35:39.446383	1	0	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 25, "quantity": 3}, {"med_id": 15, "quantity": 1}]
33	2025-05-25 14:45:37.327161	1	0	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 1, "quantity": 5}, {"med_id": 4, "quantity": 3}, {"med_id": 20, "quantity": 1}, {"med_id": 16, "quantity": 4}]
34	2025-05-25 21:10:38.804458	4	0	มีอาการไอและเจ็บคอ	[{"med_id": 2, "quantity": 3}, {"med_id": 27, "quantity": 5}, {"med_id": 15, "quantity": 2}, {"med_id": 19, "quantity": 3}, {"med_id": 18, "quantity": 2}]
35	2025-05-29 14:31:16.707209	1	0	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 3, "quantity": 2}, {"med_id": 16, "quantity": 1}, {"med_id": 4, "quantity": 5}, {"med_id": 15, "quantity": 2}]
36	2025-05-29 14:37:28.129107	1	0	มีอาการท้องเสียและปวดท้อง	[{"med_id": 5, "quantity": 5}, {"med_id": 12, "quantity": 2}, {"med_id": 28, "quantity": 1}]
37	2025-05-29 14:37:44.362278	1	0	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 1, "quantity": 5}]
38	2025-05-29 14:38:03.084018	1	0	มีอาการไข้และปวดหัว	[{"med_id": 13, "quantity": 4}, {"med_id": 8, "quantity": 5}, {"med_id": 23, "quantity": 5}, {"med_id": 14, "quantity": 4}, {"med_id": 19, "quantity": 4}]
39	2025-05-29 14:39:28.877131	1	0	มีอาการไข้และปวดหัว	[{"med_id": 6, "quantity": 1}, {"med_id": 15, "quantity": 1}]
40	2025-06-17 16:20:17.55527	1	0	มีอาการไข้และปวดหัว	[{"med_id": 29, "quantity": 5}, {"med_id": 27, "quantity": 5}, {"med_id": 16, "quantity": 3}, {"med_id": 5, "quantity": 4}, {"med_id": 17, "quantity": 3}]
41	2025-06-17 16:22:29.793559	1	0	มีอาการท้องเสียและปวดท้อง	[{"med_id": 22, "quantity": 5}]
42	2025-06-17 22:40:57.59018	1	0	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 17, "quantity": 2}, {"med_id": 16, "quantity": 3}]
43	2025-06-20 01:04:48.141892	1	0	มีอาการไอและเจ็บคอ	[{"med_id": 2, "quantity": 4}, {"med_id": 16, "quantity": 2}, {"med_id": 7, "quantity": 4}, {"med_id": 21, "quantity": 5}, {"med_id": 25, "quantity": 2}]
44	2025-06-21 08:53:33.143227	9	0	มีอาการท้องเสียและปวดท้อง	[{"med_id": 25, "quantity": 3}, {"med_id": 26, "quantity": 1}, {"med_id": 1, "quantity": 2}, {"med_id": 2, "quantity": 2}, {"med_id": 16, "quantity": 3}]
45	2025-07-19 19:58:34.305102	1	0	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 11, "quantity": 3}, {"med_id": 14, "quantity": 3}, {"med_id": 24, "quantity": 2}]
46	2025-07-28 22:21:25.722485	1	0	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 13, "quantity": 4}, {"med_id": 3, "quantity": 100}, {"med_id": 14, "quantity": 5}, {"med_id": 25, "quantity": 999}]
49	2025-08-08 11:58:26.759553	1	0	มีอาการไข้และปวดหัว	[{"med_id": 30, "quantity": 5}, {"med_id": 24, "quantity": 2}, {"med_id": 16, "quantity": 1}, {"med_id": 6, "quantity": 5}]
50	2025-08-08 13:07:39.952978	2	0	มีอาการไข้และปวดหัว	[{"med_id": 21, "quantity": 3}, {"med_id": 8, "quantity": 1}, {"med_id": 23, "quantity": 3}, {"med_id": 22, "quantity": 5}]
51	2025-08-08 13:15:24.695634	1	0	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 2, "quantity": 4}, {"med_id": 26, "quantity": 5}, {"med_id": 9, "quantity": 5}, {"med_id": 7, "quantity": 2}]
52	2025-08-08 18:31:59.657648	1	0	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 5, "quantity": 5}, {"med_id": 25, "quantity": 5}, {"med_id": 17, "quantity": 4}, {"med_id": 24, "quantity": 3}]
53	2025-08-08 18:32:10.551303	20	0	มีอาการไข้และปวดหัว	[{"med_id": 17, "quantity": 2}]
54	2025-08-08 20:40:30.544008	9	0	มีอาการท้องเสียและปวดท้อง	[{"med_id": 10, "quantity": 1}, {"med_id": 12, "quantity": 3}, {"med_id": 21, "quantity": 5}, {"med_id": 14, "quantity": 1}, {"med_id": 2, "quantity": 4}]
55	2025-08-11 18:34:49.968687	3	0	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 11, "quantity": 5}, {"med_id": 5, "quantity": 4}, {"med_id": 14, "quantity": 1}, {"med_id": 17, "quantity": 5}]
56	2025-08-11 19:05:13.685713	8	0	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 18, "quantity": 3}, {"med_id": 20, "quantity": 1}, {"med_id": 13, "quantity": 3}, {"med_id": 1, "quantity": 3}]
\.


--
-- Data for Name: med_order_rights; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.med_order_rights (med_rights_id, doctor_rights, dentist_rights, phamarcist_rights, psychohiatrist_rights) FROM stdin;
\.


--
-- Data for Name: med_problem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.med_problem (mp_id, med_id, description, usage_id, problem_type, reported_by, reported_at, is_resolved) FROM stdin;
21	1	ผู้ป่วยมีผื่นคันบริเวณลำตัวหลังใช้ยา	1	ผื่นแพ้	501	2025-06-05 20:18:59.120159	f
22	2	มีอาการมึนศีรษะหลังรับยา	2	เวียนหัว	502	2025-06-05 20:18:59.120159	f
23	3	ระดับน้ำตาลในเลือดลดต่ำอย่างรวดเร็ว	3	น้ำตาลต่ำ	503	2025-06-05 20:18:59.120159	t
24	4	ท้องเสียและปวดท้องภายหลังรับประทานยา	4	ท้องเสีย	504	2025-06-05 20:18:59.120159	f
25	5	ความดันโลหิตเพิ่มสูงหลังการฉีดยา	5	ความดันสูง	505	2025-06-05 20:18:59.120159	f
26	6	ผู้ป่วยรู้สึกอ่อนเพลียมากหลังรับประทาน	6	อ่อนแรง	501	2025-06-05 20:18:59.120159	t
27	7	เกิดอาการสั่นหลังได้รับยาเข็มแรก	7	มือสั่น	506	2025-06-05 20:18:59.120159	f
28	8	นอนไม่หลับหลังรับยาช่วงเย็น	8	นอนไม่หลับ	502	2025-06-05 20:18:59.120159	t
29	9	มีเสียงในหูและปวดหูรุนแรงหลังใช้ยา	9	หูอื้อ	504	2025-06-05 20:18:59.120159	f
30	10	ตาบวมและแดงรุนแรงหลังหยอดยา	10	ตาอักเสบ	507	2025-06-05 20:18:59.120159	f
\.


--
-- Data for Name: med_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.med_requests (request_id, med_id, quantity, unit, requested_by, approved_by, status, request_time, approved_time, dispensed_time, note, created_at, updated_at) FROM stdin;
21	14	10	เม็ด	10	8	pending	2025-06-23 18:26:35.633172	\N	\N	รออนุมัติ	2025-06-23 18:26:35.633172	2025-06-23 18:26:35.633172
22	2	5	แคปซูล	10	8	approved	2025-06-21 18:26:35.633172	2025-06-22 18:26:35.633172	\N	อนุมัติแล้ว	2025-06-23 18:26:35.633172	2025-06-23 18:26:35.633172
23	25	20	เม็ด	10	8	rejected	2025-06-20 18:26:35.633172	2025-06-21 18:26:35.633172	\N	ไม่ผ่านเกณฑ์	2025-06-23 18:26:35.633172	2025-06-23 18:26:35.633172
24	9	2	ขวด	10	8	dispensed	2025-06-19 18:26:35.633172	2025-06-20 18:26:35.633172	2025-06-21 18:26:35.633172	จ่ายแล้ว	2025-06-23 18:26:35.633172	2025-06-23 18:26:35.633172
25	27	8	กล่อง	10	8	pending	2025-06-23 18:26:35.633172	\N	\N		2025-06-23 18:26:35.633172	2025-06-23 18:26:35.633172
26	18	12	แคปซูล	10	8	approved	2025-06-22 18:26:35.633172	2025-06-23 18:26:35.633172	\N		2025-06-23 18:26:35.633172	2025-06-23 18:26:35.633172
27	30	6	ขวด	10	8	rejected	2025-06-18 18:26:35.633172	2025-06-19 18:26:35.633172	\N	ไม่ผ่านการตรวจสอบ	2025-06-23 18:26:35.633172	2025-06-23 18:26:35.633172
28	6	3	หลอด	10	8	dispensed	2025-06-17 18:26:35.633172	2025-06-18 18:26:35.633172	2025-06-19 18:26:35.633172		2025-06-23 18:26:35.633172	2025-06-23 18:26:35.633172
29	22	15	เม็ด	10	8	pending	2025-06-23 18:26:35.633172	\N	\N	ด่วน	2025-06-23 18:26:35.633172	2025-06-23 18:26:35.633172
30	13	4	กล่อง	10	8	dispensed	2025-06-21 18:26:35.633172	2025-06-22 18:26:35.633172	2025-06-23 18:26:35.633172		2025-06-23 18:26:35.633172	2025-06-23 18:26:35.633172
32	1	100	capsule	10	\N	pending	2025-08-10 11:58:26.485921	\N	\N		2025-08-10 11:58:26.485921	2025-08-10 11:58:26.485921
34	1	3	aaaa	10	\N	pending	2025-08-10 12:18:17.959122	\N	\N		2025-08-10 12:18:17.959122	2025-08-10 12:18:17.959122
35	2	10000000	amp	10	\N	pending	2025-08-10 12:19:34.554223	\N	\N		2025-08-10 12:19:34.554223	2025-08-10 12:19:34.554223
36	2	100000	amp	10	\N	pending	2025-08-10 12:19:50.88031	\N	\N		2025-08-10 12:19:50.88031	2025-08-10 12:19:50.88031
37	4	1	amp	10	\N	pending	2025-08-10 12:20:01.304631	\N	\N		2025-08-10 12:20:01.304631	2025-08-10 12:20:01.304631
38	1	1	n	10	\N	pending	2025-08-10 12:20:36.628982	\N	\N		2025-08-10 12:20:36.628982	2025-08-10 12:20:36.628982
\.


--
-- Data for Name: med_stock_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.med_stock_history (history_id, med_id, change_type, quantity_change, balance_after, reference_id, "time") FROM stdin;
1	1	จ่ายออก	-10	490	1001	2025-05-24 23:17:02.662712
2	10	dispense	-5	295	\N	2025-05-24 23:23:49.158657
3	2	dispense	-5	295	\N	2025-05-24 23:23:49.178385
4	25	dispense	-30	270	\N	2025-05-24 23:28:35.947871
5	27	dispense	-4	196	\N	2025-05-24 23:28:35.966319
6	3	dispense	-1	199	\N	2025-05-24 23:28:35.984396
7	24	dispense	-1	149	\N	2025-05-24 23:28:36.000267
8	2	dispense	-5	295	\N	2025-05-24 23:28:36.016111
9	9	dispense	-4	246	\N	2025-05-25 14:32:52.617483
10	21	dispense	-3	297	\N	2025-05-25 14:32:52.647126
11	17	dispense	-2	348	\N	2025-05-25 14:32:52.666294
12	13	dispense	-2	248	\N	2025-05-25 14:32:52.686137
13	9	dispense	-5	245	\N	2025-05-25 14:32:58.89549
14	25	dispense	-3	297	\N	2025-05-25 14:35:39.474768
15	15	dispense	-1	179	\N	2025-05-25 14:35:39.499591
16	1	dispense	-5	495	\N	2025-05-25 14:45:37.356237
17	4	dispense	-3	397	\N	2025-05-25 14:45:37.373688
18	20	dispense	-1	149	\N	2025-05-25 14:45:37.390346
19	16	dispense	-4	296	\N	2025-05-25 14:45:37.404899
20	2	dispense	-3	297	\N	2025-05-25 21:10:38.856857
21	27	dispense	-5	195	\N	2025-05-25 21:10:38.877612
22	15	dispense	-2	178	\N	2025-05-25 21:10:38.894911
23	19	dispense	-3	247	\N	2025-05-25 21:10:38.911731
24	18	dispense	-2	98	\N	2025-05-25 21:10:38.928784
25	1	dispense	-5	-5	\N	2025-05-29 14:37:44.429395
26	13	dispense	-4	246	\N	2025-05-29 14:38:03.113968
27	8	dispense	-5	175	\N	2025-05-29 14:38:03.134264
28	23	dispense	-5	195	\N	2025-05-29 14:38:03.151362
29	14	dispense	-4	196	\N	2025-05-29 14:38:03.167538
30	19	dispense	-4	246	\N	2025-05-29 14:38:03.183854
31	6	dispense	-1	349	\N	2025-05-29 14:39:28.904084
32	15	dispense	-1	179	\N	2025-05-29 14:39:28.923716
33	29	dispense	-5	295	\N	2025-06-17 16:20:17.614676
34	27	dispense	-5	195	\N	2025-06-17 16:20:17.637048
35	16	dispense	-3	297	\N	2025-06-17 16:20:17.65576
36	5	dispense	-4	146	\N	2025-06-17 16:20:17.676901
37	17	dispense	-3	347	\N	2025-06-17 16:20:17.698013
38	22	dispense	-5	345	\N	2025-06-17 16:22:29.823034
39	17	dispense	-2	348	\N	2025-06-17 22:40:57.620912
40	16	dispense	-3	297	\N	2025-06-17 22:40:57.636094
41	2	dispense	-4	296	\N	2025-06-20 01:04:48.180757
42	16	dispense	-2	298	\N	2025-06-20 01:04:48.199936
43	7	dispense	-4	496	\N	2025-06-20 01:04:48.216038
44	21	dispense	-5	295	\N	2025-06-20 01:04:48.231679
45	25	dispense	-2	298	\N	2025-06-20 01:04:48.247928
46	25	dispense	-3	297	\N	2025-06-21 08:53:33.208959
47	26	dispense	-1	99	\N	2025-06-21 08:53:33.234131
48	1	dispense	-2	498	\N	2025-06-21 08:53:33.252655
49	2	dispense	-2	298	\N	2025-06-21 08:53:33.271819
50	16	dispense	-3	297	\N	2025-06-21 08:53:33.289902
51	11	dispense	-3	97	\N	2025-07-19 19:58:34.368912
52	14	dispense	-3	197	\N	2025-07-19 19:58:34.392782
53	24	dispense	-2	148	\N	2025-07-19 19:58:34.416451
54	13	dispense	-4	246	\N	2025-07-28 22:21:25.787902
55	3	dispense	-100	100	\N	2025-07-28 22:21:25.810552
56	14	dispense	-5	195	\N	2025-07-28 22:21:25.827047
57	25	dispense	-999	-699	\N	2025-07-28 22:21:25.844251
58	17	dispense	-2	348	\N	2025-07-28 22:21:55.782159
59	13	dispense	-2	248	\N	2025-08-06 15:05:15.269087
60	30	dispense	-5	245	\N	2025-08-08 11:58:26.807855
61	24	dispense	-2	148	\N	2025-08-08 11:58:26.831113
62	16	dispense	-1	299	\N	2025-08-08 11:58:26.848188
63	6	dispense	-5	345	\N	2025-08-08 11:58:26.86475
64	21	dispense	-3	297	\N	2025-08-08 13:07:40.010716
65	8	dispense	-1	179	\N	2025-08-08 13:07:40.032781
66	23	dispense	-3	197	\N	2025-08-08 13:07:40.04952
67	22	dispense	-5	345	\N	2025-08-08 13:07:40.066312
68	2	dispense	-4	296	\N	2025-08-08 13:15:24.726991
69	26	dispense	-5	95	\N	2025-08-08 13:15:24.746049
70	9	dispense	-5	245	\N	2025-08-08 13:15:24.764346
71	7	dispense	-2	498	\N	2025-08-08 13:15:24.782059
72	5	dispense	-5	145	\N	2025-08-08 18:31:59.695051
73	25	dispense	-5	295	\N	2025-08-08 18:31:59.715365
74	17	dispense	-4	346	\N	2025-08-08 18:31:59.733404
75	24	dispense	-3	147	\N	2025-08-08 18:31:59.749319
76	17	dispense	-2	348	\N	2025-08-08 18:32:10.571724
77	10	dispense	-1	299	\N	2025-08-08 20:40:30.574178
78	12	dispense	-3	297	\N	2025-08-08 20:40:30.591593
79	21	dispense	-5	295	\N	2025-08-08 20:40:30.608828
80	14	dispense	-1	199	\N	2025-08-08 20:40:30.625915
81	2	dispense	-4	296	\N	2025-08-08 20:40:30.640741
82	11	dispense	-5	95	\N	2025-08-11 18:34:50.045122
83	5	dispense	-4	146	\N	2025-08-11 18:34:50.072671
84	14	dispense	-1	199	\N	2025-08-11 18:34:50.095015
85	17	dispense	-5	345	\N	2025-08-11 18:34:50.116533
86	18	dispense	-3	97	\N	2025-08-11 19:05:13.744175
87	20	dispense	-1	149	\N	2025-08-11 19:05:13.767813
88	13	dispense	-3	247	\N	2025-08-11 19:05:13.787516
89	1	dispense	-3	497	\N	2025-08-11 19:05:13.806863
\.


--
-- Data for Name: med_table; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.med_table (med_id, med_name, med_generic_name, med_severity, med_counting_unit, med_marketing_name, med_thai_name, med_cost_price, med_selling_price, med_medium_price, med_dosage_form, med_medical_category, med_essential_med_list, med_out_of_stock, med_replacement, "med_TMT_GP_name", "med_TMT_TP_name", med_quantity, med_dose_dialogue, "med_TMT_code", "med_TPU_code", med_pregnancy_cagetory, med_set_new_price, "mde_dispence_IPD_freq", med_mfg, med_exp) FROM stdin;
1	Paracetamol	Acetaminophen	Mild	Tablet	ParaMax	พาราเซตามอล	1.5	2	1.75	Oral	Analgesic	Y	f	\N	TMT001	TP001	500	Take 1 tablet every 6 hours	T001	TPU001	A	f	5	2025-03-01	2027-03-01
2	Ibuprofen	Ibuprofen	Moderate	Capsule	IbuCap	ไอบูโพรเฟน	2.5	3	2.75	Oral	Anti-inflammatory	Y	t	Naproxen	TMT002	TP002	300	Take 1 capsule every 8 hours	T002	TPU002	B	t	10	2024-12-01	2026-12-01
3	Amoxicillin	Amoxicillin	Severe	Capsule	Amoxil	แอม็อกซีซิลลิน	3	3.5	3.25	Oral	Antibiotic	N	f	\N	TMT003	TP003	200	Take 1 capsule every 8 hours	T003	TPU003	C	f	7	2024-05-01	2026-05-01
4	Aspirin	Aspirin	Moderate	Tablet	AspiRelief	แอสไพริน	1.8	2.2	2	Oral	Analgesic	Y	f	\N	TMT004	TP004	400	Take 1 tablet every 6 hours	T004	TPU004	A	f	8	2023-08-01	2025-08-01
5	Cetirizine	Cetirizine	Mild	Tablet	Cetrimax	เซทิริซีน	2	2.5	2.25	Oral	Antihistamine	Y	f	\N	TMT005	TP005	150	Take 1 tablet daily	T005	TPU005	A	t	6	2024-02-01	2025-12-01
6	Metformin	Metformin	Moderate	Tablet	GlucoMet	เมตฟอร์มิน	3.2	3.8	3.5	Oral	Antidiabetic	N	f	\N	TMT006	TP006	350	Take 1 tablet twice daily	T006	TPU006	B	f	12	2024-01-01	2026-01-01
7	Losartan	Losartan	Moderate	Tablet	LozaPress	โลซาร์แทน	2.7	3.1	2.9	Oral	Antihypertensive	Y	f	\N	TMT007	TP007	500	Take 1 tablet daily	T007	TPU007	B	f	10	2024-04-01	2026-04-01
8	Omeprazole	Omeprazole	Mild	Capsule	OmezPro	โอเมพราโซล	1.9	2.4	2.15	Oral	Antacid	N	f	\N	TMT008	TP008	180	Take 1 capsule before breakfast	T008	TPU008	B	t	5	2023-11-01	2025-11-01
9	Clopidogrel	Clopidogrel	Severe	Tablet	ClopidX	โคลปิโดเกรล	4.5	5	4.75	Oral	Anticoagulant	N	f	\N	TMT009	TP009	250	Take 1 tablet daily	T009	TPU009	C	f	8	2024-06-01	2026-06-01
10	Atorvastatin	Atorvastatin	Moderate	Tablet	AtoLip	อะทอร์วาสแตติน	3.6	4.2	3.9	Oral	Lipid-lowering	Y	f	\N	TMT010	TP010	300	Take 1 tablet at bedtime	T010	TPU010	B	f	9	2024-03-01	2026-03-01
11	Hydrochlorothiazide	Hydrochlorothiazide	Mild	Tablet	HydroTab	ไฮโดรคลอโรไทอาไซด์	2.1	2.6	2.35	Oral	Diuretic	N	t	Furosemide	TMT011	TP011	100	Take 1 tablet daily	T011	TPU011	A	f	5	2024-09-01	2026-09-01
12	Levothyroxine	Levothyroxine	Mild	Tablet	ThyroMax	เลโวไทรอกซีน	1.5	2	1.75	Oral	Thyroid hormone	Y	f	\N	TMT012	TP012	300	Take 1 tablet before breakfast	T012	TPU012	A	f	5	2024-10-01	2026-10-01
13	Simvastatin	Simvastatin	Moderate	Tablet	SimaLip	ซิมวาสแตติน	3.4	3.9	3.65	Oral	Lipid-lowering	N	f	\N	TMT013	TP013	250	Take 1 tablet at bedtime	T013	TPU013	B	f	6	2024-07-01	2026-07-01
14	Glibenclamide	Glibenclamide	Moderate	Tablet	GlibenPro	ไกลเบนคลาไมด์	2.8	3.3	3.05	Oral	Antidiabetic	N	t	Glipizide	TMT014	TP014	200	Take 1 tablet with breakfast	T014	TPU014	C	t	8	2024-06-01	2025-06-01
15	Enalapril	Enalapril	Moderate	Tablet	EnalaPress	อีนาลาพริล	2.5	3	2.75	Oral	Antihypertensive	Y	f	\N	TMT015	TP015	180	Take 1 tablet daily	T015	TPU015	B	f	7	2024-04-01	2025-04-01
16	Nifedipine	Nifedipine	Severe	Tablet	NifeFast	ไนเฟดิปีน	3	3.6	3.3	Oral	Calcium channel blocker	Y	f	\N	TMT016	TP016	300	Take 1 tablet daily	T016	TPU016	C	f	8	2024-01-01	2025-01-01
17	Amlodipine	Amlodipine	Mild	Tablet	Amlodine	แอมโลดิปีน	1.8	2.2	2	Oral	Antihypertensive	Y	f	\N	TMT017	TP017	350	Take 1 tablet daily	T017	TPU017	A	f	5	2024-03-01	2025-03-01
18	Dexamethasone	Dexamethasone	Moderate	Tablet	DexaTab	เดกซาเมทาโซน	2.9	3.4	3.15	Oral	Corticosteroid	N	f	\N	TMT018	TP018	100	Take 1 tablet daily	T018	TPU018	B	t	6	2024-02-01	2025-08-01
19	Spironolactone	Spironolactone	Moderate	Tablet	SpiraMax	สไปโรโนแลคโตน	3.1	3.7	3.4	Oral	Diuretic	Y	f	\N	TMT019	TP019	250	Take 1 tablet daily	T019	TPU019	C	f	8	2024-05-01	2026-05-01
20	Ranitidine	Ranitidine	Mild	Tablet	RaniBlock	แรนิทิดีน	1.6	2	1.8	Oral	Antacid	N	t	Famotidine	TMT020	TP020	150	Take 1 tablet before meals	T020	TPU020	A	f	5	2023-12-01	2025-12-01
21	Allopurinol	Allopurinol	Mild	Tablet	AlloPur	อัลโลพูรินอล	2.2	2.6	2.4	Oral	Anti-gout	Y	f	\N	TMT021	TP021	300	Take 1 tablet daily	T021	TPU021	B	t	6	2024-09-01	2025-09-01
22	Lisinopril	Lisinopril	Moderate	Tablet	LisinoPress	ลิซิโนพริล	2.7	3.3	3	Oral	Antihypertensive	N	f	\N	TMT022	TP022	350	Take 1 tablet daily	T022	TPU022	C	f	7	2024-07-01	2026-07-01
23	Bisoprolol	Bisoprolol	Moderate	Tablet	BisoMax	บิโซโปรลอล	3	3.5	3.25	Oral	Beta blocker	Y	f	\N	TMT023	TP023	200	Take 1 tablet daily	T023	TPU023	B	t	8	2024-11-01	2025-11-01
24	Digoxin	Digoxin	Severe	Tablet	DigoCard	ไดจอกซิน	4.8	5.5	5.15	Oral	Antiarrhythmic	N	f	\N	TMT024	TP024	150	Take 1 tablet daily	T024	TPU024	C	f	10	2024-06-01	2025-06-01
25	Metoprolol	Metoprolol	Moderate	Tablet	MetoFast	เมโทโพรลอล	2.9	3.4	3.15	Oral	Beta blocker	Y	t	\N	TMT025	TP025	300	Take 1 tablet daily	T025	TPU025	B	t	7	2023-11-01	2025-05-01
26	Tamsulosin	Tamsulosin	Mild	Capsule	TamFlo	แทมซูโลซิน	2.4	2.9	2.65	Oral	Alpha blocker	N	f	\N	TMT026	TP026	100	Take 1 capsule daily	T026	TPU026	A	f	5	2024-01-01	2026-01-01
27	Montelukast	Montelukast	Mild	Tablet	MonteAir	มอนเทลูคาสท์	3	3.6	3.3	Oral	Antiasthmatic	Y	f	\N	TMT027	TP027	200	Take 1 tablet at bedtime	T027	TPU027	B	f	6	2024-10-01	2025-10-01
28	Sitagliptin	Sitagliptin	Moderate	Tablet	SitaPro	ซิทากลิพติน	4	4.5	4.25	Oral	Antidiabetic	N	f	\N	TMT028	TP028	150	Take 1 tablet daily	T028	TPU028	C	t	7	2024-12-01	2026-12-01
29	Fluoxetine	Fluoxetine	Severe	Capsule	FluoxaTab	ฟลูออกซีทีน	3.5	4	3.75	Oral	Antidepressant	Y	f	\N	TMT029	TP029	300	Take 1 capsule daily	T029	TPU029	C	f	8	2024-03-01	2026-03-01
30	Sertraline	Sertraline	Severe	Tablet	SertraCare	เซอร์ทราลีน	4	4.6	4.3	Oral	Antidepressant	N	f	\N	TMT030	TP030	250	Take 1 tablet daily	T030	TPU030	C	f	9	2024-02-01	2025-02-01
\.


--
-- Data for Name: med_usage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.med_usage (usage_id, patient_id, med_id, order_datetime, start_datetime, end_datetime, dosage, frequency, route, usage_status, note, created_at, updated_at) FROM stdin;
1	1	2	2025-04-25 08:30:00	2025-04-25 09:00:00	2025-05-05 09:00:00	500 mg	วันละ 2 ครั้ง	oral	ongoing	รับประทานหลังอาหารเช้าและเย็น	2025-04-28 18:44:04.210179	2025-04-28 18:44:04.210179
2	2	5	2025-04-24 14:10:00	2025-04-24 15:00:00	2025-04-29 15:00:00	1 เม็ด	ทุก 6 ชั่วโมง	oral	ongoing	หยุดใช้หากมีอาการแพ้	2025-04-28 18:44:04.210179	2025-04-28 18:44:04.210179
3	3	8	2025-04-23 09:00:00	2025-04-23 10:00:00	\N	250 mg	วันละ 1 ครั้ง	oral	ongoing	ใช้ต่อเนื่องอย่างน้อย 7 วัน	2025-04-28 18:44:04.210179	2025-04-28 18:44:04.210179
4	4	1	2025-04-22 13:20:00	2025-04-22 14:00:00	2025-05-01 14:00:00	2 เม็ด	วันละ 1 ครั้ง	oral	completed	จบคอร์สการรักษาแล้ว	2025-04-28 18:44:04.210179	2025-04-28 18:44:04.210179
5	5	10	2025-04-21 07:30:00	2025-04-21 08:00:00	\N	10 ml	ทุก 8 ชั่วโมง	IV	ongoing	ให้ยาทางเส้นเลือดใน ICU	2025-04-28 18:44:04.210179	2025-04-28 18:44:04.210179
6	6	7	2025-04-20 12:30:00	2025-04-20 13:00:00	2025-04-27 13:00:00	100 mg	วันเว้นวัน	oral	stopped	หยุดเนื่องจากค่าเลือดผิดปกติ	2025-04-28 18:44:04.210179	2025-04-28 18:44:04.210179
7	7	6	2025-04-19 10:00:00	2025-04-19 10:30:00	\N	1 เม็ด	เมื่อมีอาการ	oral	ongoing	ใช้ PRN เมื่อปวดศีรษะ	2025-04-28 18:44:04.210179	2025-04-28 18:44:04.210179
8	8	4	2025-04-18 16:00:00	2025-04-18 17:00:00	2025-04-28 17:00:00	500 mg	ทุก 12 ชั่วโมง	oral	ongoing	ควรรับประทานพร้อมอาหาร	2025-04-28 18:44:04.210179	2025-04-28 18:44:04.210179
9	9	9	2025-04-17 11:00:00	2025-04-17 12:00:00	2025-04-24 12:00:00	5 ml	ทุก 8 ชั่วโมง	IV	completed	การรักษาสิ้นสุดแล้ว	2025-04-28 18:44:04.210179	2025-04-28 18:44:04.210179
10	10	3	2025-04-16 09:00:00	2025-04-16 10:00:00	\N	400 mg	วันละ 1 ครั้ง	oral	ongoing	ใช้ต่อเนื่องเพื่อควบคุมโรคเรื้อรัง	2025-04-28 18:44:04.210179	2025-04-28 18:44:04.210179
16	1	12	2025-04-29 01:34:18.815867	2025-04-28 18:34:18.808	\N	Take 1 tablet before breakfast	วันละ 5 ครั้ง	Oral	Active	\N	2025-04-29 01:34:18.815867	2025-04-29 01:34:18.815867
17	1	8	2025-04-29 01:34:18.828603	2025-04-28 18:34:18.825	\N	Take 1 capsule before breakfast	วันละ 5 ครั้ง	Oral	Active	\N	2025-04-29 01:34:18.828603	2025-04-29 01:34:18.828603
18	1	21	2025-04-29 01:34:18.83378	2025-04-28 18:34:18.831	\N	Take 1 tablet daily	วันละ 6 ครั้ง	Oral	Active	\N	2025-04-29 01:34:18.83378	2025-04-29 01:34:18.83378
19	1	27	2025-04-29 01:34:18.839084	2025-04-28 18:34:18.836	\N	Take 1 tablet at bedtime	วันละ 6 ครั้ง	Oral	Active	\N	2025-04-29 01:34:18.839084	2025-04-29 01:34:18.839084
20	2	3	2025-04-29 01:35:34.855815	2025-04-28 18:35:34.851	\N	Take 1 capsule every 8 hours	วันละ 7 ครั้ง	Oral	Active	\N	2025-04-29 01:35:34.855815	2025-04-29 01:35:34.855815
21	4	4	2025-04-29 01:39:15.946936	2025-04-28 11:39:15.942	\N	Take 1 tablet every 6 hours	วันละ 8 ครั้ง	Oral	Active	\N	2025-04-29 01:39:15.946936	2025-04-29 01:39:15.946936
22	4	7	2025-04-29 01:39:15.955334	2025-04-28 11:39:15.952	\N	Take 1 tablet daily	วันละ 10 ครั้ง	Oral	Active	\N	2025-04-29 01:39:15.955334	2025-04-29 01:39:15.955334
23	4	6	2025-04-29 01:39:15.960724	2025-04-28 11:39:15.958	\N	Take 1 tablet twice daily	วันละ 12 ครั้ง	Oral	Active	\N	2025-04-29 01:39:15.960724	2025-04-29 01:39:15.960724
24	4	27	2025-04-29 01:39:15.965817	2025-04-28 11:39:15.963	\N	Take 1 tablet at bedtime	วันละ 6 ครั้ง	Oral	Active	\N	2025-04-29 01:39:15.965817	2025-04-29 01:39:15.965817
25	8	5	2025-04-29 01:40:15.854903	2025-04-28 11:40:15.85	\N	Take 1 tablet daily	วันละ 6 ครั้ง	Oral	Active	\N	2025-04-29 01:40:15.854903	2025-04-29 01:40:15.854903
26	8	10	2025-04-29 01:40:15.861777	2025-04-28 11:40:15.859	\N	Take 1 tablet at bedtime	วันละ 9 ครั้ง	Oral	Active	\N	2025-04-29 01:40:15.861777	2025-04-29 01:40:15.861777
27	8	16	2025-04-29 01:40:15.868371	2025-04-28 11:40:15.864	\N	Take 1 tablet daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-04-29 01:40:15.868371	2025-04-29 01:40:15.868371
28	8	18	2025-04-29 01:40:15.87351	2025-04-28 11:40:15.871	\N	Take 1 tablet daily	วันละ 6 ครั้ง	Oral	Active	\N	2025-04-29 01:40:15.87351	2025-04-29 01:40:15.87351
29	8	23	2025-04-29 01:40:15.879402	2025-04-28 11:40:15.876	\N	Take 1 tablet daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-04-29 01:40:15.879402	2025-04-29 01:40:15.879402
30	1	13	2025-04-29 01:44:06.680973	2025-04-29 01:44:06	\N	Take 1 tablet at bedtime	วันละ 6 ครั้ง	Oral	Active	\N	2025-04-29 01:44:06.680973	2025-04-29 01:44:06.680973
31	1	19	2025-04-29 01:44:06.689507	2025-04-29 01:44:06	\N	Take 1 tablet daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-04-29 01:44:06.689507	2025-04-29 01:44:06.689507
32	1	20	2025-04-29 01:44:06.694359	2025-04-29 01:44:06	\N	Take 1 tablet before meals	วันละ 5 ครั้ง	Oral	Active	\N	2025-04-29 01:44:06.694359	2025-04-29 01:44:06.694359
33	1	5	2025-04-29 01:44:06.698957	2025-04-29 01:44:06	\N	Take 1 tablet daily	วันละ 6 ครั้ง	Oral	Active	\N	2025-04-29 01:44:06.698957	2025-04-29 01:44:06.698957
34	1	26	2025-04-29 01:44:06.7064	2025-04-29 01:44:06	\N	Take 1 capsule daily	วันละ 5 ครั้ง	Oral	Active	\N	2025-04-29 01:44:06.7064	2025-04-29 01:44:06.7064
35	6	6	2025-05-02 16:13:54.292825	2025-05-02 16:13:54	\N	Take 1 tablet twice daily	วันละ 12 ครั้ง	Oral	Active	\N	2025-05-02 16:13:54.292825	2025-05-02 16:13:54.292825
36	6	22	2025-05-02 16:13:54.310218	2025-05-02 16:13:54	\N	Take 1 tablet daily	วันละ 7 ครั้ง	Oral	Active	\N	2025-05-02 16:13:54.310218	2025-05-02 16:13:54.310218
37	6	25	2025-05-02 16:13:54.317943	2025-05-02 16:13:54	\N	Take 1 tablet daily	วันละ 7 ครั้ง	Oral	Active	\N	2025-05-02 16:13:54.317943	2025-05-02 16:13:54.317943
38	6	16	2025-05-02 16:13:54.326788	2025-05-02 16:13:54	\N	Take 1 tablet daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-05-02 16:13:54.326788	2025-05-02 16:13:54.326788
39	1	13	2025-05-02 16:16:40.946466	2025-05-02 16:16:40	\N	Take 1 tablet at bedtime	วันละ 6 ครั้ง	Oral	Active	\N	2025-05-02 16:16:40.946466	2025-05-02 16:16:40.946466
40	1	2	2025-05-02 16:16:40.959618	2025-05-02 16:16:40	\N	Take 1 capsule every 8 hours	วันละ 10 ครั้ง	Oral	Active	\N	2025-05-02 16:16:40.959618	2025-05-02 16:16:40.959618
41	1	29	2025-05-02 16:16:40.967971	2025-05-02 16:16:40	\N	Take 1 capsule daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-05-02 16:16:40.967971	2025-05-02 16:16:40.967971
42	1	16	2025-05-02 16:16:40.976656	2025-05-02 16:16:40	\N	Take 1 tablet daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-05-02 16:16:40.976656	2025-05-02 16:16:40.976656
43	1	29	2025-05-24 21:23:22.772545	2025-05-24 21:23:22	\N	Take 1 capsule daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-05-24 21:23:22.772545	2025-05-24 21:23:22.772545
44	1	27	2025-05-24 21:23:22.78724	2025-05-24 21:23:22	\N	Take 1 tablet at bedtime	วันละ 6 ครั้ง	Oral	Active	\N	2025-05-24 21:23:22.78724	2025-05-24 21:23:22.78724
45	1	25	2025-05-24 21:23:22.797294	2025-05-24 21:23:22	\N	Take 1 tablet daily	วันละ 7 ครั้ง	Oral	Active	\N	2025-05-24 21:23:22.797294	2025-05-24 21:23:22.797294
46	1	1	2025-05-24 21:23:22.807373	2025-05-24 21:23:22	\N	Take 1 tablet every 6 hours	วันละ 5 ครั้ง	Oral	Active	\N	2025-05-24 21:23:22.807373	2025-05-24 21:23:22.807373
47	1	3	2025-05-24 21:23:22.816905	2025-05-24 21:23:22	\N	Take 1 capsule every 8 hours	วันละ 7 ครั้ง	Oral	Active	\N	2025-05-24 21:23:22.816905	2025-05-24 21:23:22.816905
48	1	29	2025-05-24 21:30:13.830267	2025-05-24 21:30:13	\N	Take 1 capsule daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-05-24 21:30:13.830267	2025-05-24 21:30:13.830267
49	1	27	2025-05-24 21:30:13.844923	2025-05-24 21:30:13	\N	Take 1 tablet at bedtime	วันละ 6 ครั้ง	Oral	Active	\N	2025-05-24 21:30:13.844923	2025-05-24 21:30:13.844923
50	1	25	2025-05-24 21:30:13.854838	2025-05-24 21:30:13	\N	Take 1 tablet daily	วันละ 7 ครั้ง	Oral	Active	\N	2025-05-24 21:30:13.854838	2025-05-24 21:30:13.854838
51	1	1	2025-05-24 21:30:13.8646	2025-05-24 21:30:13	\N	Take 1 tablet every 6 hours	วันละ 5 ครั้ง	Oral	Active	\N	2025-05-24 21:30:13.8646	2025-05-24 21:30:13.8646
52	1	3	2025-05-24 21:30:13.874902	2025-05-24 21:30:13	\N	Take 1 capsule every 8 hours	วันละ 7 ครั้ง	Oral	Active	\N	2025-05-24 21:30:13.874902	2025-05-24 21:30:13.874902
53	1	3	2025-05-24 21:30:13.884455	2025-05-24 21:30:13	\N	Take 1 capsule every 8 hours	วันละ 7 ครั้ง	Oral	Active	\N	2025-05-24 21:30:13.884455	2025-05-24 21:30:13.884455
54	1	23	2025-05-24 21:42:29.666703	2025-05-24 21:42:29	\N	Take 1 tablet daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-05-24 21:42:29.666703	2025-05-24 21:42:29.666703
55	1	30	2025-05-24 21:42:29.689035	2025-05-24 21:42:29	\N	Take 1 tablet daily	วันละ 9 ครั้ง	Oral	Active	\N	2025-05-24 21:42:29.689035	2025-05-24 21:42:29.689035
56	1	16	2025-05-24 21:42:29.705111	2025-05-24 21:42:29	\N	Take 1 tablet daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-05-24 21:42:29.705111	2025-05-24 21:42:29.705111
57	1	6	2025-05-24 21:42:29.720442	2025-05-24 21:42:29	\N	Take 1 tablet twice daily	วันละ 12 ครั้ง	Oral	Active	\N	2025-05-24 21:42:29.720442	2025-05-24 21:42:29.720442
58	1	2	2025-05-24 21:42:29.735175	2025-05-24 21:42:29	\N	Take 1 capsule every 8 hours	วันละ 10 ครั้ง	Oral	Active	\N	2025-05-24 21:42:29.735175	2025-05-24 21:42:29.735175
59	2	16	2025-05-24 21:43:07.186582	2025-05-24 21:43:07	\N	Take 1 tablet daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-05-24 21:43:07.186582	2025-05-24 21:43:07.186582
60	2	27	2025-05-24 21:43:07.203822	2025-05-24 21:43:07	\N	Take 1 tablet at bedtime	วันละ 6 ครั้ง	Oral	Active	\N	2025-05-24 21:43:07.203822	2025-05-24 21:43:07.203822
61	1	7	2025-05-24 23:06:11.254623	2025-05-24 23:06:11	\N	Take 1 tablet daily	วันละ 10 ครั้ง	Oral	Active	\N	2025-05-24 23:06:11.254623	2025-05-24 23:06:11.254623
62	1	1	2025-05-24 23:06:11.283727	2025-05-24 23:06:11	\N	Take 1 tablet every 6 hours	วันละ 5 ครั้ง	Oral	Active	\N	2025-05-24 23:06:11.283727	2025-05-24 23:06:11.283727
63	1	8	2025-05-24 23:06:11.305589	2025-05-24 23:06:11	\N	Take 1 capsule before breakfast	วันละ 5 ครั้ง	Oral	Active	\N	2025-05-24 23:06:11.305589	2025-05-24 23:06:11.305589
64	1	3	2025-05-24 23:06:11.37522	2025-05-24 23:06:11	\N	Take 1 capsule every 8 hours	วันละ 7 ครั้ง	Oral	Active	\N	2025-05-24 23:06:11.37522	2025-05-24 23:06:11.37522
65	1	10	2025-05-24 23:06:12.013181	2025-05-24 23:06:11	\N	Take 1 tablet at bedtime	วันละ 9 ครั้ง	Oral	Active	\N	2025-05-24 23:06:12.013181	2025-05-24 23:06:12.013181
66	1	10	2025-05-24 23:23:49.141237	2025-05-24 23:23:49	\N	Take 1 tablet at bedtime	วันละ 9 ครั้ง	Oral	Active	\N	2025-05-24 23:23:49.141237	2025-05-24 23:23:49.141237
67	1	2	2025-05-24 23:23:49.166166	2025-05-24 23:23:49	\N	Take 1 capsule every 8 hours	วันละ 10 ครั้ง	Oral	Active	\N	2025-05-24 23:23:49.166166	2025-05-24 23:23:49.166166
68	7	25	2025-05-24 23:28:35.931624	2025-05-24 23:28:35	\N	Take 1 tablet daily	วันละ 7 ครั้ง	Oral	Active	\N	2025-05-24 23:28:35.931624	2025-05-24 23:28:35.931624
69	7	27	2025-05-24 23:28:35.955445	2025-05-24 23:28:35	\N	Take 1 tablet at bedtime	วันละ 6 ครั้ง	Oral	Active	\N	2025-05-24 23:28:35.955445	2025-05-24 23:28:35.955445
70	7	3	2025-05-24 23:28:35.9712	2025-05-24 23:28:35	\N	Take 1 capsule every 8 hours	วันละ 7 ครั้ง	Oral	Active	\N	2025-05-24 23:28:35.9712	2025-05-24 23:28:35.9712
71	7	24	2025-05-24 23:28:35.98947	2025-05-24 23:28:35	\N	Take 1 tablet daily	วันละ 10 ครั้ง	Oral	Active	\N	2025-05-24 23:28:35.98947	2025-05-24 23:28:35.98947
72	7	2	2025-05-24 23:28:36.005484	2025-05-24 23:28:36	\N	Take 1 capsule every 8 hours	วันละ 10 ครั้ง	Oral	Active	\N	2025-05-24 23:28:36.005484	2025-05-24 23:28:36.005484
73	1	9	2025-05-25 14:32:52.60117	2025-05-25 14:32:52	\N	Take 1 tablet daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-05-25 14:32:52.60117	2025-05-25 14:32:52.60117
74	1	21	2025-05-25 14:32:52.631986	2025-05-25 14:32:52	\N	Take 1 tablet daily	วันละ 6 ครั้ง	Oral	Active	\N	2025-05-25 14:32:52.631986	2025-05-25 14:32:52.631986
75	1	17	2025-05-25 14:32:52.656442	2025-05-25 14:32:52	\N	Take 1 tablet daily	วันละ 5 ครั้ง	Oral	Active	\N	2025-05-25 14:32:52.656442	2025-05-25 14:32:52.656442
76	1	13	2025-05-25 14:32:52.674896	2025-05-25 14:32:52	\N	Take 1 tablet at bedtime	วันละ 6 ครั้ง	Oral	Active	\N	2025-05-25 14:32:52.674896	2025-05-25 14:32:52.674896
77	1	9	2025-05-25 14:32:58.883443	2025-05-25 14:32:58	\N	Take 1 tablet daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-05-25 14:32:58.883443	2025-05-25 14:32:58.883443
78	1	1	2025-05-25 14:45:37.342061	2025-05-25 14:45:37	\N	Take 1 tablet every 6 hours	วันละ 5 ครั้ง	Oral	Active	\N	2025-05-25 14:45:37.342061	2025-05-25 14:45:37.342061
79	1	4	2025-05-25 14:45:37.363083	2025-05-25 14:45:37	\N	Take 1 tablet every 6 hours	วันละ 8 ครั้ง	Oral	Active	\N	2025-05-25 14:45:37.363083	2025-05-25 14:45:37.363083
80	1	20	2025-05-25 14:45:37.378845	2025-05-25 14:45:37	\N	Take 1 tablet before meals	วันละ 5 ครั้ง	Oral	Active	\N	2025-05-25 14:45:37.378845	2025-05-25 14:45:37.378845
81	1	16	2025-05-25 14:45:37.395543	2025-05-25 14:45:37	\N	Take 1 tablet daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-05-25 14:45:37.395543	2025-05-25 14:45:37.395543
82	4	2	2025-05-25 21:10:38.840276	2025-05-25 21:10:38	\N	Take 1 capsule every 8 hours	วันละ 10 ครั้ง	Oral	Active	\N	2025-05-25 21:10:38.840276	2025-05-25 21:10:38.840276
83	4	27	2025-05-25 21:10:38.865368	2025-05-25 21:10:38	\N	Take 1 tablet at bedtime	วันละ 6 ครั้ง	Oral	Active	\N	2025-05-25 21:10:38.865368	2025-05-25 21:10:38.865368
84	4	15	2025-05-25 21:10:38.883095	2025-05-25 21:10:38	\N	Take 1 tablet daily	วันละ 7 ครั้ง	Oral	Active	\N	2025-05-25 21:10:38.883095	2025-05-25 21:10:38.883095
85	4	19	2025-05-25 21:10:38.900087	2025-05-25 21:10:38	\N	Take 1 tablet daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-05-25 21:10:38.900087	2025-05-25 21:10:38.900087
86	4	18	2025-05-25 21:10:38.917858	2025-05-25 21:10:38	\N	Take 1 tablet daily	วันละ 6 ครั้ง	Oral	Active	\N	2025-05-25 21:10:38.917858	2025-05-25 21:10:38.917858
87	1	3	2025-05-29 14:31:16.73233	2025-05-29 14:31:16	\N	Take 1 capsule every 8 hours	วันละ 7 ครั้ง	Oral	Active	\N	2025-05-29 14:31:16.73233	2025-05-29 14:31:16.73233
88	1	16	2025-05-29 14:31:16.745339	2025-05-29 14:31:16	\N	Take 1 tablet daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-05-29 14:31:16.745339	2025-05-29 14:31:16.745339
89	1	4	2025-05-29 14:31:16.751779	2025-05-29 14:31:16	\N	Take 1 tablet every 6 hours	วันละ 8 ครั้ง	Oral	Active	\N	2025-05-29 14:31:16.751779	2025-05-29 14:31:16.751779
90	1	15	2025-05-29 14:31:16.771048	2025-05-29 14:31:16	\N	Take 1 tablet daily	วันละ 7 ครั้ง	Oral	Active	\N	2025-05-29 14:31:16.771048	2025-05-29 14:31:16.771048
91	1	5	2025-05-29 14:37:28.141751	2025-05-29 14:37:28	\N	Take 1 tablet daily	วันละ 6 ครั้ง	Oral	Active	\N	2025-05-29 14:37:28.141751	2025-05-29 14:37:28.141751
92	1	12	2025-05-29 14:37:28.15958	2025-05-29 14:37:28	\N	Take 1 tablet before breakfast	วันละ 5 ครั้ง	Oral	Active	\N	2025-05-29 14:37:28.15958	2025-05-29 14:37:28.15958
93	1	28	2025-05-29 14:37:28.18086	2025-05-29 14:37:28	\N	Take 1 tablet daily	วันละ 7 ครั้ง	Oral	Active	\N	2025-05-29 14:37:28.18086	2025-05-29 14:37:28.18086
94	1	1	2025-05-29 14:37:44.37515	2025-05-29 14:37:44	\N	Take 1 tablet every 6 hours	วันละ 5 ครั้ง	Oral	Active	\N	2025-05-29 14:37:44.37515	2025-05-29 14:37:44.37515
95	1	13	2025-05-29 14:38:03.09822	2025-05-29 14:38:03	\N	Take 1 tablet at bedtime	วันละ 6 ครั้ง	Oral	Active	\N	2025-05-29 14:38:03.09822	2025-05-29 14:38:03.09822
96	1	8	2025-05-29 14:38:03.120961	2025-05-29 14:38:03	\N	Take 1 capsule before breakfast	วันละ 5 ครั้ง	Oral	Active	\N	2025-05-29 14:38:03.120961	2025-05-29 14:38:03.120961
97	1	23	2025-05-29 14:38:03.140692	2025-05-29 14:38:03	\N	Take 1 tablet daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-05-29 14:38:03.140692	2025-05-29 14:38:03.140692
98	1	14	2025-05-29 14:38:03.157428	2025-05-29 14:38:03	\N	Take 1 tablet with breakfast	วันละ 8 ครั้ง	Oral	Active	\N	2025-05-29 14:38:03.157428	2025-05-29 14:38:03.157428
99	1	19	2025-05-29 14:38:03.172604	2025-05-29 14:38:03	\N	Take 1 tablet daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-05-29 14:38:03.172604	2025-05-29 14:38:03.172604
100	1	6	2025-05-29 14:39:28.890749	2025-05-29 14:39:28	\N	Take 1 tablet twice daily	วันละ 12 ครั้ง	Oral	Active	\N	2025-05-29 14:39:28.890749	2025-05-29 14:39:28.890749
101	1	15	2025-05-29 14:39:28.910883	2025-05-29 14:39:28	\N	Take 1 tablet daily	วันละ 7 ครั้ง	Oral	Active	\N	2025-05-29 14:39:28.910883	2025-05-29 14:39:28.910883
102	1	29	2025-06-17 16:20:17.587263	2025-06-17 16:20:17	\N	Take 1 capsule daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-06-17 16:20:17.587263	2025-06-17 16:20:17.587263
103	1	27	2025-06-17 16:20:17.625869	2025-06-17 16:20:17	\N	Take 1 tablet at bedtime	วันละ 6 ครั้ง	Oral	Active	\N	2025-06-17 16:20:17.625869	2025-06-17 16:20:17.625869
104	1	16	2025-06-17 16:20:17.642528	2025-06-17 16:20:17	\N	Take 1 tablet daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-06-17 16:20:17.642528	2025-06-17 16:20:17.642528
105	1	5	2025-06-17 16:20:17.663311	2025-06-17 16:20:17	\N	Take 1 tablet daily	วันละ 6 ครั้ง	Oral	Active	\N	2025-06-17 16:20:17.663311	2025-06-17 16:20:17.663311
106	1	17	2025-06-17 16:20:17.684684	2025-06-17 16:20:17	\N	Take 1 tablet daily	วันละ 5 ครั้ง	Oral	Active	\N	2025-06-17 16:20:17.684684	2025-06-17 16:20:17.684684
107	1	22	2025-06-17 16:22:29.809871	2025-06-17 16:22:29	\N	Take 1 tablet daily	วันละ 7 ครั้ง	Oral	Active	\N	2025-06-17 16:22:29.809871	2025-06-17 16:22:29.809871
108	1	17	2025-06-17 22:40:57.607788	2025-06-17 22:40:57	\N	Take 1 tablet daily	วันละ 5 ครั้ง	Oral	Active	\N	2025-06-17 22:40:57.607788	2025-06-17 22:40:57.607788
109	1	16	2025-06-17 22:40:57.62683	2025-06-17 22:40:57	\N	Take 1 tablet daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-06-17 22:40:57.62683	2025-06-17 22:40:57.62683
110	1	2	2025-06-20 01:04:48.165829	2025-06-20 01:04:48	\N	Take 1 capsule every 8 hours	วันละ 10 ครั้ง	Oral	Active	\N	2025-06-20 01:04:48.165829	2025-06-20 01:04:48.165829
111	1	16	2025-06-20 01:04:48.188958	2025-06-20 01:04:48	\N	Take 1 tablet daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-06-20 01:04:48.188958	2025-06-20 01:04:48.188958
112	1	7	2025-06-20 01:04:48.205982	2025-06-20 01:04:48	\N	Take 1 tablet daily	วันละ 10 ครั้ง	Oral	Active	\N	2025-06-20 01:04:48.205982	2025-06-20 01:04:48.205982
113	1	21	2025-06-20 01:04:48.220986	2025-06-20 01:04:48	\N	Take 1 tablet daily	วันละ 6 ครั้ง	Oral	Active	\N	2025-06-20 01:04:48.220986	2025-06-20 01:04:48.220986
114	1	25	2025-06-20 01:04:48.237065	2025-06-20 01:04:48	\N	Take 1 tablet daily	วันละ 7 ครั้ง	Oral	Active	\N	2025-06-20 01:04:48.237065	2025-06-20 01:04:48.237065
115	9	25	2025-06-21 08:53:33.188047	2025-06-21 08:53:33	\N	Take 1 tablet daily	วันละ 7 ครั้ง	Oral	Active	\N	2025-06-21 08:53:33.188047	2025-06-21 08:53:33.188047
116	9	26	2025-06-21 08:53:33.222024	2025-06-21 08:53:33	\N	Take 1 capsule daily	วันละ 5 ครั้ง	Oral	Active	\N	2025-06-21 08:53:33.222024	2025-06-21 08:53:33.222024
117	9	1	2025-06-21 08:53:33.240233	2025-06-21 08:53:33	\N	Take 1 tablet every 6 hours	วันละ 5 ครั้ง	Oral	Active	\N	2025-06-21 08:53:33.240233	2025-06-21 08:53:33.240233
118	9	2	2025-06-21 08:53:33.258926	2025-06-21 08:53:33	\N	Take 1 capsule every 8 hours	วันละ 10 ครั้ง	Oral	Active	\N	2025-06-21 08:53:33.258926	2025-06-21 08:53:33.258926
119	9	16	2025-06-21 08:53:33.277565	2025-06-21 08:53:33	\N	Take 1 tablet daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-06-21 08:53:33.277565	2025-06-21 08:53:33.277565
120	1	11	2025-07-19 19:58:34.345105	2025-07-19 19:58:34	\N	Take 1 tablet daily	วันละ 5 ครั้ง	Oral	Active	\N	2025-07-19 19:58:34.345105	2025-07-19 19:58:34.345105
121	1	14	2025-07-19 19:58:34.380662	2025-07-19 19:58:34	\N	Take 1 tablet with breakfast	วันละ 8 ครั้ง	Oral	Active	\N	2025-07-19 19:58:34.380662	2025-07-19 19:58:34.380662
122	1	24	2025-07-19 19:58:34.400032	2025-07-19 19:58:34	\N	Take 1 tablet daily	วันละ 10 ครั้ง	Oral	Active	\N	2025-07-19 19:58:34.400032	2025-07-19 19:58:34.400032
123	1	13	2025-07-28 22:21:25.769013	2025-07-28 22:21:25	\N	Take 1 tablet at bedtime	วันละ 6 ครั้ง	Oral	Active	\N	2025-07-28 22:21:25.769013	2025-07-28 22:21:25.769013
124	1	3	2025-07-28 22:21:25.799704	2025-07-28 22:21:25	\N	Take 1 capsule every 8 hours	วันละ 7 ครั้ง	Oral	Active	\N	2025-07-28 22:21:25.799704	2025-07-28 22:21:25.799704
125	1	14	2025-07-28 22:21:25.816168	2025-07-28 22:21:25	\N	Take 1 tablet with breakfast	วันละ 8 ครั้ง	Oral	Active	\N	2025-07-28 22:21:25.816168	2025-07-28 22:21:25.816168
126	1	25	2025-07-28 22:21:25.83336	2025-07-28 22:21:25	\N	Take 1 tablet daily	วันละ 7 ครั้ง	Oral	Active	\N	2025-07-28 22:21:25.83336	2025-07-28 22:21:25.83336
127	1	17	2025-07-28 22:21:55.766017	2025-07-28 22:21:55	\N	Take 1 tablet daily	วันละ 5 ครั้ง	Oral	Active	\N	2025-07-28 22:21:55.766017	2025-07-28 22:21:55.766017
128	1	13	2025-08-06 15:05:15.251364	2025-08-06 15:05:15	\N	Take 1 tablet at bedtime	วันละ 6 ครั้ง	Oral	Active	\N	2025-08-06 15:05:15.251364	2025-08-06 15:05:15.251364
129	1	30	2025-08-08 11:58:26.787577	2025-08-08 11:58:26	\N	Take 1 tablet daily	วันละ 9 ครั้ง	Oral	Active	\N	2025-08-08 11:58:26.787577	2025-08-08 11:58:26.787577
130	1	24	2025-08-08 11:58:26.815429	2025-08-08 11:58:26	\N	Take 1 tablet daily	วันละ 10 ครั้ง	Oral	Active	\N	2025-08-08 11:58:26.815429	2025-08-08 11:58:26.815429
131	1	16	2025-08-08 11:58:26.837204	2025-08-08 11:58:26	\N	Take 1 tablet daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-08-08 11:58:26.837204	2025-08-08 11:58:26.837204
132	1	6	2025-08-08 11:58:26.853271	2025-08-08 11:58:26	\N	Take 1 tablet twice daily	วันละ 12 ครั้ง	Oral	Active	\N	2025-08-08 11:58:26.853271	2025-08-08 11:58:26.853271
133	2	21	2025-08-08 13:07:39.9893	2025-08-08 13:07:39	\N	Take 1 tablet daily	วันละ 6 ครั้ง	Oral	Active	\N	2025-08-08 13:07:39.9893	2025-08-08 13:07:39.9893
134	2	8	2025-08-08 13:07:40.020601	2025-08-08 13:07:40	\N	Take 1 capsule before breakfast	วันละ 5 ครั้ง	Oral	Active	\N	2025-08-08 13:07:40.020601	2025-08-08 13:07:40.020601
135	2	23	2025-08-08 13:07:40.037787	2025-08-08 13:07:40	\N	Take 1 tablet daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-08-08 13:07:40.037787	2025-08-08 13:07:40.037787
136	2	22	2025-08-08 13:07:40.054304	2025-08-08 13:07:40	\N	Take 1 tablet daily	วันละ 7 ครั้ง	Oral	Active	\N	2025-08-08 13:07:40.054304	2025-08-08 13:07:40.054304
137	1	2	2025-08-08 13:15:24.709811	2025-08-08 13:15:24	\N	Take 1 capsule every 8 hours	วันละ 10 ครั้ง	Oral	Active	\N	2025-08-08 13:15:24.709811	2025-08-08 13:15:24.709811
138	1	26	2025-08-08 13:15:24.734768	2025-08-08 13:15:24	\N	Take 1 capsule daily	วันละ 5 ครั้ง	Oral	Active	\N	2025-08-08 13:15:24.734768	2025-08-08 13:15:24.734768
139	1	9	2025-08-08 13:15:24.751991	2025-08-08 13:15:24	\N	Take 1 tablet daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-08-08 13:15:24.751991	2025-08-08 13:15:24.751991
140	1	7	2025-08-08 13:15:24.771078	2025-08-08 13:15:24	\N	Take 1 tablet daily	วันละ 10 ครั้ง	Oral	Active	\N	2025-08-08 13:15:24.771078	2025-08-08 13:15:24.771078
141	1	5	2025-08-08 18:31:59.675808	2025-08-08 18:31:59	\N	Take 1 tablet daily	วันละ 6 ครั้ง	Oral	Active	\N	2025-08-08 18:31:59.675808	2025-08-08 18:31:59.675808
142	1	25	2025-08-08 18:31:59.7025	2025-08-08 18:31:59	\N	Take 1 tablet daily	วันละ 7 ครั้ง	Oral	Active	\N	2025-08-08 18:31:59.7025	2025-08-08 18:31:59.7025
143	1	17	2025-08-08 18:31:59.721677	2025-08-08 18:31:59	\N	Take 1 tablet daily	วันละ 5 ครั้ง	Oral	Active	\N	2025-08-08 18:31:59.721677	2025-08-08 18:31:59.721677
144	1	24	2025-08-08 18:31:59.738976	2025-08-08 18:31:59	\N	Take 1 tablet daily	วันละ 10 ครั้ง	Oral	Active	\N	2025-08-08 18:31:59.738976	2025-08-08 18:31:59.738976
145	20	17	2025-08-08 18:32:10.560509	2025-08-08 18:32:10	\N	Take 1 tablet daily	วันละ 5 ครั้ง	Oral	Active	\N	2025-08-08 18:32:10.560509	2025-08-08 18:32:10.560509
146	9	10	2025-08-08 20:40:30.556716	2025-08-08 20:40:30	\N	Take 1 tablet at bedtime	วันละ 9 ครั้ง	Oral	Active	\N	2025-08-08 20:40:30.556716	2025-08-08 20:40:30.556716
147	9	12	2025-08-08 20:40:30.581553	2025-08-08 20:40:30	\N	Take 1 tablet before breakfast	วันละ 5 ครั้ง	Oral	Active	\N	2025-08-08 20:40:30.581553	2025-08-08 20:40:30.581553
148	9	21	2025-08-08 20:40:30.598264	2025-08-08 20:40:30	\N	Take 1 tablet daily	วันละ 6 ครั้ง	Oral	Active	\N	2025-08-08 20:40:30.598264	2025-08-08 20:40:30.598264
149	9	14	2025-08-08 20:40:30.614676	2025-08-08 20:40:30	\N	Take 1 tablet with breakfast	วันละ 8 ครั้ง	Oral	Active	\N	2025-08-08 20:40:30.614676	2025-08-08 20:40:30.614676
150	9	2	2025-08-08 20:40:30.630735	2025-08-08 20:40:30	\N	Take 1 capsule every 8 hours	วันละ 10 ครั้ง	Oral	Active	\N	2025-08-08 20:40:30.630735	2025-08-08 20:40:30.630735
151	3	11	2025-08-11 18:34:50.020605	2025-08-11 18:34:50	\N	Take 1 tablet daily	วันละ 5 ครั้ง	Oral	Active	\N	2025-08-11 18:34:50.020605	2025-08-11 18:34:50.020605
152	3	5	2025-08-11 18:34:50.057581	2025-08-11 18:34:50	\N	Take 1 tablet daily	วันละ 6 ครั้ง	Oral	Active	\N	2025-08-11 18:34:50.057581	2025-08-11 18:34:50.057581
153	3	14	2025-08-11 18:34:50.079322	2025-08-11 18:34:50	\N	Take 1 tablet with breakfast	วันละ 8 ครั้ง	Oral	Active	\N	2025-08-11 18:34:50.079322	2025-08-11 18:34:50.079322
154	3	17	2025-08-11 18:34:50.101524	2025-08-11 18:34:50	\N	Take 1 tablet daily	วันละ 5 ครั้ง	Oral	Active	\N	2025-08-11 18:34:50.101524	2025-08-11 18:34:50.101524
155	8	18	2025-08-11 19:05:13.722053	2025-08-11 19:05:13	\N	Take 1 tablet daily	วันละ 6 ครั้ง	Oral	Active	\N	2025-08-11 19:05:13.722053	2025-08-11 19:05:13.722053
156	8	20	2025-08-11 19:05:13.753755	2025-08-11 19:05:13	\N	Take 1 tablet before meals	วันละ 5 ครั้ง	Oral	Active	\N	2025-08-11 19:05:13.753755	2025-08-11 19:05:13.753755
157	8	13	2025-08-11 19:05:13.774638	2025-08-11 19:05:13	\N	Take 1 tablet at bedtime	วันละ 6 ครั้ง	Oral	Active	\N	2025-08-11 19:05:13.774638	2025-08-11 19:05:13.774638
158	8	1	2025-08-11 19:05:13.79402	2025-08-11 19:05:13	\N	Take 1 tablet every 6 hours	วันละ 5 ครั้ง	Oral	Active	\N	2025-08-11 19:05:13.79402	2025-08-11 19:05:13.79402
\.


--
-- Data for Name: medicine_order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medicine_order (order_id, med_id_list, patient_id, doctor_name, description, "time") FROM stdin;
\.


--
-- Data for Name: medicines_TEST; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."medicines_TEST" (med_id, med_name, med_generic_name, med_scientific_name, med_description, med_dosage, med_side_effect, med_interaction, med_price, med_type, med_type_th) FROM stdin;
1	Paracetamol	Acetaminophen	N-(4-hydroxyphenyl)acetamide	Pain reliever and fever reducer	500mg every 4-6 hours	Nausea, rash, liver damage	Alcohol increases risk of liver damage	15	Analgesic	ยาแก้ปวด
2	Ibuprofen	Ibuprofen	2-(4-isobutylphenyl)propionic acid	Nonsteroidal anti-inflammatory drug (NSAID)	200-400mg every 4-6 hours	Stomach upset, dizziness	Increased risk of bleeding with anticoagulants	30	NSAID	ยาต้านการอักเสบ
3	Amoxicillin	Amoxicillin	6-[D-(-)-alpha-amino-p-hydroxyphenylacetamido]penicillanic acid	Antibiotic used to treat bacterial infections	500mg every 8 hours	Diarrhea, rash	Reduced efficacy with oral contraceptives	50	Antibiotic	ยาปฏิชีวนะ
4	Ciprofloxacin	Ciprofloxacin	1-Cyclopropyl-6-fluoro-1,4-dihydro-4-oxo-7-(1-piperazinyl)-3-quinolinecarboxylic acid	Antibiotic used to treat bacterial infections	250-750mg every 12 hours	Nausea, headache, photosensitivity	Avoid antacids and dairy products	60	Antibiotic	ยาปฏิชีวนะ
5	Metformin	Metformin	1,1-Dimethylbiguanide hydrochloride	Used to treat type 2 diabetes	500-850mg twice daily	Nausea, abdominal pain	Alcohol increases risk of lactic acidosis	35	Antidiabetic	ยารักษาเบาหวาน
6	Losartan	Losartan Potassium	2-butyl-4-chloro-1-[p-(o-1H-tetrazol-5-ylphenyl)benzyl]imidazole-5-methanol monopotassium salt	Treats high blood pressure	50mg once daily	Dizziness, muscle cramps	NSAIDs may reduce antihypertensive effect	45	Antihypertensive	ยาลดความดัน
7	Atorvastatin	Atorvastatin Calcium	(3R,5R)-7-[2-(4-fluorophenyl)-3-phenyl-4-(phenylcarbamoyl)-5-isopropylpyrrol-1-yl]-3,5-dihydroxyheptanoic acid calcium salt	Reduces cholesterol and triglycerides	10-20mg once daily	Muscle pain, digestive problems	Avoid grapefruit juice	90	Lipid-lowering	ยาลดไขมัน
8	Omeprazole	Omeprazole	5-methoxy-2-[[(4-methoxy-3,5-dimethylpyridin-2-yl)methyl]sulfinyl]-1H-benzimidazole	Reduces stomach acid	20mg once daily before meals	Headache, abdominal pain	May reduce absorption of certain drugs	40	Proton Pump Inhibitor	ยาลดกรด
9	Loratadine	Loratadine	Ethyl 4-(8-chloro-5,6-dihydro-11H-benzo[5,6]cyclohepta[1,2-b]pyridin-11-ylidene)-1-piperidinecarboxylate	Treats allergy symptoms	10mg once daily	Dry mouth, drowsiness	No significant drug interactions	20	Antihistamine	ยาแก้แพ้
10	Prednisolone	Prednisolone	11β,17α,21-Trihydroxy-1,4-pregnadiene-3,20-dione	Steroid to reduce inflammation	5-60mg daily depending on condition	Weight gain, mood changes	Increased risk of ulcers with NSAIDs	70	Corticosteroid	ยาสเตียรอยด์
11	Aspirin	Acetylsalicylic Acid	2-(Acetyloxy)benzoic acid	Pain reliever, reduces risk of blood clots	325-650mg every 4-6 hours	Stomach upset, bleeding risk	Avoid with anticoagulants	25	Antiplatelet	ยาลดการเกาะตัวของเกล็ดเลือด
12	Clopidogrel	Clopidogrel Bisulfate	Methyl (+)-(S)-alpha-(2-chlorophenyl)-6,7-dihydrothieno[3,2-c]pyridine-5(4H)-acetate sulfate	Prevents blood clots	75mg once daily	Bleeding, rash	Increased bleeding with NSAIDs	85	Antiplatelet	ยาลดการเกาะตัวของเกล็ดเลือด
13	Levothyroxine	Levothyroxine Sodium	(L)-3,5,3’,5’-tetraiodothyronine sodium salt hydrate	Treats hypothyroidism	50-150mcg once daily before breakfast	Anxiety, increased heart rate	Reduced absorption with calcium or iron supplements	60	Hormone	ยาฮอร์โมน
14	Simvastatin	Simvastatin	Butanoic acid, 2,2-dimethyl-,1,2,3,7,8,8a-hexahydro-3,7-dimethyl-8-[2-(tetrahydro-4-hydroxy-6-oxo-2H-pyran-2-yl)ethyl]-1-naphthalenyl ester	Lowers cholesterol levels	10-40mg once daily in the evening	Muscle pain, digestive issues	Avoid grapefruit juice	75	Lipid-lowering	ยาลดไขมัน
15	Hydrochlorothiazide	Hydrochlorothiazide	6-Chloro-3,4-dihydro-2H-1,2,4-benzothiadiazine-7-sulfonamide-1,1-dioxide	Diuretic for high blood pressure	25-100mg once daily	Dizziness, increased urination	Risk of low potassium with corticosteroids	30	Diuretic	ยาขับปัสสาวะ
16	Doxycycline	Doxycycline Hyclate	(4S,4aR,5S,5aR,6R,12aS)-4-(Dimethylamino)-1,4,4a,5,5a,6,11,12a-octahydro-3,5,10,12,12a-penta-hydroxy-6-methyl-1,11-dioxo-2-naphthacenecarboxamide hydrochloride	Antibiotic for bacterial infections	100mg twice daily	Nausea, sun sensitivity	Avoid antacids and dairy	50	Antibiotic	ยาปฏิชีวนะ
17	Citalopram	Citalopram Hydrobromide	(RS)-1-(3-dimethylaminopropyl)-1-(4-fluorophenyl)-1,3-dihydroisobenzofuran-5-carbonitrile	Antidepressant (SSRI)	20-40mg once daily	Nausea, dry mouth	Increased risk of serotonin syndrome with other serotonergic drugs	120	Antidepressant	ยาแก้ซึมเศร้า
18	Metoprolol	Metoprolol Tartrate	(±)-1-(Isopropylamino)-3-[p-(2-methoxyethyl)phenoxy]-2-propanol tartrate	Beta-blocker for high blood pressure	50-100mg once or twice daily	Fatigue, dizziness	Caution with other beta-blockers	55	Beta-blocker	ยาลดความดัน
19	Furosemide	Furosemide	4-Chloro-N-furfuryl-5-sulfamoylanthranilic acid	Diuretic to reduce fluid retention	20-80mg once daily	Dehydration, low potassium	Increased risk of ototoxicity with aminoglycosides	40	Diuretic	ยาขับปัสสาวะ
\.


--
-- Data for Name: overdue_med; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.overdue_med (overdue_id, med_id, "time", dispense_status, patient_id) FROM stdin;
2	2	2025-04-02	f	1
4	3	2025-04-03	f	3
5	4	2025-04-04	f	4
6	4	2025-04-04	f	1
7	2	2025-04-05	f	5
8	3	2025-04-06	f	5
9	1	2025-04-06	f	6
10	5	2025-04-07	f	7
11	6	2025-04-08	f	8
12	1	2025-04-08	f	8
13	7	2025-04-09	f	9
14	2	2025-04-09	f	10
15	3	2025-04-10	f	10
16	5	2025-04-10	f	3
17	1	2025-04-11	f	1
18	3	2025-04-12	f	2
1	1	2025-04-01	t	1
3	1	2025-04-02	t	2
19	6	2025-04-12	f	4
20	7	2025-04-13	t	4
\.


--
-- Data for Name: patient; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patient (patient_id, national_id, first_name, last_name, gender, birthday, age_y, age_m, age_d, blood_group, "PMH", phone, height, weight, bmi, patient_addr_id, hn_number, allergy_id, first_name_eng, last_name_eng) FROM stdin;
1	1103700012345	สมชาย	ใจดี	ชาย	1985-07-12	38	8	5	O	ไม่มี	0812345678	170.5	68.2	23.5	1	90000001	\N	Somchai	Jaidee
2	1103700023456	สมหญิง	สวยงาม	หญิง	1990-03-25	34	0	10	A	แพ้ยาเพนิซิลลิน	0897654321	160.2	55	21.4	2	90000002	\N	Somying	Suai-ngam
3	1103700034567	วิชัย	ทองดี	ชาย	1978-11-05	45	4	20	B	เบาหวาน	0812233445	175	80.5	26.3	3	90000003	\N	Wichai	Thongdee
4	1103700045678	อรทัย	บุญมาก	หญิง	1995-09-17	28	6	2	A	หอบหืด	0823344556	158.8	49.5	19.6	4	90000004	\N	Orathai	Boonmak
5	1103700056789	ปกรณ์	รุ่งเรือง	ชาย	1982-05-30	41	10	12	O	ความดันโลหิตสูง	0834455667	172.5	75.3	25.3	5	90000005	\N	Pakorn	Rungrueang
6	1103700067890	ชลธิชา	สมสุข	หญิง	2000-12-08	23	3	18	A	แพ้อาหารทะเล	0845566778	165	60	22	6	90000006	\N	Chonthicha	Somsuk
7	1103700078901	ดำรง	มั่นคง	ชาย	1970-01-20	54	2	7	B	โรคหัวใจ	0856677889	168.2	72.8	25.8	7	90000007	\N	Damrong	Mankhong
8	1103700089012	ศิริพร	ไพศาล	หญิง	1988-07-03	35	8	22	A	ไม่มี	0867788990	162.3	57.2	21.8	8	90000008	\N	Siriporn	Paisan
9	1103700090123	เกรียงไกร	เกษมสุข	ชาย	1992-02-15	32	1	10	O	ไมเกรน	0878899001	174	78	25.8	9	90000009	\N	Kriangkrai	Kasemsuk
10	1103700101234	วราภรณ์	เพียรดี	หญิง	2005-06-29	19	9	1	A	ไม่มี	0889900112	159.5	50.8	20	10	90000010	\N	Waraporn	Phiendee
11	1103700112345	ธนกร	ศรีสวัสดิ์	ชาย	1987-04-14	37	11	15	O	ไม่มี	0912345678	176.3	70.5	22.7	11	90000011	\N	Thanakorn	Srisawat
12	1103700123456	วรรณภา	ใจดี	หญิง	1998-09-22	25	6	7	A	แพ้ฝุ่น	0923456789	162	52	19.8	12	90000012	\N	Wannapha	Jaidee
13	1103700134567	กิตติ	รุ่งโรจน์	ชาย	1993-06-01	30	9	28	B	ความดันโลหิตสูง	0934567890	173.5	76.2	25.3	13	90000013	\N	Kitti	Rungrot
14	1103700145678	อารีย์	วัฒนธรรม	หญิง	1975-02-10	49	1	18	A	เบาหวาน	0945678901	159.7	60.5	23.8	14	90000014	\N	Aree	Watthanatham
15	1103700156789	อนุชา	สืบสกุล	ชาย	1989-12-25	34	3	5	O	หอบหืด	0956789012	175.8	79.3	25.7	15	90000015	\N	Anucha	Suebsakun
16	1103700167890	ชุติมา	มงคล	หญิง	2001-07-19	22	8	9	A	ไม่มี	0967890123	161.5	50.2	19.3	16	90000016	\N	Chutima	Mongkhon
17	1103700178901	ยุทธนา	แซ่ตั้ง	ชาย	1980-10-30	43	5	20	B	แพ้อาหารทะเล	0978901234	168.9	72.5	25.4	17	90000017	\N	Yutthana	Sae-Tang
18	1103700189012	ลลิตา	ทวีทรัพย์	หญิง	1997-05-07	26	10	22	A	ไม่มี	0989012345	163.2	54.8	20.6	18	90000018	\N	Lalita	Thawisap
19	1103700190123	ประวิทย์	โสภณ	ชาย	1991-11-11	32	4	18	O	โรคหัวใจ	0990123456	172.7	78	26.2	19	90000019	\N	Prawit	Sophon
20	1103700201234	ศศิธร	อ่อนหวาน	หญิง	1984-08-08	39	7	5	A	ไมเกรน	0901234567	158.3	53	21.2	20	90000020	\N	Sasithorn	Onwan
\.


--
-- Data for Name: patient_address; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patient_address (address_id, patient_addr_id, house_number, village_number, sub_district, district, province, road, postal_code) FROM stdin;
1	101	99/1	3	หนองแขม	หนองแขม	กรุงเทพมหานคร	เพชรเกษม	10160
2	102	45	\N	ลาดพร้าว	จตุจักร	กรุงเทพมหานคร	ลาดพร้าว 101	10900
3	103	120	7	บางบัวทอง	บางบัวทอง	นนทบุรี	บางกรวย-ไทรน้อย	11110
4	104	22/5	5	บางแค	บางแค	กรุงเทพมหานคร	พุทธมณฑลสาย 2	10160
5	105	88	1	คลองหลวง	คลองหลวง	ปทุมธานี	รังสิต-นครนายก	12120
6	106	56/9	\N	ศาลายา	พุทธมณฑล	นครปฐม	บรมราชชนนี	73170
7	107	10	6	เมืองเก่า	เมือง	สุโขทัย	สุโขทัย-พิษณุโลก	64000
8	108	159	2	บ้านบึง	บ้านบึง	ชลบุรี	สุขุมวิท	20170
9	109	78/3	\N	ศรีราชา	ศรีราชา	ชลบุรี	บายพาส-ชลบุรี	20110
10	110	35/7	4	ท่าม่วง	ท่าม่วง	กาญจนบุรี	กาญจนบุรี-ไทรโยค	71110
11	111	90/4	\N	โพธาราม	โพธาราม	ราชบุรี	เพชรเกษม	70120
12	112	48	9	บางสะพาน	บางสะพาน	ประจวบคีรีขันธ์	เพชรเกษม	77140
13	113	77	\N	เมืองใหม่	เมือง	เชียงใหม่	เชียงใหม่-ลำพูน	50000
14	114	12/1	8	เมืองใต้	เมือง	นครศรีธรรมราช	ราชดำเนิน	80000
15	115	89	2	หาดใหญ่	หาดใหญ่	สงขลา	กาญจนวนิช	90110
16	116	43	5	สามพราน	สามพราน	นครปฐม	เพชรเกษม	73110
17	117	50/2	1	นครชัยศรี	นครชัยศรี	นครปฐม	บรมราชชนนี	73120
18	118	29	\N	เมืองกลาง	เมือง	ขอนแก่น	มิตรภาพ	40000
19	119	18/6	7	ปากช่อง	ปากช่อง	นครราชสีมา	มิตรภาพ	30130
20	120	101	3	เมืองเหนือ	เมือง	อุบลราชธานี	อุบล-ศรีสะเกษ	34000
\.


--
-- Data for Name: rad_registry; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rad_registry (rad_id, med_id, patient_id, description, acceptance, acceptance_time, specimen, pathogenic, indications, indications_criteria, submission_time) FROM stdin;
1	2	5	ขอใช้ยาเพื่อรักษาเชื้อราในกระแสเลือด	f	2025-04-22 14:35:00	เสมหะ	Candida albicans	เชื้อราในเลือด	blood culture positive	2025-04-22 14:35:00
2	8	12	ขอใช้ยาต้านไวรัสตับอักเสบซี	f	2025-04-20 11:05:00	น้ำลาย	Hepatitis C Virus	ตับอักเสบ C	anti-HCV positive	2025-04-20 11:05:00
3	5	3	ขอใช้ยาต้านเชื้อแบคทีเรียดื้อยา	f	2025-04-19 09:10:00	เลือด	MRSA	ติดเชื้อดื้อยา	methicillin-resistant positive	2025-04-19 09:10:00
4	10	7	ขอใช้ยาในภาวะติดเชื้อ CRE ใน ICU	f	2025-04-21 13:40:00	น้ำไขสันหลัง	Klebsiella pneumoniae (CRE)	เชื้อดื้อยาใน ICU	carbapenem-resistant positive	2025-04-21 13:40:00
5	1	9	ขอใช้ยาควบคุมรักษาวัณโรค	f	2025-04-24 08:15:00	เสมหะ	Mycobacterium tuberculosis	วัณโรคปอด	ผล smear positive	2025-04-24 08:15:00
6	6	14	ขอใช้ยาต้านมาลาเรีย	f	2025-04-18 16:20:00	น้ำลาย	Plasmodium falciparum	ไข้มาลาเรีย	malaria smear positive	2025-04-18 16:20:00
7	4	2	ขอใช้ยาในผู้ป่วยเยื่อหุ้มสมองอักเสบ	f	2025-04-23 10:45:00	น้ำไขสันหลัง	Neisseria meningitidis	เยื่อหุ้มสมองอักเสบ	culture positive	2025-04-23 10:45:00
8	3	6	ขอใช้ยาต้านไวรัส HIV	f	2025-04-17 12:00:00	เลือด	HIV	HIV infection	ผล anti-HIV positive	2025-04-17 12:00:00
9	7	1	ขอใช้ยาควบคุมเชื้อราในช่องปาก	f	2025-04-20 15:30:00	เสมหะ	Candida spp.	เชื้อราในช่องปาก	oral swab positive	2025-04-20 15:30:00
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles ("roleID", role_name) FROM stdin;
0	แอดมิน (Admin)
99	แพทย์ (Doctor)
100	พยาบาล (Nurse)
101	เภสัชกร (Pharmacist)
102	ผู้ช่วยเภสัชกร (Pharmacy Assistant)
103	เจ้าหน้าที่คลังยา (Inventory Officer)
\.


--
-- Data for Name: sticker_form; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sticker_form (stk_id, fstk_form) FROM stdin;
\.


--
-- Data for Name: sub_warehouse; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sub_warehouse (sub_warehouse_id, name, description, is_active) FROM stdin;
1	ห้องจ่ายยา OPD	สำหรับผู้ป่วยนอก	t
2	ห้องจ่ายยา IPD	สำหรับผู้ป่วยใน	t
3	ห้องจ่ายยา ICU	ใช้ในกรณีผู้ป่วยวิกฤต	t
4	ห้องยาเด็ก	คลังยาสำหรับเด็กอายุต่ำกว่า 15 ปี	t
5	ห้องยาแผนกฉุกเฉิน	เฉพาะกรณีฉุกเฉิน	t
\.


--
-- Data for Name: temp_humidity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.temp_humidity ("time", tempetature, humidity) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (uid, username, password, email, phone, "roleID") FROM stdin;
9	inventory_staff	xyz	inventory@gmail.com	0888888888	103
7	admin	1234	admin@gmail.com	0000000000	0
8	pharmacy1	abcd	pharmacy1@gmail.com	0999999999	101
10	doc	doc123	doctor@gmail.com	0111111110	99
\.


--
-- Name: adr_registry_adr_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.adr_registry_adr_id_seq', 1, false);


--
-- Name: allergy_registry_allr_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.allergy_registry_allr_id_seq', 21, true);


--
-- Name: error_medication_err_med_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.error_medication_err_med_id_seq', 6, true);


--
-- Name: med_cut_off_period_med_period_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.med_cut_off_period_med_period_id_seq', 20, true);


--
-- Name: med_delivery_delivery_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.med_delivery_delivery_id_seq', 26, true);


--
-- Name: med_evaluation_me_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.med_evaluation_me_id_seq', 1, false);


--
-- Name: med_interaction_interacton_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.med_interaction_interacton_id_seq', 26, true);


--
-- Name: med_order_history_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.med_order_history_history_id_seq', 56, true);


--
-- Name: med_order_rights_med_rights_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.med_order_rights_med_rights_id_seq', 1, false);


--
-- Name: med_probolem_mp_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.med_probolem_mp_id_seq', 30, true);


--
-- Name: med_requests_request_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.med_requests_request_id_seq', 38, true);


--
-- Name: med_stock_history_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.med_stock_history_history_id_seq', 89, true);


--
-- Name: med_table_med_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.med_table_med_id_seq', 45, true);


--
-- Name: med_usage_usage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.med_usage_usage_id_seq', 158, true);


--
-- Name: medicine_order_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medicine_order_order_id_seq', 1, false);


--
-- Name: medicines_med_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medicines_med_id_seq', 19, true);


--
-- Name: overdue_med_overdue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.overdue_med_overdue_id_seq', 20, true);


--
-- Name: patient_address_address_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patient_address_address_id_seq', 20, true);


--
-- Name: rad_regisrty_rad_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rad_regisrty_rad_id_seq', 10, true);


--
-- Name: sticker_form_stk_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sticker_form_stk_id_seq', 1, false);


--
-- Name: sub_warehouse_sub_warehouse_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sub_warehouse_sub_warehouse_id_seq', 5, true);


--
-- Name: users_uid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_uid_seq', 10, true);


--
-- Name: patient_address addr_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_address
    ADD CONSTRAINT addr_pk PRIMARY KEY (address_id) INCLUDE (address_id);


--
-- Name: adr_registry adr_registry_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adr_registry
    ADD CONSTRAINT adr_registry_pkey PRIMARY KEY (adr_id);


--
-- Name: allergy_registry allergy_registry_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.allergy_registry
    ADD CONSTRAINT allergy_registry_pkey PRIMARY KEY (allr_id);


--
-- Name: error_medication error_medication_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.error_medication
    ADD CONSTRAINT error_medication_pkey PRIMARY KEY (err_med_id);


--
-- Name: med_cut_off_period med_cut_off_period_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_cut_off_period
    ADD CONSTRAINT med_cut_off_period_pkey PRIMARY KEY (med_period_id);


--
-- Name: med_delivery med_delivery_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_delivery
    ADD CONSTRAINT med_delivery_pkey PRIMARY KEY (delivery_id);


--
-- Name: med_evaluation med_evaluation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_evaluation
    ADD CONSTRAINT med_evaluation_pkey PRIMARY KEY (me_id);


--
-- Name: med_interaction med_interaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_interaction
    ADD CONSTRAINT med_interaction_pkey PRIMARY KEY (interaction_id);


--
-- Name: med_order_history med_order_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_order_history
    ADD CONSTRAINT med_order_history_pkey PRIMARY KEY (history_id);


--
-- Name: med_order_rights med_order_rights_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_order_rights
    ADD CONSTRAINT med_order_rights_pkey PRIMARY KEY (med_rights_id);


--
-- Name: med_problem med_probolem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_problem
    ADD CONSTRAINT med_probolem_pkey PRIMARY KEY (mp_id);


--
-- Name: med_requests med_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_requests
    ADD CONSTRAINT med_requests_pkey PRIMARY KEY (request_id);


--
-- Name: med_stock_history med_stock_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_stock_history
    ADD CONSTRAINT med_stock_history_pkey PRIMARY KEY (history_id);


--
-- Name: med_table med_table_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_table
    ADD CONSTRAINT med_table_pkey PRIMARY KEY (med_id);


--
-- Name: med_usage med_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_usage
    ADD CONSTRAINT med_usage_pkey PRIMARY KEY (usage_id);


--
-- Name: medicine_order medicine_order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine_order
    ADD CONSTRAINT medicine_order_pkey PRIMARY KEY (order_id);


--
-- Name: overdue_med overdue_med_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.overdue_med
    ADD CONSTRAINT overdue_med_pkey PRIMARY KEY (overdue_id);


--
-- Name: patient patient_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient
    ADD CONSTRAINT patient_pkey PRIMARY KEY (patient_id);


--
-- Name: rad_registry rad_regisrty_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rad_registry
    ADD CONSTRAINT rad_regisrty_pkey PRIMARY KEY (rad_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY ("roleID");


--
-- Name: sticker_form sticker_form_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sticker_form
    ADD CONSTRAINT sticker_form_pkey PRIMARY KEY (stk_id);


--
-- Name: sub_warehouse sub_warehouse_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_warehouse
    ADD CONSTRAINT sub_warehouse_pkey PRIMARY KEY (sub_warehouse_id);


--
-- Name: patient unique_hn_number; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient
    ADD CONSTRAINT unique_hn_number UNIQUE (hn_number);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (uid);


--
-- Name: fki_address_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_address_fk ON public.patient USING btree (patient_addr_id);


--
-- Name: fki_address_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_address_id ON public.patient USING btree (patient_addr_id);


--
-- Name: fki_med_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_med_id ON public.allergy_registry USING btree (med_id);


--
-- Name: fki_med_id_1; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_med_id_1 ON public.med_interaction USING btree (med_id_1);


--
-- Name: fki_med_id_2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_med_id_2 ON public.med_interaction USING btree (med_id_2);


--
-- Name: fki_patient_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_patient_id ON public.allergy_registry USING btree (patient_id);


--
-- Name: fki_role_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_role_fk ON public.users USING btree ("roleID");


--
-- Name: fki_sub_warehouse_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_sub_warehouse_id ON public.med_cut_off_period USING btree (sub_warehouse_id);


--
-- Name: patient set_hn_number; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_hn_number BEFORE INSERT ON public.patient FOR EACH ROW EXECUTE FUNCTION public.generate_hn_number();


--
-- Name: allergy_registry fk_allergy_med; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.allergy_registry
    ADD CONSTRAINT fk_allergy_med FOREIGN KEY (med_id) REFERENCES public.med_table(med_id) ON DELETE CASCADE;


--
-- Name: allergy_registry fk_allergy_patient; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.allergy_registry
    ADD CONSTRAINT fk_allergy_patient FOREIGN KEY (patient_id) REFERENCES public.patient(patient_id) ON DELETE CASCADE;


--
-- Name: med_delivery fk_delivery_patient; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_delivery
    ADD CONSTRAINT fk_delivery_patient FOREIGN KEY (patient_id) REFERENCES public.patient(patient_id) ON DELETE CASCADE;


--
-- Name: patient fk_patient_address_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient
    ADD CONSTRAINT fk_patient_address_id FOREIGN KEY (patient_addr_id) REFERENCES public.patient_address(address_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: med_order_history fk_patient_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_order_history
    ADD CONSTRAINT fk_patient_id FOREIGN KEY (patient_id) REFERENCES public.patient(patient_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: med_problem fk_problem_med; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_problem
    ADD CONSTRAINT fk_problem_med FOREIGN KEY (med_id) REFERENCES public.med_table(med_id) ON DELETE CASCADE;


--
-- Name: med_problem fk_problem_usage; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_problem
    ADD CONSTRAINT fk_problem_usage FOREIGN KEY (usage_id) REFERENCES public.med_usage(usage_id) ON DELETE SET NULL;


--
-- Name: allergy_registry med_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.allergy_registry
    ADD CONSTRAINT med_id FOREIGN KEY (med_id) REFERENCES public.med_table(med_id) MATCH FULL NOT VALID;


--
-- Name: overdue_med med_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.overdue_med
    ADD CONSTRAINT med_id FOREIGN KEY (med_id) REFERENCES public.med_table(med_id) NOT VALID;


--
-- Name: rad_registry med_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rad_registry
    ADD CONSTRAINT med_id FOREIGN KEY (med_id) REFERENCES public.med_table(med_id) NOT VALID;


--
-- Name: med_problem med_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_problem
    ADD CONSTRAINT med_id FOREIGN KEY (med_id) REFERENCES public.med_table(med_id) NOT VALID;


--
-- Name: med_evaluation med_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_evaluation
    ADD CONSTRAINT med_id FOREIGN KEY (med_id) REFERENCES public.med_table(med_id) NOT VALID;


--
-- Name: adr_registry med_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adr_registry
    ADD CONSTRAINT med_id FOREIGN KEY (med_id) REFERENCES public.med_table(med_id) NOT VALID;


--
-- Name: med_interaction med_id_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_interaction
    ADD CONSTRAINT med_id_1 FOREIGN KEY (med_id_1) REFERENCES public.med_table(med_id) NOT VALID;


--
-- Name: med_interaction med_id_2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_interaction
    ADD CONSTRAINT med_id_2 FOREIGN KEY (med_id_2) REFERENCES public.med_table(med_id) NOT VALID;


--
-- Name: med_requests med_requests_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_requests
    ADD CONSTRAINT med_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(uid);


--
-- Name: med_requests med_requests_med_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_requests
    ADD CONSTRAINT med_requests_med_id_fkey FOREIGN KEY (med_id) REFERENCES public.med_table(med_id);


--
-- Name: med_requests med_requests_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_requests
    ADD CONSTRAINT med_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.users(uid);


--
-- Name: med_stock_history med_stock_history_med_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.med_stock_history
    ADD CONSTRAINT med_stock_history_med_id_fkey FOREIGN KEY (med_id) REFERENCES public.med_table(med_id);


--
-- Name: medicine_order patient_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicine_order
    ADD CONSTRAINT patient_id FOREIGN KEY (patient_id) REFERENCES public.patient(patient_id) NOT VALID;


--
-- Name: overdue_med patient_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.overdue_med
    ADD CONSTRAINT patient_id FOREIGN KEY (patient_id) REFERENCES public.patient(patient_id) NOT VALID;


--
-- Name: rad_registry patient_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rad_registry
    ADD CONSTRAINT patient_id FOREIGN KEY (patient_id) REFERENCES public.patient(patient_id) NOT VALID;


--
-- Name: users role_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT role_fk FOREIGN KEY ("roleID") REFERENCES public.roles("roleID") NOT VALID;


--
-- PostgreSQL database dump complete
--

