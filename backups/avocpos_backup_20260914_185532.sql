--
-- PostgreSQL database dump
--

\restrict sCKIl3mJ2nSHYSMm8gfrDUrwopQv7n6DzYCBp9re1lQX7GZOyvVzSTnyedToq0d

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
    barcode text DEFAULT ''::text NOT NULL,
    primary_unit text DEFAULT 'METER'::text NOT NULL,
    secondary_unit text DEFAULT 'ROLL'::text NOT NULL,
    lot_number text DEFAULT ''::text NOT NULL,
    rack_location text DEFAULT ''::text NOT NULL,
    image_url text,
    description text,
    price_per_meter numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    price_per_roll numeric(15,2),
    cost_price_per_meter numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    cost_price_per_roll numeric(15,2),
    roll_stock numeric(12,4) DEFAULT '0'::numeric NOT NULL,
    meter_stock numeric(12,4) DEFAULT '0'::numeric NOT NULL,
    min_stock numeric(12,4) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
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
    roll_id integer,
    rolls numeric(12,4) DEFAULT '0'::numeric NOT NULL,
    meters numeric(12,4) DEFAULT '0'::numeric NOT NULL,
    price_per_meter numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    subtotal numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    roll_lengths_json text
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
    roll_id integer,
    rolls numeric(12,4) DEFAULT '0'::numeric NOT NULL,
    meters numeric(12,4) DEFAULT '0'::numeric NOT NULL,
    price_per_meter numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    subtotal numeric(15,2) DEFAULT '0'::numeric NOT NULL
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
    roll_id integer,
    type text NOT NULL,
    rolls numeric(12,4) DEFAULT '0'::numeric NOT NULL,
    meters numeric(12,4) DEFAULT '0'::numeric NOT NULL,
    description text NOT NULL,
    reference text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
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
-- Data for Name: cash_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cash_entries (id, type, amount, description, reference, created_at) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, description, created_at, updated_at) FROM stdin;
1	BARANG RUSAK/CACAT	WOVEN	2026-09-13 20:54:23.296657	2026-09-13 20:54:23.296657
2	BENGALINE	WOVEN	2026-09-13 20:54:33.317605	2026-09-13 20:54:33.317605
3	COTTON COMBET STRETCH 240-260GSM	WOVEN	2026-09-13 20:54:42.092081	2026-09-13 20:54:42.092081
4	CRINKLE AIRFLOW DIAMOND	\tWOVEN	2026-09-13 20:54:48.51533	2026-09-13 20:54:48.51533
5	CRINKLE AIRFLOW PLATINUM	\tWOVEN	2026-09-13 20:54:57.356583	2026-09-13 20:54:57.356583
6	OTOMEN	WOVEN	2026-09-13 20:55:09.605988	2026-09-13 20:55:09.605988
7	POLO LINEN	WOVEN	2026-09-13 20:55:18.115782	2026-09-13 20:55:18.115782
8	RAYON DIPI PLATINUM	WOVEN	2026-09-13 20:55:24.136061	2026-09-13 20:55:24.136061
9	RAYON DIPI THE BEST	WOVEN	2026-09-13 20:55:31.152607	2026-09-13 20:55:31.152607
10	RAYON MOTIF THE BEST	WOVEN	2026-09-13 20:55:38.60108	2026-09-13 20:55:38.60108
11	RAYON TWILL	WOVEN	2026-09-13 20:55:45.601259	2026-09-13 20:55:45.601259
12	SEMIWOLL FERRARI IMPORT	WOVEN	2026-09-13 20:55:53.35683	2026-09-13 20:55:53.35683
13	SEMIWOLL FERRARI LOKAL	WOVEN	2026-09-13 20:56:12.933108	2026-09-13 20:56:12.933108
14	SEMIWOLL PRESTIGE		2026-09-13 20:56:22.548217	2026-09-13 20:56:22.548217
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
1	VOC-H6SA-260913-432X	t	2026-10-13 17:13:54.784	2026-09-14 11:55:18.908	30	ENKATEXTILE
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
1	tunai	Tunai / Cash	t	0	2026-09-13 20:52:01.163222
2	transfer	Transfer Bank	t	1	2026-09-13 20:52:01.163222
3	debit	Kartu Debit	t	2	2026-09-13 20:52:01.163222
4	qris	QRIS	t	3	2026-09-13 20:52:01.163222
5	kredit	Kredit / Tempo	t	4	2026-09-13 20:52:01.163222
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

COPY public.products (id, name, category_id, barcode, primary_unit, secondary_unit, lot_number, rack_location, image_url, description, price_per_meter, price_per_roll, cost_price_per_meter, cost_price_per_roll, roll_stock, meter_stock, min_stock, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: purchase_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_items (id, purchase_id, product_id, roll_id, rolls, meters, price_per_meter, subtotal, roll_lengths_json) FROM stdin;
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

COPY public.sale_items (id, sale_id, product_id, roll_id, rolls, meters, price_per_meter, subtotal) FROM stdin;
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
shop_enable_cart	false	\N	2026-09-13 20:52:45.079458
invoice_bank_name	SPECTRA JAYA FASHION PT	\N	2026-09-14 18:55:18.57085
invoice_bank_account	BCA- 2384564444 | MANDIRI - 1390057578282	\N	2026-09-14 18:55:18.572848
invoice_notes	Barang yang sudah dibeli tidak dapat dikembalikan, kecuali ada perjanjian sebelumnya	\N	2026-09-14 18:55:18.573542
app_name	Enka Textile	\N	2026-09-14 18:55:25.185363
app_address	Gudang Kain Enka Textile Jl. Raya Jrebengkembang, Masuk Gg. Griya Azzahra, Kedolon, Jrebengkembang, Karangdadap	\N	2026-09-14 18:55:25.186467
app_logo	data:image/png;base64,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	\N	2026-09-14 18:55:25.187347
\.


--
-- Data for Name: stock_mutations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_mutations (id, product_id, roll_id, type, rolls, meters, description, reference, created_at) FROM stdin;
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, name, phone, address, contact_person, created_at, updated_at) FROM stdin;
1	BAS	08122616492	Solo	Yundarto	2026-09-13 20:56:59.70813	2026-09-13 20:56:59.70813
2	MJI	08156936030	Solo Sragen	Shinta	2026-09-13 20:57:13.424186	2026-09-13 20:57:13.424186
3	MJS	082129151929	Bandung	Intan	2026-09-13 20:57:29.919317	2026-09-13 20:57:29.919317
4	MTX	082210249837	PIK 1	Ade	2026-09-13 20:57:46.909583	2026-09-13 20:57:46.909583
5	SCA	08156936030	Solo	Shinta	2026-09-13 20:58:12.147579	2026-09-13 20:58:12.147579
6	KANDA	085722077020	Bandung	Yudha	2026-09-14 18:54:39.304487	2026-09-14 18:54:39.304487
\.


--
-- Data for Name: units; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.units (id, name, symbol, created_at) FROM stdin;
1	KG	KG	2026-09-13 20:53:02.168951
2	METER	M	2026-09-13 20:53:09.493447
3	ROLL	ROLL	2026-09-13 20:53:18.463745
4	YARD	YDS	2026-09-13 20:53:30.475141
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password_hash, full_name, role, created_at) FROM stdin;
1	admin	$2b$10$uBdASlWFTNL0AU.iQ5mlNOczbVyN03KBpZdotM9U/CIyXvTSifc56	Administrator	admin	2026-09-14 18:54:02.595177
\.


--
-- Name: cash_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cash_entries_id_seq', 1, false);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 14, true);


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

SELECT pg_catalog.setval('public.payables_id_seq', 1, false);


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
-- Name: purchases purchases_invoice_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_invoice_number_unique UNIQUE (invoice_number);


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
-- PostgreSQL database dump complete
--

\unrestrict sCKIl3mJ2nSHYSMm8gfrDUrwopQv7n6DzYCBp9re1lQX7GZOyvVzSTnyedToq0d

