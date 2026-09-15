--
-- PostgreSQL database dump
--

\restrict spsbewVra5d52nEw4n35Y07iEZMdXF8ndLLNSh4djVLGeXqwjR3QEpkf4Ljlmbr

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
\.


--
-- Data for Name: payables; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payables (id, purchase_id, supplier_id, total_amount, paid_amount, status, due_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_methods (id, code, name, is_active, sort_order, created_at) FROM stdin;
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
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, category_id, lot_number, rack_location, price_per_meter, price_per_roll, roll_stock, meter_stock, min_stock, created_at, updated_at, barcode, primary_unit, secondary_unit, image_url, description, cost_price_per_meter, cost_price_per_roll) FROM stdin;
\.


--
-- Data for Name: purchase_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_items (id, purchase_id, product_id, rolls, meters, price_per_meter, subtotal, roll_id) FROM stdin;
\.


--
-- Data for Name: purchases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchases (id, invoice_number, supplier_id, payment_type, total_amount, paid_amount, status, due_date, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: push_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.push_subscriptions (id, user_id, endpoint, p256dh, auth, created_at) FROM stdin;
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
\.


--
-- Data for Name: stock_mutations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_mutations (id, product_id, type, rolls, meters, description, reference, created_at, roll_id) FROM stdin;
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, name, phone, address, contact_person, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: units; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.units (id, name, symbol, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password_hash, full_name, role, created_at) FROM stdin;
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

SELECT pg_catalog.setval('public.categories_id_seq', 1, false);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customers_id_seq', 1, false);


--
-- Name: license_cache_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.license_cache_id_seq', 1, false);


--
-- Name: payables_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payables_id_seq', 1, false);


--
-- Name: payment_methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payment_methods_id_seq', 1, false);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- Name: product_rolls_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_rolls_id_seq', 1, false);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 1, false);


--
-- Name: purchase_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.purchase_items_id_seq', 1, false);


--
-- Name: purchases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.purchases_id_seq', 1, false);


--
-- Name: push_subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.push_subscriptions_id_seq', 1, false);


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

SELECT pg_catalog.setval('public.stock_mutations_id_seq', 1, false);


--
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 1, false);


--
-- Name: units_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.units_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


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

\unrestrict spsbewVra5d52nEw4n35Y07iEZMdXF8ndLLNSh4djVLGeXqwjR3QEpkf4Ljlmbr

