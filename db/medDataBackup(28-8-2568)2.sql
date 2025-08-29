--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5
SET search_path TO med;
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
-- Name: packaging_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE med.packaging_type AS ENUM (
    'เม็ด',
    'ซอง',
    'กล่อง',
    'ขวด',
    'หลอด'
);


ALTER TYPE med.packaging_type OWNER TO neondb_owner;

--
-- Name: serivity_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE med.serivity_type AS ENUM (
    'mild',
    'moderate',
    'severe'
);


ALTER TYPE med.serivity_type OWNER TO neondb_owner;

--
-- Name: generate_hn_number(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION med.generate_hn_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.hn_number := '9000' || LPAD(NEW.patient_id::TEXT, 4, '0');
  RETURN NEW;
END;
$$;


ALTER FUNCTION med.generate_hn_number() OWNER TO neondb_owner;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION med.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION med.update_updated_at_column() OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: adr_registry; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med.adr_registry (
    adr_id integer NOT NULL,
    med_id integer NOT NULL,
    patient_id integer NOT NULL,
    description text NOT NULL,
    reported_at timestamp without time zone NOT NULL,
    severity text,
    outcome text,
    reporter_id integer,
    notes text,
    symptoms text
);


ALTER TABLE med.adr_registry OWNER TO neondb_owner;

--
-- Name: adr_registry_adr_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE med.adr_registry_adr_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE med.adr_registry_adr_id_seq OWNER TO neondb_owner;

--
-- Name: adr_registry_adr_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE med.adr_registry_adr_id_seq OWNED BY med.adr_registry.adr_id;


--
-- Name: allergy_registry; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med.allergy_registry (
    allr_id integer NOT NULL,
    med_id integer NOT NULL,
    patient_id integer NOT NULL,
    symptoms text NOT NULL,
    description text,
    severity med.serivity_type DEFAULT 'mild'::med.serivity_type NOT NULL,
    reported_at timestamp without time zone,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE med.allergy_registry OWNER TO neondb_owner;

--
-- Name: allergy_registry_allr_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE med.allergy_registry_allr_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE med.allergy_registry_allr_id_seq OWNER TO neondb_owner;

--
-- Name: allergy_registry_allr_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE med.allergy_registry_allr_id_seq OWNED BY med.allergy_registry.allr_id;


--
-- Name: error_medication; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med.error_medication (
    err_med_id integer NOT NULL,
    "time" timestamp without time zone NOT NULL,
    patient_id integer NOT NULL,
    doctor_id integer NOT NULL,
    med_id integer NOT NULL,
    description text NOT NULL,
    resolved boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    med_sid integer
);


ALTER TABLE med.error_medication OWNER TO neondb_owner;

--
-- Name: error_medication_err_med_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE med.error_medication_err_med_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE med.error_medication_err_med_id_seq OWNER TO neondb_owner;

--
-- Name: error_medication_err_med_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE med.error_medication_err_med_id_seq OWNED BY med.error_medication.err_med_id;


--
-- Name: expired_medicines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med.expired_medicines (
    expired_med_id integer NOT NULL,
    med_sid integer NOT NULL,
    med_id integer NOT NULL,
    status character varying(50) DEFAULT 'disposed'::character varying,
    moved_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE med.expired_medicines OWNER TO neondb_owner;

--
-- Name: expired_medicines_expired_med_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE med.expired_medicines_expired_med_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE med.expired_medicines_expired_med_id_seq OWNER TO neondb_owner;

--
-- Name: expired_medicines_expired_med_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE med.expired_medicines_expired_med_id_seq OWNED BY med.expired_medicines.expired_med_id;


--
-- Name: med_cut_off_period; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med.med_cut_off_period (
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


ALTER TABLE med.med_cut_off_period OWNER TO neondb_owner;

--
-- Name: med_cut_off_period_med_period_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE med.med_cut_off_period_med_period_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE med.med_cut_off_period_med_period_id_seq OWNER TO neondb_owner;

--
-- Name: med_cut_off_period_med_period_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE med.med_cut_off_period_med_period_id_seq OWNED BY med.med_cut_off_period.med_period_id;


--
-- Name: med_delivery; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med.med_delivery (
    delivery_id integer NOT NULL,
    patient_id integer NOT NULL,
    delivery_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    delivery_method text NOT NULL,
    receiver_name text NOT NULL,
    receiver_phone text NOT NULL,
    address text NOT NULL,
    note text,
    status text DEFAULT 'Pending'::text,
    medicine_list jsonb,
    doctor_id integer DEFAULT 10 NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE med.med_delivery OWNER TO neondb_owner;

--
-- Name: med_delivery_delivery_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE med.med_delivery_delivery_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE med.med_delivery_delivery_id_seq OWNER TO neondb_owner;

--
-- Name: med_delivery_delivery_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE med.med_delivery_delivery_id_seq OWNED BY med.med_delivery.delivery_id;


--
-- Name: med_evaluation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med.med_evaluation (
    me_id integer NOT NULL,
    med_id integer NOT NULL,
    description text
);


ALTER TABLE med.med_evaluation OWNER TO neondb_owner;

--
-- Name: med_evaluation_me_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE med.med_evaluation_me_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE med.med_evaluation_me_id_seq OWNER TO neondb_owner;

--
-- Name: med_evaluation_me_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE med.med_evaluation_me_id_seq OWNED BY med.med_evaluation.me_id;


--
-- Name: med_interaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med.med_interaction (
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


ALTER TABLE med.med_interaction OWNER TO neondb_owner;

--
-- Name: med_interaction_interacton_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE med.med_interaction_interacton_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE med.med_interaction_interacton_id_seq OWNER TO neondb_owner;

--
-- Name: med_interaction_interacton_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE med.med_interaction_interacton_id_seq OWNED BY med.med_interaction.interaction_id;


--
-- Name: med_order_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med.med_order_history (
    history_id integer NOT NULL,
    "time" timestamp without time zone NOT NULL,
    patient_id integer,
    description text,
    medicines jsonb,
    doctor_id integer DEFAULT 10,
    dispense_doc_id integer DEFAULT 8
);


ALTER TABLE med.med_order_history OWNER TO neondb_owner;

--
-- Name: med_order_history_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE med.med_order_history_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE med.med_order_history_history_id_seq OWNER TO neondb_owner;

--
-- Name: med_order_history_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE med.med_order_history_history_id_seq OWNED BY med.med_order_history.history_id;


--
-- Name: med_order_rights; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med.med_order_rights (
    med_rights_id integer NOT NULL,
    doctor_rights boolean DEFAULT false,
    dentist_rights boolean DEFAULT false,
    phamarcist_rights boolean DEFAULT false,
    psychohiatrist_rights boolean DEFAULT false
);


ALTER TABLE med.med_order_rights OWNER TO neondb_owner;

--
-- Name: med_order_rights_med_rights_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE med.med_order_rights_med_rights_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE med.med_order_rights_med_rights_id_seq OWNER TO neondb_owner;

--
-- Name: med_order_rights_med_rights_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE med.med_order_rights_med_rights_id_seq OWNED BY med.med_order_rights.med_rights_id;


--
-- Name: med_problem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med.med_problem (
    mp_id integer NOT NULL,
    med_id integer NOT NULL,
    description text NOT NULL,
    usage_id integer,
    problem_type text,
    reported_by integer,
    reported_at timestamp without time zone DEFAULT now(),
    is_resolved boolean DEFAULT false
);


ALTER TABLE med.med_problem OWNER TO neondb_owner;

--
-- Name: med_probolem_mp_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE med.med_probolem_mp_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE med.med_probolem_mp_id_seq OWNER TO neondb_owner;

--
-- Name: med_probolem_mp_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE med.med_probolem_mp_id_seq OWNED BY med.med_problem.mp_id;


--
-- Name: med_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med.med_requests (
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
    is_approve boolean DEFAULT false,
    origin character varying(255),
    med_sid integer,
    is_added boolean DEFAULT false,
    CONSTRAINT med_requests_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE med.med_requests OWNER TO neondb_owner;

--
-- Name: med_requests_request_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE med.med_requests_request_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE med.med_requests_request_id_seq OWNER TO neondb_owner;

--
-- Name: med_requests_request_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE med.med_requests_request_id_seq OWNED BY med.med_requests.request_id;


--
-- Name: med_stock_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med.med_stock_history (
    history_id integer NOT NULL,
    med_id integer,
    change_type character varying(50) NOT NULL,
    quantity_change integer NOT NULL,
    balance_after integer NOT NULL,
    reference_id integer,
    "time" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE med.med_stock_history OWNER TO neondb_owner;

--
-- Name: med_stock_history_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE med.med_stock_history_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE med.med_stock_history_history_id_seq OWNER TO neondb_owner;

--
-- Name: med_stock_history_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE med.med_stock_history_history_id_seq OWNED BY med.med_stock_history.history_id;


--
-- Name: med_subwarehouse; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med.med_subwarehouse (
    med_sid integer NOT NULL,
    med_id integer NOT NULL,
    med_quantity integer NOT NULL,
    packaging_type med.packaging_type NOT NULL,
    is_divisible boolean DEFAULT false,
    location character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    med_showname character varying(50),
    min_quantity integer,
    max_quantity integer,
    cost_price numeric(10,2),
    unit_price numeric(10,2),
    med_showname_eng character varying(50),
    mfg_date date,
    exp_date date,
    is_expired boolean DEFAULT false
);


ALTER TABLE med.med_subwarehouse OWNER TO neondb_owner;

--
-- Name: med_subwarehouse_med_sid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE med.med_subwarehouse_med_sid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE med.med_subwarehouse_med_sid_seq OWNER TO neondb_owner;

--
-- Name: med_subwarehouse_med_sid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE med.med_subwarehouse_med_sid_seq OWNED BY med.med_subwarehouse.med_sid;


--
-- Name: med_table; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med.med_table (
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
    med_dose_dialogue text,
    "med_TMT_code" text,
    "med_TPU_code" text,
    med_pregnancy_cagetory "char",
    med_set_new_price boolean DEFAULT false NOT NULL,
    "mde_dispence_IPD_freq" integer,
    med_mfg date NOT NULL,
    med_exp date NOT NULL
);


ALTER TABLE med.med_table OWNER TO neondb_owner;

--
-- Name: med_table_med_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE med.med_table_med_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE med.med_table_med_id_seq OWNER TO neondb_owner;

--
-- Name: med_table_med_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE med.med_table_med_id_seq OWNED BY med.med_table.med_id;


--
-- Name: med_usage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med.med_usage (
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


ALTER TABLE med.med_usage OWNER TO neondb_owner;

--
-- Name: med_usage_usage_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE med.med_usage_usage_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE med.med_usage_usage_id_seq OWNER TO neondb_owner;

--
-- Name: med_usage_usage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE med.med_usage_usage_id_seq OWNED BY med.med_usage.usage_id;


--
-- Name: medicine_order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med.medicine_order (
    order_id integer NOT NULL,
    med_id_list text NOT NULL,
    patient_id integer NOT NULL,
    doctor_name text NOT NULL,
    description text NOT NULL,
    "time" timestamp without time zone
);


ALTER TABLE med.medicine_order OWNER TO neondb_owner;

--
-- Name: medicine_order_order_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE med.medicine_order_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE med.medicine_order_order_id_seq OWNER TO neondb_owner;

--
-- Name: medicine_order_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE med.medicine_order_order_id_seq OWNED BY med.medicine_order.order_id;


--
-- Name: medicines_TEST; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med."medicines_TEST" (
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


ALTER TABLE med."medicines_TEST" OWNER TO neondb_owner;

--
-- Name: medicines_med_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE med.medicines_med_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE med.medicines_med_id_seq OWNER TO neondb_owner;

--
-- Name: medicines_med_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE med.medicines_med_id_seq OWNED BY med."medicines_TEST".med_id;


--
-- Name: noti_rules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med.noti_rules (
    rule_id integer NOT NULL,
    rule_name character varying(100) NOT NULL,
    rule_type character varying(50),
    related_table jsonb NOT NULL,
    trigger_condition jsonb NOT NULL,
    template_title character varying(255) NOT NULL,
    template_message text NOT NULL,
    recipient_role_id integer NOT NULL,
    check_frequency integer DEFAULT 60,
    is_active boolean DEFAULT true,
    last_checked_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE med.noti_rules OWNER TO neondb_owner;

--
-- Name: noti_rules_rule_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE med.noti_rules_rule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE med.noti_rules_rule_id_seq OWNER TO neondb_owner;

--
-- Name: noti_rules_rule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE med.noti_rules_rule_id_seq OWNED BY med.noti_rules.rule_id;


--
-- Name: notification_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med.notification_log (
    log_id integer NOT NULL,
    rule_id integer NOT NULL,
    related_table text NOT NULL,
    related_id integer NOT NULL,
    sent_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE med.notification_log OWNER TO neondb_owner;

--
-- Name: notification_log_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE med.notification_log_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE med.notification_log_log_id_seq OWNER TO neondb_owner;

--
-- Name: notification_log_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE med.notification_log_log_id_seq OWNED BY med.notification_log.log_id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med.notifications (
    notification_id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    type character varying(50),
    related_table character varying(100),
    related_id integer,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone
);


ALTER TABLE med.notifications OWNER TO neondb_owner;

--
-- Name: notifications_notification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE med.notifications_notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE med.notifications_notification_id_seq OWNER TO neondb_owner;

--
-- Name: notifications_notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE med.notifications_notification_id_seq OWNED BY med.notifications.notification_id;


--
-- Name: overdue_med; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med.overdue_med (
    overdue_id integer NOT NULL,
    med_id integer NOT NULL,
    dispense_status boolean DEFAULT false NOT NULL,
    patient_id integer,
    med_sid integer,
    "time" timestamp without time zone DEFAULT now(),
    doctor_id integer DEFAULT 8,
    quantity integer
);


ALTER TABLE med.overdue_med OWNER TO neondb_owner;

--
-- Name: overdue_med_overdue_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE med.overdue_med_overdue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE med.overdue_med_overdue_id_seq OWNER TO neondb_owner;

--
-- Name: overdue_med_overdue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE med.overdue_med_overdue_id_seq OWNED BY med.overdue_med.overdue_id;


--
-- Name: patient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med.patient (
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
    last_name_eng character varying(100) DEFAULT ''::character varying NOT NULL,
    photo character varying(100)
);


ALTER TABLE med.patient OWNER TO neondb_owner;

--
-- Name: patient_address; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med.patient_address (
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


ALTER TABLE med.patient_address OWNER TO neondb_owner;

--
-- Name: patient_address_address_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE med.patient_address_address_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE med.patient_address_address_id_seq OWNER TO neondb_owner;

--
-- Name: patient_address_address_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE med.patient_address_address_id_seq OWNED BY med.patient_address.address_id;


--
-- Name: rad_registry; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med.rad_registry (
    rad_id integer NOT NULL,
    med_id integer NOT NULL,
    patient_id integer NOT NULL,
    description text NOT NULL,
    acceptance boolean DEFAULT false NOT NULL,
    acceptance_time timestamp without time zone,
    specimen text,
    pathogenic text,
    indications text,
    indications_criteria text,
    submission_time timestamp without time zone,
    accept_by integer DEFAULT 10
);


ALTER TABLE med.rad_registry OWNER TO neondb_owner;

--
-- Name: rad_regisrty_rad_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE med.rad_regisrty_rad_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE med.rad_regisrty_rad_id_seq OWNER TO neondb_owner;

--
-- Name: rad_regisrty_rad_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE med.rad_regisrty_rad_id_seq OWNED BY med.rad_registry.rad_id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med.roles (
    role_id integer DEFAULT 0 NOT NULL,
    role_name text NOT NULL,
    role_name_th character varying(50),
    role_name_en character varying(50)
);


ALTER TABLE med.roles OWNER TO neondb_owner;

--
-- Name: sticker_form; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med.sticker_form (
    stk_id integer NOT NULL,
    fstk_form text
);


ALTER TABLE med.sticker_form OWNER TO neondb_owner;

--
-- Name: sticker_form_stk_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE med.sticker_form_stk_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE med.sticker_form_stk_id_seq OWNER TO neondb_owner;

--
-- Name: sticker_form_stk_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE med.sticker_form_stk_id_seq OWNED BY med.sticker_form.stk_id;


--
-- Name: sub_warehouse; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med.sub_warehouse (
    sub_warehouse_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true
);


ALTER TABLE med.sub_warehouse OWNER TO neondb_owner;

--
-- Name: sub_warehouse_sub_warehouse_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE med.sub_warehouse_sub_warehouse_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE med.sub_warehouse_sub_warehouse_id_seq OWNER TO neondb_owner;

--
-- Name: sub_warehouse_sub_warehouse_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE med.sub_warehouse_sub_warehouse_id_seq OWNED BY med.sub_warehouse.sub_warehouse_id;


--
-- Name: temp_humidity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med.temp_humidity (
    "time" timestamp without time zone NOT NULL,
    tempetature double precision NOT NULL,
    humidity double precision NOT NULL
);


ALTER TABLE med.temp_humidity OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE med.users (
    uid integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    role_id integer NOT NULL
);


ALTER TABLE med.users OWNER TO neondb_owner;

--
-- Name: users_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE med.users_uid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE med.users_uid_seq OWNER TO neondb_owner;

--
-- Name: users_uid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE med.users_uid_seq OWNED BY med.users.uid;


--
-- Name: adr_registry adr_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.adr_registry ALTER COLUMN adr_id SET DEFAULT nextval('med.adr_registry_adr_id_seq'::regclass);


--
-- Name: allergy_registry allr_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.allergy_registry ALTER COLUMN allr_id SET DEFAULT nextval('med.allergy_registry_allr_id_seq'::regclass);


--
-- Name: error_medication err_med_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.error_medication ALTER COLUMN err_med_id SET DEFAULT nextval('med.error_medication_err_med_id_seq'::regclass);


--
-- Name: expired_medicines expired_med_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.expired_medicines ALTER COLUMN expired_med_id SET DEFAULT nextval('med.expired_medicines_expired_med_id_seq'::regclass);


--
-- Name: med_cut_off_period med_period_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_cut_off_period ALTER COLUMN med_period_id SET DEFAULT nextval('med.med_cut_off_period_med_period_id_seq'::regclass);


--
-- Name: med_delivery delivery_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_delivery ALTER COLUMN delivery_id SET DEFAULT nextval('med.med_delivery_delivery_id_seq'::regclass);


--
-- Name: med_evaluation me_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_evaluation ALTER COLUMN me_id SET DEFAULT nextval('med.med_evaluation_me_id_seq'::regclass);


--
-- Name: med_interaction interaction_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_interaction ALTER COLUMN interaction_id SET DEFAULT nextval('med.med_interaction_interacton_id_seq'::regclass);


--
-- Name: med_order_history history_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_order_history ALTER COLUMN history_id SET DEFAULT nextval('med.med_order_history_history_id_seq'::regclass);


--
-- Name: med_order_rights med_rights_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_order_rights ALTER COLUMN med_rights_id SET DEFAULT nextval('med.med_order_rights_med_rights_id_seq'::regclass);


--
-- Name: med_problem mp_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_problem ALTER COLUMN mp_id SET DEFAULT nextval('med.med_probolem_mp_id_seq'::regclass);


--
-- Name: med_requests request_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_requests ALTER COLUMN request_id SET DEFAULT nextval('med.med_requests_request_id_seq'::regclass);


--
-- Name: med_stock_history history_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_stock_history ALTER COLUMN history_id SET DEFAULT nextval('med.med_stock_history_history_id_seq'::regclass);


--
-- Name: med_subwarehouse med_sid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_subwarehouse ALTER COLUMN med_sid SET DEFAULT nextval('med.med_subwarehouse_med_sid_seq'::regclass);


--
-- Name: med_table med_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_table ALTER COLUMN med_id SET DEFAULT nextval('med.med_table_med_id_seq'::regclass);


--
-- Name: med_usage usage_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_usage ALTER COLUMN usage_id SET DEFAULT nextval('med.med_usage_usage_id_seq'::regclass);


--
-- Name: medicine_order order_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.medicine_order ALTER COLUMN order_id SET DEFAULT nextval('med.medicine_order_order_id_seq'::regclass);


--
-- Name: medicines_TEST med_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med."medicines_TEST" ALTER COLUMN med_id SET DEFAULT nextval('med.medicines_med_id_seq'::regclass);


--
-- Name: noti_rules rule_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.noti_rules ALTER COLUMN rule_id SET DEFAULT nextval('med.noti_rules_rule_id_seq'::regclass);


--
-- Name: notification_log log_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.notification_log ALTER COLUMN log_id SET DEFAULT nextval('med.notification_log_log_id_seq'::regclass);


--
-- Name: notifications notification_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.notifications ALTER COLUMN notification_id SET DEFAULT nextval('med.notifications_notification_id_seq'::regclass);


--
-- Name: overdue_med overdue_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.overdue_med ALTER COLUMN overdue_id SET DEFAULT nextval('med.overdue_med_overdue_id_seq'::regclass);


--
-- Name: patient_address address_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.patient_address ALTER COLUMN address_id SET DEFAULT nextval('med.patient_address_address_id_seq'::regclass);


--
-- Name: rad_registry rad_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.rad_registry ALTER COLUMN rad_id SET DEFAULT nextval('med.rad_regisrty_rad_id_seq'::regclass);


--
-- Name: sticker_form stk_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.sticker_form ALTER COLUMN stk_id SET DEFAULT nextval('med.sticker_form_stk_id_seq'::regclass);


--
-- Name: sub_warehouse sub_warehouse_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.sub_warehouse ALTER COLUMN sub_warehouse_id SET DEFAULT nextval('med.sub_warehouse_sub_warehouse_id_seq'::regclass);


--
-- Name: users uid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.users ALTER COLUMN uid SET DEFAULT nextval('med.users_uid_seq'::regclass);


--
-- Data for Name: adr_registry; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY med.adr_registry (adr_id, med_id, patient_id, description, reported_at, severity, outcome, reporter_id, notes, symptoms) FROM stdin;
1	15	1	ผู้ป่วยมีผื่นและลมพิษขึ้นหลังจากทานยา	2025-08-25 10:00:00	Mild	Recovered	10	แนะนำให้หยุดยาและติดตามอาการ	ผื่นขึ้น, ลมพิษ
2	22	2	ปวดหัวและเวียนศีรษะอย่างรุนแรงภายในหนึ่งชั่วโมงหลังจากทานยาครั้งแรก	2025-08-25 11:30:00	Moderate	Recovering	10	แนะนำให้ผู้ป่วยพักผ่อนและสังเกตอาการ	ปวดหัว, เวียนศีรษะ
3	5	3	มีอาการคลื่นไส้และไม่สบายท้องเล็กน้อย อาการหายไปในไม่กี่ชั่วโมง	2025-08-25 12:15:00	Mild	Recovered	10	แนะนำให้ผู้ป่วยทานยาพร้อมอาหาร	คลื่นไส้, ปวดท้อง
4	10	4	ผู้ป่วยมีอาการตามัวและสับสน ต้องเข้ารับการรักษาในโรงพยาบาลเพื่อสังเกตอาการ	2025-08-25 14:45:00	Severe	Not Recovered	10	แจ้งครอบครัวของผู้ป่วยเกี่ยวกับอาการไม่พึงประสงค์	ตามัว, สับสน
5	3	5	แพ้ยาเล็กน้อย มีอาการตาแดงเล็กน้อย	2025-08-25 15:20:00	Mild	Recovered	10	แนะนำให้ใช้ยาหยอดตาสำหรับอาการแพ้	ตาแดง
6	18	6	หัวใจเต้นเร็วและหายใจถี่ ผู้ป่วยถูกส่งตัวไปยังห้องฉุกเฉิน	2025-08-25 16:50:00	Severe	Recovering	10	ติดต่อแพทย์เพื่อขอคำปรึกษาเพิ่มเติม	หัวใจเต้นเร็ว, หายใจถี่
7	2	7	มีไข้และหนาวสั่น 2 วันหลังจากเริ่มยาตัวใหม่	2025-08-25 17:05:00	Moderate	Recovering	10	แนะนำให้ผู้ป่วยทานยาลดไข้	ไข้, หนาวสั่น
8	25	8	ไม่มีอาการไม่พึงประสงค์ รายงานนี้เป็นการป้องกันไว้ก่อน	2025-08-25 18:30:00	Mild	Not Applicable	10	ได้รับรายงานจากผู้ป่วยในการติดตามผลตามปกติ	
9	8	9	ปากแห้งและอ่อนเพลีย ผู้ป่วยบ่นว่าอาการส่งผลกระทบต่อชีวิตประจำวัน	2025-08-25 19:10:00	Moderate	Recovering	10	แนะนำให้ผู้ป่วยดื่มน้ำและพักผ่อนให้เพียงพอ	ปากแห้ง, อ่อนเพลีย
10	12	10	ผู้ป่วยกระสับกระส่ายและก้าวร้าวมาก จำเป็นต้องได้รับความช่วยเหลือทางจิตใจ	2025-08-25 20:40:00	Severe	Not Recovered	10	ส่งต่อเคสไปยังผู้เชี่ยวชาญ	กระสับกระส่าย, ก้าวร้าว
11	23	3	jrjdtj	2025-08-25 22:54:37.831472	Severe	Unknown	10	hgjhjgj	thjtfjtj
12	3	2	แพ้	2025-08-26 21:51:16.606633	Severe	Unknown	10	เเเเเ	---หอพได
13	9	5	ิิ	2025-08-27 02:55:09.64642	Moderate	Recovered	10		ิกหดห
14	1	9	กดิกอห	2025-08-28 01:23:46.018509	Severe	Recovered	10	ฟฟฟ	แฆฤฉฤฏฆฮ
\.


--
-- Data for Name: allergy_registry; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY med.allergy_registry (allr_id, med_id, patient_id, symptoms, description, severity, reported_at, created_at, updated_at) FROM stdin;
13	3	3	หายใจติดขัด	\N	mild	2023-11-30 20:17:22.353103	2023-11-30 20:17:22.353103	2023-11-30 20:17:22.353103
14	4	4	หน้าบวม ตาบวม	\N	mild	2024-04-12 20:17:22.353103	2024-04-12 20:17:22.353103	2024-04-12 20:17:22.353103
16	6	6	คันผิวหนัง ผื่นลมพิษ	\N	mild	2023-12-16 20:17:22.353103	2023-12-16 20:17:22.353103	2023-12-16 20:17:22.353103
17	7	7	ปวดท้อง ท้องเสีย	\N	mild	2025-03-07 20:17:22.353103	2025-03-07 20:17:22.353103	2025-03-07 20:17:22.353103
19	9	9	มีไข้ หนาวสั่น	\N	mild	2024-08-22 20:17:22.353103	2024-08-22 20:17:22.353103	2024-08-22 20:17:22.353103
12	2	20	เวียนศีรษะ คลื่นไส้	\N	mild	2025-05-04 20:17:22.353103	2025-05-04 20:17:22.353103	2025-05-04 20:17:22.353103
15	5	11	แน่นหน้าอก หายใจลำบาก	\N	mild	2024-05-19 20:17:22.353103	2024-05-19 20:17:22.353103	2024-05-19 20:17:22.353103
18	8	16	บวมริมฝีปาก คันคอ	\N	mild	2024-06-25 20:17:22.353103	2024-06-25 20:17:22.353103	2024-06-25 20:17:22.353103
20	10	5	ช็อคหมดสติ	\N	mild	2023-11-06 20:17:22.353103	2023-11-06 20:17:22.353103	2023-11-06 20:17:22.353103
21	13	1	อาเจียน	\N	mild	2024-02-04 20:17:22.353103	2024-02-04 20:17:22.353103	2024-02-04 20:17:22.353103
11	1	1	ผื่นแดง คัน	\N	severe	2024-08-18 20:17:22.353103	2024-08-18 20:17:22.353103	2024-08-18 20:17:22.353103
22	26	6	ตาย	-	severe	2025-08-24 13:26:00	2025-08-24 20:26:43.499715	2025-08-24 20:26:43.499715
24	17	17	ออออ		moderate	2025-08-24 21:40:32.110617	2025-08-24 21:40:32.110617	2025-08-24 21:40:32.110617
\.


--
-- Data for Name: error_medication; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY med.error_medication (err_med_id, "time", patient_id, doctor_id, med_id, description, resolved, created_at, updated_at, med_sid) FROM stdin;
1	2025-06-15 10:29:07.723	1	0	6	ดดดด	f	2025-06-15 17:29:11.594578	2025-06-15 17:29:11.594578	\N
2	2025-06-15 10:29:34.023	1	0	4	อะไร	f	2025-06-15 17:29:39.621145	2025-06-15 17:29:39.621145	\N
3	2025-06-16 08:41:53.282	2	0	3	nnn	f	2025-06-16 15:41:55.902327	2025-06-16 15:41:55.902327	\N
4	2025-06-16 08:45:53.971	8	0	16	,,,,	f	2025-06-16 15:45:56.931617	2025-06-16 15:45:56.931617	\N
5	2025-06-16 09:12:41.704	10	0	19	llllllllll	f	2025-06-16 16:12:45.998588	2025-06-16 16:12:45.998588	\N
6	2025-06-19 18:05:08.344	1	0	2		f	2025-06-20 01:05:11.486744	2025-06-20 01:05:11.486744	\N
7	2025-08-18 16:42:53.589	9	0	9	---	f	2025-08-18 23:42:56.696375	2025-08-18 23:42:56.696375	\N
8	2025-08-18 16:44:54.191	9	0	27	cc	f	2025-08-18 23:44:56.861775	2025-08-18 23:44:56.861775	\N
14	2025-08-21 04:13:30.154	1	0	256	fff	f	2025-08-21 11:13:32.916558	2025-08-21 11:13:32.916558	\N
17	2025-08-22 15:55:50.649	1	10	30	คว*	f	2025-08-22 22:55:56.181639	2025-08-22 22:55:56.181639	\N
15	2025-08-21 04:40:40.921	1	0	14	ะะะ	f	2025-08-21 11:40:59.346202	2025-08-21 11:40:59.346202	\N
16	2025-08-21 05:20:30.569	1	0	14	ืืื	f	2025-08-21 12:20:33.653081	2025-08-21 12:20:33.653081	\N
19	2025-08-25 22:54:00.375929	10	10	1	ยาหมดอายุ	f	2025-08-25 22:54:00.375929	2025-08-25 22:54:00.375929	\N
18	2025-08-25 14:18:20.206	4	10	11	จ่ายยาผิดตัว	f	2025-08-25 21:18:41.320766	2025-08-25 21:18:41.320766	\N
20	2025-08-26 21:50:49.868723	2	10	3	ไรวะ	f	2025-08-26 21:50:49.868723	2025-08-26 21:50:49.868723	234
21	2025-08-27 02:55:31.456468	5	10	9	ิิ	f	2025-08-27 02:55:31.456468	2025-08-27 02:55:31.456468	247
22	2025-08-27 02:58:35.616139	5	10	9	vv	f	2025-08-27 02:58:35.616139	2025-08-27 02:58:35.616139	247
23	2025-08-28 01:23:29.926951	9	10	1	กกก	f	2025-08-28 01:23:29.926951	2025-08-28 01:23:29.926951	230
\.


--
-- Data for Name: expired_medicines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY med.expired_medicines (expired_med_id, med_sid, med_id, status, moved_at) FROM stdin;
1	295	12	pending	2025-08-23 15:17:08.403019+07
2	298	10	pending	2025-08-23 15:29:20.034011+07
3	297	14	pending	2025-08-24 00:00:00.07332+07
4	269	22	pending	2025-08-25 19:15:55.083241+07
5	281	28	pending	2025-08-26 00:09:07.325444+07
6	286	23	pending	2025-08-26 21:37:21.687282+07
\.


--
-- Data for Name: med_cut_off_period; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY med.med_cut_off_period (med_period_id, period_day, period_month, period_time_h, period_time_m, sub_warehouse_id, is_active, created_at, updated_at) FROM stdin;
21	1	8	0	0	2	t	2025-08-17 21:17:22.376727	2025-08-25 23:41:57.887499
16	10	9	9	10	1	t	2025-06-13 14:38:34.509613	2025-08-19 00:13:20.64922
\.


--
-- Data for Name: med_delivery; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY med.med_delivery (delivery_id, patient_id, delivery_date, delivery_method, receiver_name, receiver_phone, address, note, status, medicine_list, doctor_id, created_at) FROM stdin;
30	5	\N	จัดส่งถึงบ้าน	ปกรณ์ รุ่งเรือง	0834455667	88 หมู่ 1 ถนนรังสิต-นครนายก, ตำบลคลองหลวง, อำเภอคลองหลวง, จังหวัดปทุมธานี 12120		pending	[{"med_id": 29, "med_sid": 283, "quantity": 1}, {"med_id": 10, "med_sid": 250, "quantity": 1}]	10	2025-08-24 18:06:33.541366
26	10	\N	รับที่โรงพยาบาล	วราภรณ์ เพียรดี	0889900112	35/7 หมู่ 4 ถนนกาญจนบุรี-ไทรโยค, ตำบลท่าม่วง, อำเภอท่าม่วง, จังหวัดกาญจนบุรี 71110		delivering	[{"med_id": 1, "quantity": 1}, {"med_id": 2, "quantity": 3}]	10	2025-08-09 11:01:16.817003
29	6	\N	จัดส่งด่วน	ชลธิชา สมสุข	0845566778	56/9 หมู่ null ถนนบรมราชชนนี, ตำบลศาลายา, อำเภอพุทธมณฑล, จังหวัดนครปฐม 73170		pending	[{"med_id": 23, "med_sid": 270, "quantity": 4}]	10	2025-08-24 18:06:00.443105
27	15	2025-08-23 20:59:51.299467	รับที่โรงพยาบาล	อนุชา สืบสกุล	0956789012	89 หมู่ 2 ถนนกาญจนวนิช, ตำบลหาดใหญ่, อำเภอหาดใหญ่, จังหวัดสงขลา 90110	ddd	delivered	[{"med_id": 22, "med_sid": 269, "quantity": 1}, {"med_id": 1, "med_sid": 230, "quantity": 1}, {"med_id": 2, "med_sid": 232, "quantity": 1}]	10	2025-08-23 19:59:51.299467
32	19	2025-08-28 03:46:17.153263	จัดส่งถึงบ้าน	ประวิทย์ โสภณ	0990123456	18/6 หมู่ 7 ถนนมิตรภาพ, ตำบลปากช่อง, อำเภอปากช่อง, จังหวัดนครราชสีมา 30130	-	delivered	[{"med_id": 1, "med_sid": 229, "quantity": 3}, {"med_id": 3, "med_sid": 234, "quantity": 4}]	10	2025-08-28 01:39:05.47378
31	9	\N		เกรียงไกร เกษมสุข	0878899001	78/3 หมู่ null ถนนบายพาส-ชลบุรี, ตำบลศรีราชา, อำเภอศรีราชา, จังหวัดชลบุรี 20110		pending	[{"med_id": 1, "med_sid": 230, "quantity": 1}, {"med_id": 13, "med_sid": 253, "quantity": 5}]	10	2025-08-28 00:10:13.316187
\.


--
-- Data for Name: med_evaluation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY med.med_evaluation (me_id, med_id, description) FROM stdin;
\.


--
-- Data for Name: med_interaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY med.med_interaction (interaction_id, med_id_1, med_id_2, description, severity, evidence_level, source_reference, created_at, updated_at, is_active, interaction_type) FROM stdin;
2	3	4	Concurrent use of Amoxicillin and Aspirin may increase the chance of allergic reactions.	Moderate	Case Report	https://pubmed.ncbi.nlm.nih.gov/234567	2025-05-27 14:10:12.856418	2025-05-27 14:10:12.856418	t	\N
6	5	20	Cetirizine and Ranitidine may interact to increase central nervous system depression in sensitive patients.	Mild	Case reports	ClinPharm Reference v2.3	2025-05-28 16:15:55.829228	2025-05-28 16:15:55.829228	t	\N
7	25	17	Using Metoprolol with Amlodipine may lead to additive effects in reducing blood pressure and heart rate.	Moderate	Hospital data review	Internal Medicine Journal 2021	2025-05-28 16:15:55.829228	2025-05-28 16:15:55.829228	t	\N
8	13	29	Fluoxetine may inhibit the metabolism of Simvastatin, increasing the risk of statin-induced side effects.	Moderate	Pharmacokinetic studies	JAMA 2020; 324(5): 482–490	2025-05-28 16:15:55.829228	2025-05-28 16:15:55.829228	t	\N
9	19	7	Combining Spironolactone with Losartan can increase the risk of hyperkalemia.	Severe	Clinical observations	British Medical Journal, Vol. 375	2025-05-28 16:15:55.829228	2025-05-28 16:15:55.829228	t	\N
3	5	6	Cetirizine with Metformin has no known severe interaction but monitor for dizziness.	Mild	Expert Opinion		2025-05-27 14:10:12.856418	2025-05-27 14:10:12.856418	t	\N
10	15	21	Concurrent use of Enalapril and Allopurinol may increase the risk of hypersensitivity reactions.	Moderate	Drug safety advisory	FDA Drug Interaction Bulletin Q3-2022	2025-05-28 16:15:55.829228	2025-05-28 16:15:55.829228	t	\N
23	10	1	cccc	\N	\N	\N	2025-05-28 18:19:48.662784	2025-05-28 18:19:48.662784	t	\N
1	1	2	Paracetamol may increase the risk of gastrointestinal bleeding when used with Ibuprofen.	Moderate	Clinical Trial	https://pubmed.ncbi.nlm.nih.gov/123456	2025-05-27 14:10:12.856418	2025-08-17 02:49:42.056803	t	incompatible
26	13	1	wsgvwsdves	Moderate	egewefcs		2025-06-20 20:19:46.919909	2025-06-20 20:19:46.919909	f	compatible
\.


--
-- Data for Name: med_order_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY med.med_order_history (history_id, "time", patient_id, description, medicines, doctor_id, dispense_doc_id) FROM stdin;
5	2025-04-05 22:21:31.626757	15	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 8, "quantity": 4}, {"med_id": 15, "quantity": 4}, {"med_id": 20, "quantity": 3}, {"med_id": 13, "quantity": 1}, {"med_id": 3, "quantity": 4}]	10	8
6	2025-04-05 22:23:12.335047	14	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 3, "quantity": 2}, {"med_id": 30, "quantity": 4}, {"med_id": 14, "quantity": 3}, {"med_id": 22, "quantity": 5}, {"med_id": 23, "quantity": 2}]	10	8
7	2025-04-06 09:42:22.859126	14	มีอาการท้องเสียและปวดท้อง	[{"med_id": 20, "quantity": 3}]	10	8
8	2025-04-06 11:01:45.006445	1	มีอาการท้องเสียและปวดท้อง	[{"med_id": 5, "quantity": 2}, {"med_id": 8, "quantity": 4}, {"med_id": 14, "quantity": 1}, {"med_id": 20, "quantity": 1}, {"med_id": 4, "quantity": 3}]	10	8
9	2025-04-14 11:50:03.342879	1	มีอาการท้องเสียและปวดท้อง	[{"med_id": 4, "quantity": 12}]	10	8
10	2025-04-16 12:52:31.397698	10	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 7, "quantity": 2}, {"med_id": 29, "quantity": 2}, {"med_id": 28, "quantity": 4}, {"med_id": 15, "quantity": 1}, {"med_id": 21, "quantity": 1}]	10	8
11	2025-04-28 21:18:56.588469	1	มีอาการไข้และปวดหัว	[{"med_id": 20, "quantity": 5}, {"med_id": 7, "quantity": 4}, {"med_id": 13, "quantity": 1}, {"med_id": 3, "quantity": 2}, {"med_id": 25, "quantity": 4}]	10	8
12	2025-04-29 01:34:18.76084	1	มีอาการไข้และปวดหัว	[{"med_id": 12, "quantity": 3}, {"med_id": 8, "quantity": 3}, {"med_id": 21, "quantity": 5}, {"med_id": 27, "quantity": 4}]	10	8
13	2025-04-29 01:35:34.830577	2	มีอาการท้องเสียและปวดท้อง	[{"med_id": 3, "quantity": 1}]	10	8
14	2025-04-29 01:39:15.901166	4	มีอาการไข้และปวดหัว	[{"med_id": 4, "quantity": 3}, {"med_id": 7, "quantity": 2}, {"med_id": 6, "quantity": 1}, {"med_id": 27, "quantity": 1}]	10	8
15	2025-04-29 01:40:15.822363	8	มีอาการไอและเจ็บคอ	[{"med_id": 5, "quantity": 3}, {"med_id": 10, "quantity": 4}, {"med_id": 16, "quantity": 5}, {"med_id": 18, "quantity": 2}, {"med_id": 23, "quantity": 3}]	10	8
16	2025-04-29 01:44:06.646946	1	มีอาการไข้และปวดหัว	[{"med_id": 13, "quantity": 4}, {"med_id": 19, "quantity": 5}, {"med_id": 20, "quantity": 4}, {"med_id": 5, "quantity": 3}, {"med_id": 26, "quantity": 3}]	10	8
17	2025-05-02 16:13:54.170077	6	มีอาการท้องเสียและปวดท้อง	[{"med_id": 6, "quantity": 1}, {"med_id": 22, "quantity": 1}, {"med_id": 25, "quantity": 2}, {"med_id": 16, "quantity": 2}]	10	8
18	2025-05-02 16:16:40.894024	1	มีอาการไอและเจ็บคอ	[{"med_id": 13, "quantity": 1}, {"med_id": 2, "quantity": 3}, {"med_id": 29, "quantity": 5}, {"med_id": 16, "quantity": 2}]	10	8
19	2025-05-24 21:23:22.737022	1	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 29, "quantity": 1}, {"med_id": 27, "quantity": 1}, {"med_id": 25, "quantity": 3}, {"med_id": 1, "quantity": 3}, {"med_id": 3, "quantity": 8}]	10	8
20	2025-05-24 21:30:13.813068	1	มีอาการไอและเจ็บคอ	[{"med_id": 29, "quantity": 1}, {"med_id": 27, "quantity": 1}, {"med_id": 25, "quantity": 3}, {"med_id": 1, "quantity": 3}, {"med_id": 3, "quantity": 8}, {"med_id": 3, "quantity": 4}]	10	8
21	2025-05-24 21:42:29.653726	1	มีอาการท้องเสียและปวดท้อง	[{"med_id": 23, "quantity": 2}, {"med_id": 30, "quantity": 1}, {"med_id": 16, "quantity": 1}, {"med_id": 6, "quantity": 2}, {"med_id": 2, "quantity": 5}]	10	8
22	2025-05-24 21:43:07.17409	2	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 16, "quantity": 3}, {"med_id": 27, "quantity": 2}]	10	8
47	2025-07-28 22:21:55.750439	1	มีอาการไอและเจ็บคอ	[{"med_id": 17, "quantity": 2}]	10	8
48	2025-08-06 15:05:15.21009	1	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 13, "quantity": 2}]	10	8
23	2025-05-24 23:06:11.22912	1	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 7, "quantity": 2}, {"med_id": 1, "quantity": 5}, {"med_id": 8, "quantity": 4}, {"med_id": 3, "quantity": 1}, {"med_id": 10, "quantity": 2}]	10	8
24	2025-05-24 23:23:49.123696	1	มีอาการท้องเสียและปวดท้อง	[{"med_id": 10, "quantity": 5}, {"med_id": 2, "quantity": 5}]	10	8
25	2025-05-24 23:28:35.917135	7	มีอาการไข้และปวดหัว	[{"med_id": 25, "quantity": 30}, {"med_id": 27, "quantity": 4}, {"med_id": 3, "quantity": 1}, {"med_id": 24, "quantity": 1}, {"med_id": 2, "quantity": 5}]	10	8
26	2025-05-25 14:26:50.759981	1	มีอาการท้องเสียและปวดท้อง	[{"med_id": 25, "quantity": 5}, {"med_id": 24, "quantity": 2}, {"med_id": 9, "quantity": 3}, {"med_id": 14, "quantity": 2}, {"med_id": 4, "quantity": 1}, {"med_id": 1, "quantity": 5}]	10	8
27	2025-05-25 14:26:53.674546	1	มีอาการท้องเสียและปวดท้อง	[{"med_id": 25, "quantity": 5}, {"med_id": 24, "quantity": 2}, {"med_id": 9, "quantity": 3}, {"med_id": 14, "quantity": 2}, {"med_id": 4, "quantity": 1}, {"med_id": 1, "quantity": 5}]	10	8
28	2025-05-25 14:30:38.122111	1	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 27, "quantity": 2}, {"med_id": 25, "quantity": 3}]	10	8
29	2025-05-25 14:30:43.403365	1	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 27, "quantity": 2}, {"med_id": 25, "quantity": 3}]	10	8
30	2025-05-25 14:32:52.586783	1	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 9, "quantity": 4}, {"med_id": 21, "quantity": 3}, {"med_id": 17, "quantity": 2}, {"med_id": 13, "quantity": 2}]	10	8
31	2025-05-25 14:32:58.87506	1	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 9, "quantity": 5}]	10	8
32	2025-05-25 14:35:39.446383	1	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 25, "quantity": 3}, {"med_id": 15, "quantity": 1}]	10	8
33	2025-05-25 14:45:37.327161	1	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 1, "quantity": 5}, {"med_id": 4, "quantity": 3}, {"med_id": 20, "quantity": 1}, {"med_id": 16, "quantity": 4}]	10	8
34	2025-05-25 21:10:38.804458	4	มีอาการไอและเจ็บคอ	[{"med_id": 2, "quantity": 3}, {"med_id": 27, "quantity": 5}, {"med_id": 15, "quantity": 2}, {"med_id": 19, "quantity": 3}, {"med_id": 18, "quantity": 2}]	10	8
35	2025-05-29 14:31:16.707209	1	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 3, "quantity": 2}, {"med_id": 16, "quantity": 1}, {"med_id": 4, "quantity": 5}, {"med_id": 15, "quantity": 2}]	10	8
36	2025-05-29 14:37:28.129107	1	มีอาการท้องเสียและปวดท้อง	[{"med_id": 5, "quantity": 5}, {"med_id": 12, "quantity": 2}, {"med_id": 28, "quantity": 1}]	10	8
37	2025-05-29 14:37:44.362278	1	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 1, "quantity": 5}]	10	8
38	2025-05-29 14:38:03.084018	1	มีอาการไข้และปวดหัว	[{"med_id": 13, "quantity": 4}, {"med_id": 8, "quantity": 5}, {"med_id": 23, "quantity": 5}, {"med_id": 14, "quantity": 4}, {"med_id": 19, "quantity": 4}]	10	8
39	2025-05-29 14:39:28.877131	1	มีอาการไข้และปวดหัว	[{"med_id": 6, "quantity": 1}, {"med_id": 15, "quantity": 1}]	10	8
40	2025-06-17 16:20:17.55527	1	มีอาการไข้และปวดหัว	[{"med_id": 29, "quantity": 5}, {"med_id": 27, "quantity": 5}, {"med_id": 16, "quantity": 3}, {"med_id": 5, "quantity": 4}, {"med_id": 17, "quantity": 3}]	10	8
41	2025-06-17 16:22:29.793559	1	มีอาการท้องเสียและปวดท้อง	[{"med_id": 22, "quantity": 5}]	10	8
42	2025-06-17 22:40:57.59018	1	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 17, "quantity": 2}, {"med_id": 16, "quantity": 3}]	10	8
43	2025-06-20 01:04:48.141892	1	มีอาการไอและเจ็บคอ	[{"med_id": 2, "quantity": 4}, {"med_id": 16, "quantity": 2}, {"med_id": 7, "quantity": 4}, {"med_id": 21, "quantity": 5}, {"med_id": 25, "quantity": 2}]	10	8
44	2025-06-21 08:53:33.143227	9	มีอาการท้องเสียและปวดท้อง	[{"med_id": 25, "quantity": 3}, {"med_id": 26, "quantity": 1}, {"med_id": 1, "quantity": 2}, {"med_id": 2, "quantity": 2}, {"med_id": 16, "quantity": 3}]	10	8
45	2025-07-19 19:58:34.305102	1	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 11, "quantity": 3}, {"med_id": 14, "quantity": 3}, {"med_id": 24, "quantity": 2}]	10	8
46	2025-07-28 22:21:25.722485	1	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 13, "quantity": 4}, {"med_id": 3, "quantity": 100}, {"med_id": 14, "quantity": 5}, {"med_id": 25, "quantity": 999}]	10	8
49	2025-08-08 11:58:26.759553	1	มีอาการไข้และปวดหัว	[{"med_id": 30, "quantity": 5}, {"med_id": 24, "quantity": 2}, {"med_id": 16, "quantity": 1}, {"med_id": 6, "quantity": 5}]	10	8
50	2025-08-08 13:07:39.952978	2	มีอาการไข้และปวดหัว	[{"med_id": 21, "quantity": 3}, {"med_id": 8, "quantity": 1}, {"med_id": 23, "quantity": 3}, {"med_id": 22, "quantity": 5}]	10	8
51	2025-08-08 13:15:24.695634	1	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 2, "quantity": 4}, {"med_id": 26, "quantity": 5}, {"med_id": 9, "quantity": 5}, {"med_id": 7, "quantity": 2}]	10	8
52	2025-08-08 18:31:59.657648	1	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 5, "quantity": 5}, {"med_id": 25, "quantity": 5}, {"med_id": 17, "quantity": 4}, {"med_id": 24, "quantity": 3}]	10	8
53	2025-08-08 18:32:10.551303	20	มีอาการไข้และปวดหัว	[{"med_id": 17, "quantity": 2}]	10	8
54	2025-08-08 20:40:30.544008	9	มีอาการท้องเสียและปวดท้อง	[{"med_id": 10, "quantity": 1}, {"med_id": 12, "quantity": 3}, {"med_id": 21, "quantity": 5}, {"med_id": 14, "quantity": 1}, {"med_id": 2, "quantity": 4}]	10	8
55	2025-08-11 18:34:49.968687	3	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 11, "quantity": 5}, {"med_id": 5, "quantity": 4}, {"med_id": 14, "quantity": 1}, {"med_id": 17, "quantity": 5}]	10	8
56	2025-08-11 19:05:13.685713	8	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 18, "quantity": 3}, {"med_id": 20, "quantity": 1}, {"med_id": 13, "quantity": 3}, {"med_id": 1, "quantity": 3}]	10	8
57	2025-08-12 10:30:37.021515	2	มีอาการไอและเจ็บคอ	[{"med_id": 26, "quantity": 2}]	10	8
58	2025-08-12 20:25:11.759178	1	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 1, "quantity": 3}, {"med_id": 21, "quantity": 2}, {"med_id": 9, "quantity": 3}, {"med_id": 8, "quantity": 2}, {"med_id": 26, "quantity": 5}]	10	8
59	2025-08-13 20:17:26.17614	1	มีอาการท้องเสียและปวดท้อง	[{"med_id": 22, "quantity": 2}]	10	8
60	2025-08-15 02:48:28.127392	1	มีอาการไข้และปวดหัว	[{"med_id": 11, "quantity": 3}, {"med_id": 20, "quantity": 5}]	10	8
61	2025-08-15 23:06:21.618682	5	มีอาการไอและเจ็บคอ	[{"med_id": 1, "quantity": 2}, {"med_id": 7, "quantity": 2}]	10	8
62	2025-08-18 04:52:35.869608	3	มีอาการไอและเจ็บคอ	[{"med_id": 5, "quantity": 4}, {"med_id": 25, "quantity": 3}, {"med_id": 17, "quantity": 1}, {"med_id": 22, "quantity": 1}, {"med_id": 27, "quantity": 3}]	10	8
63	2025-08-18 04:53:13.315865	2	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 1, "quantity": 4}, {"med_id": 6, "quantity": 3}, {"med_id": 5, "quantity": 1}]	10	8
64	2025-08-18 04:53:37.05287	1	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 20, "quantity": 1}, {"med_id": 29, "quantity": 1}]	10	8
65	2025-08-18 05:03:51.179975	3	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 25, "quantity": 4}, {"med_id": 2, "quantity": 7}]	10	8
66	2025-08-18 22:27:50.135102	1	มีอาการท้องเสียและปวดท้อง	[{"med_id": 2, "quantity": 4}, {"med_id": 13, "quantity": 4}, {"med_id": 19, "quantity": 5}, {"med_id": 14, "quantity": 4}]	10	8
67	2025-08-18 22:28:07.553976	5	มีอาการไข้และปวดหัว	[{"med_id": 1, "quantity": 4}, {"med_id": 16, "quantity": 4}]	10	8
68	2025-08-18 22:28:28.896975	9	มีอาการไข้และปวดหัว	[{"med_id": 27, "quantity": 4}, {"med_id": 7, "quantity": 2}, {"med_id": 26, "quantity": 5}, {"med_id": 9, "quantity": 2}, {"med_id": 12, "quantity": 2}]	10	8
69	2025-08-20 12:09:32.60976	2	มีอาการไอและเจ็บคอ	[{"med_id": 11, "quantity": 1}, {"med_id": 1, "quantity": 1}, {"med_id": 28, "quantity": 5}, {"med_id": 20, "quantity": 2}, {"med_id": 9, "quantity": 2}]	10	8
70	2025-08-20 23:24:13.133339	1	มีอาการท้องเสียและปวดท้อง	[{"med_id": 9, "quantity": 5}, {"med_id": 25, "quantity": 3}]	10	8
71	2025-08-21 09:20:01.504108	1	มีอาการท้องเสียและปวดท้อง	[{"med_id": 22, "quantity": 2}, {"med_id": 6, "quantity": 1}, {"med_id": 25, "quantity": 4}, {"med_id": 3, "quantity": 4}, {"med_id": 21, "quantity": 2}]	10	8
72	2025-08-21 09:21:51.575846	4	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 30, "quantity": 2}, {"med_id": 25, "quantity": 4}, {"med_id": 24, "quantity": 2}, {"med_id": 25, "quantity": 1}]	10	8
73	2025-08-21 09:29:48.97223	1	มีอาการท้องเสียและปวดท้อง	[{"med_id": 29, "quantity": 2}, {"med_id": 28, "quantity": 5}, {"med_id": 8, "quantity": 4}]	10	8
74	2025-08-21 09:37:44.265912	1	มีอาการไอและเจ็บคอ	[{"med_id": 9, "quantity": 3}, {"med_id": 28, "quantity": 1}, {"med_id": 26, "quantity": 5}, {"med_id": 30, "quantity": 10}]	10	8
75	2025-08-21 09:50:06.30193	3	มีอาการไอและเจ็บคอ	[{"med_id": 6, "quantity": 3}, {"med_id": 22, "quantity": 5}, {"med_id": 28, "quantity": 5}, {"med_id": 19, "quantity": 2}, {"med_id": 12, "quantity": 2}]	10	8
76	2025-08-21 10:13:39.688007	1	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 4, "quantity": 5}, {"med_id": 2, "quantity": 3}, {"med_id": 29, "quantity": 1}, {"med_id": 28, "quantity": 3}]	10	8
77	2025-08-21 10:27:35.443827	1	มีอาการไข้และปวดหัว	[{"med_id": 23, "med_sid": 270, "quantity": 3}, {"med_id": 24, "med_sid": 273, "quantity": 2}, {"med_id": 20, "med_sid": 264, "quantity": 3}]	10	8
78	2025-08-21 10:31:16.240384	1	มีอาการท้องเสียและปวดท้อง	[{"med_id": 8, "med_sid": 246, "quantity": 2}, {"med_id": 24, "med_sid": 272, "quantity": 4}, {"med_id": 26, "med_sid": 279, "quantity": 2}]	10	8
79	2025-08-21 10:36:57.931924	1	มีอาการท้องเสียและปวดท้อง	[{"med_id": 21, "med_sid": 265, "quantity": 3}]	10	8
80	2025-08-21 10:39:00.175254	1	มีอาการไข้และปวดหัว	[{"med_id": 1, "med_sid": 229, "quantity": 2}, {"med_id": 11, "med_sid": 251, "quantity": 2}, {"med_id": 7, "med_sid": 244, "quantity": 5}]	10	8
81	2025-08-21 10:46:53.787074	1	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 25, "med_sid": 276, "quantity": 5}]	10	8
82	2025-08-21 11:01:17.338122	1	มีอาการไอและเจ็บคอ	[{"med_id": 14, "med_sid": 256, "quantity": 1}, {"med_id": 21, "med_sid": 265, "quantity": 3}]	10	8
83	2025-08-21 12:22:44.282619	1	มีอาการท้องเสียและปวดท้อง	[{"med_id": 17, "med_sid": 260, "quantity": 4}, {"med_id": 4, "med_sid": 238, "quantity": 1}, {"med_id": 6, "med_sid": 243, "quantity": 1}, {"med_id": 26, "med_sid": 278, "quantity": 1}, {"med_id": 1, "med_sid": 231, "quantity": 3}]	10	8
84	2025-08-21 12:23:28.711805	1	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 9, "med_sid": 247, "quantity": 1}, {"med_id": 8, "med_sid": 246, "quantity": 2}, {"med_id": 6, "med_sid": 243, "quantity": 4}]	10	8
85	2025-08-21 12:23:34.474626	3	มีอาการไอและเจ็บคอ	[{"med_id": 3, "med_sid": 235, "quantity": 1}]	10	8
86	2025-08-21 18:02:40.835332	1	มีอาการไข้และปวดหัว	[{"med_id": 6, "med_sid": 243, "quantity": 5}, {"med_id": 29, "med_sid": 282, "quantity": 5}, {"med_id": 25, "med_sid": 276, "quantity": 1}, {"med_id": 16, "med_sid": 259, "quantity": 3}, {"med_id": 9, "med_sid": 248, "quantity": 4}]	10	8
87	2025-08-22 06:41:51.100059	10	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 1, "med_sid": 230, "quantity": 5}, {"med_id": 24, "med_sid": 271, "quantity": 2}]	10	8
88	2025-08-22 10:32:44.922139	1	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 30, "med_sid": 285, "quantity": 4}, {"med_id": 29, "med_sid": 284, "quantity": 2}, {"med_id": 3, "med_sid": 234, "quantity": 2}]	10	8
1	2025-04-04 23:09:43.999567	4	มีอาการท้องเสียและปวดท้อง	[{"med_id": 14, "quantity": 2}, {"med_id": 1, "quantity": 5}, {"med_id": 23, "quantity": 1}, {"med_id": 28, "quantity": 2}, {"med_id": 17, "quantity": 4}]	10	8
2	2025-04-04 23:10:13.229115	10	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 11, "quantity": 4}, {"med_id": 19, "quantity": 3}, {"med_id": 6, "quantity": 3}, {"med_id": 17, "quantity": 4}]	10	8
3	2025-04-05 20:51:59.375426	7	มีอาการท้องเสียและปวดท้อง	[{"med_id": 12, "quantity": 1}]	10	8
4	2025-04-05 22:19:24.091012	7	มีอาการท้องเสียและปวดท้อง	[{"med_id": 2, "quantity": 3}, {"med_id": 19, "quantity": 4}, {"med_id": 16, "quantity": 3}]	10	8
89	2025-08-22 22:33:31.425631	1	มีอาการไข้และปวดหัว	[{"med_id": 4, "med_sid": 236, "quantity": 2}, {"med_id": 27, "med_sid": 280, "quantity": 4}, {"med_id": 2, "med_sid": 232, "quantity": 5}, {"med_id": 14, "med_sid": 257, "quantity": 5}]	10	8
90	2025-08-23 09:58:11.400291	1	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 23, "med_sid": 270, "quantity": 5}, {"med_id": 26, "med_sid": 278, "quantity": 5}, {"med_id": 4, "med_sid": 238, "quantity": 2}, {"med_id": 4, "med_sid": 237, "quantity": 4}, {"med_id": 15, "med_sid": 258, "quantity": 4}]	10	8
91	2025-08-25 05:19:09.342577	1	มีอาการไอและเจ็บคอ	[{"med_id": 1, "med_sid": 230, "quantity": 3}, {"med_id": 25, "med_sid": 275, "quantity": 1}, {"med_id": 22, "med_sid": 268, "quantity": 2}, {"med_id": 16, "med_sid": 259, "quantity": 5}]	10	8
92	2025-08-25 12:30:12.163653	6	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 1, "med_sid": 231, "quantity": 5}, {"med_id": 22, "med_sid": 268, "quantity": 5}]	10	8
93	2025-08-25 12:30:47.404145	4	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 11, "med_sid": 251, "quantity": 5}, {"med_id": 1, "med_sid": 229, "quantity": 50}]	10	8
94	2025-08-25 22:49:50.573864	3	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 23, "med_sid": 270, "quantity": 4}, {"med_id": 1, "med_sid": 230, "quantity": 2}, {"med_id": 22, "med_sid": 269, "quantity": 1}, {"med_id": 26, "med_sid": 279, "quantity": 3}]	10	8
95	2025-08-26 10:07:58.45825	1	มีอาการไข้และปวดหัว	[{"med_id": 6, "med_sid": 243, "quantity": 4}]	10	8
96	2025-08-26 15:21:21.958477	4	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 21, "med_sid": 267, "quantity": 4}, {"med_id": 9, "med_sid": 249, "quantity": 1}, {"med_id": 6, "med_sid": 241, "quantity": 1}, {"med_id": 12, "med_sid": 252, "quantity": 1}, {"med_id": 28, "med_sid": 281, "quantity": 1}, {"med_id": 29, "med_sid": 283, "quantity": 1}]	10	8
97	2025-08-26 16:16:00.282471	2	มีอาการไข้และปวดหัว	[{"med_id": 3, "med_sid": 234, "quantity": 5}, {"med_id": 26, "med_sid": 277, "quantity": 1}, {"med_id": 13, "med_sid": 255, "quantity": 4}, {"med_id": 21, "med_sid": 267, "quantity": 4}]	10	8
98	2025-08-27 02:51:56.485724	1	มีอาการเหนื่อยล้าและนอนไม่หลับ	[{"med_id": 29, "med_sid": 284, "quantity": 1}, {"med_id": 5, "med_sid": 239, "quantity": 3}, {"med_id": 25, "med_sid": 276, "quantity": 2}]	10	8
99	2025-08-27 02:52:40.373464	3	มีอาการไอและเจ็บคอ	[{"med_id": 6, "med_sid": 243, "quantity": 3}, {"med_id": 1, "med_sid": 231, "quantity": 4}]	10	8
100	2025-08-27 02:53:03.597939	5	มีอาการไข้และปวดหัว	[{"med_id": 9, "med_sid": 247, "quantity": 4}, {"med_id": 1, "med_sid": 229, "quantity": 1}]	10	8
101	2025-08-27 10:26:21.050509	3	มีอาการท้องเสียและปวดท้อง	[{"med_id": 4, "med_sid": 237, "quantity": 2}, {"med_id": 30, "med_sid": 285, "quantity": 2}, {"med_id": 1, "med_sid": 229, "quantity": 64}]	10	8
102	2025-08-27 20:50:31.058379	1	มีอาการไข้และปวดหัว	[{"med_id": 3, "med_sid": 233, "quantity": 1}, {"med_id": 9, "med_sid": 248, "quantity": 2}, {"med_id": 26, "med_sid": 278, "quantity": 5}, {"med_id": 14, "med_sid": 256, "quantity": 3}]	10	8
\.


--
-- Data for Name: med_order_rights; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY med.med_order_rights (med_rights_id, doctor_rights, dentist_rights, phamarcist_rights, psychohiatrist_rights) FROM stdin;
\.


--
-- Data for Name: med_problem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY med.med_problem (mp_id, med_id, description, usage_id, problem_type, reported_by, reported_at, is_resolved) FROM stdin;
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

COPY med.med_requests (request_id, med_id, quantity, unit, requested_by, approved_by, status, request_time, approved_time, dispensed_time, note, created_at, updated_at, is_approve, origin, med_sid, is_added) FROM stdin;
23	25	20	เม็ด	8	8	dispensed	2025-06-20 18:26:35.633172	2025-06-21 18:26:35.633172	\N	ไม่ผ่านเกณฑ์	2025-06-23 18:26:35.633172	2025-08-27 11:56:52.835893	t	\N	\N	t
25	27	8	กล่อง	8	8	dispensed	2025-06-23 18:26:35.633172	\N	\N		2025-06-23 18:26:35.633172	2025-08-27 11:56:52.835893	t	\N	\N	t
26	18	12	แคปซูล	8	8	dispensed	2025-06-22 18:26:35.633172	2025-06-23 18:26:35.633172	\N		2025-06-23 18:26:35.633172	2025-08-27 11:56:52.835893	t	\N	\N	t
27	30	6	ขวด	8	8	dispensed	2025-06-18 18:26:35.633172	2025-06-19 18:26:35.633172	\N	ไม่ผ่านการตรวจสอบ	2025-06-23 18:26:35.633172	2025-08-27 11:56:52.835893	t	\N	\N	t
47	27	1	กล่อง	8	\N	dispensed	2025-08-18 15:11:42.925242	\N	\N		2025-08-18 15:11:42.925242	2025-08-27 11:56:52.835893	t	\N	\N	t
48	26	1	ขวด	8	\N	dispensed	2025-08-18 15:12:00.917464	\N	\N		2025-08-18 15:12:00.917464	2025-08-27 11:56:52.835893	t	\N	\N	t
49	22	6	กล่อง	8	\N	dispensed	2025-08-18 15:22:51.040005	\N	\N		2025-08-18 15:22:51.040005	2025-08-27 11:56:52.835893	t	\N	\N	t
50	28	7	กล่อง	8	\N	dispensed	2025-08-20 00:52:33.513617	\N	\N		2025-08-20 00:52:33.513617	2025-08-27 11:56:52.835893	t	\N	\N	t
51	26	1	ขวด	8	\N	dispensed	2025-08-20 00:55:40.765119	\N	\N		2025-08-20 00:55:40.765119	2025-08-27 11:56:52.835893	t	\N	\N	t
52	26	1	ขวด	8	\N	dispensed	2025-08-20 00:57:03.845968	\N	\N		2025-08-20 00:57:03.845968	2025-08-27 11:56:52.835893	t	\N	\N	t
53	26	1	ขวด	8	\N	dispensed	2025-08-20 00:57:08.929063	\N	\N		2025-08-20 00:57:08.929063	2025-08-27 11:56:52.835893	t	\N	\N	t
54	29	1	หลอด	8	\N	dispensed	2025-08-20 00:58:48.473579	\N	\N		2025-08-20 00:58:48.473579	2025-08-27 11:56:52.835893	t	\N	\N	t
66	30	5	หลอด	8	\N	dispensed	2025-08-21 09:46:53.45246	\N	\N		2025-08-21 09:46:53.45246	2025-08-27 11:56:52.835893	t	subwareshouse	\N	t
65	30	1000	หลอด	8	\N	dispensed	2025-08-21 09:44:24.655446	\N	\N		2025-08-21 09:44:24.655446	2025-08-27 11:56:52.835893	t	subwareshouse	\N	t
59	30	1	หลอด	8	\N	dispensed	2025-08-21 07:35:42.067501	\N	\N	อ	2025-08-21 07:35:42.067501	2025-08-27 11:56:52.835893	t	subwareshouse	\N	t
67	29	5	หลอด	8	\N	dispensed	2025-08-21 09:47:01.114441	\N	\N		2025-08-21 09:47:01.114441	2025-08-27 11:56:52.835893	t	subwareshouse	\N	t
60	29	1	หลอด	8	\N	dispensed	2025-08-21 07:37:17.22579	\N	\N	ใ	2025-08-21 07:37:17.22579	2025-08-27 11:56:52.835893	t	subwareshouse	\N	t
69	1	11	หลอด	8	\N	dispensed	2025-08-21 17:25:23.694001	\N	\N		2025-08-21 17:25:23.694001	2025-08-27 11:56:52.835893	t	subwareshouse	\N	t
75	3	300	ขวด	8	\N	pending	2025-08-27 11:59:34.831349	\N	\N		2025-08-27 11:59:34.831349	2025-08-27 12:00:00.025047	t	subwareshouse	233	t
74	23	200	หลอด	8	\N	pending	2025-08-27 11:59:14.271621	\N	\N		2025-08-27 11:59:14.271621	2025-08-27 12:00:00.025047	t	subwareshouse	286	t
68	29	1	หลอด	8	\N	pending	2025-08-21 09:47:07.147214	\N	\N		2025-08-21 09:47:07.147214	2025-08-21 09:47:07.147214	f	subwareshouse	\N	f
24	9	2	ขวด	8	8	dispensed	2025-06-19 18:26:35.633172	2025-06-20 18:26:35.633172	2025-06-21 18:26:35.633172	จ่ายแล้ว	2025-06-23 18:26:35.633172	2025-08-27 11:56:52.835893	t	\N	\N	t
28	6	3	หลอด	8	8	dispensed	2025-06-17 18:26:35.633172	2025-06-18 18:26:35.633172	2025-06-19 18:26:35.633172		2025-06-23 18:26:35.633172	2025-08-27 11:56:52.835893	t	\N	\N	t
30	13	4	กล่อง	8	8	dispensed	2025-06-21 18:26:35.633172	2025-06-22 18:26:35.633172	2025-06-23 18:26:35.633172		2025-06-23 18:26:35.633172	2025-08-27 11:56:52.835893	t	\N	\N	t
21	14	10	เม็ด	8	8	dispensed	2025-06-23 18:26:35.633172	\N	\N	รออนุมัติ	2025-06-23 18:26:35.633172	2025-08-27 11:56:52.835893	t	\N	\N	t
22	2	5	แคปซูล	8	8	dispensed	2025-06-21 18:26:35.633172	2025-06-22 18:26:35.633172	\N	อนุมัติแล้ว	2025-06-23 18:26:35.633172	2025-08-27 11:56:52.835893	t	\N	\N	t
76	22	50	กล่อง	8	\N	pending	2025-08-27 14:03:04.253714	\N	\N		2025-08-27 14:03:04.253714	2025-08-27 14:04:09.665059	t	subwareshouse	269	t
29	22	15	เม็ด	8	8	dispensed	2025-06-23 18:26:35.633172	\N	\N	ด่วน	2025-06-23 18:26:35.633172	2025-08-27 11:56:52.835893	t	\N	\N	t
32	1	100	capsule	8	\N	dispensed	2025-08-10 11:58:26.485921	\N	\N		2025-08-10 11:58:26.485921	2025-08-27 11:56:52.835893	t	\N	\N	t
34	1	3	aaaa	8	\N	dispensed	2025-08-10 12:18:17.959122	\N	\N		2025-08-10 12:18:17.959122	2025-08-27 11:56:52.835893	t	\N	\N	t
35	2	10000000	amp	8	\N	dispensed	2025-08-10 12:19:34.554223	\N	\N		2025-08-10 12:19:34.554223	2025-08-27 11:56:52.835893	t	\N	\N	t
36	2	100000	amp	8	\N	dispensed	2025-08-10 12:19:50.88031	\N	\N		2025-08-10 12:19:50.88031	2025-08-27 11:56:52.835893	t	\N	\N	t
37	4	1	amp	8	\N	dispensed	2025-08-10 12:20:01.304631	\N	\N		2025-08-10 12:20:01.304631	2025-08-27 11:56:52.835893	t	\N	\N	t
38	1	1	n	8	\N	dispensed	2025-08-10 12:20:36.628982	\N	\N		2025-08-10 12:20:36.628982	2025-08-27 11:56:52.835893	t	\N	\N	t
39	1	50	ซอง	8	\N	dispensed	2025-08-16 14:42:17.420652	\N	\N		2025-08-16 14:42:17.420652	2025-08-27 11:56:52.835893	t	\N	\N	t
40	30	12	หลอด	8	\N	dispensed	2025-08-16 16:39:30.646814	\N	\N		2025-08-16 16:39:30.646814	2025-08-27 11:56:52.835893	t	\N	\N	t
41	30	1	หลอด	8	\N	dispensed	2025-08-16 18:03:49.810981	\N	\N		2025-08-16 18:03:49.810981	2025-08-27 11:56:52.835893	t	\N	\N	t
42	30	3	หลอด	8	\N	dispensed	2025-08-18 05:10:23.786701	\N	\N		2025-08-18 05:10:23.786701	2025-08-27 11:56:52.835893	t	\N	\N	t
43	30	50	หลอด	8	\N	dispensed	2025-08-18 13:01:05.441176	\N	\N		2025-08-18 13:01:05.441176	2025-08-27 11:56:52.835893	t	\N	\N	t
44	29	100	หลอด	8	\N	dispensed	2025-08-18 13:30:45.147231	\N	\N		2025-08-18 13:30:45.147231	2025-08-27 11:56:52.835893	t	\N	\N	t
45	27	3	กล่อง	8	\N	dispensed	2025-08-18 15:01:52.639994	\N	\N		2025-08-18 15:01:52.639994	2025-08-27 11:56:52.835893	t	\N	\N	t
46	27	5	กล่อง	8	\N	dispensed	2025-08-18 15:05:14.106614	\N	\N		2025-08-18 15:05:14.106614	2025-08-27 11:56:52.835893	t	\N	\N	t
71	4	500	กล่อง	8	\N	pending	2025-08-27 11:50:02.514539	\N	\N		2025-08-27 11:50:02.514539	2025-08-27 11:50:02.514539	f	subwareshouse	236	f
55	27	1	กล่อง	8	\N	dispensed	2025-08-20 00:59:04.787905	\N	\N		2025-08-20 00:59:04.787905	2025-08-27 11:56:52.835893	t	\N	\N	t
56	25	3	หลอด	8	\N	dispensed	2025-08-20 00:59:15.844856	\N	\N		2025-08-20 00:59:15.844856	2025-08-27 11:56:52.835893	t	\N	\N	t
57	30	2	หลอด	8	\N	dispensed	2025-08-21 03:14:50.715782	\N	\N		2025-08-21 03:14:50.715782	2025-08-27 11:56:52.835893	t	\N	\N	t
64	30	2	หลอด	8	\N	dispensed	2025-08-21 08:41:01.391139	2025-08-17 23:50:11.513326	\N		2025-08-21 08:41:01.391139	2025-08-27 11:56:52.835893	t	subwareshouse	\N	t
72	4	200	กล่อง	8	\N	pending	2025-08-27 11:50:35.40117	\N	\N		2025-08-27 11:50:35.40117	2025-08-27 11:56:52.835893	t	subwareshouse	236	t
73	4	100	กล่อง	8	\N	pending	2025-08-27 11:50:55.182625	\N	\N		2025-08-27 11:50:55.182625	2025-08-27 11:56:52.835893	t	subwareshouse	236	t
\.


--
-- Data for Name: med_stock_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY med.med_stock_history (history_id, med_id, change_type, quantity_change, balance_after, reference_id, "time") FROM stdin;
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
90	26	dispense	-2	98	\N	2025-08-12 10:30:37.069156
91	1	dispense	-3	497	\N	2025-08-12 20:25:11.808007
92	21	dispense	-2	298	\N	2025-08-12 20:25:11.824984
93	9	dispense	-3	247	\N	2025-08-12 20:25:11.840025
94	8	dispense	-2	178	\N	2025-08-12 20:25:11.854631
95	26	dispense	-5	95	\N	2025-08-12 20:25:11.869231
96	22	dispense	-2	348	\N	2025-08-13 20:17:26.242136
97	11	dispense	-3	97	\N	2025-08-15 02:48:28.160034
98	20	dispense	-5	145	\N	2025-08-15 02:48:28.1794
99	1	dispense	-2	-2	\N	2025-08-15 23:06:21.644718
100	7	dispense	-2	-2	\N	2025-08-15 23:06:21.66274
101	25	dispense	-3	-3	\N	2025-08-18 04:52:35.924479
102	17	dispense	-1	-1	\N	2025-08-18 04:52:35.928864
103	27	dispense	-3	-3	\N	2025-08-18 04:52:35.932657
104	22	dispense	-1	-1	\N	2025-08-18 04:52:35.936483
105	5	dispense	-4	-4	\N	2025-08-18 04:52:35.955189
106	1	dispense	-4	-4	\N	2025-08-18 04:53:13.353027
107	5	dispense	-1	-1	\N	2025-08-18 04:53:13.357472
108	6	dispense	-3	-3	\N	2025-08-18 04:53:13.360111
109	20	dispense	-1	-1	\N	2025-08-18 04:53:37.117861
110	29	dispense	-1	-1	\N	2025-08-18 04:53:37.121573
111	25	dispense	-4	-4	\N	2025-08-18 05:03:51.213092
112	2	dispense	-7	-7	\N	2025-08-18 05:03:51.21769
113	2	dispense	-4	-4	\N	2025-08-18 22:27:50.205464
114	13	dispense	-4	-4	\N	2025-08-18 22:27:50.212854
115	19	dispense	-5	-5	\N	2025-08-18 22:27:50.215686
116	14	dispense	-4	-4	\N	2025-08-18 22:27:50.218041
117	1	dispense	-4	-4	\N	2025-08-18 22:28:07.572578
118	16	dispense	-4	-4	\N	2025-08-18 22:28:07.61816
119	27	dispense	-4	-4	\N	2025-08-18 22:28:28.947512
120	7	dispense	-2	-2	\N	2025-08-18 22:28:28.950081
121	26	dispense	-5	-5	\N	2025-08-18 22:28:28.954195
122	12	dispense	-2	-2	\N	2025-08-18 22:28:28.95697
123	9	dispense	-2	-2	\N	2025-08-18 22:28:28.960066
124	11	dispense	-1	-1	\N	2025-08-20 12:09:32.656632
125	1	dispense	-1	-1	\N	2025-08-20 12:09:32.661521
126	9	dispense	-2	-2	\N	2025-08-20 12:09:32.664046
127	28	dispense	-5	-5	\N	2025-08-20 12:09:32.666533
128	20	dispense	-2	-2	\N	2025-08-20 12:09:32.669278
129	29	dispense	-2	125	\N	2025-08-21 09:29:49.025387
130	28	dispense	-5	449	\N	2025-08-21 09:29:49.03169
131	8	dispense	-4	317	\N	2025-08-21 09:29:49.034786
132	9	dispense	-3	466	\N	2025-08-21 09:37:44.317903
133	26	dispense	-5	276	\N	2025-08-21 09:37:44.322627
134	30	dispense	-10	48	\N	2025-08-21 09:37:44.326725
135	28	dispense	-1	448	\N	2025-08-21 09:37:44.360771
136	6	dispense	-3	101	\N	2025-08-21 09:50:06.369925
137	19	dispense	-2	475	\N	2025-08-21 09:50:06.370472
138	22	dispense	-5	436	\N	2025-08-21 09:50:06.374808
139	28	dispense	-5	443	\N	2025-08-21 09:50:06.376492
140	12	dispense	-2	111	\N	2025-08-21 09:50:06.377323
141	4	dispense	-5	111	\N	2025-08-21 10:13:39.754633
142	29	dispense	-1	124	\N	2025-08-21 10:13:39.758573
143	2	dispense	-3	53	\N	2025-08-21 10:13:39.761247
144	28	dispense	-3	440	\N	2025-08-21 10:13:39.76371
145	23	dispense	-3	125	\N	2025-08-21 10:27:35.497797
146	24	dispense	-2	472	\N	2025-08-21 10:27:35.502516
147	20	dispense	-3	256	\N	2025-08-21 10:27:35.504985
148	8	dispense	-2	189	\N	2025-08-21 10:31:16.302716
149	24	dispense	-4	381	\N	2025-08-21 10:31:16.309065
150	26	dispense	-2	274	\N	2025-08-21 10:31:16.31235
151	21	dispense	-3	256	\N	2025-08-21 10:36:57.959169
152	1	dispense	-2	63	\N	2025-08-21 10:39:00.232835
153	11	dispense	-2	402	\N	2025-08-21 10:39:00.237082
154	7	dispense	-5	430	\N	2025-08-21 10:39:00.240233
155	25	dispense	-5	201	\N	2025-08-21 10:46:53.819635
156	14	dispense	-1	186	\N	2025-08-21 11:01:17.380691
157	21	dispense	-3	256	\N	2025-08-21 11:01:17.425862
158	4	dispense	-1	54	\N	2025-08-21 12:22:44.356841
159	26	dispense	-1	40	\N	2025-08-21 12:22:44.362237
160	6	dispense	-1	333	\N	2025-08-21 12:22:44.367197
161	1	dispense	-3	50	\N	2025-08-21 12:22:44.368405
162	17	dispense	-4	482	\N	2025-08-21 12:22:44.460926
163	9	dispense	-1	465	\N	2025-08-21 12:23:28.762011
164	8	dispense	-2	187	\N	2025-08-21 12:23:28.766581
165	6	dispense	-4	329	\N	2025-08-21 12:23:28.769391
166	3	dispense	-1	145	\N	2025-08-21 12:23:34.540252
167	6	dispense	-5	324	\N	2025-08-21 18:02:40.908374
168	16	dispense	-3	196	\N	2025-08-21 18:02:40.912455
169	29	dispense	-5	119	\N	2025-08-21 18:02:40.914898
170	25	dispense	-1	200	\N	2025-08-21 18:02:40.917001
171	9	dispense	-4	317	\N	2025-08-21 18:02:40.919136
172	24	dispense	-2	246	\N	2025-08-22 06:41:51.179463
173	1	dispense	-5	114	\N	2025-08-22 06:41:51.180455
174	30	dispense	-4	44	\N	2025-08-22 10:32:44.978997
175	3	dispense	-2	214	\N	2025-08-22 10:32:44.98432
176	29	dispense	-2	392	\N	2025-08-22 10:32:45.012602
177	4	dispense	-2	215	\N	2025-08-22 22:33:31.504102
178	14	dispense	-5	247	\N	2025-08-22 22:33:31.510511
179	27	dispense	-4	353	\N	2025-08-22 22:33:31.513082
180	2	dispense	-5	48	\N	2025-08-22 22:33:31.515922
181	23	dispense	-5	120	\N	2025-08-23 09:58:11.474291
182	15	dispense	-4	313	\N	2025-08-23 09:58:11.479333
183	26	dispense	-5	35	\N	2025-08-23 09:58:11.481596
184	4	dispense	-2	52	\N	2025-08-23 09:58:11.484227
185	4	dispense	-4	107	\N	2025-08-23 09:58:11.487259
187	22	dispense	-2	247	\N	2025-08-25 05:19:09.395521
186	25	dispense	-1	464	\N	2025-08-25 05:19:09.395051
188	16	dispense	-5	191	\N	2025-08-25 05:19:09.401958
189	1	dispense	-3	111	\N	2025-08-25 05:19:09.536421
190	22	dispense	-5	242	\N	2025-08-25 12:30:12.215054
191	1	dispense	-5	45	\N	2025-08-25 12:30:12.242366
192	11	dispense	-5	397	\N	2025-08-25 12:30:47.444546
193	1	dispense	-50	13	\N	2025-08-25 12:30:47.449922
194	23	dispense	-4	116	\N	2025-08-25 22:49:50.645029
195	26	dispense	-3	271	\N	2025-08-25 22:49:50.648717
196	1	dispense	-2	109	\N	2025-08-25 22:49:50.649846
197	22	dispense	-1	435	\N	2025-08-25 22:49:50.65314
198	6	dispense	-4	320	\N	2025-08-26 10:07:58.527371
199	21	dispense	-4	473	\N	2025-08-26 15:21:22.04679
200	28	dispense	-1	439	\N	2025-08-26 15:21:22.051571
201	9	dispense	-1	236	\N	2025-08-26 15:21:22.054338
202	6	dispense	-1	153	\N	2025-08-26 15:21:22.056529
203	29	dispense	-1	273	\N	2025-08-26 15:21:22.059454
204	12	dispense	-1	110	\N	2025-08-26 15:21:22.063431
205	3	dispense	-5	209	\N	2025-08-26 16:16:00.344661
206	26	dispense	-1	230	\N	2025-08-26 16:16:00.348763
207	21	dispense	-4	469	\N	2025-08-26 16:16:00.350956
208	13	dispense	-4	270	\N	2025-08-26 16:16:00.353529
209	29	dispense	-1	393	\N	2025-08-27 02:51:56.546603
210	5	dispense	-3	303	\N	2025-08-27 02:51:56.547732
211	25	dispense	-2	204	\N	2025-08-27 02:51:56.552733
212	6	dispense	-3	331	\N	2025-08-27 02:52:40.409226
213	1	dispense	-4	49	\N	2025-08-27 02:52:40.466011
214	9	dispense	-4	465	\N	2025-08-27 02:53:03.633484
215	1	dispense	-1	64	\N	2025-08-27 02:53:03.636413
216	30	dispense	-2	56	\N	2025-08-27 10:26:21.116228
217	1	dispense	-64	0	\N	2025-08-27 10:26:21.12198
218	4	dispense	-2	114	\N	2025-08-27 10:26:21.148759
219	9	dispense	-2	321	\N	2025-08-27 20:50:31.120789
220	3	dispense	-1	299	\N	2025-08-27 20:50:31.121676
221	26	dispense	-5	40	\N	2025-08-27 20:50:31.126819
222	14	dispense	-3	194	\N	2025-08-27 20:50:31.127572
\.


--
-- Data for Name: med_subwarehouse; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY med.med_subwarehouse (med_sid, med_id, med_quantity, packaging_type, is_divisible, location, created_at, updated_at, med_showname, min_quantity, max_quantity, cost_price, unit_price, med_showname_eng, mfg_date, exp_date, is_expired) FROM stdin;
244	7	435	หลอด	t	Cabinet C	2025-08-16 12:00:00	2025-08-26 21:26:17.331387	โลซาร์แทน 50mg หลอด 10 เม็ด	10	1000	3.50	7.00	Losartan 50mg Tube 10 Tablets	2025-08-16	2026-02-23	f
245	8	321	กล่อง	f	Shelf B2	2025-08-16 12:00:00	2025-08-26 21:26:17.331387	โอเมพราโซล 20mg กล่อง 50 แคปซูล	10	1000	4.00	8.00	Omeprazole 20mg Box 50 Capsules	2025-08-03	2025-12-30	f
246	8	191	ขวด	f	Cabinet C	2025-08-16 12:00:00	2025-08-26 21:26:17.331387	โอเมพราโซล 20mg ขวด 100 แคปซูล	10	1000	3.80	7.60	Omeprazole 20mg Bottle 100 Capsules	2025-08-19	2027-06-06	f
247	9	467	กล่อง	t	Rack E	2025-08-16 12:00:00	2025-08-27 11:56:52.835893	โคลปิโดเกรล 75mg กล่อง 50 เม็ด	10	1000	5.00	10.00	\N	\N	\N	f
249	9	239	กล่อง	t	Rack E	2025-08-16 12:00:00	2025-08-27 11:56:52.835893	โคลปิโดเกรล 75mg กล่อง 50 เม็ด	10	1000	5.00	10.00	Clopidogrel 75mg Box 50 Tablets	2025-08-18	2027-07-15	f
243	6	334	กล่อง	t	Shelf A1	2025-08-16 12:00:00	2025-08-27 11:56:52.835893	เมตฟอร์มิน 500mg กล่อง 200 เม็ด	10	1000	1.00	2.00	\N	\N	\N	f
253	13	259	หลอด	t	Shelf B2	2025-08-16 12:00:00	2025-08-27 11:56:52.835893	ซิมวาสแตติน 20mg หลอด 20 เม็ด	10	1000	2.20	4.40	Simvastatin 20mg Tube 20 Tablets	2025-08-11	2027-04-29	f
254	13	144	ขวด	t	Rack E	2025-08-16 12:00:00	2025-08-27 11:56:52.835893	ซิมวาสแตติน 20mg ขวด 100 เม็ด	10	1000	2.00	4.00	Simvastatin 20mg Bottle 100 Tablets	2025-05-30	2026-03-09	f
255	13	278	หลอด	t	Rack E	2025-08-16 12:00:00	2025-08-27 11:56:52.835893	ซิมวาสแตติน 20mg หลอด 20 เม็ด	10	1000	2.20	4.40	Simvastatin 20mg Tube 20 Tablets	2025-08-17	2027-07-22	f
250	10	345	กล่อง	t	Shelf B2	2025-08-16 12:00:00	2025-08-26 21:26:17.331387	อะทอร์วาสแตติน 20mg กล่อง 200 เม็ด	10	1000	4.00	8.00	Atorvastatin 20mg Box 200 Tablets	2025-05-23	2026-01-16	f
251	11	404	หลอด	t	Cabinet C	2025-08-16 12:00:00	2025-08-26 21:26:17.331387	ไฮโดรคลอโรไทอาไซด์ 25mg หลอด 20 เม็ด	10	1000	1.00	2.00	Hydrochlorothiazide 25mg Tube 20 Tablets	2025-05-26	2027-04-12	f
252	12	113	กล่อง	t	Shelf B2	2025-08-16 12:00:00	2025-08-26 21:26:17.331387	เลโวไทรอกซีน 100mcg กล่อง 50 เม็ด	10	1000	2.00	4.00	Levothyroxine 100mcg Box 50 Tablets	2025-06-11	2026-04-10	f
258	15	317	หลอด	t	Rack E	2025-08-16 12:00:00	2025-08-26 21:26:17.331387	อีนาลาพริล 10mg หลอด 20 เม็ด	10	1000	2.20	4.40	Enalapril 10mg Tube 20 Tablets	2025-08-06	2026-05-24	f
257	14	262	กล่อง	t	Shelf A1	2025-08-16 12:00:00	2025-08-27 11:56:52.835893	ไกลเบนคลาไมด์ 5mg กล่อง 200 เม็ด	10	1000	1.10	2.20	Glibenclamide 5mg Box 200 Tablets	2025-07-29	2026-01-23	f
248	9	321	ขวด	t	Shelf B2	2025-08-16 12:00:00	2025-08-27 20:50:31.101594	โคลปิโดเกรล 75mg ขวด 100 เม็ด	10	1000	4.80	9.60	\N	\N	\N	f
256	14	194	ขวด	t	Rack E	2025-08-16 12:00:00	2025-08-27 20:50:31.115422	ไกลเบนคลาไมด์ 5mg ขวด 1000 เม็ด	10	1000	1.00	2.00	\N	\N	\N	f
234	3	516	หลอด	f	Rack E	2025-08-16 12:00:00	2025-08-27 12:00:00.025047	แอม็อกซีซิลลิน 500mg หลอด 5 แคปซูล	10	1000	1.80	3.60	Amoxicillin 500mg Tube 5 Capsules	2025-06-24	2025-10-25	f
235	3	446	กล่อง	f	Shelf B2	2025-08-16 12:00:00	2025-08-27 12:00:00.025047	แอม็อกซีซิลลิน 500mg กล่อง 50 แคปซูล	10	1000	1.60	3.20	Amoxicillin 500mg Box 50 Capsules	2025-07-31	2026-06-02	f
233	3	299	ขวด	f	Rack E	2025-08-16 12:00:00	2025-08-27 20:50:31.094767	แอม็อกซีซิลลิน 500mg ขวด 500 แคปซูล	10	1000	1.50	3.00	\N	\N	\N	f
278	26	40	กล่อง	f	Rack E	2025-08-16 12:00:00	2025-08-27 20:50:31.114268	แทมซูโลซิน 0.4mg กล่อง 100 แคปซูล	10	1000	5.20	10.40	\N	\N	\N	f
259	16	199	หลอด	t	Rack E	2025-08-16 12:00:00	2025-08-26 21:26:17.331387	ไนเฟดิปีน 30mg หลอด 10 เม็ด	10	1000	3.50	7.00	Nifedipine 30mg Tube 10 Tablets	2025-05-24	2026-01-24	f
260	17	486	กล่อง	t	Shelf A1	2025-08-16 12:00:00	2025-08-26 21:26:17.331387	แอมโลดิปีน 5mg กล่อง 50 เม็ด	10	1000	3.00	6.00	Amlodipine 5mg Box 50 Tablets	2025-07-08	2026-10-14	f
261	17	344	กล่อง	t	Cabinet C	2025-08-16 12:00:00	2025-08-26 21:26:17.331387	แอมโลดิปีน 5mg กล่อง 100 เม็ด	10	1000	2.80	5.60	Amlodipine 5mg Box 100 Tablets	2025-05-31	2025-10-29	f
263	19	477	กล่อง	t	Rack E	2025-08-16 12:00:00	2025-08-26 21:26:17.331387	สไปโรโนแลคโตน 25mg กล่อง 100 เม็ด	10	1000	2.00	4.00	Spironolactone 25mg Box 100 Tablets	2025-07-01	2027-01-27	f
262	18	166	ขวด	t	Drawer D4	2025-08-16 12:00:00	2025-08-27 11:56:52.835893	เดกซาเมทาโซน 0.5mg ขวด 1000 เม็ด	10	1000	1.00	2.00	Dexamethasone 0.5mg Bottle 1000 Tablets	2025-06-08	2027-02-25	f
279	26	285	ขวด	f	Shelf A1	2025-08-16 12:00:00	2025-08-27 11:56:52.835893	แทมซูโลซิน 0.4mg ขวด 1000 แคปซูล	10	1000	4.80	9.60	Tamsulosin 0.4mg Bottle 1000 Capsules	2025-06-16	2025-12-09	f
230	1	165	ขวด	t	Rack E	2025-08-16 12:00:00	2025-08-27 11:56:52.835893	พาราเซตามอล 500mg ขวด 100 เม็ด	10	1000	0.45	0.90	Paracetamol 500mg Bottle 100 Tablets	2025-07-19	2026-10-08	f
240	5	273	หลอด	t	Shelf A1	2025-08-16 12:00:00	2025-08-26 21:26:17.331387	เซทิริซีน 10mg หลอด 20 เม็ด	10	1000	1.20	2.40	Cetirizine 10mg Tube 20 Tablets	2025-06-23	2026-02-25	f
229	1	365	กล่อง	t	Shelf B2	2025-08-16 12:00:00	2025-08-27 11:56:52.835893	พาราเซตามอล 500mg กล่อง 200 เม็ด	10	1000	0.50	1.00	\N	\N	\N	f
231	1	165	หลอด	t	Shelf A1	2025-08-16 12:00:00	2025-08-27 11:56:52.835893	พาราเซตามอล 500mg หลอด 5 เม็ด	10	1000	0.60	1.20	พาราเซตามอล 500mg หลอด 5 เม็ด	2025-06-06	2026-08-05	f
269	22	51	กล่อง	t	Shelf B2	2025-08-16 12:00:00	2025-08-27 14:04:09.665059	ลิซิโนพริล 10mg กล่อง 100 เม็ด	10	1000	2.00	4.00	Lisinopril 10mg Box 100 Tablets	2025-05-19	2025-09-02	f
268	22	320	กล่อง	t	Cabinet C	2025-08-16 12:00:00	2025-08-27 14:04:09.665059	ลิซิโนพริล 10mg กล่อง 100 เม็ด	10	1000	2.00	4.00	Lisinopril 10mg Box 100 Tablets	2025-07-06	2026-07-05	f
283	29	381	หลอด	f	Shelf B2	2025-08-16 12:00:00	2025-08-27 11:56:52.835893	ฟลูออกซีทีน 20mg หลอด 10 แคปซูล	10	1000	5.20	10.40	Fluoxetine 20mg Tube 10 Capsules	2025-07-25	2026-12-26	f
239	5	303	กล่อง	t	Drawer D4	2025-08-16 12:00:00	2025-08-27 02:51:56.522891	เซทิริซีน 10mg กล่อง 200 เม็ด	10	1000	1.00	2.00	\N	\N	\N	f
241	6	157	กล่อง	t	Rack E	2025-08-16 12:00:00	2025-08-27 11:56:52.835893	เมตฟอร์มิน 500mg กล่อง 200 เม็ด	10	1000	1.00	2.00	Metformin 500mg Box 200 Tablets	2025-07-18	2025-11-21	f
242	6	107	กล่อง	t	Shelf A1	2025-08-16 12:00:00	2025-08-27 11:56:52.835893	เมตฟอร์มิน 500mg กล่อง 50 เม็ด	10	1000	1.10	2.20	Metformin 500mg Box 50 Tablets	2025-07-11	2027-03-01	f
232	2	10100061	ขวด	f	Rack E	2025-08-16 12:00:00	2025-08-27 11:56:52.835893	ไอบูโพรเฟน 400mg ขวด 1000 แคปซูล	10	1000	2.00	4.00	Ibuprofen 400mg Bottle 1000 Capsules	2025-08-09	2026-04-23	f
286	23	200	หลอด	f	Cabinet 	2025-08-26 21:34:28.131707	2025-08-28 02:30:12.287218	อะไรไม่รู้-555	10	1000	0.20	20.00	ffffff	2025-08-08	2025-09-25	f
282	29	234	หลอด	f	Shelf B2	2025-08-16 12:00:00	2025-08-27 11:56:52.835893	ฟลูออกซีทีน 20mg หลอด 20 แคปซูล	10	1000	5.00	10.00	Fluoxetine 20mg Tube 20 Capsules	2025-05-21	2025-12-24	f
284	29	500	หลอด	f	Shelf B2	2025-08-16 12:00:00	2025-08-27 11:56:52.835893	ฟลูออกซีทีน 20mg หลอด 20 แคปซูล	10	1000	5.00	10.00	\N	\N	\N	f
280	27	375	กล่อง	t	Shelf B2	2025-08-16 12:00:00	2025-08-27 11:56:52.835893	มอนเทลูคาสท์ 10mg กล่อง 100 เม็ด	10	1000	10.00	20.00	Montelukast 10mg Box 100 Tablets	2025-06-06	2026-06-15	f
274	25	460	หลอด	t	Shelf B2	2025-08-16 12:00:00	2025-08-27 11:56:52.835893	เมโทโพรลอล 50mg หลอด 5 เม็ด	10	1000	3.50	7.00	Metoprolol 50mg Tube 5 Tablets	2025-07-24	2027-04-28	f
264	20	259	กล่อง	t	Cabinet C	2025-08-16 12:00:00	2025-08-26 21:26:17.331387	แรนิทิดีน 150mg กล่อง 50 เม็ด	10	1000	2.00	4.00	Ranitidine 150mg Box 50 Tablets	2025-06-06	2026-07-01	f
270	23	328	กล่อง	t	Shelf A1	2025-08-16 12:00:00	2025-08-27 12:00:00.025047	บิโซโปรลอล 5mg กล่อง 50 เม็ด	10	1000	3.00	6.00	Bisoprolol 5mg Box 50 Tablets	2025-08-14	2026-09-12	f
281	28	461	กล่อง	t	Shelf A1	2025-08-16 12:00:00	2025-08-27 11:56:52.835893	ซิทากลิพติน 50mg กล่อง 50 เม็ด	10	1000	15.00	30.00	Sitagliptin 50mg Box 50 Tablets	2025-06-18	2026-08-02	f
277	26	235	ขวด	f	Shelf B2	2025-08-16 12:00:00	2025-08-27 11:56:52.835893	แทมซูโลซิน 0.4mg ขวด 500 แคปซูล	10	1000	5.00	10.00	Tamsulosin 0.4mg Bottle 500 Capsules	2025-05-21	2026-11-22	f
276	25	227	กล่อง	t	Drawer D4	2025-08-16 12:00:00	2025-08-27 11:56:52.835893	เมโทโพรลอล 50mg กล่อง 50 เม็ด	10	1000	3.30	6.60	\N	\N	\N	f
265	21	259	ขวด	t	Shelf B2	2025-08-16 12:00:00	2025-08-26 21:26:17.331387	อัลโลพูรินอล 100mg ขวด 100 เม็ด	10	1000	1.50	3.00	Allopurinol 100mg Bottle 100 Tablets	2025-06-29	2026-11-06	f
266	21	193	ขวด	t	Rack E	2025-08-16 12:00:00	2025-08-26 21:26:17.331387	อัลโลพูรินอล 100mg ขวด 1000 เม็ด	10	1000	1.30	2.60	Allopurinol 100mg Bottle 1000 Tablets	2025-07-18	2026-11-22	f
267	21	477	กล่อง	t	Rack E	2025-08-16 12:00:00	2025-08-26 21:26:17.331387	อัลโลพูรินอล 100mg กล่อง 100 เม็ด	10	1000	1.50	3.00	Allopurinol 100mg Box 100 Tablets	2025-07-21	2025-12-18	f
271	24	248	กล่อง	t	Rack E	2025-08-16 12:00:00	2025-08-26 21:26:17.331387	ไดจอกซิน 0.25mg กล่อง 50 เม็ด	10	1000	2.00	4.00	Digoxin 0.25mg Box 50 Tablets	2025-07-13	2025-11-11	f
272	24	385	ขวด	t	Drawer D4	2025-08-16 12:00:00	2025-08-26 21:26:17.331387	ไดจอกซิน 0.25mg ขวด 500 เม็ด	10	1000	1.80	3.60	Digoxin 0.25mg Bottle 500 Tablets	2025-06-30	2027-02-22	f
273	24	474	ขวด	t	Cabinet C	2025-08-16 12:00:00	2025-08-26 21:26:17.331387	ไดจอกซิน 0.25mg ขวด 100 เม็ด	10	1000	1.90	3.80	Digoxin 0.25mg Bottle 100 Tablets	2025-07-25	2026-07-13	f
275	25	488	ขวด	t	Cabinet C	2025-08-16 12:00:00	2025-08-27 11:56:52.835893	เมโทโพรลอล 50mg ขวด 500 เม็ด	10	1000	3.20	6.40	Metoprolol 50mg Bottle 500 Tablets	2025-07-27	2025-12-27	f
285	30	1138	หลอด	t	Cabinet C	2025-08-16 12:00:00	2025-08-27 11:56:52.835893	เซอร์ทราลีน 50mg หลอด 5 เม็ด	10	1000	5.50	11.00	\N	\N	\N	f
236	4	302	กล่อง	t	Shelf B2	2025-08-16 12:00:00	2025-08-27 11:56:52.835893	แอสไพริน 325mg กล่อง 50 เม็ด	10	1000	0.80	1.60	Aspirin 325mg Box 50 Tablets	2025-06-24	2025-09-15	f
237	4	415	กล่อง	t	Shelf A1	2025-08-16 12:00:00	2025-08-27 11:56:52.835893	แอสไพริน 325mg กล่อง 200 เม็ด	10	1000	0.70	1.40	\N	\N	\N	f
238	4	356	กล่อง	t	Cabinet C	2025-08-16 12:00:00	2025-08-27 11:56:52.835893	แอสไพริน 325mg กล่อง 50 เม็ด	10	1000	0.80	1.60	Aspirin 325mg Box 50 Tablets	2025-06-21	2025-12-05	f
\.


--
-- Data for Name: med_table; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY med.med_table (med_id, med_name, med_generic_name, med_severity, med_counting_unit, med_marketing_name, med_thai_name, med_cost_price, med_selling_price, med_medium_price, med_dosage_form, med_medical_category, med_essential_med_list, med_out_of_stock, med_replacement, "med_TMT_GP_name", "med_TMT_TP_name", med_dose_dialogue, "med_TMT_code", "med_TPU_code", med_pregnancy_cagetory, med_set_new_price, "mde_dispence_IPD_freq", med_mfg, med_exp) FROM stdin;
2	Ibuprofen	Ibuprofen	Moderate	Capsule	IbuCap	ไอบูโพรเฟน	2.5	3	2.75	Oral	Anti-inflammatory	Y	t	Naproxen	TMT002	TP002	Take 1 capsule every 8 hours	T002	TPU002	B	t	10	2024-12-01	2026-12-01
3	Amoxicillin	Amoxicillin	Severe	Capsule	Amoxil	แอม็อกซีซิลลิน	3	3.5	3.25	Oral	Antibiotic	N	f	\N	TMT003	TP003	Take 1 capsule every 8 hours	T003	TPU003	C	f	7	2024-05-01	2026-05-01
5	Cetirizine	Cetirizine	Mild	Tablet	Cetrimax	เซทิริซีน	2	2.5	2.25	Oral	Antihistamine	Y	f	\N	TMT005	TP005	Take 1 tablet daily	T005	TPU005	A	t	6	2024-02-01	2025-12-01
6	Metformin	Metformin	Moderate	Tablet	GlucoMet	เมตฟอร์มิน	3.2	3.8	3.5	Oral	Antidiabetic	N	f	\N	TMT006	TP006	Take 1 tablet twice daily	T006	TPU006	B	f	12	2024-01-01	2026-01-01
7	Losartan	Losartan	Moderate	Tablet	LozaPress	โลซาร์แทน	2.7	3.1	2.9	Oral	Antihypertensive	Y	f	\N	TMT007	TP007	Take 1 tablet daily	T007	TPU007	B	f	10	2024-04-01	2026-04-01
8	Omeprazole	Omeprazole	Mild	Capsule	OmezPro	โอเมพราโซล	1.9	2.4	2.15	Oral	Antacid	N	f	\N	TMT008	TP008	Take 1 capsule before breakfast	T008	TPU008	B	t	5	2023-11-01	2025-11-01
9	Clopidogrel	Clopidogrel	Severe	Tablet	ClopidX	โคลปิโดเกรล	4.5	5	4.75	Oral	Anticoagulant	N	f	\N	TMT009	TP009	Take 1 tablet daily	T009	TPU009	C	f	8	2024-06-01	2026-06-01
10	Atorvastatin	Atorvastatin	Moderate	Tablet	AtoLip	อะทอร์วาสแตติน	3.6	4.2	3.9	Oral	Lipid-lowering	Y	f	\N	TMT010	TP010	Take 1 tablet at bedtime	T010	TPU010	B	f	9	2024-03-01	2026-03-01
11	Hydrochlorothiazide	Hydrochlorothiazide	Mild	Tablet	HydroTab	ไฮโดรคลอโรไทอาไซด์	2.1	2.6	2.35	Oral	Diuretic	N	t	Furosemide	TMT011	TP011	Take 1 tablet daily	T011	TPU011	A	f	5	2024-09-01	2026-09-01
12	Levothyroxine	Levothyroxine	Mild	Tablet	ThyroMax	เลโวไทรอกซีน	1.5	2	1.75	Oral	Thyroid hormone	Y	f	\N	TMT012	TP012	Take 1 tablet before breakfast	T012	TPU012	A	f	5	2024-10-01	2026-10-01
13	Simvastatin	Simvastatin	Moderate	Tablet	SimaLip	ซิมวาสแตติน	3.4	3.9	3.65	Oral	Lipid-lowering	N	f	\N	TMT013	TP013	Take 1 tablet at bedtime	T013	TPU013	B	f	6	2024-07-01	2026-07-01
14	Glibenclamide	Glibenclamide	Moderate	Tablet	GlibenPro	ไกลเบนคลาไมด์	2.8	3.3	3.05	Oral	Antidiabetic	N	t	Glipizide	TMT014	TP014	Take 1 tablet with breakfast	T014	TPU014	C	t	8	2024-06-01	2025-06-01
15	Enalapril	Enalapril	Moderate	Tablet	EnalaPress	อีนาลาพริล	2.5	3	2.75	Oral	Antihypertensive	Y	f	\N	TMT015	TP015	Take 1 tablet daily	T015	TPU015	B	f	7	2024-04-01	2025-04-01
16	Nifedipine	Nifedipine	Severe	Tablet	NifeFast	ไนเฟดิปีน	3	3.6	3.3	Oral	Calcium channel blocker	Y	f	\N	TMT016	TP016	Take 1 tablet daily	T016	TPU016	C	f	8	2024-01-01	2025-01-01
17	Amlodipine	Amlodipine	Mild	Tablet	Amlodine	แอมโลดิปีน	1.8	2.2	2	Oral	Antihypertensive	Y	f	\N	TMT017	TP017	Take 1 tablet daily	T017	TPU017	A	f	5	2024-03-01	2025-03-01
18	Dexamethasone	Dexamethasone	Moderate	Tablet	DexaTab	เดกซาเมทาโซน	2.9	3.4	3.15	Oral	Corticosteroid	N	f	\N	TMT018	TP018	Take 1 tablet daily	T018	TPU018	B	t	6	2024-02-01	2025-08-01
19	Spironolactone	Spironolactone	Moderate	Tablet	SpiraMax	สไปโรโนแลคโตน	3.1	3.7	3.4	Oral	Diuretic	Y	f	\N	TMT019	TP019	Take 1 tablet daily	T019	TPU019	C	f	8	2024-05-01	2026-05-01
20	Ranitidine	Ranitidine	Mild	Tablet	RaniBlock	แรนิทิดีน	1.6	2	1.8	Oral	Antacid	N	t	Famotidine	TMT020	TP020	Take 1 tablet before meals	T020	TPU020	A	f	5	2023-12-01	2025-12-01
22	Lisinopril	Lisinopril	Moderate	Tablet	LisinoPress	ลิซิโนพริล	2.7	3.3	3	Oral	Antihypertensive	N	f	\N	TMT022	TP022	Take 1 tablet daily	T022	TPU022	C	f	7	2024-07-01	2026-07-01
23	Bisoprolol	Bisoprolol	Moderate	Tablet	BisoMax	บิโซโปรลอล	3	3.5	3.25	Oral	Beta blocker	Y	f	\N	TMT023	TP023	Take 1 tablet daily	T023	TPU023	B	t	8	2024-11-01	2025-11-01
24	Digoxin	Digoxin	Severe	Tablet	DigoCard	ไดจอกซิน	4.8	5.5	5.15	Oral	Antiarrhythmic	N	f	\N	TMT024	TP024	Take 1 tablet daily	T024	TPU024	C	f	10	2024-06-01	2025-06-01
25	Metoprolol	Metoprolol	Moderate	Tablet	MetoFast	เมโทโพรลอล	2.9	3.4	3.15	Oral	Beta blocker	Y	t	\N	TMT025	TP025	Take 1 tablet daily	T025	TPU025	B	t	7	2023-11-01	2025-05-01
26	Tamsulosin	Tamsulosin	Mild	Capsule	TamFlo	แทมซูโลซิน	2.4	2.9	2.65	Oral	Alpha blocker	N	f	\N	TMT026	TP026	Take 1 capsule daily	T026	TPU026	A	f	5	2024-01-01	2026-01-01
27	Montelukast	Montelukast	Mild	Tablet	MonteAir	มอนเทลูคาสท์	3	3.6	3.3	Oral	Antiasthmatic	Y	f	\N	TMT027	TP027	Take 1 tablet at bedtime	T027	TPU027	B	f	6	2024-10-01	2025-10-01
28	Sitagliptin	Sitagliptin	Moderate	Tablet	SitaPro	ซิทากลิพติน	4	4.5	4.25	Oral	Antidiabetic	N	f	\N	TMT028	TP028	Take 1 tablet daily	T028	TPU028	C	t	7	2024-12-01	2026-12-01
29	Fluoxetine	Fluoxetine	Severe	Capsule	FluoxaTab	ฟลูออกซีทีน	3.5	4	3.75	Oral	Antidepressant	Y	f	\N	TMT029	TP029	Take 1 capsule daily	T029	TPU029	C	f	8	2024-03-01	2026-03-01
30	Sertraline	Sertraline	Severe	Tablet	SertraCare	เซอร์ทราลีน	4	4.6	4.3	Oral	Antidepressant	N	f	\N	TMT030	TP030	Take 1 tablet daily	T030	TPU030	C	f	9	2024-02-01	2025-02-01
21	Allopurinol	Allopurinol	Mild	Tablet	AlloPur	อัลโลพูรินอล	2.2	2.6	2.4	Oral	Anti-gout	Y	f	\N	TMT021	TP021	Take 1 tablet daily	T021	TPU021	B	t	6	2024-09-01	2025-09-01
1	Paracetamol	Acetaminophen	Mild	Tablet	Tiffy	พาราเซตามอล	1.5	2	1.75	Oral	Analgesic	Y	f	\N	TMT001	TP001	Take 1 tablet every 6 hours	T001	TPU001	A	f	5	2025-03-01	2027-03-01
4	Aspirin	Aspirin	Moderate	Tablet	AspiRelief	แอสไพริน	1.8	2.2	2	Oral	Analgesic	Y	f	\N	TMT004	TP004	Take 1 tablet every 6 hours	T004	TPU004	A	f	8	2023-08-01	2025-08-01
\.


--
-- Data for Name: med_usage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY med.med_usage (usage_id, patient_id, med_id, order_datetime, start_datetime, end_datetime, dosage, frequency, route, usage_status, note, created_at, updated_at) FROM stdin;
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
159	2	26	2025-08-12 10:30:37.051	2025-08-12 10:30:37	\N	Take 1 capsule daily	วันละ 5 ครั้ง	Oral	Active	\N	2025-08-12 10:30:37.051	2025-08-12 10:30:37.051
160	1	1	2025-08-12 20:25:11.793482	2025-08-12 20:25:11	\N	Take 1 tablet every 6 hours	วันละ 5 ครั้ง	Oral	Active	\N	2025-08-12 20:25:11.793482	2025-08-12 20:25:11.793482
161	1	21	2025-08-12 20:25:11.814934	2025-08-12 20:25:11	\N	Take 1 tablet daily	วันละ 6 ครั้ง	Oral	Active	\N	2025-08-12 20:25:11.814934	2025-08-12 20:25:11.814934
162	1	9	2025-08-12 20:25:11.829636	2025-08-12 20:25:11	\N	Take 1 tablet daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-08-12 20:25:11.829636	2025-08-12 20:25:11.829636
163	1	8	2025-08-12 20:25:11.8454	2025-08-12 20:25:11	\N	Take 1 capsule before breakfast	วันละ 5 ครั้ง	Oral	Active	\N	2025-08-12 20:25:11.8454	2025-08-12 20:25:11.8454
164	1	26	2025-08-12 20:25:11.859347	2025-08-12 20:25:11	\N	Take 1 capsule daily	วันละ 5 ครั้ง	Oral	Active	\N	2025-08-12 20:25:11.859347	2025-08-12 20:25:11.859347
165	1	22	2025-08-13 20:17:26.219262	2025-08-13 20:17:26	\N	Take 1 tablet daily	วันละ 7 ครั้ง	Oral	Active	\N	2025-08-13 20:17:26.219262	2025-08-13 20:17:26.219262
166	1	11	2025-08-15 02:48:28.140452	2025-08-15 02:48:28	\N	Take 1 tablet daily	วันละ 5 ครั้ง	Oral	Active	\N	2025-08-15 02:48:28.140452	2025-08-15 02:48:28.140452
167	1	20	2025-08-15 02:48:28.16703	2025-08-15 02:48:28	\N	Take 1 tablet before meals	วันละ 5 ครั้ง	Oral	Active	\N	2025-08-15 02:48:28.16703	2025-08-15 02:48:28.16703
168	5	1	2025-08-15 23:06:21.630075	2025-08-15 23:06:21	\N	Take 1 tablet every 6 hours	วันละ 5 ครั้ง	Oral	Active	\N	2025-08-15 23:06:21.630075	2025-08-15 23:06:21.630075
169	5	7	2025-08-15 23:06:21.651505	2025-08-15 23:06:21	\N	Take 1 tablet daily	วันละ 10 ครั้ง	Oral	Active	\N	2025-08-15 23:06:21.651505	2025-08-15 23:06:21.651505
170	3	5	2025-08-18 04:52:35.885417	2025-08-18 04:52:35	\N	Take 1 tablet daily	วันละ 6 ครั้ง	Oral	Active	\N	2025-08-18 04:52:35.885417	2025-08-18 04:52:35.885417
171	3	22	2025-08-18 04:52:35.902681	2025-08-18 04:52:35	\N	Take 1 tablet daily	วันละ 7 ครั้ง	Oral	Active	\N	2025-08-18 04:52:35.902681	2025-08-18 04:52:35.902681
172	3	27	2025-08-18 04:52:35.910973	2025-08-18 04:52:35	\N	Take 1 tablet at bedtime	วันละ 6 ครั้ง	Oral	Active	\N	2025-08-18 04:52:35.910973	2025-08-18 04:52:35.910973
173	3	25	2025-08-18 04:52:35.93893	2025-08-18 04:52:35	\N	Take 1 tablet daily	วันละ 7 ครั้ง	Oral	Active	\N	2025-08-18 04:52:35.93893	2025-08-18 04:52:35.93893
174	3	17	2025-08-18 04:52:35.950402	2025-08-18 04:52:35	\N	Take 1 tablet daily	วันละ 5 ครั้ง	Oral	Active	\N	2025-08-18 04:52:35.950402	2025-08-18 04:52:35.950402
175	2	1	2025-08-18 04:53:13.33082	2025-08-18 04:53:13	\N	Take 1 tablet every 6 hours	วันละ 5 ครั้ง	Oral	Active	\N	2025-08-18 04:53:13.33082	2025-08-18 04:53:13.33082
176	2	5	2025-08-18 04:53:13.335916	2025-08-18 04:53:13	\N	Take 1 tablet daily	วันละ 6 ครั้ง	Oral	Active	\N	2025-08-18 04:53:13.335916	2025-08-18 04:53:13.335916
177	2	6	2025-08-18 04:53:13.346894	2025-08-18 04:53:13	\N	Take 1 tablet twice daily	วันละ 12 ครั้ง	Oral	Active	\N	2025-08-18 04:53:13.346894	2025-08-18 04:53:13.346894
178	1	20	2025-08-18 04:53:37.067282	2025-08-18 04:53:37	\N	Take 1 tablet before meals	วันละ 5 ครั้ง	Oral	Active	\N	2025-08-18 04:53:37.067282	2025-08-18 04:53:37.067282
179	1	29	2025-08-18 04:53:37.111861	2025-08-18 04:53:37	\N	Take 1 capsule daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-08-18 04:53:37.111861	2025-08-18 04:53:37.111861
180	3	25	2025-08-18 05:03:51.196367	2025-08-18 05:03:51	\N	Take 1 tablet daily	วันละ 7 ครั้ง	Oral	Active	\N	2025-08-18 05:03:51.196367	2025-08-18 05:03:51.196367
181	3	2	2025-08-18 05:03:51.339669	2025-08-18 05:03:51	\N	Take 1 capsule every 8 hours	วันละ 10 ครั้ง	Oral	Active	\N	2025-08-18 05:03:51.339669	2025-08-18 05:03:51.339669
182	1	2	2025-08-18 22:27:50.168321	2025-08-18 22:27:50	\N	Take 1 capsule every 8 hours	วันละ 10 ครั้ง	Oral	Active	\N	2025-08-18 22:27:50.168321	2025-08-18 22:27:50.168321
183	1	19	2025-08-18 22:27:50.179218	2025-08-18 22:27:50	\N	Take 1 tablet daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-08-18 22:27:50.179218	2025-08-18 22:27:50.179218
184	1	14	2025-08-18 22:27:50.182897	2025-08-18 22:27:50	\N	Take 1 tablet with breakfast	วันละ 8 ครั้ง	Oral	Active	\N	2025-08-18 22:27:50.182897	2025-08-18 22:27:50.182897
185	1	13	2025-08-18 22:27:50.191941	2025-08-18 22:27:50	\N	Take 1 tablet at bedtime	วันละ 6 ครั้ง	Oral	Active	\N	2025-08-18 22:27:50.191941	2025-08-18 22:27:50.191941
186	5	16	2025-08-18 22:28:07.566123	2025-08-18 22:28:07	\N	Take 1 tablet daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-08-18 22:28:07.566123	2025-08-18 22:28:07.566123
187	5	1	2025-08-18 22:28:07.6044	2025-08-18 22:28:07	\N	Take 1 tablet every 6 hours	วันละ 5 ครั้ง	Oral	Active	\N	2025-08-18 22:28:07.6044	2025-08-18 22:28:07.6044
188	9	27	2025-08-18 22:28:28.912796	2025-08-18 22:28:28	\N	Take 1 tablet at bedtime	วันละ 6 ครั้ง	Oral	Active	\N	2025-08-18 22:28:28.912796	2025-08-18 22:28:28.912796
189	9	9	2025-08-18 22:28:28.917001	2025-08-18 22:28:28	\N	Take 1 tablet daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-08-18 22:28:28.917001	2025-08-18 22:28:28.917001
190	9	12	2025-08-18 22:28:28.92323	2025-08-18 22:28:28	\N	Take 1 tablet before breakfast	วันละ 5 ครั้ง	Oral	Active	\N	2025-08-18 22:28:28.92323	2025-08-18 22:28:28.92323
191	9	7	2025-08-18 22:28:28.93378	2025-08-18 22:28:28	\N	Take 1 tablet daily	วันละ 10 ครั้ง	Oral	Active	\N	2025-08-18 22:28:28.93378	2025-08-18 22:28:28.93378
192	9	26	2025-08-18 22:28:28.938874	2025-08-18 22:28:28	\N	Take 1 capsule daily	วันละ 5 ครั้ง	Oral	Active	\N	2025-08-18 22:28:28.938874	2025-08-18 22:28:28.938874
193	2	11	2025-08-20 12:09:32.627607	2025-08-20 12:09:32	\N	Take 1 tablet daily	วันละ 5 ครั้ง	Oral	Active	\N	2025-08-20 12:09:32.627607	2025-08-20 12:09:32.627607
194	2	20	2025-08-20 12:09:32.633235	2025-08-20 12:09:32	\N	Take 1 tablet before meals	วันละ 5 ครั้ง	Oral	Active	\N	2025-08-20 12:09:32.633235	2025-08-20 12:09:32.633235
195	2	9	2025-08-20 12:09:32.635862	2025-08-20 12:09:32	\N	Take 1 tablet daily	วันละ 8 ครั้ง	Oral	Active	\N	2025-08-20 12:09:32.635862	2025-08-20 12:09:32.635862
196	2	1	2025-08-20 12:09:32.641606	2025-08-20 12:09:32	\N	Take 1 tablet every 6 hours	วันละ 5 ครั้ง	Oral	Active	\N	2025-08-20 12:09:32.641606	2025-08-20 12:09:32.641606
197	2	28	2025-08-20 12:09:32.667338	2025-08-20 12:09:32	\N	Take 1 tablet daily	วันละ 7 ครั้ง	Oral	Active	\N	2025-08-20 12:09:32.667338	2025-08-20 12:09:32.667338
198	1	9	2025-08-20 23:24:13.145145	2025-08-20 23:24:13	\N	ไม่ระบุ	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-20 23:24:13.145145	2025-08-20 23:24:13.145145
199	1	25	2025-08-20 23:24:13.150137	2025-08-20 23:24:13	\N	ไม่ระบุ	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-20 23:24:13.150137	2025-08-20 23:24:13.150137
200	1	22	2025-08-21 09:20:01.52598	2025-08-21 09:20:01	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 09:20:01.52598	2025-08-21 09:20:01.52598
201	1	3	2025-08-21 09:20:01.530859	2025-08-21 09:20:01	\N	Take 1 capsule every 8 hours	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 09:20:01.530859	2025-08-21 09:20:01.530859
202	1	21	2025-08-21 09:20:01.533846	2025-08-21 09:20:01	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 09:20:01.533846	2025-08-21 09:20:01.533846
203	1	6	2025-08-21 09:20:01.546039	2025-08-21 09:20:01	\N	Take 1 tablet twice daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 09:20:01.546039	2025-08-21 09:20:01.546039
204	1	25	2025-08-21 09:20:01.549002	2025-08-21 09:20:01	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 09:20:01.549002	2025-08-21 09:20:01.549002
205	4	30	2025-08-21 09:21:51.588966	2025-08-21 09:21:51	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 09:21:51.588966	2025-08-21 09:21:51.588966
206	4	24	2025-08-21 09:21:51.59426	2025-08-21 09:21:51	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 09:21:51.59426	2025-08-21 09:21:51.59426
207	4	25	2025-08-21 09:21:51.59789	2025-08-21 09:21:51	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 09:21:51.59789	2025-08-21 09:21:51.59789
208	4	25	2025-08-21 09:21:51.607796	2025-08-21 09:21:51	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 09:21:51.607796	2025-08-21 09:21:51.607796
209	1	29	2025-08-21 09:29:48.988227	2025-08-21 09:29:48	\N	Take 1 capsule daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 09:29:48.988227	2025-08-21 09:29:48.988227
210	1	28	2025-08-21 09:29:48.99318	2025-08-21 09:29:48	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 09:29:48.99318	2025-08-21 09:29:48.99318
211	1	8	2025-08-21 09:29:48.995998	2025-08-21 09:29:48	\N	Take 1 capsule before breakfast	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 09:29:48.995998	2025-08-21 09:29:48.995998
212	1	30	2025-08-21 09:37:44.282857	2025-08-21 09:37:44	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 09:37:44.282857	2025-08-21 09:37:44.282857
213	1	9	2025-08-21 09:37:44.331534	2025-08-21 09:37:44	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 09:37:44.331534	2025-08-21 09:37:44.331534
214	1	28	2025-08-21 09:37:44.431596	2025-08-21 09:37:44	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 09:37:44.431596	2025-08-21 09:37:44.431596
215	1	26	2025-08-21 09:37:44.432207	2025-08-21 09:37:44	\N	Take 1 capsule daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 09:37:44.432207	2025-08-21 09:37:44.432207
216	3	6	2025-08-21 09:50:06.311522	2025-08-21 09:50:06	\N	Take 1 tablet twice daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 09:50:06.311522	2025-08-21 09:50:06.311522
217	3	28	2025-08-21 09:50:06.319656	2025-08-21 09:50:06	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 09:50:06.319656	2025-08-21 09:50:06.319656
218	3	19	2025-08-21 09:50:06.325836	2025-08-21 09:50:06	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 09:50:06.325836	2025-08-21 09:50:06.325836
219	3	12	2025-08-21 09:50:06.329475	2025-08-21 09:50:06	\N	Take 1 tablet before breakfast	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 09:50:06.329475	2025-08-21 09:50:06.329475
220	3	22	2025-08-21 09:50:06.357867	2025-08-21 09:50:06	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 09:50:06.357867	2025-08-21 09:50:06.357867
221	1	4	2025-08-21 10:13:39.707558	2025-08-21 10:13:39	\N	Take 1 tablet every 6 hours	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 10:13:39.707558	2025-08-21 10:13:39.707558
222	1	29	2025-08-21 10:13:39.711781	2025-08-21 10:13:39	\N	Take 1 capsule daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 10:13:39.711781	2025-08-21 10:13:39.711781
223	1	28	2025-08-21 10:13:39.71946	2025-08-21 10:13:39	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 10:13:39.71946	2025-08-21 10:13:39.71946
224	1	2	2025-08-21 10:13:39.721977	2025-08-21 10:13:39	\N	Take 1 capsule every 8 hours	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 10:13:39.721977	2025-08-21 10:13:39.721977
225	1	23	2025-08-21 10:27:35.45602	2025-08-21 10:27:35	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 10:27:35.45602	2025-08-21 10:27:35.45602
226	1	24	2025-08-21 10:27:35.460767	2025-08-21 10:27:35	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 10:27:35.460767	2025-08-21 10:27:35.460767
227	1	20	2025-08-21 10:27:35.463963	2025-08-21 10:27:35	\N	Take 1 tablet before meals	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 10:27:35.463963	2025-08-21 10:27:35.463963
228	1	8	2025-08-21 10:31:16.259436	2025-08-21 10:31:16	\N	Take 1 capsule before breakfast	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 10:31:16.259436	2025-08-21 10:31:16.259436
229	1	26	2025-08-21 10:31:16.264363	2025-08-21 10:31:16	\N	Take 1 capsule daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 10:31:16.264363	2025-08-21 10:31:16.264363
230	1	24	2025-08-21 10:31:16.274396	2025-08-21 10:31:16	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 10:31:16.274396	2025-08-21 10:31:16.274396
231	1	21	2025-08-21 10:36:57.941244	2025-08-21 10:36:57	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 10:36:57.941244	2025-08-21 10:36:57.941244
232	1	1	2025-08-21 10:39:00.195051	2025-08-21 10:39:00	\N	Take 1 tablet every 6 hours	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 10:39:00.195051	2025-08-21 10:39:00.195051
233	1	7	2025-08-21 10:39:00.199428	2025-08-21 10:39:00	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 10:39:00.199428	2025-08-21 10:39:00.199428
234	1	11	2025-08-21 10:39:00.207023	2025-08-21 10:39:00	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 10:39:00.207023	2025-08-21 10:39:00.207023
235	1	25	2025-08-21 10:46:53.840896	2025-08-21 10:46:53	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 10:46:53.840896	2025-08-21 10:46:53.840896
236	1	14	2025-08-21 11:01:17.351042	2025-08-21 11:01:17	\N	Take 1 tablet with breakfast	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 11:01:17.351042	2025-08-21 11:01:17.351042
237	1	21	2025-08-21 11:01:17.401045	2025-08-21 11:01:17	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 11:01:17.401045	2025-08-21 11:01:17.401045
238	1	17	2025-08-21 12:22:44.298583	2025-08-21 12:22:44	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 12:22:44.298583	2025-08-21 12:22:44.298583
239	1	4	2025-08-21 12:22:44.359116	2025-08-21 12:22:44	\N	Take 1 tablet every 6 hours	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 12:22:44.359116	2025-08-21 12:22:44.359116
240	1	6	2025-08-21 12:22:44.368685	2025-08-21 12:22:44	\N	Take 1 tablet twice daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 12:22:44.368685	2025-08-21 12:22:44.368685
241	1	26	2025-08-21 12:22:44.381476	2025-08-21 12:22:44	\N	Take 1 capsule daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 12:22:44.381476	2025-08-21 12:22:44.381476
242	1	1	2025-08-21 12:22:44.385685	2025-08-21 12:22:44	\N	Take 1 tablet every 6 hours	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 12:22:44.385685	2025-08-21 12:22:44.385685
243	1	9	2025-08-21 12:23:28.723823	2025-08-21 12:23:28	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 12:23:28.723823	2025-08-21 12:23:28.723823
244	1	8	2025-08-21 12:23:28.735558	2025-08-21 12:23:28	\N	Take 1 capsule before breakfast	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 12:23:28.735558	2025-08-21 12:23:28.735558
245	1	6	2025-08-21 12:23:28.738199	2025-08-21 12:23:28	\N	Take 1 tablet twice daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 12:23:28.738199	2025-08-21 12:23:28.738199
246	3	3	2025-08-21 12:23:34.483779	2025-08-21 12:23:34	\N	Take 1 capsule every 8 hours	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 12:23:34.483779	2025-08-21 12:23:34.483779
247	1	6	2025-08-21 18:02:40.853056	2025-08-21 18:02:40	\N	Take 1 tablet twice daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 18:02:40.853056	2025-08-21 18:02:40.853056
248	1	25	2025-08-21 18:02:40.857021	2025-08-21 18:02:40	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 18:02:40.857021	2025-08-21 18:02:40.857021
249	1	16	2025-08-21 18:02:40.861888	2025-08-21 18:02:40	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 18:02:40.861888	2025-08-21 18:02:40.861888
250	1	29	2025-08-21 18:02:40.864717	2025-08-21 18:02:40	\N	Take 1 capsule daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 18:02:40.864717	2025-08-21 18:02:40.864717
251	1	9	2025-08-21 18:02:40.866923	2025-08-21 18:02:40	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-21 18:02:40.866923	2025-08-21 18:02:40.866923
252	10	1	2025-08-22 06:41:51.114293	2025-08-22 06:41:51	\N	Take 1 tablet every 6 hours	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-22 06:41:51.114293	2025-08-22 06:41:51.114293
253	10	24	2025-08-22 06:41:51.114729	2025-08-22 06:41:51	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-22 06:41:51.114729	2025-08-22 06:41:51.114729
254	1	30	2025-08-22 10:32:44.93576	2025-08-22 10:32:44	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-22 10:32:44.93576	2025-08-22 10:32:44.93576
255	1	29	2025-08-22 10:32:44.942584	2025-08-22 10:32:44	\N	Take 1 capsule daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-22 10:32:44.942584	2025-08-22 10:32:44.942584
256	1	3	2025-08-22 10:32:44.945356	2025-08-22 10:32:44	\N	Take 1 capsule every 8 hours	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-22 10:32:44.945356	2025-08-22 10:32:44.945356
257	1	4	2025-08-22 22:33:31.444093	2025-08-22 22:33:31	\N	Take 1 tablet every 6 hours	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-22 22:33:31.444093	2025-08-22 22:33:31.444093
258	1	2	2025-08-22 22:33:31.450455	2025-08-22 22:33:31	\N	Take 1 capsule every 8 hours	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-22 22:33:31.450455	2025-08-22 22:33:31.450455
259	1	14	2025-08-22 22:33:31.458266	2025-08-22 22:33:31	\N	Take 1 tablet with breakfast	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-22 22:33:31.458266	2025-08-22 22:33:31.458266
260	1	27	2025-08-22 22:33:31.470474	2025-08-22 22:33:31	\N	Take 1 tablet at bedtime	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-22 22:33:31.470474	2025-08-22 22:33:31.470474
261	1	23	2025-08-23 09:58:11.417602	2025-08-23 09:58:11	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-23 09:58:11.417602	2025-08-23 09:58:11.417602
262	1	4	2025-08-23 09:58:11.422192	2025-08-23 09:58:11	\N	Take 1 tablet every 6 hours	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-23 09:58:11.422192	2025-08-23 09:58:11.422192
263	1	26	2025-08-23 09:58:11.425294	2025-08-23 09:58:11	\N	Take 1 capsule daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-23 09:58:11.425294	2025-08-23 09:58:11.425294
264	1	15	2025-08-23 09:58:11.428489	2025-08-23 09:58:11	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-23 09:58:11.428489	2025-08-23 09:58:11.428489
265	1	4	2025-08-23 09:58:11.55851	2025-08-23 09:58:11	\N	Take 1 tablet every 6 hours	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-23 09:58:11.55851	2025-08-23 09:58:11.55851
267	1	1	2025-08-25 05:19:09.362736	2025-08-25 05:19:09	\N	Take 1 tablet every 6 hours	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-25 05:19:09.362736	2025-08-25 05:19:09.362736
266	1	22	2025-08-25 05:19:09.36316	2025-08-25 05:19:09	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-25 05:19:09.36316	2025-08-25 05:19:09.36316
268	1	25	2025-08-25 05:19:09.368268	2025-08-25 05:19:09	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-25 05:19:09.368268	2025-08-25 05:19:09.368268
269	1	16	2025-08-25 05:19:09.41231	2025-08-25 05:19:09	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-25 05:19:09.41231	2025-08-25 05:19:09.41231
270	6	1	2025-08-25 12:30:12.186118	2025-08-25 12:30:12	\N	Take 1 tablet every 6 hours	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-25 12:30:12.186118	2025-08-25 12:30:12.186118
271	6	22	2025-08-25 12:30:12.190753	2025-08-25 12:30:12	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-25 12:30:12.190753	2025-08-25 12:30:12.190753
272	4	11	2025-08-25 12:30:47.419313	2025-08-25 12:30:47	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-25 12:30:47.419313	2025-08-25 12:30:47.419313
273	4	1	2025-08-25 12:30:47.42829	2025-08-25 12:30:47	\N	Take 1 tablet every 6 hours	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-25 12:30:47.42829	2025-08-25 12:30:47.42829
274	3	23	2025-08-25 22:49:50.586814	2025-08-25 22:49:50	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-25 22:49:50.586814	2025-08-25 22:49:50.586814
275	3	1	2025-08-25 22:49:50.641196	2025-08-25 22:49:50	\N	Take 1 tablet every 6 hours	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-25 22:49:50.641196	2025-08-25 22:49:50.641196
276	3	22	2025-08-25 22:49:50.643149	2025-08-25 22:49:50	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-25 22:49:50.643149	2025-08-25 22:49:50.643149
277	3	26	2025-08-25 22:49:50.646453	2025-08-25 22:49:50	\N	Take 1 capsule daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-25 22:49:50.646453	2025-08-25 22:49:50.646453
278	1	6	2025-08-26 10:07:58.490854	2025-08-26 10:07:58	\N	Take 1 tablet twice daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-26 10:07:58.490854	2025-08-26 10:07:58.490854
279	4	21	2025-08-26 15:21:21.979334	2025-08-26 15:21:21	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-26 15:21:21.979334	2025-08-26 15:21:21.979334
280	4	6	2025-08-26 15:21:21.984171	2025-08-26 15:21:21	\N	Take 1 tablet twice daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-26 15:21:21.984171	2025-08-26 15:21:21.984171
281	4	12	2025-08-26 15:21:21.989154	2025-08-26 15:21:21	\N	Take 1 tablet before breakfast	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-26 15:21:21.989154	2025-08-26 15:21:21.989154
282	4	9	2025-08-26 15:21:21.992205	2025-08-26 15:21:21	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-26 15:21:21.992205	2025-08-26 15:21:21.992205
283	4	28	2025-08-26 15:21:21.995245	2025-08-26 15:21:21	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-26 15:21:21.995245	2025-08-26 15:21:21.995245
284	4	29	2025-08-26 15:21:21.999676	2025-08-26 15:21:21	\N	Take 1 capsule daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-26 15:21:21.999676	2025-08-26 15:21:21.999676
285	2	3	2025-08-26 16:16:00.300165	2025-08-26 16:16:00	\N	Take 1 capsule every 8 hours	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-26 16:16:00.300165	2025-08-26 16:16:00.300165
286	2	13	2025-08-26 16:16:00.3064	2025-08-26 16:16:00	\N	Take 1 tablet at bedtime	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-26 16:16:00.3064	2025-08-26 16:16:00.3064
287	2	21	2025-08-26 16:16:00.308969	2025-08-26 16:16:00	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-26 16:16:00.308969	2025-08-26 16:16:00.308969
288	2	26	2025-08-26 16:16:00.315394	2025-08-26 16:16:00	\N	Take 1 capsule daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-26 16:16:00.315394	2025-08-26 16:16:00.315394
289	1	29	2025-08-27 02:51:56.50734	2025-08-27 02:51:56	\N	Take 1 capsule daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-27 02:51:56.50734	2025-08-27 02:51:56.50734
290	1	5	2025-08-27 02:51:56.510264	2025-08-27 02:51:56	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-27 02:51:56.510264	2025-08-27 02:51:56.510264
291	1	25	2025-08-27 02:51:56.51802	2025-08-27 02:51:56	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-27 02:51:56.51802	2025-08-27 02:51:56.51802
292	3	6	2025-08-27 02:52:40.436285	2025-08-27 02:52:40	\N	Take 1 tablet twice daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-27 02:52:40.436285	2025-08-27 02:52:40.436285
293	3	1	2025-08-27 02:52:40.44133	2025-08-27 02:52:40	\N	Take 1 tablet every 6 hours	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-27 02:52:40.44133	2025-08-27 02:52:40.44133
294	5	9	2025-08-27 02:53:03.610603	2025-08-27 02:53:03	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-27 02:53:03.610603	2025-08-27 02:53:03.610603
295	5	1	2025-08-27 02:53:03.620649	2025-08-27 02:53:03	\N	Take 1 tablet every 6 hours	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-27 02:53:03.620649	2025-08-27 02:53:03.620649
296	3	4	2025-08-27 10:26:21.074693	2025-08-27 10:26:21	\N	Take 1 tablet every 6 hours	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-27 10:26:21.074693	2025-08-27 10:26:21.074693
297	3	30	2025-08-27 10:26:21.125236	2025-08-27 10:26:21	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-27 10:26:21.125236	2025-08-27 10:26:21.125236
298	3	1	2025-08-27 10:26:21.240911	2025-08-27 10:26:21	\N	Take 1 tablet every 6 hours	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-27 10:26:21.240911	2025-08-27 10:26:21.240911
299	1	3	2025-08-27 20:50:31.077935	2025-08-27 20:50:31	\N	Take 1 capsule every 8 hours	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-27 20:50:31.077935	2025-08-27 20:50:31.077935
301	1	9	2025-08-27 20:50:31.085181	2025-08-27 20:50:31	\N	Take 1 tablet daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-27 20:50:31.085181	2025-08-27 20:50:31.085181
300	1	26	2025-08-27 20:50:31.084438	2025-08-27 20:50:31	\N	Take 1 capsule daily	ไม่ระบุ	ไม่ระบุ	Active	\N	2025-08-27 20:50:31.084438	2025-08-27 20:50:31.084438
302	1	14	2025-08-27 20:50:31.088005	2025-08-27 00:00:00	\N	Take 1 tablet with breakfast	ไม่ระบุ	ไม่ระบุ	ongoing		2025-08-27 20:50:31.088005	2025-08-27 20:50:31.088005
\.


--
-- Data for Name: medicine_order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY med.medicine_order (order_id, med_id_list, patient_id, doctor_name, description, "time") FROM stdin;
\.


--
-- Data for Name: medicines_TEST; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY med."medicines_TEST" (med_id, med_name, med_generic_name, med_scientific_name, med_description, med_dosage, med_side_effect, med_interaction, med_price, med_type, med_type_th) FROM stdin;
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
-- Data for Name: noti_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY med.noti_rules (rule_id, rule_name, rule_type, related_table, trigger_condition, template_title, template_message, recipient_role_id, check_frequency, is_active, last_checked_at) FROM stdin;
3	New Order Request	new_request	{"main_table": "med_requests", "join_tables": {"users": {"on": {"join_table_column": "uid", "main_table_column": "requested_by"}, "table": "users"}, "med_table": {"on": {"join_table_column": "med_id", "main_table_column": "med_id"}, "table": "med_table"}}}	{"field": "status", "value": "pending", "operator": "="}	แจ้งเตือน: มีรายการเบิกยาใหม่	มีรายการเบิกยาใหม่จากผู้ใช้งาน [username] จำนวน [quantity] [unit] ของยา [med_name] (รหัส [med_id])	101	10	t	2025-08-28 20:08:30.032154
9	Expired Medicine Alert	expiry_alert	{"main_table": "med_subwarehouse"}	{"field": "exp_date", "value": "now()::date + interval '1 days'", "operator": "<="}	แจ้งเตือน: ยาหมดอายุ	ยา [med_showname] (รหัส [med_sid]) กำลังจะหมดอายุในวันที่ [exp_date] กรุณาตรวจสอบและดำเนินการ	101	86400	t	2025-08-28 20:08:30.034925
1	Low Stock Alert	stock_alert	{"main_table": "med_subwarehouse"}	{"field": "med_quantity", "value": 10, "operator": "<="}	แจ้งเตือน: สินค้าใกล้หมดสต็อก	ยา [med_showname] (รหัส [med_sid]) เหลือเพียง [med_quantity] ชิ้น โปรดทำการสั่งซื้อเพิ่ม	101	60	t	2025-08-28 20:08:30.037162
2	Expiring Soon Alert	exp_date_warning	{"main_table": "med_subwarehouse"}	{"field": "exp_date", "value": "now()::date + interval '7 days'", "operator": "<="}	แจ้งเตือน: ยาใกล้หมดอายุ	ยา [med_showname] (รหัส [med_sid]) จะหมดอายุในวันที่ [exp_date] โปรดดำเนินการ	101	1440	t	2025-08-28 20:08:30.041532
7	Error Medication Report	error_report_alert	{"main_table": "error_medication", "join_tables": {"patient": {"on": {"join_table_column": "patient_id", "main_table_column": "patient_id"}, "table": "patient"}, "med_table": {"on": {"join_table_column": "med_id", "main_table_column": "med_id"}, "table": "med_table"}}}	{"field": "created_at", "value": "now()::date", "operator": ">="}	แจ้งเตือน: มีการรายงาน Error Medication ใหม่	มีการรายงานข้อผิดพลาดทางการจ่ายยาใหม่สำหรับผู้ป่วย [patient_id]	101	1440	t	2025-08-28 20:08:30.05346
4	Overdue Dispense Alert	overdue_alert	{"main_table": "overdue_med", "join_tables": {"patient": {"on": {"join_table_column": "patient_id", "main_table_column": "patient_id"}, "table": "patient"}, "med_table": {"on": {"join_table_column": "med_id", "main_table_column": "med_id"}, "table": "med_table"}}}	{"field": "dispense_status", "value": false, "operator": "="}	แจ้งเตือน: ยาค้างจ่าย	มีรายการยาของ [first_name] [last_name] ค้างจ่ายในวันที่ [time] (รหัสค้างจ่าย [overdue_id])	101	60	t	2025-08-28 20:08:30.0482
6	ADR Report	adr_report_alert	{"main_table": "adr_registry", "join_tables": {"patient": {"on": {"join_table_column": "patient_id", "main_table_column": "patient_id"}, "table": "patient"}, "med_table": {"on": {"join_table_column": "med_id", "main_table_column": "med_id"}, "table": "med_table"}}}	{"field": "reported_at", "value": "now()::date", "operator": ">="}	แจ้งเตือน: มีการรายงาน ADR ใหม่	มีการรายงานอาการไม่พึงประสงค์ (ADR) ใหม่จากผู้ป่วย [first_name] [last_name] สำหรับยา [med_name]	101	1440	t	2025-08-28 20:08:30.05823
5	Cut-off Period Approaching	cut_off_alert	{"main_table": "med_cut_off_period", "join_tables": {"sub_warehouse": {"on": {"join_table_column": "sub_warehouse_id", "main_table_column": "sub_warehouse_id"}, "table": "sub_warehouse"}}}	{"field": "MAKE_DATE(EXTRACT(YEAR FROM NOW())::INTEGER, period_month, period_day)", "value": "NOW()::DATE - INTERVAL '7 days'", "operator": "<"}	แจ้งเตือน: ถึงรอบตัดยอดการเบิกจ่ายยา	กำลังจะถึงรอบตัดยอดเบิกจ่ายยาสำหรับคลัง [name] วันที่ [period_day] เดือน [period_month]	101	1440	t	2025-08-28 20:08:30.063808
\.


--
-- Data for Name: notification_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY med.notification_log (log_id, rule_id, related_table, related_id, sent_at) FROM stdin;
1	3	med_requests	75	2025-08-27 17:49:00.039249
2	3	med_requests	76	2025-08-27 17:49:00.050354
3	3	med_requests	74	2025-08-27 17:49:00.058719
4	3	med_requests	68	2025-08-27 17:49:00.067529
5	3	med_requests	73	2025-08-27 17:49:00.07526
6	3	med_requests	72	2025-08-27 17:49:00.083715
7	3	med_requests	71	2025-08-27 17:49:00.091963
8	9	med_subwarehouse	286	2025-08-27 17:49:00.103031
9	2	med_subwarehouse	269	2025-08-27 17:49:00.113331
10	2	med_subwarehouse	286	2025-08-27 17:49:00.120094
11	7	error_medication	21	2025-08-27 17:49:00.131281
12	7	error_medication	22	2025-08-27 17:49:00.137986
13	4	overdue_med	33	2025-08-27 17:49:00.151674
14	4	overdue_med	34	2025-08-27 17:49:00.159729
15	4	overdue_med	35	2025-08-27 17:49:00.167299
16	4	overdue_med	36	2025-08-27 17:49:00.174372
17	6	adr_registry	13	2025-08-27 17:49:00.186101
18	5	med_cut_off_period	21	2025-08-27 17:49:00.198758
19	1	med_subwarehouse	286	2025-08-27 22:31:00.049391
20	7	error_medication	23	2025-08-28 01:23:30.082694
21	6	adr_registry	14	2025-08-28 01:23:50.083004
22	4	overdue_med	37	2025-08-28 11:50:20.103579
23	2	med_subwarehouse	269	2025-08-28 18:30:44.416822
24	3	med_requests	75	2025-08-28 18:30:44.434538
25	3	med_requests	76	2025-08-28 18:30:44.441685
26	3	med_requests	74	2025-08-28 18:30:44.447663
27	3	med_requests	68	2025-08-28 18:30:44.453923
28	3	med_requests	73	2025-08-28 18:30:44.461531
29	3	med_requests	72	2025-08-28 18:30:44.468704
30	3	med_requests	71	2025-08-28 18:30:44.474762
31	4	overdue_med	36	2025-08-28 18:30:44.493713
32	5	med_cut_off_period	21	2025-08-28 18:30:44.523102
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY med.notifications (notification_id, user_id, title, message, type, related_table, related_id, is_read, created_at, updated_at) FROM stdin;
19	8	แจ้งเตือน: สินค้าใกล้หมดสต็อก	ยา อะไรไม่รู้-555 (รหัส 286) เหลือเพียง 2 ชิ้น โปรดทำการสั่งซื้อเพิ่ม	\N	med_subwarehouse	286	t	2025-08-27 22:31:00.044507	\N
20	8	แจ้งเตือน: มีการรายงาน Error Medication ใหม่	มีการรายงานข้อผิดพลาดทางการจ่ายยาใหม่สำหรับผู้ป่วย 9	\N	error_medication	23	t	2025-08-28 01:23:30.077436	\N
6	8	แจ้งเตือน: มีรายการเบิกยาใหม่	มีรายการเบิกยาใหม่จากผู้ใช้งาน น.พ จิรวัฒน์ เจนจบธรรม จำนวน 200 กล่อง ของยา Aspirin (รหัส 4)	\N	med_requests	72	t	2025-08-27 17:49:00.080921	\N
7	8	แจ้งเตือน: มีรายการเบิกยาใหม่	มีรายการเบิกยาใหม่จากผู้ใช้งาน น.พ จิรวัฒน์ เจนจบธรรม จำนวน 500 กล่อง ของยา Aspirin (รหัส 4)	\N	med_requests	71	t	2025-08-27 17:49:00.088964	\N
21	8	แจ้งเตือน: มีการรายงาน ADR ใหม่	มีการรายงานอาการไม่พึงประสงค์ (ADR) ใหม่จากผู้ป่วย เกรียงไกร เกษมสุข สำหรับยา Paracetamol	\N	adr_registry	14	t	2025-08-28 01:23:50.079188	\N
1	8	แจ้งเตือน: มีรายการเบิกยาใหม่	มีรายการเบิกยาใหม่จากผู้ใช้งาน น.พ จิรวัฒน์ เจนจบธรรม จำนวน 300 ขวด ของยา Amoxicillin (รหัส 3)	\N	med_requests	75	t	2025-08-27 17:49:00.034857	\N
2	8	แจ้งเตือน: มีรายการเบิกยาใหม่	มีรายการเบิกยาใหม่จากผู้ใช้งาน น.พ จิรวัฒน์ เจนจบธรรม จำนวน 50 กล่อง ของยา Lisinopril (รหัส 22)	\N	med_requests	76	t	2025-08-27 17:49:00.047141	\N
3	8	แจ้งเตือน: มีรายการเบิกยาใหม่	มีรายการเบิกยาใหม่จากผู้ใช้งาน น.พ จิรวัฒน์ เจนจบธรรม จำนวน 200 หลอด ของยา Bisoprolol (รหัส 23)	\N	med_requests	74	t	2025-08-27 17:49:00.05433	\N
4	8	แจ้งเตือน: มีรายการเบิกยาใหม่	มีรายการเบิกยาใหม่จากผู้ใช้งาน น.พ จิรวัฒน์ เจนจบธรรม จำนวน 1 หลอด ของยา Fluoxetine (รหัส 29)	\N	med_requests	68	t	2025-08-27 17:49:00.064417	\N
5	8	แจ้งเตือน: มีรายการเบิกยาใหม่	มีรายการเบิกยาใหม่จากผู้ใช้งาน น.พ จิรวัฒน์ เจนจบธรรม จำนวน 100 กล่อง ของยา Aspirin (รหัส 4)	\N	med_requests	73	t	2025-08-27 17:49:00.072481	\N
8	8	แจ้งเตือน: ยาหมดอายุ	ยา อะไรไม่รู้-555 (รหัส 286) กำลังจะหมดอายุในวันที่ 26/8/2568 กรุณาตรวจสอบและดำเนินการ	\N	med_subwarehouse	286	t	2025-08-27 17:49:00.10065	\N
9	8	แจ้งเตือน: ยาใกล้หมดอายุ	ยา ลิซิโนพริล 10mg กล่อง 100 เม็ด (รหัส 269) จะหมดอายุในวันที่ 2/9/2568 โปรดดำเนินการ	\N	med_subwarehouse	269	t	2025-08-27 17:49:00.110416	\N
10	8	แจ้งเตือน: ยาใกล้หมดอายุ	ยา อะไรไม่รู้-555 (รหัส 286) จะหมดอายุในวันที่ 26/8/2568 โปรดดำเนินการ	\N	med_subwarehouse	286	t	2025-08-27 17:49:00.117271	\N
11	8	แจ้งเตือน: มีการรายงาน Error Medication ใหม่	มีการรายงานข้อผิดพลาดทางการจ่ายยาใหม่สำหรับผู้ป่วย 5	\N	error_medication	21	t	2025-08-27 17:49:00.128372	\N
12	8	แจ้งเตือน: มีการรายงาน Error Medication ใหม่	มีการรายงานข้อผิดพลาดทางการจ่ายยาใหม่สำหรับผู้ป่วย 5	\N	error_medication	22	t	2025-08-27 17:49:00.134492	\N
13	8	แจ้งเตือน: ยาค้างจ่าย	มีรายการยาของ สมชาย ใจดี ค้างจ่ายในวันที่ 24/8/2568 (รหัสค้างจ่าย 33)	\N	overdue_med	33	t	2025-08-27 17:49:00.148495	\N
14	8	แจ้งเตือน: ยาค้างจ่าย	มีรายการยาของ วิชัย ทองดี ค้างจ่ายในวันที่ 25/8/2568 (รหัสค้างจ่าย 34)	\N	overdue_med	34	t	2025-08-27 17:49:00.156868	\N
15	8	แจ้งเตือน: ยาค้างจ่าย	มีรายการยาของ วิชัย ทองดี ค้างจ่ายในวันที่ 25/8/2568 (รหัสค้างจ่าย 35)	\N	overdue_med	35	t	2025-08-27 17:49:00.164641	\N
16	8	แจ้งเตือน: ยาค้างจ่าย	มีรายการยาของ วิชัย ทองดี ค้างจ่ายในวันที่ 25/8/2568 (รหัสค้างจ่าย 36)	\N	overdue_med	36	t	2025-08-27 17:49:00.171094	\N
17	8	แจ้งเตือน: มีการรายงาน ADR ใหม่	มีการรายงานอาการไม่พึงประสงค์ (ADR) ใหม่จากผู้ป่วย ปกรณ์ รุ่งเรือง สำหรับยา Clopidogrel	\N	adr_registry	13	t	2025-08-27 17:49:00.183072	\N
18	8	แจ้งเตือน: ถึงรอบตัดยอดการเบิกจ่ายยา	กำลังจะถึงรอบตัดยอดเบิกจ่ายยาสำหรับคลัง ห้องจ่ายยา IPD วันที่ 1 เดือน 8	\N	med_cut_off_period	21	t	2025-08-27 17:49:00.195901	\N
22	8	แจ้งเตือน: ยาค้างจ่าย	มีรายการยาของ วิชัย ทองดี ค้างจ่ายในวันที่ 25/8/2568 (รหัสค้างจ่าย 37)	\N	overdue_med	37	t	2025-08-28 11:50:20.094356	\N
23	8	แจ้งเตือน: ยาใกล้หมดอายุ	ยา ลิซิโนพริล 10mg กล่อง 100 เม็ด (รหัส 269) จะหมดอายุในวันที่ 2/9/2568 โปรดดำเนินการ	\N	med_subwarehouse	269	f	2025-08-28 18:30:44.407539	\N
24	8	แจ้งเตือน: มีรายการเบิกยาใหม่	มีรายการเบิกยาใหม่จากผู้ใช้งาน น.พ จิรวัฒน์ เจนจบธรรม จำนวน 300 ขวด ของยา Amoxicillin (รหัส 3)	\N	med_requests	75	f	2025-08-28 18:30:44.430842	\N
25	8	แจ้งเตือน: มีรายการเบิกยาใหม่	มีรายการเบิกยาใหม่จากผู้ใช้งาน น.พ จิรวัฒน์ เจนจบธรรม จำนวน 50 กล่อง ของยา Lisinopril (รหัส 22)	\N	med_requests	76	f	2025-08-28 18:30:44.439599	\N
26	8	แจ้งเตือน: มีรายการเบิกยาใหม่	มีรายการเบิกยาใหม่จากผู้ใช้งาน น.พ จิรวัฒน์ เจนจบธรรม จำนวน 200 หลอด ของยา Bisoprolol (รหัส 23)	\N	med_requests	74	f	2025-08-28 18:30:44.445615	\N
27	8	แจ้งเตือน: มีรายการเบิกยาใหม่	มีรายการเบิกยาใหม่จากผู้ใช้งาน น.พ จิรวัฒน์ เจนจบธรรม จำนวน 1 หลอด ของยา Fluoxetine (รหัส 29)	\N	med_requests	68	f	2025-08-28 18:30:44.452122	\N
28	8	แจ้งเตือน: มีรายการเบิกยาใหม่	มีรายการเบิกยาใหม่จากผู้ใช้งาน น.พ จิรวัฒน์ เจนจบธรรม จำนวน 100 กล่อง ของยา Aspirin (รหัส 4)	\N	med_requests	73	f	2025-08-28 18:30:44.45889	\N
29	8	แจ้งเตือน: มีรายการเบิกยาใหม่	มีรายการเบิกยาใหม่จากผู้ใช้งาน น.พ จิรวัฒน์ เจนจบธรรม จำนวน 200 กล่อง ของยา Aspirin (รหัส 4)	\N	med_requests	72	f	2025-08-28 18:30:44.466335	\N
30	8	แจ้งเตือน: มีรายการเบิกยาใหม่	มีรายการเบิกยาใหม่จากผู้ใช้งาน น.พ จิรวัฒน์ เจนจบธรรม จำนวน 500 กล่อง ของยา Aspirin (รหัส 4)	\N	med_requests	71	f	2025-08-28 18:30:44.472715	\N
31	8	แจ้งเตือน: ยาค้างจ่าย	มีรายการยาของ วิชัย ทองดี ค้างจ่ายในวันที่ 25/8/2568 (รหัสค้างจ่าย 36)	\N	overdue_med	36	f	2025-08-28 18:30:44.491091	\N
32	8	แจ้งเตือน: ถึงรอบตัดยอดการเบิกจ่ายยา	กำลังจะถึงรอบตัดยอดเบิกจ่ายยาสำหรับคลัง ห้องจ่ายยา IPD วันที่ 1 เดือน 8	\N	med_cut_off_period	21	f	2025-08-28 18:30:44.521075	\N
\.


--
-- Data for Name: overdue_med; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY med.overdue_med (overdue_id, med_id, dispense_status, patient_id, med_sid, "time", doctor_id, quantity) FROM stdin;
33	30	t	1	285	2025-08-24 18:31:23.819965	8	1
34	23	t	3	270	2025-08-25 22:49:50.658746	8	4
35	26	t	3	279	2025-08-25 22:49:50.660447	8	3
37	22	f	3	269	2025-08-25 22:49:50.664004	8	1
36	1	f	3	230	2025-08-25 22:49:50.661773	8	2
20	7	t	4	\N	2025-08-22 22:18:49.233897	8	5
19	6	t	4	\N	2025-08-22 22:18:49.233897	8	9
18	3	t	2	\N	2025-08-22 22:18:49.233897	8	2
24	1	t	1	293	2025-08-22 22:18:49.233897	8	5
26	29	t	1	284	2025-08-22 22:18:49.233897	8	10
25	29	t	1	284	2025-08-22 22:18:49.233897	8	7
5	4	t	4	\N	2025-08-22 22:18:49.233897	8	2
6	4	t	1	\N	2025-08-22 22:18:49.233897	8	4
7	2	t	5	\N	2025-08-22 22:18:49.233897	8	1
8	3	t	5	\N	2025-08-22 22:18:49.233897	8	4
9	1	t	6	\N	2025-08-22 22:18:49.233897	8	3
10	5	t	7	\N	2025-08-22 22:18:49.233897	8	8
11	6	t	8	\N	2025-08-22 22:18:49.233897	8	7
12	1	t	8	\N	2025-08-22 22:18:49.233897	8	2
13	7	t	9	\N	2025-08-22 22:18:49.233897	8	3
14	2	t	10	\N	2025-08-22 22:18:49.233897	8	1
15	3	t	10	\N	2025-08-22 22:18:49.233897	8	3
16	5	t	3	\N	2025-08-22 22:18:49.233897	8	2
3	1	t	2	\N	2025-08-22 22:18:49.233897	8	2
17	1	t	1	\N	2025-08-22 22:18:49.233897	8	3
2	2	t	1	\N	2025-08-22 22:18:49.233897	8	1
1	1	t	1	\N	2025-08-22 22:18:49.233897	8	8
32	30	t	1	285	2025-08-24 18:29:37.415452	8	\N
31	4	t	1	238	2025-08-23 09:58:11.513773	8	1
30	26	t	1	278	2025-08-23 09:58:11.510339	8	1
29	15	t	1	258	2025-08-23 09:58:11.506915	8	5
28	4	t	1	237	2025-08-23 09:58:11.500398	8	10
27	23	t	1	270	2025-08-23 09:58:11.496401	8	7
21	1	t	1	\N	2025-08-22 22:18:49.233897	8	4
22	1	t	1	293	2025-08-22 22:18:49.233897	8	2
23	1	t	1	293	2025-08-22 22:18:49.233897	8	8
\.


--
-- Data for Name: patient; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY med.patient (patient_id, national_id, first_name, last_name, gender, birthday, age_y, age_m, age_d, blood_group, "PMH", phone, height, weight, bmi, patient_addr_id, hn_number, allergy_id, first_name_eng, last_name_eng, photo) FROM stdin;
1	1103700012345	สมชาย	ใจดี	ชาย	1985-07-12	38	8	5	O	ไม่มี	0812345678	170.5	68.2	23.5	1	90000001	\N	Somchai	Jaidee	somchai.jpg
2	1103700023456	สมหญิง	สวยงาม	หญิง	1990-03-25	34	0	10	A	แพ้ยาเพนิซิลลิน	0897654321	160.2	55	21.4	2	90000002	\N	Somying	Suai-ngam	somying.jpg
3	1103700034567	วิชัย	ทองดี	ชาย	1978-11-05	45	4	20	B	เบาหวาน	0812233445	175	80.5	26.3	3	90000003	\N	Wichai	Thongdee	wichai.jpg
4	1103700045678	อรทัย	บุญมาก	หญิง	1995-09-17	28	6	2	A	หอบหืด	0823344556	158.8	49.5	19.6	4	90000004	\N	Orathai	Boonmak	orathai.jpg
5	1103700056789	ปกรณ์	รุ่งเรือง	ชาย	1982-05-30	41	10	12	O	ความดันโลหิตสูง	0834455667	172.5	75.3	25.3	5	90000005	\N	Pakorn	Rungrueang	pakorn.jpg
6	1103700067890	ชลธิชา	สมสุข	หญิง	2000-12-08	23	3	18	A	แพ้อาหารทะเล	0845566778	165	60	22	6	90000006	\N	Chonthicha	Somsuk	chonthicha.jpg
7	1103700078901	ดำรง	มั่นคง	ชาย	1970-01-20	54	2	7	B	โรคหัวใจ	0856677889	168.2	72.8	25.8	7	90000007	\N	Damrong	Mankhong	damrong.jpg
8	1103700089012	ศิริพร	ไพศาล	หญิง	1988-07-03	35	8	22	A	ไม่มี	0867788990	162.3	57.2	21.8	8	90000008	\N	Siriporn	Paisan	siriporn.jpg
9	1103700090123	เกรียงไกร	เกษมสุข	ชาย	1992-02-15	32	1	10	O	ไมเกรน	0878899001	174	78	25.8	9	90000009	\N	Kriangkrai	Kasemsuk	kriangkrai.jpg
10	1103700101234	วราภรณ์	เพียรดี	หญิง	2005-06-29	19	9	1	A	ไม่มี	0889900112	159.5	50.8	20	10	90000010	\N	Waraporn	Phiendee	waraporn.jpg
11	1103700112345	ธนกร	ศรีสวัสดิ์	ชาย	1987-04-14	37	11	15	O	ไม่มี	0912345678	176.3	70.5	22.7	11	90000011	\N	Thanakorn	Srisawat	thanakorn.jpg
12	1103700123456	วรรณภา	ใจดี	หญิง	1998-09-22	25	6	7	A	แพ้ฝุ่น	0923456789	162	52	19.8	12	90000012	\N	Wannapha	Jaidee	wannapha.jpg
13	1103700134567	กิตติ	รุ่งโรจน์	ชาย	1993-06-01	30	9	28	B	ความดันโลหิตสูง	0934567890	173.5	76.2	25.3	13	90000013	\N	Kitti	Rungrot	kitti.jpg
14	1103700145678	อารีย์	วัฒนธรรม	หญิง	1975-02-10	49	1	18	A	เบาหวาน	0945678901	159.7	60.5	23.8	14	90000014	\N	Aree	Watthanatham	aree.jpg
15	1103700156789	อนุชา	สืบสกุล	ชาย	1989-12-25	34	3	5	O	หอบหืด	0956789012	175.8	79.3	25.7	15	90000015	\N	Anucha	Suebsakun	anucha.jpg
16	1103700167890	ชุติมา	มงคล	หญิง	2001-07-19	22	8	9	A	ไม่มี	0967890123	161.5	50.2	19.3	16	90000016	\N	Chutima	Mongkhon	chutima.jpg
17	1103700178901	ยุทธนา	แซ่ตั้ง	ชาย	1980-10-30	43	5	20	B	แพ้อาหารทะเล	0978901234	168.9	72.5	25.4	17	90000017	\N	Yutthana	Sae-Tang	yutthana.jpg
18	1103700189012	ลลิตา	ทวีทรัพย์	หญิง	1997-05-07	26	10	22	A	ไม่มี	0989012345	163.2	54.8	20.6	18	90000018	\N	Lalita	Thawisap	lalita.jpg
19	1103700190123	ประวิทย์	โสภณ	ชาย	1991-11-11	32	4	18	O	โรคหัวใจ	0990123456	172.7	78	26.2	19	90000019	\N	Prawit	Sophon	prawit.jpg
20	1103700201234	ศศิธร	อ่อนหวาน	หญิง	1984-08-08	39	7	5	A	ไมเกรน	0901234567	158.3	53	21.2	20	90000020	\N	Sasithorn	Onwan	sasithorn.jpg
\.


--
-- Data for Name: patient_address; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY med.patient_address (address_id, patient_addr_id, house_number, village_number, sub_district, district, province, road, postal_code) FROM stdin;
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

COPY med.rad_registry (rad_id, med_id, patient_id, description, acceptance, acceptance_time, specimen, pathogenic, indications, indications_criteria, submission_time, accept_by) FROM stdin;
1	2	5	ขอใช้ยาเพื่อรักษาเชื้อราในกระแสเลือด	t	2025-04-22 14:35:00	เสมหะ	Candida albicans	เชื้อราในเลือด	blood culture positive	2025-04-22 14:35:00	10
3	5	3	ขอใช้ยาต้านเชื้อแบคทีเรียดื้อยา	t	2025-04-19 09:10:00	เลือด	MRSA	ติดเชื้อดื้อยา	methicillin-resistant positive	2025-04-19 09:10:00	10
9	7	1	ขอใช้ยาควบคุมเชื้อราในช่องปาก	t	2025-08-28 17:13:51.568849	เสมหะ	Candida spp.	เชื้อราในช่องปาก	oral swab positive	2025-04-20 15:30:00	10
2	8	12	ขอใช้ยาต้านไวรัสตับอักเสบซี	f	\N	น้ำลาย	Hepatitis C Virus	ตับอักเสบ C	anti-HCV positive	2025-04-20 11:05:00	10
4	10	7	ขอใช้ยาในภาวะติดเชื้อ CRE ใน ICU	f	\N	น้ำไขสันหลัง	Klebsiella pneumoniae (CRE)	เชื้อดื้อยาใน ICU	carbapenem-resistant positive	2025-04-21 13:40:00	10
5	1	9	ขอใช้ยาควบคุมรักษาวัณโรค	f	\N	เสมหะ	Mycobacterium tuberculosis	วัณโรคปอด	ผล smear positive	2025-04-24 08:15:00	10
6	6	14	ขอใช้ยาต้านมาลาเรีย	f	\N	น้ำลาย	Plasmodium falciparum	ไข้มาลาเรีย	malaria smear positive	2025-04-18 16:20:00	10
7	4	2	ขอใช้ยาในผู้ป่วยเยื่อหุ้มสมองอักเสบ	f	\N	น้ำไขสันหลัง	Neisseria meningitidis	เยื่อหุ้มสมองอักเสบ	culture positive	2025-04-23 10:45:00	10
8	3	6	ขอใช้ยาต้านไวรัส HIV	f	\N	เลือด	HIV	HIV infection	ผล anti-HIV positive	2025-04-17 12:00:00	10
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY med.roles (role_id, role_name, role_name_th, role_name_en) FROM stdin;
0	แอดมิน (Admin)	แอดมิน	Admin
99	แพทย์ (Doctor)	แพทย์	Doctor
100	พยาบาล (Nurse)	พยาบาล	Nurse
101	เภสัชกร (Pharmacist)	เภสัชกร	Pharmacist
102	ผู้ช่วยเภสัชกร (Pharmacy Assistant)	ผู้ช่วยเภสัชกร	Pharmacy Assistant
103	เจ้าหน้าที่คลังยา (Inventory Officer)	เจ้าหน้าที่คลังยา	Inventory Officer
\.


--
-- Data for Name: sticker_form; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY med.sticker_form (stk_id, fstk_form) FROM stdin;
\.


--
-- Data for Name: sub_warehouse; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY med.sub_warehouse (sub_warehouse_id, name, description, is_active) FROM stdin;
1	ห้องจ่ายยา OPD	สำหรับผู้ป่วยนอก	t
2	ห้องจ่ายยา IPD	สำหรับผู้ป่วยใน	t
3	ห้องจ่ายยา ICU	ใช้ในกรณีผู้ป่วยวิกฤต	t
4	ห้องยาเด็ก	คลังยาสำหรับเด็กอายุต่ำกว่า 15 ปี	t
5	ห้องยาแผนกฉุกเฉิน	เฉพาะกรณีฉุกเฉิน	t
\.


--
-- Data for Name: temp_humidity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY med.temp_humidity ("time", tempetature, humidity) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY med.users (uid, username, password, email, phone, role_id) FROM stdin;
9	inventory_staff	xyz	inventory@gmail.com	0888888888	103
7	admin	1234	admin@gmail.com	0000000000	0
8	น.พ จิรวัฒน์ เจนจบธรรม	abcd	pharmacy1@gmail.com	0999999999	101
10	พ.ญ วรรณิภา สร้อยดอกศร	doc123	doctor@gmail.com	0111111110	99
\.


--
-- Name: adr_registry_adr_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('med.adr_registry_adr_id_seq', 14, true);


--
-- Name: allergy_registry_allr_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('med.allergy_registry_allr_id_seq', 24, true);


--
-- Name: error_medication_err_med_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('med.error_medication_err_med_id_seq', 23, true);


--
-- Name: expired_medicines_expired_med_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('med.expired_medicines_expired_med_id_seq', 6, true);


--
-- Name: med_cut_off_period_med_period_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('med.med_cut_off_period_med_period_id_seq', 21, true);


--
-- Name: med_delivery_delivery_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('med.med_delivery_delivery_id_seq', 32, true);


--
-- Name: med_evaluation_me_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('med.med_evaluation_me_id_seq', 1, false);


--
-- Name: med_interaction_interacton_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('med.med_interaction_interacton_id_seq', 26, true);


--
-- Name: med_order_history_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('med.med_order_history_history_id_seq', 102, true);


--
-- Name: med_order_rights_med_rights_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('med.med_order_rights_med_rights_id_seq', 1, false);


--
-- Name: med_probolem_mp_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('med.med_probolem_mp_id_seq', 30, true);


--
-- Name: med_requests_request_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('med.med_requests_request_id_seq', 76, true);


--
-- Name: med_stock_history_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('med.med_stock_history_history_id_seq', 222, true);


--
-- Name: med_subwarehouse_med_sid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('med.med_subwarehouse_med_sid_seq', 286, true);


--
-- Name: med_table_med_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('med.med_table_med_id_seq', 45, true);


--
-- Name: med_usage_usage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('med.med_usage_usage_id_seq', 302, true);


--
-- Name: medicine_order_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('med.medicine_order_order_id_seq', 1, false);


--
-- Name: medicines_med_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('med.medicines_med_id_seq', 19, true);


--
-- Name: noti_rules_rule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('med.noti_rules_rule_id_seq', 9, true);


--
-- Name: notification_log_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('med.notification_log_log_id_seq', 32, true);


--
-- Name: notifications_notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('med.notifications_notification_id_seq', 32, true);


--
-- Name: overdue_med_overdue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('med.overdue_med_overdue_id_seq', 37, true);


--
-- Name: patient_address_address_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('med.patient_address_address_id_seq', 20, true);


--
-- Name: rad_regisrty_rad_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('med.rad_regisrty_rad_id_seq', 10, true);


--
-- Name: sticker_form_stk_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('med.sticker_form_stk_id_seq', 1, false);


--
-- Name: sub_warehouse_sub_warehouse_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('med.sub_warehouse_sub_warehouse_id_seq', 5, true);


--
-- Name: users_uid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('med.users_uid_seq', 10, true);


--
-- Name: patient_address addr_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.patient_address
    ADD CONSTRAINT addr_pk PRIMARY KEY (address_id) INCLUDE (address_id);


--
-- Name: adr_registry adr_registry_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.adr_registry
    ADD CONSTRAINT adr_registry_pkey PRIMARY KEY (adr_id);


--
-- Name: allergy_registry allergy_registry_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.allergy_registry
    ADD CONSTRAINT allergy_registry_pkey PRIMARY KEY (allr_id);


--
-- Name: error_medication error_medication_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.error_medication
    ADD CONSTRAINT error_medication_pkey PRIMARY KEY (err_med_id);


--
-- Name: expired_medicines expired_medicines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.expired_medicines
    ADD CONSTRAINT expired_medicines_pkey PRIMARY KEY (expired_med_id);


--
-- Name: med_cut_off_period med_cut_off_period_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_cut_off_period
    ADD CONSTRAINT med_cut_off_period_pkey PRIMARY KEY (med_period_id);


--
-- Name: med_delivery med_delivery_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_delivery
    ADD CONSTRAINT med_delivery_pkey PRIMARY KEY (delivery_id);


--
-- Name: med_evaluation med_evaluation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_evaluation
    ADD CONSTRAINT med_evaluation_pkey PRIMARY KEY (me_id);


--
-- Name: med_interaction med_interaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_interaction
    ADD CONSTRAINT med_interaction_pkey PRIMARY KEY (interaction_id);


--
-- Name: med_order_history med_order_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_order_history
    ADD CONSTRAINT med_order_history_pkey PRIMARY KEY (history_id);


--
-- Name: med_order_rights med_order_rights_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_order_rights
    ADD CONSTRAINT med_order_rights_pkey PRIMARY KEY (med_rights_id);


--
-- Name: med_problem med_probolem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_problem
    ADD CONSTRAINT med_probolem_pkey PRIMARY KEY (mp_id);


--
-- Name: med_requests med_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_requests
    ADD CONSTRAINT med_requests_pkey PRIMARY KEY (request_id);


--
-- Name: med_stock_history med_stock_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_stock_history
    ADD CONSTRAINT med_stock_history_pkey PRIMARY KEY (history_id);


--
-- Name: med_subwarehouse med_subwarehouse_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_subwarehouse
    ADD CONSTRAINT med_subwarehouse_pkey PRIMARY KEY (med_sid);


--
-- Name: med_table med_table_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_table
    ADD CONSTRAINT med_table_pkey PRIMARY KEY (med_id);


--
-- Name: med_usage med_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_usage
    ADD CONSTRAINT med_usage_pkey PRIMARY KEY (usage_id);


--
-- Name: medicine_order medicine_order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.medicine_order
    ADD CONSTRAINT medicine_order_pkey PRIMARY KEY (order_id);


--
-- Name: noti_rules noti_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.noti_rules
    ADD CONSTRAINT noti_rules_pkey PRIMARY KEY (rule_id);


--
-- Name: notification_log notification_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.notification_log
    ADD CONSTRAINT notification_log_pkey PRIMARY KEY (log_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- Name: overdue_med overdue_med_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.overdue_med
    ADD CONSTRAINT overdue_med_pkey PRIMARY KEY (overdue_id);


--
-- Name: patient patient_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.patient
    ADD CONSTRAINT patient_pkey PRIMARY KEY (patient_id);


--
-- Name: rad_registry rad_regisrty_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.rad_registry
    ADD CONSTRAINT rad_regisrty_pkey PRIMARY KEY (rad_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);


--
-- Name: sticker_form sticker_form_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.sticker_form
    ADD CONSTRAINT sticker_form_pkey PRIMARY KEY (stk_id);


--
-- Name: sub_warehouse sub_warehouse_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.sub_warehouse
    ADD CONSTRAINT sub_warehouse_pkey PRIMARY KEY (sub_warehouse_id);


--
-- Name: patient unique_hn_number; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.patient
    ADD CONSTRAINT unique_hn_number UNIQUE (hn_number);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (uid);


--
-- Name: fki_address_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_address_fk ON med.patient USING btree (patient_addr_id);


--
-- Name: fki_address_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_address_id ON med.patient USING btree (patient_addr_id);


--
-- Name: fki_med_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_med_id ON med.allergy_registry USING btree (med_id);


--
-- Name: fki_med_id_1; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_med_id_1 ON med.med_interaction USING btree (med_id_1);


--
-- Name: fki_med_id_2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_med_id_2 ON med.med_interaction USING btree (med_id_2);


--
-- Name: fki_patient_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_patient_id ON med.allergy_registry USING btree (patient_id);


--
-- Name: fki_role_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_role_fk ON med.users USING btree (role_id);


--
-- Name: fki_sub_warehouse_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_sub_warehouse_id ON med.med_cut_off_period USING btree (sub_warehouse_id);


--
-- Name: patient set_hn_number; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_hn_number BEFORE INSERT ON med.patient FOR EACH ROW EXECUTE FUNCTION med.generate_hn_number();


--
-- Name: med_subwarehouse update_med_subwarehouse_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_med_subwarehouse_updated_at BEFORE UPDATE ON med.med_subwarehouse FOR EACH ROW EXECUTE FUNCTION med.update_updated_at_column();


--
-- Name: allergy_registry fk_allergy_med; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.allergy_registry
    ADD CONSTRAINT fk_allergy_med FOREIGN KEY (med_id) REFERENCES med.med_table(med_id) ON DELETE CASCADE;


--
-- Name: allergy_registry fk_allergy_patient; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.allergy_registry
    ADD CONSTRAINT fk_allergy_patient FOREIGN KEY (patient_id) REFERENCES med.patient(patient_id) ON DELETE CASCADE;


--
-- Name: med_delivery fk_delivery_patient; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_delivery
    ADD CONSTRAINT fk_delivery_patient FOREIGN KEY (patient_id) REFERENCES med.patient(patient_id) ON DELETE CASCADE;


--
-- Name: error_medication fk_error_medication; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.error_medication
    ADD CONSTRAINT fk_error_medication FOREIGN KEY (med_sid) REFERENCES med.med_subwarehouse(med_sid) ON DELETE SET NULL;


--
-- Name: med_requests fk_med_subwarehouse; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_requests
    ADD CONSTRAINT fk_med_subwarehouse FOREIGN KEY (med_sid) REFERENCES med.med_subwarehouse(med_sid) ON DELETE SET NULL;


--
-- Name: notifications fk_notifications_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.notifications
    ADD CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES med.users(uid) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: patient fk_patient_address_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.patient
    ADD CONSTRAINT fk_patient_address_id FOREIGN KEY (patient_addr_id) REFERENCES med.patient_address(address_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: med_order_history fk_patient_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_order_history
    ADD CONSTRAINT fk_patient_id FOREIGN KEY (patient_id) REFERENCES med.patient(patient_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: med_problem fk_problem_med; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_problem
    ADD CONSTRAINT fk_problem_med FOREIGN KEY (med_id) REFERENCES med.med_table(med_id) ON DELETE CASCADE;


--
-- Name: med_problem fk_problem_usage; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_problem
    ADD CONSTRAINT fk_problem_usage FOREIGN KEY (usage_id) REFERENCES med.med_usage(usage_id) ON DELETE SET NULL;


--
-- Name: allergy_registry med_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.allergy_registry
    ADD CONSTRAINT med_id FOREIGN KEY (med_id) REFERENCES med.med_table(med_id) MATCH FULL NOT VALID;


--
-- Name: overdue_med med_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.overdue_med
    ADD CONSTRAINT med_id FOREIGN KEY (med_id) REFERENCES med.med_table(med_id) NOT VALID;


--
-- Name: rad_registry med_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.rad_registry
    ADD CONSTRAINT med_id FOREIGN KEY (med_id) REFERENCES med.med_table(med_id) NOT VALID;


--
-- Name: med_problem med_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_problem
    ADD CONSTRAINT med_id FOREIGN KEY (med_id) REFERENCES med.med_table(med_id) NOT VALID;


--
-- Name: med_evaluation med_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_evaluation
    ADD CONSTRAINT med_id FOREIGN KEY (med_id) REFERENCES med.med_table(med_id) NOT VALID;


--
-- Name: adr_registry med_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.adr_registry
    ADD CONSTRAINT med_id FOREIGN KEY (med_id) REFERENCES med.med_table(med_id) NOT VALID;


--
-- Name: med_interaction med_id_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_interaction
    ADD CONSTRAINT med_id_1 FOREIGN KEY (med_id_1) REFERENCES med.med_table(med_id) NOT VALID;


--
-- Name: med_interaction med_id_2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_interaction
    ADD CONSTRAINT med_id_2 FOREIGN KEY (med_id_2) REFERENCES med.med_table(med_id) NOT VALID;


--
-- Name: med_requests med_requests_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_requests
    ADD CONSTRAINT med_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES med.users(uid);


--
-- Name: med_requests med_requests_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_requests
    ADD CONSTRAINT med_requests_request_id_fkey FOREIGN KEY (med_id) REFERENCES med.med_table(med_id);


--
-- Name: med_requests med_requests_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_requests
    ADD CONSTRAINT med_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES med.users(uid);


--
-- Name: med_stock_history med_stock_history_med_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_stock_history
    ADD CONSTRAINT med_stock_history_med_id_fkey FOREIGN KEY (med_id) REFERENCES med.med_table(med_id);


--
-- Name: med_subwarehouse med_subwarehouse_med_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.med_subwarehouse
    ADD CONSTRAINT med_subwarehouse_med_id_fkey FOREIGN KEY (med_id) REFERENCES med.med_table(med_id) ON DELETE CASCADE;


--
-- Name: medicine_order patient_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.medicine_order
    ADD CONSTRAINT patient_id FOREIGN KEY (patient_id) REFERENCES med.patient(patient_id) NOT VALID;


--
-- Name: overdue_med patient_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.overdue_med
    ADD CONSTRAINT patient_id FOREIGN KEY (patient_id) REFERENCES med.patient(patient_id) NOT VALID;


--
-- Name: rad_registry patient_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.rad_registry
    ADD CONSTRAINT patient_id FOREIGN KEY (patient_id) REFERENCES med.patient(patient_id) NOT VALID;


--
-- Name: users role_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY med.users
    ADD CONSTRAINT role_fk FOREIGN KEY (role_id) REFERENCES med.roles(role_id) NOT VALID;


--
-- PostgreSQL database dump complete
--

