--
-- PostgreSQL database dump
--

\restrict 023ds8XsS01ST66e0Jb4pJvjE88wdb0Y1s70kDr6G1RbNuj9en6EIUhGXWfTe3F

-- Dumped from database version 15.19
-- Dumped by pg_dump version 15.19

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO postgres;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: cash_entry_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.cash_entry_type AS ENUM (
    'masuk',
    'keluar'
);


ALTER TYPE public.cash_entry_type OWNER TO postgres;

--
-- Name: mutation_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.mutation_type AS ENUM (
    'masuk',
    'keluar',
    'penyesuaian',
    'transfer_masuk',
    'transfer_keluar',
    'reject'
);


ALTER TYPE public.mutation_type OWNER TO postgres;

--
-- Name: payment_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_type AS ENUM (
    'tunai',
    'tempo',
    'transfer',
    'cashless'
);


ALTER TYPE public.payment_type OWNER TO postgres;

--
-- Name: sale_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.sale_status AS ENUM (
    'lunas',
    'tempo',
    'partial'
);


ALTER TYPE public.sale_status OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: postgres
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: postgres
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE drizzle.__drizzle_migrations_id_seq OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: postgres
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: cash_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cash_entries (
    id integer NOT NULL,
    type text NOT NULL,
    amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    description text NOT NULL,
    reference text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.cash_entries OWNER TO postgres;

--
-- Name: cash_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cash_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cash_entries_id_seq OWNER TO postgres;

--
-- Name: cash_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cash_entries_id_seq OWNED BY public.cash_entries.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    name text NOT NULL,
    phone text,
    address text,
    credit_limit numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.customers_id_seq OWNER TO postgres;

--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: license_cache; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.license_cache (
    id integer NOT NULL,
    license_key text NOT NULL,
    is_valid boolean DEFAULT false NOT NULL,
    expires_at timestamp without time zone,
    cached_at timestamp without time zone DEFAULT now() NOT NULL,
    days_left integer,
    store_name text
);


ALTER TABLE public.license_cache OWNER TO postgres;

--
-- Name: license_cache_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.license_cache_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.license_cache_id_seq OWNER TO postgres;

--
-- Name: license_cache_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.license_cache_id_seq OWNED BY public.license_cache.id;


--
-- Name: payables; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payables (
    id integer NOT NULL,
    purchase_id integer NOT NULL,
    supplier_id integer NOT NULL,
    total_amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    paid_amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    status text DEFAULT 'unpaid'::text NOT NULL,
    due_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payables OWNER TO postgres;

--
-- Name: payables_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payables_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payables_id_seq OWNER TO postgres;

--
-- Name: payables_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payables_id_seq OWNED BY public.payables.id;


--
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_methods (
    id integer NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payment_methods OWNER TO postgres;

--
-- Name: payment_methods_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payment_methods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payment_methods_id_seq OWNER TO postgres;

--
-- Name: payment_methods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payment_methods_id_seq OWNED BY public.payment_methods.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    receivable_id integer,
    payable_id integer,
    amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    payment_method text DEFAULT 'tunai'::text NOT NULL,
    notes text,
    paid_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payments_id_seq OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: product_rolls; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_rolls (
    id integer NOT NULL,
    product_id integer NOT NULL,
    barcode text NOT NULL,
    original_length numeric(12,4) DEFAULT '0'::numeric NOT NULL,
    current_length numeric(12,4) DEFAULT '0'::numeric NOT NULL,
    status text DEFAULT 'available'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.product_rolls OWNER TO postgres;

--
-- Name: product_rolls_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_rolls_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_rolls_id_seq OWNER TO postgres;

--
-- Name: product_rolls_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_rolls_id_seq OWNED BY public.product_rolls.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name text NOT NULL,
    category_id integer,
    lot_number text DEFAULT ''::text NOT NULL,
    rack_location text DEFAULT ''::text NOT NULL,
    price_per_meter numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    price_per_roll numeric(15,2),
    roll_stock numeric(12,4) DEFAULT '0'::numeric NOT NULL,
    meter_stock numeric(12,4) DEFAULT '0'::numeric NOT NULL,
    min_stock numeric(12,4) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    barcode text DEFAULT ''::text NOT NULL,
    primary_unit text DEFAULT 'METER'::text NOT NULL,
    secondary_unit text DEFAULT 'ROLL'::text NOT NULL,
    image_url text,
    description text,
    cost_price_per_meter numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    cost_price_per_roll numeric(15,2)
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: purchase_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_items (
    id integer NOT NULL,
    purchase_id integer NOT NULL,
    product_id integer NOT NULL,
    rolls numeric(12,4) DEFAULT '0'::numeric NOT NULL,
    meters numeric(12,4) DEFAULT '0'::numeric NOT NULL,
    price_per_meter numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    subtotal numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    roll_id integer
);


ALTER TABLE public.purchase_items OWNER TO postgres;

--
-- Name: purchase_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.purchase_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.purchase_items_id_seq OWNER TO postgres;

--
-- Name: purchase_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.purchase_items_id_seq OWNED BY public.purchase_items.id;


--
-- Name: purchases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchases (
    id integer NOT NULL,
    invoice_number text NOT NULL,
    supplier_id integer NOT NULL,
    payment_type text DEFAULT 'tunai'::text NOT NULL,
    total_amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    paid_amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    status text DEFAULT 'lunas'::text NOT NULL,
    due_date timestamp without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.purchases OWNER TO postgres;

--
-- Name: purchases_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.purchases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.purchases_id_seq OWNER TO postgres;

--
-- Name: purchases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.purchases_id_seq OWNED BY public.purchases.id;


--
-- Name: push_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.push_subscriptions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    endpoint text NOT NULL,
    p256dh text NOT NULL,
    auth text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.push_subscriptions OWNER TO postgres;

--
-- Name: push_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.push_subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.push_subscriptions_id_seq OWNER TO postgres;

--
-- Name: push_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.push_subscriptions_id_seq OWNED BY public.push_subscriptions.id;


--
-- Name: receivables; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.receivables (
    id integer NOT NULL,
    sale_id integer NOT NULL,
    customer_id integer,
    total_amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    paid_amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    status text DEFAULT 'unpaid'::text NOT NULL,
    due_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.receivables OWNER TO postgres;

--
-- Name: receivables_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.receivables_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.receivables_id_seq OWNER TO postgres;

--
-- Name: receivables_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.receivables_id_seq OWNED BY public.receivables.id;


--
-- Name: return_exchanged_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.return_exchanged_items (
    id integer NOT NULL,
    return_id integer NOT NULL,
    product_id integer NOT NULL,
    roll_id integer,
    rolls numeric(12,4) DEFAULT '0'::numeric NOT NULL,
    meters numeric(12,4) DEFAULT '0'::numeric NOT NULL,
    price_per_meter numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    subtotal numeric(15,2) DEFAULT '0'::numeric NOT NULL
);


ALTER TABLE public.return_exchanged_items OWNER TO postgres;

--
-- Name: return_exchanged_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.return_exchanged_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.return_exchanged_items_id_seq OWNER TO postgres;

--
-- Name: return_exchanged_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.return_exchanged_items_id_seq OWNED BY public.return_exchanged_items.id;


--
-- Name: return_returned_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.return_returned_items (
    id integer NOT NULL,
    return_id integer NOT NULL,
    product_id integer NOT NULL,
    roll_id integer,
    rolls numeric(12,4) DEFAULT '0'::numeric NOT NULL,
    meters numeric(12,4) DEFAULT '0'::numeric NOT NULL,
    price_per_meter numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    subtotal numeric(15,2) DEFAULT '0'::numeric NOT NULL
);


ALTER TABLE public.return_returned_items OWNER TO postgres;

--
-- Name: return_returned_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.return_returned_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.return_returned_items_id_seq OWNER TO postgres;

--
-- Name: return_returned_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.return_returned_items_id_seq OWNED BY public.return_returned_items.id;


--
-- Name: returns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.returns (
    id integer NOT NULL,
    return_number text NOT NULL,
    type text NOT NULL,
    sale_id integer,
    purchase_id integer,
    customer_id integer,
    supplier_id integer,
    total_returned_value numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    total_exchanged_value numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    difference_amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    payment_status text DEFAULT 'lunas'::text NOT NULL,
    cash_refunded numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    status text DEFAULT 'selesai'::text NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.returns OWNER TO postgres;

--
-- Name: returns_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.returns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.returns_id_seq OWNER TO postgres;

--
-- Name: returns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.returns_id_seq OWNED BY public.returns.id;


--
-- Name: sale_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_items (
    id integer NOT NULL,
    sale_id integer NOT NULL,
    product_id integer NOT NULL,
    rolls numeric(12,4) DEFAULT '0'::numeric NOT NULL,
    meters numeric(12,4) DEFAULT '0'::numeric NOT NULL,
    price_per_meter numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    subtotal numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    roll_id integer
);


ALTER TABLE public.sale_items OWNER TO postgres;

--
-- Name: sale_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sale_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sale_items_id_seq OWNER TO postgres;

--
-- Name: sale_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sale_items_id_seq OWNED BY public.sale_items.id;


--
-- Name: sales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales (
    id integer NOT NULL,
    invoice_number text NOT NULL,
    customer_id integer,
    payment_type text DEFAULT 'tunai'::text NOT NULL,
    total_amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    paid_amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    status text DEFAULT 'lunas'::text NOT NULL,
    due_date timestamp without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sales OWNER TO postgres;

--
-- Name: sales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sales_id_seq OWNER TO postgres;

--
-- Name: sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sales_id_seq OWNED BY public.sales.id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    key text NOT NULL,
    value text NOT NULL,
    description text,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- Name: stock_mutations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_mutations (
    id integer NOT NULL,
    product_id integer NOT NULL,
    type text NOT NULL,
    rolls numeric(12,4) DEFAULT '0'::numeric NOT NULL,
    meters numeric(12,4) DEFAULT '0'::numeric NOT NULL,
    description text NOT NULL,
    reference text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    roll_id integer
);


ALTER TABLE public.stock_mutations OWNER TO postgres;

--
-- Name: stock_mutations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_mutations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.stock_mutations_id_seq OWNER TO postgres;

--
-- Name: stock_mutations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_mutations_id_seq OWNED BY public.stock_mutations.id;


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suppliers (
    id integer NOT NULL,
    name text NOT NULL,
    phone text,
    address text,
    contact_person text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.suppliers OWNER TO postgres;

--
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.suppliers_id_seq OWNER TO postgres;

--
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;


--
-- Name: units; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.units (
    id integer NOT NULL,
    name text NOT NULL,
    symbol text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.units OWNER TO postgres;

--
-- Name: units_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.units_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.units_id_seq OWNER TO postgres;

--
-- Name: units_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.units_id_seq OWNED BY public.units.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password_hash text NOT NULL,
    full_name text NOT NULL,
    role text DEFAULT 'admin'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: cash_entries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cash_entries ALTER COLUMN id SET DEFAULT nextval('public.cash_entries_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: license_cache id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.license_cache ALTER COLUMN id SET DEFAULT nextval('public.license_cache_id_seq'::regclass);


--
-- Name: payables id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payables ALTER COLUMN id SET DEFAULT nextval('public.payables_id_seq'::regclass);


--
-- Name: payment_methods id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_methods ALTER COLUMN id SET DEFAULT nextval('public.payment_methods_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: product_rolls id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_rolls ALTER COLUMN id SET DEFAULT nextval('public.product_rolls_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: purchase_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_items ALTER COLUMN id SET DEFAULT nextval('public.purchase_items_id_seq'::regclass);


--
-- Name: purchases id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases ALTER COLUMN id SET DEFAULT nextval('public.purchases_id_seq'::regclass);


--
-- Name: push_subscriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.push_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.push_subscriptions_id_seq'::regclass);


--
-- Name: receivables id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receivables ALTER COLUMN id SET DEFAULT nextval('public.receivables_id_seq'::regclass);


--
-- Name: return_exchanged_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_exchanged_items ALTER COLUMN id SET DEFAULT nextval('public.return_exchanged_items_id_seq'::regclass);


--
-- Name: return_returned_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_returned_items ALTER COLUMN id SET DEFAULT nextval('public.return_returned_items_id_seq'::regclass);


--
-- Name: returns id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.returns ALTER COLUMN id SET DEFAULT nextval('public.returns_id_seq'::regclass);


--
-- Name: sale_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items ALTER COLUMN id SET DEFAULT nextval('public.sale_items_id_seq'::regclass);


--
-- Name: sales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales ALTER COLUMN id SET DEFAULT nextval('public.sales_id_seq'::regclass);


--
-- Name: stock_mutations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_mutations ALTER COLUMN id SET DEFAULT nextval('public.stock_mutations_id_seq'::regclass);


--
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- Name: units id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.units ALTER COLUMN id SET DEFAULT nextval('public.units_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: postgres
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
1	0f8a131c0015d55620be653a6b35a4fd77c2667a7a09ce02d165359022c1459b	1781428334163
2	7927b0efbeb0030eab8fac39616ca54fd5e373c777131c2f3667f4129d38600a	1784340579647
3	39006dea85fbc46637f3ba0f86f1c5f58068cab9a34b7b68a4fd1ae355b7a22c	1789001375939
\.


--
-- Data for Name: cash_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cash_entries (id, type, amount, description, reference, created_at) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, description, created_at, updated_at) FROM stdin;
11	COTTON COMBET STRETCH 240-260GSM	WOVEN	2026-09-11 06:18:32.610019	2026-09-11 06:19:29.986
10	BARANG RUSAK/CACAT	WOVEN	2026-09-11 04:35:13.106128	2026-09-11 06:19:39.41
3	BENGALINE	WOVEN	2026-09-10 07:52:51.944853	2026-09-11 06:19:48.308
6	CRINKLE AIRFLOW DIAMOND	WOVEN	2026-09-10 12:29:36.836878	2026-09-11 06:19:51.678
5	CRINKLE AIRFLOW PLATINUM	WOVEN	2026-09-10 10:54:48.79692	2026-09-11 06:20:00.419
4	OTOMEN 	WOVEN	2026-09-10 08:18:07.04504	2026-09-11 06:20:03.922
2	POLO LINEN	WOVEN	2026-09-10 05:19:01.338809	2026-09-11 06:20:07.703
9	RAYON DIPI PLATINUM	WOVEN	2026-09-11 03:46:19.653113	2026-09-11 06:20:11.335
8	RAYON DIPI THE BEST	WOVEN	2026-09-11 03:46:12.223169	2026-09-11 06:20:14.001
7	RAYON MOTIF THE BEST	WOVEN	2026-09-11 03:45:58.454598	2026-09-11 06:20:23.258
1	RAYON TWILL	WOVEN	2026-09-10 05:18:50.681615	2026-09-11 06:20:26.993
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, name, phone, address, credit_limit, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: license_cache; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.license_cache (id, license_key, is_valid, expires_at, cached_at, days_left, store_name) FROM stdin;
1	VOC-ZJG8-260912-B4BJ	t	2026-10-12 09:31:04.451	2026-09-12 09:34:14.169	30	ENKA SERVER
\.


--
-- Data for Name: payables; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payables (id, purchase_id, supplier_id, total_amount, paid_amount, status, due_date, created_at, updated_at) FROM stdin;
44	49	3	294664300.00	0.00	unpaid	\N	2026-09-12 05:54:45.123889	2026-09-12 05:54:45.123889
45	50	3	307729500.00	0.00	unpaid	\N	2026-09-12 06:12:50.639375	2026-09-12 06:12:50.639375
46	51	4	304843250.00	0.00	unpaid	\N	2026-09-12 06:32:58.872433	2026-09-12 06:32:58.872433
47	52	2	720432900.00	0.00	unpaid	\N	2026-09-12 06:55:24.595516	2026-09-12 06:55:24.595516
48	54	2	109310850.00	0.00	unpaid	\N	2026-09-12 07:56:49.154059	2026-09-12 07:56:49.154059
49	55	2	30182625.00	0.00	unpaid	\N	2026-09-12 08:01:21.573706	2026-09-12 08:01:21.573706
50	56	2	860772825.00	0.00	unpaid	2026-10-12 00:00:00	2026-09-12 08:58:57.962711	2026-09-12 08:58:57.962711
\.


--
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_methods (id, code, name, is_active, sort_order, created_at) FROM stdin;
1	tunai	Tunai / Cash	t	0	2026-09-10 02:48:28.042166
2	transfer	Transfer Bank	t	1	2026-09-10 02:48:28.042166
3	debit	Kartu Debit	t	2	2026-09-10 02:48:28.042166
4	qris	QRIS	t	3	2026-09-10 02:48:28.042166
5	kredit	Kredit / Tempo	t	4	2026-09-10 02:48:28.042166
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, receivable_id, payable_id, amount, payment_method, notes, paid_at) FROM stdin;
\.


--
-- Data for Name: product_rolls; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_rolls (id, product_id, barcode, original_length, current_length, status, created_at, updated_at) FROM stdin;
1	1	PRD-1789017671180-R1789017696235	120.0000	120.0000	available	2026-09-10 05:21:36.237214	2026-09-10 05:21:36.237214
1205	12	PRD-1789018691298-R1789025792495	120.4000	120.4000	available	2026-09-10 07:36:32.49656	2026-09-10 07:36:32.49656
14	1	PRD-1789017671180-R1789017794455	120.0000	120.0000	available	2026-09-10 05:23:14.45696	2026-09-10 05:23:14.45696
15	1	PRD-1789017671180-R1789017795469	130.1000	130.1000	available	2026-09-10 05:23:15.47142	2026-09-10 05:23:15.47142
16	1	PRD-1789017671180-R1789017795614	120.2000	120.2000	available	2026-09-10 05:23:15.615067	2026-09-10 05:23:15.615067
17	1	PRD-1789017671180-R1789017795740	118.7000	118.7000	available	2026-09-10 05:23:15.742061	2026-09-10 05:23:15.742061
18	1	PRD-1789017671180-R1789017795855	139.9000	139.9000	available	2026-09-10 05:23:15.857136	2026-09-10 05:23:15.857136
19	1	PRD-1789017671180-R1789017795950	117.0000	117.0000	available	2026-09-10 05:23:15.952343	2026-09-10 05:23:15.952343
20	1	PRD-1789017671180-R1789017796055	105.0000	105.0000	available	2026-09-10 05:23:16.057123	2026-09-10 05:23:16.057123
21	1	PRD-1789017671180-R1789017796159	121.5000	121.5000	available	2026-09-10 05:23:16.160102	2026-09-10 05:23:16.160102
22	1	PRD-1789017671180-R1789017796274	80.5000	80.5000	available	2026-09-10 05:23:16.275593	2026-09-10 05:23:16.275593
23	1	PRD-1789017671180-R1789017796374	121.3000	121.3000	available	2026-09-10 05:23:16.375333	2026-09-10 05:23:16.375333
24	1	PRD-1789017671180-R1789017796488	120.6000	120.6000	available	2026-09-10 05:23:16.489073	2026-09-10 05:23:16.489073
26	1	PRD-1789017671180-R1789017832730	109.4000	109.4000	available	2026-09-10 05:23:52.73218	2026-09-10 05:23:52.73218
27	2	PRD-1789018062554-R1789018109185	113.6000	113.6000	available	2026-09-10 05:28:29.186919	2026-09-10 05:28:29.186919
28	2	PRD-1789018062554-R1789018109386	115.6000	115.6000	available	2026-09-10 05:28:29.388188	2026-09-10 05:28:29.388188
29	2	PRD-1789018062554-R1789018109559	114.6000	114.6000	available	2026-09-10 05:28:29.561245	2026-09-10 05:28:29.561245
30	2	PRD-1789018062554-R1789018109768	115.6000	115.6000	available	2026-09-10 05:28:29.769942	2026-09-10 05:28:29.769942
31	2	PRD-1789018062554-R1789018109961	115.3000	115.3000	available	2026-09-10 05:28:29.963434	2026-09-10 05:28:29.963434
32	2	PRD-1789018062554-R1789018110152	113.3000	113.3000	available	2026-09-10 05:28:30.15347	2026-09-10 05:28:30.15347
33	2	PRD-1789018062554-R1789018110337	114.2000	114.2000	available	2026-09-10 05:28:30.33902	2026-09-10 05:28:30.33902
34	2	PRD-1789018062554-R1789018110530	109.0000	109.0000	available	2026-09-10 05:28:30.532344	2026-09-10 05:28:30.532344
35	2	PRD-1789018062554-R1789018110721	96.8000	96.8000	available	2026-09-10 05:28:30.722487	2026-09-10 05:28:30.722487
36	3	PRD-1789018146360-R1789018242609	120.0000	120.0000	available	2026-09-10 05:30:42.611038	2026-09-10 05:30:42.611038
37	3	PRD-1789018146360-R1789018242824	120.0000	120.0000	available	2026-09-10 05:30:42.825317	2026-09-10 05:30:42.825317
38	3	PRD-1789018146360-R1789018242993	120.0000	120.0000	available	2026-09-10 05:30:42.997168	2026-09-10 05:30:42.997168
39	3	PRD-1789018146360-R1789018243179	120.0000	120.0000	available	2026-09-10 05:30:43.182937	2026-09-10 05:30:43.182937
40	3	PRD-1789018146360-R1789018243347	120.0000	120.0000	available	2026-09-10 05:30:43.349483	2026-09-10 05:30:43.349483
41	3	PRD-1789018146360-R1789018243513	120.0000	120.0000	available	2026-09-10 05:30:43.515911	2026-09-10 05:30:43.515911
42	3	PRD-1789018146360-R1789018243681	120.0000	120.0000	available	2026-09-10 05:30:43.681829	2026-09-10 05:30:43.681829
43	3	PRD-1789018146360-R1789018243871	120.0000	120.0000	available	2026-09-10 05:30:43.873808	2026-09-10 05:30:43.873808
44	3	PRD-1789018146360-R1789018244038	120.0000	120.0000	available	2026-09-10 05:30:44.039472	2026-09-10 05:30:44.039472
45	3	PRD-1789018146360-R1789018244236	120.0000	120.0000	available	2026-09-10 05:30:44.237661	2026-09-10 05:30:44.237661
46	3	PRD-1789018146360-R1789018244409	120.0000	120.0000	available	2026-09-10 05:30:44.411839	2026-09-10 05:30:44.411839
47	3	PRD-1789018146360-R1789018244595	120.0000	120.0000	available	2026-09-10 05:30:44.596704	2026-09-10 05:30:44.596704
48	3	PRD-1789018146360-R1789018244763	120.0000	120.0000	available	2026-09-10 05:30:44.764464	2026-09-10 05:30:44.764464
49	3	PRD-1789018146360-R1789018244959	120.0000	120.0000	available	2026-09-10 05:30:44.962845	2026-09-10 05:30:44.962845
50	3	PRD-1789018146360-R1789018245156	108.5000	108.5000	available	2026-09-10 05:30:45.158764	2026-09-10 05:30:45.158764
51	3	PRD-1789018146360-R1789018245342	120.0000	120.0000	available	2026-09-10 05:30:45.343316	2026-09-10 05:30:45.343316
52	3	PRD-1789018146360-R1789018245522	129.9000	129.9000	available	2026-09-10 05:30:45.523095	2026-09-10 05:30:45.523095
53	3	PRD-1789018146360-R1789018245709	120.0000	120.0000	available	2026-09-10 05:30:45.710685	2026-09-10 05:30:45.710685
54	3	PRD-1789018146360-R1789018245869	120.0000	120.0000	available	2026-09-10 05:30:45.870935	2026-09-10 05:30:45.870935
55	3	PRD-1789018146360-R1789018246049	120.0000	120.0000	available	2026-09-10 05:30:46.051006	2026-09-10 05:30:46.051006
56	3	PRD-1789018146360-R1789018246246	120.0000	120.0000	available	2026-09-10 05:30:46.248146	2026-09-10 05:30:46.248146
57	3	PRD-1789018146360-R1789018246510	120.0000	120.0000	available	2026-09-10 05:30:46.512179	2026-09-10 05:30:46.512179
58	3	PRD-1789018146360-R1789018246678	120.0000	120.0000	available	2026-09-10 05:30:46.679589	2026-09-10 05:30:46.679589
59	3	PRD-1789018146360-R1789018246878	117.0000	117.0000	available	2026-09-10 05:30:46.879966	2026-09-10 05:30:46.879966
60	3	PRD-1789018146360-R1789018247075	120.0000	120.0000	available	2026-09-10 05:30:47.076937	2026-09-10 05:30:47.076937
61	3	PRD-1789018146360-R1789018247262	120.0000	120.0000	available	2026-09-10 05:30:47.264257	2026-09-10 05:31:21.993
64	4	PRD-1789018276001-R1789018289458	108.2000	108.2000	available	2026-09-10 05:31:29.459715	2026-09-10 05:31:29.459715
62	3	PRD-1789018146360-R1789018247544	83.8000	83.8000	available	2026-09-10 05:30:47.559406	2026-09-10 05:31:39.647
65	4	PRD-1789018276001-R1789018289502	92.0000	92.0000	available	2026-09-10 05:31:29.503495	2026-09-10 05:31:40.927
63	3	PRD-1789018146360-R1789018247924	116.2000	116.2000	available	2026-09-10 05:30:47.92585	2026-09-10 05:31:53.456
66	5	PRD-1789018332876-R1789018343300	98.1000	98.1000	available	2026-09-10 05:32:23.301535	2026-09-10 05:32:23.301535
67	6	PRD-1789018369136-R1789018408605	117.3000	117.3000	available	2026-09-10 05:33:28.607016	2026-09-10 05:33:28.607016
68	7	PRD-1789018404302-R1789018431347	92.1000	92.1000	available	2026-09-10 05:33:51.349467	2026-09-10 05:33:51.349467
69	7	PRD-1789018404302-R1789018431531	100.7000	100.7000	available	2026-09-10 05:33:51.533518	2026-09-10 05:33:51.533518
70	9	PRD-1789018462682-R1789018475902	120.2000	120.2000	available	2026-09-10 05:34:35.904259	2026-09-10 05:34:35.904259
71	8	PRD-1789018442925-R1789018481512	116.0000	116.0000	available	2026-09-10 05:34:41.513663	2026-09-10 05:34:41.513663
72	8	PRD-1789018442925-R1789018481585	122.2000	122.2000	available	2026-09-10 05:34:41.58626	2026-09-10 05:34:41.58626
73	8	PRD-1789018442925-R1789018481657	105.4000	105.4000	available	2026-09-10 05:34:41.658771	2026-09-10 05:34:41.658771
74	8	PRD-1789018442925-R1789018481732	120.0000	120.0000	available	2026-09-10 05:34:41.7345	2026-09-10 05:34:41.7345
75	8	PRD-1789018442925-R1789018481806	120.0000	120.0000	available	2026-09-10 05:34:41.812866	2026-09-10 05:34:41.812866
76	8	PRD-1789018442925-R1789018481903	120.0000	120.0000	available	2026-09-10 05:34:41.907256	2026-09-10 05:34:41.907256
77	8	PRD-1789018442925-R1789018482015	120.0000	120.0000	available	2026-09-10 05:34:42.016262	2026-09-10 05:34:42.016262
78	8	PRD-1789018442925-R1789018482085	91.4000	91.4000	available	2026-09-10 05:34:42.087085	2026-09-10 05:34:42.087085
79	8	PRD-1789018442925-R1789018482168	120.0000	120.0000	available	2026-09-10 05:34:42.169819	2026-09-10 05:34:42.169819
80	9	PRD-1789018462682-R1789018502545	111.0000	111.0000	available	2026-09-10 05:35:02.547467	2026-09-10 05:35:02.547467
81	9	PRD-1789018462682-R1789018502782	117.0000	117.0000	available	2026-09-10 05:35:02.786029	2026-09-10 05:35:02.786029
82	9	PRD-1789018462682-R1789018503228	120.5000	120.5000	available	2026-09-10 05:35:03.229914	2026-09-10 05:35:03.229914
83	9	PRD-1789018462682-R1789018503420	123.8000	123.8000	available	2026-09-10 05:35:03.421316	2026-09-10 05:35:03.421316
84	9	PRD-1789018462682-R1789018503599	120.4000	120.4000	available	2026-09-10 05:35:03.599778	2026-09-10 05:35:03.599778
91	9	PRD-1789018462682-R1789018563931	120.4000	120.4000	available	2026-09-10 05:36:03.933254	2026-09-10 05:36:03.933254
92	9	PRD-1789018462682-R1789018575388	120.4000	120.4000	available	2026-09-10 05:36:15.390558	2026-09-10 05:36:15.390558
93	9	PRD-1789018462682-R1789018575622	120.0000	120.0000	available	2026-09-10 05:36:15.623691	2026-09-10 05:36:15.623691
94	9	PRD-1789018462682-R1789018575789	101.0000	101.0000	available	2026-09-10 05:36:15.790277	2026-09-10 05:36:15.790277
95	9	PRD-1789018462682-R1789018575959	120.0000	120.0000	available	2026-09-10 05:36:15.960815	2026-09-10 05:36:15.960815
96	9	PRD-1789018462682-R1789018576132	120.0000	120.0000	available	2026-09-10 05:36:16.132803	2026-09-10 05:36:16.132803
97	9	PRD-1789018462682-R1789018576300	120.3000	120.3000	available	2026-09-10 05:36:16.301121	2026-09-10 05:36:16.301121
98	9	PRD-1789018462682-R1789018576480	120.3000	120.3000	available	2026-09-10 05:36:16.481189	2026-09-10 05:36:16.481189
99	1	PRD-1789017671180-R1789018576519	98.6000	98.6000	available	2026-09-10 05:36:16.520019	2026-09-10 05:36:16.520019
100	2	PRD-1789018062554-R1789018593471	106.1000	106.1000	available	2026-09-10 05:36:33.472889	2026-09-10 05:36:33.472889
101	2	PRD-1789018062554-R1789018593543	107.7000	107.7000	available	2026-09-10 05:36:33.547574	2026-09-10 05:36:33.547574
102	9	PRD-1789018462682-R1789018618795	120.0000	120.0000	available	2026-09-10 05:36:58.79611	2026-09-10 05:36:58.79611
103	9	PRD-1789018462682-R1789018619035	120.3000	120.3000	available	2026-09-10 05:36:59.037847	2026-09-10 05:36:59.037847
104	9	PRD-1789018462682-R1789018619203	120.0000	120.0000	available	2026-09-10 05:36:59.206233	2026-09-10 05:36:59.206233
105	9	PRD-1789018462682-R1789018619403	120.4000	120.4000	available	2026-09-10 05:36:59.404692	2026-09-10 05:36:59.404692
106	9	PRD-1789018462682-R1789018619590	120.2000	120.2000	available	2026-09-10 05:36:59.59267	2026-09-10 05:36:59.59267
107	9	PRD-1789018462682-R1789018619765	120.4000	120.4000	available	2026-09-10 05:36:59.766281	2026-09-10 05:36:59.766281
108	9	PRD-1789018462682-R1789018619986	120.0000	120.0000	available	2026-09-10 05:36:59.987491	2026-09-10 05:36:59.987491
109	9	PRD-1789018462682-R1789018620175	120.3000	120.3000	available	2026-09-10 05:37:00.177268	2026-09-10 05:37:00.177268
110	9	PRD-1789018462682-R1789018620380	120.4000	120.4000	available	2026-09-10 05:37:00.381632	2026-09-10 05:37:00.381632
111	11	PRD-1789018656012-R1789018669435	114.2000	114.2000	available	2026-09-10 05:37:49.437485	2026-09-10 05:37:49.437485
112	12	PRD-1789018691298-R1789018703323	120.4000	120.4000	available	2026-09-10 05:38:23.324552	2026-09-10 05:38:23.324552
113	13	PRD-1789018725877-R1789018735250	95.2000	95.2000	available	2026-09-10 05:38:55.251045	2026-09-10 05:38:55.251045
114	10	PRD-1789018615683-R1789018798201	83.0000	83.0000	available	2026-09-10 05:39:58.202625	2026-09-10 05:39:58.202625
115	10	PRD-1789018615683-R1789018798249	92.3000	92.3000	available	2026-09-10 05:39:58.251226	2026-09-10 05:39:58.251226
116	10	PRD-1789018615683-R1789018798337	94.8000	94.8000	available	2026-09-10 05:39:58.338335	2026-09-10 05:39:58.338335
117	10	PRD-1789018615683-R1789018798391	99.0000	99.0000	available	2026-09-10 05:39:58.392063	2026-09-10 05:39:58.392063
118	10	PRD-1789018615683-R1789018798485	123.0000	123.0000	available	2026-09-10 05:39:58.486666	2026-09-10 05:39:58.486666
119	10	PRD-1789018615683-R1789018798573	129.1000	129.1000	available	2026-09-10 05:39:58.584238	2026-09-10 05:39:58.584238
120	10	PRD-1789018615683-R1789018798683	93.0000	93.0000	available	2026-09-10 05:39:58.687415	2026-09-10 05:39:58.687415
121	10	PRD-1789018615683-R1789018798748	121.0000	121.0000	available	2026-09-10 05:39:58.749547	2026-09-10 05:39:58.749547
123	10	PRD-1789018615683-R1789018798901	121.0000	121.0000	available	2026-09-10 05:39:58.902948	2026-09-10 05:39:58.902948
124	10	PRD-1789018615683-R1789018798964	119.6000	119.6000	available	2026-09-10 05:39:58.967832	2026-09-10 05:39:58.967832
125	10	PRD-1789018615683-R1789018799025	123.1000	123.1000	available	2026-09-10 05:39:59.027096	2026-09-10 05:39:59.027096
126	10	PRD-1789018615683-R1789018799099	140.7000	140.7000	available	2026-09-10 05:39:59.10068	2026-09-10 05:39:59.10068
127	10	PRD-1789018615683-R1789018799182	124.2000	124.2000	available	2026-09-10 05:39:59.18464	2026-09-10 05:39:59.18464
128	10	PRD-1789018615683-R1789018799255	85.0000	85.0000	available	2026-09-10 05:39:59.257166	2026-09-10 05:39:59.257166
129	10	PRD-1789018615683-R1789018799342	117.7000	117.7000	available	2026-09-10 05:39:59.343721	2026-09-10 05:39:59.343721
130	10	PRD-1789018615683-R1789018799417	124.3000	124.3000	available	2026-09-10 05:39:59.427189	2026-09-10 05:39:59.427189
131	10	PRD-1789018615683-R1789018799526	119.3000	119.3000	available	2026-09-10 05:39:59.527862	2026-09-10 05:39:59.527862
132	10	PRD-1789018615683-R1789018799636	120.0000	120.0000	available	2026-09-10 05:39:59.639428	2026-09-10 05:39:59.639428
133	10	PRD-1789018615683-R1789018799725	93.7000	93.7000	available	2026-09-10 05:39:59.727019	2026-09-10 05:39:59.727019
134	10	PRD-1789018615683-R1789018799809	125.4000	125.4000	available	2026-09-10 05:39:59.810927	2026-09-10 05:39:59.810927
135	10	PRD-1789018615683-R1789018799867	121.5000	121.5000	available	2026-09-10 05:39:59.869311	2026-09-10 05:39:59.869311
136	10	PRD-1789018615683-R1789018799944	118.3000	118.3000	available	2026-09-10 05:39:59.947478	2026-09-10 05:39:59.947478
137	10	PRD-1789018615683-R1789018800050	122.3000	122.3000	available	2026-09-10 05:40:00.052243	2026-09-10 05:40:00.052243
138	10	PRD-1789018615683-R1789018800187	119.3000	119.3000	available	2026-09-10 05:40:00.189031	2026-09-10 05:40:00.189031
139	10	PRD-1789018615683-R1789018800328	125.7000	125.7000	available	2026-09-10 05:40:00.330444	2026-09-10 05:40:00.330444
140	10	PRD-1789018615683-R1789018800426	120.3000	120.3000	available	2026-09-10 05:40:00.42762	2026-09-10 05:40:00.42762
141	14	PRD-1789018782133-R1789018826040	137.5000	137.5000	available	2026-09-10 05:40:26.043459	2026-09-10 05:40:26.043459
142	14	PRD-1789018782133-R1789018826943	137.5000	137.5000	available	2026-09-10 05:40:26.945143	2026-09-10 05:40:26.945143
143	14	PRD-1789018782133-R1789018827201	149.6000	149.6000	available	2026-09-10 05:40:27.202639	2026-09-10 05:40:27.202639
144	14	PRD-1789018782133-R1789018827405	150.7000	150.7000	available	2026-09-10 05:40:27.406555	2026-09-10 05:40:27.406555
145	14	PRD-1789018782133-R1789018827583	143.0000	143.0000	available	2026-09-10 05:40:27.58498	2026-09-10 05:40:27.58498
146	14	PRD-1789018782133-R1789018827786	172.7000	172.7000	available	2026-09-10 05:40:27.788636	2026-09-10 05:40:27.788636
147	14	PRD-1789018782133-R1789018828006	156.2000	156.2000	available	2026-09-10 05:40:28.007647	2026-09-10 05:40:28.007647
148	14	PRD-1789018782133-R1789018828228	154.0000	154.0000	available	2026-09-10 05:40:28.230158	2026-09-10 05:40:28.230158
149	14	PRD-1789018782133-R1789018828659	158.0000	158.0000	available	2026-09-10 05:40:28.673209	2026-09-10 05:40:28.673209
150	3	PRD-1789018146360-R1789018900481	144.0000	144.0000	available	2026-09-10 05:41:40.484043	2026-09-10 05:41:40.484043
151	3	PRD-1789018146360-R1789018900666	152.0000	152.0000	available	2026-09-10 05:41:40.668629	2026-09-10 05:41:40.668629
152	3	PRD-1789018146360-R1789018900866	150.0000	150.0000	available	2026-09-10 05:41:40.867548	2026-09-10 05:41:40.867548
153	3	PRD-1789018146360-R1789018901108	149.0000	149.0000	available	2026-09-10 05:41:41.110186	2026-09-10 05:41:41.110186
154	3	PRD-1789018146360-R1789018901313	148.0000	148.0000	available	2026-09-10 05:41:41.314995	2026-09-10 05:41:41.314995
155	3	PRD-1789018146360-R1789018901516	156.0000	156.0000	available	2026-09-10 05:41:41.518327	2026-09-10 05:41:41.518327
156	3	PRD-1789018146360-R1789018901712	155.0000	155.0000	available	2026-09-10 05:41:41.713209	2026-09-10 05:41:41.713209
157	3	PRD-1789018146360-R1789018901890	150.0000	150.0000	available	2026-09-10 05:41:41.893267	2026-09-10 05:41:41.893267
158	3	PRD-1789018146360-R1789018902092	146.0000	146.0000	available	2026-09-10 05:41:42.093856	2026-09-10 05:41:42.093856
159	3	PRD-1789018146360-R1789018902303	149.0000	149.0000	available	2026-09-10 05:41:42.304851	2026-09-10 05:41:42.304851
160	15	PRD-1789018843399-R1789018902434	112.9000	112.9000	available	2026-09-10 05:41:42.438417	2026-09-10 05:41:42.438417
161	3	PRD-1789018146360-R1789018902533	150.0000	150.0000	available	2026-09-10 05:41:42.53891	2026-09-10 05:41:42.53891
162	15	PRD-1789018843399-R1789018902569	116.6000	116.6000	available	2026-09-10 05:41:42.572943	2026-09-10 05:41:42.572943
163	15	PRD-1789018843399-R1789018902681	110.3000	110.3000	available	2026-09-10 05:41:42.68287	2026-09-10 05:41:42.68287
164	15	PRD-1789018843399-R1789018902781	111.6000	111.6000	available	2026-09-10 05:41:42.782684	2026-09-10 05:41:42.782684
165	15	PRD-1789018843399-R1789018902879	119.8000	119.8000	available	2026-09-10 05:41:42.880356	2026-09-10 05:41:42.880356
166	3	PRD-1789018146360-R1789018902905	151.0000	151.0000	available	2026-09-10 05:41:42.907936	2026-09-10 05:41:42.907936
167	15	PRD-1789018843399-R1789018902951	120.2000	120.2000	available	2026-09-10 05:41:42.952943	2026-09-10 05:41:42.952943
168	15	PRD-1789018843399-R1789018903010	107.2000	107.2000	available	2026-09-10 05:41:43.014684	2026-09-10 05:41:43.014684
169	15	PRD-1789018843399-R1789018903074	111.0000	111.0000	available	2026-09-10 05:41:43.075622	2026-09-10 05:41:43.075622
170	3	PRD-1789018146360-R1789018903152	150.0000	150.0000	available	2026-09-10 05:41:43.164507	2026-09-10 05:41:43.164507
171	15	PRD-1789018843399-R1789018903258	111.6000	111.6000	available	2026-09-10 05:41:43.260624	2026-09-10 05:41:43.260624
173	3	PRD-1789018146360-R1789018903439	151.0000	151.0000	available	2026-09-10 05:41:43.440974	2026-09-10 05:41:43.440974
176	3	PRD-1789018146360-R1789018904120	148.0000	148.0000	available	2026-09-10 05:41:44.122248	2026-09-10 05:41:44.122248
1206	12	PRD-1789018691298-R1789025792534	110.4000	110.4000	available	2026-09-10 07:36:32.535842	2026-09-10 07:36:32.535842
1207	12	PRD-1789018691298-R1789025792646	109.6000	109.6000	available	2026-09-10 07:36:32.647507	2026-09-10 07:36:32.647507
1208	12	PRD-1789018691298-R1789025792720	116.0000	116.0000	available	2026-09-10 07:36:32.731102	2026-09-10 07:36:32.731102
1363	39	PRD-1789026635015-R1789026642330	80.0000	80.0000	available	2026-09-10 07:50:42.331049	2026-09-10 07:50:42.331049
1364	30	PRD-1789024935840-R1789026708923	61.0000	61.0000	available	2026-09-10 07:51:48.92505	2026-09-10 07:51:48.92505
1365	30	PRD-1789024935840-R1789026709037	58.0000	58.0000	available	2026-09-10 07:51:49.042684	2026-09-10 07:51:49.042684
1366	30	PRD-1789024935840-R1789026709260	80.0000	80.0000	available	2026-09-10 07:51:49.261819	2026-09-10 07:51:49.261819
1371	30	PRD-1789024935840-R1789026710197	67.0000	67.0000	available	2026-09-10 07:51:50.199144	2026-09-10 07:51:50.199144
1372	30	PRD-1789024935840-R1789026710353	77.0000	77.0000	available	2026-09-10 07:51:50.357142	2026-09-10 07:51:50.357142
1373	30	PRD-1789024935840-R1789026710641	65.0000	65.0000	available	2026-09-10 07:51:50.644315	2026-09-10 07:51:50.644315
1375	30	PRD-1789024935840-R1789026710945	75.0000	75.0000	available	2026-09-10 07:51:50.947221	2026-09-10 07:51:50.947221
1376	30	PRD-1789024935840-R1789026711163	72.0000	72.0000	available	2026-09-10 07:51:51.164774	2026-09-10 07:51:51.164774
1377	30	PRD-1789024935840-R1789026711276	74.0000	74.0000	available	2026-09-10 07:51:51.285683	2026-09-10 07:51:51.285683
1378	30	PRD-1789024935840-R1789026711496	85.0000	85.0000	available	2026-09-10 07:51:51.498786	2026-09-10 07:51:51.498786
1379	30	PRD-1789024935840-R1789026711684	83.0000	83.0000	available	2026-09-10 07:51:51.685582	2026-09-10 07:51:51.685582
1380	30	PRD-1789024935840-R1789026711835	77.0000	77.0000	available	2026-09-10 07:51:51.836421	2026-09-10 07:51:51.836421
1381	30	PRD-1789024935840-R1789026712000	75.0000	75.0000	available	2026-09-10 07:51:52.001932	2026-09-10 07:51:52.001932
1382	30	PRD-1789024935840-R1789026712094	79.0000	79.0000	available	2026-09-10 07:51:52.095796	2026-09-10 07:51:52.095796
1477	1	PRD-1789017671180-R1789028030153	129.5000	129.5000	available	2026-09-10 08:13:50.162843	2026-09-10 08:13:50.162843
1479	1	PRD-1789017671180-R1789028030571	129.7000	129.7000	available	2026-09-10 08:13:50.57634	2026-09-10 08:13:50.57634
1481	1	PRD-1789017671180-R1789028031021	130.1000	130.1000	available	2026-09-10 08:13:51.022251	2026-09-10 08:13:51.022251
1482	1	PRD-1789017671180-R1789028031199	90.1000	90.1000	available	2026-09-10 08:13:51.19982	2026-09-10 08:13:51.19982
1489	1	PRD-1789017671180-R1789028032626	130.1000	130.1000	available	2026-09-10 08:13:52.628557	2026-09-10 08:13:52.628557
1490	1	PRD-1789017671180-R1789028032809	117.3000	117.3000	available	2026-09-10 08:13:52.810539	2026-09-10 08:13:52.810539
1491	1	PRD-1789017671180-R1789028032991	116.0000	116.0000	available	2026-09-10 08:13:52.992245	2026-09-10 08:13:52.992245
1492	1	PRD-1789017671180-R1789028033226	129.8000	129.8000	available	2026-09-10 08:13:53.227472	2026-09-10 08:13:53.227472
1495	1	PRD-1789017671180-R1789028033822	138.0000	138.0000	available	2026-09-10 08:13:53.825154	2026-09-10 08:13:53.825154
1496	1	PRD-1789017671180-R1789028034007	137.0000	137.0000	available	2026-09-10 08:13:54.008092	2026-09-10 08:13:54.008092
1504	1	PRD-1789017671180-R1789028035664	117.0000	117.0000	available	2026-09-10 08:13:55.665099	2026-09-10 08:13:55.665099
1505	1	PRD-1789017671180-R1789028035861	120.5000	120.5000	available	2026-09-10 08:13:55.862241	2026-09-10 08:13:55.862241
1507	1	PRD-1789017671180-R1789028036274	117.0000	117.0000	available	2026-09-10 08:13:56.275779	2026-09-10 08:13:56.275779
1509	1	PRD-1789017671180-R1789028036710	120.6000	120.6000	available	2026-09-10 08:13:56.71548	2026-09-10 08:13:56.71548
1510	1	PRD-1789017671180-R1789028036924	120.5000	120.5000	available	2026-09-10 08:13:56.925813	2026-09-10 08:13:56.925813
1514	1	PRD-1789017671180-R1789028037810	120.6000	120.6000	available	2026-09-10 08:13:57.811184	2026-09-10 08:13:57.811184
1516	1	PRD-1789017671180-R1789028038228	120.5000	120.5000	available	2026-09-10 08:13:58.231607	2026-09-10 08:13:58.231607
1517	1	PRD-1789017671180-R1789028038447	107.4000	107.4000	available	2026-09-10 08:13:58.450704	2026-09-10 08:13:58.450704
1524	1	PRD-1789017671180-R1789028039939	131.2000	131.2000	available	2026-09-10 08:13:59.940137	2026-09-10 08:13:59.940137
1525	1	PRD-1789017671180-R1789028040131	93.6000	93.6000	available	2026-09-10 08:14:00.132574	2026-09-10 08:14:00.132574
1526	1	PRD-1789017671180-R1789028040342	115.3000	115.3000	available	2026-09-10 08:14:00.343691	2026-09-10 08:14:00.343691
1535	1	PRD-1789017671180-R1789028042756	121.2000	121.2000	available	2026-09-10 08:14:02.75751	2026-09-10 08:14:02.75751
1536	1	PRD-1789017671180-R1789028042943	125.3000	125.3000	available	2026-09-10 08:14:02.944332	2026-09-10 08:14:02.944332
1538	1	PRD-1789017671180-R1789028043371	147.0000	147.0000	available	2026-09-10 08:14:03.372696	2026-09-10 08:14:03.372696
1539	1	PRD-1789017671180-R1789028043557	137.0000	137.0000	available	2026-09-10 08:14:03.558491	2026-09-10 08:14:03.558491
1540	1	PRD-1789017671180-R1789028043811	148.0000	148.0000	available	2026-09-10 08:14:03.812642	2026-09-10 08:14:03.812642
1543	1	PRD-1789017671180-R1789028044429	117.0000	117.0000	available	2026-09-10 08:14:04.430677	2026-09-10 08:14:04.430677
1546	1	PRD-1789017671180-R1789028045089	117.0000	117.0000	available	2026-09-10 08:14:05.090726	2026-09-10 08:14:05.090726
1547	1	PRD-1789017671180-R1789028045293	117.0000	117.0000	available	2026-09-10 08:14:05.294755	2026-09-10 08:14:05.294755
1555	1	PRD-1789017671180-R1789028046447	120.5000	120.5000	available	2026-09-10 08:14:06.448188	2026-09-10 08:14:06.448188
1679	7	PRD-1789018404302-R1789028827468	113.3000	113.3000	available	2026-09-10 08:27:07.470214	2026-09-10 08:27:07.470214
1682	7	PRD-1789018404302-R1789028828275	122.8000	122.8000	available	2026-09-10 08:27:08.276811	2026-09-10 08:27:08.276811
1687	7	PRD-1789018404302-R1789028829934	119.9000	119.9000	available	2026-09-10 08:27:09.935774	2026-09-10 08:27:09.935774
1690	7	PRD-1789018404302-R1789028831059	122.0000	122.0000	available	2026-09-10 08:27:11.061104	2026-09-10 08:27:11.061104
1699	7	PRD-1789018404302-R1789028834058	114.4000	114.4000	available	2026-09-10 08:27:14.059492	2026-09-10 08:27:14.059492
1700	7	PRD-1789018404302-R1789028834429	114.9000	114.9000	available	2026-09-10 08:27:14.431008	2026-09-10 08:27:14.431008
1705	7	PRD-1789018404302-R1789028836405	111.2000	111.2000	available	2026-09-10 08:27:16.40767	2026-09-10 08:27:16.40767
1708	7	PRD-1789018404302-R1789028837429	135.7000	135.7000	available	2026-09-10 08:27:17.43106	2026-09-10 08:27:17.43106
1710	7	PRD-1789018404302-R1789028838430	119.5000	119.5000	available	2026-09-10 08:27:18.432451	2026-09-10 08:27:18.432451
1713	7	PRD-1789018404302-R1789028839375	139.9000	139.9000	available	2026-09-10 08:27:19.376728	2026-09-10 08:27:19.376728
1716	7	PRD-1789018404302-R1789028840372	115.6000	115.6000	available	2026-09-10 08:27:20.373794	2026-09-10 08:27:20.373794
1717	20	PRD-1789019067284-R1789028894020	122.7000	122.7000	available	2026-09-10 08:28:14.021878	2026-09-10 08:28:14.021878
1718	20	PRD-1789019067284-R1789028894108	110.6000	110.6000	available	2026-09-10 08:28:14.111025	2026-09-10 08:28:14.111025
1958	12	PRD-1789018691298-R1789029790161	124.0000	124.0000	available	2026-09-10 08:43:10.164173	2026-09-10 08:43:10.164173
172	15	PRD-1789018843399-R1789018903359	114.8000	114.8000	available	2026-09-10 05:41:43.361138	2026-09-10 05:41:43.361138
174	3	PRD-1789018146360-R1789018903701	62.5000	62.5000	available	2026-09-10 05:41:43.702239	2026-09-10 05:41:43.702239
175	3	PRD-1789018146360-R1789018903911	147.0000	147.0000	available	2026-09-10 05:41:43.911774	2026-09-10 05:41:43.911774
177	17	PRD-1789018928535-R1789018940889	106.0000	106.0000	available	2026-09-10 05:42:20.890692	2026-09-10 05:42:20.890692
178	16	PRD-1789018928475-R1789018944128	112.6000	112.6000	available	2026-09-10 05:42:24.130088	2026-09-10 05:42:24.130088
179	3	PRD-1789018146360-R1789018956280	149.0000	149.0000	available	2026-09-10 05:42:36.281658	2026-09-10 05:42:36.281658
181	19	PRD-1789019004359-R1789019016677	187.0000	187.0000	available	2026-09-10 05:43:36.678461	2026-09-10 05:43:36.678461
182	12	PRD-1789018691298-R1789019045198	122.8000	122.8000	available	2026-09-10 05:44:05.199548	2026-09-10 05:44:05.199548
183	12	PRD-1789018691298-R1789019045246	121.5000	121.5000	available	2026-09-10 05:44:05.247681	2026-09-10 05:44:05.247681
184	12	PRD-1789018691298-R1789019045330	111.4000	111.4000	available	2026-09-10 05:44:05.331751	2026-09-10 05:44:05.331751
185	12	PRD-1789018691298-R1789019045453	121.4000	121.4000	available	2026-09-10 05:44:05.455465	2026-09-10 05:44:05.455465
186	13	PRD-1789018725877-R1789019045524	0.0000	0.0000	available	2026-09-10 05:44:05.526442	2026-09-10 05:44:05.526442
187	12	PRD-1789018691298-R1789019045587	113.0000	113.0000	available	2026-09-10 05:44:05.589044	2026-09-10 05:44:05.589044
188	12	PRD-1789018691298-R1789019045708	118.4000	118.4000	available	2026-09-10 05:44:05.710143	2026-09-10 05:44:05.710143
189	12	PRD-1789018691298-R1789019045806	125.1000	125.1000	available	2026-09-10 05:44:05.808003	2026-09-10 05:44:05.808003
190	12	PRD-1789018691298-R1789019045871	121.3000	121.3000	available	2026-09-10 05:44:05.872358	2026-09-10 05:44:05.872358
191	12	PRD-1789018691298-R1789019045935	99.0000	99.0000	available	2026-09-10 05:44:05.936714	2026-09-10 05:44:05.936714
192	13	PRD-1789018725877-R1789019049461	0.0000	0.0000	available	2026-09-10 05:44:09.462965	2026-09-10 05:44:09.462965
193	20	PRD-1789019067284-R1789019081884	64.2000	64.2000	available	2026-09-10 05:44:41.887045	2026-09-10 05:44:41.887045
194	4	PRD-1789018276001-R1789019090860	104.7000	104.7000	available	2026-09-10 05:44:50.861466	2026-09-10 05:44:50.861466
195	15	PRD-1789018843399-R1789019099612	107.6000	107.6000	available	2026-09-10 05:44:59.613578	2026-09-10 05:44:59.613578
196	15	PRD-1789018843399-R1789019099677	119.3000	119.3000	available	2026-09-10 05:44:59.679249	2026-09-10 05:44:59.679249
197	15	PRD-1789018843399-R1789019099803	118.8000	118.8000	available	2026-09-10 05:44:59.804487	2026-09-10 05:44:59.804487
198	15	PRD-1789018843399-R1789019099901	119.1000	119.1000	available	2026-09-10 05:44:59.910845	2026-09-10 05:44:59.910845
199	15	PRD-1789018843399-R1789019099983	108.1000	108.1000	available	2026-09-10 05:44:59.984898	2026-09-10 05:44:59.984898
200	15	PRD-1789018843399-R1789019100167	120.0000	120.0000	available	2026-09-10 05:45:00.169091	2026-09-10 05:45:00.169091
201	15	PRD-1789018843399-R1789019100260	120.2000	120.2000	available	2026-09-10 05:45:00.261787	2026-09-10 05:45:00.261787
202	15	PRD-1789018843399-R1789019100311	120.0000	120.0000	available	2026-09-10 05:45:00.312851	2026-09-10 05:45:00.312851
203	15	PRD-1789018843399-R1789019100398	117.0000	117.0000	available	2026-09-10 05:45:00.400095	2026-09-10 05:45:00.400095
204	15	PRD-1789018843399-R1789019100475	118.0000	118.0000	available	2026-09-10 05:45:00.476481	2026-09-10 05:45:00.476481
205	3	PRD-1789018146360-R1789019119776	95.8000	95.8000	available	2026-09-10 05:45:19.77757	2026-09-10 05:45:19.77757
206	3	PRD-1789018146360-R1789019119847	120.0000	120.0000	available	2026-09-10 05:45:19.85027	2026-09-10 05:45:19.85027
207	3	PRD-1789018146360-R1789019119965	120.0000	120.0000	available	2026-09-10 05:45:19.966713	2026-09-10 05:45:19.966713
208	21	PRD-1789019144403-R1789019169861	102.0000	102.0000	available	2026-09-10 05:46:09.862369	2026-09-10 05:46:09.862369
209	21	PRD-1789019144403-R1789019169904	118.0000	118.0000	available	2026-09-10 05:46:09.906163	2026-09-10 05:46:09.906163
210	21	PRD-1789019144403-R1789019169987	102.4000	102.4000	available	2026-09-10 05:46:09.988849	2026-09-10 05:46:09.988849
211	21	PRD-1789019144403-R1789019170051	110.2000	110.2000	available	2026-09-10 05:46:10.052058	2026-09-10 05:46:10.052058
212	21	PRD-1789019144403-R1789019170139	118.0000	118.0000	available	2026-09-10 05:46:10.141133	2026-09-10 05:46:10.141133
213	1	PRD-1789017671180-R1789019188511	120.0000	120.0000	available	2026-09-10 05:46:28.512818	2026-09-10 05:46:28.512818
214	1	PRD-1789017671180-R1789019188584	120.0000	120.0000	available	2026-09-10 05:46:28.586015	2026-09-10 05:46:28.586015
215	1	PRD-1789017671180-R1789019188699	120.0000	120.0000	available	2026-09-10 05:46:28.711844	2026-09-10 05:46:28.711844
216	7	PRD-1789018404302-R1789019205617	138.0000	138.0000	available	2026-09-10 05:46:45.620438	2026-09-10 05:46:45.620438
217	7	PRD-1789018404302-R1789019205942	114.8000	114.8000	available	2026-09-10 05:46:45.943879	2026-09-10 05:46:45.943879
218	7	PRD-1789018404302-R1789019206177	112.1000	112.1000	available	2026-09-10 05:46:46.177865	2026-09-10 05:46:46.177865
219	7	PRD-1789018404302-R1789019206348	111.7000	111.7000	available	2026-09-10 05:46:46.350001	2026-09-10 05:46:46.350001
220	7	PRD-1789018404302-R1789019206645	112.5000	112.5000	available	2026-09-10 05:46:46.646447	2026-09-10 05:46:46.646447
221	7	PRD-1789018404302-R1789019206995	133.8000	133.8000	available	2026-09-10 05:46:47.007107	2026-09-10 05:46:47.007107
222	7	PRD-1789018404302-R1789019207209	116.5000	116.5000	available	2026-09-10 05:46:47.212999	2026-09-10 05:46:47.212999
223	7	PRD-1789018404302-R1789019207507	118.7000	118.7000	available	2026-09-10 05:46:47.509153	2026-09-10 05:46:47.509153
224	7	PRD-1789018404302-R1789019207814	113.3000	113.3000	available	2026-09-10 05:46:47.816029	2026-09-10 05:46:47.816029
225	7	PRD-1789018404302-R1789019208062	130.0000	130.0000	available	2026-09-10 05:46:48.07113	2026-09-10 05:46:48.07113
226	7	PRD-1789018404302-R1789019208367	107.1000	107.1000	available	2026-09-10 05:46:48.368961	2026-09-10 05:46:48.368961
227	7	PRD-1789018404302-R1789019208555	100.5000	100.5000	available	2026-09-10 05:46:48.556373	2026-09-10 05:46:48.556373
228	7	PRD-1789018404302-R1789019208746	115.9000	115.9000	available	2026-09-10 05:46:48.747579	2026-09-10 05:46:48.747579
229	7	PRD-1789018404302-R1789019208935	108.7000	108.7000	available	2026-09-10 05:46:48.936564	2026-09-10 05:46:48.936564
230	7	PRD-1789018404302-R1789019209105	115.0000	115.0000	available	2026-09-10 05:46:49.107116	2026-09-10 05:46:49.107116
231	7	PRD-1789018404302-R1789019209281	101.0000	101.0000	available	2026-09-10 05:46:49.282387	2026-09-10 05:46:49.282387
232	7	PRD-1789018404302-R1789019209479	110.6000	110.6000	available	2026-09-10 05:46:49.481779	2026-09-10 05:46:49.481779
233	7	PRD-1789018404302-R1789019209657	117.6000	117.6000	available	2026-09-10 05:46:49.657939	2026-09-10 05:46:49.657939
234	7	PRD-1789018404302-R1789019209888	126.5000	126.5000	available	2026-09-10 05:46:49.889439	2026-09-10 05:46:49.889439
235	7	PRD-1789018404302-R1789019210103	116.2000	116.2000	available	2026-09-10 05:46:50.10399	2026-09-10 05:46:50.10399
236	7	PRD-1789018404302-R1789019210296	116.5000	116.5000	available	2026-09-10 05:46:50.297952	2026-09-10 05:46:50.297952
237	7	PRD-1789018404302-R1789019210504	116.2000	116.2000	available	2026-09-10 05:46:50.50621	2026-09-10 05:46:50.50621
238	7	PRD-1789018404302-R1789019210722	108.3000	108.3000	available	2026-09-10 05:46:50.723651	2026-09-10 05:46:50.723651
239	7	PRD-1789018404302-R1789019210910	114.7000	114.7000	available	2026-09-10 05:46:50.911464	2026-09-10 05:46:50.911464
240	7	PRD-1789018404302-R1789019211105	114.2000	114.2000	available	2026-09-10 05:46:51.10684	2026-09-10 05:46:51.10684
241	7	PRD-1789018404302-R1789019238883	118.7000	118.7000	available	2026-09-10 05:47:18.884683	2026-09-10 05:47:18.884683
242	7	PRD-1789018404302-R1789019239097	116.7000	116.7000	available	2026-09-10 05:47:19.099301	2026-09-10 05:47:19.099301
243	7	PRD-1789018404302-R1789019239372	115.0000	115.0000	available	2026-09-10 05:47:19.374278	2026-09-10 05:47:19.374278
244	7	PRD-1789018404302-R1789019240240	117.2000	117.2000	available	2026-09-10 05:47:20.242174	2026-09-10 05:47:20.242174
245	7	PRD-1789018404302-R1789019240450	108.4000	108.4000	available	2026-09-10 05:47:20.451843	2026-09-10 05:47:20.451843
246	7	PRD-1789018404302-R1789019240644	107.2000	107.2000	available	2026-09-10 05:47:20.645735	2026-09-10 05:47:20.645735
247	7	PRD-1789018404302-R1789019240854	120.8000	120.8000	available	2026-09-10 05:47:20.85685	2026-09-10 05:47:20.85685
253	22	PRD-1789019211905-R1789019244858	119.2000	119.2000	available	2026-09-10 05:47:24.86043	2026-09-10 05:47:24.86043
254	22	PRD-1789019211905-R1789019244921	121.3000	121.3000	available	2026-09-10 05:47:24.923016	2026-09-10 05:47:24.923016
1209	12	PRD-1789018691298-R1789025792808	109.8000	109.8000	available	2026-09-10 07:36:32.810893	2026-09-10 07:36:32.810893
1210	12	PRD-1789018691298-R1789025792977	116.0000	116.0000	available	2026-09-10 07:36:32.980737	2026-09-10 07:36:32.980737
1214	12	PRD-1789018691298-R1789025793267	120.4000	120.4000	available	2026-09-10 07:36:33.272696	2026-09-10 07:36:33.272696
1215	12	PRD-1789018691298-R1789025793339	120.4000	120.4000	available	2026-09-10 07:36:33.341009	2026-09-10 07:36:33.341009
1219	12	PRD-1789018691298-R1789025793666	118.8000	118.8000	available	2026-09-10 07:36:33.668107	2026-09-10 07:36:33.668107
1223	12	PRD-1789018691298-R1789025794025	118.8000	118.8000	available	2026-09-10 07:36:34.026345	2026-09-10 07:36:34.026345
1226	12	PRD-1789018691298-R1789025794268	110.0000	110.0000	available	2026-09-10 07:36:34.269597	2026-09-10 07:36:34.269597
1228	12	PRD-1789018691298-R1789025794462	107.5000	107.5000	available	2026-09-10 07:36:34.464224	2026-09-10 07:36:34.464224
1232	12	PRD-1789018691298-R1789025794853	112.1000	112.1000	available	2026-09-10 07:36:34.856443	2026-09-10 07:36:34.856443
1236	12	PRD-1789018691298-R1789025795321	110.0000	110.0000	available	2026-09-10 07:36:35.322366	2026-09-10 07:36:35.322366
1237	12	PRD-1789018691298-R1789025795413	81.0000	81.0000	available	2026-09-10 07:36:35.41437	2026-09-10 07:36:35.41437
1238	12	PRD-1789018691298-R1789025795520	113.6000	113.6000	available	2026-09-10 07:36:35.52274	2026-09-10 07:36:35.52274
1367	30	PRD-1789024935840-R1789026709417	77.0000	77.0000	available	2026-09-10 07:51:49.41876	2026-09-10 07:51:49.41876
1368	30	PRD-1789024935840-R1789026709619	85.0000	85.0000	available	2026-09-10 07:51:49.622583	2026-09-10 07:51:49.622583
1369	30	PRD-1789024935840-R1789026709770	67.0000	67.0000	available	2026-09-10 07:51:49.775595	2026-09-10 07:51:49.775595
1383	28	PRD-1789024618261-R1789026746380	63.0000	63.0000	available	2026-09-10 07:52:26.383046	2026-09-10 07:52:26.383046
1384	28	PRD-1789024618261-R1789026746500	65.0000	65.0000	available	2026-09-10 07:52:26.502006	2026-09-10 07:52:26.502006
1388	35	PRD-1789025218677-R1789026757879	80.0000	80.0000	available	2026-09-10 07:52:37.880018	2026-09-10 07:52:37.880018
1480	1	PRD-1789017671180-R1789028030753	130.9000	130.9000	available	2026-09-10 08:13:50.755217	2026-09-10 08:13:50.755217
1483	1	PRD-1789017671180-R1789028031416	114.9000	114.9000	available	2026-09-10 08:13:51.417586	2026-09-10 08:13:51.417586
1484	1	PRD-1789017671180-R1789028031626	123.5000	123.5000	available	2026-09-10 08:13:51.626957	2026-09-10 08:13:51.626957
1485	1	PRD-1789017671180-R1789028031813	117.1000	117.1000	available	2026-09-10 08:13:51.814109	2026-09-10 08:13:51.814109
1486	1	PRD-1789017671180-R1789028032022	115.8000	115.8000	available	2026-09-10 08:13:52.023483	2026-09-10 08:13:52.023483
1487	1	PRD-1789017671180-R1789028032198	130.0000	130.0000	available	2026-09-10 08:13:52.199226	2026-09-10 08:13:52.199226
1488	1	PRD-1789017671180-R1789028032413	110.3000	110.3000	available	2026-09-10 08:13:52.413776	2026-09-10 08:13:52.413776
1497	1	PRD-1789017671180-R1789028034207	117.0000	117.0000	available	2026-09-10 08:13:54.209695	2026-09-10 08:13:54.209695
1498	1	PRD-1789017671180-R1789028034430	137.0000	137.0000	available	2026-09-10 08:13:54.431362	2026-09-10 08:13:54.431362
1499	1	PRD-1789017671180-R1789028034635	146.0000	146.0000	available	2026-09-10 08:13:54.636635	2026-09-10 08:13:54.636635
1500	1	PRD-1789017671180-R1789028034814	159.0000	159.0000	available	2026-09-10 08:13:54.815978	2026-09-10 08:13:54.815978
1520	1	PRD-1789017671180-R1789028039089	109.1000	109.1000	available	2026-09-10 08:13:59.091761	2026-09-10 08:13:59.091761
1522	1	PRD-1789017671180-R1789028039498	120.5000	120.5000	available	2026-09-10 08:13:59.501411	2026-09-10 08:13:59.501411
1523	1	PRD-1789017671180-R1789028039720	136.1000	136.1000	available	2026-09-10 08:13:59.722437	2026-09-10 08:13:59.722437
1527	1	PRD-1789017671180-R1789028040555	123.2000	123.2000	available	2026-09-10 08:14:00.556461	2026-09-10 08:14:00.556461
1528	1	PRD-1789017671180-R1789028040765	128.4000	128.4000	available	2026-09-10 08:14:00.766994	2026-09-10 08:14:00.766994
1529	1	PRD-1789017671180-R1789028041011	114.6000	114.6000	available	2026-09-10 08:14:01.012092	2026-09-10 08:14:01.012092
1530	1	PRD-1789017671180-R1789028041204	117.4000	117.4000	available	2026-09-10 08:14:01.206085	2026-09-10 08:14:01.206085
1531	1	PRD-1789017671180-R1789028041845	120.9000	120.9000	available	2026-09-10 08:14:01.84645	2026-09-10 08:14:01.84645
1532	1	PRD-1789017671180-R1789028042063	129.2000	129.2000	available	2026-09-10 08:14:02.066813	2026-09-10 08:14:02.066813
1533	1	PRD-1789017671180-R1789028042296	114.7000	114.7000	available	2026-09-10 08:14:02.297589	2026-09-10 08:14:02.297589
1534	1	PRD-1789017671180-R1789028042519	130.2000	130.2000	available	2026-09-10 08:14:02.520636	2026-09-10 08:14:02.520636
1537	1	PRD-1789017671180-R1789028043159	111.5000	111.5000	available	2026-09-10 08:14:03.160324	2026-09-10 08:14:03.160324
1541	1	PRD-1789017671180-R1789028043983	167.0000	167.0000	available	2026-09-10 08:14:03.984573	2026-09-10 08:14:03.984573
1542	1	PRD-1789017671180-R1789028044179	187.0000	187.0000	available	2026-09-10 08:14:04.180823	2026-09-10 08:14:04.180823
1548	1	PRD-1789017671180-R1789028045537	117.0000	117.0000	available	2026-09-10 08:14:05.538437	2026-09-10 08:14:05.538437
1549	1	PRD-1789017671180-R1789028045739	120.5000	120.5000	available	2026-09-10 08:14:05.741551	2026-09-10 08:14:05.741551
1550	1	PRD-1789017671180-R1789028045967	114.0000	114.0000	available	2026-09-10 08:14:05.968375	2026-09-10 08:14:05.968375
1551	1	PRD-1789017671180-R1789028046214	117.7000	117.7000	available	2026-09-10 08:14:06.21516	2026-09-10 08:14:06.21516
1552	44	PRD-1789028024874-R1789028046291	137.7000	137.7000	available	2026-09-10 08:14:06.291919	2026-09-10 08:14:06.291919
1553	44	PRD-1789028024874-R1789028046321	119.0000	119.0000	available	2026-09-10 08:14:06.323267	2026-09-10 08:14:06.323267
1554	44	PRD-1789028024874-R1789028046411	122.8000	122.8000	available	2026-09-10 08:14:06.412368	2026-09-10 08:14:06.412368
1556	44	PRD-1789028024874-R1789028046499	104.9000	104.9000	available	2026-09-10 08:14:06.500742	2026-09-10 08:14:06.500742
1564	1	PRD-1789017671180-R1789028048351	99.8000	99.8000	available	2026-09-10 08:14:08.3601	2026-09-10 08:14:08.3601
1565	1	PRD-1789017671180-R1789028060399	115.8000	115.8000	available	2026-09-10 08:14:20.400919	2026-09-10 08:14:20.400919
1566	1	PRD-1789017671180-R1789028060720	120.5000	120.5000	available	2026-09-10 08:14:20.723209	2026-09-10 08:14:20.723209
1681	7	PRD-1789018404302-R1789028827972	111.7000	111.7000	available	2026-09-10 08:27:07.973341	2026-09-10 08:27:07.973341
1688	7	PRD-1789018404302-R1789028830245	110.1000	110.1000	available	2026-09-10 08:27:10.247129	2026-09-10 08:27:10.247129
1691	7	PRD-1789018404302-R1789028831345	116.0000	116.0000	available	2026-09-10 08:27:11.346453	2026-09-10 08:27:11.346453
1694	7	PRD-1789018404302-R1789028832345	115.9000	115.9000	available	2026-09-10 08:27:12.347329	2026-09-10 08:27:12.347329
1695	7	PRD-1789018404302-R1789028832701	132.8000	132.8000	available	2026-09-10 08:27:12.70308	2026-09-10 08:27:12.70308
1701	7	PRD-1789018404302-R1789028835081	109.4000	109.4000	available	2026-09-10 08:27:15.083164	2026-09-10 08:27:15.083164
1702	7	PRD-1789018404302-R1789028835514	115.8000	115.8000	available	2026-09-10 08:27:15.516329	2026-09-10 08:27:15.516329
1703	7	PRD-1789018404302-R1789028835889	113.0000	113.0000	available	2026-09-10 08:27:15.890817	2026-09-10 08:27:15.890817
1706	7	PRD-1789018404302-R1789028836776	110.4000	110.4000	available	2026-09-10 08:27:16.777283	2026-09-10 08:27:16.777283
1709	7	PRD-1789018404302-R1789028837878	120.2000	120.2000	available	2026-09-10 08:27:17.87986	2026-09-10 08:27:17.87986
1712	7	PRD-1789018404302-R1789028839055	127.3000	127.3000	available	2026-09-10 08:27:19.057844	2026-09-10 08:27:19.057844
1715	7	PRD-1789018404302-R1789028840045	120.4000	120.4000	available	2026-09-10 08:27:20.046048	2026-09-10 08:27:20.046048
1960	12	PRD-1789018691298-R1789029790386	125.5000	125.5000	available	2026-09-10 08:43:10.387815	2026-09-10 08:43:10.387815
1963	12	PRD-1789018691298-R1789029790719	105.9000	105.9000	available	2026-09-10 08:43:10.722738	2026-09-10 08:43:10.722738
248	22	PRD-1789019211905-R1789019244477	123.9000	123.9000	available	2026-09-10 05:47:24.47895	2026-09-10 05:47:24.47895
6137	56	PRD-1789033426514	118.0000	118.0000	available	2026-09-12 06:55:24.182316	2026-09-12 06:55:24.182316
249	22	PRD-1789019211905-R1789019244547	120.6000	120.6000	available	2026-09-10 05:47:24.548641	2026-09-10 05:47:24.548641
250	22	PRD-1789019211905-R1789019244632	121.1000	121.1000	available	2026-09-10 05:47:24.634073	2026-09-10 05:47:24.634073
251	22	PRD-1789019211905-R1789019244699	106.7000	106.7000	available	2026-09-10 05:47:24.700954	2026-09-10 05:47:24.700954
252	22	PRD-1789019211905-R1789019244790	125.7000	125.7000	available	2026-09-10 05:47:24.791628	2026-09-10 05:47:24.791628
255	7	PRD-1789018404302-R1789019366827	102.9000	102.9000	available	2026-09-10 05:49:26.828438	2026-09-10 05:49:26.828438
256	7	PRD-1789018404302-R1789019367163	117.6000	117.6000	available	2026-09-10 05:49:27.164933	2026-09-10 05:49:27.164933
257	7	PRD-1789018404302-R1789019367369	111.3000	111.3000	available	2026-09-10 05:49:27.372039	2026-09-10 05:49:27.372039
258	7	PRD-1789018404302-R1789019367719	113.0000	113.0000	available	2026-09-10 05:49:27.720584	2026-09-10 05:49:27.720584
259	7	PRD-1789018404302-R1789019368030	121.7000	121.7000	available	2026-09-10 05:49:28.032503	2026-09-10 05:49:28.032503
260	7	PRD-1789018404302-R1789019368362	114.5000	114.5000	available	2026-09-10 05:49:28.363575	2026-09-10 05:49:28.363575
261	7	PRD-1789018404302-R1789019368743	115.0000	115.0000	available	2026-09-10 05:49:28.744957	2026-09-10 05:49:28.744957
262	7	PRD-1789018404302-R1789019369126	107.3000	107.3000	available	2026-09-10 05:49:29.127643	2026-09-10 05:49:29.127643
263	7	PRD-1789018404302-R1789019369384	103.9000	103.9000	available	2026-09-10 05:49:29.385797	2026-09-10 05:49:29.385797
264	7	PRD-1789018404302-R1789019369583	120.0000	120.0000	available	2026-09-10 05:49:29.585077	2026-09-10 05:49:29.585077
265	7	PRD-1789018404302-R1789019369777	118.2000	118.2000	available	2026-09-10 05:49:29.778549	2026-09-10 05:49:29.778549
266	7	PRD-1789018404302-R1789019369985	116.9000	116.9000	available	2026-09-10 05:49:29.986841	2026-09-10 05:49:29.986841
267	7	PRD-1789018404302-R1789019370237	109.4000	109.4000	available	2026-09-10 05:49:30.23861	2026-09-10 05:49:30.23861
268	7	PRD-1789018404302-R1789019370462	112.3000	112.3000	available	2026-09-10 05:49:30.464126	2026-09-10 05:49:30.464126
269	7	PRD-1789018404302-R1789019370655	120.2000	120.2000	available	2026-09-10 05:49:30.656339	2026-09-10 05:49:30.656339
270	7	PRD-1789018404302-R1789019370845	115.5000	115.5000	available	2026-09-10 05:49:30.846589	2026-09-10 05:49:30.846589
271	7	PRD-1789018404302-R1789019371492	110.9000	110.9000	available	2026-09-10 05:49:31.493292	2026-09-10 05:49:31.493292
272	7	PRD-1789018404302-R1789019371703	114.7000	114.7000	available	2026-09-10 05:49:31.704383	2026-09-10 05:49:31.704383
273	7	PRD-1789018404302-R1789019371998	115.7000	115.7000	available	2026-09-10 05:49:31.999341	2026-09-10 05:49:31.999341
274	7	PRD-1789018404302-R1789019372203	117.3000	117.3000	available	2026-09-10 05:49:32.20488	2026-09-10 05:49:32.20488
275	7	PRD-1789018404302-R1789019372487	99.7000	99.7000	available	2026-09-10 05:49:32.488615	2026-09-10 05:49:32.488615
276	7	PRD-1789018404302-R1789019372714	116.5000	116.5000	available	2026-09-10 05:49:32.715586	2026-09-10 05:49:32.715586
277	7	PRD-1789018404302-R1789019372916	119.8000	119.8000	available	2026-09-10 05:49:32.917305	2026-09-10 05:49:32.917305
278	7	PRD-1789018404302-R1789019373147	113.3000	113.3000	available	2026-09-10 05:49:33.148643	2026-09-10 05:49:33.148643
279	16	PRD-1789018928475-R1789019417930	117.0000	117.0000	available	2026-09-10 05:50:17.932364	2026-09-10 05:50:17.932364
280	16	PRD-1789018928475-R1789019417969	116.0000	116.0000	available	2026-09-10 05:50:17.970677	2026-09-10 05:50:17.970677
281	16	PRD-1789018928475-R1789019418029	117.0000	117.0000	available	2026-09-10 05:50:18.03042	2026-09-10 05:50:18.03042
282	16	PRD-1789018928475-R1789019418085	116.0000	116.0000	available	2026-09-10 05:50:18.086384	2026-09-10 05:50:18.086384
283	16	PRD-1789018928475-R1789019418141	116.0000	116.0000	available	2026-09-10 05:50:18.142407	2026-09-10 05:50:18.142407
284	16	PRD-1789018928475-R1789019418222	117.0000	117.0000	available	2026-09-10 05:50:18.224551	2026-09-10 05:50:18.224551
285	16	PRD-1789018928475-R1789019418321	117.0000	117.0000	available	2026-09-10 05:50:18.322779	2026-09-10 05:50:18.322779
286	16	PRD-1789018928475-R1789019418416	117.0000	117.0000	available	2026-09-10 05:50:18.417146	2026-09-10 05:50:18.417146
287	16	PRD-1789018928475-R1789019418496	116.0000	116.0000	available	2026-09-10 05:50:18.497959	2026-09-10 05:50:18.497959
288	16	PRD-1789018928475-R1789019418568	116.0000	116.0000	available	2026-09-10 05:50:18.569031	2026-09-10 05:50:18.569031
289	16	PRD-1789018928475-R1789019418656	125.1000	125.1000	available	2026-09-10 05:50:18.657829	2026-09-10 05:50:18.657829
290	16	PRD-1789018928475-R1789019418762	120.0000	120.0000	available	2026-09-10 05:50:18.764034	2026-09-10 05:50:18.764034
291	16	PRD-1789018928475-R1789019418847	114.1000	114.1000	available	2026-09-10 05:50:18.849158	2026-09-10 05:50:18.849158
292	16	PRD-1789018928475-R1789019418925	120.0000	120.0000	available	2026-09-10 05:50:18.926664	2026-09-10 05:50:18.926664
293	16	PRD-1789018928475-R1789019419041	120.0000	120.0000	available	2026-09-10 05:50:19.042498	2026-09-10 05:50:19.042498
294	16	PRD-1789018928475-R1789019419134	121.1000	121.1000	available	2026-09-10 05:50:19.136119	2026-09-10 05:50:19.136119
295	16	PRD-1789018928475-R1789019419213	120.0000	120.0000	available	2026-09-10 05:50:19.214538	2026-09-10 05:50:19.214538
296	16	PRD-1789018928475-R1789019419302	124.9000	124.9000	available	2026-09-10 05:50:19.30432	2026-09-10 05:50:19.30432
297	16	PRD-1789018928475-R1789019419384	991.0000	991.0000	available	2026-09-10 05:50:19.385099	2026-09-10 05:50:19.385099
298	16	PRD-1789018928475-R1789019419462	118.2000	118.2000	available	2026-09-10 05:50:19.463582	2026-09-10 05:50:19.463582
299	16	PRD-1789018928475-R1789019419536	119.5000	119.5000	available	2026-09-10 05:50:19.537444	2026-09-10 05:50:19.537444
300	16	PRD-1789018928475-R1789019419671	120.0000	120.0000	available	2026-09-10 05:50:19.673152	2026-09-10 05:50:19.673152
301	16	PRD-1789018928475-R1789019419788	112.1000	112.1000	available	2026-09-10 05:50:19.790118	2026-09-10 05:50:19.790118
302	16	PRD-1789018928475-R1789019419907	117.4000	117.4000	available	2026-09-10 05:50:19.909544	2026-09-10 05:50:19.909544
303	16	PRD-1789018928475-R1789019420001	122.0000	122.0000	available	2026-09-10 05:50:20.00313	2026-09-10 05:50:20.00313
304	16	PRD-1789018928475-R1789019420106	116.5000	116.5000	available	2026-09-10 05:50:20.10739	2026-09-10 05:50:20.10739
305	16	PRD-1789018928475-R1789019420198	120.5000	120.5000	available	2026-09-10 05:50:20.19965	2026-09-10 05:50:20.19965
306	16	PRD-1789018928475-R1789019420281	119.1000	119.1000	available	2026-09-10 05:50:20.282357	2026-09-10 05:50:20.282357
307	16	PRD-1789018928475-R1789019420363	114.4000	114.4000	available	2026-09-10 05:50:20.365088	2026-09-10 05:50:20.365088
308	7	PRD-1789018404302-R1789019484690	101.8000	101.8000	available	2026-09-10 05:51:24.692212	2026-09-10 05:51:24.692212
309	7	PRD-1789018404302-R1789019484892	110.0000	110.0000	available	2026-09-10 05:51:24.89312	2026-09-10 05:51:24.89312
310	7	PRD-1789018404302-R1789019485101	117.1000	117.1000	available	2026-09-10 05:51:25.102955	2026-09-10 05:51:25.102955
311	7	PRD-1789018404302-R1789019485324	120.8000	120.8000	available	2026-09-10 05:51:25.32605	2026-09-10 05:51:25.32605
312	7	PRD-1789018404302-R1789019485518	102.0000	102.0000	available	2026-09-10 05:51:25.519667	2026-09-10 05:51:25.519667
313	7	PRD-1789018404302-R1789019485757	91.7000	91.7000	available	2026-09-10 05:51:25.759105	2026-09-10 05:51:25.759105
314	7	PRD-1789018404302-R1789019485973	117.7000	117.7000	available	2026-09-10 05:51:25.979625	2026-09-10 05:51:25.979625
315	7	PRD-1789018404302-R1789019486185	124.4000	124.4000	available	2026-09-10 05:51:26.187919	2026-09-10 05:51:26.187919
316	7	PRD-1789018404302-R1789019486436	116.8000	116.8000	available	2026-09-10 05:51:26.44914	2026-09-10 05:51:26.44914
317	7	PRD-1789018404302-R1789019486700	119.5000	119.5000	available	2026-09-10 05:51:26.701694	2026-09-10 05:51:26.701694
318	7	PRD-1789018404302-R1789019486959	123.9000	123.9000	available	2026-09-10 05:51:26.961011	2026-09-10 05:51:26.961011
319	7	PRD-1789018404302-R1789019487180	118.4000	118.4000	available	2026-09-10 05:51:27.181266	2026-09-10 05:51:27.181266
320	7	PRD-1789018404302-R1789019487368	95.9000	95.9000	available	2026-09-10 05:51:27.369067	2026-09-10 05:51:27.369067
321	7	PRD-1789018404302-R1789019487557	113.3000	113.3000	available	2026-09-10 05:51:27.559833	2026-09-10 05:51:27.559833
322	7	PRD-1789018404302-R1789019487801	116.7000	116.7000	available	2026-09-10 05:51:27.80354	2026-09-10 05:51:27.80354
323	7	PRD-1789018404302-R1789019488006	117.4000	117.4000	available	2026-09-10 05:51:28.010887	2026-09-10 05:51:28.010887
324	7	PRD-1789018404302-R1789019488198	128.6000	128.6000	available	2026-09-10 05:51:28.199368	2026-09-10 05:51:28.199368
325	7	PRD-1789018404302-R1789019488388	125.2000	125.2000	available	2026-09-10 05:51:28.390137	2026-09-10 05:51:28.390137
326	7	PRD-1789018404302-R1789019488620	120.0000	120.0000	available	2026-09-10 05:51:28.622047	2026-09-10 05:51:28.622047
327	7	PRD-1789018404302-R1789019488862	100.0000	100.0000	available	2026-09-10 05:51:28.863015	2026-09-10 05:51:28.863015
328	7	PRD-1789018404302-R1789019489045	120.8000	120.8000	available	2026-09-10 05:51:29.046169	2026-09-10 05:51:29.046169
329	7	PRD-1789018404302-R1789019489252	123.9000	123.9000	available	2026-09-10 05:51:29.253593	2026-09-10 05:51:29.253593
1211	12	PRD-1789018691298-R1789025793036	116.0000	116.0000	available	2026-09-10 07:36:33.03829	2026-09-10 07:36:33.03829
1213	12	PRD-1789018691298-R1789025793182	120.4000	120.4000	available	2026-09-10 07:36:33.18351	2026-09-10 07:36:33.18351
1217	12	PRD-1789018691298-R1789025793511	101.1000	101.1000	available	2026-09-10 07:36:33.51201	2026-09-10 07:36:33.51201
1221	12	PRD-1789018691298-R1789025793820	119.0000	119.0000	available	2026-09-10 07:36:33.823839	2026-09-10 07:36:33.823839
1222	12	PRD-1789018691298-R1789025793899	117.0000	117.0000	available	2026-09-10 07:36:33.909382	2026-09-10 07:36:33.909382
1224	12	PRD-1789018691298-R1789025794111	120.3000	120.3000	available	2026-09-10 07:36:34.112665	2026-09-10 07:36:34.112665
1229	12	PRD-1789018691298-R1789025794551	120.4000	120.4000	available	2026-09-10 07:36:34.555675	2026-09-10 07:36:34.555675
1233	12	PRD-1789018691298-R1789025794954	113.3000	113.3000	available	2026-09-10 07:36:34.95541	2026-09-10 07:36:34.95541
1234	12	PRD-1789018691298-R1789025795079	120.4000	120.4000	available	2026-09-10 07:36:35.08345	2026-09-10 07:36:35.08345
1242	12	PRD-1789018691298-R1789025795892	112.0000	112.0000	available	2026-09-10 07:36:35.895526	2026-09-10 07:36:35.895526
1243	12	PRD-1789018691298-R1789025796001	116.8000	116.8000	available	2026-09-10 07:36:36.002905	2026-09-10 07:36:36.002905
1370	30	PRD-1789024935840-R1789026710050	57.0000	57.0000	available	2026-09-10 07:51:50.055728	2026-09-10 07:51:50.055728
1374	30	PRD-1789024935840-R1789026710819	83.0000	83.0000	available	2026-09-10 07:51:50.821044	2026-09-10 07:51:50.821044
1557	1	PRD-1789017671180-R1789028046674	107.3000	107.3000	available	2026-09-10 08:14:06.675538	2026-09-10 08:14:06.675538
1559	1	PRD-1789017671180-R1789028047097	117.0000	117.0000	available	2026-09-10 08:14:07.098695	2026-09-10 08:14:07.098695
1560	1	PRD-1789017671180-R1789028047330	120.6000	120.6000	available	2026-09-10 08:14:07.33152	2026-09-10 08:14:07.33152
1561	1	PRD-1789017671180-R1789028047659	120.6000	120.6000	available	2026-09-10 08:14:07.661286	2026-09-10 08:14:07.661286
1562	1	PRD-1789017671180-R1789028047906	120.5000	120.5000	available	2026-09-10 08:14:07.907508	2026-09-10 08:14:07.907508
1563	1	PRD-1789017671180-R1789028048123	120.6000	120.6000	available	2026-09-10 08:14:08.123965	2026-09-10 08:14:08.123965
1696	7	PRD-1789018404302-R1789028833056	117.4000	117.4000	available	2026-09-10 08:27:13.058627	2026-09-10 08:27:13.058627
1697	7	PRD-1789018404302-R1789028833370	119.0000	119.0000	available	2026-09-10 08:27:13.37232	2026-09-10 08:27:13.37232
1698	7	PRD-1789018404302-R1789028833721	118.7000	118.7000	available	2026-09-10 08:27:13.723462	2026-09-10 08:27:13.723462
1704	7	PRD-1789018404302-R1789028836151	101.6000	101.6000	available	2026-09-10 08:27:16.151852	2026-09-10 08:27:16.151852
1707	7	PRD-1789018404302-R1789028837099	116.0000	116.0000	available	2026-09-10 08:27:17.102025	2026-09-10 08:27:17.102025
1711	7	PRD-1789018404302-R1789028838742	116.2000	116.2000	available	2026-09-10 08:27:18.744441	2026-09-10 08:27:18.744441
1714	7	PRD-1789018404302-R1789028839703	110.3000	110.3000	available	2026-09-10 08:27:19.705621	2026-09-10 08:27:19.705621
1961	12	PRD-1789018691298-R1789029790503	120.0000	120.0000	available	2026-09-10 08:43:10.505708	2026-09-10 08:43:10.505708
1966	12	PRD-1789018691298-R1789029791124	107.4000	107.4000	available	2026-09-10 08:43:11.126816	2026-09-10 08:43:11.126816
1969	12	PRD-1789018691298-R1789029791503	123.8000	123.8000	available	2026-09-10 08:43:11.505971	2026-09-10 08:43:11.505971
1974	12	PRD-1789018691298-R1789029792163	122.4000	122.4000	available	2026-09-10 08:43:12.165937	2026-09-10 08:43:12.165937
1977	12	PRD-1789018691298-R1789029792526	126.9000	126.9000	available	2026-09-10 08:43:12.52727	2026-09-10 08:43:12.52727
1980	12	PRD-1789018691298-R1789029792911	98.8000	98.8000	available	2026-09-10 08:43:12.913239	2026-09-10 08:43:12.913239
1981	12	PRD-1789018691298-R1789029793074	127.0000	127.0000	available	2026-09-10 08:43:13.077399	2026-09-10 08:43:13.077399
1984	12	PRD-1789018691298-R1789029793463	126.0000	126.0000	available	2026-09-10 08:43:13.464884	2026-09-10 08:43:13.464884
1985	12	PRD-1789018691298-R1789029793600	125.0000	125.0000	available	2026-09-10 08:43:13.601169	2026-09-10 08:43:13.601169
1990	12	PRD-1789018691298-R1789029794380	121.6000	121.6000	available	2026-09-10 08:43:14.382126	2026-09-10 08:43:14.382126
2101	54	PRD-1789031590529-R1789031727626	120.0000	120.0000	available	2026-09-10 09:15:27.627854	2026-09-10 09:15:27.627854
2114	54	PRD-1789031590529-R1789031729989	120.3000	120.3000	available	2026-09-10 09:15:29.992799	2026-09-10 09:15:29.992799
2126	54	PRD-1789031590529-R1789031732754	118.0000	118.0000	available	2026-09-10 09:15:32.755782	2026-09-10 09:15:32.755782
2128	54	PRD-1789031590529-R1789031733136	123.5000	123.5000	available	2026-09-10 09:15:33.137882	2026-09-10 09:15:33.137882
2129	54	PRD-1789031590529-R1789031733332	120.3000	120.3000	available	2026-09-10 09:15:33.333881	2026-09-10 09:15:33.333881
2135	54	PRD-1789031590529-R1789031734510	109.7000	109.7000	available	2026-09-10 09:15:34.513138	2026-09-10 09:15:34.513138
2198	26	PRD-1789021819488-R1789031991491	122.0000	122.0000	available	2026-09-10 09:19:51.499745	2026-09-10 09:19:51.499745
2208	26	PRD-1789021819488-R1789031994020	118.8000	118.8000	available	2026-09-10 09:19:54.022052	2026-09-10 09:19:54.022052
2220	18	PRD-1789018957547-R1789033302132	123.4000	123.4000	available	2026-09-10 09:41:42.133747	2026-09-10 09:41:42.133747
2221	18	PRD-1789018957547-R1789033302344	118.4000	118.4000	available	2026-09-10 09:41:42.345046	2026-09-10 09:41:42.345046
2222	18	PRD-1789018957547-R1789033302528	118.3000	118.3000	available	2026-09-10 09:41:42.529626	2026-09-10 09:41:42.529626
2223	18	PRD-1789018957547-R1789033302732	118.0000	118.0000	available	2026-09-10 09:41:42.733096	2026-09-10 09:41:42.733096
2224	18	PRD-1789018957547-R1789033302924	118.3000	118.3000	available	2026-09-10 09:41:42.925366	2026-09-10 09:41:42.925366
2225	18	PRD-1789018957547-R1789033303120	118.3000	118.3000	available	2026-09-10 09:41:43.121158	2026-09-10 09:41:43.121158
2226	18	PRD-1789018957547-R1789033303301	118.2000	118.2000	available	2026-09-10 09:41:43.303113	2026-09-10 09:41:43.303113
2227	18	PRD-1789018957547-R1789033303502	118.3000	118.3000	available	2026-09-10 09:41:43.502991	2026-09-10 09:41:43.502991
2228	18	PRD-1789018957547-R1789033303666	118.3000	118.3000	available	2026-09-10 09:41:43.667449	2026-09-10 09:41:43.667449
2229	18	PRD-1789018957547-R1789033303872	118.3000	118.3000	available	2026-09-10 09:41:43.873451	2026-09-10 09:41:43.873451
2230	18	PRD-1789018957547-R1789033304090	121.1000	121.1000	available	2026-09-10 09:41:44.091868	2026-09-10 09:41:44.091868
2231	18	PRD-1789018957547-R1789033304308	118.3000	118.3000	available	2026-09-10 09:41:44.310265	2026-09-10 09:41:44.310265
2232	18	PRD-1789018957547-R1789033304577	136.7000	136.7000	available	2026-09-10 09:41:44.578254	2026-09-10 09:41:44.578254
2233	18	PRD-1789018957547-R1789033304781	118.3000	118.3000	available	2026-09-10 09:41:44.782506	2026-09-10 09:41:44.782506
2234	18	PRD-1789018957547-R1789033304964	127.0000	127.0000	available	2026-09-10 09:41:44.965622	2026-09-10 09:41:44.965622
2235	18	PRD-1789018957547-R1789033305143	114.9000	114.9000	available	2026-09-10 09:41:45.144888	2026-09-10 09:41:45.144888
2236	55	PRD-1789032520852-R1789033394760	120.0000	120.0000	available	2026-09-10 09:43:14.762271	2026-09-10 09:43:14.762271
2237	55	PRD-1789032520852-R1789033394812	120.0000	120.0000	available	2026-09-10 09:43:14.81389	2026-09-10 09:43:14.81389
330	7	PRD-1789018404302-R1789019489446	111.6000	111.6000	available	2026-09-10 05:51:29.447346	2026-09-10 05:51:29.447346
331	7	PRD-1789018404302-R1789019489669	100.0000	100.0000	available	2026-09-10 05:51:29.670884	2026-09-10 05:51:29.670884
332	7	PRD-1789018404302-R1789019510446	115.6000	115.6000	available	2026-09-10 05:51:50.447652	2026-09-10 05:51:50.447652
1212	12	PRD-1789018691298-R1789025793114	116.5000	116.5000	available	2026-09-10 07:36:33.11619	2026-09-10 07:36:33.11619
1216	12	PRD-1789018691298-R1789025793430	97.7000	97.7000	available	2026-09-10 07:36:33.431739	2026-09-10 07:36:33.431739
1218	12	PRD-1789018691298-R1789025793574	116.0000	116.0000	available	2026-09-10 07:36:33.575673	2026-09-10 07:36:33.575673
1220	12	PRD-1789018691298-R1789025793744	120.0000	120.0000	available	2026-09-10 07:36:33.745073	2026-09-10 07:36:33.745073
1225	12	PRD-1789018691298-R1789025794181	116.3000	116.3000	available	2026-09-10 07:36:34.183315	2026-09-10 07:36:34.183315
1227	12	PRD-1789018691298-R1789025794365	117.7000	117.7000	available	2026-09-10 07:36:34.366924	2026-09-10 07:36:34.366924
1230	12	PRD-1789018691298-R1789025794648	117.2000	117.2000	available	2026-09-10 07:36:34.649298	2026-09-10 07:36:34.649298
1231	12	PRD-1789018691298-R1789025794731	120.4000	120.4000	available	2026-09-10 07:36:34.741111	2026-09-10 07:36:34.741111
1235	12	PRD-1789018691298-R1789025795218	120.3000	120.3000	available	2026-09-10 07:36:35.220425	2026-09-10 07:36:35.220425
1239	12	PRD-1789018691298-R1789025795654	107.0000	107.0000	available	2026-09-10 07:36:35.655858	2026-09-10 07:36:35.655858
1240	12	PRD-1789018691298-R1789025795745	114.0000	114.0000	available	2026-09-10 07:36:35.747877	2026-09-10 07:36:35.747877
1241	12	PRD-1789018691298-R1789025795805	116.0000	116.0000	available	2026-09-10 07:36:35.806837	2026-09-10 07:36:35.806837
1385	28	PRD-1789024618261-R1789026746668	70.0000	70.0000	available	2026-09-10 07:52:26.672338	2026-09-10 07:52:26.672338
1567	45	PRD-1789028070299-R1789028081961	136.0000	136.0000	available	2026-09-10 08:14:41.962923	2026-09-10 08:14:41.962923
348	16	PRD-1789018928475-R1789020463475	120.0000	120.0000	available	2026-09-10 06:07:43.479622	2026-09-10 06:07:43.479622
349	16	PRD-1789018928475-R1789020463554	103.4000	103.4000	available	2026-09-10 06:07:43.573267	2026-09-10 06:07:43.573267
350	16	PRD-1789018928475-R1789020463729	120.1000	120.1000	available	2026-09-10 06:07:43.731714	2026-09-10 06:07:43.731714
351	16	PRD-1789018928475-R1789020463847	120.0000	120.0000	available	2026-09-10 06:07:43.84919	2026-09-10 06:07:43.84919
352	16	PRD-1789018928475-R1789020463980	118.7000	118.7000	available	2026-09-10 06:07:43.986992	2026-09-10 06:07:43.986992
353	16	PRD-1789018928475-R1789020464088	119.2000	119.2000	available	2026-09-10 06:07:44.094328	2026-09-10 06:07:44.094328
354	16	PRD-1789018928475-R1789020464188	121.2000	121.2000	available	2026-09-10 06:07:44.190387	2026-09-10 06:07:44.190387
355	16	PRD-1789018928475-R1789020464287	117.8000	117.8000	available	2026-09-10 06:07:44.289431	2026-09-10 06:07:44.289431
356	16	PRD-1789018928475-R1789020464377	120.9000	120.9000	available	2026-09-10 06:07:44.390175	2026-09-10 06:07:44.390175
357	16	PRD-1789018928475-R1789020464510	119.1000	119.1000	available	2026-09-10 06:07:44.512887	2026-09-10 06:07:44.512887
358	16	PRD-1789018928475-R1789020464658	117.7000	117.7000	available	2026-09-10 06:07:44.660892	2026-09-10 06:07:44.660892
359	16	PRD-1789018928475-R1789020464764	116.3000	116.3000	available	2026-09-10 06:07:44.766804	2026-09-10 06:07:44.766804
360	16	PRD-1789018928475-R1789020464872	107.3000	107.3000	available	2026-09-10 06:07:44.879373	2026-09-10 06:07:44.879373
361	16	PRD-1789018928475-R1789020465032	114.0000	114.0000	available	2026-09-10 06:07:45.037051	2026-09-10 06:07:45.037051
362	16	PRD-1789018928475-R1789020465172	112.6000	112.6000	available	2026-09-10 06:07:45.174272	2026-09-10 06:07:45.174272
363	16	PRD-1789018928475-R1789020465274	118.8000	118.8000	available	2026-09-10 06:07:45.276163	2026-09-10 06:07:45.276163
364	16	PRD-1789018928475-R1789020465394	116.9000	116.9000	available	2026-09-10 06:07:45.395875	2026-09-10 06:07:45.395875
365	16	PRD-1789018928475-R1789020465525	121.0000	121.0000	available	2026-09-10 06:07:45.526059	2026-09-10 06:07:45.526059
366	16	PRD-1789018928475-R1789020465645	118.1000	118.1000	available	2026-09-10 06:07:45.647675	2026-09-10 06:07:45.647675
367	16	PRD-1789018928475-R1789020465765	121.5000	121.5000	available	2026-09-10 06:07:45.767047	2026-09-10 06:07:45.767047
368	16	PRD-1789018928475-R1789020465915	121.3000	121.3000	available	2026-09-10 06:07:45.923034	2026-09-10 06:07:45.923034
369	16	PRD-1789018928475-R1789020466042	120.0000	120.0000	available	2026-09-10 06:07:46.043838	2026-09-10 06:07:46.043838
370	16	PRD-1789018928475-R1789020466189	120.8000	120.8000	available	2026-09-10 06:07:46.193482	2026-09-10 06:07:46.193482
371	16	PRD-1789018928475-R1789020466338	122.8000	122.8000	available	2026-09-10 06:07:46.340843	2026-09-10 06:07:46.340843
372	16	PRD-1789018928475-R1789020466437	111.0000	111.0000	available	2026-09-10 06:07:46.439588	2026-09-10 06:07:46.439588
373	16	PRD-1789018928475-R1789020466582	122.0000	122.0000	available	2026-09-10 06:07:46.584533	2026-09-10 06:07:46.584533
374	16	PRD-1789018928475-R1789020466803	120.0000	120.0000	available	2026-09-10 06:07:46.804409	2026-09-10 06:07:46.804409
375	16	PRD-1789018928475-R1789020466920	104.0000	104.0000	available	2026-09-10 06:07:46.921999	2026-09-10 06:07:46.921999
376	16	PRD-1789018928475-R1789020467175	119.9000	119.9000	available	2026-09-10 06:07:47.177749	2026-09-10 06:07:47.177749
377	16	PRD-1789018928475-R1789020467314	119.1000	119.1000	available	2026-09-10 06:07:47.316281	2026-09-10 06:07:47.316281
378	16	PRD-1789018928475-R1789020467480	119.6000	119.6000	available	2026-09-10 06:07:47.481572	2026-09-10 06:07:47.481572
379	16	PRD-1789018928475-R1789020467663	88.3000	88.3000	available	2026-09-10 06:07:47.66801	2026-09-10 06:07:47.66801
380	16	PRD-1789018928475-R1789020467773	103.1000	103.1000	available	2026-09-10 06:07:47.776161	2026-09-10 06:07:47.776161
381	16	PRD-1789018928475-R1789020467941	107.0000	107.0000	available	2026-09-10 06:07:47.943124	2026-09-10 06:07:47.943124
382	16	PRD-1789018928475-R1789020468079	120.8000	120.8000	available	2026-09-10 06:07:48.081437	2026-09-10 06:07:48.081437
383	16	PRD-1789018928475-R1789020468265	119.6000	119.6000	available	2026-09-10 06:07:48.267666	2026-09-10 06:07:48.267666
384	16	PRD-1789018928475-R1789020468425	118.8000	118.8000	available	2026-09-10 06:07:48.427431	2026-09-10 06:07:48.427431
385	16	PRD-1789018928475-R1789020468591	127.9000	127.9000	available	2026-09-10 06:07:48.600944	2026-09-10 06:07:48.600944
386	16	PRD-1789018928475-R1789020468841	120.0000	120.0000	available	2026-09-10 06:07:48.843808	2026-09-10 06:07:48.843808
387	16	PRD-1789018928475-R1789020469017	119.0000	119.0000	available	2026-09-10 06:07:49.023966	2026-09-10 06:07:49.023966
388	16	PRD-1789018928475-R1789020469162	120.0000	120.0000	available	2026-09-10 06:07:49.165391	2026-09-10 06:07:49.165391
389	16	PRD-1789018928475-R1789020469313	115.6000	115.6000	available	2026-09-10 06:07:49.316312	2026-09-10 06:07:49.316312
390	16	PRD-1789018928475-R1789020469505	120.0000	120.0000	available	2026-09-10 06:07:49.509053	2026-09-10 06:07:49.509053
391	23	PRD-1789020510805-R1789020587151	115.7000	115.7000	available	2026-09-10 06:09:47.152542	2026-09-10 06:09:47.152542
392	23	PRD-1789020510805-R1789020587212	103.1000	103.1000	available	2026-09-10 06:09:47.213801	2026-09-10 06:09:47.213801
393	23	PRD-1789020510805-R1789020587290	103.2000	103.2000	available	2026-09-10 06:09:47.291519	2026-09-10 06:09:47.291519
394	23	PRD-1789020510805-R1789020587350	119.5000	119.5000	available	2026-09-10 06:09:47.351243	2026-09-10 06:09:47.351243
395	24	PRD-1789020615250-R1789020961432	124.1000	124.1000	available	2026-09-10 06:16:01.434756	2026-09-10 06:16:01.434756
396	24	PRD-1789020615250-R1789020961543	128.9000	128.9000	available	2026-09-10 06:16:01.54541	2026-09-10 06:16:01.54541
397	24	PRD-1789020615250-R1789020961672	120.6000	120.6000	available	2026-09-10 06:16:01.674836	2026-09-10 06:16:01.674836
398	24	PRD-1789020615250-R1789020961732	129.7000	129.7000	available	2026-09-10 06:16:01.733064	2026-09-10 06:16:01.733064
399	24	PRD-1789020615250-R1789020961791	112.1000	112.1000	available	2026-09-10 06:16:01.793064	2026-09-10 06:16:01.793064
400	24	PRD-1789020615250-R1789020961905	128.1000	128.1000	available	2026-09-10 06:16:01.906506	2026-09-10 06:16:01.906506
401	24	PRD-1789020615250-R1789020962047	124.3000	124.3000	available	2026-09-10 06:16:02.048656	2026-09-10 06:16:02.048656
402	24	PRD-1789020615250-R1789020962161	129.7000	129.7000	available	2026-09-10 06:16:02.162496	2026-09-10 06:16:02.162496
403	24	PRD-1789020615250-R1789020962277	111.7000	111.7000	available	2026-09-10 06:16:02.279251	2026-09-10 06:16:02.279251
404	24	PRD-1789020615250-R1789020962352	127.7000	127.7000	available	2026-09-10 06:16:02.355937	2026-09-10 06:16:02.355937
405	24	PRD-1789020615250-R1789020962440	131.6000	131.6000	available	2026-09-10 06:16:02.442384	2026-09-10 06:16:02.442384
406	24	PRD-1789020615250-R1789020962507	129.1000	129.1000	available	2026-09-10 06:16:02.508985	2026-09-10 06:16:02.508985
407	24	PRD-1789020615250-R1789020962580	109.0000	109.0000	available	2026-09-10 06:16:02.581628	2026-09-10 06:16:02.581628
408	24	PRD-1789020615250-R1789020962653	104.8000	104.8000	available	2026-09-10 06:16:02.654972	2026-09-10 06:16:02.654972
409	24	PRD-1789020615250-R1789020962720	113.8000	113.8000	available	2026-09-10 06:16:02.722259	2026-09-10 06:16:02.722259
410	24	PRD-1789020615250-R1789020962791	109.8000	109.8000	available	2026-09-10 06:16:02.792758	2026-09-10 06:16:02.792758
411	24	PRD-1789020615250-R1789020962861	117.3000	117.3000	available	2026-09-10 06:16:02.862686	2026-09-10 06:16:02.862686
412	24	PRD-1789020615250-R1789020962942	117.8000	117.8000	available	2026-09-10 06:16:02.943572	2026-09-10 06:16:02.943572
413	24	PRD-1789020615250-R1789020963036	108.7000	108.7000	available	2026-09-10 06:16:03.037736	2026-09-10 06:16:03.037736
414	24	PRD-1789020615250-R1789020963123	119.8000	119.8000	available	2026-09-10 06:16:03.124642	2026-09-10 06:16:03.124642
415	24	PRD-1789020615250-R1789020963212	117.4000	117.4000	available	2026-09-10 06:16:03.214204	2026-09-10 06:16:03.214204
416	24	PRD-1789020615250-R1789020963321	120.4000	120.4000	available	2026-09-10 06:16:03.322908	2026-09-10 06:16:03.322908
417	24	PRD-1789020615250-R1789020963407	101.4000	101.4000	available	2026-09-10 06:16:03.40879	2026-09-10 06:16:03.40879
418	24	PRD-1789020615250-R1789020963465	104.4000	104.4000	available	2026-09-10 06:16:03.466691	2026-09-10 06:16:03.466691
419	24	PRD-1789020615250-R1789020963574	112.8000	112.8000	available	2026-09-10 06:16:03.576323	2026-09-10 06:16:03.576323
420	24	PRD-1789020615250-R1789020963662	119.6000	119.6000	available	2026-09-10 06:16:03.665407	2026-09-10 06:16:03.665407
421	24	PRD-1789020615250-R1789020963769	113.8000	113.8000	available	2026-09-10 06:16:03.772263	2026-09-10 06:16:03.772263
422	24	PRD-1789020615250-R1789020963862	120.1000	120.1000	available	2026-09-10 06:16:03.865338	2026-09-10 06:16:03.865338
423	24	PRD-1789020615250-R1789020963979	111.3000	111.3000	available	2026-09-10 06:16:03.980688	2026-09-10 06:16:03.980688
424	24	PRD-1789020615250-R1789020964100	113.9000	113.9000	available	2026-09-10 06:16:04.101976	2026-09-10 06:16:04.101976
425	24	PRD-1789020615250-R1789020964226	117.0000	117.0000	available	2026-09-10 06:16:04.229369	2026-09-10 06:16:04.229369
426	24	PRD-1789020615250-R1789020964377	116.7000	116.7000	available	2026-09-10 06:16:04.379947	2026-09-10 06:16:04.379947
427	24	PRD-1789020615250-R1789020964522	138.2000	138.2000	available	2026-09-10 06:16:04.524357	2026-09-10 06:16:04.524357
428	24	PRD-1789020615250-R1789020964638	128.7000	128.7000	available	2026-09-10 06:16:04.641103	2026-09-10 06:16:04.641103
429	24	PRD-1789020615250-R1789020964701	130.2000	130.2000	available	2026-09-10 06:16:04.702817	2026-09-10 06:16:04.702817
430	24	PRD-1789020615250-R1789020964813	128.1000	128.1000	available	2026-09-10 06:16:04.815007	2026-09-10 06:16:04.815007
431	24	PRD-1789020615250-R1789020964951	127.6000	127.6000	available	2026-09-10 06:16:04.953877	2026-09-10 06:16:04.953877
432	24	PRD-1789020615250-R1789020965105	129.7000	129.7000	available	2026-09-10 06:16:05.107088	2026-09-10 06:16:05.107088
433	24	PRD-1789020615250-R1789020965269	125.7000	125.7000	available	2026-09-10 06:16:05.270859	2026-09-10 06:16:05.270859
434	24	PRD-1789020615250-R1789020965390	136.9000	136.9000	available	2026-09-10 06:16:05.391899	2026-09-10 06:16:05.391899
435	24	PRD-1789020615250-R1789020965515	128.0000	128.0000	available	2026-09-10 06:16:05.516821	2026-09-10 06:16:05.516821
436	24	PRD-1789020615250-R1789020965636	132.2000	132.2000	available	2026-09-10 06:16:05.637604	2026-09-10 06:16:05.637604
437	24	PRD-1789020615250-R1789020965748	133.0000	133.0000	available	2026-09-10 06:16:05.750182	2026-09-10 06:16:05.750182
438	24	PRD-1789020615250-R1789020965895	126.9000	126.9000	available	2026-09-10 06:16:05.897096	2026-09-10 06:16:05.897096
439	24	PRD-1789020615250-R1789020966007	130.1000	130.1000	available	2026-09-10 06:16:06.008816	2026-09-10 06:16:06.008816
440	24	PRD-1789020615250-R1789020966206	112.0000	112.0000	available	2026-09-10 06:16:06.208965	2026-09-10 06:16:06.208965
441	24	PRD-1789020615250-R1789020966339	122.0000	122.0000	available	2026-09-10 06:16:06.340927	2026-09-10 06:16:06.340927
442	24	PRD-1789020615250-R1789020966446	99.1000	99.1000	available	2026-09-10 06:16:06.44813	2026-09-10 06:16:06.44813
443	24	PRD-1789020615250-R1789020966549	136.2000	136.2000	available	2026-09-10 06:16:06.55048	2026-09-10 06:16:06.55048
444	24	PRD-1789020615250-R1789020966707	119.3000	119.3000	available	2026-09-10 06:16:06.709004	2026-09-10 06:16:06.709004
445	24	PRD-1789020615250-R1789020966922	114.2000	114.2000	available	2026-09-10 06:16:06.930626	2026-09-10 06:16:06.930626
446	24	PRD-1789020615250-R1789020967122	124.0000	124.0000	available	2026-09-10 06:16:07.123813	2026-09-10 06:16:07.123813
447	24	PRD-1789020615250-R1789020967271	115.1000	115.1000	available	2026-09-10 06:16:07.272638	2026-09-10 06:16:07.272638
448	24	PRD-1789020615250-R1789020967396	116.4000	116.4000	available	2026-09-10 06:16:07.398034	2026-09-10 06:16:07.398034
449	24	PRD-1789020615250-R1789020967580	120.3000	120.3000	available	2026-09-10 06:16:07.582688	2026-09-10 06:16:07.582688
450	24	PRD-1789020615250-R1789020967835	120.8000	120.8000	available	2026-09-10 06:16:07.837345	2026-09-10 06:16:07.837345
451	24	PRD-1789020615250-R1789020967914	114.4000	114.4000	available	2026-09-10 06:16:07.916233	2026-09-10 06:16:07.916233
452	24	PRD-1789020615250-R1789020968031	135.0000	135.0000	available	2026-09-10 06:16:08.032358	2026-09-10 06:16:08.032358
453	24	PRD-1789020615250-R1789020968155	100.7000	100.7000	available	2026-09-10 06:16:08.157647	2026-09-10 06:16:08.157647
454	24	PRD-1789020615250-R1789020968268	123.6000	123.6000	available	2026-09-10 06:16:08.270061	2026-09-10 06:16:08.270061
455	24	PRD-1789020615250-R1789020968390	118.2000	118.2000	available	2026-09-10 06:16:08.391485	2026-09-10 06:16:08.391485
456	24	PRD-1789020615250-R1789020968555	111.4000	111.4000	available	2026-09-10 06:16:08.557623	2026-09-10 06:16:08.557623
457	24	PRD-1789020615250-R1789020968667	115.0000	115.0000	available	2026-09-10 06:16:08.672062	2026-09-10 06:16:08.672062
458	24	PRD-1789020615250-R1789020968835	120.5000	120.5000	available	2026-09-10 06:16:08.83718	2026-09-10 06:16:08.83718
459	24	PRD-1789020615250-R1789020968942	119.0000	119.0000	available	2026-09-10 06:16:08.944651	2026-09-10 06:16:08.944651
460	24	PRD-1789020615250-R1789020969054	113.9000	113.9000	available	2026-09-10 06:16:09.056075	2026-09-10 06:16:09.056075
461	24	PRD-1789020615250-R1789020969166	118.1000	118.1000	available	2026-09-10 06:16:09.169032	2026-09-10 06:16:09.169032
462	7	PRD-1789018404302-R1789021070649-1	96.6112	96.6112	available	2026-09-10 06:17:50.65111	2026-09-10 06:17:50.65111
463	7	PRD-1789018404302-R1789021118433	112.7000	112.7000	available	2026-09-10 06:18:38.435065	2026-09-10 06:18:38.435065
464	7	PRD-1789018404302-R1789021118713	113.6000	113.6000	available	2026-09-10 06:18:38.714311	2026-09-10 06:18:38.714311
465	7	PRD-1789018404302-R1789021119027	125.4000	125.4000	available	2026-09-10 06:18:39.029269	2026-09-10 06:18:39.029269
466	7	PRD-1789018404302-R1789021119534	116.7000	116.7000	available	2026-09-10 06:18:39.535606	2026-09-10 06:18:39.535606
467	7	PRD-1789018404302-R1789021119828	117.1000	117.1000	available	2026-09-10 06:18:39.829209	2026-09-10 06:18:39.829209
468	7	PRD-1789018404302-R1789021120076	115.9000	115.9000	available	2026-09-10 06:18:40.077414	2026-09-10 06:18:40.077414
469	7	PRD-1789018404302-R1789021120435	115.3000	115.3000	available	2026-09-10 06:18:40.437968	2026-09-10 06:18:40.437968
470	7	PRD-1789018404302-R1789021206452	120.5000	120.5000	available	2026-09-10 06:20:06.453911	2026-09-10 06:20:06.453911
471	7	PRD-1789018404302-R1789021206716	121.2000	121.2000	available	2026-09-10 06:20:06.718017	2026-09-10 06:20:06.718017
472	7	PRD-1789018404302-R1789021206966	120.8000	120.8000	available	2026-09-10 06:20:06.968079	2026-09-10 06:20:06.968079
473	7	PRD-1789018404302-R1789021207306	121.3000	121.3000	available	2026-09-10 06:20:07.30796	2026-09-10 06:20:07.30796
474	7	PRD-1789018404302-R1789021207604	152.1000	152.1000	available	2026-09-10 06:20:07.605707	2026-09-10 06:20:07.605707
475	7	PRD-1789018404302-R1789021207917	106.6000	106.6000	available	2026-09-10 06:20:07.919318	2026-09-10 06:20:07.919318
476	7	PRD-1789018404302-R1789021208206	116.0000	116.0000	available	2026-09-10 06:20:08.207398	2026-09-10 06:20:08.207398
477	7	PRD-1789018404302-R1789021208512	115.7000	115.7000	available	2026-09-10 06:20:08.514389	2026-09-10 06:20:08.514389
478	7	PRD-1789018404302-R1789021209023	118.4000	118.4000	available	2026-09-10 06:20:09.024549	2026-09-10 06:20:09.024549
479	7	PRD-1789018404302-R1789021209296	114.0000	114.0000	available	2026-09-10 06:20:09.29788	2026-09-10 06:20:09.29788
480	7	PRD-1789018404302-R1789021209666	113.9000	113.9000	available	2026-09-10 06:20:09.669414	2026-09-10 06:20:09.669414
490	7	PRD-1789018404302-R1789021213128	120.4000	120.4000	available	2026-09-10 06:20:13.132913	2026-09-10 06:20:13.132913
491	7	PRD-1789018404302-R1789021213432	120.4000	120.4000	available	2026-09-10 06:20:13.434757	2026-09-10 06:20:13.434757
492	7	PRD-1789018404302-R1789021213802	114.0000	114.0000	available	2026-09-10 06:20:13.803662	2026-09-10 06:20:13.803662
1244	30	PRD-1789024935840-R1789026019480	85.0000	85.0000	available	2026-09-10 07:40:19.481965	2026-09-10 07:40:19.481965
1245	30	PRD-1789024935840-R1789026019553	68.0000	68.0000	available	2026-09-10 07:40:19.567436	2026-09-10 07:40:19.567436
1246	30	PRD-1789024935840-R1789026019716	76.0000	76.0000	available	2026-09-10 07:40:19.718588	2026-09-10 07:40:19.718588
1247	30	PRD-1789024935840-R1789026019831	80.0000	80.0000	available	2026-09-10 07:40:19.832922	2026-09-10 07:40:19.832922
1251	30	PRD-1789024935840-R1789026020214	64.0000	64.0000	available	2026-09-10 07:40:20.217744	2026-09-10 07:40:20.217744
1252	30	PRD-1789024935840-R1789026020320	80.0000	80.0000	available	2026-09-10 07:40:20.321564	2026-09-10 07:40:20.321564
1253	30	PRD-1789024935840-R1789026020408	77.0000	77.0000	available	2026-09-10 07:40:20.410166	2026-09-10 07:40:20.410166
1255	30	PRD-1789024935840-R1789026020597	83.0000	83.0000	available	2026-09-10 07:40:20.599497	2026-09-10 07:40:20.599497
1256	30	PRD-1789024935840-R1789026020679	80.0000	80.0000	available	2026-09-10 07:40:20.679927	2026-09-10 07:40:20.679927
1257	30	PRD-1789024935840-R1789026020771	87.0000	87.0000	available	2026-09-10 07:40:20.773414	2026-09-10 07:40:20.773414
1264	30	PRD-1789024935840-R1789026021603	85.0000	85.0000	available	2026-09-10 07:40:21.605391	2026-09-10 07:40:21.605391
1267	30	PRD-1789024935840-R1789026021928	75.0000	75.0000	available	2026-09-10 07:40:21.930005	2026-09-10 07:40:21.930005
1269	30	PRD-1789024935840-R1789026022195	60.0000	60.0000	available	2026-09-10 07:40:22.198984	2026-09-10 07:40:22.198984
1270	30	PRD-1789024935840-R1789026022289	80.0000	80.0000	available	2026-09-10 07:40:22.291289	2026-09-10 07:40:22.291289
1272	30	PRD-1789024935840-R1789026022479	75.0000	75.0000	available	2026-09-10 07:40:22.481293	2026-09-10 07:40:22.481293
1276	30	PRD-1789024935840-R1789026022901	83.0000	83.0000	available	2026-09-10 07:40:22.902548	2026-09-10 07:40:22.902548
1277	30	PRD-1789024935840-R1789026022994	73.0000	73.0000	available	2026-09-10 07:40:22.996433	2026-09-10 07:40:22.996433
1280	30	PRD-1789024935840-R1789026023316	70.0000	70.0000	available	2026-09-10 07:40:23.317354	2026-09-10 07:40:23.317354
1283	30	PRD-1789024935840-R1789026023638	65.0000	65.0000	available	2026-09-10 07:40:23.639752	2026-09-10 07:40:23.639752
1386	28	PRD-1789024618261-R1789026746782	75.0000	75.0000	available	2026-09-10 07:52:26.784287	2026-09-10 07:52:26.784287
1387	28	PRD-1789024618261-R1789026746874	70.0000	70.0000	available	2026-09-10 07:52:26.879024	2026-09-10 07:52:26.879024
1568	45	PRD-1789028070299-R1789028082046	126.1000	126.1000	available	2026-09-10 08:14:42.048263	2026-09-10 08:14:42.048263
1719	20	PRD-1789019067284-R1789028894249	118.2000	118.2000	available	2026-09-10 08:28:14.251219	2026-09-10 08:28:14.251219
1722	20	PRD-1789019067284-R1789028894763	125.1000	125.1000	available	2026-09-10 08:28:14.772842	2026-09-10 08:28:14.772842
1723	20	PRD-1789019067284-R1789028894857	137.7000	137.7000	available	2026-09-10 08:28:14.860419	2026-09-10 08:28:14.860419
1964	12	PRD-1789018691298-R1789029790850	116.7000	116.7000	available	2026-09-10 08:43:10.851702	2026-09-10 08:43:10.851702
1965	12	PRD-1789018691298-R1789029790986	125.0000	125.0000	available	2026-09-10 08:43:10.98816	2026-09-10 08:43:10.98816
1968	12	PRD-1789018691298-R1789029791376	108.3000	108.3000	available	2026-09-10 08:43:11.377771	2026-09-10 08:43:11.377771
1971	12	PRD-1789018691298-R1789029791735	120.1000	120.1000	available	2026-09-10 08:43:11.736786	2026-09-10 08:43:11.736786
1972	12	PRD-1789018691298-R1789029791903	120.3000	120.3000	available	2026-09-10 08:43:11.904291	2026-09-10 08:43:11.904291
1973	12	PRD-1789018691298-R1789029792042	120.8000	120.8000	available	2026-09-10 08:43:12.043829	2026-09-10 08:43:12.043829
1978	12	PRD-1789018691298-R1789029792648	110.9000	110.9000	available	2026-09-10 08:43:12.650978	2026-09-10 08:43:12.650978
1983	12	PRD-1789018691298-R1789029793345	132.1000	132.1000	available	2026-09-10 08:43:13.346634	2026-09-10 08:43:13.346634
1988	12	PRD-1789018691298-R1789029794105	123.3000	123.3000	available	2026-09-10 08:43:14.107584	2026-09-10 08:43:14.107584
2137	54	PRD-1789031590529-R1789031734945	125.7000	125.7000	available	2026-09-10 09:15:34.946287	2026-09-10 09:15:34.946287
2140	54	PRD-1789031590529-R1789031735511	120.0000	120.0000	available	2026-09-10 09:15:35.51607	2026-09-10 09:15:35.51607
2141	54	PRD-1789031590529-R1789031735685	120.3000	120.3000	available	2026-09-10 09:15:35.686647	2026-09-10 09:15:35.686647
2142	26	PRD-1789021819488-R1789031977533	112.0000	112.0000	available	2026-09-10 09:19:37.535842	2026-09-10 09:19:37.535842
2143	26	PRD-1789021819488-R1789031978260	125.5000	125.5000	available	2026-09-10 09:19:38.261283	2026-09-10 09:19:38.261283
2145	26	PRD-1789021819488-R1789031978747	135.0000	135.0000	available	2026-09-10 09:19:38.748679	2026-09-10 09:19:38.748679
2155	26	PRD-1789021819488-R1789031980858	136.7000	136.7000	available	2026-09-10 09:19:40.859408	2026-09-10 09:19:40.859408
2156	26	PRD-1789021819488-R1789031981126	133.9000	133.9000	available	2026-09-10 09:19:41.12699	2026-09-10 09:19:41.12699
2170	26	PRD-1789021819488-R1789031984259	128.5000	128.5000	available	2026-09-10 09:19:44.262147	2026-09-10 09:19:44.262147
2180	26	PRD-1789021819488-R1789031986518	137.3000	137.3000	available	2026-09-10 09:19:46.521029	2026-09-10 09:19:46.521029
2184	26	PRD-1789021819488-R1789031987466	109.7000	109.7000	available	2026-09-10 09:19:47.467255	2026-09-10 09:19:47.467255
2185	26	PRD-1789021819488-R1789031987691	134.0000	134.0000	available	2026-09-10 09:19:47.692278	2026-09-10 09:19:47.692278
2195	26	PRD-1789021819488-R1789031989927	112.4000	112.4000	available	2026-09-10 09:19:49.929267	2026-09-10 09:19:49.929267
2196	26	PRD-1789021819488-R1789031990170	121.1000	121.1000	available	2026-09-10 09:19:50.171096	2026-09-10 09:19:50.171096
2197	26	PRD-1789021819488-R1789031990444	111.9000	111.9000	available	2026-09-10 09:19:50.445532	2026-09-10 09:19:50.445532
2199	26	PRD-1789021819488-R1789031991757	117.3000	117.3000	available	2026-09-10 09:19:51.759301	2026-09-10 09:19:51.759301
2200	26	PRD-1789021819488-R1789031992033	112.5000	112.5000	available	2026-09-10 09:19:52.039653	2026-09-10 09:19:52.039653
2201	26	PRD-1789021819488-R1789031992291	120.6000	120.6000	available	2026-09-10 09:19:52.29219	2026-09-10 09:19:52.29219
2202	26	PRD-1789021819488-R1789031992492	114.2000	114.2000	available	2026-09-10 09:19:52.494285	2026-09-10 09:19:52.494285
2205	26	PRD-1789021819488-R1789031993345	140.7000	140.7000	available	2026-09-10 09:19:53.349924	2026-09-10 09:19:53.349924
2206	26	PRD-1789021819488-R1789031993585	122.6000	122.6000	available	2026-09-10 09:19:53.588284	2026-09-10 09:19:53.588284
2207	26	PRD-1789021819488-R1789031993821	123.3000	123.3000	available	2026-09-10 09:19:53.822823	2026-09-10 09:19:53.822823
2209	26	PRD-1789021819488-R1789031994251	119.0000	119.0000	available	2026-09-10 09:19:54.2527	2026-09-10 09:19:54.2527
2211	26	PRD-1789021819488-R1789031994734	116.1000	116.1000	available	2026-09-10 09:19:54.736121	2026-09-10 09:19:54.736121
2212	26	PRD-1789021819488-R1789031994946	124.7000	124.7000	available	2026-09-10 09:19:54.94691	2026-09-10 09:19:54.94691
2699	62	PRD-1789034415962-R1789034425550	109.0000	109.0000	available	2026-09-10 10:00:25.55133	2026-09-10 10:00:25.55133
2700	16	PRD-1789018928475-R1789034463075	88.9000	88.9000	available	2026-09-10 10:01:03.076442	2026-09-10 10:01:03.076442
481	7	PRD-1789018404302-R1789021210369	113.1000	113.1000	available	2026-09-10 06:20:10.37043	2026-09-10 06:20:10.37043
482	7	PRD-1789018404302-R1789021210672	114.0000	114.0000	available	2026-09-10 06:20:10.674536	2026-09-10 06:20:10.674536
483	7	PRD-1789018404302-R1789021210985	114.0000	114.0000	available	2026-09-10 06:20:10.987568	2026-09-10 06:20:10.987568
484	7	PRD-1789018404302-R1789021211316	120.3000	120.3000	available	2026-09-10 06:20:11.317585	2026-09-10 06:20:11.317585
485	7	PRD-1789018404302-R1789021211679	113.9000	113.9000	available	2026-09-10 06:20:11.680313	2026-09-10 06:20:11.680313
486	7	PRD-1789018404302-R1789021211939	119.1000	119.1000	available	2026-09-10 06:20:11.940827	2026-09-10 06:20:11.940827
487	7	PRD-1789018404302-R1789021212250	103.1000	103.1000	available	2026-09-10 06:20:12.251692	2026-09-10 06:20:12.251692
488	7	PRD-1789018404302-R1789021212514	117.9000	117.9000	available	2026-09-10 06:20:12.515344	2026-09-10 06:20:12.515344
489	7	PRD-1789018404302-R1789021212785	114.1000	114.1000	available	2026-09-10 06:20:12.791544	2026-09-10 06:20:12.791544
493	7	PRD-1789018404302-R1789021214118	120.4000	120.4000	available	2026-09-10 06:20:14.119382	2026-09-10 06:20:14.119382
1248	30	PRD-1789024935840-R1789026019925	77.0000	77.0000	available	2026-09-10 07:40:19.927236	2026-09-10 07:40:19.927236
1249	30	PRD-1789024935840-R1789026020010	76.0000	76.0000	available	2026-09-10 07:40:20.01292	2026-09-10 07:40:20.01292
1250	30	PRD-1789024935840-R1789026020144	75.0000	75.0000	available	2026-09-10 07:40:20.146277	2026-09-10 07:40:20.146277
1258	30	PRD-1789024935840-R1789026020865	80.0000	80.0000	available	2026-09-10 07:40:20.866674	2026-09-10 07:40:20.866674
1261	30	PRD-1789024935840-R1789026021282	68.0000	68.0000	available	2026-09-10 07:40:21.283279	2026-09-10 07:40:21.283279
1262	30	PRD-1789024935840-R1789026021432	76.0000	76.0000	available	2026-09-10 07:40:21.433829	2026-09-10 07:40:21.433829
1265	30	PRD-1789024935840-R1789026021725	69.0000	69.0000	available	2026-09-10 07:40:21.727199	2026-09-10 07:40:21.727199
1273	30	PRD-1789024935840-R1789026022585	60.0000	60.0000	available	2026-09-10 07:40:22.587369	2026-09-10 07:40:22.587369
1278	30	PRD-1789024935840-R1789026023114	88.0000	88.0000	available	2026-09-10 07:40:23.115368	2026-09-10 07:40:23.115368
1281	30	PRD-1789024935840-R1789026023429	75.0000	75.0000	available	2026-09-10 07:40:23.431311	2026-09-10 07:40:23.431311
1284	32	PRD-1789025098770-R1789026061265	69.0000	69.0000	available	2026-09-10 07:41:01.267742	2026-09-10 07:41:01.267742
1285	32	PRD-1789025098770-R1789026061337	63.0000	63.0000	available	2026-09-10 07:41:01.339218	2026-09-10 07:41:01.339218
1286	32	PRD-1789025098770-R1789026061414	122.1000	122.1000	available	2026-09-10 07:41:01.415896	2026-09-10 07:41:01.415896
1287	32	PRD-1789025098770-R1789026061510	65.0000	65.0000	available	2026-09-10 07:41:01.513481	2026-09-10 07:41:01.513481
1288	32	PRD-1789025098770-R1789026061621	60.0000	60.0000	available	2026-09-10 07:41:01.62325	2026-09-10 07:41:01.62325
1292	32	PRD-1789025098770-R1789026061981	66.0000	66.0000	available	2026-09-10 07:41:01.982968	2026-09-10 07:41:01.982968
1389	36	PRD-1789025355244-R1789027395382	120.1000	120.1000	available	2026-09-10 08:03:15.383105	2026-09-10 08:03:15.383105
1390	36	PRD-1789025355244-R1789027396287	112.0000	112.0000	available	2026-09-10 08:03:16.288583	2026-09-10 08:03:16.288583
1394	36	PRD-1789025355244-R1789027397289	112.3000	112.3000	available	2026-09-10 08:03:17.2924	2026-09-10 08:03:17.2924
1395	36	PRD-1789025355244-R1789027397516	119.0000	119.0000	available	2026-09-10 08:03:17.517452	2026-09-10 08:03:17.517452
1398	36	PRD-1789025355244-R1789027398273	118.5000	118.5000	available	2026-09-10 08:03:18.27498	2026-09-10 08:03:18.27498
1400	36	PRD-1789025355244-R1789027398764	118.0000	118.0000	available	2026-09-10 08:03:18.767647	2026-09-10 08:03:18.767647
1401	36	PRD-1789025355244-R1789027398996	114.8000	114.8000	available	2026-09-10 08:03:18.997966	2026-09-10 08:03:18.997966
1410	36	PRD-1789025355244-R1789027401234	112.0000	112.0000	available	2026-09-10 08:03:21.235643	2026-09-10 08:03:21.235643
1411	36	PRD-1789025355244-R1789027401458	108.3000	108.3000	available	2026-09-10 08:03:21.458955	2026-09-10 08:03:21.458955
1421	36	PRD-1789025355244-R1789027403859	97.0000	97.0000	available	2026-09-10 08:03:23.860876	2026-09-10 08:03:23.860876
1422	36	PRD-1789025355244-R1789027404074	121.4000	121.4000	available	2026-09-10 08:03:24.075229	2026-09-10 08:03:24.075229
1424	36	PRD-1789025355244-R1789027404592	92.0000	92.0000	available	2026-09-10 08:03:24.59422	2026-09-10 08:03:24.59422
1569	46	PRD-1789028190962-R1789028202286	120.0000	120.0000	available	2026-09-10 08:16:42.287447	2026-09-10 08:16:42.287447
1570	46	PRD-1789028190962-R1789028202335	88.5000	88.5000	available	2026-09-10 08:16:42.33656	2026-09-10 08:16:42.33656
1720	20	PRD-1789019067284-R1789028894512	115.3000	115.3000	available	2026-09-10 08:28:14.514538	2026-09-10 08:28:14.514538
1721	20	PRD-1789019067284-R1789028894613	117.2000	117.2000	available	2026-09-10 08:28:14.614529	2026-09-10 08:28:14.614529
1724	20	PRD-1789019067284-R1789028894959	121.6000	121.6000	available	2026-09-10 08:28:14.960207	2026-09-10 08:28:14.960207
1992	52	PRD-1789029576872-R1789029842312	115.2000	115.2000	available	2026-09-10 08:44:02.314552	2026-09-10 08:44:02.314552
1996	52	PRD-1789029576872-R1789029844093	115.5000	115.5000	available	2026-09-10 08:44:04.095041	2026-09-10 08:44:04.095041
2000	52	PRD-1789029576872-R1789029844563	106.6000	106.6000	available	2026-09-10 08:44:04.564075	2026-09-10 08:44:04.564075
2001	52	PRD-1789029576872-R1789029844675	116.6000	116.6000	available	2026-09-10 08:44:04.677027	2026-09-10 08:44:04.677027
2004	52	PRD-1789029576872-R1789029845027	113.0000	113.0000	available	2026-09-10 08:44:05.031955	2026-09-10 08:44:05.031955
2005	52	PRD-1789029576872-R1789029845162	115.9000	115.9000	available	2026-09-10 08:44:05.163621	2026-09-10 08:44:05.163621
2006	52	PRD-1789029576872-R1789029845282	117.0000	117.0000	available	2026-09-10 08:44:05.283064	2026-09-10 08:44:05.283064
2008	52	PRD-1789029576872-R1789029845571	117.0000	117.0000	available	2026-09-10 08:44:05.573079	2026-09-10 08:44:05.573079
2012	52	PRD-1789029576872-R1789029846083	106.6000	106.6000	available	2026-09-10 08:44:06.084657	2026-09-10 08:44:06.084657
2013	52	PRD-1789029576872-R1789029846187	117.0000	117.0000	available	2026-09-10 08:44:06.188829	2026-09-10 08:44:06.188829
2033	52	PRD-1789029576872-R1789029849100	118.0000	118.0000	available	2026-09-10 08:44:09.102254	2026-09-10 08:44:09.102254
2034	52	PRD-1789029576872-R1789029849245	119.1000	119.1000	available	2026-09-10 08:44:09.247122	2026-09-10 08:44:09.247122
2035	52	PRD-1789029576872-R1789029849385	116.1000	116.1000	available	2026-09-10 08:44:09.387226	2026-09-10 08:44:09.387226
2036	52	PRD-1789029576872-R1789029849490	115.7000	115.7000	available	2026-09-10 08:44:09.491563	2026-09-10 08:44:09.491563
2044	52	PRD-1789029576872-R1789029850640	112.5000	112.5000	available	2026-09-10 08:44:10.641249	2026-09-10 08:44:10.641249
2045	52	PRD-1789029576872-R1789029850783	87.1000	87.1000	available	2026-09-10 08:44:10.78471	2026-09-10 08:44:10.78471
2055	52	PRD-1789029576872-R1789029852059	113.3000	113.3000	available	2026-09-10 08:44:12.061259	2026-09-10 08:44:12.061259
2057	52	PRD-1789029576872-R1789029852359	116.9000	116.9000	available	2026-09-10 08:44:12.36024	2026-09-10 08:44:12.36024
2058	52	PRD-1789029576872-R1789029852463	116.2000	116.2000	available	2026-09-10 08:44:12.464157	2026-09-10 08:44:12.464157
2059	52	PRD-1789029576872-R1789029852608	121.7000	121.7000	available	2026-09-10 08:44:12.609604	2026-09-10 08:44:12.609604
2061	52	PRD-1789029576872-R1789029852872	116.1000	116.1000	available	2026-09-10 08:44:12.872857	2026-09-10 08:44:12.872857
2062	52	PRD-1789029576872-R1789029853022	115.8000	115.8000	available	2026-09-10 08:44:13.023261	2026-09-10 08:44:13.023261
2063	52	PRD-1789029576872-R1789029853164	116.1000	116.1000	available	2026-09-10 08:44:13.165926	2026-09-10 08:44:13.165926
2065	52	PRD-1789029576872-R1789029853501	115.1000	115.1000	available	2026-09-10 08:44:13.505217	2026-09-10 08:44:13.505217
2066	52	PRD-1789029576872-R1789029853682	116.1000	116.1000	available	2026-09-10 08:44:13.683534	2026-09-10 08:44:13.683534
2067	52	PRD-1789029576872-R1789029853808	113.8000	113.8000	available	2026-09-10 08:44:13.809526	2026-09-10 08:44:13.809526
2070	52	PRD-1789029576872-R1789029854222	116.0000	116.0000	available	2026-09-10 08:44:14.232757	2026-09-10 08:44:14.232757
2071	52	PRD-1789029576872-R1789029854381	118.0000	118.0000	available	2026-09-10 08:44:14.382711	2026-09-10 08:44:14.382711
2144	26	PRD-1789021819488-R1789031978480	137.7000	137.7000	available	2026-09-10 09:19:38.481782	2026-09-10 09:19:38.481782
1254	30	PRD-1789024935840-R1789026020505	78.0000	78.0000	available	2026-09-10 07:40:20.506615	2026-09-10 07:40:20.506615
1259	30	PRD-1789024935840-R1789026020956	85.0000	85.0000	available	2026-09-10 07:40:20.957794	2026-09-10 07:40:20.957794
1260	30	PRD-1789024935840-R1789026021115	85.0000	85.0000	available	2026-09-10 07:40:21.118002	2026-09-10 07:40:21.118002
1263	30	PRD-1789024935840-R1789026021502	80.0000	80.0000	available	2026-09-10 07:40:21.50487	2026-09-10 07:40:21.50487
1266	30	PRD-1789024935840-R1789026021837	85.0000	85.0000	available	2026-09-10 07:40:21.838752	2026-09-10 07:40:21.838752
1268	30	PRD-1789024935840-R1789026022033	85.0000	85.0000	available	2026-09-10 07:40:22.034669	2026-09-10 07:40:22.034669
1271	30	PRD-1789024935840-R1789026022388	61.0000	61.0000	available	2026-09-10 07:40:22.389593	2026-09-10 07:40:22.389593
1274	30	PRD-1789024935840-R1789026022690	60.0000	60.0000	available	2026-09-10 07:40:22.691872	2026-09-10 07:40:22.691872
1275	30	PRD-1789024935840-R1789026022775	85.0000	85.0000	available	2026-09-10 07:40:22.776868	2026-09-10 07:40:22.776868
1279	30	PRD-1789024935840-R1789026023209	80.0000	80.0000	available	2026-09-10 07:40:23.211552	2026-09-10 07:40:23.211552
1282	30	PRD-1789024935840-R1789026023537	74.0000	74.0000	available	2026-09-10 07:40:23.538571	2026-09-10 07:40:23.538571
1391	36	PRD-1789025355244-R1789027396495	107.3000	107.3000	available	2026-09-10 08:03:16.496501	2026-09-10 08:03:16.496501
1396	36	PRD-1789025355244-R1789027397770	112.3000	112.3000	available	2026-09-10 08:03:17.771541	2026-09-10 08:03:17.771541
1406	36	PRD-1789025355244-R1789027400254	114.6000	114.6000	available	2026-09-10 08:03:20.256685	2026-09-10 08:03:20.256685
1407	36	PRD-1789025355244-R1789027400478	113.5000	113.5000	available	2026-09-10 08:03:20.479589	2026-09-10 08:03:20.479589
1412	36	PRD-1789025355244-R1789027401720	113.9000	113.9000	available	2026-09-10 08:03:21.723027	2026-09-10 08:03:21.723027
1413	36	PRD-1789025355244-R1789027401961	113.9000	113.9000	available	2026-09-10 08:03:21.962465	2026-09-10 08:03:21.962465
1414	36	PRD-1789025355244-R1789027402223	114.0000	114.0000	available	2026-09-10 08:03:22.224045	2026-09-10 08:03:22.224045
1416	36	PRD-1789025355244-R1789027402715	109.4000	109.4000	available	2026-09-10 08:03:22.717216	2026-09-10 08:03:22.717216
1417	36	PRD-1789025355244-R1789027402970	121.2000	121.2000	available	2026-09-10 08:03:22.974246	2026-09-10 08:03:22.974246
1419	36	PRD-1789025355244-R1789027403416	96.5000	96.5000	available	2026-09-10 08:03:23.418878	2026-09-10 08:03:23.418878
1420	36	PRD-1789025355244-R1789027403620	119.1000	119.1000	available	2026-09-10 08:03:23.621615	2026-09-10 08:03:23.621615
1423	36	PRD-1789025355244-R1789027404356	105.8000	105.8000	available	2026-09-10 08:03:24.358262	2026-09-10 08:03:24.358262
1425	36	PRD-1789025355244-R1789027404816	112.0000	112.0000	available	2026-09-10 08:03:24.818312	2026-09-10 08:03:24.818312
1571	47	PRD-1789028222345-R1789028233652	119.0000	119.0000	available	2026-09-10 08:17:13.653899	2026-09-10 08:17:13.653899
1572	47	PRD-1789028222345-R1789028233692	105.0000	105.0000	available	2026-09-10 08:17:13.695351	2026-09-10 08:17:13.695351
1725	50	PRD-1789028920266-R1789029440302	119.1000	119.1000	available	2026-09-10 08:37:20.302943	2026-09-10 08:37:20.302943
1726	50	PRD-1789028920266-R1789029440347	116.2000	116.2000	available	2026-09-10 08:37:20.348586	2026-09-10 08:37:20.348586
1727	50	PRD-1789028920266-R1789029440461	116.6000	116.6000	available	2026-09-10 08:37:20.47394	2026-09-10 08:37:20.47394
1728	50	PRD-1789028920266-R1789029440565	116.0000	116.0000	available	2026-09-10 08:37:20.566167	2026-09-10 08:37:20.566167
1790	50	PRD-1789028920266-R1789029447196	105.4000	105.4000	available	2026-09-10 08:37:27.19776	2026-09-10 08:37:27.19776
1792	50	PRD-1789028920266-R1789029447454	120.0000	120.0000	available	2026-09-10 08:37:27.45663	2026-09-10 08:37:27.45663
1794	50	PRD-1789028920266-R1789029447791	116.9000	116.9000	available	2026-09-10 08:37:27.793855	2026-09-10 08:37:27.793855
1796	50	PRD-1789028920266-R1789029448153	120.4000	120.4000	available	2026-09-10 08:37:28.155281	2026-09-10 08:37:28.155281
1804	50	PRD-1789028920266-R1789029449453	116.0000	116.0000	available	2026-09-10 08:37:29.454866	2026-09-10 08:37:29.454866
1805	50	PRD-1789028920266-R1789029449633	112.8000	112.8000	available	2026-09-10 08:37:29.637516	2026-09-10 08:37:29.637516
1808	50	PRD-1789028920266-R1789029450153	120.0000	120.0000	available	2026-09-10 08:37:30.154382	2026-09-10 08:37:30.154382
1814	50	PRD-1789028920266-R1789029451092	116.0000	116.0000	available	2026-09-10 08:37:31.094009	2026-09-10 08:37:31.094009
1816	50	PRD-1789028920266-R1789029451410	116.0000	116.0000	available	2026-09-10 08:37:31.412071	2026-09-10 08:37:31.412071
1819	50	PRD-1789028920266-R1789029451869	116.0000	116.0000	available	2026-09-10 08:37:31.872262	2026-09-10 08:37:31.872262
1821	50	PRD-1789028920266-R1789029452220	117.3000	117.3000	available	2026-09-10 08:37:32.221432	2026-09-10 08:37:32.221432
1824	50	PRD-1789028920266-R1789029452652	92.0000	92.0000	available	2026-09-10 08:37:32.65393	2026-09-10 08:37:32.65393
1825	50	PRD-1789028920266-R1789029452815	113.7000	113.7000	available	2026-09-10 08:37:32.817361	2026-09-10 08:37:32.817361
1993	52	PRD-1789029576872-R1789029843030	117.1000	117.1000	available	2026-09-10 08:44:03.031556	2026-09-10 08:44:03.031556
1994	52	PRD-1789029576872-R1789029843347	118.7000	118.7000	available	2026-09-10 08:44:03.348569	2026-09-10 08:44:03.348569
1995	52	PRD-1789029576872-R1789029843977	112.5000	112.5000	available	2026-09-10 08:44:03.978515	2026-09-10 08:44:03.978515
1997	52	PRD-1789029576872-R1789029844212	115.8000	115.8000	available	2026-09-10 08:44:04.213944	2026-09-10 08:44:04.213944
1998	52	PRD-1789029576872-R1789029844326	91.4000	91.4000	available	2026-09-10 08:44:04.328176	2026-09-10 08:44:04.328176
1999	52	PRD-1789029576872-R1789029844445	116.6000	116.6000	available	2026-09-10 08:44:04.446045	2026-09-10 08:44:04.446045
2002	52	PRD-1789029576872-R1789029844786	116.1000	116.1000	available	2026-09-10 08:44:04.788081	2026-09-10 08:44:04.788081
2003	52	PRD-1789029576872-R1789029844893	117.0000	117.0000	available	2026-09-10 08:44:04.89499	2026-09-10 08:44:04.89499
2007	52	PRD-1789029576872-R1789029845410	116.0000	116.0000	available	2026-09-10 08:44:05.413989	2026-09-10 08:44:05.413989
2009	52	PRD-1789029576872-R1789029845705	117.1000	117.1000	available	2026-09-10 08:44:05.706601	2026-09-10 08:44:05.706601
2010	52	PRD-1789029576872-R1789029845841	115.1000	115.1000	available	2026-09-10 08:44:05.842593	2026-09-10 08:44:05.842593
2011	52	PRD-1789029576872-R1789029845973	107.7000	107.7000	available	2026-09-10 08:44:05.974273	2026-09-10 08:44:05.974273
2016	52	PRD-1789029576872-R1789029846606	115.2000	115.2000	available	2026-09-10 08:44:06.60764	2026-09-10 08:44:06.60764
2017	52	PRD-1789029576872-R1789029846723	112.9000	112.9000	available	2026-09-10 08:44:06.724026	2026-09-10 08:44:06.724026
2019	52	PRD-1789029576872-R1789029846948	116.1000	116.1000	available	2026-09-10 08:44:06.949917	2026-09-10 08:44:06.949917
2020	52	PRD-1789029576872-R1789029847049	115.0000	115.0000	available	2026-09-10 08:44:07.050312	2026-09-10 08:44:07.050312
2023	52	PRD-1789029576872-R1789029847404	118.4000	118.4000	available	2026-09-10 08:44:07.406388	2026-09-10 08:44:07.406388
2024	52	PRD-1789029576872-R1789029847535	115.8000	115.8000	available	2026-09-10 08:44:07.536306	2026-09-10 08:44:07.536306
2025	52	PRD-1789029576872-R1789029847646	117.0000	117.0000	available	2026-09-10 08:44:07.646987	2026-09-10 08:44:07.646987
2031	52	PRD-1789029576872-R1789029848363	106.2000	106.2000	available	2026-09-10 08:44:08.364392	2026-09-10 08:44:08.364392
2032	52	PRD-1789029576872-R1789029848532	110.9000	110.9000	available	2026-09-10 08:44:08.532917	2026-09-10 08:44:08.532917
2037	52	PRD-1789029576872-R1789029849622	118.3000	118.3000	available	2026-09-10 08:44:09.623544	2026-09-10 08:44:09.623544
2038	52	PRD-1789029576872-R1789029849782	115.7000	115.7000	available	2026-09-10 08:44:09.783933	2026-09-10 08:44:09.783933
2040	52	PRD-1789029576872-R1789029850086	115.7000	115.7000	available	2026-09-10 08:44:10.087271	2026-09-10 08:44:10.087271
2041	52	PRD-1789029576872-R1789029850204	113.0000	113.0000	available	2026-09-10 08:44:10.207746	2026-09-10 08:44:10.207746
2042	52	PRD-1789029576872-R1789029850361	118.0000	118.0000	available	2026-09-10 08:44:10.362479	2026-09-10 08:44:10.362479
2043	52	PRD-1789029576872-R1789029850489	120.2000	120.2000	available	2026-09-10 08:44:10.491167	2026-09-10 08:44:10.491167
2046	52	PRD-1789029576872-R1789029850935	111.7000	111.7000	available	2026-09-10 08:44:10.936848	2026-09-10 08:44:10.936848
2047	52	PRD-1789029576872-R1789029851033	104.3000	104.3000	available	2026-09-10 08:44:11.034979	2026-09-10 08:44:11.034979
1289	32	PRD-1789025098770-R1789026061736	65.0000	65.0000	available	2026-09-10 07:41:01.737961	2026-09-10 07:41:01.737961
1290	32	PRD-1789025098770-R1789026061819	65.0000	65.0000	available	2026-09-10 07:41:01.821187	2026-09-10 07:41:01.821187
1291	32	PRD-1789025098770-R1789026061906	70.0000	70.0000	available	2026-09-10 07:41:01.908106	2026-09-10 07:41:01.908106
1293	31	PRD-1789025055371-R1789026211593	55.0000	55.0000	available	2026-09-10 07:43:31.594456	2026-09-10 07:43:31.594456
1294	31	PRD-1789025055371-R1789026211649	65.0000	65.0000	available	2026-09-10 07:43:31.650261	2026-09-10 07:43:31.650261
1295	31	PRD-1789025055371-R1789026211760	66.0000	66.0000	available	2026-09-10 07:43:31.761034	2026-09-10 07:43:31.761034
1296	31	PRD-1789025055371-R1789026211816	73.0000	73.0000	available	2026-09-10 07:43:31.817197	2026-09-10 07:43:31.817197
1297	31	PRD-1789025055371-R1789026211889	65.0000	65.0000	available	2026-09-10 07:43:31.890503	2026-09-10 07:43:31.890503
1392	36	PRD-1789025355244-R1789027396793	120.6000	120.6000	available	2026-09-10 08:03:16.796734	2026-09-10 08:03:16.796734
1393	36	PRD-1789025355244-R1789027396991	117.6000	117.6000	available	2026-09-10 08:03:16.992638	2026-09-10 08:03:16.992638
1397	36	PRD-1789025355244-R1789027398030	115.7000	115.7000	available	2026-09-10 08:03:18.031279	2026-09-10 08:03:18.031279
1399	36	PRD-1789025355244-R1789027398505	116.1000	116.1000	available	2026-09-10 08:03:18.507122	2026-09-10 08:03:18.507122
1402	36	PRD-1789025355244-R1789027399235	113.9000	113.9000	available	2026-09-10 08:03:19.23596	2026-09-10 08:03:19.23596
1403	36	PRD-1789025355244-R1789027399475	111.7000	111.7000	available	2026-09-10 08:03:19.47648	2026-09-10 08:03:19.47648
1404	36	PRD-1789025355244-R1789027399705	117.7000	117.7000	available	2026-09-10 08:03:19.708141	2026-09-10 08:03:19.708141
1405	36	PRD-1789025355244-R1789027399950	114.0000	114.0000	available	2026-09-10 08:03:19.951035	2026-09-10 08:03:19.951035
1408	36	PRD-1789025355244-R1789027400733	119.9000	119.9000	available	2026-09-10 08:03:20.739705	2026-09-10 08:03:20.739705
1409	36	PRD-1789025355244-R1789027401011	117.2000	117.2000	available	2026-09-10 08:03:21.012525	2026-09-10 08:03:21.012525
1415	36	PRD-1789025355244-R1789027402468	109.0000	109.0000	available	2026-09-10 08:03:22.469151	2026-09-10 08:03:22.469151
1418	36	PRD-1789025355244-R1789027403184	109.2000	109.2000	available	2026-09-10 08:03:23.188646	2026-09-10 08:03:23.188646
1573	48	PRD-1789028253641-R1789028259707	114.0000	114.0000	available	2026-09-10 08:17:39.707686	2026-09-10 08:17:39.707686
1574	49	PRD-1789028320192-R1789028346304	102.4000	102.4000	available	2026-09-10 08:19:06.306183	2026-09-10 08:19:06.306183
1575	49	PRD-1789028320192-R1789028346357	105.0000	105.0000	available	2026-09-10 08:19:06.359279	2026-09-10 08:19:06.359279
1576	49	PRD-1789028320192-R1789028346441	102.0000	102.0000	available	2026-09-10 08:19:06.442197	2026-09-10 08:19:06.442197
1577	49	PRD-1789028320192-R1789028346499	110.0000	110.0000	available	2026-09-10 08:19:06.507093	2026-09-10 08:19:06.507093
1578	49	PRD-1789028320192-R1789028346618	96.0000	96.0000	available	2026-09-10 08:19:06.620539	2026-09-10 08:19:06.620539
1579	49	PRD-1789028320192-R1789028346694	105.5000	105.5000	available	2026-09-10 08:19:06.696884	2026-09-10 08:19:06.696884
1580	49	PRD-1789028320192-R1789028346747	105.8000	105.8000	available	2026-09-10 08:19:06.748321	2026-09-10 08:19:06.748321
1729	50	PRD-1789028920266-R1789029440654	114.7000	114.7000	available	2026-09-10 08:37:20.655763	2026-09-10 08:37:20.655763
1730	50	PRD-1789028920266-R1789029440729	116.2000	116.2000	available	2026-09-10 08:37:20.731234	2026-09-10 08:37:20.731234
1731	50	PRD-1789028920266-R1789029440798	116.0000	116.0000	available	2026-09-10 08:37:20.799555	2026-09-10 08:37:20.799555
1734	50	PRD-1789028920266-R1789029441079	116.0000	116.0000	available	2026-09-10 08:37:21.080603	2026-09-10 08:37:21.080603
1740	50	PRD-1789028920266-R1789029441582	122.5000	122.5000	available	2026-09-10 08:37:21.585179	2026-09-10 08:37:21.585179
1743	50	PRD-1789028920266-R1789029441845	116.2000	116.2000	available	2026-09-10 08:37:21.846063	2026-09-10 08:37:21.846063
1750	50	PRD-1789028920266-R1789029442458	116.2000	116.2000	available	2026-09-10 08:37:22.459514	2026-09-10 08:37:22.459514
1751	50	PRD-1789028920266-R1789029442538	121.1000	121.1000	available	2026-09-10 08:37:22.539543	2026-09-10 08:37:22.539543
1757	50	PRD-1789028920266-R1789029443127	116.0000	116.0000	available	2026-09-10 08:37:23.128991	2026-09-10 08:37:23.128991
1763	50	PRD-1789028920266-R1789029443667	122.5000	122.5000	available	2026-09-10 08:37:23.668396	2026-09-10 08:37:23.668396
1764	50	PRD-1789028920266-R1789029443742	116.0000	116.0000	available	2026-09-10 08:37:23.743497	2026-09-10 08:37:23.743497
1765	50	PRD-1789028920266-R1789029443853	130.2000	130.2000	available	2026-09-10 08:37:23.854421	2026-09-10 08:37:23.854421
1771	50	PRD-1789028920266-R1789029444635	123.6000	123.6000	available	2026-09-10 08:37:24.638217	2026-09-10 08:37:24.638217
1774	50	PRD-1789028920266-R1789029445003	117.7000	117.7000	available	2026-09-10 08:37:25.00478	2026-09-10 08:37:25.00478
1781	50	PRD-1789028920266-R1789029445773	116.0000	116.0000	available	2026-09-10 08:37:25.774925	2026-09-10 08:37:25.774925
1782	50	PRD-1789028920266-R1789029445881	119.3000	119.3000	available	2026-09-10 08:37:25.882681	2026-09-10 08:37:25.882681
1783	50	PRD-1789028920266-R1789029446006	116.0000	116.0000	available	2026-09-10 08:37:26.011682	2026-09-10 08:37:26.011682
1784	50	PRD-1789028920266-R1789029446167	117.3000	117.3000	available	2026-09-10 08:37:26.168883	2026-09-10 08:37:26.168883
1785	50	PRD-1789028920266-R1789029446329	123.2000	123.2000	available	2026-09-10 08:37:26.339603	2026-09-10 08:37:26.339603
1786	50	PRD-1789028920266-R1789029446497	116.3000	116.3000	available	2026-09-10 08:37:26.499209	2026-09-10 08:37:26.499209
1788	50	PRD-1789028920266-R1789029446972	116.0000	116.0000	available	2026-09-10 08:37:26.973283	2026-09-10 08:37:26.973283
1793	50	PRD-1789028920266-R1789029447637	120.0000	120.0000	available	2026-09-10 08:37:27.639451	2026-09-10 08:37:27.639451
1795	50	PRD-1789028920266-R1789029448017	103.3000	103.3000	available	2026-09-10 08:37:28.018742	2026-09-10 08:37:28.018742
1798	50	PRD-1789028920266-R1789029448445	116.0000	116.0000	available	2026-09-10 08:37:28.447049	2026-09-10 08:37:28.447049
1807	50	PRD-1789028920266-R1789029449980	130.3000	130.3000	available	2026-09-10 08:37:29.982253	2026-09-10 08:37:29.982253
1810	50	PRD-1789028920266-R1789029450500	116.0000	116.0000	available	2026-09-10 08:37:30.501669	2026-09-10 08:37:30.501669
1817	50	PRD-1789028920266-R1789029451571	127.0000	127.0000	available	2026-09-10 08:37:31.573129	2026-09-10 08:37:31.573129
1820	50	PRD-1789028920266-R1789029452009	120.6000	120.6000	available	2026-09-10 08:37:32.010771	2026-09-10 08:37:32.010771
1823	50	PRD-1789028920266-R1789029452483	120.3000	120.3000	available	2026-09-10 08:37:32.484417	2026-09-10 08:37:32.484417
1826	50	PRD-1789028920266-R1789029452989	111.0000	111.0000	available	2026-09-10 08:37:32.99212	2026-09-10 08:37:32.99212
2014	52	PRD-1789029576872-R1789029846325	116.0000	116.0000	available	2026-09-10 08:44:06.326638	2026-09-10 08:44:06.326638
2015	52	PRD-1789029576872-R1789029846447	116.2000	116.2000	available	2026-09-10 08:44:06.448238	2026-09-10 08:44:06.448238
2018	52	PRD-1789029576872-R1789029846834	110.1000	110.1000	available	2026-09-10 08:44:06.835331	2026-09-10 08:44:06.835331
2021	52	PRD-1789029576872-R1789029847167	113.7000	113.7000	available	2026-09-10 08:44:07.168445	2026-09-10 08:44:07.168445
2022	52	PRD-1789029576872-R1789029847276	116.7000	116.7000	available	2026-09-10 08:44:07.277191	2026-09-10 08:44:07.277191
2026	52	PRD-1789029576872-R1789029847752	117.6000	117.6000	available	2026-09-10 08:44:07.75448	2026-09-10 08:44:07.75448
2027	52	PRD-1789029576872-R1789029847855	118.8000	118.8000	available	2026-09-10 08:44:07.856646	2026-09-10 08:44:07.856646
2028	52	PRD-1789029576872-R1789029847974	116.3000	116.3000	available	2026-09-10 08:44:07.97563	2026-09-10 08:44:07.97563
2029	52	PRD-1789029576872-R1789029848101	115.2000	115.2000	available	2026-09-10 08:44:08.101979	2026-09-10 08:44:08.101979
2030	52	PRD-1789029576872-R1789029848236	118.0000	118.0000	available	2026-09-10 08:44:08.236978	2026-09-10 08:44:08.236978
2039	52	PRD-1789029576872-R1789029849910	116.1000	116.1000	available	2026-09-10 08:44:09.911002	2026-09-10 08:44:09.911002
2049	52	PRD-1789029576872-R1789029851293	112.3000	112.3000	available	2026-09-10 08:44:11.294056	2026-09-10 08:44:11.294056
2146	26	PRD-1789021819488-R1789031978993	138.1000	138.1000	available	2026-09-10 09:19:38.995059	2026-09-10 09:19:38.995059
2148	26	PRD-1789021819488-R1789031979403	119.6000	119.6000	available	2026-09-10 09:19:39.403874	2026-09-10 09:19:39.403874
608	26	PRD-1789021819488-R1789022130806	125.1000	125.1000	available	2026-09-10 06:35:30.808007	2026-09-10 06:35:30.808007
609	26	PRD-1789021819488-R1789022131030	120.1000	120.1000	available	2026-09-10 06:35:31.031176	2026-09-10 06:35:31.031176
610	26	PRD-1789021819488-R1789022131196	123.8000	123.8000	available	2026-09-10 06:35:31.197622	2026-09-10 06:35:31.197622
611	26	PRD-1789021819488-R1789022131389	112.5000	112.5000	available	2026-09-10 06:35:31.393114	2026-09-10 06:35:31.393114
612	26	PRD-1789021819488-R1789022131568	114.0000	114.0000	available	2026-09-10 06:35:31.571323	2026-09-10 06:35:31.571323
613	26	PRD-1789021819488-R1789022131841	128.4000	128.4000	available	2026-09-10 06:35:31.845864	2026-09-10 06:35:31.845864
614	26	PRD-1789021819488-R1789022131974	120.3000	120.3000	available	2026-09-10 06:35:31.975996	2026-09-10 06:35:31.975996
615	26	PRD-1789021819488-R1789022132255	120.1000	120.1000	available	2026-09-10 06:35:32.257159	2026-09-10 06:35:32.257159
616	26	PRD-1789021819488-R1789022132412	120.1000	120.1000	available	2026-09-10 06:35:32.413873	2026-09-10 06:35:32.413873
617	26	PRD-1789021819488-R1789022132627	123.0000	123.0000	available	2026-09-10 06:35:32.628702	2026-09-10 06:35:32.628702
618	26	PRD-1789021819488-R1789022132787	122.1000	122.1000	available	2026-09-10 06:35:32.789128	2026-09-10 06:35:32.789128
619	26	PRD-1789021819488-R1789022132998	120.1000	120.1000	available	2026-09-10 06:35:32.999834	2026-09-10 06:35:32.999834
620	26	PRD-1789021819488-R1789022133192	102.8000	102.8000	available	2026-09-10 06:35:33.193913	2026-09-10 06:35:33.193913
621	26	PRD-1789021819488-R1789022133382	113.7000	113.7000	available	2026-09-10 06:35:33.383405	2026-09-10 06:35:33.383405
622	26	PRD-1789021819488-R1789022133599	118.0000	118.0000	available	2026-09-10 06:35:33.602437	2026-09-10 06:35:33.602437
623	26	PRD-1789021819488-R1789022133800	118.0000	118.0000	available	2026-09-10 06:35:33.802332	2026-09-10 06:35:33.802332
624	26	PRD-1789021819488-R1789022133927	110.3000	110.3000	available	2026-09-10 06:35:33.928692	2026-09-10 06:35:33.928692
625	26	PRD-1789021819488-R1789022134134	118.0000	118.0000	available	2026-09-10 06:35:34.134804	2026-09-10 06:35:34.134804
626	26	PRD-1789021819488-R1789022134324	118.0000	118.0000	available	2026-09-10 06:35:34.326947	2026-09-10 06:35:34.326947
627	26	PRD-1789021819488-R1789022134551	118.0000	118.0000	available	2026-09-10 06:35:34.554198	2026-09-10 06:35:34.554198
628	26	PRD-1789021819488-R1789022134708	118.0000	118.0000	available	2026-09-10 06:35:34.709334	2026-09-10 06:35:34.709334
629	26	PRD-1789021819488-R1789022134988	118.0000	118.0000	available	2026-09-10 06:35:34.98923	2026-09-10 06:35:34.98923
630	26	PRD-1789021819488-R1789022135139	118.0000	118.0000	available	2026-09-10 06:35:35.140184	2026-09-10 06:35:35.140184
631	26	PRD-1789021819488-R1789022135457	118.0000	118.0000	available	2026-09-10 06:35:35.459188	2026-09-10 06:35:35.459188
632	26	PRD-1789021819488-R1789022135735	118.0000	118.0000	available	2026-09-10 06:35:35.73722	2026-09-10 06:35:35.73722
633	26	PRD-1789021819488-R1789022135957	118.0000	118.0000	available	2026-09-10 06:35:35.958614	2026-09-10 06:35:35.958614
634	26	PRD-1789021819488-R1789022136079	118.0000	118.0000	available	2026-09-10 06:35:36.0806	2026-09-10 06:35:36.0806
635	26	PRD-1789021819488-R1789022136301	118.0000	118.0000	available	2026-09-10 06:35:36.301805	2026-09-10 06:35:36.301805
636	26	PRD-1789021819488-R1789022136435	118.0000	118.0000	available	2026-09-10 06:35:36.436217	2026-09-10 06:35:36.436217
637	26	PRD-1789021819488-R1789022136606	118.0000	118.0000	available	2026-09-10 06:35:36.607508	2026-09-10 06:35:36.607508
638	26	PRD-1789021819488-R1789022136743	118.0000	118.0000	available	2026-09-10 06:35:36.744138	2026-09-10 06:35:36.744138
639	26	PRD-1789021819488-R1789022136958	118.0000	118.0000	available	2026-09-10 06:35:36.959943	2026-09-10 06:35:36.959943
640	26	PRD-1789021819488-R1789022137120	118.0000	118.0000	available	2026-09-10 06:35:37.120933	2026-09-10 06:35:37.120933
641	26	PRD-1789021819488-R1789022137278	118.0000	118.0000	available	2026-09-10 06:35:37.279086	2026-09-10 06:35:37.279086
642	26	PRD-1789021819488-R1789022137408	122.3000	122.3000	available	2026-09-10 06:35:37.409037	2026-09-10 06:35:37.409037
643	26	PRD-1789021819488-R1789022137550	118.0000	118.0000	available	2026-09-10 06:35:37.551539	2026-09-10 06:35:37.551539
644	26	PRD-1789021819488-R1789022137693	118.0000	118.0000	available	2026-09-10 06:35:37.694214	2026-09-10 06:35:37.694214
645	26	PRD-1789021819488-R1789022137831	118.0000	118.0000	available	2026-09-10 06:35:37.832589	2026-09-10 06:35:37.832589
646	26	PRD-1789021819488-R1789022137968	118.0000	118.0000	available	2026-09-10 06:35:37.968855	2026-09-10 06:35:37.968855
647	26	PRD-1789021819488-R1789022138136	118.0000	118.0000	available	2026-09-10 06:35:38.137655	2026-09-10 06:35:38.137655
648	26	PRD-1789021819488-R1789022138319	118.0000	118.0000	available	2026-09-10 06:35:38.320768	2026-09-10 06:35:38.320768
649	26	PRD-1789021819488-R1789022138476	118.0000	118.0000	available	2026-09-10 06:35:38.477794	2026-09-10 06:35:38.477794
650	26	PRD-1789021819488-R1789022138618	118.0000	118.0000	available	2026-09-10 06:35:38.620265	2026-09-10 06:35:38.620265
651	26	PRD-1789021819488-R1789022138836	118.0000	118.0000	available	2026-09-10 06:35:38.837757	2026-09-10 06:35:38.837757
652	26	PRD-1789021819488-R1789022138975	118.0000	118.0000	available	2026-09-10 06:35:38.976615	2026-09-10 06:35:38.976615
653	26	PRD-1789021819488-R1789022139147	118.0000	118.0000	available	2026-09-10 06:35:39.148421	2026-09-10 06:35:39.148421
654	26	PRD-1789021819488-R1789022139348	118.8000	118.8000	available	2026-09-10 06:35:39.349402	2026-09-10 06:35:39.349402
655	26	PRD-1789021819488-R1789022139546	117.7000	117.7000	available	2026-09-10 06:35:39.547652	2026-09-10 06:35:39.547652
656	26	PRD-1789021819488-R1789022139700	115.1000	115.1000	available	2026-09-10 06:35:39.703896	2026-09-10 06:35:39.703896
657	26	PRD-1789021819488-R1789022139861	118.3000	118.3000	available	2026-09-10 06:35:39.863287	2026-09-10 06:35:39.863287
658	26	PRD-1789021819488-R1789022140115	108.2000	108.2000	available	2026-09-10 06:35:40.116762	2026-09-10 06:35:40.116762
659	26	PRD-1789021819488-R1789022140312	106.0000	106.0000	available	2026-09-10 06:35:40.314294	2026-09-10 06:35:40.314294
660	26	PRD-1789021819488-R1789022140501	118.3000	118.3000	available	2026-09-10 06:35:40.502611	2026-09-10 06:35:40.502611
661	26	PRD-1789021819488-R1789022140739	118.0000	118.0000	available	2026-09-10 06:35:40.7405	2026-09-10 06:35:40.7405
662	26	PRD-1789021819488-R1789022140916	112.0000	112.0000	available	2026-09-10 06:35:40.917122	2026-09-10 06:35:40.917122
663	26	PRD-1789021819488-R1789022141129	113.8000	113.8000	available	2026-09-10 06:35:41.131297	2026-09-10 06:35:41.131297
664	26	PRD-1789021819488-R1789022141366	116.0000	116.0000	available	2026-09-10 06:35:41.367746	2026-09-10 06:35:41.367746
665	26	PRD-1789021819488-R1789022141715	112.7000	112.7000	available	2026-09-10 06:35:41.717293	2026-09-10 06:35:41.717293
666	26	PRD-1789021819488-R1789022142002	113.6000	113.6000	available	2026-09-10 06:35:42.003367	2026-09-10 06:35:42.003367
667	26	PRD-1789021819488-R1789022142135	117.4000	117.4000	available	2026-09-10 06:35:42.136269	2026-09-10 06:35:42.136269
668	26	PRD-1789021819488-R1789022142409	115.3000	115.3000	available	2026-09-10 06:35:42.411056	2026-09-10 06:35:42.411056
669	26	PRD-1789021819488-R1789022142620	120.1000	120.1000	available	2026-09-10 06:35:42.621891	2026-09-10 06:35:42.621891
670	26	PRD-1789021819488-R1789022143452	119.8000	119.8000	available	2026-09-10 06:35:43.454639	2026-09-10 06:35:43.454639
671	26	PRD-1789021819488-R1789022143675	122.6000	122.6000	available	2026-09-10 06:35:43.679507	2026-09-10 06:35:43.679507
672	26	PRD-1789021819488-R1789022143863	110.8000	110.8000	available	2026-09-10 06:35:43.864805	2026-09-10 06:35:43.864805
673	26	PRD-1789021819488-R1789022144063	110.7000	110.7000	available	2026-09-10 06:35:44.064538	2026-09-10 06:35:44.064538
674	26	PRD-1789021819488-R1789022144431	102.3000	102.3000	available	2026-09-10 06:35:44.432555	2026-09-10 06:35:44.432555
675	26	PRD-1789021819488-R1789022144602	120.1000	120.1000	available	2026-09-10 06:35:44.603902	2026-09-10 06:35:44.603902
676	26	PRD-1789021819488-R1789022144951	115.8000	115.8000	available	2026-09-10 06:35:44.952987	2026-09-10 06:35:44.952987
677	26	PRD-1789021819488-R1789022145131	109.3000	109.3000	available	2026-09-10 06:35:45.13267	2026-09-10 06:35:45.13267
678	26	PRD-1789021819488-R1789022145424	106.1000	106.1000	available	2026-09-10 06:35:45.425327	2026-09-10 06:35:45.425327
679	26	PRD-1789021819488-R1789022145656	125.3000	125.3000	available	2026-09-10 06:35:45.658347	2026-09-10 06:35:45.658347
680	26	PRD-1789021819488-R1789022146004	113.8000	113.8000	available	2026-09-10 06:35:46.00601	2026-09-10 06:35:46.00601
682	26	PRD-1789021819488-R1789022146449	122.2000	122.2000	available	2026-09-10 06:35:46.450713	2026-09-10 06:35:46.450713
689	26	PRD-1789021819488-R1789022148623	118.0000	118.0000	available	2026-09-10 06:35:48.626443	2026-09-10 06:35:48.626443
696	26	PRD-1789021819488-R1789022149951	118.0000	118.0000	available	2026-09-10 06:35:49.955463	2026-09-10 06:35:49.955463
697	26	PRD-1789021819488-R1789022150214	123.1000	123.1000	available	2026-09-10 06:35:50.215974	2026-09-10 06:35:50.215974
699	26	PRD-1789021819488-R1789022150685	118.0000	118.0000	available	2026-09-10 06:35:50.68878	2026-09-10 06:35:50.68878
701	26	PRD-1789021819488-R1789022151124	118.0000	118.0000	available	2026-09-10 06:35:51.127401	2026-09-10 06:35:51.127401
1298	31	PRD-1789025055371-R1789026211954	70.0000	70.0000	available	2026-09-10 07:43:31.956213	2026-09-10 07:43:31.956213
1302	31	PRD-1789025055371-R1789026212310	65.0000	65.0000	available	2026-09-10 07:43:32.312625	2026-09-10 07:43:32.312625
1303	31	PRD-1789025055371-R1789026212406	65.0000	65.0000	available	2026-09-10 07:43:32.407454	2026-09-10 07:43:32.407454
1304	31	PRD-1789025055371-R1789026212499	68.0000	68.0000	available	2026-09-10 07:43:32.500537	2026-09-10 07:43:32.500537
1307	31	PRD-1789025055371-R1789026212707	69.0000	69.0000	available	2026-09-10 07:43:32.709341	2026-09-10 07:43:32.709341
1310	31	PRD-1789025055371-R1789026212924	60.0000	60.0000	available	2026-09-10 07:43:32.925899	2026-09-10 07:43:32.925899
1315	31	PRD-1789025055371-R1789026213442	65.0000	65.0000	available	2026-09-10 07:43:33.444604	2026-09-10 07:43:33.444604
1317	31	PRD-1789025055371-R1789026213603	59.0000	59.0000	available	2026-09-10 07:43:33.604895	2026-09-10 07:43:33.604895
1318	31	PRD-1789025055371-R1789026213685	64.0000	64.0000	available	2026-09-10 07:43:33.688625	2026-09-10 07:43:33.688625
1321	31	PRD-1789025055371-R1789026213937	65.0000	65.0000	available	2026-09-10 07:43:33.938636	2026-09-10 07:43:33.938636
1322	31	PRD-1789025055371-R1789026214018	65.0000	65.0000	available	2026-09-10 07:43:34.020151	2026-09-10 07:43:34.020151
1324	31	PRD-1789025055371-R1789026214210	60.0000	60.0000	available	2026-09-10 07:43:34.211546	2026-09-10 07:43:34.211546
1426	4	PRD-1789018276001-R1789027464763	96.8000	96.8000	available	2026-09-10 08:04:24.765346	2026-09-10 08:04:24.765346
1427	40	PRD-1789027496659-R1789027504039	117.0000	117.0000	available	2026-09-10 08:05:04.040638	2026-09-10 08:05:04.040638
1581	25	PRD-1789021016427-R1789028458391	120.3000	120.3000	available	2026-09-10 08:20:58.392563	2026-09-10 08:20:58.392563
1582	25	PRD-1789021016427-R1789028458453	117.1000	117.1000	available	2026-09-10 08:20:58.454625	2026-09-10 08:20:58.454625
1587	25	PRD-1789021016427-R1789028459204	117.8000	117.8000	available	2026-09-10 08:20:59.205803	2026-09-10 08:20:59.205803
1594	25	PRD-1789021016427-R1789028460200	144.1000	144.1000	available	2026-09-10 08:21:00.201433	2026-09-10 08:21:00.201433
1595	25	PRD-1789021016427-R1789028460301	111.8000	111.8000	available	2026-09-10 08:21:00.30288	2026-09-10 08:21:00.30288
1596	25	PRD-1789021016427-R1789028460446	115.7000	115.7000	available	2026-09-10 08:21:00.447486	2026-09-10 08:21:00.447486
1597	25	PRD-1789021016427-R1789028460606	111.7000	111.7000	available	2026-09-10 08:21:00.607835	2026-09-10 08:21:00.607835
1598	25	PRD-1789021016427-R1789028460773	117.6000	117.6000	available	2026-09-10 08:21:00.777977	2026-09-10 08:21:00.777977
1599	25	PRD-1789021016427-R1789028460988	118.1000	118.1000	available	2026-09-10 08:21:00.990813	2026-09-10 08:21:00.990813
1601	25	PRD-1789021016427-R1789028461270	118.3000	118.3000	available	2026-09-10 08:21:01.272063	2026-09-10 08:21:01.272063
1603	25	PRD-1789021016427-R1789028461543	115.9000	115.9000	available	2026-09-10 08:21:01.545758	2026-09-10 08:21:01.545758
1607	25	PRD-1789021016427-R1789028462106	115.0000	115.0000	available	2026-09-10 08:21:02.107701	2026-09-10 08:21:02.107701
1608	25	PRD-1789021016427-R1789028462229	117.9000	117.9000	available	2026-09-10 08:21:02.229983	2026-09-10 08:21:02.229983
1609	25	PRD-1789021016427-R1789028462347	118.4000	118.4000	available	2026-09-10 08:21:02.348225	2026-09-10 08:21:02.348225
1610	25	PRD-1789021016427-R1789028462467	116.5000	116.5000	available	2026-09-10 08:21:02.468619	2026-09-10 08:21:02.468619
1615	25	PRD-1789021016427-R1789028463119	103.0000	103.0000	available	2026-09-10 08:21:03.120506	2026-09-10 08:21:03.120506
1732	50	PRD-1789028920266-R1789029440882	116.0000	116.0000	available	2026-09-10 08:37:20.883057	2026-09-10 08:37:20.883057
1735	50	PRD-1789028920266-R1789029441151	116.0000	116.0000	available	2026-09-10 08:37:21.15448	2026-09-10 08:37:21.15448
1736	50	PRD-1789028920266-R1789029441221	136.0000	136.0000	available	2026-09-10 08:37:21.222509	2026-09-10 08:37:21.222509
1737	50	PRD-1789028920266-R1789029441289	116.2000	116.2000	available	2026-09-10 08:37:21.293055	2026-09-10 08:37:21.293055
1739	50	PRD-1789028920266-R1789029441500	142.1000	142.1000	available	2026-09-10 08:37:21.502062	2026-09-10 08:37:21.502062
1742	50	PRD-1789028920266-R1789029441733	114.4000	114.4000	available	2026-09-10 08:37:21.735218	2026-09-10 08:37:21.735218
1744	50	PRD-1789028920266-R1789029441929	116.9000	116.9000	available	2026-09-10 08:37:21.930961	2026-09-10 08:37:21.930961
1745	50	PRD-1789028920266-R1789029441994	118.2000	118.2000	available	2026-09-10 08:37:21.996652	2026-09-10 08:37:21.996652
1746	50	PRD-1789028920266-R1789029442100	121.9000	121.9000	available	2026-09-10 08:37:22.102541	2026-09-10 08:37:22.102541
1749	50	PRD-1789028920266-R1789029442371	115.2000	115.2000	available	2026-09-10 08:37:22.373908	2026-09-10 08:37:22.373908
1752	50	PRD-1789028920266-R1789029442632	70.5000	70.5000	available	2026-09-10 08:37:22.633462	2026-09-10 08:37:22.633462
1753	50	PRD-1789028920266-R1789029442740	117.7000	117.7000	available	2026-09-10 08:37:22.750162	2026-09-10 08:37:22.750162
1755	50	PRD-1789028920266-R1789029442936	104.7000	104.7000	available	2026-09-10 08:37:22.937407	2026-09-10 08:37:22.937407
1756	50	PRD-1789028920266-R1789029443022	111.6000	111.6000	available	2026-09-10 08:37:23.024056	2026-09-10 08:37:23.024056
1759	50	PRD-1789028920266-R1789029443305	116.2000	116.2000	available	2026-09-10 08:37:23.306164	2026-09-10 08:37:23.306164
1762	50	PRD-1789028920266-R1789029443603	120.5000	120.5000	available	2026-09-10 08:37:23.604991	2026-09-10 08:37:23.604991
1766	50	PRD-1789028920266-R1789029443981	121.0000	121.0000	available	2026-09-10 08:37:23.98222	2026-09-10 08:37:23.98222
1767	50	PRD-1789028920266-R1789029444079	116.2000	116.2000	available	2026-09-10 08:37:24.080632	2026-09-10 08:37:24.080632
1768	50	PRD-1789028920266-R1789029444184	125.1000	125.1000	available	2026-09-10 08:37:24.186061	2026-09-10 08:37:24.186061
1769	50	PRD-1789028920266-R1789029444298	116.0000	116.0000	available	2026-09-10 08:37:24.316729	2026-09-10 08:37:24.316729
1772	50	PRD-1789028920266-R1789029444786	124.2000	124.2000	available	2026-09-10 08:37:24.788604	2026-09-10 08:37:24.788604
1775	50	PRD-1789028920266-R1789029445116	119.2000	119.2000	available	2026-09-10 08:37:25.118387	2026-09-10 08:37:25.118387
1776	50	PRD-1789028920266-R1789029445228	100.0000	100.0000	available	2026-09-10 08:37:25.230108	2026-09-10 08:37:25.230108
1777	50	PRD-1789028920266-R1789029445349	95.9000	95.9000	available	2026-09-10 08:37:25.350551	2026-09-10 08:37:25.350551
1778	50	PRD-1789028920266-R1789029445477	119.5000	119.5000	available	2026-09-10 08:37:25.479119	2026-09-10 08:37:25.479119
1780	50	PRD-1789028920266-R1789029445647	120.9000	120.9000	available	2026-09-10 08:37:25.650213	2026-09-10 08:37:25.650213
2048	52	PRD-1789029576872-R1789029851173	109.7000	109.7000	available	2026-09-10 08:44:11.174695	2026-09-10 08:44:11.174695
2050	52	PRD-1789029576872-R1789029851434	100.0000	100.0000	available	2026-09-10 08:44:11.436133	2026-09-10 08:44:11.436133
2051	52	PRD-1789029576872-R1789029851547	116.2000	116.2000	available	2026-09-10 08:44:11.54825	2026-09-10 08:44:11.54825
2052	52	PRD-1789029576872-R1789029851652	123.5000	123.5000	available	2026-09-10 08:44:11.653792	2026-09-10 08:44:11.653792
2053	52	PRD-1789029576872-R1789029851783	117.3000	117.3000	available	2026-09-10 08:44:11.783964	2026-09-10 08:44:11.783964
2054	52	PRD-1789029576872-R1789029851908	111.2000	111.2000	available	2026-09-10 08:44:11.909725	2026-09-10 08:44:11.909725
2056	52	PRD-1789029576872-R1789029852210	113.0000	113.0000	available	2026-09-10 08:44:12.218826	2026-09-10 08:44:12.218826
2060	52	PRD-1789029576872-R1789029852736	71.8000	71.8000	available	2026-09-10 08:44:12.73707	2026-09-10 08:44:12.73707
2064	52	PRD-1789029576872-R1789029853326	120.4000	120.4000	available	2026-09-10 08:44:13.327817	2026-09-10 08:44:13.327817
681	26	PRD-1789021819488-R1789022146311	121.4000	121.4000	available	2026-09-10 06:35:46.312774	2026-09-10 06:35:46.312774
683	26	PRD-1789021819488-R1789022146832	110.7000	110.7000	available	2026-09-10 06:35:46.834245	2026-09-10 06:35:46.834245
684	26	PRD-1789021819488-R1789022147048	103.3000	103.3000	available	2026-09-10 06:35:47.049458	2026-09-10 06:35:47.049458
685	26	PRD-1789021819488-R1789022147461	118.0000	118.0000	available	2026-09-10 06:35:47.462554	2026-09-10 06:35:47.462554
686	26	PRD-1789021819488-R1789022147664	118.0000	118.0000	available	2026-09-10 06:35:47.666733	2026-09-10 06:35:47.666733
687	26	PRD-1789021819488-R1789022148087	118.0000	118.0000	available	2026-09-10 06:35:48.088597	2026-09-10 06:35:48.088597
693	26	PRD-1789021819488-R1789022149505	115.1000	115.1000	available	2026-09-10 06:35:49.510025	2026-09-10 06:35:49.510025
694	26	PRD-1789021819488-R1789022149629	118.0000	118.0000	available	2026-09-10 06:35:49.630428	2026-09-10 06:35:49.630428
695	26	PRD-1789021819488-R1789022149778	118.0000	118.0000	available	2026-09-10 06:35:49.780109	2026-09-10 06:35:49.780109
700	26	PRD-1789021819488-R1789022150913	113.4000	113.4000	available	2026-09-10 06:35:50.914759	2026-09-10 06:35:50.914759
705	26	PRD-1789021819488-R1789022152757	118.0000	118.0000	available	2026-09-10 06:35:52.759398	2026-09-10 06:35:52.759398
706	26	PRD-1789021819488-R1789022152966	118.0000	118.0000	available	2026-09-10 06:35:52.969178	2026-09-10 06:35:52.969178
707	26	PRD-1789021819488-R1789022153130	118.0000	118.0000	available	2026-09-10 06:35:53.131942	2026-09-10 06:35:53.131942
709	26	PRD-1789021819488-R1789022153704	118.0000	118.0000	available	2026-09-10 06:35:53.706716	2026-09-10 06:35:53.706716
710	26	PRD-1789021819488-R1789022153979	118.0000	118.0000	available	2026-09-10 06:35:53.979887	2026-09-10 06:35:53.979887
711	26	PRD-1789021819488-R1789022154187	118.0000	118.0000	available	2026-09-10 06:35:54.188773	2026-09-10 06:35:54.188773
712	26	PRD-1789021819488-R1789022154421	92.9000	92.9000	available	2026-09-10 06:35:54.423031	2026-09-10 06:35:54.423031
714	26	PRD-1789021819488-R1789022154889	108.1000	108.1000	available	2026-09-10 06:35:54.896021	2026-09-10 06:35:54.896021
715	26	PRD-1789021819488-R1789022155050	118.1000	118.1000	available	2026-09-10 06:35:55.050936	2026-09-10 06:35:55.050936
716	26	PRD-1789021819488-R1789022155188	118.0000	118.0000	available	2026-09-10 06:35:55.189477	2026-09-10 06:35:55.189477
1299	31	PRD-1789025055371-R1789026212074	62.0000	62.0000	available	2026-09-10 07:43:32.075998	2026-09-10 07:43:32.075998
1300	31	PRD-1789025055371-R1789026212167	70.0000	70.0000	available	2026-09-10 07:43:32.168231	2026-09-10 07:43:32.168231
1301	31	PRD-1789025055371-R1789026212230	85.0000	85.0000	available	2026-09-10 07:43:32.234397	2026-09-10 07:43:32.234397
1305	31	PRD-1789025055371-R1789026212564	59.0000	59.0000	available	2026-09-10 07:43:32.566458	2026-09-10 07:43:32.566458
1306	31	PRD-1789025055371-R1789026212626	65.0000	65.0000	available	2026-09-10 07:43:32.629202	2026-09-10 07:43:32.629202
1311	31	PRD-1789025055371-R1789026213006	65.0000	65.0000	available	2026-09-10 07:43:33.007549	2026-09-10 07:43:33.007549
1313	31	PRD-1789025055371-R1789026213263	69.0000	69.0000	available	2026-09-10 07:43:33.265267	2026-09-10 07:43:33.265267
1314	31	PRD-1789025055371-R1789026213377	70.0000	70.0000	available	2026-09-10 07:43:33.379362	2026-09-10 07:43:33.379362
1319	31	PRD-1789025055371-R1789026213770	58.0000	58.0000	available	2026-09-10 07:43:33.771956	2026-09-10 07:43:33.771956
1323	31	PRD-1789025055371-R1789026214129	63.0000	63.0000	available	2026-09-10 07:43:34.130828	2026-09-10 07:43:34.130828
1428	41	PRD-1789027521976-R1789027540259	118.8000	118.8000	available	2026-09-10 08:05:40.260409	2026-09-10 08:05:40.260409
1429	41	PRD-1789027521976-R1789027540912	120.0000	120.0000	available	2026-09-10 08:05:40.913788	2026-09-10 08:05:40.913788
1583	25	PRD-1789021016427-R1789028458645	116.6000	116.6000	available	2026-09-10 08:20:58.64878	2026-09-10 08:20:58.64878
1588	25	PRD-1789021016427-R1789028459343	126.3000	126.3000	available	2026-09-10 08:20:59.345676	2026-09-10 08:20:59.345676
1589	25	PRD-1789021016427-R1789028459485	119.5000	119.5000	available	2026-09-10 08:20:59.486166	2026-09-10 08:20:59.486166
1590	25	PRD-1789021016427-R1789028459629	126.2000	126.2000	available	2026-09-10 08:20:59.63137	2026-09-10 08:20:59.63137
1604	25	PRD-1789021016427-R1789028461678	102.1000	102.1000	available	2026-09-10 08:21:01.680144	2026-09-10 08:21:01.680144
1605	25	PRD-1789021016427-R1789028461827	113.9000	113.9000	available	2026-09-10 08:21:01.83923	2026-09-10 08:21:01.83923
1606	25	PRD-1789021016427-R1789028461986	124.2000	124.2000	available	2026-09-10 08:21:01.989426	2026-09-10 08:21:01.989426
1611	25	PRD-1789021016427-R1789028462597	113.0000	113.0000	available	2026-09-10 08:21:02.599577	2026-09-10 08:21:02.599577
1613	25	PRD-1789021016427-R1789028462886	115.5000	115.5000	available	2026-09-10 08:21:02.887968	2026-09-10 08:21:02.887968
1733	50	PRD-1789028920266-R1789029440998	116.0000	116.0000	available	2026-09-10 08:37:21.000028	2026-09-10 08:37:21.000028
1738	50	PRD-1789028920266-R1789029441390	106.3000	106.3000	available	2026-09-10 08:37:21.391649	2026-09-10 08:37:21.391649
1741	50	PRD-1789028920266-R1789029441653	119.9000	119.9000	available	2026-09-10 08:37:21.65411	2026-09-10 08:37:21.65411
1747	50	PRD-1789028920266-R1789029442189	116.0000	116.0000	available	2026-09-10 08:37:22.190743	2026-09-10 08:37:22.190743
1748	50	PRD-1789028920266-R1789029442281	116.2000	116.2000	available	2026-09-10 08:37:22.282253	2026-09-10 08:37:22.282253
1754	50	PRD-1789028920266-R1789029442849	116.0000	116.0000	available	2026-09-10 08:37:22.850997	2026-09-10 08:37:22.850997
1758	50	PRD-1789028920266-R1789029443212	116.0000	116.0000	available	2026-09-10 08:37:23.213829	2026-09-10 08:37:23.213829
1760	50	PRD-1789028920266-R1789029443399	116.0000	116.0000	available	2026-09-10 08:37:23.400381	2026-09-10 08:37:23.400381
1761	50	PRD-1789028920266-R1789029443494	116.0000	116.0000	available	2026-09-10 08:37:23.496053	2026-09-10 08:37:23.496053
1770	50	PRD-1789028920266-R1789029444496	116.0000	116.0000	available	2026-09-10 08:37:24.498191	2026-09-10 08:37:24.498191
1773	50	PRD-1789028920266-R1789029444900	117.8000	117.8000	available	2026-09-10 08:37:24.902138	2026-09-10 08:37:24.902138
1779	50	PRD-1789028920266-R1789029445560	116.2000	116.2000	available	2026-09-10 08:37:25.561074	2026-09-10 08:37:25.561074
1787	50	PRD-1789028920266-R1789029446784	118.4000	118.4000	available	2026-09-10 08:37:26.785796	2026-09-10 08:37:26.785796
1789	50	PRD-1789028920266-R1789029447073	116.0000	116.0000	available	2026-09-10 08:37:27.07588	2026-09-10 08:37:27.07588
1791	50	PRD-1789028920266-R1789029447327	120.0000	120.0000	available	2026-09-10 08:37:27.329184	2026-09-10 08:37:27.329184
1797	50	PRD-1789028920266-R1789029448318	118.3000	118.3000	available	2026-09-10 08:37:28.320465	2026-09-10 08:37:28.320465
1799	50	PRD-1789028920266-R1789029448582	125.0000	125.0000	available	2026-09-10 08:37:28.583884	2026-09-10 08:37:28.583884
1800	50	PRD-1789028920266-R1789029448723	116.0000	116.0000	available	2026-09-10 08:37:28.725284	2026-09-10 08:37:28.725284
1801	50	PRD-1789028920266-R1789029448875	116.0000	116.0000	available	2026-09-10 08:37:28.876215	2026-09-10 08:37:28.876215
1802	50	PRD-1789028920266-R1789029449085	103.8000	103.8000	available	2026-09-10 08:37:29.086934	2026-09-10 08:37:29.086934
1803	50	PRD-1789028920266-R1789029449293	116.0000	116.0000	available	2026-09-10 08:37:29.294449	2026-09-10 08:37:29.294449
1806	50	PRD-1789028920266-R1789029449792	118.1000	118.1000	available	2026-09-10 08:37:29.799245	2026-09-10 08:37:29.799245
1809	50	PRD-1789028920266-R1789029450357	116.0000	116.0000	available	2026-09-10 08:37:30.358608	2026-09-10 08:37:30.358608
1811	50	PRD-1789028920266-R1789029450632	116.0000	116.0000	available	2026-09-10 08:37:30.634558	2026-09-10 08:37:30.634558
1812	50	PRD-1789028920266-R1789029450795	116.0000	116.0000	available	2026-09-10 08:37:30.796823	2026-09-10 08:37:30.796823
1813	50	PRD-1789028920266-R1789029450936	114.7000	114.7000	available	2026-09-10 08:37:30.938702	2026-09-10 08:37:30.938702
1815	50	PRD-1789028920266-R1789029451248	116.2000	116.2000	available	2026-09-10 08:37:31.249613	2026-09-10 08:37:31.249613
1818	50	PRD-1789028920266-R1789029451706	111.0000	111.0000	available	2026-09-10 08:37:31.70898	2026-09-10 08:37:31.70898
1822	50	PRD-1789028920266-R1789029452389	120.3000	120.3000	available	2026-09-10 08:37:32.390427	2026-09-10 08:37:32.390427
2068	52	PRD-1789029576872-R1789029853982	120.1000	120.1000	available	2026-09-10 08:44:13.983328	2026-09-10 08:44:13.983328
2069	52	PRD-1789029576872-R1789029854102	117.3000	117.3000	available	2026-09-10 08:44:14.103338	2026-09-10 08:44:14.103338
2147	26	PRD-1789021819488-R1789031979212	138.3000	138.3000	available	2026-09-10 09:19:39.218711	2026-09-10 09:19:39.218711
688	26	PRD-1789021819488-R1789022148246	118.0000	118.0000	available	2026-09-10 06:35:48.247399	2026-09-10 06:35:48.247399
690	26	PRD-1789021819488-R1789022148770	118.0000	118.0000	available	2026-09-10 06:35:48.771247	2026-09-10 06:35:48.771247
691	26	PRD-1789021819488-R1789022149107	118.0000	118.0000	available	2026-09-10 06:35:49.108671	2026-09-10 06:35:49.108671
692	26	PRD-1789021819488-R1789022149297	118.0000	118.0000	available	2026-09-10 06:35:49.298513	2026-09-10 06:35:49.298513
698	26	PRD-1789021819488-R1789022150455	118.0000	118.0000	available	2026-09-10 06:35:50.457415	2026-09-10 06:35:50.457415
702	26	PRD-1789021819488-R1789022151365	118.0000	118.0000	available	2026-09-10 06:35:51.3665	2026-09-10 06:35:51.3665
703	26	PRD-1789021819488-R1789022152252	118.0000	118.0000	available	2026-09-10 06:35:52.253825	2026-09-10 06:35:52.253825
704	26	PRD-1789021819488-R1789022152493	118.0000	118.0000	available	2026-09-10 06:35:52.495328	2026-09-10 06:35:52.495328
708	26	PRD-1789021819488-R1789022153376	118.0000	118.0000	available	2026-09-10 06:35:53.377153	2026-09-10 06:35:53.377153
713	26	PRD-1789021819488-R1789022154640	116.2000	116.2000	available	2026-09-10 06:35:54.64231	2026-09-10 06:35:54.64231
717	7	PRD-1789018404302-R1789024127724	120.5000	120.5000	available	2026-09-10 07:08:47.725793	2026-09-10 07:08:47.725793
718	7	PRD-1789018404302-R1789024128979	0.0000	0.0000	available	2026-09-10 07:08:48.982646	2026-09-10 07:08:48.982646
719	7	PRD-1789018404302-R1789024129301	118.7000	118.7000	available	2026-09-10 07:08:49.303151	2026-09-10 07:08:49.303151
720	7	PRD-1789018404302-R1789024129609	120.1000	120.1000	available	2026-09-10 07:08:49.610884	2026-09-10 07:08:49.610884
721	7	PRD-1789018404302-R1789024129951	113.9000	113.9000	available	2026-09-10 07:08:49.953167	2026-09-10 07:08:49.953167
722	7	PRD-1789018404302-R1789024130272	101.6000	101.6000	available	2026-09-10 07:08:50.277257	2026-09-10 07:08:50.277257
723	7	PRD-1789018404302-R1789024130587	119.9000	119.9000	available	2026-09-10 07:08:50.588667	2026-09-10 07:08:50.588667
724	7	PRD-1789018404302-R1789024130912	120.4000	120.4000	available	2026-09-10 07:08:50.915652	2026-09-10 07:08:50.915652
725	7	PRD-1789018404302-R1789024131271	113.9000	113.9000	available	2026-09-10 07:08:51.272723	2026-09-10 07:08:51.272723
726	7	PRD-1789018404302-R1789024131624	121.2000	121.2000	available	2026-09-10 07:08:51.626996	2026-09-10 07:08:51.626996
727	7	PRD-1789018404302-R1789024131983	113.9000	113.9000	available	2026-09-10 07:08:51.984597	2026-09-10 07:08:51.984597
728	7	PRD-1789018404302-R1789024132314	107.8000	107.8000	available	2026-09-10 07:08:52.315835	2026-09-10 07:08:52.315835
729	7	PRD-1789018404302-R1789024132646	113.8000	113.8000	available	2026-09-10 07:08:52.647434	2026-09-10 07:08:52.647434
730	7	PRD-1789018404302-R1789024132991	116.0000	116.0000	available	2026-09-10 07:08:52.99297	2026-09-10 07:08:52.99297
731	7	PRD-1789018404302-R1789024133311	149.0000	149.0000	available	2026-09-10 07:08:53.315616	2026-09-10 07:08:53.315616
732	7	PRD-1789018404302-R1789024133627	111.8000	111.8000	available	2026-09-10 07:08:53.628271	2026-09-10 07:08:53.628271
733	7	PRD-1789018404302-R1789024133988	120.1000	120.1000	available	2026-09-10 07:08:53.9926	2026-09-10 07:08:53.9926
734	7	PRD-1789018404302-R1789024134254	112.1000	112.1000	available	2026-09-10 07:08:54.258238	2026-09-10 07:08:54.258238
735	7	PRD-1789018404302-R1789024134899	117.6000	117.6000	available	2026-09-10 07:08:54.89998	2026-09-10 07:08:54.89998
736	7	PRD-1789018404302-R1789024135196	115.2000	115.2000	available	2026-09-10 07:08:55.197325	2026-09-10 07:08:55.197325
737	7	PRD-1789018404302-R1789024135548	113.9000	113.9000	available	2026-09-10 07:08:55.555404	2026-09-10 07:08:55.555404
738	7	PRD-1789018404302-R1789024135894	93.4000	93.4000	available	2026-09-10 07:08:55.895779	2026-09-10 07:08:55.895779
739	7	PRD-1789018404302-R1789024136216	100.5000	100.5000	available	2026-09-10 07:08:56.217781	2026-09-10 07:08:56.217781
740	7	PRD-1789018404302-R1789024136563	120.2000	120.2000	available	2026-09-10 07:08:56.567507	2026-09-10 07:08:56.567507
741	7	PRD-1789018404302-R1789024136917	124.5000	124.5000	available	2026-09-10 07:08:56.918715	2026-09-10 07:08:56.918715
742	7	PRD-1789018404302-R1789024137303	122.0000	122.0000	available	2026-09-10 07:08:57.305312	2026-09-10 07:08:57.305312
743	7	PRD-1789018404302-R1789024137638	113.8000	113.8000	available	2026-09-10 07:08:57.640268	2026-09-10 07:08:57.640268
744	7	PRD-1789018404302-R1789024137983	113.5000	113.5000	available	2026-09-10 07:08:57.984393	2026-09-10 07:08:57.984393
745	7	PRD-1789018404302-R1789024138334	113.9000	113.9000	available	2026-09-10 07:08:58.335973	2026-09-10 07:08:58.335973
746	7	PRD-1789018404302-R1789024138684	113.9000	113.9000	available	2026-09-10 07:08:58.685895	2026-09-10 07:08:58.685895
747	7	PRD-1789018404302-R1789024139059	113.9000	113.9000	available	2026-09-10 07:08:59.060521	2026-09-10 07:08:59.060521
748	7	PRD-1789018404302-R1789024139387	120.3000	120.3000	available	2026-09-10 07:08:59.388157	2026-09-10 07:08:59.388157
749	7	PRD-1789018404302-R1789024139820	113.9000	113.9000	available	2026-09-10 07:08:59.822001	2026-09-10 07:08:59.822001
750	7	PRD-1789018404302-R1789024140161	113.9000	113.9000	available	2026-09-10 07:09:00.1628	2026-09-10 07:09:00.1628
751	7	PRD-1789018404302-R1789024140496	114.0000	114.0000	available	2026-09-10 07:09:00.498314	2026-09-10 07:09:00.498314
752	7	PRD-1789018404302-R1789024140805	114.0000	114.0000	available	2026-09-10 07:09:00.806438	2026-09-10 07:09:00.806438
753	7	PRD-1789018404302-R1789024141137	116.2000	116.2000	available	2026-09-10 07:09:01.139031	2026-09-10 07:09:01.139031
754	7	PRD-1789018404302-R1789024141508	113.9000	113.9000	available	2026-09-10 07:09:01.514334	2026-09-10 07:09:01.514334
755	7	PRD-1789018404302-R1789024141900	100.0000	100.0000	available	2026-09-10 07:09:01.901295	2026-09-10 07:09:01.901295
756	7	PRD-1789018404302-R1789024142997	115.8000	115.8000	available	2026-09-10 07:09:02.999584	2026-09-10 07:09:02.999584
757	7	PRD-1789018404302-R1789024143273	113.9000	113.9000	available	2026-09-10 07:09:03.273834	2026-09-10 07:09:03.273834
758	7	PRD-1789018404302-R1789024143605	114.0000	114.0000	available	2026-09-10 07:09:03.607458	2026-09-10 07:09:03.607458
759	7	PRD-1789018404302-R1789024143972	116.6000	116.6000	available	2026-09-10 07:09:03.975898	2026-09-10 07:09:03.975898
760	7	PRD-1789018404302-R1789024144316	110.7000	110.7000	available	2026-09-10 07:09:04.317987	2026-09-10 07:09:04.317987
761	7	PRD-1789018404302-R1789024144676	114.5000	114.5000	available	2026-09-10 07:09:04.678033	2026-09-10 07:09:04.678033
762	7	PRD-1789018404302-R1789024144991	114.0000	114.0000	available	2026-09-10 07:09:04.992878	2026-09-10 07:09:04.992878
763	7	PRD-1789018404302-R1789024145334	114.0000	114.0000	available	2026-09-10 07:09:05.338444	2026-09-10 07:09:05.338444
764	7	PRD-1789018404302-R1789024145679	112.0000	112.0000	available	2026-09-10 07:09:05.680595	2026-09-10 07:09:05.680595
765	7	PRD-1789018404302-R1789024146037	113.8000	113.8000	available	2026-09-10 07:09:06.039596	2026-09-10 07:09:06.039596
766	7	PRD-1789018404302-R1789024146378	120.0000	120.0000	available	2026-09-10 07:09:06.379553	2026-09-10 07:09:06.379553
767	7	PRD-1789018404302-R1789024146743	114.0000	114.0000	available	2026-09-10 07:09:06.745139	2026-09-10 07:09:06.745139
768	7	PRD-1789018404302-R1789024147059	118.7000	118.7000	available	2026-09-10 07:09:07.060591	2026-09-10 07:09:07.060591
769	7	PRD-1789018404302-R1789024147399	113.8000	113.8000	available	2026-09-10 07:09:07.400241	2026-09-10 07:09:07.400241
770	7	PRD-1789018404302-R1789024147751	116.9000	116.9000	available	2026-09-10 07:09:07.753017	2026-09-10 07:09:07.753017
771	7	PRD-1789018404302-R1789024148089	115.8000	115.8000	available	2026-09-10 07:09:08.0926	2026-09-10 07:09:08.0926
772	7	PRD-1789018404302-R1789024148405	118.9000	118.9000	available	2026-09-10 07:09:08.406172	2026-09-10 07:09:08.406172
773	7	PRD-1789018404302-R1789024148794	115.0000	115.0000	available	2026-09-10 07:09:08.800279	2026-09-10 07:09:08.800279
774	7	PRD-1789018404302-R1789024149120	136.0000	136.0000	available	2026-09-10 07:09:09.12754	2026-09-10 07:09:09.12754
775	7	PRD-1789018404302-R1789024149470	117.1000	117.1000	available	2026-09-10 07:09:09.471789	2026-09-10 07:09:09.471789
776	7	PRD-1789018404302-R1789024149815	120.8000	120.8000	available	2026-09-10 07:09:09.816717	2026-09-10 07:09:09.816717
777	7	PRD-1789018404302-R1789024150171	110.1000	110.1000	available	2026-09-10 07:09:10.175152	2026-09-10 07:09:10.175152
778	7	PRD-1789018404302-R1789024150521	123.0000	123.0000	available	2026-09-10 07:09:10.522665	2026-09-10 07:09:10.522665
779	7	PRD-1789018404302-R1789024150869	132.1000	132.1000	available	2026-09-10 07:09:10.871721	2026-09-10 07:09:10.871721
788	7	PRD-1789018404302-R1789024154195	120.0000	120.0000	available	2026-09-10 07:09:14.199871	2026-09-10 07:09:14.199871
791	7	PRD-1789018404302-R1789024155223	119.3000	119.3000	available	2026-09-10 07:09:15.224078	2026-09-10 07:09:15.224078
792	7	PRD-1789018404302-R1789024155547	120.0000	120.0000	available	2026-09-10 07:09:15.549241	2026-09-10 07:09:15.549241
796	7	PRD-1789018404302-R1789024157079	120.3000	120.3000	available	2026-09-10 07:09:17.083595	2026-09-10 07:09:17.083595
1308	31	PRD-1789025055371-R1789026212777	70.0000	70.0000	available	2026-09-10 07:43:32.779549	2026-09-10 07:43:32.779549
1309	31	PRD-1789025055371-R1789026212846	65.0000	65.0000	available	2026-09-10 07:43:32.847475	2026-09-10 07:43:32.847475
1312	31	PRD-1789025055371-R1789026213086	66.0000	66.0000	available	2026-09-10 07:43:33.088146	2026-09-10 07:43:33.088146
1316	31	PRD-1789025055371-R1789026213526	55.0000	55.0000	available	2026-09-10 07:43:33.527809	2026-09-10 07:43:33.527809
1320	31	PRD-1789025055371-R1789026213848	56.0000	56.0000	available	2026-09-10 07:43:33.849508	2026-09-10 07:43:33.849508
1325	32	PRD-1789025098770-R1789026286002	131.0000	131.0000	available	2026-09-10 07:44:46.003196	2026-09-10 07:44:46.003196
1326	28	PRD-1789024618261-R1789026337156	78.0000	78.0000	available	2026-09-10 07:45:37.15761	2026-09-10 07:45:37.15761
1327	28	PRD-1789024618261-R1789026337259	70.0000	70.0000	available	2026-09-10 07:45:37.260446	2026-09-10 07:45:37.260446
1329	28	PRD-1789024618261-R1789026337500	62.0000	62.0000	available	2026-09-10 07:45:37.502892	2026-09-10 07:45:37.502892
1332	28	PRD-1789024618261-R1789026337754	88.0000	88.0000	available	2026-09-10 07:45:37.756203	2026-09-10 07:45:37.756203
1334	28	PRD-1789024618261-R1789026337939	57.0000	57.0000	available	2026-09-10 07:45:37.943328	2026-09-10 07:45:37.943328
1337	37	PRD-1789026369751-R1789026406056	117.9000	117.9000	available	2026-09-10 07:46:46.058803	2026-09-10 07:46:46.058803
1430	42	PRD-1789027568425-R1789027578743	60.5000	60.5000	available	2026-09-10 08:06:18.745194	2026-09-10 08:06:18.745194
1584	25	PRD-1789021016427-R1789028458769	118.1000	118.1000	available	2026-09-10 08:20:58.770865	2026-09-10 08:20:58.770865
1585	25	PRD-1789021016427-R1789028458936	108.6000	108.6000	available	2026-09-10 08:20:58.940533	2026-09-10 08:20:58.940533
1586	25	PRD-1789021016427-R1789028459111	116.5000	116.5000	available	2026-09-10 08:20:59.112418	2026-09-10 08:20:59.112418
1591	25	PRD-1789021016427-R1789028459768	119.4000	119.4000	available	2026-09-10 08:20:59.76933	2026-09-10 08:20:59.76933
1592	25	PRD-1789021016427-R1789028459882	111.0000	111.0000	available	2026-09-10 08:20:59.884688	2026-09-10 08:20:59.884688
1593	25	PRD-1789021016427-R1789028460035	125.6000	125.6000	available	2026-09-10 08:21:00.037695	2026-09-10 08:21:00.037695
1600	25	PRD-1789021016427-R1789028461149	115.2000	115.2000	available	2026-09-10 08:21:01.151021	2026-09-10 08:21:01.151021
1602	25	PRD-1789021016427-R1789028461400	114.1000	114.1000	available	2026-09-10 08:21:01.401769	2026-09-10 08:21:01.401769
1612	25	PRD-1789021016427-R1789028462763	100.9000	100.9000	available	2026-09-10 08:21:02.764511	2026-09-10 08:21:02.764511
1614	25	PRD-1789021016427-R1789028462999	116.9000	116.9000	available	2026-09-10 08:21:03.00177	2026-09-10 08:21:03.00177
1827	25	PRD-1789021016427-R1789029526355	119.6000	119.6000	available	2026-09-10 08:38:46.358217	2026-09-10 08:38:46.358217
1828	25	PRD-1789021016427-R1789029526523	118.3000	118.3000	available	2026-09-10 08:38:46.524597	2026-09-10 08:38:46.524597
1831	25	PRD-1789021016427-R1789029526919	93.0000	93.0000	available	2026-09-10 08:38:46.92242	2026-09-10 08:38:46.92242
1832	25	PRD-1789021016427-R1789029527072	115.8000	115.8000	available	2026-09-10 08:38:47.073504	2026-09-10 08:38:47.073504
1833	25	PRD-1789021016427-R1789029527191	94.4000	94.4000	available	2026-09-10 08:38:47.192426	2026-09-10 08:38:47.192426
1837	25	PRD-1789021016427-R1789029527735	111.4000	111.4000	available	2026-09-10 08:38:47.737188	2026-09-10 08:38:47.737188
1838	25	PRD-1789021016427-R1789029527867	111.3000	111.3000	available	2026-09-10 08:38:47.868366	2026-09-10 08:38:47.868366
1839	25	PRD-1789021016427-R1789029528050	114.6000	114.6000	available	2026-09-10 08:38:48.052222	2026-09-10 08:38:48.052222
1841	25	PRD-1789021016427-R1789029528369	117.0000	117.0000	available	2026-09-10 08:38:48.370445	2026-09-10 08:38:48.370445
1843	25	PRD-1789021016427-R1789029528618	118.3000	118.3000	available	2026-09-10 08:38:48.619924	2026-09-10 08:38:48.619924
1844	25	PRD-1789021016427-R1789029528744	117.0000	117.0000	available	2026-09-10 08:38:48.746944	2026-09-10 08:38:48.746944
1854	25	PRD-1789021016427-R1789029530185	119.2000	119.2000	available	2026-09-10 08:38:50.186181	2026-09-10 08:38:50.186181
1855	25	PRD-1789021016427-R1789029530349	122.4000	122.4000	available	2026-09-10 08:38:50.350682	2026-09-10 08:38:50.350682
1856	25	PRD-1789021016427-R1789029530527	117.3000	117.3000	available	2026-09-10 08:38:50.527986	2026-09-10 08:38:50.527986
1863	25	PRD-1789021016427-R1789029532376	129.0000	129.0000	available	2026-09-10 08:38:52.377183	2026-09-10 08:38:52.377183
1870	25	PRD-1789021016427-R1789029533471	117.6000	117.6000	available	2026-09-10 08:38:53.473623	2026-09-10 08:38:53.473623
1874	25	PRD-1789021016427-R1789029534093	114.0000	114.0000	available	2026-09-10 08:38:54.095505	2026-09-10 08:38:54.095505
1875	25	PRD-1789021016427-R1789029534251	112.7000	112.7000	available	2026-09-10 08:38:54.252915	2026-09-10 08:38:54.252915
1876	25	PRD-1789021016427-R1789029534363	111.8000	111.8000	available	2026-09-10 08:38:54.365187	2026-09-10 08:38:54.365187
1887	25	PRD-1789021016427-R1789029536163	115.0000	115.0000	available	2026-09-10 08:38:56.164809	2026-09-10 08:38:56.164809
1888	25	PRD-1789021016427-R1789029536352	115.0000	115.0000	available	2026-09-10 08:38:56.354021	2026-09-10 08:38:56.354021
1889	25	PRD-1789021016427-R1789029536537	110.1000	110.1000	available	2026-09-10 08:38:56.538293	2026-09-10 08:38:56.538293
1903	25	PRD-1789021016427-R1789029538736	116.1000	116.1000	available	2026-09-10 08:38:58.737553	2026-09-10 08:38:58.737553
1925	25	PRD-1789021016427-R1789029542425	118.3000	118.3000	available	2026-09-10 08:39:02.428481	2026-09-10 08:39:02.428481
1927	25	PRD-1789021016427-R1789029542748	113.3000	113.3000	available	2026-09-10 08:39:02.753469	2026-09-10 08:39:02.753469
1928	25	PRD-1789021016427-R1789029542928	121.3000	121.3000	available	2026-09-10 08:39:02.931448	2026-09-10 08:39:02.931448
2072	23	PRD-1789020510805-R1789031551942	127.4000	127.4000	available	2026-09-10 09:12:31.943781	2026-09-10 09:12:31.943781
2073	23	PRD-1789020510805-R1789031552116	120.0000	120.0000	available	2026-09-10 09:12:32.117844	2026-09-10 09:12:32.117844
2083	23	PRD-1789020510805-R1789031554091	117.4000	117.4000	available	2026-09-10 09:12:34.092878	2026-09-10 09:12:34.092878
2084	23	PRD-1789020510805-R1789031554318	120.0000	120.0000	available	2026-09-10 09:12:34.320173	2026-09-10 09:12:34.320173
2085	23	PRD-1789020510805-R1789031554500	120.0000	120.0000	available	2026-09-10 09:12:34.501432	2026-09-10 09:12:34.501432
2086	23	PRD-1789020510805-R1789031554678	119.0000	119.0000	available	2026-09-10 09:12:34.680221	2026-09-10 09:12:34.680221
2090	23	PRD-1789020510805-R1789031555498	98.5000	98.5000	available	2026-09-10 09:12:35.499558	2026-09-10 09:12:35.499558
2094	23	PRD-1789020510805-R1789031556469	114.4000	114.4000	available	2026-09-10 09:12:36.470351	2026-09-10 09:12:36.470351
2149	26	PRD-1789021819488-R1789031979618	109.1000	109.1000	available	2026-09-10 09:19:39.620249	2026-09-10 09:19:39.620249
2152	26	PRD-1789021819488-R1789031980228	129.6000	129.6000	available	2026-09-10 09:19:40.23002	2026-09-10 09:19:40.23002
2153	26	PRD-1789021819488-R1789031980432	123.0000	123.0000	available	2026-09-10 09:19:40.432866	2026-09-10 09:19:40.432866
2154	26	PRD-1789021819488-R1789031980624	126.4000	126.4000	available	2026-09-10 09:19:40.627357	2026-09-10 09:19:40.627357
2157	26	PRD-1789021819488-R1789031981334	110.9000	110.9000	available	2026-09-10 09:19:41.336625	2026-09-10 09:19:41.336625
2158	26	PRD-1789021819488-R1789031981544	118.3000	118.3000	available	2026-09-10 09:19:41.546111	2026-09-10 09:19:41.546111
2159	26	PRD-1789021819488-R1789031981779	116.1000	116.1000	available	2026-09-10 09:19:41.78062	2026-09-10 09:19:41.78062
2160	26	PRD-1789021819488-R1789031982002	138.0000	138.0000	available	2026-09-10 09:19:42.003184	2026-09-10 09:19:42.003184
2166	26	PRD-1789021819488-R1789031983412	127.5000	127.5000	available	2026-09-10 09:19:43.41332	2026-09-10 09:19:43.41332
2167	26	PRD-1789021819488-R1789031983593	117.6000	117.6000	available	2026-09-10 09:19:43.594702	2026-09-10 09:19:43.594702
780	7	PRD-1789018404302-R1789024151267	114.1000	114.1000	available	2026-09-10 07:09:11.269419	2026-09-10 07:09:11.269419
781	7	PRD-1789018404302-R1789024151605	114.0000	114.0000	available	2026-09-10 07:09:11.606391	2026-09-10 07:09:11.606391
782	7	PRD-1789018404302-R1789024151972	140.3000	140.3000	available	2026-09-10 07:09:11.97412	2026-09-10 07:09:11.97412
783	7	PRD-1789018404302-R1789024152334	127.0000	127.0000	available	2026-09-10 07:09:12.335592	2026-09-10 07:09:12.335592
784	7	PRD-1789018404302-R1789024152723	101.0000	101.0000	available	2026-09-10 07:09:12.724643	2026-09-10 07:09:12.724643
789	7	PRD-1789018404302-R1789024154534	122.3000	122.3000	available	2026-09-10 07:09:14.536378	2026-09-10 07:09:14.536378
1328	28	PRD-1789024618261-R1789026337367	69.0000	69.0000	available	2026-09-10 07:45:37.36932	2026-09-10 07:45:37.36932
1331	28	PRD-1789024618261-R1789026337662	74.0000	74.0000	available	2026-09-10 07:45:37.664179	2026-09-10 07:45:37.664179
1335	28	PRD-1789024618261-R1789026338023	57.0000	57.0000	available	2026-09-10 07:45:38.024833	2026-09-10 07:45:38.024833
1432	7	PRD-1789018404302-R1789027719842	107.0000	107.0000	available	2026-09-10 08:08:39.844311	2026-09-10 08:08:39.844311
1433	7	PRD-1789018404302-R1789027720052	122.0000	122.0000	available	2026-09-10 08:08:40.053981	2026-09-10 08:08:40.053981
1434	7	PRD-1789018404302-R1789027720304	123.7000	123.7000	available	2026-09-10 08:08:40.306905	2026-09-10 08:08:40.306905
1435	7	PRD-1789018404302-R1789027720583	108.0000	108.0000	available	2026-09-10 08:08:40.58469	2026-09-10 08:08:40.58469
1437	7	PRD-1789018404302-R1789027721265	120.3000	120.3000	available	2026-09-10 08:08:41.275268	2026-09-10 08:08:41.275268
1439	7	PRD-1789018404302-R1789027721711	124.0000	124.0000	available	2026-09-10 08:08:41.712825	2026-09-10 08:08:41.712825
1440	7	PRD-1789018404302-R1789027721981	120.4000	120.4000	available	2026-09-10 08:08:41.982658	2026-09-10 08:08:41.982658
1442	7	PRD-1789018404302-R1789027722495	120.2000	120.2000	available	2026-09-10 08:08:42.496718	2026-09-10 08:08:42.496718
1444	7	PRD-1789018404302-R1789027723089	120.3000	120.3000	available	2026-09-10 08:08:43.093638	2026-09-10 08:08:43.093638
1445	7	PRD-1789018404302-R1789027723360	120.0000	120.0000	available	2026-09-10 08:08:43.362319	2026-09-10 08:08:43.362319
1460	7	PRD-1789018404302-R1789027727836	120.4000	120.4000	available	2026-09-10 08:08:47.837616	2026-09-10 08:08:47.837616
1461	7	PRD-1789018404302-R1789027728130	101.9000	101.9000	available	2026-09-10 08:08:48.131451	2026-09-10 08:08:48.131451
1462	7	PRD-1789018404302-R1789027728394	94.0000	94.0000	available	2026-09-10 08:08:48.396601	2026-09-10 08:08:48.396601
1464	7	PRD-1789018404302-R1789027748430	115.2000	115.2000	available	2026-09-10 08:09:08.431858	2026-09-10 08:09:08.431858
1465	7	PRD-1789018404302-R1789027748643	79.2000	79.2000	available	2026-09-10 08:09:08.644921	2026-09-10 08:09:08.644921
1466	7	PRD-1789018404302-R1789027748876	120.4000	120.4000	available	2026-09-10 08:09:08.877436	2026-09-10 08:09:08.877436
1469	7	PRD-1789018404302-R1789027764965	119.4000	119.4000	available	2026-09-10 08:09:24.968642	2026-09-10 08:09:24.968642
1470	7	PRD-1789018404302-R1789027765228	123.3000	123.3000	available	2026-09-10 08:09:25.229042	2026-09-10 08:09:25.229042
1616	24	PRD-1789020615250-R1789028479998	110.8000	110.8000	available	2026-09-10 08:21:19.999387	2026-09-10 08:21:19.999387
1617	24	PRD-1789020615250-R1789028480044	117.6000	117.6000	available	2026-09-10 08:21:20.04542	2026-09-10 08:21:20.04542
1619	13	PRD-1789018725877-R1789028678996	98.9000	98.9000	available	2026-09-10 08:24:38.998519	2026-09-10 08:24:38.998519
1620	13	PRD-1789018725877-R1789028679062	121.0000	121.0000	available	2026-09-10 08:24:39.064032	2026-09-10 08:24:39.064032
1621	13	PRD-1789018725877-R1789028679163	112.8000	112.8000	available	2026-09-10 08:24:39.166786	2026-09-10 08:24:39.166786
1622	13	PRD-1789018725877-R1789028679227	121.7000	121.7000	available	2026-09-10 08:24:39.229356	2026-09-10 08:24:39.229356
1829	25	PRD-1789021016427-R1789029526630	111.8000	111.8000	available	2026-09-10 08:38:46.632121	2026-09-10 08:38:46.632121
1845	25	PRD-1789021016427-R1789029528894	108.8000	108.8000	available	2026-09-10 08:38:48.895666	2026-09-10 08:38:48.895666
1847	25	PRD-1789021016427-R1789029529183	120.5000	120.5000	available	2026-09-10 08:38:49.185463	2026-09-10 08:38:49.185463
1848	25	PRD-1789021016427-R1789029529329	117.0000	117.0000	available	2026-09-10 08:38:49.331545	2026-09-10 08:38:49.331545
1858	25	PRD-1789021016427-R1789029531633	96.4000	96.4000	available	2026-09-10 08:38:51.636352	2026-09-10 08:38:51.636352
1859	25	PRD-1789021016427-R1789029531784	117.1000	117.1000	available	2026-09-10 08:38:51.785538	2026-09-10 08:38:51.785538
1860	25	PRD-1789021016427-R1789029531906	110.0000	110.0000	available	2026-09-10 08:38:51.907028	2026-09-10 08:38:51.907028
1861	25	PRD-1789021016427-R1789029532055	113.4000	113.4000	available	2026-09-10 08:38:52.055886	2026-09-10 08:38:52.055886
1864	25	PRD-1789021016427-R1789029532499	116.5000	116.5000	available	2026-09-10 08:38:52.500667	2026-09-10 08:38:52.500667
1865	25	PRD-1789021016427-R1789029532671	113.0000	113.0000	available	2026-09-10 08:38:52.672506	2026-09-10 08:38:52.672506
1866	25	PRD-1789021016427-R1789029532829	118.5000	118.5000	available	2026-09-10 08:38:52.830278	2026-09-10 08:38:52.830278
1867	25	PRD-1789021016427-R1789029533001	118.7000	118.7000	available	2026-09-10 08:38:53.002825	2026-09-10 08:38:53.002825
1881	25	PRD-1789021016427-R1789029535176	127.7000	127.7000	available	2026-09-10 08:38:55.177273	2026-09-10 08:38:55.177273
1882	25	PRD-1789021016427-R1789029535331	122.0000	122.0000	available	2026-09-10 08:38:55.332846	2026-09-10 08:38:55.332846
1883	25	PRD-1789021016427-R1789029535500	118.0000	118.0000	available	2026-09-10 08:38:55.503027	2026-09-10 08:38:55.503027
1884	25	PRD-1789021016427-R1789029535672	116.6000	116.6000	available	2026-09-10 08:38:55.674536	2026-09-10 08:38:55.674536
1885	25	PRD-1789021016427-R1789029535824	116.2000	116.2000	available	2026-09-10 08:38:55.826935	2026-09-10 08:38:55.826935
1886	25	PRD-1789021016427-R1789029535990	118.4000	118.4000	available	2026-09-10 08:38:55.991172	2026-09-10 08:38:55.991172
1890	25	PRD-1789021016427-R1789029536699	117.3000	117.3000	available	2026-09-10 08:38:56.701027	2026-09-10 08:38:56.701027
1891	25	PRD-1789021016427-R1789029536858	120.0000	120.0000	available	2026-09-10 08:38:56.860562	2026-09-10 08:38:56.860562
1892	25	PRD-1789021016427-R1789029537039	116.6000	116.6000	available	2026-09-10 08:38:57.040587	2026-09-10 08:38:57.040587
1896	25	PRD-1789021016427-R1789029537654	133.3000	133.3000	available	2026-09-10 08:38:57.654838	2026-09-10 08:38:57.654838
1899	25	PRD-1789021016427-R1789029538157	119.1000	119.1000	available	2026-09-10 08:38:58.158563	2026-09-10 08:38:58.158563
1904	25	PRD-1789021016427-R1789029538931	116.8000	116.8000	available	2026-09-10 08:38:58.936485	2026-09-10 08:38:58.936485
1905	25	PRD-1789021016427-R1789029539086	118.6000	118.6000	available	2026-09-10 08:38:59.087596	2026-09-10 08:38:59.087596
1906	25	PRD-1789021016427-R1789029539252	117.6000	117.6000	available	2026-09-10 08:38:59.253219	2026-09-10 08:38:59.253219
1907	25	PRD-1789021016427-R1789029539430	110.0000	110.0000	available	2026-09-10 08:38:59.432048	2026-09-10 08:38:59.432048
1909	25	PRD-1789021016427-R1789029539784	110.8000	110.8000	available	2026-09-10 08:38:59.787014	2026-09-10 08:38:59.787014
1910	25	PRD-1789021016427-R1789029539914	103.0000	103.0000	available	2026-09-10 08:38:59.91534	2026-09-10 08:38:59.91534
1916	25	PRD-1789021016427-R1789029540894	115.2000	115.2000	available	2026-09-10 08:39:00.89546	2026-09-10 08:39:00.89546
1917	25	PRD-1789021016427-R1789029541043	101.0000	101.0000	available	2026-09-10 08:39:01.043958	2026-09-10 08:39:01.043958
1924	25	PRD-1789021016427-R1789029542277	96.4000	96.4000	available	2026-09-10 08:39:02.279215	2026-09-10 08:39:02.279215
1930	25	PRD-1789021016427-R1789029543315	121.3000	121.3000	available	2026-09-10 08:39:03.316786	2026-09-10 08:39:03.316786
1931	25	PRD-1789021016427-R1789029543429	121.3000	121.3000	available	2026-09-10 08:39:03.430869	2026-09-10 08:39:03.430869
1932	25	PRD-1789021016427-R1789029543628	105.4000	105.4000	available	2026-09-10 08:39:03.629546	2026-09-10 08:39:03.629546
1933	51	PRD-1789029511477-R1789029595652	125.7000	125.7000	available	2026-09-10 08:39:55.653262	2026-09-10 08:39:55.653262
1934	51	PRD-1789029511477-R1789029595728	118.7000	118.7000	available	2026-09-10 08:39:55.72933	2026-09-10 08:39:55.72933
1935	51	PRD-1789029511477-R1789029595814	118.1000	118.1000	available	2026-09-10 08:39:55.815874	2026-09-10 08:39:55.815874
785	7	PRD-1789018404302-R1789024153083	103.2000	103.2000	available	2026-09-10 07:09:13.084421	2026-09-10 07:09:13.084421
786	7	PRD-1789018404302-R1789024153466	109.7000	109.7000	available	2026-09-10 07:09:13.467377	2026-09-10 07:09:13.467377
787	7	PRD-1789018404302-R1789024153834	123.5000	123.5000	available	2026-09-10 07:09:13.835834	2026-09-10 07:09:13.835834
790	7	PRD-1789018404302-R1789024154880	117.6000	117.6000	available	2026-09-10 07:09:14.881984	2026-09-10 07:09:14.881984
793	7	PRD-1789018404302-R1789024155885	121.7000	121.7000	available	2026-09-10 07:09:15.888931	2026-09-10 07:09:15.888931
794	7	PRD-1789018404302-R1789024156220	115.0000	115.0000	available	2026-09-10 07:09:16.221126	2026-09-10 07:09:16.221126
795	7	PRD-1789018404302-R1789024156635	120.0000	120.0000	available	2026-09-10 07:09:16.637348	2026-09-10 07:09:16.637348
797	7	PRD-1789018404302-R1789024270679	120.4000	120.4000	available	2026-09-10 07:11:10.680499	2026-09-10 07:11:10.680499
798	7	PRD-1789018404302-R1789024271049	120.3000	120.3000	available	2026-09-10 07:11:11.049868	2026-09-10 07:11:11.049868
799	7	PRD-1789018404302-R1789024271414	120.3000	120.3000	available	2026-09-10 07:11:11.421654	2026-09-10 07:11:11.421654
800	7	PRD-1789018404302-R1789024271800	120.2000	120.2000	available	2026-09-10 07:11:11.802171	2026-09-10 07:11:11.802171
801	7	PRD-1789018404302-R1789024272156	120.4000	120.4000	available	2026-09-10 07:11:12.157348	2026-09-10 07:11:12.157348
802	7	PRD-1789018404302-R1789024272533	120.3000	120.3000	available	2026-09-10 07:11:12.53505	2026-09-10 07:11:12.53505
803	7	PRD-1789018404302-R1789024272938	120.2000	120.2000	available	2026-09-10 07:11:12.939666	2026-09-10 07:11:12.939666
804	7	PRD-1789018404302-R1789024273304	120.4000	120.4000	available	2026-09-10 07:11:13.306193	2026-09-10 07:11:13.306193
805	7	PRD-1789018404302-R1789024273657	120.2000	120.2000	available	2026-09-10 07:11:13.660283	2026-09-10 07:11:13.660283
806	7	PRD-1789018404302-R1789024274038	120.0000	120.0000	available	2026-09-10 07:11:14.039109	2026-09-10 07:11:14.039109
807	7	PRD-1789018404302-R1789024274423	120.0000	120.0000	available	2026-09-10 07:11:14.434506	2026-09-10 07:11:14.434506
808	7	PRD-1789018404302-R1789024274836	120.3000	120.3000	available	2026-09-10 07:11:14.838579	2026-09-10 07:11:14.838579
809	7	PRD-1789018404302-R1789024275332	120.0000	120.0000	available	2026-09-10 07:11:15.333731	2026-09-10 07:11:15.333731
810	7	PRD-1789018404302-R1789024275731	120.3000	120.3000	available	2026-09-10 07:11:15.732493	2026-09-10 07:11:15.732493
811	7	PRD-1789018404302-R1789024276087	120.3000	120.3000	available	2026-09-10 07:11:16.089052	2026-09-10 07:11:16.089052
812	7	PRD-1789018404302-R1789024276453	120.4000	120.4000	available	2026-09-10 07:11:16.454138	2026-09-10 07:11:16.454138
813	7	PRD-1789018404302-R1789024276802	120.0000	120.0000	available	2026-09-10 07:11:16.803384	2026-09-10 07:11:16.803384
814	7	PRD-1789018404302-R1789024277235	120.5000	120.5000	available	2026-09-10 07:11:17.23697	2026-09-10 07:11:17.23697
815	7	PRD-1789018404302-R1789024277582	120.4000	120.4000	available	2026-09-10 07:11:17.583183	2026-09-10 07:11:17.583183
816	7	PRD-1789018404302-R1789024277979	120.3600	120.3600	available	2026-09-10 07:11:17.981362	2026-09-10 07:11:17.981362
817	7	PRD-1789018404302-R1789024278317	112.9000	112.9000	available	2026-09-10 07:11:18.319256	2026-09-10 07:11:18.319256
818	7	PRD-1789018404302-R1789024278715	113.9000	113.9000	available	2026-09-10 07:11:18.716099	2026-09-10 07:11:18.716099
819	7	PRD-1789018404302-R1789024279072	118.0000	118.0000	available	2026-09-10 07:11:19.074395	2026-09-10 07:11:19.074395
820	7	PRD-1789018404302-R1789024279512	110.5000	110.5000	available	2026-09-10 07:11:19.512992	2026-09-10 07:11:19.512992
821	7	PRD-1789018404302-R1789024279899	115.2000	115.2000	available	2026-09-10 07:11:19.900703	2026-09-10 07:11:19.900703
822	7	PRD-1789018404302-R1789024280322	119.0000	119.0000	available	2026-09-10 07:11:20.324088	2026-09-10 07:11:20.324088
823	7	PRD-1789018404302-R1789024280719	124.6000	124.6000	available	2026-09-10 07:11:20.720793	2026-09-10 07:11:20.720793
824	7	PRD-1789018404302-R1789024281108	112.0000	112.0000	available	2026-09-10 07:11:21.116134	2026-09-10 07:11:21.116134
825	7	PRD-1789018404302-R1789024281508	115.8000	115.8000	available	2026-09-10 07:11:21.509801	2026-09-10 07:11:21.509801
826	7	PRD-1789018404302-R1789024281884	122.8000	122.8000	available	2026-09-10 07:11:21.884705	2026-09-10 07:11:21.884705
827	7	PRD-1789018404302-R1789024282294	117.1000	117.1000	available	2026-09-10 07:11:22.296455	2026-09-10 07:11:22.296455
828	7	PRD-1789018404302-R1789024282573	121.0000	121.0000	available	2026-09-10 07:11:22.574622	2026-09-10 07:11:22.574622
830	27	PRD-1789024316748-R1789024553601	114.0000	114.0000	available	2026-09-10 07:15:53.602306	2026-09-10 07:15:53.602306
831	27	PRD-1789024316748-R1789024553903	113.9000	113.9000	available	2026-09-10 07:15:53.90512	2026-09-10 07:15:53.90512
832	27	PRD-1789024316748-R1789024554230	113.9000	113.9000	available	2026-09-10 07:15:54.231205	2026-09-10 07:15:54.231205
833	27	PRD-1789024316748-R1789024554543	107.0000	107.0000	available	2026-09-10 07:15:54.544809	2026-09-10 07:15:54.544809
834	27	PRD-1789024316748-R1789024554870	113.9000	113.9000	available	2026-09-10 07:15:54.871505	2026-09-10 07:15:54.871505
835	27	PRD-1789024316748-R1789024555204	113.8000	113.8000	available	2026-09-10 07:15:55.206837	2026-09-10 07:15:55.206837
836	27	PRD-1789024316748-R1789024555533	113.8000	113.8000	available	2026-09-10 07:15:55.535027	2026-09-10 07:15:55.535027
837	27	PRD-1789024316748-R1789024555851	114.9000	114.9000	available	2026-09-10 07:15:55.852996	2026-09-10 07:15:55.852996
838	27	PRD-1789024316748-R1789024556192	98.9000	98.9000	available	2026-09-10 07:15:56.19365	2026-09-10 07:15:56.19365
839	27	PRD-1789024316748-R1789024556515	113.1000	113.1000	available	2026-09-10 07:15:56.516437	2026-09-10 07:15:56.516437
840	27	PRD-1789024316748-R1789024556822	113.5000	113.5000	available	2026-09-10 07:15:56.824359	2026-09-10 07:15:56.824359
841	27	PRD-1789024316748-R1789024557170	115.9000	115.9000	available	2026-09-10 07:15:57.172228	2026-09-10 07:15:57.172228
842	27	PRD-1789024316748-R1789024557506	112.7000	112.7000	available	2026-09-10 07:15:57.507195	2026-09-10 07:15:57.507195
843	27	PRD-1789024316748-R1789024557819	101.0000	101.0000	available	2026-09-10 07:15:57.820989	2026-09-10 07:15:57.820989
844	27	PRD-1789024316748-R1789024558138	115.5000	115.5000	available	2026-09-10 07:15:58.139616	2026-09-10 07:15:58.139616
845	27	PRD-1789024316748-R1789024558496	116.3000	116.3000	available	2026-09-10 07:15:58.498277	2026-09-10 07:15:58.498277
846	27	PRD-1789024316748-R1789024558771	106.9000	106.9000	available	2026-09-10 07:15:58.772097	2026-09-10 07:15:58.772097
847	27	PRD-1789024316748-R1789024559100	111.7000	111.7000	available	2026-09-10 07:15:59.104039	2026-09-10 07:15:59.104039
848	27	PRD-1789024316748-R1789024559456	114.0000	114.0000	available	2026-09-10 07:15:59.45725	2026-09-10 07:15:59.45725
849	27	PRD-1789024316748-R1789024559761	113.3000	113.3000	available	2026-09-10 07:15:59.762787	2026-09-10 07:15:59.762787
850	27	PRD-1789024316748-R1789024560062	103.0000	103.0000	available	2026-09-10 07:16:00.06362	2026-09-10 07:16:00.06362
851	27	PRD-1789024316748-R1789024560352	112.3000	112.3000	available	2026-09-10 07:16:00.353623	2026-09-10 07:16:00.353623
852	27	PRD-1789024316748-R1789024560654	113.7000	113.7000	available	2026-09-10 07:16:00.655829	2026-09-10 07:16:00.655829
853	27	PRD-1789024316748-R1789024561259	107.7000	107.7000	available	2026-09-10 07:16:01.260568	2026-09-10 07:16:01.260568
854	27	PRD-1789024316748-R1789024561583	113.9000	113.9000	available	2026-09-10 07:16:01.584588	2026-09-10 07:16:01.584588
855	27	PRD-1789024316748-R1789024561908	113.9000	113.9000	available	2026-09-10 07:16:01.90968	2026-09-10 07:16:01.90968
856	27	PRD-1789024316748-R1789024562225	115.1000	115.1000	available	2026-09-10 07:16:02.227243	2026-09-10 07:16:02.227243
857	27	PRD-1789024316748-R1789024562531	113.9000	113.9000	available	2026-09-10 07:16:02.533924	2026-09-10 07:16:02.533924
858	27	PRD-1789024316748-R1789024562852	113.9000	113.9000	available	2026-09-10 07:16:02.854483	2026-09-10 07:16:02.854483
859	27	PRD-1789024316748-R1789024563167	113.9000	113.9000	available	2026-09-10 07:16:03.168998	2026-09-10 07:16:03.168998
860	27	PRD-1789024316748-R1789024563478	114.5000	114.5000	available	2026-09-10 07:16:03.479694	2026-09-10 07:16:03.479694
861	27	PRD-1789024316748-R1789024563793	113.9000	113.9000	available	2026-09-10 07:16:03.793904	2026-09-10 07:16:03.793904
862	27	PRD-1789024316748-R1789024564121	113.9000	113.9000	available	2026-09-10 07:16:04.122593	2026-09-10 07:16:04.122593
1330	28	PRD-1789024618261-R1789026337579	62.0000	62.0000	available	2026-09-10 07:45:37.581652	2026-09-10 07:45:37.581652
1333	28	PRD-1789024618261-R1789026337843	77.0000	77.0000	available	2026-09-10 07:45:37.844824	2026-09-10 07:45:37.844824
1436	7	PRD-1789018404302-R1789027720936	127.0000	127.0000	available	2026-09-10 08:08:40.938022	2026-09-10 08:08:40.938022
1441	7	PRD-1789018404302-R1789027722228	120.0000	120.0000	available	2026-09-10 08:08:42.229979	2026-09-10 08:08:42.229979
1447	7	PRD-1789018404302-R1789027724018	120.2000	120.2000	available	2026-09-10 08:08:44.020047	2026-09-10 08:08:44.020047
1448	7	PRD-1789018404302-R1789027724323	120.3000	120.3000	available	2026-09-10 08:08:44.33195	2026-09-10 08:08:44.33195
1449	7	PRD-1789018404302-R1789027724568	120.3000	120.3000	available	2026-09-10 08:08:44.569429	2026-09-10 08:08:44.569429
1450	7	PRD-1789018404302-R1789027724828	120.5000	120.5000	available	2026-09-10 08:08:44.830223	2026-09-10 08:08:44.830223
1451	7	PRD-1789018404302-R1789027725369	120.0000	120.0000	available	2026-09-10 08:08:45.370374	2026-09-10 08:08:45.370374
1452	7	PRD-1789018404302-R1789027725584	120.0000	120.0000	available	2026-09-10 08:08:45.588492	2026-09-10 08:08:45.588492
1453	7	PRD-1789018404302-R1789027725846	120.3000	120.3000	available	2026-09-10 08:08:45.847335	2026-09-10 08:08:45.847335
1454	7	PRD-1789018404302-R1789027726122	96.4000	96.4000	available	2026-09-10 08:08:46.123431	2026-09-10 08:08:46.123431
1455	7	PRD-1789018404302-R1789027726391	120.3000	120.3000	available	2026-09-10 08:08:46.39319	2026-09-10 08:08:46.39319
1456	7	PRD-1789018404302-R1789027726646	120.3000	120.3000	available	2026-09-10 08:08:46.647652	2026-09-10 08:08:46.647652
1458	7	PRD-1789018404302-R1789027727259	120.4000	120.4000	available	2026-09-10 08:08:47.260739	2026-09-10 08:08:47.260739
1459	7	PRD-1789018404302-R1789027727573	120.0000	120.0000	available	2026-09-10 08:08:47.575071	2026-09-10 08:08:47.575071
1463	7	PRD-1789018404302-R1789027728715	112.3000	112.3000	available	2026-09-10 08:08:48.716136	2026-09-10 08:08:48.716136
1618	24	PRD-1789020615250-R1789028480215	91.4000	91.4000	available	2026-09-10 08:21:20.216972	2026-09-10 08:21:20.216972
1830	25	PRD-1789021016427-R1789029526783	100.9000	100.9000	available	2026-09-10 08:38:46.785082	2026-09-10 08:38:46.785082
1834	25	PRD-1789021016427-R1789029527301	115.7000	115.7000	available	2026-09-10 08:38:47.303397	2026-09-10 08:38:47.303397
1835	25	PRD-1789021016427-R1789029527442	116.7000	116.7000	available	2026-09-10 08:38:47.443671	2026-09-10 08:38:47.443671
1836	25	PRD-1789021016427-R1789029527589	121.3000	121.3000	available	2026-09-10 08:38:47.592169	2026-09-10 08:38:47.592169
1840	25	PRD-1789021016427-R1789029528207	117.4000	117.4000	available	2026-09-10 08:38:48.209179	2026-09-10 08:38:48.209179
1842	25	PRD-1789021016427-R1789029528485	112.7000	112.7000	available	2026-09-10 08:38:48.486521	2026-09-10 08:38:48.486521
1846	25	PRD-1789021016427-R1789029529047	116.8000	116.8000	available	2026-09-10 08:38:49.048594	2026-09-10 08:38:49.048594
1849	25	PRD-1789021016427-R1789029529464	120.0000	120.0000	available	2026-09-10 08:38:49.465037	2026-09-10 08:38:49.465037
1850	25	PRD-1789021016427-R1789029529614	118.0000	118.0000	available	2026-09-10 08:38:49.615455	2026-09-10 08:38:49.615455
1851	25	PRD-1789021016427-R1789029529722	118.1000	118.1000	available	2026-09-10 08:38:49.723333	2026-09-10 08:38:49.723333
1852	25	PRD-1789021016427-R1789029529841	118.0000	118.0000	available	2026-09-10 08:38:49.842492	2026-09-10 08:38:49.842492
1853	25	PRD-1789021016427-R1789029530003	118.5000	118.5000	available	2026-09-10 08:38:50.004544	2026-09-10 08:38:50.004544
1857	25	PRD-1789021016427-R1789029531464	115.2000	115.2000	available	2026-09-10 08:38:51.465732	2026-09-10 08:38:51.465732
1862	25	PRD-1789021016427-R1789029532230	119.1000	119.1000	available	2026-09-10 08:38:52.232299	2026-09-10 08:38:52.232299
1868	25	PRD-1789021016427-R1789029533165	116.6000	116.6000	available	2026-09-10 08:38:53.166992	2026-09-10 08:38:53.166992
1869	25	PRD-1789021016427-R1789029533308	108.0000	108.0000	available	2026-09-10 08:38:53.309265	2026-09-10 08:38:53.309265
1871	25	PRD-1789021016427-R1789029533627	129.2000	129.2000	available	2026-09-10 08:38:53.629683	2026-09-10 08:38:53.629683
1872	25	PRD-1789021016427-R1789029533784	115.5000	115.5000	available	2026-09-10 08:38:53.785814	2026-09-10 08:38:53.785814
1873	25	PRD-1789021016427-R1789029533942	116.2000	116.2000	available	2026-09-10 08:38:53.943659	2026-09-10 08:38:53.943659
1877	25	PRD-1789021016427-R1789029534586	103.0000	103.0000	available	2026-09-10 08:38:54.589828	2026-09-10 08:38:54.589828
1878	25	PRD-1789021016427-R1789029534745	116.8000	116.8000	available	2026-09-10 08:38:54.747114	2026-09-10 08:38:54.747114
1879	25	PRD-1789021016427-R1789029534858	116.0000	116.0000	available	2026-09-10 08:38:54.859515	2026-09-10 08:38:54.859515
1880	25	PRD-1789021016427-R1789029535024	123.1000	123.1000	available	2026-09-10 08:38:55.025497	2026-09-10 08:38:55.025497
1893	25	PRD-1789021016427-R1789029537220	118.8000	118.8000	available	2026-09-10 08:38:57.221315	2026-09-10 08:38:57.221315
1894	25	PRD-1789021016427-R1789029537379	117.0000	117.0000	available	2026-09-10 08:38:57.380581	2026-09-10 08:38:57.380581
1895	25	PRD-1789021016427-R1789029537514	108.2000	108.2000	available	2026-09-10 08:38:57.514966	2026-09-10 08:38:57.514966
1897	25	PRD-1789021016427-R1789029537822	121.2000	121.2000	available	2026-09-10 08:38:57.823109	2026-09-10 08:38:57.823109
1898	25	PRD-1789021016427-R1789029537988	114.7000	114.7000	available	2026-09-10 08:38:57.98902	2026-09-10 08:38:57.98902
1900	25	PRD-1789021016427-R1789029538310	116.0000	116.0000	available	2026-09-10 08:38:58.311412	2026-09-10 08:38:58.311412
1901	25	PRD-1789021016427-R1789029538442	121.3000	121.3000	available	2026-09-10 08:38:58.443186	2026-09-10 08:38:58.443186
1902	25	PRD-1789021016427-R1789029538590	124.9000	124.9000	available	2026-09-10 08:38:58.591641	2026-09-10 08:38:58.591641
1908	25	PRD-1789021016427-R1789029539593	116.5000	116.5000	available	2026-09-10 08:38:59.59427	2026-09-10 08:38:59.59427
1911	25	PRD-1789021016427-R1789029540057	115.8000	115.8000	available	2026-09-10 08:39:00.0591	2026-09-10 08:39:00.0591
1912	25	PRD-1789021016427-R1789029540246	116.1000	116.1000	available	2026-09-10 08:39:00.248384	2026-09-10 08:39:00.248384
1913	25	PRD-1789021016427-R1789029540358	116.9000	116.9000	available	2026-09-10 08:39:00.359594	2026-09-10 08:39:00.359594
1914	25	PRD-1789021016427-R1789029540512	113.7000	113.7000	available	2026-09-10 08:39:00.513909	2026-09-10 08:39:00.513909
1915	25	PRD-1789021016427-R1789029540693	112.8000	112.8000	available	2026-09-10 08:39:00.694728	2026-09-10 08:39:00.694728
1918	25	PRD-1789021016427-R1789029541238	116.9000	116.9000	available	2026-09-10 08:39:01.239605	2026-09-10 08:39:01.239605
1919	25	PRD-1789021016427-R1789029541365	112.8000	112.8000	available	2026-09-10 08:39:01.366144	2026-09-10 08:39:01.366144
1920	25	PRD-1789021016427-R1789029541517	117.4000	117.4000	available	2026-09-10 08:39:01.51888	2026-09-10 08:39:01.51888
1921	25	PRD-1789021016427-R1789029541733	110.7000	110.7000	available	2026-09-10 08:39:01.734488	2026-09-10 08:39:01.734488
1922	25	PRD-1789021016427-R1789029541932	116.2000	116.2000	available	2026-09-10 08:39:01.932994	2026-09-10 08:39:01.932994
1923	25	PRD-1789021016427-R1789029542094	119.1000	119.1000	available	2026-09-10 08:39:02.095357	2026-09-10 08:39:02.095357
1926	25	PRD-1789021016427-R1789029542599	116.1000	116.1000	available	2026-09-10 08:39:02.599954	2026-09-10 08:39:02.599954
1929	25	PRD-1789021016427-R1789029543112	108.4000	108.4000	available	2026-09-10 08:39:03.113759	2026-09-10 08:39:03.113759
2074	23	PRD-1789020510805-R1789031552305	125.1000	125.1000	available	2026-09-10 09:12:32.306482	2026-09-10 09:12:32.306482
2075	23	PRD-1789020510805-R1789031552523	126.9000	126.9000	available	2026-09-10 09:12:32.52465	2026-09-10 09:12:32.52465
2076	23	PRD-1789020510805-R1789031552698	127.4000	127.4000	available	2026-09-10 09:12:32.702289	2026-09-10 09:12:32.702289
2078	23	PRD-1789020510805-R1789031553131	120.3000	120.3000	available	2026-09-10 09:12:33.132749	2026-09-10 09:12:33.132749
2087	23	PRD-1789020510805-R1789031554904	120.0000	120.0000	available	2026-09-10 09:12:34.907905	2026-09-10 09:12:34.907905
2089	23	PRD-1789020510805-R1789031555284	120.3000	120.3000	available	2026-09-10 09:12:35.286615	2026-09-10 09:12:35.286615
863	27	PRD-1789024316748-R1789024564413	110.9000	110.9000	available	2026-09-10 07:16:04.415502	2026-09-10 07:16:04.415502
865	27	PRD-1789024316748-R1789024565797	114.8000	114.8000	available	2026-09-10 07:16:05.799419	2026-09-10 07:16:05.799419
867	27	PRD-1789024316748-R1789024566386	111.9000	111.9000	available	2026-09-10 07:16:06.387922	2026-09-10 07:16:06.387922
871	27	PRD-1789024316748-R1789024567610	115.1000	115.1000	available	2026-09-10 07:16:07.613043	2026-09-10 07:16:07.613043
872	27	PRD-1789024316748-R1789024567892	115.9000	115.9000	available	2026-09-10 07:16:07.893075	2026-09-10 07:16:07.893075
874	27	PRD-1789024316748-R1789024568485	116.0000	116.0000	available	2026-09-10 07:16:08.48868	2026-09-10 07:16:08.48868
879	27	PRD-1789024316748-R1789024570001	113.4000	113.4000	available	2026-09-10 07:16:10.002098	2026-09-10 07:16:10.002098
880	27	PRD-1789024316748-R1789024570279	121.6000	121.6000	available	2026-09-10 07:16:10.282142	2026-09-10 07:16:10.282142
881	27	PRD-1789024316748-R1789024570562	108.0000	108.0000	available	2026-09-10 07:16:10.563339	2026-09-10 07:16:10.563339
883	27	PRD-1789024316748-R1789024571182	113.9000	113.9000	available	2026-09-10 07:16:11.185535	2026-09-10 07:16:11.185535
884	27	PRD-1789024316748-R1789024571482	96.8000	96.8000	available	2026-09-10 07:16:11.483498	2026-09-10 07:16:11.483498
885	27	PRD-1789024316748-R1789024571811	113.7000	113.7000	available	2026-09-10 07:16:11.814427	2026-09-10 07:16:11.814427
1336	37	PRD-1789026369751-R1789026405962	134.8000	134.8000	available	2026-09-10 07:46:45.964577	2026-09-10 07:46:45.964577
1338	28	PRD-1789024618261-R1789026531265	62.0000	62.0000	available	2026-09-10 07:48:51.266198	2026-09-10 07:48:51.266198
1339	28	PRD-1789024618261-R1789026531381	63.0000	63.0000	available	2026-09-10 07:48:51.383117	2026-09-10 07:48:51.383117
1340	28	PRD-1789024618261-R1789026531440	70.0000	70.0000	available	2026-09-10 07:48:51.441371	2026-09-10 07:48:51.441371
1348	28	PRD-1789024618261-R1789026532395	65.0000	65.0000	available	2026-09-10 07:48:52.397148	2026-09-10 07:48:52.397148
1351	28	PRD-1789024618261-R1789026532711	85.0000	85.0000	available	2026-09-10 07:48:52.71317	2026-09-10 07:48:52.71317
1358	29	PRD-1789024785302-R1789026572056	66.0000	66.0000	available	2026-09-10 07:49:32.05806	2026-09-10 07:49:32.05806
1359	29	PRD-1789024785302-R1789026572148	51.0000	51.0000	available	2026-09-10 07:49:32.150078	2026-09-10 07:49:32.150078
1438	7	PRD-1789018404302-R1789027721501	113.1000	113.1000	available	2026-09-10 08:08:41.502743	2026-09-10 08:08:41.502743
1443	7	PRD-1789018404302-R1789027722825	120.3000	120.3000	available	2026-09-10 08:08:42.826876	2026-09-10 08:08:42.826876
1446	7	PRD-1789018404302-R1789027723695	120.0000	120.0000	available	2026-09-10 08:08:43.696738	2026-09-10 08:08:43.696738
1457	7	PRD-1789018404302-R1789027726919	120.4000	120.4000	available	2026-09-10 08:08:46.920651	2026-09-10 08:08:46.920651
1623	13	PRD-1789018725877-R1789028679323	126.0000	126.0000	available	2026-09-10 08:24:39.324497	2026-09-10 08:24:39.324497
1625	13	PRD-1789018725877-R1789028679508	122.4000	122.4000	available	2026-09-10 08:24:39.510104	2026-09-10 08:24:39.510104
1626	13	PRD-1789018725877-R1789028679575	114.9000	114.9000	available	2026-09-10 08:24:39.577429	2026-09-10 08:24:39.577429
1627	13	PRD-1789018725877-R1789028679658	119.0000	119.0000	available	2026-09-10 08:24:39.659568	2026-09-10 08:24:39.659568
1628	13	PRD-1789018725877-R1789028679744	129.0000	129.0000	available	2026-09-10 08:24:39.745445	2026-09-10 08:24:39.745445
1633	13	PRD-1789018725877-R1789028680154	105.6000	105.6000	available	2026-09-10 08:24:40.156175	2026-09-10 08:24:40.156175
1639	13	PRD-1789018725877-R1789028680664	119.2000	119.2000	available	2026-09-10 08:24:40.665563	2026-09-10 08:24:40.665563
1645	13	PRD-1789018725877-R1789028681234	108.3000	108.3000	available	2026-09-10 08:24:41.236026	2026-09-10 08:24:41.236026
1648	13	PRD-1789018725877-R1789028681543	123.1000	123.1000	available	2026-09-10 08:24:41.545582	2026-09-10 08:24:41.545582
1651	13	PRD-1789018725877-R1789028681855	132.9000	132.9000	available	2026-09-10 08:24:41.857357	2026-09-10 08:24:41.857357
1652	13	PRD-1789018725877-R1789028681952	132.0000	132.0000	available	2026-09-10 08:24:41.953498	2026-09-10 08:24:41.953498
1664	13	PRD-1789018725877-R1789028683375	118.0000	118.0000	available	2026-09-10 08:24:43.376944	2026-09-10 08:24:43.376944
1666	13	PRD-1789018725877-R1789028683624	132.0000	132.0000	available	2026-09-10 08:24:43.627162	2026-09-10 08:24:43.627162
1669	13	PRD-1789018725877-R1789028683979	120.2000	120.2000	available	2026-09-10 08:24:43.980705	2026-09-10 08:24:43.980705
1672	13	PRD-1789018725877-R1789028684255	120.8000	120.8000	available	2026-09-10 08:24:44.256884	2026-09-10 08:24:44.256884
1676	13	PRD-1789018725877-R1789028684831	103.0000	103.0000	available	2026-09-10 08:24:44.850401	2026-09-10 08:24:44.850401
1936	51	PRD-1789029511477-R1789029595888	112.7000	112.7000	available	2026-09-10 08:39:55.889411	2026-09-10 08:39:55.889411
1942	51	PRD-1789029511477-R1789029596422	120.0000	120.0000	available	2026-09-10 08:39:56.425817	2026-09-10 08:39:56.425817
1947	51	PRD-1789029511477-R1789029596789	125.6000	125.6000	available	2026-09-10 08:39:56.792211	2026-09-10 08:39:56.792211
1950	51	PRD-1789029511477-R1789029597044	124.0000	124.0000	available	2026-09-10 08:39:57.046675	2026-09-10 08:39:57.046675
1951	51	PRD-1789029511477-R1789029597149	124.2000	124.2000	available	2026-09-10 08:39:57.150869	2026-09-10 08:39:57.150869
1952	51	PRD-1789029511477-R1789029597226	123.8000	123.8000	available	2026-09-10 08:39:57.228446	2026-09-10 08:39:57.228446
1953	51	PRD-1789029511477-R1789029597308	115.7000	115.7000	available	2026-09-10 08:39:57.310103	2026-09-10 08:39:57.310103
2077	23	PRD-1789020510805-R1789031552936	120.3000	120.3000	available	2026-09-10 09:12:32.937327	2026-09-10 09:12:32.937327
2079	23	PRD-1789020510805-R1789031553320	117.8000	117.8000	available	2026-09-10 09:12:33.322271	2026-09-10 09:12:33.322271
2080	23	PRD-1789020510805-R1789031553517	119.0000	119.0000	available	2026-09-10 09:12:33.519893	2026-09-10 09:12:33.519893
2081	23	PRD-1789020510805-R1789031553685	120.3000	120.3000	available	2026-09-10 09:12:33.686187	2026-09-10 09:12:33.686187
2082	23	PRD-1789020510805-R1789031553883	160.0000	160.0000	available	2026-09-10 09:12:33.884185	2026-09-10 09:12:33.884185
2088	23	PRD-1789020510805-R1789031555081	120.3000	120.3000	available	2026-09-10 09:12:35.084497	2026-09-10 09:12:35.084497
2091	23	PRD-1789020510805-R1789031555690	124.4000	124.4000	available	2026-09-10 09:12:35.691908	2026-09-10 09:12:35.691908
2092	23	PRD-1789020510805-R1789031555926	115.3000	115.3000	available	2026-09-10 09:12:35.931038	2026-09-10 09:12:35.931038
2093	23	PRD-1789020510805-R1789031556249	120.3000	120.3000	available	2026-09-10 09:12:36.250626	2026-09-10 09:12:36.250626
2150	26	PRD-1789021819488-R1789031979810	117.0000	117.0000	available	2026-09-10 09:19:39.812601	2026-09-10 09:19:39.812601
2151	26	PRD-1789021819488-R1789031980004	115.0000	115.0000	available	2026-09-10 09:19:40.005305	2026-09-10 09:19:40.005305
2161	26	PRD-1789021819488-R1789031982218	113.1000	113.1000	available	2026-09-10 09:19:42.21926	2026-09-10 09:19:42.21926
2162	26	PRD-1789021819488-R1789031982480	138.5000	138.5000	available	2026-09-10 09:19:42.481425	2026-09-10 09:19:42.481425
2163	26	PRD-1789021819488-R1789031982719	121.6000	121.6000	available	2026-09-10 09:19:42.720377	2026-09-10 09:19:42.720377
2164	26	PRD-1789021819488-R1789031982943	114.9000	114.9000	available	2026-09-10 09:19:42.944357	2026-09-10 09:19:42.944357
2165	26	PRD-1789021819488-R1789031983209	127.8000	127.8000	available	2026-09-10 09:19:43.212181	2026-09-10 09:19:43.212181
2176	26	PRD-1789021819488-R1789031985602	108.0000	108.0000	available	2026-09-10 09:19:45.604397	2026-09-10 09:19:45.604397
2177	26	PRD-1789021819488-R1789031985822	113.5000	113.5000	available	2026-09-10 09:19:45.823898	2026-09-10 09:19:45.823898
2179	26	PRD-1789021819488-R1789031986283	114.9000	114.9000	available	2026-09-10 09:19:46.289397	2026-09-10 09:19:46.289397
2181	26	PRD-1789021819488-R1789031986768	110.7000	110.7000	available	2026-09-10 09:19:46.77141	2026-09-10 09:19:46.77141
2182	26	PRD-1789021819488-R1789031987039	122.6000	122.6000	available	2026-09-10 09:19:47.040506	2026-09-10 09:19:47.040506
2183	26	PRD-1789021819488-R1789031987253	139.4000	139.4000	available	2026-09-10 09:19:47.254414	2026-09-10 09:19:47.254414
2189	26	PRD-1789021819488-R1789031988606	120.3000	120.3000	available	2026-09-10 09:19:48.60944	2026-09-10 09:19:48.60944
2190	26	PRD-1789021819488-R1789031988799	118.7000	118.7000	available	2026-09-10 09:19:48.800606	2026-09-10 09:19:48.800606
2192	26	PRD-1789021819488-R1789031989255	120.1000	120.1000	available	2026-09-10 09:19:49.256022	2026-09-10 09:19:49.256022
864	27	PRD-1789024316748-R1789024565019	113.4000	113.4000	available	2026-09-10 07:16:05.02242	2026-09-10 07:16:05.02242
866	27	PRD-1789024316748-R1789024566111	116.3000	116.3000	available	2026-09-10 07:16:06.11345	2026-09-10 07:16:06.11345
868	27	PRD-1789024316748-R1789024566700	113.3000	113.3000	available	2026-09-10 07:16:06.701918	2026-09-10 07:16:06.701918
869	27	PRD-1789024316748-R1789024567017	112.4000	112.4000	available	2026-09-10 07:16:07.019238	2026-09-10 07:16:07.019238
870	27	PRD-1789024316748-R1789024567310	112.3000	112.3000	available	2026-09-10 07:16:07.313008	2026-09-10 07:16:07.313008
873	27	PRD-1789024316748-R1789024568187	112.7000	112.7000	available	2026-09-10 07:16:08.188512	2026-09-10 07:16:08.188512
875	27	PRD-1789024316748-R1789024568796	115.9000	115.9000	available	2026-09-10 07:16:08.797939	2026-09-10 07:16:08.797939
876	27	PRD-1789024316748-R1789024569095	92.0000	92.0000	available	2026-09-10 07:16:09.096879	2026-09-10 07:16:09.096879
877	27	PRD-1789024316748-R1789024569382	114.5000	114.5000	available	2026-09-10 07:16:09.383659	2026-09-10 07:16:09.383659
878	27	PRD-1789024316748-R1789024569688	115.7000	115.7000	available	2026-09-10 07:16:09.689545	2026-09-10 07:16:09.689545
882	27	PRD-1789024316748-R1789024570862	115.0000	115.0000	available	2026-09-10 07:16:10.864296	2026-09-10 07:16:10.864296
886	28	PRD-1789024618261-R1789024740691	75.0000	75.0000	available	2026-09-10 07:19:00.692226	2026-09-10 07:19:00.692226
887	28	PRD-1789024618261-R1789024740988	73.0000	73.0000	available	2026-09-10 07:19:00.989742	2026-09-10 07:19:00.989742
888	28	PRD-1789024618261-R1789024741340	70.0000	70.0000	available	2026-09-10 07:19:01.34861	2026-09-10 07:19:01.34861
889	28	PRD-1789024618261-R1789024741617	62.0000	62.0000	available	2026-09-10 07:19:01.617774	2026-09-10 07:19:01.617774
890	28	PRD-1789024618261-R1789024741883	81.0000	81.0000	available	2026-09-10 07:19:01.884838	2026-09-10 07:19:01.884838
891	28	PRD-1789024618261-R1789024742200	60.0000	60.0000	available	2026-09-10 07:19:02.201353	2026-09-10 07:19:02.201353
892	28	PRD-1789024618261-R1789024742498	65.0000	65.0000	available	2026-09-10 07:19:02.500081	2026-09-10 07:19:02.500081
893	28	PRD-1789024618261-R1789024742774	78.0000	78.0000	available	2026-09-10 07:19:02.776614	2026-09-10 07:19:02.776614
894	28	PRD-1789024618261-R1789024743069	65.0000	65.0000	available	2026-09-10 07:19:03.071386	2026-09-10 07:19:03.071386
895	28	PRD-1789024618261-R1789024743356	68.0000	68.0000	available	2026-09-10 07:19:03.357344	2026-09-10 07:19:03.357344
896	28	PRD-1789024618261-R1789024743639	76.0000	76.0000	available	2026-09-10 07:19:03.641892	2026-09-10 07:19:03.641892
897	28	PRD-1789024618261-R1789024743940	83.0000	83.0000	available	2026-09-10 07:19:03.945209	2026-09-10 07:19:03.945209
898	28	PRD-1789024618261-R1789024744266	70.0000	70.0000	available	2026-09-10 07:19:04.268218	2026-09-10 07:19:04.268218
899	28	PRD-1789024618261-R1789024744561	64.0000	64.0000	available	2026-09-10 07:19:04.562722	2026-09-10 07:19:04.562722
900	28	PRD-1789024618261-R1789024744855	65.0000	65.0000	available	2026-09-10 07:19:04.856487	2026-09-10 07:19:04.856487
901	28	PRD-1789024618261-R1789024745196	70.0000	70.0000	available	2026-09-10 07:19:05.197525	2026-09-10 07:19:05.197525
902	28	PRD-1789024618261-R1789024745513	80.0000	80.0000	available	2026-09-10 07:19:05.515079	2026-09-10 07:19:05.515079
903	28	PRD-1789024618261-R1789024745823	78.0000	78.0000	available	2026-09-10 07:19:05.824072	2026-09-10 07:19:05.824072
904	28	PRD-1789024618261-R1789024746146	65.0000	65.0000	available	2026-09-10 07:19:06.147555	2026-09-10 07:19:06.147555
905	28	PRD-1789024618261-R1789024746499	63.0000	63.0000	available	2026-09-10 07:19:06.502986	2026-09-10 07:19:06.502986
906	28	PRD-1789024618261-R1789024746784	70.0000	70.0000	available	2026-09-10 07:19:06.785456	2026-09-10 07:19:06.785456
907	28	PRD-1789024618261-R1789024747088	71.0000	71.0000	available	2026-09-10 07:19:07.090379	2026-09-10 07:19:07.090379
908	28	PRD-1789024618261-R1789024747378	67.0000	67.0000	available	2026-09-10 07:19:07.380006	2026-09-10 07:19:07.380006
909	28	PRD-1789024618261-R1789024747718	59.0000	59.0000	available	2026-09-10 07:19:07.720417	2026-09-10 07:19:07.720417
910	28	PRD-1789024618261-R1789024748016	80.0000	80.0000	available	2026-09-10 07:19:08.017188	2026-09-10 07:19:08.017188
911	28	PRD-1789024618261-R1789024748301	79.0000	79.0000	available	2026-09-10 07:19:08.302125	2026-09-10 07:19:08.302125
912	28	PRD-1789024618261-R1789024748636	68.0000	68.0000	available	2026-09-10 07:19:08.637471	2026-09-10 07:19:08.637471
913	28	PRD-1789024618261-R1789024748971	65.0000	65.0000	available	2026-09-10 07:19:08.972816	2026-09-10 07:19:08.972816
914	28	PRD-1789024618261-R1789024749305	57.0000	57.0000	available	2026-09-10 07:19:09.306816	2026-09-10 07:19:09.306816
915	28	PRD-1789024618261-R1789024749604	65.0000	65.0000	available	2026-09-10 07:19:09.605148	2026-09-10 07:19:09.605148
916	28	PRD-1789024618261-R1789024749924	59.0000	59.0000	available	2026-09-10 07:19:09.925885	2026-09-10 07:19:09.925885
917	28	PRD-1789024618261-R1789024750213	78.0000	78.0000	available	2026-09-10 07:19:10.214357	2026-09-10 07:19:10.214357
918	28	PRD-1789024618261-R1789024750538	69.0000	69.0000	available	2026-09-10 07:19:10.539717	2026-09-10 07:19:10.539717
919	29	PRD-1789024785302-R1789024894435	125.0000	125.0000	available	2026-09-10 07:21:34.436589	2026-09-10 07:21:34.436589
920	29	PRD-1789024785302-R1789024894786	108.6000	108.6000	available	2026-09-10 07:21:34.78946	2026-09-10 07:21:34.78946
921	29	PRD-1789024785302-R1789024895202	121.3000	121.3000	available	2026-09-10 07:21:35.20414	2026-09-10 07:21:35.20414
922	29	PRD-1789024785302-R1789024896125	126.5000	126.5000	available	2026-09-10 07:21:36.128276	2026-09-10 07:21:36.128276
923	29	PRD-1789024785302-R1789024896460	98.8000	98.8000	available	2026-09-10 07:21:36.46139	2026-09-10 07:21:36.46139
924	29	PRD-1789024785302-R1789024896787	129.0000	129.0000	available	2026-09-10 07:21:36.787962	2026-09-10 07:21:36.787962
925	29	PRD-1789024785302-R1789024897099	146.7000	146.7000	available	2026-09-10 07:21:37.101323	2026-09-10 07:21:37.101323
926	29	PRD-1789024785302-R1789024897402	125.9000	125.9000	available	2026-09-10 07:21:37.403589	2026-09-10 07:21:37.403589
927	29	PRD-1789024785302-R1789024897719	62.0000	62.0000	available	2026-09-10 07:21:37.720231	2026-09-10 07:21:37.720231
928	29	PRD-1789024785302-R1789024898053	63.0000	63.0000	available	2026-09-10 07:21:38.055388	2026-09-10 07:21:38.055388
929	29	PRD-1789024785302-R1789024898373	116.1000	116.1000	available	2026-09-10 07:21:38.375047	2026-09-10 07:21:38.375047
930	29	PRD-1789024785302-R1789024898684	124.9000	124.9000	available	2026-09-10 07:21:38.686697	2026-09-10 07:21:38.686697
931	29	PRD-1789024785302-R1789024899010	103.1000	103.1000	available	2026-09-10 07:21:39.012557	2026-09-10 07:21:39.012557
932	29	PRD-1789024785302-R1789024899317	121.3000	121.3000	available	2026-09-10 07:21:39.318857	2026-09-10 07:21:39.318857
933	29	PRD-1789024785302-R1789024899611	107.9000	107.9000	available	2026-09-10 07:21:39.612526	2026-09-10 07:21:39.612526
934	29	PRD-1789024785302-R1789024899941	118.0000	118.0000	available	2026-09-10 07:21:39.943186	2026-09-10 07:21:39.943186
935	29	PRD-1789024785302-R1789024900977	124.8000	124.8000	available	2026-09-10 07:21:40.98002	2026-09-10 07:21:40.98002
936	29	PRD-1789024785302-R1789024901277	118.9000	118.9000	available	2026-09-10 07:21:41.278845	2026-09-10 07:21:41.278845
937	29	PRD-1789024785302-R1789024901559	86.6000	86.6000	available	2026-09-10 07:21:41.560792	2026-09-10 07:21:41.560792
938	29	PRD-1789024785302-R1789024901851	98.9000	98.9000	available	2026-09-10 07:21:41.852601	2026-09-10 07:21:41.852601
939	29	PRD-1789024785302-R1789024902131	97.3000	97.3000	available	2026-09-10 07:21:42.132661	2026-09-10 07:21:42.132661
940	29	PRD-1789024785302-R1789024902420	92.4000	92.4000	available	2026-09-10 07:21:42.42158	2026-09-10 07:21:42.42158
941	29	PRD-1789024785302-R1789024902723	100.4000	100.4000	available	2026-09-10 07:21:42.725652	2026-09-10 07:21:42.725652
942	29	PRD-1789024785302-R1789024903044	125.7000	125.7000	available	2026-09-10 07:21:43.046169	2026-09-10 07:21:43.046169
943	29	PRD-1789024785302-R1789024903324	118.7000	118.7000	available	2026-09-10 07:21:43.325768	2026-09-10 07:21:43.325768
944	29	PRD-1789024785302-R1789024903627	118.5000	118.5000	available	2026-09-10 07:21:43.628744	2026-09-10 07:21:43.628744
945	29	PRD-1789024785302-R1789024903930	129.3000	129.3000	available	2026-09-10 07:21:43.932611	2026-09-10 07:21:43.932611
946	29	PRD-1789024785302-R1789024904226	102.3000	102.3000	available	2026-09-10 07:21:44.228284	2026-09-10 07:21:44.228284
947	29	PRD-1789024785302-R1789024904525	117.3000	117.3000	available	2026-09-10 07:21:44.526454	2026-09-10 07:21:44.526454
948	29	PRD-1789024785302-R1789024904830	120.4000	120.4000	available	2026-09-10 07:21:44.831957	2026-09-10 07:21:44.831957
949	30	PRD-1789024935840-R1789025027136	65.0000	65.0000	available	2026-09-10 07:23:47.144551	2026-09-10 07:23:47.144551
950	30	PRD-1789024935840-R1789025027540	60.0000	60.0000	available	2026-09-10 07:23:47.541114	2026-09-10 07:23:47.541114
951	30	PRD-1789024935840-R1789025027832	70.0000	70.0000	available	2026-09-10 07:23:47.833421	2026-09-10 07:23:47.833421
952	30	PRD-1789024935840-R1789025028134	60.0000	60.0000	available	2026-09-10 07:23:48.13574	2026-09-10 07:23:48.13574
953	30	PRD-1789024935840-R1789025029338	60.0000	60.0000	available	2026-09-10 07:23:49.339743	2026-09-10 07:23:49.339743
954	30	PRD-1789024935840-R1789025029680	66.0000	66.0000	available	2026-09-10 07:23:49.68139	2026-09-10 07:23:49.68139
955	30	PRD-1789024935840-R1789025030016	0.0000	0.0000	available	2026-09-10 07:23:50.017096	2026-09-10 07:23:50.017096
956	30	PRD-1789024935840-R1789025030290	64.0000	64.0000	available	2026-09-10 07:23:50.29153	2026-09-10 07:23:50.29153
957	30	PRD-1789024935840-R1789025030585	64.0000	64.0000	available	2026-09-10 07:23:50.587673	2026-09-10 07:23:50.587673
958	30	PRD-1789024935840-R1789025030858	65.0000	65.0000	available	2026-09-10 07:23:50.859379	2026-09-10 07:23:50.859379
959	30	PRD-1789024935840-R1789025031147	60.0000	60.0000	available	2026-09-10 07:23:51.149989	2026-09-10 07:23:51.149989
960	30	PRD-1789024935840-R1789025031429	62.0000	62.0000	available	2026-09-10 07:23:51.430901	2026-09-10 07:23:51.430901
961	30	PRD-1789024935840-R1789025031725	65.0000	65.0000	available	2026-09-10 07:23:51.727087	2026-09-10 07:23:51.727087
962	30	PRD-1789024935840-R1789025032021	55.0000	55.0000	available	2026-09-10 07:23:52.022661	2026-09-10 07:23:52.022661
963	30	PRD-1789024935840-R1789025032320	82.0000	82.0000	available	2026-09-10 07:23:52.322081	2026-09-10 07:23:52.322081
964	30	PRD-1789024935840-R1789025032626	60.0000	60.0000	available	2026-09-10 07:23:52.62792	2026-09-10 07:23:52.62792
965	30	PRD-1789024935840-R1789025032906	86.0000	86.0000	available	2026-09-10 07:23:52.907814	2026-09-10 07:23:52.907814
966	30	PRD-1789024935840-R1789025033201	87.0000	87.0000	available	2026-09-10 07:23:53.202475	2026-09-10 07:23:53.202475
967	30	PRD-1789024935840-R1789025033520	85.0000	85.0000	available	2026-09-10 07:23:53.521395	2026-09-10 07:23:53.521395
968	30	PRD-1789024935840-R1789025033801	75.0000	75.0000	available	2026-09-10 07:23:53.80233	2026-09-10 07:23:53.80233
969	30	PRD-1789024935840-R1789025034095	86.0000	86.0000	available	2026-09-10 07:23:54.097532	2026-09-10 07:23:54.097532
970	30	PRD-1789024935840-R1789025034393	75.0000	75.0000	available	2026-09-10 07:23:54.395394	2026-09-10 07:23:54.395394
971	30	PRD-1789024935840-R1789025034670	60.0000	60.0000	available	2026-09-10 07:23:54.672992	2026-09-10 07:23:54.672992
972	30	PRD-1789024935840-R1789025034969	87.0000	87.0000	available	2026-09-10 07:23:54.970229	2026-09-10 07:23:54.970229
973	30	PRD-1789024935840-R1789025035265	64.0000	64.0000	available	2026-09-10 07:23:55.266019	2026-09-10 07:23:55.266019
974	30	PRD-1789024935840-R1789025035564	80.0000	80.0000	available	2026-09-10 07:23:55.566618	2026-09-10 07:23:55.566618
975	30	PRD-1789024935840-R1789025035853	60.0000	60.0000	available	2026-09-10 07:23:55.853897	2026-09-10 07:23:55.853897
976	31	PRD-1789025055371-R1789025078350	60.0000	60.0000	available	2026-09-10 07:24:38.351117	2026-09-10 07:24:38.351117
977	31	PRD-1789025055371-R1789025078653	70.0000	70.0000	available	2026-09-10 07:24:38.654539	2026-09-10 07:24:38.654539
978	31	PRD-1789025055371-R1789025078930	60.0000	60.0000	available	2026-09-10 07:24:38.931875	2026-09-10 07:24:38.931875
979	31	PRD-1789025055371-R1789025079233	62.0000	62.0000	available	2026-09-10 07:24:39.23455	2026-09-10 07:24:39.23455
980	31	PRD-1789025055371-R1789025079519	64.0000	64.0000	available	2026-09-10 07:24:39.520948	2026-09-10 07:24:39.520948
981	31	PRD-1789025055371-R1789025079792	65.0000	65.0000	available	2026-09-10 07:24:39.793902	2026-09-10 07:24:39.793902
982	31	PRD-1789025055371-R1789025080057	66.0000	66.0000	available	2026-09-10 07:24:40.05961	2026-09-10 07:24:40.05961
983	32	PRD-1789025098770-R1789025122447	65.0000	65.0000	available	2026-09-10 07:25:22.448421	2026-09-10 07:25:22.448421
984	32	PRD-1789025098770-R1789025122721	65.0000	65.0000	available	2026-09-10 07:25:22.723003	2026-09-10 07:25:22.723003
985	32	PRD-1789025098770-R1789025122995	65.0000	65.0000	available	2026-09-10 07:25:22.999519	2026-09-10 07:25:22.999519
986	32	PRD-1789025098770-R1789025123299	64.0000	64.0000	available	2026-09-10 07:25:23.300349	2026-09-10 07:25:23.300349
987	32	PRD-1789025098770-R1789025123589	54.0000	54.0000	available	2026-09-10 07:25:23.590514	2026-09-10 07:25:23.590514
988	32	PRD-1789025098770-R1789025123846	65.0000	65.0000	available	2026-09-10 07:25:23.847606	2026-09-10 07:25:23.847606
989	32	PRD-1789025098770-R1789025124153	64.0000	64.0000	available	2026-09-10 07:25:24.154658	2026-09-10 07:25:24.154658
990	33	PRD-1789025144264-R1789025156859	139.4000	139.4000	available	2026-09-10 07:25:56.860696	2026-09-10 07:25:56.860696
991	33	PRD-1789025144264-R1789025157953	115.0000	115.0000	available	2026-09-10 07:25:57.954387	2026-09-10 07:25:57.954387
992	25	PRD-1789021016427-R1789025187988	102.3000	102.3000	available	2026-09-10 07:26:27.989997	2026-09-10 07:26:27.989997
993	25	PRD-1789021016427-R1789025188052	121.7000	121.7000	available	2026-09-10 07:26:28.053922	2026-09-10 07:26:28.053922
994	25	PRD-1789021016427-R1789025188158	126.6000	126.6000	available	2026-09-10 07:26:28.161349	2026-09-10 07:26:28.161349
995	25	PRD-1789021016427-R1789025188227	107.2000	107.2000	available	2026-09-10 07:26:28.227884	2026-09-10 07:26:28.227884
996	25	PRD-1789021016427-R1789025188305	115.0000	115.0000	available	2026-09-10 07:26:28.306778	2026-09-10 07:26:28.306778
997	25	PRD-1789021016427-R1789025188380	129.1000	129.1000	available	2026-09-10 07:26:28.382528	2026-09-10 07:26:28.382528
998	25	PRD-1789021016427-R1789025188468	116.1000	116.1000	available	2026-09-10 07:26:28.469834	2026-09-10 07:26:28.469834
999	25	PRD-1789021016427-R1789025188511	113.5000	113.5000	available	2026-09-10 07:26:28.514082	2026-09-10 07:26:28.514082
1000	25	PRD-1789021016427-R1789025188577	120.0000	120.0000	available	2026-09-10 07:26:28.578026	2026-09-10 07:26:28.578026
1001	25	PRD-1789021016427-R1789025188631	119.5000	119.5000	available	2026-09-10 07:26:28.633182	2026-09-10 07:26:28.633182
1002	25	PRD-1789021016427-R1789025188707	120.4000	120.4000	available	2026-09-10 07:26:28.708611	2026-09-10 07:26:28.708611
1003	25	PRD-1789021016427-R1789025188781	120.3000	120.3000	available	2026-09-10 07:26:28.782841	2026-09-10 07:26:28.782841
1004	25	PRD-1789021016427-R1789025188853	119.6000	119.6000	available	2026-09-10 07:26:28.85486	2026-09-10 07:26:28.85486
1005	25	PRD-1789021016427-R1789025188934	112.8000	112.8000	available	2026-09-10 07:26:28.935904	2026-09-10 07:26:28.935904
1006	25	PRD-1789021016427-R1789025189004	85.9000	85.9000	available	2026-09-10 07:26:29.006037	2026-09-10 07:26:29.006037
1007	25	PRD-1789021016427-R1789025189094	116.3000	116.3000	available	2026-09-10 07:26:29.095382	2026-09-10 07:26:29.095382
1008	25	PRD-1789021016427-R1789025189164	100.4000	100.4000	available	2026-09-10 07:26:29.166078	2026-09-10 07:26:29.166078
1009	25	PRD-1789021016427-R1789025189249	114.2000	114.2000	available	2026-09-10 07:26:29.251438	2026-09-10 07:26:29.251438
1010	25	PRD-1789021016427-R1789025189320	113.7000	113.7000	available	2026-09-10 07:26:29.322053	2026-09-10 07:26:29.322053
1011	25	PRD-1789021016427-R1789025189448	98.4000	98.4000	available	2026-09-10 07:26:29.449986	2026-09-10 07:26:29.449986
1012	25	PRD-1789021016427-R1789025189635	115.4000	115.4000	available	2026-09-10 07:26:29.638978	2026-09-10 07:26:29.638978
1013	25	PRD-1789021016427-R1789025189754	120.4000	120.4000	available	2026-09-10 07:26:29.755217	2026-09-10 07:26:29.755217
1014	25	PRD-1789021016427-R1789025189804	120.8000	120.8000	available	2026-09-10 07:26:29.805951	2026-09-10 07:26:29.805951
1015	25	PRD-1789021016427-R1789025189880	119.9000	119.9000	available	2026-09-10 07:26:29.88107	2026-09-10 07:26:29.88107
1016	25	PRD-1789021016427-R1789025189960	120.6000	120.6000	available	2026-09-10 07:26:29.96174	2026-09-10 07:26:29.96174
1017	25	PRD-1789021016427-R1789025190035	119.2000	119.2000	available	2026-09-10 07:26:30.037773	2026-09-10 07:26:30.037773
1018	25	PRD-1789021016427-R1789025190143	120.2000	120.2000	available	2026-09-10 07:26:30.145733	2026-09-10 07:26:30.145733
1019	25	PRD-1789021016427-R1789025190247	119.9000	119.9000	available	2026-09-10 07:26:30.248373	2026-09-10 07:26:30.248373
1020	25	PRD-1789021016427-R1789025190340	120.2000	120.2000	available	2026-09-10 07:26:30.343857	2026-09-10 07:26:30.343857
1021	25	PRD-1789021016427-R1789025190436	87.4000	87.4000	available	2026-09-10 07:26:30.438093	2026-09-10 07:26:30.438093
1027	25	PRD-1789021016427-R1789025190969	120.2000	120.2000	available	2026-09-10 07:26:30.970234	2026-09-10 07:26:30.970234
1028	34	PRD-1789025185193-R1789025192164	120.0000	120.0000	available	2026-09-10 07:26:32.165249	2026-09-10 07:26:32.165249
1341	28	PRD-1789024618261-R1789026531606	64.0000	64.0000	available	2026-09-10 07:48:51.608322	2026-09-10 07:48:51.608322
1342	28	PRD-1789024618261-R1789026531746	60.0000	60.0000	available	2026-09-10 07:48:51.748013	2026-09-10 07:48:51.748013
1345	28	PRD-1789024618261-R1789026532033	70.0000	70.0000	available	2026-09-10 07:48:52.035003	2026-09-10 07:48:52.035003
1346	28	PRD-1789024618261-R1789026532148	52.0000	52.0000	available	2026-09-10 07:48:52.149573	2026-09-10 07:48:52.149573
1347	28	PRD-1789024618261-R1789026532256	60.0000	60.0000	available	2026-09-10 07:48:52.25915	2026-09-10 07:48:52.25915
1352	28	PRD-1789024618261-R1789026532810	65.0000	65.0000	available	2026-09-10 07:48:52.811832	2026-09-10 07:48:52.811832
1357	28	PRD-1789024618261-R1789026533328	63.0000	63.0000	available	2026-09-10 07:48:53.330005	2026-09-10 07:48:53.330005
1467	7	PRD-1789018404302-R1789027749185	113.4000	113.4000	available	2026-09-10 08:09:09.185902	2026-09-10 08:09:09.185902
1624	13	PRD-1789018725877-R1789028679433	118.5000	118.5000	available	2026-09-10 08:24:39.437906	2026-09-10 08:24:39.437906
1629	13	PRD-1789018725877-R1789028679827	131.7000	131.7000	available	2026-09-10 08:24:39.828519	2026-09-10 08:24:39.828519
1632	13	PRD-1789018725877-R1789028680067	104.4000	104.4000	available	2026-09-10 08:24:40.068982	2026-09-10 08:24:40.068982
1635	13	PRD-1789018725877-R1789028680313	116.2000	116.2000	available	2026-09-10 08:24:40.31507	2026-09-10 08:24:40.31507
1636	13	PRD-1789018725877-R1789028680389	114.2000	114.2000	available	2026-09-10 08:24:40.391234	2026-09-10 08:24:40.391234
1637	13	PRD-1789018725877-R1789028680492	117.2000	117.2000	available	2026-09-10 08:24:40.493314	2026-09-10 08:24:40.493314
1638	13	PRD-1789018725877-R1789028680603	126.5000	126.5000	available	2026-09-10 08:24:40.605105	2026-09-10 08:24:40.605105
1646	13	PRD-1789018725877-R1789028681359	114.5000	114.5000	available	2026-09-10 08:24:41.361615	2026-09-10 08:24:41.361615
1649	13	PRD-1789018725877-R1789028681632	128.0000	128.0000	available	2026-09-10 08:24:41.634354	2026-09-10 08:24:41.634354
1653	13	PRD-1789018725877-R1789028682064	120.7000	120.7000	available	2026-09-10 08:24:42.066375	2026-09-10 08:24:42.066375
1654	13	PRD-1789018725877-R1789028682176	92.7000	92.7000	available	2026-09-10 08:24:42.177808	2026-09-10 08:24:42.177808
1655	13	PRD-1789018725877-R1789028682299	120.5000	120.5000	available	2026-09-10 08:24:42.30015	2026-09-10 08:24:42.30015
1656	13	PRD-1789018725877-R1789028682387	100.9000	100.9000	available	2026-09-10 08:24:42.392074	2026-09-10 08:24:42.392074
1657	13	PRD-1789018725877-R1789028682506	81.3000	81.3000	available	2026-09-10 08:24:42.50778	2026-09-10 08:24:42.50778
1661	13	PRD-1789018725877-R1789028683066	121.5000	121.5000	available	2026-09-10 08:24:43.06754	2026-09-10 08:24:43.06754
1662	13	PRD-1789018725877-R1789028683152	123.4000	123.4000	available	2026-09-10 08:24:43.153402	2026-09-10 08:24:43.153402
1665	13	PRD-1789018725877-R1789028683498	130.5000	130.5000	available	2026-09-10 08:24:43.499393	2026-09-10 08:24:43.499393
1671	13	PRD-1789018725877-R1789028684155	112.1000	112.1000	available	2026-09-10 08:24:44.157374	2026-09-10 08:24:44.157374
1937	51	PRD-1789029511477-R1789029595979	125.4000	125.4000	available	2026-09-10 08:39:55.990929	2026-09-10 08:39:55.990929
1938	51	PRD-1789029511477-R1789029596080	124.1000	124.1000	available	2026-09-10 08:39:56.089002	2026-09-10 08:39:56.089002
1944	51	PRD-1789029511477-R1789029596560	120.0000	120.0000	available	2026-09-10 08:39:56.562219	2026-09-10 08:39:56.562219
1945	51	PRD-1789029511477-R1789029596636	125.7000	125.7000	available	2026-09-10 08:39:56.637796	2026-09-10 08:39:56.637796
1948	51	PRD-1789029511477-R1789029596866	117.1000	117.1000	available	2026-09-10 08:39:56.86788	2026-09-10 08:39:56.86788
1949	51	PRD-1789029511477-R1789029596943	124.9000	124.9000	available	2026-09-10 08:39:56.944795	2026-09-10 08:39:56.944795
1954	12	PRD-1789018691298-R1789029789665	124.9000	124.9000	available	2026-09-10 08:43:09.666006	2026-09-10 08:43:09.666006
1955	12	PRD-1789018691298-R1789029789754	125.5000	125.5000	available	2026-09-10 08:43:09.755975	2026-09-10 08:43:09.755975
1956	12	PRD-1789018691298-R1789029789907	120.4000	120.4000	available	2026-09-10 08:43:09.909607	2026-09-10 08:43:09.909607
1957	12	PRD-1789018691298-R1789029790026	119.6000	119.6000	available	2026-09-10 08:43:10.027378	2026-09-10 08:43:10.027378
1959	12	PRD-1789018691298-R1789029790290	124.0000	124.0000	available	2026-09-10 08:43:10.291241	2026-09-10 08:43:10.291241
1962	12	PRD-1789018691298-R1789029790617	122.1000	122.1000	available	2026-09-10 08:43:10.619293	2026-09-10 08:43:10.619293
1967	12	PRD-1789018691298-R1789029791237	124.8000	124.8000	available	2026-09-10 08:43:11.239172	2026-09-10 08:43:11.239172
1970	12	PRD-1789018691298-R1789029791625	117.7000	117.7000	available	2026-09-10 08:43:11.627152	2026-09-10 08:43:11.627152
1975	12	PRD-1789018691298-R1789029792295	123.0000	123.0000	available	2026-09-10 08:43:12.297092	2026-09-10 08:43:12.297092
1976	12	PRD-1789018691298-R1789029792402	120.2000	120.2000	available	2026-09-10 08:43:12.403723	2026-09-10 08:43:12.403723
1979	12	PRD-1789018691298-R1789029792767	140.8000	140.8000	available	2026-09-10 08:43:12.768961	2026-09-10 08:43:12.768961
1982	12	PRD-1789018691298-R1789029793225	120.0000	120.0000	available	2026-09-10 08:43:13.226814	2026-09-10 08:43:13.226814
1986	12	PRD-1789018691298-R1789029793787	125.7000	125.7000	available	2026-09-10 08:43:13.788532	2026-09-10 08:43:13.788532
1987	12	PRD-1789018691298-R1789029793942	124.1000	124.1000	available	2026-09-10 08:43:13.943766	2026-09-10 08:43:13.943766
1989	12	PRD-1789018691298-R1789029794236	128.6000	128.6000	available	2026-09-10 08:43:14.237912	2026-09-10 08:43:14.237912
1991	12	PRD-1789018691298-R1789029794515	123.7000	123.7000	available	2026-09-10 08:43:14.517266	2026-09-10 08:43:14.517266
2095	23	PRD-1789020510805-R1789031556692	90.6000	90.6000	available	2026-09-10 09:12:36.693783	2026-09-10 09:12:36.693783
2096	23	PRD-1789020510805-R1789031556969	126.0000	126.0000	available	2026-09-10 09:12:36.970169	2026-09-10 09:12:36.970169
2097	23	PRD-1789020510805-R1789031557160	126.0000	126.0000	available	2026-09-10 09:12:37.162202	2026-09-10 09:12:37.162202
2098	23	PRD-1789020510805-R1789031557339	120.3000	120.3000	available	2026-09-10 09:12:37.341634	2026-09-10 09:12:37.341634
2099	54	PRD-1789031590529-R1789031727195	121.2000	121.2000	available	2026-09-10 09:15:27.196746	2026-09-10 09:15:27.196746
2103	54	PRD-1789031590529-R1789031727971	120.0000	120.0000	available	2026-09-10 09:15:27.97227	2026-09-10 09:15:27.97227
2104	54	PRD-1789031590529-R1789031728148	119.0000	119.0000	available	2026-09-10 09:15:28.14953	2026-09-10 09:15:28.14953
2107	54	PRD-1789031590529-R1789031728694	120.4000	120.4000	available	2026-09-10 09:15:28.695906	2026-09-10 09:15:28.695906
2112	54	PRD-1789031590529-R1789031729627	120.3000	120.3000	available	2026-09-10 09:15:29.629272	2026-09-10 09:15:29.629272
2113	54	PRD-1789031590529-R1789031729788	120.3000	120.3000	available	2026-09-10 09:15:29.789923	2026-09-10 09:15:29.789923
2115	54	PRD-1789031590529-R1789031730182	120.4000	120.4000	available	2026-09-10 09:15:30.189861	2026-09-10 09:15:30.189861
2116	54	PRD-1789031590529-R1789031730358	120.3000	120.3000	available	2026-09-10 09:15:30.359245	2026-09-10 09:15:30.359245
2117	54	PRD-1789031590529-R1789031730544	120.3000	120.3000	available	2026-09-10 09:15:30.545236	2026-09-10 09:15:30.545236
2118	54	PRD-1789031590529-R1789031730749	120.3600	120.3600	available	2026-09-10 09:15:30.750878	2026-09-10 09:15:30.750878
2119	54	PRD-1789031590529-R1789031730944	118.5000	118.5000	available	2026-09-10 09:15:30.946896	2026-09-10 09:15:30.946896
2120	54	PRD-1789031590529-R1789031731118	120.0000	120.0000	available	2026-09-10 09:15:31.119294	2026-09-10 09:15:31.119294
2121	54	PRD-1789031590529-R1789031731326	120.3000	120.3000	available	2026-09-10 09:15:31.327906	2026-09-10 09:15:31.327906
2122	54	PRD-1789031590529-R1789031731949	120.3000	120.3000	available	2026-09-10 09:15:31.95046	2026-09-10 09:15:31.95046
2127	54	PRD-1789031590529-R1789031732948	120.2000	120.2000	available	2026-09-10 09:15:32.949896	2026-09-10 09:15:32.949896
2136	54	PRD-1789031590529-R1789031734744	102.8000	102.8000	available	2026-09-10 09:15:34.745836	2026-09-10 09:15:34.745836
1022	25	PRD-1789021016427-R1789025190526	120.5000	120.5000	available	2026-09-10 07:26:30.528707	2026-09-10 07:26:30.528707
1025	25	PRD-1789021016427-R1789025190800	112.9000	112.9000	available	2026-09-10 07:26:30.801468	2026-09-10 07:26:30.801468
1026	25	PRD-1789021016427-R1789025190885	118.0000	118.0000	available	2026-09-10 07:26:30.886534	2026-09-10 07:26:30.886534
1343	28	PRD-1789024618261-R1789026531818	55.0000	55.0000	available	2026-09-10 07:48:51.819821	2026-09-10 07:48:51.819821
1344	28	PRD-1789024618261-R1789026531912	80.0000	80.0000	available	2026-09-10 07:48:51.913966	2026-09-10 07:48:51.913966
1349	28	PRD-1789024618261-R1789026532507	87.0000	87.0000	available	2026-09-10 07:48:52.516045	2026-09-10 07:48:52.516045
1350	28	PRD-1789024618261-R1789026532612	65.0000	65.0000	available	2026-09-10 07:48:52.613008	2026-09-10 07:48:52.613008
1353	28	PRD-1789024618261-R1789026532921	73.0000	73.0000	available	2026-09-10 07:48:52.921918	2026-09-10 07:48:52.921918
1354	28	PRD-1789024618261-R1789026533026	64.0000	64.0000	available	2026-09-10 07:48:53.028536	2026-09-10 07:48:53.028536
1355	28	PRD-1789024618261-R1789026533123	61.0000	61.0000	available	2026-09-10 07:48:53.125176	2026-09-10 07:48:53.125176
1356	28	PRD-1789024618261-R1789026533247	85.0000	85.0000	available	2026-09-10 07:48:53.248346	2026-09-10 07:48:53.248346
1468	7	PRD-1789018404302-R1789027749476	113.5000	113.5000	available	2026-09-10 08:09:09.477292	2026-09-10 08:09:09.477292
1630	13	PRD-1789018725877-R1789028679916	105.4000	105.4000	available	2026-09-10 08:24:39.918347	2026-09-10 08:24:39.918347
1631	13	PRD-1789018725877-R1789028679985	124.5000	124.5000	available	2026-09-10 08:24:39.987315	2026-09-10 08:24:39.987315
1634	13	PRD-1789018725877-R1789028680230	109.0000	109.0000	available	2026-09-10 08:24:40.230952	2026-09-10 08:24:40.230952
1640	13	PRD-1789018725877-R1789028680743	95.0000	95.0000	available	2026-09-10 08:24:40.745033	2026-09-10 08:24:40.745033
1641	13	PRD-1789018725877-R1789028680846	119.0000	119.0000	available	2026-09-10 08:24:40.848569	2026-09-10 08:24:40.848569
1642	13	PRD-1789018725877-R1789028680940	120.2000	120.2000	available	2026-09-10 08:24:40.942464	2026-09-10 08:24:40.942464
1643	13	PRD-1789018725877-R1789028681032	124.1000	124.1000	available	2026-09-10 08:24:41.035108	2026-09-10 08:24:41.035108
1644	13	PRD-1789018725877-R1789028681118	120.0000	120.0000	available	2026-09-10 08:24:41.128808	2026-09-10 08:24:41.128808
1647	13	PRD-1789018725877-R1789028681452	132.0000	132.0000	available	2026-09-10 08:24:41.453592	2026-09-10 08:24:41.453592
1650	13	PRD-1789018725877-R1789028681729	93.2000	93.2000	available	2026-09-10 08:24:41.73115	2026-09-10 08:24:41.73115
1658	13	PRD-1789018725877-R1789028682609	120.2000	120.2000	available	2026-09-10 08:24:42.610898	2026-09-10 08:24:42.610898
1659	13	PRD-1789018725877-R1789028682749	101.4000	101.4000	available	2026-09-10 08:24:42.750883	2026-09-10 08:24:42.750883
1660	13	PRD-1789018725877-R1789028682910	125.0000	125.0000	available	2026-09-10 08:24:42.918586	2026-09-10 08:24:42.918586
1663	13	PRD-1789018725877-R1789028683274	123.5000	123.5000	available	2026-09-10 08:24:43.275156	2026-09-10 08:24:43.275156
1667	13	PRD-1789018725877-R1789028683749	120.2000	120.2000	available	2026-09-10 08:24:43.751464	2026-09-10 08:24:43.751464
1668	13	PRD-1789018725877-R1789028683849	108.0000	108.0000	available	2026-09-10 08:24:43.858845	2026-09-10 08:24:43.858845
1670	13	PRD-1789018725877-R1789028684066	128.0000	128.0000	available	2026-09-10 08:24:44.067277	2026-09-10 08:24:44.067277
1673	13	PRD-1789018725877-R1789028684382	108.7000	108.7000	available	2026-09-10 08:24:44.384058	2026-09-10 08:24:44.384058
1674	13	PRD-1789018725877-R1789028684536	13.2300	13.2300	available	2026-09-10 08:24:44.538253	2026-09-10 08:24:44.538253
1675	13	PRD-1789018725877-R1789028684652	117.8000	117.8000	available	2026-09-10 08:24:44.653461	2026-09-10 08:24:44.653461
1939	51	PRD-1789029511477-R1789029596141	116.0000	116.0000	available	2026-09-10 08:39:56.143184	2026-09-10 08:39:56.143184
1940	51	PRD-1789029511477-R1789029596258	127.0000	127.0000	available	2026-09-10 08:39:56.260611	2026-09-10 08:39:56.260611
1941	51	PRD-1789029511477-R1789029596356	120.0000	120.0000	available	2026-09-10 08:39:56.35734	2026-09-10 08:39:56.35734
1943	51	PRD-1789029511477-R1789029596487	132.4000	132.4000	available	2026-09-10 08:39:56.489275	2026-09-10 08:39:56.489275
1946	51	PRD-1789029511477-R1789029596722	116.8000	116.8000	available	2026-09-10 08:39:56.723637	2026-09-10 08:39:56.723637
2100	54	PRD-1789031590529-R1789031727411	120.3000	120.3000	available	2026-09-10 09:15:27.411797	2026-09-10 09:15:27.411797
2102	54	PRD-1789031590529-R1789031727799	114.6000	114.6000	available	2026-09-10 09:15:27.800838	2026-09-10 09:15:27.800838
2105	54	PRD-1789031590529-R1789031728340	120.3000	120.3000	available	2026-09-10 09:15:28.341673	2026-09-10 09:15:28.341673
2106	54	PRD-1789031590529-R1789031728509	120.3000	120.3000	available	2026-09-10 09:15:28.511853	2026-09-10 09:15:28.511853
2108	54	PRD-1789031590529-R1789031728867	120.0000	120.0000	available	2026-09-10 09:15:28.873526	2026-09-10 09:15:28.873526
2109	54	PRD-1789031590529-R1789031729069	120.3000	120.3000	available	2026-09-10 09:15:29.070761	2026-09-10 09:15:29.070761
2110	54	PRD-1789031590529-R1789031729242	120.3000	120.3000	available	2026-09-10 09:15:29.243952	2026-09-10 09:15:29.243952
2111	54	PRD-1789031590529-R1789031729416	120.0000	120.0000	available	2026-09-10 09:15:29.417284	2026-09-10 09:15:29.417284
2123	54	PRD-1789031590529-R1789031732137	124.9000	124.9000	available	2026-09-10 09:15:32.138224	2026-09-10 09:15:32.138224
2124	54	PRD-1789031590529-R1789031732329	120.3000	120.3000	available	2026-09-10 09:15:32.330636	2026-09-10 09:15:32.330636
2125	54	PRD-1789031590529-R1789031732537	120.3000	120.3000	available	2026-09-10 09:15:32.539278	2026-09-10 09:15:32.539278
2130	54	PRD-1789031590529-R1789031733534	120.3000	120.3000	available	2026-09-10 09:15:33.535549	2026-09-10 09:15:33.535549
2131	54	PRD-1789031590529-R1789031733727	116.6000	116.6000	available	2026-09-10 09:15:33.728924	2026-09-10 09:15:33.728924
2132	54	PRD-1789031590529-R1789031733898	120.3000	120.3000	available	2026-09-10 09:15:33.898914	2026-09-10 09:15:33.898914
2133	54	PRD-1789031590529-R1789031734094	118.9000	118.9000	available	2026-09-10 09:15:34.094861	2026-09-10 09:15:34.094861
2134	54	PRD-1789031590529-R1789031734302	118.3000	118.3000	available	2026-09-10 09:15:34.30331	2026-09-10 09:15:34.30331
2138	54	PRD-1789031590529-R1789031735145	120.3000	120.3000	available	2026-09-10 09:15:35.146479	2026-09-10 09:15:35.146479
2139	54	PRD-1789031590529-R1789031735321	61.0000	61.0000	available	2026-09-10 09:15:35.322641	2026-09-10 09:15:35.322641
2168	26	PRD-1789021819488-R1789031983826	112.4000	112.4000	available	2026-09-10 09:19:43.830077	2026-09-10 09:19:43.830077
2169	26	PRD-1789021819488-R1789031984042	128.0000	128.0000	available	2026-09-10 09:19:44.043638	2026-09-10 09:19:44.043638
2171	26	PRD-1789021819488-R1789031984488	123.9000	123.9000	available	2026-09-10 09:19:44.49411	2026-09-10 09:19:44.49411
2172	26	PRD-1789021819488-R1789031984728	114.7000	114.7000	available	2026-09-10 09:19:44.731126	2026-09-10 09:19:44.731126
2173	26	PRD-1789021819488-R1789031984977	112.0000	112.0000	available	2026-09-10 09:19:44.982419	2026-09-10 09:19:44.982419
2174	26	PRD-1789021819488-R1789031985171	113.0000	113.0000	available	2026-09-10 09:19:45.17265	2026-09-10 09:19:45.17265
2175	26	PRD-1789021819488-R1789031985373	123.8000	123.8000	available	2026-09-10 09:19:45.37472	2026-09-10 09:19:45.37472
2178	26	PRD-1789021819488-R1789031986034	135.0000	135.0000	available	2026-09-10 09:19:46.035716	2026-09-10 09:19:46.035716
2186	26	PRD-1789021819488-R1789031987925	128.8000	128.8000	available	2026-09-10 09:19:47.925797	2026-09-10 09:19:47.925797
2187	26	PRD-1789021819488-R1789031988176	119.5000	119.5000	available	2026-09-10 09:19:48.178184	2026-09-10 09:19:48.178184
2188	26	PRD-1789021819488-R1789031988397	110.6000	110.6000	available	2026-09-10 09:19:48.398977	2026-09-10 09:19:48.398977
2191	26	PRD-1789021819488-R1789031989010	125.6000	125.6000	available	2026-09-10 09:19:49.012659	2026-09-10 09:19:49.012659
2193	26	PRD-1789021819488-R1789031989462	124.5000	124.5000	available	2026-09-10 09:19:49.464908	2026-09-10 09:19:49.464908
2194	26	PRD-1789021819488-R1789031989666	125.0000	125.0000	available	2026-09-10 09:19:49.668931	2026-09-10 09:19:49.668931
2203	26	PRD-1789021819488-R1789031992710	117.4000	117.4000	available	2026-09-10 09:19:52.71116	2026-09-10 09:19:52.71116
2204	26	PRD-1789021819488-R1789031992982	115.0000	115.0000	available	2026-09-10 09:19:52.983999	2026-09-10 09:19:52.983999
2210	26	PRD-1789021819488-R1789031994525	108.0000	108.0000	available	2026-09-10 09:19:54.528087	2026-09-10 09:19:54.528087
1023	25	PRD-1789021016427-R1789025190601	120.6000	120.6000	available	2026-09-10 07:26:30.602332	2026-09-10 07:26:30.602332
1024	25	PRD-1789021016427-R1789025190684	120.4000	120.4000	available	2026-09-10 07:26:30.6855	2026-09-10 07:26:30.6855
1029	35	PRD-1789025218677-R1789025226588	76.0000	76.0000	available	2026-09-10 07:27:06.589241	2026-09-10 07:27:06.589241
1030	20	PRD-1789019067284-R1789025307730	128.8000	128.8000	available	2026-09-10 07:28:27.731443	2026-09-10 07:28:27.731443
1031	20	PRD-1789019067284-R1789025307883	116.9000	116.9000	available	2026-09-10 07:28:27.884505	2026-09-10 07:28:27.884505
1032	20	PRD-1789019067284-R1789025307997	116.2000	116.2000	available	2026-09-10 07:28:27.999915	2026-09-10 07:28:27.999915
1033	20	PRD-1789019067284-R1789025308110	120.0000	120.0000	available	2026-09-10 07:28:28.111414	2026-09-10 07:28:28.111414
1034	20	PRD-1789019067284-R1789025308215	108.3000	108.3000	available	2026-09-10 07:28:28.217011	2026-09-10 07:28:28.217011
1035	20	PRD-1789019067284-R1789025308355	120.0000	120.0000	available	2026-09-10 07:28:28.356067	2026-09-10 07:28:28.356067
1036	20	PRD-1789019067284-R1789025308485	120.0000	120.0000	available	2026-09-10 07:28:28.487052	2026-09-10 07:28:28.487052
1037	20	PRD-1789019067284-R1789025308636	120.2000	120.2000	available	2026-09-10 07:28:28.638041	2026-09-10 07:28:28.638041
1038	20	PRD-1789019067284-R1789025308756	120.0000	120.0000	available	2026-09-10 07:28:28.757469	2026-09-10 07:28:28.757469
1039	20	PRD-1789019067284-R1789025308861	118.0000	118.0000	available	2026-09-10 07:28:28.862737	2026-09-10 07:28:28.862737
1040	20	PRD-1789019067284-R1789025308975	120.0000	120.0000	available	2026-09-10 07:28:28.976402	2026-09-10 07:28:28.976402
1041	20	PRD-1789019067284-R1789025309098	48.2000	48.2000	available	2026-09-10 07:28:29.099953	2026-09-10 07:28:29.099953
1042	20	PRD-1789019067284-R1789025309260	119.0000	119.0000	available	2026-09-10 07:28:29.262047	2026-09-10 07:28:29.262047
1043	20	PRD-1789019067284-R1789025309407	120.0000	120.0000	available	2026-09-10 07:28:29.409327	2026-09-10 07:28:29.409327
1044	20	PRD-1789019067284-R1789025309529	116.2000	116.2000	available	2026-09-10 07:28:29.530713	2026-09-10 07:28:29.530713
1045	20	PRD-1789019067284-R1789025309650	120.3000	120.3000	available	2026-09-10 07:28:29.652246	2026-09-10 07:28:29.652246
1046	20	PRD-1789019067284-R1789025309763	131.0000	131.0000	available	2026-09-10 07:28:29.76459	2026-09-10 07:28:29.76459
1047	20	PRD-1789019067284-R1789025309876	122.8000	122.8000	available	2026-09-10 07:28:29.877601	2026-09-10 07:28:29.877601
1048	20	PRD-1789019067284-R1789025309990	118.0000	118.0000	available	2026-09-10 07:28:29.990898	2026-09-10 07:28:29.990898
1049	20	PRD-1789019067284-R1789025310101	97.8000	97.8000	available	2026-09-10 07:28:30.10288	2026-09-10 07:28:30.10288
1050	20	PRD-1789019067284-R1789025310211	120.3000	120.3000	available	2026-09-10 07:28:30.212315	2026-09-10 07:28:30.212315
1051	20	PRD-1789019067284-R1789025310320	120.0000	120.0000	available	2026-09-10 07:28:30.321034	2026-09-10 07:28:30.321034
1052	20	PRD-1789019067284-R1789025310438	116.0000	116.0000	available	2026-09-10 07:28:30.439669	2026-09-10 07:28:30.439669
1053	10	PRD-1789018615683-R1789025394766	81.5000	81.5000	available	2026-09-10 07:29:54.76784	2026-09-10 07:29:54.76784
1054	10	PRD-1789018615683-R1789025394836	90.6000	90.6000	available	2026-09-10 07:29:54.838244	2026-09-10 07:29:54.838244
1055	10	PRD-1789018615683-R1789025395002	116.3000	116.3000	available	2026-09-10 07:29:55.003792	2026-09-10 07:29:55.003792
1056	10	PRD-1789018615683-R1789025395128	106.0000	106.0000	available	2026-09-10 07:29:55.129045	2026-09-10 07:29:55.129045
1057	10	PRD-1789018615683-R1789025395219	124.1000	124.1000	available	2026-09-10 07:29:55.221181	2026-09-10 07:29:55.221181
1058	10	PRD-1789018615683-R1789025395320	116.3000	116.3000	available	2026-09-10 07:29:55.321306	2026-09-10 07:29:55.321306
1059	10	PRD-1789018615683-R1789025395417	117.8000	117.8000	available	2026-09-10 07:29:55.418834	2026-09-10 07:29:55.418834
1060	10	PRD-1789018615683-R1789025395495	114.7000	114.7000	available	2026-09-10 07:29:55.49913	2026-09-10 07:29:55.49913
1061	10	PRD-1789018615683-R1789025395606	125.0000	125.0000	available	2026-09-10 07:29:55.610564	2026-09-10 07:29:55.610564
1062	10	PRD-1789018615683-R1789025395727	117.3000	117.3000	available	2026-09-10 07:29:55.728609	2026-09-10 07:29:55.728609
1063	10	PRD-1789018615683-R1789025395817	118.7000	118.7000	available	2026-09-10 07:29:55.819107	2026-09-10 07:29:55.819107
1064	10	PRD-1789018615683-R1789025395936	117.6000	117.6000	available	2026-09-10 07:29:55.93814	2026-09-10 07:29:55.93814
1065	10	PRD-1789018615683-R1789025396028	101.7000	101.7000	available	2026-09-10 07:29:56.029711	2026-09-10 07:29:56.029711
1066	10	PRD-1789018615683-R1789025396119	116.1000	116.1000	available	2026-09-10 07:29:56.12126	2026-09-10 07:29:56.12126
1067	10	PRD-1789018615683-R1789025396219	116.7000	116.7000	available	2026-09-10 07:29:56.222635	2026-09-10 07:29:56.222635
1068	10	PRD-1789018615683-R1789025396324	116.3000	116.3000	available	2026-09-10 07:29:56.326079	2026-09-10 07:29:56.326079
1069	10	PRD-1789018615683-R1789025396427	115.9000	115.9000	available	2026-09-10 07:29:56.428944	2026-09-10 07:29:56.428944
1070	10	PRD-1789018615683-R1789025396541	89.8000	89.8000	available	2026-09-10 07:29:56.542965	2026-09-10 07:29:56.542965
1071	10	PRD-1789018615683-R1789025396673	94.5000	94.5000	available	2026-09-10 07:29:56.675345	2026-09-10 07:29:56.675345
1072	10	PRD-1789018615683-R1789025396792	116.9000	116.9000	available	2026-09-10 07:29:56.795142	2026-09-10 07:29:56.795142
1073	10	PRD-1789018615683-R1789025396891	120.5000	120.5000	available	2026-09-10 07:29:56.891989	2026-09-10 07:29:56.891989
1074	10	PRD-1789018615683-R1789025397001	116.8000	116.8000	available	2026-09-10 07:29:57.003188	2026-09-10 07:29:57.003188
1075	10	PRD-1789018615683-R1789025397109	123.5000	123.5000	available	2026-09-10 07:29:57.110532	2026-09-10 07:29:57.110532
1076	10	PRD-1789018615683-R1789025397227	98.1000	98.1000	available	2026-09-10 07:29:57.228821	2026-09-10 07:29:57.228821
1077	10	PRD-1789018615683-R1789025397335	116.7000	116.7000	available	2026-09-10 07:29:57.3375	2026-09-10 07:29:57.3375
1078	10	PRD-1789018615683-R1789025397452	120.1000	120.1000	available	2026-09-10 07:29:57.453695	2026-09-10 07:29:57.453695
1079	10	PRD-1789018615683-R1789025397562	117.0000	117.0000	available	2026-09-10 07:29:57.563994	2026-09-10 07:29:57.563994
1080	10	PRD-1789018615683-R1789025397686	115.2000	115.2000	available	2026-09-10 07:29:57.688736	2026-09-10 07:29:57.688736
1081	10	PRD-1789018615683-R1789025397750	123.4000	123.4000	available	2026-09-10 07:29:57.752586	2026-09-10 07:29:57.752586
1082	10	PRD-1789018615683-R1789025397840	119.3000	119.3000	available	2026-09-10 07:29:57.841892	2026-09-10 07:29:57.841892
1083	10	PRD-1789018615683-R1789025397948	123.6000	123.6000	available	2026-09-10 07:29:57.951063	2026-09-10 07:29:57.951063
1084	10	PRD-1789018615683-R1789025398045	116.6000	116.6000	available	2026-09-10 07:29:58.046148	2026-09-10 07:29:58.046148
1085	10	PRD-1789018615683-R1789025398148	116.0000	116.0000	available	2026-09-10 07:29:58.149042	2026-09-10 07:29:58.149042
1086	10	PRD-1789018615683-R1789025398257	116.7000	116.7000	available	2026-09-10 07:29:58.259277	2026-09-10 07:29:58.259277
1087	10	PRD-1789018615683-R1789025398372	117.9000	117.9000	available	2026-09-10 07:29:58.374573	2026-09-10 07:29:58.374573
1088	10	PRD-1789018615683-R1789025398514	98.8000	98.8000	available	2026-09-10 07:29:58.515565	2026-09-10 07:29:58.515565
1089	10	PRD-1789018615683-R1789025398625	112.9000	112.9000	available	2026-09-10 07:29:58.628091	2026-09-10 07:29:58.628091
1090	10	PRD-1789018615683-R1789025398758	115.0000	115.0000	available	2026-09-10 07:29:58.760151	2026-09-10 07:29:58.760151
1091	10	PRD-1789018615683-R1789025398870	113.5000	113.5000	available	2026-09-10 07:29:58.871781	2026-09-10 07:29:58.871781
1092	10	PRD-1789018615683-R1789025398985	116.3000	116.3000	available	2026-09-10 07:29:58.987329	2026-09-10 07:29:58.987329
1093	36	PRD-1789025355244-R1789025688187	120.2000	120.2000	available	2026-09-10 07:34:48.188226	2026-09-10 07:34:48.188226
1094	36	PRD-1789025355244-R1789025689513	120.9000	120.9000	available	2026-09-10 07:34:49.514343	2026-09-10 07:34:49.514343
1095	36	PRD-1789025355244-R1789025689655	122.3000	122.3000	available	2026-09-10 07:34:49.657154	2026-09-10 07:34:49.657154
1096	36	PRD-1789025355244-R1789025689801	119.1000	119.1000	available	2026-09-10 07:34:49.802689	2026-09-10 07:34:49.802689
1097	36	PRD-1789025355244-R1789025689907	120.8000	120.8000	available	2026-09-10 07:34:49.909108	2026-09-10 07:34:49.909108
1098	36	PRD-1789025355244-R1789025690038	121.1000	121.1000	available	2026-09-10 07:34:50.039894	2026-09-10 07:34:50.039894
1099	36	PRD-1789025355244-R1789025690146	120.1000	120.1000	available	2026-09-10 07:34:50.147464	2026-09-10 07:34:50.147464
1100	36	PRD-1789025355244-R1789025690252	120.4000	120.4000	available	2026-09-10 07:34:50.253279	2026-09-10 07:34:50.253279
1103	36	PRD-1789025355244-R1789025690617	119.3000	119.3000	available	2026-09-10 07:34:50.620287	2026-09-10 07:34:50.620287
1104	36	PRD-1789025355244-R1789025690775	120.9000	120.9000	available	2026-09-10 07:34:50.787959	2026-09-10 07:34:50.787959
1105	36	PRD-1789025355244-R1789025691131	118.8000	118.8000	available	2026-09-10 07:34:51.132942	2026-09-10 07:34:51.132942
1107	36	PRD-1789025355244-R1789025691387	118.0000	118.0000	available	2026-09-10 07:34:51.388988	2026-09-10 07:34:51.388988
1110	36	PRD-1789025355244-R1789025691725	118.0000	118.0000	available	2026-09-10 07:34:51.726378	2026-09-10 07:34:51.726378
1115	36	PRD-1789025355244-R1789025692484	118.0000	118.0000	available	2026-09-10 07:34:52.485313	2026-09-10 07:34:52.485313
1116	36	PRD-1789025355244-R1789025692601	118.0000	118.0000	available	2026-09-10 07:34:52.601925	2026-09-10 07:34:52.601925
1117	36	PRD-1789025355244-R1789025692701	118.0000	118.0000	available	2026-09-10 07:34:52.70238	2026-09-10 07:34:52.70238
1122	36	PRD-1789025355244-R1789025693460	115.2000	115.2000	available	2026-09-10 07:34:53.46127	2026-09-10 07:34:53.46127
1123	36	PRD-1789025355244-R1789025693576	117.3000	117.3000	available	2026-09-10 07:34:53.577227	2026-09-10 07:34:53.577227
1125	36	PRD-1789025355244-R1789025693790	95.6000	95.6000	available	2026-09-10 07:34:53.791796	2026-09-10 07:34:53.791796
1126	36	PRD-1789025355244-R1789025693899	117.2000	117.2000	available	2026-09-10 07:34:53.900237	2026-09-10 07:34:53.900237
1127	36	PRD-1789025355244-R1789025694031	118.0000	118.0000	available	2026-09-10 07:34:54.032616	2026-09-10 07:34:54.032616
1128	36	PRD-1789025355244-R1789025694176	109.8000	109.8000	available	2026-09-10 07:34:54.176883	2026-09-10 07:34:54.176883
1129	36	PRD-1789025355244-R1789025694288	129.0000	129.0000	available	2026-09-10 07:34:54.288808	2026-09-10 07:34:54.288808
1130	36	PRD-1789025355244-R1789025694395	121.9000	121.9000	available	2026-09-10 07:34:54.39662	2026-09-10 07:34:54.39662
1137	36	PRD-1789025355244-R1789025695255	119.1000	119.1000	available	2026-09-10 07:34:55.257083	2026-09-10 07:34:55.257083
1141	36	PRD-1789025355244-R1789025695754	121.0000	121.0000	available	2026-09-10 07:34:55.755555	2026-09-10 07:34:55.755555
1144	36	PRD-1789025355244-R1789025696085	89.3000	89.3000	available	2026-09-10 07:34:56.08675	2026-09-10 07:34:56.08675
1145	36	PRD-1789025355244-R1789025696199	126.8000	126.8000	available	2026-09-10 07:34:56.199972	2026-09-10 07:34:56.199972
1162	36	PRD-1789025355244-R1789025698309	118.0000	118.0000	available	2026-09-10 07:34:58.312108	2026-09-10 07:34:58.312108
1164	36	PRD-1789025355244-R1789025698573	117.3000	117.3000	available	2026-09-10 07:34:58.57537	2026-09-10 07:34:58.57537
1178	36	PRD-1789025355244-R1789025701593	114.0000	114.0000	available	2026-09-10 07:35:01.594769	2026-09-10 07:35:01.594769
1180	36	PRD-1789025355244-R1789025701921	113.7000	113.7000	available	2026-09-10 07:35:01.922708	2026-09-10 07:35:01.922708
1182	36	PRD-1789025355244-R1789025702235	113.9000	113.9000	available	2026-09-10 07:35:02.237051	2026-09-10 07:35:02.237051
1183	36	PRD-1789025355244-R1789025702380	109.9000	109.9000	available	2026-09-10 07:35:02.383867	2026-09-10 07:35:02.383867
1184	36	PRD-1789025355244-R1789025702523	116.0000	116.0000	available	2026-09-10 07:35:02.526013	2026-09-10 07:35:02.526013
1186	36	PRD-1789025355244-R1789025702792	113.5000	113.5000	available	2026-09-10 07:35:02.794145	2026-09-10 07:35:02.794145
1189	36	PRD-1789025355244-R1789025703256	114.4000	114.4000	available	2026-09-10 07:35:03.260344	2026-09-10 07:35:03.260344
1191	36	PRD-1789025355244-R1789025703606	101.0000	101.0000	available	2026-09-10 07:35:03.608004	2026-09-10 07:35:03.608004
1194	36	PRD-1789025355244-R1789025704158	112.7000	112.7000	available	2026-09-10 07:35:04.159613	2026-09-10 07:35:04.159613
1195	36	PRD-1789025355244-R1789025704257	119.0000	119.0000	available	2026-09-10 07:35:04.26376	2026-09-10 07:35:04.26376
1199	36	PRD-1789025355244-R1789025705448	113.9000	113.9000	available	2026-09-10 07:35:05.44944	2026-09-10 07:35:05.44944
1202	36	PRD-1789025355244-R1789025705860	114.1000	114.1000	available	2026-09-10 07:35:05.861439	2026-09-10 07:35:05.861439
1203	36	PRD-1789025355244-R1789025706017	119.0000	119.0000	available	2026-09-10 07:35:06.018379	2026-09-10 07:35:06.018379
1204	36	PRD-1789025355244-R1789025706152	115.2000	115.2000	available	2026-09-10 07:35:06.153522	2026-09-10 07:35:06.153522
1360	29	PRD-1789024785302-R1789026572300	65.0000	65.0000	available	2026-09-10 07:49:32.312242	2026-09-10 07:49:32.312242
1362	38	PRD-1789026598443-R1789026607341	77.0000	77.0000	available	2026-09-10 07:50:07.343222	2026-09-10 07:50:07.343222
1471	7	PRD-1789018404302-R1789027765930	113.3000	113.3000	available	2026-09-10 08:09:25.931975	2026-09-10 08:09:25.931975
1472	43	PRD-1789027995648-R1789028002638	85.7000	85.7000	available	2026-09-10 08:13:22.639546	2026-09-10 08:13:22.639546
1473	1	PRD-1789017671180-R1789028027721	115.1000	115.1000	available	2026-09-10 08:13:47.723245	2026-09-10 08:13:47.723245
1474	1	PRD-1789017671180-R1789028027911	124.3000	124.3000	available	2026-09-10 08:13:47.913004	2026-09-10 08:13:47.913004
1493	1	PRD-1789017671180-R1789028033434	115.5000	115.5000	available	2026-09-10 08:13:53.435967	2026-09-10 08:13:53.435967
1494	1	PRD-1789017671180-R1789028033625	137.0000	137.0000	available	2026-09-10 08:13:53.626027	2026-09-10 08:13:53.626027
1501	1	PRD-1789017671180-R1789028035040	117.0000	117.0000	available	2026-09-10 08:13:55.040806	2026-09-10 08:13:55.040806
1502	1	PRD-1789017671180-R1789028035234	118.2000	118.2000	available	2026-09-10 08:13:55.235163	2026-09-10 08:13:55.235163
1503	1	PRD-1789017671180-R1789028035443	117.0000	117.0000	available	2026-09-10 08:13:55.444575	2026-09-10 08:13:55.444575
1506	1	PRD-1789017671180-R1789028036058	117.0000	117.0000	available	2026-09-10 08:13:56.059146	2026-09-10 08:13:56.059146
1508	1	PRD-1789017671180-R1789028036484	120.5000	120.5000	available	2026-09-10 08:13:56.485109	2026-09-10 08:13:56.485109
1511	1	PRD-1789017671180-R1789028037162	120.5000	120.5000	available	2026-09-10 08:13:57.163469	2026-09-10 08:13:57.163469
1512	1	PRD-1789017671180-R1789028037367	120.5000	120.5000	available	2026-09-10 08:13:57.368659	2026-09-10 08:13:57.368659
1513	1	PRD-1789017671180-R1789028037566	120.5000	120.5000	available	2026-09-10 08:13:57.569884	2026-09-10 08:13:57.569884
1515	1	PRD-1789017671180-R1789028038019	120.5000	120.5000	available	2026-09-10 08:13:58.020655	2026-09-10 08:13:58.020655
1518	1	PRD-1789017671180-R1789028038652	110.5000	110.5000	available	2026-09-10 08:13:58.654035	2026-09-10 08:13:58.654035
1519	1	PRD-1789017671180-R1789028038875	79.0000	79.0000	available	2026-09-10 08:13:58.876635	2026-09-10 08:13:58.876635
1521	1	PRD-1789017671180-R1789028039290	120.5000	120.5000	available	2026-09-10 08:13:59.291266	2026-09-10 08:13:59.291266
1544	1	PRD-1789017671180-R1789028044644	117.0000	117.0000	available	2026-09-10 08:14:04.645735	2026-09-10 08:14:04.645735
1545	1	PRD-1789017671180-R1789028044864	117.0000	117.0000	available	2026-09-10 08:14:04.866127	2026-09-10 08:14:04.866127
1558	1	PRD-1789017671180-R1789028046890	120.5000	120.5000	available	2026-09-10 08:14:06.891419	2026-09-10 08:14:06.891419
1677	7	PRD-1789018404302-R1789028826924	113.4000	113.4000	available	2026-09-10 08:27:06.925321	2026-09-10 08:27:06.925321
1678	7	PRD-1789018404302-R1789028827010	117.3000	117.3000	available	2026-09-10 08:27:07.012193	2026-09-10 08:27:07.012193
1680	7	PRD-1789018404302-R1789028827638	117.3000	117.3000	available	2026-09-10 08:27:07.639603	2026-09-10 08:27:07.639603
1683	7	PRD-1789018404302-R1789028828583	116.8000	116.8000	available	2026-09-10 08:27:08.587281	2026-09-10 08:27:08.587281
1684	7	PRD-1789018404302-R1789028828903	112.3000	112.3000	available	2026-09-10 08:27:08.904856	2026-09-10 08:27:08.904856
1685	7	PRD-1789018404302-R1789028829228	110.8000	110.8000	available	2026-09-10 08:27:09.230194	2026-09-10 08:27:09.230194
1686	7	PRD-1789018404302-R1789028829586	122.6000	122.6000	available	2026-09-10 08:27:09.588274	2026-09-10 08:27:09.588274
1689	7	PRD-1789018404302-R1789028830565	118.8000	118.8000	available	2026-09-10 08:27:10.568657	2026-09-10 08:27:10.568657
1692	7	PRD-1789018404302-R1789028831651	112.0000	112.0000	available	2026-09-10 08:27:11.652904	2026-09-10 08:27:11.652904
1693	7	PRD-1789018404302-R1789028831960	129.8000	129.8000	available	2026-09-10 08:27:11.962289	2026-09-10 08:27:11.962289
1101	36	PRD-1789025355244-R1789025690367	113.7000	113.7000	available	2026-09-10 07:34:50.368586	2026-09-10 07:34:50.368586
1102	36	PRD-1789025355244-R1789025690470	113.7000	113.7000	available	2026-09-10 07:34:50.476087	2026-09-10 07:34:50.476087
1106	36	PRD-1789025355244-R1789025691266	118.5000	118.5000	available	2026-09-10 07:34:51.26777	2026-09-10 07:34:51.26777
1108	36	PRD-1789025355244-R1789025691500	118.0000	118.0000	available	2026-09-10 07:34:51.501012	2026-09-10 07:34:51.501012
1109	36	PRD-1789025355244-R1789025691596	118.0000	118.0000	available	2026-09-10 07:34:51.598108	2026-09-10 07:34:51.598108
1111	36	PRD-1789025355244-R1789025691877	118.0000	118.0000	available	2026-09-10 07:34:51.884328	2026-09-10 07:34:51.884328
1112	36	PRD-1789025355244-R1789025692037	118.0000	118.0000	available	2026-09-10 07:34:52.038985	2026-09-10 07:34:52.038985
1113	36	PRD-1789025355244-R1789025692160	118.0000	118.0000	available	2026-09-10 07:34:52.164649	2026-09-10 07:34:52.164649
1114	36	PRD-1789025355244-R1789025692289	118.0000	118.0000	available	2026-09-10 07:34:52.290706	2026-09-10 07:34:52.290706
1118	36	PRD-1789025355244-R1789025692801	118.0000	118.0000	available	2026-09-10 07:34:52.802585	2026-09-10 07:34:52.802585
1119	36	PRD-1789025355244-R1789025692980	118.0000	118.0000	available	2026-09-10 07:34:52.981673	2026-09-10 07:34:52.981673
1120	36	PRD-1789025355244-R1789025693160	118.0000	118.0000	available	2026-09-10 07:34:53.161781	2026-09-10 07:34:53.161781
1121	36	PRD-1789025355244-R1789025693297	118.0000	118.0000	available	2026-09-10 07:34:53.309326	2026-09-10 07:34:53.309326
1124	36	PRD-1789025355244-R1789025693678	124.6000	124.6000	available	2026-09-10 07:34:53.679936	2026-09-10 07:34:53.679936
1131	36	PRD-1789025355244-R1789025694515	119.9000	119.9000	available	2026-09-10 07:34:54.516985	2026-09-10 07:34:54.516985
1132	36	PRD-1789025355244-R1789025694668	120.5000	120.5000	available	2026-09-10 07:34:54.669757	2026-09-10 07:34:54.669757
1133	36	PRD-1789025355244-R1789025694775	121.0000	121.0000	available	2026-09-10 07:34:54.776966	2026-09-10 07:34:54.776966
1134	36	PRD-1789025355244-R1789025694894	120.6000	120.6000	available	2026-09-10 07:34:54.895769	2026-09-10 07:34:54.895769
1135	36	PRD-1789025355244-R1789025695024	121.6000	121.6000	available	2026-09-10 07:34:55.02529	2026-09-10 07:34:55.02529
1136	36	PRD-1789025355244-R1789025695126	118.7000	118.7000	available	2026-09-10 07:34:55.12787	2026-09-10 07:34:55.12787
1138	36	PRD-1789025355244-R1789025695405	122.7000	122.7000	available	2026-09-10 07:34:55.408795	2026-09-10 07:34:55.408795
1139	36	PRD-1789025355244-R1789025695515	119.6000	119.6000	available	2026-09-10 07:34:55.516421	2026-09-10 07:34:55.516421
1140	36	PRD-1789025355244-R1789025695630	119.4000	119.4000	available	2026-09-10 07:34:55.632957	2026-09-10 07:34:55.632957
1142	36	PRD-1789025355244-R1789025695855	108.0000	108.0000	available	2026-09-10 07:34:55.856389	2026-09-10 07:34:55.856389
1143	36	PRD-1789025355244-R1789025695966	117.0000	117.0000	available	2026-09-10 07:34:55.967356	2026-09-10 07:34:55.967356
1146	36	PRD-1789025355244-R1789025696301	117.3000	117.3000	available	2026-09-10 07:34:56.302573	2026-09-10 07:34:56.302573
1147	36	PRD-1789025355244-R1789025696427	118.0000	118.0000	available	2026-09-10 07:34:56.428419	2026-09-10 07:34:56.428419
1148	36	PRD-1789025355244-R1789025696568	96.6000	96.6000	available	2026-09-10 07:34:56.569846	2026-09-10 07:34:56.569846
1149	36	PRD-1789025355244-R1789025696678	121.2000	121.2000	available	2026-09-10 07:34:56.679674	2026-09-10 07:34:56.679674
1150	36	PRD-1789025355244-R1789025696788	120.2000	120.2000	available	2026-09-10 07:34:56.79162	2026-09-10 07:34:56.79162
1151	36	PRD-1789025355244-R1789025696910	119.5000	119.5000	available	2026-09-10 07:34:56.91228	2026-09-10 07:34:56.91228
1152	36	PRD-1789025355244-R1789025697041	118.0000	118.0000	available	2026-09-10 07:34:57.041997	2026-09-10 07:34:57.041997
1153	36	PRD-1789025355244-R1789025697173	118.0000	118.0000	available	2026-09-10 07:34:57.175878	2026-09-10 07:34:57.175878
1154	36	PRD-1789025355244-R1789025697304	118.0000	118.0000	available	2026-09-10 07:34:57.306085	2026-09-10 07:34:57.306085
1155	36	PRD-1789025355244-R1789025697412	141.0000	141.0000	available	2026-09-10 07:34:57.420954	2026-09-10 07:34:57.420954
1156	36	PRD-1789025355244-R1789025697544	118.0000	118.0000	available	2026-09-10 07:34:57.545559	2026-09-10 07:34:57.545559
1157	36	PRD-1789025355244-R1789025697666	118.0000	118.0000	available	2026-09-10 07:34:57.667742	2026-09-10 07:34:57.667742
1158	36	PRD-1789025355244-R1789025697803	103.1000	103.1000	available	2026-09-10 07:34:57.805122	2026-09-10 07:34:57.805122
1159	36	PRD-1789025355244-R1789025697911	118.0000	118.0000	available	2026-09-10 07:34:57.912324	2026-09-10 07:34:57.912324
1160	36	PRD-1789025355244-R1789025698048	107.7000	107.7000	available	2026-09-10 07:34:58.049459	2026-09-10 07:34:58.049459
1161	36	PRD-1789025355244-R1789025698165	118.0000	118.0000	available	2026-09-10 07:34:58.16628	2026-09-10 07:34:58.16628
1163	36	PRD-1789025355244-R1789025698426	118.0000	118.0000	available	2026-09-10 07:34:58.428725	2026-09-10 07:34:58.428725
1165	36	PRD-1789025355244-R1789025698718	112.0000	112.0000	available	2026-09-10 07:34:58.719597	2026-09-10 07:34:58.719597
1166	36	PRD-1789025355244-R1789025698842	112.0000	112.0000	available	2026-09-10 07:34:58.843312	2026-09-10 07:34:58.843312
1167	36	PRD-1789025355244-R1789025698965	116.0000	116.0000	available	2026-09-10 07:34:58.966173	2026-09-10 07:34:58.966173
1168	36	PRD-1789025355244-R1789025699130	112.1000	112.1000	available	2026-09-10 07:34:59.141918	2026-09-10 07:34:59.141918
1169	36	PRD-1789025355244-R1789025699326	112.0000	112.0000	available	2026-09-10 07:34:59.327235	2026-09-10 07:34:59.327235
1170	36	PRD-1789025355244-R1789025699448	118.4000	118.4000	available	2026-09-10 07:34:59.449429	2026-09-10 07:34:59.449429
1171	36	PRD-1789025355244-R1789025699626	112.0000	112.0000	available	2026-09-10 07:34:59.628108	2026-09-10 07:34:59.628108
1172	36	PRD-1789025355244-R1789025699757	115.6000	115.6000	available	2026-09-10 07:34:59.758734	2026-09-10 07:34:59.758734
1173	36	PRD-1789025355244-R1789025699888	114.0000	114.0000	available	2026-09-10 07:34:59.890749	2026-09-10 07:34:59.890749
1174	36	PRD-1789025355244-R1789025700072	0.0000	0.0000	available	2026-09-10 07:35:00.07548	2026-09-10 07:35:00.07548
1175	36	PRD-1789025355244-R1789025700212	114.0000	114.0000	available	2026-09-10 07:35:00.213245	2026-09-10 07:35:00.213245
1176	36	PRD-1789025355244-R1789025700337	114.0000	114.0000	available	2026-09-10 07:35:00.338104	2026-09-10 07:35:00.338104
1177	36	PRD-1789025355244-R1789025701451	107.4000	107.4000	available	2026-09-10 07:35:01.454506	2026-09-10 07:35:01.454506
1179	36	PRD-1789025355244-R1789025701765	116.2000	116.2000	available	2026-09-10 07:35:01.769711	2026-09-10 07:35:01.769711
1181	36	PRD-1789025355244-R1789025702115	113.9000	113.9000	available	2026-09-10 07:35:02.118805	2026-09-10 07:35:02.118805
1185	36	PRD-1789025355244-R1789025702652	106.6000	106.6000	available	2026-09-10 07:35:02.653519	2026-09-10 07:35:02.653519
1187	36	PRD-1789025355244-R1789025702915	108.4000	108.4000	available	2026-09-10 07:35:02.916556	2026-09-10 07:35:02.916556
1188	36	PRD-1789025355244-R1789025703090	116.2000	116.2000	available	2026-09-10 07:35:03.092017	2026-09-10 07:35:03.092017
1190	36	PRD-1789025355244-R1789025703421	113.9000	113.9000	available	2026-09-10 07:35:03.424927	2026-09-10 07:35:03.424927
1192	36	PRD-1789025355244-R1789025703802	95.4000	95.4000	available	2026-09-10 07:35:03.807138	2026-09-10 07:35:03.807138
1193	36	PRD-1789025355244-R1789025704022	109.0000	109.0000	available	2026-09-10 07:35:04.024967	2026-09-10 07:35:04.024967
1196	36	PRD-1789025355244-R1789025704830	104.4000	104.4000	available	2026-09-10 07:35:04.831888	2026-09-10 07:35:04.831888
1197	36	PRD-1789025355244-R1789025705149	105.6000	105.6000	available	2026-09-10 07:35:05.152622	2026-09-10 07:35:05.152622
1198	36	PRD-1789025355244-R1789025705280	110.0000	110.0000	available	2026-09-10 07:35:05.281131	2026-09-10 07:35:05.281131
1200	36	PRD-1789025355244-R1789025705566	110.5000	110.5000	available	2026-09-10 07:35:05.566919	2026-09-10 07:35:05.566919
1201	36	PRD-1789025355244-R1789025705725	99.7000	99.7000	available	2026-09-10 07:35:05.726828	2026-09-10 07:35:05.726828
1361	29	PRD-1789024785302-R1789026572450	65.0000	65.0000	available	2026-09-10 07:49:32.451776	2026-09-10 07:49:32.451776
1475	1	PRD-1789017671180-R1789028028180	106.9000	106.9000	available	2026-09-10 08:13:48.181759	2026-09-10 08:13:48.181759
1476	1	PRD-1789017671180-R1789028028441	114.6000	114.6000	available	2026-09-10 08:13:48.442956	2026-09-10 08:13:48.442956
1478	1	PRD-1789017671180-R1789028030372	115.3000	115.3000	available	2026-09-10 08:13:50.372839	2026-09-10 08:13:50.372839
2238	55	PRD-1789032520852-R1789033395011	120.0000	120.0000	available	2026-09-10 09:43:15.013198	2026-09-10 09:43:15.013198
2239	55	PRD-1789032520852-R1789033395079	120.0000	120.0000	available	2026-09-10 09:43:15.085052	2026-09-10 09:43:15.085052
2240	55	PRD-1789032520852-R1789033395153	120.0000	120.0000	available	2026-09-10 09:43:15.15438	2026-09-10 09:43:15.15438
2241	55	PRD-1789032520852-R1789033395222	120.0000	120.0000	available	2026-09-10 09:43:15.223739	2026-09-10 09:43:15.223739
2242	55	PRD-1789032520852-R1789033395281	122.7000	122.7000	available	2026-09-10 09:43:15.28334	2026-09-10 09:43:15.28334
2243	55	PRD-1789032520852-R1789033395373	120.0000	120.0000	available	2026-09-10 09:43:15.375363	2026-09-10 09:43:15.375363
2244	55	PRD-1789032520852-R1789033395442	123.7000	123.7000	available	2026-09-10 09:43:15.444976	2026-09-10 09:43:15.444976
2245	55	PRD-1789032520852-R1789033395519	120.9000	120.9000	available	2026-09-10 09:43:15.52046	2026-09-10 09:43:15.52046
2246	55	PRD-1789032520852-R1789033395599	125.3000	125.3000	available	2026-09-10 09:43:15.602086	2026-09-10 09:43:15.602086
2247	55	PRD-1789032520852-R1789033395686	121.3000	121.3000	available	2026-09-10 09:43:15.689771	2026-09-10 09:43:15.689771
2248	55	PRD-1789032520852-R1789033395763	121.7000	121.7000	available	2026-09-10 09:43:15.764524	2026-09-10 09:43:15.764524
2249	55	PRD-1789032520852-R1789033395855	121.4000	121.4000	available	2026-09-10 09:43:15.860349	2026-09-10 09:43:15.860349
2250	55	PRD-1789032520852-R1789033395931	122.8000	122.8000	available	2026-09-10 09:43:15.941359	2026-09-10 09:43:15.941359
2251	55	PRD-1789032520852-R1789033396022	105.4000	105.4000	available	2026-09-10 09:43:16.02358	2026-09-10 09:43:16.02358
2252	55	PRD-1789032520852-R1789033396096	120.0000	120.0000	available	2026-09-10 09:43:16.096963	2026-09-10 09:43:16.096963
2253	55	PRD-1789032520852-R1789033396177	96.3000	96.3000	available	2026-09-10 09:43:16.178498	2026-09-10 09:43:16.178498
2254	55	PRD-1789032520852-R1789033396280	116.1000	116.1000	available	2026-09-10 09:43:16.281739	2026-09-10 09:43:16.281739
2255	55	PRD-1789032520852-R1789033396422	116.6000	116.6000	available	2026-09-10 09:43:16.42608	2026-09-10 09:43:16.42608
2256	55	PRD-1789032520852-R1789033396464	116.0000	116.0000	available	2026-09-10 09:43:16.466111	2026-09-10 09:43:16.466111
2257	55	PRD-1789032520852-R1789033396557	120.0000	120.0000	available	2026-09-10 09:43:16.559064	2026-09-10 09:43:16.559064
2258	55	PRD-1789032520852-R1789033396647	120.4000	120.4000	available	2026-09-10 09:43:16.649179	2026-09-10 09:43:16.649179
2259	55	PRD-1789032520852-R1789033396730	120.0000	120.0000	available	2026-09-10 09:43:16.731605	2026-09-10 09:43:16.731605
2260	55	PRD-1789032520852-R1789033396814	123.3000	123.3000	available	2026-09-10 09:43:16.815532	2026-09-10 09:43:16.815532
2261	55	PRD-1789032520852-R1789033396915	120.0000	120.0000	available	2026-09-10 09:43:16.919365	2026-09-10 09:43:16.919365
2262	55	PRD-1789032520852-R1789033396991	96.5000	96.5000	available	2026-09-10 09:43:16.996737	2026-09-10 09:43:16.996737
2263	55	PRD-1789032520852-R1789033397092	120.0000	120.0000	available	2026-09-10 09:43:17.09541	2026-09-10 09:43:17.09541
2264	55	PRD-1789032520852-R1789033397202	120.0000	120.0000	available	2026-09-10 09:43:17.204143	2026-09-10 09:43:17.204143
2265	55	PRD-1789032520852-R1789033397293	120.0000	120.0000	available	2026-09-10 09:43:17.294815	2026-09-10 09:43:17.294815
2266	55	PRD-1789032520852-R1789033397382	120.0000	120.0000	available	2026-09-10 09:43:17.383554	2026-09-10 09:43:17.383554
2267	55	PRD-1789032520852-R1789033397474	119.4000	119.4000	available	2026-09-10 09:43:17.476029	2026-09-10 09:43:17.476029
2268	55	PRD-1789032520852-R1789033397566	123.4000	123.4000	available	2026-09-10 09:43:17.567423	2026-09-10 09:43:17.567423
2269	55	PRD-1789032520852-R1789033397669	124.1000	124.1000	available	2026-09-10 09:43:17.670833	2026-09-10 09:43:17.670833
2270	55	PRD-1789032520852-R1789033397750	119.3000	119.3000	available	2026-09-10 09:43:17.75138	2026-09-10 09:43:17.75138
2271	55	PRD-1789032520852-R1789033397851	122.6000	122.6000	available	2026-09-10 09:43:17.853122	2026-09-10 09:43:17.853122
2272	55	PRD-1789032520852-R1789033397953	122.4000	122.4000	available	2026-09-10 09:43:17.955228	2026-09-10 09:43:17.955228
2273	55	PRD-1789032520852-R1789033398064	125.3000	125.3000	available	2026-09-10 09:43:18.064918	2026-09-10 09:43:18.064918
2274	55	PRD-1789032520852-R1789033398163	118.0000	118.0000	available	2026-09-10 09:43:18.164269	2026-09-10 09:43:18.164269
2275	55	PRD-1789032520852-R1789033398257	104.0000	104.0000	available	2026-09-10 09:43:18.259264	2026-09-10 09:43:18.259264
2276	55	PRD-1789032520852-R1789033398370	116.1000	116.1000	available	2026-09-10 09:43:18.375386	2026-09-10 09:43:18.375386
2277	55	PRD-1789032520852-R1789033398492	115.8000	115.8000	available	2026-09-10 09:43:18.493995	2026-09-10 09:43:18.493995
2278	55	PRD-1789032520852-R1789033398590	117.4000	117.4000	available	2026-09-10 09:43:18.591428	2026-09-10 09:43:18.591428
2279	55	PRD-1789032520852-R1789033398708	67.7000	67.7000	available	2026-09-10 09:43:18.710317	2026-09-10 09:43:18.710317
2280	55	PRD-1789032520852-R1789033398807	115.7000	115.7000	available	2026-09-10 09:43:18.808416	2026-09-10 09:43:18.808416
2281	36	PRD-1789025355244-R1789033420198	126.4000	126.4000	available	2026-09-10 09:43:40.199661	2026-09-10 09:43:40.199661
2282	36	PRD-1789025355244-R1789033420374	103.3000	103.3000	available	2026-09-10 09:43:40.375291	2026-09-10 09:43:40.375291
2283	36	PRD-1789025355244-R1789033420573	105.1000	105.1000	available	2026-09-10 09:43:40.583414	2026-09-10 09:43:40.583414
2284	36	PRD-1789025355244-R1789033420843	101.6000	101.6000	available	2026-09-10 09:43:40.84425	2026-09-10 09:43:40.84425
2285	36	PRD-1789025355244-R1789033421083	109.0000	109.0000	available	2026-09-10 09:43:41.084514	2026-09-10 09:43:41.084514
2286	36	PRD-1789025355244-R1789033421322	141.7000	141.7000	available	2026-09-10 09:43:41.334938	2026-09-10 09:43:41.334938
2287	36	PRD-1789025355244-R1789033421615	119.0000	119.0000	available	2026-09-10 09:43:41.617964	2026-09-10 09:43:41.617964
2288	36	PRD-1789025355244-R1789033421838	123.1000	123.1000	available	2026-09-10 09:43:41.839077	2026-09-10 09:43:41.839077
2289	36	PRD-1789025355244-R1789033422058	119.6000	119.6000	available	2026-09-10 09:43:42.059328	2026-09-10 09:43:42.059328
2290	36	PRD-1789025355244-R1789033422304	121.1000	121.1000	available	2026-09-10 09:43:42.306088	2026-09-10 09:43:42.306088
2291	36	PRD-1789025355244-R1789033422532	121.2000	121.2000	available	2026-09-10 09:43:42.534079	2026-09-10 09:43:42.534079
2292	36	PRD-1789025355244-R1789033422764	97.7000	97.7000	available	2026-09-10 09:43:42.766026	2026-09-10 09:43:42.766026
2293	36	PRD-1789025355244-R1789033423054	104.7000	104.7000	available	2026-09-10 09:43:43.056643	2026-09-10 09:43:43.056643
2294	36	PRD-1789025355244-R1789033423325	126.4000	126.4000	available	2026-09-10 09:43:43.325946	2026-09-10 09:43:43.325946
2295	36	PRD-1789025355244-R1789033423595	100.0000	100.0000	available	2026-09-10 09:43:43.597944	2026-09-10 09:43:43.597944
2296	36	PRD-1789025355244-R1789033423895	119.8000	119.8000	available	2026-09-10 09:43:43.896461	2026-09-10 09:43:43.896461
2297	36	PRD-1789025355244-R1789033424130	120.2000	120.2000	available	2026-09-10 09:43:44.132148	2026-09-10 09:43:44.132148
2298	36	PRD-1789025355244-R1789033424383	128.4000	128.4000	available	2026-09-10 09:43:44.384619	2026-09-10 09:43:44.384619
2299	36	PRD-1789025355244-R1789033424575	123.6000	123.6000	available	2026-09-10 09:43:44.576478	2026-09-10 09:43:44.576478
2300	36	PRD-1789025355244-R1789033424838	125.3000	125.3000	available	2026-09-10 09:43:44.839744	2026-09-10 09:43:44.839744
2301	36	PRD-1789025355244-R1789033425081	123.9000	123.9000	available	2026-09-10 09:43:45.083095	2026-09-10 09:43:45.083095
2302	36	PRD-1789025355244-R1789033425346	91.4000	91.4000	available	2026-09-10 09:43:45.346952	2026-09-10 09:43:45.346952
2303	36	PRD-1789025355244-R1789033425602	100.0000	100.0000	available	2026-09-10 09:43:45.604646	2026-09-10 09:43:45.604646
2304	36	PRD-1789025355244-R1789033425844	99.6000	99.6000	available	2026-09-10 09:43:45.845196	2026-09-10 09:43:45.845196
2305	36	PRD-1789025355244-R1789033426079	133.3000	133.3000	available	2026-09-10 09:43:46.08182	2026-09-10 09:43:46.08182
2306	36	PRD-1789025355244-R1789033426321	92.2000	92.2000	available	2026-09-10 09:43:46.32284	2026-09-10 09:43:46.32284
2307	36	PRD-1789025355244-R1789033426611	117.0000	117.0000	available	2026-09-10 09:43:46.612733	2026-09-10 09:43:46.612733
2308	36	PRD-1789025355244-R1789033426948	126.0000	126.0000	available	2026-09-10 09:43:46.949949	2026-09-10 09:43:46.949949
2309	36	PRD-1789025355244-R1789033427286	132.9000	132.9000	available	2026-09-10 09:43:47.287508	2026-09-10 09:43:47.287508
2314	36	PRD-1789025355244-R1789033428563	122.5000	122.5000	available	2026-09-10 09:43:48.563891	2026-09-10 09:43:48.563891
2701	16	PRD-1789018928475-R1789034463242	57.7000	57.7000	available	2026-09-10 10:01:03.243143	2026-09-10 10:01:03.243143
2702	16	PRD-1789018928475-R1789034463351	62.2000	62.2000	available	2026-09-10 10:01:03.353794	2026-09-10 10:01:03.353794
2707	16	PRD-1789018928475-R1789034464104	37.8000	37.8000	available	2026-09-10 10:01:04.105473	2026-09-10 10:01:04.105473
2708	16	PRD-1789018928475-R1789034464250	65.3000	65.3000	available	2026-09-10 10:01:04.251655	2026-09-10 10:01:04.251655
2766	10	PRD-1789018615683-R1789034808331	116.1000	116.1000	available	2026-09-10 10:06:48.333088	2026-09-10 10:06:48.333088
2784	10	PRD-1789018615683-R1789034811146	120.9000	120.9000	available	2026-09-10 10:06:51.149119	2026-09-10 10:06:51.149119
2785	10	PRD-1789018615683-R1789034811294	117.8000	117.8000	available	2026-09-10 10:06:51.296531	2026-09-10 10:06:51.296531
2786	10	PRD-1789018615683-R1789034811409	112.5000	112.5000	available	2026-09-10 10:06:51.413154	2026-09-10 10:06:51.413154
2787	10	PRD-1789018615683-R1789034811554	119.3000	119.3000	available	2026-09-10 10:06:51.555687	2026-09-10 10:06:51.555687
2788	10	PRD-1789018615683-R1789034811727	118.3000	118.3000	available	2026-09-10 10:06:51.729951	2026-09-10 10:06:51.729951
2791	10	PRD-1789018615683-R1789034812214	119.5000	119.5000	available	2026-09-10 10:06:52.215998	2026-09-10 10:06:52.215998
2827	12	PRD-1789018691298-R1789036705097	115.9000	115.9000	available	2026-09-10 10:38:25.098616	2026-09-10 10:38:25.098616
2839	12	PRD-1789018691298-R1789036706745	110.6000	110.6000	available	2026-09-10 10:38:26.746621	2026-09-10 10:38:26.746621
2841	12	PRD-1789018691298-R1789036707082	120.4000	120.4000	available	2026-09-10 10:38:27.087747	2026-09-10 10:38:27.087747
2843	12	PRD-1789018691298-R1789036707348	125.4000	125.4000	available	2026-09-10 10:38:27.349381	2026-09-10 10:38:27.349381
2844	12	PRD-1789018691298-R1789036707468	111.7000	111.7000	available	2026-09-10 10:38:27.470195	2026-09-10 10:38:27.470195
2848	12	PRD-1789018691298-R1789036708017	124.4000	124.4000	available	2026-09-10 10:38:28.018527	2026-09-10 10:38:28.018527
2855	13	PRD-1789018725877-R1789037100880	113.6000	113.6000	available	2026-09-10 10:45:00.882056	2026-09-10 10:45:00.882056
2856	13	PRD-1789018725877-R1789037101002	119.4000	119.4000	available	2026-09-10 10:45:01.003176	2026-09-10 10:45:01.003176
2857	13	PRD-1789018725877-R1789037101101	123.4000	123.4000	available	2026-09-10 10:45:01.102831	2026-09-10 10:45:01.102831
2858	13	PRD-1789018725877-R1789037101227	120.2000	120.2000	available	2026-09-10 10:45:01.229535	2026-09-10 10:45:01.229535
2865	13	PRD-1789018725877-R1789037102189	96.7000	96.7000	available	2026-09-10 10:45:02.190767	2026-09-10 10:45:02.190767
2866	13	PRD-1789018725877-R1789037102315	121.1000	121.1000	available	2026-09-10 10:45:02.316156	2026-09-10 10:45:02.316156
2870	13	PRD-1789018725877-R1789037102871	135.2000	135.2000	available	2026-09-10 10:45:02.882245	2026-09-10 10:45:02.882245
2875	13	PRD-1789018725877-R1789037103700	111.4000	111.4000	available	2026-09-10 10:45:03.70219	2026-09-10 10:45:03.70219
2876	13	PRD-1789018725877-R1789037103845	105.2000	105.2000	available	2026-09-10 10:45:03.848008	2026-09-10 10:45:03.848008
2878	13	PRD-1789018725877-R1789037104163	134.2000	134.2000	available	2026-09-10 10:45:04.166	2026-09-10 10:45:04.166
2879	13	PRD-1789018725877-R1789037104340	124.4000	124.4000	available	2026-09-10 10:45:04.341765	2026-09-10 10:45:04.341765
2885	13	PRD-1789018725877-R1789037105515	109.6000	109.6000	available	2026-09-10 10:45:05.518029	2026-09-10 10:45:05.518029
2886	13	PRD-1789018725877-R1789037105677	109.2000	109.2000	available	2026-09-10 10:45:05.678561	2026-09-10 10:45:05.678561
2900	13	PRD-1789018725877-R1789037107656	120.2000	120.2000	available	2026-09-10 10:45:07.659628	2026-09-10 10:45:07.659628
2930	10	PRD-1789018615683-R1789037308788	118.0000	118.0000	available	2026-09-10 10:48:28.788918	2026-09-10 10:48:28.788918
2932	10	PRD-1789018615683-R1789037309100	120.8000	120.8000	available	2026-09-10 10:48:29.105135	2026-09-10 10:48:29.105135
2935	65	PRD-1789037343406-R1789037393284	117.3000	117.3000	available	2026-09-10 10:49:53.285279	2026-09-10 10:49:53.285279
2937	65	PRD-1789037343406-R1789037393527	119.2000	119.2000	available	2026-09-10 10:49:53.52892	2026-09-10 10:49:53.52892
2938	65	PRD-1789037343406-R1789037393623	123.3000	123.3000	available	2026-09-10 10:49:53.624312	2026-09-10 10:49:53.624312
2940	65	PRD-1789037343406-R1789037393833	135.0000	135.0000	available	2026-09-10 10:49:53.835383	2026-09-10 10:49:53.835383
2944	65	PRD-1789037343406-R1789037394248	124.3000	124.3000	available	2026-09-10 10:49:54.249599	2026-09-10 10:49:54.249599
2945	65	PRD-1789037343406-R1789037394352	126.8000	126.8000	available	2026-09-10 10:49:54.353924	2026-09-10 10:49:54.353924
2949	65	PRD-1789037343406-R1789037394788	120.2000	120.2000	available	2026-09-10 10:49:54.789172	2026-09-10 10:49:54.789172
2950	65	PRD-1789037343406-R1789037394891	136.4000	136.4000	available	2026-09-10 10:49:54.897185	2026-09-10 10:49:54.897185
2951	11	PRD-1789018656012-R1789037437422	108.8000	108.8000	available	2026-09-10 10:50:37.426409	2026-09-10 10:50:37.426409
2952	11	PRD-1789018656012-R1789037437544	114.0000	114.0000	available	2026-09-10 10:50:37.545528	2026-09-10 10:50:37.545528
2954	11	PRD-1789018656012-R1789037437813	113.1000	113.1000	available	2026-09-10 10:50:37.816204	2026-09-10 10:50:37.816204
2955	11	PRD-1789018656012-R1789037437916	113.6000	113.6000	available	2026-09-10 10:50:37.917744	2026-09-10 10:50:37.917744
2957	11	PRD-1789018656012-R1789037438161	115.6000	115.6000	available	2026-09-10 10:50:38.163096	2026-09-10 10:50:38.163096
2985	68	PRD-1789037746694-R1789037788568	113.2000	113.2000	available	2026-09-10 10:56:28.570668	2026-09-10 10:56:28.570668
2986	68	PRD-1789037746694-R1789037789244	100.0000	100.0000	available	2026-09-10 10:56:29.245987	2026-09-10 10:56:29.245987
2990	68	PRD-1789037746694-R1789037789694	136.5000	136.5000	available	2026-09-10 10:56:29.69558	2026-09-10 10:56:29.69558
2993	68	PRD-1789037746694-R1789037790052	107.0000	107.0000	available	2026-09-10 10:56:30.053848	2026-09-10 10:56:30.053848
2995	68	PRD-1789037746694-R1789037790324	136.5000	136.5000	available	2026-09-10 10:56:30.32537	2026-09-10 10:56:30.32537
2996	68	PRD-1789037746694-R1789037790426	159.8000	159.8000	available	2026-09-10 10:56:30.427741	2026-09-10 10:56:30.427741
2997	42	PRD-1789027568425-R1789037816344	80.4000	80.4000	available	2026-09-10 10:56:56.345656	2026-09-10 10:56:56.345656
2998	42	PRD-1789027568425-R1789037816437	60.0000	60.0000	available	2026-09-10 10:56:56.449529	2026-09-10 10:56:56.449529
2999	42	PRD-1789027568425-R1789037816552	77.3000	77.3000	available	2026-09-10 10:56:56.55613	2026-09-10 10:56:56.55613
3000	42	PRD-1789027568425-R1789037816629	81.3000	81.3000	available	2026-09-10 10:56:56.63449	2026-09-10 10:56:56.63449
3004	42	PRD-1789027568425-R1789037816943	74.2000	74.2000	available	2026-09-10 10:56:56.944622	2026-09-10 10:56:56.944622
3005	42	PRD-1789027568425-R1789037817075	57.2000	57.2000	available	2026-09-10 10:56:57.076647	2026-09-10 10:56:57.076647
3006	42	PRD-1789027568425-R1789037817243	70.5000	70.5000	available	2026-09-10 10:56:57.248863	2026-09-10 10:56:57.248863
3007	42	PRD-1789027568425-R1789037817387	72.5000	72.5000	available	2026-09-10 10:56:57.388622	2026-09-10 10:56:57.388622
3010	42	PRD-1789027568425-R1789037817708	82.4000	82.4000	available	2026-09-10 10:56:57.709771	2026-09-10 10:56:57.709771
3024	32	PRD-1789025098770-R1789037948603	118.6000	118.6000	available	2026-09-10 10:59:08.604844	2026-09-10 10:59:08.604844
3025	32	PRD-1789025098770-R1789037999738	135.0000	135.0000	available	2026-09-10 10:59:59.73974	2026-09-10 10:59:59.73974
3026	32	PRD-1789025098770-R1789037999796	107.0000	107.0000	available	2026-09-10 10:59:59.799004	2026-09-10 10:59:59.799004
3027	32	PRD-1789025098770-R1789037999942	135.0000	135.0000	available	2026-09-10 10:59:59.943484	2026-09-10 10:59:59.943484
3028	32	PRD-1789025098770-R1789038000056	132.0000	132.0000	available	2026-09-10 11:00:00.057921	2026-09-10 11:00:00.057921
3030	32	PRD-1789025098770-R1789038000297	127.0000	127.0000	available	2026-09-10 11:00:00.298715	2026-09-10 11:00:00.298715
3033	32	PRD-1789025098770-R1789038000511	132.0000	132.0000	available	2026-09-10 11:00:00.513033	2026-09-10 11:00:00.513033
3045	12	PRD-1789018691298-R1789038102768	125.8000	125.8000	available	2026-09-10 11:01:42.769796	2026-09-10 11:01:42.769796
2310	36	PRD-1789025355244-R1789033427536	104.3000	104.3000	available	2026-09-10 09:43:47.543561	2026-09-10 09:43:47.543561
2311	36	PRD-1789025355244-R1789033427777	95.1000	95.1000	available	2026-09-10 09:43:47.778514	2026-09-10 09:43:47.778514
2703	16	PRD-1789018928475-R1789034463494	64.2000	64.2000	available	2026-09-10 10:01:03.505435	2026-09-10 10:01:03.505435
2709	10	PRD-1789018615683-R1789034512900	120.0000	120.0000	available	2026-09-10 10:01:52.901617	2026-09-10 10:01:52.901617
2710	10	PRD-1789018615683-R1789034512964	118.3000	118.3000	available	2026-09-10 10:01:52.965666	2026-09-10 10:01:52.965666
2711	10	PRD-1789018615683-R1789034513198	119.2000	119.2000	available	2026-09-10 10:01:53.200174	2026-09-10 10:01:53.200174
2714	10	PRD-1789018615683-R1789034513623	119.6000	119.6000	available	2026-09-10 10:01:53.625686	2026-09-10 10:01:53.625686
2717	10	PRD-1789018615683-R1789034514059	120.0000	120.0000	available	2026-09-10 10:01:54.060636	2026-09-10 10:01:54.060636
2720	10	PRD-1789018615683-R1789034514497	117.0000	117.0000	available	2026-09-10 10:01:54.499102	2026-09-10 10:01:54.499102
2722	10	PRD-1789018615683-R1789034514849	115.5000	115.5000	available	2026-09-10 10:01:54.851947	2026-09-10 10:01:54.851947
2725	10	PRD-1789018615683-R1789034515300	114.9000	114.9000	available	2026-09-10 10:01:55.301575	2026-09-10 10:01:55.301575
2728	10	PRD-1789018615683-R1789034515771	118.3000	118.3000	available	2026-09-10 10:01:55.772889	2026-09-10 10:01:55.772889
2729	10	PRD-1789018615683-R1789034515955	110.1000	110.1000	available	2026-09-10 10:01:55.956542	2026-09-10 10:01:55.956542
2734	10	PRD-1789018615683-R1789034517024	114.8000	114.8000	available	2026-09-10 10:01:57.025773	2026-09-10 10:01:57.025773
2737	10	PRD-1789018615683-R1789034517584	97.0000	97.0000	available	2026-09-10 10:01:57.585497	2026-09-10 10:01:57.585497
2740	2	PRD-1789018062554-R1789034544485	115.8000	115.8000	available	2026-09-10 10:02:24.487136	2026-09-10 10:02:24.487136
2741	2	PRD-1789018062554-R1789034544599	116.0000	116.0000	available	2026-09-10 10:02:24.600416	2026-09-10 10:02:24.600416
2751	2	PRD-1789018062554-R1789034546025	143.4000	143.4000	available	2026-09-10 10:02:26.027853	2026-09-10 10:02:26.027853
2753	2	PRD-1789018062554-R1789034546271	111.9000	111.9000	available	2026-09-10 10:02:26.272714	2026-09-10 10:02:26.272714
2754	2	PRD-1789018062554-R1789034546379	106.5000	106.5000	available	2026-09-10 10:02:26.380513	2026-09-10 10:02:26.380513
2795	51	PRD-1789029511477-R1789034897546	120.0000	120.0000	available	2026-09-10 10:08:17.548057	2026-09-10 10:08:17.548057
2796	51	PRD-1789029511477-R1789034897634	124.4000	124.4000	available	2026-09-10 10:08:17.635292	2026-09-10 10:08:17.635292
2800	51	PRD-1789029511477-R1789034898279	120.0000	120.0000	available	2026-09-10 10:08:18.280121	2026-09-10 10:08:18.280121
2801	51	PRD-1789029511477-R1789034898404	123.6000	123.6000	available	2026-09-10 10:08:18.406125	2026-09-10 10:08:18.406125
2832	12	PRD-1789018691298-R1789036705798	116.3000	116.3000	available	2026-09-10 10:38:25.799652	2026-09-10 10:38:25.799652
2836	12	PRD-1789018691298-R1789036706339	130.6000	130.6000	available	2026-09-10 10:38:26.341097	2026-09-10 10:38:26.341097
2837	12	PRD-1789018691298-R1789036706449	127.5000	127.5000	available	2026-09-10 10:38:26.450198	2026-09-10 10:38:26.450198
2838	12	PRD-1789018691298-R1789036706591	122.1000	122.1000	available	2026-09-10 10:38:26.593006	2026-09-10 10:38:26.593006
2854	12	PRD-1789018691298-R1789036709151	87.6000	87.6000	available	2026-09-10 10:38:29.154141	2026-09-10 10:38:29.154141
2933	10	PRD-1789018615683-R1789037309279	63.8000	63.8000	available	2026-09-10 10:48:29.284441	2026-09-10 10:48:29.284441
2934	10	PRD-1789018615683-R1789037309486	118.2000	118.2000	available	2026-09-10 10:48:29.487729	2026-09-10 10:48:29.487729
2987	68	PRD-1789037746694-R1789037789362	100.0000	100.0000	available	2026-09-10 10:56:29.363528	2026-09-10 10:56:29.363528
2988	68	PRD-1789037746694-R1789037789481	106.8000	106.8000	available	2026-09-10 10:56:29.482282	2026-09-10 10:56:29.482282
2989	68	PRD-1789037746694-R1789037789590	120.5000	120.5000	available	2026-09-10 10:56:29.590834	2026-09-10 10:56:29.590834
2991	68	PRD-1789037746694-R1789037789816	133.0000	133.0000	available	2026-09-10 10:56:29.817869	2026-09-10 10:56:29.817869
2992	68	PRD-1789037746694-R1789037789924	102.0000	102.0000	available	2026-09-10 10:56:29.926038	2026-09-10 10:56:29.926038
2994	68	PRD-1789037746694-R1789037790201	129.8000	129.8000	available	2026-09-10 10:56:30.202761	2026-09-10 10:56:30.202761
3029	32	PRD-1789025098770-R1789038000148	129.0000	129.0000	available	2026-09-10 11:00:00.150518	2026-09-10 11:00:00.150518
3032	32	PRD-1789025098770-R1789038000431	137.0000	137.0000	available	2026-09-10 11:00:00.433263	2026-09-10 11:00:00.433263
3046	58	PRD-1789033578183-R1789038212013	116.1000	116.1000	available	2026-09-10 11:03:32.014615	2026-09-10 11:03:32.014615
3047	58	PRD-1789033578183-R1789038212097	114.9000	114.9000	available	2026-09-10 11:03:32.10037	2026-09-10 11:03:32.10037
3052	58	PRD-1789033578183-R1789038212710	79.9000	79.9000	available	2026-09-10 11:03:32.71093	2026-09-10 11:03:32.71093
3055	58	PRD-1789033578183-R1789038213116	117.3000	117.3000	available	2026-09-10 11:03:33.118234	2026-09-10 11:03:33.118234
3056	58	PRD-1789033578183-R1789038213234	110.0000	110.0000	available	2026-09-10 11:03:33.239852	2026-09-10 11:03:33.239852
3057	58	PRD-1789033578183-R1789038213394	116.9000	116.9000	available	2026-09-10 11:03:33.395849	2026-09-10 11:03:33.395849
3058	58	PRD-1789033578183-R1789038213512	117.3000	117.3000	available	2026-09-10 11:03:33.514083	2026-09-10 11:03:33.514083
3059	58	PRD-1789033578183-R1789038213671	97.5000	97.5000	available	2026-09-10 11:03:33.67336	2026-09-10 11:03:33.67336
3060	58	PRD-1789033578183-R1789038213831	117.3000	117.3000	available	2026-09-10 11:03:33.833367	2026-09-10 11:03:33.833367
3061	58	PRD-1789033578183-R1789038214004	117.4000	117.4000	available	2026-09-10 11:03:34.006355	2026-09-10 11:03:34.006355
3062	58	PRD-1789033578183-R1789038214184	116.6000	116.6000	available	2026-09-10 11:03:34.186639	2026-09-10 11:03:34.186639
3070	58	PRD-1789033578183-R1789038215308	117.3000	117.3000	available	2026-09-10 11:03:35.310269	2026-09-10 11:03:35.310269
3073	58	PRD-1789033578183-R1789038215745	116.0000	116.0000	available	2026-09-10 11:03:35.747401	2026-09-10 11:03:35.747401
3076	58	PRD-1789033578183-R1789038216136	117.3000	117.3000	available	2026-09-10 11:03:36.138386	2026-09-10 11:03:36.138386
3080	58	PRD-1789033578183-R1789038216702	111.8000	111.8000	available	2026-09-10 11:03:36.703587	2026-09-10 11:03:36.703587
3084	52	PRD-1789029576872-R1789038326108	115.0000	115.0000	available	2026-09-10 11:05:26.110396	2026-09-10 11:05:26.110396
3087	52	PRD-1789029576872-R1789038326464	116.2000	116.2000	available	2026-09-10 11:05:26.467832	2026-09-10 11:05:26.467832
3090	52	PRD-1789029576872-R1789038326829	117.7000	117.7000	available	2026-09-10 11:05:26.830357	2026-09-10 11:05:26.830357
3091	52	PRD-1789029576872-R1789038327003	107.1000	107.1000	available	2026-09-10 11:05:27.004864	2026-09-10 11:05:27.004864
3092	52	PRD-1789029576872-R1789038327173	122.1000	122.1000	available	2026-09-10 11:05:27.17493	2026-09-10 11:05:27.17493
3094	52	PRD-1789029576872-R1789038327481	115.0000	115.0000	available	2026-09-10 11:05:27.482228	2026-09-10 11:05:27.482228
3097	52	PRD-1789029576872-R1789038327938	120.0000	120.0000	available	2026-09-10 11:05:27.93932	2026-09-10 11:05:27.93932
3101	52	PRD-1789029576872-R1789038328560	117.2000	117.2000	available	2026-09-10 11:05:28.562478	2026-09-10 11:05:28.562478
3102	52	PRD-1789029576872-R1789038328710	105.3000	105.3000	available	2026-09-10 11:05:28.711668	2026-09-10 11:05:28.711668
3107	70	PRD-1789038376650-R1789038385926	131.9000	131.9000	available	2026-09-10 11:06:25.927902	2026-09-10 11:06:25.927902
3108	57	PRD-1789033528219-R1789038402200	123.1000	123.1000	available	2026-09-10 11:06:42.201444	2026-09-10 11:06:42.201444
3109	15	PRD-1789018843399-R1789038426319	110.0000	110.0000	available	2026-09-10 11:07:06.320939	2026-09-10 11:07:06.320939
3110	15	PRD-1789018843399-R1789038426391	111.5000	111.5000	available	2026-09-10 11:07:06.393082	2026-09-10 11:07:06.393082
3111	15	PRD-1789018843399-R1789038426527	108.7000	108.7000	available	2026-09-10 11:07:06.529633	2026-09-10 11:07:06.529633
3113	15	PRD-1789018843399-R1789038456326	119.1000	119.1000	available	2026-09-10 11:07:36.328151	2026-09-10 11:07:36.328151
3114	15	PRD-1789018843399-R1789038456400	117.9000	117.9000	available	2026-09-10 11:07:36.402084	2026-09-10 11:07:36.402084
3119	15	PRD-1789018843399-R1789038456973	117.0000	117.0000	available	2026-09-10 11:07:36.977679	2026-09-10 11:07:36.977679
2312	36	PRD-1789025355244-R1789033427999	131.2000	131.2000	available	2026-09-10 09:43:48.00115	2026-09-10 09:43:48.00115
2313	36	PRD-1789025355244-R1789033428289	136.0000	136.0000	available	2026-09-10 09:43:48.29093	2026-09-10 09:43:48.29093
2315	56	PRD-1789033426514-R1789033482974	120.0000	120.0000	available	2026-09-10 09:44:42.975687	2026-09-10 09:44:42.975687
2316	56	PRD-1789033426514-R1789033483031	120.0000	120.0000	available	2026-09-10 09:44:43.032921	2026-09-10 09:44:43.032921
2317	56	PRD-1789033426514-R1789033483170	121.5000	121.5000	available	2026-09-10 09:44:43.171669	2026-09-10 09:44:43.171669
2318	56	PRD-1789033426514-R1789033483236	120.0000	120.0000	available	2026-09-10 09:44:43.244335	2026-09-10 09:44:43.244335
2319	56	PRD-1789033426514-R1789033483320	117.9000	117.9000	available	2026-09-10 09:44:43.321961	2026-09-10 09:44:43.321961
2320	56	PRD-1789033426514-R1789033483412	120.0000	120.0000	available	2026-09-10 09:44:43.414159	2026-09-10 09:44:43.414159
2321	56	PRD-1789033426514-R1789033483503	115.7000	115.7000	available	2026-09-10 09:44:43.505202	2026-09-10 09:44:43.505202
2322	56	PRD-1789033426514-R1789033483574	120.0000	120.0000	available	2026-09-10 09:44:43.576779	2026-09-10 09:44:43.576779
2323	20	PRD-1789019067284-R1789033541283	103.7000	103.7000	available	2026-09-10 09:45:41.284687	2026-09-10 09:45:41.284687
2324	20	PRD-1789019067284-R1789033542069	109.6000	109.6000	available	2026-09-10 09:45:42.070413	2026-09-10 09:45:42.070413
2325	20	PRD-1789019067284-R1789033542421	115.8000	115.8000	available	2026-09-10 09:45:42.423064	2026-09-10 09:45:42.423064
2326	20	PRD-1789019067284-R1789033542657	114.1000	114.1000	available	2026-09-10 09:45:42.658787	2026-09-10 09:45:42.658787
2327	20	PRD-1789019067284-R1789033542896	102.4000	102.4000	available	2026-09-10 09:45:42.898005	2026-09-10 09:45:42.898005
2328	20	PRD-1789019067284-R1789033543143	120.3000	120.3000	available	2026-09-10 09:45:43.14497	2026-09-10 09:45:43.14497
2329	20	PRD-1789019067284-R1789033543339	117.6000	117.6000	available	2026-09-10 09:45:43.340162	2026-09-10 09:45:43.340162
2330	20	PRD-1789019067284-R1789033543522	117.9000	117.9000	available	2026-09-10 09:45:43.523496	2026-09-10 09:45:43.523496
2331	20	PRD-1789019067284-R1789033543713	115.6000	115.6000	available	2026-09-10 09:45:43.714727	2026-09-10 09:45:43.714727
2332	20	PRD-1789019067284-R1789033543941	115.1000	115.1000	available	2026-09-10 09:45:43.946485	2026-09-10 09:45:43.946485
2333	20	PRD-1789019067284-R1789033544153	98.8000	98.8000	available	2026-09-10 09:45:44.154978	2026-09-10 09:45:44.154978
2334	20	PRD-1789019067284-R1789033544346	118.3000	118.3000	available	2026-09-10 09:45:44.347322	2026-09-10 09:45:44.347322
2335	20	PRD-1789019067284-R1789033544575	114.4000	114.4000	available	2026-09-10 09:45:44.581739	2026-09-10 09:45:44.581739
2336	20	PRD-1789019067284-R1789033544788	115.8000	115.8000	available	2026-09-10 09:45:44.789508	2026-09-10 09:45:44.789508
2337	20	PRD-1789019067284-R1789033544988	113.1000	113.1000	available	2026-09-10 09:45:44.989328	2026-09-10 09:45:44.989328
2338	20	PRD-1789019067284-R1789033545217	105.3000	105.3000	available	2026-09-10 09:45:45.218145	2026-09-10 09:45:45.218145
2339	20	PRD-1789019067284-R1789033545457	114.5000	114.5000	available	2026-09-10 09:45:45.460025	2026-09-10 09:45:45.460025
2340	20	PRD-1789019067284-R1789033545645	126.8000	126.8000	available	2026-09-10 09:45:45.646742	2026-09-10 09:45:45.646742
2341	20	PRD-1789019067284-R1789033545851	125.0000	125.0000	available	2026-09-10 09:45:45.852314	2026-09-10 09:45:45.852314
2342	20	PRD-1789019067284-R1789033546110	125.8000	125.8000	available	2026-09-10 09:45:46.112796	2026-09-10 09:45:46.112796
2343	20	PRD-1789019067284-R1789033546333	100.9000	100.9000	available	2026-09-10 09:45:46.337174	2026-09-10 09:45:46.337174
2344	20	PRD-1789019067284-R1789033546540	97.4000	97.4000	available	2026-09-10 09:45:46.542176	2026-09-10 09:45:46.542176
2345	20	PRD-1789019067284-R1789033546719	122.4000	122.4000	available	2026-09-10 09:45:46.720341	2026-09-10 09:45:46.720341
2346	20	PRD-1789019067284-R1789033546983	102.0000	102.0000	available	2026-09-10 09:45:46.985296	2026-09-10 09:45:46.985296
2347	20	PRD-1789019067284-R1789033547194	121.6000	121.6000	available	2026-09-10 09:45:47.19578	2026-09-10 09:45:47.19578
2348	20	PRD-1789019067284-R1789033547372	121.5000	121.5000	available	2026-09-10 09:45:47.374229	2026-09-10 09:45:47.374229
2349	57	PRD-1789033528219-R1789033547418	119.4000	119.4000	available	2026-09-10 09:45:47.420047	2026-09-10 09:45:47.420047
2350	57	PRD-1789033528219-R1789033547478	113.7000	113.7000	available	2026-09-10 09:45:47.480558	2026-09-10 09:45:47.480558
2351	57	PRD-1789033528219-R1789033547590	118.9000	118.9000	available	2026-09-10 09:45:47.591348	2026-09-10 09:45:47.591348
2352	20	PRD-1789019067284-R1789033547610	115.1000	115.1000	available	2026-09-10 09:45:47.611193	2026-09-10 09:45:47.611193
2353	57	PRD-1789033528219-R1789033547736	118.5000	118.5000	available	2026-09-10 09:45:47.741136	2026-09-10 09:45:47.741136
2354	20	PRD-1789019067284-R1789033547810	112.0000	112.0000	available	2026-09-10 09:45:47.811511	2026-09-10 09:45:47.811511
2355	20	PRD-1789019067284-R1789033548037	108.7000	108.7000	available	2026-09-10 09:45:48.03868	2026-09-10 09:45:48.03868
2356	20	PRD-1789019067284-R1789033548270	118.4000	118.4000	available	2026-09-10 09:45:48.272394	2026-09-10 09:45:48.272394
2357	20	PRD-1789019067284-R1789033548488	82.6000	82.6000	available	2026-09-10 09:45:48.489382	2026-09-10 09:45:48.489382
2358	20	PRD-1789019067284-R1789033548692	112.8000	112.8000	available	2026-09-10 09:45:48.69579	2026-09-10 09:45:48.69579
2359	20	PRD-1789019067284-R1789033548938	121.6000	121.6000	available	2026-09-10 09:45:48.944362	2026-09-10 09:45:48.944362
2360	58	PRD-1789033578183-R1789033596616	110.6000	110.6000	available	2026-09-10 09:46:36.617358	2026-09-10 09:46:36.617358
2361	58	PRD-1789033578183-R1789033596666	100.6000	100.6000	available	2026-09-10 09:46:36.677553	2026-09-10 09:46:36.677553
2362	58	PRD-1789033578183-R1789033596757	103.1000	103.1000	available	2026-09-10 09:46:36.759597	2026-09-10 09:46:36.759597
2363	58	PRD-1789033578183-R1789033596816	113.5000	113.5000	available	2026-09-10 09:46:36.817349	2026-09-10 09:46:36.817349
2364	59	PRD-1789033615870-R1789033654069	120.0000	120.0000	available	2026-09-10 09:47:34.071613	2026-09-10 09:47:34.071613
2365	59	PRD-1789033615870-R1789033654124	120.1000	120.1000	available	2026-09-10 09:47:34.133945	2026-09-10 09:47:34.133945
2366	59	PRD-1789033615870-R1789033654218	120.0000	120.0000	available	2026-09-10 09:47:34.219568	2026-09-10 09:47:34.219568
2367	59	PRD-1789033615870-R1789033654282	114.8000	114.8000	available	2026-09-10 09:47:34.284463	2026-09-10 09:47:34.284463
2368	60	PRD-1789033677780-R1789033685650	115.0000	115.0000	available	2026-09-10 09:48:05.65118	2026-09-10 09:48:05.65118
2369	13	PRD-1789018725877-R1789033751214	125.8000	125.8000	available	2026-09-10 09:49:11.216174	2026-09-10 09:49:11.216174
2370	13	PRD-1789018725877-R1789033751347	122.3000	122.3000	available	2026-09-10 09:49:11.348872	2026-09-10 09:49:11.348872
2371	13	PRD-1789018725877-R1789033751433	118.0000	118.0000	available	2026-09-10 09:49:11.435223	2026-09-10 09:49:11.435223
2372	13	PRD-1789018725877-R1789033751614	120.2000	120.2000	available	2026-09-10 09:49:11.617476	2026-09-10 09:49:11.617476
2373	13	PRD-1789018725877-R1789033751678	129.8000	129.8000	available	2026-09-10 09:49:11.679981	2026-09-10 09:49:11.679981
2374	13	PRD-1789018725877-R1789033751798	109.0000	109.0000	available	2026-09-10 09:49:11.800457	2026-09-10 09:49:11.800457
2375	50	PRD-1789028920266-R1789033790371	112.6000	112.6000	available	2026-09-10 09:49:50.372426	2026-09-10 09:49:50.372426
2376	50	PRD-1789028920266-R1789033790654	79.8000	79.8000	available	2026-09-10 09:49:50.655903	2026-09-10 09:49:50.655903
2377	50	PRD-1789028920266-R1789033790873	120.0000	120.0000	available	2026-09-10 09:49:50.882865	2026-09-10 09:49:50.882865
2378	50	PRD-1789028920266-R1789033791073	120.0000	120.0000	available	2026-09-10 09:49:51.0749	2026-09-10 09:49:51.0749
2379	50	PRD-1789028920266-R1789033791305	106.5000	106.5000	available	2026-09-10 09:49:51.306952	2026-09-10 09:49:51.306952
2380	50	PRD-1789028920266-R1789033791533	123.3000	123.3000	available	2026-09-10 09:49:51.534054	2026-09-10 09:49:51.534054
2381	50	PRD-1789028920266-R1789033791745	106.5000	106.5000	available	2026-09-10 09:49:51.74667	2026-09-10 09:49:51.74667
2382	50	PRD-1789028920266-R1789033791946	120.0000	120.0000	available	2026-09-10 09:49:51.947915	2026-09-10 09:49:51.947915
2383	50	PRD-1789028920266-R1789033792264	121.1000	121.1000	available	2026-09-10 09:49:52.265265	2026-09-10 09:49:52.265265
2384	50	PRD-1789028920266-R1789033792496	118.2000	118.2000	available	2026-09-10 09:49:52.498073	2026-09-10 09:49:52.498073
2385	50	PRD-1789028920266-R1789033792751	120.0000	120.0000	available	2026-09-10 09:49:52.75271	2026-09-10 09:49:52.75271
2386	50	PRD-1789028920266-R1789033792947	124.2000	124.2000	available	2026-09-10 09:49:52.949242	2026-09-10 09:49:52.949242
2387	50	PRD-1789028920266-R1789033793222	121.0000	121.0000	available	2026-09-10 09:49:53.22304	2026-09-10 09:49:53.22304
2388	50	PRD-1789028920266-R1789033793420	120.0000	120.0000	available	2026-09-10 09:49:53.421745	2026-09-10 09:49:53.421745
2389	50	PRD-1789028920266-R1789033793642	120.2000	120.2000	available	2026-09-10 09:49:53.643979	2026-09-10 09:49:53.643979
2390	50	PRD-1789028920266-R1789033793894	119.3000	119.3000	available	2026-09-10 09:49:53.895648	2026-09-10 09:49:53.895648
2397	50	PRD-1789028920266-R1789033796188	115.3000	115.3000	available	2026-09-10 09:49:56.190035	2026-09-10 09:49:56.190035
2400	50	PRD-1789028920266-R1789033796859	107.1000	107.1000	available	2026-09-10 09:49:56.864987	2026-09-10 09:49:56.864987
2404	50	PRD-1789028920266-R1789033797785	100.4000	100.4000	available	2026-09-10 09:49:57.786113	2026-09-10 09:49:57.786113
2406	50	PRD-1789028920266-R1789033798245	120.0000	120.0000	available	2026-09-10 09:49:58.246428	2026-09-10 09:49:58.246428
2408	50	PRD-1789028920266-R1789033798720	120.0000	120.0000	available	2026-09-10 09:49:58.721349	2026-09-10 09:49:58.721349
2409	50	PRD-1789028920266-R1789033798906	120.0000	120.0000	available	2026-09-10 09:49:58.907454	2026-09-10 09:49:58.907454
2410	50	PRD-1789028920266-R1789033799073	120.0000	120.0000	available	2026-09-10 09:49:59.074379	2026-09-10 09:49:59.074379
2411	50	PRD-1789028920266-R1789033799276	119.1000	119.1000	available	2026-09-10 09:49:59.277651	2026-09-10 09:49:59.277651
2417	50	PRD-1789028920266-R1789033800400	110.8000	110.8000	available	2026-09-10 09:50:00.402054	2026-09-10 09:50:00.402054
2418	50	PRD-1789028920266-R1789033800597	113.3000	113.3000	available	2026-09-10 09:50:00.599296	2026-09-10 09:50:00.599296
2419	50	PRD-1789028920266-R1789033800801	118.7000	118.7000	available	2026-09-10 09:50:00.802897	2026-09-10 09:50:00.802897
2428	50	PRD-1789028920266-R1789033802694	120.0000	120.0000	available	2026-09-10 09:50:02.701253	2026-09-10 09:50:02.701253
2433	50	PRD-1789028920266-R1789033803847	92.7000	92.7000	available	2026-09-10 09:50:03.848561	2026-09-10 09:50:03.848561
2434	50	PRD-1789028920266-R1789033804022	121.9000	121.9000	available	2026-09-10 09:50:04.02379	2026-09-10 09:50:04.02379
2435	50	PRD-1789028920266-R1789033804241	119.3000	119.3000	available	2026-09-10 09:50:04.243688	2026-09-10 09:50:04.243688
2437	50	PRD-1789028920266-R1789033804656	120.0000	120.0000	available	2026-09-10 09:50:04.657428	2026-09-10 09:50:04.657428
2438	50	PRD-1789028920266-R1789033804839	120.2000	120.2000	available	2026-09-10 09:50:04.840676	2026-09-10 09:50:04.840676
2439	50	PRD-1789028920266-R1789033805032	97.8000	97.8000	available	2026-09-10 09:50:05.033099	2026-09-10 09:50:05.033099
2442	50	PRD-1789028920266-R1789033805679	120.0000	120.0000	available	2026-09-10 09:50:05.681036	2026-09-10 09:50:05.681036
2443	7	PRD-1789018404302-R1789033826126	123.8000	123.8000	available	2026-09-10 09:50:26.128039	2026-09-10 09:50:26.128039
2444	7	PRD-1789018404302-R1789033826255	114.9000	114.9000	available	2026-09-10 09:50:26.25647	2026-09-10 09:50:26.25647
2445	7	PRD-1789018404302-R1789033826665	115.3000	115.3000	available	2026-09-10 09:50:26.666398	2026-09-10 09:50:26.666398
2446	7	PRD-1789018404302-R1789033826874	124.9000	124.9000	available	2026-09-10 09:50:26.876823	2026-09-10 09:50:26.876823
2452	7	PRD-1789018404302-R1789033828951	117.4000	117.4000	available	2026-09-10 09:50:28.955499	2026-09-10 09:50:28.955499
2455	7	PRD-1789018404302-R1789033830045	120.0000	120.0000	available	2026-09-10 09:50:30.046286	2026-09-10 09:50:30.046286
2458	7	PRD-1789018404302-R1789033831009	110.7000	110.7000	available	2026-09-10 09:50:31.010741	2026-09-10 09:50:31.010741
2459	7	PRD-1789018404302-R1789033831372	116.0000	116.0000	available	2026-09-10 09:50:31.374197	2026-09-10 09:50:31.374197
2704	16	PRD-1789018928475-R1789034463684	58.0000	58.0000	available	2026-09-10 10:01:03.685597	2026-09-10 10:01:03.685597
2705	16	PRD-1789018928475-R1789034463811	57.0000	57.0000	available	2026-09-10 10:01:03.812126	2026-09-10 10:01:03.812126
2706	16	PRD-1789018928475-R1789034463934	74.7000	74.7000	available	2026-09-10 10:01:03.935496	2026-09-10 10:01:03.935496
2797	51	PRD-1789029511477-R1789034897754	123.7000	123.7000	available	2026-09-10 10:08:17.755872	2026-09-10 10:08:17.755872
2798	51	PRD-1789029511477-R1789034897939	120.0000	120.0000	available	2026-09-10 10:08:17.940047	2026-09-10 10:08:17.940047
2859	13	PRD-1789018725877-R1789037101393	120.0000	120.0000	available	2026-09-10 10:45:01.395444	2026-09-10 10:45:01.395444
2860	13	PRD-1789018725877-R1789037101524	119.0000	119.0000	available	2026-09-10 10:45:01.525471	2026-09-10 10:45:01.525471
2861	13	PRD-1789018725877-R1789037101667	118.0000	118.0000	available	2026-09-10 10:45:01.669557	2026-09-10 10:45:01.669557
2862	13	PRD-1789018725877-R1789037101793	120.0000	120.0000	available	2026-09-10 10:45:01.794237	2026-09-10 10:45:01.794237
2863	13	PRD-1789018725877-R1789037101939	121.1000	121.1000	available	2026-09-10 10:45:01.940552	2026-09-10 10:45:01.940552
2864	13	PRD-1789018725877-R1789037102050	114.0000	114.0000	available	2026-09-10 10:45:02.051515	2026-09-10 10:45:02.051515
2867	13	PRD-1789018725877-R1789037102463	114.8000	114.8000	available	2026-09-10 10:45:02.465584	2026-09-10 10:45:02.465584
2868	13	PRD-1789018725877-R1789037102581	93.8000	93.8000	available	2026-09-10 10:45:02.582685	2026-09-10 10:45:02.582685
2869	13	PRD-1789018725877-R1789037102695	127.0000	127.0000	available	2026-09-10 10:45:02.696413	2026-09-10 10:45:02.696413
2871	13	PRD-1789018725877-R1789037103028	99.1000	99.1000	available	2026-09-10 10:45:03.03097	2026-09-10 10:45:03.03097
2872	13	PRD-1789018725877-R1789037103190	123.5000	123.5000	available	2026-09-10 10:45:03.19092	2026-09-10 10:45:03.19092
2873	13	PRD-1789018725877-R1789037103373	126.0000	126.0000	available	2026-09-10 10:45:03.374757	2026-09-10 10:45:03.374757
2874	13	PRD-1789018725877-R1789037103530	118.0000	118.0000	available	2026-09-10 10:45:03.530819	2026-09-10 10:45:03.530819
2877	13	PRD-1789018725877-R1789037104021	120.2000	120.2000	available	2026-09-10 10:45:04.022847	2026-09-10 10:45:04.022847
2880	13	PRD-1789018725877-R1789037104516	108.4000	108.4000	available	2026-09-10 10:45:04.517356	2026-09-10 10:45:04.517356
2888	13	PRD-1789018725877-R1789037106064	103.4000	103.4000	available	2026-09-10 10:45:06.065573	2026-09-10 10:45:06.065573
2889	13	PRD-1789018725877-R1789037106188	108.3000	108.3000	available	2026-09-10 10:45:06.189893	2026-09-10 10:45:06.189893
2894	13	PRD-1789018725877-R1789037106786	118.3000	118.3000	available	2026-09-10 10:45:06.786941	2026-09-10 10:45:06.786941
2936	65	PRD-1789037343406-R1789037393423	117.0000	117.0000	available	2026-09-10 10:49:53.424435	2026-09-10 10:49:53.424435
2939	65	PRD-1789037343406-R1789037393723	118.0000	118.0000	available	2026-09-10 10:49:53.724224	2026-09-10 10:49:53.724224
2941	65	PRD-1789037343406-R1789037393929	118.4000	118.4000	available	2026-09-10 10:49:53.933734	2026-09-10 10:49:53.933734
2942	65	PRD-1789037343406-R1789037394020	118.7000	118.7000	available	2026-09-10 10:49:54.021774	2026-09-10 10:49:54.021774
2943	65	PRD-1789037343406-R1789037394139	126.7000	126.7000	available	2026-09-10 10:49:54.141644	2026-09-10 10:49:54.141644
2946	65	PRD-1789037343406-R1789037394474	124.0000	124.0000	available	2026-09-10 10:49:54.475688	2026-09-10 10:49:54.475688
2947	65	PRD-1789037343406-R1789037394565	130.8000	130.8000	available	2026-09-10 10:49:54.566493	2026-09-10 10:49:54.566493
2948	65	PRD-1789037343406-R1789037394667	117.3000	117.3000	available	2026-09-10 10:49:54.672208	2026-09-10 10:49:54.672208
3001	42	PRD-1789027568425-R1789037816711	70.1000	70.1000	available	2026-09-10 10:56:56.713166	2026-09-10 10:56:56.713166
3003	42	PRD-1789027568425-R1789037816861	66.1000	66.1000	available	2026-09-10 10:56:56.862874	2026-09-10 10:56:56.862874
3009	42	PRD-1789027568425-R1789037817558	64.1000	64.1000	available	2026-09-10 10:56:57.559913	2026-09-10 10:56:57.559913
3012	52	PRD-1789029576872-R1789037858641	121.6000	121.6000	available	2026-09-10 10:57:38.642584	2026-09-10 10:57:38.642584
3013	55	PRD-1789032520852-R1789037888405	114.5000	114.5000	available	2026-09-10 10:58:08.406524	2026-09-10 10:58:08.406524
3014	55	PRD-1789032520852-R1789037888510	114.4000	114.4000	available	2026-09-10 10:58:08.512933	2026-09-10 10:58:08.512933
2391	50	PRD-1789028920266-R1789033794156	120.0000	120.0000	available	2026-09-10 09:49:54.158209	2026-09-10 09:49:54.158209
2392	50	PRD-1789028920266-R1789033794411	120.0000	120.0000	available	2026-09-10 09:49:54.412978	2026-09-10 09:49:54.412978
2393	50	PRD-1789028920266-R1789033795231	107.0000	107.0000	available	2026-09-10 09:49:55.233011	2026-09-10 09:49:55.233011
2394	50	PRD-1789028920266-R1789033795487	120.8000	120.8000	available	2026-09-10 09:49:55.488864	2026-09-10 09:49:55.488864
2395	50	PRD-1789028920266-R1789033795698	117.9000	117.9000	available	2026-09-10 09:49:55.700353	2026-09-10 09:49:55.700353
2396	50	PRD-1789028920266-R1789033795972	120.0000	120.0000	available	2026-09-10 09:49:55.973839	2026-09-10 09:49:55.973839
2398	50	PRD-1789028920266-R1789033796438	120.0000	120.0000	available	2026-09-10 09:49:56.439809	2026-09-10 09:49:56.439809
2399	50	PRD-1789028920266-R1789033796647	116.0000	116.0000	available	2026-09-10 09:49:56.651859	2026-09-10 09:49:56.651859
2401	50	PRD-1789028920266-R1789033797096	121.6000	121.6000	available	2026-09-10 09:49:57.100549	2026-09-10 09:49:57.100549
2402	50	PRD-1789028920266-R1789033797319	120.0000	120.0000	available	2026-09-10 09:49:57.320392	2026-09-10 09:49:57.320392
2403	50	PRD-1789028920266-R1789033797529	120.2000	120.2000	available	2026-09-10 09:49:57.531005	2026-09-10 09:49:57.531005
2405	50	PRD-1789028920266-R1789033798010	117.0000	117.0000	available	2026-09-10 09:49:58.011956	2026-09-10 09:49:58.011956
2407	50	PRD-1789028920266-R1789033798477	116.0000	116.0000	available	2026-09-10 09:49:58.479031	2026-09-10 09:49:58.479031
2412	50	PRD-1789028920266-R1789033799482	120.1000	120.1000	available	2026-09-10 09:49:59.485553	2026-09-10 09:49:59.485553
2413	50	PRD-1789028920266-R1789033799650	116.0000	116.0000	available	2026-09-10 09:49:59.650785	2026-09-10 09:49:59.650785
2414	50	PRD-1789028920266-R1789033799846	120.2000	120.2000	available	2026-09-10 09:49:59.848154	2026-09-10 09:49:59.848154
2415	50	PRD-1789028920266-R1789033800030	123.2000	123.2000	available	2026-09-10 09:50:00.031289	2026-09-10 09:50:00.031289
2416	50	PRD-1789028920266-R1789033800206	125.0000	125.0000	available	2026-09-10 09:50:00.208185	2026-09-10 09:50:00.208185
2420	50	PRD-1789028920266-R1789033801012	121.4000	121.4000	available	2026-09-10 09:50:01.013624	2026-09-10 09:50:01.013624
2421	50	PRD-1789028920266-R1789033801238	104.9000	104.9000	available	2026-09-10 09:50:01.239396	2026-09-10 09:50:01.239396
2422	50	PRD-1789028920266-R1789033801431	120.5000	120.5000	available	2026-09-10 09:50:01.432511	2026-09-10 09:50:01.432511
2423	50	PRD-1789028920266-R1789033801617	121.0000	121.0000	available	2026-09-10 09:50:01.618567	2026-09-10 09:50:01.618567
2424	50	PRD-1789028920266-R1789033801796	120.0000	120.0000	available	2026-09-10 09:50:01.797845	2026-09-10 09:50:01.797845
2425	50	PRD-1789028920266-R1789033802023	120.0000	120.0000	available	2026-09-10 09:50:02.024467	2026-09-10 09:50:02.024467
2426	50	PRD-1789028920266-R1789033802234	120.6000	120.6000	available	2026-09-10 09:50:02.235418	2026-09-10 09:50:02.235418
2427	50	PRD-1789028920266-R1789033802489	120.0000	120.0000	available	2026-09-10 09:50:02.491416	2026-09-10 09:50:02.491416
2429	50	PRD-1789028920266-R1789033802961	120.0000	120.0000	available	2026-09-10 09:50:02.96298	2026-09-10 09:50:02.96298
2430	50	PRD-1789028920266-R1789033803151	116.9000	116.9000	available	2026-09-10 09:50:03.152152	2026-09-10 09:50:03.152152
2431	50	PRD-1789028920266-R1789033803369	106.6000	106.6000	available	2026-09-10 09:50:03.370457	2026-09-10 09:50:03.370457
2432	50	PRD-1789028920266-R1789033803629	120.3000	120.3000	available	2026-09-10 09:50:03.631663	2026-09-10 09:50:03.631663
2436	50	PRD-1789028920266-R1789033804425	120.0000	120.0000	available	2026-09-10 09:50:04.428742	2026-09-10 09:50:04.428742
2440	50	PRD-1789028920266-R1789033805251	123.4000	123.4000	available	2026-09-10 09:50:05.253772	2026-09-10 09:50:05.253772
2441	50	PRD-1789028920266-R1789033805434	116.2000	116.2000	available	2026-09-10 09:50:05.436059	2026-09-10 09:50:05.436059
2447	7	PRD-1789018404302-R1789033827077	111.9000	111.9000	available	2026-09-10 09:50:27.078936	2026-09-10 09:50:27.078936
2448	7	PRD-1789018404302-R1789033827477	122.8000	122.8000	available	2026-09-10 09:50:27.478602	2026-09-10 09:50:27.478602
2449	7	PRD-1789018404302-R1789033827860	117.8000	117.8000	available	2026-09-10 09:50:27.861703	2026-09-10 09:50:27.861703
2450	7	PRD-1789018404302-R1789033828235	121.7000	121.7000	available	2026-09-10 09:50:28.23986	2026-09-10 09:50:28.23986
2451	7	PRD-1789018404302-R1789033828611	120.8000	120.8000	available	2026-09-10 09:50:28.613282	2026-09-10 09:50:28.613282
2453	7	PRD-1789018404302-R1789033829271	116.3000	116.3000	available	2026-09-10 09:50:29.273308	2026-09-10 09:50:29.273308
2454	7	PRD-1789018404302-R1789033829654	114.8000	114.8000	available	2026-09-10 09:50:29.661326	2026-09-10 09:50:29.661326
2456	7	PRD-1789018404302-R1789033830270	118.3000	118.3000	available	2026-09-10 09:50:30.271282	2026-09-10 09:50:30.271282
2457	7	PRD-1789018404302-R1789033830618	101.6000	101.6000	available	2026-09-10 09:50:30.619396	2026-09-10 09:50:30.619396
2460	20	PRD-1789019067284-R1789033878313	106.7000	106.7000	available	2026-09-10 09:51:18.3147	2026-09-10 09:51:18.3147
2461	20	PRD-1789019067284-R1789033878369	108.8000	108.8000	available	2026-09-10 09:51:18.371657	2026-09-10 09:51:18.371657
2462	20	PRD-1789019067284-R1789033878557	105.1000	105.1000	available	2026-09-10 09:51:18.559349	2026-09-10 09:51:18.559349
2463	20	PRD-1789019067284-R1789033878646	120.2000	120.2000	available	2026-09-10 09:51:18.647442	2026-09-10 09:51:18.647442
2464	20	PRD-1789019067284-R1789033878786	125.9000	125.9000	available	2026-09-10 09:51:18.788007	2026-09-10 09:51:18.788007
2465	20	PRD-1789019067284-R1789033878918	121.6000	121.6000	available	2026-09-10 09:51:18.920265	2026-09-10 09:51:18.920265
2466	20	PRD-1789019067284-R1789033879030	114.8000	114.8000	available	2026-09-10 09:51:19.032115	2026-09-10 09:51:19.032115
2467	20	PRD-1789019067284-R1789033879166	104.9000	104.9000	available	2026-09-10 09:51:19.168857	2026-09-10 09:51:19.168857
2468	20	PRD-1789019067284-R1789033879324	121.5000	121.5000	available	2026-09-10 09:51:19.326437	2026-09-10 09:51:19.326437
2469	20	PRD-1789019067284-R1789033879470	115.9000	115.9000	available	2026-09-10 09:51:19.470944	2026-09-10 09:51:19.470944
2470	58	PRD-1789033578183-R1789033967067	108.7000	108.7000	available	2026-09-10 09:52:47.068207	2026-09-10 09:52:47.068207
2471	58	PRD-1789033578183-R1789033967277	126.4000	126.4000	available	2026-09-10 09:52:47.278646	2026-09-10 09:52:47.278646
2472	58	PRD-1789033578183-R1789033967478	131.4000	131.4000	available	2026-09-10 09:52:47.480721	2026-09-10 09:52:47.480721
2473	58	PRD-1789033578183-R1789033967665	124.1000	124.1000	available	2026-09-10 09:52:47.666623	2026-09-10 09:52:47.666623
2474	58	PRD-1789033578183-R1789033967857	131.6000	131.6000	available	2026-09-10 09:52:47.858925	2026-09-10 09:52:47.858925
2475	58	PRD-1789033578183-R1789033968029	103.8000	103.8000	available	2026-09-10 09:52:48.030774	2026-09-10 09:52:48.030774
2476	58	PRD-1789033578183-R1789033968252	137.0000	137.0000	available	2026-09-10 09:52:48.254818	2026-09-10 09:52:48.254818
2477	58	PRD-1789033578183-R1789033968427	123.9000	123.9000	available	2026-09-10 09:52:48.429275	2026-09-10 09:52:48.429275
2478	58	PRD-1789033578183-R1789033968637	107.7000	107.7000	available	2026-09-10 09:52:48.638462	2026-09-10 09:52:48.638462
2479	58	PRD-1789033578183-R1789033968874	147.7000	147.7000	available	2026-09-10 09:52:48.876882	2026-09-10 09:52:48.876882
2480	58	PRD-1789033578183-R1789033969090	131.6000	131.6000	available	2026-09-10 09:52:49.095626	2026-09-10 09:52:49.095626
2481	58	PRD-1789033578183-R1789033969404	105.1000	105.1000	available	2026-09-10 09:52:49.406176	2026-09-10 09:52:49.406176
2482	58	PRD-1789033578183-R1789033969621	107.3000	107.3000	available	2026-09-10 09:52:49.623072	2026-09-10 09:52:49.623072
2483	58	PRD-1789033578183-R1789033969829	129.2000	129.2000	available	2026-09-10 09:52:49.830705	2026-09-10 09:52:49.830705
2484	58	PRD-1789033578183-R1789033970005	102.4000	102.4000	available	2026-09-10 09:52:50.006586	2026-09-10 09:52:50.006586
2485	58	PRD-1789033578183-R1789033970219	121.6000	121.6000	available	2026-09-10 09:52:50.2208	2026-09-10 09:52:50.2208
2486	58	PRD-1789033578183-R1789033970442	126.3000	126.3000	available	2026-09-10 09:52:50.443187	2026-09-10 09:52:50.443187
2487	58	PRD-1789033578183-R1789033970626	149.2000	149.2000	available	2026-09-10 09:52:50.627286	2026-09-10 09:52:50.627286
2488	58	PRD-1789033578183-R1789033970833	107.6000	107.6000	available	2026-09-10 09:52:50.83504	2026-09-10 09:52:50.83504
2489	58	PRD-1789033578183-R1789033971046	127.6000	127.6000	available	2026-09-10 09:52:51.048309	2026-09-10 09:52:51.048309
2493	58	PRD-1789033578183-R1789033971902	105.3000	105.3000	available	2026-09-10 09:52:51.904484	2026-09-10 09:52:51.904484
2494	58	PRD-1789033578183-R1789033972083	126.2000	126.2000	available	2026-09-10 09:52:52.084182	2026-09-10 09:52:52.084182
2495	58	PRD-1789033578183-R1789033972299	127.3000	127.3000	available	2026-09-10 09:52:52.300302	2026-09-10 09:52:52.300302
2500	58	PRD-1789033578183-R1789033973334	124.3000	124.3000	available	2026-09-10 09:52:53.336508	2026-09-10 09:52:53.336508
2501	58	PRD-1789033578183-R1789033973549	126.6000	126.6000	available	2026-09-10 09:52:53.550262	2026-09-10 09:52:53.550262
2712	10	PRD-1789018615683-R1789034513277	118.3000	118.3000	available	2026-09-10 10:01:53.278735	2026-09-10 10:01:53.278735
2715	10	PRD-1789018615683-R1789034513775	118.3000	118.3000	available	2026-09-10 10:01:53.779253	2026-09-10 10:01:53.779253
2718	10	PRD-1789018615683-R1789034514204	114.7000	114.7000	available	2026-09-10 10:01:54.205959	2026-09-10 10:01:54.205959
2723	10	PRD-1789018615683-R1789034514992	108.0000	108.0000	available	2026-09-10 10:01:54.994329	2026-09-10 10:01:54.994329
2726	10	PRD-1789018615683-R1789034515443	121.0000	121.0000	available	2026-09-10 10:01:55.444754	2026-09-10 10:01:55.444754
2731	10	PRD-1789018615683-R1789034516338	129.1000	129.1000	available	2026-09-10 10:01:56.340074	2026-09-10 10:01:56.340074
2733	10	PRD-1789018615683-R1789034516806	112.9000	112.9000	available	2026-09-10 10:01:56.807855	2026-09-10 10:01:56.807855
2736	10	PRD-1789018615683-R1789034517410	120.8000	120.8000	available	2026-09-10 10:01:57.411972	2026-09-10 10:01:57.411972
2738	10	PRD-1789018615683-R1789034517746	112.3000	112.3000	available	2026-09-10 10:01:57.748116	2026-09-10 10:01:57.748116
2739	10	PRD-1789018615683-R1789034517941	123.6000	123.6000	available	2026-09-10 10:01:57.942407	2026-09-10 10:01:57.942407
2803	18	PRD-1789018957547-R1789036404453	65.0000	65.0000	available	2026-09-10 10:33:24.454973	2026-09-10 10:33:24.454973
2804	18	PRD-1789018957547-R1789036414575	120.2000	120.2000	available	2026-09-10 10:33:34.577162	2026-09-10 10:33:34.577162
2805	18	PRD-1789018957547-R1789036414680	120.2000	120.2000	available	2026-09-10 10:33:34.681938	2026-09-10 10:33:34.681938
2806	36	PRD-1789025355244-R1789036488101	117.0000	117.0000	available	2026-09-10 10:34:48.102842	2026-09-10 10:34:48.102842
2816	20	PRD-1789019067284-R1789036501966	106.5000	106.5000	available	2026-09-10 10:35:01.968331	2026-09-10 10:35:01.968331
2817	50	PRD-1789028920266-R1789036539194	115.2000	115.2000	available	2026-09-10 10:35:39.194963	2026-09-10 10:35:39.194963
2818	50	PRD-1789028920266-R1789036539319	127.6000	127.6000	available	2026-09-10 10:35:39.319794	2026-09-10 10:35:39.319794
2820	24	PRD-1789020615250-R1789036558004	118.3000	118.3000	available	2026-09-10 10:35:58.006906	2026-09-10 10:35:58.006906
2821	7	PRD-1789018404302-R1789036572174	113.1000	113.1000	available	2026-09-10 10:36:12.176885	2026-09-10 10:36:12.176885
2822	1	PRD-1789017671180-R1789036586300	112.6000	112.6000	available	2026-09-10 10:36:26.301959	2026-09-10 10:36:26.301959
2823	12	PRD-1789018691298-R1789036703858	121.0000	121.0000	available	2026-09-10 10:38:23.859933	2026-09-10 10:38:23.859933
2824	12	PRD-1789018691298-R1789036704027	119.8000	119.8000	available	2026-09-10 10:38:24.031031	2026-09-10 10:38:24.031031
2825	12	PRD-1789018691298-R1789036704852	123.9000	123.9000	available	2026-09-10 10:38:24.853742	2026-09-10 10:38:24.853742
2828	12	PRD-1789018691298-R1789036705250	117.5000	117.5000	available	2026-09-10 10:38:25.252381	2026-09-10 10:38:25.252381
2829	12	PRD-1789018691298-R1789036705372	127.6000	127.6000	available	2026-09-10 10:38:25.373594	2026-09-10 10:38:25.373594
2830	12	PRD-1789018691298-R1789036705524	130.7000	130.7000	available	2026-09-10 10:38:25.526083	2026-09-10 10:38:25.526083
2831	12	PRD-1789018691298-R1789036705655	126.3000	126.3000	available	2026-09-10 10:38:25.6571	2026-09-10 10:38:25.6571
2833	12	PRD-1789018691298-R1789036705947	126.3000	126.3000	available	2026-09-10 10:38:25.948875	2026-09-10 10:38:25.948875
2834	12	PRD-1789018691298-R1789036706082	93.8000	93.8000	available	2026-09-10 10:38:26.08393	2026-09-10 10:38:26.08393
2835	12	PRD-1789018691298-R1789036706205	133.1000	133.1000	available	2026-09-10 10:38:26.206793	2026-09-10 10:38:26.206793
2840	12	PRD-1789018691298-R1789036706901	122.2000	122.2000	available	2026-09-10 10:38:26.904333	2026-09-10 10:38:26.904333
2842	12	PRD-1789018691298-R1789036707228	110.2500	110.2500	available	2026-09-10 10:38:27.232265	2026-09-10 10:38:27.232265
2845	12	PRD-1789018691298-R1789036707580	115.8000	115.8000	available	2026-09-10 10:38:27.581507	2026-09-10 10:38:27.581507
2846	12	PRD-1789018691298-R1789036707762	126.9000	126.9000	available	2026-09-10 10:38:27.762889	2026-09-10 10:38:27.762889
2847	12	PRD-1789018691298-R1789036707880	128.6000	128.6000	available	2026-09-10 10:38:27.881228	2026-09-10 10:38:27.881228
2849	12	PRD-1789018691298-R1789036708184	123.1000	123.1000	available	2026-09-10 10:38:28.186135	2026-09-10 10:38:28.186135
2850	12	PRD-1789018691298-R1789036708342	131.3000	131.3000	available	2026-09-10 10:38:28.344228	2026-09-10 10:38:28.344228
2851	12	PRD-1789018691298-R1789036708522	97.5000	97.5000	available	2026-09-10 10:38:28.524001	2026-09-10 10:38:28.524001
2852	12	PRD-1789018691298-R1789036708660	121.5000	121.5000	available	2026-09-10 10:38:28.661879	2026-09-10 10:38:28.661879
2853	12	PRD-1789018691298-R1789036708995	123.4000	123.4000	available	2026-09-10 10:38:28.99666	2026-09-10 10:38:28.99666
2881	13	PRD-1789018725877-R1789037104711	123.0000	123.0000	available	2026-09-10 10:45:04.712933	2026-09-10 10:45:04.712933
2882	13	PRD-1789018725877-R1789037104887	134.5000	134.5000	available	2026-09-10 10:45:04.888734	2026-09-10 10:45:04.888734
2883	13	PRD-1789018725877-R1789037105122	122.7000	122.7000	available	2026-09-10 10:45:05.124744	2026-09-10 10:45:05.124744
2884	13	PRD-1789018725877-R1789037105302	120.3600	120.3600	available	2026-09-10 10:45:05.305118	2026-09-10 10:45:05.305118
2887	13	PRD-1789018725877-R1789037105855	122.0000	122.0000	available	2026-09-10 10:45:05.858954	2026-09-10 10:45:05.858954
2890	13	PRD-1789018725877-R1789037106319	120.2000	120.2000	available	2026-09-10 10:45:06.319725	2026-09-10 10:45:06.319725
2891	13	PRD-1789018725877-R1789037106430	125.2000	125.2000	available	2026-09-10 10:45:06.431532	2026-09-10 10:45:06.431532
2892	13	PRD-1789018725877-R1789037106537	119.2000	119.2000	available	2026-09-10 10:45:06.53876	2026-09-10 10:45:06.53876
2893	13	PRD-1789018725877-R1789037106644	116.3000	116.3000	available	2026-09-10 10:45:06.645623	2026-09-10 10:45:06.645623
2895	13	PRD-1789018725877-R1789037106935	114.8000	114.8000	available	2026-09-10 10:45:06.938834	2026-09-10 10:45:06.938834
2896	13	PRD-1789018725877-R1789037107065	120.0000	120.0000	available	2026-09-10 10:45:07.066134	2026-09-10 10:45:07.066134
2897	13	PRD-1789018725877-R1789037107165	120.0000	120.0000	available	2026-09-10 10:45:07.16711	2026-09-10 10:45:07.16711
2898	13	PRD-1789018725877-R1789037107340	124.7000	124.7000	available	2026-09-10 10:45:07.341543	2026-09-10 10:45:07.341543
2899	13	PRD-1789018725877-R1789037107450	98.1000	98.1000	available	2026-09-10 10:45:07.451978	2026-09-10 10:45:07.451978
2901	13	PRD-1789018725877-R1789037107784	122.7000	122.7000	available	2026-09-10 10:45:07.789046	2026-09-10 10:45:07.789046
2902	13	PRD-1789018725877-R1789037107920	109.9000	109.9000	available	2026-09-10 10:45:07.920876	2026-09-10 10:45:07.920876
2903	13	PRD-1789018725877-R1789037108013	123.1000	123.1000	available	2026-09-10 10:45:08.014957	2026-09-10 10:45:08.014957
2904	13	PRD-1789018725877-R1789037108152	123.0000	123.0000	available	2026-09-10 10:45:08.153965	2026-09-10 10:45:08.153965
2953	11	PRD-1789018656012-R1789037437686	112.9000	112.9000	available	2026-09-10 10:50:37.687148	2026-09-10 10:50:37.687148
2956	11	PRD-1789018656012-R1789037438025	93.4000	93.4000	available	2026-09-10 10:50:38.026055	2026-09-10 10:50:38.026055
2958	11	PRD-1789018656012-R1789037438389	116.3000	116.3000	available	2026-09-10 10:50:38.393754	2026-09-10 10:50:38.393754
2959	11	PRD-1789018656012-R1789037438521	112.4000	112.4000	available	2026-09-10 10:50:38.521878	2026-09-10 10:50:38.521878
3008	42	PRD-1789027568425-R1789037817470	62.2000	62.2000	available	2026-09-10 10:56:57.47217	2026-09-10 10:56:57.47217
3011	42	PRD-1789027568425-R1789037817755	60.3000	60.3000	available	2026-09-10 10:56:57.756781	2026-09-10 10:56:57.756781
3031	32	PRD-1789025098770-R1789038000348	131.0000	131.0000	available	2026-09-10 11:00:00.349069	2026-09-10 11:00:00.349069
2490	58	PRD-1789033578183-R1789033971256	116.3000	116.3000	available	2026-09-10 09:52:51.259101	2026-09-10 09:52:51.259101
2491	58	PRD-1789033578183-R1789033971455	105.2000	105.2000	available	2026-09-10 09:52:51.456326	2026-09-10 09:52:51.456326
2492	58	PRD-1789033578183-R1789033971652	118.9000	118.9000	available	2026-09-10 09:52:51.653956	2026-09-10 09:52:51.653956
2499	58	PRD-1789033578183-R1789033973099	138.5000	138.5000	available	2026-09-10 09:52:53.102318	2026-09-10 09:52:53.102318
2713	10	PRD-1789018615683-R1789034513480	121.0000	121.0000	available	2026-09-10 10:01:53.481963	2026-09-10 10:01:53.481963
2716	10	PRD-1789018615683-R1789034513920	118.3000	118.3000	available	2026-09-10 10:01:53.922441	2026-09-10 10:01:53.922441
2719	10	PRD-1789018615683-R1789034514341	114.6000	114.6000	available	2026-09-10 10:01:54.343331	2026-09-10 10:01:54.343331
2721	10	PRD-1789018615683-R1789034514691	118.7000	118.7000	available	2026-09-10 10:01:54.693472	2026-09-10 10:01:54.693472
2724	10	PRD-1789018615683-R1789034515136	105.4000	105.4000	available	2026-09-10 10:01:55.138157	2026-09-10 10:01:55.138157
2727	10	PRD-1789018615683-R1789034515589	118.3000	118.3000	available	2026-09-10 10:01:55.590725	2026-09-10 10:01:55.590725
2730	10	PRD-1789018615683-R1789034516165	118.3000	118.3000	available	2026-09-10 10:01:56.167127	2026-09-10 10:01:56.167127
2732	10	PRD-1789018615683-R1789034516535	119.5000	119.5000	available	2026-09-10 10:01:56.536767	2026-09-10 10:01:56.536767
2735	10	PRD-1789018615683-R1789034517201	114.8000	114.8000	available	2026-09-10 10:01:57.202769	2026-09-10 10:01:57.202769
2807	36	PRD-1789025355244-R1789036488259	118.2000	118.2000	available	2026-09-10 10:34:48.26078	2026-09-10 10:34:48.26078
2808	36	PRD-1789025355244-R1789036488389	120.0000	120.0000	available	2026-09-10 10:34:48.390003	2026-09-10 10:34:48.390003
2809	36	PRD-1789025355244-R1789036488568	120.2000	120.2000	available	2026-09-10 10:34:48.569438	2026-09-10 10:34:48.569438
2812	36	PRD-1789025355244-R1789036489059	112.6000	112.6000	available	2026-09-10 10:34:49.063784	2026-09-10 10:34:49.063784
2905	6	PRD-1789018369136-R1789037169260	116.6000	116.6000	available	2026-09-10 10:46:09.262304	2026-09-10 10:46:09.262304
2906	7	PRD-1789018404302-R1789037279804	112.9000	112.9000	available	2026-09-10 10:47:59.805235	2026-09-10 10:47:59.805235
2907	7	PRD-1789018404302-R1789037279969	120.2000	120.2000	available	2026-09-10 10:47:59.970426	2026-09-10 10:47:59.970426
2909	7	PRD-1789018404302-R1789037281161	104.3000	104.3000	available	2026-09-10 10:48:01.162693	2026-09-10 10:48:01.162693
2910	7	PRD-1789018404302-R1789037281291	120.1000	120.1000	available	2026-09-10 10:48:01.292123	2026-09-10 10:48:01.292123
2912	7	PRD-1789018404302-R1789037281677	118.0000	118.0000	available	2026-09-10 10:48:01.678144	2026-09-10 10:48:01.678144
2915	7	PRD-1789018404302-R1789037282266	121.1000	121.1000	available	2026-09-10 10:48:02.267798	2026-09-10 10:48:02.267798
2921	7	PRD-1789018404302-R1789037283481	120.0000	120.0000	available	2026-09-10 10:48:03.482828	2026-09-10 10:48:03.482828
2924	7	PRD-1789018404302-R1789037284000	118.0000	118.0000	available	2026-09-10 10:48:04.001772	2026-09-10 10:48:04.001772
2960	11	PRD-1789018656012-R1789037438686	120.9000	120.9000	available	2026-09-10 10:50:38.687062	2026-09-10 10:50:38.687062
2961	66	PRD-1789037465593-R1789037550488	125.1000	125.1000	available	2026-09-10 10:52:30.494234	2026-09-10 10:52:30.494234
2962	66	PRD-1789037465593-R1789037550608	114.8000	114.8000	available	2026-09-10 10:52:30.610045	2026-09-10 10:52:30.610045
2963	66	PRD-1789037465593-R1789037550705	123.2000	123.2000	available	2026-09-10 10:52:30.706649	2026-09-10 10:52:30.706649
2964	66	PRD-1789037465593-R1789037550824	126.2000	126.2000	available	2026-09-10 10:52:30.825606	2026-09-10 10:52:30.825606
3002	42	PRD-1789027568425-R1789037816806	62.9000	62.9000	available	2026-09-10 10:56:56.807483	2026-09-12 03:17:52.833
3015	55	PRD-1789032520852-R1789037888674	122.0000	122.0000	available	2026-09-10 10:58:08.676756	2026-09-10 10:58:08.676756
3016	55	PRD-1789032520852-R1789037888829	115.9000	115.9000	available	2026-09-10 10:58:08.830542	2026-09-10 10:58:08.830542
3019	55	PRD-1789032520852-R1789037889340	119.4000	119.4000	available	2026-09-10 10:58:09.34154	2026-09-10 10:58:09.34154
3034	32	PRD-1789025098770-R1789038000612	135.0000	135.0000	available	2026-09-10 11:00:00.613357	2026-09-10 11:00:00.613357
3035	32	PRD-1789025098770-R1789038000685	134.0000	134.0000	available	2026-09-10 11:00:00.686764	2026-09-10 11:00:00.686764
3036	14	PRD-1789018782133-R1789038025037	120.4000	120.4000	available	2026-09-10 11:00:25.038728	2026-09-10 11:00:25.038728
3037	56	PRD-1789033426514-R1789038036345	94.8000	94.8000	available	2026-09-10 11:00:36.347388	2026-09-10 11:00:36.347388
3038	56	PRD-1789033426514-R1789038036424	120.0000	120.0000	available	2026-09-10 11:00:36.42584	2026-09-10 11:00:36.42584
3048	58	PRD-1789033578183-R1789038212276	114.4000	114.4000	available	2026-09-10 11:03:32.277971	2026-09-10 11:03:32.277971
3050	58	PRD-1789033578183-R1789038212498	109.1000	109.1000	available	2026-09-10 11:03:32.499584	2026-09-10 11:03:32.499584
3051	58	PRD-1789033578183-R1789038212598	117.3000	117.3000	available	2026-09-10 11:03:32.600388	2026-09-10 11:03:32.600388
3063	58	PRD-1789033578183-R1789038214271	114.6000	114.6000	available	2026-09-10 11:03:34.273269	2026-09-10 11:03:34.273269
3066	58	PRD-1789033578183-R1789038214674	117.9000	117.9000	available	2026-09-10 11:03:34.676213	2026-09-10 11:03:34.676213
3067	58	PRD-1789033578183-R1789038214847	115.3000	115.3000	available	2026-09-10 11:03:34.856562	2026-09-10 11:03:34.856562
3068	58	PRD-1789033578183-R1789038215036	117.3000	117.3000	available	2026-09-10 11:03:35.038714	2026-09-10 11:03:35.038714
3071	58	PRD-1789033578183-R1789038215433	117.3000	117.3000	available	2026-09-10 11:03:35.435449	2026-09-10 11:03:35.435449
3074	58	PRD-1789033578183-R1789038215872	117.3000	117.3000	available	2026-09-10 11:03:35.874425	2026-09-10 11:03:35.874425
3077	58	PRD-1789033578183-R1789038216302	117.3000	117.3000	available	2026-09-10 11:03:36.315254	2026-09-10 11:03:36.315254
3078	58	PRD-1789033578183-R1789038216443	117.3000	117.3000	available	2026-09-10 11:03:36.44456	2026-09-10 11:03:36.44456
3079	58	PRD-1789033578183-R1789038216612	117.2000	117.2000	available	2026-09-10 11:03:36.615416	2026-09-10 11:03:36.615416
3100	52	PRD-1789029576872-R1789038328365	117.0000	117.0000	available	2026-09-10 11:05:28.366813	2026-09-10 11:05:28.366813
3115	15	PRD-1789018843399-R1789038456509	118.1000	118.1000	available	2026-09-10 11:07:36.512378	2026-09-10 11:07:36.512378
3116	15	PRD-1789018843399-R1789038456603	118.2000	118.2000	available	2026-09-10 11:07:36.604231	2026-09-10 11:07:36.604231
3120	13	PRD-1789018725877-R1789038639471	116.7000	116.7000	available	2026-09-10 11:10:39.473493	2026-09-10 11:10:39.473493
3121	13	PRD-1789018725877-R1789038639580	120.3000	120.3000	available	2026-09-10 11:10:39.585367	2026-09-10 11:10:39.585367
3122	13	PRD-1789018725877-R1789038639892	120.6000	120.6000	available	2026-09-10 11:10:39.893731	2026-09-10 11:10:39.893731
3123	13	PRD-1789018725877-R1789038640010	121.4000	121.4000	available	2026-09-10 11:10:40.01172	2026-09-10 11:10:40.01172
3125	13	PRD-1789018725877-R1789038640440	120.2000	120.2000	available	2026-09-10 11:10:40.446278	2026-09-10 11:10:40.446278
3126	13	PRD-1789018725877-R1789038640675	113.7000	113.7000	available	2026-09-10 11:10:40.679536	2026-09-10 11:10:40.679536
3127	13	PRD-1789018725877-R1789038640900	148.7000	148.7000	available	2026-09-10 11:10:40.902447	2026-09-10 11:10:40.902447
3128	13	PRD-1789018725877-R1789038641096	119.4000	119.4000	available	2026-09-10 11:10:41.098173	2026-09-10 11:10:41.098173
3130	13	PRD-1789018725877-R1789038641443	118.0000	118.0000	available	2026-09-10 11:10:41.446808	2026-09-10 11:10:41.446808
3131	13	PRD-1789018725877-R1789038641635	120.2000	120.2000	available	2026-09-10 11:10:41.637023	2026-09-10 11:10:41.637023
3133	13	PRD-1789018725877-R1789038642046	12.2200	12.2200	available	2026-09-10 11:10:42.047116	2026-09-10 11:10:42.047116
3134	13	PRD-1789018725877-R1789038642232	118.0000	118.0000	available	2026-09-10 11:10:42.234217	2026-09-10 11:10:42.234217
3135	13	PRD-1789018725877-R1789038642403	115.9000	115.9000	available	2026-09-10 11:10:42.408158	2026-09-10 11:10:42.408158
3136	13	PRD-1789018725877-R1789038642594	116.0000	116.0000	available	2026-09-10 11:10:42.596342	2026-09-10 11:10:42.596342
3138	13	PRD-1789018725877-R1789038642976	115.0000	115.0000	available	2026-09-10 11:10:42.979317	2026-09-10 11:10:42.979317
3139	13	PRD-1789018725877-R1789038643202	1044.8000	1044.8000	available	2026-09-10 11:10:43.203609	2026-09-10 11:10:43.203609
2496	58	PRD-1789033578183-R1789033972506	100.5000	100.5000	available	2026-09-10 09:52:52.508538	2026-09-10 09:52:52.508538
2497	58	PRD-1789033578183-R1789033972683	123.5000	123.5000	available	2026-09-10 09:52:52.685075	2026-09-10 09:52:52.685075
2498	58	PRD-1789033578183-R1789033972905	97.3000	97.3000	available	2026-09-10 09:52:52.907313	2026-09-10 09:52:52.907313
2502	58	PRD-1789033578183-R1789033973790	122.7000	122.7000	available	2026-09-10 09:52:53.791589	2026-09-10 09:52:53.791589
2503	58	PRD-1789033578183-R1789033974007	123.5000	123.5000	available	2026-09-10 09:52:54.008286	2026-09-10 09:52:54.008286
2504	58	PRD-1789033578183-R1789033974204	128.0000	128.0000	available	2026-09-10 09:52:54.20493	2026-09-10 09:52:54.20493
2505	58	PRD-1789033578183-R1789033974414	124.2000	124.2000	available	2026-09-10 09:52:54.415781	2026-09-10 09:52:54.415781
2506	50	PRD-1789028920266-R1789034039186	116.5000	116.5000	available	2026-09-10 09:53:59.186877	2026-09-10 09:53:59.186877
2507	50	PRD-1789028920266-R1789034039252	116.0000	116.0000	available	2026-09-10 09:53:59.255329	2026-09-10 09:53:59.255329
2508	50	PRD-1789028920266-R1789034039651	116.0000	116.0000	available	2026-09-10 09:53:59.652604	2026-09-10 09:53:59.652604
2509	50	PRD-1789028920266-R1789034039772	116.0000	116.0000	available	2026-09-10 09:53:59.773237	2026-09-10 09:53:59.773237
2510	50	PRD-1789028920266-R1789034039945	122.8000	122.8000	available	2026-09-10 09:53:59.947257	2026-09-10 09:53:59.947257
2511	50	PRD-1789028920266-R1789034040171	122.0000	122.0000	available	2026-09-10 09:54:00.174631	2026-09-10 09:54:00.174631
2512	50	PRD-1789028920266-R1789034040428	116.2000	116.2000	available	2026-09-10 09:54:00.431189	2026-09-10 09:54:00.431189
2513	50	PRD-1789028920266-R1789034040660	114.0000	114.0000	available	2026-09-10 09:54:00.66777	2026-09-10 09:54:00.66777
2514	50	PRD-1789028920266-R1789034040896	114.1000	114.1000	available	2026-09-10 09:54:00.897981	2026-09-10 09:54:00.897981
2515	50	PRD-1789028920266-R1789034041155	116.0000	116.0000	available	2026-09-10 09:54:01.156507	2026-09-10 09:54:01.156507
2516	50	PRD-1789028920266-R1789034041421	116.0000	116.0000	available	2026-09-10 09:54:01.422933	2026-09-10 09:54:01.422933
2517	50	PRD-1789028920266-R1789034041726	117.6000	117.6000	available	2026-09-10 09:54:01.729071	2026-09-10 09:54:01.729071
2518	50	PRD-1789028920266-R1789034041928	116.0000	116.0000	available	2026-09-10 09:54:01.929896	2026-09-10 09:54:01.929896
2519	50	PRD-1789028920266-R1789034042171	118.0000	118.0000	available	2026-09-10 09:54:02.173428	2026-09-10 09:54:02.173428
2520	50	PRD-1789028920266-R1789034042431	116.0000	116.0000	available	2026-09-10 09:54:02.432892	2026-09-10 09:54:02.432892
2521	50	PRD-1789028920266-R1789034042709	116.0000	116.0000	available	2026-09-10 09:54:02.71092	2026-09-10 09:54:02.71092
2522	50	PRD-1789028920266-R1789034043074	118.3000	118.3000	available	2026-09-10 09:54:03.07987	2026-09-10 09:54:03.07987
2523	50	PRD-1789028920266-R1789034043347	116.0000	116.0000	available	2026-09-10 09:54:03.348152	2026-09-10 09:54:03.348152
2524	50	PRD-1789028920266-R1789034043656	120.0000	120.0000	available	2026-09-10 09:54:03.659016	2026-09-10 09:54:03.659016
2525	50	PRD-1789028920266-R1789034043976	120.0000	120.0000	available	2026-09-10 09:54:03.97739	2026-09-10 09:54:03.97739
2526	50	PRD-1789028920266-R1789034044261	116.0000	116.0000	available	2026-09-10 09:54:04.262856	2026-09-10 09:54:04.262856
2527	50	PRD-1789028920266-R1789034044489	119.1000	119.1000	available	2026-09-10 09:54:04.490689	2026-09-10 09:54:04.490689
2528	50	PRD-1789028920266-R1789034044722	116.0000	116.0000	available	2026-09-10 09:54:04.723754	2026-09-10 09:54:04.723754
2529	50	PRD-1789028920266-R1789034044955	116.0000	116.0000	available	2026-09-10 09:54:04.958171	2026-09-10 09:54:04.958171
2530	50	PRD-1789028920266-R1789034045248	119.8000	119.8000	available	2026-09-10 09:54:05.249414	2026-09-10 09:54:05.249414
2531	50	PRD-1789028920266-R1789034045588	116.0000	116.0000	available	2026-09-10 09:54:05.589783	2026-09-10 09:54:05.589783
2532	50	PRD-1789028920266-R1789034045882	126.8000	126.8000	available	2026-09-10 09:54:05.885335	2026-09-10 09:54:05.885335
2533	50	PRD-1789028920266-R1789034046144	103.7000	103.7000	available	2026-09-10 09:54:06.146772	2026-09-10 09:54:06.146772
2534	50	PRD-1789028920266-R1789034046394	120.1000	120.1000	available	2026-09-10 09:54:06.39644	2026-09-10 09:54:06.39644
2535	50	PRD-1789028920266-R1789034046683	98.5000	98.5000	available	2026-09-10 09:54:06.685206	2026-09-10 09:54:06.685206
2536	50	PRD-1789028920266-R1789034047160	116.0000	116.0000	available	2026-09-10 09:54:07.161989	2026-09-10 09:54:07.161989
2537	50	PRD-1789028920266-R1789034047481	116.2000	116.2000	available	2026-09-10 09:54:07.483142	2026-09-10 09:54:07.483142
2538	50	PRD-1789028920266-R1789034047840	116.0000	116.0000	available	2026-09-10 09:54:07.841926	2026-09-10 09:54:07.841926
2539	50	PRD-1789028920266-R1789034048219	116.0000	116.0000	available	2026-09-10 09:54:08.221044	2026-09-10 09:54:08.221044
2540	50	PRD-1789028920266-R1789034048460	116.2000	116.2000	available	2026-09-10 09:54:08.461286	2026-09-10 09:54:08.461286
2541	50	PRD-1789028920266-R1789034049024	116.2000	116.2000	available	2026-09-10 09:54:09.036727	2026-09-10 09:54:09.036727
2542	50	PRD-1789028920266-R1789034049426	111.7000	111.7000	available	2026-09-10 09:54:09.428341	2026-09-10 09:54:09.428341
2543	50	PRD-1789028920266-R1789034049813	126.5000	126.5000	available	2026-09-10 09:54:09.814739	2026-09-10 09:54:09.814739
2544	50	PRD-1789028920266-R1789034050045	124.7000	124.7000	available	2026-09-10 09:54:10.046403	2026-09-10 09:54:10.046403
2545	50	PRD-1789028920266-R1789034050318	125.0000	125.0000	available	2026-09-10 09:54:10.320665	2026-09-10 09:54:10.320665
2546	50	PRD-1789028920266-R1789034050850	123.7000	123.7000	available	2026-09-10 09:54:10.852182	2026-09-10 09:54:10.852182
2547	50	PRD-1789028920266-R1789034051214	116.0000	116.0000	available	2026-09-10 09:54:11.215496	2026-09-10 09:54:11.215496
2548	24	PRD-1789020615250-R1789034144838	112.3000	112.3000	available	2026-09-10 09:55:44.840111	2026-09-10 09:55:44.840111
2549	24	PRD-1789020615250-R1789034145101	107.2000	107.2000	available	2026-09-10 09:55:45.101955	2026-09-10 09:55:45.101955
2550	24	PRD-1789020615250-R1789034145271	126.9000	126.9000	available	2026-09-10 09:55:45.272566	2026-09-10 09:55:45.272566
2551	24	PRD-1789020615250-R1789034145464	106.6000	106.6000	available	2026-09-10 09:55:45.465506	2026-09-10 09:55:45.465506
2552	24	PRD-1789020615250-R1789034145703	121.0000	121.0000	available	2026-09-10 09:55:45.70705	2026-09-10 09:55:45.70705
2553	24	PRD-1789020615250-R1789034145968	91.1000	91.1000	available	2026-09-10 09:55:45.969243	2026-09-10 09:55:45.969243
2554	24	PRD-1789020615250-R1789034146188	107.6000	107.6000	available	2026-09-10 09:55:46.18941	2026-09-10 09:55:46.18941
2555	24	PRD-1789020615250-R1789034146320	120.5000	120.5000	available	2026-09-10 09:55:46.321916	2026-09-10 09:55:46.321916
2556	24	PRD-1789020615250-R1789034146467	127.9000	127.9000	available	2026-09-10 09:55:46.46912	2026-09-10 09:55:46.46912
2557	24	PRD-1789020615250-R1789034146582	90.9000	90.9000	available	2026-09-10 09:55:46.583853	2026-09-10 09:55:46.583853
2558	24	PRD-1789020615250-R1789034146694	120.2000	120.2000	available	2026-09-10 09:55:46.696384	2026-09-10 09:55:46.696384
2559	24	PRD-1789020615250-R1789034146831	133.3000	133.3000	available	2026-09-10 09:55:46.832555	2026-09-10 09:55:46.832555
2560	24	PRD-1789020615250-R1789034146965	123.5000	123.5000	available	2026-09-10 09:55:46.966784	2026-09-10 09:55:46.966784
2561	24	PRD-1789020615250-R1789034147096	108.5000	108.5000	available	2026-09-10 09:55:47.097194	2026-09-10 09:55:47.097194
2562	24	PRD-1789020615250-R1789034147237	106.9000	106.9000	available	2026-09-10 09:55:47.23916	2026-09-10 09:55:47.23916
2563	24	PRD-1789020615250-R1789034147421	92.3000	92.3000	available	2026-09-10 09:55:47.432596	2026-09-10 09:55:47.432596
2564	24	PRD-1789020615250-R1789034147551	81.8000	81.8000	available	2026-09-10 09:55:47.556601	2026-09-10 09:55:47.556601
2565	24	PRD-1789020615250-R1789034147691	118.3000	118.3000	available	2026-09-10 09:55:47.692208	2026-09-10 09:55:47.692208
2566	24	PRD-1789020615250-R1789034147872	117.3000	117.3000	available	2026-09-10 09:55:47.873789	2026-09-10 09:55:47.873789
2567	24	PRD-1789020615250-R1789034148003	118.3000	118.3000	available	2026-09-10 09:55:48.004919	2026-09-10 09:55:48.004919
2568	24	PRD-1789020615250-R1789034148153	118.3000	118.3000	available	2026-09-10 09:55:48.154571	2026-09-10 09:55:48.154571
2569	24	PRD-1789020615250-R1789034148297	118.3000	118.3000	available	2026-09-10 09:55:48.302733	2026-09-10 09:55:48.302733
2570	24	PRD-1789020615250-R1789034148410	118.2000	118.2000	available	2026-09-10 09:55:48.411978	2026-09-10 09:55:48.411978
2571	24	PRD-1789020615250-R1789034148575	108.7000	108.7000	available	2026-09-10 09:55:48.581688	2026-09-10 09:55:48.581688
2572	24	PRD-1789020615250-R1789034148756	118.3000	118.3000	available	2026-09-10 09:55:48.757794	2026-09-10 09:55:48.757794
2742	2	PRD-1789018062554-R1789034544716	119.3000	119.3000	available	2026-09-10 10:02:24.719271	2026-09-10 10:02:24.719271
2743	2	PRD-1789018062554-R1789034544876	112.9000	112.9000	available	2026-09-10 10:02:24.880782	2026-09-10 10:02:24.880782
2744	2	PRD-1789018062554-R1789034545105	112.4000	112.4000	available	2026-09-10 10:02:25.106856	2026-09-10 10:02:25.106856
2745	2	PRD-1789018062554-R1789034545274	111.7000	111.7000	available	2026-09-10 10:02:25.275638	2026-09-10 10:02:25.275638
2747	2	PRD-1789018062554-R1789034545523	109.1000	109.1000	available	2026-09-10 10:02:25.525217	2026-09-10 10:02:25.525217
2748	2	PRD-1789018062554-R1789034545627	115.1000	115.1000	available	2026-09-10 10:02:25.628686	2026-09-10 10:02:25.628686
2749	2	PRD-1789018062554-R1789034545752	115.7000	115.7000	available	2026-09-10 10:02:25.753499	2026-09-10 10:02:25.753499
2750	2	PRD-1789018062554-R1789034545886	112.5000	112.5000	available	2026-09-10 10:02:25.887061	2026-09-10 10:02:25.887061
2752	2	PRD-1789018062554-R1789034546143	116.8000	116.8000	available	2026-09-10 10:02:26.144811	2026-09-10 10:02:26.144811
2755	63	PRD-1789034575975-R1789034584014	53.8000	53.8000	available	2026-09-10 10:03:04.016663	2026-09-10 10:03:04.016663
2756	6	PRD-1789018369136-R1789034598815	120.8000	120.8000	available	2026-09-10 10:03:18.81716	2026-09-10 10:03:18.81716
2757	11	PRD-1789018656012-R1789034612218	117.7000	117.7000	available	2026-09-10 10:03:32.22062	2026-09-10 10:03:32.22062
2758	6	PRD-1789018369136-R1789034624704	114.6000	114.6000	available	2026-09-10 10:03:44.70529	2026-09-10 10:03:44.70529
2759	4	PRD-1789018276001-R1789034639076	115.2000	115.2000	available	2026-09-10 10:03:59.077281	2026-09-10 10:03:59.077281
2760	8	PRD-1789018442925-R1789034656867	198.0000	198.0000	available	2026-09-10 10:04:16.868439	2026-09-10 10:04:16.868439
2761	64	PRD-1789034686632-R1789034693120	0.0000	0.0000	available	2026-09-10 10:04:53.123656	2026-09-10 10:04:53.123656
2762	10	PRD-1789018615683-R1789034807715	115.3000	115.3000	available	2026-09-10 10:06:47.717299	2026-09-10 10:06:47.717299
2763	10	PRD-1789018615683-R1789034807812	110.0000	110.0000	available	2026-09-10 10:06:47.81354	2026-09-10 10:06:47.81354
2765	10	PRD-1789018615683-R1789034808159	118.3000	118.3000	available	2026-09-10 10:06:48.161069	2026-09-10 10:06:48.161069
2767	10	PRD-1789018615683-R1789034808476	110.9000	110.9000	available	2026-09-10 10:06:48.481657	2026-09-10 10:06:48.481657
2768	10	PRD-1789018615683-R1789034808616	116.3000	116.3000	available	2026-09-10 10:06:48.61785	2026-09-10 10:06:48.61785
2773	10	PRD-1789018615683-R1789034809419	118.3000	118.3000	available	2026-09-10 10:06:49.425598	2026-09-10 10:06:49.425598
2774	10	PRD-1789018615683-R1789034809549	119.3000	119.3000	available	2026-09-10 10:06:49.550994	2026-09-10 10:06:49.550994
2775	10	PRD-1789018615683-R1789034809709	117.7000	117.7000	available	2026-09-10 10:06:49.710505	2026-09-10 10:06:49.710505
2810	36	PRD-1789025355244-R1789036488725	103.8000	103.8000	available	2026-09-10 10:34:48.726367	2026-09-10 10:34:48.726367
2811	36	PRD-1789025355244-R1789036488912	102.2000	102.2000	available	2026-09-10 10:34:48.913392	2026-09-10 10:34:48.913392
2813	36	PRD-1789025355244-R1789036489214	126.5000	126.5000	available	2026-09-10 10:34:49.21814	2026-09-10 10:34:49.21814
2814	36	PRD-1789025355244-R1789036489380	96.0000	96.0000	available	2026-09-10 10:34:49.381958	2026-09-10 10:34:49.381958
2815	36	PRD-1789025355244-R1789036489511	119.9000	119.9000	available	2026-09-10 10:34:49.512613	2026-09-10 10:34:49.512613
2908	7	PRD-1789018404302-R1789037280929	110.1000	110.1000	available	2026-09-10 10:48:00.930793	2026-09-10 10:48:00.930793
2913	7	PRD-1789018404302-R1789037281837	119.5000	119.5000	available	2026-09-10 10:48:01.839618	2026-09-10 10:48:01.839618
2914	7	PRD-1789018404302-R1789037282088	119.9000	119.9000	available	2026-09-10 10:48:02.089584	2026-09-10 10:48:02.089584
2917	7	PRD-1789018404302-R1789037282697	115.0000	115.0000	available	2026-09-10 10:48:02.698072	2026-09-10 10:48:02.698072
2919	7	PRD-1789018404302-R1789037283042	118.0000	118.0000	available	2026-09-10 10:48:03.044334	2026-09-10 10:48:03.044334
2922	7	PRD-1789018404302-R1789037283706	120.1000	120.1000	available	2026-09-10 10:48:03.707663	2026-09-10 10:48:03.707663
2923	7	PRD-1789018404302-R1789037283841	110.3000	110.3000	available	2026-09-10 10:48:03.842645	2026-09-10 10:48:03.842645
2925	7	PRD-1789018404302-R1789037284285	118.0000	118.0000	available	2026-09-10 10:48:04.286248	2026-09-10 10:48:04.286248
2926	7	PRD-1789018404302-R1789037284508	74.8000	74.8000	available	2026-09-10 10:48:04.509704	2026-09-10 10:48:04.509704
2965	66	PRD-1789037465593-R1789037550926	119.5000	119.5000	available	2026-09-10 10:52:30.927135	2026-09-10 10:52:30.927135
2966	66	PRD-1789037465593-R1789037551027	121.6000	121.6000	available	2026-09-10 10:52:31.028717	2026-09-10 10:52:31.028717
2968	67	PRD-1789037609658-R1789037667434	98.8000	98.8000	available	2026-09-10 10:54:27.438466	2026-09-10 10:54:27.438466
2971	67	PRD-1789037609658-R1789037668007	115.1000	115.1000	available	2026-09-10 10:54:28.008714	2026-09-10 10:54:28.008714
2972	67	PRD-1789037609658-R1789037668177	102.3000	102.3000	available	2026-09-10 10:54:28.17837	2026-09-10 10:54:28.17837
2973	67	PRD-1789037609658-R1789037668343	99.1000	99.1000	available	2026-09-10 10:54:28.344678	2026-09-10 10:54:28.344678
2974	67	PRD-1789037609658-R1789037668447	117.6000	117.6000	available	2026-09-10 10:54:28.448651	2026-09-10 10:54:28.448651
2977	67	PRD-1789037609658-R1789037668820	110.2000	110.2000	available	2026-09-10 10:54:28.823198	2026-09-10 10:54:28.823198
2978	67	PRD-1789037609658-R1789037668942	115.1000	115.1000	available	2026-09-10 10:54:28.943571	2026-09-10 10:54:28.943571
2979	67	PRD-1789037609658-R1789037669059	117.8000	117.8000	available	2026-09-10 10:54:29.066385	2026-09-10 10:54:29.066385
2980	67	PRD-1789037609658-R1789037669229	115.2000	115.2000	available	2026-09-10 10:54:29.230752	2026-09-10 10:54:29.230752
2981	67	PRD-1789037609658-R1789037669535	115.1000	115.1000	available	2026-09-10 10:54:29.546328	2026-09-10 10:54:29.546328
3017	55	PRD-1789032520852-R1789037888989	116.0000	116.0000	available	2026-09-10 10:58:08.991245	2026-09-10 10:58:08.991245
3018	55	PRD-1789032520852-R1789037889205	122.0000	122.0000	available	2026-09-10 10:58:09.206568	2026-09-10 10:58:09.206568
3039	33	PRD-1789025144264-R1789038052738	144.4000	144.4000	available	2026-09-10 11:00:52.739604	2026-09-10 11:00:52.739604
3040	33	PRD-1789025144264-R1789038052795	112.0000	112.0000	available	2026-09-10 11:00:52.797433	2026-09-10 11:00:52.797433
3049	58	PRD-1789033578183-R1789038212409	115.8000	115.8000	available	2026-09-10 11:03:32.416158	2026-09-10 11:03:32.416158
3053	58	PRD-1789033578183-R1789038212826	117.3000	117.3000	available	2026-09-10 11:03:32.827913	2026-09-10 11:03:32.827913
3054	58	PRD-1789033578183-R1789038212979	117.2000	117.2000	available	2026-09-10 11:03:32.980815	2026-09-10 11:03:32.980815
3064	58	PRD-1789033578183-R1789038214400	114.0000	114.0000	available	2026-09-10 11:03:34.401587	2026-09-10 11:03:34.401587
3065	58	PRD-1789033578183-R1789038214538	117.3000	117.3000	available	2026-09-10 11:03:34.539352	2026-09-10 11:03:34.539352
3069	58	PRD-1789033578183-R1789038215178	117.3000	117.3000	available	2026-09-10 11:03:35.187545	2026-09-10 11:03:35.187545
3072	58	PRD-1789033578183-R1789038215566	117.3000	117.3000	available	2026-09-10 11:03:35.573707	2026-09-10 11:03:35.573707
3075	58	PRD-1789033578183-R1789038215991	115.5000	115.5000	available	2026-09-10 11:03:35.992452	2026-09-10 11:03:35.992452
3081	52	PRD-1789029576872-R1789038325562	120.2000	120.2000	available	2026-09-10 11:05:25.563565	2026-09-10 11:05:25.563565
3082	52	PRD-1789029576872-R1789038325638	112.5000	112.5000	available	2026-09-10 11:05:25.63933	2026-09-10 11:05:25.63933
3085	52	PRD-1789029576872-R1789038326201	116.5000	116.5000	available	2026-09-10 11:05:26.202791	2026-09-10 11:05:26.202791
3088	52	PRD-1789029576872-R1789038326576	114.9000	114.9000	available	2026-09-10 11:05:26.57773	2026-09-10 11:05:26.57773
3089	52	PRD-1789029576872-R1789038326688	118.9000	118.9000	available	2026-09-10 11:05:26.689699	2026-09-10 11:05:26.689699
3096	52	PRD-1789029576872-R1789038327780	120.3000	120.3000	available	2026-09-10 11:05:27.781753	2026-09-10 11:05:27.781753
3099	52	PRD-1789029576872-R1789038328227	104.3000	104.3000	available	2026-09-10 11:05:28.228756	2026-09-10 11:05:28.228756
2573	51	PRD-1789029511477-R1789034160354	120.0000	120.0000	available	2026-09-10 09:56:00.35508	2026-09-10 09:56:00.35508
2574	51	PRD-1789029511477-R1789034160450	120.0000	120.0000	available	2026-09-10 09:56:00.451944	2026-09-10 09:56:00.451944
2575	51	PRD-1789029511477-R1789034160554	120.0000	120.0000	available	2026-09-10 09:56:00.556391	2026-09-10 09:56:00.556391
2576	51	PRD-1789029511477-R1789034160686	127.0000	127.0000	available	2026-09-10 09:56:00.691828	2026-09-10 09:56:00.691828
2577	51	PRD-1789029511477-R1789034160769	121.9000	121.9000	available	2026-09-10 09:56:00.770449	2026-09-10 09:56:00.770449
2578	51	PRD-1789029511477-R1789034160842	111.7000	111.7000	available	2026-09-10 09:56:00.843877	2026-09-10 09:56:00.843877
2579	51	PRD-1789029511477-R1789034160936	121.0000	121.0000	available	2026-09-10 09:56:00.937541	2026-09-10 09:56:00.937541
2580	51	PRD-1789029511477-R1789034161017	114.7000	114.7000	available	2026-09-10 09:56:01.019215	2026-09-10 09:56:01.019215
2581	7	PRD-1789018404302-R1789034229035	114.8000	114.8000	available	2026-09-10 09:57:09.036505	2026-09-10 09:57:09.036505
2582	7	PRD-1789018404302-R1789034229201	119.8000	119.8000	available	2026-09-10 09:57:09.202456	2026-09-10 09:57:09.202456
2583	7	PRD-1789018404302-R1789034230328	127.6000	127.6000	available	2026-09-10 09:57:10.329725	2026-09-10 09:57:10.329725
2584	7	PRD-1789018404302-R1789034230505	128.0000	128.0000	available	2026-09-10 09:57:10.51482	2026-09-10 09:57:10.51482
2585	7	PRD-1789018404302-R1789034230753	139.1000	139.1000	available	2026-09-10 09:57:10.75526	2026-09-10 09:57:10.75526
2586	7	PRD-1789018404302-R1789034230943	128.0000	128.0000	available	2026-09-10 09:57:10.94506	2026-09-10 09:57:10.94506
2587	7	PRD-1789018404302-R1789034231123	129.5000	129.5000	available	2026-09-10 09:57:11.124576	2026-09-10 09:57:11.124576
2588	7	PRD-1789018404302-R1789034231277	117.6000	117.6000	available	2026-09-10 09:57:11.279904	2026-09-10 09:57:11.279904
2589	7	PRD-1789018404302-R1789034231485	122.6000	122.6000	available	2026-09-10 09:57:11.487017	2026-09-10 09:57:11.487017
2590	7	PRD-1789018404302-R1789034231780	116.0000	116.0000	available	2026-09-10 09:57:11.78377	2026-09-10 09:57:11.78377
2591	7	PRD-1789018404302-R1789034231954	114.9000	114.9000	available	2026-09-10 09:57:11.955913	2026-09-10 09:57:11.955913
2592	7	PRD-1789018404302-R1789034232280	129.8000	129.8000	available	2026-09-10 09:57:12.28171	2026-09-10 09:57:12.28171
2593	7	PRD-1789018404302-R1789034232557	111.0000	111.0000	available	2026-09-10 09:57:12.558744	2026-09-10 09:57:12.558744
2594	7	PRD-1789018404302-R1789034232729	148.1000	148.1000	available	2026-09-10 09:57:12.730791	2026-09-10 09:57:12.730791
2595	7	PRD-1789018404302-R1789034232892	122.6000	122.6000	available	2026-09-10 09:57:12.894106	2026-09-10 09:57:12.894106
2596	7	PRD-1789018404302-R1789034233075	131.1000	131.1000	available	2026-09-10 09:57:13.075929	2026-09-10 09:57:13.075929
2597	7	PRD-1789018404302-R1789034233249	126.4000	126.4000	available	2026-09-10 09:57:13.250926	2026-09-10 09:57:13.250926
2598	7	PRD-1789018404302-R1789034233538	120.4000	120.4000	available	2026-09-10 09:57:13.540183	2026-09-10 09:57:13.540183
2599	7	PRD-1789018404302-R1789034233668	127.4000	127.4000	available	2026-09-10 09:57:13.6692	2026-09-10 09:57:13.6692
2600	7	PRD-1789018404302-R1789034233841	121.2000	121.2000	available	2026-09-10 09:57:13.842714	2026-09-10 09:57:13.842714
2601	7	PRD-1789018404302-R1789034235034	119.1000	119.1000	available	2026-09-10 09:57:15.035238	2026-09-10 09:57:15.035238
2602	7	PRD-1789018404302-R1789034235178	119.0000	119.0000	available	2026-09-10 09:57:15.179393	2026-09-10 09:57:15.179393
2603	7	PRD-1789018404302-R1789034235391	126.8000	126.8000	available	2026-09-10 09:57:15.392374	2026-09-10 09:57:15.392374
2604	7	PRD-1789018404302-R1789034235623	120.2000	120.2000	available	2026-09-10 09:57:15.624323	2026-09-10 09:57:15.624323
2605	12	PRD-1789018691298-R1789034275695	123.9000	123.9000	available	2026-09-10 09:57:55.696134	2026-09-10 09:57:55.696134
2606	12	PRD-1789018691298-R1789034275792	12.1100	12.1100	available	2026-09-10 09:57:55.793595	2026-09-10 09:57:55.793595
2607	12	PRD-1789018691298-R1789034275985	120.9000	120.9000	available	2026-09-10 09:57:55.987247	2026-09-10 09:57:55.987247
2608	12	PRD-1789018691298-R1789034276100	124.7000	124.7000	available	2026-09-10 09:57:56.101607	2026-09-10 09:57:56.101607
2609	12	PRD-1789018691298-R1789034276205	1124.8000	1124.8000	available	2026-09-10 09:57:56.207794	2026-09-10 09:57:56.207794
2610	12	PRD-1789018691298-R1789034276353	124.1000	124.1000	available	2026-09-10 09:57:56.3549	2026-09-10 09:57:56.3549
2611	12	PRD-1789018691298-R1789034276526	125.1000	125.1000	available	2026-09-10 09:57:56.528084	2026-09-10 09:57:56.528084
2612	12	PRD-1789018691298-R1789034276669	124.7000	124.7000	available	2026-09-10 09:57:56.670621	2026-09-10 09:57:56.670621
2613	12	PRD-1789018691298-R1789034276804	129.8000	129.8000	available	2026-09-10 09:57:56.80633	2026-09-10 09:57:56.80633
2614	12	PRD-1789018691298-R1789034276971	117.1000	117.1000	available	2026-09-10 09:57:56.972846	2026-09-10 09:57:56.972846
2615	12	PRD-1789018691298-R1789034277104	124.8000	124.8000	available	2026-09-10 09:57:57.106288	2026-09-10 09:57:57.106288
2616	12	PRD-1789018691298-R1789034277239	135.5000	135.5000	available	2026-09-10 09:57:57.24075	2026-09-10 09:57:57.24075
2617	12	PRD-1789018691298-R1789034277405	142.4000	142.4000	available	2026-09-10 09:57:57.407015	2026-09-10 09:57:57.407015
2618	12	PRD-1789018691298-R1789034277545	120.3000	120.3000	available	2026-09-10 09:57:57.547223	2026-09-10 09:57:57.547223
2619	12	PRD-1789018691298-R1789034277716	126.5000	126.5000	available	2026-09-10 09:57:57.718114	2026-09-10 09:57:57.718114
2620	12	PRD-1789018691298-R1789034277850	124.4000	124.4000	available	2026-09-10 09:57:57.851717	2026-09-10 09:57:57.851717
2621	12	PRD-1789018691298-R1789034277999	121.9000	121.9000	available	2026-09-10 09:57:58.000827	2026-09-10 09:57:58.000827
2622	12	PRD-1789018691298-R1789034278145	128.4000	128.4000	available	2026-09-10 09:57:58.147474	2026-09-10 09:57:58.147474
2623	12	PRD-1789018691298-R1789034278323	122.6000	122.6000	available	2026-09-10 09:57:58.324337	2026-09-10 09:57:58.324337
2624	12	PRD-1789018691298-R1789034278515	121.9000	121.9000	available	2026-09-10 09:57:58.517645	2026-09-10 09:57:58.517645
2625	12	PRD-1789018691298-R1789034278671	120.8000	120.8000	available	2026-09-10 09:57:58.672477	2026-09-10 09:57:58.672477
2626	12	PRD-1789018691298-R1789034278834	108.0000	108.0000	available	2026-09-10 09:57:58.835386	2026-09-10 09:57:58.835386
2627	12	PRD-1789018691298-R1789034278999	128.5000	128.5000	available	2026-09-10 09:57:59.001871	2026-09-10 09:57:59.001871
2628	12	PRD-1789018691298-R1789034279197	103.4000	103.4000	available	2026-09-10 09:57:59.198854	2026-09-10 09:57:59.198854
2629	12	PRD-1789018691298-R1789034279387	126.3000	126.3000	available	2026-09-10 09:57:59.389171	2026-09-10 09:57:59.389171
2630	12	PRD-1789018691298-R1789034279525	124.4000	124.4000	available	2026-09-10 09:57:59.527609	2026-09-10 09:57:59.527609
2631	12	PRD-1789018691298-R1789034279690	130.0000	130.0000	available	2026-09-10 09:57:59.690984	2026-09-10 09:57:59.690984
2632	12	PRD-1789018691298-R1789034279842	122.8000	122.8000	available	2026-09-10 09:57:59.844508	2026-09-10 09:57:59.844508
2633	1	PRD-1789017671180-R1789034294215	118.9000	118.9000	available	2026-09-10 09:58:14.216837	2026-09-10 09:58:14.216837
2634	1	PRD-1789017671180-R1789034294306	119.2000	119.2000	available	2026-09-10 09:58:14.307867	2026-09-10 09:58:14.307867
2635	1	PRD-1789017671180-R1789034294405	113.9000	113.9000	available	2026-09-10 09:58:14.406114	2026-09-10 09:58:14.406114
2636	1	PRD-1789017671180-R1789034294536	117.9000	117.9000	available	2026-09-10 09:58:14.537403	2026-09-10 09:58:14.537403
2637	1	PRD-1789017671180-R1789034294650	121.1000	121.1000	available	2026-09-10 09:58:14.651998	2026-09-10 09:58:14.651998
2638	1	PRD-1789017671180-R1789034294762	126.4000	126.4000	available	2026-09-10 09:58:14.765749	2026-09-10 09:58:14.765749
2639	1	PRD-1789017671180-R1789034294891	104.5000	104.5000	available	2026-09-10 09:58:14.892414	2026-09-10 09:58:14.892414
2640	1	PRD-1789017671180-R1789034295036	118.2000	118.2000	available	2026-09-10 09:58:15.037191	2026-09-10 09:58:15.037191
2641	1	PRD-1789017671180-R1789034295159	113.7000	113.7000	available	2026-09-10 09:58:15.161779	2026-09-10 09:58:15.161779
2642	1	PRD-1789017671180-R1789034295277	125.4000	125.4000	available	2026-09-10 09:58:15.278086	2026-09-10 09:58:15.278086
2643	1	PRD-1789017671180-R1789034295521	137.7000	137.7000	available	2026-09-10 09:58:15.523587	2026-09-10 09:58:15.523587
2644	1	PRD-1789017671180-R1789034295645	114.2000	114.2000	available	2026-09-10 09:58:15.646694	2026-09-10 09:58:15.646694
2645	1	PRD-1789017671180-R1789034295763	120.2000	120.2000	available	2026-09-10 09:58:15.764741	2026-09-10 09:58:15.764741
2646	1	PRD-1789017671180-R1789034295901	115.8000	115.8000	available	2026-09-10 09:58:15.907625	2026-09-10 09:58:15.907625
2647	1	PRD-1789017671180-R1789034296054	119.8000	119.8000	available	2026-09-10 09:58:16.055672	2026-09-10 09:58:16.055672
2649	1	PRD-1789017671180-R1789034296378	116.3000	116.3000	available	2026-09-10 09:58:16.379521	2026-09-10 09:58:16.379521
2746	2	PRD-1789018062554-R1789034545409	100.2000	100.2000	available	2026-09-10 10:02:25.410464	2026-09-10 10:02:25.410464
2819	50	PRD-1789028920266-R1789036539494	116.2000	116.2000	available	2026-09-10 10:35:39.495867	2026-09-10 10:35:39.495867
2911	7	PRD-1789018404302-R1789037281535	121.4000	121.4000	available	2026-09-10 10:48:01.536831	2026-09-10 10:48:01.536831
2916	7	PRD-1789018404302-R1789037282538	105.9000	105.9000	available	2026-09-10 10:48:02.545155	2026-09-10 10:48:02.545155
2918	7	PRD-1789018404302-R1789037282857	117.3000	117.3000	available	2026-09-10 10:48:02.858418	2026-09-10 10:48:02.858418
2920	7	PRD-1789018404302-R1789037283206	110.8000	110.8000	available	2026-09-10 10:48:03.208001	2026-09-10 10:48:03.208001
2927	7	PRD-1789018404302-R1789037284820	118.0000	118.0000	available	2026-09-10 10:48:04.822701	2026-09-10 10:48:04.822701
2928	7	PRD-1789018404302-R1789037285778	118.0000	118.0000	available	2026-09-10 10:48:05.780066	2026-09-10 10:48:05.780066
2929	10	PRD-1789018615683-R1789037308629	117.4000	117.4000	available	2026-09-10 10:48:28.631397	2026-09-10 10:48:28.631397
2931	10	PRD-1789018615683-R1789037308943	120.2000	120.2000	available	2026-09-10 10:48:28.94678	2026-09-10 10:48:28.94678
2969	67	PRD-1789037609658-R1789037667705	115.0000	115.0000	available	2026-09-10 10:54:27.706698	2026-09-10 10:54:27.706698
2970	67	PRD-1789037609658-R1789037667833	115.2000	115.2000	available	2026-09-10 10:54:27.834567	2026-09-10 10:54:27.834567
2975	67	PRD-1789037609658-R1789037668552	115.2000	115.2000	available	2026-09-10 10:54:28.556006	2026-09-10 10:54:28.556006
2976	67	PRD-1789037609658-R1789037668648	115.0000	115.0000	available	2026-09-10 10:54:28.648995	2026-09-10 10:54:28.648995
2982	67	PRD-1789037609658-R1789037669927	115.2000	115.2000	available	2026-09-10 10:54:29.929041	2026-09-10 10:54:29.929041
2983	67	PRD-1789037609658-R1789037670058	114.1000	114.1000	available	2026-09-10 10:54:30.059708	2026-09-10 10:54:30.059708
2984	67	PRD-1789037609658-R1789037670185	115.2000	115.2000	available	2026-09-10 10:54:30.193647	2026-09-10 10:54:30.193647
3020	69	PRD-1789037911910-R1789037920413	60.0000	60.0000	available	2026-09-10 10:58:40.414308	2026-09-10 10:58:40.414308
3021	37	PRD-1789026369751-R1789037940373	129.4000	129.4000	available	2026-09-10 10:59:00.37493	2026-09-10 10:59:00.37493
3022	37	PRD-1789026369751-R1789037940468	127.4000	127.4000	available	2026-09-10 10:59:00.47979	2026-09-10 10:59:00.47979
3023	37	PRD-1789026369751-R1789037940622	122.9000	122.9000	available	2026-09-10 10:59:00.624042	2026-09-10 10:59:00.624042
3041	34	PRD-1789025185193-R1789038064325	142.0000	142.0000	available	2026-09-10 11:01:04.32697	2026-09-10 11:01:04.32697
3042	38	PRD-1789026598443-R1789038082946	80.0000	80.0000	available	2026-09-10 11:01:22.947838	2026-09-10 11:01:22.947838
3043	38	PRD-1789026598443-R1789038083023	58.0000	58.0000	available	2026-09-10 11:01:23.024913	2026-09-10 11:01:23.024913
3044	38	PRD-1789026598443-R1789038083109	68.0000	68.0000	available	2026-09-10 11:01:23.110623	2026-09-10 11:01:23.110623
3083	52	PRD-1789029576872-R1789038325894	154.0000	154.0000	available	2026-09-10 11:05:25.896433	2026-09-10 11:05:25.896433
3086	52	PRD-1789029576872-R1789038326338	119.8000	119.8000	available	2026-09-10 11:05:26.339989	2026-09-10 11:05:26.339989
3093	52	PRD-1789029576872-R1789038327317	100.7000	100.7000	available	2026-09-10 11:05:27.318575	2026-09-10 11:05:27.318575
3095	52	PRD-1789029576872-R1789038327619	116.7000	116.7000	available	2026-09-10 11:05:27.620716	2026-09-10 11:05:27.620716
3098	52	PRD-1789029576872-R1789038328081	120.5000	120.5000	available	2026-09-10 11:05:28.082577	2026-09-10 11:05:28.082577
3103	52	PRD-1789029576872-R1789038328907	117.3000	117.3000	available	2026-09-10 11:05:28.908728	2026-09-10 11:05:28.908728
3104	52	PRD-1789029576872-R1789038329150	120.9000	120.9000	available	2026-09-10 11:05:29.151799	2026-09-10 11:05:29.151799
3105	52	PRD-1789029576872-R1789038329421	120.6000	120.6000	available	2026-09-10 11:05:29.423176	2026-09-10 11:05:29.423176
3106	52	PRD-1789029576872-R1789038329622	112.5000	112.5000	available	2026-09-10 11:05:29.623778	2026-09-10 11:05:29.623778
3112	15	PRD-1789018843399-R1789038426598	112.0000	112.0000	available	2026-09-10 11:07:06.600625	2026-09-10 11:07:06.600625
3117	15	PRD-1789018843399-R1789038456734	119.6000	119.6000	available	2026-09-10 11:07:36.737622	2026-09-10 11:07:36.737622
3118	15	PRD-1789018843399-R1789038456872	117.6000	117.6000	available	2026-09-10 11:07:36.874068	2026-09-10 11:07:36.874068
3124	13	PRD-1789018725877-R1789038640193	107.7000	107.7000	available	2026-09-10 11:10:40.197013	2026-09-10 11:10:40.197013
3129	13	PRD-1789018725877-R1789038641259	118.0000	118.0000	available	2026-09-10 11:10:41.261327	2026-09-10 11:10:41.261327
3132	13	PRD-1789018725877-R1789038641841	118.0000	118.0000	available	2026-09-10 11:10:41.842922	2026-09-10 11:10:41.842922
3137	13	PRD-1789018725877-R1789038642798	118.0000	118.0000	available	2026-09-10 11:10:42.7997	2026-09-10 11:10:42.7997
3140	13	PRD-1789018725877-R1789038643421	120.0000	120.0000	available	2026-09-10 11:10:43.422707	2026-09-10 11:10:43.422707
3141	13	PRD-1789018725877-R1789038643649	124.1000	124.1000	available	2026-09-10 11:10:43.651246	2026-09-10 11:10:43.651246
3142	13	PRD-1789018725877-R1789038643839	114.0000	114.0000	available	2026-09-10 11:10:43.840829	2026-09-10 11:10:43.840829
3143	13	PRD-1789018725877-R1789038644038	120.2000	120.2000	available	2026-09-10 11:10:44.040048	2026-09-10 11:10:44.040048
3144	13	PRD-1789018725877-R1789038644244	120.5000	120.5000	available	2026-09-10 11:10:44.245438	2026-09-10 11:10:44.245438
3145	13	PRD-1789018725877-R1789038644441	120.0000	120.0000	available	2026-09-10 11:10:44.442815	2026-09-10 11:10:44.442815
3146	13	PRD-1789018725877-R1789038644663	119.3000	119.3000	available	2026-09-10 11:10:44.664296	2026-09-10 11:10:44.664296
3147	13	PRD-1789018725877-R1789038644849	119.4000	119.4000	available	2026-09-10 11:10:44.850716	2026-09-10 11:10:44.850716
3148	13	PRD-1789018725877-R1789038645024	120.0000	120.0000	available	2026-09-10 11:10:45.026942	2026-09-10 11:10:45.026942
3149	13	PRD-1789018725877-R1789038645200	118.2000	118.2000	available	2026-09-10 11:10:45.202587	2026-09-10 11:10:45.202587
3150	13	PRD-1789018725877-R1789038645397	123.4000	123.4000	available	2026-09-10 11:10:45.39931	2026-09-10 11:10:45.39931
3151	13	PRD-1789018725877-R1789038645666	115.6000	115.6000	available	2026-09-10 11:10:45.667548	2026-09-10 11:10:45.667548
3152	13	PRD-1789018725877-R1789038645966	115.6000	115.6000	available	2026-09-10 11:10:45.967822	2026-09-10 11:10:45.967822
3153	13	PRD-1789018725877-R1789038646212	115.1000	115.1000	available	2026-09-10 11:10:46.214155	2026-09-10 11:10:46.214155
3154	13	PRD-1789018725877-R1789038646391	117.7000	117.7000	available	2026-09-10 11:10:46.392774	2026-09-10 11:10:46.392774
3155	13	PRD-1789018725877-R1789038646587	120.2000	120.2000	available	2026-09-10 11:10:46.589079	2026-09-10 11:10:46.589079
3156	13	PRD-1789018725877-R1789038646803	118.2000	118.2000	available	2026-09-10 11:10:46.805052	2026-09-10 11:10:46.805052
3157	13	PRD-1789018725877-R1789038647072	109.3000	109.3000	available	2026-09-10 11:10:47.073909	2026-09-10 11:10:47.073909
3158	13	PRD-1789018725877-R1789038647312	121.4000	121.4000	available	2026-09-10 11:10:47.313817	2026-09-10 11:10:47.313817
3159	13	PRD-1789018725877-R1789038647525	107.2000	107.2000	available	2026-09-10 11:10:47.526618	2026-09-10 11:10:47.526618
3160	13	PRD-1789018725877-R1789038647737	116.0000	116.0000	available	2026-09-10 11:10:47.73853	2026-09-10 11:10:47.73853
3161	13	PRD-1789018725877-R1789038647949	140.0000	140.0000	available	2026-09-10 11:10:47.951239	2026-09-10 11:10:47.951239
3162	13	PRD-1789018725877-R1789038648155	128.4000	128.4000	available	2026-09-10 11:10:48.157178	2026-09-10 11:10:48.157178
3163	13	PRD-1789018725877-R1789038648360	120.2000	120.2000	available	2026-09-10 11:10:48.36269	2026-09-10 11:10:48.36269
3164	13	PRD-1789018725877-R1789038648582	119.5000	119.5000	available	2026-09-10 11:10:48.583187	2026-09-10 11:10:48.583187
2648	1	PRD-1789017671180-R1789034296196	120.1000	120.1000	available	2026-09-10 09:58:16.205306	2026-09-10 09:58:16.205306
2650	1	PRD-1789017671180-R1789034296524	122.3000	122.3000	available	2026-09-10 09:58:16.525391	2026-09-10 09:58:16.525391
2651	10	PRD-1789018615683-R1789034371056	67.6000	67.6000	available	2026-09-10 09:59:31.057561	2026-09-10 09:59:31.057561
2652	10	PRD-1789018615683-R1789034371151	50.6000	50.6000	available	2026-09-10 09:59:31.153475	2026-09-10 09:59:31.153475
2653	10	PRD-1789018615683-R1789034371258	145.7000	145.7000	available	2026-09-10 09:59:31.259274	2026-09-10 09:59:31.259274
2654	10	PRD-1789018615683-R1789034371382	64.6000	64.6000	available	2026-09-10 09:59:31.383888	2026-09-10 09:59:31.383888
2655	10	PRD-1789018615683-R1789034371528	60.2000	60.2000	available	2026-09-10 09:59:31.531179	2026-09-10 09:59:31.531179
2656	10	PRD-1789018615683-R1789034371657	60.2000	60.2000	available	2026-09-10 09:59:31.659598	2026-09-10 09:59:31.659598
2657	10	PRD-1789018615683-R1789034371788	53.8000	53.8000	available	2026-09-10 09:59:31.789969	2026-09-10 09:59:31.789969
2658	10	PRD-1789018615683-R1789034371926	58.0000	58.0000	available	2026-09-10 09:59:31.928085	2026-09-10 09:59:31.928085
2659	10	PRD-1789018615683-R1789034372078	65.3000	65.3000	available	2026-09-10 09:59:32.078736	2026-09-10 09:59:32.078736
2660	10	PRD-1789018615683-R1789034372227	68.0000	68.0000	available	2026-09-10 09:59:32.228044	2026-09-10 09:59:32.228044
2661	10	PRD-1789018615683-R1789034372346	60.0000	60.0000	available	2026-09-10 09:59:32.350952	2026-09-10 09:59:32.350952
2662	10	PRD-1789018615683-R1789034372500	60.1000	60.1000	available	2026-09-10 09:59:32.503644	2026-09-10 09:59:32.503644
2663	10	PRD-1789018615683-R1789034372598	65.2000	65.2000	available	2026-09-10 09:59:32.600921	2026-09-10 09:59:32.600921
2664	10	PRD-1789018615683-R1789034372715	60.2000	60.2000	available	2026-09-10 09:59:32.715921	2026-09-10 09:59:32.715921
2665	10	PRD-1789018615683-R1789034372909	55.0000	55.0000	available	2026-09-10 09:59:32.914365	2026-09-10 09:59:32.914365
2666	10	PRD-1789018615683-R1789034373073	60.1000	60.1000	available	2026-09-10 09:59:33.075125	2026-09-10 09:59:33.075125
2667	10	PRD-1789018615683-R1789034373224	60.0000	60.0000	available	2026-09-10 09:59:33.235601	2026-09-10 09:59:33.235601
2668	10	PRD-1789018615683-R1789034373386	60.2000	60.2000	available	2026-09-10 09:59:33.387753	2026-09-10 09:59:33.387753
2669	10	PRD-1789018615683-R1789034373532	64.6000	64.6000	available	2026-09-10 09:59:33.534334	2026-09-10 09:59:33.534334
2670	10	PRD-1789018615683-R1789034373671	60.1000	60.1000	available	2026-09-10 09:59:33.672722	2026-09-10 09:59:33.672722
2671	10	PRD-1789018615683-R1789034373810	65.9000	65.9000	available	2026-09-10 09:59:33.811284	2026-09-10 09:59:33.811284
2672	10	PRD-1789018615683-R1789034373952	64.5000	64.5000	available	2026-09-10 09:59:33.956381	2026-09-10 09:59:33.956381
2673	60	PRD-1789033677780-R1789034388792	104.4000	104.4000	available	2026-09-10 09:59:48.795168	2026-09-10 09:59:48.795168
2674	54	PRD-1789031590529-R1789034394657	120.3000	120.3000	available	2026-09-10 09:59:54.658938	2026-09-10 09:59:54.658938
2675	54	PRD-1789031590529-R1789034394783	132.0000	132.0000	available	2026-09-10 09:59:54.785668	2026-09-10 09:59:54.785668
2676	54	PRD-1789031590529-R1789034394881	120.0000	120.0000	available	2026-09-10 09:59:54.88313	2026-09-10 09:59:54.88313
2677	54	PRD-1789031590529-R1789034395033	120.4000	120.4000	available	2026-09-10 09:59:55.035187	2026-09-10 09:59:55.035187
2678	54	PRD-1789031590529-R1789034395191	120.0000	120.0000	available	2026-09-10 09:59:55.19502	2026-09-10 09:59:55.19502
2679	54	PRD-1789031590529-R1789034395323	120.3000	120.3000	available	2026-09-10 09:59:55.325027	2026-09-10 09:59:55.325027
2680	54	PRD-1789031590529-R1789034395439	120.3000	120.3000	available	2026-09-10 09:59:55.445323	2026-09-10 09:59:55.445323
2681	54	PRD-1789031590529-R1789034395606	120.3000	120.3000	available	2026-09-10 09:59:55.608488	2026-09-10 09:59:55.608488
2682	54	PRD-1789031590529-R1789034395711	120.0000	120.0000	available	2026-09-10 09:59:55.715733	2026-09-10 09:59:55.715733
2683	54	PRD-1789031590529-R1789034395865	120.3000	120.3000	available	2026-09-10 09:59:55.867278	2026-09-10 09:59:55.867278
2684	54	PRD-1789031590529-R1789034395995	99.8000	99.8000	available	2026-09-10 09:59:55.997423	2026-09-10 09:59:55.997423
2685	54	PRD-1789031590529-R1789034396109	120.3000	120.3000	available	2026-09-10 09:59:56.110673	2026-09-10 09:59:56.110673
2686	54	PRD-1789031590529-R1789034396272	112.9000	112.9000	available	2026-09-10 09:59:56.273842	2026-09-10 09:59:56.273842
2687	54	PRD-1789031590529-R1789034396389	120.3000	120.3000	available	2026-09-10 09:59:56.390805	2026-09-10 09:59:56.390805
2688	54	PRD-1789031590529-R1789034396519	120.3000	120.3000	available	2026-09-10 09:59:56.520516	2026-09-10 09:59:56.520516
2689	54	PRD-1789031590529-R1789034396675	127.3000	127.3000	available	2026-09-10 09:59:56.677107	2026-09-10 09:59:56.677107
2690	54	PRD-1789031590529-R1789034396817	120.3000	120.3000	available	2026-09-10 09:59:56.818692	2026-09-10 09:59:56.818692
2691	54	PRD-1789031590529-R1789034396969	88.0000	88.0000	available	2026-09-10 09:59:56.97929	2026-09-10 09:59:56.97929
2692	54	PRD-1789031590529-R1789034397116	120.3000	120.3000	available	2026-09-10 09:59:57.117692	2026-09-10 09:59:57.117692
2693	54	PRD-1789031590529-R1789034397280	119.8000	119.8000	available	2026-09-10 09:59:57.2828	2026-09-10 09:59:57.2828
2694	54	PRD-1789031590529-R1789034397367	120.3000	120.3000	available	2026-09-10 09:59:57.369058	2026-09-10 09:59:57.369058
2695	54	PRD-1789031590529-R1789034397464	120.4000	120.4000	available	2026-09-10 09:59:57.466644	2026-09-10 09:59:57.466644
2696	54	PRD-1789031590529-R1789034397593	120.3000	120.3000	available	2026-09-10 09:59:57.594866	2026-09-10 09:59:57.594866
2697	54	PRD-1789031590529-R1789034397721	120.4000	120.4000	available	2026-09-10 09:59:57.722782	2026-09-10 09:59:57.722782
2698	54	PRD-1789031590529-R1789034397851	120.3000	120.3000	available	2026-09-10 09:59:57.852836	2026-09-10 09:59:57.852836
2764	10	PRD-1789018615683-R1789034807941	118.0000	118.0000	available	2026-09-10 10:06:47.942713	2026-09-10 10:06:47.942713
2769	10	PRD-1789018615683-R1789034808774	118.3000	118.3000	available	2026-09-10 10:06:48.776041	2026-09-10 10:06:48.776041
2770	10	PRD-1789018615683-R1789034808939	103.7000	103.7000	available	2026-09-10 10:06:48.941872	2026-09-10 10:06:48.941872
2771	10	PRD-1789018615683-R1789034809102	123.7000	123.7000	available	2026-09-10 10:06:49.106761	2026-09-10 10:06:49.106761
2772	10	PRD-1789018615683-R1789034809263	121.4000	121.4000	available	2026-09-10 10:06:49.265031	2026-09-10 10:06:49.265031
2776	10	PRD-1789018615683-R1789034809887	118.2000	118.2000	available	2026-09-10 10:06:49.889026	2026-09-10 10:06:49.889026
2777	10	PRD-1789018615683-R1789034810036	125.7000	125.7000	available	2026-09-10 10:06:50.038002	2026-09-10 10:06:50.038002
2778	10	PRD-1789018615683-R1789034810169	118.7000	118.7000	available	2026-09-10 10:06:50.174152	2026-09-10 10:06:50.174152
2779	10	PRD-1789018615683-R1789034810341	124.1000	124.1000	available	2026-09-10 10:06:50.342793	2026-09-10 10:06:50.342793
2780	10	PRD-1789018615683-R1789034810485	120.4000	120.4000	available	2026-09-10 10:06:50.486801	2026-09-10 10:06:50.486801
2781	10	PRD-1789018615683-R1789034810644	118.9000	118.9000	available	2026-09-10 10:06:50.645383	2026-09-10 10:06:50.645383
2782	10	PRD-1789018615683-R1789034810814	118.0000	118.0000	available	2026-09-10 10:06:50.81558	2026-09-10 10:06:50.81558
2783	10	PRD-1789018615683-R1789034810986	122.0000	122.0000	available	2026-09-10 10:06:50.98732	2026-09-10 10:06:50.98732
2789	10	PRD-1789018615683-R1789034811880	118.3000	118.3000	available	2026-09-10 10:06:51.88189	2026-09-10 10:06:51.88189
2790	10	PRD-1789018615683-R1789034812067	95.1000	95.1000	available	2026-09-10 10:06:52.068993	2026-09-10 10:06:52.068993
2792	51	PRD-1789029511477-R1789034896973	120.0000	120.0000	available	2026-09-10 10:08:16.975038	2026-09-10 10:08:16.975038
2793	51	PRD-1789029511477-R1789034897120	120.0000	120.0000	available	2026-09-10 10:08:17.121041	2026-09-10 10:08:17.121041
2794	51	PRD-1789029511477-R1789034897421	120.0000	120.0000	available	2026-09-10 10:08:17.423187	2026-09-10 10:08:17.423187
2799	51	PRD-1789029511477-R1789034898126	124.6000	124.6000	available	2026-09-10 10:08:18.131804	2026-09-10 10:08:18.131804
2802	51	PRD-1789029511477-R1789034898540	107.0000	107.0000	available	2026-09-10 10:08:18.541267	2026-09-10 10:08:18.541267
2826	12	PRD-1789018691298-R1789036704971	127.9000	127.9000	available	2026-09-10 10:38:24.97347	2026-09-10 10:38:24.97347
3165	13	PRD-1789018725877-R1789038648787	106.6000	106.6000	available	2026-09-10 11:10:48.788544	2026-09-10 11:10:48.788544
3166	13	PRD-1789018725877-R1789038649261	106.0000	106.0000	available	2026-09-10 11:10:49.266759	2026-09-10 11:10:49.266759
3167	7	PRD-1789018404302-R1789038700796	120.6000	120.6000	available	2026-09-10 11:11:40.798539	2026-09-10 11:11:40.798539
3168	7	PRD-1789018404302-R1789038700939	110.7000	110.7000	available	2026-09-10 11:11:40.940907	2026-09-10 11:11:40.940907
3169	7	PRD-1789018404302-R1789038701527	134.3000	134.3000	available	2026-09-10 11:11:41.527916	2026-09-10 11:11:41.527916
3170	7	PRD-1789018404302-R1789038701711	124.9000	124.9000	available	2026-09-10 11:11:41.712352	2026-09-10 11:11:41.712352
3171	7	PRD-1789018404302-R1789038702025	121.1000	121.1000	available	2026-09-10 11:11:42.027432	2026-09-10 11:11:42.027432
3172	7	PRD-1789018404302-R1789038702479	112.0000	112.0000	available	2026-09-10 11:11:42.48088	2026-09-10 11:11:42.48088
3173	7	PRD-1789018404302-R1789038702853	140.8000	140.8000	available	2026-09-10 11:11:42.854688	2026-09-10 11:11:42.854688
3174	7	PRD-1789018404302-R1789038703254	121.0000	121.0000	available	2026-09-10 11:11:43.255647	2026-09-10 11:11:43.255647
3175	7	PRD-1789018404302-R1789038703770	128.0000	128.0000	available	2026-09-10 11:11:43.771896	2026-09-10 11:11:43.771896
3176	7	PRD-1789018404302-R1789038704119	121.1000	121.1000	available	2026-09-10 11:11:44.121344	2026-09-10 11:11:44.121344
3177	7	PRD-1789018404302-R1789038704521	118.5000	118.5000	available	2026-09-10 11:11:44.522158	2026-09-10 11:11:44.522158
3178	7	PRD-1789018404302-R1789038704935	122.0000	122.0000	available	2026-09-10 11:11:44.937284	2026-09-10 11:11:44.937284
3179	50	PRD-1789028920266-R1789038773263	120.0000	120.0000	available	2026-09-10 11:12:53.264281	2026-09-10 11:12:53.264281
3180	50	PRD-1789028920266-R1789038773362	1125.8000	1125.8000	available	2026-09-10 11:12:53.363873	2026-09-10 11:12:53.363873
3181	50	PRD-1789028920266-R1789038773679	134.6000	134.6000	available	2026-09-10 11:12:53.680926	2026-09-10 11:12:53.680926
3182	50	PRD-1789028920266-R1789038773810	116.2000	116.2000	available	2026-09-10 11:12:53.812802	2026-09-10 11:12:53.812802
3183	50	PRD-1789028920266-R1789038773999	90.8000	90.8000	available	2026-09-10 11:12:54.003024	2026-09-10 11:12:54.003024
3184	50	PRD-1789028920266-R1789038774357	116.2000	116.2000	available	2026-09-10 11:12:54.358632	2026-09-10 11:12:54.358632
3185	50	PRD-1789028920266-R1789038774674	108.6000	108.6000	available	2026-09-10 11:12:54.676889	2026-09-10 11:12:54.676889
3186	50	PRD-1789028920266-R1789038774905	124.0000	124.0000	available	2026-09-10 11:12:54.907196	2026-09-10 11:12:54.907196
3187	50	PRD-1789028920266-R1789038775166	116.0000	116.0000	available	2026-09-10 11:12:55.167643	2026-09-10 11:12:55.167643
3188	50	PRD-1789028920266-R1789038775395	88.7000	88.7000	available	2026-09-10 11:12:55.397295	2026-09-10 11:12:55.397295
3189	51	PRD-1789029511477-R1789038793692	94.0000	94.0000	available	2026-09-10 11:13:13.693987	2026-09-10 11:13:13.693987
3190	51	PRD-1789029511477-R1789038793776	115.6000	115.6000	available	2026-09-10 11:13:13.786395	2026-09-10 11:13:13.786395
3191	12	PRD-1789018691298-R1789038871010	122.1000	122.1000	available	2026-09-10 11:14:31.01151	2026-09-10 11:14:31.01151
3192	12	PRD-1789018691298-R1789038871126	121.4000	121.4000	available	2026-09-10 11:14:31.127862	2026-09-10 11:14:31.127862
3193	12	PRD-1789018691298-R1789038871352	131.3000	131.3000	available	2026-09-10 11:14:31.354305	2026-09-10 11:14:31.354305
3194	12	PRD-1789018691298-R1789038871494	122.3000	122.3000	available	2026-09-10 11:14:31.495741	2026-09-10 11:14:31.495741
3195	12	PRD-1789018691298-R1789038871626	127.5000	127.5000	available	2026-09-10 11:14:31.627977	2026-09-10 11:14:31.627977
3196	12	PRD-1789018691298-R1789038871823	123.5000	123.5000	available	2026-09-10 11:14:31.82488	2026-09-10 11:14:31.82488
3197	12	PRD-1789018691298-R1789038872067	123.0000	123.0000	available	2026-09-10 11:14:32.068748	2026-09-10 11:14:32.068748
3198	12	PRD-1789018691298-R1789038872406	124.1000	124.1000	available	2026-09-10 11:14:32.408696	2026-09-10 11:14:32.408696
3199	12	PRD-1789018691298-R1789038872601	123.6000	123.6000	available	2026-09-10 11:14:32.602703	2026-09-10 11:14:32.602703
3200	12	PRD-1789018691298-R1789038872837	118.0000	118.0000	available	2026-09-10 11:14:32.839667	2026-09-10 11:14:32.839667
3201	12	PRD-1789018691298-R1789038873048	123.0000	123.0000	available	2026-09-10 11:14:33.050896	2026-09-10 11:14:33.050896
3202	12	PRD-1789018691298-R1789038873275	130.8000	130.8000	available	2026-09-10 11:14:33.276922	2026-09-10 11:14:33.276922
3203	12	PRD-1789018691298-R1789038873483	123.1000	123.1000	available	2026-09-10 11:14:33.485231	2026-09-10 11:14:33.485231
3204	12	PRD-1789018691298-R1789038873693	111.7000	111.7000	available	2026-09-10 11:14:33.695082	2026-09-10 11:14:33.695082
3205	12	PRD-1789018691298-R1789038873921	134.0000	134.0000	available	2026-09-10 11:14:33.922471	2026-09-10 11:14:33.922471
3206	12	PRD-1789018691298-R1789038874204	123.3000	123.3000	available	2026-09-10 11:14:34.205183	2026-09-10 11:14:34.205183
3207	12	PRD-1789018691298-R1789038874429	99.2000	99.2000	available	2026-09-10 11:14:34.430743	2026-09-10 11:14:34.430743
3208	12	PRD-1789018691298-R1789038874694	127.0000	127.0000	available	2026-09-10 11:14:34.696922	2026-09-10 11:14:34.696922
3209	12	PRD-1789018691298-R1789038874901	121.0000	121.0000	available	2026-09-10 11:14:34.902539	2026-09-10 11:14:34.902539
3210	12	PRD-1789018691298-R1789038875125	121.1000	121.1000	available	2026-09-10 11:14:35.126748	2026-09-10 11:14:35.126748
3211	54	PRD-1789031590529-R1789038896638	120.3000	120.3000	available	2026-09-10 11:14:56.640073	2026-09-10 11:14:56.640073
3212	54	PRD-1789031590529-R1789038896711	121.5000	121.5000	available	2026-09-10 11:14:56.722861	2026-09-10 11:14:56.722861
3213	24	PRD-1789020615250-R1789038969261	118.3000	118.3000	available	2026-09-10 11:16:09.26362	2026-09-10 11:16:09.26362
3214	24	PRD-1789020615250-R1789038969362	118.3000	118.3000	available	2026-09-10 11:16:09.365393	2026-09-10 11:16:09.365393
3215	24	PRD-1789020615250-R1789038969762	118.3000	118.3000	available	2026-09-10 11:16:09.763787	2026-09-10 11:16:09.763787
3216	24	PRD-1789020615250-R1789038969934	123.7000	123.7000	available	2026-09-10 11:16:09.936245	2026-09-10 11:16:09.936245
3217	24	PRD-1789020615250-R1789038970065	120.1000	120.1000	available	2026-09-10 11:16:10.067692	2026-09-10 11:16:10.067692
3218	24	PRD-1789020615250-R1789038970212	118.3000	118.3000	available	2026-09-10 11:16:10.215024	2026-09-10 11:16:10.215024
3219	24	PRD-1789020615250-R1789038970360	89.5000	89.5000	available	2026-09-10 11:16:10.361939	2026-09-10 11:16:10.361939
3220	24	PRD-1789020615250-R1789038970530	131.6000	131.6000	available	2026-09-10 11:16:10.531464	2026-09-10 11:16:10.531464
3221	24	PRD-1789020615250-R1789038970678	118.3000	118.3000	available	2026-09-10 11:16:10.679759	2026-09-10 11:16:10.679759
3222	24	PRD-1789020615250-R1789038970835	118.3000	118.3000	available	2026-09-10 11:16:10.8369	2026-09-10 11:16:10.8369
3223	24	PRD-1789020615250-R1789038970996	118.3000	118.3000	available	2026-09-10 11:16:10.998035	2026-09-10 11:16:10.998035
3224	24	PRD-1789020615250-R1789038971177	118.3000	118.3000	available	2026-09-10 11:16:11.179103	2026-09-10 11:16:11.179103
3225	24	PRD-1789020615250-R1789038971420	118.3000	118.3000	available	2026-09-10 11:16:11.42152	2026-09-10 11:16:11.42152
3226	24	PRD-1789020615250-R1789038971576	118.3000	118.3000	available	2026-09-10 11:16:11.580666	2026-09-10 11:16:11.580666
3227	24	PRD-1789020615250-R1789038971732	127.6000	127.6000	available	2026-09-10 11:16:11.734734	2026-09-10 11:16:11.734734
3228	24	PRD-1789020615250-R1789038971893	118.3000	118.3000	available	2026-09-10 11:16:11.89496	2026-09-10 11:16:11.89496
3229	24	PRD-1789020615250-R1789038972071	118.3000	118.3000	available	2026-09-10 11:16:12.07324	2026-09-10 11:16:12.07324
3230	24	PRD-1789020615250-R1789038972221	118.2000	118.2000	available	2026-09-10 11:16:12.222474	2026-09-10 11:16:12.222474
3231	24	PRD-1789020615250-R1789038972365	122.5000	122.5000	available	2026-09-10 11:16:12.367336	2026-09-10 11:16:12.367336
3232	24	PRD-1789020615250-R1789038972552	118.3000	118.3000	available	2026-09-10 11:16:12.553725	2026-09-10 11:16:12.553725
3233	18	PRD-1789018957547-R1789039043394	120.6000	120.6000	available	2026-09-10 11:17:23.395403	2026-09-10 11:17:23.395403
3234	18	PRD-1789018957547-R1789039043488	128.4000	128.4000	available	2026-09-10 11:17:23.493324	2026-09-10 11:17:23.493324
3235	18	PRD-1789018957547-R1789039043556	102.8000	102.8000	available	2026-09-10 11:17:23.558052	2026-09-10 11:17:23.558052
3236	18	PRD-1789018957547-R1789039043668	86.0000	86.0000	available	2026-09-10 11:17:23.669715	2026-09-10 11:17:23.669715
3237	18	PRD-1789018957547-R1789039043792	118.3000	118.3000	available	2026-09-10 11:17:23.794005	2026-09-10 11:17:23.794005
3238	18	PRD-1789018957547-R1789039043896	118.3000	118.3000	available	2026-09-10 11:17:23.897482	2026-09-10 11:17:23.897482
3245	18	PRD-1789018957547-R1789039044473	118.3000	118.3000	available	2026-09-10 11:17:24.475306	2026-09-10 11:17:24.475306
3253	18	PRD-1789018957547-R1789039045337	120.2000	120.2000	available	2026-09-10 11:17:25.338314	2026-09-10 11:17:25.338314
3239	18	PRD-1789018957547-R1789039043949	118.3000	118.3000	available	2026-09-10 11:17:23.951465	2026-09-10 11:17:23.951465
3240	18	PRD-1789018957547-R1789039044037	144.8000	144.8000	available	2026-09-10 11:17:24.038843	2026-09-10 11:17:24.038843
3241	18	PRD-1789018957547-R1789039044124	103.0000	103.0000	available	2026-09-10 11:17:24.134119	2026-09-10 11:17:24.134119
3242	18	PRD-1789018957547-R1789039044198	120.2000	120.2000	available	2026-09-10 11:17:24.200567	2026-09-10 11:17:24.200567
3243	18	PRD-1789018957547-R1789039044297	118.3000	118.3000	available	2026-09-10 11:17:24.299939	2026-09-10 11:17:24.299939
3244	18	PRD-1789018957547-R1789039044387	121.6000	121.6000	available	2026-09-10 11:17:24.388981	2026-09-10 11:17:24.388981
3246	18	PRD-1789018957547-R1789039044556	118.3000	118.3000	available	2026-09-10 11:17:24.55803	2026-09-10 11:17:24.55803
3247	18	PRD-1789018957547-R1789039044653	130.9000	130.9000	available	2026-09-10 11:17:24.65472	2026-09-10 11:17:24.65472
3248	18	PRD-1789018957547-R1789039044751	132.2000	132.2000	available	2026-09-10 11:17:24.752573	2026-09-10 11:17:24.752573
3249	18	PRD-1789018957547-R1789039044877	120.4000	120.4000	available	2026-09-10 11:17:24.894286	2026-09-10 11:17:24.894286
3250	18	PRD-1789018957547-R1789039045066	118.3000	118.3000	available	2026-09-10 11:17:25.067802	2026-09-10 11:17:25.067802
3251	18	PRD-1789018957547-R1789039045139	118.0000	118.0000	available	2026-09-10 11:17:25.140144	2026-09-10 11:17:25.140144
3252	18	PRD-1789018957547-R1789039045248	117.4000	117.4000	available	2026-09-10 11:17:25.250374	2026-09-10 11:17:25.250374
3254	18	PRD-1789018957547-R1789039045423	120.2000	120.2000	available	2026-09-10 11:17:25.424252	2026-09-10 11:17:25.424252
3255	18	PRD-1789018957547-R1789039045513	120.2000	120.2000	available	2026-09-10 11:17:25.514107	2026-09-10 11:17:25.514107
3256	36	PRD-1789025355244-R1789039351234	96.8000	96.8000	available	2026-09-10 11:22:31.235372	2026-09-10 11:22:31.235372
3257	36	PRD-1789025355244-R1789039351312	94.5000	94.5000	available	2026-09-10 11:22:31.315667	2026-09-10 11:22:31.315667
3258	36	PRD-1789025355244-R1789039351750	120.0000	120.0000	available	2026-09-10 11:22:31.751696	2026-09-10 11:22:31.751696
3259	36	PRD-1789025355244-R1789039351847	134.0000	134.0000	available	2026-09-10 11:22:31.84823	2026-09-10 11:22:31.84823
3260	36	PRD-1789025355244-R1789039352107	125.1000	125.1000	available	2026-09-10 11:22:32.108914	2026-09-10 11:22:32.108914
3261	36	PRD-1789025355244-R1789039352360	110.6000	110.6000	available	2026-09-10 11:22:32.362353	2026-09-10 11:22:32.362353
3262	36	PRD-1789025355244-R1789039352594	117.0000	117.0000	available	2026-09-10 11:22:32.59591	2026-09-10 11:22:32.59591
3263	36	PRD-1789025355244-R1789039352797	99.9000	99.9000	available	2026-09-10 11:22:32.798834	2026-09-10 11:22:32.798834
3264	36	PRD-1789025355244-R1789039353058	1257.0000	1257.0000	available	2026-09-10 11:22:33.060206	2026-09-10 11:22:33.060206
3265	36	PRD-1789025355244-R1789039353353	95.4000	95.4000	available	2026-09-10 11:22:33.354491	2026-09-10 11:22:33.354491
3266	36	PRD-1789025355244-R1789039353595	133.5000	133.5000	available	2026-09-10 11:22:33.596378	2026-09-10 11:22:33.596378
3267	36	PRD-1789025355244-R1789039353854	127.1000	127.1000	available	2026-09-10 11:22:33.856963	2026-09-10 11:22:33.856963
3268	36	PRD-1789025355244-R1789039354156	128.0000	128.0000	available	2026-09-10 11:22:34.157446	2026-09-10 11:22:34.157446
3269	36	PRD-1789025355244-R1789039354392	123.7000	123.7000	available	2026-09-10 11:22:34.393646	2026-09-10 11:22:34.393646
3270	36	PRD-1789025355244-R1789039354651	128.0000	128.0000	available	2026-09-10 11:22:34.653026	2026-09-10 11:22:34.653026
3271	36	PRD-1789025355244-R1789039354955	125.0000	125.0000	available	2026-09-10 11:22:34.956944	2026-09-10 11:22:34.956944
3272	36	PRD-1789025355244-R1789039355242	97.9000	97.9000	available	2026-09-10 11:22:35.243851	2026-09-10 11:22:35.243851
3273	36	PRD-1789025355244-R1789039355472	120.2000	120.2000	available	2026-09-10 11:22:35.474637	2026-09-10 11:22:35.474637
3274	36	PRD-1789025355244-R1789039355735	96.6000	96.6000	available	2026-09-10 11:22:35.737156	2026-09-10 11:22:35.737156
3275	36	PRD-1789025355244-R1789039356034	127.5000	127.5000	available	2026-09-10 11:22:36.035604	2026-09-10 11:22:36.035604
3276	36	PRD-1789025355244-R1789039356282	126.4000	126.4000	available	2026-09-10 11:22:36.283827	2026-09-10 11:22:36.283827
3277	36	PRD-1789025355244-R1789039356513	120.3000	120.3000	available	2026-09-10 11:22:36.514768	2026-09-10 11:22:36.514768
3278	36	PRD-1789025355244-R1789039356744	103.8000	103.8000	available	2026-09-10 11:22:36.746587	2026-09-10 11:22:36.746587
3279	36	PRD-1789025355244-R1789039357024	131.8000	131.8000	available	2026-09-10 11:22:37.025242	2026-09-10 11:22:37.025242
3280	36	PRD-1789025355244-R1789039357277	124.9000	124.9000	available	2026-09-10 11:22:37.278509	2026-09-10 11:22:37.278509
3281	36	PRD-1789025355244-R1789039357603	88.4000	88.4000	available	2026-09-10 11:22:37.604548	2026-09-10 11:22:37.604548
3282	36	PRD-1789025355244-R1789039357858	94.8000	94.8000	available	2026-09-10 11:22:37.859825	2026-09-10 11:22:37.859825
3283	36	PRD-1789025355244-R1789039358104	94.7000	94.7000	available	2026-09-10 11:22:38.10596	2026-09-10 11:22:38.10596
3284	36	PRD-1789025355244-R1789039358388	119.8000	119.8000	available	2026-09-10 11:22:38.389173	2026-09-10 11:22:38.389173
3285	36	PRD-1789025355244-R1789039358646	122.5000	122.5000	available	2026-09-10 11:22:38.647314	2026-09-10 11:22:38.647314
3286	36	PRD-1789025355244-R1789039358914	119.6000	119.6000	available	2026-09-10 11:22:38.915924	2026-09-10 11:22:38.915924
3287	36	PRD-1789025355244-R1789039359199	120.2000	120.2000	available	2026-09-10 11:22:39.201124	2026-09-10 11:22:39.201124
3288	36	PRD-1789025355244-R1789039359509	120.2000	120.2000	available	2026-09-10 11:22:39.510512	2026-09-10 11:22:39.510512
3289	36	PRD-1789025355244-R1789039359740	120.2000	120.2000	available	2026-09-10 11:22:39.742315	2026-09-10 11:22:39.742315
3290	36	PRD-1789025355244-R1789039360174	102.6000	102.6000	available	2026-09-10 11:22:40.175988	2026-09-10 11:22:40.175988
3291	36	PRD-1789025355244-R1789039360470	118.5000	118.5000	available	2026-09-10 11:22:40.47306	2026-09-10 11:22:40.47306
3292	36	PRD-1789025355244-R1789039360724	120.2000	120.2000	available	2026-09-10 11:22:40.726005	2026-09-10 11:22:40.726005
3293	36	PRD-1789025355244-R1789039360969	118.3000	118.3000	available	2026-09-10 11:22:40.971108	2026-09-10 11:22:40.971108
3294	36	PRD-1789025355244-R1789039361254	120.2000	120.2000	available	2026-09-10 11:22:41.255579	2026-09-10 11:22:41.255579
3295	36	PRD-1789025355244-R1789039361518	129.8000	129.8000	available	2026-09-10 11:22:41.519893	2026-09-10 11:22:41.519893
3296	36	PRD-1789025355244-R1789039361785	95.3000	95.3000	available	2026-09-10 11:22:41.787121	2026-09-10 11:22:41.787121
3297	36	PRD-1789025355244-R1789039362136	124.7000	124.7000	available	2026-09-10 11:22:42.137489	2026-09-10 11:22:42.137489
3298	36	PRD-1789025355244-R1789039362402	120.2000	120.2000	available	2026-09-10 11:22:42.403641	2026-09-10 11:22:42.403641
3299	36	PRD-1789025355244-R1789039362683	132.8000	132.8000	available	2026-09-10 11:22:42.684745	2026-09-10 11:22:42.684745
3300	36	PRD-1789025355244-R1789039362946	120.3000	120.3000	available	2026-09-10 11:22:42.947224	2026-09-10 11:22:42.947224
3301	36	PRD-1789025355244-R1789039363252	123.1000	123.1000	available	2026-09-10 11:22:43.254554	2026-09-10 11:22:43.254554
3302	36	PRD-1789025355244-R1789039363521	94.5000	94.5000	available	2026-09-10 11:22:43.523983	2026-09-10 11:22:43.523983
3303	36	PRD-1789025355244-R1789039363855	127.5000	127.5000	available	2026-09-10 11:22:43.856339	2026-09-10 11:22:43.856339
3304	36	PRD-1789025355244-R1789039364094	117.6000	117.6000	available	2026-09-10 11:22:44.095764	2026-09-10 11:22:44.095764
3305	36	PRD-1789025355244-R1789039364341	117.2000	117.2000	available	2026-09-10 11:22:44.34324	2026-09-10 11:22:44.34324
3306	36	PRD-1789025355244-R1789039364620	92.1000	92.1000	available	2026-09-10 11:22:44.621783	2026-09-10 11:22:44.621783
3307	36	PRD-1789025355244-R1789039364932	111.6000	111.6000	available	2026-09-10 11:22:44.935653	2026-09-10 11:22:44.935653
3308	36	PRD-1789025355244-R1789039365307	131.4000	131.4000	available	2026-09-10 11:22:45.308672	2026-09-10 11:22:45.308672
3309	36	PRD-1789025355244-R1789039365636	127.8000	127.8000	available	2026-09-10 11:22:45.63803	2026-09-10 11:22:45.63803
3310	36	PRD-1789025355244-R1789039365892	121.5000	121.5000	available	2026-09-10 11:22:45.893795	2026-09-10 11:22:45.893795
3311	36	PRD-1789025355244-R1789039366144	120.2000	120.2000	available	2026-09-10 11:22:46.145842	2026-09-10 11:22:46.145842
3312	36	PRD-1789025355244-R1789039366443	118.0000	118.0000	available	2026-09-10 11:22:46.444782	2026-09-10 11:22:46.444782
3313	36	PRD-1789025355244-R1789039366755	100.4000	100.4000	available	2026-09-10 11:22:46.757102	2026-09-10 11:22:46.757102
3314	36	PRD-1789025355244-R1789039367131	131.9000	131.9000	available	2026-09-10 11:22:47.132798	2026-09-10 11:22:47.132798
3315	36	PRD-1789025355244-R1789039367527	142.3000	142.3000	available	2026-09-10 11:22:47.528854	2026-09-10 11:22:47.528854
3316	36	PRD-1789025355244-R1789039367787	116.0000	116.0000	available	2026-09-10 11:22:47.790902	2026-09-10 11:22:47.790902
3317	36	PRD-1789025355244-R1789039367950	96.6000	96.6000	available	2026-09-10 11:22:47.961489	2026-09-10 11:22:47.961489
3318	36	PRD-1789025355244-R1789039368423	123.4000	123.4000	available	2026-09-10 11:22:48.424231	2026-09-10 11:22:48.424231
3319	36	PRD-1789025355244-R1789039368526	106.6000	106.6000	available	2026-09-10 11:22:48.53598	2026-09-10 11:22:48.53598
3320	36	PRD-1789025355244-R1789039368633	120.2000	120.2000	available	2026-09-10 11:22:48.63493	2026-09-10 11:22:48.63493
3321	36	PRD-1789025355244-R1789039368733	113.8000	113.8000	available	2026-09-10 11:22:48.734464	2026-09-10 11:22:48.734464
3322	36	PRD-1789025355244-R1789039368784	98.0000	98.0000	available	2026-09-10 11:22:48.785706	2026-09-10 11:22:48.785706
3323	36	PRD-1789025355244-R1789039368838	124.9000	124.9000	available	2026-09-10 11:22:48.839493	2026-09-10 11:22:48.839493
3324	36	PRD-1789025355244-R1789039368899	118.4000	118.4000	available	2026-09-10 11:22:48.901047	2026-09-10 11:22:48.901047
3325	36	PRD-1789025355244-R1789039368964	120.0000	120.0000	available	2026-09-10 11:22:48.966529	2026-09-10 11:22:48.966529
3326	36	PRD-1789025355244-R1789039369040	102.1000	102.1000	available	2026-09-10 11:22:49.041369	2026-09-10 11:22:49.041369
3327	36	PRD-1789025355244-R1789039369123	120.2000	120.2000	available	2026-09-10 11:22:49.124574	2026-09-10 11:22:49.124574
3328	36	PRD-1789025355244-R1789039369163	120.0000	120.0000	available	2026-09-10 11:22:49.164155	2026-09-10 11:22:49.164155
3329	36	PRD-1789025355244-R1789039369217	119.6000	119.6000	available	2026-09-10 11:22:49.219636	2026-09-10 11:22:49.219636
3330	1	PRD-1789017671180-R1789039461847	126.5000	126.5000	available	2026-09-10 11:24:21.848322	2026-09-10 11:24:21.848322
3331	1	PRD-1789017671180-R1789039462017	120.0000	120.0000	available	2026-09-10 11:24:22.019286	2026-09-10 11:24:22.019286
3332	1	PRD-1789017671180-R1789039462183	113.0000	113.0000	available	2026-09-10 11:24:22.18472	2026-09-10 11:24:22.18472
3333	1	PRD-1789017671180-R1789039462341	123.3000	123.3000	available	2026-09-10 11:24:22.344935	2026-09-10 11:24:22.344935
3334	1	PRD-1789017671180-R1789039462449	116.3000	116.3000	available	2026-09-10 11:24:22.451955	2026-09-10 11:24:22.451955
3336	1	PRD-1789017671180-R1789039462922	115.2000	115.2000	available	2026-09-10 11:24:22.924557	2026-09-10 11:24:22.924557
3337	1	PRD-1789017671180-R1789039463094	123.1000	123.1000	available	2026-09-10 11:24:23.096077	2026-09-10 11:24:23.096077
3338	1	PRD-1789017671180-R1789039463287	118.8000	118.8000	available	2026-09-10 11:24:23.287956	2026-09-10 11:24:23.287956
3339	1	PRD-1789017671180-R1789039463460	113.7000	113.7000	available	2026-09-10 11:24:23.463476	2026-09-10 11:24:23.463476
3340	1	PRD-1789017671180-R1789039463644	121.4000	121.4000	available	2026-09-10 11:24:23.646957	2026-09-10 11:24:23.646957
3341	1	PRD-1789017671180-R1789039463888	118.0000	118.0000	available	2026-09-10 11:24:23.890084	2026-09-10 11:24:23.890084
3342	1	PRD-1789017671180-R1789039464089	128.1000	128.1000	available	2026-09-10 11:24:24.090815	2026-09-10 11:24:24.090815
3343	1	PRD-1789017671180-R1789039464284	112.8000	112.8000	available	2026-09-10 11:24:24.285781	2026-09-10 11:24:24.285781
3344	1	PRD-1789017671180-R1789039464506	112.3000	112.3000	available	2026-09-10 11:24:24.507613	2026-09-10 11:24:24.507613
3345	1	PRD-1789017671180-R1789039464693	120.3000	120.3000	available	2026-09-10 11:24:24.694147	2026-09-10 11:24:24.694147
3346	1	PRD-1789017671180-R1789039464871	122.8000	122.8000	available	2026-09-10 11:24:24.873571	2026-09-10 11:24:24.873571
3347	1	PRD-1789017671180-R1789039465085	135.0000	135.0000	available	2026-09-10 11:24:25.086892	2026-09-10 11:24:25.086892
3348	1	PRD-1789017671180-R1789039465296	136.2000	136.2000	available	2026-09-10 11:24:25.29732	2026-09-10 11:24:25.29732
3349	1	PRD-1789017671180-R1789039465487	114.5000	114.5000	available	2026-09-10 11:24:25.489111	2026-09-10 11:24:25.489111
3350	1	PRD-1789017671180-R1789039465737	126.4000	126.4000	available	2026-09-10 11:24:25.740025	2026-09-10 11:24:25.740025
3351	1	PRD-1789017671180-R1789039465937	102.0000	102.0000	available	2026-09-10 11:24:25.939731	2026-09-10 11:24:25.939731
3352	1	PRD-1789017671180-R1789039466135	115.2000	115.2000	available	2026-09-10 11:24:26.136351	2026-09-10 11:24:26.136351
3353	1	PRD-1789017671180-R1789039466314	116.0000	116.0000	available	2026-09-10 11:24:26.316547	2026-09-10 11:24:26.316547
3354	1	PRD-1789017671180-R1789039466506	110.8000	110.8000	available	2026-09-10 11:24:26.508049	2026-09-10 11:24:26.508049
3355	1	PRD-1789017671180-R1789039466680	128.7000	128.7000	available	2026-09-10 11:24:26.682262	2026-09-10 11:24:26.682262
3356	1	PRD-1789017671180-R1789039466883	112.3000	112.3000	available	2026-09-10 11:24:26.884546	2026-09-10 11:24:26.884546
3358	23	PRD-1789020510805-R1789039553022	124.5000	124.5000	available	2026-09-10 11:25:53.02323	2026-09-10 11:25:53.02323
3359	36	PRD-1789025355244-R1789039633720	117.2000	117.2000	available	2026-09-10 11:27:13.722798	2026-09-10 11:27:13.722798
3360	36	PRD-1789025355244-R1789039633867	118.0000	118.0000	available	2026-09-10 11:27:13.868352	2026-09-10 11:27:13.868352
3361	36	PRD-1789025355244-R1789039634054	124.7000	124.7000	available	2026-09-10 11:27:14.056986	2026-09-10 11:27:14.056986
3362	36	PRD-1789025355244-R1789039634226	120.2000	120.2000	available	2026-09-10 11:27:14.228385	2026-09-10 11:27:14.228385
3363	36	PRD-1789025355244-R1789039634396	120.2000	120.2000	available	2026-09-10 11:27:14.399708	2026-09-10 11:27:14.399708
3364	36	PRD-1789025355244-R1789039634578	138.0000	138.0000	available	2026-09-10 11:27:14.579205	2026-09-10 11:27:14.579205
3365	36	PRD-1789025355244-R1789039634811	120.3000	120.3000	available	2026-09-10 11:27:14.813877	2026-09-10 11:27:14.813877
3366	13	PRD-1789018725877-R1789039927344	125.0000	125.0000	available	2026-09-10 11:32:07.345692	2026-09-10 11:32:07.345692
3367	13	PRD-1789018725877-R1789039927510	125.9000	125.9000	available	2026-09-10 11:32:07.511612	2026-09-10 11:32:07.511612
3368	13	PRD-1789018725877-R1789039927676	123.3000	123.3000	available	2026-09-10 11:32:07.677132	2026-09-10 11:32:07.677132
3369	13	PRD-1789018725877-R1789039927816	132.0000	132.0000	available	2026-09-10 11:32:07.818267	2026-09-10 11:32:07.818267
3370	13	PRD-1789018725877-R1789039927965	91.0000	91.0000	available	2026-09-10 11:32:07.967027	2026-09-10 11:32:07.967027
3371	13	PRD-1789018725877-R1789039928145	120.2000	120.2000	available	2026-09-10 11:32:08.147049	2026-09-10 11:32:08.147049
3372	13	PRD-1789018725877-R1789039928339	89.7000	89.7000	available	2026-09-10 11:32:08.343519	2026-09-10 11:32:08.343519
3373	13	PRD-1789018725877-R1789039928495	115.7000	115.7000	available	2026-09-10 11:32:08.498056	2026-09-10 11:32:08.498056
3374	13	PRD-1789018725877-R1789039928680	107.0000	107.0000	available	2026-09-10 11:32:08.683727	2026-09-10 11:32:08.683727
3375	13	PRD-1789018725877-R1789039928806	106.7000	106.7000	available	2026-09-10 11:32:08.807853	2026-09-10 11:32:08.807853
3376	13	PRD-1789018725877-R1789039928980	122.0000	122.0000	available	2026-09-10 11:32:08.983827	2026-09-10 11:32:08.983827
3377	13	PRD-1789018725877-R1789039929189	118.5000	118.5000	available	2026-09-10 11:32:09.19134	2026-09-10 11:32:09.19134
3378	13	PRD-1789018725877-R1789039929318	120.1000	120.1000	available	2026-09-10 11:32:09.320279	2026-09-10 11:32:09.320279
3379	13	PRD-1789018725877-R1789039929470	121.3000	121.3000	available	2026-09-10 11:32:09.471593	2026-09-10 11:32:09.471593
3380	13	PRD-1789018725877-R1789039929670	115.2000	115.2000	available	2026-09-10 11:32:09.672592	2026-09-10 11:32:09.672592
3381	13	PRD-1789018725877-R1789039929804	120.4000	120.4000	available	2026-09-10 11:32:09.805876	2026-09-10 11:32:09.805876
3382	13	PRD-1789018725877-R1789039929988	117.6000	117.6000	available	2026-09-10 11:32:09.99124	2026-09-10 11:32:09.99124
3383	13	PRD-1789018725877-R1789039930113	120.5000	120.5000	available	2026-09-10 11:32:10.116225	2026-09-10 11:32:10.116225
3384	13	PRD-1789018725877-R1789039930266	117.3000	117.3000	available	2026-09-10 11:32:10.269167	2026-09-10 11:32:10.269167
3385	13	PRD-1789018725877-R1789039930427	120.0000	120.0000	available	2026-09-10 11:32:10.427742	2026-09-10 11:32:10.427742
3386	13	PRD-1789018725877-R1789039930606	121.9000	121.9000	available	2026-09-10 11:32:10.608714	2026-09-10 11:32:10.608714
3390	13	PRD-1789018725877-R1789039931298	113.5000	113.5000	available	2026-09-10 11:32:11.301115	2026-09-10 11:32:11.301115
3392	13	PRD-1789018725877-R1789039931645	116.9000	116.9000	available	2026-09-10 11:32:11.64585	2026-09-10 11:32:11.64585
3393	13	PRD-1789018725877-R1789039931819	120.0000	120.0000	available	2026-09-10 11:32:11.820411	2026-09-10 11:32:11.820411
3394	13	PRD-1789018725877-R1789039931998	125.2000	125.2000	available	2026-09-10 11:32:11.998776	2026-09-10 11:32:11.998776
3396	13	PRD-1789018725877-R1789039932336	116.0000	116.0000	available	2026-09-10 11:32:12.337859	2026-09-10 11:32:12.337859
3402	13	PRD-1789018725877-R1789039933361	120.6000	120.6000	available	2026-09-10 11:32:13.362163	2026-09-10 11:32:13.362163
3416	13	PRD-1789018725877-R1789039935969	115.6000	115.6000	available	2026-09-10 11:32:15.973399	2026-09-10 11:32:15.973399
3417	13	PRD-1789018725877-R1789039936120	125.8000	125.8000	available	2026-09-10 11:32:16.125499	2026-09-10 11:32:16.125499
3419	13	PRD-1789018725877-R1789039936463	123.2000	123.2000	available	2026-09-10 11:32:16.465171	2026-09-10 11:32:16.465171
3421	13	PRD-1789018725877-R1789039936800	122.6000	122.6000	available	2026-09-10 11:32:16.800972	2026-09-10 11:32:16.800972
3424	13	PRD-1789018725877-R1789039937813	118.0000	118.0000	available	2026-09-10 11:32:17.814677	2026-09-10 11:32:17.814677
3387	13	PRD-1789018725877-R1789039930746	116.1000	116.1000	available	2026-09-10 11:32:10.747936	2026-09-10 11:32:10.747936
3388	13	PRD-1789018725877-R1789039930930	116.8000	116.8000	available	2026-09-10 11:32:10.931894	2026-09-10 11:32:10.931894
3401	13	PRD-1789018725877-R1789039933217	83.4000	83.4000	available	2026-09-10 11:32:13.218529	2026-09-10 11:32:13.218529
3403	13	PRD-1789018725877-R1789039933559	110.0000	110.0000	available	2026-09-10 11:32:13.560324	2026-09-10 11:32:13.560324
3408	13	PRD-1789018725877-R1789039934466	116.0000	116.0000	available	2026-09-10 11:32:14.471126	2026-09-10 11:32:14.471126
3409	13	PRD-1789018725877-R1789039934618	111.7000	111.7000	available	2026-09-10 11:32:14.62082	2026-09-10 11:32:14.62082
3410	13	PRD-1789018725877-R1789039934817	116.8000	116.8000	available	2026-09-10 11:32:14.819099	2026-09-10 11:32:14.819099
3411	13	PRD-1789018725877-R1789039935073	120.8000	120.8000	available	2026-09-10 11:32:15.074436	2026-09-10 11:32:15.074436
3412	13	PRD-1789018725877-R1789039935204	119.2000	119.2000	available	2026-09-10 11:32:15.206003	2026-09-10 11:32:15.206003
3413	13	PRD-1789018725877-R1789039935406	128.7000	128.7000	available	2026-09-10 11:32:15.40803	2026-09-10 11:32:15.40803
3414	13	PRD-1789018725877-R1789039935544	117.6000	117.6000	available	2026-09-10 11:32:15.546027	2026-09-10 11:32:15.546027
3415	13	PRD-1789018725877-R1789039935721	128.7000	128.7000	available	2026-09-10 11:32:15.722608	2026-09-10 11:32:15.722608
3425	13	PRD-1789018725877-R1789039938035	120.0000	120.0000	available	2026-09-10 11:32:18.037711	2026-09-10 11:32:18.037711
3389	13	PRD-1789018725877-R1789039931109	115.0000	115.0000	available	2026-09-10 11:32:11.111222	2026-09-10 11:32:11.111222
3391	13	PRD-1789018725877-R1789039931515	118.0000	118.0000	available	2026-09-10 11:32:11.517258	2026-09-10 11:32:11.517258
3395	13	PRD-1789018725877-R1789039932140	116.0000	116.0000	available	2026-09-10 11:32:12.141611	2026-09-10 11:32:12.141611
3397	13	PRD-1789018725877-R1789039932475	123.8000	123.8000	available	2026-09-10 11:32:12.4763	2026-09-10 11:32:12.4763
3398	13	PRD-1789018725877-R1789039932678	120.0000	120.0000	available	2026-09-10 11:32:12.67936	2026-09-10 11:32:12.67936
3399	13	PRD-1789018725877-R1789039932875	125.6000	125.6000	available	2026-09-10 11:32:12.875978	2026-09-10 11:32:12.875978
3400	13	PRD-1789018725877-R1789039933019	118.0000	118.0000	available	2026-09-10 11:32:13.020304	2026-09-10 11:32:13.020304
3404	13	PRD-1789018725877-R1789039933736	120.1000	120.1000	available	2026-09-10 11:32:13.738451	2026-09-10 11:32:13.738451
3405	13	PRD-1789018725877-R1789039933865	118.7000	118.7000	available	2026-09-10 11:32:13.867443	2026-09-10 11:32:13.867443
3406	13	PRD-1789018725877-R1789039934093	126.5000	126.5000	available	2026-09-10 11:32:14.094975	2026-09-10 11:32:14.094975
3407	13	PRD-1789018725877-R1789039934286	118.0000	118.0000	available	2026-09-10 11:32:14.288215	2026-09-10 11:32:14.288215
3418	13	PRD-1789018725877-R1789039936307	120.2000	120.2000	available	2026-09-10 11:32:16.308506	2026-09-10 11:32:16.308506
3420	13	PRD-1789018725877-R1789039936638	116.0000	116.0000	available	2026-09-10 11:32:16.640296	2026-09-10 11:32:16.640296
3422	13	PRD-1789018725877-R1789039936986	112.8000	112.8000	available	2026-09-10 11:32:16.987644	2026-09-10 11:32:16.987644
3423	13	PRD-1789018725877-R1789039937142	120.9000	120.9000	available	2026-09-10 11:32:17.143525	2026-09-10 11:32:17.143525
3426	13	PRD-1789018725877-R1789039938783	118.0000	118.0000	available	2026-09-10 11:32:18.784464	2026-09-10 11:32:18.784464
3427	13	PRD-1789018725877-R1789040330811	127.8000	127.8000	available	2026-09-10 11:38:50.812573	2026-09-10 11:38:50.812573
3428	13	PRD-1789018725877-R1789040330895	120.3000	120.3000	available	2026-09-10 11:38:50.89701	2026-09-10 11:38:50.89701
3429	13	PRD-1789018725877-R1789040331277	114.9000	114.9000	available	2026-09-10 11:38:51.278677	2026-09-10 11:38:51.278677
3430	13	PRD-1789018725877-R1789040331407	116.8000	116.8000	available	2026-09-10 11:38:51.408895	2026-09-10 11:38:51.408895
3431	13	PRD-1789018725877-R1789040331615	121.7000	121.7000	available	2026-09-10 11:38:51.616477	2026-09-10 11:38:51.616477
3432	13	PRD-1789018725877-R1789040331880	109.4000	109.4000	available	2026-09-10 11:38:51.881273	2026-09-10 11:38:51.881273
3433	13	PRD-1789018725877-R1789040332137	112.0000	112.0000	available	2026-09-10 11:38:52.139032	2026-09-10 11:38:52.139032
3434	13	PRD-1789018725877-R1789040332395	107.5000	107.5000	available	2026-09-10 11:38:52.396787	2026-09-10 11:38:52.396787
3435	13	PRD-1789018725877-R1789040332672	118.2000	118.2000	available	2026-09-10 11:38:52.673439	2026-09-10 11:38:52.673439
3436	13	PRD-1789018725877-R1789040332936	115.3000	115.3000	available	2026-09-10 11:38:52.937767	2026-09-10 11:38:52.937767
3437	13	PRD-1789018725877-R1789040333253	123.7000	123.7000	available	2026-09-10 11:38:53.254893	2026-09-10 11:38:53.254893
3438	13	PRD-1789018725877-R1789040333550	108.3000	108.3000	available	2026-09-10 11:38:53.553299	2026-09-10 11:38:53.553299
3439	13	PRD-1789018725877-R1789040333823	102.0000	102.0000	available	2026-09-10 11:38:53.82502	2026-09-10 11:38:53.82502
3440	13	PRD-1789018725877-R1789040334101	118.0000	118.0000	available	2026-09-10 11:38:54.10309	2026-09-10 11:38:54.10309
3441	13	PRD-1789018725877-R1789040334580	120.4000	120.4000	available	2026-09-10 11:38:54.592415	2026-09-10 11:38:54.592415
3442	13	PRD-1789018725877-R1789040334949	118.0000	118.0000	available	2026-09-10 11:38:54.950759	2026-09-10 11:38:54.950759
3443	13	PRD-1789018725877-R1789040335256	128.0000	128.0000	available	2026-09-10 11:38:55.258574	2026-09-10 11:38:55.258574
3444	13	PRD-1789018725877-R1789040335554	136.8000	136.8000	available	2026-09-10 11:38:55.556077	2026-09-10 11:38:55.556077
3445	13	PRD-1789018725877-R1789040335849	118.0000	118.0000	available	2026-09-10 11:38:55.850806	2026-09-10 11:38:55.850806
3446	13	PRD-1789018725877-R1789040336301	118.0000	118.0000	available	2026-09-10 11:38:56.303475	2026-09-10 11:38:56.303475
3447	13	PRD-1789018725877-R1789040336608	118.0000	118.0000	available	2026-09-10 11:38:56.609743	2026-09-10 11:38:56.609743
3448	13	PRD-1789018725877-R1789040336898	121.0000	121.0000	available	2026-09-10 11:38:56.899643	2026-09-10 11:38:56.899643
3449	13	PRD-1789018725877-R1789040337085	113.8000	113.8000	available	2026-09-10 11:38:57.086395	2026-09-10 11:38:57.086395
3450	13	PRD-1789018725877-R1789040337365	120.2000	120.2000	available	2026-09-10 11:38:57.367102	2026-09-10 11:38:57.367102
3451	13	PRD-1789018725877-R1789040337646	118.7000	118.7000	available	2026-09-10 11:38:57.647833	2026-09-10 11:38:57.647833
3452	13	PRD-1789018725877-R1789040337942	118.0000	118.0000	available	2026-09-10 11:38:57.944067	2026-09-10 11:38:57.944067
3453	13	PRD-1789018725877-R1789040338248	117.6000	117.6000	available	2026-09-10 11:38:58.249377	2026-09-10 11:38:58.249377
3454	13	PRD-1789018725877-R1789040338714	127.1000	127.1000	available	2026-09-10 11:38:58.716612	2026-09-10 11:38:58.716612
3455	13	PRD-1789018725877-R1789040338965	123.1000	123.1000	available	2026-09-10 11:38:58.96677	2026-09-10 11:38:58.96677
3456	13	PRD-1789018725877-R1789040339254	117.6000	117.6000	available	2026-09-10 11:38:59.256115	2026-09-10 11:38:59.256115
3457	13	PRD-1789018725877-R1789040339515	127.3000	127.3000	available	2026-09-10 11:38:59.51663	2026-09-10 11:38:59.51663
3458	13	PRD-1789018725877-R1789040339816	103.1000	103.1000	available	2026-09-10 11:38:59.826249	2026-09-10 11:38:59.826249
3459	13	PRD-1789018725877-R1789040340158	120.3000	120.3000	available	2026-09-10 11:39:00.16006	2026-09-10 11:39:00.16006
3460	36	PRD-1789025355244-R1789040384038	120.2000	120.2000	available	2026-09-10 11:39:44.039009	2026-09-10 11:39:44.039009
3461	36	PRD-1789025355244-R1789040384142	94.0000	94.0000	available	2026-09-10 11:39:44.143635	2026-09-10 11:39:44.143635
3462	36	PRD-1789025355244-R1789040384494	126.0000	126.0000	available	2026-09-10 11:39:44.495324	2026-09-10 11:39:44.495324
3463	36	PRD-1789025355244-R1789040384713	120.2000	120.2000	available	2026-09-10 11:39:44.714718	2026-09-10 11:39:44.714718
3464	58	PRD-1789033578183-R1789040413387	127.7000	127.7000	available	2026-09-10 11:40:13.389056	2026-09-10 11:40:13.389056
3465	58	PRD-1789033578183-R1789040413451	145.6000	145.6000	available	2026-09-10 11:40:13.45724	2026-09-10 11:40:13.45724
3466	58	PRD-1789033578183-R1789040413667	122.6000	122.6000	available	2026-09-10 11:40:13.668165	2026-09-10 11:40:13.668165
3467	23	PRD-1789020510805-R1789040440920	120.3000	120.3000	available	2026-09-10 11:40:40.922261	2026-09-10 11:40:40.922261
3468	23	PRD-1789020510805-R1789040440991	120.3000	120.3000	available	2026-09-10 11:40:40.993307	2026-09-10 11:40:40.993307
3469	23	PRD-1789020510805-R1789040441140	120.0000	120.0000	available	2026-09-10 11:40:41.142708	2026-09-10 11:40:41.142708
3470	23	PRD-1789020510805-R1789040441247	128.0000	128.0000	available	2026-09-10 11:40:41.24947	2026-09-10 11:40:41.24947
3471	23	PRD-1789020510805-R1789040441389	120.3000	120.3000	available	2026-09-10 11:40:41.39136	2026-09-10 11:40:41.39136
3472	26	PRD-1789021819488-R1789040454259	121.4000	121.4000	available	2026-09-10 11:40:54.260191	2026-09-10 11:40:54.260191
3473	50	PRD-1789028920266-R1789040472514	122.0000	122.0000	available	2026-09-10 11:41:12.515932	2026-09-10 11:41:12.515932
3474	50	PRD-1789028920266-R1789040472574	133.1000	133.1000	available	2026-09-10 11:41:12.576959	2026-09-10 11:41:12.576959
3475	50	PRD-1789028920266-R1789040472996	115.8000	115.8000	available	2026-09-10 11:41:12.998157	2026-09-10 11:41:12.998157
3476	13	PRD-1789018725877-R1789040636170	93.2000	93.2000	available	2026-09-10 11:43:56.171963	2026-09-10 11:43:56.171963
3477	13	PRD-1789018725877-R1789040636290	106.1000	106.1000	available	2026-09-10 11:43:56.292137	2026-09-10 11:43:56.292137
3478	13	PRD-1789018725877-R1789040636716	118.0000	118.0000	available	2026-09-10 11:43:56.718212	2026-09-10 11:43:56.718212
3479	13	PRD-1789018725877-R1789040636871	116.2000	116.2000	available	2026-09-10 11:43:56.872473	2026-09-10 11:43:56.872473
3480	13	PRD-1789018725877-R1789040637064	111.8000	111.8000	available	2026-09-10 11:43:57.066151	2026-09-10 11:43:57.066151
3481	13	PRD-1789018725877-R1789040637488	122.4000	122.4000	available	2026-09-10 11:43:57.48943	2026-09-10 11:43:57.48943
3482	13	PRD-1789018725877-R1789040637797	114.8000	114.8000	available	2026-09-10 11:43:57.798686	2026-09-10 11:43:57.798686
3483	13	PRD-1789018725877-R1789040638101	120.4000	120.4000	available	2026-09-10 11:43:58.102369	2026-09-10 11:43:58.102369
3489	13	PRD-1789018725877-R1789040640713	117.4000	117.4000	available	2026-09-10 11:44:00.714444	2026-09-10 11:44:00.714444
3490	13	PRD-1789018725877-R1789040641066	122.3000	122.3000	available	2026-09-10 11:44:01.069193	2026-09-10 11:44:01.069193
3498	13	PRD-1789018725877-R1789040643816	117.0000	117.0000	available	2026-09-10 11:44:03.817942	2026-09-10 11:44:03.817942
3501	13	PRD-1789018725877-R1789040644890	109.2000	109.2000	available	2026-09-10 11:44:04.891487	2026-09-10 11:44:04.891487
3502	13	PRD-1789018725877-R1789040645195	116.0000	116.0000	available	2026-09-10 11:44:05.196629	2026-09-10 11:44:05.196629
3507	13	PRD-1789018725877-R1789040646756	114.1000	114.1000	available	2026-09-10 11:44:06.766429	2026-09-10 11:44:06.766429
3484	13	PRD-1789018725877-R1789040638420	118.4000	118.4000	available	2026-09-10 11:43:58.421715	2026-09-10 11:43:58.421715
3485	13	PRD-1789018725877-R1789040638827	128.8000	128.8000	available	2026-09-10 11:43:58.830565	2026-09-10 11:43:58.830565
3486	13	PRD-1789018725877-R1789040639283	132.1000	132.1000	available	2026-09-10 11:43:59.284782	2026-09-10 11:43:59.284782
3487	13	PRD-1789018725877-R1789040639787	104.0000	104.0000	available	2026-09-10 11:43:59.789488	2026-09-10 11:43:59.789488
3488	13	PRD-1789018725877-R1789040640228	114.0000	114.0000	available	2026-09-10 11:44:00.229498	2026-09-10 11:44:00.229498
3493	13	PRD-1789018725877-R1789040641986	118.0000	118.0000	available	2026-09-10 11:44:01.987997	2026-09-10 11:44:01.987997
3494	13	PRD-1789018725877-R1789040642314	130.0000	130.0000	available	2026-09-10 11:44:02.316537	2026-09-10 11:44:02.316537
3495	13	PRD-1789018725877-R1789040642638	132.0000	132.0000	available	2026-09-10 11:44:02.640993	2026-09-10 11:44:02.640993
3496	13	PRD-1789018725877-R1789040642958	120.0000	120.0000	available	2026-09-10 11:44:02.960781	2026-09-10 11:44:02.960781
3499	13	PRD-1789018725877-R1789040644207	123.9000	123.9000	available	2026-09-10 11:44:04.208832	2026-09-10 11:44:04.208832
3504	13	PRD-1789018725877-R1789040645796	141.0000	141.0000	available	2026-09-10 11:44:05.797975	2026-09-10 11:44:05.797975
3505	13	PRD-1789018725877-R1789040646081	115.6000	115.6000	available	2026-09-10 11:44:06.081848	2026-09-10 11:44:06.081848
3506	13	PRD-1789018725877-R1789040646397	117.6000	117.6000	available	2026-09-10 11:44:06.398423	2026-09-10 11:44:06.398423
3491	13	PRD-1789018725877-R1789040641388	109.2000	109.2000	available	2026-09-10 11:44:01.389727	2026-09-10 11:44:01.389727
3492	13	PRD-1789018725877-R1789040641556	114.8000	114.8000	available	2026-09-10 11:44:01.557406	2026-09-10 11:44:01.557406
3497	13	PRD-1789018725877-R1789040643492	129.6000	129.6000	available	2026-09-10 11:44:03.493912	2026-09-10 11:44:03.493912
3500	13	PRD-1789018725877-R1789040644533	120.1000	120.1000	available	2026-09-10 11:44:04.534918	2026-09-10 11:44:04.534918
3503	13	PRD-1789018725877-R1789040645600	114.4000	114.4000	available	2026-09-10 11:44:05.602855	2026-09-10 11:44:05.602855
3509	18	PRD-1789018957547-R1789042829988	120.2000	120.2000	available	2026-09-10 12:20:29.990072	2026-09-10 12:20:29.990072
3510	36	PRD-1789025355244-R1789042858630	120.0000	120.0000	available	2026-09-10 12:20:58.63223	2026-09-10 12:20:58.63223
3511	36	PRD-1789025355244-R1789042858725	118.8000	118.8000	available	2026-09-10 12:20:58.735095	2026-09-10 12:20:58.735095
3512	36	PRD-1789025355244-R1789042859185	124.5000	124.5000	available	2026-09-10 12:20:59.186073	2026-09-10 12:20:59.186073
3513	36	PRD-1789025355244-R1789042859324	120.2000	120.2000	available	2026-09-10 12:20:59.326049	2026-09-10 12:20:59.326049
3514	50	PRD-1789028920266-R1789042878404	93.0000	93.0000	available	2026-09-10 12:21:18.405788	2026-09-10 12:21:18.405788
3515	13	PRD-1789018725877-R1789042934480	114.4000	114.4000	available	2026-09-10 12:22:14.481779	2026-09-10 12:22:14.481779
3516	13	PRD-1789018725877-R1789042934661	120.2000	120.2000	available	2026-09-10 12:22:14.663512	2026-09-10 12:22:14.663512
3517	13	PRD-1789018725877-R1789042934970	116.3000	116.3000	available	2026-09-10 12:22:14.972758	2026-09-10 12:22:14.972758
3518	13	PRD-1789018725877-R1789042935311	120.0000	120.0000	available	2026-09-10 12:22:15.314958	2026-09-10 12:22:15.314958
3519	13	PRD-1789018725877-R1789042935558	131.0000	131.0000	available	2026-09-10 12:22:15.560363	2026-09-10 12:22:15.560363
3520	13	PRD-1789018725877-R1789042936038	118.9000	118.9000	available	2026-09-10 12:22:16.039892	2026-09-10 12:22:16.039892
3521	13	PRD-1789018725877-R1789042936544	116.2000	116.2000	available	2026-09-10 12:22:16.546473	2026-09-10 12:22:16.546473
3522	13	PRD-1789018725877-R1789042936843	101.7000	101.7000	available	2026-09-10 12:22:16.845674	2026-09-10 12:22:16.845674
3523	13	PRD-1789018725877-R1789042937148	118.0000	118.0000	available	2026-09-10 12:22:17.149728	2026-09-10 12:22:17.149728
3524	13	PRD-1789018725877-R1789042937537	120.2000	120.2000	available	2026-09-10 12:22:17.539636	2026-09-10 12:22:17.539636
3525	13	PRD-1789018725877-R1789042937912	124.4000	124.4000	available	2026-09-10 12:22:17.913736	2026-09-10 12:22:17.913736
3526	13	PRD-1789018725877-R1789042938239	117.4000	117.4000	available	2026-09-10 12:22:18.241495	2026-09-10 12:22:18.241495
3527	13	PRD-1789018725877-R1789042938569	117.3000	117.3000	available	2026-09-10 12:22:18.570326	2026-09-10 12:22:18.570326
3528	13	PRD-1789018725877-R1789042938887	120.2000	120.2000	available	2026-09-10 12:22:18.888851	2026-09-10 12:22:18.888851
3529	15	PRD-1789018843399-R1789043069924	117.0000	117.0000	available	2026-09-10 12:24:29.925539	2026-09-10 12:24:29.925539
3530	15	PRD-1789018843399-R1789043069977	114.9000	114.9000	available	2026-09-10 12:24:29.97869	2026-09-10 12:24:29.97869
3531	15	PRD-1789018843399-R1789043070114	117.0000	117.0000	available	2026-09-10 12:24:30.11711	2026-09-10 12:24:30.11711
3532	15	PRD-1789018843399-R1789043070250	119.9000	119.9000	available	2026-09-10 12:24:30.252165	2026-09-10 12:24:30.252165
3533	15	PRD-1789018843399-R1789043070357	117.0000	117.0000	available	2026-09-10 12:24:30.359508	2026-09-10 12:24:30.359508
3534	12	PRD-1789018691298-R1789043281004	116.0000	116.0000	available	2026-09-10 12:28:01.006689	2026-09-10 12:28:01.006689
3535	12	PRD-1789018691298-R1789043281103	134.8000	134.8000	available	2026-09-10 12:28:01.105648	2026-09-10 12:28:01.105648
3536	12	PRD-1789018691298-R1789043281506	111.0000	111.0000	available	2026-09-10 12:28:01.507793	2026-09-10 12:28:01.507793
3537	12	PRD-1789018691298-R1789043281650	90.8000	90.8000	available	2026-09-10 12:28:01.652022	2026-09-10 12:28:01.652022
3538	12	PRD-1789018691298-R1789043281874	121.1000	121.1000	available	2026-09-10 12:28:01.876562	2026-09-10 12:28:01.876562
3539	12	PRD-1789018691298-R1789043282072	125.9000	125.9000	available	2026-09-10 12:28:02.073399	2026-09-10 12:28:02.073399
3540	12	PRD-1789018691298-R1789043282274	127.3000	127.3000	available	2026-09-10 12:28:02.276213	2026-09-10 12:28:02.276213
3541	12	PRD-1789018691298-R1789043282477	116.0000	116.0000	available	2026-09-10 12:28:02.479111	2026-09-10 12:28:02.479111
3542	12	PRD-1789018691298-R1789043282725	116.0000	116.0000	available	2026-09-10 12:28:02.726918	2026-09-10 12:28:02.726918
3543	12	PRD-1789018691298-R1789043282972	116.0000	116.0000	available	2026-09-10 12:28:02.973435	2026-09-10 12:28:02.973435
3544	12	PRD-1789018691298-R1789043283098	116.0000	116.0000	available	2026-09-10 12:28:03.099952	2026-09-10 12:28:03.099952
3545	12	PRD-1789018691298-R1789043283274	116.0000	116.0000	available	2026-09-10 12:28:03.275544	2026-09-10 12:28:03.275544
3546	12	PRD-1789018691298-R1789043283383	116.0000	116.0000	available	2026-09-10 12:28:03.385692	2026-09-10 12:28:03.385692
3547	12	PRD-1789018691298-R1789043283473	116.0000	116.0000	available	2026-09-10 12:28:03.476763	2026-09-10 12:28:03.476763
3548	12	PRD-1789018691298-R1789043283609	116.0000	116.0000	available	2026-09-10 12:28:03.611811	2026-09-10 12:28:03.611811
3549	12	PRD-1789018691298-R1789043283694	116.0000	116.0000	available	2026-09-10 12:28:03.69548	2026-09-10 12:28:03.69548
3550	12	PRD-1789018691298-R1789043283817	114.1000	114.1000	available	2026-09-10 12:28:03.820628	2026-09-10 12:28:03.820628
3551	12	PRD-1789018691298-R1789043283868	116.0000	116.0000	available	2026-09-10 12:28:03.87	2026-09-10 12:28:03.87
3552	12	PRD-1789018691298-R1789043283933	116.0000	116.0000	available	2026-09-10 12:28:03.936113	2026-09-10 12:28:03.936113
3553	12	PRD-1789018691298-R1789043283987	130.2000	130.2000	available	2026-09-10 12:28:03.989701	2026-09-10 12:28:03.989701
3554	12	PRD-1789018691298-R1789043284055	110.3000	110.3000	available	2026-09-10 12:28:04.056946	2026-09-10 12:28:04.056946
3555	12	PRD-1789018691298-R1789043284118	116.0000	116.0000	available	2026-09-10 12:28:04.119209	2026-09-10 12:28:04.119209
3556	12	PRD-1789018691298-R1789043284203	129.5000	129.5000	available	2026-09-10 12:28:04.205138	2026-09-10 12:28:04.205138
3557	12	PRD-1789018691298-R1789043284249	124.7000	124.7000	available	2026-09-10 12:28:04.250583	2026-09-10 12:28:04.250583
3558	12	PRD-1789018691298-R1789043284312	110.4000	110.4000	available	2026-09-10 12:28:04.313399	2026-09-10 12:28:04.313399
3559	12	PRD-1789018691298-R1789043284351	116.5000	116.5000	available	2026-09-10 12:28:04.352606	2026-09-10 12:28:04.352606
3560	12	PRD-1789018691298-R1789043284407	127.1000	127.1000	available	2026-09-10 12:28:04.409621	2026-09-10 12:28:04.409621
3561	12	PRD-1789018691298-R1789043284478	126.7000	126.7000	available	2026-09-10 12:28:04.479469	2026-09-10 12:28:04.479469
3562	12	PRD-1789018691298-R1789043284547	116.0000	116.0000	available	2026-09-10 12:28:04.548455	2026-09-10 12:28:04.548455
3563	12	PRD-1789018691298-R1789043284610	115.0000	115.0000	available	2026-09-10 12:28:04.617866	2026-09-10 12:28:04.617866
3564	12	PRD-1789018691298-R1789043284673	139.6000	139.6000	available	2026-09-10 12:28:04.674639	2026-09-10 12:28:04.674639
3565	12	PRD-1789018691298-R1789043284750	120.0000	120.0000	available	2026-09-10 12:28:04.751737	2026-09-10 12:28:04.751737
3566	12	PRD-1789018691298-R1789043284819	126.9000	126.9000	available	2026-09-10 12:28:04.820454	2026-09-10 12:28:04.820454
3567	12	PRD-1789018691298-R1789043284878	126.7000	126.7000	available	2026-09-10 12:28:04.880033	2026-09-10 12:28:04.880033
3568	12	PRD-1789018691298-R1789043284951	116.0000	116.0000	available	2026-09-10 12:28:04.952972	2026-09-10 12:28:04.952972
3569	12	PRD-1789018691298-R1789043285014	130.2000	130.2000	available	2026-09-10 12:28:05.015569	2026-09-10 12:28:05.015569
3570	12	PRD-1789018691298-R1789043285080	116.0000	116.0000	available	2026-09-10 12:28:05.082169	2026-09-10 12:28:05.082169
3571	12	PRD-1789018691298-R1789043285154	116.5000	116.5000	available	2026-09-10 12:28:05.157591	2026-09-10 12:28:05.157591
3572	12	PRD-1789018691298-R1789043285216	116.0000	116.0000	available	2026-09-10 12:28:05.217233	2026-09-10 12:28:05.217233
3573	12	PRD-1789018691298-R1789043285265	116.0000	116.0000	available	2026-09-10 12:28:05.271598	2026-09-10 12:28:05.271598
3574	12	PRD-1789018691298-R1789043285317	125.2000	125.2000	available	2026-09-10 12:28:05.319247	2026-09-10 12:28:05.319247
3575	12	PRD-1789018691298-R1789043285380	113.7000	113.7000	available	2026-09-10 12:28:05.382614	2026-09-10 12:28:05.382614
3576	12	PRD-1789018691298-R1789043285439	119.9000	119.9000	available	2026-09-10 12:28:05.441257	2026-09-10 12:28:05.441257
3577	12	PRD-1789018691298-R1789043285497	126.4000	126.4000	available	2026-09-10 12:28:05.50036	2026-09-10 12:28:05.50036
3578	12	PRD-1789018691298-R1789043285558	123.3000	123.3000	available	2026-09-10 12:28:05.55921	2026-09-10 12:28:05.55921
3579	12	PRD-1789018691298-R1789043285638	110.6000	110.6000	available	2026-09-10 12:28:05.639083	2026-09-10 12:28:05.639083
3580	12	PRD-1789018691298-R1789043285715	130.9000	130.9000	available	2026-09-10 12:28:05.716986	2026-09-10 12:28:05.716986
3581	12	PRD-1789018691298-R1789043285773	116.0000	116.0000	available	2026-09-10 12:28:05.77433	2026-09-10 12:28:05.77433
3582	12	PRD-1789018691298-R1789043285824	116.0000	116.0000	available	2026-09-10 12:28:05.826362	2026-09-10 12:28:05.826362
3583	12	PRD-1789018691298-R1789043285981	116.0000	116.0000	available	2026-09-10 12:28:05.982952	2026-09-10 12:28:05.982952
3584	12	PRD-1789018691298-R1789043286078	116.0000	116.0000	available	2026-09-10 12:28:06.081801	2026-09-10 12:28:06.081801
3585	12	PRD-1789018691298-R1789043286141	121.4000	121.4000	available	2026-09-10 12:28:06.142564	2026-09-10 12:28:06.142564
3586	12	PRD-1789018691298-R1789043286225	116.0000	116.0000	available	2026-09-10 12:28:06.227335	2026-09-10 12:28:06.227335
3587	12	PRD-1789018691298-R1789043286282	116.0000	116.0000	available	2026-09-10 12:28:06.284274	2026-09-10 12:28:06.284274
3588	12	PRD-1789018691298-R1789043286344	116.0000	116.0000	available	2026-09-10 12:28:06.347095	2026-09-10 12:28:06.347095
3589	12	PRD-1789018691298-R1789043286398	116.0000	116.0000	available	2026-09-10 12:28:06.400841	2026-09-10 12:28:06.400841
3590	12	PRD-1789018691298-R1789043286449	116.0000	116.0000	available	2026-09-10 12:28:06.451642	2026-09-10 12:28:06.451642
3591	12	PRD-1789018691298-R1789043286504	116.0000	116.0000	available	2026-09-10 12:28:06.505231	2026-09-10 12:28:06.505231
3592	12	PRD-1789018691298-R1789043286566	116.0000	116.0000	available	2026-09-10 12:28:06.568295	2026-09-10 12:28:06.568295
3593	12	PRD-1789018691298-R1789043286624	116.0000	116.0000	available	2026-09-10 12:28:06.625513	2026-09-10 12:28:06.625513
3594	12	PRD-1789018691298-R1789043286684	116.0000	116.0000	available	2026-09-10 12:28:06.686155	2026-09-10 12:28:06.686155
3595	12	PRD-1789018691298-R1789043286753	126.0000	126.0000	available	2026-09-10 12:28:06.760784	2026-09-10 12:28:06.760784
3596	12	PRD-1789018691298-R1789043286836	127.7000	127.7000	available	2026-09-10 12:28:06.839546	2026-09-10 12:28:06.839546
3597	12	PRD-1789018691298-R1789043286926	126.9000	126.9000	available	2026-09-10 12:28:06.927697	2026-09-10 12:28:06.927697
3598	12	PRD-1789018691298-R1789043287026	128.5000	128.5000	available	2026-09-10 12:28:07.027586	2026-09-10 12:28:07.027586
3599	12	PRD-1789018691298-R1789043287154	131.3000	131.3000	available	2026-09-10 12:28:07.156391	2026-09-10 12:28:07.156391
3600	12	PRD-1789018691298-R1789043287239	125.7000	125.7000	available	2026-09-10 12:28:07.240487	2026-09-10 12:28:07.240487
3601	12	PRD-1789018691298-R1789043287338	126.9000	126.9000	available	2026-09-10 12:28:07.339455	2026-09-10 12:28:07.339455
3602	24	PRD-1789020615250-R1789043295291	130.1000	130.1000	available	2026-09-10 12:28:15.291886	2026-09-10 12:28:15.291886
3603	41	PRD-1789027521976-R1789043336275	120.5000	120.5000	available	2026-09-10 12:28:56.277306	2026-09-10 12:28:56.277306
3604	41	PRD-1789027521976-R1789043336342	122.8000	122.8000	available	2026-09-10 12:28:56.344022	2026-09-10 12:28:56.344022
3605	41	PRD-1789027521976-R1789043336428	124.8000	124.8000	available	2026-09-10 12:28:56.429641	2026-09-10 12:28:56.429641
3606	41	PRD-1789027521976-R1789043336560	103.7000	103.7000	available	2026-09-10 12:28:56.566954	2026-09-10 12:28:56.566954
3607	41	PRD-1789027521976-R1789043336672	108.5000	108.5000	available	2026-09-10 12:28:56.674184	2026-09-10 12:28:56.674184
3608	41	PRD-1789027521976-R1789043336795	100.9000	100.9000	available	2026-09-10 12:28:56.800056	2026-09-10 12:28:56.800056
3609	41	PRD-1789027521976-R1789043336885	118.5000	118.5000	available	2026-09-10 12:28:56.887051	2026-09-10 12:28:56.887051
3610	41	PRD-1789027521976-R1789043336950	114.9000	114.9000	available	2026-09-10 12:28:56.951975	2026-09-10 12:28:56.951975
3611	41	PRD-1789027521976-R1789043337030	120.3000	120.3000	available	2026-09-10 12:28:57.032828	2026-09-10 12:28:57.032828
3612	41	PRD-1789027521976-R1789043337112	120.3000	120.3000	available	2026-09-10 12:28:57.116299	2026-09-10 12:28:57.116299
3613	1	PRD-1789017671180-R1789043493527	130.2000	130.2000	available	2026-09-10 12:31:33.528682	2026-09-10 12:31:33.528682
3614	1	PRD-1789017671180-R1789043493619	115.2000	115.2000	available	2026-09-10 12:31:33.621304	2026-09-10 12:31:33.621304
3615	1	PRD-1789017671180-R1789043493883	132.8000	132.8000	available	2026-09-10 12:31:33.885066	2026-09-10 12:31:33.885066
3616	1	PRD-1789017671180-R1789043493992	117.0000	117.0000	available	2026-09-10 12:31:33.994162	2026-09-10 12:31:33.994162
3617	1	PRD-1789017671180-R1789043494225	113.0000	113.0000	available	2026-09-10 12:31:34.22655	2026-09-10 12:31:34.22655
3618	55	PRD-1789032520852-R1789043511730	120.0000	120.0000	available	2026-09-10 12:31:51.731547	2026-09-10 12:31:51.731547
3619	67	PRD-1789037609658-R1789043525441	160.0000	160.0000	available	2026-09-10 12:32:05.442282	2026-09-10 12:32:05.442282
3620	17	PRD-1789018928535-R1789043544458	109.6000	109.6000	available	2026-09-10 12:32:24.459934	2026-09-10 12:32:24.459934
3621	62	PRD-1789034415962-R1789043562482	120.0000	120.0000	available	2026-09-10 12:32:42.483533	2026-09-10 12:32:42.483533
3622	62	PRD-1789034415962-R1789043562532	107.3000	107.3000	available	2026-09-10 12:32:42.543147	2026-09-10 12:32:42.543147
3623	62	PRD-1789034415962-R1789043562613	107.7000	107.7000	available	2026-09-10 12:32:42.617395	2026-09-10 12:32:42.617395
3624	42	PRD-1789027568425-R1789043593135	81.4000	81.4000	available	2026-09-10 12:33:13.136577	2026-09-10 12:33:13.136577
3625	18	PRD-1789018957547-R1789043604574	120.6000	120.6000	available	2026-09-10 12:33:24.575303	2026-09-10 12:33:24.575303
3626	71	PRD-1789043667717-R1789043753039	125.0000	125.0000	available	2026-09-10 12:35:53.040202	2026-09-10 12:35:53.040202
3627	71	PRD-1789043667717-R1789043753134	0.0000	0.0000	available	2026-09-10 12:35:53.135779	2026-09-10 12:35:53.135779
3628	71	PRD-1789043667717-R1789043753302	135.0000	135.0000	available	2026-09-10 12:35:53.303941	2026-09-10 12:35:53.303941
3629	71	PRD-1789043667717-R1789043753361	130.0000	130.0000	available	2026-09-10 12:35:53.361833	2026-09-10 12:35:53.361833
3630	71	PRD-1789043667717-R1789043753420	103.0000	103.0000	available	2026-09-10 12:35:53.422155	2026-09-10 12:35:53.422155
3631	71	PRD-1789043667717-R1789043753496	132.0000	132.0000	available	2026-09-10 12:35:53.498164	2026-09-10 12:35:53.498164
3632	71	PRD-1789043667717-R1789043753571	136.0000	136.0000	available	2026-09-10 12:35:53.572917	2026-09-10 12:35:53.572917
3633	71	PRD-1789043667717-R1789043753628	129.0000	129.0000	available	2026-09-10 12:35:53.630603	2026-09-10 12:35:53.630603
3634	71	PRD-1789043667717-R1789043753686	135.0000	135.0000	available	2026-09-10 12:35:53.687904	2026-09-10 12:35:53.687904
3635	71	PRD-1789043667717-R1789043753760	145.0000	145.0000	available	2026-09-10 12:35:53.762465	2026-09-10 12:35:53.762465
3636	71	PRD-1789043667717-R1789043753842	120.0000	120.0000	available	2026-09-10 12:35:53.843748	2026-09-10 12:35:53.843748
3637	71	PRD-1789043667717-R1789043753928	125.0000	125.0000	available	2026-09-10 12:35:53.930136	2026-09-10 12:35:53.930136
3638	71	PRD-1789043667717-R1789043754074	124.0000	124.0000	available	2026-09-10 12:35:54.079693	2026-09-10 12:35:54.079693
3639	71	PRD-1789043667717-R1789043754174	124.0000	124.0000	available	2026-09-10 12:35:54.175963	2026-09-10 12:35:54.175963
3640	71	PRD-1789043667717-R1789043754233	145.0000	145.0000	available	2026-09-10 12:35:54.234978	2026-09-10 12:35:54.234978
3641	71	PRD-1789043667717-R1789043754319	0.0000	0.0000	available	2026-09-10 12:35:54.323581	2026-09-10 12:35:54.323581
3642	71	PRD-1789043667717-R1789043754379	150.0000	150.0000	available	2026-09-10 12:35:54.380754	2026-09-10 12:35:54.380754
3643	71	PRD-1789043667717-R1789043754447	0.0000	0.0000	available	2026-09-10 12:35:54.448873	2026-09-10 12:35:54.448873
3644	71	PRD-1789043667717-R1789043754510	132.0000	132.0000	available	2026-09-10 12:35:54.511855	2026-09-10 12:35:54.511855
3645	72	PRD-1789043779630-R1789043787134	130.0000	130.0000	available	2026-09-10 12:36:27.136589	2026-09-10 12:36:27.136589
3646	50	PRD-1789028920266-R1789043949943	122.1000	122.1000	available	2026-09-10 12:39:09.944823	2026-09-10 12:39:09.944823
3647	50	PRD-1789028920266-R1789043950123	106.4000	106.4000	available	2026-09-10 12:39:10.124901	2026-09-10 12:39:10.124901
3648	50	PRD-1789028920266-R1789043950814	121.5000	121.5000	available	2026-09-10 12:39:10.815829	2026-09-10 12:39:10.815829
3649	50	PRD-1789028920266-R1789043950947	127.3000	127.3000	available	2026-09-10 12:39:10.948672	2026-09-10 12:39:10.948672
3650	50	PRD-1789028920266-R1789043951276	101.0000	101.0000	available	2026-09-10 12:39:11.280441	2026-09-10 12:39:11.280441
3651	50	PRD-1789028920266-R1789043951629	119.8000	119.8000	available	2026-09-10 12:39:11.632167	2026-09-10 12:39:11.632167
3652	50	PRD-1789028920266-R1789043951930	124.7000	124.7000	available	2026-09-10 12:39:11.932763	2026-09-10 12:39:11.932763
3653	50	PRD-1789028920266-R1789043952233	126.6000	126.6000	available	2026-09-10 12:39:12.238344	2026-09-10 12:39:12.238344
3654	50	PRD-1789028920266-R1789043952510	122.0000	122.0000	available	2026-09-10 12:39:12.512341	2026-09-10 12:39:12.512341
3655	50	PRD-1789028920266-R1789043952767	117.2000	117.2000	available	2026-09-10 12:39:12.769041	2026-09-10 12:39:12.769041
3656	50	PRD-1789028920266-R1789043953033	134.2000	134.2000	available	2026-09-10 12:39:13.035118	2026-09-10 12:39:13.035118
3657	50	PRD-1789028920266-R1789043953306	122.6000	122.6000	available	2026-09-10 12:39:13.307413	2026-09-10 12:39:13.307413
3658	50	PRD-1789028920266-R1789043953582	102.6000	102.6000	available	2026-09-10 12:39:13.583663	2026-09-10 12:39:13.583663
3659	50	PRD-1789028920266-R1789043953862	131.4000	131.4000	available	2026-09-10 12:39:13.863252	2026-09-10 12:39:13.863252
3660	50	PRD-1789028920266-R1789043954176	117.3000	117.3000	available	2026-09-10 12:39:14.177252	2026-09-10 12:39:14.177252
3663	50	PRD-1789028920266-R1789043955226	112.6000	112.6000	available	2026-09-10 12:39:15.228999	2026-09-10 12:39:15.228999
3666	50	PRD-1789028920266-R1789043956117	127.4000	127.4000	available	2026-09-10 12:39:16.118921	2026-09-10 12:39:16.118921
3671	50	PRD-1789028920266-R1789043957754	116.0000	116.0000	available	2026-09-10 12:39:17.755876	2026-09-10 12:39:17.755876
3674	50	PRD-1789028920266-R1789043958788	121.4000	121.4000	available	2026-09-10 12:39:18.789828	2026-09-10 12:39:18.789828
3677	50	PRD-1789028920266-R1789043959690	121.9000	121.9000	available	2026-09-10 12:39:19.692027	2026-09-10 12:39:19.692027
3680	50	PRD-1789028920266-R1789043960759	119.1000	119.1000	available	2026-09-10 12:39:20.760399	2026-09-10 12:39:20.760399
3683	50	PRD-1789028920266-R1789043961704	124.4000	124.4000	available	2026-09-10 12:39:21.705907	2026-09-10 12:39:21.705907
3685	50	PRD-1789028920266-R1789043962579	121.9000	121.9000	available	2026-09-10 12:39:22.581106	2026-09-10 12:39:22.581106
3688	50	PRD-1789028920266-R1789043963469	108.8000	108.8000	available	2026-09-10 12:39:23.474194	2026-09-10 12:39:23.474194
3691	50	PRD-1789028920266-R1789043964508	90.0000	90.0000	available	2026-09-10 12:39:24.509804	2026-09-10 12:39:24.509804
3694	50	PRD-1789028920266-R1789043965514	117.3000	117.3000	available	2026-09-10 12:39:25.515816	2026-09-10 12:39:25.515816
3697	50	PRD-1789028920266-R1789043966512	130.0000	130.0000	available	2026-09-10 12:39:26.513104	2026-09-10 12:39:26.513104
3701	50	PRD-1789028920266-R1789043967891	108.0000	108.0000	available	2026-09-10 12:39:27.892303	2026-09-10 12:39:27.892303
3661	50	PRD-1789028920266-R1789043954670	139.9000	139.9000	available	2026-09-10 12:39:14.672068	2026-09-10 12:39:14.672068
3664	50	PRD-1789028920266-R1789043955492	117.3000	117.3000	available	2026-09-10 12:39:15.494652	2026-09-10 12:39:15.494652
3667	50	PRD-1789028920266-R1789043956509	124.4000	124.4000	available	2026-09-10 12:39:16.511075	2026-09-10 12:39:16.511075
3670	50	PRD-1789028920266-R1789043957470	127.0000	127.0000	available	2026-09-10 12:39:17.471273	2026-09-10 12:39:17.471273
3673	50	PRD-1789028920266-R1789043958531	123.5000	123.5000	available	2026-09-10 12:39:18.533294	2026-09-10 12:39:18.533294
3676	50	PRD-1789028920266-R1789043959364	132.6000	132.6000	available	2026-09-10 12:39:19.365768	2026-09-10 12:39:19.365768
3679	50	PRD-1789028920266-R1789043960424	122.3000	122.3000	available	2026-09-10 12:39:20.4265	2026-09-10 12:39:20.4265
3681	50	PRD-1789028920266-R1789043961128	121.3000	121.3000	available	2026-09-10 12:39:21.130388	2026-09-10 12:39:21.130388
3684	50	PRD-1789028920266-R1789043962176	108.2000	108.2000	available	2026-09-10 12:39:22.177824	2026-09-10 12:39:22.177824
3686	50	PRD-1789028920266-R1789043962896	118.8000	118.8000	available	2026-09-10 12:39:22.898407	2026-09-10 12:39:22.898407
3689	50	PRD-1789028920266-R1789043963792	114.7000	114.7000	available	2026-09-10 12:39:23.794625	2026-09-10 12:39:23.794625
3692	50	PRD-1789028920266-R1789043964848	119.9000	119.9000	available	2026-09-10 12:39:24.849839	2026-09-10 12:39:24.849839
3693	50	PRD-1789028920266-R1789043965174	117.2000	117.2000	available	2026-09-10 12:39:25.175768	2026-09-10 12:39:25.175768
3696	50	PRD-1789028920266-R1789043966237	117.2000	117.2000	available	2026-09-10 12:39:26.238623	2026-09-10 12:39:26.238623
3699	50	PRD-1789028920266-R1789043967092	114.6000	114.6000	available	2026-09-10 12:39:27.093687	2026-09-10 12:39:27.093687
3700	50	PRD-1789028920266-R1789043967417	122.0000	122.0000	available	2026-09-10 12:39:27.41898	2026-09-10 12:39:27.41898
3703	50	PRD-1789028920266-R1789043968713	119.2000	119.2000	available	2026-09-10 12:39:28.714628	2026-09-10 12:39:28.714628
3662	50	PRD-1789028920266-R1789043954966	127.9000	127.9000	available	2026-09-10 12:39:14.967645	2026-09-10 12:39:14.967645
3665	50	PRD-1789028920266-R1789043955844	120.8000	120.8000	available	2026-09-10 12:39:15.846467	2026-09-10 12:39:15.846467
3668	50	PRD-1789028920266-R1789043956842	125.2000	125.2000	available	2026-09-10 12:39:16.844099	2026-09-10 12:39:16.844099
3669	50	PRD-1789028920266-R1789043957163	117.4000	117.4000	available	2026-09-10 12:39:17.164862	2026-09-10 12:39:17.164862
3672	50	PRD-1789028920266-R1789043958036	121.9000	121.9000	available	2026-09-10 12:39:18.037629	2026-09-10 12:39:18.037629
3675	50	PRD-1789028920266-R1789043959058	128.5000	128.5000	available	2026-09-10 12:39:19.059382	2026-09-10 12:39:19.059382
3678	50	PRD-1789028920266-R1789043959972	118.3000	118.3000	available	2026-09-10 12:39:19.973927	2026-09-10 12:39:19.973927
3682	50	PRD-1789028920266-R1789043961406	129.2000	129.2000	available	2026-09-10 12:39:21.407722	2026-09-10 12:39:21.407722
3687	50	PRD-1789028920266-R1789043963174	129.1000	129.1000	available	2026-09-10 12:39:23.176079	2026-09-10 12:39:23.176079
3690	50	PRD-1789028920266-R1789043964204	117.2000	117.2000	available	2026-09-10 12:39:24.205855	2026-09-10 12:39:24.205855
3695	50	PRD-1789028920266-R1789043965906	117.3000	117.3000	available	2026-09-10 12:39:25.906886	2026-09-10 12:39:25.906886
3698	50	PRD-1789028920266-R1789043966805	112.3000	112.3000	available	2026-09-10 12:39:26.806899	2026-09-10 12:39:26.806899
3702	50	PRD-1789028920266-R1789043968410	125.8000	125.8000	available	2026-09-10 12:39:28.411526	2026-09-10 12:39:28.411526
3704	36	PRD-1789025355244-R1789044125969	131.4000	131.4000	available	2026-09-10 12:42:05.970735	2026-09-10 12:42:05.970735
3705	36	PRD-1789025355244-R1789044126303	124.3000	124.3000	available	2026-09-10 12:42:06.306057	2026-09-10 12:42:06.306057
3706	36	PRD-1789025355244-R1789044126643	120.9000	120.9000	available	2026-09-10 12:42:06.648857	2026-09-10 12:42:06.648857
3707	36	PRD-1789025355244-R1789044126978	106.7000	106.7000	available	2026-09-10 12:42:06.980082	2026-09-10 12:42:06.980082
3708	36	PRD-1789025355244-R1789044127366	116.0000	116.0000	available	2026-09-10 12:42:07.369047	2026-09-10 12:42:07.369047
3709	36	PRD-1789025355244-R1789044127846	113.3000	113.3000	available	2026-09-10 12:42:07.847946	2026-09-10 12:42:07.847946
3710	36	PRD-1789025355244-R1789044128428	115.8000	115.8000	available	2026-09-10 12:42:08.430497	2026-09-10 12:42:08.430497
3711	36	PRD-1789025355244-R1789044128951	117.8000	117.8000	available	2026-09-10 12:42:08.960093	2026-09-10 12:42:08.960093
3712	36	PRD-1789025355244-R1789044129435	111.4000	111.4000	available	2026-09-10 12:42:09.439719	2026-09-10 12:42:09.439719
3713	36	PRD-1789025355244-R1789044129858	120.0000	120.0000	available	2026-09-10 12:42:09.859534	2026-09-10 12:42:09.859534
3714	36	PRD-1789025355244-R1789044130662	103.4000	103.4000	available	2026-09-10 12:42:10.663149	2026-09-10 12:42:10.663149
3715	36	PRD-1789025355244-R1789044131040	120.0000	120.0000	available	2026-09-10 12:42:11.047136	2026-09-10 12:42:11.047136
3716	36	PRD-1789025355244-R1789044131468	120.3000	120.3000	available	2026-09-10 12:42:11.469583	2026-09-10 12:42:11.469583
3717	36	PRD-1789025355244-R1789044131912	107.4000	107.4000	available	2026-09-10 12:42:11.91349	2026-09-10 12:42:11.91349
3718	20	PRD-1789019067284-R1789044143013	108.1000	108.1000	available	2026-09-10 12:42:23.014914	2026-09-10 12:42:23.014914
3719	68	PRD-1789037746694-R1789044178549	150.1000	150.1000	available	2026-09-10 12:42:58.550835	2026-09-10 12:42:58.550835
3720	68	PRD-1789037746694-R1789044178612	135.7000	135.7000	available	2026-09-10 12:42:58.616142	2026-09-10 12:42:58.616142
3721	68	PRD-1789037746694-R1789044178715	112.4000	112.4000	available	2026-09-10 12:42:58.719736	2026-09-10 12:42:58.719736
3722	68	PRD-1789037746694-R1789044178820	134.8000	134.8000	available	2026-09-10 12:42:58.821823	2026-09-10 12:42:58.821823
3723	68	PRD-1789037746694-R1789044178901	122.1000	122.1000	available	2026-09-10 12:42:58.903612	2026-09-10 12:42:58.903612
3724	68	PRD-1789037746694-R1789044179005	139.6000	139.6000	available	2026-09-10 12:42:59.007057	2026-09-10 12:42:59.007057
3725	68	PRD-1789037746694-R1789044179091	138.1000	138.1000	available	2026-09-10 12:42:59.10233	2026-09-10 12:42:59.10233
3726	68	PRD-1789037746694-R1789044179172	106.1000	106.1000	available	2026-09-10 12:42:59.173889	2026-09-10 12:42:59.173889
3727	68	PRD-1789037746694-R1789044179246	131.8000	131.8000	available	2026-09-10 12:42:59.248091	2026-09-10 12:42:59.248091
3728	68	PRD-1789037746694-R1789044179318	103.9000	103.9000	available	2026-09-10 12:42:59.320033	2026-09-10 12:42:59.320033
3729	68	PRD-1789037746694-R1789044179387	141.0000	141.0000	available	2026-09-10 12:42:59.389615	2026-09-10 12:42:59.389615
3730	68	PRD-1789037746694-R1789044179515	101.0000	101.0000	available	2026-09-10 12:42:59.516653	2026-09-10 12:42:59.516653
3731	68	PRD-1789037746694-R1789044179619	138.2000	138.2000	available	2026-09-10 12:42:59.621513	2026-09-10 12:42:59.621513
3732	68	PRD-1789037746694-R1789044179673	140.2000	140.2000	available	2026-09-10 12:42:59.675418	2026-09-10 12:42:59.675418
3733	50	PRD-1789028920266-R1789044223545	117.8000	117.8000	available	2026-09-10 12:43:43.546605	2026-09-10 12:43:43.546605
3734	50	PRD-1789028920266-R1789044223870	120.0000	120.0000	available	2026-09-10 12:43:43.871878	2026-09-10 12:43:43.871878
3735	50	PRD-1789028920266-R1789044224182	120.0000	120.0000	available	2026-09-10 12:43:44.193329	2026-09-10 12:43:44.193329
3736	50	PRD-1789028920266-R1789044224692	93.0000	93.0000	available	2026-09-10 12:43:44.701746	2026-09-10 12:43:44.701746
3737	50	PRD-1789028920266-R1789044225166	101.6000	101.6000	available	2026-09-10 12:43:45.170228	2026-09-10 12:43:45.170228
3738	50	PRD-1789028920266-R1789044225565	137.1000	137.1000	available	2026-09-10 12:43:45.566589	2026-09-10 12:43:45.566589
3739	50	PRD-1789028920266-R1789044226010	120.0000	120.0000	available	2026-09-10 12:43:46.011881	2026-09-10 12:43:46.011881
3740	50	PRD-1789028920266-R1789044226601	118.1000	118.1000	available	2026-09-10 12:43:46.603125	2026-09-10 12:43:46.603125
3741	50	PRD-1789028920266-R1789044226999	120.0000	120.0000	available	2026-09-10 12:43:47.009744	2026-09-10 12:43:47.009744
3742	50	PRD-1789028920266-R1789044227565	120.0000	120.0000	available	2026-09-10 12:43:47.567039	2026-09-10 12:43:47.567039
3743	50	PRD-1789028920266-R1789044228061	91.7000	91.7000	available	2026-09-10 12:43:48.062999	2026-09-10 12:43:48.062999
3744	50	PRD-1789028920266-R1789044228597	120.0000	120.0000	available	2026-09-10 12:43:48.598588	2026-09-10 12:43:48.598588
3745	50	PRD-1789028920266-R1789044228928	120.0000	120.0000	available	2026-09-10 12:43:48.931071	2026-09-10 12:43:48.931071
3746	50	PRD-1789028920266-R1789044229316	122.0000	122.0000	available	2026-09-10 12:43:49.317004	2026-09-10 12:43:49.317004
3747	50	PRD-1789028920266-R1789044229752	114.2000	114.2000	available	2026-09-10 12:43:49.753038	2026-09-10 12:43:49.753038
3748	50	PRD-1789028920266-R1789044230144	120.1000	120.1000	available	2026-09-10 12:43:50.145451	2026-09-10 12:43:50.145451
3749	50	PRD-1789028920266-R1789044230454	120.0000	120.0000	available	2026-09-10 12:43:50.458357	2026-09-10 12:43:50.458357
3750	50	PRD-1789028920266-R1789044230754	120.0000	120.0000	available	2026-09-10 12:43:50.756713	2026-09-10 12:43:50.756713
3751	50	PRD-1789028920266-R1789044231068	120.2000	120.2000	available	2026-09-10 12:43:51.073834	2026-09-10 12:43:51.073834
3752	58	PRD-1789033578183-R1789044270829	106.2000	106.2000	available	2026-09-10 12:44:30.831541	2026-09-10 12:44:30.831541
3753	58	PRD-1789033578183-R1789044271661	127.8000	127.8000	available	2026-09-10 12:44:31.662561	2026-09-10 12:44:31.662561
3754	58	PRD-1789033578183-R1789044271955	107.4000	107.4000	available	2026-09-10 12:44:31.956314	2026-09-10 12:44:31.956314
3755	58	PRD-1789033578183-R1789044272267	110.8000	110.8000	available	2026-09-10 12:44:32.268946	2026-09-10 12:44:32.268946
3756	58	PRD-1789033578183-R1789044272573	110.4000	110.4000	available	2026-09-10 12:44:32.574173	2026-09-10 12:44:32.574173
3757	58	PRD-1789033578183-R1789044272942	121.0000	121.0000	available	2026-09-10 12:44:32.945588	2026-09-10 12:44:32.945588
3758	58	PRD-1789033578183-R1789044273260	109.6000	109.6000	available	2026-09-10 12:44:33.261499	2026-09-10 12:44:33.261499
3759	58	PRD-1789033578183-R1789044273593	123.8000	123.8000	available	2026-09-10 12:44:33.598364	2026-09-10 12:44:33.598364
3760	58	PRD-1789033578183-R1789044273918	116.2000	116.2000	available	2026-09-10 12:44:33.919744	2026-09-10 12:44:33.919744
3761	24	PRD-1789020615250-R1789044298283	123.8000	123.8000	available	2026-09-10 12:44:58.284848	2026-09-10 12:44:58.284848
3762	24	PRD-1789020615250-R1789044298580	122.5000	122.5000	available	2026-09-10 12:44:58.58232	2026-09-10 12:44:58.58232
3763	24	PRD-1789020615250-R1789044298894	127.5000	127.5000	available	2026-09-10 12:44:58.894959	2026-09-10 12:44:58.894959
3764	7	PRD-1789018404302-R1789044327209	140.8000	140.8000	available	2026-09-10 12:45:27.211301	2026-09-10 12:45:27.211301
3765	7	PRD-1789018404302-R1789044327517	109.5000	109.5000	available	2026-09-10 12:45:27.518688	2026-09-10 12:45:27.518688
3766	7	PRD-1789018404302-R1789044327824	120.3000	120.3000	available	2026-09-10 12:45:27.825583	2026-09-10 12:45:27.825583
3767	1	PRD-1789017671180-R1789044348836	113.7000	113.7000	available	2026-09-10 12:45:48.837798	2026-09-10 12:45:48.837798
3768	1	PRD-1789017671180-R1789044349124	100.6000	100.6000	available	2026-09-10 12:45:49.125494	2026-09-10 12:45:49.125494
3769	51	PRD-1789029511477-R1789044402242	120.0000	120.0000	available	2026-09-10 12:46:42.244133	2026-09-10 12:46:42.244133
3770	51	PRD-1789029511477-R1789044402587	138.1000	138.1000	available	2026-09-10 12:46:42.588098	2026-09-10 12:46:42.588098
3771	51	PRD-1789029511477-R1789044402871	120.0000	120.0000	available	2026-09-10 12:46:42.87264	2026-09-10 12:46:42.87264
3772	51	PRD-1789029511477-R1789044403185	137.0000	137.0000	available	2026-09-10 12:46:43.187158	2026-09-10 12:46:43.187158
3773	51	PRD-1789029511477-R1789044403549	120.0000	120.0000	available	2026-09-10 12:46:43.550744	2026-09-10 12:46:43.550744
3774	12	PRD-1789018691298-R1789044418037	121.4000	121.4000	available	2026-09-10 12:46:58.039055	2026-09-10 12:46:58.039055
3775	13	PRD-1789018725877-R1789044435150	120.2000	120.2000	available	2026-09-10 12:47:15.153575	2026-09-10 12:47:15.153575
3776	13	PRD-1789018725877-R1789044979601	116.7000	116.7000	available	2026-09-10 12:56:19.603066	2026-09-10 12:56:19.603066
3777	13	PRD-1789018725877-R1789044979979	116.2000	116.2000	available	2026-09-10 12:56:19.980439	2026-09-10 12:56:19.980439
3778	13	PRD-1789018725877-R1789044980361	130.0000	130.0000	available	2026-09-10 12:56:20.362717	2026-09-10 12:56:20.362717
3779	13	PRD-1789018725877-R1789044980751	109.6000	109.6000	available	2026-09-10 12:56:20.757016	2026-09-10 12:56:20.757016
3780	13	PRD-1789018725877-R1789044981684	115.5000	115.5000	available	2026-09-10 12:56:21.685736	2026-09-10 12:56:21.685736
3781	13	PRD-1789018725877-R1789044982090	103.5000	103.5000	available	2026-09-10 12:56:22.097072	2026-09-10 12:56:22.097072
3782	13	PRD-1789018725877-R1789044982570	118.0000	118.0000	available	2026-09-10 12:56:22.574958	2026-09-10 12:56:22.574958
3783	13	PRD-1789018725877-R1789044982941	128.5000	128.5000	available	2026-09-10 12:56:22.944808	2026-09-10 12:56:22.944808
3784	13	PRD-1789018725877-R1789044983306	120.0000	120.0000	available	2026-09-10 12:56:23.307838	2026-09-10 12:56:23.307838
3785	13	PRD-1789018725877-R1789044983640	120.0000	120.0000	available	2026-09-10 12:56:23.642766	2026-09-10 12:56:23.642766
3786	13	PRD-1789018725877-R1789044983969	118.2000	118.2000	available	2026-09-10 12:56:23.970824	2026-09-10 12:56:23.970824
3787	13	PRD-1789018725877-R1789044984375	117.8000	117.8000	available	2026-09-10 12:56:24.37648	2026-09-10 12:56:24.37648
3788	13	PRD-1789018725877-R1789044984717	126.8000	126.8000	available	2026-09-10 12:56:24.720646	2026-09-10 12:56:24.720646
3789	13	PRD-1789018725877-R1789044985080	118.0000	118.0000	available	2026-09-10 12:56:25.088815	2026-09-10 12:56:25.088815
3790	13	PRD-1789018725877-R1789044985462	120.0000	120.0000	available	2026-09-10 12:56:25.463859	2026-09-10 12:56:25.463859
3791	13	PRD-1789018725877-R1789044985994	128.7000	128.7000	available	2026-09-10 12:56:25.995829	2026-09-10 12:56:25.995829
3792	13	PRD-1789018725877-R1789044986469	128.7000	128.7000	available	2026-09-10 12:56:26.47015	2026-09-10 12:56:26.47015
3793	13	PRD-1789018725877-R1789044986828	121.3000	121.3000	available	2026-09-10 12:56:26.829396	2026-09-10 12:56:26.829396
3794	13	PRD-1789018725877-R1789044987223	118.0000	118.0000	available	2026-09-10 12:56:27.224467	2026-09-10 12:56:27.224467
3795	13	PRD-1789018725877-R1789044987861	107.1000	107.1000	available	2026-09-10 12:56:27.864096	2026-09-10 12:56:27.864096
3796	13	PRD-1789018725877-R1789044988226	120.0000	120.0000	available	2026-09-10 12:56:28.227267	2026-09-10 12:56:28.227267
3797	13	PRD-1789018725877-R1789044989118	120.2000	120.2000	available	2026-09-10 12:56:29.121321	2026-09-10 12:56:29.121321
3798	13	PRD-1789018725877-R1789044989503	120.2000	120.2000	available	2026-09-10 12:56:29.504798	2026-09-10 12:56:29.504798
3799	13	PRD-1789018725877-R1789044989870	136.3000	136.3000	available	2026-09-10 12:56:29.872479	2026-09-10 12:56:29.872479
3800	13	PRD-1789018725877-R1789044990244	120.0000	120.0000	available	2026-09-10 12:56:30.245655	2026-09-10 12:56:30.245655
3801	13	PRD-1789018725877-R1789044990612	121.1000	121.1000	available	2026-09-10 12:56:30.613752	2026-09-10 12:56:30.613752
3802	13	PRD-1789018725877-R1789044991045	117.9000	117.9000	available	2026-09-10 12:56:31.046529	2026-09-10 12:56:31.046529
3803	13	PRD-1789018725877-R1789044991698	112.5000	112.5000	available	2026-09-10 12:56:31.69935	2026-09-10 12:56:31.69935
3804	13	PRD-1789018725877-R1789044992175	127.7000	127.7000	available	2026-09-10 12:56:32.176629	2026-09-10 12:56:32.176629
3805	13	PRD-1789018725877-R1789044992547	118.8000	118.8000	available	2026-09-10 12:56:32.548544	2026-09-10 12:56:32.548544
3806	13	PRD-1789018725877-R1789044992894	120.0000	120.0000	available	2026-09-10 12:56:32.895318	2026-09-10 12:56:32.895318
3807	13	PRD-1789018725877-R1789044993314	118.0000	118.0000	available	2026-09-10 12:56:33.316171	2026-09-10 12:56:33.316171
3808	13	PRD-1789018725877-R1789044993678	116.6000	116.6000	available	2026-09-10 12:56:33.67976	2026-09-10 12:56:33.67976
3809	13	PRD-1789018725877-R1789044994118	131.4000	131.4000	available	2026-09-10 12:56:34.119744	2026-09-10 12:56:34.119744
3810	13	PRD-1789018725877-R1789044994498	120.2000	120.2000	available	2026-09-10 12:56:34.500533	2026-09-10 12:56:34.500533
3811	13	PRD-1789018725877-R1789044994871	120.8000	120.8000	available	2026-09-10 12:56:34.87277	2026-09-10 12:56:34.87277
3812	13	PRD-1789018725877-R1789044995487	116.2000	116.2000	available	2026-09-10 12:56:35.487819	2026-09-10 12:56:35.487819
3813	13	PRD-1789018725877-R1789044996058	121.3000	121.3000	available	2026-09-10 12:56:36.059482	2026-09-10 12:56:36.059482
3814	13	PRD-1789018725877-R1789044997479	122.3000	122.3000	available	2026-09-10 12:56:37.482718	2026-09-10 12:56:37.482718
3815	13	PRD-1789018725877-R1789044998269	133.0000	133.0000	available	2026-09-10 12:56:38.272667	2026-09-10 12:56:38.272667
3816	13	PRD-1789018725877-R1789045004071	125.0000	125.0000	available	2026-09-10 12:56:44.072158	2026-09-10 12:56:44.072158
3817	13	PRD-1789018725877-R1789045004931	96.6000	96.6000	available	2026-09-10 12:56:44.934528	2026-09-10 12:56:44.934528
3818	13	PRD-1789018725877-R1789045006163	119.0000	119.0000	available	2026-09-10 12:56:46.165455	2026-09-10 12:56:46.165455
3819	13	PRD-1789018725877-R1789045006644	124.5000	124.5000	available	2026-09-10 12:56:46.646191	2026-09-10 12:56:46.646191
3820	13	PRD-1789018725877-R1789045007442	123.2000	123.2000	available	2026-09-10 12:56:47.446698	2026-09-10 12:56:47.446698
3821	13	PRD-1789018725877-R1789045008492	106.2000	106.2000	available	2026-09-10 12:56:48.493557	2026-09-10 12:56:48.493557
3822	13	PRD-1789018725877-R1789045009329	123.9000	123.9000	available	2026-09-10 12:56:49.331606	2026-09-10 12:56:49.331606
3823	13	PRD-1789018725877-R1789045010757	124.9000	124.9000	available	2026-09-10 12:56:50.758801	2026-09-10 12:56:50.758801
3824	13	PRD-1789018725877-R1789045012875	125.4000	125.4000	available	2026-09-10 12:56:52.87634	2026-09-10 12:56:52.87634
3825	13	PRD-1789018725877-R1789045014059	120.0000	120.0000	available	2026-09-10 12:56:54.060899	2026-09-10 12:56:54.060899
3826	13	PRD-1789018725877-R1789045014472	119.5000	119.5000	available	2026-09-10 12:56:54.474495	2026-09-10 12:56:54.474495
3827	13	PRD-1789018725877-R1789045014976	133.8000	133.8000	available	2026-09-10 12:56:54.979422	2026-09-10 12:56:54.979422
3828	13	PRD-1789018725877-R1789045017381	119.0000	119.0000	available	2026-09-10 12:56:57.383657	2026-09-10 12:56:57.383657
3829	2	PRD-1789018062554-R1789045192749	110.2000	110.2000	available	2026-09-10 12:59:52.752288	2026-09-10 12:59:52.752288
3830	2	PRD-1789018062554-R1789045193098	111.2000	111.2000	available	2026-09-10 12:59:53.099487	2026-09-10 12:59:53.099487
3831	2	PRD-1789018062554-R1789045193750	116.6000	116.6000	available	2026-09-10 12:59:53.751334	2026-09-10 12:59:53.751334
3832	2	PRD-1789018062554-R1789045194220	129.5000	129.5000	available	2026-09-10 12:59:54.221601	2026-09-10 12:59:54.221601
3833	2	PRD-1789018062554-R1789045194589	114.5000	114.5000	available	2026-09-10 12:59:54.590612	2026-09-10 12:59:54.590612
3834	6	PRD-1789018369136-R1789045261075	116.0000	116.0000	available	2026-09-10 13:01:01.077154	2026-09-10 13:01:01.077154
3835	6	PRD-1789018369136-R1789045261481	127.6000	127.6000	available	2026-09-10 13:01:01.482119	2026-09-10 13:01:01.482119
3836	6	PRD-1789018369136-R1789045261843	112.0000	112.0000	available	2026-09-10 13:01:01.844855	2026-09-10 13:01:01.844855
3837	6	PRD-1789018369136-R1789045262213	116.3000	116.3000	available	2026-09-10 13:01:02.21415	2026-09-10 13:01:02.21415
3838	6	PRD-1789018369136-R1789045262555	110.0000	110.0000	available	2026-09-10 13:01:02.556758	2026-09-10 13:01:02.556758
3839	6	PRD-1789018369136-R1789045262914	107.0000	107.0000	available	2026-09-10 13:01:02.915771	2026-09-10 13:01:02.915771
3840	6	PRD-1789018369136-R1789045263330	100.0000	100.0000	available	2026-09-10 13:01:03.331295	2026-09-10 13:01:03.331295
3841	6	PRD-1789018369136-R1789045263719	110.2000	110.2000	available	2026-09-10 13:01:03.721863	2026-09-10 13:01:03.721863
3842	6	PRD-1789018369136-R1789045264053	112.4000	112.4000	available	2026-09-10 13:01:04.054907	2026-09-10 13:01:04.054907
3843	6	PRD-1789018369136-R1789045264893	123.9000	123.9000	available	2026-09-10 13:01:04.894623	2026-09-10 13:01:04.894623
3844	6	PRD-1789018369136-R1789045265216	112.4000	112.4000	available	2026-09-10 13:01:05.217792	2026-09-10 13:01:05.217792
3845	6	PRD-1789018369136-R1789045265582	99.7000	99.7000	available	2026-09-10 13:01:05.583759	2026-09-10 13:01:05.583759
3846	6	PRD-1789018369136-R1789045265951	111.6000	111.6000	available	2026-09-10 13:01:05.95287	2026-09-10 13:01:05.95287
3847	6	PRD-1789018369136-R1789045266338	112.7000	112.7000	available	2026-09-10 13:01:06.339215	2026-09-10 13:01:06.339215
3848	6	PRD-1789018369136-R1789045266710	107.5000	107.5000	available	2026-09-10 13:01:06.712132	2026-09-10 13:01:06.712132
3849	6	PRD-1789018369136-R1789045267060	114.1000	114.1000	available	2026-09-10 13:01:07.062446	2026-09-10 13:01:07.062446
3850	6	PRD-1789018369136-R1789045267380	113.8000	113.8000	available	2026-09-10 13:01:07.381841	2026-09-10 13:01:07.381841
3851	11	PRD-1789018656012-R1789045289233	117.9000	117.9000	available	2026-09-10 13:01:29.235194	2026-09-10 13:01:29.235194
3852	11	PRD-1789018656012-R1789045289585	114.2000	114.2000	available	2026-09-10 13:01:29.586818	2026-09-10 13:01:29.586818
3853	11	PRD-1789018656012-R1789045289975	114.0000	114.0000	available	2026-09-10 13:01:29.976699	2026-09-10 13:01:29.976699
3854	11	PRD-1789018656012-R1789045290481	110.0000	110.0000	available	2026-09-10 13:01:30.483222	2026-09-10 13:01:30.483222
3855	11	PRD-1789018656012-R1789045291221	113.3000	113.3000	available	2026-09-10 13:01:31.222603	2026-09-10 13:01:31.222603
3856	40	PRD-1789027496659-R1789045334579	111.7000	111.7000	available	2026-09-10 13:02:14.580863	2026-09-10 13:02:14.580863
3857	40	PRD-1789027496659-R1789045334940	114.9000	114.9000	available	2026-09-10 13:02:14.941771	2026-09-10 13:02:14.941771
3858	40	PRD-1789027496659-R1789045335327	115.9000	115.9000	available	2026-09-10 13:02:15.328377	2026-09-10 13:02:15.328377
3859	40	PRD-1789027496659-R1789045335818	111.8000	111.8000	available	2026-09-10 13:02:15.819518	2026-09-10 13:02:15.819518
3860	40	PRD-1789027496659-R1789045336153	112.5000	112.5000	available	2026-09-10 13:02:16.155106	2026-09-10 13:02:16.155106
3861	40	PRD-1789027496659-R1789045337387	117.3000	117.3000	available	2026-09-10 13:02:17.390122	2026-09-10 13:02:17.390122
3862	40	PRD-1789027496659-R1789045338154	99.5000	99.5000	available	2026-09-10 13:02:18.155546	2026-09-10 13:02:18.155546
3863	40	PRD-1789027496659-R1789045338479	115.8000	115.8000	available	2026-09-10 13:02:18.480276	2026-09-10 13:02:18.480276
3864	57	PRD-1789033528219-R1789045367767	102.0000	102.0000	available	2026-09-10 13:02:47.768867	2026-09-10 13:02:47.768867
3865	57	PRD-1789033528219-R1789045368179	116.0000	116.0000	available	2026-09-10 13:02:48.18042	2026-09-10 13:02:48.18042
3866	57	PRD-1789033528219-R1789045368557	115.9000	115.9000	available	2026-09-10 13:02:48.559548	2026-09-10 13:02:48.559548
3867	57	PRD-1789033528219-R1789045368922	120.0000	120.0000	available	2026-09-10 13:02:48.924243	2026-09-10 13:02:48.924243
3868	8	PRD-1789018442925-R1789045390281	120.0000	120.0000	available	2026-09-10 13:03:10.28345	2026-09-10 13:03:10.28345
3869	8	PRD-1789018442925-R1789045391193	122.2000	122.2000	available	2026-09-10 13:03:11.19422	2026-09-10 13:03:11.19422
3870	1	PRD-1789017671180-R1789045418365	154.0000	154.0000	available	2026-09-10 13:03:38.367428	2026-09-10 13:03:38.367428
3871	17	PRD-1789018928535-R1789045478351	101.6000	101.6000	available	2026-09-10 13:04:38.352025	2026-09-10 13:04:38.352025
3872	17	PRD-1789018928535-R1789045478515	118.3000	118.3000	available	2026-09-10 13:04:38.517048	2026-09-10 13:04:38.517048
3873	17	PRD-1789018928535-R1789045478619	101.3000	101.3000	available	2026-09-10 13:04:38.620292	2026-09-10 13:04:38.620292
3874	17	PRD-1789018928535-R1789045478725	119.4000	119.4000	available	2026-09-10 13:04:38.72675	2026-09-10 13:04:38.72675
3875	1	PRD-1789017671180-R1789045557583	120.5000	120.5000	available	2026-09-10 13:05:57.584398	2026-09-10 13:05:57.584398
3876	1	PRD-1789017671180-R1789045558601	138.1000	138.1000	available	2026-09-10 13:05:58.602808	2026-09-10 13:05:58.602808
3877	1	PRD-1789017671180-R1789045624534	120.8000	120.8000	available	2026-09-10 13:07:04.535281	2026-09-10 13:07:04.535281
3878	1	PRD-1789017671180-R1789045624657	120.4000	120.4000	available	2026-09-10 13:07:04.659149	2026-09-10 13:07:04.659149
3879	1	PRD-1789017671180-R1789045624821	0.0000	0.0000	available	2026-09-10 13:07:04.823212	2026-09-10 13:07:04.823212
3880	1	PRD-1789017671180-R1789045625005	145.0000	145.0000	available	2026-09-10 13:07:05.006956	2026-09-10 13:07:05.006956
3881	1	PRD-1789017671180-R1789045625160	150.0000	150.0000	available	2026-09-10 13:07:05.16132	2026-09-10 13:07:05.16132
3882	1	PRD-1789017671180-R1789045625360	152.0000	152.0000	available	2026-09-10 13:07:05.362752	2026-09-10 13:07:05.362752
3883	1	PRD-1789017671180-R1789045625516	0.0000	0.0000	available	2026-09-10 13:07:05.517993	2026-09-10 13:07:05.517993
3884	1	PRD-1789017671180-R1789045625670	0.0000	0.0000	available	2026-09-10 13:07:05.671561	2026-09-10 13:07:05.671561
3885	1	PRD-1789017671180-R1789045625860	0.0000	0.0000	available	2026-09-10 13:07:05.863026	2026-09-10 13:07:05.863026
3886	1	PRD-1789017671180-R1789045626052	153.0000	153.0000	available	2026-09-10 13:07:06.056924	2026-09-10 13:07:06.056924
3887	1	PRD-1789017671180-R1789045626205	0.0000	0.0000	available	2026-09-10 13:07:06.206529	2026-09-10 13:07:06.206529
3888	1	PRD-1789017671180-R1789045626365	152.0000	152.0000	available	2026-09-10 13:07:06.366615	2026-09-10 13:07:06.366615
3889	1	PRD-1789017671180-R1789045626554	95.0000	95.0000	available	2026-09-10 13:07:06.556132	2026-09-10 13:07:06.556132
3890	1	PRD-1789017671180-R1789045626727	0.0000	0.0000	available	2026-09-10 13:07:06.728586	2026-09-10 13:07:06.728586
3891	1	PRD-1789017671180-R1789045626857	154.0000	154.0000	available	2026-09-10 13:07:06.859468	2026-09-10 13:07:06.859468
3892	1	PRD-1789017671180-R1789045627025	0.0000	0.0000	available	2026-09-10 13:07:07.026657	2026-09-10 13:07:07.026657
3893	11	PRD-1789018656012-R1789045647123	114.4000	114.4000	available	2026-09-10 13:07:27.126129	2026-09-10 13:07:27.126129
3894	40	PRD-1789027496659-R1789045662563	123.7000	123.7000	available	2026-09-10 13:07:42.564646	2026-09-10 13:07:42.564646
3895	15	PRD-1789018843399-R1789045684977	120.0000	120.0000	available	2026-09-10 13:08:04.977943	2026-09-10 13:08:04.977943
3896	57	PRD-1789033528219-R1789045729905	116.0000	116.0000	available	2026-09-10 13:08:49.908959	2026-09-10 13:08:49.908959
3897	57	PRD-1789033528219-R1789045730075	114.0000	114.0000	available	2026-09-10 13:08:50.076045	2026-09-10 13:08:50.076045
3898	57	PRD-1789033528219-R1789045730467	115.6000	115.6000	available	2026-09-10 13:08:50.468808	2026-09-10 13:08:50.468808
3899	57	PRD-1789033528219-R1789045730798	112.7000	112.7000	available	2026-09-10 13:08:50.799808	2026-09-10 13:08:50.799808
3900	57	PRD-1789033528219-R1789045730931	84.2000	84.2000	available	2026-09-10 13:08:50.932847	2026-09-10 13:08:50.932847
3901	57	PRD-1789033528219-R1789045731085	126.8000	126.8000	available	2026-09-10 13:08:51.086579	2026-09-10 13:08:51.086579
3902	57	PRD-1789033528219-R1789045731200	115.8000	115.8000	available	2026-09-10 13:08:51.201515	2026-09-10 13:08:51.201515
3903	57	PRD-1789033528219-R1789045731321	102.1000	102.1000	available	2026-09-10 13:08:51.322399	2026-09-10 13:08:51.322399
3904	57	PRD-1789033528219-R1789045731425	115.3000	115.3000	available	2026-09-10 13:08:51.426729	2026-09-10 13:08:51.426729
3905	57	PRD-1789033528219-R1789045731536	117.4000	117.4000	available	2026-09-10 13:08:51.538323	2026-09-10 13:08:51.538323
3906	6	PRD-1789018369136-R1789045743734	119.3000	119.3000	available	2026-09-10 13:09:03.735733	2026-09-10 13:09:03.735733
3907	73	PRD-1789045777628-R1789046062043	120.8000	120.8000	available	2026-09-10 13:14:22.04581	2026-09-10 13:14:22.04581
3908	73	PRD-1789045777628-R1789046062231	111.9000	111.9000	available	2026-09-10 13:14:22.232523	2026-09-10 13:14:22.232523
3909	73	PRD-1789045777628-R1789046062353	112.0000	112.0000	available	2026-09-10 13:14:22.353985	2026-09-10 13:14:22.353985
3910	73	PRD-1789045777628-R1789046062481	111.9000	111.9000	available	2026-09-10 13:14:22.482151	2026-09-10 13:14:22.482151
3911	73	PRD-1789045777628-R1789046062606	115.2000	115.2000	available	2026-09-10 13:14:22.609086	2026-09-10 13:14:22.609086
3912	73	PRD-1789045777628-R1789046062744	114.4000	114.4000	available	2026-09-10 13:14:22.746029	2026-09-10 13:14:22.746029
3913	73	PRD-1789045777628-R1789046062862	107.6000	107.6000	available	2026-09-10 13:14:22.866085	2026-09-10 13:14:22.866085
3914	73	PRD-1789045777628-R1789046062962	115.2000	115.2000	available	2026-09-10 13:14:22.963789	2026-09-10 13:14:22.963789
3915	73	PRD-1789045777628-R1789046063083	118.0000	118.0000	available	2026-09-10 13:14:23.085134	2026-09-10 13:14:23.085134
3916	73	PRD-1789045777628-R1789046063205	104.1000	104.1000	available	2026-09-10 13:14:23.206685	2026-09-10 13:14:23.206685
3917	73	PRD-1789045777628-R1789046063356	112.5000	112.5000	available	2026-09-10 13:14:23.357735	2026-09-10 13:14:23.357735
3918	73	PRD-1789045777628-R1789046063465	108.7000	108.7000	available	2026-09-10 13:14:23.46667	2026-09-10 13:14:23.46667
3919	73	PRD-1789045777628-R1789046063582	111.0000	111.0000	available	2026-09-10 13:14:23.583824	2026-09-10 13:14:23.583824
3920	73	PRD-1789045777628-R1789046063696	111.9000	111.9000	available	2026-09-10 13:14:23.699526	2026-09-10 13:14:23.699526
3921	73	PRD-1789045777628-R1789046063817	116.2000	116.2000	available	2026-09-10 13:14:23.818379	2026-09-10 13:14:23.818379
3922	73	PRD-1789045777628-R1789046063946	112.3000	112.3000	available	2026-09-10 13:14:23.9476	2026-09-10 13:14:23.9476
3923	73	PRD-1789045777628-R1789046064042	115.5000	115.5000	available	2026-09-10 13:14:24.043186	2026-09-10 13:14:24.043186
3924	73	PRD-1789045777628-R1789046064183	120.9000	120.9000	available	2026-09-10 13:14:24.185525	2026-09-10 13:14:24.185525
3925	73	PRD-1789045777628-R1789046064318	114.8000	114.8000	available	2026-09-10 13:14:24.320195	2026-09-10 13:14:24.320195
3926	73	PRD-1789045777628-R1789046064409	115.9000	115.9000	available	2026-09-10 13:14:24.410351	2026-09-10 13:14:24.410351
3927	73	PRD-1789045777628-R1789046064547	121.2000	121.2000	available	2026-09-10 13:14:24.548395	2026-09-10 13:14:24.548395
3928	73	PRD-1789045777628-R1789046064655	115.1000	115.1000	available	2026-09-10 13:14:24.656871	2026-09-10 13:14:24.656871
3929	73	PRD-1789045777628-R1789046064771	114.8000	114.8000	available	2026-09-10 13:14:24.775271	2026-09-10 13:14:24.775271
3930	73	PRD-1789045777628-R1789046064913	115.0000	115.0000	available	2026-09-10 13:14:24.914351	2026-09-10 13:14:24.914351
3931	73	PRD-1789045777628-R1789046065057	97.9000	97.9000	available	2026-09-10 13:14:25.057993	2026-09-10 13:14:25.057993
3932	73	PRD-1789045777628-R1789046065194	102.3000	102.3000	available	2026-09-10 13:14:25.195938	2026-09-10 13:14:25.195938
3933	73	PRD-1789045777628-R1789046065338	114.2000	114.2000	available	2026-09-10 13:14:25.338808	2026-09-10 13:14:25.338808
3934	73	PRD-1789045777628-R1789046065467	113.0000	113.0000	available	2026-09-10 13:14:25.467847	2026-09-10 13:14:25.467847
3935	73	PRD-1789045777628-R1789046065591	118.5000	118.5000	available	2026-09-10 13:14:25.59228	2026-09-10 13:14:25.59228
3936	73	PRD-1789045777628-R1789046065754	119.5000	119.5000	available	2026-09-10 13:14:25.755612	2026-09-10 13:14:25.755612
3937	73	PRD-1789045777628-R1789046065890	115.0000	115.0000	available	2026-09-10 13:14:25.891615	2026-09-10 13:14:25.891615
3938	73	PRD-1789045777628-R1789046065998	115.8000	115.8000	available	2026-09-10 13:14:25.999849	2026-09-10 13:14:25.999849
3939	73	PRD-1789045777628-R1789046067524	119.0000	119.0000	available	2026-09-10 13:14:27.525509	2026-09-10 13:14:27.525509
3940	73	PRD-1789045777628-R1789046067642	115.8000	115.8000	available	2026-09-10 13:14:27.643972	2026-09-10 13:14:27.643972
3941	73	PRD-1789045777628-R1789046067781	119.0000	119.0000	available	2026-09-10 13:14:27.781955	2026-09-10 13:14:27.781955
3942	73	PRD-1789045777628-R1789046067911	117.0000	117.0000	available	2026-09-10 13:14:27.912671	2026-09-10 13:14:27.912671
3943	73	PRD-1789045777628-R1789046068051	113.4000	113.4000	available	2026-09-10 13:14:28.05261	2026-09-10 13:14:28.05261
3944	73	PRD-1789045777628-R1789046068163	112.6000	112.6000	available	2026-09-10 13:14:28.164586	2026-09-10 13:14:28.164586
3945	73	PRD-1789045777628-R1789046068292	111.5000	111.5000	available	2026-09-10 13:14:28.293656	2026-09-10 13:14:28.293656
3946	73	PRD-1789045777628-R1789046068419	113.5000	113.5000	available	2026-09-10 13:14:28.420151	2026-09-10 13:14:28.420151
3947	73	PRD-1789045777628-R1789046068561	118.1000	118.1000	available	2026-09-10 13:14:28.564572	2026-09-10 13:14:28.564572
3948	73	PRD-1789045777628-R1789046068675	101.8000	101.8000	available	2026-09-10 13:14:28.676586	2026-09-10 13:14:28.676586
3949	73	PRD-1789045777628-R1789046068807	118.9000	118.9000	available	2026-09-10 13:14:28.808309	2026-09-10 13:14:28.808309
3950	73	PRD-1789045777628-R1789046068949	112.8000	112.8000	available	2026-09-10 13:14:28.950455	2026-09-10 13:14:28.950455
3951	73	PRD-1789045777628-R1789046069097	114.7000	114.7000	available	2026-09-10 13:14:29.098586	2026-09-10 13:14:29.098586
3952	73	PRD-1789045777628-R1789046069228	113.6000	113.6000	available	2026-09-10 13:14:29.229772	2026-09-10 13:14:29.229772
3953	73	PRD-1789045777628-R1789046069354	111.8000	111.8000	available	2026-09-10 13:14:29.355482	2026-09-10 13:14:29.355482
3954	73	PRD-1789045777628-R1789046069479	116.0000	116.0000	available	2026-09-10 13:14:29.481243	2026-09-10 13:14:29.481243
3955	73	PRD-1789045777628-R1789046069606	112.4000	112.4000	available	2026-09-10 13:14:29.607813	2026-09-10 13:14:29.607813
3956	73	PRD-1789045777628-R1789046069733	115.1000	115.1000	available	2026-09-10 13:14:29.734292	2026-09-10 13:14:29.734292
3957	73	PRD-1789045777628-R1789046069844	85.2000	85.2000	available	2026-09-10 13:14:29.846861	2026-09-10 13:14:29.846861
3958	73	PRD-1789045777628-R1789046069970	110.4000	110.4000	available	2026-09-10 13:14:29.971832	2026-09-10 13:14:29.971832
3959	73	PRD-1789045777628-R1789046070099	114.6000	114.6000	available	2026-09-10 13:14:30.100375	2026-09-10 13:14:30.100375
3960	73	PRD-1789045777628-R1789046070238	110.2000	110.2000	available	2026-09-10 13:14:30.23916	2026-09-10 13:14:30.23916
3961	73	PRD-1789045777628-R1789046070358	110.9000	110.9000	available	2026-09-10 13:14:30.360001	2026-09-10 13:14:30.360001
3962	73	PRD-1789045777628-R1789046070513	115.2000	115.2000	available	2026-09-10 13:14:30.514355	2026-09-10 13:14:30.514355
3963	73	PRD-1789045777628-R1789046070688	121.3000	121.3000	available	2026-09-10 13:14:30.689321	2026-09-10 13:14:30.689321
3964	73	PRD-1789045777628-R1789046070814	113.6000	113.6000	available	2026-09-10 13:14:30.815422	2026-09-10 13:14:30.815422
3965	73	PRD-1789045777628-R1789046070974	104.4000	104.4000	available	2026-09-10 13:14:30.975466	2026-09-10 13:14:30.975466
3966	73	PRD-1789045777628-R1789046071127	114.7000	114.7000	available	2026-09-10 13:14:31.130538	2026-09-10 13:14:31.130538
3967	73	PRD-1789045777628-R1789046071237	121.4000	121.4000	available	2026-09-10 13:14:31.238227	2026-09-10 13:14:31.238227
3968	73	PRD-1789045777628-R1789046071354	113.5000	113.5000	available	2026-09-10 13:14:31.355805	2026-09-10 13:14:31.355805
3969	73	PRD-1789045777628-R1789046071515	100.4000	100.4000	available	2026-09-10 13:14:31.516741	2026-09-10 13:14:31.516741
3970	73	PRD-1789045777628-R1789046071649	114.0000	114.0000	available	2026-09-10 13:14:31.650168	2026-09-10 13:14:31.650168
3971	73	PRD-1789045777628-R1789046071800	102.9000	102.9000	available	2026-09-10 13:14:31.80199	2026-09-10 13:14:31.80199
3972	73	PRD-1789045777628-R1789046071943	114.5000	114.5000	available	2026-09-10 13:14:31.944401	2026-09-10 13:14:31.944401
3973	73	PRD-1789045777628-R1789046072060	114.6000	114.6000	available	2026-09-10 13:14:32.061709	2026-09-10 13:14:32.061709
3974	73	PRD-1789045777628-R1789046072174	113.1000	113.1000	available	2026-09-10 13:14:32.175812	2026-09-10 13:14:32.175812
3975	73	PRD-1789045777628-R1789046072330	114.2000	114.2000	available	2026-09-10 13:14:32.335406	2026-09-10 13:14:32.335406
3976	73	PRD-1789045777628-R1789046072470	108.8000	108.8000	available	2026-09-10 13:14:32.472344	2026-09-10 13:14:32.472344
3977	73	PRD-1789045777628-R1789046072614	115.7000	115.7000	available	2026-09-10 13:14:32.615365	2026-09-10 13:14:32.615365
3980	73	PRD-1789045777628-R1789046073044	119.4000	119.4000	available	2026-09-10 13:14:33.045673	2026-09-10 13:14:33.045673
3982	73	PRD-1789045777628-R1789046073330	118.9000	118.9000	available	2026-09-10 13:14:33.331737	2026-09-10 13:14:33.331737
3984	73	PRD-1789045777628-R1789046073630	117.4000	117.4000	available	2026-09-10 13:14:33.63199	2026-09-10 13:14:33.63199
3985	73	PRD-1789045777628-R1789046073768	117.3000	117.3000	available	2026-09-10 13:14:33.769065	2026-09-10 13:14:33.769065
3978	73	PRD-1789045777628-R1789046072761	113.0000	113.0000	available	2026-09-10 13:14:32.762365	2026-09-10 13:14:32.762365
3979	73	PRD-1789045777628-R1789046072884	119.0000	119.0000	available	2026-09-10 13:14:32.885449	2026-09-10 13:14:32.885449
3981	73	PRD-1789045777628-R1789046073196	115.8000	115.8000	available	2026-09-10 13:14:33.19741	2026-09-10 13:14:33.19741
3983	73	PRD-1789045777628-R1789046073450	117.4000	117.4000	available	2026-09-10 13:14:33.45189	2026-09-10 13:14:33.45189
3986	73	PRD-1789045777628-R1789046073913	116.7000	116.7000	available	2026-09-10 13:14:33.914297	2026-09-10 13:14:33.914297
829	27	PRD-1789024316748-R1789024552698	113.9000	113.9000	available	2026-09-10 07:15:52.699634	2026-09-10 13:21:09.487
3335	1	PRD-1789017671180-R1789039462692	113.8000	113.8000	available	2026-09-10 11:24:22.693555	2026-09-12 03:31:30.313
5808	88	PRD-1789191340234-R1789192484986-0	148.0000	148.0000	available	2026-09-12 05:54:44.986813	2026-09-12 05:54:44.986813
5809	88	PRD-1789191340234-R1789192484988-1	150.0000	150.0000	available	2026-09-12 05:54:44.98879	2026-09-12 05:54:44.98879
5810	88	PRD-1789191340234-R1789192484989-2	150.0000	150.0000	available	2026-09-12 05:54:44.989646	2026-09-12 05:54:44.989646
5811	88	PRD-1789191340234-R1789192484990-3	150.0000	150.0000	available	2026-09-12 05:54:44.990615	2026-09-12 05:54:44.990615
5812	88	PRD-1789191340234-R1789192484991-4	150.0000	150.0000	available	2026-09-12 05:54:44.991691	2026-09-12 05:54:44.991691
5813	88	PRD-1789191340234-R1789192484992-5	150.0000	150.0000	available	2026-09-12 05:54:44.992608	2026-09-12 05:54:44.992608
5814	88	PRD-1789191340234-R1789192484993-6	150.0000	150.0000	available	2026-09-12 05:54:44.993504	2026-09-12 05:54:44.993504
5815	88	PRD-1789191340234-R1789192484994-7	150.0000	150.0000	available	2026-09-12 05:54:44.994412	2026-09-12 05:54:44.994412
5816	88	PRD-1789191340234-R1789192484995-8	150.0000	150.0000	available	2026-09-12 05:54:44.995376	2026-09-12 05:54:44.995376
5817	89	PRD-1789191401592-R1789192485000-0	155.0000	155.0000	available	2026-09-12 05:54:45.001143	2026-09-12 05:54:45.001143
5818	89	PRD-1789191401592-R1789192485001-1	152.0000	152.0000	available	2026-09-12 05:54:45.001959	2026-09-12 05:54:45.001959
5819	89	PRD-1789191401592-R1789192485002-2	150.0000	150.0000	available	2026-09-12 05:54:45.002828	2026-09-12 05:54:45.002828
5820	89	PRD-1789191401592-R1789192485003-3	150.0000	150.0000	available	2026-09-12 05:54:45.00365	2026-09-12 05:54:45.00365
5821	89	PRD-1789191401592-R1789192485004-4	150.0000	150.0000	available	2026-09-12 05:54:45.004463	2026-09-12 05:54:45.004463
5822	89	PRD-1789191401592-R1789192485005-5	150.0000	150.0000	available	2026-09-12 05:54:45.00527	2026-09-12 05:54:45.00527
5823	89	PRD-1789191401592-R1789192485005-6	150.0000	150.0000	available	2026-09-12 05:54:45.006084	2026-09-12 05:54:45.006084
5824	89	PRD-1789191401592-R1789192485006-7	150.0000	150.0000	available	2026-09-12 05:54:45.006904	2026-09-12 05:54:45.006904
5825	89	PRD-1789191401592-R1789192485007-8	150.0000	150.0000	available	2026-09-12 05:54:45.007695	2026-09-12 05:54:45.007695
5826	89	PRD-1789191401592-R1789192485008-9	150.0000	150.0000	available	2026-09-12 05:54:45.008488	2026-09-12 05:54:45.008488
5827	90	PRD-1789191444730-R1789192485012-0	140.0000	140.0000	available	2026-09-12 05:54:45.012451	2026-09-12 05:54:45.012451
5828	90	PRD-1789191444730-R1789192485013-1	150.0000	150.0000	available	2026-09-12 05:54:45.013246	2026-09-12 05:54:45.013246
5829	90	PRD-1789191444730-R1789192485013-2	150.0000	150.0000	available	2026-09-12 05:54:45.014043	2026-09-12 05:54:45.014043
5830	90	PRD-1789191444730-R1789192485015-3	150.0000	150.0000	available	2026-09-12 05:54:45.015158	2026-09-12 05:54:45.015158
5831	90	PRD-1789191444730-R1789192485016-4	150.0000	150.0000	available	2026-09-12 05:54:45.016239	2026-09-12 05:54:45.016239
5832	90	PRD-1789191444730-R1789192485017-5	150.0000	150.0000	available	2026-09-12 05:54:45.017313	2026-09-12 05:54:45.017313
5833	90	PRD-1789191444730-R1789192485018-6	150.0000	150.0000	available	2026-09-12 05:54:45.0184	2026-09-12 05:54:45.0184
5834	90	PRD-1789191444730-R1789192485019-7	150.0000	150.0000	available	2026-09-12 05:54:45.019475	2026-09-12 05:54:45.019475
5835	90	PRD-1789191444730-R1789192485020-8	150.0000	150.0000	available	2026-09-12 05:54:45.020544	2026-09-12 05:54:45.020544
5836	90	PRD-1789191444730-R1789192485021-9	150.0000	150.0000	available	2026-09-12 05:54:45.021623	2026-09-12 05:54:45.021623
5837	90	PRD-1789191444730-R1789192485022-10	150.0000	150.0000	available	2026-09-12 05:54:45.022699	2026-09-12 05:54:45.022699
5838	90	PRD-1789191444730-R1789192485026-0	146.0000	146.0000	available	2026-09-12 05:54:45.026746	2026-09-12 05:54:45.026746
5839	90	PRD-1789191444730-R1789192485027-1	150.0000	150.0000	available	2026-09-12 05:54:45.027635	2026-09-12 05:54:45.027635
5840	90	PRD-1789191444730-R1789192485028-2	150.0000	150.0000	available	2026-09-12 05:54:45.028451	2026-09-12 05:54:45.028451
5841	90	PRD-1789191444730-R1789192485029-3	150.0000	150.0000	available	2026-09-12 05:54:45.029251	2026-09-12 05:54:45.029251
5842	90	PRD-1789191444730-R1789192485029-4	150.0000	150.0000	available	2026-09-12 05:54:45.030057	2026-09-12 05:54:45.030057
5843	90	PRD-1789191444730-R1789192485030-5	150.0000	150.0000	available	2026-09-12 05:54:45.030887	2026-09-12 05:54:45.030887
5844	90	PRD-1789191444730-R1789192485031-6	150.0000	150.0000	available	2026-09-12 05:54:45.031687	2026-09-12 05:54:45.031687
5845	90	PRD-1789191444730-R1789192485032-7	150.0000	150.0000	available	2026-09-12 05:54:45.032486	2026-09-12 05:54:45.032486
5846	90	PRD-1789191444730-R1789192485033-8	150.0000	150.0000	available	2026-09-12 05:54:45.033285	2026-09-12 05:54:45.033285
5847	90	PRD-1789191444730-R1789192485033-9	150.0000	150.0000	available	2026-09-12 05:54:45.034085	2026-09-12 05:54:45.034085
4412	76	PRD-1789101381567-R1789101401481	141.0000	141.0000	available	2026-09-11 04:36:41.482017	2026-09-11 04:36:41.482017
5848	90	PRD-1789191444730-R1789192485034-10	150.0000	150.0000	available	2026-09-12 05:54:45.034911	2026-09-12 05:54:45.034911
5849	90	PRD-1789191444730-R1789192485035-11	150.0000	150.0000	available	2026-09-12 05:54:45.035706	2026-09-12 05:54:45.035706
5850	90	PRD-1789191444730-R1789192485036-12	150.0000	150.0000	available	2026-09-12 05:54:45.036499	2026-09-12 05:54:45.036499
5851	90	PRD-1789191444730-R1789192485054-13	150.0000	150.0000	available	2026-09-12 05:54:45.054479	2026-09-12 05:54:45.054479
5852	90	PRD-1789191444730-R1789192485055-14	150.0000	150.0000	available	2026-09-12 05:54:45.055497	2026-09-12 05:54:45.055497
5853	90	PRD-1789191444730-R1789192485056-15	150.0000	150.0000	available	2026-09-12 05:54:45.056335	2026-09-12 05:54:45.056335
5854	90	PRD-1789191444730-R1789192485056-16	150.0000	150.0000	available	2026-09-12 05:54:45.057188	2026-09-12 05:54:45.057188
5855	90	PRD-1789191444730-R1789192485058-17	150.0000	150.0000	available	2026-09-12 05:54:45.058171	2026-09-12 05:54:45.058171
5856	90	PRD-1789191444730-R1789192485062-0	141.0000	141.0000	available	2026-09-12 05:54:45.062609	2026-09-12 05:54:45.062609
5857	90	PRD-1789191444730-R1789192485063-1	142.0000	142.0000	available	2026-09-12 05:54:45.063466	2026-09-12 05:54:45.063466
5858	90	PRD-1789191444730-R1789192485064-2	150.0000	150.0000	available	2026-09-12 05:54:45.064314	2026-09-12 05:54:45.064314
5859	90	PRD-1789191444730-R1789192485065-3	150.0000	150.0000	available	2026-09-12 05:54:45.065222	2026-09-12 05:54:45.065222
5860	90	PRD-1789191444730-R1789192485065-4	150.0000	150.0000	available	2026-09-12 05:54:45.066093	2026-09-12 05:54:45.066093
5861	90	PRD-1789191444730-R1789192485066-5	150.0000	150.0000	available	2026-09-12 05:54:45.067033	2026-09-12 05:54:45.067033
5862	90	PRD-1789191444730-R1789192485067-6	150.0000	150.0000	available	2026-09-12 05:54:45.067981	2026-09-12 05:54:45.067981
5863	90	PRD-1789191444730-R1789192485068-7	150.0000	150.0000	available	2026-09-12 05:54:45.068781	2026-09-12 05:54:45.068781
5864	90	PRD-1789191444730-R1789192485069-8	150.0000	150.0000	available	2026-09-12 05:54:45.069821	2026-09-12 05:54:45.069821
5865	90	PRD-1789191444730-R1789192485070-9	150.0000	150.0000	available	2026-09-12 05:54:45.070672	2026-09-12 05:54:45.070672
5866	90	PRD-1789191444730-R1789192485071-10	150.0000	150.0000	available	2026-09-12 05:54:45.071466	2026-09-12 05:54:45.071466
5867	90	PRD-1789191444730-R1789192485072-11	150.0000	150.0000	available	2026-09-12 05:54:45.072276	2026-09-12 05:54:45.072276
5868	90	PRD-1789191444730-R1789192485072-12	150.0000	150.0000	available	2026-09-12 05:54:45.073062	2026-09-12 05:54:45.073062
5869	91	PRD-1789191473955-R1789192485077-0	142.0000	142.0000	available	2026-09-12 05:54:45.077205	2026-09-12 05:54:45.077205
5870	91	PRD-1789191473955-R1789192485077-1	147.0000	147.0000	available	2026-09-12 05:54:45.077988	2026-09-12 05:54:45.077988
5871	91	PRD-1789191473955-R1789192485078-2	147.0000	147.0000	available	2026-09-12 05:54:45.078811	2026-09-12 05:54:45.078811
5872	91	PRD-1789191473955-R1789192485079-3	147.0000	147.0000	available	2026-09-12 05:54:45.079596	2026-09-12 05:54:45.079596
5873	91	PRD-1789191473955-R1789192485080-4	141.0000	141.0000	available	2026-09-12 05:54:45.080371	2026-09-12 05:54:45.080371
5874	91	PRD-1789191473955-R1789192485081-5	100.0000	100.0000	available	2026-09-12 05:54:45.08124	2026-09-12 05:54:45.08124
5875	91	PRD-1789191473955-R1789192485081-6	138.0000	138.0000	available	2026-09-12 05:54:45.082011	2026-09-12 05:54:45.082011
5876	91	PRD-1789191473955-R1789192485082-7	150.0000	150.0000	available	2026-09-12 05:54:45.082822	2026-09-12 05:54:45.082822
5877	91	PRD-1789191473955-R1789192485083-8	150.0000	150.0000	available	2026-09-12 05:54:45.083599	2026-09-12 05:54:45.083599
5878	91	PRD-1789191473955-R1789192485084-9	150.0000	150.0000	available	2026-09-12 05:54:45.084376	2026-09-12 05:54:45.084376
5879	91	PRD-1789191473955-R1789192485085-10	150.0000	150.0000	available	2026-09-12 05:54:45.085145	2026-09-12 05:54:45.085145
5880	91	PRD-1789191473955-R1789192485085-11	150.0000	150.0000	available	2026-09-12 05:54:45.085915	2026-09-12 05:54:45.085915
5881	91	PRD-1789191473955-R1789192485086-12	150.0000	150.0000	available	2026-09-12 05:54:45.086703	2026-09-12 05:54:45.086703
5882	91	PRD-1789191473955-R1789192485087-13	150.0000	150.0000	available	2026-09-12 05:54:45.087488	2026-09-12 05:54:45.087488
5883	91	PRD-1789191473955-R1789192485088-14	150.0000	150.0000	available	2026-09-12 05:54:45.088281	2026-09-12 05:54:45.088281
5884	91	PRD-1789191473955-R1789192485092-0	144.0000	144.0000	available	2026-09-12 05:54:45.092143	2026-09-12 05:54:45.092143
5885	91	PRD-1789191473955-R1789192485092-1	148.0000	148.0000	available	2026-09-12 05:54:45.092934	2026-09-12 05:54:45.092934
5886	91	PRD-1789191473955-R1789192485093-2	140.0000	140.0000	available	2026-09-12 05:54:45.093722	2026-09-12 05:54:45.093722
5887	91	PRD-1789191473955-R1789192485094-3	150.0000	150.0000	available	2026-09-12 05:54:45.094509	2026-09-12 05:54:45.094509
5888	91	PRD-1789191473955-R1789192485095-4	150.0000	150.0000	available	2026-09-12 05:54:45.0953	2026-09-12 05:54:45.0953
5889	91	PRD-1789191473955-R1789192485096-5	150.0000	150.0000	available	2026-09-12 05:54:45.09623	2026-09-12 05:54:45.09623
5890	91	PRD-1789191473955-R1789192485096-6	150.0000	150.0000	available	2026-09-12 05:54:45.097019	2026-09-12 05:54:45.097019
5891	91	PRD-1789191473955-R1789192485097-7	150.0000	150.0000	available	2026-09-12 05:54:45.097819	2026-09-12 05:54:45.097819
5892	91	PRD-1789191473955-R1789192485098-8	150.0000	150.0000	available	2026-09-12 05:54:45.098666	2026-09-12 05:54:45.098666
5893	91	PRD-1789191473955-R1789192485099-9	150.0000	150.0000	available	2026-09-12 05:54:45.099458	2026-09-12 05:54:45.099458
5894	92	PRD-1789191693825-R1789192485103-0	145.0000	145.0000	available	2026-09-12 05:54:45.103281	2026-09-12 05:54:45.103281
5895	92	PRD-1789191693825-R1789192485103-1	148.0000	148.0000	available	2026-09-12 05:54:45.104073	2026-09-12 05:54:45.104073
5896	92	PRD-1789191693825-R1789192485104-2	147.0000	147.0000	available	2026-09-12 05:54:45.104863	2026-09-12 05:54:45.104863
5897	92	PRD-1789191693825-R1789192485105-3	150.0000	150.0000	available	2026-09-12 05:54:45.105648	2026-09-12 05:54:45.105648
5898	92	PRD-1789191693825-R1789192485106-4	150.0000	150.0000	available	2026-09-12 05:54:45.106431	2026-09-12 05:54:45.106431
5899	92	PRD-1789191693825-R1789192485107-5	150.0000	150.0000	available	2026-09-12 05:54:45.10722	2026-09-12 05:54:45.10722
5900	92	PRD-1789191693825-R1789192485107-6	150.0000	150.0000	available	2026-09-12 05:54:45.108013	2026-09-12 05:54:45.108013
5901	92	PRD-1789191693825-R1789192485108-7	150.0000	150.0000	available	2026-09-12 05:54:45.108796	2026-09-12 05:54:45.108796
5902	92	PRD-1789191693825-R1789192485109-8	150.0000	150.0000	available	2026-09-12 05:54:45.109578	2026-09-12 05:54:45.109578
5903	92	PRD-1789191693825-R1789192485110-9	150.0000	150.0000	available	2026-09-12 05:54:45.110361	2026-09-12 05:54:45.110361
5904	92	PRD-1789191693825-R1789192485111-10	150.0000	150.0000	available	2026-09-12 05:54:45.111144	2026-09-12 05:54:45.111144
5905	92	PRD-1789191693825-R1789192485111-11	150.0000	150.0000	available	2026-09-12 05:54:45.111923	2026-09-12 05:54:45.111923
5906	92	PRD-1789191693825-R1789192485112-12	150.0000	150.0000	available	2026-09-12 05:54:45.112706	2026-09-12 05:54:45.112706
5907	92	PRD-1789191693825-R1789192485113-13	150.0000	150.0000	available	2026-09-12 05:54:45.113488	2026-09-12 05:54:45.113488
5908	92	PRD-1789191693825-R1789192485114-14	150.0000	150.0000	available	2026-09-12 05:54:45.114278	2026-09-12 05:54:45.114278
5909	92	PRD-1789191693825-R1789192485114-15	150.0000	150.0000	available	2026-09-12 05:54:45.115066	2026-09-12 05:54:45.115066
5910	92	PRD-1789191693825-R1789192485116-16	150.0000	150.0000	available	2026-09-12 05:54:45.116452	2026-09-12 05:54:45.116452
5911	92	PRD-1789191693825-R1789192485117-17	150.0000	150.0000	available	2026-09-12 05:54:45.117235	2026-09-12 05:54:45.117235
5912	92	PRD-1789191693825-R1789192485117-18	150.0000	150.0000	available	2026-09-12 05:54:45.118037	2026-09-12 05:54:45.118037
5913	92	PRD-1789191693825-R1789192485118-19	150.0000	150.0000	available	2026-09-12 05:54:45.118867	2026-09-12 05:54:45.118867
5914	92	PRD-1789191693825-R1789192485119-20	150.0000	150.0000	available	2026-09-12 05:54:45.119646	2026-09-12 05:54:45.119646
5915	92	PRD-1789191693825-R1789192485120-21	150.0000	150.0000	available	2026-09-12 05:54:45.120424	2026-09-12 05:54:45.120424
5990	96	PRD-1789192722086-R1789193570591-20	150.0000	150.0000	available	2026-09-12 06:12:50.591239	2026-09-12 06:12:50.591239
5991	96	PRD-1789192722086-R1789193570591-21	150.0000	150.0000	available	2026-09-12 06:12:50.592074	2026-09-12 06:12:50.592074
5992	97	PRD-1789192756151-R1789193570596-0	152.0000	152.0000	available	2026-09-12 06:12:50.59621	2026-09-12 06:12:50.59621
5993	97	PRD-1789192756151-R1789193570596-1	146.0000	146.0000	available	2026-09-12 06:12:50.597118	2026-09-12 06:12:50.597118
5916	93	PRD-1789192628493-R1789193570515-0	140.0000	140.0000	available	2026-09-12 06:12:50.51592	2026-09-12 06:12:50.51592
5917	93	PRD-1789192628493-R1789193570517-1	140.0000	140.0000	available	2026-09-12 06:12:50.517766	2026-09-12 06:12:50.517766
5918	93	PRD-1789192628493-R1789193570518-2	147.0000	147.0000	available	2026-09-12 06:12:50.51863	2026-09-12 06:12:50.51863
5919	93	PRD-1789192628493-R1789193570519-3	154.0000	154.0000	available	2026-09-12 06:12:50.519533	2026-09-12 06:12:50.519533
5920	93	PRD-1789192628493-R1789193570520-4	160.0000	160.0000	available	2026-09-12 06:12:50.520388	2026-09-12 06:12:50.520388
5921	93	PRD-1789192628493-R1789193570521-5	126.0000	126.0000	available	2026-09-12 06:12:50.521289	2026-09-12 06:12:50.521289
5922	93	PRD-1789192628493-R1789193570522-6	150.0000	150.0000	available	2026-09-12 06:12:50.522158	2026-09-12 06:12:50.522158
5923	93	PRD-1789192628493-R1789193570522-7	150.0000	150.0000	available	2026-09-12 06:12:50.523	2026-09-12 06:12:50.523
5924	93	PRD-1789192628493-R1789193570523-8	150.0000	150.0000	available	2026-09-12 06:12:50.523842	2026-09-12 06:12:50.523842
5925	93	PRD-1789192628493-R1789193570524-9	150.0000	150.0000	available	2026-09-12 06:12:50.524743	2026-09-12 06:12:50.524743
5926	93	PRD-1789192628493-R1789193570525-10	150.0000	150.0000	available	2026-09-12 06:12:50.525605	2026-09-12 06:12:50.525605
5927	93	PRD-1789192628493-R1789193570526-11	150.0000	150.0000	available	2026-09-12 06:12:50.526453	2026-09-12 06:12:50.526453
5928	93	PRD-1789192628493-R1789193570527-12	150.0000	150.0000	available	2026-09-12 06:12:50.527273	2026-09-12 06:12:50.527273
5929	93	PRD-1789192628493-R1789193570527-13	150.0000	150.0000	available	2026-09-12 06:12:50.528102	2026-09-12 06:12:50.528102
5930	93	PRD-1789192628493-R1789193570528-14	150.0000	150.0000	available	2026-09-12 06:12:50.528933	2026-09-12 06:12:50.528933
5931	93	PRD-1789192628493-R1789193570529-15	150.0000	150.0000	available	2026-09-12 06:12:50.529775	2026-09-12 06:12:50.529775
5932	93	PRD-1789192628493-R1789193570530-16	150.0000	150.0000	available	2026-09-12 06:12:50.530576	2026-09-12 06:12:50.530576
5933	93	PRD-1789192628493-R1789193570531-17	150.0000	150.0000	available	2026-09-12 06:12:50.53141	2026-09-12 06:12:50.53141
5934	93	PRD-1789192628493-R1789193570532-18	150.0000	150.0000	available	2026-09-12 06:12:50.532207	2026-09-12 06:12:50.532207
5935	93	PRD-1789192628493-R1789193570533-19	150.0000	150.0000	available	2026-09-12 06:12:50.533152	2026-09-12 06:12:50.533152
5936	93	PRD-1789192628493-R1789193570533-20	150.0000	150.0000	available	2026-09-12 06:12:50.533979	2026-09-12 06:12:50.533979
5937	94	PRD-1789192664585-R1789193570539-0	143.0000	143.0000	available	2026-09-12 06:12:50.539298	2026-09-12 06:12:50.539298
5938	94	PRD-1789192664585-R1789193570540-1	129.0000	129.0000	available	2026-09-12 06:12:50.540123	2026-09-12 06:12:50.540123
5939	94	PRD-1789192664585-R1789193570540-2	141.0000	141.0000	available	2026-09-12 06:12:50.541012	2026-09-12 06:12:50.541012
5940	94	PRD-1789192664585-R1789193570541-3	129.0000	129.0000	available	2026-09-12 06:12:50.541881	2026-09-12 06:12:50.541881
5941	94	PRD-1789192664585-R1789193570542-4	150.0000	150.0000	available	2026-09-12 06:12:50.542752	2026-09-12 06:12:50.542752
5942	94	PRD-1789192664585-R1789193570543-5	150.0000	150.0000	available	2026-09-12 06:12:50.543601	2026-09-12 06:12:50.543601
5943	94	PRD-1789192664585-R1789193570544-6	150.0000	150.0000	available	2026-09-12 06:12:50.544448	2026-09-12 06:12:50.544448
5944	94	PRD-1789192664585-R1789193570545-7	150.0000	150.0000	available	2026-09-12 06:12:50.5453	2026-09-12 06:12:50.5453
5945	94	PRD-1789192664585-R1789193570546-8	150.0000	150.0000	available	2026-09-12 06:12:50.546184	2026-09-12 06:12:50.546184
5946	94	PRD-1789192664585-R1789193570546-9	150.0000	150.0000	available	2026-09-12 06:12:50.547036	2026-09-12 06:12:50.547036
5947	94	PRD-1789192664585-R1789193570547-10	150.0000	150.0000	available	2026-09-12 06:12:50.547976	2026-09-12 06:12:50.547976
5948	94	PRD-1789192664585-R1789193570548-11	150.0000	150.0000	available	2026-09-12 06:12:50.548877	2026-09-12 06:12:50.548877
5949	94	PRD-1789192664585-R1789193570549-12	150.0000	150.0000	available	2026-09-12 06:12:50.549712	2026-09-12 06:12:50.549712
5950	94	PRD-1789192664585-R1789193570550-13	150.0000	150.0000	available	2026-09-12 06:12:50.550609	2026-09-12 06:12:50.550609
5951	94	PRD-1789192664585-R1789193570551-14	150.0000	150.0000	available	2026-09-12 06:12:50.551432	2026-09-12 06:12:50.551432
5952	94	PRD-1789192664585-R1789193570552-15	150.0000	150.0000	available	2026-09-12 06:12:50.552526	2026-09-12 06:12:50.552526
5953	94	PRD-1789192664585-R1789193570553-16	150.0000	150.0000	available	2026-09-12 06:12:50.553401	2026-09-12 06:12:50.553401
5954	94	PRD-1789192664585-R1789193570554-17	150.0000	150.0000	available	2026-09-12 06:12:50.554255	2026-09-12 06:12:50.554255
5955	94	PRD-1789192664585-R1789193570554-18	150.0000	150.0000	available	2026-09-12 06:12:50.555066	2026-09-12 06:12:50.555066
5956	95	PRD-1789192694545-R1789193570558-0	148.0000	148.0000	available	2026-09-12 06:12:50.559067	2026-09-12 06:12:50.559067
5957	95	PRD-1789192694545-R1789193570559-1	143.0000	143.0000	available	2026-09-12 06:12:50.559925	2026-09-12 06:12:50.559925
5958	95	PRD-1789192694545-R1789193570560-2	147.0000	147.0000	available	2026-09-12 06:12:50.560739	2026-09-12 06:12:50.560739
5959	95	PRD-1789192694545-R1789193570561-3	160.0000	160.0000	available	2026-09-12 06:12:50.561602	2026-09-12 06:12:50.561602
5960	95	PRD-1789192694545-R1789193570562-4	150.0000	150.0000	available	2026-09-12 06:12:50.562411	2026-09-12 06:12:50.562411
5961	95	PRD-1789192694545-R1789193570563-5	150.0000	150.0000	available	2026-09-12 06:12:50.563314	2026-09-12 06:12:50.563314
5962	95	PRD-1789192694545-R1789193570564-6	150.0000	150.0000	available	2026-09-12 06:12:50.564149	2026-09-12 06:12:50.564149
5963	95	PRD-1789192694545-R1789193570564-7	150.0000	150.0000	available	2026-09-12 06:12:50.565038	2026-09-12 06:12:50.565038
5964	95	PRD-1789192694545-R1789193570565-8	150.0000	150.0000	available	2026-09-12 06:12:50.565862	2026-09-12 06:12:50.565862
5965	95	PRD-1789192694545-R1789193570566-9	150.0000	150.0000	available	2026-09-12 06:12:50.566715	2026-09-12 06:12:50.566715
5966	95	PRD-1789192694545-R1789193570567-10	150.0000	150.0000	available	2026-09-12 06:12:50.567535	2026-09-12 06:12:50.567535
5967	95	PRD-1789192694545-R1789193570568-11	150.0000	150.0000	available	2026-09-12 06:12:50.568385	2026-09-12 06:12:50.568385
5968	95	PRD-1789192694545-R1789193570569-12	150.0000	150.0000	available	2026-09-12 06:12:50.569205	2026-09-12 06:12:50.569205
5969	95	PRD-1789192694545-R1789193570569-13	150.0000	150.0000	available	2026-09-12 06:12:50.570053	2026-09-12 06:12:50.570053
5970	96	PRD-1789192722086-R1789193570573-0	146.0000	146.0000	available	2026-09-12 06:12:50.574062	2026-09-12 06:12:50.574062
5971	96	PRD-1789192722086-R1789193570574-1	152.0000	152.0000	available	2026-09-12 06:12:50.574885	2026-09-12 06:12:50.574885
5972	96	PRD-1789192722086-R1789193570575-2	155.0000	155.0000	available	2026-09-12 06:12:50.575745	2026-09-12 06:12:50.575745
5973	96	PRD-1789192722086-R1789193570576-3	150.0000	150.0000	available	2026-09-12 06:12:50.576562	2026-09-12 06:12:50.576562
5974	96	PRD-1789192722086-R1789193570577-4	150.0000	150.0000	available	2026-09-12 06:12:50.577521	2026-09-12 06:12:50.577521
2967	66	PRD-1789037465593-R1789037551128	119.0000	119.0000	available	2026-09-10 10:52:31.131321	2026-09-11 05:28:57.709
5975	96	PRD-1789192722086-R1789193570578-5	150.0000	150.0000	available	2026-09-12 06:12:50.578338	2026-09-12 06:12:50.578338
5976	96	PRD-1789192722086-R1789193570579-6	150.0000	150.0000	available	2026-09-12 06:12:50.57919	2026-09-12 06:12:50.57919
5977	96	PRD-1789192722086-R1789193570579-7	150.0000	150.0000	available	2026-09-12 06:12:50.580002	2026-09-12 06:12:50.580002
5978	96	PRD-1789192722086-R1789193570580-8	150.0000	150.0000	available	2026-09-12 06:12:50.580867	2026-09-12 06:12:50.580867
5979	96	PRD-1789192722086-R1789193570581-9	150.0000	150.0000	available	2026-09-12 06:12:50.581693	2026-09-12 06:12:50.581693
5980	96	PRD-1789192722086-R1789193570582-10	150.0000	150.0000	available	2026-09-12 06:12:50.582604	2026-09-12 06:12:50.582604
5981	96	PRD-1789192722086-R1789193570583-11	150.0000	150.0000	available	2026-09-12 06:12:50.583413	2026-09-12 06:12:50.583413
5982	96	PRD-1789192722086-R1789193570584-12	150.0000	150.0000	available	2026-09-12 06:12:50.584254	2026-09-12 06:12:50.584254
5983	96	PRD-1789192722086-R1789193570584-13	150.0000	150.0000	available	2026-09-12 06:12:50.585092	2026-09-12 06:12:50.585092
5984	96	PRD-1789192722086-R1789193570585-14	150.0000	150.0000	available	2026-09-12 06:12:50.585943	2026-09-12 06:12:50.585943
5985	96	PRD-1789192722086-R1789193570586-15	150.0000	150.0000	available	2026-09-12 06:12:50.586754	2026-09-12 06:12:50.586754
5986	96	PRD-1789192722086-R1789193570587-16	150.0000	150.0000	available	2026-09-12 06:12:50.587607	2026-09-12 06:12:50.587607
5987	96	PRD-1789192722086-R1789193570588-17	150.0000	150.0000	available	2026-09-12 06:12:50.588492	2026-09-12 06:12:50.588492
5988	96	PRD-1789192722086-R1789193570589-18	150.0000	150.0000	available	2026-09-12 06:12:50.589501	2026-09-12 06:12:50.589501
5989	96	PRD-1789192722086-R1789193570590-19	150.0000	150.0000	available	2026-09-12 06:12:50.590377	2026-09-12 06:12:50.590377
5994	97	PRD-1789192756151-R1789193570597-2	110.0000	110.0000	available	2026-09-12 06:12:50.597988	2026-09-12 06:12:50.597988
5995	97	PRD-1789192756151-R1789193570598-3	150.0000	150.0000	available	2026-09-12 06:12:50.59901	2026-09-12 06:12:50.59901
5996	97	PRD-1789192756151-R1789193570599-4	150.0000	150.0000	available	2026-09-12 06:12:50.599912	2026-09-12 06:12:50.599912
5997	97	PRD-1789192756151-R1789193570600-5	150.0000	150.0000	available	2026-09-12 06:12:50.600759	2026-09-12 06:12:50.600759
5998	97	PRD-1789192756151-R1789193570601-6	150.0000	150.0000	available	2026-09-12 06:12:50.601617	2026-09-12 06:12:50.601617
5999	97	PRD-1789192756151-R1789193570602-7	150.0000	150.0000	available	2026-09-12 06:12:50.602661	2026-09-12 06:12:50.602661
6000	97	PRD-1789192756151-R1789193570603-8	150.0000	150.0000	available	2026-09-12 06:12:50.603494	2026-09-12 06:12:50.603494
6001	97	PRD-1789192756151-R1789193570604-9	150.0000	150.0000	available	2026-09-12 06:12:50.604415	2026-09-12 06:12:50.604415
6002	97	PRD-1789192756151-R1789193570608-0	151.0000	151.0000	available	2026-09-12 06:12:50.608345	2026-09-12 06:12:50.608345
6003	97	PRD-1789192756151-R1789193570609-1	143.0000	143.0000	available	2026-09-12 06:12:50.609162	2026-09-12 06:12:50.609162
6004	97	PRD-1789192756151-R1789193570609-2	151.0000	151.0000	available	2026-09-12 06:12:50.610013	2026-09-12 06:12:50.610013
6005	97	PRD-1789192756151-R1789193570610-3	150.0000	150.0000	available	2026-09-12 06:12:50.610834	2026-09-12 06:12:50.610834
6006	97	PRD-1789192756151-R1789193570611-4	150.0000	150.0000	available	2026-09-12 06:12:50.611667	2026-09-12 06:12:50.611667
6007	97	PRD-1789192756151-R1789193570612-5	150.0000	150.0000	available	2026-09-12 06:12:50.612486	2026-09-12 06:12:50.612486
6008	97	PRD-1789192756151-R1789193570613-6	150.0000	150.0000	available	2026-09-12 06:12:50.613613	2026-09-12 06:12:50.613613
6009	97	PRD-1789192756151-R1789193570614-7	150.0000	150.0000	available	2026-09-12 06:12:50.614719	2026-09-12 06:12:50.614719
6010	97	PRD-1789192756151-R1789193570615-8	150.0000	150.0000	available	2026-09-12 06:12:50.615837	2026-09-12 06:12:50.615837
6011	97	PRD-1789192756151-R1789193570616-9	150.0000	150.0000	available	2026-09-12 06:12:50.616955	2026-09-12 06:12:50.616955
6012	97	PRD-1789192756151-R1789193570617-10	150.0000	150.0000	available	2026-09-12 06:12:50.618085	2026-09-12 06:12:50.618085
6013	97	PRD-1789192756151-R1789193570619-11	150.0000	150.0000	available	2026-09-12 06:12:50.619222	2026-09-12 06:12:50.619222
6014	97	PRD-1789192756151-R1789193570620-12	150.0000	150.0000	available	2026-09-12 06:12:50.620484	2026-09-12 06:12:50.620484
6015	98	PRD-1789192813073-R1789193570624-0	146.0000	146.0000	available	2026-09-12 06:12:50.625109	2026-09-12 06:12:50.625109
6016	98	PRD-1789192813073-R1789193570625-1	145.0000	145.0000	available	2026-09-12 06:12:50.625947	2026-09-12 06:12:50.625947
6017	98	PRD-1789192813073-R1789193570626-2	132.0000	132.0000	available	2026-09-12 06:12:50.626792	2026-09-12 06:12:50.626792
6018	98	PRD-1789192813073-R1789193570627-3	134.0000	134.0000	available	2026-09-12 06:12:50.627606	2026-09-12 06:12:50.627606
6019	98	PRD-1789192813073-R1789193570628-4	150.0000	150.0000	available	2026-09-12 06:12:50.628435	2026-09-12 06:12:50.628435
6020	98	PRD-1789192813073-R1789193570629-5	150.0000	150.0000	available	2026-09-12 06:12:50.629248	2026-09-12 06:12:50.629248
6021	98	PRD-1789192813073-R1789193570629-6	150.0000	150.0000	available	2026-09-12 06:12:50.630076	2026-09-12 06:12:50.630076
6022	98	PRD-1789192813073-R1789193570630-7	150.0000	150.0000	available	2026-09-12 06:12:50.630889	2026-09-12 06:12:50.630889
6023	98	PRD-1789192813073-R1789193570631-8	150.0000	150.0000	available	2026-09-12 06:12:50.63172	2026-09-12 06:12:50.63172
6024	98	PRD-1789192813073-R1789193570632-9	150.0000	150.0000	available	2026-09-12 06:12:50.632533	2026-09-12 06:12:50.632533
6025	98	PRD-1789192813073-R1789193570633-10	150.0000	150.0000	available	2026-09-12 06:12:50.633379	2026-09-12 06:12:50.633379
6026	98	PRD-1789192813073-R1789193570634-11	150.0000	150.0000	available	2026-09-12 06:12:50.634195	2026-09-12 06:12:50.634195
6027	98	PRD-1789192813073-R1789193570634-12	150.0000	150.0000	available	2026-09-12 06:12:50.635024	2026-09-12 06:12:50.635024
6028	98	PRD-1789192813073-R1789193570635-13	150.0000	150.0000	available	2026-09-12 06:12:50.635832	2026-09-12 06:12:50.635832
6029	99	PRD-1789193917111-R1789194778757-0	150.0000	150.0000	available	2026-09-12 06:32:58.757422	2026-09-12 06:32:58.757422
6030	99	PRD-1789193917111-R1789194778758-1	150.0000	150.0000	available	2026-09-12 06:32:58.758442	2026-09-12 06:32:58.758442
6031	99	PRD-1789193917111-R1789194778759-2	150.0000	150.0000	available	2026-09-12 06:32:58.759284	2026-09-12 06:32:58.759284
6032	99	PRD-1789193917111-R1789194778760-3	150.0000	150.0000	available	2026-09-12 06:32:58.760134	2026-09-12 06:32:58.760134
6033	99	PRD-1789193917111-R1789194778760-4	150.0000	150.0000	available	2026-09-12 06:32:58.760969	2026-09-12 06:32:58.760969
6034	99	PRD-1789193917111-R1789194778761-5	150.0000	150.0000	available	2026-09-12 06:32:58.761787	2026-09-12 06:32:58.761787
6035	99	PRD-1789193917111-R1789194778762-6	150.0000	150.0000	available	2026-09-12 06:32:58.762643	2026-09-12 06:32:58.762643
6036	99	PRD-1789193917111-R1789194778763-7	150.0000	150.0000	available	2026-09-12 06:32:58.763438	2026-09-12 06:32:58.763438
6037	99	PRD-1789193917111-R1789194778764-8	150.0000	150.0000	available	2026-09-12 06:32:58.764348	2026-09-12 06:32:58.764348
6038	99	PRD-1789193917111-R1789194778765-9	160.0000	160.0000	available	2026-09-12 06:32:58.765131	2026-09-12 06:32:58.765131
6039	99	PRD-1789193917111-R1789194778765-10	160.0000	160.0000	available	2026-09-12 06:32:58.765962	2026-09-12 06:32:58.765962
6040	99	PRD-1789193917111-R1789194778766-11	150.0000	150.0000	available	2026-09-12 06:32:58.766757	2026-09-12 06:32:58.766757
6041	99	PRD-1789193917111-R1789194778767-12	144.0000	144.0000	available	2026-09-12 06:32:58.767551	2026-09-12 06:32:58.767551
6042	100	PRD-1789193969191-R1789194778772-0	150.0000	150.0000	available	2026-09-12 06:32:58.772263	2026-09-12 06:32:58.772263
6043	100	PRD-1789193969191-R1789194778772-1	125.0000	125.0000	available	2026-09-12 06:32:58.773052	2026-09-12 06:32:58.773052
6044	100	PRD-1789193969191-R1789194778773-2	150.0000	150.0000	available	2026-09-12 06:32:58.773855	2026-09-12 06:32:58.773855
6045	100	PRD-1789193969191-R1789194778774-3	160.0000	160.0000	available	2026-09-12 06:32:58.774648	2026-09-12 06:32:58.774648
6046	100	PRD-1789193969191-R1789194778775-4	160.0000	160.0000	available	2026-09-12 06:32:58.775436	2026-09-12 06:32:58.775436
6047	101	PRD-1789194043180-R1789194778779-0	150.0000	150.0000	available	2026-09-12 06:32:58.77922	2026-09-12 06:32:58.77922
6048	101	PRD-1789194043180-R1789194778779-1	150.0000	150.0000	available	2026-09-12 06:32:58.780046	2026-09-12 06:32:58.780046
6049	101	PRD-1789194043180-R1789194778780-2	150.0000	150.0000	available	2026-09-12 06:32:58.780847	2026-09-12 06:32:58.780847
6050	101	PRD-1789194043180-R1789194778781-3	142.0000	142.0000	available	2026-09-12 06:32:58.781629	2026-09-12 06:32:58.781629
6051	101	PRD-1789194043180-R1789194778782-4	150.0000	150.0000	available	2026-09-12 06:32:58.782423	2026-09-12 06:32:58.782423
6052	101	PRD-1789194043180-R1789194778783-5	150.0000	150.0000	available	2026-09-12 06:32:58.78322	2026-09-12 06:32:58.78322
6053	101	PRD-1789194043180-R1789194778783-6	150.0000	150.0000	available	2026-09-12 06:32:58.784013	2026-09-12 06:32:58.784013
6054	101	PRD-1789194043180-R1789194778784-7	150.0000	150.0000	available	2026-09-12 06:32:58.784809	2026-09-12 06:32:58.784809
6055	101	PRD-1789194043180-R1789194778785-8	150.0000	150.0000	available	2026-09-12 06:32:58.785809	2026-09-12 06:32:58.785809
6056	101	PRD-1789194043180-R1789194778786-9	160.0000	160.0000	available	2026-09-12 06:32:58.786598	2026-09-12 06:32:58.786598
6057	101	PRD-1789194043180-R1789194778787-10	160.0000	160.0000	available	2026-09-12 06:32:58.787381	2026-09-12 06:32:58.787381
6058	101	PRD-1789194043180-R1789194778788-11	150.0000	150.0000	available	2026-09-12 06:32:58.788168	2026-09-12 06:32:58.788168
6059	101	PRD-1789194043180-R1789194778788-12	150.0000	150.0000	available	2026-09-12 06:32:58.78895	2026-09-12 06:32:58.78895
6060	101	PRD-1789194043180-R1789194778789-13	150.0000	150.0000	available	2026-09-12 06:32:58.789743	2026-09-12 06:32:58.789743
6061	101	PRD-1789194043180-R1789194778790-14	150.0000	150.0000	available	2026-09-12 06:32:58.790534	2026-09-12 06:32:58.790534
6062	101	PRD-1789194043180-R1789194778791-15	160.0000	160.0000	available	2026-09-12 06:32:58.791317	2026-09-12 06:32:58.791317
6063	101	PRD-1789194043180-R1789194778791-16	160.0000	160.0000	available	2026-09-12 06:32:58.792096	2026-09-12 06:32:58.792096
6064	101	PRD-1789194043180-R1789194778792-17	150.0000	150.0000	available	2026-09-12 06:32:58.792887	2026-09-12 06:32:58.792887
6065	101	PRD-1789194043180-R1789194778793-18	160.0000	160.0000	available	2026-09-12 06:32:58.793677	2026-09-12 06:32:58.793677
6066	101	PRD-1789194043180-R1789194778794-19	157.0000	157.0000	available	2026-09-12 06:32:58.79447	2026-09-12 06:32:58.79447
6067	102	PRD-1789194076947-R1789194778798-0	150.0000	150.0000	available	2026-09-12 06:32:58.79826	2026-09-12 06:32:58.79826
6068	102	PRD-1789194076947-R1789194778798-1	150.0000	150.0000	available	2026-09-12 06:32:58.799043	2026-09-12 06:32:58.799043
6069	102	PRD-1789194076947-R1789194778799-2	160.0000	160.0000	available	2026-09-12 06:32:58.799834	2026-09-12 06:32:58.799834
6070	102	PRD-1789194076947-R1789194778800-3	160.0000	160.0000	available	2026-09-12 06:32:58.800686	2026-09-12 06:32:58.800686
6071	102	PRD-1789194076947-R1789194778801-4	150.0000	150.0000	available	2026-09-12 06:32:58.801503	2026-09-12 06:32:58.801503
6072	102	PRD-1789194076947-R1789194778802-5	152.0000	152.0000	available	2026-09-12 06:32:58.802292	2026-09-12 06:32:58.802292
6073	102	PRD-1789194076947-R1789194778802-6	160.0000	160.0000	available	2026-09-12 06:32:58.803076	2026-09-12 06:32:58.803076
6074	102	PRD-1789194076947-R1789194778803-7	150.0000	150.0000	available	2026-09-12 06:32:58.803865	2026-09-12 06:32:58.803865
6075	102	PRD-1789194076947-R1789194778804-8	150.0000	150.0000	available	2026-09-12 06:32:58.804676	2026-09-12 06:32:58.804676
6076	102	PRD-1789194076947-R1789194778805-9	150.0000	150.0000	available	2026-09-12 06:32:58.805761	2026-09-12 06:32:58.805761
6077	102	PRD-1789194076947-R1789194778806-10	150.0000	150.0000	available	2026-09-12 06:32:58.806562	2026-09-12 06:32:58.806562
6078	102	PRD-1789194076947-R1789194778807-11	150.0000	150.0000	available	2026-09-12 06:32:58.807588	2026-09-12 06:32:58.807588
6079	102	PRD-1789194076947-R1789194778808-12	150.0000	150.0000	available	2026-09-12 06:32:58.808607	2026-09-12 06:32:58.808607
6080	103	PRD-1789194106605-R1789194778812-0	150.0000	150.0000	available	2026-09-12 06:32:58.812526	2026-09-12 06:32:58.812526
6081	103	PRD-1789194106605-R1789194778813-1	150.0000	150.0000	available	2026-09-12 06:32:58.813315	2026-09-12 06:32:58.813315
6082	103	PRD-1789194106605-R1789194778814-2	150.0000	150.0000	available	2026-09-12 06:32:58.814149	2026-09-12 06:32:58.814149
6083	103	PRD-1789194106605-R1789194778814-3	150.0000	150.0000	available	2026-09-12 06:32:58.81494	2026-09-12 06:32:58.81494
6084	103	PRD-1789194106605-R1789194778815-4	150.0000	150.0000	available	2026-09-12 06:32:58.815729	2026-09-12 06:32:58.815729
6085	103	PRD-1789194106605-R1789194778816-5	150.0000	150.0000	available	2026-09-12 06:32:58.816511	2026-09-12 06:32:58.816511
6086	103	PRD-1789194106605-R1789194778817-6	150.0000	150.0000	available	2026-09-12 06:32:58.817296	2026-09-12 06:32:58.817296
6087	103	PRD-1789194106605-R1789194778817-7	150.0000	150.0000	available	2026-09-12 06:32:58.818104	2026-09-12 06:32:58.818104
6088	103	PRD-1789194106605-R1789194778818-8	160.0000	160.0000	available	2026-09-12 06:32:58.818889	2026-09-12 06:32:58.818889
6089	103	PRD-1789194106605-R1789194778819-9	150.0000	150.0000	available	2026-09-12 06:32:58.819777	2026-09-12 06:32:58.819777
6090	103	PRD-1789194106605-R1789194778820-10	155.0000	155.0000	available	2026-09-12 06:32:58.820801	2026-09-12 06:32:58.820801
6091	103	PRD-1789194106605-R1789194778821-11	142.0000	142.0000	available	2026-09-12 06:32:58.821641	2026-09-12 06:32:58.821641
6092	103	PRD-1789194106605-R1789194778822-12	160.0000	160.0000	available	2026-09-12 06:32:58.822499	2026-09-12 06:32:58.822499
6093	103	PRD-1789194106605-R1789194778823-13	114.0000	114.0000	available	2026-09-12 06:32:58.823306	2026-09-12 06:32:58.823306
6094	104	PRD-1789194139137-R1789194778827-0	135.0000	135.0000	available	2026-09-12 06:32:58.827381	2026-09-12 06:32:58.827381
6095	104	PRD-1789194139137-R1789194778828-1	150.0000	150.0000	available	2026-09-12 06:32:58.828168	2026-09-12 06:32:58.828168
6096	104	PRD-1789194139137-R1789194778828-2	150.0000	150.0000	available	2026-09-12 06:32:58.828951	2026-09-12 06:32:58.828951
6097	104	PRD-1789194139137-R1789194778829-3	147.0000	147.0000	available	2026-09-12 06:32:58.829736	2026-09-12 06:32:58.829736
6098	104	PRD-1789194139137-R1789194778830-4	150.0000	150.0000	available	2026-09-12 06:32:58.830518	2026-09-12 06:32:58.830518
6099	104	PRD-1789194139137-R1789194778831-5	160.0000	160.0000	available	2026-09-12 06:32:58.831297	2026-09-12 06:32:58.831297
6100	104	PRD-1789194139137-R1789194778831-6	150.0000	150.0000	available	2026-09-12 06:32:58.832082	2026-09-12 06:32:58.832082
6101	104	PRD-1789194139137-R1789194778832-7	150.0000	150.0000	available	2026-09-12 06:32:58.832862	2026-09-12 06:32:58.832862
6102	104	PRD-1789194139137-R1789194778833-8	150.0000	150.0000	available	2026-09-12 06:32:58.833632	2026-09-12 06:32:58.833632
6103	104	PRD-1789194139137-R1789194778834-9	150.0000	150.0000	available	2026-09-12 06:32:58.834426	2026-09-12 06:32:58.834426
6104	104	PRD-1789194139137-R1789194778835-10	157.0000	157.0000	available	2026-09-12 06:32:58.835235	2026-09-12 06:32:58.835235
6105	105	PRD-1789194180975-R1789194778838-0	150.0000	150.0000	available	2026-09-12 06:32:58.839039	2026-09-12 06:32:58.839039
6106	105	PRD-1789194180975-R1789194778839-1	160.0000	160.0000	available	2026-09-12 06:32:58.839832	2026-09-12 06:32:58.839832
6107	105	PRD-1789194180975-R1789194778840-2	150.0000	150.0000	available	2026-09-12 06:32:58.840624	2026-09-12 06:32:58.840624
6108	105	PRD-1789194180975-R1789194778841-3	160.0000	160.0000	available	2026-09-12 06:32:58.84146	2026-09-12 06:32:58.84146
6109	105	PRD-1789194180975-R1789194778842-4	150.0000	150.0000	available	2026-09-12 06:32:58.842259	2026-09-12 06:32:58.842259
6110	105	PRD-1789194180975-R1789194778842-5	147.0000	147.0000	available	2026-09-12 06:32:58.843049	2026-09-12 06:32:58.843049
6111	105	PRD-1789194180975-R1789194778843-6	150.0000	150.0000	available	2026-09-12 06:32:58.843835	2026-09-12 06:32:58.843835
6112	105	PRD-1789194180975-R1789194778844-7	150.0000	150.0000	available	2026-09-12 06:32:58.844623	2026-09-12 06:32:58.844623
6113	105	PRD-1789194180975-R1789194778845-8	150.0000	150.0000	available	2026-09-12 06:32:58.845522	2026-09-12 06:32:58.845522
6114	105	PRD-1789194180975-R1789194778846-9	150.0000	150.0000	available	2026-09-12 06:32:58.846374	2026-09-12 06:32:58.846374
6115	105	PRD-1789194180975-R1789194778847-10	150.0000	150.0000	available	2026-09-12 06:32:58.847238	2026-09-12 06:32:58.847238
6116	105	PRD-1789194180975-R1789194778847-11	142.0000	142.0000	available	2026-09-12 06:32:58.848019	2026-09-12 06:32:58.848019
6117	106	PRD-1789194213744-R1789194778851-0	150.0000	150.0000	available	2026-09-12 06:32:58.851862	2026-09-12 06:32:58.851862
6118	106	PRD-1789194213744-R1789194778852-1	150.0000	150.0000	available	2026-09-12 06:32:58.852649	2026-09-12 06:32:58.852649
6119	106	PRD-1789194213744-R1789194778853-2	150.0000	150.0000	available	2026-09-12 06:32:58.853475	2026-09-12 06:32:58.853475
6120	106	PRD-1789194213744-R1789194778854-3	150.0000	150.0000	available	2026-09-12 06:32:58.854566	2026-09-12 06:32:58.854566
6121	106	PRD-1789194213744-R1789194778855-4	160.0000	160.0000	available	2026-09-12 06:32:58.855662	2026-09-12 06:32:58.855662
6122	106	PRD-1789194213744-R1789194778856-5	150.0000	150.0000	available	2026-09-12 06:32:58.856657	2026-09-12 06:32:58.856657
6123	106	PRD-1789194213744-R1789194778857-6	150.0000	150.0000	available	2026-09-12 06:32:58.857649	2026-09-12 06:32:58.857649
6124	106	PRD-1789194213744-R1789194778858-7	150.0000	150.0000	available	2026-09-12 06:32:58.858635	2026-09-12 06:32:58.858635
6125	106	PRD-1789194213744-R1789194778859-8	150.0000	150.0000	available	2026-09-12 06:32:58.859618	2026-09-12 06:32:58.859618
6126	106	PRD-1789194213744-R1789194778860-9	160.0000	160.0000	available	2026-09-12 06:32:58.860601	2026-09-12 06:32:58.860601
6127	106	PRD-1789194213744-R1789194778861-10	150.0000	150.0000	available	2026-09-12 06:32:58.861607	2026-09-12 06:32:58.861607
6128	106	PRD-1789194213744-R1789194778862-11	150.0000	150.0000	available	2026-09-12 06:32:58.862409	2026-09-12 06:32:58.862409
6129	106	PRD-1789194213744-R1789194778863-12	150.0000	150.0000	available	2026-09-12 06:32:58.863198	2026-09-12 06:32:58.863198
6130	106	PRD-1789194213744-R1789194778863-13	150.0000	150.0000	available	2026-09-12 06:32:58.863983	2026-09-12 06:32:58.863983
6131	106	PRD-1789194213744-R1789194778864-14	150.0000	150.0000	available	2026-09-12 06:32:58.864772	2026-09-12 06:32:58.864772
6132	106	PRD-1789194213744-R1789194778865-15	150.0000	150.0000	available	2026-09-12 06:32:58.865648	2026-09-12 06:32:58.865648
6133	106	PRD-1789194213744-R1789194778866-16	150.0000	150.0000	available	2026-09-12 06:32:58.866453	2026-09-12 06:32:58.866453
6134	106	PRD-1789194213744-R1789194778867-17	150.0000	150.0000	available	2026-09-12 06:32:58.867238	2026-09-12 06:32:58.867238
6135	106	PRD-1789194213744-R1789194778868-18	155.0000	155.0000	available	2026-09-12 06:32:58.868205	2026-09-12 06:32:58.868205
6136	106	PRD-1789194213744-R1789194778868-19	150.0000	150.0000	available	2026-09-12 06:32:58.868985	2026-09-12 06:32:58.868985
6138	56	PRD-1789033426514-R1789196124183-1	120.4000	120.4000	available	2026-09-12 06:55:24.18369	2026-09-12 06:55:24.18369
6139	56	PRD-1789033426514-R1789196124184-2	108.4000	108.4000	available	2026-09-12 06:55:24.185082	2026-09-12 06:55:24.185082
6140	56	PRD-1789033426514-R1789196124185-3	117.0000	117.0000	available	2026-09-12 06:55:24.18601	2026-09-12 06:55:24.18601
6141	56	PRD-1789033426514-R1789196124186-4	117.0000	117.0000	available	2026-09-12 06:55:24.186859	2026-09-12 06:55:24.186859
6142	56	PRD-1789033426514-R1789196124187-5	117.0000	117.0000	available	2026-09-12 06:55:24.187758	2026-09-12 06:55:24.187758
6143	56	PRD-1789033426514-R1789196124188-6	117.0000	117.0000	available	2026-09-12 06:55:24.188606	2026-09-12 06:55:24.188606
6144	56	PRD-1789033426514-R1789196124189-7	120.4000	120.4000	available	2026-09-12 06:55:24.189423	2026-09-12 06:55:24.189423
6145	56	PRD-1789033426514-R1789196124190-8	120.3000	120.3000	available	2026-09-12 06:55:24.190225	2026-09-12 06:55:24.190225
6146	56	PRD-1789033426514-R1789196124190-9	117.0000	117.0000	available	2026-09-12 06:55:24.19103	2026-09-12 06:55:24.19103
6147	56	PRD-1789033426514-R1789196124191-10	120.3000	120.3000	available	2026-09-12 06:55:24.191835	2026-09-12 06:55:24.191835
6148	56	PRD-1789033426514-R1789196124192-11	92.9000	92.9000	available	2026-09-12 06:55:24.192639	2026-09-12 06:55:24.192639
6149	56	PRD-1789033426514-R1789196124193-12	105.1000	105.1000	available	2026-09-12 06:55:24.193432	2026-09-12 06:55:24.193432
6150	56	PRD-1789033426514-R1789196124194-13	117.0000	117.0000	available	2026-09-12 06:55:24.19423	2026-09-12 06:55:24.19423
6151	56	PRD-1789033426514-R1789196124194-14	120.4000	120.4000	available	2026-09-12 06:55:24.195026	2026-09-12 06:55:24.195026
6152	56	PRD-1789033426514-R1789196124195-15	117.0000	117.0000	available	2026-09-12 06:55:24.195824	2026-09-12 06:55:24.195824
6153	56	PRD-1789033426514-R1789196124196-16	117.0000	117.0000	available	2026-09-12 06:55:24.196774	2026-09-12 06:55:24.196774
6154	56	PRD-1789033426514-R1789196124197-17	117.0000	117.0000	available	2026-09-12 06:55:24.197575	2026-09-12 06:55:24.197575
6155	56	PRD-1789033426514-R1789196124198-18	117.0000	117.0000	available	2026-09-12 06:55:24.198394	2026-09-12 06:55:24.198394
6156	56	PRD-1789033426514-R1789196124199-19	120.5000	120.5000	available	2026-09-12 06:55:24.199199	2026-09-12 06:55:24.199199
6157	56	PRD-1789033426514-R1789196124199-20	106.7000	106.7000	available	2026-09-12 06:55:24.199984	2026-09-12 06:55:24.199984
6158	56	PRD-1789033426514-R1789196124200-21	117.0000	117.0000	available	2026-09-12 06:55:24.200872	2026-09-12 06:55:24.200872
6159	56	PRD-1789033426514-R1789196124201-22	106.4000	106.4000	available	2026-09-12 06:55:24.201698	2026-09-12 06:55:24.201698
6160	56	PRD-1789033426514-R1789196124202-23	117.0000	117.0000	available	2026-09-12 06:55:24.202581	2026-09-12 06:55:24.202581
6161	56	PRD-1789033426514-R1789196124203-24	120.5000	120.5000	available	2026-09-12 06:55:24.203379	2026-09-12 06:55:24.203379
6162	56	PRD-1789033426514-R1789196124204-25	120.3000	120.3000	available	2026-09-12 06:55:24.204177	2026-09-12 06:55:24.204177
6163	56	PRD-1789033426514-R1789196124204-26	117.0000	117.0000	available	2026-09-12 06:55:24.204965	2026-09-12 06:55:24.204965
6164	56	PRD-1789033426514-R1789196124205-27	120.4000	120.4000	available	2026-09-12 06:55:24.205758	2026-09-12 06:55:24.205758
6165	56	PRD-1789033426514-R1789196124206-28	120.3000	120.3000	available	2026-09-12 06:55:24.206566	2026-09-12 06:55:24.206566
6166	56	PRD-1789033426514-R1789196124207-29	120.3000	120.3000	available	2026-09-12 06:55:24.207363	2026-09-12 06:55:24.207363
6167	56	PRD-1789033426514-R1789196124208-30	120.5000	120.5000	available	2026-09-12 06:55:24.208139	2026-09-12 06:55:24.208139
6168	56	PRD-1789033426514-R1789196124208-31	120.4000	120.4000	available	2026-09-12 06:55:24.208985	2026-09-12 06:55:24.208985
6169	56	PRD-1789033426514-R1789196124209-32	120.3000	120.3000	available	2026-09-12 06:55:24.20978	2026-09-12 06:55:24.20978
6170	42	PRD-1789027568425	1.0000	1.0000	available	2026-09-12 06:55:24.216094	2026-09-12 06:55:24.216094
6171	36	PRD-1789025355244	116.9000	116.9000	available	2026-09-12 06:55:24.221338	2026-09-12 06:55:24.221338
6172	36	PRD-1789025355244-R1789196124222-1	112.4000	112.4000	available	2026-09-12 06:55:24.222367	2026-09-12 06:55:24.222367
6173	12	PRD-1789018691298	126.4000	126.4000	available	2026-09-12 06:55:24.226963	2026-09-12 06:55:24.226963
6174	12	PRD-1789018691298-R1789196124227-1	120.4000	120.4000	available	2026-09-12 06:55:24.227944	2026-09-12 06:55:24.227944
6175	12	PRD-1789018691298-R1789196124228-2	116.2000	116.2000	available	2026-09-12 06:55:24.228782	2026-09-12 06:55:24.228782
6176	12	PRD-1789018691298-R1789196124229-3	111.9000	111.9000	available	2026-09-12 06:55:24.229592	2026-09-12 06:55:24.229592
6177	12	PRD-1789018691298-R1789196124230-4	124.8000	124.8000	available	2026-09-12 06:55:24.230444	2026-09-12 06:55:24.230444
6178	12	PRD-1789018691298-R1789196124231-5	117.0000	117.0000	available	2026-09-12 06:55:24.231253	2026-09-12 06:55:24.231253
6179	12	PRD-1789018691298-R1789196124232-6	120.4000	120.4000	available	2026-09-12 06:55:24.232285	2026-09-12 06:55:24.232285
6180	12	PRD-1789018691298-R1789196124232-7	110.7000	110.7000	available	2026-09-12 06:55:24.2331	2026-09-12 06:55:24.2331
6181	12	PRD-1789018691298-R1789196124233-8	117.0000	117.0000	available	2026-09-12 06:55:24.233939	2026-09-12 06:55:24.233939
6182	12	PRD-1789018691298-R1789196124234-9	117.4000	117.4000	available	2026-09-12 06:55:24.234748	2026-09-12 06:55:24.234748
6183	12	PRD-1789018691298-R1789196124235-10	119.5000	119.5000	available	2026-09-12 06:55:24.235551	2026-09-12 06:55:24.235551
6184	14	PRD-1789018782133	148.0000	148.0000	available	2026-09-12 06:55:24.24046	2026-09-12 06:55:24.24046
6185	14	PRD-1789018782133-R1789196124241-1	149.6000	149.6000	available	2026-09-12 06:55:24.241278	2026-09-12 06:55:24.241278
6186	14	PRD-1789018782133-R1789196124242-2	137.5000	137.5000	available	2026-09-12 06:55:24.242232	2026-09-12 06:55:24.242232
6187	14	PRD-1789018782133-R1789196124243-3	148.5000	148.5000	available	2026-09-12 06:55:24.243252	2026-09-12 06:55:24.243252
6188	14	PRD-1789018782133-R1789196124244-4	146.6000	146.6000	available	2026-09-12 06:55:24.244165	2026-09-12 06:55:24.244165
6189	13	PRD-1789018725877	115.0000	115.0000	available	2026-09-12 06:55:24.248483	2026-09-12 06:55:24.248483
6190	13	PRD-1789018725877-R1789196124249-1	115.0000	115.0000	available	2026-09-12 06:55:24.249487	2026-09-12 06:55:24.249487
6191	13	PRD-1789018725877-R1789196124250-2	115.0000	115.0000	available	2026-09-12 06:55:24.250369	2026-09-12 06:55:24.250369
6192	13	PRD-1789018725877-R1789196124251-3	115.0000	115.0000	available	2026-09-12 06:55:24.251216	2026-09-12 06:55:24.251216
6193	13	PRD-1789018725877-R1789196124251-4	115.7000	115.7000	available	2026-09-12 06:55:24.252067	2026-09-12 06:55:24.252067
6194	13	PRD-1789018725877-R1789196124252-5	114.8000	114.8000	available	2026-09-12 06:55:24.252887	2026-09-12 06:55:24.252887
6195	13	PRD-1789018725877-R1789196124253-6	115.8000	115.8000	available	2026-09-12 06:55:24.253699	2026-09-12 06:55:24.253699
6196	13	PRD-1789018725877-R1789196124254-7	120.9000	120.9000	available	2026-09-12 06:55:24.254517	2026-09-12 06:55:24.254517
6197	13	PRD-1789018725877-R1789196124255-8	113.3000	113.3000	available	2026-09-12 06:55:24.255372	2026-09-12 06:55:24.255372
6198	13	PRD-1789018725877-R1789196124256-9	110.5000	110.5000	available	2026-09-12 06:55:24.256249	2026-09-12 06:55:24.256249
6199	13	PRD-1789018725877-R1789196124256-10	118.0000	118.0000	available	2026-09-12 06:55:24.257059	2026-09-12 06:55:24.257059
6200	13	PRD-1789018725877-R1789196124257-11	116.6000	116.6000	available	2026-09-12 06:55:24.257874	2026-09-12 06:55:24.257874
6201	13	PRD-1789018725877-R1789196124258-12	116.5000	116.5000	available	2026-09-12 06:55:24.258705	2026-09-12 06:55:24.258705
6202	13	PRD-1789018725877-R1789196124259-13	117.0000	117.0000	available	2026-09-12 06:55:24.259506	2026-09-12 06:55:24.259506
6203	13	PRD-1789018725877-R1789196124260-14	119.4000	119.4000	available	2026-09-12 06:55:24.260303	2026-09-12 06:55:24.260303
6204	13	PRD-1789018725877-R1789196124260-15	118.1000	118.1000	available	2026-09-12 06:55:24.261109	2026-09-12 06:55:24.261109
6205	13	PRD-1789018725877-R1789196124261-16	115.0000	115.0000	available	2026-09-12 06:55:24.261933	2026-09-12 06:55:24.261933
6206	13	PRD-1789018725877-R1789196124262-17	117.7000	117.7000	available	2026-09-12 06:55:24.262734	2026-09-12 06:55:24.262734
6207	13	PRD-1789018725877-R1789196124263-18	115.6000	115.6000	available	2026-09-12 06:55:24.263544	2026-09-12 06:55:24.263544
6208	13	PRD-1789018725877-R1789196124264-19	118.9000	118.9000	available	2026-09-12 06:55:24.264336	2026-09-12 06:55:24.264336
6209	13	PRD-1789018725877-R1789196124265-20	115.0000	115.0000	available	2026-09-12 06:55:24.265136	2026-09-12 06:55:24.265136
6210	13	PRD-1789018725877-R1789196124266-21	115.0000	115.0000	available	2026-09-12 06:55:24.26628	2026-09-12 06:55:24.26628
6211	13	PRD-1789018725877-R1789196124267-22	116.2000	116.2000	available	2026-09-12 06:55:24.267189	2026-09-12 06:55:24.267189
6212	13	PRD-1789018725877-R1789196124267-23	117.6000	117.6000	available	2026-09-12 06:55:24.268041	2026-09-12 06:55:24.268041
6213	13	PRD-1789018725877-R1789196124268-24	117.0000	117.0000	available	2026-09-12 06:55:24.268835	2026-09-12 06:55:24.268835
6214	13	PRD-1789018725877-R1789196124269-25	114.7000	114.7000	available	2026-09-12 06:55:24.269626	2026-09-12 06:55:24.269626
6215	13	PRD-1789018725877-R1789196124270-26	114.1000	114.1000	available	2026-09-12 06:55:24.270427	2026-09-12 06:55:24.270427
6216	13	PRD-1789018725877-R1789196124271-27	121.0000	121.0000	available	2026-09-12 06:55:24.271225	2026-09-12 06:55:24.271225
6217	13	PRD-1789018725877-R1789196124271-28	118.2000	118.2000	available	2026-09-12 06:55:24.272014	2026-09-12 06:55:24.272014
6218	13	PRD-1789018725877-R1789196124272-29	121.4000	121.4000	available	2026-09-12 06:55:24.272805	2026-09-12 06:55:24.272805
6219	13	PRD-1789018725877-R1789196124273-30	117.6000	117.6000	available	2026-09-12 06:55:24.273599	2026-09-12 06:55:24.273599
6220	13	PRD-1789018725877-R1789196124274-31	117.8000	117.8000	available	2026-09-12 06:55:24.274407	2026-09-12 06:55:24.274407
6221	13	PRD-1789018725877-R1789196124275-32	118.2000	118.2000	available	2026-09-12 06:55:24.275201	2026-09-12 06:55:24.275201
6222	13	PRD-1789018725877-R1789196124275-33	117.1000	117.1000	available	2026-09-12 06:55:24.276004	2026-09-12 06:55:24.276004
6223	13	PRD-1789018725877-R1789196124277-34	119.8000	119.8000	available	2026-09-12 06:55:24.277339	2026-09-12 06:55:24.277339
6224	13	PRD-1789018725877-R1789196124278-35	115.0000	115.0000	available	2026-09-12 06:55:24.278504	2026-09-12 06:55:24.278504
6225	13	PRD-1789018725877-R1789196124279-36	115.0000	115.0000	available	2026-09-12 06:55:24.279379	2026-09-12 06:55:24.279379
6226	13	PRD-1789018725877-R1789196124280-37	117.6000	117.6000	available	2026-09-12 06:55:24.280195	2026-09-12 06:55:24.280195
6227	13	PRD-1789018725877-R1789196124280-38	119.0000	119.0000	available	2026-09-12 06:55:24.281001	2026-09-12 06:55:24.281001
6228	13	PRD-1789018725877-R1789196124281-39	115.0000	115.0000	available	2026-09-12 06:55:24.281799	2026-09-12 06:55:24.281799
6229	13	PRD-1789018725877-R1789196124282-40	116.6000	116.6000	available	2026-09-12 06:55:24.282638	2026-09-12 06:55:24.282638
6230	13	PRD-1789018725877-R1789196124283-41	116.5000	116.5000	available	2026-09-12 06:55:24.283433	2026-09-12 06:55:24.283433
6231	13	PRD-1789018725877-R1789196124284-42	115.0000	115.0000	available	2026-09-12 06:55:24.284416	2026-09-12 06:55:24.284416
6232	13	PRD-1789018725877-R1789196124285-43	115.0000	115.0000	available	2026-09-12 06:55:24.285224	2026-09-12 06:55:24.285224
6233	13	PRD-1789018725877-R1789196124285-44	15.8000	15.8000	available	2026-09-12 06:55:24.286032	2026-09-12 06:55:24.286032
6234	13	PRD-1789018725877-R1789196124286-45	119.9000	119.9000	available	2026-09-12 06:55:24.286834	2026-09-12 06:55:24.286834
6235	13	PRD-1789018725877-R1789196124287-46	112.1000	112.1000	available	2026-09-12 06:55:24.287625	2026-09-12 06:55:24.287625
6236	13	PRD-1789018725877-R1789196124288-47	111.7000	111.7000	available	2026-09-12 06:55:24.288424	2026-09-12 06:55:24.288424
6237	13	PRD-1789018725877-R1789196124289-48	117.7000	117.7000	available	2026-09-12 06:55:24.289213	2026-09-12 06:55:24.289213
6238	13	PRD-1789018725877-R1789196124289-49	118.2000	118.2000	available	2026-09-12 06:55:24.290131	2026-09-12 06:55:24.290131
6239	13	PRD-1789018725877-R1789196124290-50	104.2000	104.2000	available	2026-09-12 06:55:24.290946	2026-09-12 06:55:24.290946
6240	13	PRD-1789018725877-R1789196124291-51	117.6000	117.6000	available	2026-09-12 06:55:24.291737	2026-09-12 06:55:24.291737
6241	13	PRD-1789018725877-R1789196124292-52	119.8000	119.8000	available	2026-09-12 06:55:24.292528	2026-09-12 06:55:24.292528
6242	13	PRD-1789018725877-R1789196124293-53	119.4000	119.4000	available	2026-09-12 06:55:24.293326	2026-09-12 06:55:24.293326
6243	13	PRD-1789018725877-R1789196124294-54	116.7000	116.7000	available	2026-09-12 06:55:24.294126	2026-09-12 06:55:24.294126
6244	13	PRD-1789018725877-R1789196124294-55	114.6000	114.6000	available	2026-09-12 06:55:24.294933	2026-09-12 06:55:24.294933
6245	13	PRD-1789018725877-R1789196124295-56	116.8000	116.8000	available	2026-09-12 06:55:24.295725	2026-09-12 06:55:24.295725
6246	13	PRD-1789018725877-R1789196124296-57	117.4000	117.4000	available	2026-09-12 06:55:24.296519	2026-09-12 06:55:24.296519
6247	13	PRD-1789018725877-R1789196124297-58	120.3000	120.3000	available	2026-09-12 06:55:24.297313	2026-09-12 06:55:24.297313
6248	13	PRD-1789018725877-R1789196124298-59	116.7000	116.7000	available	2026-09-12 06:55:24.298121	2026-09-12 06:55:24.298121
6249	13	PRD-1789018725877-R1789196124298-60	121.5000	121.5000	available	2026-09-12 06:55:24.298953	2026-09-12 06:55:24.298953
6250	13	PRD-1789018725877-R1789196124299-61	115.0000	115.0000	available	2026-09-12 06:55:24.299755	2026-09-12 06:55:24.299755
6251	13	PRD-1789018725877-R1789196124300-62	115.0000	115.0000	available	2026-09-12 06:55:24.300543	2026-09-12 06:55:24.300543
6252	13	PRD-1789018725877-R1789196124301-63	115.0000	115.0000	available	2026-09-12 06:55:24.301407	2026-09-12 06:55:24.301407
6253	13	PRD-1789018725877-R1789196124302-64	115.0000	115.0000	available	2026-09-12 06:55:24.302451	2026-09-12 06:55:24.302451
6254	13	PRD-1789018725877-R1789196124303-65	117.7000	117.7000	available	2026-09-12 06:55:24.303292	2026-09-12 06:55:24.303292
6255	13	PRD-1789018725877-R1789196124304-66	115.6000	115.6000	available	2026-09-12 06:55:24.304427	2026-09-12 06:55:24.304427
6256	13	PRD-1789018725877-R1789196124305-67	115.1000	115.1000	available	2026-09-12 06:55:24.305216	2026-09-12 06:55:24.305216
6257	13	PRD-1789018725877-R1789196124305-68	117.6000	117.6000	available	2026-09-12 06:55:24.306148	2026-09-12 06:55:24.306148
6258	13	PRD-1789018725877-R1789196124306-69	119.0000	119.0000	available	2026-09-12 06:55:24.306972	2026-09-12 06:55:24.306972
6259	13	PRD-1789018725877-R1789196124307-70	115.7000	115.7000	available	2026-09-12 06:55:24.307768	2026-09-12 06:55:24.307768
6260	13	PRD-1789018725877-R1789196124308-71	115.0000	115.0000	available	2026-09-12 06:55:24.308572	2026-09-12 06:55:24.308572
6261	13	PRD-1789018725877-R1789196124309-72	114.5000	114.5000	available	2026-09-12 06:55:24.309368	2026-09-12 06:55:24.309368
6262	13	PRD-1789018725877-R1789196124310-73	117.6000	117.6000	available	2026-09-12 06:55:24.310175	2026-09-12 06:55:24.310175
6263	13	PRD-1789018725877-R1789196124310-74	113.4000	113.4000	available	2026-09-12 06:55:24.310973	2026-09-12 06:55:24.310973
6264	13	PRD-1789018725877-R1789196124311-75	116.6000	116.6000	available	2026-09-12 06:55:24.311768	2026-09-12 06:55:24.311768
6265	13	PRD-1789018725877-R1789196124312-76	115.0000	115.0000	available	2026-09-12 06:55:24.312546	2026-09-12 06:55:24.312546
6266	13	PRD-1789018725877-R1789196124313-77	115.0000	115.0000	available	2026-09-12 06:55:24.313388	2026-09-12 06:55:24.313388
6267	13	PRD-1789018725877-R1789196124314-78	96.9000	96.9000	available	2026-09-12 06:55:24.314188	2026-09-12 06:55:24.314188
6268	13	PRD-1789018725877-R1789196124314-79	113.4000	113.4000	available	2026-09-12 06:55:24.314979	2026-09-12 06:55:24.314979
6269	13	PRD-1789018725877-R1789196124315-80	115.8000	115.8000	available	2026-09-12 06:55:24.315776	2026-09-12 06:55:24.315776
6270	13	PRD-1789018725877-R1789196124316-81	120.2000	120.2000	available	2026-09-12 06:55:24.316563	2026-09-12 06:55:24.316563
6271	13	PRD-1789018725877-R1789196124317-82	109.2000	109.2000	available	2026-09-12 06:55:24.317342	2026-09-12 06:55:24.317342
6272	13	PRD-1789018725877-R1789196124318-83	115.9000	115.9000	available	2026-09-12 06:55:24.318188	2026-09-12 06:55:24.318188
6273	13	PRD-1789018725877-R1789196124318-84	116.8000	116.8000	available	2026-09-12 06:55:24.318974	2026-09-12 06:55:24.318974
6274	13	PRD-1789018725877-R1789196124319-85	116.8000	116.8000	available	2026-09-12 06:55:24.319758	2026-09-12 06:55:24.319758
6275	13	PRD-1789018725877-R1789196124320-86	114.5000	114.5000	available	2026-09-12 06:55:24.320547	2026-09-12 06:55:24.320547
6276	13	PRD-1789018725877-R1789196124321-87	117.6000	117.6000	available	2026-09-12 06:55:24.321329	2026-09-12 06:55:24.321329
6277	13	PRD-1789018725877-R1789196124322-88	114.5000	114.5000	available	2026-09-12 06:55:24.322197	2026-09-12 06:55:24.322197
6278	13	PRD-1789018725877-R1789196124322-89	116.0000	116.0000	available	2026-09-12 06:55:24.323026	2026-09-12 06:55:24.323026
6279	15	PRD-1789018843399	120.0000	120.0000	available	2026-09-12 06:55:24.328681	2026-09-12 06:55:24.328681
6280	15	PRD-1789018843399-R1789196124329-1	120.9000	120.9000	available	2026-09-12 06:55:24.329485	2026-09-12 06:55:24.329485
6281	15	PRD-1789018843399-R1789196124330-2	121.6000	121.6000	available	2026-09-12 06:55:24.330287	2026-09-12 06:55:24.330287
6282	15	PRD-1789018843399-R1789196124330-3	121.2000	121.2000	available	2026-09-12 06:55:24.331108	2026-09-12 06:55:24.331108
6283	15	PRD-1789018843399-R1789196124331-4	120.0000	120.0000	available	2026-09-12 06:55:24.331908	2026-09-12 06:55:24.331908
6284	15	PRD-1789018843399-R1789196124332-5	115.7000	115.7000	available	2026-09-12 06:55:24.332702	2026-09-12 06:55:24.332702
6285	15	PRD-1789018843399-R1789196124333-6	119.0000	119.0000	available	2026-09-12 06:55:24.333503	2026-09-12 06:55:24.333503
6286	15	PRD-1789018843399-R1789196124334-7	118.5000	118.5000	available	2026-09-12 06:55:24.334303	2026-09-12 06:55:24.334303
6287	15	PRD-1789018843399-R1789196124334-8	118.2000	118.2000	available	2026-09-12 06:55:24.3351	2026-09-12 06:55:24.3351
6288	15	PRD-1789018843399-R1789196124335-9	115.7000	115.7000	available	2026-09-12 06:55:24.335893	2026-09-12 06:55:24.335893
6289	15	PRD-1789018843399-R1789196124336-10	116.7000	116.7000	available	2026-09-12 06:55:24.336682	2026-09-12 06:55:24.336682
6290	15	PRD-1789018843399-R1789196124337-11	118.3000	118.3000	available	2026-09-12 06:55:24.337491	2026-09-12 06:55:24.337491
6291	15	PRD-1789018843399-R1789196124338-12	116.0000	116.0000	available	2026-09-12 06:55:24.338307	2026-09-12 06:55:24.338307
6292	15	PRD-1789018843399-R1789196124339-13	118.1000	118.1000	available	2026-09-12 06:55:24.339354	2026-09-12 06:55:24.339354
6293	15	PRD-1789018843399-R1789196124340-14	117.0000	117.0000	available	2026-09-12 06:55:24.34016	2026-09-12 06:55:24.34016
6294	15	PRD-1789018843399-R1789196124340-15	117.0000	117.0000	available	2026-09-12 06:55:24.34101	2026-09-12 06:55:24.34101
6295	15	PRD-1789018843399-R1789196124341-16	117.0000	117.0000	available	2026-09-12 06:55:24.341884	2026-09-12 06:55:24.341884
6296	15	PRD-1789018843399-R1789196124342-17	120.1000	120.1000	available	2026-09-12 06:55:24.342945	2026-09-12 06:55:24.342945
6297	15	PRD-1789018843399-R1789196124343-18	117.0000	117.0000	available	2026-09-12 06:55:24.343803	2026-09-12 06:55:24.343803
6298	15	PRD-1789018843399-R1789196124344-19	117.0000	117.0000	available	2026-09-12 06:55:24.344617	2026-09-12 06:55:24.344617
6299	15	PRD-1789018843399-R1789196124345-20	118.8000	118.8000	available	2026-09-12 06:55:24.345475	2026-09-12 06:55:24.345475
6300	15	PRD-1789018843399-R1789196124346-21	117.0000	117.0000	available	2026-09-12 06:55:24.346314	2026-09-12 06:55:24.346314
6301	15	PRD-1789018843399-R1789196124347-22	117.0000	117.0000	available	2026-09-12 06:55:24.347142	2026-09-12 06:55:24.347142
6302	15	PRD-1789018843399-R1789196124347-23	117.0000	117.0000	available	2026-09-12 06:55:24.34797	2026-09-12 06:55:24.34797
6303	15	PRD-1789018843399-R1789196124348-24	117.0000	117.0000	available	2026-09-12 06:55:24.348818	2026-09-12 06:55:24.348818
6304	15	PRD-1789018843399-R1789196124349-25	110.9000	110.9000	available	2026-09-12 06:55:24.349705	2026-09-12 06:55:24.349705
6305	15	PRD-1789018843399-R1789196124350-26	115.2000	115.2000	available	2026-09-12 06:55:24.350542	2026-09-12 06:55:24.350542
6306	15	PRD-1789018843399-R1789196124351-27	117.0000	117.0000	available	2026-09-12 06:55:24.351351	2026-09-12 06:55:24.351351
6307	15	PRD-1789018843399-R1789196124352-28	123.6000	123.6000	available	2026-09-12 06:55:24.352152	2026-09-12 06:55:24.352152
6308	15	PRD-1789018843399-R1789196124352-29	112.0000	112.0000	available	2026-09-12 06:55:24.352945	2026-09-12 06:55:24.352945
6309	15	PRD-1789018843399-R1789196124353-30	117.0000	117.0000	available	2026-09-12 06:55:24.353737	2026-09-12 06:55:24.353737
6310	15	PRD-1789018843399-R1789196124354-31	117.0000	117.0000	available	2026-09-12 06:55:24.354546	2026-09-12 06:55:24.354546
6311	15	PRD-1789018843399-R1789196124355-32	116.2000	116.2000	available	2026-09-12 06:55:24.355347	2026-09-12 06:55:24.355347
6312	15	PRD-1789018843399-R1789196124356-33	116.1000	116.1000	available	2026-09-12 06:55:24.356148	2026-09-12 06:55:24.356148
6313	15	PRD-1789018843399-R1789196124356-34	117.6000	117.6000	available	2026-09-12 06:55:24.356943	2026-09-12 06:55:24.356943
6314	15	PRD-1789018843399-R1789196124357-35	124.0000	124.0000	available	2026-09-12 06:55:24.357782	2026-09-12 06:55:24.357782
6315	15	PRD-1789018843399-R1789196124358-36	121.0000	121.0000	available	2026-09-12 06:55:24.358627	2026-09-12 06:55:24.358627
6316	15	PRD-1789018843399-R1789196124359-37	118.0000	118.0000	available	2026-09-12 06:55:24.359593	2026-09-12 06:55:24.359593
6317	15	PRD-1789018843399-R1789196124360-38	117.0000	117.0000	available	2026-09-12 06:55:24.360391	2026-09-12 06:55:24.360391
6318	15	PRD-1789018843399-R1789196124361-39	117.0000	117.0000	available	2026-09-12 06:55:24.361188	2026-09-12 06:55:24.361188
6319	15	PRD-1789018843399-R1789196124361-40	117.0000	117.0000	available	2026-09-12 06:55:24.362051	2026-09-12 06:55:24.362051
6320	15	PRD-1789018843399-R1789196124362-41	119.2000	119.2000	available	2026-09-12 06:55:24.363012	2026-09-12 06:55:24.363012
6321	15	PRD-1789018843399-R1789196124363-42	108.0000	108.0000	available	2026-09-12 06:55:24.363889	2026-09-12 06:55:24.363889
6322	15	PRD-1789018843399-R1789196124364-43	122.1000	122.1000	available	2026-09-12 06:55:24.364701	2026-09-12 06:55:24.364701
6323	15	PRD-1789018843399-R1789196124365-44	118.5000	118.5000	available	2026-09-12 06:55:24.365523	2026-09-12 06:55:24.365523
6324	15	PRD-1789018843399-R1789196124367-45	120.0000	120.0000	available	2026-09-12 06:55:24.367375	2026-09-12 06:55:24.367375
6325	15	PRD-1789018843399-R1789196124368-46	119.3000	119.3000	available	2026-09-12 06:55:24.368306	2026-09-12 06:55:24.368306
6326	15	PRD-1789018843399-R1789196124369-47	118.8000	118.8000	available	2026-09-12 06:55:24.369182	2026-09-12 06:55:24.369182
6327	15	PRD-1789018843399-R1789196124369-48	129.1000	129.1000	available	2026-09-12 06:55:24.370047	2026-09-12 06:55:24.370047
6328	15	PRD-1789018843399-R1789196124370-49	106.7000	106.7000	available	2026-09-12 06:55:24.370899	2026-09-12 06:55:24.370899
6329	15	PRD-1789018843399-R1789196124371-50	122.3000	122.3000	available	2026-09-12 06:55:24.371768	2026-09-12 06:55:24.371768
6330	15	PRD-1789018843399-R1789196124372-51	117.3000	117.3000	available	2026-09-12 06:55:24.372607	2026-09-12 06:55:24.372607
6331	15	PRD-1789018843399-R1789196124373-52	118.0000	118.0000	available	2026-09-12 06:55:24.373416	2026-09-12 06:55:24.373416
6332	15	PRD-1789018843399-R1789196124374-53	116.1000	116.1000	available	2026-09-12 06:55:24.374218	2026-09-12 06:55:24.374218
6333	15	PRD-1789018843399-R1789196124374-54	83.0000	83.0000	available	2026-09-12 06:55:24.375042	2026-09-12 06:55:24.375042
6334	15	PRD-1789018843399-R1789196124375-55	117.0000	117.0000	available	2026-09-12 06:55:24.375866	2026-09-12 06:55:24.375866
6335	15	PRD-1789018843399-R1789196124376-56	117.0000	117.0000	available	2026-09-12 06:55:24.376659	2026-09-12 06:55:24.376659
6336	15	PRD-1789018843399-R1789196124377-57	117.0000	117.0000	available	2026-09-12 06:55:24.37746	2026-09-12 06:55:24.37746
6337	15	PRD-1789018843399-R1789196124378-58	10.3000	10.3000	available	2026-09-12 06:55:24.378256	2026-09-12 06:55:24.378256
6338	15	PRD-1789018843399-R1789196124378-59	117.2000	117.2000	available	2026-09-12 06:55:24.379087	2026-09-12 06:55:24.379087
6339	15	PRD-1789018843399-R1789196124380-60	117.0000	117.0000	available	2026-09-12 06:55:24.380408	2026-09-12 06:55:24.380408
6340	15	PRD-1789018843399-R1789196124381-61	119.2000	119.2000	available	2026-09-12 06:55:24.381229	2026-09-12 06:55:24.381229
6341	15	PRD-1789018843399-R1789196124381-62	110.9000	110.9000	available	2026-09-12 06:55:24.382104	2026-09-12 06:55:24.382104
6342	15	PRD-1789018843399-R1789196124382-63	114.7000	114.7000	available	2026-09-12 06:55:24.382946	2026-09-12 06:55:24.382946
6343	15	PRD-1789018843399-R1789196124383-64	111.6000	111.6000	available	2026-09-12 06:55:24.383745	2026-09-12 06:55:24.383745
6344	15	PRD-1789018843399-R1789196124384-65	110.8000	110.8000	available	2026-09-12 06:55:24.384544	2026-09-12 06:55:24.384544
6345	15	PRD-1789018843399-R1789196124385-66	112.1000	112.1000	available	2026-09-12 06:55:24.385344	2026-09-12 06:55:24.385344
6346	15	PRD-1789018843399-R1789196124386-67	115.3000	115.3000	available	2026-09-12 06:55:24.386149	2026-09-12 06:55:24.386149
6347	15	PRD-1789018843399-R1789196124386-68	115.0000	115.0000	available	2026-09-12 06:55:24.386961	2026-09-12 06:55:24.386961
6348	15	PRD-1789018843399-R1789196124387-69	114.4000	114.4000	available	2026-09-12 06:55:24.387753	2026-09-12 06:55:24.387753
6349	15	PRD-1789018843399-R1789196124388-70	120.0000	120.0000	available	2026-09-12 06:55:24.388559	2026-09-12 06:55:24.388559
6350	15	PRD-1789018843399-R1789196124389-71	117.0000	117.0000	available	2026-09-12 06:55:24.38936	2026-09-12 06:55:24.38936
6351	15	PRD-1789018843399-R1789196124390-72	107.5000	107.5000	available	2026-09-12 06:55:24.390165	2026-09-12 06:55:24.390165
6352	15	PRD-1789018843399-R1789196124390-73	117.0000	117.0000	available	2026-09-12 06:55:24.390975	2026-09-12 06:55:24.390975
6353	15	PRD-1789018843399-R1789196124391-74	117.0000	117.0000	available	2026-09-12 06:55:24.391774	2026-09-12 06:55:24.391774
6354	15	PRD-1789018843399-R1789196124392-75	117.0000	117.0000	available	2026-09-12 06:55:24.392603	2026-09-12 06:55:24.392603
6355	15	PRD-1789018843399-R1789196124393-76	119.5000	119.5000	available	2026-09-12 06:55:24.393403	2026-09-12 06:55:24.393403
6356	15	PRD-1789018843399-R1789196124394-77	115.9000	115.9000	available	2026-09-12 06:55:24.394199	2026-09-12 06:55:24.394199
6357	15	PRD-1789018843399-R1789196124394-78	115.7000	115.7000	available	2026-09-12 06:55:24.395002	2026-09-12 06:55:24.395002
6358	15	PRD-1789018843399-R1789196124395-79	111.8000	111.8000	available	2026-09-12 06:55:24.395808	2026-09-12 06:55:24.395808
6359	15	PRD-1789018843399-R1789196124396-80	117.0000	117.0000	available	2026-09-12 06:55:24.396605	2026-09-12 06:55:24.396605
6360	73	PRD-1789045777628	117.1000	117.1000	available	2026-09-12 06:55:24.400934	2026-09-12 06:55:24.400934
6361	73	PRD-1789045777628-R1789196124401-1	118.8000	118.8000	available	2026-09-12 06:55:24.401756	2026-09-12 06:55:24.401756
6362	73	PRD-1789045777628-R1789196124402-2	119.4000	119.4000	available	2026-09-12 06:55:24.402626	2026-09-12 06:55:24.402626
6363	73	PRD-1789045777628-R1789196124403-3	113.9000	113.9000	available	2026-09-12 06:55:24.403428	2026-09-12 06:55:24.403428
6364	73	PRD-1789045777628-R1789196124404-4	102.8000	102.8000	available	2026-09-12 06:55:24.404228	2026-09-12 06:55:24.404228
6365	73	PRD-1789045777628-R1789196124404-5	116.1000	116.1000	available	2026-09-12 06:55:24.405024	2026-09-12 06:55:24.405024
6366	73	PRD-1789045777628-R1789196124405-6	120.8000	120.8000	available	2026-09-12 06:55:24.405876	2026-09-12 06:55:24.405876
6367	73	PRD-1789045777628-R1789196124406-7	117.1000	117.1000	available	2026-09-12 06:55:24.406758	2026-09-12 06:55:24.406758
6368	73	PRD-1789045777628-R1789196124407-8	117.0000	117.0000	available	2026-09-12 06:55:24.407563	2026-09-12 06:55:24.407563
6369	73	PRD-1789045777628-R1789196124408-9	117.8000	117.8000	available	2026-09-12 06:55:24.408376	2026-09-12 06:55:24.408376
6370	73	PRD-1789045777628-R1789196124409-10	112.6000	112.6000	available	2026-09-12 06:55:24.409181	2026-09-12 06:55:24.409181
6371	73	PRD-1789045777628-R1789196124409-11	113.1000	113.1000	available	2026-09-12 06:55:24.410002	2026-09-12 06:55:24.410002
6372	73	PRD-1789045777628-R1789196124410-12	122.5000	122.5000	available	2026-09-12 06:55:24.41083	2026-09-12 06:55:24.41083
6373	73	PRD-1789045777628-R1789196124411-13	117.0000	117.0000	available	2026-09-12 06:55:24.411639	2026-09-12 06:55:24.411639
6374	73	PRD-1789045777628-R1789196124412-14	122.7000	122.7000	available	2026-09-12 06:55:24.412532	2026-09-12 06:55:24.412532
6375	73	PRD-1789045777628-R1789196124413-15	117.4000	117.4000	available	2026-09-12 06:55:24.413539	2026-09-12 06:55:24.413539
6376	73	PRD-1789045777628-R1789196124414-16	90.1000	90.1000	available	2026-09-12 06:55:24.414429	2026-09-12 06:55:24.414429
6377	73	PRD-1789045777628-R1789196124415-17	116.0000	116.0000	available	2026-09-12 06:55:24.41529	2026-09-12 06:55:24.41529
6378	73	PRD-1789045777628-R1789196124416-18	121.1000	121.1000	available	2026-09-12 06:55:24.416125	2026-09-12 06:55:24.416125
6379	3	PRD-1789018146360	115.8000	115.8000	available	2026-09-12 06:55:24.420469	2026-09-12 06:55:24.420469
6380	3	PRD-1789018146360-R1789196124421-1	113.9000	113.9000	available	2026-09-12 06:55:24.421453	2026-09-12 06:55:24.421453
6381	3	PRD-1789018146360-R1789196124422-2	120.1000	120.1000	available	2026-09-12 06:55:24.422436	2026-09-12 06:55:24.422436
6382	3	PRD-1789018146360-R1789196124423-3	114.8000	114.8000	available	2026-09-12 06:55:24.423249	2026-09-12 06:55:24.423249
6383	3	PRD-1789018146360-R1789196124424-4	117.9000	117.9000	available	2026-09-12 06:55:24.424121	2026-09-12 06:55:24.424121
6384	3	PRD-1789018146360-R1789196124424-5	120.0000	120.0000	available	2026-09-12 06:55:24.425163	2026-09-12 06:55:24.425163
6385	3	PRD-1789018146360-R1789196124425-6	93.0000	93.0000	available	2026-09-12 06:55:24.426068	2026-09-12 06:55:24.426068
6386	3	PRD-1789018146360-R1789196124426-7	120.2000	120.2000	available	2026-09-12 06:55:24.42688	2026-09-12 06:55:24.42688
6387	3	PRD-1789018146360-R1789196124427-8	120.2000	120.2000	available	2026-09-12 06:55:24.427684	2026-09-12 06:55:24.427684
6388	3	PRD-1789018146360-R1789196124428-9	107.3000	107.3000	available	2026-09-12 06:55:24.428509	2026-09-12 06:55:24.428509
6389	3	PRD-1789018146360-R1789196124429-10	109.1000	109.1000	available	2026-09-12 06:55:24.429303	2026-09-12 06:55:24.429303
6390	3	PRD-1789018146360-R1789196124430-11	113.0000	113.0000	available	2026-09-12 06:55:24.43047	2026-09-12 06:55:24.43047
6391	3	PRD-1789018146360-R1789196124431-12	112.9000	112.9000	available	2026-09-12 06:55:24.431638	2026-09-12 06:55:24.431638
6392	3	PRD-1789018146360-R1789196124432-13	101.9000	101.9000	available	2026-09-12 06:55:24.432719	2026-09-12 06:55:24.432719
6393	3	PRD-1789018146360-R1789196124433-14	113.8000	113.8000	available	2026-09-12 06:55:24.433817	2026-09-12 06:55:24.433817
6394	3	PRD-1789018146360-R1789196124434-15	113.7000	113.7000	available	2026-09-12 06:55:24.434998	2026-09-12 06:55:24.434998
6395	3	PRD-1789018146360-R1789196124436-16	115.3000	115.3000	available	2026-09-12 06:55:24.436162	2026-09-12 06:55:24.436162
6396	3	PRD-1789018146360-R1789196124437-17	116.1000	116.1000	available	2026-09-12 06:55:24.437301	2026-09-12 06:55:24.437301
6397	3	PRD-1789018146360-R1789196124438-18	115.1000	115.1000	available	2026-09-12 06:55:24.438475	2026-09-12 06:55:24.438475
6398	3	PRD-1789018146360-R1789196124439-19	107.4000	107.4000	available	2026-09-12 06:55:24.439282	2026-09-12 06:55:24.439282
6399	3	PRD-1789018146360-R1789196124439-20	118.1000	118.1000	available	2026-09-12 06:55:24.440079	2026-09-12 06:55:24.440079
6400	3	PRD-1789018146360-R1789196124440-21	122.0000	122.0000	available	2026-09-12 06:55:24.440873	2026-09-12 06:55:24.440873
6401	3	PRD-1789018146360-R1789196124441-22	116.3000	116.3000	available	2026-09-12 06:55:24.441669	2026-09-12 06:55:24.441669
6402	3	PRD-1789018146360-R1789196124442-23	151.0000	151.0000	available	2026-09-12 06:55:24.442486	2026-09-12 06:55:24.442486
6403	3	PRD-1789018146360-R1789196124443-24	167.3000	167.3000	available	2026-09-12 06:55:24.4433	2026-09-12 06:55:24.4433
6404	3	PRD-1789018146360-R1789196124443-25	150.0000	150.0000	available	2026-09-12 06:55:24.444102	2026-09-12 06:55:24.444102
6405	3	PRD-1789018146360-R1789196124444-26	144.0000	144.0000	available	2026-09-12 06:55:24.444896	2026-09-12 06:55:24.444896
6406	3	PRD-1789018146360-R1789196124445-27	159.0000	159.0000	available	2026-09-12 06:55:24.44569	2026-09-12 06:55:24.44569
6407	3	PRD-1789018146360-R1789196124446-28	151.0000	151.0000	available	2026-09-12 06:55:24.446555	2026-09-12 06:55:24.446555
6408	63	PRD-1789034575975	120.2000	120.2000	available	2026-09-12 06:55:24.450709	2026-09-12 06:55:24.450709
6409	63	PRD-1789034575975-R1789196124451-1	115.5000	115.5000	available	2026-09-12 06:55:24.451532	2026-09-12 06:55:24.451532
6410	63	PRD-1789034575975-R1789196124452-2	119.8000	119.8000	available	2026-09-12 06:55:24.452346	2026-09-12 06:55:24.452346
6411	63	PRD-1789034575975-R1789196124453-3	115.9000	115.9000	available	2026-09-12 06:55:24.453154	2026-09-12 06:55:24.453154
6412	63	PRD-1789034575975-R1789196124453-4	120.5000	120.5000	available	2026-09-12 06:55:24.453995	2026-09-12 06:55:24.453995
6413	63	PRD-1789034575975-R1789196124454-5	120.0000	120.0000	available	2026-09-12 06:55:24.454809	2026-09-12 06:55:24.454809
6414	63	PRD-1789034575975-R1789196124455-6	107.7000	107.7000	available	2026-09-12 06:55:24.455616	2026-09-12 06:55:24.455616
6415	63	PRD-1789034575975-R1789196124456-7	102.1000	102.1000	available	2026-09-12 06:55:24.456435	2026-09-12 06:55:24.456435
6416	63	PRD-1789034575975-R1789196124457-8	118.3000	118.3000	available	2026-09-12 06:55:24.457246	2026-09-12 06:55:24.457246
6417	63	PRD-1789034575975-R1789196124457-9	118.2000	118.2000	available	2026-09-12 06:55:24.458142	2026-09-12 06:55:24.458142
6418	63	PRD-1789034575975-R1789196124458-10	120.0000	120.0000	available	2026-09-12 06:55:24.458961	2026-09-12 06:55:24.458961
6419	63	PRD-1789034575975-R1789196124459-11	120.0000	120.0000	available	2026-09-12 06:55:24.459765	2026-09-12 06:55:24.459765
6420	63	PRD-1789034575975-R1789196124460-12	120.4000	120.4000	available	2026-09-12 06:55:24.460575	2026-09-12 06:55:24.460575
6421	63	PRD-1789034575975-R1789196124461-13	120.2000	120.2000	available	2026-09-12 06:55:24.461379	2026-09-12 06:55:24.461379
6422	63	PRD-1789034575975-R1789196124462-14	120.0000	120.0000	available	2026-09-12 06:55:24.46218	2026-09-12 06:55:24.46218
6423	63	PRD-1789034575975-R1789196124462-15	105.2000	105.2000	available	2026-09-12 06:55:24.462988	2026-09-12 06:55:24.462988
6424	63	PRD-1789034575975-R1789196124463-16	113.8000	113.8000	available	2026-09-12 06:55:24.463796	2026-09-12 06:55:24.463796
6425	63	PRD-1789034575975-R1789196124464-17	116.7000	116.7000	available	2026-09-12 06:55:24.464599	2026-09-12 06:55:24.464599
6426	63	PRD-1789034575975-R1789196124465-18	113.4000	113.4000	available	2026-09-12 06:55:24.46562	2026-09-12 06:55:24.46562
6427	63	PRD-1789034575975-R1789196124466-19	113.7000	113.7000	available	2026-09-12 06:55:24.466476	2026-09-12 06:55:24.466476
6428	63	PRD-1789034575975-R1789196124467-20	120.6000	120.6000	available	2026-09-12 06:55:24.467288	2026-09-12 06:55:24.467288
6429	63	PRD-1789034575975-R1789196124468-21	120.5000	120.5000	available	2026-09-12 06:55:24.468139	2026-09-12 06:55:24.468139
6430	63	PRD-1789034575975-R1789196124468-22	135.5000	135.5000	available	2026-09-12 06:55:24.468943	2026-09-12 06:55:24.468943
6431	63	PRD-1789034575975-R1789196124469-23	121.0000	121.0000	available	2026-09-12 06:55:24.469746	2026-09-12 06:55:24.469746
6432	63	PRD-1789034575975-R1789196124470-24	117.0000	117.0000	available	2026-09-12 06:55:24.470585	2026-09-12 06:55:24.470585
6433	63	PRD-1789034575975-R1789196124471-25	113.6000	113.6000	available	2026-09-12 06:55:24.471385	2026-09-12 06:55:24.471385
6434	63	PRD-1789034575975-R1789196124472-26	113.5000	113.5000	available	2026-09-12 06:55:24.472225	2026-09-12 06:55:24.472225
6435	63	PRD-1789034575975-R1789196124472-27	103.8000	103.8000	available	2026-09-12 06:55:24.473021	2026-09-12 06:55:24.473021
6436	63	PRD-1789034575975-R1789196124473-28	120.5000	120.5000	available	2026-09-12 06:55:24.47383	2026-09-12 06:55:24.47383
6437	63	PRD-1789034575975-R1789196124474-29	120.5000	120.5000	available	2026-09-12 06:55:24.474649	2026-09-12 06:55:24.474649
6438	63	PRD-1789034575975-R1789196124475-30	119.4000	119.4000	available	2026-09-12 06:55:24.475456	2026-09-12 06:55:24.475456
6439	63	PRD-1789034575975-R1789196124476-31	120.4000	120.4000	available	2026-09-12 06:55:24.476256	2026-09-12 06:55:24.476256
6440	63	PRD-1789034575975-R1789196124476-32	154.3000	154.3000	available	2026-09-12 06:55:24.477052	2026-09-12 06:55:24.477052
6441	63	PRD-1789034575975-R1789196124477-33	120.0000	120.0000	available	2026-09-12 06:55:24.477901	2026-09-12 06:55:24.477901
6442	63	PRD-1789034575975-R1789196124478-34	120.0000	120.0000	available	2026-09-12 06:55:24.47872	2026-09-12 06:55:24.47872
6443	63	PRD-1789034575975-R1789196124479-35	120.0000	120.0000	available	2026-09-12 06:55:24.479515	2026-09-12 06:55:24.479515
6444	63	PRD-1789034575975-R1789196124480-36	112.0000	112.0000	available	2026-09-12 06:55:24.480311	2026-09-12 06:55:24.480311
6445	63	PRD-1789034575975-R1789196124480-37	113.0000	113.0000	available	2026-09-12 06:55:24.481107	2026-09-12 06:55:24.481107
6446	63	PRD-1789034575975-R1789196124481-38	120.0000	120.0000	available	2026-09-12 06:55:24.481937	2026-09-12 06:55:24.481937
6447	63	PRD-1789034575975-R1789196124482-39	120.4000	120.4000	available	2026-09-12 06:55:24.482737	2026-09-12 06:55:24.482737
6448	63	PRD-1789034575975-R1789196124483-40	118.8000	118.8000	available	2026-09-12 06:55:24.483545	2026-09-12 06:55:24.483545
6449	63	PRD-1789034575975-R1789196124484-41	116.6000	116.6000	available	2026-09-12 06:55:24.484341	2026-09-12 06:55:24.484341
6450	63	PRD-1789034575975-R1789196124485-42	120.2000	120.2000	available	2026-09-12 06:55:24.485387	2026-09-12 06:55:24.485387
6451	63	PRD-1789034575975-R1789196124486-43	118.1000	118.1000	available	2026-09-12 06:55:24.486204	2026-09-12 06:55:24.486204
6452	63	PRD-1789034575975-R1789196124486-44	60.0000	60.0000	available	2026-09-12 06:55:24.48701	2026-09-12 06:55:24.48701
6453	63	PRD-1789034575975-R1789196124487-45	53.3000	53.3000	available	2026-09-12 06:55:24.487866	2026-09-12 06:55:24.487866
6454	63	PRD-1789034575975-R1789196124488-46	60.0000	60.0000	available	2026-09-12 06:55:24.488757	2026-09-12 06:55:24.488757
6455	63	PRD-1789034575975-R1789196124489-47	60.0000	60.0000	available	2026-09-12 06:55:24.48956	2026-09-12 06:55:24.48956
6456	63	PRD-1789034575975-R1789196124490-48	54.3000	54.3000	available	2026-09-12 06:55:24.490372	2026-09-12 06:55:24.490372
6457	63	PRD-1789034575975-R1789196124491-49	57.8000	57.8000	available	2026-09-12 06:55:24.491201	2026-09-12 06:55:24.491201
6458	63	PRD-1789034575975-R1789196124491-50	60.0000	60.0000	available	2026-09-12 06:55:24.492003	2026-09-12 06:55:24.492003
6459	63	PRD-1789034575975-R1789196124492-51	60.0000	60.0000	available	2026-09-12 06:55:24.492811	2026-09-12 06:55:24.492811
6460	63	PRD-1789034575975-R1789196124493-52	60.0000	60.0000	available	2026-09-12 06:55:24.49361	2026-09-12 06:55:24.49361
6461	70	PRD-1789038376650	117.4000	117.4000	available	2026-09-12 06:55:24.497537	2026-09-12 06:55:24.497537
6462	70	PRD-1789038376650-R1789196124498-1	115.0000	115.0000	available	2026-09-12 06:55:24.498368	2026-09-12 06:55:24.498368
6463	70	PRD-1789038376650-R1789196124499-2	115.0000	115.0000	available	2026-09-12 06:55:24.499186	2026-09-12 06:55:24.499186
6464	70	PRD-1789038376650-R1789196124499-3	110.7000	110.7000	available	2026-09-12 06:55:24.499995	2026-09-12 06:55:24.499995
6465	70	PRD-1789038376650-R1789196124500-4	120.6000	120.6000	available	2026-09-12 06:55:24.500801	2026-09-12 06:55:24.500801
6466	70	PRD-1789038376650-R1789196124501-5	117.8000	117.8000	available	2026-09-12 06:55:24.501614	2026-09-12 06:55:24.501614
6467	70	PRD-1789038376650-R1789196124502-6	118.3000	118.3000	available	2026-09-12 06:55:24.502428	2026-09-12 06:55:24.502428
6468	70	PRD-1789038376650-R1789196124503-7	120.4000	120.4000	available	2026-09-12 06:55:24.503237	2026-09-12 06:55:24.503237
6469	70	PRD-1789038376650-R1789196124503-8	100.8000	100.8000	available	2026-09-12 06:55:24.504043	2026-09-12 06:55:24.504043
6470	70	PRD-1789038376650-R1789196124504-9	119.4000	119.4000	available	2026-09-12 06:55:24.504849	2026-09-12 06:55:24.504849
6471	70	PRD-1789038376650-R1789196124505-10	114.0000	114.0000	available	2026-09-12 06:55:24.505892	2026-09-12 06:55:24.505892
6472	70	PRD-1789038376650-R1789196124506-11	114.0000	114.0000	available	2026-09-12 06:55:24.506704	2026-09-12 06:55:24.506704
6473	70	PRD-1789038376650-R1789196124507-12	117.0000	117.0000	available	2026-09-12 06:55:24.507513	2026-09-12 06:55:24.507513
6474	70	PRD-1789038376650-R1789196124508-13	110.7000	110.7000	available	2026-09-12 06:55:24.508334	2026-09-12 06:55:24.508334
6475	70	PRD-1789038376650-R1789196124509-14	117.0000	117.0000	available	2026-09-12 06:55:24.509138	2026-09-12 06:55:24.509138
6476	70	PRD-1789038376650-R1789196124509-15	124.8000	124.8000	available	2026-09-12 06:55:24.509999	2026-09-12 06:55:24.509999
6477	70	PRD-1789038376650-R1789196124510-16	112.1000	112.1000	available	2026-09-12 06:55:24.510904	2026-09-12 06:55:24.510904
6478	74	PRD-1789100074879	113.9000	113.9000	available	2026-09-12 06:55:24.514875	2026-09-12 06:55:24.514875
6479	74	PRD-1789100074879-R1789196124515-1	105.8000	105.8000	available	2026-09-12 06:55:24.515704	2026-09-12 06:55:24.515704
6480	74	PRD-1789100074879-R1789196124516-2	110.8000	110.8000	available	2026-09-12 06:55:24.516515	2026-09-12 06:55:24.516515
6481	74	PRD-1789100074879-R1789196124517-3	108.7000	108.7000	available	2026-09-12 06:55:24.517461	2026-09-12 06:55:24.517461
6482	74	PRD-1789100074879-R1789196124518-4	100.7000	100.7000	available	2026-09-12 06:55:24.518306	2026-09-12 06:55:24.518306
6483	74	PRD-1789100074879-R1789196124519-5	106.0000	106.0000	available	2026-09-12 06:55:24.519131	2026-09-12 06:55:24.519131
6484	74	PRD-1789100074879-R1789196124519-6	112.9000	112.9000	available	2026-09-12 06:55:24.519941	2026-09-12 06:55:24.519941
6485	74	PRD-1789100074879-R1789196124520-7	107.5000	107.5000	available	2026-09-12 06:55:24.520742	2026-09-12 06:55:24.520742
6486	74	PRD-1789100074879-R1789196124521-8	105.2000	105.2000	available	2026-09-12 06:55:24.521542	2026-09-12 06:55:24.521542
6487	74	PRD-1789100074879-R1789196124522-9	106.4000	106.4000	available	2026-09-12 06:55:24.522348	2026-09-12 06:55:24.522348
6488	74	PRD-1789100074879-R1789196124523-10	116.6000	116.6000	available	2026-09-12 06:55:24.523151	2026-09-12 06:55:24.523151
6489	74	PRD-1789100074879-R1789196124523-11	120.0000	120.0000	available	2026-09-12 06:55:24.52395	2026-09-12 06:55:24.52395
6490	74	PRD-1789100074879-R1789196124524-12	114.1000	114.1000	available	2026-09-12 06:55:24.524755	2026-09-12 06:55:24.524755
6491	74	PRD-1789100074879-R1789196124525-13	112.1000	112.1000	available	2026-09-12 06:55:24.525553	2026-09-12 06:55:24.525553
6492	74	PRD-1789100074879-R1789196124526-14	94.5000	94.5000	available	2026-09-12 06:55:24.526431	2026-09-12 06:55:24.526431
6493	74	PRD-1789100074879-R1789196124527-15	113.8000	113.8000	available	2026-09-12 06:55:24.527233	2026-09-12 06:55:24.527233
6494	74	PRD-1789100074879-R1789196124527-16	117.7000	117.7000	available	2026-09-12 06:55:24.528042	2026-09-12 06:55:24.528042
6495	74	PRD-1789100074879-R1789196124528-17	117.8000	117.8000	available	2026-09-12 06:55:24.528839	2026-09-12 06:55:24.528839
6496	74	PRD-1789100074879-R1789196124529-18	116.9000	116.9000	available	2026-09-12 06:55:24.529635	2026-09-12 06:55:24.529635
6497	74	PRD-1789100074879-R1789196124530-19	121.0000	121.0000	available	2026-09-12 06:55:24.530483	2026-09-12 06:55:24.530483
6498	74	PRD-1789100074879-R1789196124531-20	111.8000	111.8000	available	2026-09-12 06:55:24.531325	2026-09-12 06:55:24.531325
6499	74	PRD-1789100074879-R1789196124532-21	110.2000	110.2000	available	2026-09-12 06:55:24.53215	2026-09-12 06:55:24.53215
6500	74	PRD-1789100074879-R1789196124532-22	110.8000	110.8000	available	2026-09-12 06:55:24.53295	2026-09-12 06:55:24.53295
6501	74	PRD-1789100074879-R1789196124533-23	109.0000	109.0000	available	2026-09-12 06:55:24.533749	2026-09-12 06:55:24.533749
6502	74	PRD-1789100074879-R1789196124534-24	112.5000	112.5000	available	2026-09-12 06:55:24.534585	2026-09-12 06:55:24.534585
6503	74	PRD-1789100074879-R1789196124535-25	107.8000	107.8000	available	2026-09-12 06:55:24.535381	2026-09-12 06:55:24.535381
6504	74	PRD-1789100074879-R1789196124536-26	118.5000	118.5000	available	2026-09-12 06:55:24.536176	2026-09-12 06:55:24.536176
6505	74	PRD-1789100074879-R1789196124536-27	108.3000	108.3000	available	2026-09-12 06:55:24.536975	2026-09-12 06:55:24.536975
6506	74	PRD-1789100074879-R1789196124537-28	109.6000	109.6000	available	2026-09-12 06:55:24.537772	2026-09-12 06:55:24.537772
6507	74	PRD-1789100074879-R1789196124538-29	109.2000	109.2000	available	2026-09-12 06:55:24.538588	2026-09-12 06:55:24.538588
6508	74	PRD-1789100074879-R1789196124539-30	108.4000	108.4000	available	2026-09-12 06:55:24.539754	2026-09-12 06:55:24.539754
6509	74	PRD-1789100074879-R1789196124540-31	106.6000	106.6000	available	2026-09-12 06:55:24.54093	2026-09-12 06:55:24.54093
6510	74	PRD-1789100074879-R1789196124541-32	104.2000	104.2000	available	2026-09-12 06:55:24.54211	2026-09-12 06:55:24.54211
6511	74	PRD-1789100074879-R1789196124543-33	104.2000	104.2000	available	2026-09-12 06:55:24.543266	2026-09-12 06:55:24.543266
6512	74	PRD-1789100074879-R1789196124544-34	106.3000	106.3000	available	2026-09-12 06:55:24.544423	2026-09-12 06:55:24.544423
6513	74	PRD-1789100074879-R1789196124545-35	113.0000	113.0000	available	2026-09-12 06:55:24.54558	2026-09-12 06:55:24.54558
6514	74	PRD-1789100074879-R1789196124546-36	104.4000	104.4000	available	2026-09-12 06:55:24.546785	2026-09-12 06:55:24.546785
6515	74	PRD-1789100074879-R1789196124547-37	117.4000	117.4000	available	2026-09-12 06:55:24.547981	2026-09-12 06:55:24.547981
6516	74	PRD-1789100074879-R1789196124548-38	120.0000	120.0000	available	2026-09-12 06:55:24.548781	2026-09-12 06:55:24.548781
6517	74	PRD-1789100074879-R1789196124549-39	116.8000	116.8000	available	2026-09-12 06:55:24.549577	2026-09-12 06:55:24.549577
6518	74	PRD-1789100074879-R1789196124550-40	102.8000	102.8000	available	2026-09-12 06:55:24.550396	2026-09-12 06:55:24.550396
6519	74	PRD-1789100074879-R1789196124551-41	118.2000	118.2000	available	2026-09-12 06:55:24.551199	2026-09-12 06:55:24.551199
6520	74	PRD-1789100074879-R1789196124551-42	120.0000	120.0000	available	2026-09-12 06:55:24.552001	2026-09-12 06:55:24.552001
6521	74	PRD-1789100074879-R1789196124552-43	106.5000	106.5000	available	2026-09-12 06:55:24.552799	2026-09-12 06:55:24.552799
6522	74	PRD-1789100074879-R1789196124553-44	107.5000	107.5000	available	2026-09-12 06:55:24.553665	2026-09-12 06:55:24.553665
6523	74	PRD-1789100074879-R1789196124554-45	125.6000	125.6000	available	2026-09-12 06:55:24.554747	2026-09-12 06:55:24.554747
6524	74	PRD-1789100074879-R1789196124555-46	110.7000	110.7000	available	2026-09-12 06:55:24.555746	2026-09-12 06:55:24.555746
6525	80	PRD-1789106539801	123.4000	123.4000	available	2026-09-12 06:55:24.559898	2026-09-12 06:55:24.559898
6526	80	PRD-1789106539801-R1789196124560-1	119.8000	119.8000	available	2026-09-12 06:55:24.56072	2026-09-12 06:55:24.56072
6527	80	PRD-1789106539801-R1789196124561-2	118.4000	118.4000	available	2026-09-12 06:55:24.561541	2026-09-12 06:55:24.561541
6528	80	PRD-1789106539801-R1789196124562-3	117.9000	117.9000	available	2026-09-12 06:55:24.562382	2026-09-12 06:55:24.562382
6529	80	PRD-1789106539801-R1789196124563-4	136.0000	136.0000	available	2026-09-12 06:55:24.563193	2026-09-12 06:55:24.563193
6530	80	PRD-1789106539801-R1789196124563-5	123.0000	123.0000	available	2026-09-12 06:55:24.56402	2026-09-12 06:55:24.56402
6531	80	PRD-1789106539801-R1789196124564-6	132.3000	132.3000	available	2026-09-12 06:55:24.564843	2026-09-12 06:55:24.564843
6532	80	PRD-1789106539801-R1789196124565-7	118.1000	118.1000	available	2026-09-12 06:55:24.565662	2026-09-12 06:55:24.565662
6533	80	PRD-1789106539801-R1789196124566-8	106.6000	106.6000	available	2026-09-12 06:55:24.566487	2026-09-12 06:55:24.566487
6534	80	PRD-1789106539801-R1789196124567-9	124.8000	124.8000	available	2026-09-12 06:55:24.567315	2026-09-12 06:55:24.567315
6535	80	PRD-1789106539801-R1789196124568-10	123.0000	123.0000	available	2026-09-12 06:55:24.568127	2026-09-12 06:55:24.568127
6536	80	PRD-1789106539801-R1789196124568-11	120.6000	120.6000	available	2026-09-12 06:55:24.569109	2026-09-12 06:55:24.569109
6537	80	PRD-1789106539801-R1789196124569-12	120.4000	120.4000	available	2026-09-12 06:55:24.569954	2026-09-12 06:55:24.569954
6538	75	PRD-1789100510082	100.0000	100.0000	available	2026-09-12 06:55:24.573772	2026-09-12 06:55:24.573772
6539	75	PRD-1789100510082-R1789196124574-1	112.5000	112.5000	available	2026-09-12 06:55:24.574614	2026-09-12 06:55:24.574614
6540	75	PRD-1789100510082-R1789196124575-2	113.5000	113.5000	available	2026-09-12 06:55:24.575419	2026-09-12 06:55:24.575419
6541	75	PRD-1789100510082-R1789196124576-3	112.3000	112.3000	available	2026-09-12 06:55:24.576223	2026-09-12 06:55:24.576223
6542	75	PRD-1789100510082-R1789196124576-4	110.9000	110.9000	available	2026-09-12 06:55:24.577016	2026-09-12 06:55:24.577016
6543	75	PRD-1789100510082-R1789196124577-5	100.2000	100.2000	available	2026-09-12 06:55:24.577864	2026-09-12 06:55:24.577864
6544	75	PRD-1789100510082-R1789196124578-6	105.0000	105.0000	available	2026-09-12 06:55:24.578762	2026-09-12 06:55:24.578762
6545	75	PRD-1789100510082-R1789196124579-7	114.0000	114.0000	available	2026-09-12 06:55:24.579569	2026-09-12 06:55:24.579569
6546	75	PRD-1789100510082-R1789196124580-8	108.3000	108.3000	available	2026-09-12 06:55:24.58037	2026-09-12 06:55:24.58037
6547	75	PRD-1789100510082-R1789196124581-9	112.3000	112.3000	available	2026-09-12 06:55:24.581172	2026-09-12 06:55:24.581172
6548	75	PRD-1789100510082-R1789196124581-10	117.4000	117.4000	available	2026-09-12 06:55:24.581995	2026-09-12 06:55:24.581995
6549	75	PRD-1789100510082-R1789196124582-11	113.0000	113.0000	available	2026-09-12 06:55:24.582799	2026-09-12 06:55:24.582799
6550	75	PRD-1789100510082-R1789196124583-12	109.6000	109.6000	available	2026-09-12 06:55:24.5836	2026-09-12 06:55:24.5836
6551	75	PRD-1789100510082-R1789196124584-13	106.9000	106.9000	available	2026-09-12 06:55:24.584407	2026-09-12 06:55:24.584407
6552	75	PRD-1789100510082-R1789196124585-14	112.5000	112.5000	available	2026-09-12 06:55:24.585207	2026-09-12 06:55:24.585207
6553	75	PRD-1789100510082-R1789196124585-15	109.1000	109.1000	available	2026-09-12 06:55:24.586051	2026-09-12 06:55:24.586051
6554	75	PRD-1789100510082-R1789196124586-16	119.3000	119.3000	available	2026-09-12 06:55:24.586856	2026-09-12 06:55:24.586856
6555	75	PRD-1789100510082-R1789196124587-17	101.4000	101.4000	available	2026-09-12 06:55:24.58767	2026-09-12 06:55:24.58767
6556	75	PRD-1789100510082-R1789196124588-18	100.0000	100.0000	available	2026-09-12 06:55:24.588521	2026-09-12 06:55:24.588521
6557	75	PRD-1789100510082-R1789196124589-19	103.9000	103.9000	available	2026-09-12 06:55:24.589424	2026-09-12 06:55:24.589424
6558	75	PRD-1789100510082-R1789196124590-20	100.1000	100.1000	available	2026-09-12 06:55:24.590232	2026-09-12 06:55:24.590232
6559	75	PRD-1789100510082-R1789196124590-21	106.6000	106.6000	available	2026-09-12 06:55:24.59104	2026-09-12 06:55:24.59104
6560	75	PRD-1789100510082-R1789196124591-22	100.3000	100.3000	available	2026-09-12 06:55:24.591838	2026-09-12 06:55:24.591838
6561	87	PRD-1789185718780-R1789196909453-0	152.2000	152.2000	available	2026-09-12 07:08:29.454101	2026-09-12 07:08:29.454101
6562	87	PRD-1789185718780-R1789196909454-1	88.5000	88.5000	available	2026-09-12 07:08:29.455115	2026-09-12 07:08:29.455115
6563	87	PRD-1789185718780-R1789196909455-2	91.5000	91.5000	available	2026-09-12 07:08:29.455989	2026-09-12 07:08:29.455989
6564	87	PRD-1789185718780-R1789196909456-3	82.2000	82.2000	available	2026-09-12 07:08:29.456831	2026-09-12 07:08:29.456831
6565	87	PRD-1789185718780-R1789196909458-4	111.0000	111.0000	available	2026-09-12 07:08:29.458252	2026-09-12 07:08:29.458252
6566	87	PRD-1789185718780-R1789196909458-5	112.2000	112.2000	available	2026-09-12 07:08:29.459111	2026-09-12 07:08:29.459111
6567	87	PRD-1789185718780-R1789196909459-6	112.5000	112.5000	available	2026-09-12 07:08:29.459951	2026-09-12 07:08:29.459951
6568	87	PRD-1789185718780-R1789196909460-7	111.0000	111.0000	available	2026-09-12 07:08:29.46077	2026-09-12 07:08:29.46077
6569	87	PRD-1789185718780-R1789196909461-8	111.1000	111.1000	available	2026-09-12 07:08:29.461597	2026-09-12 07:08:29.461597
6570	87	PRD-1789185718780-R1789196909462-9	112.0000	112.0000	available	2026-09-12 07:08:29.462414	2026-09-12 07:08:29.462414
6571	87	PRD-1789185718780-R1789196909463-10	110.3000	110.3000	available	2026-09-12 07:08:29.463202	2026-09-12 07:08:29.463202
6572	87	PRD-1789185718780-R1789196909463-11	107.6000	107.6000	available	2026-09-12 07:08:29.464003	2026-09-12 07:08:29.464003
6573	87	PRD-1789185718780-R1789196909464-12	90.6000	90.6000	available	2026-09-12 07:08:29.464781	2026-09-12 07:08:29.464781
6574	87	PRD-1789185718780-R1789196909465-13	117.2000	117.2000	available	2026-09-12 07:08:29.465589	2026-09-12 07:08:29.465589
6575	87	PRD-1789185718780-R1789196909466-14	110.2000	110.2000	available	2026-09-12 07:08:29.466368	2026-09-12 07:08:29.466368
6576	87	PRD-1789185718780-R1789196909467-15	100.6000	100.6000	available	2026-09-12 07:08:29.467163	2026-09-12 07:08:29.467163
6577	87	PRD-1789185718780-R1789196909467-16	86.2000	86.2000	available	2026-09-12 07:08:29.467934	2026-09-12 07:08:29.467934
6578	87	PRD-1789185718780-R1789196909468-17	126.1000	126.1000	available	2026-09-12 07:08:29.468732	2026-09-12 07:08:29.468732
6579	87	PRD-1789185718780-R1789196909469-18	111.4000	111.4000	available	2026-09-12 07:08:29.469504	2026-09-12 07:08:29.469504
6580	87	PRD-1789185718780-R1789196909470-19	132.9000	132.9000	available	2026-09-12 07:08:29.4703	2026-09-12 07:08:29.4703
6581	87	PRD-1789185718780-R1789196909470-20	111.5000	111.5000	available	2026-09-12 07:08:29.471067	2026-09-12 07:08:29.471067
6582	87	PRD-1789185718780-R1789196909471-21	110.7000	110.7000	available	2026-09-12 07:08:29.471871	2026-09-12 07:08:29.471871
6583	87	PRD-1789185718780-R1789196909472-22	110.5000	110.5000	available	2026-09-12 07:08:29.472634	2026-09-12 07:08:29.472634
6584	87	PRD-1789185718780-R1789196909473-23	111.1000	111.1000	available	2026-09-12 07:08:29.473425	2026-09-12 07:08:29.473425
6585	87	PRD-1789185718780-R1789196909474-24	113.1000	113.1000	available	2026-09-12 07:08:29.474224	2026-09-12 07:08:29.474224
6586	87	PRD-1789185718780-R1789196909474-25	107.3000	107.3000	available	2026-09-12 07:08:29.474986	2026-09-12 07:08:29.474986
6587	87	PRD-1789185718780-R1789196909475-26	111.4000	111.4000	available	2026-09-12 07:08:29.475811	2026-09-12 07:08:29.475811
6588	87	PRD-1789185718780-R1789196909476-27	112.2000	112.2000	available	2026-09-12 07:08:29.476708	2026-09-12 07:08:29.476708
6589	87	PRD-1789185718780-R1789196909477-28	107.6000	107.6000	available	2026-09-12 07:08:29.477489	2026-09-12 07:08:29.477489
6590	87	PRD-1789185718780-R1789196909478-29	122.6000	122.6000	available	2026-09-12 07:08:29.478292	2026-09-12 07:08:29.478292
6591	87	PRD-1789185718780-R1789196909478-30	112.0000	112.0000	available	2026-09-12 07:08:29.479069	2026-09-12 07:08:29.479069
6592	87	PRD-1789185718780-R1789196909479-31	88.5000	88.5000	available	2026-09-12 07:08:29.479896	2026-09-12 07:08:29.479896
6593	87	PRD-1789185718780-R1789196909480-32	92.2000	92.2000	available	2026-09-12 07:08:29.480672	2026-09-12 07:08:29.480672
6594	87	PRD-1789185718780-R1789196909481-33	114.8000	114.8000	available	2026-09-12 07:08:29.481484	2026-09-12 07:08:29.481484
6595	87	PRD-1789185718780-R1789196909482-34	79.0000	79.0000	available	2026-09-12 07:08:29.482246	2026-09-12 07:08:29.482246
6596	87	PRD-1789185718780-R1789196909482-35	111.0000	111.0000	available	2026-09-12 07:08:29.483041	2026-09-12 07:08:29.483041
6597	83	PRD-1789108443715-R1789196909488-0	88.6000	88.6000	available	2026-09-12 07:08:29.488148	2026-09-12 07:08:29.488148
6598	83	PRD-1789108443715-R1789196909488-1	137.7000	137.7000	available	2026-09-12 07:08:29.489009	2026-09-12 07:08:29.489009
6599	83	PRD-1789108443715-R1789196909489-2	132.1000	132.1000	available	2026-09-12 07:08:29.489837	2026-09-12 07:08:29.489837
6600	83	PRD-1789108443715-R1789196909490-3	70.4000	70.4000	available	2026-09-12 07:08:29.490624	2026-09-12 07:08:29.490624
6601	83	PRD-1789108443715-R1789196909491-4	113.0000	113.0000	available	2026-09-12 07:08:29.49144	2026-09-12 07:08:29.49144
6602	83	PRD-1789108443715-R1789196909492-5	108.7000	108.7000	available	2026-09-12 07:08:29.492527	2026-09-12 07:08:29.492527
6603	83	PRD-1789108443715-R1789196909493-6	123.6000	123.6000	available	2026-09-12 07:08:29.493637	2026-09-12 07:08:29.493637
6604	83	PRD-1789108443715-R1789196909494-7	130.9000	130.9000	available	2026-09-12 07:08:29.4947	2026-09-12 07:08:29.4947
6605	83	PRD-1789108443715-R1789196909495-8	103.3000	103.3000	available	2026-09-12 07:08:29.495794	2026-09-12 07:08:29.495794
6606	83	PRD-1789108443715-R1789196909496-9	112.0000	112.0000	available	2026-09-12 07:08:29.496889	2026-09-12 07:08:29.496889
6607	83	PRD-1789108443715-R1789196909497-10	112.6000	112.6000	available	2026-09-12 07:08:29.498011	2026-09-12 07:08:29.498011
6608	83	PRD-1789108443715-R1789196909498-11	104.7000	104.7000	available	2026-09-12 07:08:29.499085	2026-09-12 07:08:29.499085
6609	83	PRD-1789108443715-R1789196909500-12	106.0000	106.0000	available	2026-09-12 07:08:29.500172	2026-09-12 07:08:29.500172
6610	83	PRD-1789108443715-R1789196909500-13	105.8000	105.8000	available	2026-09-12 07:08:29.500987	2026-09-12 07:08:29.500987
6611	83	PRD-1789108443715-R1789196909501-14	112.7000	112.7000	available	2026-09-12 07:08:29.501806	2026-09-12 07:08:29.501806
6612	83	PRD-1789108443715-R1789196909502-15	92.0000	92.0000	available	2026-09-12 07:08:29.502591	2026-09-12 07:08:29.502591
6613	83	PRD-1789108443715-R1789196909503-16	110.5000	110.5000	available	2026-09-12 07:08:29.503406	2026-09-12 07:08:29.503406
6614	83	PRD-1789108443715-R1789196909504-17	99.4000	99.4000	available	2026-09-12 07:08:29.504191	2026-09-12 07:08:29.504191
6615	83	PRD-1789108443715-R1789196909504-18	112.4000	112.4000	available	2026-09-12 07:08:29.505	2026-09-12 07:08:29.505
6616	83	PRD-1789108443715-R1789196909505-19	120.2000	120.2000	available	2026-09-12 07:08:29.505788	2026-09-12 07:08:29.505788
6617	83	PRD-1789108443715-R1789196909506-20	75.3000	75.3000	available	2026-09-12 07:08:29.506614	2026-09-12 07:08:29.506614
6618	83	PRD-1789108443715-R1789196909507-21	129.2000	129.2000	available	2026-09-12 07:08:29.507407	2026-09-12 07:08:29.507407
6619	83	PRD-1789108443715-R1789196909508-22	113.7000	113.7000	available	2026-09-12 07:08:29.508224	2026-09-12 07:08:29.508224
6620	83	PRD-1789108443715-R1789196909508-23	123.9000	123.9000	available	2026-09-12 07:08:29.509034	2026-09-12 07:08:29.509034
6621	83	PRD-1789108443715-R1789196909509-24	120.0000	120.0000	available	2026-09-12 07:08:29.509842	2026-09-12 07:08:29.509842
6622	83	PRD-1789108443715-R1789196909510-25	113.5000	113.5000	available	2026-09-12 07:08:29.510632	2026-09-12 07:08:29.510632
6623	83	PRD-1789108443715-R1789196909511-26	115.5000	115.5000	available	2026-09-12 07:08:29.511448	2026-09-12 07:08:29.511448
6624	83	PRD-1789108443715-R1789196909512-27	113.3000	113.3000	available	2026-09-12 07:08:29.512224	2026-09-12 07:08:29.512224
6625	83	PRD-1789108443715-R1789196909512-28	121.2000	121.2000	available	2026-09-12 07:08:29.513046	2026-09-12 07:08:29.513046
6626	83	PRD-1789108443715-R1789196909513-29	116.3000	116.3000	available	2026-09-12 07:08:29.513827	2026-09-12 07:08:29.513827
6627	83	PRD-1789108443715-R1789196909514-30	117.0000	117.0000	available	2026-09-12 07:08:29.514635	2026-09-12 07:08:29.514635
6628	83	PRD-1789108443715-R1789196909515-31	123.1000	123.1000	available	2026-09-12 07:08:29.515422	2026-09-12 07:08:29.515422
6629	83	PRD-1789108443715-R1789196909516-32	124.9000	124.9000	available	2026-09-12 07:08:29.516241	2026-09-12 07:08:29.516241
6630	83	PRD-1789108443715-R1789196909516-33	121.4000	121.4000	available	2026-09-12 07:08:29.517097	2026-09-12 07:08:29.517097
6631	83	PRD-1789108443715-R1789196909517-34	80.3000	80.3000	available	2026-09-12 07:08:29.517906	2026-09-12 07:08:29.517906
6632	83	PRD-1789108443715-R1789196909518-35	114.0000	114.0000	available	2026-09-12 07:08:29.518699	2026-09-12 07:08:29.518699
6633	83	PRD-1789108443715-R1789196909519-36	68.6000	68.6000	available	2026-09-12 07:08:29.51978	2026-09-12 07:08:29.51978
6634	83	PRD-1789108443715-R1789196909520-37	122.0000	122.0000	available	2026-09-12 07:08:29.520626	2026-09-12 07:08:29.520626
6635	83	PRD-1789108443715-R1789196909521-38	107.5000	107.5000	available	2026-09-12 07:08:29.521471	2026-09-12 07:08:29.521471
6636	83	PRD-1789108443715-R1789196909522-39	103.1000	103.1000	available	2026-09-12 07:08:29.522251	2026-09-12 07:08:29.522251
6637	83	PRD-1789108443715-R1789196909522-40	111.5000	111.5000	available	2026-09-12 07:08:29.52307	2026-09-12 07:08:29.52307
6638	83	PRD-1789108443715-R1789196909523-41	114.0000	114.0000	available	2026-09-12 07:08:29.523883	2026-09-12 07:08:29.523883
6639	83	PRD-1789108443715-R1789196909524-42	1.0000	1.0000	available	2026-09-12 07:08:29.524726	2026-09-12 07:08:29.524726
6640	84	PRD-1789108470883-R1789196909528-0	112.7000	112.7000	available	2026-09-12 07:08:29.528731	2026-09-12 07:08:29.528731
6641	84	PRD-1789108470883-R1789196909529-1	116.3000	116.3000	available	2026-09-12 07:08:29.529521	2026-09-12 07:08:29.529521
6642	84	PRD-1789108470883-R1789196909530-2	93.0000	93.0000	available	2026-09-12 07:08:29.530341	2026-09-12 07:08:29.530341
6643	84	PRD-1789108470883-R1789196909531-3	115.0000	115.0000	available	2026-09-12 07:08:29.531156	2026-09-12 07:08:29.531156
6644	84	PRD-1789108470883-R1789196909531-4	124.4000	124.4000	available	2026-09-12 07:08:29.531976	2026-09-12 07:08:29.531976
6645	84	PRD-1789108470883-R1789196909532-5	126.2000	126.2000	available	2026-09-12 07:08:29.53276	2026-09-12 07:08:29.53276
6646	84	PRD-1789108470883-R1789196909533-6	113.4000	113.4000	available	2026-09-12 07:08:29.533583	2026-09-12 07:08:29.533583
6647	84	PRD-1789108470883-R1789196909534-7	99.5000	99.5000	available	2026-09-12 07:08:29.534392	2026-09-12 07:08:29.534392
6648	84	PRD-1789108470883-R1789196909535-8	105.8000	105.8000	available	2026-09-12 07:08:29.535278	2026-09-12 07:08:29.535278
6649	84	PRD-1789108470883-R1789196909535-9	104.5000	104.5000	available	2026-09-12 07:08:29.536086	2026-09-12 07:08:29.536086
6650	84	PRD-1789108470883-R1789196909536-10	127.8000	127.8000	available	2026-09-12 07:08:29.536905	2026-09-12 07:08:29.536905
6651	84	PRD-1789108470883-R1789196909537-11	113.7000	113.7000	available	2026-09-12 07:08:29.53769	2026-09-12 07:08:29.53769
6652	84	PRD-1789108470883-R1789196909538-12	112.4000	112.4000	available	2026-09-12 07:08:29.538523	2026-09-12 07:08:29.538523
6653	84	PRD-1789108470883-R1789196909539-13	120.4000	120.4000	available	2026-09-12 07:08:29.539846	2026-09-12 07:08:29.539846
6654	84	PRD-1789108470883-R1789196909540-14	103.5000	103.5000	available	2026-09-12 07:08:29.540666	2026-09-12 07:08:29.540666
6655	84	PRD-1789108470883-R1789196909541-15	102.0000	102.0000	available	2026-09-12 07:08:29.541448	2026-09-12 07:08:29.541448
6656	84	PRD-1789108470883-R1789196909542-16	90.6000	90.6000	available	2026-09-12 07:08:29.542256	2026-09-12 07:08:29.542256
6657	84	PRD-1789108470883-R1789196909542-17	102.7000	102.7000	available	2026-09-12 07:08:29.543044	2026-09-12 07:08:29.543044
6658	84	PRD-1789108470883-R1789196909543-18	121.6000	121.6000	available	2026-09-12 07:08:29.543845	2026-09-12 07:08:29.543845
6659	84	PRD-1789108470883-R1789196909544-19	110.0000	110.0000	available	2026-09-12 07:08:29.544633	2026-09-12 07:08:29.544633
6660	84	PRD-1789108470883-R1789196909545-20	110.6000	110.6000	available	2026-09-12 07:08:29.54545	2026-09-12 07:08:29.54545
6661	84	PRD-1789108470883-R1789196909546-21	99.1000	99.1000	available	2026-09-12 07:08:29.546231	2026-09-12 07:08:29.546231
6662	84	PRD-1789108470883-R1789196909546-22	126.3000	126.3000	available	2026-09-12 07:08:29.547048	2026-09-12 07:08:29.547048
6663	84	PRD-1789108470883-R1789196909547-23	130.5000	130.5000	available	2026-09-12 07:08:29.547877	2026-09-12 07:08:29.547877
6664	84	PRD-1789108470883-R1789196909548-24	118.6000	118.6000	available	2026-09-12 07:08:29.548669	2026-09-12 07:08:29.548669
6665	84	PRD-1789108470883-R1789196909549-25	113.7000	113.7000	available	2026-09-12 07:08:29.549456	2026-09-12 07:08:29.549456
6666	84	PRD-1789108470883-R1789196909550-26	98.1000	98.1000	available	2026-09-12 07:08:29.550282	2026-09-12 07:08:29.550282
6667	84	PRD-1789108470883-R1789196909550-27	115.0000	115.0000	available	2026-09-12 07:08:29.551076	2026-09-12 07:08:29.551076
6668	84	PRD-1789108470883-R1789196909551-28	121.3000	121.3000	available	2026-09-12 07:08:29.551894	2026-09-12 07:08:29.551894
6669	84	PRD-1789108470883-R1789196909552-29	122.9000	122.9000	available	2026-09-12 07:08:29.552708	2026-09-12 07:08:29.552708
6670	85	PRD-1789108493046-R1789196909556-0	112.6000	112.6000	available	2026-09-12 07:08:29.556649	2026-09-12 07:08:29.556649
6671	85	PRD-1789108493046-R1789196909557-1	115.6000	115.6000	available	2026-09-12 07:08:29.557508	2026-09-12 07:08:29.557508
6672	85	PRD-1789108493046-R1789196909558-2	111.3000	111.3000	available	2026-09-12 07:08:29.558316	2026-09-12 07:08:29.558316
6673	85	PRD-1789108493046-R1789196909559-3	111.7000	111.7000	available	2026-09-12 07:08:29.559258	2026-09-12 07:08:29.559258
6674	85	PRD-1789108493046-R1789196909560-4	124.2000	124.2000	available	2026-09-12 07:08:29.560542	2026-09-12 07:08:29.560542
6675	85	PRD-1789108493046-R1789196909561-5	112.4000	112.4000	available	2026-09-12 07:08:29.561377	2026-09-12 07:08:29.561377
6676	85	PRD-1789108493046-R1789196909562-6	109.7000	109.7000	available	2026-09-12 07:08:29.562172	2026-09-12 07:08:29.562172
6677	85	PRD-1789108493046-R1789196909562-7	115.9000	115.9000	available	2026-09-12 07:08:29.563009	2026-09-12 07:08:29.563009
6678	85	PRD-1789108493046-R1789196909563-8	113.8000	113.8000	available	2026-09-12 07:08:29.563793	2026-09-12 07:08:29.563793
6679	85	PRD-1789108493046-R1789196909564-9	111.7000	111.7000	available	2026-09-12 07:08:29.564629	2026-09-12 07:08:29.564629
6680	85	PRD-1789108493046-R1789196909565-10	111.3000	111.3000	available	2026-09-12 07:08:29.565457	2026-09-12 07:08:29.565457
6681	85	PRD-1789108493046-R1789196909566-11	111.9000	111.9000	available	2026-09-12 07:08:29.566241	2026-09-12 07:08:29.566241
6682	85	PRD-1789108493046-R1789196909566-12	137.5000	137.5000	available	2026-09-12 07:08:29.567057	2026-09-12 07:08:29.567057
6683	85	PRD-1789108493046-R1789196909567-13	112.2000	112.2000	available	2026-09-12 07:08:29.567845	2026-09-12 07:08:29.567845
6684	85	PRD-1789108493046-R1789196909568-14	110.7000	110.7000	available	2026-09-12 07:08:29.568664	2026-09-12 07:08:29.568664
6685	85	PRD-1789108493046-R1789196909569-15	110.5000	110.5000	available	2026-09-12 07:08:29.569463	2026-09-12 07:08:29.569463
6686	85	PRD-1789108493046-R1789196909570-16	139.2000	139.2000	available	2026-09-12 07:08:29.570276	2026-09-12 07:08:29.570276
6687	85	PRD-1789108493046-R1789196909570-17	131.5000	131.5000	available	2026-09-12 07:08:29.571085	2026-09-12 07:08:29.571085
6688	85	PRD-1789108493046-R1789196909571-18	113.3000	113.3000	available	2026-09-12 07:08:29.571912	2026-09-12 07:08:29.571912
6689	85	PRD-1789108493046-R1789196909572-19	139.2000	139.2000	available	2026-09-12 07:08:29.572711	2026-09-12 07:08:29.572711
6690	85	PRD-1789108493046-R1789196909573-20	112.2000	112.2000	available	2026-09-12 07:08:29.573531	2026-09-12 07:08:29.573531
6691	85	PRD-1789108493046-R1789196909574-21	100.5000	100.5000	available	2026-09-12 07:08:29.574314	2026-09-12 07:08:29.574314
6692	85	PRD-1789108493046-R1789196909575-22	133.0000	133.0000	available	2026-09-12 07:08:29.575125	2026-09-12 07:08:29.575125
6693	85	PRD-1789108493046-R1789196909575-23	148.4000	148.4000	available	2026-09-12 07:08:29.57592	2026-09-12 07:08:29.57592
6694	85	PRD-1789108493046-R1789196909576-24	111.2000	111.2000	available	2026-09-12 07:08:29.576829	2026-09-12 07:08:29.576829
6695	85	PRD-1789108493046-R1789196909577-25	111.8000	111.8000	available	2026-09-12 07:08:29.5777	2026-09-12 07:08:29.5777
6696	85	PRD-1789108493046-R1789196909578-26	112.6000	112.6000	available	2026-09-12 07:08:29.57858	2026-09-12 07:08:29.57858
6697	85	PRD-1789108493046-R1789196909579-27	107.2000	107.2000	available	2026-09-12 07:08:29.579445	2026-09-12 07:08:29.579445
6698	85	PRD-1789108493046-R1789196909580-28	120.7000	120.7000	available	2026-09-12 07:08:29.580246	2026-09-12 07:08:29.580246
6699	85	PRD-1789108493046-R1789196909580-29	109.5000	109.5000	available	2026-09-12 07:08:29.581096	2026-09-12 07:08:29.581096
6700	85	PRD-1789108493046-R1789196909581-30	110.6000	110.6000	available	2026-09-12 07:08:29.581893	2026-09-12 07:08:29.581893
6701	85	PRD-1789108493046-R1789196909582-31	111.3000	111.3000	available	2026-09-12 07:08:29.582701	2026-09-12 07:08:29.582701
6702	85	PRD-1789108493046-R1789196909583-32	111.2000	111.2000	available	2026-09-12 07:08:29.583502	2026-09-12 07:08:29.583502
6703	85	PRD-1789108493046-R1789196909584-33	112.1000	112.1000	available	2026-09-12 07:08:29.584341	2026-09-12 07:08:29.584341
6704	85	PRD-1789108493046-R1789196909585-34	1.0000	1.0000	available	2026-09-12 07:08:29.585166	2026-09-12 07:08:29.585166
6705	85	PRD-1789108493046-R1789196909585-35	107.6000	107.6000	available	2026-09-12 07:08:29.586048	2026-09-12 07:08:29.586048
6706	85	PRD-1789108493046-R1789196909586-36	111.1000	111.1000	available	2026-09-12 07:08:29.586992	2026-09-12 07:08:29.586992
6707	85	PRD-1789108493046-R1789196909587-37	136.8000	136.8000	available	2026-09-12 07:08:29.587824	2026-09-12 07:08:29.587824
6708	85	PRD-1789108493046-R1789196909588-38	110.7000	110.7000	available	2026-09-12 07:08:29.588692	2026-09-12 07:08:29.588692
6709	85	PRD-1789108493046-R1789196909589-39	111.4000	111.4000	available	2026-09-12 07:08:29.589559	2026-09-12 07:08:29.589559
6710	85	PRD-1789108493046-R1789196909590-40	111.0000	111.0000	available	2026-09-12 07:08:29.590396	2026-09-12 07:08:29.590396
6711	85	PRD-1789108493046-R1789196909591-41	111.3000	111.3000	available	2026-09-12 07:08:29.591247	2026-09-12 07:08:29.591247
6712	85	PRD-1789108493046-R1789196909591-42	110.8000	110.8000	available	2026-09-12 07:08:29.592041	2026-09-12 07:08:29.592041
6713	85	PRD-1789108493046-R1789196909592-43	110.2000	110.2000	available	2026-09-12 07:08:29.592848	2026-09-12 07:08:29.592848
6714	85	PRD-1789108493046-R1789196909593-44	110.7000	110.7000	available	2026-09-12 07:08:29.593648	2026-09-12 07:08:29.593648
6715	85	PRD-1789108493046-R1789196909594-45	112.3000	112.3000	available	2026-09-12 07:08:29.594493	2026-09-12 07:08:29.594493
6716	85	PRD-1789108493046-R1789196909595-46	127.2000	127.2000	available	2026-09-12 07:08:29.595284	2026-09-12 07:08:29.595284
6717	85	PRD-1789108493046-R1789196909595-47	85.5000	85.5000	available	2026-09-12 07:08:29.596099	2026-09-12 07:08:29.596099
6718	85	PRD-1789108493046-R1789196909596-48	110.9000	110.9000	available	2026-09-12 07:08:29.596939	2026-09-12 07:08:29.596939
6719	85	PRD-1789108493046-R1789196909597-49	111.5000	111.5000	available	2026-09-12 07:08:29.597845	2026-09-12 07:08:29.597845
6720	85	PRD-1789108493046-R1789196909598-50	110.2000	110.2000	available	2026-09-12 07:08:29.598708	2026-09-12 07:08:29.598708
6721	85	PRD-1789108493046-R1789196909599-51	114.2000	114.2000	available	2026-09-12 07:08:29.599561	2026-09-12 07:08:29.599561
6722	85	PRD-1789108493046-R1789196909600-52	111.7000	111.7000	available	2026-09-12 07:08:29.600424	2026-09-12 07:08:29.600424
6723	85	PRD-1789108493046-R1789196909601-53	100.4000	100.4000	available	2026-09-12 07:08:29.601561	2026-09-12 07:08:29.601561
6724	85	PRD-1789108493046-R1789196909602-54	116.7000	116.7000	available	2026-09-12 07:08:29.602723	2026-09-12 07:08:29.602723
6725	85	PRD-1789108493046-R1789196909603-55	111.4000	111.4000	available	2026-09-12 07:08:29.603853	2026-09-12 07:08:29.603853
6726	85	PRD-1789108493046-R1789196909604-56	110.5000	110.5000	available	2026-09-12 07:08:29.605002	2026-09-12 07:08:29.605002
6727	85	PRD-1789108493046-R1789196909606-57	112.0000	112.0000	available	2026-09-12 07:08:29.606122	2026-09-12 07:08:29.606122
6728	85	PRD-1789108493046-R1789196909607-58	109.5000	109.5000	available	2026-09-12 07:08:29.6072	2026-09-12 07:08:29.6072
6729	85	PRD-1789108493046-R1789196909608-59	109.9000	109.9000	available	2026-09-12 07:08:29.60831	2026-09-12 07:08:29.60831
6730	85	PRD-1789108493046-R1789196909609-60	118.8000	118.8000	available	2026-09-12 07:08:29.609413	2026-09-12 07:08:29.609413
6731	85	PRD-1789108493046-R1789196909610-61	116.6000	116.6000	available	2026-09-12 07:08:29.610235	2026-09-12 07:08:29.610235
6732	85	PRD-1789108493046-R1789196909610-62	114.1000	114.1000	available	2026-09-12 07:08:29.611021	2026-09-12 07:08:29.611021
6733	86	PRD-1789108513217-R1789196909614-0	111.1000	111.1000	available	2026-09-12 07:08:29.615069	2026-09-12 07:08:29.615069
6734	86	PRD-1789108513217-R1789196909615-1	102.8000	102.8000	available	2026-09-12 07:08:29.615922	2026-09-12 07:08:29.615922
6735	86	PRD-1789108513217-R1789196909616-2	120.8000	120.8000	available	2026-09-12 07:08:29.616712	2026-09-12 07:08:29.616712
6736	86	PRD-1789108513217-R1789196909617-3	117.5000	117.5000	available	2026-09-12 07:08:29.617528	2026-09-12 07:08:29.617528
6737	86	PRD-1789108513217-R1789196909618-4	114.2000	114.2000	available	2026-09-12 07:08:29.618318	2026-09-12 07:08:29.618318
6738	86	PRD-1789108513217-R1789196909619-5	110.2000	110.2000	available	2026-09-12 07:08:29.619132	2026-09-12 07:08:29.619132
6739	86	PRD-1789108513217-R1789196909619-6	111.3000	111.3000	available	2026-09-12 07:08:29.619912	2026-09-12 07:08:29.619912
6740	86	PRD-1789108513217-R1789196909620-7	126.1000	126.1000	available	2026-09-12 07:08:29.620736	2026-09-12 07:08:29.620736
6741	86	PRD-1789108513217-R1789196909621-8	138.2000	138.2000	available	2026-09-12 07:08:29.621519	2026-09-12 07:08:29.621519
6742	86	PRD-1789108513217-R1789196909622-9	128.0000	128.0000	available	2026-09-12 07:08:29.622323	2026-09-12 07:08:29.622323
6743	86	PRD-1789108513217-R1789196909623-10	110.1000	110.1000	available	2026-09-12 07:08:29.623584	2026-09-12 07:08:29.623584
6744	86	PRD-1789108513217-R1789196909624-11	108.8000	108.8000	available	2026-09-12 07:08:29.62442	2026-09-12 07:08:29.62442
6745	86	PRD-1789108513217-R1789196909625-12	106.7000	106.7000	available	2026-09-12 07:08:29.625221	2026-09-12 07:08:29.625221
6746	86	PRD-1789108513217-R1789196909625-13	110.3000	110.3000	available	2026-09-12 07:08:29.626036	2026-09-12 07:08:29.626036
6747	86	PRD-1789108513217-R1789196909626-14	122.0000	122.0000	available	2026-09-12 07:08:29.626817	2026-09-12 07:08:29.626817
6748	86	PRD-1789108513217-R1789196909627-15	110.3000	110.3000	available	2026-09-12 07:08:29.627793	2026-09-12 07:08:29.627793
6749	86	PRD-1789108513217-R1789196909628-16	108.8000	108.8000	available	2026-09-12 07:08:29.62865	2026-09-12 07:08:29.62865
6750	86	PRD-1789108513217-R1789196909629-17	109.9000	109.9000	available	2026-09-12 07:08:29.629484	2026-09-12 07:08:29.629484
6751	86	PRD-1789108513217-R1789196909630-18	111.2000	111.2000	available	2026-09-12 07:08:29.630275	2026-09-12 07:08:29.630275
6752	86	PRD-1789108513217-R1789196909630-19	111.7000	111.7000	available	2026-09-12 07:08:29.631108	2026-09-12 07:08:29.631108
6753	86	PRD-1789108513217-R1789196909631-20	48.8000	48.8000	available	2026-09-12 07:08:29.631915	2026-09-12 07:08:29.631915
6754	86	PRD-1789108513217-R1789196909632-21	97.2000	97.2000	available	2026-09-12 07:08:29.632746	2026-09-12 07:08:29.632746
6755	86	PRD-1789108513217-R1789196909633-22	111.7000	111.7000	available	2026-09-12 07:08:29.633533	2026-09-12 07:08:29.633533
6756	86	PRD-1789108513217-R1789196909634-23	108.6000	108.6000	available	2026-09-12 07:08:29.634336	2026-09-12 07:08:29.634336
6757	86	PRD-1789108513217-R1789196909634-24	110.2000	110.2000	available	2026-09-12 07:08:29.635109	2026-09-12 07:08:29.635109
6758	86	PRD-1789108513217-R1789196909635-25	110.5000	110.5000	available	2026-09-12 07:08:29.635917	2026-09-12 07:08:29.635917
6759	86	PRD-1789108513217-R1789196909636-26	113.8000	113.8000	available	2026-09-12 07:08:29.636706	2026-09-12 07:08:29.636706
6760	86	PRD-1789108513217-R1789196909637-27	111.3000	111.3000	available	2026-09-12 07:08:29.637492	2026-09-12 07:08:29.637492
6761	86	PRD-1789108513217-R1789196909638-28	104.0000	104.0000	available	2026-09-12 07:08:29.638304	2026-09-12 07:08:29.638304
6762	86	PRD-1789108513217-R1789196909638-29	104.1000	104.1000	available	2026-09-12 07:08:29.639083	2026-09-12 07:08:29.639083
6763	86	PRD-1789108513217-R1789196909639-30	111.1000	111.1000	available	2026-09-12 07:08:29.639881	2026-09-12 07:08:29.639881
6764	86	PRD-1789108513217-R1789196909640-31	110.2000	110.2000	available	2026-09-12 07:08:29.640658	2026-09-12 07:08:29.640658
6765	86	PRD-1789108513217-R1789196909641-32	119.8000	119.8000	available	2026-09-12 07:08:29.641467	2026-09-12 07:08:29.641467
6766	86	PRD-1789108513217-R1789196909642-33	109.5000	109.5000	available	2026-09-12 07:08:29.642602	2026-09-12 07:08:29.642602
6767	86	PRD-1789108513217-R1789196909643-34	109.8000	109.8000	available	2026-09-12 07:08:29.643403	2026-09-12 07:08:29.643403
6768	86	PRD-1789108513217-R1789196909644-35	109.3000	109.3000	available	2026-09-12 07:08:29.644179	2026-09-12 07:08:29.644179
6769	86	PRD-1789108513217-R1789196909644-36	116.5000	116.5000	available	2026-09-12 07:08:29.644994	2026-09-12 07:08:29.644994
6770	86	PRD-1789108513217-R1789196909645-37	109.3000	109.3000	available	2026-09-12 07:08:29.645776	2026-09-12 07:08:29.645776
6771	86	PRD-1789108513217-R1789196909646-38	111.2000	111.2000	available	2026-09-12 07:08:29.646576	2026-09-12 07:08:29.646576
6772	86	PRD-1789108513217-R1789196909647-39	110.5000	110.5000	available	2026-09-12 07:08:29.647373	2026-09-12 07:08:29.647373
6773	86	PRD-1789108513217-R1789196909648-40	110.9000	110.9000	available	2026-09-12 07:08:29.648185	2026-09-12 07:08:29.648185
6774	86	PRD-1789108513217-R1789196909648-41	118.0000	118.0000	available	2026-09-12 07:08:29.649013	2026-09-12 07:08:29.649013
6775	86	PRD-1789108513217-R1789196909649-42	123.3000	123.3000	available	2026-09-12 07:08:29.649793	2026-09-12 07:08:29.649793
6776	86	PRD-1789108513217-R1789196909650-43	110.7000	110.7000	available	2026-09-12 07:08:29.650614	2026-09-12 07:08:29.650614
6777	86	PRD-1789108513217-R1789196909651-44	141.3000	141.3000	available	2026-09-12 07:08:29.651389	2026-09-12 07:08:29.651389
6778	86	PRD-1789108513217-R1789196909652-45	110.5000	110.5000	available	2026-09-12 07:08:29.652199	2026-09-12 07:08:29.652199
6779	86	PRD-1789108513217-R1789196909652-46	111.5000	111.5000	available	2026-09-12 07:08:29.653011	2026-09-12 07:08:29.653011
6780	86	PRD-1789108513217-R1789196909653-47	116.1000	116.1000	available	2026-09-12 07:08:29.653851	2026-09-12 07:08:29.653851
6781	86	PRD-1789108513217-R1789196909654-48	100.7000	100.7000	available	2026-09-12 07:08:29.654642	2026-09-12 07:08:29.654642
6782	86	PRD-1789108513217-R1789196909655-49	148.4000	148.4000	available	2026-09-12 07:08:29.655439	2026-09-12 07:08:29.655439
6783	86	PRD-1789108513217-R1789196909656-50	111.5000	111.5000	available	2026-09-12 07:08:29.656215	2026-09-12 07:08:29.656215
6784	86	PRD-1789108513217-R1789196909656-51	104.9000	104.9000	available	2026-09-12 07:08:29.657038	2026-09-12 07:08:29.657038
6785	86	PRD-1789108513217-R1789196909657-52	88.0000	88.0000	available	2026-09-12 07:08:29.657883	2026-09-12 07:08:29.657883
6786	86	PRD-1789108513217-R1789196909658-53	110.9000	110.9000	available	2026-09-12 07:08:29.658699	2026-09-12 07:08:29.658699
6787	86	PRD-1789108513217-R1789196909659-54	112.5000	112.5000	available	2026-09-12 07:08:29.659481	2026-09-12 07:08:29.659481
6788	86	PRD-1789108513217-R1789196909660-55	88.5000	88.5000	available	2026-09-12 07:08:29.660288	2026-09-12 07:08:29.660288
6789	86	PRD-1789108513217-R1789196909661-56	111.5000	111.5000	available	2026-09-12 07:08:29.661118	2026-09-12 07:08:29.661118
6790	86	PRD-1789108513217-R1789196909662-57	110.5000	110.5000	available	2026-09-12 07:08:29.662293	2026-09-12 07:08:29.662293
6791	86	PRD-1789108513217-R1789196909662-58	110.2000	110.2000	available	2026-09-12 07:08:29.663076	2026-09-12 07:08:29.663076
6792	86	PRD-1789108513217-R1789196909663-59	108.5000	108.5000	available	2026-09-12 07:08:29.663904	2026-09-12 07:08:29.663904
6793	86	PRD-1789108513217-R1789196909664-60	115.0000	115.0000	available	2026-09-12 07:08:29.664686	2026-09-12 07:08:29.664686
6794	86	PRD-1789108513217-R1789196909665-61	111.1000	111.1000	available	2026-09-12 07:08:29.665495	2026-09-12 07:08:29.665495
6795	86	PRD-1789108513217-R1789196909666-62	114.5000	114.5000	available	2026-09-12 07:08:29.66631	2026-09-12 07:08:29.66631
6796	86	PRD-1789108513217-R1789196909667-63	110.0000	110.0000	available	2026-09-12 07:08:29.667129	2026-09-12 07:08:29.667129
6797	86	PRD-1789108513217-R1789196909667-64	113.5000	113.5000	available	2026-09-12 07:08:29.667912	2026-09-12 07:08:29.667912
6798	86	PRD-1789108513217-R1789196909668-65	110.5000	110.5000	available	2026-09-12 07:08:29.668723	2026-09-12 07:08:29.668723
6799	86	PRD-1789108513217-R1789196909669-66	130.5000	130.5000	available	2026-09-12 07:08:29.669544	2026-09-12 07:08:29.669544
6800	86	PRD-1789108513217-R1789196909670-67	109.1000	109.1000	available	2026-09-12 07:08:29.670354	2026-09-12 07:08:29.670354
6801	86	PRD-1789108513217-R1789196909671-68	120.8000	120.8000	available	2026-09-12 07:08:29.671134	2026-09-12 07:08:29.671134
6802	86	PRD-1789108513217-R1789196909671-69	109.8000	109.8000	available	2026-09-12 07:08:29.671952	2026-09-12 07:08:29.671952
6803	86	PRD-1789108513217-R1789196909672-70	123.5000	123.5000	available	2026-09-12 07:08:29.672749	2026-09-12 07:08:29.672749
6804	86	PRD-1789108513217-R1789196909673-71	90.1000	90.1000	available	2026-09-12 07:08:29.673559	2026-09-12 07:08:29.673559
6805	86	PRD-1789108513217-R1789196909674-72	109.5000	109.5000	available	2026-09-12 07:08:29.674339	2026-09-12 07:08:29.674339
6806	86	PRD-1789108513217-R1789196909675-73	112.1000	112.1000	available	2026-09-12 07:08:29.675151	2026-09-12 07:08:29.675151
6807	81	PRD-1789108282287-R1789196909679-0	100.4000	100.4000	available	2026-09-12 07:08:29.67919	2026-09-12 07:08:29.67919
6808	81	PRD-1789108282287-R1789196909679-1	100.7000	100.7000	available	2026-09-12 07:08:29.679991	2026-09-12 07:08:29.679991
6809	81	PRD-1789108282287-R1789196909680-2	101.5000	101.5000	available	2026-09-12 07:08:29.680818	2026-09-12 07:08:29.680818
6810	81	PRD-1789108282287-R1789196909681-3	101.6000	101.6000	available	2026-09-12 07:08:29.681601	2026-09-12 07:08:29.681601
6811	81	PRD-1789108282287-R1789196909682-4	103.5000	103.5000	available	2026-09-12 07:08:29.682786	2026-09-12 07:08:29.682786
6812	81	PRD-1789108282287-R1789196909683-5	103.5000	103.5000	available	2026-09-12 07:08:29.683561	2026-09-12 07:08:29.683561
6813	81	PRD-1789108282287-R1789196909684-6	104.3000	104.3000	available	2026-09-12 07:08:29.684399	2026-09-12 07:08:29.684399
6814	81	PRD-1789108282287-R1789196909685-7	104.4000	104.4000	available	2026-09-12 07:08:29.685194	2026-09-12 07:08:29.685194
6815	81	PRD-1789108282287-R1789196909685-8	104.4000	104.4000	available	2026-09-12 07:08:29.686039	2026-09-12 07:08:29.686039
6816	81	PRD-1789108282287-R1789196909686-9	105.0000	105.0000	available	2026-09-12 07:08:29.686841	2026-09-12 07:08:29.686841
6817	81	PRD-1789108282287-R1789196909687-10	105.0000	105.0000	available	2026-09-12 07:08:29.68765	2026-09-12 07:08:29.68765
6818	81	PRD-1789108282287-R1789196909688-11	105.0000	105.0000	available	2026-09-12 07:08:29.688575	2026-09-12 07:08:29.688575
6819	81	PRD-1789108282287-R1789196909689-12	105.4000	105.4000	available	2026-09-12 07:08:29.689422	2026-09-12 07:08:29.689422
6820	81	PRD-1789108282287-R1789196909690-13	105.6000	105.6000	available	2026-09-12 07:08:29.690205	2026-09-12 07:08:29.690205
6821	81	PRD-1789108282287-R1789196909690-14	105.8000	105.8000	available	2026-09-12 07:08:29.691023	2026-09-12 07:08:29.691023
6822	81	PRD-1789108282287-R1789196909691-15	105.9000	105.9000	available	2026-09-12 07:08:29.691819	2026-09-12 07:08:29.691819
6823	81	PRD-1789108282287-R1789196909692-16	105.9000	105.9000	available	2026-09-12 07:08:29.692631	2026-09-12 07:08:29.692631
6824	81	PRD-1789108282287-R1789196909693-17	106.0000	106.0000	available	2026-09-12 07:08:29.693425	2026-09-12 07:08:29.693425
6825	81	PRD-1789108282287-R1789196909694-18	106.0000	106.0000	available	2026-09-12 07:08:29.694244	2026-09-12 07:08:29.694244
6826	81	PRD-1789108282287-R1789196909694-19	106.1000	106.1000	available	2026-09-12 07:08:29.695025	2026-09-12 07:08:29.695025
6827	81	PRD-1789108282287-R1789196909695-20	106.2000	106.2000	available	2026-09-12 07:08:29.695847	2026-09-12 07:08:29.695847
6828	81	PRD-1789108282287-R1789196909696-21	106.2000	106.2000	available	2026-09-12 07:08:29.696634	2026-09-12 07:08:29.696634
6829	81	PRD-1789108282287-R1789196909697-22	106.3000	106.3000	available	2026-09-12 07:08:29.69746	2026-09-12 07:08:29.69746
6830	81	PRD-1789108282287-R1789196909698-23	106.4000	106.4000	available	2026-09-12 07:08:29.698258	2026-09-12 07:08:29.698258
6831	81	PRD-1789108282287-R1789196909698-24	106.4000	106.4000	available	2026-09-12 07:08:29.699069	2026-09-12 07:08:29.699069
6832	81	PRD-1789108282287-R1789196909699-25	106.5000	106.5000	available	2026-09-12 07:08:29.699849	2026-09-12 07:08:29.699849
6833	81	PRD-1789108282287-R1789196909700-26	106.5000	106.5000	available	2026-09-12 07:08:29.700669	2026-09-12 07:08:29.700669
6834	81	PRD-1789108282287-R1789196909701-27	106.7000	106.7000	available	2026-09-12 07:08:29.701466	2026-09-12 07:08:29.701466
6835	81	PRD-1789108282287-R1789196909702-28	106.7000	106.7000	available	2026-09-12 07:08:29.702692	2026-09-12 07:08:29.702692
6836	81	PRD-1789108282287-R1789196909703-29	107.0000	107.0000	available	2026-09-12 07:08:29.703476	2026-09-12 07:08:29.703476
6837	81	PRD-1789108282287-R1789196909704-30	107.0000	107.0000	available	2026-09-12 07:08:29.704295	2026-09-12 07:08:29.704295
6838	81	PRD-1789108282287-R1789196909705-31	107.0000	107.0000	available	2026-09-12 07:08:29.705116	2026-09-12 07:08:29.705116
6839	81	PRD-1789108282287-R1789196909705-32	107.0000	107.0000	available	2026-09-12 07:08:29.705932	2026-09-12 07:08:29.705932
6840	81	PRD-1789108282287-R1789196909706-33	107.1000	107.1000	available	2026-09-12 07:08:29.706728	2026-09-12 07:08:29.706728
6841	81	PRD-1789108282287-R1789196909707-34	107.1000	107.1000	available	2026-09-12 07:08:29.707579	2026-09-12 07:08:29.707579
6842	81	PRD-1789108282287-R1789196909708-35	107.1000	107.1000	available	2026-09-12 07:08:29.708444	2026-09-12 07:08:29.708444
6843	81	PRD-1789108282287-R1789196909709-36	107.1000	107.1000	available	2026-09-12 07:08:29.709265	2026-09-12 07:08:29.709265
6844	81	PRD-1789108282287-R1789196909710-37	107.1000	107.1000	available	2026-09-12 07:08:29.710334	2026-09-12 07:08:29.710334
6845	81	PRD-1789108282287-R1789196909711-38	107.1000	107.1000	available	2026-09-12 07:08:29.711445	2026-09-12 07:08:29.711445
6846	81	PRD-1789108282287-R1789196909712-39	107.2000	107.2000	available	2026-09-12 07:08:29.712532	2026-09-12 07:08:29.712532
6847	81	PRD-1789108282287-R1789196909713-40	107.3000	107.3000	available	2026-09-12 07:08:29.713637	2026-09-12 07:08:29.713637
6848	81	PRD-1789108282287-R1789196909714-41	107.3000	107.3000	available	2026-09-12 07:08:29.714699	2026-09-12 07:08:29.714699
6849	81	PRD-1789108282287-R1789196909715-42	107.3000	107.3000	available	2026-09-12 07:08:29.715797	2026-09-12 07:08:29.715797
6850	81	PRD-1789108282287-R1789196909716-43	107.3000	107.3000	available	2026-09-12 07:08:29.716855	2026-09-12 07:08:29.716855
6851	81	PRD-1789108282287-R1789196909717-44	107.3000	107.3000	available	2026-09-12 07:08:29.717976	2026-09-12 07:08:29.717976
6852	81	PRD-1789108282287-R1789196909718-45	107.4000	107.4000	available	2026-09-12 07:08:29.71879	2026-09-12 07:08:29.71879
6853	81	PRD-1789108282287-R1789196909719-46	107.5000	107.5000	available	2026-09-12 07:08:29.719654	2026-09-12 07:08:29.719654
6854	81	PRD-1789108282287-R1789196909720-47	107.5000	107.5000	available	2026-09-12 07:08:29.720466	2026-09-12 07:08:29.720466
6855	81	PRD-1789108282287-R1789196909721-48	107.5000	107.5000	available	2026-09-12 07:08:29.72128	2026-09-12 07:08:29.72128
6856	81	PRD-1789108282287-R1789196909721-49	107.5000	107.5000	available	2026-09-12 07:08:29.722066	2026-09-12 07:08:29.722066
6857	81	PRD-1789108282287-R1789196909722-50	107.5000	107.5000	available	2026-09-12 07:08:29.722877	2026-09-12 07:08:29.722877
6858	81	PRD-1789108282287-R1789196909723-51	107.5000	107.5000	available	2026-09-12 07:08:29.723656	2026-09-12 07:08:29.723656
6859	81	PRD-1789108282287-R1789196909724-52	107.5000	107.5000	available	2026-09-12 07:08:29.724476	2026-09-12 07:08:29.724476
6860	81	PRD-1789108282287-R1789196909725-53	107.6000	107.6000	available	2026-09-12 07:08:29.725264	2026-09-12 07:08:29.725264
6861	81	PRD-1789108282287-R1789196909725-54	107.6000	107.6000	available	2026-09-12 07:08:29.726076	2026-09-12 07:08:29.726076
6862	81	PRD-1789108282287-R1789196909726-55	107.7000	107.7000	available	2026-09-12 07:08:29.72686	2026-09-12 07:08:29.72686
6863	81	PRD-1789108282287-R1789196909727-56	107.7000	107.7000	available	2026-09-12 07:08:29.727679	2026-09-12 07:08:29.727679
6864	81	PRD-1789108282287-R1789196909728-57	107.8000	107.8000	available	2026-09-12 07:08:29.728529	2026-09-12 07:08:29.728529
6865	81	PRD-1789108282287-R1789196909729-58	107.9000	107.9000	available	2026-09-12 07:08:29.729388	2026-09-12 07:08:29.729388
6866	81	PRD-1789108282287-R1789196909730-59	107.9000	107.9000	available	2026-09-12 07:08:29.730175	2026-09-12 07:08:29.730175
6867	81	PRD-1789108282287-R1789196909730-60	107.9000	107.9000	available	2026-09-12 07:08:29.730994	2026-09-12 07:08:29.730994
6868	81	PRD-1789108282287-R1789196909731-61	107.9000	107.9000	available	2026-09-12 07:08:29.731781	2026-09-12 07:08:29.731781
6869	81	PRD-1789108282287-R1789196909732-62	108.0000	108.0000	available	2026-09-12 07:08:29.732597	2026-09-12 07:08:29.732597
6870	81	PRD-1789108282287-R1789196909733-63	108.0000	108.0000	available	2026-09-12 07:08:29.733383	2026-09-12 07:08:29.733383
6871	81	PRD-1789108282287-R1789196909734-64	108.0000	108.0000	available	2026-09-12 07:08:29.7342	2026-09-12 07:08:29.7342
6872	81	PRD-1789108282287-R1789196909734-65	108.3000	108.3000	available	2026-09-12 07:08:29.734986	2026-09-12 07:08:29.734986
6873	81	PRD-1789108282287-R1789196909735-66	109.8000	109.8000	available	2026-09-12 07:08:29.735802	2026-09-12 07:08:29.735802
6874	81	PRD-1789108282287-R1789196909736-67	113.8000	113.8000	available	2026-09-12 07:08:29.73662	2026-09-12 07:08:29.73662
6875	81	PRD-1789108282287-R1789196909737-68	114.1000	114.1000	available	2026-09-12 07:08:29.737439	2026-09-12 07:08:29.737439
6876	81	PRD-1789108282287-R1789196909738-69	115.8000	115.8000	available	2026-09-12 07:08:29.738225	2026-09-12 07:08:29.738225
6877	81	PRD-1789108282287-R1789196909738-70	116.3000	116.3000	available	2026-09-12 07:08:29.739051	2026-09-12 07:08:29.739051
6878	81	PRD-1789108282287-R1789196909739-71	116.9000	116.9000	available	2026-09-12 07:08:29.73983	2026-09-12 07:08:29.73983
6879	81	PRD-1789108282287-R1789196909740-72	117.2000	117.2000	available	2026-09-12 07:08:29.740639	2026-09-12 07:08:29.740639
6880	81	PRD-1789108282287-R1789196909741-73	117.5000	117.5000	available	2026-09-12 07:08:29.741426	2026-09-12 07:08:29.741426
6881	81	PRD-1789108282287-R1789196909742-74	117.9000	117.9000	available	2026-09-12 07:08:29.742241	2026-09-12 07:08:29.742241
6882	81	PRD-1789108282287-R1789196909742-75	118.0000	118.0000	available	2026-09-12 07:08:29.743016	2026-09-12 07:08:29.743016
6883	81	PRD-1789108282287-R1789196909743-76	118.4000	118.4000	available	2026-09-12 07:08:29.743831	2026-09-12 07:08:29.743831
6884	81	PRD-1789108282287-R1789196909744-77	118.7000	118.7000	available	2026-09-12 07:08:29.744632	2026-09-12 07:08:29.744632
6885	81	PRD-1789108282287-R1789196909745-78	119.0000	119.0000	available	2026-09-12 07:08:29.745499	2026-09-12 07:08:29.745499
6886	81	PRD-1789108282287-R1789196909746-79	119.5000	119.5000	available	2026-09-12 07:08:29.746281	2026-09-12 07:08:29.746281
6887	81	PRD-1789108282287-R1789196909746-80	121.2000	121.2000	available	2026-09-12 07:08:29.747097	2026-09-12 07:08:29.747097
6888	81	PRD-1789108282287-R1789196909747-81	121.5000	121.5000	available	2026-09-12 07:08:29.747885	2026-09-12 07:08:29.747885
6889	81	PRD-1789108282287-R1789196909748-82	122.3000	122.3000	available	2026-09-12 07:08:29.748727	2026-09-12 07:08:29.748727
6890	81	PRD-1789108282287-R1789196909749-83	122.4000	122.4000	available	2026-09-12 07:08:29.749604	2026-09-12 07:08:29.749604
6891	81	PRD-1789108282287-R1789196909750-84	122.7000	122.7000	available	2026-09-12 07:08:29.750387	2026-09-12 07:08:29.750387
6892	81	PRD-1789108282287-R1789196909751-85	127.7000	127.7000	available	2026-09-12 07:08:29.751211	2026-09-12 07:08:29.751211
6893	81	PRD-1789108282287-R1789196909751-86	128.2000	128.2000	available	2026-09-12 07:08:29.751989	2026-09-12 07:08:29.751989
6894	81	PRD-1789108282287-R1789196909752-87	128.8000	128.8000	available	2026-09-12 07:08:29.752853	2026-09-12 07:08:29.752853
6895	81	PRD-1789108282287-R1789196909753-88	129.7000	129.7000	available	2026-09-12 07:08:29.753758	2026-09-12 07:08:29.753758
6896	81	PRD-1789108282287-R1789196909754-89	133.2000	133.2000	available	2026-09-12 07:08:29.754638	2026-09-12 07:08:29.754638
6897	81	PRD-1789108282287-R1789196909755-90	138.5000	138.5000	available	2026-09-12 07:08:29.755435	2026-09-12 07:08:29.755435
6898	81	PRD-1789108282287-R1789196909756-91	138.9000	138.9000	available	2026-09-12 07:08:29.756254	2026-09-12 07:08:29.756254
6899	81	PRD-1789108282287-R1789196909756-92	140.0000	140.0000	available	2026-09-12 07:08:29.757091	2026-09-12 07:08:29.757091
6900	81	PRD-1789108282287-R1789196909757-93	144.5000	144.5000	available	2026-09-12 07:08:29.757925	2026-09-12 07:08:29.757925
6901	81	PRD-1789108282287-R1789196909758-94	68.0000	68.0000	available	2026-09-12 07:08:29.75871	2026-09-12 07:08:29.75871
6902	81	PRD-1789108282287-R1789196909759-95	68.5000	68.5000	available	2026-09-12 07:08:29.759529	2026-09-12 07:08:29.759529
6903	81	PRD-1789108282287-R1789196909760-96	71.4000	71.4000	available	2026-09-12 07:08:29.760317	2026-09-12 07:08:29.760317
6904	81	PRD-1789108282287-R1789196909761-97	72.2000	72.2000	available	2026-09-12 07:08:29.761171	2026-09-12 07:08:29.761171
6905	81	PRD-1789108282287-R1789196909761-98	72.5000	72.5000	available	2026-09-12 07:08:29.761959	2026-09-12 07:08:29.761959
6906	81	PRD-1789108282287-R1789196909763-99	73.3000	73.3000	available	2026-09-12 07:08:29.763156	2026-09-12 07:08:29.763156
6907	81	PRD-1789108282287-R1789196909763-100	76.1000	76.1000	available	2026-09-12 07:08:29.763972	2026-09-12 07:08:29.763972
6908	81	PRD-1789108282287-R1789196909764-101	77.0000	77.0000	available	2026-09-12 07:08:29.764797	2026-09-12 07:08:29.764797
6909	81	PRD-1789108282287-R1789196909765-102	81.1000	81.1000	available	2026-09-12 07:08:29.765584	2026-09-12 07:08:29.765584
6910	81	PRD-1789108282287-R1789196909766-103	81.3000	81.3000	available	2026-09-12 07:08:29.766402	2026-09-12 07:08:29.766402
6911	81	PRD-1789108282287-R1789196909767-104	82.9000	82.9000	available	2026-09-12 07:08:29.767187	2026-09-12 07:08:29.767187
6912	81	PRD-1789108282287-R1789196909767-105	84.5000	84.5000	available	2026-09-12 07:08:29.768002	2026-09-12 07:08:29.768002
6913	81	PRD-1789108282287-R1789196909768-106	85.8000	85.8000	available	2026-09-12 07:08:29.768808	2026-09-12 07:08:29.768808
6914	81	PRD-1789108282287-R1789196909769-107	86.1000	86.1000	available	2026-09-12 07:08:29.769615	2026-09-12 07:08:29.769615
6915	81	PRD-1789108282287-R1789196909770-108	86.2000	86.2000	available	2026-09-12 07:08:29.770399	2026-09-12 07:08:29.770399
6916	81	PRD-1789108282287-R1789196909771-109	86.5000	86.5000	available	2026-09-12 07:08:29.771221	2026-09-12 07:08:29.771221
6917	81	PRD-1789108282287-R1789196909771-110	86.5000	86.5000	available	2026-09-12 07:08:29.77201	2026-09-12 07:08:29.77201
6918	81	PRD-1789108282287-R1789196909772-111	86.7000	86.7000	available	2026-09-12 07:08:29.772901	2026-09-12 07:08:29.772901
6919	81	PRD-1789108282287-R1789196909773-112	86.9000	86.9000	available	2026-09-12 07:08:29.77369	2026-09-12 07:08:29.77369
6920	81	PRD-1789108282287-R1789196909774-113	87.3000	87.3000	available	2026-09-12 07:08:29.774518	2026-09-12 07:08:29.774518
6921	81	PRD-1789108282287-R1789196909775-114	88.4000	88.4000	available	2026-09-12 07:08:29.775325	2026-09-12 07:08:29.775325
6922	81	PRD-1789108282287-R1789196909776-115	88.6000	88.6000	available	2026-09-12 07:08:29.776143	2026-09-12 07:08:29.776143
6923	81	PRD-1789108282287-R1789196909776-116	89.2000	89.2000	available	2026-09-12 07:08:29.776926	2026-09-12 07:08:29.776926
6924	81	PRD-1789108282287-R1789196909777-117	89.5000	89.5000	available	2026-09-12 07:08:29.777746	2026-09-12 07:08:29.777746
6925	81	PRD-1789108282287-R1789196909778-118	91.3000	91.3000	available	2026-09-12 07:08:29.778533	2026-09-12 07:08:29.778533
6926	81	PRD-1789108282287-R1789196909779-119	91.5000	91.5000	available	2026-09-12 07:08:29.779378	2026-09-12 07:08:29.779378
6927	81	PRD-1789108282287-R1789196909780-120	93.0000	93.0000	available	2026-09-12 07:08:29.780164	2026-09-12 07:08:29.780164
6928	81	PRD-1789108282287-R1789196909780-121	93.5000	93.5000	available	2026-09-12 07:08:29.781013	2026-09-12 07:08:29.781013
6929	81	PRD-1789108282287-R1789196909781-122	93.5000	93.5000	available	2026-09-12 07:08:29.781819	2026-09-12 07:08:29.781819
6930	81	PRD-1789108282287-R1789196909782-123	95.5000	95.5000	available	2026-09-12 07:08:29.782629	2026-09-12 07:08:29.782629
6931	81	PRD-1789108282287-R1789196909783-124	95.8000	95.8000	available	2026-09-12 07:08:29.783419	2026-09-12 07:08:29.783419
6932	81	PRD-1789108282287-R1789196909784-125	96.8000	96.8000	available	2026-09-12 07:08:29.784241	2026-09-12 07:08:29.784241
6933	81	PRD-1789108282287-R1789196909784-126	96.8000	96.8000	available	2026-09-12 07:08:29.785054	2026-09-12 07:08:29.785054
6934	81	PRD-1789108282287-R1789196909785-127	97.2000	97.2000	available	2026-09-12 07:08:29.785874	2026-09-12 07:08:29.785874
6935	81	PRD-1789108282287-R1789196909786-128	97.2000	97.2000	available	2026-09-12 07:08:29.786667	2026-09-12 07:08:29.786667
6936	81	PRD-1789108282287-R1789196909787-129	97.4000	97.4000	available	2026-09-12 07:08:29.787486	2026-09-12 07:08:29.787486
6937	81	PRD-1789108282287-R1789196909788-130	97.6000	97.6000	available	2026-09-12 07:08:29.788274	2026-09-12 07:08:29.788274
6938	81	PRD-1789108282287-R1789196909789-131	98.0000	98.0000	available	2026-09-12 07:08:29.789127	2026-09-12 07:08:29.789127
6939	11	PRD-1789018656012-R1789199809065-0	114.0000	114.0000	available	2026-09-12 07:56:49.065363	2026-09-12 07:56:49.065363
6940	11	PRD-1789018656012-R1789199809066-1	114.2000	114.2000	available	2026-09-12 07:56:49.066496	2026-09-12 07:56:49.066496
6941	11	PRD-1789018656012-R1789199809067-2	112.4000	112.4000	available	2026-09-12 07:56:49.067397	2026-09-12 07:56:49.067397
6942	11	PRD-1789018656012-R1789199809068-3	107.7000	107.7000	available	2026-09-12 07:56:49.068239	2026-09-12 07:56:49.068239
6943	11	PRD-1789018656012-R1789199809068-4	112.6000	112.6000	available	2026-09-12 07:56:49.069091	2026-09-12 07:56:49.069091
6944	14	PRD-1789018782133-R1789199809074-0	105.5000	105.5000	available	2026-09-12 07:56:49.075115	2026-09-12 07:56:49.075115
6945	55	PRD-1789032520852-R1789199809079-0	98.4000	98.4000	available	2026-09-12 07:56:49.079539	2026-09-12 07:56:49.079539
6946	26	PRD-1789021819488-R1789199809084-0	129.6000	129.6000	available	2026-09-12 07:56:49.084454	2026-09-12 07:56:49.084454
6947	26	PRD-1789021819488-R1789199809086-1	105.0000	105.0000	available	2026-09-12 07:56:49.086419	2026-09-12 07:56:49.086419
6948	26	PRD-1789021819488-R1789199809087-2	118.0000	118.0000	available	2026-09-12 07:56:49.087373	2026-09-12 07:56:49.087373
6949	26	PRD-1789021819488-R1789199809088-3	118.0000	118.0000	available	2026-09-12 07:56:49.08826	2026-09-12 07:56:49.08826
6950	26	PRD-1789021819488-R1789199809089-4	118.0000	118.0000	available	2026-09-12 07:56:49.089186	2026-09-12 07:56:49.089186
6951	26	PRD-1789021819488-R1789199809089-5	125.1000	125.1000	available	2026-09-12 07:56:49.090086	2026-09-12 07:56:49.090086
6952	63	PRD-1789034575975-R1789199809094-0	115.9000	115.9000	available	2026-09-12 07:56:49.094768	2026-09-12 07:56:49.094768
6953	63	PRD-1789034575975-R1789199809095-1	115.6000	115.6000	available	2026-09-12 07:56:49.095651	2026-09-12 07:56:49.095651
6954	63	PRD-1789034575975-R1789199809096-2	120.5000	120.5000	available	2026-09-12 07:56:49.096492	2026-09-12 07:56:49.096492
6955	63	PRD-1789034575975-R1789199809097-3	120.3000	120.3000	available	2026-09-12 07:56:49.09734	2026-09-12 07:56:49.09734
6956	63	PRD-1789034575975-R1789199809098-4	120.0000	120.0000	available	2026-09-12 07:56:49.098269	2026-09-12 07:56:49.098269
6957	63	PRD-1789034575975-R1789199809099-5	110.4000	110.4000	available	2026-09-12 07:56:49.099174	2026-09-12 07:56:49.099174
6958	63	PRD-1789034575975-R1789199809099-6	116.1000	116.1000	available	2026-09-12 07:56:49.100193	2026-09-12 07:56:49.100193
6959	63	PRD-1789034575975-R1789199809100-7	120.0000	120.0000	available	2026-09-12 07:56:49.101066	2026-09-12 07:56:49.101066
6960	63	PRD-1789034575975-R1789199809101-8	120.5000	120.5000	available	2026-09-12 07:56:49.102156	2026-09-12 07:56:49.102156
6961	63	PRD-1789034575975-R1789199809102-9	109.9000	109.9000	available	2026-09-12 07:56:49.103007	2026-09-12 07:56:49.103007
6962	63	PRD-1789034575975-R1789199809103-10	113.6000	113.6000	available	2026-09-12 07:56:49.103929	2026-09-12 07:56:49.103929
6963	63	PRD-1789034575975-R1789199809104-11	120.0000	120.0000	available	2026-09-12 07:56:49.104767	2026-09-12 07:56:49.104767
6964	63	PRD-1789034575975-R1789199809105-12	119.5000	119.5000	available	2026-09-12 07:56:49.105686	2026-09-12 07:56:49.105686
6965	63	PRD-1789034575975-R1789199809106-13	114.5000	114.5000	available	2026-09-12 07:56:49.106588	2026-09-12 07:56:49.106588
6966	63	PRD-1789034575975-R1789199809107-14	114.8000	114.8000	available	2026-09-12 07:56:49.107522	2026-09-12 07:56:49.107522
6967	63	PRD-1789034575975-R1789199809108-15	110.6000	110.6000	available	2026-09-12 07:56:49.108533	2026-09-12 07:56:49.108533
6968	63	PRD-1789034575975-R1789199809109-16	111.6000	111.6000	available	2026-09-12 07:56:49.109348	2026-09-12 07:56:49.109348
6969	63	PRD-1789034575975-R1789199809110-17	100.9000	100.9000	available	2026-09-12 07:56:49.110166	2026-09-12 07:56:49.110166
6970	63	PRD-1789034575975-R1789199809110-18	112.1000	112.1000	available	2026-09-12 07:56:49.110984	2026-09-12 07:56:49.110984
6971	63	PRD-1789034575975-R1789199809111-19	125.4000	125.4000	available	2026-09-12 07:56:49.11186	2026-09-12 07:56:49.11186
6972	63	PRD-1789034575975-R1789199809112-20	120.5000	120.5000	available	2026-09-12 07:56:49.112712	2026-09-12 07:56:49.112712
6973	63	PRD-1789034575975-R1789199809113-21	118.5000	118.5000	available	2026-09-12 07:56:49.113546	2026-09-12 07:56:49.113546
6974	63	PRD-1789034575975-R1789199809114-22	120.5000	120.5000	available	2026-09-12 07:56:49.114494	2026-09-12 07:56:49.114494
6975	63	PRD-1789034575975-R1789199809115-23	120.2000	120.2000	available	2026-09-12 07:56:49.115348	2026-09-12 07:56:49.115348
6976	63	PRD-1789034575975-R1789199809116-24	119.6000	119.6000	available	2026-09-12 07:56:49.116226	2026-09-12 07:56:49.116226
6977	63	PRD-1789034575975-R1789199809116-25	120.5000	120.5000	available	2026-09-12 07:56:49.117073	2026-09-12 07:56:49.117073
6978	63	PRD-1789034575975-R1789199809117-26	117.2000	117.2000	available	2026-09-12 07:56:49.117927	2026-09-12 07:56:49.117927
6979	63	PRD-1789034575975-R1789199809118-27	120.6000	120.6000	available	2026-09-12 07:56:49.1188	2026-09-12 07:56:49.1188
6980	63	PRD-1789034575975-R1789199809119-28	111.9000	111.9000	available	2026-09-12 07:56:49.119694	2026-09-12 07:56:49.119694
6981	63	PRD-1789034575975-R1789199809120-29	87.2000	87.2000	available	2026-09-12 07:56:49.120805	2026-09-12 07:56:49.120805
6982	63	PRD-1789034575975-R1789199809121-30	113.6000	113.6000	available	2026-09-12 07:56:49.121728	2026-09-12 07:56:49.121728
6983	63	PRD-1789034575975-R1789199809122-31	105.0000	105.0000	available	2026-09-12 07:56:49.122651	2026-09-12 07:56:49.122651
6984	63	PRD-1789034575975-R1789199809123-32	102.0000	102.0000	available	2026-09-12 07:56:49.123482	2026-09-12 07:56:49.123482
6985	63	PRD-1789034575975-R1789199809124-33	118.5000	118.5000	available	2026-09-12 07:56:49.124313	2026-09-12 07:56:49.124313
6986	63	PRD-1789034575975-R1789199809124-34	118.8000	118.8000	available	2026-09-12 07:56:49.125122	2026-09-12 07:56:49.125122
6987	63	PRD-1789034575975-R1789199809125-35	111.8000	111.8000	available	2026-09-12 07:56:49.126043	2026-09-12 07:56:49.126043
6988	63	PRD-1789034575975-R1789199809126-36	115.8000	115.8000	available	2026-09-12 07:56:49.126904	2026-09-12 07:56:49.126904
6989	63	PRD-1789034575975-R1789199809127-37	107.7000	107.7000	available	2026-09-12 07:56:49.127764	2026-09-12 07:56:49.127764
6990	63	PRD-1789034575975-R1789199809128-38	111.4000	111.4000	available	2026-09-12 07:56:49.128588	2026-09-12 07:56:49.128588
6991	63	PRD-1789034575975-R1789199809129-39	119.2000	119.2000	available	2026-09-12 07:56:49.129395	2026-09-12 07:56:49.129395
6992	63	PRD-1789034575975-R1789199809130-40	120.0000	120.0000	available	2026-09-12 07:56:49.130342	2026-09-12 07:56:49.130342
6993	63	PRD-1789034575975-R1789199809131-41	120.0000	120.0000	available	2026-09-12 07:56:49.131259	2026-09-12 07:56:49.131259
6994	63	PRD-1789034575975-R1789199809132-42	120.5000	120.5000	available	2026-09-12 07:56:49.132159	2026-09-12 07:56:49.132159
6995	70	PRD-1789038376650-R1789199809136-0	109.0000	109.0000	available	2026-09-12 07:56:49.13687	2026-09-12 07:56:49.13687
6996	16	PRD-1789018928475-R1789199809141-0	118.1000	118.1000	available	2026-09-12 07:56:49.141616	2026-09-12 07:56:49.141616
6997	16	PRD-1789018928475-R1789199809142-1	116.0000	116.0000	available	2026-09-12 07:56:49.142547	2026-09-12 07:56:49.142547
6998	16	PRD-1789018928475-R1789199809143-2	111.7000	111.7000	available	2026-09-12 07:56:49.143398	2026-09-12 07:56:49.143398
6999	16	PRD-1789018928475-R1789199809144-3	117.0000	117.0000	available	2026-09-12 07:56:49.144412	2026-09-12 07:56:49.144412
7000	16	PRD-1789018928475-R1789199809145-4	119.5000	119.5000	available	2026-09-12 07:56:49.145254	2026-09-12 07:56:49.145254
7001	60	PRD-1789033677780-R1789199809149-0	118.1000	118.1000	available	2026-09-12 07:56:49.149457	2026-09-12 07:56:49.149457
7002	60	PRD-1789033677780-R1789199809150-1	119.9000	119.9000	available	2026-09-12 07:56:49.150312	2026-09-12 07:56:49.150312
7003	107	PRD-1789199121992-R1789200081549-0	85.0000	85.0000	available	2026-09-12 08:01:21.549905	2026-09-12 08:01:21.549905
7004	108	PRD-1789199948710-R1789200081555-0	99.7000	99.7000	available	2026-09-12 08:01:21.555837	2026-09-12 08:01:21.555837
7005	108	PRD-1789199948710-R1789200081556-1	54.4000	54.4000	available	2026-09-12 08:01:21.556783	2026-09-12 08:01:21.556783
7006	108	PRD-1789199948710-R1789200081557-2	101.0000	101.0000	available	2026-09-12 08:01:21.557679	2026-09-12 08:01:21.557679
7007	108	PRD-1789199948710-R1789200081558-3	120.2000	120.2000	available	2026-09-12 08:01:21.558524	2026-09-12 08:01:21.558524
7008	108	PRD-1789199948710-R1789200081559-4	119.0000	119.0000	available	2026-09-12 08:01:21.559374	2026-09-12 08:01:21.559374
7009	108	PRD-1789199948710-R1789200081560-5	103.1000	103.1000	available	2026-09-12 08:01:21.560332	2026-09-12 08:01:21.560332
7010	108	PRD-1789199948710-R1789200081561-6	120.4000	120.4000	available	2026-09-12 08:01:21.561136	2026-09-12 08:01:21.561136
7011	108	PRD-1789199948710-R1789200081561-7	120.3000	120.3000	available	2026-09-12 08:01:21.561938	2026-09-12 08:01:21.561938
7012	108	PRD-1789199948710-R1789200081562-8	141.0000	141.0000	available	2026-09-12 08:01:21.562741	2026-09-12 08:01:21.562741
7013	108	PRD-1789199948710-R1789200081563-9	120.3000	120.3000	available	2026-09-12 08:01:21.56356	2026-09-12 08:01:21.56356
7014	108	PRD-1789199948710-R1789200081564-10	120.0000	120.0000	available	2026-09-12 08:01:21.5644	2026-09-12 08:01:21.5644
7015	108	PRD-1789199948710-R1789200081565-11	120.3000	120.3000	available	2026-09-12 08:01:21.565246	2026-09-12 08:01:21.565246
7016	108	PRD-1789199948710-R1789200081566-12	120.0000	120.0000	available	2026-09-12 08:01:21.56614	2026-09-12 08:01:21.56614
7017	108	PRD-1789199948710-R1789200081566-13	120.3000	120.3000	available	2026-09-12 08:01:21.566966	2026-09-12 08:01:21.566966
7018	108	PRD-1789199948710-R1789200081567-14	115.8000	115.8000	available	2026-09-12 08:01:21.567894	2026-09-12 08:01:21.567894
7019	108	PRD-1789199948710-R1789200081568-15	120.3000	120.3000	available	2026-09-12 08:01:21.56874	2026-09-12 08:01:21.56874
7020	108	PRD-1789199948710-R1789200081569-16	131.4000	131.4000	available	2026-09-12 08:01:21.569669	2026-09-12 08:01:21.569669
7021	77	PRD-1789103900925-R1789203537434-0	124.1000	124.1000	available	2026-09-12 08:58:57.434677	2026-09-12 08:58:57.434677
7022	77	PRD-1789103900925-R1789203537435-1	137.2000	137.2000	available	2026-09-12 08:58:57.435706	2026-09-12 08:58:57.435706
7023	77	PRD-1789103900925-R1789203537436-2	120.0000	120.0000	available	2026-09-12 08:58:57.436615	2026-09-12 08:58:57.436615
7024	77	PRD-1789103900925-R1789203537437-3	122.2000	122.2000	available	2026-09-12 08:58:57.437482	2026-09-12 08:58:57.437482
7025	77	PRD-1789103900925-R1789203537438-4	127.4000	127.4000	available	2026-09-12 08:58:57.438304	2026-09-12 08:58:57.438304
7026	77	PRD-1789103900925-R1789203537439-5	115.3000	115.3000	available	2026-09-12 08:58:57.439155	2026-09-12 08:58:57.439155
7027	77	PRD-1789103900925-R1789203537439-6	112.0000	112.0000	available	2026-09-12 08:58:57.439978	2026-09-12 08:58:57.439978
7028	77	PRD-1789103900925-R1789203537440-7	123.2000	123.2000	available	2026-09-12 08:58:57.440774	2026-09-12 08:58:57.440774
7029	77	PRD-1789103900925-R1789203537441-8	127.1000	127.1000	available	2026-09-12 08:58:57.441596	2026-09-12 08:58:57.441596
7030	77	PRD-1789103900925-R1789203537459-9	115.3000	115.3000	available	2026-09-12 08:58:57.459552	2026-09-12 08:58:57.459552
7031	77	PRD-1789103900925-R1789203537460-10	116.9000	116.9000	available	2026-09-12 08:58:57.460366	2026-09-12 08:58:57.460366
7032	77	PRD-1789103900925-R1789203537461-11	116.5000	116.5000	available	2026-09-12 08:58:57.461243	2026-09-12 08:58:57.461243
7033	77	PRD-1789103900925-R1789203537461-12	119.4000	119.4000	available	2026-09-12 08:58:57.462066	2026-09-12 08:58:57.462066
7034	77	PRD-1789103900925-R1789203537462-13	116.2000	116.2000	available	2026-09-12 08:58:57.462923	2026-09-12 08:58:57.462923
7035	77	PRD-1789103900925-R1789203537463-14	119.0000	119.0000	available	2026-09-12 08:58:57.463732	2026-09-12 08:58:57.463732
7036	77	PRD-1789103900925-R1789203537464-15	117.2000	117.2000	available	2026-09-12 08:58:57.464536	2026-09-12 08:58:57.464536
7037	77	PRD-1789103900925-R1789203537465-16	117.1000	117.1000	available	2026-09-12 08:58:57.465367	2026-09-12 08:58:57.465367
7038	77	PRD-1789103900925-R1789203537466-17	115.7000	115.7000	available	2026-09-12 08:58:57.466198	2026-09-12 08:58:57.466198
7039	77	PRD-1789103900925-R1789203537466-18	116.2000	116.2000	available	2026-09-12 08:58:57.467011	2026-09-12 08:58:57.467011
7040	77	PRD-1789103900925-R1789203537467-19	117.9000	117.9000	available	2026-09-12 08:58:57.46783	2026-09-12 08:58:57.46783
7041	77	PRD-1789103900925-R1789203537468-20	117.1000	117.1000	available	2026-09-12 08:58:57.468661	2026-09-12 08:58:57.468661
7042	77	PRD-1789103900925-R1789203537469-21	116.1000	116.1000	available	2026-09-12 08:58:57.469452	2026-09-12 08:58:57.469452
7043	77	PRD-1789103900925-R1789203537470-22	117.0000	117.0000	available	2026-09-12 08:58:57.470268	2026-09-12 08:58:57.470268
7044	77	PRD-1789103900925-R1789203537470-23	116.3000	116.3000	available	2026-09-12 08:58:57.471045	2026-09-12 08:58:57.471045
7045	77	PRD-1789103900925-R1789203537471-24	120.0000	120.0000	available	2026-09-12 08:58:57.471837	2026-09-12 08:58:57.471837
7046	77	PRD-1789103900925-R1789203537472-25	120.0000	120.0000	available	2026-09-12 08:58:57.472798	2026-09-12 08:58:57.472798
7047	77	PRD-1789103900925-R1789203537473-26	120.0000	120.0000	available	2026-09-12 08:58:57.473581	2026-09-12 08:58:57.473581
7048	77	PRD-1789103900925-R1789203537474-27	120.0000	120.0000	available	2026-09-12 08:58:57.474356	2026-09-12 08:58:57.474356
7049	77	PRD-1789103900925-R1789203537475-28	180.0000	180.0000	available	2026-09-12 08:58:57.475186	2026-09-12 08:58:57.475186
7050	77	PRD-1789103900925-R1789203537475-29	111.0000	111.0000	available	2026-09-12 08:58:57.475985	2026-09-12 08:58:57.475985
7051	77	PRD-1789103900925-R1789203537476-30	120.0000	120.0000	available	2026-09-12 08:58:57.476783	2026-09-12 08:58:57.476783
7052	57	PRD-1789033528219-R1789203537482-0	120.2000	120.2000	available	2026-09-12 08:58:57.482643	2026-09-12 08:58:57.482643
7053	57	PRD-1789033528219-R1789203537483-1	109.0000	109.0000	available	2026-09-12 08:58:57.48358	2026-09-12 08:58:57.48358
7054	57	PRD-1789033528219-R1789203537484-2	112.6000	112.6000	available	2026-09-12 08:58:57.484442	2026-09-12 08:58:57.484442
7055	57	PRD-1789033528219-R1789203537485-3	107.0000	107.0000	available	2026-09-12 08:58:57.485277	2026-09-12 08:58:57.485277
7056	57	PRD-1789033528219-R1789203537485-4	134.0000	134.0000	available	2026-09-12 08:58:57.486089	2026-09-12 08:58:57.486089
7057	57	PRD-1789033528219-R1789203537486-5	108.5000	108.5000	available	2026-09-12 08:58:57.486902	2026-09-12 08:58:57.486902
7058	57	PRD-1789033528219-R1789203537487-6	128.3000	128.3000	available	2026-09-12 08:58:57.487716	2026-09-12 08:58:57.487716
7059	57	PRD-1789033528219-R1789203537488-7	113.1000	113.1000	available	2026-09-12 08:58:57.488587	2026-09-12 08:58:57.488587
7060	57	PRD-1789033528219-R1789203537489-8	119.3000	119.3000	available	2026-09-12 08:58:57.489516	2026-09-12 08:58:57.489516
7061	57	PRD-1789033528219-R1789203537490-9	107.0000	107.0000	available	2026-09-12 08:58:57.490406	2026-09-12 08:58:57.490406
7062	25	PRD-1789021016427-R1789203537494-0	102.7000	102.7000	available	2026-09-12 08:58:57.494644	2026-09-12 08:58:57.494644
7063	25	PRD-1789021016427-R1789203537495-1	112.1000	112.1000	available	2026-09-12 08:58:57.495995	2026-09-12 08:58:57.495995
7064	25	PRD-1789021016427-R1789203537496-2	118.4000	118.4000	available	2026-09-12 08:58:57.496917	2026-09-12 08:58:57.496917
7065	6	PRD-1789018369136-R1789203537501-0	116.7000	116.7000	available	2026-09-12 08:58:57.501254	2026-09-12 08:58:57.501254
7066	6	PRD-1789018369136-R1789203537502-1	116.0000	116.0000	available	2026-09-12 08:58:57.502374	2026-09-12 08:58:57.502374
7067	78	PRD-1789104186954-R1789203537506-0	108.7000	108.7000	available	2026-09-12 08:58:57.506404	2026-09-12 08:58:57.506404
7068	79	PRD-1789104211377-R1789203537510-0	97.7000	97.7000	available	2026-09-12 08:58:57.510537	2026-09-12 08:58:57.510537
7069	79	PRD-1789104211377-R1789203537511-1	113.5000	113.5000	available	2026-09-12 08:58:57.511391	2026-09-12 08:58:57.511391
7070	40	PRD-1789027496659-R1789203537515-0	128.8000	128.8000	available	2026-09-12 08:58:57.515594	2026-09-12 08:58:57.515594
7071	40	PRD-1789027496659-R1789203537516-1	82.6000	82.6000	available	2026-09-12 08:58:57.51647	2026-09-12 08:58:57.51647
7072	40	PRD-1789027496659-R1789203537517-2	108.3000	108.3000	available	2026-09-12 08:58:57.517364	2026-09-12 08:58:57.517364
7073	1	PRD-1789017671180-R1789203537521-0	121.3000	121.3000	available	2026-09-12 08:58:57.521495	2026-09-12 08:58:57.521495
7074	1	PRD-1789017671180-R1789203537522-1	121.3000	121.3000	available	2026-09-12 08:58:57.522479	2026-09-12 08:58:57.522479
7075	1	PRD-1789017671180-R1789203537523-2	121.3000	121.3000	available	2026-09-12 08:58:57.523292	2026-09-12 08:58:57.523292
7076	1	PRD-1789017671180-R1789203537523-3	121.3000	121.3000	available	2026-09-12 08:58:57.524083	2026-09-12 08:58:57.524083
7077	24	PRD-1789020615250-R1789203537528-0	121.3000	121.3000	available	2026-09-12 08:58:57.528205	2026-09-12 08:58:57.528205
7078	24	PRD-1789020615250-R1789203537529-1	91.3000	91.3000	available	2026-09-12 08:58:57.529223	2026-09-12 08:58:57.529223
7079	24	PRD-1789020615250-R1789203537529-2	102.2000	102.2000	available	2026-09-12 08:58:57.530043	2026-09-12 08:58:57.530043
7080	24	PRD-1789020615250-R1789203537530-3	118.0000	118.0000	available	2026-09-12 08:58:57.530838	2026-09-12 08:58:57.530838
7081	24	PRD-1789020615250-R1789203537531-4	118.0000	118.0000	available	2026-09-12 08:58:57.531639	2026-09-12 08:58:57.531639
7082	24	PRD-1789020615250-R1789203537532-5	118.0000	118.0000	available	2026-09-12 08:58:57.53245	2026-09-12 08:58:57.53245
7083	24	PRD-1789020615250-R1789203537533-6	121.7000	121.7000	available	2026-09-12 08:58:57.53326	2026-09-12 08:58:57.53326
7084	24	PRD-1789020615250-R1789203537533-7	117.2000	117.2000	available	2026-09-12 08:58:57.534079	2026-09-12 08:58:57.534079
7085	24	PRD-1789020615250-R1789203537534-8	118.0000	118.0000	available	2026-09-12 08:58:57.53488	2026-09-12 08:58:57.53488
7086	24	PRD-1789020615250-R1789203537535-9	120.5000	120.5000	available	2026-09-12 08:58:57.535953	2026-09-12 08:58:57.535953
7087	12	PRD-1789018691298-R1789203537540-0	126.0000	126.0000	available	2026-09-12 08:58:57.541053	2026-09-12 08:58:57.541053
7088	12	PRD-1789018691298-R1789203537542-1	113.8000	113.8000	available	2026-09-12 08:58:57.542151	2026-09-12 08:58:57.542151
7089	21	PRD-1789019144403-R1789203537546-0	114.2000	114.2000	available	2026-09-12 08:58:57.546913	2026-09-12 08:58:57.546913
7090	21	PRD-1789019144403-R1789203537547-1	118.0000	118.0000	available	2026-09-12 08:58:57.547889	2026-09-12 08:58:57.547889
7091	21	PRD-1789019144403-R1789203537548-2	112.0000	112.0000	available	2026-09-12 08:58:57.548699	2026-09-12 08:58:57.548699
7092	13	PRD-1789018725877-R1789203537552-0	103.5000	103.5000	available	2026-09-12 08:58:57.552561	2026-09-12 08:58:57.552561
7093	13	PRD-1789018725877-R1789203537553-1	115.0000	115.0000	available	2026-09-12 08:58:57.553461	2026-09-12 08:58:57.553461
7094	13	PRD-1789018725877-R1789203537554-2	99.2000	99.2000	available	2026-09-12 08:58:57.554343	2026-09-12 08:58:57.554343
7095	13	PRD-1789018725877-R1789203537555-3	107.2000	107.2000	available	2026-09-12 08:58:57.555192	2026-09-12 08:58:57.555192
7096	13	PRD-1789018725877-R1789203537555-4	106.4000	106.4000	available	2026-09-12 08:58:57.555992	2026-09-12 08:58:57.555992
7097	13	PRD-1789018725877-R1789203537556-5	1.0000	1.0000	available	2026-09-12 08:58:57.556803	2026-09-12 08:58:57.556803
7098	13	PRD-1789018725877-R1789203537557-6	115.5000	115.5000	available	2026-09-12 08:58:57.557604	2026-09-12 08:58:57.557604
7099	13	PRD-1789018725877-R1789203537558-7	102.9000	102.9000	available	2026-09-12 08:58:57.5584	2026-09-12 08:58:57.5584
7100	13	PRD-1789018725877-R1789203537559-8	115.7000	115.7000	available	2026-09-12 08:58:57.55919	2026-09-12 08:58:57.55919
7101	13	PRD-1789018725877-R1789203537559-9	116.0000	116.0000	available	2026-09-12 08:58:57.559976	2026-09-12 08:58:57.559976
7102	13	PRD-1789018725877-R1789203537560-10	116.2000	116.2000	available	2026-09-12 08:58:57.560764	2026-09-12 08:58:57.560764
7103	13	PRD-1789018725877-R1789203537561-11	121.4000	121.4000	available	2026-09-12 08:58:57.561557	2026-09-12 08:58:57.561557
7104	73	PRD-1789045777628-R1789203537566-0	132.0000	132.0000	available	2026-09-12 08:58:57.566259	2026-09-12 08:58:57.566259
7105	73	PRD-1789045777628-R1789203537566-1	115.2000	115.2000	available	2026-09-12 08:58:57.567085	2026-09-12 08:58:57.567085
7106	73	PRD-1789045777628-R1789203537567-2	111.4000	111.4000	available	2026-09-12 08:58:57.567875	2026-09-12 08:58:57.567875
7107	73	PRD-1789045777628-R1789203537568-3	114.9000	114.9000	available	2026-09-12 08:58:57.568674	2026-09-12 08:58:57.568674
7108	36	PRD-1789025355244-R1789203537572-0	113.7000	113.7000	available	2026-09-12 08:58:57.572564	2026-09-12 08:58:57.572564
7109	36	PRD-1789025355244-R1789203537573-1	112.7000	112.7000	available	2026-09-12 08:58:57.573381	2026-09-12 08:58:57.573381
7110	36	PRD-1789025355244-R1789203537574-2	115.0000	115.0000	available	2026-09-12 08:58:57.574183	2026-09-12 08:58:57.574183
7111	36	PRD-1789025355244-R1789203537574-3	107.3000	107.3000	available	2026-09-12 08:58:57.574978	2026-09-12 08:58:57.574978
7112	36	PRD-1789025355244-R1789203537575-4	112.0000	112.0000	available	2026-09-12 08:58:57.575823	2026-09-12 08:58:57.575823
7113	36	PRD-1789025355244-R1789203537576-5	113.0000	113.0000	available	2026-09-12 08:58:57.576773	2026-09-12 08:58:57.576773
7114	36	PRD-1789025355244-R1789203537577-6	121.6000	121.6000	available	2026-09-12 08:58:57.577597	2026-09-12 08:58:57.577597
7115	36	PRD-1789025355244-R1789203537578-7	118.0000	118.0000	available	2026-09-12 08:58:57.578437	2026-09-12 08:58:57.578437
7116	36	PRD-1789025355244-R1789203537579-8	118.0000	118.0000	available	2026-09-12 08:58:57.579296	2026-09-12 08:58:57.579296
7117	20	PRD-1789019067284-R1789203537583-0	115.3000	115.3000	available	2026-09-12 08:58:57.583449	2026-09-12 08:58:57.583449
7118	20	PRD-1789019067284-R1789203537584-1	1.0000	1.0000	available	2026-09-12 08:58:57.584322	2026-09-12 08:58:57.584322
7119	20	PRD-1789019067284-R1789203537585-2	118.7000	118.7000	available	2026-09-12 08:58:57.585194	2026-09-12 08:58:57.585194
7120	7	PRD-1789018404302-R1789203537588-0	123.7000	123.7000	available	2026-09-12 08:58:57.589073	2026-09-12 08:58:57.589073
7121	7	PRD-1789018404302-R1789203537589-1	116.8000	116.8000	available	2026-09-12 08:58:57.590038	2026-09-12 08:58:57.590038
7122	13	PRD-1789018725877-R1789203537594-0	113.0000	113.0000	available	2026-09-12 08:58:57.594353	2026-09-12 08:58:57.594353
7123	13	PRD-1789018725877-R1789203537595-1	116.0000	116.0000	available	2026-09-12 08:58:57.59517	2026-09-12 08:58:57.59517
7124	13	PRD-1789018725877-R1789203537596-2	98.9000	98.9000	available	2026-09-12 08:58:57.596178	2026-09-12 08:58:57.596178
7125	13	PRD-1789018725877-R1789203537596-3	110.6000	110.6000	available	2026-09-12 08:58:57.596984	2026-09-12 08:58:57.596984
7126	13	PRD-1789018725877-R1789203537597-4	118.0000	118.0000	available	2026-09-12 08:58:57.597786	2026-09-12 08:58:57.597786
7127	13	PRD-1789018725877-R1789203537598-5	117.0000	117.0000	available	2026-09-12 08:58:57.598574	2026-09-12 08:58:57.598574
7128	13	PRD-1789018725877-R1789203537599-6	117.4000	117.4000	available	2026-09-12 08:58:57.599362	2026-09-12 08:58:57.599362
7129	13	PRD-1789018725877-R1789203537600-7	116.3000	116.3000	available	2026-09-12 08:58:57.600157	2026-09-12 08:58:57.600157
7130	13	PRD-1789018725877-R1789203537600-8	118.2000	118.2000	available	2026-09-12 08:58:57.601006	2026-09-12 08:58:57.601006
7131	13	PRD-1789018725877-R1789203537601-9	112.5000	112.5000	available	2026-09-12 08:58:57.601818	2026-09-12 08:58:57.601818
7132	13	PRD-1789018725877-R1789203537602-10	116.8000	116.8000	available	2026-09-12 08:58:57.602608	2026-09-12 08:58:57.602608
7133	13	PRD-1789018725877-R1789203537603-11	91.1000	91.1000	available	2026-09-12 08:58:57.603576	2026-09-12 08:58:57.603576
7134	8	PRD-1789018442925-R1789203537608-0	110.5000	110.5000	available	2026-09-12 08:58:57.60829	2026-09-12 08:58:57.60829
7135	8	PRD-1789018442925-R1789203537609-1	110.8000	110.8000	available	2026-09-12 08:58:57.609158	2026-09-12 08:58:57.609158
7136	8	PRD-1789018442925-R1789203537609-2	110.4000	110.4000	available	2026-09-12 08:58:57.609972	2026-09-12 08:58:57.609972
7137	8	PRD-1789018442925-R1789203537610-3	111.3000	111.3000	available	2026-09-12 08:58:57.610771	2026-09-12 08:58:57.610771
7138	8	PRD-1789018442925-R1789203537611-4	101.1000	101.1000	available	2026-09-12 08:58:57.611554	2026-09-12 08:58:57.611554
7139	8	PRD-1789018442925-R1789203537612-5	111.5000	111.5000	available	2026-09-12 08:58:57.612348	2026-09-12 08:58:57.612348
7140	8	PRD-1789018442925-R1789203537613-6	100.8000	100.8000	available	2026-09-12 08:58:57.613162	2026-09-12 08:58:57.613162
7141	8	PRD-1789018442925-R1789203537613-7	113.4000	113.4000	available	2026-09-12 08:58:57.613951	2026-09-12 08:58:57.613951
7142	8	PRD-1789018442925-R1789203537614-8	115.4000	115.4000	available	2026-09-12 08:58:57.614759	2026-09-12 08:58:57.614759
7143	8	PRD-1789018442925-R1789203537615-9	112.4000	112.4000	available	2026-09-12 08:58:57.615549	2026-09-12 08:58:57.615549
7144	8	PRD-1789018442925-R1789203537616-10	100.2000	100.2000	available	2026-09-12 08:58:57.616336	2026-09-12 08:58:57.616336
7145	8	PRD-1789018442925-R1789203537617-11	110.7000	110.7000	available	2026-09-12 08:58:57.617381	2026-09-12 08:58:57.617381
7146	8	PRD-1789018442925-R1789203537618-12	109.8000	109.8000	available	2026-09-12 08:58:57.618171	2026-09-12 08:58:57.618171
7147	8	PRD-1789018442925-R1789203537618-13	113.0000	113.0000	available	2026-09-12 08:58:57.618957	2026-09-12 08:58:57.618957
7148	8	PRD-1789018442925-R1789203537619-14	105.9000	105.9000	available	2026-09-12 08:58:57.619745	2026-09-12 08:58:57.619745
7149	8	PRD-1789018442925-R1789203537620-15	112.0000	112.0000	available	2026-09-12 08:58:57.620568	2026-09-12 08:58:57.620568
7150	8	PRD-1789018442925-R1789203537621-16	116.5000	116.5000	available	2026-09-12 08:58:57.621358	2026-09-12 08:58:57.621358
7151	8	PRD-1789018442925-R1789203537622-17	126.6000	126.6000	available	2026-09-12 08:58:57.622161	2026-09-12 08:58:57.622161
7152	8	PRD-1789018442925-R1789203537622-18	78.0000	78.0000	available	2026-09-12 08:58:57.62295	2026-09-12 08:58:57.62295
7153	8	PRD-1789018442925-R1789203537623-19	115.8000	115.8000	available	2026-09-12 08:58:57.623743	2026-09-12 08:58:57.623743
7154	8	PRD-1789018442925-R1789203537624-20	116.6000	116.6000	available	2026-09-12 08:58:57.624589	2026-09-12 08:58:57.624589
7155	8	PRD-1789018442925-R1789203537625-21	112.7000	112.7000	available	2026-09-12 08:58:57.625379	2026-09-12 08:58:57.625379
7156	8	PRD-1789018442925-R1789203537626-22	105.0000	105.0000	available	2026-09-12 08:58:57.626166	2026-09-12 08:58:57.626166
7157	8	PRD-1789018442925-R1789203537626-23	113.0000	113.0000	available	2026-09-12 08:58:57.626948	2026-09-12 08:58:57.626948
7158	8	PRD-1789018442925-R1789203537627-24	102.2000	102.2000	available	2026-09-12 08:58:57.627732	2026-09-12 08:58:57.627732
7159	8	PRD-1789018442925-R1789203537628-25	96.2000	96.2000	available	2026-09-12 08:58:57.628536	2026-09-12 08:58:57.628536
7160	8	PRD-1789018442925-R1789203537629-26	117.0000	117.0000	available	2026-09-12 08:58:57.629328	2026-09-12 08:58:57.629328
7161	8	PRD-1789018442925-R1789203537629-27	123.0000	123.0000	available	2026-09-12 08:58:57.630115	2026-09-12 08:58:57.630115
7162	8	PRD-1789018442925-R1789203537630-28	112.3000	112.3000	available	2026-09-12 08:58:57.630901	2026-09-12 08:58:57.630901
7163	8	PRD-1789018442925-R1789203537631-29	113.1000	113.1000	available	2026-09-12 08:58:57.631687	2026-09-12 08:58:57.631687
7164	8	PRD-1789018442925-R1789203537632-30	104.6000	104.6000	available	2026-09-12 08:58:57.632477	2026-09-12 08:58:57.632477
7165	8	PRD-1789018442925-R1789203537633-31	110.6000	110.6000	available	2026-09-12 08:58:57.633274	2026-09-12 08:58:57.633274
7166	8	PRD-1789018442925-R1789203537633-32	97.9000	97.9000	available	2026-09-12 08:58:57.63406	2026-09-12 08:58:57.63406
7167	8	PRD-1789018442925-R1789203537634-33	111.7000	111.7000	available	2026-09-12 08:58:57.634899	2026-09-12 08:58:57.634899
7168	8	PRD-1789018442925-R1789203537635-34	115.5000	115.5000	available	2026-09-12 08:58:57.635753	2026-09-12 08:58:57.635753
7169	8	PRD-1789018442925-R1789203537636-35	111.0000	111.0000	available	2026-09-12 08:58:57.636591	2026-09-12 08:58:57.636591
7170	8	PRD-1789018442925-R1789203537637-36	112.6000	112.6000	available	2026-09-12 08:58:57.637395	2026-09-12 08:58:57.637395
7171	8	PRD-1789018442925-R1789203537638-37	119.9000	119.9000	available	2026-09-12 08:58:57.63819	2026-09-12 08:58:57.63819
7172	8	PRD-1789018442925-R1789203537638-38	114.5000	114.5000	available	2026-09-12 08:58:57.639	2026-09-12 08:58:57.639
7173	8	PRD-1789018442925-R1789203537639-39	100.0000	100.0000	available	2026-09-12 08:58:57.639802	2026-09-12 08:58:57.639802
7174	8	PRD-1789018442925-R1789203537640-40	99.5000	99.5000	available	2026-09-12 08:58:57.640717	2026-09-12 08:58:57.640717
7175	8	PRD-1789018442925-R1789203537641-41	115.5000	115.5000	available	2026-09-12 08:58:57.641529	2026-09-12 08:58:57.641529
7176	8	PRD-1789018442925-R1789203537642-42	112.0000	112.0000	available	2026-09-12 08:58:57.642324	2026-09-12 08:58:57.642324
7177	8	PRD-1789018442925-R1789203537643-43	117.8000	117.8000	available	2026-09-12 08:58:57.643112	2026-09-12 08:58:57.643112
7178	8	PRD-1789018442925-R1789203537643-44	119.0000	119.0000	available	2026-09-12 08:58:57.643905	2026-09-12 08:58:57.643905
7179	8	PRD-1789018442925-R1789203537644-45	119.4000	119.4000	available	2026-09-12 08:58:57.644696	2026-09-12 08:58:57.644696
7180	8	PRD-1789018442925-R1789203537645-46	119.3000	119.3000	available	2026-09-12 08:58:57.645475	2026-09-12 08:58:57.645475
7181	8	PRD-1789018442925-R1789203537646-47	115.5000	115.5000	available	2026-09-12 08:58:57.646269	2026-09-12 08:58:57.646269
7182	8	PRD-1789018442925-R1789203537646-48	114.6000	114.6000	available	2026-09-12 08:58:57.647071	2026-09-12 08:58:57.647071
7183	8	PRD-1789018442925-R1789203537647-49	110.4000	110.4000	available	2026-09-12 08:58:57.64786	2026-09-12 08:58:57.64786
7184	8	PRD-1789018442925-R1789203537648-50	124.8000	124.8000	available	2026-09-12 08:58:57.648656	2026-09-12 08:58:57.648656
7185	8	PRD-1789018442925-R1789203537649-51	120.6000	120.6000	available	2026-09-12 08:58:57.649447	2026-09-12 08:58:57.649447
7186	8	PRD-1789018442925-R1789203537650-52	107.8000	107.8000	available	2026-09-12 08:58:57.650511	2026-09-12 08:58:57.650511
7187	8	PRD-1789018442925-R1789203537651-53	108.6000	108.6000	available	2026-09-12 08:58:57.65158	2026-09-12 08:58:57.65158
7188	8	PRD-1789018442925-R1789203537652-54	92.7000	92.7000	available	2026-09-12 08:58:57.652647	2026-09-12 08:58:57.652647
7189	8	PRD-1789018442925-R1789203537657-0	124.5000	124.5000	available	2026-09-12 08:58:57.6577	2026-09-12 08:58:57.6577
7190	8	PRD-1789018442925-R1789203537658-1	118.4000	118.4000	available	2026-09-12 08:58:57.658773	2026-09-12 08:58:57.658773
7191	8	PRD-1789018442925-R1789203537659-2	119.2000	119.2000	available	2026-09-12 08:58:57.659575	2026-09-12 08:58:57.659575
7192	8	PRD-1789018442925-R1789203537660-3	114.8000	114.8000	available	2026-09-12 08:58:57.66036	2026-09-12 08:58:57.66036
7193	8	PRD-1789018442925-R1789203537661-4	127.0000	127.0000	available	2026-09-12 08:58:57.661185	2026-09-12 08:58:57.661185
7194	8	PRD-1789018442925-R1789203537661-5	146.1000	146.1000	available	2026-09-12 08:58:57.661966	2026-09-12 08:58:57.661966
7195	8	PRD-1789018442925-R1789203537662-6	132.8000	132.8000	available	2026-09-12 08:58:57.662747	2026-09-12 08:58:57.662747
7196	8	PRD-1789018442925-R1789203537663-7	116.3000	116.3000	available	2026-09-12 08:58:57.663532	2026-09-12 08:58:57.663532
7197	8	PRD-1789018442925-R1789203537664-8	109.2000	109.2000	available	2026-09-12 08:58:57.664315	2026-09-12 08:58:57.664315
7198	8	PRD-1789018442925-R1789203537665-9	119.4000	119.4000	available	2026-09-12 08:58:57.665126	2026-09-12 08:58:57.665126
7199	8	PRD-1789018442925-R1789203537665-10	122.3000	122.3000	available	2026-09-12 08:58:57.665911	2026-09-12 08:58:57.665911
7200	8	PRD-1789018442925-R1789203537666-11	115.6000	115.6000	available	2026-09-12 08:58:57.666697	2026-09-12 08:58:57.666697
7201	8	PRD-1789018442925-R1789203537667-12	107.4000	107.4000	available	2026-09-12 08:58:57.667481	2026-09-12 08:58:57.667481
7202	8	PRD-1789018442925-R1789203537668-13	116.1000	116.1000	available	2026-09-12 08:58:57.668261	2026-09-12 08:58:57.668261
7203	8	PRD-1789018442925-R1789203537668-14	108.5000	108.5000	available	2026-09-12 08:58:57.669094	2026-09-12 08:58:57.669094
7204	8	PRD-1789018442925-R1789203537669-15	101.5000	101.5000	available	2026-09-12 08:58:57.669881	2026-09-12 08:58:57.669881
7205	8	PRD-1789018442925-R1789203537670-16	104.4000	104.4000	available	2026-09-12 08:58:57.670662	2026-09-12 08:58:57.670662
7206	8	PRD-1789018442925-R1789203537671-17	103.9000	103.9000	available	2026-09-12 08:58:57.671467	2026-09-12 08:58:57.671467
7207	8	PRD-1789018442925-R1789203537672-18	1.0000	1.0000	available	2026-09-12 08:58:57.672252	2026-09-12 08:58:57.672252
7208	8	PRD-1789018442925-R1789203537673-19	113.6000	113.6000	available	2026-09-12 08:58:57.673126	2026-09-12 08:58:57.673126
7209	8	PRD-1789018442925-R1789203537673-20	119.6000	119.6000	available	2026-09-12 08:58:57.673925	2026-09-12 08:58:57.673925
7210	8	PRD-1789018442925-R1789203537674-21	103.5000	103.5000	available	2026-09-12 08:58:57.674798	2026-09-12 08:58:57.674798
7211	8	PRD-1789018442925-R1789203537675-22	117.9000	117.9000	available	2026-09-12 08:58:57.67559	2026-09-12 08:58:57.67559
7212	8	PRD-1789018442925-R1789203537676-23	115.5000	115.5000	available	2026-09-12 08:58:57.67644	2026-09-12 08:58:57.67644
7213	8	PRD-1789018442925-R1789203537677-24	103.0000	103.0000	available	2026-09-12 08:58:57.677518	2026-09-12 08:58:57.677518
7214	8	PRD-1789018442925-R1789203537678-25	112.5000	112.5000	available	2026-09-12 08:58:57.678314	2026-09-12 08:58:57.678314
7215	8	PRD-1789018442925-R1789203537678-26	112.6000	112.6000	available	2026-09-12 08:58:57.679096	2026-09-12 08:58:57.679096
7216	8	PRD-1789018442925-R1789203537679-27	122.6000	122.6000	available	2026-09-12 08:58:57.679876	2026-09-12 08:58:57.679876
7217	8	PRD-1789018442925-R1789203537680-28	115.5000	115.5000	available	2026-09-12 08:58:57.680661	2026-09-12 08:58:57.680661
7218	8	PRD-1789018442925-R1789203537681-29	115.1000	115.1000	available	2026-09-12 08:58:57.681455	2026-09-12 08:58:57.681455
7219	8	PRD-1789018442925-R1789203537682-30	120.0000	120.0000	available	2026-09-12 08:58:57.682241	2026-09-12 08:58:57.682241
7220	8	PRD-1789018442925-R1789203537682-31	122.8000	122.8000	available	2026-09-12 08:58:57.683019	2026-09-12 08:58:57.683019
7221	3	PRD-1789018146360-R1789203537687-0	120.0000	120.0000	available	2026-09-12 08:58:57.687157	2026-09-12 08:58:57.687157
7222	3	PRD-1789018146360-R1789203537687-1	118.8000	118.8000	available	2026-09-12 08:58:57.687962	2026-09-12 08:58:57.687962
7223	3	PRD-1789018146360-R1789203537688-2	118.1000	118.1000	available	2026-09-12 08:58:57.688752	2026-09-12 08:58:57.688752
7224	3	PRD-1789018146360-R1789203537689-3	121.0000	121.0000	available	2026-09-12 08:58:57.689549	2026-09-12 08:58:57.689549
7225	3	PRD-1789018146360-R1789203537690-4	119.9000	119.9000	available	2026-09-12 08:58:57.69033	2026-09-12 08:58:57.69033
7226	3	PRD-1789018146360-R1789203537691-5	115.8000	115.8000	available	2026-09-12 08:58:57.691122	2026-09-12 08:58:57.691122
7227	3	PRD-1789018146360-R1789203537691-6	120.9000	120.9000	available	2026-09-12 08:58:57.691903	2026-09-12 08:58:57.691903
7228	3	PRD-1789018146360-R1789203537692-7	119.8000	119.8000	available	2026-09-12 08:58:57.6927	2026-09-12 08:58:57.6927
7229	3	PRD-1789018146360-R1789203537693-8	116.7000	116.7000	available	2026-09-12 08:58:57.693492	2026-09-12 08:58:57.693492
7230	3	PRD-1789018146360-R1789203537694-9	114.7000	114.7000	available	2026-09-12 08:58:57.69427	2026-09-12 08:58:57.69427
7231	3	PRD-1789018146360-R1789203537694-10	116.9000	116.9000	available	2026-09-12 08:58:57.695062	2026-09-12 08:58:57.695062
7232	3	PRD-1789018146360-R1789203537695-11	114.7000	114.7000	available	2026-09-12 08:58:57.695853	2026-09-12 08:58:57.695853
7233	3	PRD-1789018146360-R1789203537696-12	111.7000	111.7000	available	2026-09-12 08:58:57.696657	2026-09-12 08:58:57.696657
7234	3	PRD-1789018146360-R1789203537697-13	111.5000	111.5000	available	2026-09-12 08:58:57.697642	2026-09-12 08:58:57.697642
7235	3	PRD-1789018146360-R1789203537698-14	100.8000	100.8000	available	2026-09-12 08:58:57.698434	2026-09-12 08:58:57.698434
7236	3	PRD-1789018146360-R1789203537699-15	118.2000	118.2000	available	2026-09-12 08:58:57.699214	2026-09-12 08:58:57.699214
7237	3	PRD-1789018146360-R1789203537699-16	107.0000	107.0000	available	2026-09-12 08:58:57.699999	2026-09-12 08:58:57.699999
7238	3	PRD-1789018146360-R1789203537700-17	115.0000	115.0000	available	2026-09-12 08:58:57.700777	2026-09-12 08:58:57.700777
7239	3	PRD-1789018146360-R1789203537701-18	120.9000	120.9000	available	2026-09-12 08:58:57.701564	2026-09-12 08:58:57.701564
7240	3	PRD-1789018146360-R1789203537702-19	113.0000	113.0000	available	2026-09-12 08:58:57.702345	2026-09-12 08:58:57.702345
7241	3	PRD-1789018146360-R1789203537703-20	107.6000	107.6000	available	2026-09-12 08:58:57.703127	2026-09-12 08:58:57.703127
7242	3	PRD-1789018146360-R1789203537703-21	108.1000	108.1000	available	2026-09-12 08:58:57.703903	2026-09-12 08:58:57.703903
7243	3	PRD-1789018146360-R1789203537704-22	117.7000	117.7000	available	2026-09-12 08:58:57.704716	2026-09-12 08:58:57.704716
7244	3	PRD-1789018146360-R1789203537705-23	111.2000	111.2000	available	2026-09-12 08:58:57.705555	2026-09-12 08:58:57.705555
7245	3	PRD-1789018146360-R1789203537706-24	115.7000	115.7000	available	2026-09-12 08:58:57.706362	2026-09-12 08:58:57.706362
7246	3	PRD-1789018146360-R1789203537707-25	115.8000	115.8000	available	2026-09-12 08:58:57.707146	2026-09-12 08:58:57.707146
7247	3	PRD-1789018146360-R1789203537707-26	117.7000	117.7000	available	2026-09-12 08:58:57.707935	2026-09-12 08:58:57.707935
7248	3	PRD-1789018146360-R1789203537708-27	116.1000	116.1000	available	2026-09-12 08:58:57.708729	2026-09-12 08:58:57.708729
7249	3	PRD-1789018146360-R1789203537709-28	120.9000	120.9000	available	2026-09-12 08:58:57.709517	2026-09-12 08:58:57.709517
7250	3	PRD-1789018146360-R1789203537710-29	144.3000	144.3000	available	2026-09-12 08:58:57.7103	2026-09-12 08:58:57.7103
7251	3	PRD-1789018146360-R1789203537710-30	118.8000	118.8000	available	2026-09-12 08:58:57.711087	2026-09-12 08:58:57.711087
7252	3	PRD-1789018146360-R1789203537711-31	125.2000	125.2000	available	2026-09-12 08:58:57.711871	2026-09-12 08:58:57.711871
7253	3	PRD-1789018146360-R1789203537712-32	119.9000	119.9000	available	2026-09-12 08:58:57.712662	2026-09-12 08:58:57.712662
7254	3	PRD-1789018146360-R1789203537713-33	121.0000	121.0000	available	2026-09-12 08:58:57.713453	2026-09-12 08:58:57.713453
7255	3	PRD-1789018146360-R1789203537714-34	118.9000	118.9000	available	2026-09-12 08:58:57.714245	2026-09-12 08:58:57.714245
7256	3	PRD-1789018146360-R1789203537715-35	120.8000	120.8000	available	2026-09-12 08:58:57.715142	2026-09-12 08:58:57.715142
7257	3	PRD-1789018146360-R1789203537715-36	109.4000	109.4000	available	2026-09-12 08:58:57.715933	2026-09-12 08:58:57.715933
7258	3	PRD-1789018146360-R1789203537716-37	110.8000	110.8000	available	2026-09-12 08:58:57.716872	2026-09-12 08:58:57.716872
7259	3	PRD-1789018146360-R1789203537717-38	155.5000	155.5000	available	2026-09-12 08:58:57.717666	2026-09-12 08:58:57.717666
7260	3	PRD-1789018146360-R1789203537718-39	115.0000	115.0000	available	2026-09-12 08:58:57.718452	2026-09-12 08:58:57.718452
7261	3	PRD-1789018146360-R1789203537719-40	115.5000	115.5000	available	2026-09-12 08:58:57.719237	2026-09-12 08:58:57.719237
7262	3	PRD-1789018146360-R1789203537719-41	129.4000	129.4000	available	2026-09-12 08:58:57.720026	2026-09-12 08:58:57.720026
7263	3	PRD-1789018146360-R1789203537720-42	106.1000	106.1000	available	2026-09-12 08:58:57.720812	2026-09-12 08:58:57.720812
7264	3	PRD-1789018146360-R1789203537721-43	120.3000	120.3000	available	2026-09-12 08:58:57.721608	2026-09-12 08:58:57.721608
7265	3	PRD-1789018146360-R1789203537722-44	115.5000	115.5000	available	2026-09-12 08:58:57.722392	2026-09-12 08:58:57.722392
7266	3	PRD-1789018146360-R1789203537723-45	118.9000	118.9000	available	2026-09-12 08:58:57.723178	2026-09-12 08:58:57.723178
7267	3	PRD-1789018146360-R1789203537723-46	116.0000	116.0000	available	2026-09-12 08:58:57.723982	2026-09-12 08:58:57.723982
7268	3	PRD-1789018146360-R1789203537724-47	122.3000	122.3000	available	2026-09-12 08:58:57.724773	2026-09-12 08:58:57.724773
7269	3	PRD-1789018146360-R1789203537725-48	115.0000	115.0000	available	2026-09-12 08:58:57.72559	2026-09-12 08:58:57.72559
7270	3	PRD-1789018146360-R1789203537726-49	152.0000	152.0000	available	2026-09-12 08:58:57.726372	2026-09-12 08:58:57.726372
7271	3	PRD-1789018146360-R1789203537727-50	1.0000	1.0000	available	2026-09-12 08:58:57.727147	2026-09-12 08:58:57.727147
7272	3	PRD-1789018146360-R1789203537727-51	109.6000	109.6000	available	2026-09-12 08:58:57.727921	2026-09-12 08:58:57.727921
7273	3	PRD-1789018146360-R1789203537728-52	121.0000	121.0000	available	2026-09-12 08:58:57.728698	2026-09-12 08:58:57.728698
7274	3	PRD-1789018146360-R1789203537729-53	116.0000	116.0000	available	2026-09-12 08:58:57.729474	2026-09-12 08:58:57.729474
7275	3	PRD-1789018146360-R1789203537730-54	120.9000	120.9000	available	2026-09-12 08:58:57.730254	2026-09-12 08:58:57.730254
7276	3	PRD-1789018146360-R1789203537730-55	107.4000	107.4000	available	2026-09-12 08:58:57.731033	2026-09-12 08:58:57.731033
7277	3	PRD-1789018146360-R1789203537731-56	111.2000	111.2000	available	2026-09-12 08:58:57.731843	2026-09-12 08:58:57.731843
7278	3	PRD-1789018146360-R1789203537732-57	119.9000	119.9000	available	2026-09-12 08:58:57.732702	2026-09-12 08:58:57.732702
7279	3	PRD-1789018146360-R1789203537733-58	120.0000	120.0000	available	2026-09-12 08:58:57.733509	2026-09-12 08:58:57.733509
7280	3	PRD-1789018146360-R1789203537734-59	120.0000	120.0000	available	2026-09-12 08:58:57.734292	2026-09-12 08:58:57.734292
7281	3	PRD-1789018146360-R1789203537734-60	120.0000	120.0000	available	2026-09-12 08:58:57.735072	2026-09-12 08:58:57.735072
7282	3	PRD-1789018146360-R1789203537735-61	120.0000	120.0000	available	2026-09-12 08:58:57.73593	2026-09-12 08:58:57.73593
7283	3	PRD-1789018146360-R1789203537736-62	120.0000	120.0000	available	2026-09-12 08:58:57.736711	2026-09-12 08:58:57.736711
7284	22	PRD-1789019211905-R1789203537740-0	158.1000	158.1000	available	2026-09-12 08:58:57.740738	2026-09-12 08:58:57.740738
7285	22	PRD-1789019211905-R1789203537741-1	149.0000	149.0000	available	2026-09-12 08:58:57.741702	2026-09-12 08:58:57.741702
7286	22	PRD-1789019211905-R1789203537742-2	115.9000	115.9000	available	2026-09-12 08:58:57.74249	2026-09-12 08:58:57.74249
7287	22	PRD-1789019211905-R1789203537743-3	115.3000	115.3000	available	2026-09-12 08:58:57.743268	2026-09-12 08:58:57.743268
7288	22	PRD-1789019211905-R1789203537743-4	115.8000	115.8000	available	2026-09-12 08:58:57.744049	2026-09-12 08:58:57.744049
7289	22	PRD-1789019211905-R1789203537744-5	117.3000	117.3000	available	2026-09-12 08:58:57.744834	2026-09-12 08:58:57.744834
7290	22	PRD-1789019211905-R1789203537745-6	120.0000	120.0000	available	2026-09-12 08:58:57.745662	2026-09-12 08:58:57.745662
7291	22	PRD-1789019211905-R1789203537746-7	81.8000	81.8000	available	2026-09-12 08:58:57.746451	2026-09-12 08:58:57.746451
7292	22	PRD-1789019211905-R1789203537747-8	119.4000	119.4000	available	2026-09-12 08:58:57.747238	2026-09-12 08:58:57.747238
7293	22	PRD-1789019211905-R1789203537747-9	118.8000	118.8000	available	2026-09-12 08:58:57.748024	2026-09-12 08:58:57.748024
7294	22	PRD-1789019211905-R1789203537748-10	118.5000	118.5000	available	2026-09-12 08:58:57.748815	2026-09-12 08:58:57.748815
7295	22	PRD-1789019211905-R1789203537749-11	91.7000	91.7000	available	2026-09-12 08:58:57.749601	2026-09-12 08:58:57.749601
7296	22	PRD-1789019211905-R1789203537750-12	110.9000	110.9000	available	2026-09-12 08:58:57.750393	2026-09-12 08:58:57.750393
7297	22	PRD-1789019211905-R1789203537751-13	118.5000	118.5000	available	2026-09-12 08:58:57.751181	2026-09-12 08:58:57.751181
7298	22	PRD-1789019211905-R1789203537751-14	121.0000	121.0000	available	2026-09-12 08:58:57.751969	2026-09-12 08:58:57.751969
7299	22	PRD-1789019211905-R1789203537752-15	63.7000	63.7000	available	2026-09-12 08:58:57.752758	2026-09-12 08:58:57.752758
7300	22	PRD-1789019211905-R1789203537753-16	114.8000	114.8000	available	2026-09-12 08:58:57.753552	2026-09-12 08:58:57.753552
7301	22	PRD-1789019211905-R1789203537754-17	107.7000	107.7000	available	2026-09-12 08:58:57.754339	2026-09-12 08:58:57.754339
7302	22	PRD-1789019211905-R1789203537755-18	108.3000	108.3000	available	2026-09-12 08:58:57.755132	2026-09-12 08:58:57.755132
7303	22	PRD-1789019211905-R1789203537755-19	117.6000	117.6000	available	2026-09-12 08:58:57.756091	2026-09-12 08:58:57.756091
7304	22	PRD-1789019211905-R1789203537757-20	102.9000	102.9000	available	2026-09-12 08:58:57.757172	2026-09-12 08:58:57.757172
7305	22	PRD-1789019211905-R1789203537758-21	108.8000	108.8000	available	2026-09-12 08:58:57.758255	2026-09-12 08:58:57.758255
7306	22	PRD-1789019211905-R1789203537759-22	108.1000	108.1000	available	2026-09-12 08:58:57.759328	2026-09-12 08:58:57.759328
7307	22	PRD-1789019211905-R1789203537760-23	111.3000	111.3000	available	2026-09-12 08:58:57.760403	2026-09-12 08:58:57.760403
7308	22	PRD-1789019211905-R1789203537761-24	129.3000	129.3000	available	2026-09-12 08:58:57.761487	2026-09-12 08:58:57.761487
7309	22	PRD-1789019211905-R1789203537762-25	100.9000	100.9000	available	2026-09-12 08:58:57.762556	2026-09-12 08:58:57.762556
7310	22	PRD-1789019211905-R1789203537763-26	122.3000	122.3000	available	2026-09-12 08:58:57.763617	2026-09-12 08:58:57.763617
7311	22	PRD-1789019211905-R1789203537764-27	106.0000	106.0000	available	2026-09-12 08:58:57.764678	2026-09-12 08:58:57.764678
7312	22	PRD-1789019211905-R1789203537765-28	97.9000	97.9000	available	2026-09-12 08:58:57.765493	2026-09-12 08:58:57.765493
7313	22	PRD-1789019211905-R1789203537766-29	114.0000	114.0000	available	2026-09-12 08:58:57.766353	2026-09-12 08:58:57.766353
7314	22	PRD-1789019211905-R1789203537767-30	114.0000	114.0000	available	2026-09-12 08:58:57.767219	2026-09-12 08:58:57.767219
7315	22	PRD-1789019211905-R1789203537767-31	117.3000	117.3000	available	2026-09-12 08:58:57.768033	2026-09-12 08:58:57.768033
7316	22	PRD-1789019211905-R1789203537768-32	115.2000	115.2000	available	2026-09-12 08:58:57.768827	2026-09-12 08:58:57.768827
7317	22	PRD-1789019211905-R1789203537769-33	116.0000	116.0000	available	2026-09-12 08:58:57.769614	2026-09-12 08:58:57.769614
7318	22	PRD-1789019211905-R1789203537770-34	117.1000	117.1000	available	2026-09-12 08:58:57.770396	2026-09-12 08:58:57.770396
7319	22	PRD-1789019211905-R1789203537771-35	118.7000	118.7000	available	2026-09-12 08:58:57.771191	2026-09-12 08:58:57.771191
7320	22	PRD-1789019211905-R1789203537771-36	117.4000	117.4000	available	2026-09-12 08:58:57.771976	2026-09-12 08:58:57.771976
7321	22	PRD-1789019211905-R1789203537772-37	110.0000	110.0000	available	2026-09-12 08:58:57.772762	2026-09-12 08:58:57.772762
7322	22	PRD-1789019211905-R1789203537773-38	115.7000	115.7000	available	2026-09-12 08:58:57.773559	2026-09-12 08:58:57.773559
7323	22	PRD-1789019211905-R1789203537774-39	112.8000	112.8000	available	2026-09-12 08:58:57.77434	2026-09-12 08:58:57.77434
7324	22	PRD-1789019211905-R1789203537775-40	120.0000	120.0000	available	2026-09-12 08:58:57.77513	2026-09-12 08:58:57.77513
7325	22	PRD-1789019211905-R1789203537775-41	120.0000	120.0000	available	2026-09-12 08:58:57.775973	2026-09-12 08:58:57.775973
7326	22	PRD-1789019211905-R1789203537777-42	103.0000	103.0000	available	2026-09-12 08:58:57.777198	2026-09-12 08:58:57.777198
7327	22	PRD-1789019211905-R1789203537777-43	124.5000	124.5000	available	2026-09-12 08:58:57.778001	2026-09-12 08:58:57.778001
7328	22	PRD-1789019211905-R1789203537778-44	118.1000	118.1000	available	2026-09-12 08:58:57.778788	2026-09-12 08:58:57.778788
7329	22	PRD-1789019211905-R1789203537779-45	120.0000	120.0000	available	2026-09-12 08:58:57.779571	2026-09-12 08:58:57.779571
7330	22	PRD-1789019211905-R1789203537780-46	118.0000	118.0000	available	2026-09-12 08:58:57.780361	2026-09-12 08:58:57.780361
7331	22	PRD-1789019211905-R1789203537781-47	1168.0000	1168.0000	available	2026-09-12 08:58:57.781175	2026-09-12 08:58:57.781175
7332	22	PRD-1789019211905-R1789203537781-48	109.6000	109.6000	available	2026-09-12 08:58:57.781963	2026-09-12 08:58:57.781963
7333	22	PRD-1789019211905-R1789203537782-49	120.5000	120.5000	available	2026-09-12 08:58:57.782746	2026-09-12 08:58:57.782746
7334	22	PRD-1789019211905-R1789203537783-50	120.0000	120.0000	available	2026-09-12 08:58:57.783525	2026-09-12 08:58:57.783525
7335	22	PRD-1789019211905-R1789203537784-51	120.3000	120.3000	available	2026-09-12 08:58:57.784307	2026-09-12 08:58:57.784307
7336	22	PRD-1789019211905-R1789203537785-52	117.1000	117.1000	available	2026-09-12 08:58:57.785112	2026-09-12 08:58:57.785112
7337	22	PRD-1789019211905-R1789203537785-53	121.0000	121.0000	available	2026-09-12 08:58:57.786018	2026-09-12 08:58:57.786018
7338	22	PRD-1789019211905-R1789203537786-54	119.2000	119.2000	available	2026-09-12 08:58:57.786836	2026-09-12 08:58:57.786836
7339	22	PRD-1789019211905-R1789203537787-55	118.1000	118.1000	available	2026-09-12 08:58:57.787629	2026-09-12 08:58:57.787629
7340	22	PRD-1789019211905-R1789203537788-56	120.6000	120.6000	available	2026-09-12 08:58:57.788435	2026-09-12 08:58:57.788435
7341	22	PRD-1789019211905-R1789203537789-57	106.1000	106.1000	available	2026-09-12 08:58:57.789229	2026-09-12 08:58:57.789229
7342	22	PRD-1789019211905-R1789203537789-58	119.0000	119.0000	available	2026-09-12 08:58:57.790011	2026-09-12 08:58:57.790011
7343	22	PRD-1789019211905-R1789203537790-59	114.6000	114.6000	available	2026-09-12 08:58:57.790803	2026-09-12 08:58:57.790803
7344	22	PRD-1789019211905-R1789203537791-60	118.5000	118.5000	available	2026-09-12 08:58:57.791594	2026-09-12 08:58:57.791594
7345	22	PRD-1789019211905-R1789203537792-61	118.1000	118.1000	available	2026-09-12 08:58:57.792397	2026-09-12 08:58:57.792397
7346	22	PRD-1789019211905-R1789203537793-62	90.0000	90.0000	available	2026-09-12 08:58:57.793205	2026-09-12 08:58:57.793205
7347	22	PRD-1789019211905-R1789203537793-63	114.6000	114.6000	available	2026-09-12 08:58:57.79399	2026-09-12 08:58:57.79399
7348	22	PRD-1789019211905-R1789203537794-64	117.9000	117.9000	available	2026-09-12 08:58:57.794778	2026-09-12 08:58:57.794778
7349	22	PRD-1789019211905-R1789203537795-65	119.2000	119.2000	available	2026-09-12 08:58:57.795584	2026-09-12 08:58:57.795584
7350	22	PRD-1789019211905-R1789203537796-66	121.2000	121.2000	available	2026-09-12 08:58:57.796797	2026-09-12 08:58:57.796797
7351	22	PRD-1789019211905-R1789203537797-67	116.6000	116.6000	available	2026-09-12 08:58:57.797589	2026-09-12 08:58:57.797589
7352	22	PRD-1789019211905-R1789203537798-68	103.3000	103.3000	available	2026-09-12 08:58:57.798382	2026-09-12 08:58:57.798382
7353	22	PRD-1789019211905-R1789203537799-69	117.7000	117.7000	available	2026-09-12 08:58:57.799168	2026-09-12 08:58:57.799168
7354	22	PRD-1789019211905-R1789203537799-70	117.2000	117.2000	available	2026-09-12 08:58:57.799957	2026-09-12 08:58:57.799957
7355	22	PRD-1789019211905-R1789203537800-71	105.5000	105.5000	available	2026-09-12 08:58:57.800748	2026-09-12 08:58:57.800748
7356	22	PRD-1789019211905-R1789203537801-72	116.5000	116.5000	available	2026-09-12 08:58:57.801538	2026-09-12 08:58:57.801538
7357	22	PRD-1789019211905-R1789203537802-73	119.2000	119.2000	available	2026-09-12 08:58:57.802327	2026-09-12 08:58:57.802327
7358	22	PRD-1789019211905-R1789203537803-74	114.4000	114.4000	available	2026-09-12 08:58:57.80311	2026-09-12 08:58:57.80311
7359	22	PRD-1789019211905-R1789203537803-75	123.0000	123.0000	available	2026-09-12 08:58:57.803892	2026-09-12 08:58:57.803892
7360	22	PRD-1789019211905-R1789203537804-76	120.3000	120.3000	available	2026-09-12 08:58:57.804688	2026-09-12 08:58:57.804688
7361	22	PRD-1789019211905-R1789203537805-77	121.5000	121.5000	available	2026-09-12 08:58:57.805484	2026-09-12 08:58:57.805484
7362	22	PRD-1789019211905-R1789203537806-78	123.6000	123.6000	available	2026-09-12 08:58:57.806284	2026-09-12 08:58:57.806284
7363	22	PRD-1789019211905-R1789203537806-79	120.1000	120.1000	available	2026-09-12 08:58:57.807077	2026-09-12 08:58:57.807077
7364	22	PRD-1789019211905-R1789203537807-80	126.3000	126.3000	available	2026-09-12 08:58:57.807861	2026-09-12 08:58:57.807861
7365	80	PRD-1789106539801-R1789203537811-0	120.0000	120.0000	available	2026-09-12 08:58:57.811909	2026-09-12 08:58:57.811909
7366	13	PRD-1789018725877-R1789203537815-0	120.0000	120.0000	available	2026-09-12 08:58:57.815677	2026-09-12 08:58:57.815677
7367	13	PRD-1789018725877-R1789203537816-1	101.1000	101.1000	available	2026-09-12 08:58:57.816496	2026-09-12 08:58:57.816496
7368	13	PRD-1789018725877-R1789203537817-2	60.1000	60.1000	available	2026-09-12 08:58:57.817442	2026-09-12 08:58:57.817442
7369	13	PRD-1789018725877-R1789203537818-3	112.6000	112.6000	available	2026-09-12 08:58:57.818233	2026-09-12 08:58:57.818233
7370	13	PRD-1789018725877-R1789203537818-4	96.2000	96.2000	available	2026-09-12 08:58:57.819018	2026-09-12 08:58:57.819018
7371	13	PRD-1789018725877-R1789203537819-5	120.0000	120.0000	available	2026-09-12 08:58:57.8198	2026-09-12 08:58:57.8198
7372	13	PRD-1789018725877-R1789203537820-6	121.5000	121.5000	available	2026-09-12 08:58:57.820606	2026-09-12 08:58:57.820606
7373	13	PRD-1789018725877-R1789203537821-7	106.5000	106.5000	available	2026-09-12 08:58:57.821397	2026-09-12 08:58:57.821397
7374	13	PRD-1789018725877-R1789203537822-8	110.4000	110.4000	available	2026-09-12 08:58:57.822182	2026-09-12 08:58:57.822182
7375	13	PRD-1789018725877-R1789203537822-9	127.7000	127.7000	available	2026-09-12 08:58:57.822969	2026-09-12 08:58:57.822969
7376	13	PRD-1789018725877-R1789203537823-10	121.2000	121.2000	available	2026-09-12 08:58:57.823754	2026-09-12 08:58:57.823754
7377	13	PRD-1789018725877-R1789203537824-11	118.6000	118.6000	available	2026-09-12 08:58:57.824553	2026-09-12 08:58:57.824553
7378	13	PRD-1789018725877-R1789203537825-12	96.9000	96.9000	available	2026-09-12 08:58:57.825345	2026-09-12 08:58:57.825345
7379	13	PRD-1789018725877-R1789203537826-13	119.6000	119.6000	available	2026-09-12 08:58:57.826143	2026-09-12 08:58:57.826143
7380	13	PRD-1789018725877-R1789203537826-14	120.8000	120.8000	available	2026-09-12 08:58:57.826971	2026-09-12 08:58:57.826971
7381	13	PRD-1789018725877-R1789203537827-15	86.0000	86.0000	available	2026-09-12 08:58:57.827755	2026-09-12 08:58:57.827755
7382	13	PRD-1789018725877-R1789203537828-16	87.6000	87.6000	available	2026-09-12 08:58:57.828572	2026-09-12 08:58:57.828572
7383	13	PRD-1789018725877-R1789203537829-17	116.9000	116.9000	available	2026-09-12 08:58:57.829365	2026-09-12 08:58:57.829365
7384	13	PRD-1789018725877-R1789203537830-18	127.4000	127.4000	available	2026-09-12 08:58:57.830145	2026-09-12 08:58:57.830145
7385	13	PRD-1789018725877-R1789203537830-19	122.5000	122.5000	available	2026-09-12 08:58:57.830937	2026-09-12 08:58:57.830937
7386	13	PRD-1789018725877-R1789203537831-20	111.6000	111.6000	available	2026-09-12 08:58:57.83172	2026-09-12 08:58:57.83172
7387	13	PRD-1789018725877-R1789203537832-21	118.0000	118.0000	available	2026-09-12 08:58:57.832535	2026-09-12 08:58:57.832535
7388	13	PRD-1789018725877-R1789203537833-22	121.9000	121.9000	available	2026-09-12 08:58:57.833322	2026-09-12 08:58:57.833322
7389	15	PRD-1789018843399-R1789203537838-0	120.0000	120.0000	available	2026-09-12 08:58:57.838203	2026-09-12 08:58:57.838203
7390	15	PRD-1789018843399-R1789203537838-1	120.0000	120.0000	available	2026-09-12 08:58:57.839004	2026-09-12 08:58:57.839004
7391	15	PRD-1789018843399-R1789203537839-2	114.0000	114.0000	available	2026-09-12 08:58:57.839792	2026-09-12 08:58:57.839792
7392	15	PRD-1789018843399-R1789203537840-3	119.5000	119.5000	available	2026-09-12 08:58:57.84063	2026-09-12 08:58:57.84063
7393	15	PRD-1789018843399-R1789203537841-4	120.3000	120.3000	available	2026-09-12 08:58:57.841426	2026-09-12 08:58:57.841426
7394	15	PRD-1789018843399-R1789203537842-5	120.3000	120.3000	available	2026-09-12 08:58:57.842208	2026-09-12 08:58:57.842208
7395	15	PRD-1789018843399-R1789203537842-6	120.0000	120.0000	available	2026-09-12 08:58:57.842997	2026-09-12 08:58:57.842997
7396	15	PRD-1789018843399-R1789203537843-7	120.3000	120.3000	available	2026-09-12 08:58:57.843785	2026-09-12 08:58:57.843785
7397	15	PRD-1789018843399-R1789203537844-8	120.3000	120.3000	available	2026-09-12 08:58:57.84458	2026-09-12 08:58:57.84458
7398	15	PRD-1789018843399-R1789203537845-9	120.0000	120.0000	available	2026-09-12 08:58:57.845361	2026-09-12 08:58:57.845361
7399	15	PRD-1789018843399-R1789203537846-10	120.4000	120.4000	available	2026-09-12 08:58:57.846153	2026-09-12 08:58:57.846153
7400	15	PRD-1789018843399-R1789203537846-11	120.0000	120.0000	available	2026-09-12 08:58:57.846989	2026-09-12 08:58:57.846989
7401	15	PRD-1789018843399-R1789203537847-12	125.5000	125.5000	available	2026-09-12 08:58:57.847936	2026-09-12 08:58:57.847936
7402	15	PRD-1789018843399-R1789203537848-13	120.4000	120.4000	available	2026-09-12 08:58:57.848738	2026-09-12 08:58:57.848738
7403	15	PRD-1789018843399-R1789203537849-14	69.7000	69.7000	available	2026-09-12 08:58:57.84953	2026-09-12 08:58:57.84953
7404	15	PRD-1789018843399-R1789203537850-15	120.0000	120.0000	available	2026-09-12 08:58:57.850319	2026-09-12 08:58:57.850319
7405	15	PRD-1789018843399-R1789203537850-16	121.0000	121.0000	available	2026-09-12 08:58:57.851094	2026-09-12 08:58:57.851094
7406	15	PRD-1789018843399-R1789203537851-17	129.0000	129.0000	available	2026-09-12 08:58:57.851938	2026-09-12 08:58:57.851938
7407	22	PRD-1789019211905-R1789203537855-0	121.5000	121.5000	available	2026-09-12 08:58:57.855931	2026-09-12 08:58:57.855931
7408	22	PRD-1789019211905-R1789203537856-1	120.0000	120.0000	available	2026-09-12 08:58:57.856762	2026-09-12 08:58:57.856762
7409	22	PRD-1789019211905-R1789203537857-2	117.7000	117.7000	available	2026-09-12 08:58:57.857556	2026-09-12 08:58:57.857556
7410	22	PRD-1789019211905-R1789203537858-3	109.2000	109.2000	available	2026-09-12 08:58:57.858611	2026-09-12 08:58:57.858611
7411	22	PRD-1789019211905-R1789203537859-4	116.6000	116.6000	available	2026-09-12 08:58:57.859492	2026-09-12 08:58:57.859492
7412	22	PRD-1789019211905-R1789203537860-5	120.3000	120.3000	available	2026-09-12 08:58:57.860336	2026-09-12 08:58:57.860336
7413	22	PRD-1789019211905-R1789203537861-6	120.9000	120.9000	available	2026-09-12 08:58:57.861149	2026-09-12 08:58:57.861149
7414	22	PRD-1789019211905-R1789203537861-7	123.8000	123.8000	available	2026-09-12 08:58:57.861936	2026-09-12 08:58:57.861936
7415	22	PRD-1789019211905-R1789203537862-8	129.7000	129.7000	available	2026-09-12 08:58:57.862728	2026-09-12 08:58:57.862728
7416	22	PRD-1789019211905-R1789203537863-9	121.7000	121.7000	available	2026-09-12 08:58:57.863516	2026-09-12 08:58:57.863516
7417	22	PRD-1789019211905-R1789203537864-10	120.6000	120.6000	available	2026-09-12 08:58:57.864304	2026-09-12 08:58:57.864304
7418	22	PRD-1789019211905-R1789203537865-11	123.4000	123.4000	available	2026-09-12 08:58:57.865417	2026-09-12 08:58:57.865417
7419	22	PRD-1789019211905-R1789203537866-12	122.5000	122.5000	available	2026-09-12 08:58:57.866504	2026-09-12 08:58:57.866504
7420	22	PRD-1789019211905-R1789203537867-13	120.0000	120.0000	available	2026-09-12 08:58:57.867621	2026-09-12 08:58:57.867621
7421	22	PRD-1789019211905-R1789203537868-14	101.6000	101.6000	available	2026-09-12 08:58:57.868751	2026-09-12 08:58:57.868751
7422	22	PRD-1789019211905-R1789203537869-15	127.5000	127.5000	available	2026-09-12 08:58:57.869821	2026-09-12 08:58:57.869821
7423	21	PRD-1789019144403-R1789203537874-0	120.1000	120.1000	available	2026-09-12 08:58:57.874616	2026-09-12 08:58:57.874616
7424	21	PRD-1789019144403-R1789203537875-1	133.0000	133.0000	available	2026-09-12 08:58:57.87541	2026-09-12 08:58:57.87541
7425	21	PRD-1789019144403-R1789203537876-2	120.1000	120.1000	available	2026-09-12 08:58:57.876197	2026-09-12 08:58:57.876197
7426	21	PRD-1789019144403-R1789203537876-3	115.2000	115.2000	available	2026-09-12 08:58:57.877028	2026-09-12 08:58:57.877028
7427	21	PRD-1789019144403-R1789203537877-4	120.2000	120.2000	available	2026-09-12 08:58:57.877841	2026-09-12 08:58:57.877841
7428	21	PRD-1789019144403-R1789203537878-5	119.6000	119.6000	available	2026-09-12 08:58:57.87876	2026-09-12 08:58:57.87876
7429	21	PRD-1789019144403-R1789203537879-6	118.7000	118.7000	available	2026-09-12 08:58:57.879691	2026-09-12 08:58:57.879691
7430	21	PRD-1789019144403-R1789203537880-7	119.6000	119.6000	available	2026-09-12 08:58:57.880563	2026-09-12 08:58:57.880563
7431	21	PRD-1789019144403-R1789203537881-8	118.3000	118.3000	available	2026-09-12 08:58:57.881377	2026-09-12 08:58:57.881377
7432	21	PRD-1789019144403-R1789203537882-9	130.0000	130.0000	available	2026-09-12 08:58:57.882241	2026-09-12 08:58:57.882241
7433	21	PRD-1789019144403-R1789203537882-10	137.6000	137.6000	available	2026-09-12 08:58:57.883073	2026-09-12 08:58:57.883073
7434	21	PRD-1789019144403-R1789203537883-11	127.9000	127.9000	available	2026-09-12 08:58:57.884004	2026-09-12 08:58:57.884004
7435	36	PRD-1789025355244-R1789203537887-0	113.9000	113.9000	available	2026-09-12 08:58:57.887879	2026-09-12 08:58:57.887879
7436	36	PRD-1789025355244-R1789203537888-1	113.9000	113.9000	available	2026-09-12 08:58:57.888687	2026-09-12 08:58:57.888687
7437	36	PRD-1789025355244-R1789203537889-2	113.9000	113.9000	available	2026-09-12 08:58:57.889485	2026-09-12 08:58:57.889485
7438	13	PRD-1789018725877-R1789203537893-0	116.7000	116.7000	available	2026-09-12 08:58:57.893886	2026-09-12 08:58:57.893886
7439	13	PRD-1789018725877-R1789203537894-1	111.0000	111.0000	available	2026-09-12 08:58:57.894706	2026-09-12 08:58:57.894706
7440	13	PRD-1789018725877-R1789203537895-2	111.6000	111.6000	available	2026-09-12 08:58:57.895496	2026-09-12 08:58:57.895496
7441	13	PRD-1789018725877-R1789203537896-3	119.4000	119.4000	available	2026-09-12 08:58:57.896289	2026-09-12 08:58:57.896289
7442	13	PRD-1789018725877-R1789203537897-4	111.8000	111.8000	available	2026-09-12 08:58:57.897138	2026-09-12 08:58:57.897138
7443	13	PRD-1789018725877-R1789203537897-5	111.9000	111.9000	available	2026-09-12 08:58:57.898052	2026-09-12 08:58:57.898052
7444	13	PRD-1789018725877-R1789203537898-6	112.0000	112.0000	available	2026-09-12 08:58:57.898847	2026-09-12 08:58:57.898847
7445	13	PRD-1789018725877-R1789203537899-7	112.8000	112.8000	available	2026-09-12 08:58:57.899697	2026-09-12 08:58:57.899697
7446	13	PRD-1789018725877-R1789203537900-8	110.4000	110.4000	available	2026-09-12 08:58:57.900538	2026-09-12 08:58:57.900538
7447	13	PRD-1789018725877-R1789203537901-9	115.0000	115.0000	available	2026-09-12 08:58:57.901339	2026-09-12 08:58:57.901339
7448	13	PRD-1789018725877-R1789203537902-10	117.0000	117.0000	available	2026-09-12 08:58:57.902184	2026-09-12 08:58:57.902184
7449	13	PRD-1789018725877-R1789203537902-11	116.0000	116.0000	available	2026-09-12 08:58:57.903016	2026-09-12 08:58:57.903016
7450	13	PRD-1789018725877-R1789203537903-12	109.9000	109.9000	available	2026-09-12 08:58:57.903815	2026-09-12 08:58:57.903815
7451	13	PRD-1789018725877-R1789203537904-13	117.3000	117.3000	available	2026-09-12 08:58:57.904635	2026-09-12 08:58:57.904635
7452	13	PRD-1789018725877-R1789203537905-14	116.8000	116.8000	available	2026-09-12 08:58:57.90543	2026-09-12 08:58:57.90543
7453	13	PRD-1789018725877-R1789203537906-15	124.6000	124.6000	available	2026-09-12 08:58:57.906255	2026-09-12 08:58:57.906255
7454	13	PRD-1789018725877-R1789203537906-16	115.0000	115.0000	available	2026-09-12 08:58:57.907042	2026-09-12 08:58:57.907042
7455	13	PRD-1789018725877-R1789203537907-17	96.6000	96.6000	available	2026-09-12 08:58:57.907835	2026-09-12 08:58:57.907835
7456	13	PRD-1789018725877-R1789203537908-18	115.0000	115.0000	available	2026-09-12 08:58:57.908672	2026-09-12 08:58:57.908672
7457	13	PRD-1789018725877-R1789203537909-19	115.0000	115.0000	available	2026-09-12 08:58:57.909478	2026-09-12 08:58:57.909478
7458	13	PRD-1789018725877-R1789203537910-20	120.1000	120.1000	available	2026-09-12 08:58:57.910269	2026-09-12 08:58:57.910269
7459	13	PRD-1789018725877-R1789203537910-21	155.0000	155.0000	available	2026-09-12 08:58:57.911055	2026-09-12 08:58:57.911055
7460	13	PRD-1789018725877-R1789203537911-22	118.5000	118.5000	available	2026-09-12 08:58:57.911839	2026-09-12 08:58:57.911839
7461	13	PRD-1789018725877-R1789203537912-23	115.0000	115.0000	available	2026-09-12 08:58:57.912659	2026-09-12 08:58:57.912659
7462	13	PRD-1789018725877-R1789203537913-24	118.9000	118.9000	available	2026-09-12 08:58:57.913501	2026-09-12 08:58:57.913501
7463	13	PRD-1789018725877-R1789203537914-25	115.0000	115.0000	available	2026-09-12 08:58:57.914291	2026-09-12 08:58:57.914291
7464	13	PRD-1789018725877-R1789203537914-26	115.0000	115.0000	available	2026-09-12 08:58:57.915096	2026-09-12 08:58:57.915096
7465	13	PRD-1789018725877-R1789203537915-27	119.2000	119.2000	available	2026-09-12 08:58:57.915881	2026-09-12 08:58:57.915881
7466	13	PRD-1789018725877-R1789203537916-28	116.5000	116.5000	available	2026-09-12 08:58:57.916666	2026-09-12 08:58:57.916666
7467	13	PRD-1789018725877-R1789203537917-29	109.7000	109.7000	available	2026-09-12 08:58:57.917456	2026-09-12 08:58:57.917456
7468	13	PRD-1789018725877-R1789203537918-30	115.0000	115.0000	available	2026-09-12 08:58:57.918244	2026-09-12 08:58:57.918244
7469	13	PRD-1789018725877-R1789203537918-31	113.1000	113.1000	available	2026-09-12 08:58:57.919031	2026-09-12 08:58:57.919031
7470	13	PRD-1789018725877-R1789203537919-32	114.8000	114.8000	available	2026-09-12 08:58:57.919865	2026-09-12 08:58:57.919865
7471	13	PRD-1789018725877-R1789203537920-33	111.0000	111.0000	available	2026-09-12 08:58:57.920646	2026-09-12 08:58:57.920646
7472	13	PRD-1789018725877-R1789203537921-34	111.0000	111.0000	available	2026-09-12 08:58:57.921612	2026-09-12 08:58:57.921612
7473	13	PRD-1789018725877-R1789203537922-35	110.8000	110.8000	available	2026-09-12 08:58:57.922395	2026-09-12 08:58:57.922395
7474	13	PRD-1789018725877-R1789203537923-36	104.7000	104.7000	available	2026-09-12 08:58:57.92319	2026-09-12 08:58:57.92319
7475	13	PRD-1789018725877-R1789203537923-37	112.7000	112.7000	available	2026-09-12 08:58:57.923978	2026-09-12 08:58:57.923978
7476	13	PRD-1789018725877-R1789203537924-38	114.4000	114.4000	available	2026-09-12 08:58:57.924761	2026-09-12 08:58:57.924761
7477	13	PRD-1789018725877-R1789203537925-39	115.0000	115.0000	available	2026-09-12 08:58:57.925572	2026-09-12 08:58:57.925572
7478	13	PRD-1789018725877-R1789203537926-40	118.1000	118.1000	available	2026-09-12 08:58:57.926363	2026-09-12 08:58:57.926363
7479	13	PRD-1789018725877-R1789203537927-41	118.8000	118.8000	available	2026-09-12 08:58:57.927192	2026-09-12 08:58:57.927192
7480	13	PRD-1789018725877-R1789203537927-42	123.5000	123.5000	available	2026-09-12 08:58:57.928006	2026-09-12 08:58:57.928006
7481	13	PRD-1789018725877-R1789203537928-43	113.1000	113.1000	available	2026-09-12 08:58:57.928792	2026-09-12 08:58:57.928792
7482	13	PRD-1789018725877-R1789203537929-44	115.0000	115.0000	available	2026-09-12 08:58:57.929577	2026-09-12 08:58:57.929577
7483	13	PRD-1789018725877-R1789203537930-45	118.5000	118.5000	available	2026-09-12 08:58:57.930365	2026-09-12 08:58:57.930365
7484	13	PRD-1789018725877-R1789203537931-46	117.6000	117.6000	available	2026-09-12 08:58:57.931144	2026-09-12 08:58:57.931144
7485	13	PRD-1789018725877-R1789203537931-47	115.0000	115.0000	available	2026-09-12 08:58:57.931934	2026-09-12 08:58:57.931934
7486	13	PRD-1789018725877-R1789203537932-48	115.0000	115.0000	available	2026-09-12 08:58:57.932724	2026-09-12 08:58:57.932724
7487	13	PRD-1789018725877-R1789203537933-49	115.0000	115.0000	available	2026-09-12 08:58:57.933505	2026-09-12 08:58:57.933505
7488	13	PRD-1789018725877-R1789203537934-50	114.7000	114.7000	available	2026-09-12 08:58:57.934284	2026-09-12 08:58:57.934284
7489	13	PRD-1789018725877-R1789203537934-51	115.0000	115.0000	available	2026-09-12 08:58:57.935062	2026-09-12 08:58:57.935062
7490	13	PRD-1789018725877-R1789203537935-52	115.0000	115.0000	available	2026-09-12 08:58:57.935857	2026-09-12 08:58:57.935857
7491	13	PRD-1789018725877-R1789203537936-53	115.0000	115.0000	available	2026-09-12 08:58:57.936677	2026-09-12 08:58:57.936677
7492	13	PRD-1789018725877-R1789203537937-54	118.2000	118.2000	available	2026-09-12 08:58:57.937558	2026-09-12 08:58:57.937558
7493	13	PRD-1789018725877-R1789203537938-55	108.8000	108.8000	available	2026-09-12 08:58:57.938341	2026-09-12 08:58:57.938341
7494	13	PRD-1789018725877-R1789203537939-56	115.5000	115.5000	available	2026-09-12 08:58:57.939126	2026-09-12 08:58:57.939126
7495	13	PRD-1789018725877-R1789203537939-57	116.3000	116.3000	available	2026-09-12 08:58:57.939904	2026-09-12 08:58:57.939904
7496	13	PRD-1789018725877-R1789203537940-58	115.0000	115.0000	available	2026-09-12 08:58:57.940687	2026-09-12 08:58:57.940687
7497	13	PRD-1789018725877-R1789203537941-59	95.3000	95.3000	available	2026-09-12 08:58:57.941474	2026-09-12 08:58:57.941474
7498	13	PRD-1789018725877-R1789203537942-60	115.0000	115.0000	available	2026-09-12 08:58:57.942256	2026-09-12 08:58:57.942256
7499	13	PRD-1789018725877-R1789203537942-61	104.7000	104.7000	available	2026-09-12 08:58:57.943037	2026-09-12 08:58:57.943037
7500	13	PRD-1789018725877-R1789203537943-62	115.0000	115.0000	available	2026-09-12 08:58:57.943817	2026-09-12 08:58:57.943817
7501	13	PRD-1789018725877-R1789203537944-63	111.5000	111.5000	available	2026-09-12 08:58:57.944625	2026-09-12 08:58:57.944625
7502	13	PRD-1789018725877-R1789203537945-64	98.0000	98.0000	available	2026-09-12 08:58:57.945431	2026-09-12 08:58:57.945431
7503	13	PRD-1789018725877-R1789203537946-65	109.1000	109.1000	available	2026-09-12 08:58:57.946217	2026-09-12 08:58:57.946217
7504	13	PRD-1789018725877-R1789203537946-66	109.3000	109.3000	available	2026-09-12 08:58:57.947	2026-09-12 08:58:57.947
7505	13	PRD-1789018725877-R1789203537947-67	115.0000	115.0000	available	2026-09-12 08:58:57.947815	2026-09-12 08:58:57.947815
7506	13	PRD-1789018725877-R1789203537948-68	115.0000	115.0000	available	2026-09-12 08:58:57.948712	2026-09-12 08:58:57.948712
7507	13	PRD-1789018725877-R1789203537949-69	115.0000	115.0000	available	2026-09-12 08:58:57.949504	2026-09-12 08:58:57.949504
7508	13	PRD-1789018725877-R1789203537950-70	115.0000	115.0000	available	2026-09-12 08:58:57.950368	2026-09-12 08:58:57.950368
7509	13	PRD-1789018725877-R1789203537951-71	115.0000	115.0000	available	2026-09-12 08:58:57.95123	2026-09-12 08:58:57.95123
7510	13	PRD-1789018725877-R1789203537951-72	115.8000	115.8000	available	2026-09-12 08:58:57.952016	2026-09-12 08:58:57.952016
7511	13	PRD-1789018725877-R1789203537952-73	115.0000	115.0000	available	2026-09-12 08:58:57.952801	2026-09-12 08:58:57.952801
7512	13	PRD-1789018725877-R1789203537953-74	116.5000	116.5000	available	2026-09-12 08:58:57.953609	2026-09-12 08:58:57.953609
7513	13	PRD-1789018725877-R1789203537954-75	116.2000	116.2000	available	2026-09-12 08:58:57.954396	2026-09-12 08:58:57.954396
7514	13	PRD-1789018725877-R1789203537955-76	115.9000	115.9000	available	2026-09-12 08:58:57.955215	2026-09-12 08:58:57.955215
7515	13	PRD-1789018725877-R1789203537955-77	110.1000	110.1000	available	2026-09-12 08:58:57.955996	2026-09-12 08:58:57.955996
7516	13	PRD-1789018725877-R1789203537956-78	114.2000	114.2000	available	2026-09-12 08:58:57.956808	2026-09-12 08:58:57.956808
7517	13	PRD-1789018725877-R1789203537957-79	117.8000	117.8000	available	2026-09-12 08:58:57.957636	2026-09-12 08:58:57.957636
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, category_id, lot_number, rack_location, price_per_meter, price_per_roll, roll_stock, meter_stock, min_stock, created_at, updated_at, barcode, primary_unit, secondary_unit, image_url, description, cost_price_per_meter, cost_price_per_roll) FROM stdin;
29	C#5	2			14500.00	\N	34.0000	3596.6000	2.0000	2026-09-10 07:19:45.304361	2026-09-10 12:23:11.292	PRD-1789024785302	YARD	ROLL	\N	\N	13750.00	\N
58	DARK TAUPE	1			16250.00	\N	87.0000	10223.0000	2.0000	2026-09-10 09:46:18.184267	2026-09-10 10:10:33.09	PRD-1789033578183	YARD	ROLL	\N	\N	14850.00	\N
51	DA MAGENTA	1			16250.00	\N	47.0000	5682.2000	2.0000	2026-09-10 08:38:31.479845	2026-09-10 10:10:13.319	PRD-1789029511477	YARD	ROLL	\N	\N	14850.00	\N
19	BURGUNDY	1			16250.00	\N	1.0000	187.0000	2.0000	2026-09-10 05:43:24.361563	2026-09-10 10:08:53.446	PRD-1789019004359	YARD	ROLL	\N	\N	14850.00	\N
38	C#11	2			14500.00	\N	4.0000	283.0000	2.0000	2026-09-10 07:49:58.445148	2026-09-10 12:22:34.82	PRD-1789026598443	YARD	ROLL	\N	\N	13750.00	\N
44	KHAKY	3			28500.00	\N	4.0000	484.4000	0.0000	2026-09-10 08:13:44.875319	2026-09-10 08:13:44.875319	PRD-1789028024874	YARD	ROLL	\N	\N	27000.00	\N
33	C#8	2			14500.00	\N	4.0000	510.8000	2.0000	2026-09-10 07:25:44.265715	2026-09-10 12:23:17.976	PRD-1789025144264	YARD	ROLL	\N	\N	13750.00	\N
32	C#31	2			14500.00	\N	29.0000	2770.7000	2.0000	2026-09-10 07:24:58.773071	2026-09-10 12:23:00.973	PRD-1789025098770	YARD	ROLL	\N	\N	13750.00	\N
28	C#9	2			14500.00	\N	68.0000	4684.0000	2.0000	2026-09-10 07:16:58.264298	2026-09-10 12:23:30.434	PRD-1789024618261	YARD	ROLL	\N	\N	13750.00	\N
30	C#12	2			14500.00	\N	86.0000	6248.0000	2.0000	2026-09-10 07:22:15.841115	2026-09-10 12:22:38.305	PRD-1789024935840	YARD	ROLL	\N	\N	13750.00	\N
9	SMOKE	1			16250.00	\N	23.0000	2737.3000	2.0000	2026-09-10 05:34:22.683875	2026-09-10 10:24:03.354	PRD-1789018462682	YARD	ROLL	\N	\N	14850.00	\N
18	SOFT BLUE	1			16250.00	\N	44.0000	5205.3000	2.0000	2026-09-10 05:42:37.549497	2026-09-10 10:24:09.878	PRD-1789018957547	YARD	ROLL	\N	\N	14850.00	\N
2	DARK BROWN	1			16250.00	\N	31.0000	3523.1000	2.0000	2026-09-10 05:27:42.559318	2026-09-10 10:10:22.221	PRD-1789018062554	YARD	ROLL	\N	\N	14850.00	\N
47	NO . 7	3			28500.00	\N	2.0000	224.0000	0.0000	2026-09-10 08:17:02.347024	2026-09-10 08:17:02.347024	PRD-1789028222345	YARD	ROLL	\N	\N	27000.00	\N
17	DA ROSE	1			16250.00	\N	6.0000	656.2000	2.0000	2026-09-10 05:42:08.537576	2026-09-10 10:10:18.064	PRD-1789018928535	YARD	ROLL	\N	\N	14850.00	\N
4	C#26	1			16250.00	\N	5.0000	516.9000	2.0000	2026-09-10 05:31:16.00286	2026-09-10 10:09:39.629	PRD-1789018276001	YARD	ROLL	\N	\N	14850.00	\N
35	C#10	2			14500.00	\N	2.0000	156.0000	2.0000	2026-09-10 07:26:58.681389	2026-09-10 12:22:28.433	PRD-1789025218677	YARD	ROLL	\N	\N	13750.00	\N
27	BATA	1			16250.00	\N	57.0000	6401.0000	2.0000	2026-09-10 07:11:56.75015	2026-09-10 14:32:17.255228	PRD-1789024316748	YARD	ROLL	\N	\N	14850.00	\N
31	C#14	2			14500.00	\N	39.0000	2524.0000	2.0000	2026-09-10 07:24:15.372643	2026-09-10 12:22:45.556	PRD-1789025055371	YARD	ROLL	\N	\N	13750.00	\N
45	NAVY	3			28500.00	\N	2.0000	262.1000	0.0000	2026-09-10 08:14:30.302151	2026-09-10 08:14:30.302151	PRD-1789028070299	YARD	ROLL	\N	\N	27000.00	\N
37	C#34	2			14500.00	\N	5.0000	632.4000	2.0000	2026-09-10 07:46:09.752622	2026-09-10 12:22:56.511	PRD-1789026369751	YARD	ROLL	\N	\N	13750.00	\N
50	BUTTER YELLOW	1			16250.00	\N	306.0000	36890.1000	2.0000	2026-09-10 08:28:40.269002	2026-09-10 10:08:59.281	PRD-1789028920266	YARD	METER	\N	\N	14850.00	\N
54	MAROON	1			16250.00	\N	70.0000	8286.4600	2.0000	2026-09-10 09:13:10.531069	2026-09-10 10:23:40.584	PRD-1789031590529	YARD	ROLL	\N	\N	14850.00	\N
39	C#13	2			14500.00	\N	1.0000	80.0000	2.0000	2026-09-10 07:50:35.016733	2026-09-10 12:22:41.978	PRD-1789026635015	YARD	ROLL	\N	\N	13750.00	\N
43	SOFT GREEN	3			28500.00	\N	1.0000	85.7000	0.0000	2026-09-10 08:13:15.649489	2026-09-10 08:13:15.649489	PRD-1789027995648	YARD	ROLL	\N	\N	27000.00	\N
48	NO . 14	3			28500.00	\N	1.0000	114.0000	0.0000	2026-09-10 08:17:33.643394	2026-09-10 08:17:33.643394	PRD-1789028253641	YARD	ROLL	\N	\N	27000.00	\N
46	NO. 6	3			28500.00	\N	2.0000	208.5000	0.0000	2026-09-10 08:16:30.964409	2026-09-10 08:16:30.964409	PRD-1789028190962	YARD	ROLL	\N	\N	27000.00	\N
49	NO . 105	4			28500.00	\N	7.0000	726.7000	0.0000	2026-09-10 08:18:40.194643	2026-09-10 08:18:40.194643	PRD-1789028320192	YARD	ROLL	\N	\N	0.00	\N
52	TAUPE	1			16250.00	\N	107.0000	12281.8000	2.0000	2026-09-10 08:39:36.874393	2026-09-10 10:24:16.686	PRD-1789029576872	YARD	ROLL	\N	\N	14850.00	\N
23	WINE	1			16250.00	\N	37.0000	4432.2000	2.0000	2026-09-10 06:08:30.817579	2026-09-10 10:24:24.624	PRD-1789020510805	YARD	ROLL	\N	\N	14850.00	\N
34	C#26	2			14500.00	\N	2.0000	262.0000	2.0000	2026-09-10 07:26:25.194132	2026-09-10 12:22:53.045	PRD-1789025185193	YARD	ROLL	\N	\N	13750.00	\N
10	MAHOGANY	1			16250.00	\N	155.0000	16724.2000	2.0000	2026-09-10 05:36:55.686158	2026-09-10 10:23:36.176	PRD-1789018615683	YARD	ROLL	\N	\N	14850.00	\N
5	DOVE	1			16250.00	\N	1.0000	98.1000	2.0000	2026-09-10 05:32:12.87894	2026-09-10 10:22:30.177	PRD-1789018332876	YARD	ROLL	\N	\N	14850.00	\N
71	TAUPE	6			11500.00	\N	19.0000	2090.0000	2.0000	2026-09-10 12:34:27.719146	2026-09-10 12:34:27.719146	PRD-1789043667717	YARD	ROLL	\N	\N	10500.00	\N
64	D CREAM	1			16250.00	\N	1.0000	0.0000	2.0000	2026-09-10 10:04:46.635945	2026-09-10 10:10:08.785	PRD-1789034686632	YARD	ROLL	\N	\N	14850.00	\N
42	GR MINT	1			16250.00	\N	18.0000	1184.4000	2.0000	2026-09-10 08:06:08.426902	2026-09-12 06:55:24.218874	PRD-1789027568425	YARD	ROLL	\N	\N	14850.00	\N
7	CHOCOLATE	1			16250.00	\N	389.0000	45367.5712	2.0000	2026-09-10 05:33:24.304052	2026-09-12 08:58:57.592575	PRD-1789018404302	YARD	ROLL	\N	\N	14850.00	\N
41	GREEN	1			16250.00	\N	12.0000	1394.0000	2.0000	2026-09-10 08:05:21.978722	2026-09-11 05:10:01.659877	PRD-1789027521976	YARD	ROLL	\N	\N	14850.00	\N
6	DARK PURPLE	1			16250.00	\N	24.0000	2728.5000	2.0000	2026-09-10 05:32:49.137885	2026-09-12 08:58:57.504521	PRD-1789018369136	YARD	ROLL	\N	\N	14850.00	\N
20	TEMBAGA	1			16250.00	\N	80.0000	9012.5000	2.0000	2026-09-10 05:44:27.286207	2026-09-12 08:58:57.587278	PRD-1789019067284	YARD	ROLL	\N	\N	14850.00	\N
15	LIGHT BROWN 	1			16250.00	\N	136.0000	15742.0000	2.0000	2026-09-10 05:40:43.40169	2026-09-12 08:58:57.85417	PRD-1789018843399	YARD	ROLL	\N	\N	14850.00	\N
40	KOPI SH	1			16250.00	\N	13.0000	1459.8000	2.0000	2026-09-10 08:04:56.6615	2026-09-12 08:58:57.519606	PRD-1789027496659	YARD	ROLL	\N	\N	14850.00	\N
36	NAVY	1			16250.00	\N	310.0000	36876.3000	2.0000	2026-09-10 07:29:15.245767	2026-09-12 08:58:57.891914	PRD-1789025355244	YARD	ROLL	\N	\N	14850.00	\N
55	JADE GREEN	1			16250.00	\N	54.0000	6324.2000	2.0000	2026-09-10 09:28:40.856091	2026-09-12 07:56:49.08231	PRD-1789032520852	YARD	ROLL	\N	\N	14850.00	\N
1	LI GREY	1			16250.00	\N	183.0000	21389.9000	2.0000	2026-09-10 05:21:11.181927	2026-09-12 08:58:57.526339	PRD-1789017671180	YARD	ROLL	\N	\N	14850.00	\N
13	BLACK	1			16250.00	\N	575.0000	67394.2100	2.0000	2026-09-10 05:38:45.879304	2026-09-12 08:58:57.961239	PRD-1789018725877	YARD	ROLL	\N	\N	14850.00	\N
12	C#121	1			16250.00	\N	250.0000	30818.2600	2.0000	2026-09-10 05:38:11.302642	2026-09-12 08:58:57.545098	PRD-1789018691298	YARD	ROLL	\N	\N	14850.00	\N
21	CREAM	1			16250.00	\N	20.0000	2375.1000	2.0000	2026-09-10 05:45:44.405099	2026-09-12 08:58:57.886041	PRD-1789019144403	YARD	ROLL	\N	\N	14850.00	\N
11	RUBBER	1			16250.00	\N	23.0000	2597.6000	2.0000	2026-09-10 05:37:36.014733	2026-09-12 07:56:49.072416	PRD-1789018656012	YARD	ROLL	\N	\N	14850.00	\N
8	LIME	1			16250.00	\N	99.0000	11170.8000	2.0000	2026-09-10 05:34:02.929873	2026-09-12 08:58:57.685335	PRD-1789018442925	YARD	ROLL	\N	\N	14850.00	\N
56	LIME TUA	1			16250.00	\N	43.0000	5013.7000	2.0000	2026-09-10 09:43:46.516167	2026-09-12 06:55:24.213231	PRD-1789033426514	YARD	ROLL	\N	\N	14850.00	\N
25	CAPPUCINO	1			16250.00	\N	180.0000	20798.0000	2.0000	2026-09-10 06:16:56.429194	2026-09-12 08:58:57.499329	PRD-1789021016427	YARD	ROLL	\N	\N	14850.00	\N
24	BROWN	1			16250.00	\N	130.0000	15325.4000	2.0000	2026-09-10 06:10:15.252084	2026-09-12 08:58:57.53868	PRD-1789020615250	YARD	ROLL	\N	\N	14850.00	\N
14	MI OLIVE	1			16250.00	\N	16.0000	2315.3000	2.0000	2026-09-10 05:39:42.134341	2026-09-12 07:56:49.077548	PRD-1789018782133	YARD	ROLL	\N	\N	14850.00	\N
26	BW	1			16250.00	\N	187.0000	22219.5000	2.0000	2026-09-10 06:30:19.490032	2026-09-12 07:56:49.092724	PRD-1789021819488	YARD	ROLL	\N	\N	14850.00	\N
16	NEW BURGUNDY	1			16250.00	\N	87.0000	10586.8000	2.0000	2026-09-10 05:42:08.477454	2026-09-12 07:56:49.147589	PRD-1789018928475	YARD	ROLL	\N	\N	14850.00	\N
57	CHARCOAL	1			16250.00	\N	29.0000	3326.4000	2.0000	2026-09-10 09:45:28.220216	2026-09-12 08:58:57.492598	PRD-1789033528219	YARD	ROLL	\N	\N	14850.00	\N
59	YELLOW	1			16250.00	\N	4.0000	474.9000	2.0000	2026-09-10 09:46:55.872278	2026-09-10 10:24:27.886	PRD-1789033615870	YARD	ROLL	\N	\N	14850.00	\N
72	SMOKE	6			11500.00	\N	1.0000	130.0000	2.0000	2026-09-10 12:36:19.63509	2026-09-10 12:36:19.63509	PRD-1789043779630	YARD	ROLL	\N	\N	10500.00	\N
65	BEIGE	1			16250.00	\N	16.0000	1973.4000	2.0000	2026-09-10 10:49:03.408106	2026-09-10 10:49:03.408106	PRD-1789037343406	YARD	ROLL	\N	\N	14850.00	\N
68	MI BROWN	5			11500.00	\N	26.0000	3240.1000	2.0000	2026-09-10 10:55:46.697505	2026-09-10 12:41:38.796	PRD-1789037746694	YARD	ROLL	\N	\N	10500.00	\N
69	C#2	2			0.00	\N	1.0000	60.0000	2.0000	2026-09-10 10:58:31.911734	2026-09-10 12:22:49.463	PRD-1789037911910	YARD	ROLL	\N	\N	0.00	\N
67	SAGE	1			16250.00	\N	18.0000	2071.2000	2.0000	2026-09-10 10:53:29.659721	2026-09-10 10:53:29.659721	PRD-1789037609658	YARD	ROLL	\N	\N	14850.00	\N
62	C#29	1			16250.00	\N	4.0000	444.0000	2.0000	2026-09-10 10:00:15.96404	2026-09-10 10:09:25.961	PRD-1789034415962	YARD	ROLL	\N	\N	14850.00	\N
75	AVOCADO	1			16250.00	\N	23.0000	2489.1000	2.0000	2026-09-11 04:21:50.082842	2026-09-12 06:55:24.594029	PRD-1789100510082	YARD	ROLL	\N	\N	14850.00	\N
87	ABU TUA	11			26500.00	\N	36.0000	3892.8000	1.0000	2026-09-12 04:01:58.781339	2026-09-12 07:08:29.485853	PRD-1789185718780	YARD	ROLL	\N	\N	24750.00	\N
73	HONEY	1			16250.00	\N	103.0000	11745.4000	2.0000	2026-09-10 13:09:37.631537	2026-09-12 08:58:57.570787	PRD-1789045777628	YARD	ROLL	\N	\N	14850.00	\N
3	KHAKI	1			16250.00	\N	141.0000	17122.7000	2.0000	2026-09-10 05:29:06.364433	2026-09-12 08:58:57.738903	PRD-1789018146360	YARD	ROLL	\N	\N	14850.00	\N
80	EMERALD GREEN	1			16250.00	\N	14.0000	1704.3000	2.0000	2026-09-11 06:02:19.802445	2026-09-12 08:58:57.813918	PRD-1789106539801	ROLL	ROLL	\N	\N	14850.00	\N
76	RAYON TWILL / SOFT BLUE	10			0.00	\N	1.0000	141.0000	0.0000	2026-09-11 04:36:21.568189	2026-09-11 04:36:21.568189	PRD-1789101381567	YARD	ROLL	\N	\N	0.00	\N
83	KHAKY	11			26500.00	\N	43.0000	4646.9000	2.0000	2026-09-11 06:34:03.715353	2026-09-12 07:08:29.526874	PRD-1789108443715	YARD	ROLL	\N	\N	24750.00	\N
84	ABU MUDA	11			26500.00	\N	30.0000	3371.6000	2.0000	2026-09-11 06:34:30.883856	2026-09-12 07:08:29.554806	PRD-1789108470883	YARD	ROLL	\N	\N	24750.00	\N
85	CAMEL	11			26500.00	\N	63.0000	7104.5000	2.0000	2026-09-11 06:34:53.046956	2026-09-12 07:08:29.613228	PRD-1789108493046	YARD	ROLL	\N	\N	24750.00	\N
22	MI BROWN	1			16250.00	\N	104.0000	13137.7000	2.0000	2026-09-10 05:46:51.907875	2026-09-12 08:58:57.872566	PRD-1789019211905	YARD	ROLL	\N	\N	14850.00	\N
60	GREY	1			16250.00	\N	4.0000	457.4000	2.0000	2026-09-10 09:47:57.781994	2026-09-12 07:56:49.152442	PRD-1789033677780	YARD	ROLL	\N	\N	14850.00	\N
66	BABY BLUE	1			16250.00	\N	7.0000	849.4000	2.0000	2026-09-10 10:51:05.596774	2026-09-10 10:51:42.014	PRD-1789037465593	YARD	ROLL	\N	\N	14850.00	\N
82	ABU TUA	6			26500.00	\N	0.0000	0.0000	2.0000	2026-09-11 06:33:39.874019	2026-09-11 06:33:39.874019	PRD-1789108419873	YARD	ROLL	\N	\N	24750.00	\N
88	ENT 9588 HITAM	7			20000.00	0.00	9.0000	1348.0000	2.0000	2026-09-12 05:35:40.235408	2026-09-12 05:54:44.998678	PRD-1789191340234	YARD	ROLL	\N	\N	18350.00	\N
89	ENT 9588 MAHOGANY	7			20000.00	\N	10.0000	1507.0000	2.0000	2026-09-12 05:36:41.592533	2026-09-12 05:54:45.010637	PRD-1789191401592	YARD	ROLL	\N	\N	18350.00	\N
93	ENT 9491 HITAM	7			20000.00	\N	21.0000	3117.0000	2.0000	2026-09-12 05:57:08.49354	2026-09-12 06:12:50.536904	PRD-1789192628493	YARD	ROLL	\N	\N	18350.00	\N
94	ENT 9419 MAHOGANY	7			20000.00	\N	19.0000	2792.0000	2.0000	2026-09-12 05:57:44.58541	2026-09-12 06:12:50.557182	PRD-1789192664585	YARD	ROLL	\N	\N	18350.00	\N
86	BEIGE	11			26500.00	\N	74.0000	8255.8000	2.0000	2026-09-11 06:35:13.217686	2026-09-12 07:08:29.677339	PRD-1789108513217	YARD	ROLL	\N	\N	24750.00	\N
81	HITAM	11			26500.00	\N	132.0000	13764.5000	2.0000	2026-09-11 06:31:22.288185	2026-09-12 07:08:29.79149	PRD-1789108282287	YARD	ROLL	\N	\N	24750.00	\N
90	ENT 9423 HITAM	7			20000.00	\N	42.0000	6269.0000	2.0000	2026-09-12 05:37:24.730538	2026-09-12 05:54:45.075244	PRD-1789191444730	YARD	ROLL	\N	\N	18350.00	\N
95	ENT 9423 BURGUNDY	7			20000.00	\N	14.0000	2098.0000	2.0000	2026-09-12 05:58:14.545461	2026-09-12 06:12:50.572133	PRD-1789192694545	YARD	ROLL	\N	\N	18350.00	\N
96	ENT 9423 BUTTER YELLOW	7			20000.00	\N	22.0000	3303.0000	2.0000	2026-09-12 05:58:42.086684	2026-09-12 06:12:50.594301	PRD-1789192722086	YARD	ROLL	\N	\N	18350.00	\N
97	ENT 9423 BW	7			20000.00	\N	23.0000	3403.0000	2.0000	2026-09-12 05:59:16.152459	2026-09-12 06:12:50.62316	PRD-1789192756151	YARD	ROLL	\N	\N	18350.00	\N
98	ENT 9423 NAVY	7			20000.00	\N	14.0000	2057.0000	2.0000	2026-09-12 06:00:13.073929	2026-09-12 06:12:50.637853	PRD-1789192813073	YARD	ROLL	\N	\N	18350.00	\N
103	ENT 0491 PASTEL	8			20500.00	\N	14.0000	2081.0000	2.0000	2026-09-12 06:21:46.605486	2026-09-12 06:32:58.825398	PRD-1789194106605	YARD	ROLL	\N	\N	18750.00	\N
63	BENHUR	1			16250.00	\N	97.0000	10733.7000	2.0000	2026-09-10 10:02:55.978145	2026-09-12 07:56:49.134802	PRD-1789034575975	YARD	ROLL	\N	\N	14850.00	\N
91	ENT 9423 MAHOGANY	7			20000.00	\N	25.0000	3644.0000	2.0000	2026-09-12 05:37:53.955585	2026-09-12 05:54:45.101432	PRD-1789191473955	YARD	ROLL	\N	\N	18350.00	\N
92	ENT 9588 BW	7			20000.00	\N	22.0000	3290.0000	2.0000	2026-09-12 05:41:33.82571	2026-09-12 05:54:45.122421	PRD-1789191693825	YARD	ROLL	\N	\N	18350.00	\N
104	ENT 0528 GREY	8			20500.00	\N	11.0000	1649.0000	2.0000	2026-09-12 06:22:19.13764	2026-09-12 06:32:58.837217	PRD-1789194139137	YARD	ROLL	\N	\N	18750.00	\N
107	HIJAU BOTOL	1			16250.00	\N	1.0000	85.0000	2.0000	2026-09-12 07:45:21.992684	2026-09-12 08:01:21.553297	PRD-1789199121992	YARD	ROLL	\N	\N	14850.00	\N
99	ENT 2723 PINK	8			20500.00	\N	13.0000	1964.0000	2.0000	2026-09-12 06:18:37.111593	2026-09-12 06:32:58.770092	PRD-1789193917111	YARD	ROLL	\N	\N	18750.00	\N
100	ENT 2738 COKLAT	9			19500.00	\N	5.0000	745.0000	2.0000	2026-09-12 06:19:29.192125	2026-09-12 06:32:58.777421	PRD-1789193969191	YARD	ROLL	\N	\N	17600.00	\N
101	 ENT 2485 BURGUNDY TUA	8			20500.00	\N	20.0000	3049.0000	2.0000	2026-09-12 06:20:43.180999	2026-09-12 06:32:58.796468	PRD-1789194043180	YARD	ROLL	\N	\N	18750.00	\N
102	ENT 0495 SOF BLUE	8			20500.00	\N	13.0000	1982.0000	2.0000	2026-09-12 06:21:16.94827	2026-09-12 06:32:58.810735	PRD-1789194076947	YARD	ROLL	\N	\N	18750.00	\N
105	ENT 0525 PLUM	8			20500.00	\N	12.0000	1809.0000	2.0000	2026-09-12 06:23:00.975659	2026-09-12 06:32:58.850027	PRD-1789194180975	YARD	ROLL	\N	\N	18750.00	\N
106	ENT 0487 SOFT DENIM	8			20500.00	\N	20.0000	3025.0000	2.0000	2026-09-12 06:23:33.744835	2026-09-12 06:32:58.870981	PRD-1789194213744	YARD	ROLL	\N	\N	18750.00	\N
108	LI PURPLE	1			16250.00	\N	17.0000	1947.5000	2.0000	2026-09-12 07:59:08.710881	2026-09-12 08:01:21.571943	PRD-1789199948710	YARD	ROLL	\N	\N	14850.00	\N
74	ME YELLOW	1			16250.00	\N	47.0000	5222.7000	2.0000	2026-09-11 04:14:34.880174	2026-09-12 06:55:24.558054	PRD-1789100074879	YARD	ROLL	\N	\N	14850.00	\N
70	BLUE DENIM	1			16250.00	\N	19.0000	2205.9000	2.0000	2026-09-10 11:06:16.6521	2026-09-12 07:56:49.139351	PRD-1789038376650	YARD	ROLL	\N	\N	14850.00	\N
77	WHITE	1			16250.00	\N	31.0000	3753.4000	2.0000	2026-09-11 05:18:20.926054	2026-09-12 08:58:57.47982	PRD-1789103900925	YARD	ROLL	\N	\N	14850.00	\N
78	MI BROWN (SH)	1			16250.00	\N	1.0000	108.7000	2.0000	2026-09-11 05:23:06.954578	2026-09-12 08:58:57.508632	PRD-1789104186954	YARD	ROLL	\N	\N	14850.00	\N
79	SOFT PINK	1			16250.00	\N	2.0000	211.2000	2.0000	2026-09-11 05:23:31.377364	2026-09-12 08:58:57.513698	PRD-1789104211377	YARD	ROLL	\N	\N	14850.00	\N
\.


--
-- Data for Name: purchase_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_items (id, purchase_id, product_id, rolls, meters, price_per_meter, subtotal, roll_id) FROM stdin;
52	16	42	1.0000	1.0000	14850.00	14850.00	\N
53	16	75	23.0000	2489.1000	14850.00	36963135.00	\N
54	16	73	19.0000	2193.3000	14850.00	32570505.00	\N
55	16	3	29.0000	3540.2000	14850.00	52571970.00	\N
56	16	63	53.0000	5726.7000	14850.00	85041495.00	\N
57	16	70	17.0000	1965.0000	14850.00	29180250.00	\N
58	16	14	5.0000	730.2000	14850.00	10843470.00	\N
59	16	15	81.0000	9341.7000	14850.00	138724245.00	\N
60	16	12	11.0000	1301.7000	14850.00	19330245.00	\N
61	16	74	47.0000	5222.7000	14850.00	77557095.00	\N
62	16	56	33.0000	3843.8000	14850.00	57080430.00	\N
63	16	80	13.0000	1584.3000	14850.00	23526855.00	\N
64	16	13	90.0000	10345.0000	14850.00	153623250.00	\N
65	16	36	2.0000	229.3000	14850.00	3405105.00	\N
85	49	88	9.0000	1348.0000	18350.00	24735800.00	5808
86	49	89	10.0000	1507.0000	18350.00	27653450.00	5817
87	49	90	11.0000	1640.0000	18350.00	30094000.00	5827
88	49	90	18.0000	2696.0000	18350.00	49471600.00	5838
89	49	90	13.0000	1933.0000	18350.00	35470550.00	5856
90	49	91	15.0000	2162.0000	18350.00	39672700.00	5869
91	49	91	10.0000	1482.0000	18350.00	27194700.00	5884
92	49	92	22.0000	3290.0000	18350.00	60371500.00	5894
93	50	93	21.0000	3117.0000	18350.00	57196950.00	5916
94	50	94	19.0000	2792.0000	18350.00	51233200.00	5937
95	50	95	14.0000	2098.0000	18350.00	38498300.00	5956
96	50	96	22.0000	3303.0000	18350.00	60610050.00	5970
97	50	97	10.0000	1458.0000	18350.00	26754300.00	5992
98	50	97	13.0000	1945.0000	18350.00	35690750.00	6002
99	50	98	14.0000	2057.0000	18350.00	37745950.00	6015
100	51	99	13.0000	1964.0000	18750.00	36825000.00	6029
101	51	100	5.0000	745.0000	17600.00	13112000.00	6042
102	51	101	20.0000	3049.0000	18750.00	57168750.00	6047
103	51	102	13.0000	1982.0000	18750.00	37162500.00	6067
104	51	103	14.0000	2081.0000	18750.00	39018750.00	6080
105	51	104	11.0000	1649.0000	18750.00	30918750.00	6094
106	51	105	12.0000	1809.0000	18750.00	33918750.00	6105
107	51	106	20.0000	3025.0000	18750.00	56718750.00	6117
108	52	56	33.0000	3843.8000	14850.00	57080430.00	6137
109	52	42	1.0000	1.0000	14850.00	14850.00	6170
110	52	36	2.0000	229.3000	14850.00	3405105.00	6171
111	52	12	11.0000	1301.7000	14850.00	19330245.00	6173
112	52	14	5.0000	730.2000	14850.00	10843470.00	6184
113	52	13	90.0000	10345.0000	14850.00	153623250.00	6189
114	52	15	81.0000	9341.7000	14850.00	138724245.00	6279
115	52	73	19.0000	2193.3000	14850.00	32570505.00	6360
116	52	3	29.0000	3540.2000	14850.00	52571970.00	6379
117	52	63	53.0000	5726.7000	14850.00	85041495.00	6408
118	52	70	17.0000	1965.0000	14850.00	29180250.00	6461
119	52	74	47.0000	5222.7000	14850.00	77557095.00	6478
120	52	80	13.0000	1584.3000	14850.00	23526855.00	6525
121	52	75	23.0000	2489.1000	14850.00	36963135.00	6538
122	53	87	36.0000	3892.8000	24750.00	96346800.00	6561
123	53	83	43.0000	4646.9000	24750.00	115010775.00	6597
124	53	84	30.0000	3371.6000	24750.00	83447100.00	6640
125	53	85	63.0000	7104.5000	24750.00	175836375.00	6670
126	53	86	74.0000	8255.8000	24750.00	204331050.00	6733
127	53	81	132.0000	13764.5000	24750.00	340671375.00	6807
128	54	11	5.0000	560.9000	14850.00	8329365.00	6939
129	54	14	1.0000	105.5000	14850.00	1566675.00	6944
130	54	55	1.0000	98.4000	14850.00	1461240.00	6945
131	54	26	6.0000	713.7000	14850.00	10598445.00	6946
132	54	63	43.0000	4953.2000	14850.00	73555020.00	6952
133	54	70	1.0000	109.0000	14850.00	1618650.00	6995
134	54	16	5.0000	582.3000	14850.00	8647155.00	6996
135	54	60	2.0000	238.0000	14850.00	3534300.00	7001
136	55	107	1.0000	85.0000	14850.00	1262250.00	7003
137	55	108	17.0000	1947.5000	14850.00	28920375.00	7004
138	56	77	31.0000	3753.4000	14850.00	55737990.00	7021
139	56	57	10.0000	1159.0000	14850.00	17211150.00	7052
140	56	25	3.0000	333.2000	14850.00	4948020.00	7062
141	56	6	2.0000	232.7000	14850.00	3455595.00	7065
142	56	78	1.0000	108.7000	14850.00	1614195.00	7067
143	56	79	2.0000	211.2000	14850.00	3136320.00	7068
144	56	40	3.0000	319.7000	14850.00	4747545.00	7070
145	56	1	4.0000	485.2000	14850.00	7205220.00	7073
146	56	24	10.0000	1146.2000	14850.00	17021070.00	7077
147	56	12	2.0000	239.8000	14850.00	3561030.00	7087
148	56	21	3.0000	344.2000	14850.00	5111370.00	7089
149	56	13	12.0000	1220.0000	14850.00	18117000.00	7092
150	56	73	4.0000	473.5000	14850.00	7031475.00	7104
151	56	36	9.0000	1031.3000	14850.00	15314805.00	7108
152	56	20	3.0000	235.0000	14850.00	3489750.00	7117
153	56	7	2.0000	240.5000	14850.00	3571425.00	7120
154	56	13	12.0000	1345.8000	14850.00	19985130.00	7122
155	56	8	55.0000	6093.0000	14850.00	90481050.00	7134
156	56	8	32.0000	3602.6000	14850.00	53498610.00	7189
157	56	3	63.0000	7323.8000	14850.00	108758430.00	7221
158	56	22	81.0000	10382.2000	14850.00	154175670.00	7284
159	56	80	1.0000	120.0000	14850.00	1782000.00	7365
160	56	13	23.0000	2545.1000	14850.00	37794735.00	7366
161	56	15	18.0000	2120.7000	14850.00	31492395.00	7389
162	56	22	16.0000	1917.0000	14850.00	28467450.00	7407
163	56	21	12.0000	1480.3000	14850.00	21982455.00	7423
164	56	36	3.0000	341.7000	14850.00	5074245.00	7435
165	56	13	80.0000	9158.7000	14850.00	136006695.00	7438
\.


--
-- Data for Name: purchases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchases (id, invoice_number, supplier_id, payment_type, total_amount, paid_amount, status, due_date, notes, created_at, updated_at) FROM stdin;
16	INV-IN/20260912/0001	2	kredit	720432900.00	0.00	cancelled	\N	\N	2026-09-12 04:22:09.369655	2026-09-12 04:22:09.369655
49	INV-IN/20260912/0002	3	kredit	294664300.00	0.00	tempo	\N	\N	2026-09-12 05:54:44.984084	2026-09-12 05:54:44.984084
50	INV-IN/20260912/0003	3	kredit	307729500.00	0.00	tempo	\N	\N	2026-09-12 06:12:50.51235	2026-09-12 06:12:50.51235
51	INV-IN/20260912/0004	4	kredit	304843250.00	0.00	tempo	\N	\N	2026-09-12 06:32:58.753589	2026-09-12 06:32:58.753589
52	INV-IN/20260912/0001	2	kredit	720432900.00	0.00	tempo	\N	[Restore dari INV-IN/20260912/0001]	2026-09-12 06:55:24.178827	2026-09-12 06:55:24.178827
53	INV-IN/20260912/0005	5	tunai	1015643475.00	1015643475.00	lunas	\N	\N	2026-09-12 07:08:29.451156	2026-09-12 07:08:29.451156
54	INV-IN/20260912/0006	2	kredit	109310850.00	0.00	tempo	\N	\N	2026-09-12 07:56:49.060906	2026-09-12 07:56:49.060906
55	INV-IN/20260912/0007	2	kredit	30182625.00	0.00	tempo	\N	\N	2026-09-12 08:01:21.546421	2026-09-12 08:01:21.546421
56	INV-IN/20260912/0005	2	kredit	860772825.00	0.00	tempo	2026-10-12 00:00:00	\N	2026-09-12 08:58:57.43146	2026-09-12 08:58:57.43146
\.


--
-- Data for Name: push_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.push_subscriptions (id, user_id, endpoint, p256dh, auth, created_at) FROM stdin;
1	1	https://web.push.apple.com/QDdNB6Z05r6kv1F3pDgYNBP8MCrQJsKBaNZyPeX7eFYrshR7U3am68PCMmhHMbf-4QHX1vN1uuj21bR6ZCwEwiqJwsKrrOiAeIsELJV2G_uDuhBYKaIqBI3LIcmrFK3N0drXR-P5_TpcX3U5GkDJJNvaH0FuqwC2jRFPQWR_dJI	BO1rnr27lWEp9Ss2a5HN_6dB784lDTPS4vZjmqdJKHLinxV9OTu2QN3o2w3NdcagUvovrJaIF_OOrOFgPAXoNDA	onG6t62n7fFdXZcCrFlfjg	2026-09-10 03:39:46.340243
2	1	https://web.push.apple.com/QHLzJYj_NGQvhfAVaV_qMupUuqnOKhn0oCkhffCXqI3nSsYCCuDpv4--HPV9JY-ssQQstYDOTrakVm_DnlhIpnGKhzNfRx9519Egqi_p4qHKA9VW0YjeS3l8i9FRVzvletImjd-x3pde04uAZ03_Kki5ceXB53DlkJKsy1SKQhE	BJr5QJGfljCxHeYDQAoWk8UKDGHFi_JrPC5xVn1xfdrh0lWnH6LnE2kJq8QP8_9v_iTOMNtq8vmWCS8AiYHAACo	_FI6XnGAlSJLEH0qoyhAzg	2026-09-10 05:06:36.25286
\.


--
-- Data for Name: receivables; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.receivables (id, sale_id, customer_id, total_amount, paid_amount, status, due_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: return_exchanged_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.return_exchanged_items (id, return_id, product_id, roll_id, rolls, meters, price_per_meter, subtotal) FROM stdin;
\.


--
-- Data for Name: return_returned_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.return_returned_items (id, return_id, product_id, roll_id, rolls, meters, price_per_meter, subtotal) FROM stdin;
\.


--
-- Data for Name: returns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.returns (id, return_number, type, sale_id, purchase_id, customer_id, supplier_id, total_returned_value, total_exchanged_value, difference_amount, payment_status, cash_refunded, status, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale_items (id, sale_id, product_id, rolls, meters, price_per_meter, subtotal, roll_id) FROM stdin;
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales (id, invoice_number, customer_id, payment_type, total_amount, paid_amount, status, due_date, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (key, value, description, updated_at) FROM stdin;
invoice_bank_name	SPECTRA JAYA FASHION PT	\N	2026-09-10 03:38:25.8157
invoice_bank_account	BCA- 2384564444 | MANDIRI - 1390057578282	\N	2026-09-10 03:38:25.822658
invoice_notes	Barang yang sudah dibeli tidak dapat dikembalikan, kecuali ada perjanjian sebelumnya	\N	2026-09-10 03:38:25.827838
app_name	Enka Textile	\N	2026-09-10 03:39:41.295
app_address	Gudang Kain Enka Textile Jl. Raya Jrebengkembang, Masuk Gg. Griya Azzahra, Kedolon, Jrebengkembang, Karangdadap	\N	2026-09-10 03:39:41.315
app_logo	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGEAAABaCAYAAACouzjNAAAQAElEQVR4Aex8B3wUx9X4zF4/ne7UUW8gimhqFCHgwKbIFYNtbGMbf06BJK6Jg/05TsHxZzt2vthOHJfguJsAAtyw6e0kJFEkIQkkIYT6naRTO510p+u7/zcDu0igjiTn9+V/v3078968KTtv5s2bN7vHoP/w32aEmNwV6b/MWX5LJYAV4EjWzTfHjme3/KcLAacvu+UDxOE3MEKxAEqAm0RY8sn/F8I49QCM+hc5jH50bXUY4wV7kpOV19LHCv+PnQnZy1beBqP+hX46VqT28gvrJ23Uyf+RQshZsmIqg5nPoTf7fX6x2MNC+rhc/TZiXGofpJLqY0uCDZkrV+kzV/7GkJn+RUNm+jGACw1Z6Y0NWStNEJoBWgDqDVnp+YbMW/YYTqR/AHle1OvSNxqOrVx26cCKoJ7VkIUYS5i9QPMF6PcyW60t/SaOcsK/mxBwfebKuYbM9D9Dx5bIxPIG0M9fMxi/jDF6EGG0BGAKQigYIeyDEFIDBACEY4SSMOZuxxz6Ccb49wyD3sdifEipZIwgoGYQzhGDLv2vD31y6+MI4Rg08M9866lTnQOzjF7qv4UQYMT76LPSfwWju1yE8SmM0a/hEeMBoG/hfvWCdVSkZ6R++TLV1Ey573yd3F+rk/um6aQ+KTqJIiobi1XngN0OIFxQSKBEGqIMmv3Omsj0D/+AMGMWEvuO1PdNHhvqDyoE0vlEdcCIr4WG/AUhHId6/jDuEkkDTymDV2UGTPvTxeCk7Y7g5IzwCTM/SPab8vJi39hNWt/oJ7W+sb/S+k98XhsQ/0Za8OxPZwYnZYj9prxUpgxcqRPLQ3OI0PziNkeJpcHhYm9vXxCKm1TDSKSVyqjIbBK/BtquwccUhWcf0/L7LDwjA4kMx9N/IRPJLmFQHcBE1AoEcHG4TaqeqfOZ+Jui4MQdiqCZ78/ThK1fLFHGTcZYIgeOQS+MRWKZKn6aJnKDNnD62wsmgNBEsoAQkrHjTF4xx7H+CGN2xl/+xEx+flMkofcEDmNXT3ys4+MuBINuWeLCkJV5WITegY7wv/yA2COWBpxRR/z0VHDyDo1/3Gatwid5NobOvJw+xPsQ2Or/taOLsCnCw07CLIhhnS46KwiNAGYYVuqv7iDx8YJxEwIZ/WCx/BYz4lMI4QREf9ghU03JDJz598bAmf+Y4xWUPm8sOp5WBTePzW6x1dTCAo5R3NNPUKvJptebIEm4Am6flx37wro1bcXfbhCIYxwZFyHUZC4KWRiSfgQslpfgeSQI4W6pOkkXNGtLp9+UVxYTXY3G4df09TeFHMcppYEBp5WTJk4iVbafPElnBomTWeCnnUX8RgwG66q54M9PVuydpyZpYwljLoQ63YrFUuxVAA+hBf2PRIqI7KAZ75v9417QiiR+gUAft6vxu30+pLKJTz6uIiGBzqISoZOVk0LLsEjE75Qxcukf8vL21TfoVvz35s1ozPpqzAomD2jIWvmomGEOQTyYESlKfeP+UBIU/1Yav0gCfdyu7praarfFMkOs9i5Uz5weTyp2W62dLrN5JokT8Fkyq1XmE3sCI0RNWI+nlexBvBHDvLrhpvQDDceWEJywjiqMiRDIqDGcWPE6RvgjBMNf6a/VBSV8NlXmPXP6qLZ+GIXVfvZFHWEPv+8+YQ/Revh4CdDEAKSZyGtyRIjcNzpNFZrSCAQT4rqudjpGyzixLFN/bEk44R9NGHUh1GekKjYsuyUDc8wmxMgrAqa+Wq0BWx7DcEI/0I9jWU/n2eJpmBE1B92yPIVvRtP33wnPL48OvsDIFF0YISyWa6Z6hyQ3SzXryxnGR9i4YYSnMRJ5FuxvotEo/oRGjEaZDXuSlaIQzWHEcXeLlRE5wQmfRBD7fjTKvpEyWo8dL+BYT5DPvJQyRiQSk7LcFqvZ3tyaSOIEfFKnGZWaaGF/AIKYog5boJFq1nkYaVw+4aHAoWiZSL5/NFXTqAmBqCDkG/QZNHSB3HexLjD+rwvwEDdXkGdML8OO3SyoF0/0jx+dzFdk/G7vORgsUh73n7fEIdWEz+dxEoplmjh12FyP1Gt5qFg+K5fQKGA0hWPke8isp/gN3kZNCD+9Of1ljNDdyqA7Mn1jn9LCA95g00Ynu6vD1Go3GpPlQUF5ssAAumsmJRv3H1SSkIAsKKDJKzp+GYlfCyKZ90R1xDybWLEwWqJIElwcmEHzmRCff17LPxJ8VISg1624CQTwnMxnkU4T8V+LR9KQscpTt30nXXwjHnkQ9ieXa3F1WUzOjo7ZlzGEQtfeUw7tZ3j82lAkUcWqI+bbxfLUaEY6WVBNGHHriOPxWv7h4v1UPPRiLnyT5s2ImA/FspBTvhOf1g495w1wYowsFysudtfX1wxWStuR4+Fg+xv8FqQK+r/5+30lMFNFfN7AxQtD+Xh/oUjiFeMdNscu9VoWIpKElPN80IGvGXQrFvD4SEIoYyTZruZR+3u/iLCE9Z/+vzPgwa4mjFHM1dpmPHP/w6XnNz0/ueTZF7oHqqbzXEkp63RO9Jk/lzgKYbBf5jYePCw4AlVxcRWMTN7be3uZ7bo7UU1eIQmtEtVdEoxkdC8BTGLMMF9UHlqmgfiILmZEua5kIhYCmKJrgqa+hhksV10hj10AM6DoqWdaPN3ddLPF2mzxxB/UX4X1n39BXNJc1PqHJvI8xCpytbcLqijiwfsa+LShhFKF/yypJlIv0dx7AWNBrjEKmfivQ8nfF88NCUHim/xIwMy3xSJF1GAnVX3VPWxay+EjZ9yw6+UzchyHHAZDE4/3DFmny265eGm2RKMplAdPEDZYxgMHzkM+uj5gkYhVz5pFTup6Zh007hUwBfxdQVgsSz4hMGP0SINu+QoBH0ZkxEJoa2tT+09+8XmxNJj3tQyj2pGx1nzwkde1Od2u3q5oPr1xz/f50Nnq0LtW2XgaCZv3H6ICIHGf+fMKsYiBo1KCDQNA+N6hydFi5dxIhvG6ehbNiN6r2DtJNoySKOuIheAjlz+BEfanpYzDzVxYfB5UD1VDPasTK5V9PnTTN3uICWqecPstSTw/5Lc4mltm8XjEvWt6CYinDyVkxPIgmTq6VqpadakHf6xCFffzHviQoiMSApkFoA5/OaQaRomp5p8f04N3iUbd3rNIqZ/vdW9N2Bub9O7OzkTVlMlFjPTqaVzTd3uLIC9dlBmZzKaIjhbWBqAP+5L7T1zISAJ8ROLI83xmBnHPVx9bQuvgaYOFIxKCj1y6CSM0brOAbLjg8IX6fCIfWU8O8i8/F4NbxN7e1D19mXD5Xvv51kpQRSjy4QevOuAgqfG77xUQ0Cv41pVnYSDdkDEBfYAVE2a4xKplsCEHjJSMUZBUJHmIRIcKwxaC1WoNwZgZ11lQ98U2YtdLJd7eZs2sGUr+4cQan3o+zofQ+VzHydNxWCqp4l3WJM3R0tro7jAnkjiB4FW3Cy4Lgo8UiLXESDQOLJ2cx5eBkehpNIzfsIUA8+x5kPl1C+Qw6hweKwzX1uOZ1GsZ/sjDhV2XLgl7A6+oSOFUjC+0PSf3LOfxhAYsXNhLQPqMjIvAA01HSObn3yLx9RMEAvTLF9QFQqRq7zJhaHdVYLxMokiDrrnCj9F0/bFl869ggwbDEoLZbPaDdl73Au2gtdwAQ3vu6ULO5Y7CIpE76Cbt5LasbDVfnHrWdOoR5XESGv61w4EwZsPX3Sc46wi9PSt3AgkJhK5dXQrSEJE4D+5uW+m5p5+pOrN6rVqfsTOLpw8lFCv8ZogYL7FYGk3WHJqFkYjW08gQbsMSgkoiehgaP36zAB5A//kX1IIJuf220wjsQfPpvBlAplfAwgV0hlAEbrCHMHcbGpLEPj6Fsh7OOpvBUOex2aYCC738ly4RBEIIrN1RXvCjDZHWqppYluOQfuuORazDSWYOSR4SSNURLYxiIW0rzcCitRkZqJegKb2P27CEgDn8YB9ljBnJZe5s7zY0JJMKQu+/18fR2FTicbmonc+IJTWyCb33KA0ZXxaB60QWcuetwukZyduw6+tqEhLwio2uFMvlgkA4D2sseuIpDey+VSR9pCD3j05gGPVMjFWXN48Y+y8MXJY6lPKGLISurq5AhBHtkKEUPBo8sCBTn7/31MnlYqUivvngIY4vVzkxlh5X8jgJjQcPBSHEWIJvu62Xvm/NuaqKwtfdrye8PFS9936do7k1mMdJKFIqrFgmFVwdhDYYYCTyZiTyUokiWXDucWLxbWgIvyELAVadaRihIfMPoe6BWWDxaTt+PJIwRa5fb4TedzYfOiKooqCbl/bapBGvKlE5qtjoQpFMKpiitnp9LWe305GPMeZ8khInkTIJ2PWG3JZDR+eQeE/QJCZcxAgNSZX0zCf1DnNi6UR/nsZwSMvHBwp7dWr2rFlBOUlzb89JSn06d878lwDeAfj8ZErqpwWr1jxR9sa7B8u3Zuiqvz+oM2SeOtF2vizfom8sB/+8EawKdqCKhptmyssvBv9PDCOT2lXxU2aDiVnotlgvL8oYO/wWp/XaPdd9/i+qBsIeuNe7Z136jC9reNxnTnIxvvJKCwjVUfbiSzE0DTPEIyqosMBbllx1RVCGod1kqpDJmJHDWbaUWm0cRklDcWNQIZxImbf85JxUHSPzaoRG7sEi9CZC+LcAvwB4CApbz3ZZ7jF/89U88+GjTGvheW1DVvbCqm/2JZd9um1K4d+2TMh79U0279W3Gs7+5Z1zxVs+y67c/b2uMTcvu7vJeIll2V6vGqIh/Oo/3UofJPi29AIYwZrmPXuFMuRBAYVihULobNbtdnWdOz8D2q73nTe31y7YdDKXziZSZcT9a2mZJN557vxJooag7PbZb7/RgcVi2vHKqKCLXjHhwmgmvEMFRiwL5LCoipFEVlzJI5MpowQ3yRXadQGTMzf1dRFm9sPIICdiVCjXcWFkZbxwkSyaKWb8ffqephwScywb6rY7ZsKoTWu/UK7VH81MK/lw66SCV//K5b/+dvn5f35xonbfUZ2p4lIh8JHRd11VhAAj3txdV0d9PqGrVyuhbTbjoUNC5wbfdnuvWde8/zBx1vn5zEmphIWZFEGhs+zCBdbpoqOdkUoditgY2iGkvKo33qYzKfbpx6skPhoN53ZTT+uEdTe1ipX+gsqiBQ3jJpFpGkWSKEHYDJZOGyw7gzn0JDAxAH1e8iliXeSfNEzES+rZca9tZJL//KfU5OefdiU994QtadPjXYm//LlpxsZHaiavu+d81O3LT4cuSj0RkDBDp44O18k06tOMWFTNYQ6zLtcUm7F5YXNBofZSxrcJhW+8q8l/7W9VdYd1meiaX0PG7iLEcQplWFidWKNOcDQ0Fnq6bV6EDWPcHZi+TBAIoem//EpMwogH1gqjnuD1W7cbSUhgwvJl4KbAVJ11ni087WhvC1SEhp4MXKJNAeupGHiwxEfVKA8O8GUY8YgPaGDPIGaYCVIoj14MYnvtVyjxmhsDuDDNLdSP/AAAEABJREFUIc5fLoxQLpIy70/YoFqEJYgudMoJt87GGGGGga2IWKIQSaXeYqXCVxHgH62JiZwRNHvm3LDFqQtjbluhnfLgWu2sx38yN/m5p2KSn33SPfm+1UV+M+J1IqnkAqkE1hDkLipwGQ8dZbsuVZYSGg/G/QeCSTzi0YerQRjIsPNL2smEpggLLRLJZEoSJ+BsbWtyt7cniRTyUmV0FB31hA6zkrWWlNLRTvCQu+8UkRBmgbXyzb+TBd49+bfPhSKMUdPefdQdH3DLnItiVXAz4RspSL38gzlGFcDnxww3qJXFYJZ9DTKYEYecGKFCFuHfuVhn1PwzuQsmvCjfjDBHBAUsiETpg6Bh/hixWK6ZFDN74qp0bdKmJ6aG37Q4G2HEcrbuSZ4LJUtKnnkunnQmKbbzfFmpx+GYDPrd7ZOSHA/CamvVZQomZ/CddwjtIfz1X2wtB0ExgcuXtRKch/bs3LOwFgUSnLop/AOoeoO1IM9p7vBXTZp0UhEWFtl2LCufhSNQwuedFBeq8IkZ9iEPycsDI1FFYywGzwL0JhBZzARBMODFzM8/9ZK9pTG4mHOqoOMT087k/M/i/PxGkkuCOWEEEhxhZkRCoHl73EJSU9IwZpoYmZTWgxhskvj50g6r/fgTciSJgtNX5GGMAy2lZSXgC6LtALwz4CbtldfqoUCMUWtWNtk1u8PuWd3rFUvDzt124KBX6Lp7qZsCZgFXs+Wf0EkYRT/+s1CSWPPJpyRAiqgJ5YxM0QWLK52FlDiCG3Q9g8DawlhBF3oogj4XhP1eDElZWlNj35ifL7x9RmgEROw1nY6vwQnTCEEklzV7GJGTZFdGRJZihhG5LRaztbKKuqxD7r2b6lX99p2CpaKIijrHSCTC/sB0Jq+Ic3uipEEBZyUajcDncTht3bV6Yd0I1C6mi67L1F5gq9NHSQL9z6hiomO7yUvCHR10A+qTNr1Jpom46nYgDRshYJHExIh86MzEHPIbrBgqhP6Y7AwLgr2aynm6LVexG4hhjDx2hwbbbLRzwtfdTxfd2k+3FoJqUYBroUrq55sEpmeNuficMMJD1twpCIDUXv/5Ntqe0FV3eQjOQ8v+Q4UIsSqCa2ZOL2WkUqqX67ZmUL6YjT+lAq7fllEH6o6wIdXUKJVMHS7URYkjvDGMzMYxGmohweyjdQ1U1IBCQBwWpjQpxOPq6CDhjYJV33CRs3cbEctKGbGkxi91bgJ0Btd69Bj5QAPF/nyjAYSBTLmna/m6GIZpCVi0MJHHPTa7xVZbS3Bz0MqbScgnocY93wlqM/yBB+iIBJVmaDt6LEWsVJT5piTTWWLOK4gimRiJ2CHyVkkZRnzdARFJHy5gkZhlGF8HyYcRJyHhQDCgELhrhMC6THTkDVTgUNKa8s42sgYDrdt/+dJa0uEth46e4dzuCJFGbVJOjktBMFv027ZToZAyvRNnU5VF4gQMX351FgSn9Jo0sZjpoaLcXV0dztbLL/qKJBIX7LaJJYRaj2ddAkEwIavupGuOC5yDrNtF1hMk8fVuYqTKfvctpL5hAYc5LPJmL+fB4sth/3faEf0l20wNvXSkx9XW3R/vUOkchzhz2SU/rrWZWCv2qAcfoKOy9uNPqUqK/fmGYtCBCtZiLbEZGiJIuRhjFPXoejpqCU6gee8BXxKGP7BWTUIeGr7acw6EQ0ef7xIt2Rv4gUpw1H36GfkYxBy8+k5SL7KUlwuHPhJ/tZmMXr6MGw4ZBmFGw89Guu7xZR5bkh6ds2LFhpMrbnkzd/nK32QtXOjL8Il9hTPWlpIChBHi6qrqJZS+8gxGayspzfe0m0ww+sXKqMh8sbe3T/vJM7AZ654ugeNLv/nzqGppPXaMjlhSnkjlVayMiKCjluB0QbVYLrsp5qRQIRI6AVBpVJgkHrlmFR2NtuqaPBj5fqrp8cIeg2MRyIZwIeRo6fBztDf5dBpOZ3scXZWXqSO/c6yTwYwX3ctgDlGVnrUsfWH28lsOyiW4CnOif8BghCNQ5mVG7v32gEK40ozLZiQgLht5bxYiN3A1HD6BWEN1CCki7IG1tKHV775POyT6sY2FGGM1IKxh97fCdh9UCF3kSB4C/Fc3PnNTerkp3Bar2dXRQUY8IgKVhIZQgdZ88DG1UGJ/9Ag1S0kZ6ulTo0GVZYHa87hazeGVL3w0y/DR17LWsweMHdXHSq1NxTqnpTGPZd3CICT5hgKc2yFDWErXFw5je87N6X8XY5wFnb0c8sNEh/uVC2OUDvQrWD8Bh1EDn+S2N1AVwOPDDW1t7bXOTrOCs1jiMGba/ObPS2jLzilwmc2JssDARr/586m56DGbi4hbgZSPMe4MvvN2qkIIzrGsp+tsEd0JRzx4fy8VZTx4sIRXRSF33knUmozt7i7pLCmZJlKpzvFfbJJyyAyc+ZfXFs16+4161fRpmVBPiznvYkr1q9sXXHx2S0z1e1u9jUf2WjsuHKgxVR691FF3Ir+r8WymtblUZzNVnbB3NZwmQnJamgrslsYzto6abGvzBV1HfW4O57ZPcbZ0NrZ+h08Z3kTemMGPkTr7AcWgQkAcKuMzcx5bNAcmDY8PN6w7fLyGNTbR94bkIUEVsFC6L731Nh0x0//4+1qMkYqUaTxw0EpCAqrJk0CFSKnbhOCtx44XkJ2wSKks6amiaNqhI8LzBN26gvp/YAGnFl3oHbf1OaJJGTNeeWnxnN3b/ae88FyRb1qqTuylKrMWVU0yfLRPe/H5j2dffOa9SZUvfjxB/+EupfH7A7g185invUDn6Cg96TaV5DrMJTnuzpIzqP1MDmr9+ihX+cfP7dWvbE+zFqB57i408GaN5T4WGk0eoi8A3Xn1PR/EqZxdJYJQ+uLvjwYj1NNVVRfLNuqpihB5q52lv/l9Lud0xQYsXJgnDQ2hbyeAKnI2fbt3Jl9O+LoHes0+w46dVM+DQ05YMwgvuDq67Y1G6iWVBfgbYR2ZCXW2Nn7zHRzaMBZ+QSa8V6BXgMEG9p07Z/aUZ5/RJn3yQdK8r3eqEz/e0jLld88Xhd+/9oQ6flalpxN1d+ZelDVt1wXWvvXVpKpX/jWn+pWtqdWvbEutfn1HmmHLXm3r4bNpYET2OsPuVdEVBNaKco713LHgyP7HBxUCy7kKruSjQXfLIWp3U2QYt46KqvNcd7cBeTx0tFvKL84FWIyVylr/O24TnIjgBi90dXXRUYzFolpN4mxqYpKqyEtgdmNLMsbYFXLvGkFQJK3p+72F0Ol0jQm+6w6yeOGOvPwS1umSesfFnhX1cPoR/qGAzM8vkOwpwu6/d2HcM09pZ7z+8uKELe/Nm7Pts/jUrzJC5n25Ayd/+A9j/It/KIn+6Y9yA29ZofOePVsn8/c7DuUTp6TwXICTjeJFFuFPSOfvP7wvfsGRg98BHQ0qhJPNR4gQTISZgKOryI+Ew4XmM0UdbGszaQifVY4lkg7xzCSTJi5W0PlN3+wRePxS59WAFcXzI3BhlAAilgUFFUi8Vb1mSNOefTJIo1egVksWd0/tBx9RN3LE+odH1GZa2AA3DLNHEuA/QZ0wc3rw7bemTvzZBu30P/5Om/DRlvnBW95NPnBon8zusvlyFta/uL1ZkXpo35S0Q3sfJZ2/GSGWL3pQIaxdizzAfYzPwLmt8R5XO++c4smDht3GJl/U1iqYmSQDM33mhQmpKV2MSCQlOIxkc/PBQ1RdETz8vrW9+Nt0WdQjGXr3apIsgKPd1OIymRIIgWz2RGrvWa4mY57d2BzCyKSX1LOmTydp4we4JiYmxk46eunx4x0Lcg+09+Wb49szqBAII9i0X5HwMnAii2EbmWqX0SHewVc0gXPYBRORCY/KEvsHSMNvWrSIL8JSWl7EOpxygjNyebkiIlywfsinUe5u2zRQRe0BNy8RZg7hNX69pwxmDN0cTViy+ALYgEzNx59RwQbevMRAeMYT7Ja6g8Opb0hCsJq6voFChd1yd3tWJMLwqEAc8sUhOYYf4WeCgk+JoqKCZ/704VjoPEKiUPf558KC5p86lx7c0wS4GXbspH4kr/ip5xmxmO6IgUyv5iNHqIVFkIClSz2s01nZcep0IrTRGX7//b3WDsIzlmCz1FVVnHy5cjh1DEkIU1dld3EIfy0UzLlibKa8IgEfQgRLmFYmeW6pKGX+RemMmeKZGx/1FisUQuexDntFV1m5cKAScveaXqrIdPJMJKkmct064dSK4A5ja6PbYhU6WhEZPtG4d5+BhekrDwnOl2jUY7IekLr7gvpz/2gEU/5CX2n90YYkBJqZ9bxDwyu3rrp3hQX0CmnAIPnZpybO+uUvAhOffTI44amNyVKNd3DPDG05p4VNIVgyF5U9VFEnObB3uWIYmaxCPWMa3ajxefW7dl+EOAZAUo1PGxIxqvrtu6i6injoAWGxJuljDW6XxWS3NExxNztODKeuIQshTHswBwaX8A0vuLWTHJ1nyQH5kOuTqbwCxTKpuq8MDbu+FEa+z7zkxp489dt2GgketOzmXnRCAzOUmrwk7jUjvtZSUnaWtdlUjFRS3fOzWZI+1lB//sNi6KMDKRv3CKp7KHUOWQikMMyxb5KQB1P128OaDXy+a0NYcEtter2wCIetWUMPewgfx4Kb4lxxPNHv4GsS1A6f5mrvEFSYVO3tqtnyUQRJC77jDj0sQXSGEHyswWlvb+pqPTsHDqI+GW5dwxJCOevcARVUAdCLc5sTrc37T1HkBm7tR3WtfHYslVQpY6LpSRihteoyCxDLBcpDQvIl1+wNbAYDuKMvn6AR3vbME1OtNTUxiMEt4Q/cO5fQxgvqzr5ZiVh0LumeLw8Pt85hCWHp0uNulkWv96ykU/9hFOuxDvvDCr4MDiFP/a5dgsfUZ84c6Fg+FaGGjF0egkU8dP91+t2mN5hIGg8uq5XutP0XLixlJFfPovn0sQo7WwoKbRZ9Guxz/mckdQxLCKSCDmPdx+D3uPrFIscGd1x6Gc50SerwwWVqP+sydQhOrrB711B1Qkpyd3V12BqNSVgk0vel313NbXbC1wswtkVv+DH1IfWijxHCcm5nbdF7Go7lDies2UXdEMOtathCmAEHPeD7eLZnRQ5L+SJb2wlh0e6ZNli8cedXgn+FkckryFsQfJ6GL78uhn2E1C9tXmVf+l3i50M3ZDw/CVXxU89cq7YIfaygtvBvuRzrCuU490Du6gGrH7YQSGmhSw59hTD6hsSvAO6ofSvW7WwyXMGHFHAc19588DA9QyAZfOfNFcxUghv3H/JHGLOR69dTHxCh9QR1wuxYEI6rB8096YlfxPTAxzTa3pCb19VSvBg8za8krPmKmMojqm9EQiA1dVvZDYhDV18Z5DjfttJNHTAienYKYe0XOktKz/Nf3hCmsLWrBQupu6a22tPdPV3q51cg6/HpE+HjgYx4dcLsHB4PvGlpNizggjrj6WMROm1tjfrzW8iLCDmm4pZXbqSOEcam6OcAAAb8SURBVAth0sqDzR4P9whUThdOCBHr6Z7eVv7caRi9BB0UGrZnCLtfooqUPc6R67/YVkcKCF2zWlBXBL8Wpvzu+TT/xYt1EQ/cd2LiU49pr00fC9zt6Gy9mP3fcN7OMSznemjp5uMDtnGwNoxYCKTgiKUH9iOMfkfiPLisNWmmytd1PN5fCPZ0jflcSTyf7jtvjqCKWI/H3ZF/dhpmmI6g9GV098vzXRuCB1Yc98yTWuLzvzZtLHCyK75w4tcmlnVFeThuXeLqr4WPUEZa3w0JgVQaunD/nzgObSVxHuymk1pz3bsDCsJ0Jo865Pg8YXffRX1DBG8+eCQfFv8gr7hJxeCsu27xJTw/BHjcVnN51iYj63HGYRa/kLR6177RaMcNCwEawZma6n6EEHcI4sLV3XJEa655p19BNO7+5qpbG3xCyuirr7U37NgpIQVFPvSgPwn/HQBmQEdp5ia9x22byrL4n7PWZLw2Wu0aDSEgYrZ2tlvu5hDXa/fc3XZU21axWQd02JNdbTLncddZKirieIrv3GRBFdkbG+udJlMi2Tmrx/0whm9R79DRbawv0/3SxLm7p7Ms+rbCnfGz3hw3ho2KEEgTiLvbbveshA7vJQhn5zltc/GjRR5Hs+B86zx/QfiumOQFt7Vg0VR/8BFxi+CAa/4WgfCND/SuxWoqKynPfl4Be4EYcEQd7DC33EdOG3tz3Rg2akIgzZi4/LCZCALivdQQ6+pKaK94UVgDmg4cFD76Y+D4URUTTUw95LHbreaCogSw/VHY2rsF/xGU94NcLfVHTlaeeX0i4tgAIgCLU3/X0kePX79Lv8HWjaoQSFuIIKxdl1ZixG4nOA8cI6GmLOglu/lMnnDm65uSImzw6rduz4cH1oiUivPykGDBk8qXMV4hy3lclfmv6ZoufDEf1jo5h9GHTmPV7QvW5oJZOvqtGHUhkCbG3XrJ8Y8jBx+EneSLgLMASMzIaWitysmG40fBGQe+ItrZHPzgRIxu1uCIkr4gRvKNN7QbMk+XHvlZvbWtTAtN6mYR91jCqp0/Sdl4/Uc0o9W2MRECadzmzYgN0+7fjDj3rQhhOJTBqPXCc1nGM28Ir4ozYkkN77Y2fn/gFOf2RCFwU4StWTUVjecPY9TekJNXcuyxc/qSj+bCHiAWnJRnXG42OfGuXe+OdVPGTAh8w0MXHz7gsbLxDuulUpflUpy1gBNO1rwmRlO3NceybN2nn1FPqkStLpL4+9FXW/gyxirkwEwzVn+XXXJ4w0VwQaR4XPSsup1j8c8vuHamptyze1hnxSNt55gLgTQsIv1A+56njU/UvoQndF/AiYRGQB4aQlVU/bYdREXRhThwibbXG9iEb7TB5ehoqS/5UHf+8E9ajBW70jweB3EQdrMs97+ubvuUhDUZ74+2BTTQM4yLEEgD4n18IiAEIwPuVy5rRaXU0dLaCOfLwquOATdpCd8VjlEKMEZw6FLdUJ6RWab7VV5Z5tO+JkMW0fkhUEMXx3JvOpzWiYlrdm1KWbdHOOWDtHG5xk0IDCO5zt/erTfML9z4GAvHl77kabGYMSqv7JytHRUXzh/ZUHHuyIZL5w7/tPL8kY3lpcefLrh44jc5VXmvZdaee1dHOrW5+vvslrpDuW31x0+1G46fJurFUPaZrvbcO7rKUy9llR5/vPDcwUdNFTm/jWmt3bvY5WhPAe+vGCyeKpbjnmM5VyQcxvxq7tq9TaQNPwSMixByli1LZBD+VR8PiDmPh35NT9KkAUElHEJWDnFcdcGbLPHRcB7nJNgoTWQ9jiluZ0eSvbthgaW9bLG58bSWdGpTxc60xgtbUw1ln8zTl3wyl6iXtvqjWnPjGa3VXLnI7bQkcBxLhQx1tGKO+wg6fylYPJMSV+96HRxwHUD/QS9mPGrnWKmgbgaqz9bQ+MGu777XmFoKZng8NnJU2Ov194Hy9pPWDvrvIHT8S6yLSyt37gyetXrXj6HzyVvTIO9+co0zeSyFcPVRGE54N+gq8bpYmdNj/3rt2rUe/6jFpQmrMp6bfdfOQJvHE4FY980shzYihF9gOfwiLKCvcBi/DvAXDrF/hJH9HAv2PMuy/8W62dvcbna21dnpD/n9Z921cyV0/O8T792VM56LLRrGb1yEgDE7qDvazXG/WHr8OpcAN//uL/Wz13x1NHH1zi2z78p4JXF1xmZYQF8gQgL4dcJdu/8AI/v1RLDnE9fs/jTxnt17k+/ZXbxg7YH2YfTDD8o6LkKAETvgkSdGeNuiw/uJivhBO+OHqnxchIA9yDHAA1pYj33TAOn/55PGRwiY63cDxrLopQVHjwpOvP/zPd7HA46LEFIPH8hAHs+dsD3+FtpAvvJxgWnSDR7KfENj7VtA+4++/h8AAAD//6liL+4AAAAGSURBVAMA5+cAMQC51PAAAAAASUVORK5CYII=	\N	2026-09-10 03:39:41.325
shop_enable_cart	false	\N	2026-09-11 02:52:54.832836
\.


--
-- Data for Name: stock_mutations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_mutations (id, product_id, type, rolls, meters, description, reference, created_at, roll_id) FROM stdin;
1	27	masuk	0.0000	120.0000	Pembelian INV-IN/20260910/0001	INV-IN/20260910/0001	2026-09-10 13:20:33.578231	\N
2	27	masuk	0.0000	120.0000	Pembelian INV-IN/20260910/0001	INV-IN/20260910/0001	2026-09-10 13:20:33.596747	\N
3	27	masuk	2.0000	240.0000	Pembelian INV-IN/20260910/0002	INV-IN/20260910/0002	2026-09-10 13:26:09.390108	\N
4	27	keluar	0.0000	120.0000	Batal Pembelian INV-IN/20260910/0001	INV-IN/20260910/0001	2026-09-10 14:13:31.26369	\N
5	27	keluar	0.0000	120.0000	Batal Pembelian INV-IN/20260910/0001	INV-IN/20260910/0001	2026-09-10 14:13:31.488687	\N
6	27	keluar	2.0000	240.0000	Batal Pembelian INV-IN/20260910/0002	INV-IN/20260910/0002	2026-09-10 14:32:17.194996	\N
7	3	masuk	23.0000	2617.9000	Pembelian INV-IN/20260911/0001	INV-IN/20260911/0001	2026-09-11 03:44:51.413422	\N
8	73	masuk	19.0000	2195.3000	Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 04:13:57.628656	\N
9	14	masuk	5.0000	727.7000	Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 04:13:57.637247	\N
10	3	masuk	6.0000	922.3000	Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 04:13:57.645956	\N
11	70	masuk	17.0000	1965.0000	Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 04:13:57.665338	\N
12	63	masuk	53.0000	5726.6000	Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 04:13:57.712244	\N
13	15	masuk	81.0000	9320.7000	Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 04:13:57.78281	\N
14	12	masuk	11.0000	1301.7000	Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 04:13:57.79529	\N
15	41	masuk	13.0000	1584.3000	Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 04:13:57.809027	\N
16	13	masuk	90.0000	10091.2000	Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 04:13:57.887118	\N
17	36	masuk	2.0000	229.3000	Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 04:13:57.892171	\N
18	70	masuk	33.0000	3846.1000	Pembelian INV-IN/20260911/0003	INV-IN/20260911/0003	2026-09-11 04:21:20.687771	\N
19	74	masuk	47.0000	5003.7000	Pembelian INV-IN/20260911/0003	INV-IN/20260911/0003	2026-09-11 04:21:20.730174	\N
20	75	masuk	23.0000	2489.1000	Pembelian INV-IN/20260911/0004	INV-IN/20260911/0004	2026-09-11 04:23:35.592808	\N
21	75	keluar	23.0000	2489.1000	Batal Pembelian INV-IN/20260911/0004	INV-IN/20260911/0004	2026-09-11 05:09:57.445675	\N
22	70	keluar	33.0000	3846.1000	Batal Pembelian INV-IN/20260911/0003	INV-IN/20260911/0003	2026-09-11 05:09:59.484092	\N
23	74	keluar	47.0000	5003.7000	Batal Pembelian INV-IN/20260911/0003	INV-IN/20260911/0003	2026-09-11 05:09:59.493406	\N
24	73	keluar	19.0000	2195.3000	Batal Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 05:10:01.614978	\N
25	14	keluar	5.0000	727.7000	Batal Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 05:10:01.619835	\N
26	3	keluar	6.0000	922.3000	Batal Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 05:10:01.624085	\N
27	70	keluar	17.0000	1965.0000	Batal Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 05:10:01.629253	\N
28	63	keluar	53.0000	5726.6000	Batal Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 05:10:01.637526	\N
29	15	keluar	81.0000	9320.7000	Batal Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 05:10:01.648589	\N
30	12	keluar	11.0000	1301.7000	Batal Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 05:10:01.653436	\N
31	41	keluar	13.0000	1584.3000	Batal Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 05:10:01.658671	\N
32	13	keluar	90.0000	10091.2000	Batal Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 05:10:01.669478	\N
33	36	keluar	2.0000	229.3000	Batal Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 05:10:01.674263	\N
34	3	keluar	23.0000	2617.9000	Batal Pembelian INV-IN/20260911/0001	INV-IN/20260911/0001	2026-09-11 05:10:03.783838	\N
35	36	masuk	2.0000	229.3000	Pembelian INV-IN/20260911/0001	INV-IN/20260911/0001	2026-09-11 05:13:24.906271	\N
36	13	masuk	90.0000	10445.0000	Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 05:26:53.710393	\N
37	77	masuk	31.0000	3680.4000	Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 05:49:07.902561	\N
38	57	masuk	10.0000	1159.0000	Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 05:49:07.913953	\N
39	25	masuk	3.0000	333.2000	Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 05:49:07.919709	\N
40	6	masuk	2.0000	232.7000	Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 05:49:07.924548	\N
41	78	masuk	1.0000	107.7000	Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 05:49:07.928497	\N
42	79	masuk	2.0000	211.2000	Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 05:49:07.933128	\N
43	40	masuk	3.0000	315.7000	Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 05:49:07.938557	\N
44	1	masuk	4.0000	485.2000	Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 05:49:07.944832	\N
45	24	masuk	10.0000	1146.2000	Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 05:49:07.956039	\N
46	12	masuk	2.0000	239.8000	Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 05:49:07.961358	\N
47	21	masuk	3.0000	344.2000	Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 05:49:07.968912	\N
48	13	masuk	23.0000	2564.8000	Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 05:49:07.993072	\N
49	73	masuk	4.0000	473.5000	Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 05:49:07.999642	\N
50	36	masuk	9.0000	1031.3000	Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 05:49:08.010101	\N
51	20	masuk	2.0000	234.0000	Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 05:49:08.014653	\N
52	7	masuk	2.0000	240.5000	Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 05:49:08.019704	\N
53	8	masuk	86.0000	10565.4000	Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 05:49:08.092487	\N
54	3	masuk	62.0000	7282.8000	Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-11 05:49:08.146955	\N
55	80	masuk	1.0000	120.0000	Pembelian INV-IN/20260911/0003	INV-IN/20260911/0003	2026-09-11 06:12:20.569682	\N
56	22	masuk	97.0000	11247.3000	Pembelian INV-IN/20260911/0003	INV-IN/20260911/0003	2026-09-11 06:12:20.658068	\N
57	13	masuk	23.0000	2545.1000	Pembelian INV-IN/20260911/0003	INV-IN/20260911/0003	2026-09-11 06:12:20.680576	\N
58	15	masuk	19.0000	2241.0000	Pembelian INV-IN/20260911/0003	INV-IN/20260911/0003	2026-09-11 06:12:20.699121	\N
59	21	masuk	12.0000	1480.3000	Pembelian INV-IN/20260911/0003	INV-IN/20260911/0003	2026-09-11 06:12:20.713082	\N
60	81	masuk	132.0000	25213.8000	Pembelian INV-IN/20260911/0004	INV-IN/20260911/0004	2026-09-11 06:52:08.336776	\N
61	84	masuk	36.0000	4718.1000	Pembelian INV-IN/20260911/0004	INV-IN/20260911/0004	2026-09-11 06:52:08.368651	\N
62	83	masuk	42.0000	4652.8000	Pembelian INV-IN/20260911/0004	INV-IN/20260911/0004	2026-09-11 06:52:08.408715	\N
63	84	masuk	30.0000	3375.3000	Pembelian INV-IN/20260911/0005	INV-IN/20260911/0005	2026-09-11 07:09:20.912279	\N
64	85	masuk	63.0000	7202.9000	Pembelian INV-IN/20260911/0005	INV-IN/20260911/0005	2026-09-11 07:09:20.966629	\N
65	36	masuk	3.0000	341.7000	Pembelian INV-IN/20260911/0006	INV-IN/20260911/0006	2026-09-11 07:35:10.926176	\N
66	36	keluar	3.0000	341.7000	Batal Pembelian INV-IN/20260911/0006	INV-IN/20260911/0006	2026-09-11 07:35:15.450502	\N
67	36	masuk	3.0000	341.7000	Pembelian INV-IN/20260911/0006	INV-IN/20260911/0006	2026-09-11 07:40:56.667444	\N
68	13	masuk	80.0000	9118.7000	Pembelian INV-IN/20260911/0006	INV-IN/20260911/0006	2026-09-11 07:40:56.741438	\N
69	86	masuk	74.0000	8255.2000	Pembelian INV-IN/20260911/0007	INV-IN/20260911/0007	2026-09-11 07:48:34.992938	\N
70	77	keluar	31.0000	3680.4000	Batal Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-12 02:44:00.388918	\N
71	57	keluar	10.0000	1159.0000	Batal Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-12 02:44:00.396315	\N
72	25	keluar	3.0000	333.2000	Batal Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-12 02:44:00.400333	\N
73	6	keluar	2.0000	232.7000	Batal Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-12 02:44:00.404177	\N
74	78	keluar	1.0000	107.7000	Batal Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-12 02:44:00.40759	\N
75	79	keluar	2.0000	211.2000	Batal Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-12 02:44:00.411079	\N
76	40	keluar	3.0000	315.7000	Batal Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-12 02:44:00.41518	\N
77	1	keluar	4.0000	485.2000	Batal Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-12 02:44:00.42155	\N
78	24	keluar	10.0000	1146.2000	Batal Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-12 02:44:00.426622	\N
79	12	keluar	2.0000	239.8000	Batal Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-12 02:44:00.430769	\N
80	21	keluar	3.0000	344.2000	Batal Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-12 02:44:00.43469	\N
81	13	keluar	23.0000	2564.8000	Batal Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-12 02:44:00.44017	\N
82	73	keluar	4.0000	473.5000	Batal Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-12 02:44:00.44486	\N
83	36	keluar	9.0000	1031.3000	Batal Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-12 02:44:00.449182	\N
84	20	keluar	2.0000	234.0000	Batal Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-12 02:44:00.45322	\N
85	7	keluar	2.0000	240.5000	Batal Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-12 02:44:00.456739	\N
86	8	keluar	86.0000	10565.4000	Batal Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-12 02:44:00.468375	\N
87	3	keluar	62.0000	7282.8000	Batal Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-12 02:44:00.478004	\N
88	80	keluar	1.0000	120.0000	Batal Pembelian INV-IN/20260911/0003	INV-IN/20260911/0003	2026-09-12 02:44:02.474864	\N
89	22	keluar	97.0000	11247.3000	Batal Pembelian INV-IN/20260911/0003	INV-IN/20260911/0003	2026-09-12 02:44:02.487784	\N
90	13	keluar	23.0000	2545.1000	Batal Pembelian INV-IN/20260911/0003	INV-IN/20260911/0003	2026-09-12 02:44:02.493356	\N
91	15	keluar	19.0000	2241.0000	Batal Pembelian INV-IN/20260911/0003	INV-IN/20260911/0003	2026-09-12 02:44:02.499131	\N
92	21	keluar	12.0000	1480.3000	Batal Pembelian INV-IN/20260911/0003	INV-IN/20260911/0003	2026-09-12 02:44:02.50363	\N
93	81	keluar	132.0000	25213.8000	Batal Pembelian INV-IN/20260911/0004	INV-IN/20260911/0004	2026-09-12 02:44:04.678768	\N
94	84	keluar	36.0000	4718.1000	Batal Pembelian INV-IN/20260911/0004	INV-IN/20260911/0004	2026-09-12 02:44:04.686114	\N
95	83	keluar	42.0000	4652.8000	Batal Pembelian INV-IN/20260911/0004	INV-IN/20260911/0004	2026-09-12 02:44:04.693306	\N
96	84	keluar	30.0000	3375.3000	Batal Pembelian INV-IN/20260911/0005	INV-IN/20260911/0005	2026-09-12 02:44:06.561853	\N
97	85	keluar	63.0000	7202.9000	Batal Pembelian INV-IN/20260911/0005	INV-IN/20260911/0005	2026-09-12 02:44:06.570622	\N
98	36	keluar	3.0000	341.7000	Batal Pembelian INV-IN/20260911/0006	INV-IN/20260911/0006	2026-09-12 02:44:08.175466	\N
99	13	keluar	80.0000	9118.7000	Batal Pembelian INV-IN/20260911/0006	INV-IN/20260911/0006	2026-09-12 02:44:08.187151	\N
100	86	keluar	74.0000	8255.2000	Batal Pembelian INV-IN/20260911/0007	INV-IN/20260911/0007	2026-09-12 02:44:09.918735	\N
101	13	keluar	90.0000	10445.0000	Batal Pembelian INV-IN/20260911/0002	INV-IN/20260911/0002	2026-09-12 02:44:11.603124	\N
102	36	keluar	2.0000	229.3000	Batal Pembelian INV-IN/20260911/0001	INV-IN/20260911/0001	2026-09-12 02:44:13.719798	\N
103	42	masuk	1.0000	1.0000	Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 04:22:09.377924	\N
104	75	masuk	23.0000	2489.1000	Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 04:22:09.401924	\N
105	73	masuk	19.0000	2193.3000	Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 04:22:09.420226	\N
106	3	masuk	29.0000	3540.2000	Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 04:22:09.445716	\N
107	63	masuk	53.0000	5726.7000	Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 04:22:09.492067	\N
108	70	masuk	17.0000	1965.0000	Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 04:22:09.508334	\N
109	14	masuk	5.0000	730.2000	Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 04:22:09.5152	\N
110	15	masuk	81.0000	9341.7000	Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 04:22:09.582103	\N
111	12	masuk	11.0000	1301.7000	Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 04:22:09.596233	\N
112	74	masuk	47.0000	5222.7000	Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 04:22:09.63582	\N
113	56	masuk	33.0000	3843.8000	Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 04:22:09.666041	\N
114	80	masuk	13.0000	1584.3000	Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 04:22:09.679252	\N
115	13	masuk	90.0000	10345.0000	Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 04:22:09.755569	\N
116	36	masuk	2.0000	229.3000	Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 04:22:09.760462	\N
136	42	keluar	1.0000	1.0000	Batal Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 05:07:24.838098	\N
137	75	keluar	23.0000	2489.1000	Batal Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 05:07:24.847375	\N
138	73	keluar	19.0000	2193.3000	Batal Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 05:07:24.853505	\N
139	3	keluar	29.0000	3540.2000	Batal Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 05:07:24.86055	\N
140	63	keluar	53.0000	5726.7000	Batal Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 05:07:24.869963	\N
141	70	keluar	17.0000	1965.0000	Batal Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 05:07:24.875769	\N
142	14	keluar	5.0000	730.2000	Batal Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 05:07:24.880664	\N
143	15	keluar	81.0000	9341.7000	Batal Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 05:07:24.893163	\N
144	12	keluar	11.0000	1301.7000	Batal Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 05:07:24.898749	\N
145	74	keluar	47.0000	5222.7000	Batal Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 05:07:24.908881	\N
146	56	keluar	33.0000	3843.8000	Batal Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 05:07:24.915946	\N
147	80	keluar	13.0000	1584.3000	Batal Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 05:07:24.921522	\N
148	13	keluar	90.0000	10345.0000	Batal Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 05:07:24.934032	\N
149	36	keluar	2.0000	229.3000	Batal Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 05:07:24.939205	\N
150	88	masuk	9.0000	1348.0000	Pembelian INV-IN/20260912/0002	INV-IN/20260912/0002	2026-09-12 05:54:44.999705	\N
151	89	masuk	10.0000	1507.0000	Pembelian INV-IN/20260912/0002	INV-IN/20260912/0002	2026-09-12 05:54:45.011375	\N
152	90	masuk	11.0000	1640.0000	Pembelian INV-IN/20260912/0002	INV-IN/20260912/0002	2026-09-12 05:54:45.025676	\N
153	90	masuk	18.0000	2696.0000	Pembelian INV-IN/20260912/0002	INV-IN/20260912/0002	2026-09-12 05:54:45.061217	\N
154	90	masuk	13.0000	1933.0000	Pembelian INV-IN/20260912/0002	INV-IN/20260912/0002	2026-09-12 05:54:45.075982	\N
155	91	masuk	15.0000	2162.0000	Pembelian INV-IN/20260912/0002	INV-IN/20260912/0002	2026-09-12 05:54:45.091075	\N
156	91	masuk	10.0000	1482.0000	Pembelian INV-IN/20260912/0002	INV-IN/20260912/0002	2026-09-12 05:54:45.102195	\N
157	92	masuk	22.0000	3290.0000	Pembelian INV-IN/20260912/0002	INV-IN/20260912/0002	2026-09-12 05:54:45.123148	\N
158	93	masuk	21.0000	3117.0000	Pembelian INV-IN/20260912/0003	INV-IN/20260912/0003	2026-09-12 06:12:50.537832	\N
159	94	masuk	19.0000	2792.0000	Pembelian INV-IN/20260912/0003	INV-IN/20260912/0003	2026-09-12 06:12:50.557958	\N
160	95	masuk	14.0000	2098.0000	Pembelian INV-IN/20260912/0003	INV-IN/20260912/0003	2026-09-12 06:12:50.572901	\N
161	96	masuk	22.0000	3303.0000	Pembelian INV-IN/20260912/0003	INV-IN/20260912/0003	2026-09-12 06:12:50.595063	\N
162	97	masuk	10.0000	1458.0000	Pembelian INV-IN/20260912/0003	INV-IN/20260912/0003	2026-09-12 06:12:50.607205	\N
163	97	masuk	13.0000	1945.0000	Pembelian INV-IN/20260912/0003	INV-IN/20260912/0003	2026-09-12 06:12:50.623908	\N
164	98	masuk	14.0000	2057.0000	Pembelian INV-IN/20260912/0003	INV-IN/20260912/0003	2026-09-12 06:12:50.638623	\N
165	99	masuk	13.0000	1964.0000	Pembelian INV-IN/20260912/0004	INV-IN/20260912/0004	2026-09-12 06:32:58.770909	\N
166	100	masuk	5.0000	745.0000	Pembelian INV-IN/20260912/0004	INV-IN/20260912/0004	2026-09-12 06:32:58.778151	\N
167	101	masuk	20.0000	3049.0000	Pembelian INV-IN/20260912/0004	INV-IN/20260912/0004	2026-09-12 06:32:58.797191	\N
168	102	masuk	13.0000	1982.0000	Pembelian INV-IN/20260912/0004	INV-IN/20260912/0004	2026-09-12 06:32:58.811463	\N
169	103	masuk	14.0000	2081.0000	Pembelian INV-IN/20260912/0004	INV-IN/20260912/0004	2026-09-12 06:32:58.826128	\N
170	104	masuk	11.0000	1649.0000	Pembelian INV-IN/20260912/0004	INV-IN/20260912/0004	2026-09-12 06:32:58.83796	\N
171	105	masuk	12.0000	1809.0000	Pembelian INV-IN/20260912/0004	INV-IN/20260912/0004	2026-09-12 06:32:58.850773	\N
172	106	masuk	20.0000	3025.0000	Pembelian INV-IN/20260912/0004	INV-IN/20260912/0004	2026-09-12 06:32:58.871705	\N
173	56	masuk	33.0000	3843.8000	Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 06:55:24.214425	\N
174	42	masuk	1.0000	1.0000	Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 06:55:24.219886	\N
175	36	masuk	2.0000	229.3000	Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 06:55:24.225832	\N
176	12	masuk	11.0000	1301.7000	Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 06:55:24.239284	\N
177	14	masuk	5.0000	730.2000	Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 06:55:24.247273	\N
178	13	masuk	90.0000	10345.0000	Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 06:55:24.327573	\N
179	15	masuk	81.0000	9341.7000	Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 06:55:24.399707	\N
180	73	masuk	19.0000	2193.3000	Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 06:55:24.419327	\N
181	3	masuk	29.0000	3540.2000	Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 06:55:24.449562	\N
182	63	masuk	53.0000	5726.7000	Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 06:55:24.496472	\N
183	70	masuk	17.0000	1965.0000	Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 06:55:24.513726	\N
184	74	masuk	47.0000	5222.7000	Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 06:55:24.558811	\N
185	80	masuk	13.0000	1584.3000	Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 06:55:24.572702	\N
186	75	masuk	23.0000	2489.1000	Pembelian INV-IN/20260912/0001	INV-IN/20260912/0001	2026-09-12 06:55:24.594771	\N
187	87	masuk	36.0000	3892.8000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 07:08:29.486743	\N
188	83	masuk	43.0000	4646.9000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 07:08:29.527578	\N
189	84	masuk	30.0000	3371.6000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 07:08:29.55555	\N
190	85	masuk	63.0000	7104.5000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 07:08:29.613982	\N
191	86	masuk	74.0000	8255.8000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 07:08:29.678075	\N
192	81	masuk	132.0000	13764.5000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 07:08:29.792196	\N
193	11	masuk	5.0000	560.9000	Pembelian INV-IN/20260912/0006	INV-IN/20260912/0006	2026-09-12 07:56:49.073404	\N
194	14	masuk	1.0000	105.5000	Pembelian INV-IN/20260912/0006	INV-IN/20260912/0006	2026-09-12 07:56:49.078336	\N
195	55	masuk	1.0000	98.4000	Pembelian INV-IN/20260912/0006	INV-IN/20260912/0006	2026-09-12 07:56:49.083136	\N
196	26	masuk	6.0000	713.7000	Pembelian INV-IN/20260912/0006	INV-IN/20260912/0006	2026-09-12 07:56:49.093536	\N
197	63	masuk	43.0000	4953.2000	Pembelian INV-IN/20260912/0006	INV-IN/20260912/0006	2026-09-12 07:56:49.13566	\N
198	70	masuk	1.0000	109.0000	Pembelian INV-IN/20260912/0006	INV-IN/20260912/0006	2026-09-12 07:56:49.140249	\N
199	16	masuk	5.0000	582.3000	Pembelian INV-IN/20260912/0006	INV-IN/20260912/0006	2026-09-12 07:56:49.148364	\N
200	60	masuk	2.0000	238.0000	Pembelian INV-IN/20260912/0006	INV-IN/20260912/0006	2026-09-12 07:56:49.153184	\N
201	107	masuk	1.0000	85.0000	Pembelian INV-IN/20260912/0007	INV-IN/20260912/0007	2026-09-12 08:01:21.554248	\N
202	108	masuk	17.0000	1947.5000	Pembelian INV-IN/20260912/0007	INV-IN/20260912/0007	2026-09-12 08:01:21.572774	\N
203	77	masuk	31.0000	3753.4000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 08:58:57.481093	\N
204	57	masuk	10.0000	1159.0000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 08:58:57.493387	\N
205	25	masuk	3.0000	333.2000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 08:58:57.500108	\N
206	6	masuk	2.0000	232.7000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 08:58:57.50526	\N
207	78	masuk	1.0000	108.7000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 08:58:57.509374	\N
208	79	masuk	2.0000	211.2000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 08:58:57.514442	\N
209	40	masuk	3.0000	319.7000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 08:58:57.520364	\N
210	1	masuk	4.0000	485.2000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 08:58:57.527072	\N
211	24	masuk	10.0000	1146.2000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 08:58:57.539682	\N
212	12	masuk	2.0000	239.8000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 08:58:57.545821	\N
213	21	masuk	3.0000	344.2000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 08:58:57.551388	\N
214	13	masuk	12.0000	1220.0000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 08:58:57.565175	\N
215	73	masuk	4.0000	473.5000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 08:58:57.571506	\N
216	36	masuk	9.0000	1031.3000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 08:58:57.582416	\N
217	20	masuk	3.0000	235.0000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 08:58:57.588024	\N
218	7	masuk	2.0000	240.5000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 08:58:57.593312	\N
219	13	masuk	12.0000	1345.8000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 08:58:57.607226	\N
220	8	masuk	55.0000	6093.0000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 08:58:57.656319	\N
221	8	masuk	32.0000	3602.6000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 08:58:57.686106	\N
222	3	masuk	63.0000	7323.8000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 08:58:57.739644	\N
223	22	masuk	81.0000	10382.2000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 08:58:57.810866	\N
224	80	masuk	1.0000	120.0000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 08:58:57.814632	\N
225	13	masuk	23.0000	2545.1000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 08:58:57.836856	\N
226	15	masuk	18.0000	2120.7000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 08:58:57.854892	\N
227	22	masuk	16.0000	1917.0000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 08:58:57.873563	\N
228	21	masuk	12.0000	1480.3000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 08:58:57.886761	\N
229	36	masuk	3.0000	341.7000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 08:58:57.892637	\N
230	13	masuk	80.0000	9158.7000	Pembelian INV-IN/20260912/0005	INV-IN/20260912/0005	2026-09-12 08:58:57.961974	\N
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, name, phone, address, contact_person, created_at, updated_at) FROM stdin;
2	MTX	082210249837	PIK 1	Ade	2026-09-11 03:36:04.154261	2026-09-11 03:36:04.154261
3	SCA	08156936030	Solo	Shinta	2026-09-11 03:36:42.172265	2026-09-11 03:36:42.172265
4	MJS	082129151929	Bandung	Intan	2026-09-11 03:38:06.844345	2026-09-11 03:38:06.844345
5	BAS	08122616492	Solo	Yundarto	2026-09-11 06:16:12.0177	2026-09-11 06:16:12.0177
6	MJI	08156936030	Solo Sragen	Shinta	2026-09-12 09:34:54.411231	2026-09-12 09:34:54.411231
\.


--
-- Data for Name: units; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.units (id, name, symbol, created_at) FROM stdin;
1	METER	M	2026-09-10 05:19:48.6882
2	YARD	YDS	2026-09-10 05:19:56.259355
4	ROLL	ROLL	2026-09-10 05:20:18.645143
3	KG	KG	2026-09-10 05:20:05.178014
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password_hash, full_name, role, created_at) FROM stdin;
1	admin	$2b$10$lpuCrLkpETnM3J6ApM.ggugsML6zM1xYkbFwnd49kBKlhnwFHFg8y	Administrator	admin	2026-09-10 02:48:23.083359
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: postgres
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 3, true);


--
-- Name: cash_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cash_entries_id_seq', 1, false);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 11, true);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customers_id_seq', 1, false);


--
-- Name: license_cache_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.license_cache_id_seq', 1, true);


--
-- Name: payables_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payables_id_seq', 50, true);


--
-- Name: payment_methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payment_methods_id_seq', 5, true);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- Name: product_rolls_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_rolls_id_seq', 7517, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 108, true);


--
-- Name: purchase_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.purchase_items_id_seq', 165, true);


--
-- Name: purchases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.purchases_id_seq', 56, true);


--
-- Name: push_subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.push_subscriptions_id_seq', 2, true);


--
-- Name: receivables_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.receivables_id_seq', 1, false);


--
-- Name: return_exchanged_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.return_exchanged_items_id_seq', 1, false);


--
-- Name: return_returned_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.return_returned_items_id_seq', 1, false);


--
-- Name: returns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.returns_id_seq', 1, false);


--
-- Name: sale_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sale_items_id_seq', 1, false);


--
-- Name: sales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sales_id_seq', 1, false);


--
-- Name: stock_mutations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_mutations_id_seq', 230, true);


--
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 6, true);


--
-- Name: units_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.units_id_seq', 4, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: cash_entries cash_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cash_entries
    ADD CONSTRAINT cash_entries_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: license_cache license_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.license_cache
    ADD CONSTRAINT license_cache_pkey PRIMARY KEY (id);


--
-- Name: payables payables_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payables
    ADD CONSTRAINT payables_pkey PRIMARY KEY (id);


--
-- Name: payment_methods payment_methods_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_code_unique UNIQUE (code);


--
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: product_rolls product_rolls_barcode_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_rolls
    ADD CONSTRAINT product_rolls_barcode_unique UNIQUE (barcode);


--
-- Name: product_rolls product_rolls_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_rolls
    ADD CONSTRAINT product_rolls_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: purchase_items purchase_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_items
    ADD CONSTRAINT purchase_items_pkey PRIMARY KEY (id);


--
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);


--
-- Name: push_subscriptions push_subscriptions_endpoint_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_endpoint_unique UNIQUE (endpoint);


--
-- Name: push_subscriptions push_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: receivables receivables_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receivables
    ADD CONSTRAINT receivables_pkey PRIMARY KEY (id);


--
-- Name: return_exchanged_items return_exchanged_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_exchanged_items
    ADD CONSTRAINT return_exchanged_items_pkey PRIMARY KEY (id);


--
-- Name: return_returned_items return_returned_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_returned_items
    ADD CONSTRAINT return_returned_items_pkey PRIMARY KEY (id);


--
-- Name: returns returns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT returns_pkey PRIMARY KEY (id);


--
-- Name: sale_items sale_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (key);


--
-- Name: stock_mutations stock_mutations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_mutations
    ADD CONSTRAINT stock_mutations_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: units units_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: payables payables_purchase_id_purchases_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payables
    ADD CONSTRAINT payables_purchase_id_purchases_id_fk FOREIGN KEY (purchase_id) REFERENCES public.purchases(id);


--
-- Name: payables payables_supplier_id_suppliers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payables
    ADD CONSTRAINT payables_supplier_id_suppliers_id_fk FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: payments payments_payable_id_payables_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_payable_id_payables_id_fk FOREIGN KEY (payable_id) REFERENCES public.payables(id);


--
-- Name: payments payments_receivable_id_receivables_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_receivable_id_receivables_id_fk FOREIGN KEY (receivable_id) REFERENCES public.receivables(id);


--
-- Name: product_rolls product_rolls_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_rolls
    ADD CONSTRAINT product_rolls_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: products products_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: purchase_items purchase_items_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_items
    ADD CONSTRAINT purchase_items_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: purchase_items purchase_items_purchase_id_purchases_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_items
    ADD CONSTRAINT purchase_items_purchase_id_purchases_id_fk FOREIGN KEY (purchase_id) REFERENCES public.purchases(id);


--
-- Name: purchase_items purchase_items_roll_id_product_rolls_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_items
    ADD CONSTRAINT purchase_items_roll_id_product_rolls_id_fk FOREIGN KEY (roll_id) REFERENCES public.product_rolls(id);


--
-- Name: purchases purchases_supplier_id_suppliers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_supplier_id_suppliers_id_fk FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: push_subscriptions push_subscriptions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: receivables receivables_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receivables
    ADD CONSTRAINT receivables_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: receivables receivables_sale_id_sales_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receivables
    ADD CONSTRAINT receivables_sale_id_sales_id_fk FOREIGN KEY (sale_id) REFERENCES public.sales(id);


--
-- Name: return_exchanged_items return_exchanged_items_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_exchanged_items
    ADD CONSTRAINT return_exchanged_items_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: return_exchanged_items return_exchanged_items_return_id_returns_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_exchanged_items
    ADD CONSTRAINT return_exchanged_items_return_id_returns_id_fk FOREIGN KEY (return_id) REFERENCES public.returns(id);


--
-- Name: return_exchanged_items return_exchanged_items_roll_id_product_rolls_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_exchanged_items
    ADD CONSTRAINT return_exchanged_items_roll_id_product_rolls_id_fk FOREIGN KEY (roll_id) REFERENCES public.product_rolls(id);


--
-- Name: return_returned_items return_returned_items_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_returned_items
    ADD CONSTRAINT return_returned_items_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: return_returned_items return_returned_items_return_id_returns_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_returned_items
    ADD CONSTRAINT return_returned_items_return_id_returns_id_fk FOREIGN KEY (return_id) REFERENCES public.returns(id);


--
-- Name: return_returned_items return_returned_items_roll_id_product_rolls_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_returned_items
    ADD CONSTRAINT return_returned_items_roll_id_product_rolls_id_fk FOREIGN KEY (roll_id) REFERENCES public.product_rolls(id);


--
-- Name: returns returns_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT returns_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: returns returns_purchase_id_purchases_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT returns_purchase_id_purchases_id_fk FOREIGN KEY (purchase_id) REFERENCES public.purchases(id);


--
-- Name: returns returns_sale_id_sales_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT returns_sale_id_sales_id_fk FOREIGN KEY (sale_id) REFERENCES public.sales(id);


--
-- Name: returns returns_supplier_id_suppliers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT returns_supplier_id_suppliers_id_fk FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: sale_items sale_items_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: sale_items sale_items_roll_id_product_rolls_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_roll_id_product_rolls_id_fk FOREIGN KEY (roll_id) REFERENCES public.product_rolls(id);


--
-- Name: sale_items sale_items_sale_id_sales_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_sale_id_sales_id_fk FOREIGN KEY (sale_id) REFERENCES public.sales(id);


--
-- Name: sales sales_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: stock_mutations stock_mutations_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_mutations
    ADD CONSTRAINT stock_mutations_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: stock_mutations stock_mutations_roll_id_product_rolls_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_mutations
    ADD CONSTRAINT stock_mutations_roll_id_product_rolls_id_fk FOREIGN KEY (roll_id) REFERENCES public.product_rolls(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict 023ds8XsS01ST66e0Jb4pJvjE88wdb0Y1s70kDr6G1RbNuj9en6EIUhGXWfTe3F

