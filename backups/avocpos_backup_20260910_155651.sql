--
-- PostgreSQL database dump
--

\restrict 2hZbuIhz9VN2fCHFniW5ixEE8SkOcu4hcv7C1Sr0cWq8u5NFdrjCB0YRuZDVGOl

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

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


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO postgres;

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


ALTER SEQUENCE public.cash_entries_id_seq OWNER TO postgres;

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


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

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


ALTER SEQUENCE public.customers_id_seq OWNER TO postgres;

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


ALTER SEQUENCE public.license_cache_id_seq OWNER TO postgres;

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


ALTER SEQUENCE public.payables_id_seq OWNER TO postgres;

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


ALTER SEQUENCE public.payment_methods_id_seq OWNER TO postgres;

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


ALTER SEQUENCE public.payments_id_seq OWNER TO postgres;

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


ALTER SEQUENCE public.product_rolls_id_seq OWNER TO postgres;

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


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

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


ALTER SEQUENCE public.purchase_items_id_seq OWNER TO postgres;

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


ALTER SEQUENCE public.purchases_id_seq OWNER TO postgres;

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


ALTER SEQUENCE public.push_subscriptions_id_seq OWNER TO postgres;

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


ALTER SEQUENCE public.receivables_id_seq OWNER TO postgres;

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


ALTER SEQUENCE public.return_exchanged_items_id_seq OWNER TO postgres;

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


ALTER SEQUENCE public.return_returned_items_id_seq OWNER TO postgres;

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


ALTER SEQUENCE public.returns_id_seq OWNER TO postgres;

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


ALTER SEQUENCE public.sale_items_id_seq OWNER TO postgres;

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


ALTER SEQUENCE public.sales_id_seq OWNER TO postgres;

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


ALTER SEQUENCE public.stock_mutations_id_seq OWNER TO postgres;

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


ALTER SEQUENCE public.suppliers_id_seq OWNER TO postgres;

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


ALTER SEQUENCE public.units_id_seq OWNER TO postgres;

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


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

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
\.


--
-- Data for Name: cash_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cash_entries (id, type, amount, description, reference, created_at) FROM stdin;
1	masuk	1696790.00	Selisih Tambah Retur Penjualan RET-1788165597467	RET-1788165597467	2026-08-31 15:39:57.503047
2	keluar	1696790.00	Refund Retur Penjualan RET-1788171969829	RET-1788171969829	2026-08-31 17:26:09.845099
3	keluar	6125550.00	Refund Retur Penjualan RET-1788172303338	RET-1788172303338	2026-08-31 17:31:43.354672
4	masuk	6125550.00	Selisih Tambah Retur Penjualan RET-1788172999269	RET-1788172999269	2026-08-31 17:43:19.283812
5	keluar	3017550.00	Refund Retur Penjualan RET-1788204651476	RET-1788204651476	2026-09-01 02:30:51.490294
6	masuk	30734760.00	Selisih Tambah Retur Penjualan RET-1788208098900	RET-1788208098900	2026-09-01 03:28:19.048935
7	masuk	3108000.00	Selisih Tambah Retur Penjualan RET-1788204791643	RET-1788204791643	2026-09-01 04:02:45.164432
8	keluar	2253720.00	Refund Retur Penjualan RET-1788211184846	RET-1788211184846	2026-09-01 04:19:44.90106
9	masuk	854280.00	Selisih Tambah Retur Penjualan RET-1788211220318	RET-1788211220318	2026-09-01 04:20:20.464781
10	keluar	518050.00	Refund Retur Penjualan RET-1788248617552	RET-1788248617552	2026-09-01 14:43:37.615001
11	keluar	7536760.00	Refund Retur Penjualan RET-1788252224016	RET-1788252224016	2026-09-01 15:43:44.067257
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, description, created_at, updated_at) FROM stdin;
1	RAYON TWILL		2026-07-18 09:32:08.692193	2026-07-18 09:32:08.692193
2	SCUBA	SCUBA	2026-09-01 14:25:12.896792	2026-09-01 14:25:12.896792
3	AIRFLOW SALUR		2026-09-01 14:34:23.587005	2026-09-01 14:34:23.587005
4	AMANDARI		2026-09-01 14:34:29.114935	2026-09-01 14:34:29.114935
5	\tAYAKA		2026-09-01 14:34:35.056043	2026-09-01 14:34:35.056043
6	\tBABY CRUSH		2026-09-01 14:34:40.296004	2026-09-01 14:34:40.296004
7	BALON PREMIUM		2026-09-01 14:34:44.799758	2026-09-01 14:34:44.799758
8	\tCEY AIRFLOW DIAMOND		2026-09-01 14:34:50.488539	2026-09-01 14:34:50.488539
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, name, phone, address, credit_limit, created_at, updated_at) FROM stdin;
1	Dano	08999965852	JL Marauke	50000000.00	2026-09-02 14:37:38.394839	2026-09-02 14:37:38.394839
\.


--
-- Data for Name: license_cache; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.license_cache (id, license_key, is_valid, expires_at, cached_at, days_left, store_name) FROM stdin;
1	VOC-R534-260910-VP6M	t	2026-10-10 04:48:32.726	2026-09-10 08:56:34.504	30	ENKATEXTILE
\.


--
-- Data for Name: payables; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payables (id, purchase_id, supplier_id, total_amount, paid_amount, status, due_date, created_at, updated_at) FROM stdin;
1	1	1	140000000.00	0.00	unpaid	2026-09-10 00:00:00	2026-09-01 18:46:22.035411	2026-09-01 18:46:22.035411
2	2	1	47500000.00	0.00	unpaid	2026-09-10 00:00:00	2026-09-01 18:53:12.757964	2026-09-01 18:53:12.757964
3	3	1	36000000.00	0.00	unpaid	2026-09-10 00:00:00	2026-09-01 18:55:10.919543	2026-09-01 18:55:10.919543
4	4	1	44000000.00	0.00	unpaid	2026-09-27 00:00:00	2026-09-01 19:18:12.723775	2026-09-01 19:18:12.723775
5	5	1	12091940.00	0.00	unpaid	2026-09-17 00:00:00	2026-09-02 03:05:12.087154	2026-09-02 03:05:12.087154
\.


--
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_methods (id, code, name, is_active, sort_order, created_at) FROM stdin;
1	tunai	Tunai / Cash	t	0	2026-07-18 09:22:50.451477
2	transfer	Transfer Bank	t	1	2026-07-18 09:22:50.451477
3	debit	Kartu Debit	t	2	2026-07-18 09:22:50.451477
4	qris	QRIS	t	3	2026-07-18 09:22:50.451477
5	kredit	Kredit / Tempo	t	4	2026-07-18 09:22:50.451477
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, receivable_id, payable_id, amount, payment_method, notes, paid_at) FROM stdin;
1	3	\N	4428760.00	transfer	sudah bayar transfer 	2026-09-01 03:16:29.664072
2	2	\N	1320760.00	transfer	\N	2026-09-01 03:42:14.394099
3	1	\N	1.32	transfer	\N	2026-09-01 04:17:59.005497
4	1	\N	1320760.00	transfer	\N	2026-09-01 04:18:14.06715
5	9	\N	1000000.00	cashless	\N	2026-09-04 01:55:57.043703
6	10	\N	1000000.00	cashless	\N	2026-09-04 02:12:51.825782
7	11	\N	2500000.00	transfer	Bayar sore	2026-09-04 02:15:19.297175
8	6	\N	518050.00	tunai	\N	2026-09-04 02:16:35.735398
\.


--
-- Data for Name: product_rolls; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_rolls (id, product_id, barcode, original_length, current_length, status, created_at, updated_at) FROM stdin;
143	2	PRD-1784768608096-R1784768608140-5	127.6600	127.6600	available	2026-07-23 08:03:28.143265	2026-07-23 08:03:28.143265
145	2	PRD-1784768608096-R1784768608140-7	127.6600	127.6600	available	2026-07-23 08:03:28.143265	2026-07-23 08:03:28.143265
147	2	PRD-1784768608096-R1784768608140-9	127.6600	127.6600	available	2026-07-23 08:03:28.143265	2026-07-23 08:03:28.143265
148	2	PRD-1784768608096-R1784768608140-10	127.6600	127.6600	available	2026-07-23 08:03:28.143265	2026-07-23 08:03:28.143265
150	2	PRD-1784768608096-R1784768608140-12	127.6600	127.6600	available	2026-07-23 08:03:28.143265	2026-07-23 08:03:28.143265
151	2	PRD-1784768608096-R1784768608140-13	127.6600	127.6600	available	2026-07-23 08:03:28.143265	2026-07-23 08:03:28.143265
152	2	PRD-1784768608096-R1784768608140-14	127.6600	127.6600	available	2026-07-23 08:03:28.143265	2026-07-23 08:03:28.143265
153	2	PRD-1784768608096-R1784768608140-15	127.6600	127.6600	available	2026-07-23 08:03:28.143265	2026-07-23 08:03:28.143265
154	2	PRD-1784768608096-R1784768608140-16	127.6600	127.6600	available	2026-07-23 08:03:28.143265	2026-07-23 08:03:28.143265
155	2	PRD-1784768608096-R1784768608140-17	127.6600	127.6600	available	2026-07-23 08:03:28.143265	2026-07-23 08:03:28.143265
157	2	PRD-1784768608096-R1784768608140-19	127.6600	127.6600	available	2026-07-23 08:03:28.143265	2026-07-23 08:03:28.143265
158	2	PRD-1784768608096-R1784768608140-20	127.6600	127.6600	available	2026-07-23 08:03:28.143265	2026-07-23 08:03:28.143265
159	2	PRD-1784768608096-R1784768608140-21	127.6600	127.6600	available	2026-07-23 08:03:28.143265	2026-07-23 08:03:28.143265
160	2	PRD-1784768608096-R1784768608140-22	127.6600	127.6600	available	2026-07-23 08:03:28.143265	2026-07-23 08:03:28.143265
161	2	PRD-1784768608096-R1784768608140-23	127.6600	127.6600	available	2026-07-23 08:03:28.143265	2026-07-23 08:03:28.143265
162	2	PRD-1784768608096-R1784768608140-24	127.6600	127.6600	available	2026-07-23 08:03:28.143265	2026-07-23 08:03:28.143265
165	2	PRD-1784768608096-R1784768608140-27	127.6600	127.6600	available	2026-07-23 08:03:28.143265	2026-07-23 08:03:28.143265
166	2	PRD-1784768608096-R1784768608140-28	127.6600	127.6600	available	2026-07-23 08:03:28.143265	2026-07-23 08:03:28.143265
167	2	PRD-1784768608096-R1784768608140-29	127.6600	127.6600	available	2026-07-23 08:03:28.143265	2026-07-23 08:03:28.143265
139	2	PRD-1784768608096-R1784768608140-1	127.6600	0.0000	empty	2026-07-23 08:03:28.143265	2026-07-23 08:24:17.348108
140	2	PRD-1784768608096-R1784768608140-2	127.6600	0.0000	empty	2026-07-23 08:03:28.143265	2026-07-23 08:24:17.348837
141	2	PRD-1784768608096-R1784768608140-3	127.6600	0.0000	empty	2026-07-23 08:03:28.143265	2026-07-23 08:24:17.34918
177	2	PRD-1784768608096-R1784768608140-39	127.6600	0.0000	empty	2026-07-23 08:03:28.143265	2026-08-31 17:16:33.466945
178	2	PRD-1784768608096-R1784768608140-40	127.6600	0.0000	empty	2026-07-23 08:03:28.143265	2026-08-31 17:16:33.470493
179	2	PRD-1784768608096-R1788170649984	132.0000	0.0000	empty	2026-08-31 17:04:09.985004	2026-08-31 17:16:33.473249
180	2	PRD-1784768608096-R1788170653712	786.0000	0.0000	empty	2026-08-31 17:04:13.714097	2026-08-31 17:16:33.476047
181	2	PRD-1784768608096-R1788170656794	453.0000	0.0000	empty	2026-08-31 17:04:16.795869	2026-08-31 17:16:33.478478
172	2	PRD-1784768608096-R1784768608140-34	127.6600	0.0000	empty	2026-07-23 08:03:28.143265	2026-08-31 17:16:33.480728
173	2	PRD-1784768608096-R1784768608140-35	127.6600	0.0000	empty	2026-07-23 08:03:28.143265	2026-08-31 17:16:33.483316
182	2	PRD-1784768608096-R1788170659825	2345.0000	0.0000	empty	2026-08-31 17:04:19.826476	2026-08-31 17:16:33.485664
4	1	PRD-1784342075713-R1784342213117-4	5.0250	0.0000	empty	2026-07-18 09:36:53.128624	2026-09-01 02:30:51.489348
3	1	PRD-1784342075713-R1784342213117-3	5.0250	0.0000	empty	2026-07-18 09:36:53.128624	2026-08-31 17:16:33.49052
5	1	PRD-1784342075713-R1784342213117-5	5.0250	0.0000	empty	2026-07-18 09:36:53.128624	2026-08-31 17:25:31.35399
176	2	PRD-1784768608096-R1784768608140-38	127.6600	0.0000	empty	2026-07-23 08:03:28.143265	2026-08-31 17:25:31.358296
175	2	PRD-1784768608096-R1784768608140-37	127.6600	0.0000	empty	2026-07-23 08:03:28.143265	2026-08-31 17:25:31.361098
163	2	PRD-1784768608096-R1784768608140-25	127.6600	0.0000	empty	2026-07-23 08:03:28.143265	2026-08-31 17:25:31.363828
164	2	PRD-1784768608096-R1784768608140-26	127.6600	0.0000	empty	2026-07-23 08:03:28.143265	2026-08-31 17:25:31.366706
183	2	PRD-1784768608096-R1788172243589	222.0000	0.0000	empty	2026-08-31 17:30:43.590868	2026-08-31 17:31:26.703003
199	1	PRD-1784342075713-R1788244889548	135.2700	135.2700	available	2026-09-01 13:41:29.548855	2026-09-01 13:41:29.548855
2	1	PRD-1784342075713-R1784342213117-2	5.0250	0.0000	empty	2026-07-18 09:36:53.128624	2026-08-31 17:31:43.353699
188	2	PRD-1784768608096-R1788204720158	444.0000	0.0000	empty	2026-09-01 02:32:00.158843	2026-09-01 03:15:47.819725
186	2	PRD-1784768608096-R1788172256077	444.0000	0.0000	empty	2026-08-31 17:30:56.078294	2026-08-31 17:43:19.282683
174	2	PRD-1784768608096-R1784768608140-36	127.6600	0.0000	empty	2026-07-23 08:03:28.143265	2026-09-01 14:43:37.612717
171	2	PRD-1784768608096-R1784768608140-33	127.6600	0.0000	empty	2026-07-23 08:03:28.143265	2026-09-01 15:43:44.066147
189	2	PRD-1784768608096-R1788204724678	2323.0000	0.0000	empty	2026-09-01 02:32:04.678959	2026-09-01 03:28:19.047971
170	2	PRD-1784768608096-R1784768608140-32	127.6600	0.0000	empty	2026-07-23 08:03:28.143265	2026-09-01 02:32:37.809609
1	1	PRD-1784342075713-R1784342213117-1	5.0250	0.0000	empty	2026-07-18 09:36:53.128624	2026-09-01 04:27:36.505379
187	2	PRD-1784768608096-R1788204715159	444.0000	0.0000	empty	2026-09-01 02:31:55.160112	2026-09-01 02:33:11.707954
190	2	PRD-1784768608096-R1788211035159	222.0000	0.0000	empty	2026-09-01 04:17:15.160363	2026-09-01 04:19:44.899884
184	2	PRD-1784768608096-R1788172246861	222.0000	0.0000	empty	2026-08-31 17:30:46.86255	2026-09-01 02:38:56.529561
195	1	PRD-1784342075713-R1788244888220	135.2700	135.2700	available	2026-09-01 13:41:28.222467	2026-09-01 13:41:28.222467
185	2	PRD-1784768608096-R1788172251154	222.0000	0.0000	empty	2026-08-31 17:30:51.155347	2026-09-01 02:45:03.538132
196	1	PRD-1784342075713-R1788244888557	135.2700	135.2700	available	2026-09-01 13:41:28.558007	2026-09-01 13:41:28.558007
192	2	PRD-1784768608096-R1788211041740	444.0000	0.0000	empty	2026-09-01 04:17:21.741179	2026-09-01 04:20:20.463838
197	1	PRD-1784342075713-R1788244888883	135.2700	135.2700	available	2026-09-01 13:41:28.884094	2026-09-01 13:41:28.884094
198	1	PRD-1784342075713-R1788244889213	135.2700	135.2700	available	2026-09-01 13:41:29.214341	2026-09-01 13:41:29.214341
168	2	PRD-1784768608096-R1784768608140-30	127.6600	0.0000	empty	2026-07-23 08:03:28.143265	2026-09-02 14:41:19.830324
191	2	PRD-1784768608096-R1788211038908	333.0000	0.0000	empty	2026-09-01 04:17:18.909059	2026-09-01 12:53:22.338881
200	1	PRD-1784342075713-R1788244889562	135.2700	135.2700	available	2026-09-01 13:41:29.563046	2026-09-01 13:41:29.563046
201	1	PRD-1784342075713-R1788244889878	135.2700	135.2700	available	2026-09-01 13:41:29.879074	2026-09-01 13:41:29.879074
202	1	PRD-1784342075713-R1788244889892	135.2700	135.2700	available	2026-09-01 13:41:29.893099	2026-09-01 13:41:29.893099
203	1	PRD-1784342075713-R1788244890211	135.2700	135.2700	available	2026-09-01 13:41:30.212026	2026-09-01 13:41:30.212026
204	1	PRD-1784342075713-R1788244890226	135.2700	135.2700	available	2026-09-01 13:41:30.227157	2026-09-01 13:41:30.227157
205	1	PRD-1784342075713-R1788244890542	135.2700	135.2700	available	2026-09-01 13:41:30.542727	2026-09-01 13:41:30.542727
169	2	PRD-1784768608096-R1784768608140-31	127.6600	0.0000	empty	2026-07-23 08:03:28.143265	2026-09-02 14:41:19.836157
193	2	PRD-1784768608096-R1788211044395	555.0000	0.0000	empty	2026-09-01 04:17:24.396239	2026-09-02 14:41:19.838286
144	2	PRD-1784768608096-R1784768608140-6	127.6600	0.0000	empty	2026-07-23 08:03:28.143265	2026-09-03 11:28:40.205213
149	2	PRD-1784768608096-R1784768608140-11	127.6600	0.0000	empty	2026-07-23 08:03:28.143265	2026-09-03 11:28:40.209963
146	2	PRD-1784768608096-R1784768608140-8	127.6600	0.0000	empty	2026-07-23 08:03:28.143265	2026-09-03 11:28:44.170175
156	2	PRD-1784768608096-R1784768608140-18	127.6600	0.0000	empty	2026-07-23 08:03:28.143265	2026-09-03 11:28:44.174129
194	2	PRD-1784768608096-R1788211048532	666.0000	0.0000	empty	2026-09-01 04:17:28.532955	2026-09-03 11:28:44.175752
206	1	PRD-1784342075713-R1788244890560	135.2700	135.2700	available	2026-09-01 13:41:30.560919	2026-09-01 13:41:30.560919
207	1	PRD-1784342075713-R1788244890894	135.2700	135.2700	available	2026-09-01 13:41:30.894505	2026-09-01 13:41:30.894505
208	1	PRD-1784342075713-R1788244890906	135.2700	135.2700	available	2026-09-01 13:41:30.907151	2026-09-01 13:41:30.907151
209	1	PRD-1784342075713-R1788244891210	135.2700	135.2700	available	2026-09-01 13:41:31.21115	2026-09-01 13:41:31.21115
210	1	PRD-1784342075713-R1788244891222	135.2700	135.2700	available	2026-09-01 13:41:31.223232	2026-09-01 13:41:31.223232
211	1	PRD-1784342075713-R1788244891543	135.2700	135.2700	available	2026-09-01 13:41:31.543666	2026-09-01 13:41:31.543666
212	1	PRD-1784342075713-R1788244891558	135.2700	135.2700	available	2026-09-01 13:41:31.558565	2026-09-01 13:41:31.558565
213	1	PRD-1784342075713-R1788244891870	135.2700	135.2700	available	2026-09-01 13:41:31.870624	2026-09-01 13:41:31.870624
214	1	PRD-1784342075713-R1788244891887	135.2700	135.2700	available	2026-09-01 13:41:31.888474	2026-09-01 13:41:31.888474
215	1	PRD-1784342075713-R1788244892208	135.2700	135.2700	available	2026-09-01 13:41:32.208762	2026-09-01 13:41:32.208762
216	1	PRD-1784342075713-R1788244892227	135.2700	135.2700	available	2026-09-01 13:41:32.228132	2026-09-01 13:41:32.228132
217	1	PRD-1784342075713-R1788244892545	135.2700	135.2700	available	2026-09-01 13:41:32.546133	2026-09-01 13:41:32.546133
220	1	PRD-1784342075713-R1788244893187	135.2700	135.2700	available	2026-09-01 13:41:33.188172	2026-09-01 13:41:33.188172
221	1	PRD-1784342075713-R1788244893203	135.2700	135.2700	available	2026-09-01 13:41:33.204048	2026-09-01 13:41:33.204048
222	1	PRD-1784342075713-R1788244893524	135.2700	135.2700	available	2026-09-01 13:41:33.524524	2026-09-01 13:41:33.524524
228	1	PRD-1784342075713-R1788244894507	135.2700	135.2700	available	2026-09-01 13:41:34.508108	2026-09-01 13:41:34.508108
229	1	PRD-1784342075713-R1788244894553	135.2700	135.2700	available	2026-09-01 13:41:34.553595	2026-09-01 13:41:34.553595
230	1	PRD-1784342075713-R1788244894837	135.2700	135.2700	available	2026-09-01 13:41:34.838144	2026-09-01 13:41:34.838144
231	1	PRD-1784342075713-R1788244894881	135.2700	135.2700	available	2026-09-01 13:41:34.881619	2026-09-01 13:41:34.881619
232	1	PRD-1784342075713-R1788244895164	135.2700	135.2700	available	2026-09-01 13:41:35.164545	2026-09-01 13:41:35.164545
233	1	PRD-1784342075713-R1788244895210	135.2700	135.2700	available	2026-09-01 13:41:35.210515	2026-09-01 13:41:35.210515
234	1	PRD-1784342075713-R1788244895506	135.2700	135.2700	available	2026-09-01 13:41:35.506855	2026-09-01 13:41:35.506855
241	1	PRD-1784342075713-R1788244896505	135.2700	135.2700	available	2026-09-01 13:41:36.506279	2026-09-01 13:41:36.506279
242	1	PRD-1784342075713-R1788244896803	135.2700	135.2700	available	2026-09-01 13:41:36.803684	2026-09-01 13:41:36.803684
243	1	PRD-1784342075713-R1788244896834	135.2700	135.2700	available	2026-09-01 13:41:36.834451	2026-09-01 13:41:36.834451
244	1	PRD-1784342075713-R1788244897132	135.2700	135.2700	available	2026-09-01 13:41:37.133086	2026-09-01 13:41:37.133086
422	4	PRD-1788247764536-R1788247764568-1	177.3300	177.3300	available	2026-09-01 14:29:24.568803	2026-09-01 14:29:24.568803
423	4	PRD-1788247764536-R1788247764568-2	177.3300	177.3300	available	2026-09-01 14:29:24.568803	2026-09-01 14:29:24.568803
424	4	PRD-1788247764536-R1788247764568-3	177.3300	177.3300	available	2026-09-01 14:29:24.568803	2026-09-01 14:29:24.568803
427	4	PRD-1788247764536-R1788247764568-6	177.3300	177.3300	available	2026-09-01 14:29:24.568803	2026-09-01 14:29:24.568803
431	4	PRD-1788247764536-R1788247764568-10	177.3300	0.0000	empty	2026-09-01 14:29:24.568803	2026-09-01 14:33:33.060891
430	4	PRD-1788247764536-R1788247764568-9	177.3300	0.0000	empty	2026-09-01 14:29:24.568803	2026-09-01 14:42:34.921426
425	4	PRD-1788247764536-R1788247764568-4	177.3300	0.0000	empty	2026-09-01 14:29:24.568803	2026-09-02 13:55:04.624823
428	4	PRD-1788247764536-R1788247764568-7	177.3300	0.0000	empty	2026-09-01 14:29:24.568803	2026-09-01 14:42:34.926949
429	4	PRD-1788247764536-R1788247764568-8	177.3300	177.3300	available	2026-09-01 14:29:24.568803	2026-09-01 14:43:37.606929
758	8	PRD-1788405068330-R1788597725470	112.3300	112.3300	available	2026-09-05 15:42:05.470815	2026-09-05 15:42:05.470815
764	8	PRD-1788405068330-R1788597727376	213.7700	0.0000	empty	2026-09-05 15:42:07.376984	2026-09-05 15:54:21.181881
765	8	PRD-1788405068330-R1788597727694	333.1200	0.0000	empty	2026-09-05 15:42:07.695082	2026-09-05 15:54:21.183778
768	5	PRD-1788263535345-R1788771579709	121.3500	121.3500	available	2026-09-07 15:59:39.710193	2026-09-07 15:59:39.710193
426	4	PRD-1788247764536-R1788247764568-5	177.3300	0.0000	empty	2026-09-01 14:29:24.568803	2026-09-02 13:55:04.630482
218	1	PRD-1784342075713-R1788244892567	135.2700	135.2700	available	2026-09-01 13:41:32.56783	2026-09-01 13:41:32.56783
219	1	PRD-1784342075713-R1788244892875	135.2700	135.2700	available	2026-09-01 13:41:32.876137	2026-09-01 13:41:32.876137
223	1	PRD-1784342075713-R1788244893543	135.2700	135.2700	available	2026-09-01 13:41:33.544022	2026-09-01 13:41:33.544022
224	1	PRD-1784342075713-R1788244893862	135.2700	135.2700	available	2026-09-01 13:41:33.862665	2026-09-01 13:41:33.862665
225	1	PRD-1784342075713-R1788244893876	135.2700	135.2700	available	2026-09-01 13:41:33.877327	2026-09-01 13:41:33.877327
226	1	PRD-1784342075713-R1788244894177	135.2700	135.2700	available	2026-09-01 13:41:34.178098	2026-09-01 13:41:34.178098
227	1	PRD-1784342075713-R1788244894226	135.2700	135.2700	available	2026-09-01 13:41:34.227087	2026-09-01 13:41:34.227087
235	1	PRD-1784342075713-R1788244895542	135.2700	135.2700	available	2026-09-01 13:41:35.542995	2026-09-01 13:41:35.542995
236	1	PRD-1784342075713-R1788244895848	135.2700	135.2700	available	2026-09-01 13:41:35.848705	2026-09-01 13:41:35.848705
239	1	PRD-1784342075713-R1788244896188	135.2700	135.2700	available	2026-09-01 13:41:36.189368	2026-09-01 13:41:36.189368
240	1	PRD-1784342075713-R1788244896487	135.2700	135.2700	available	2026-09-01 13:41:36.487769	2026-09-01 13:41:36.487769
142	2	PRD-1784768608096-R1784768608140-4	127.6600	127.6600	available	2026-07-23 08:03:28.143265	2026-09-01 14:33:33.047707
759	8	PRD-1788405068330-R1788597725782	112.3300	112.3300	available	2026-09-05 15:42:05.783088	2026-09-05 15:42:05.783088
760	8	PRD-1788405068330-R1788597726102	112.3300	0.0000	empty	2026-09-05 15:42:06.102756	2026-09-07 15:16:30.704895
769	11	PRD-1788771748706-R1788771748735-1	122.4400	122.4400	available	2026-09-07 16:02:28.736601	2026-09-07 16:02:28.736601
770	11	PRD-1788771748706-R1788771748735-2	122.4400	122.4400	available	2026-09-07 16:02:28.736601	2026-09-07 16:02:28.736601
771	11	PRD-1788771748706-R1788771748735-3	122.4400	122.4400	available	2026-09-07 16:02:28.736601	2026-09-07 16:02:28.736601
772	11	PRD-1788771748706-R1788771748735-4	122.4400	122.4400	available	2026-09-07 16:02:28.736601	2026-09-07 16:02:28.736601
773	11	PRD-1788771748706-R1788771748735-5	122.4400	122.4400	available	2026-09-07 16:02:28.736601	2026-09-07 16:02:28.736601
774	11	PRD-1788771748706-R1788771748735-6	122.4400	122.4400	available	2026-09-07 16:02:28.736601	2026-09-07 16:02:28.736601
775	11	PRD-1788771748706-R1788771748735-7	122.4400	122.4400	available	2026-09-07 16:02:28.736601	2026-09-07 16:02:28.736601
519	5	PRD-1788263535345-R1788263535377-86	5.0060	0.0000	empty	2026-09-01 18:52:15.398933	2026-09-03 11:06:54.441133
520	5	PRD-1788263535345-R1788263535377-87	5.0060	0.0000	empty	2026-09-01 18:52:15.398933	2026-09-03 11:06:54.443357
237	1	PRD-1784342075713-R1788244895866	135.2700	135.2700	available	2026-09-01 13:41:35.867314	2026-09-01 13:41:35.867314
238	1	PRD-1784342075713-R1788244896163	135.2700	135.2700	available	2026-09-01 13:41:36.163527	2026-09-01 13:41:36.163527
245	3	PRD-1788247576942-R1788247577085-1	20.0370	20.0370	available	2026-09-01 14:26:17.099227	2026-09-01 14:26:17.099227
246	3	PRD-1788247576942-R1788247577085-2	20.0370	20.0370	available	2026-09-01 14:26:17.099227	2026-09-01 14:26:17.099227
247	3	PRD-1788247576942-R1788247577085-3	20.0370	20.0370	available	2026-09-01 14:26:17.099227	2026-09-01 14:26:17.099227
248	3	PRD-1788247576942-R1788247577085-4	20.0370	20.0370	available	2026-09-01 14:26:17.099227	2026-09-01 14:26:17.099227
249	3	PRD-1788247576942-R1788247577085-5	20.0370	20.0370	available	2026-09-01 14:26:17.099227	2026-09-01 14:26:17.099227
250	3	PRD-1788247576942-R1788247577085-6	20.0370	20.0370	available	2026-09-01 14:26:17.099227	2026-09-01 14:26:17.099227
251	3	PRD-1788247576942-R1788247577085-7	20.0370	20.0370	available	2026-09-01 14:26:17.099227	2026-09-01 14:26:17.099227
252	3	PRD-1788247576942-R1788247577085-8	20.0370	20.0370	available	2026-09-01 14:26:17.099227	2026-09-01 14:26:17.099227
253	3	PRD-1788247576942-R1788247577085-9	20.0370	20.0370	available	2026-09-01 14:26:17.099227	2026-09-01 14:26:17.099227
254	3	PRD-1788247576942-R1788247577085-10	20.0370	20.0370	available	2026-09-01 14:26:17.099227	2026-09-01 14:26:17.099227
255	3	PRD-1788247576942-R1788247577085-11	20.0370	20.0370	available	2026-09-01 14:26:17.099227	2026-09-01 14:26:17.099227
256	3	PRD-1788247576942-R1788247577085-12	20.0370	20.0370	available	2026-09-01 14:26:17.099227	2026-09-01 14:26:17.099227
257	3	PRD-1788247576942-R1788247577085-13	20.0370	20.0370	available	2026-09-01 14:26:17.099227	2026-09-01 14:26:17.099227
258	3	PRD-1788247576942-R1788247577085-14	20.0370	20.0370	available	2026-09-01 14:26:17.099227	2026-09-01 14:26:17.099227
259	3	PRD-1788247576942-R1788247577085-15	20.0370	20.0370	available	2026-09-01 14:26:17.099227	2026-09-01 14:26:17.099227
260	3	PRD-1788247576942-R1788247577085-16	20.0370	20.0370	available	2026-09-01 14:26:17.099227	2026-09-01 14:26:17.099227
261	3	PRD-1788247576942-R1788247577085-17	20.0370	20.0370	available	2026-09-01 14:26:17.099227	2026-09-01 14:26:17.099227
262	3	PRD-1788247576942-R1788247577085-18	20.0370	20.0370	available	2026-09-01 14:26:17.099227	2026-09-01 14:26:17.099227
761	8	PRD-1788405068330-R1788597726416	213.7700	213.7700	available	2026-09-05 15:42:06.417114	2026-09-05 15:42:06.417114
432	2	PRD-1784768608096-R1788263238158	200.0000	200.0000	available	2026-09-01 18:47:18.159285	2026-09-01 18:47:18.159285
433	2	PRD-1784768608096-R1788263238497	200.0000	200.0000	available	2026-09-01 18:47:18.498405	2026-09-01 18:47:18.498405
763	8	PRD-1788405068330-R1788597727061	213.7700	0.0000	empty	2026-09-05 15:42:07.062234	2026-09-05 15:54:21.180437
762	8	PRD-1788405068330-R1788597726746	213.7700	0.0000	empty	2026-09-05 15:42:06.746867	2026-09-07 15:16:30.70262
263	3	PRD-1788247576942-R1788247577085-19	20.0370	0.0000	empty	2026-09-01 14:26:17.099227	2026-09-02 12:12:38.483089
525	5	PRD-1788263535345-R1788263535377-92	5.0060	0.0000	empty	2026-09-01 18:52:15.398933	2026-09-03 11:06:54.445441
757	8	PRD-1788405068330-R1788597725148	112.3300	0.0000	empty	2026-09-05 15:42:05.149191	2026-09-07 14:48:12.780666
766	5	PRD-1788263535345-R1788771132187	110.3500	110.3500	available	2026-09-07 15:52:12.188273	2026-09-07 15:52:12.188273
709	6	PRD-1788263679802-R1788263750453-1	127.0000	127.0000	available	2026-09-01 18:55:50.454105	2026-09-01 18:55:50.454105
710	6	PRD-1788263679802-R1788263750453-2	127.0000	127.0000	available	2026-09-01 18:55:50.454105	2026-09-01 18:55:50.454105
711	6	PRD-1788263679802-R1788263750453-3	127.0000	127.0000	available	2026-09-01 18:55:50.454105	2026-09-01 18:55:50.454105
712	6	PRD-1788263679802-R1788263750453-4	127.0000	127.0000	available	2026-09-01 18:55:50.454105	2026-09-01 18:55:50.454105
713	6	PRD-1788263679802-R1788263750453-5	127.0000	127.0000	available	2026-09-01 18:55:50.454105	2026-09-01 18:55:50.454105
714	6	PRD-1788263679802-R1788263750453-6	127.0000	127.0000	available	2026-09-01 18:55:50.454105	2026-09-01 18:55:50.454105
715	6	PRD-1788263679802-R1788263750453-7	127.0000	127.0000	available	2026-09-01 18:55:50.454105	2026-09-01 18:55:50.454105
716	6	PRD-1788263679802-R1788263750453-8	127.0000	127.0000	available	2026-09-01 18:55:50.454105	2026-09-01 18:55:50.454105
717	6	PRD-1788263679802-R1788263750453-9	127.0000	127.0000	available	2026-09-01 18:55:50.454105	2026-09-01 18:55:50.454105
718	6	PRD-1788263679802-R1788263750453-10	127.0000	127.0000	available	2026-09-01 18:55:50.454105	2026-09-01 18:55:50.454105
723	3	PRD-1788247576942-R1788293112075-2	285.3300	285.3300	available	2026-09-02 03:05:12.075963	2026-09-02 03:05:12.075963
724	3	PRD-1788247576942-R1788293112076-3	122.4400	122.4400	available	2026-09-02 03:05:12.076792	2026-09-02 03:05:12.076792
725	3	PRD-1788247576942-R1788293112077-4	211.1400	211.1400	available	2026-09-02 03:05:12.077581	2026-09-02 03:05:12.077581
720	7	PRD-1788263843812-R1788267366506	255.2200	0.0000	empty	2026-09-01 19:56:06.507954	2026-09-02 12:11:56.22383
719	7	PRD-1788263843812-R1788266365752	127.5500	0.0000	empty	2026-09-01 19:39:25.753443	2026-09-02 12:11:56.238874
721	3	PRD-1788247576942-R1788293112071-0	114.5500	0.0000	empty	2026-09-02 03:05:12.072025	2026-09-02 12:12:38.465346
264	3	PRD-1788247576942-R1788247577085-20	20.0370	0.0000	empty	2026-09-01 14:26:17.099227	2026-09-02 12:12:38.469812
722	3	PRD-1788247576942-R1788293112074-1	130.2500	0.0000	empty	2026-09-02 03:05:12.07504	2026-09-02 12:12:38.486158
726	6	PRD-1788263679802-R1788329777641	120.0000	120.0000	available	2026-09-02 13:16:17.64382	2026-09-02 13:16:17.64382
727	6	PRD-1788263679802-R1788329777984	120.0000	120.0000	available	2026-09-02 13:16:17.985594	2026-09-02 13:16:17.985594
728	6	PRD-1788263679802-R1788329778309	120.0000	120.0000	available	2026-09-02 13:16:18.310299	2026-09-02 13:16:18.310299
729	6	PRD-1788263679802-R1788329778646	120.0000	120.0000	available	2026-09-02 13:16:18.64731	2026-09-02 13:16:18.64731
730	6	PRD-1788263679802-R1788329778979	120.0000	120.0000	available	2026-09-02 13:16:18.980264	2026-09-02 13:16:18.980264
731	6	PRD-1788263679802-R1788329779324	120.0000	120.0000	available	2026-09-02 13:16:19.324652	2026-09-02 13:16:19.324652
738	8	PRD-1788405068330-R1788405068379-4	145.4175	0.0000	empty	2026-09-03 10:11:08.380752	2026-09-03 11:38:15.597916
737	8	PRD-1788405068330-R1788405068379-3	145.4175	0.0000	empty	2026-09-03 10:11:08.380752	2026-09-03 11:38:15.599241
744	9	PRD-1788405518638-R1788405518684-1	149.5867	149.5867	available	2026-09-03 10:18:38.685694	2026-09-03 10:18:38.685694
514	5	PRD-1788263535345-R1788263535377-81	5.0060	0.0000	empty	2026-09-01 18:52:15.398933	2026-09-03 11:06:54.426049
742	8	PRD-1788405068330-R1788405423742	111.5000	0.0000	empty	2026-09-03 10:17:03.743468	2026-09-03 11:27:10.145244
743	8	PRD-1788405068330-R1788405423994	115.4400	0.0000	empty	2026-09-03 10:17:03.995175	2026-09-03 11:27:10.146774
749	10	PRD-1788405896004-R1788405896049-3	125.3300	0.0000	empty	2026-09-03 10:24:56.050539	2026-09-03 11:28:34.303144
747	10	PRD-1788405896004-R1788405896049-1	113.5500	0.0000	empty	2026-09-03 10:24:56.050539	2026-09-03 11:28:34.306838
732	6	PRD-1788263679802-R1788329779672	120.0000	0.0000	empty	2026-09-02 13:16:19.673231	2026-09-03 11:28:48.300065
733	6	PRD-1788263679802-R1788329780009	120.0000	-120.0000	empty	2026-09-02 13:16:20.009533	2026-09-03 11:28:48.301786
734	6	PRD-1788263679802-R1788329780364	120.0000	-120.0000	empty	2026-09-02 13:16:20.365313	2026-09-03 11:28:48.303692
736	8	PRD-1788405068330-R1788405068379-2	145.4175	0.0000	empty	2026-09-03 10:11:08.380752	2026-09-03 11:38:15.600762
735	8	PRD-1788405068330-R1788405068379-1	145.4175	0.0000	empty	2026-09-03 10:11:08.380752	2026-09-03 11:38:15.602059
741	8	PRD-1788405068330-R1788405423416	133.4400	0.0000	empty	2026-09-03 10:17:03.417061	2026-09-03 11:38:44.955668
746	9	PRD-1788405518638-R1788405518685-3	149.5867	0.0000	empty	2026-09-03 10:18:38.685694	2026-09-03 11:44:44.26879
750	10	PRD-1788405896004-R1788405896049-4	118.6600	0.0000	empty	2026-09-03 10:24:56.050539	2026-09-07 15:33:37.268977
740	8	PRD-1788405068330-R1788405423102	214.5500	0.0000	empty	2026-09-03 10:17:03.103175	2026-09-03 13:36:54.403164
739	8	PRD-1788405068330-R1788405422777	124.2200	0.0000	empty	2026-09-03 10:17:02.778865	2026-09-04 01:43:19.733904
745	9	PRD-1788405518638-R1788405518684-2	149.5867	0.0000	empty	2026-09-03 10:18:38.685694	2026-09-04 02:57:03.01922
748	10	PRD-1788405896004-R1788405896049-2	217.9900	0.0000	empty	2026-09-03 10:24:56.050539	2026-09-07 15:48:43.776933
767	5	PRD-1788263535345-R1788771169786	110.5000	110.5000	available	2026-09-07 15:52:49.786921	2026-09-07 15:52:49.786921
751	10	PRD-1788405896004-R1788405896049-5	124.3300	0.0000	empty	2026-09-03 10:24:56.050539	2026-09-09 10:07:12.896319
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, category_id, lot_number, rack_location, price_per_meter, price_per_roll, roll_stock, meter_stock, min_stock, created_at, updated_at, barcode, primary_unit, secondary_unit, image_url, description, cost_price_per_meter, cost_price_per_roll) FROM stdin;
9	PINK BW	4			23000.00	23000.00	1.0000	149.5866	117.2200	2026-09-03 10:18:38.680823	2026-09-04 02:57:03.018668	PRD-1788405518638	YARD	ROLL	\N	\N	12000.00	12000.00
8	HIJAU	7			20000.00	20000.00	3.0000	438.4300	114.5500	2026-09-03 10:11:08.372058	2026-09-07 15:16:30.704418	PRD-1788405068330	YARD	ROLL	\N	\N	15000.00	15000.00
2	ROSE GOLD	1			14000.00	1787240.00	22.0000	2953.2000	127.6600	2026-07-23 08:03:28.124278	2026-09-03 11:28:44.175328	PRD-1784768608096	METER	YARD	/api/uploads/products/product-1784768453923-njzg5bhx1u.jpg	\N	12500.00	1595750.00
3	RAYON MOTIF	2			14000.00	14000.00	21.0000	979.5760	177.3300	2026-09-01 14:26:17.080951	2026-09-02 12:12:38.485461	PRD-1788247576942	YARD	ROLL	\N	\N	12000.00	12000.00
6	RED BW	1			18000.00	18000.00	14.0000	1750.0000	200.0000	2026-09-01 18:54:39.83013	2026-09-03 11:28:48.303228	PRD-1788263679802	YARD	ROLL	\N	\N	12000.00	12000.00
1	SLATE GREY	1			18000.00	15000.00	50.0000	6763.5000	138.7000	2026-07-18 09:34:35.762395	2026-09-01 04:27:36.504966	PRD-1784342075713	METER	YARD	/uploads/products/product-1784342037003-7kp6ffpj0ca.webp	\N	13500.00	13500.00
5	GREEN NEON	6			13000.00	13000.00	3.0000	342.2000	275.3300	2026-09-01 18:52:15.372822	2026-09-05 08:39:46.222	PRD-1788263535345	YARD	ROLL	\N	\N	8000.00	8000.00
11	YYWL222	6			15000.00	15000.00	7.0000	857.0800	0.0000	2026-09-07 16:02:28.731875	2026-09-07 16:02:28.731875	PRD-1788771748706	YARD	ROLL	\N	\N	13500.00	13500.00
7	MARON BW	5			22000.00	22000.00	0.0000	0.0000	215.3300	2026-09-01 18:57:23.953976	2026-09-07 09:06:23.503	PRD-1788263843812	YARD	ROLL	\N	\N	12000.00	12000.00
10	COKLAT	3			20000.00	20000.00	0.0000	0.0000	113.5500	2026-09-03 10:24:56.045739	2026-09-09 10:07:12.062783	PRD-1788405896004	YARD	ROLL	\N	\N	14000.00	14000.00
4	SCUBA BW	2			13000.00	13000.00	5.0000	886.6500	177.3300	2026-09-01 14:29:24.563948	2026-09-02 13:55:04.629778	PRD-1788247764536	YARD	ROLL	\N	\N	11250.00	11250.00
\.


--
-- Data for Name: purchase_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_items (id, purchase_id, product_id, rolls, meters, price_per_meter, subtotal, roll_id) FROM stdin;
1	1	2	10.0000	10000.0000	14000.00	140000000.00	\N
2	2	5	50.0000	5000.0000	9500.00	47500000.00	\N
3	3	6	10.0000	2000.0000	18000.00	36000000.00	\N
4	4	7	30.0000	2000.0000	22000.00	44000000.00	\N
5	5	3	5.0000	863.7100	14000.00	12091940.00	721
\.


--
-- Data for Name: purchases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchases (id, invoice_number, supplier_id, payment_type, total_amount, paid_amount, status, due_date, notes, created_at, updated_at) FROM stdin;
1	PO-1788263181978	1	kredit	140000000.00	0.00	tempo	2026-09-10 00:00:00	\N	2026-09-01 18:46:22.009454	2026-09-01 18:46:22.009454
2	PO-1788263592720	1	kredit	47500000.00	0.00	tempo	2026-09-10 00:00:00	\N	2026-09-01 18:53:12.750291	2026-09-01 18:53:12.750291
3	PO-1788263710879	1	kredit	36000000.00	0.00	tempo	2026-09-10 00:00:00	\N	2026-09-01 18:55:10.911827	2026-09-01 18:55:10.911827
4	PO-1788265092680	1	kredit	44000000.00	0.00	tempo	2026-09-27 00:00:00	\N	2026-09-01 19:18:12.711344	2026-09-01 19:18:12.711344
5	PO-1788293112031	1	kredit	12091940.00	0.00	tempo	2026-09-17 00:00:00	\N	2026-09-02 03:05:12.062648	2026-09-02 03:05:12.062648
\.


--
-- Data for Name: push_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.push_subscriptions (id, user_id, endpoint, p256dh, auth, created_at) FROM stdin;
1	1	https://fcm.googleapis.com/fcm/send/fd-6yzTunr8:APA91bGzbE0C7HJmez5EbHNDtP7MZICVV5B2OABajTcULNigaODN_oG1ANHSZtkVvIiE1kfBuSY7UKcTAhyA6Bvbwfd9IGeE_0BJB4Wdj6XhaB8qIKgT7N34Qut0VxeI9tQ1Js1TQLKg	BIup6tSo_XNv4MJGFLhY4Z_g0mnp3rmbgZL2rn6d5uCyaT20owdp2EaAgW5TbBcorKJF0Y-jX_mB0skyvw8R42o	J_HMsZ23EpunjejGXdIuzg	2026-09-01 12:24:01.562149
2	1	https://fcm.googleapis.com/fcm/send/dXDFu9fvNbQ:APA91bHjwY9Gx7l9_SgbVp7hZczVBTVhiWyUYDBvQO0swlQO_o6L4r3t7rac-lzVB-Zz7yWqfXyD_ZJI0uupDgx6GankeOOiMFALSO9DVtaabtwjHJI-54p5PsWanAZK2EWQeJiwfpq3	BIA36UjqPxYnFK_JkpDrT3ogKBTkRamCFvarWBuZFvBibkJk_cMlKaLfbrSxKnvfd46xoDOq0QR1IntITLeNb_4	OiDlgvmTOhpm8f8oFH3wKw	2026-09-01 12:26:55.66381
\.


--
-- Data for Name: receivables; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.receivables (id, sale_id, customer_id, total_amount, paid_amount, status, due_date, created_at, updated_at) FROM stdin;
3	17	\N	4428760.00	4428760.00	lunas	\N	2026-09-01 03:15:47.820806	2026-08-31 20:16:29.666
2	14	\N	1320760.00	1320760.00	lunas	\N	2026-09-01 02:45:03.53913	2026-08-31 20:42:14.403
1	15	\N	1320760.00	1320761.32	lunas	\N	2026-09-01 02:38:56.530712	2026-08-31 21:18:14.077
4	33	\N	2231640.00	0.00	unpaid	\N	2026-09-01 04:27:36.506539	2026-09-01 04:27:36.506539
5	34	\N	2874760.00	0.00	unpaid	\N	2026-09-01 12:53:22.340542	2026-09-01 12:53:22.340542
12	53	\N	11633400.00	633400.00	partial	\N	2026-09-04 01:55:07.837073	2026-09-04 01:55:07.837073
13	58	1	2484400.00	484400.00	partial	\N	2026-09-04 01:55:07.837073	2026-09-04 01:55:07.837073
9	56	1	3440494.10	1440494.00	partial	\N	2026-09-04 01:55:07.837073	2026-09-03 18:55:57.046
10	55	\N	2668800.00	1668800.00	partial	\N	2026-09-04 01:55:07.837073	2026-09-03 19:12:51.828
11	54	1	4538800.00	3038800.00	partial	\N	2026-09-04 01:55:07.837073	2026-09-03 19:15:19.299
6	35	\N	518050.00	518050.00	lunas	\N	2026-09-01 14:33:33.062657	2026-09-03 19:16:35.744
14	59	1	3440494.10	440494.00	partial	\N	2026-09-04 02:28:35.931668	2026-09-04 02:57:03.020754
15	60	1	15213200.00	213200.00	partial	\N	2026-09-05 15:54:21.185342	2026-09-05 15:54:21.185342
16	61	1	2246600.00	1000000.00	partial	2026-09-15 00:00:00	2026-09-07 14:48:12.781902	2026-09-07 14:48:12.781902
17	62	1	6522000.00	522000.00	partial	\N	2026-09-07 15:16:30.705802	2026-09-07 15:16:30.705802
19	64	\N	2373200.00	0.00	unpaid	2026-09-10 00:00:00	2026-09-07 15:33:03.372966	2026-09-07 15:33:37.270229
21	67	1	4359800.00	1000000.00	partial	\N	2026-09-07 15:48:43.779917	2026-09-07 15:48:43.779917
18	63	1	2486600.00	1486600.00	partial	\N	2026-09-07 15:26:04.782762	2026-09-09 10:07:12.904236
\.


--
-- Data for Name: return_exchanged_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.return_exchanged_items (id, return_id, product_id, roll_id, rolls, meters, price_per_meter, subtotal) FROM stdin;
1	1	2	169	1.0000	127.6600	14000.00	1787240.00
2	2	1	2	1.0000	5.0250	18000.00	90450.00
3	3	1	2	1.0000	5.0250	18000.00	90450.00
4	4	2	186	1.0000	444.0000	14000.00	6216000.00
5	5	1	4	1.0000	5.0250	18000.00	90450.00
6	6	2	187	1.0000	444.0000	14000.00	6216000.00
7	7	2	184	1.0000	222.0000	14000.00	3108000.00
8	8	2	185	1.0000	222.0000	14000.00	3108000.00
9	9	2	188	1.0000	444.0000	14000.00	6216000.00
10	10	2	189	1.0000	2323.0000	14000.00	32522000.00
11	11	2	190	1.0000	222.0000	14000.00	3108000.00
12	12	2	192	1.0000	444.0000	14000.00	6216000.00
13	13	1	1	1.0000	382.9800	18000.00	6893640.00
14	14	2	191	1.0000	333.0000	14000.00	4662000.00
15	15	4	431	1.0000	177.3300	13000.00	2305290.00
16	16	2	174	1.0000	127.6600	14000.00	1787240.00
17	17	2	171	1.0000	127.6600	14000.00	1787240.00
\.


--
-- Data for Name: return_returned_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.return_returned_items (id, return_id, product_id, roll_id, rolls, meters, price_per_meter, subtotal) FROM stdin;
1	1	1	\N	1.0000	5.0250	18000.00	90450.00
2	2	2	163	1.0000	127.6600	14000.00	1787240.00
3	3	2	186	1.0000	444.0000	14000.00	6216000.00
4	4	1	4	1.0000	5.0250	18000.00	90450.00
5	5	2	185	1.0000	222.0000	14000.00	3108000.00
6	6	2	185	1.0000	222.0000	14000.00	3108000.00
7	7	2	174	1.0000	127.6600	14000.00	1787240.00
8	8	2	171	1.0000	127.6600	14000.00	1787240.00
9	9	2	142	1.0000	127.6600	14000.00	1787240.00
10	10	2	174	1.0000	127.6600	14000.00	1787240.00
11	11	1	1	1.0000	382.9800	14000.00	5361720.00
12	12	1	1	1.0000	382.9800	14000.00	5361720.00
13	13	2	191	1.0000	333.0000	14000.00	4662000.00
14	14	2	171	1.0000	127.6600	14000.00	1787240.00
15	15	2	142	1.0000	127.6600	14000.00	1787240.00
16	16	4	429	1.0000	177.3300	13000.00	2305290.00
17	17	2	194	1.0000	666.0000	14000.00	9324000.00
\.


--
-- Data for Name: returns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.returns (id, return_number, type, sale_id, purchase_id, customer_id, supplier_id, total_returned_value, total_exchanged_value, difference_amount, payment_status, cash_refunded, status, notes, created_at, updated_at) FROM stdin;
1	RET-1788165597467	penjualan	1	\N	\N	\N	90450.00	1787240.00	1696790.00	lunas	0.00	selesai	\N	2026-08-31 15:39:57.470444	2026-08-31 15:39:57.470444
2	RET-1788171969829	penjualan	13	\N	\N	\N	1787240.00	90450.00	-1696790.00	lunas	1696790.00	selesai	\N	2026-08-31 17:26:09.830578	2026-08-31 17:26:09.830578
3	RET-1788172303338	penjualan	14	\N	\N	\N	6216000.00	90450.00	-6125550.00	lunas	6125550.00	selesai	\N	2026-08-31 17:31:43.339177	2026-08-31 17:31:43.339177
4	RET-1788172999269	penjualan	12	\N	\N	\N	90450.00	6216000.00	6125550.00	lunas	0.00	selesai	\N	2026-08-31 17:43:19.27018	2026-08-31 17:43:19.27018
5	RET-1788204651476	penjualan	15	\N	\N	\N	3108000.00	90450.00	-3017550.00	lunas	3017550.00	selesai	\N	2026-09-01 02:30:51.478555	2026-09-01 02:30:51.478555
7	RET-1788205136481	penjualan	15	\N	\N	\N	1787240.00	3108000.00	1320760.00	tempo	0.00	selesai	\N	2026-09-01 02:38:56.512519	2026-09-01 02:38:56.512519
8	RET-1788205503483	penjualan	14	\N	\N	\N	1787240.00	3108000.00	1320760.00	tempo	0.00	selesai	\N	2026-09-01 02:45:03.511104	2026-09-01 02:45:03.511104
9	RET-1788207347799	penjualan	17	\N	\N	\N	1787240.00	6216000.00	4428760.00	tempo	0.00	selesai	\N	2026-09-01 03:15:47.800569	2026-09-01 03:15:47.800569
10	RET-1788208098900	penjualan	18	\N	\N	\N	1787240.00	32522000.00	30734760.00	lunas	0.00	selesai	\N	2026-09-01 03:28:19.033287	2026-09-01 03:28:19.033287
6	RET-1788204791643	penjualan	16	\N	\N	\N	3108000.00	6216000.00	3108000.00	lunas	0.00	selesai	\N	2026-09-01 02:33:11.695026	2026-09-01 02:33:11.695026
11	RET-1788211184846	penjualan	27	\N	\N	\N	5361720.00	3108000.00	-2253720.00	lunas	2253720.00	selesai	\N	2026-09-01 04:19:44.883782	2026-09-01 04:19:44.883782
12	RET-1788211220318	penjualan	26	\N	\N	\N	5361720.00	6216000.00	854280.00	lunas	0.00	selesai	\N	2026-09-01 04:20:20.451714	2026-09-01 04:20:20.451714
13	RET-1788211656483	penjualan	33	\N	\N	\N	4662000.00	6893640.00	2231640.00	tempo	0.00	selesai	\N	2026-09-01 04:27:36.484262	2026-09-01 04:27:36.484262
14	RET-1788242002316	penjualan	34	\N	\N	\N	1787240.00	4662000.00	2874760.00	tempo	0.00	selesai	Tukar barang dari POS	2026-09-01 12:53:22.317864	2026-09-01 12:53:22.317864
15	RET-1788248012984	penjualan	35	\N	\N	\N	1787240.00	2305290.00	518050.00	tempo	0.00	selesai	Tukar barang dari POS	2026-09-01 14:33:33.027219	2026-09-01 14:33:33.027219
16	RET-1788248617552	penjualan	36	\N	\N	\N	2305290.00	1787240.00	-518050.00	lunas	518050.00	selesai	Tukar barang dari POS	2026-09-01 14:43:37.585755	2026-09-01 14:43:37.585755
17	RET-1788252224016	penjualan	39	\N	\N	\N	9324000.00	1787240.00	-7536760.00	lunas	7536760.00	selesai	Tukar barang dari POS	2026-09-01 15:43:44.051421	2026-09-01 15:43:44.051421
\.


--
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale_items (id, sale_id, product_id, rolls, meters, price_per_meter, subtotal, roll_id) FROM stdin;
1	1	2	3.0000	382.9800	14000.00	5361720.00	\N
2	1	1	1.0000	5.0250	18000.00	90450.00	\N
3	12	2	1.0000	127.6600	14000.00	1787240.00	177
4	12	2	1.0000	127.6600	14000.00	1787240.00	178
5	12	2	1.0000	132.0000	14000.00	1848000.00	179
6	12	2	1.0000	786.0000	14000.00	11004000.00	180
7	12	2	1.0000	453.0000	14000.00	6342000.00	181
8	12	2	1.0000	127.6600	14000.00	1787240.00	172
9	12	2	1.0000	127.6600	14000.00	1787240.00	173
10	12	2	1.0000	2345.0000	14000.00	32830000.00	182
11	12	1	1.0000	5.0250	18000.00	90450.00	4
12	12	1	1.0000	5.0250	18000.00	90450.00	3
13	13	1	1.0000	5.0250	18000.00	90450.00	5
14	13	2	1.0000	127.6600	14000.00	1787240.00	176
15	13	2	1.0000	127.6600	14000.00	1787240.00	175
16	13	2	1.0000	127.6600	14000.00	1787240.00	163
17	13	2	1.0000	127.6600	14000.00	1787240.00	164
18	14	2	1.0000	222.0000	14000.00	3108000.00	183
19	14	2	1.0000	444.0000	14000.00	6216000.00	186
20	14	2	1.0000	127.6600	14000.00	1787240.00	171
21	15	2	1.0000	222.0000	14000.00	3108000.00	185
22	15	2	1.0000	127.6600	14000.00	1787240.00	174
23	16	2	1.0000	222.0000	14000.00	3108000.00	185
24	16	2	1.0000	127.6600	14000.00	1787240.00	170
25	17	2	1.0000	127.6600	14000.00	1787240.00	142
26	18	2	1.0000	127.6600	14000.00	1787240.00	174
27	26	1	1.0000	382.9800	14000.00	5361720.00	1
28	27	1	1.0000	382.9800	14000.00	5361720.00	1
29	33	2	1.0000	333.0000	14000.00	4662000.00	191
30	34	2	1.0000	127.6600	14000.00	1787240.00	171
31	35	2	1.0000	127.6600	14000.00	1787240.00	142
32	36	4	1.0000	177.3300	13000.00	2305290.00	430
33	36	4	1.0000	177.3300	13000.00	2305290.00	429
34	36	4	1.0000	177.3300	13000.00	2305290.00	428
35	39	2	1.0000	666.0000	14000.00	9324000.00	194
36	40	7	1.0000	255.2200	22000.00	5614840.00	720
37	40	7	1.0000	127.5500	22000.00	2806100.00	719
38	41	3	1.0000	114.5500	14000.00	1603700.00	721
39	41	3	1.0000	20.0370	14000.00	280518.00	264
40	41	3	1.0000	20.0370	14000.00	280518.00	263
41	41	3	1.0000	130.2500	14000.00	1823500.00	722
42	45	4	1.0000	177.3300	13000.00	2305290.00	425
43	45	4	1.0000	177.3300	13000.00	2305290.00	426
44	46	6	1.0000	120.0000	18000.00	2160000.00	732
45	46	6	1.0000	120.0000	18000.00	2160000.00	733
46	46	6	1.0000	120.0000	18000.00	2160000.00	734
47	47	6	1.0000	120.0000	18000.00	2160000.00	734
48	47	6	1.0000	120.0000	18000.00	2160000.00	733
49	48	2	1.0000	127.6600	14000.00	1787240.00	168
50	48	2	1.0000	127.6600	14000.00	1787240.00	169
51	48	2	1.0000	555.0000	14000.00	7770000.00	193
52	49	2	1.0000	127.6600	14000.00	1787240.00	146
53	49	2	1.0000	127.6600	14000.00	1787240.00	156
54	49	2	1.0000	666.0000	14000.00	9324000.00	194
57	50	2	1.0000	127.6600	14000.00	1787240.00	144
58	50	2	1.0000	127.6600	14000.00	1787240.00	149
65	52	5	1.0000	5.0060	13000.00	65078.00	514
66	52	5	1.0000	5.0060	13000.00	65078.00	519
67	52	5	1.0000	5.0060	13000.00	65078.00	520
68	52	5	1.0000	5.0060	13000.00	65078.00	525
69	51	10	1.0000	125.3300	20000.00	2506600.00	749
70	51	10	1.0000	113.5500	20000.00	2271000.00	747
89	54	8	1.0000	111.5000	20000.00	2230000.00	742
90	54	8	1.0000	115.4400	20000.00	2308800.00	743
95	53	8	1.0000	145.4175	20000.00	2908350.00	738
96	53	8	1.0000	145.4175	20000.00	2908350.00	737
97	53	8	1.0000	145.4175	20000.00	2908350.00	736
98	53	8	1.0000	145.4175	20000.00	2908350.00	735
99	55	8	1.0000	133.4400	20000.00	2668800.00	741
100	56	9	1.0000	149.5867	23000.00	3440494.10	746
102	57	8	1.0000	214.5500	20000.00	4291000.00	740
103	58	8	1.0000	124.2200	20000.00	2484400.00	739
106	59	9	1.0000	149.5867	23000.00	3440494.10	745
116	60	8	1.0000	213.7700	20000.00	4275400.00	763
117	60	8	1.0000	213.7700	20000.00	4275400.00	764
118	60	8	1.0000	333.1200	20000.00	6662400.00	765
120	61	8	1.0000	112.3300	20000.00	2246600.00	757
121	62	8	1.0000	213.7700	20000.00	4275400.00	762
122	62	8	1.0000	112.3300	20000.00	2246600.00	760
125	64	10	1.0000	118.6600	20000.00	2373200.00	750
126	65	10	1.0000	217.9900	20000.00	4359800.00	748
128	66	10	1.0000	217.9900	20000.00	4359800.00	748
129	67	10	1.0000	217.9900	20000.00	4359800.00	748
131	63	10	1.0000	124.3300	20000.00	2486600.00	751
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales (id, invoice_number, customer_id, payment_type, total_amount, paid_amount, status, due_date, notes, created_at, updated_at) FROM stdin;
1	INV/20260723/8859	\N	qris	5452170.00	5452170.00	lunas	\N	\N	2026-07-23 08:24:17.334427	2026-07-23 08:24:17.334427
12	INV/20260831/3283	\N	qris	59353860.00	59353860.00	lunas	\N	\N	2026-08-31 17:16:33.458805	2026-08-31 17:16:33.458805
13	INV/20260831/8524	\N	transfer	7239410.00	7239410.00	lunas	\N	\N	2026-08-31 17:25:31.334863	2026-08-31 17:25:31.334863
16	INV/20260901/5435	\N	qris	4895240.00	4895240.00	lunas	\N	\N	2026-09-01 02:32:37.791911	2026-09-01 02:32:37.791911
17	INV/20260901/6613	\N	qris	1787240.00	6216000.00	lunas	\N	\N	2026-09-01 03:14:52.941426	2026-09-01 03:16:29.667526
18	INV/20260901/5227	\N	tunai	1787240.00	1787240.00	lunas	\N	\N	2026-09-01 03:17:39.625097	2026-09-01 03:17:39.625097
14	INV/20260831/8471	\N	tunai	11111240.00	12432000.00	lunas	\N	\N	2026-08-31 17:31:26.686896	2026-09-01 03:42:14.405776
25	INV-1788210638162	\N	qris	5361720.00	5361720.00	lunas	\N	\N	2026-09-01 04:10:38.196088	2026-09-01 04:10:38.196088
26	INV-1788210657065	\N	qris	5361720.00	5361720.00	lunas	\N	\N	2026-09-01 04:10:57.102228	2026-09-01 04:10:57.102228
27	INV-1788210674415	\N	qris	5361720.00	5361720.00	lunas	\N	\N	2026-09-01 04:11:14.451744	2026-09-01 04:11:14.451744
49	INV/20260903/0004	1	tunai	12898480.00	12898480.00	lunas	\N	\N	2026-09-02 14:47:49.724298	2026-09-03 11:28:44.167535
15	INV/20260901/4107	\N	qris	4895240.00	6216001.32	lunas	\N	\N	2026-09-01 02:30:35.541267	2026-09-01 04:18:14.079243
33	INV/20260901/4323	\N	qris	4662000.00	4662000.00	lunas	\N	\N	2026-09-01 04:27:15.311466	2026-09-01 04:27:15.311466
34	INV/20260901/2118	\N	qris	1787240.00	1787240.00	lunas	\N	\N	2026-09-01 06:29:57.488199	2026-09-01 06:29:57.488199
36	INV/20260901/4426	\N	qris	6915870.00	6915870.00	lunas	\N	\N	2026-09-01 14:42:34.913411	2026-09-01 14:42:34.913411
39	INV/20260901/6628	\N	qris	9324000.00	9324000.00	lunas	\N	\N	2026-09-01 15:42:52.887121	2026-09-01 15:42:52.887121
40	INV/20260902/0001	\N	tunai	8420940.00	8420940.00	lunas	\N	\N	2026-09-02 12:11:56.207574	2026-09-02 12:11:56.207574
41	INV/20260902/0002	\N	transfer	3988236.00	3988236.00	lunas	\N	\N	2026-09-02 12:12:38.457311	2026-09-02 12:12:38.457311
47	INV/20260902/0003	\N	qris	4320000.00	4320000.00	lunas	\N	\N	2026-09-02 13:53:49.8349	2026-09-02 13:53:49.8349
45	INV/20260902/0004	\N	qris	4610580.00	4610580.00	lunas	\N	\N	2026-09-02 13:41:27.995861	2026-09-02 13:55:04.620004
48	INV/20260902/0005	1	qris	11344480.00	11344480.00	lunas	\N	\N	2026-09-02 14:40:50.583398	2026-09-02 14:41:19.825526
46	INV/20260903/0005	\N	tunai	6480000.00	6480000.00	lunas	\N	\N	2026-09-02 13:45:14.352048	2026-09-03 11:28:48.298116
53	HOLD-1788408753845	\N	tunai	11633400.00	633400.00	partial	\N	\N	2026-09-03 11:12:33.88798	2026-09-03 11:38:15.594571
52	INV/20260903/0001	\N	tunai	260312.00	260312.00	lunas	\N	\N	2026-09-03 11:06:54.408099	2026-09-03 11:06:54.408099
51	INV/20260903/0002	1	tunai	4777600.00	4777600.00	lunas	\N	\N	2026-09-03 10:31:14.789699	2026-09-03 11:28:34.299623
50	INV/20260903/0003	1	tunai	3574480.00	3574480.00	lunas	\N	\N	2026-09-02 15:47:54.915573	2026-09-03 11:28:40.20148
57	HOLD-1788417381473	1	qris	4291000.00	4291000.00	lunas	\N	\N	2026-09-03 13:36:21.474981	2026-09-03 13:36:54.400253
58	HOLD-1788460998826	1	tunai	2484400.00	484400.00	partial	\N	\N	2026-09-04 01:43:18.875226	2026-09-04 01:43:18.875226
56	HOLD-1788410684216	1	transfer	3440494.10	1440494.00	partial	\N	\N	2026-09-03 11:44:44.257131	2026-09-04 01:55:57.048481
55	HOLD-1788410324898	\N	tunai	2668800.00	1668800.00	partial	\N	\N	2026-09-03 11:38:44.947226	2026-09-04 02:12:51.829817
54	HOLD-1788409156792	1	tunai	4538800.00	3038800.00	partial	\N	\N	2026-09-03 11:19:16.838532	2026-09-04 02:15:19.301622
35	INV/20260901/2655	\N	qris	1787240.00	2305290.00	lunas	\N	\N	2026-09-01 13:01:22.492537	2026-09-04 02:16:35.746037
59	HOLD-1788463092750	1	tunai	3440494.10	440494.00	partial	\N	\N	2026-09-04 02:18:12.751379	2026-09-04 02:57:03.017243
60	HOLD-1788597765399	1	tunai	15213200.00	213200.00	partial	\N	\N	2026-09-05 15:42:45.456522	2026-09-05 15:54:21.177036
61	HOLD-1788766982701	1	kredit	2246600.00	1000000.00	partial	2026-09-15 00:00:00	\N	2026-09-07 14:43:02.72663	2026-09-07 14:48:12.778876
62	HOLD-1788768990666	1	kredit	6522000.00	522000.00	partial	\N	\N	2026-09-07 15:16:30.692088	2026-09-07 15:16:30.692088
64	INV/20260907/0001	\N	kredit	2373200.00	0.00	tempo	2026-09-10 00:00:00	\N	2026-09-07 15:33:03.365281	2026-09-07 15:33:37.266958
65	INV/20260907/0002	\N	tunai	4359800.00	4359800.00	cancelled	\N	\N	2026-09-07 15:42:40.828392	2026-09-07 15:43:27.044816
66	INV/20260907/0003	1	tunai	4359800.00	1000000.00	cancelled	\N	\N	2026-09-07 15:44:02.260898	2026-09-07 15:46:48.240932
67	HOLD-1788770923374	1	tunai	4359800.00	1000000.00	partial	\N	\N	2026-09-07 15:48:43.397087	2026-09-07 15:48:43.397087
63	HOLD-1788769564733	1	tunai	2486600.00	1486600.00	partial	\N	\N	2026-09-07 15:26:04.757565	2026-09-09 10:07:12.060912
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (key, value, description, updated_at) FROM stdin;
retur_pin	111111	\N	2026-08-31 08:38:42.449
app_name	EnkaTextile	\N	2026-08-31 22:57:49.045
app_address		\N	2026-08-31 22:57:49.047
app_logo	data:image/png;base64,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	\N	2026-08-31 22:57:49.048
invoice_bank_name	SPECTRA JAYA FASHION PT	\N	2026-09-02 16:40:55.143143
invoice_bank_account	BCA- 2384564444 | MANDIRI - 1390057578282	\N	2026-09-02 16:40:55.146555
invoice_notes	Barang yang sudah dibeli tidak dapat dikembalikan, kecuali ada perjanjian sebelumnya	\N	2026-09-02 16:40:55.147635
\.


--
-- Data for Name: stock_mutations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_mutations (id, product_id, type, rolls, meters, description, reference, created_at, roll_id) FROM stdin;
1	2	keluar	3.0000	382.9800	Penjualan INV/20260723/8859	INV/20260723/8859	2026-07-23 08:24:17.349595	\N
2	1	keluar	1.0000	5.0250	Penjualan INV/20260723/8859	INV/20260723/8859	2026-07-23 08:24:17.353475	\N
3	1	retur_masuk	1.0000	5.0250	Retur Penjualan RET-1788165597467	RET-1788165597467	2026-08-31 15:39:57.493748	\N
4	2	retur_keluar	1.0000	127.6600	Tukar Pengganti Retur RET-1788165597467	RET-1788165597467	2026-08-31 15:39:57.5024	169
5	2	keluar	1.0000	127.6600	Penjualan INV/20260831/3283	INV/20260831/3283	2026-08-31 17:16:33.467812	\N
6	2	keluar	1.0000	127.6600	Penjualan INV/20260831/3283	INV/20260831/3283	2026-08-31 17:16:33.471017	\N
7	2	keluar	1.0000	132.0000	Penjualan INV/20260831/3283	INV/20260831/3283	2026-08-31 17:16:33.473993	\N
8	2	keluar	1.0000	786.0000	Penjualan INV/20260831/3283	INV/20260831/3283	2026-08-31 17:16:33.47671	\N
9	2	keluar	1.0000	453.0000	Penjualan INV/20260831/3283	INV/20260831/3283	2026-08-31 17:16:33.478966	\N
10	2	keluar	1.0000	127.6600	Penjualan INV/20260831/3283	INV/20260831/3283	2026-08-31 17:16:33.481222	\N
11	2	keluar	1.0000	127.6600	Penjualan INV/20260831/3283	INV/20260831/3283	2026-08-31 17:16:33.483919	\N
12	2	keluar	1.0000	2345.0000	Penjualan INV/20260831/3283	INV/20260831/3283	2026-08-31 17:16:33.486199	\N
13	1	keluar	1.0000	5.0250	Penjualan INV/20260831/3283	INV/20260831/3283	2026-08-31 17:16:33.488674	\N
14	1	keluar	1.0000	5.0250	Penjualan INV/20260831/3283	INV/20260831/3283	2026-08-31 17:16:33.491022	\N
15	1	keluar	1.0000	5.0250	Penjualan INV/20260831/8524	INV/20260831/8524	2026-08-31 17:25:31.354943	\N
16	2	keluar	1.0000	127.6600	Penjualan INV/20260831/8524	INV/20260831/8524	2026-08-31 17:25:31.358909	\N
17	2	keluar	1.0000	127.6600	Penjualan INV/20260831/8524	INV/20260831/8524	2026-08-31 17:25:31.361733	\N
18	2	keluar	1.0000	127.6600	Penjualan INV/20260831/8524	INV/20260831/8524	2026-08-31 17:25:31.36446	\N
19	2	keluar	1.0000	127.6600	Penjualan INV/20260831/8524	INV/20260831/8524	2026-08-31 17:25:31.367341	\N
20	2	retur_masuk	1.0000	127.6600	Retur Penjualan RET-1788171969829	RET-1788171969829	2026-08-31 17:26:09.838671	163
21	1	retur_keluar	1.0000	5.0250	Tukar Pengganti Retur RET-1788171969829	RET-1788171969829	2026-08-31 17:26:09.844608	2
22	2	keluar	1.0000	222.0000	Penjualan INV/20260831/8471	INV/20260831/8471	2026-08-31 17:31:26.703597	\N
23	2	keluar	1.0000	444.0000	Penjualan INV/20260831/8471	INV/20260831/8471	2026-08-31 17:31:26.706509	\N
24	2	keluar	1.0000	127.6600	Penjualan INV/20260831/8471	INV/20260831/8471	2026-08-31 17:31:26.709077	\N
25	2	retur_masuk	1.0000	444.0000	Retur Penjualan RET-1788172303338	RET-1788172303338	2026-08-31 17:31:43.348406	186
26	1	retur_keluar	1.0000	5.0250	Tukar Pengganti Retur RET-1788172303338	RET-1788172303338	2026-08-31 17:31:43.354177	2
27	1	retur_masuk	1.0000	5.0250	Retur Penjualan RET-1788172999269	RET-1788172999269	2026-08-31 17:43:19.279675	4
28	2	retur_keluar	1.0000	444.0000	Tukar Pengganti Retur RET-1788172999269	RET-1788172999269	2026-08-31 17:43:19.283335	186
29	2	keluar	1.0000	222.0000	Penjualan INV/20260901/4107	INV/20260901/4107	2026-09-01 02:30:35.553392	\N
30	2	keluar	1.0000	127.6600	Penjualan INV/20260901/4107	INV/20260901/4107	2026-09-01 02:30:35.556977	\N
31	2	retur_masuk	1.0000	222.0000	Retur Penjualan RET-1788204651476	RET-1788204651476	2026-09-01 02:30:51.486002	185
32	1	retur_keluar	1.0000	5.0250	Tukar Pengganti Retur RET-1788204651476	RET-1788204651476	2026-09-01 02:30:51.489826	4
33	2	keluar	1.0000	222.0000	Penjualan INV/20260901/5435	INV/20260901/5435	2026-09-01 02:32:37.807172	\N
34	2	keluar	1.0000	127.6600	Penjualan INV/20260901/5435	INV/20260901/5435	2026-09-01 02:32:37.810083	\N
35	2	retur_masuk	1.0000	222.0000	Retur Penjualan RET-1788204791643	RET-1788204791643	2026-09-01 02:33:11.704747	185
36	2	retur_keluar	1.0000	444.0000	Tukar Pengganti Retur RET-1788204791643	RET-1788204791643	2026-09-01 02:33:11.708868	187
37	2	retur_masuk	1.0000	127.6600	Retur Penjualan RET-1788205136481	RET-1788205136481	2026-09-01 02:38:56.525225	174
38	2	retur_keluar	1.0000	222.0000	Tukar Pengganti Retur RET-1788205136481	RET-1788205136481	2026-09-01 02:38:56.530153	184
39	2	retur_masuk	1.0000	127.6600	Retur Penjualan RET-1788205503483	RET-1788205503483	2026-09-01 02:45:03.534723	171
40	2	retur_keluar	1.0000	222.0000	Tukar Pengganti Retur RET-1788205503483	RET-1788205503483	2026-09-01 02:45:03.53865	185
41	2	keluar	1.0000	127.6600	Penjualan INV/20260901/6613	INV/20260901/6613	2026-09-01 03:14:52.958791	\N
42	2	retur_masuk	1.0000	127.6600	Retur Penjualan RET-1788207347799	RET-1788207347799	2026-09-01 03:15:47.816673	142
43	2	retur_keluar	1.0000	444.0000	Tukar Pengganti Retur RET-1788207347799	RET-1788207347799	2026-09-01 03:15:47.820173	188
44	2	keluar	1.0000	127.6600	Penjualan INV/20260901/5227	INV/20260901/5227	2026-09-01 03:17:39.631299	\N
45	2	retur_masuk	1.0000	127.6600	Retur Penjualan RET-1788208098900	RET-1788208098900	2026-09-01 03:28:19.044094	174
46	2	retur_keluar	1.0000	2323.0000	Tukar Pengganti Retur RET-1788208098900	RET-1788208098900	2026-09-01 03:28:19.048448	189
47	1	retur_masuk	1.0000	382.9800	Retur Penjualan RET-1788211184846	RET-1788211184846	2026-09-01 04:19:44.895712	1
48	2	retur_keluar	1.0000	222.0000	Tukar Pengganti Retur RET-1788211184846	RET-1788211184846	2026-09-01 04:19:44.900387	190
49	1	retur_masuk	1.0000	382.9800	Retur Penjualan RET-1788211220318	RET-1788211220318	2026-09-01 04:20:20.460767	1
50	2	retur_keluar	1.0000	444.0000	Tukar Pengganti Retur RET-1788211220318	RET-1788211220318	2026-09-01 04:20:20.464266	192
51	2	keluar	1.0000	333.0000	Penjualan INV/20260901/4323	INV/20260901/4323	2026-09-01 04:27:15.32743	\N
52	2	retur_masuk	1.0000	333.0000	Retur Penjualan RET-1788211656483	RET-1788211656483	2026-09-01 04:27:36.500233	191
53	1	retur_keluar	1.0000	382.9800	Tukar Pengganti Retur RET-1788211656483	RET-1788211656483	2026-09-01 04:27:36.50583	1
54	2	keluar	1.0000	127.6600	Penjualan INV/20260901/2118	INV/20260901/2118	2026-09-01 06:29:57.498681	\N
55	2	retur_masuk	1.0000	127.6600	Retur Penjualan RET-1788242002316	RET-1788242002316	2026-09-01 12:53:22.334844	171
56	2	retur_keluar	1.0000	333.0000	Tukar Pengganti Retur RET-1788242002316	RET-1788242002316	2026-09-01 12:53:22.339838	191
57	2	keluar	1.0000	127.6600	Penjualan INV/20260901/2655	INV/20260901/2655	2026-09-01 13:01:22.509616	\N
58	2	retur_masuk	1.0000	127.6600	Retur Penjualan RET-1788248012984	RET-1788248012984	2026-09-01 14:33:33.055595	142
59	4	retur_keluar	1.0000	177.3300	Tukar Pengganti Retur RET-1788248012984	RET-1788248012984	2026-09-01 14:33:33.061447	431
60	4	keluar	1.0000	177.3300	Penjualan INV/20260901/4426	INV/20260901/4426	2026-09-01 14:42:34.922431	\N
61	4	keluar	1.0000	177.3300	Penjualan INV/20260901/4426	INV/20260901/4426	2026-09-01 14:42:34.925095	\N
62	4	keluar	1.0000	177.3300	Penjualan INV/20260901/4426	INV/20260901/4426	2026-09-01 14:42:34.927425	\N
63	4	retur_masuk	1.0000	177.3300	Retur Penjualan RET-1788248617552	RET-1788248617552	2026-09-01 14:43:37.60784	429
64	2	retur_keluar	1.0000	127.6600	Tukar Pengganti Retur RET-1788248617552	RET-1788248617552	2026-09-01 14:43:37.613411	174
65	2	keluar	1.0000	666.0000	Penjualan INV/20260901/6628	INV/20260901/6628	2026-09-01 15:42:52.895986	\N
66	2	retur_masuk	1.0000	666.0000	Retur Penjualan RET-1788252224016	RET-1788252224016	2026-09-01 15:43:44.062293	194
67	2	retur_keluar	1.0000	127.6600	Tukar Pengganti Retur RET-1788252224016	RET-1788252224016	2026-09-01 15:43:44.066626	171
68	2	masuk	10.0000	10000.0000	Pembelian PO-1788263181978	PO-1788263181978	2026-09-01 18:46:22.02264	\N
69	5	masuk	50.0000	5000.0000	Pembelian PO-1788263592720	PO-1788263592720	2026-09-01 18:53:12.756712	\N
70	6	masuk	10.0000	2000.0000	Pembelian PO-1788263710879	PO-1788263710879	2026-09-01 18:55:10.918477	\N
71	7	masuk	30.0000	2000.0000	Pembelian PO-1788265092680	PO-1788265092680	2026-09-01 19:18:12.721586	\N
72	3	masuk	5.0000	863.7100	Pembelian PO-1788293112031	PO-1788293112031	2026-09-02 03:05:12.085302	\N
73	7	keluar	1.0000	255.2200	Penjualan INV/20260902/0001	INV/20260902/0001	2026-09-02 12:11:56.22466	\N
74	7	keluar	1.0000	127.5500	Penjualan INV/20260902/0001	INV/20260902/0001	2026-09-02 12:11:56.239525	\N
75	3	keluar	1.0000	114.5500	Penjualan INV/20260902/0002	INV/20260902/0002	2026-09-02 12:12:38.466041	\N
76	3	keluar	1.0000	20.0370	Penjualan INV/20260902/0002	INV/20260902/0002	2026-09-02 12:12:38.480822	\N
77	3	keluar	1.0000	20.0370	Penjualan INV/20260902/0002	INV/20260902/0002	2026-09-02 12:12:38.48388	\N
78	3	keluar	1.0000	130.2500	Penjualan INV/20260902/0002	INV/20260902/0002	2026-09-02 12:12:38.487025	\N
79	6	keluar	1.0000	120.0000	Penjualan INV/20260902/0003	INV/20260902/0003	2026-09-02 13:53:49.849191	\N
80	6	keluar	1.0000	120.0000	Penjualan INV/20260902/0003	INV/20260902/0003	2026-09-02 13:53:49.853429	\N
81	4	keluar	1.0000	177.3300	Penjualan INV/20260902/0004	INV/20260902/0004	2026-09-02 13:55:04.62753	\N
82	4	keluar	1.0000	177.3300	Penjualan INV/20260902/0004	INV/20260902/0004	2026-09-02 13:55:04.631164	\N
83	2	keluar	1.0000	127.6600	Penjualan INV/20260902/0005	INV/20260902/0005	2026-09-02 14:41:19.832466	\N
84	2	keluar	1.0000	127.6600	Penjualan INV/20260902/0005	INV/20260902/0005	2026-09-02 14:41:19.836726	\N
85	2	keluar	1.0000	555.0000	Penjualan INV/20260902/0005	INV/20260902/0005	2026-09-02 14:41:19.838995	\N
86	5	keluar	1.0000	5.0060	Penjualan INV/20260903/0001	INV/20260903/0001	2026-09-03 11:06:54.427903	\N
87	5	keluar	1.0000	5.0060	Penjualan INV/20260903/0001	INV/20260903/0001	2026-09-03 11:06:54.441844	\N
88	5	keluar	1.0000	5.0060	Penjualan INV/20260903/0001	INV/20260903/0001	2026-09-03 11:06:54.44402	\N
89	5	keluar	1.0000	5.0060	Penjualan INV/20260903/0001	INV/20260903/0001	2026-09-03 11:06:54.446242	\N
90	8	keluar	1.0000	145.4175	Penjualan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:12:33.901054	\N
91	8	keluar	1.0000	145.4175	Penjualan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:12:33.903826	\N
92	8	keluar	1.0000	145.4175	Penjualan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:12:33.905608	\N
93	8	keluar	1.0000	145.4175	Penjualan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:12:33.907732	\N
94	8	masuk	1.0000	145.4175	Pembatalan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:13:19.390438	\N
95	8	masuk	1.0000	145.4175	Pembatalan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:13:19.392878	\N
96	8	masuk	1.0000	145.4175	Pembatalan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:13:19.394676	\N
97	8	masuk	1.0000	145.4175	Pembatalan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:13:19.395984	\N
98	8	keluar	1.0000	145.4175	Penjualan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:13:19.401277	\N
99	8	keluar	1.0000	145.4175	Penjualan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:13:19.402923	\N
100	8	keluar	1.0000	145.4175	Penjualan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:13:19.404464	\N
101	8	keluar	1.0000	145.4175	Penjualan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:13:19.4059	\N
102	8	masuk	1.0000	145.4175	Pembatalan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:18:19.145624	\N
103	8	masuk	1.0000	145.4175	Pembatalan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:18:19.148603	\N
104	8	masuk	1.0000	145.4175	Pembatalan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:18:19.150097	\N
105	8	masuk	1.0000	145.4175	Pembatalan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:18:19.151514	\N
106	8	keluar	1.0000	145.4175	Penjualan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:18:19.158445	\N
107	8	keluar	1.0000	145.4175	Penjualan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:18:19.160302	\N
108	8	keluar	1.0000	145.4175	Penjualan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:18:19.162046	\N
109	8	keluar	1.0000	145.4175	Penjualan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:18:19.163795	\N
110	8	masuk	1.0000	145.4175	Pembatalan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:18:31.876021	\N
111	8	masuk	1.0000	145.4175	Pembatalan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:18:31.879241	\N
112	8	masuk	1.0000	145.4175	Pembatalan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:18:31.880705	\N
113	8	masuk	1.0000	145.4175	Pembatalan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:18:31.881929	\N
114	8	keluar	1.0000	145.4175	Penjualan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:18:31.887417	\N
115	8	keluar	1.0000	145.4175	Penjualan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:18:31.889269	\N
116	8	keluar	1.0000	145.4175	Penjualan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:18:31.891114	\N
117	8	keluar	1.0000	145.4175	Penjualan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:18:31.89294	\N
118	8	keluar	1.0000	115.4400	Penjualan HOLD-1788409156792	HOLD-1788409156792	2026-09-03 11:19:16.849636	\N
119	8	keluar	1.0000	111.5000	Penjualan HOLD-1788409156792	HOLD-1788409156792	2026-09-03 11:19:16.851935	\N
120	8	masuk	1.0000	115.4400	Pembatalan HOLD-1788409156792	HOLD-1788409156792	2026-09-03 11:27:10.138788	\N
121	8	masuk	1.0000	111.5000	Pembatalan HOLD-1788409156792	HOLD-1788409156792	2026-09-03 11:27:10.141128	\N
122	8	keluar	1.0000	111.5000	Penjualan HOLD-1788409156792	HOLD-1788409156792	2026-09-03 11:27:10.145702	\N
123	8	keluar	1.0000	115.4400	Penjualan HOLD-1788409156792	HOLD-1788409156792	2026-09-03 11:27:10.147182	\N
124	10	keluar	1.0000	125.3300	Penjualan INV/20260903/0002	INV/20260903/0002	2026-09-03 11:28:34.305044	\N
125	10	keluar	1.0000	113.5500	Penjualan INV/20260903/0002	INV/20260903/0002	2026-09-03 11:28:34.307267	\N
126	2	keluar	1.0000	127.6600	Penjualan INV/20260903/0003	INV/20260903/0003	2026-09-03 11:28:40.207633	\N
127	2	keluar	1.0000	127.6600	Penjualan INV/20260903/0003	INV/20260903/0003	2026-09-03 11:28:40.210696	\N
128	2	keluar	1.0000	127.6600	Penjualan INV/20260903/0004	INV/20260903/0004	2026-09-03 11:28:44.172092	\N
129	2	keluar	1.0000	127.6600	Penjualan INV/20260903/0004	INV/20260903/0004	2026-09-03 11:28:44.174692	\N
130	2	keluar	1.0000	666.0000	Penjualan INV/20260903/0004	INV/20260903/0004	2026-09-03 11:28:44.1763	\N
131	6	keluar	1.0000	120.0000	Penjualan INV/20260903/0005	INV/20260903/0005	2026-09-03 11:28:48.300621	\N
132	6	keluar	1.0000	120.0000	Penjualan INV/20260903/0005	INV/20260903/0005	2026-09-03 11:28:48.302479	\N
133	6	keluar	1.0000	120.0000	Penjualan INV/20260903/0005	INV/20260903/0005	2026-09-03 11:28:48.304166	\N
134	8	masuk	1.0000	145.4175	Pembatalan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:38:08.560959	\N
135	8	masuk	1.0000	145.4175	Pembatalan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:38:08.564204	\N
136	8	masuk	1.0000	145.4175	Pembatalan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:38:08.565911	\N
137	8	masuk	1.0000	145.4175	Pembatalan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:38:08.567556	\N
138	8	keluar	1.0000	145.4175	Penjualan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:38:08.573728	\N
139	8	keluar	1.0000	145.4175	Penjualan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:38:08.575426	\N
140	8	keluar	1.0000	145.4175	Penjualan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:38:08.577144	\N
141	8	keluar	1.0000	145.4175	Penjualan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:38:08.579054	\N
142	8	masuk	1.0000	145.4175	Pembatalan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:38:15.589056	\N
143	8	masuk	1.0000	145.4175	Pembatalan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:38:15.591123	\N
144	8	masuk	1.0000	145.4175	Pembatalan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:38:15.592352	\N
145	8	masuk	1.0000	145.4175	Pembatalan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:38:15.593643	\N
146	8	keluar	1.0000	145.4175	Penjualan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:38:15.598348	\N
147	8	keluar	1.0000	145.4175	Penjualan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:38:15.599622	\N
148	8	keluar	1.0000	145.4175	Penjualan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:38:15.601157	\N
149	8	keluar	1.0000	145.4175	Penjualan HOLD-1788408753845	HOLD-1788408753845	2026-09-03 11:38:15.602493	\N
150	8	keluar	1.0000	133.4400	Penjualan HOLD-1788410324898	HOLD-1788410324898	2026-09-03 11:38:44.956172	\N
151	9	keluar	1.0000	149.5867	Penjualan HOLD-1788410684216	HOLD-1788410684216	2026-09-03 11:44:44.269443	\N
152	8	keluar	1.0000	214.5500	Penjualan HOLD-1788417381473	HOLD-1788417381473	2026-09-03 13:36:21.491289	\N
153	8	masuk	1.0000	214.5500	Pembatalan HOLD-1788417381473	HOLD-1788417381473	2026-09-03 13:36:54.397085	\N
154	8	keluar	1.0000	214.5500	Penjualan HOLD-1788417381473	HOLD-1788417381473	2026-09-03 13:36:54.403883	\N
155	8	keluar	1.0000	124.2200	Penjualan HOLD-1788460998826	HOLD-1788460998826	2026-09-04 01:43:19.736109	\N
156	9	keluar	1.0000	149.5867	Penjualan HOLD-1788463092750	HOLD-1788463092750	2026-09-04 02:18:12.769568	\N
157	9	masuk	1.0000	149.5867	Pembatalan HOLD-1788463092750	HOLD-1788463092750	2026-09-04 02:28:35.924462	\N
158	9	keluar	1.0000	149.5867	Penjualan HOLD-1788463092750	HOLD-1788463092750	2026-09-04 02:28:35.929309	\N
159	9	masuk	1.0000	149.5867	Pembatalan HOLD-1788463092750	HOLD-1788463092750	2026-09-04 02:57:03.0151	\N
160	9	keluar	1.0000	149.5867	Penjualan HOLD-1788463092750	HOLD-1788463092750	2026-09-04 02:57:03.019647	\N
161	8	keluar	1.0000	333.1200	Penjualan HOLD-1788597765399	HOLD-1788597765399	2026-09-05 15:42:45.470373	\N
162	8	keluar	1.0000	213.7700	Penjualan HOLD-1788597765399	HOLD-1788597765399	2026-09-05 15:42:45.483256	\N
163	8	keluar	1.0000	213.7700	Penjualan HOLD-1788597765399	HOLD-1788597765399	2026-09-05 15:42:45.484727	\N
164	8	masuk	1.0000	333.1200	Pembatalan HOLD-1788597765399	HOLD-1788597765399	2026-09-05 15:43:05.883285	\N
165	8	masuk	1.0000	213.7700	Pembatalan HOLD-1788597765399	HOLD-1788597765399	2026-09-05 15:43:05.884965	\N
166	8	masuk	1.0000	213.7700	Pembatalan HOLD-1788597765399	HOLD-1788597765399	2026-09-05 15:43:05.885967	\N
167	8	keluar	1.0000	213.7700	Penjualan HOLD-1788597765399	HOLD-1788597765399	2026-09-05 15:43:05.889944	\N
168	8	keluar	1.0000	213.7700	Penjualan HOLD-1788597765399	HOLD-1788597765399	2026-09-05 15:43:05.891552	\N
169	8	keluar	1.0000	333.1200	Penjualan HOLD-1788597765399	HOLD-1788597765399	2026-09-05 15:43:05.892918	\N
170	8	masuk	1.0000	213.7700	Pembatalan HOLD-1788597765399	HOLD-1788597765399	2026-09-05 15:43:51.520051	\N
171	8	masuk	1.0000	213.7700	Pembatalan HOLD-1788597765399	HOLD-1788597765399	2026-09-05 15:43:51.524399	\N
172	8	masuk	1.0000	333.1200	Pembatalan HOLD-1788597765399	HOLD-1788597765399	2026-09-05 15:43:51.525857	\N
173	8	keluar	1.0000	333.1200	Penjualan HOLD-1788597765399	HOLD-1788597765399	2026-09-05 15:43:51.530916	\N
174	8	keluar	1.0000	213.7700	Penjualan HOLD-1788597765399	HOLD-1788597765399	2026-09-05 15:43:51.532491	\N
175	8	keluar	1.0000	213.7700	Penjualan HOLD-1788597765399	HOLD-1788597765399	2026-09-05 15:43:51.533743	\N
176	8	masuk	1.0000	333.1200	Pembatalan HOLD-1788597765399	HOLD-1788597765399	2026-09-05 15:54:21.170844	\N
177	8	masuk	1.0000	213.7700	Pembatalan HOLD-1788597765399	HOLD-1788597765399	2026-09-05 15:54:21.173871	\N
178	8	masuk	1.0000	213.7700	Pembatalan HOLD-1788597765399	HOLD-1788597765399	2026-09-05 15:54:21.175317	\N
179	8	keluar	1.0000	213.7700	Penjualan HOLD-1788597765399	HOLD-1788597765399	2026-09-05 15:54:21.180883	\N
180	8	keluar	1.0000	213.7700	Penjualan HOLD-1788597765399	HOLD-1788597765399	2026-09-05 15:54:21.182418	\N
181	8	keluar	1.0000	333.1200	Penjualan HOLD-1788597765399	HOLD-1788597765399	2026-09-05 15:54:21.184334	\N
182	8	keluar	1.0000	112.3300	Penjualan HOLD-1788766982701	HOLD-1788766982701	2026-09-07 14:43:02.760058	\N
183	8	masuk	1.0000	112.3300	Pembatalan HOLD-1788766982701	HOLD-1788766982701	2026-09-07 14:48:12.769261	\N
184	8	keluar	1.0000	112.3300	Penjualan HOLD-1788766982701	HOLD-1788766982701	2026-09-07 14:48:12.781144	\N
185	8	keluar	1.0000	213.7700	Penjualan HOLD-1788768990666	HOLD-1788768990666	2026-09-07 15:16:30.703113	\N
186	8	keluar	1.0000	112.3300	Penjualan HOLD-1788768990666	HOLD-1788768990666	2026-09-07 15:16:30.705299	\N
187	10	keluar	1.0000	124.3300	Penjualan HOLD-1788769564733	HOLD-1788769564733	2026-09-07 15:26:04.78135	\N
188	10	keluar	1.0000	118.6600	Penjualan INV/20260907/0001	INV/20260907/0001	2026-09-07 15:33:03.371592	\N
189	10	masuk	1.0000	118.6600	Pembatalan INV/20260907/0001	INV/20260907/0001	2026-09-07 15:33:37.264829	\N
190	10	keluar	1.0000	118.6600	Penjualan INV/20260907/0001	INV/20260907/0001	2026-09-07 15:33:37.269447	\N
191	10	keluar	1.0000	217.9900	Penjualan INV/20260907/0002	INV/20260907/0002	2026-09-07 15:42:41.79078	\N
192	10	masuk	1.0000	217.9900	Pembatalan INV/20260907/0002	INV/20260907/0002	2026-09-07 15:43:27.042389	\N
193	10	keluar	1.0000	217.9900	Penjualan INV/20260907/0003	INV/20260907/0003	2026-09-07 15:44:02.67194	\N
194	10	masuk	1.0000	217.9900	Pembatalan INV/20260907/0003	INV/20260907/0003	2026-09-07 15:46:30.417593	\N
195	10	keluar	1.0000	217.9900	Penjualan INV/20260907/0003	INV/20260907/0003	2026-09-07 15:46:31.147001	\N
196	10	masuk	1.0000	217.9900	Pembatalan INV/20260907/0003	INV/20260907/0003	2026-09-07 15:46:48.23766	\N
197	10	keluar	1.0000	217.9900	Penjualan HOLD-1788770923374	HOLD-1788770923374	2026-09-07 15:48:43.777873	\N
198	10	masuk	1.0000	124.3300	Pembatalan HOLD-1788769564733	HOLD-1788769564733	2026-09-09 10:07:07.901388	\N
199	10	keluar	1.0000	124.3300	Penjualan HOLD-1788769564733	HOLD-1788769564733	2026-09-09 10:07:11.514879	\N
200	10	masuk	1.0000	124.3300	Pembatalan HOLD-1788769564733	HOLD-1788769564733	2026-09-09 10:07:12.059356	\N
201	10	keluar	1.0000	124.3300	Penjualan HOLD-1788769564733	HOLD-1788769564733	2026-09-09 10:07:12.899885	\N
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, name, phone, address, contact_person, created_at, updated_at) FROM stdin;
1	Hand	08999964585	Jl Jalan	85274196	2026-09-01 18:32:22.411574	2026-09-01 18:32:22.411574
\.


--
-- Data for Name: units; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.units (id, name, symbol, created_at) FROM stdin;
1	YARD	yds	2026-07-18 09:34:51.812346
2	METER	m	2026-07-18 09:35:00.591248
3	ROLL	ROLL	2026-07-18 09:35:08.558216
4	KGS	KGS	2026-09-02 13:07:59.570822
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password_hash, full_name, role, created_at) FROM stdin;
1	111	$2b$10$5NlboG4qch.9ny1RaOPI5.8a2jdHBUHUkjP7WFZwlsX8lrA2Uewyq	Administrator	admin	2026-07-18 09:16:30.904118
2	admin	$2b$10$xnSYjscdTbeCbPGRI5mYlOelqVtqtEFMacBkW.UAH/0evyz/uVVjS	Administrator	admin	2026-09-05 15:22:56.654538
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: postgres
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 2, true);


--
-- Name: cash_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cash_entries_id_seq', 11, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 8, true);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customers_id_seq', 1, true);


--
-- Name: license_cache_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.license_cache_id_seq', 1, true);


--
-- Name: payables_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payables_id_seq', 5, true);


--
-- Name: payment_methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payment_methods_id_seq', 5, true);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 8, true);


--
-- Name: product_rolls_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_rolls_id_seq', 775, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 11, true);


--
-- Name: purchase_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.purchase_items_id_seq', 5, true);


--
-- Name: purchases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.purchases_id_seq', 5, true);


--
-- Name: push_subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.push_subscriptions_id_seq', 3, true);


--
-- Name: receivables_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.receivables_id_seq', 21, true);


--
-- Name: return_exchanged_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.return_exchanged_items_id_seq', 17, true);


--
-- Name: return_returned_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.return_returned_items_id_seq', 17, true);


--
-- Name: returns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.returns_id_seq', 17, true);


--
-- Name: sale_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sale_items_id_seq', 131, true);


--
-- Name: sales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sales_id_seq', 67, true);


--
-- Name: stock_mutations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_mutations_id_seq', 201, true);


--
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 1, true);


--
-- Name: units_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.units_id_seq', 4, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


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

\unrestrict 2hZbuIhz9VN2fCHFniW5ixEE8SkOcu4hcv7C1Sr0cWq8u5NFdrjCB0YRuZDVGOl

