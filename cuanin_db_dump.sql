--
-- PostgreSQL database dump
--

\restrict 5zBVzBWVk7HlDYXc0NHkxLQnaXg719EMwlpDaJ8UgjJVVb4yKrnb1uOQfWy1VvO

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

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

ALTER TABLE IF EXISTS ONLY public.tenants DROP CONSTRAINT IF EXISTS tenants_template_id_fkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_tenant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.payout_requests DROP CONSTRAINT IF EXISTS payout_requests_tenant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_tenant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.escrow_records DROP CONSTRAINT IF EXISTS escrow_records_tenant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.escrow_records DROP CONSTRAINT IF EXISTS escrow_records_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.customers DROP CONSTRAINT IF EXISTS customers_tenant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tenants DROP CONSTRAINT IF EXISTS tenants_subdomain_key;
ALTER TABLE IF EXISTS ONLY public.tenants DROP CONSTRAINT IF EXISTS tenants_pkey;
ALTER TABLE IF EXISTS ONLY public.templates DROP CONSTRAINT IF EXISTS templates_pkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE IF EXISTS ONLY public.payout_requests DROP CONSTRAINT IF EXISTS payout_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_invoice_number_key;
ALTER TABLE IF EXISTS ONLY public.escrow_records DROP CONSTRAINT IF EXISTS escrow_records_pkey;
ALTER TABLE IF EXISTS ONLY public.customers DROP CONSTRAINT IF EXISTS customers_tenant_id_email_key;
ALTER TABLE IF EXISTS ONLY public.customers DROP CONSTRAINT IF EXISTS customers_pkey;
ALTER TABLE IF EXISTS ONLY public.admins DROP CONSTRAINT IF EXISTS admins_username_key;
ALTER TABLE IF EXISTS ONLY public.admins DROP CONSTRAINT IF EXISTS admins_pkey;
ALTER TABLE IF EXISTS ONLY public.admins DROP CONSTRAINT IF EXISTS admins_email_key;
ALTER TABLE IF EXISTS public.tenants ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.products ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.payout_requests ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.orders ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.escrow_records ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.customers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.admins ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.tenants_id_seq;
DROP TABLE IF EXISTS public.tenants;
DROP TABLE IF EXISTS public.templates;
DROP SEQUENCE IF EXISTS public.products_id_seq;
DROP TABLE IF EXISTS public.products;
DROP SEQUENCE IF EXISTS public.payout_requests_id_seq;
DROP TABLE IF EXISTS public.payout_requests;
DROP SEQUENCE IF EXISTS public.orders_id_seq;
DROP TABLE IF EXISTS public.orders;
DROP SEQUENCE IF EXISTS public.escrow_records_id_seq;
DROP TABLE IF EXISTS public.escrow_records;
DROP SEQUENCE IF EXISTS public.customers_id_seq;
DROP TABLE IF EXISTS public.customers;
DROP SEQUENCE IF EXISTS public.admins_id_seq;
DROP TABLE IF EXISTS public.admins;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: buana_admin
--

CREATE TABLE public.admins (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'SUPERADMIN'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.admins OWNER TO buana_admin;

--
-- Name: admins_id_seq; Type: SEQUENCE; Schema: public; Owner: buana_admin
--

CREATE SEQUENCE public.admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admins_id_seq OWNER TO buana_admin;

--
-- Name: admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: buana_admin
--

ALTER SEQUENCE public.admins_id_seq OWNED BY public.admins.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: buana_admin
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    tenant_id integer,
    name character varying(100) NOT NULL,
    email character varying(120) NOT NULL,
    password_hash character varying(255) NOT NULL,
    phone character varying(30),
    address text,
    city character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.customers OWNER TO buana_admin;

--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: buana_admin
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO buana_admin;

--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: buana_admin
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: escrow_records; Type: TABLE; Schema: public; Owner: buana_admin
--

CREATE TABLE public.escrow_records (
    id integer NOT NULL,
    order_id integer,
    tenant_id integer,
    amount_held numeric(12,2) NOT NULL,
    platform_fee numeric(12,2) NOT NULL,
    midtrans_fee numeric(12,2) NOT NULL,
    status character varying(20) DEFAULT 'HELD'::character varying,
    released_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.escrow_records OWNER TO buana_admin;

--
-- Name: escrow_records_id_seq; Type: SEQUENCE; Schema: public; Owner: buana_admin
--

CREATE SEQUENCE public.escrow_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.escrow_records_id_seq OWNER TO buana_admin;

--
-- Name: escrow_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: buana_admin
--

ALTER SEQUENCE public.escrow_records_id_seq OWNED BY public.escrow_records.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: buana_admin
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    tenant_id integer,
    customer_id integer,
    invoice_number character varying(60) NOT NULL,
    items_json jsonb NOT NULL,
    subtotal_product numeric(12,2) NOT NULL,
    shipping_cost numeric(12,2) NOT NULL,
    courier character varying(50) NOT NULL,
    surcharge_fee numeric(12,2) NOT NULL,
    total_paid numeric(12,2) NOT NULL,
    status character varying(30) DEFAULT 'MENUNGGU_PEMBAYARAN'::character varying,
    tracking_number character varying(80),
    paid_at timestamp without time zone,
    shipped_at timestamp without time zone,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.orders OWNER TO buana_admin;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: buana_admin
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO buana_admin;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: buana_admin
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: payout_requests; Type: TABLE; Schema: public; Owner: buana_admin
--

CREATE TABLE public.payout_requests (
    id integer NOT NULL,
    tenant_id integer,
    amount numeric(12,2) NOT NULL,
    bank_name character varying(50) NOT NULL,
    account_number character varying(50) NOT NULL,
    account_holder character varying(100) NOT NULL,
    status character varying(20) DEFAULT 'SUCCESS'::character varying,
    reference_id character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.payout_requests OWNER TO buana_admin;

--
-- Name: payout_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: buana_admin
--

CREATE SEQUENCE public.payout_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payout_requests_id_seq OWNER TO buana_admin;

--
-- Name: payout_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: buana_admin
--

ALTER SEQUENCE public.payout_requests_id_seq OWNED BY public.payout_requests.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: buana_admin
--

CREATE TABLE public.products (
    id integer NOT NULL,
    tenant_id integer,
    name character varying(150) NOT NULL,
    description text,
    price numeric(12,2) NOT NULL,
    stock integer DEFAULT 20,
    weight_grams integer DEFAULT 250,
    image_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.products OWNER TO buana_admin;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: buana_admin
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO buana_admin;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: buana_admin
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: templates; Type: TABLE; Schema: public; Owner: buana_admin
--

CREATE TABLE public.templates (
    id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    category character varying(50) NOT NULL,
    price numeric(12,2) NOT NULL,
    description text,
    image_url text
);


ALTER TABLE public.templates OWNER TO buana_admin;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: buana_admin
--

CREATE TABLE public.tenants (
    id integer NOT NULL,
    subdomain character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    template_id character varying(50),
    owner_name character varying(100) NOT NULL,
    phone character varying(30) NOT NULL,
    bank_name character varying(50) NOT NULL,
    bank_account_number character varying(50) NOT NULL,
    bank_account_holder character varying(100) NOT NULL,
    origin_city character varying(100) DEFAULT 'Jakarta Selatan'::character varying,
    balance_held numeric(15,2) DEFAULT 0,
    balance_active numeric(15,2) DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    email character varying(120),
    password_hash character varying(255)
);


ALTER TABLE public.tenants OWNER TO buana_admin;

--
-- Name: tenants_id_seq; Type: SEQUENCE; Schema: public; Owner: buana_admin
--

CREATE SEQUENCE public.tenants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tenants_id_seq OWNER TO buana_admin;

--
-- Name: tenants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: buana_admin
--

ALTER SEQUENCE public.tenants_id_seq OWNED BY public.tenants.id;


--
-- Name: admins id; Type: DEFAULT; Schema: public; Owner: buana_admin
--

ALTER TABLE ONLY public.admins ALTER COLUMN id SET DEFAULT nextval('public.admins_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: buana_admin
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: escrow_records id; Type: DEFAULT; Schema: public; Owner: buana_admin
--

ALTER TABLE ONLY public.escrow_records ALTER COLUMN id SET DEFAULT nextval('public.escrow_records_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: buana_admin
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: payout_requests id; Type: DEFAULT; Schema: public; Owner: buana_admin
--

ALTER TABLE ONLY public.payout_requests ALTER COLUMN id SET DEFAULT nextval('public.payout_requests_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: buana_admin
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: tenants id; Type: DEFAULT; Schema: public; Owner: buana_admin
--

ALTER TABLE ONLY public.tenants ALTER COLUMN id SET DEFAULT nextval('public.tenants_id_seq'::regclass);


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: buana_admin
--

COPY public.admins (id, username, email, password_hash, role, created_at) FROM stdin;
1	admin	admin@cuanin.com	$2b$10$4F/kzcD5Dwf3ExsCviZLhOKIJftgFEom2cC4KjucJakNDm7WAO9bq	SUPERADMIN	2026-10-22 02:12:32.721963
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: buana_admin
--

COPY public.customers (id, tenant_id, name, email, password_hash, phone, address, city, created_at) FROM stdin;
\.


--
-- Data for Name: escrow_records; Type: TABLE DATA; Schema: public; Owner: buana_admin
--

COPY public.escrow_records (id, order_id, tenant_id, amount_held, platform_fee, midtrans_fee, status, released_at, created_at) FROM stdin;
1	1	1	77000.00	2541.00	539.00	RELEASED	2026-10-22 00:52:35.615042	2026-10-22 00:52:35.604623
2	2	1	77000.00	2541.00	539.00	RELEASED	2026-10-22 00:53:14.03181	2026-10-22 00:53:01.978973
3	3	1	77000.00	2541.00	539.00	RELEASED	2026-10-22 02:43:28.083919	2026-10-22 02:43:21.383183
4	4	4	97000.00	3201.00	679.00	HELD	\N	2026-10-22 03:55:03.220449
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: buana_admin
--

COPY public.orders (id, tenant_id, customer_id, invoice_number, items_json, subtotal_product, shipping_cost, courier, surcharge_fee, total_paid, status, tracking_number, paid_at, shipped_at, completed_at, created_at) FROM stdin;
1	1	\N	INV-KOPISENJA-1792605155573	[{"id": 3, "name": "Cold Brew Concentrate Bottle 500ml", "price": "65000.00", "quantity": 1, "weight_grams": 600}]	65000.00	12000.00	JNE Regular	3080.00	80080.00	SELESAI	JNE-CUANIN-88291039	2026-10-22 00:52:35.604623	2026-10-22 00:52:35.612254	2026-10-22 00:52:35.615042	2026-10-22 00:52:35.574719
2	1	\N	INV-KOPISENJA-1792605175799	[{"id": 3, "name": "Cold Brew Concentrate Bottle 500ml", "price": 65000, "quantity": 1, "weight_grams": 600}]	65000.00	12000.00	JNE Regular	3080.00	80080.00	SELESAI	RESI-JNE-05191464	2026-10-22 00:53:01.978973	2026-10-22 00:53:11.980989	2026-10-22 00:53:14.03181	2026-10-22 00:52:55.800166
3	1	\N	INV-KOPISENJA-1792611800345	[{"id": 3, "name": "Cold Brew Concentrate Bottle 500ml", "price": 65000, "quantity": 1, "weight_grams": 600}]	65000.00	12000.00	JNE Regular	3080.00	80080.00	SELESAI	RESI-JNE-11804997	2026-10-22 02:43:21.383183	2026-10-22 02:43:25.517158	2026-10-22 02:43:28.083919	2026-10-22 02:43:20.34634
4	4	\N	INV-BUTIKAISYAH-1792616083315	[{"id": 16, "name": "Tote Bag Kanvas Etnik Tenun Jepara", "price": 85000, "quantity": 1, "weight_grams": 250}]	85000.00	12000.00	JNE Regular	3880.00	100880.00	DIPROSES_TOKO	\N	2026-10-22 03:55:03.220449	\N	\N	2026-10-22 03:54:43.315589
\.


--
-- Data for Name: payout_requests; Type: TABLE DATA; Schema: public; Owner: buana_admin
--

COPY public.payout_requests (id, tenant_id, amount, bank_name, account_number, account_holder, status, reference_id, created_at) FROM stdin;
1	1	50000.00	BCA	8820192841	Budi Santoso	SUCCESS	IRIS-BCA-1792605155626-8445	2026-10-22 00:52:35.62681
2	1	50000.00	BCA	8820192841	Budi Santoso	SUCCESS	IRIS-BCA-1792605196091-5614	2026-10-22 00:53:16.091451
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: buana_admin
--

COPY public.products (id, tenant_id, name, description, price, stock, weight_grams, image_url, created_at) FROM stdin;
4	2	Paket Perdana Toko Warung Berkah Nusantara	Produk unggulan pertama dari Warung Berkah Nusantara	50000.00	10	300	https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80	2026-10-22 03:08:49.776147
5	1	Arabika Gayo Single Origin 250g	Biji kopi pilihan dataran tinggi Aceh Gayo. Karakter rasa peach, dark chocolate, dan floral aroma dengan acidity seimbang.	75000.00	35	250	https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
6	1	Robusta Dampit Espresso Roast 250g	Kopi robusta Malang lereng Gunung Semeru. Body tebal, crema melimpah dengan aroma karamel manis dan roasted nutty.	48000.00	40	250	https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
7	1	Cold Brew Concentrate Bottle 500ml	Konsentrat seduh dingin 16 jam, siap minum atau dicampur susu segar. Tanpa pemanis buatan dan tanpa bahan pengawet.	65000.00	20	600	https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
8	1	Artisan Drip Bag Box Isi 5 Sachet	Praktis seduh di mana saja cukup tuang air panas. Berisi 5 varian single origin Nusantara terbaik.	55000.00	50	150	https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
9	1	Sirup Karamel Vanila Organik 250ml	Pemanis alami pelengkap kopi susu favorit Anda, dibuat dari gula tebu murni dan vanila polong asli.	38000.00	25	400	https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
10	1	Croissant Almond Butter Toast (Isi 2)	Pastry renyah berlapis mentega Prancis impor dengan taburan kacang almond panggang gurih.	42000.00	15	200	https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
11	4	Pashmina Silk Premium Rosewood	Bahan silk lembut berkilau anggun, mudah dibentuk, tidak licin, dan sejuk digunakan sepanjang hari.	69000.00	45	180	https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
12	4	Gamis Katun Linen Bordir Daisy	Gamis bersiluet loose fit dengan aksen bordir bunga daisy halus pada ujung lengan. Wudhu-friendly dan busui-friendly.	245000.00	20	550	https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
13	4	Kemeja Koko Modern Sage Green	Koko pria kasual dengan potongan modern mandarin collar berbahan katun toyobo premium yang adem.	165000.00	30	350	https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
14	4	Tunik Floral Pastel Lilac Breeze	Tunik santai motif dedaunan lembut cocok dipadukan dengan celana kulot atau rok plisket.	135000.00	25	300	https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
15	4	Outer Cardigan Rajut Etnik Cream	Rajutan benang katun tebal namun tidak gerah, pas untuk outfit kerja santai maupun hangout akhir pekan.	110000.00	18	450	https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
16	4	Tote Bag Kanvas Etnik Tenun Jepara	Tas jinjing kanvas kuat dengan kombinasi kain tenun asli nusantara. Muat laptop hingga 14 inch.	85000.00	35	250	https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
17	5	Set Piring & Sendok Kayu Jati Alami	Dipahat langsung dari kayu jati solid perhutani dengan finishing beeswax aman untuk makanan (food-grade).	89000.00	30	450	https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
18	5	Tas Anyaman Bambu Halus Handle Kulit	Anyaman bambu apus kualitas ekspor karya perajin Kulon Progo dengan pegangan kulit sapi nabati.	125000.00	20	350	https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
19	5	Cangkir Keramik Stoneware Rustic 280ml	Keramik buatan tangan dibakar pada suhu 1200 derajat Celsius. Tahan microwave dan dishwasher.	65000.00	40	300	https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
20	5	Lampu Gantung Anyaman Rotan Boho	Kap lampu estetik pemberi aksen hangat untuk ruang tamu, teras, maupun cafe idaman Anda.	195000.00	15	800	https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
21	5	Nampan Saji Kayu Mahoni Alur Rapi	Nampan kayu dengan handel ergonomis, cocok untuk menyajikan minuman kopi dan cemilan tamu.	75000.00	25	500	https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
22	5	Lilin Aromaterapi Pot Gerabah Cendana	Soy wax alami dengan aroma menenangkan kayu cendana dan rempah nusantara. Waktu bakar hingga 30 jam.	55000.00	50	280	https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
23	6	Sabun Batang Minyak Kelapa & Madu Hutan	Dibuat dengan teknik cold process tanpa SLS dan paraben. Melembapkan kulit sensitif secara alami.	35000.00	60	120	https://images.unsplash.com/photo-1607006314644-884d5df64639?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
24	6	Serum Pencerah Wajah Ekstrak Bengkoang	Serum ringan kaya vitamin C alami untuk mencerahkan noda hitam dan meratakan warna kulit wajah.	89000.00	30	80	https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
25	6	Rose Water Hydrating Mist 100ml	Penyegar wajah dari air sulingan mawar murni. Mengembalikan kesegaran kulit lelah seketika.	45000.00	40	150	https://images.unsplash.com/photo-1608248597359-00994f30b200?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
26	6	Body Scrub Kopi Robusta & Kakao 200g	Lulur eksfoliasi butiran kopi asli untuk mengangkat sel kulit mati dan menghaluskan permukaan kulit.	52000.00	25	220	https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
27	6	Lip Balm Beeswax Alami Aroma Jeruk Bali	Pelembap bibir dari lilin lebah murni dan minyak almond, ampuh mengatasi bibir kering dan pecah-pecah.	28000.00	50	30	https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
28	6	Minyak Esensial Lavender Alami 15ml	100% essential oil murni untuk diffuser relaksasi tidur nyenyak dan menenangkan pikiran.	68000.00	35	70	https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
29	7	Wireless TWS Earbuds Bass Boost v5.3	Earphone nirkabel latensi rendah dengan driver dinamis 13mm dan baterai tahan hingga 28 jam bersama case.	189000.00	30	120	https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
30	7	Powerbank Fast Charging 20.000mAh Dual Port	Dukungan Power Delivery 22.5W dan Quick Charge 3.0. Aman dibawa ke dalam kabin pesawat.	215000.00	25	400	https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
31	7	Stand Laptop Aluminium Lipat Ergonomis	Dapat diatur dalam 6 level ketinggian untuk mencegah sakit leher dan menjaga sirkulasi udara laptop.	98000.00	40	350	https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
32	7	Kabel Data Type-C to C Braided 60W 1.2M	Kabel anyaman nilon anti kusut, tahan tekukan hingga 15.000 kali dengan kecepatan transfer 480Mbps.	45000.00	60	50	https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
33	7	Ring Light LED 26cm + Tripod Fleksibel	Lampu penerangan konten video TikTok dan live streaming dengan 3 mode warna dan 10 level kecerahan.	79000.00	20	650	https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
34	7	Casing Ponsel Silikon Matte Shockproof	Pelindung gawai dengan bumper sudut tebal anti benturan dan lapisan lembut anti noda sidik jari.	39000.00	50	60	https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
35	8	Monstera Deliciosa Pot Tanah Liat 30cm	Tanaman hias indoor berdaun sobek ikonik, sudah berakar kuat dalam pot terakota siap pajang.	115000.00	15	1200	https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
36	8	Buket Bunga Mawar Merah Segar Asli	Rangkaian 10 tangkai mawar segar premium berbalut kertas kado rustic dan kartu ucapan kustom.	175000.00	20	600	https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
37	8	Paket Mini Sukulen & Kaktus (Isi 3 Pot)	Tanaman meja mungil minim perawatan, cukup disiram seminggu sekali. Sangat manis untuk meja kerja.	48000.00	35	500	https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
38	8	Sansevieria Lidah Mertua Pembersih Udara	Tanaman tangguh penyerap polusi udara dan penghasil oksigen malam hari untuk kamar tidur.	65000.00	25	900	https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
39	8	Pupuk Cair Organik Daun Subur 500ml	Nutrisi tanaman alami dari fermentasi rumput laut dan asam amino untuk merangsang tunas baru.	32000.00	40	600	https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
40	8	Watering Can Logam Estetik Kuningan 1.2L	Penyiram tanaman corong panjang anti tumpah dengan sentuhan warna tembaga elegan.	89000.00	18	400	https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80	2026-10-22 03:16:06.588718
41	9	Paket Perdana Toko Toko Berkah Nusantara	Produk unggulan pertama dari Toko Berkah Nusantara	50000.00	10	300	https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80	2026-10-22 03:24:05.720999
42	10	Paket Perdana Toko Toko Berkah Nusantara	Produk unggulan pertama dari Toko Berkah Nusantara	50000.00	10	300	https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80	2026-10-22 03:42:55.800637
43	11	Paket Perdana Toko Toko Berkah Nusantara	Produk unggulan pertama dari Toko Berkah Nusantara	50000.00	10	300	https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80	2026-10-22 03:57:18.071876
44	12	Paket Perdana Toko Toko Berkah Nusantara	Produk unggulan pertama dari Toko Berkah Nusantara	50000.00	10	300	https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80	2026-10-22 03:58:55.783162
45	13	Paket Perdana Toko Toko Berkah Nusantara	Produk unggulan pertama dari Toko Berkah Nusantara	50000.00	10	300	https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80	2026-10-22 04:05:54.564458
46	14	Paket Perdana Toko Toko Berkah Nusantara	Produk unggulan pertama dari Toko Berkah Nusantara	50000.00	10	300	https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80	2026-10-22 04:18:56.506535
47	15	Paket Perdana Toko Toko Berkah Nusantara	Produk unggulan pertama dari Toko Berkah Nusantara	50000.00	10	300	https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80	2026-10-22 04:23:02.750441
48	16	Paket Perdana Toko kopi kenangan	Produk unggulan pertama dari kopi kenangan	50000.00	10	300	https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80	2026-10-22 11:37:21.158658
\.


--
-- Data for Name: templates; Type: TABLE DATA; Schema: public; Owner: buana_admin
--

COPY public.templates (id, name, category, price, description, image_url) FROM stdin;
tpl-kuliner	Katalog Kuliner & Kopi Artisan	F&B / Kuliner	349000.00	Template modern dan bersahaja khusus cafe, bakery, roastery, dan resto UMKM. Dilengkapi navigasi kategori menu, rincian karakter rasa, dan kalkulator kurir cepat.	https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80
tpl-fashion	Butik & Fashion Muslim Modern	Fashion & Busana	349000.00	Tata letak visual bersih dan anggun berfokus pada lookbook busana, pemilihan varian warna/ukuran, dan galeri kain premium untuk hijab, gamis, dan distro.	https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80
tpl-kriya	Galeri Kriya & Kerajinan Nusantara	Kriya & Handicraft	349000.00	Desain bertema alami dan hangat khusus produk buatan tangan lokal, anyaman, gerabah, dan mebel kayu dengan kalkulator dimensi dan bobot ekspedisi aman.	https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80
tpl-beauty	Skincare Alami & Herbal Nusantara	Kecantikan & Herbal	349000.00	Desain bersih bernuansa organik higienis untuk produk kosmetik, sabun herbal, minyak atsiri, dan perawatan tubuh ramah lingkungan.	https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80
tpl-gadget	Elektronik & Aksesoris Gadget	Gadget & Elektronik	349000.00	Nuansa teknologi modern bernada gelap profesional untuk toko aksesoris gawai, audio TWS, perangkat daya, dan perlengkapan komputer.	https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80
tpl-florist	Toko Tanaman Hias & Florist Segar	Tanaman Hias & Bunga	349000.00	Tampilan segar bernuansa dedaunan hijau untuk toko tanaman indoor, kaktus hias, rangkaian buket bunga segar, dan media tanam.	https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: buana_admin
--

COPY public.tenants (id, subdomain, name, template_id, owner_name, phone, bank_name, bank_account_number, bank_account_holder, origin_city, balance_held, balance_active, created_at, email, password_hash) FROM stdin;
15	toko17781	Toko Berkah Nusantara	tpl-kuliner	Ahmad Fauzi	081298765432	BCA	5210982341	Ahmad Fauzi	Jakarta Selatan	0.00	0.00	2026-10-22 04:23:02.746147	ahmad@tokoberkah.com	$2b$10$Ba8.3m9UGcimG5cJ94nE6uu2e6FsjhPRavRu7oRtFOkqlQyOv3nK6
1	kopisenja	Kopi Senja Nusantara	tpl-kuliner	Budi Santoso	081234567890	BCA	8820192841	Budi Santoso	Jakarta Selatan	0.00	131000.00	2026-10-22 00:47:34.512013	owner@kopisenja.com	$2b$10$0KNlcuFDZAsCdwK5B1gNqOMhIJAaSFPegGQ48d7JshRqiNIVvoiPa
16	kenangan	kopi kenangan	tpl-kuliner	Ahmad Fauzi	081298765432	BCA	5210982341	Ahmad Fauzi	Jakarta Selatan	0.00	0.00	2026-10-22 11:37:21.147367	ahmad@tokoberkah.com	$2b$10$MItPy9u0VkFWc4uI9TQHq.3etWgrtApgsQZYyfrC9pmm.2qYm3sgS
2	warungberkah	Warung Berkah Nusantara	tpl-kuliner	Ahmad Fauzi	081298765432	BCA	5210982341	Ahmad Fauzi	Jakarta Selatan	0.00	0.00	2026-10-22 03:08:49.766395	ahmad@tokoanyar.com	$2b$10$O5XZm3tVKULK6dYlgsps..XxjWM9yAovq3WUwsURLpw6PtNU9QwC.
5	kriyabambu	Kriya Bambu & Kayu Nusantara	tpl-kriya	Wayan Suardana	081287654321	BRI	034101002938501	Wayan Suardana	Yogyakarta	0.00	0.00	2026-10-22 03:16:06.588718	owner@kriyabambu.com	$2b$10$0KNlcuFDZAsCdwK5B1gNqOMhIJAaSFPegGQ48d7JshRqiNIVvoiPa
6	naturaherbal	Natura Herbal & Skincare Organik	tpl-beauty	Dr. Ni Made Ayu	081987654321	BCA	7720918231	Dr. Ni Made Ayu	Denpasar	0.00	0.00	2026-10-22 03:16:06.588718	owner@naturaherbal.com	$2b$10$0KNlcuFDZAsCdwK5B1gNqOMhIJAaSFPegGQ48d7JshRqiNIVvoiPa
7	gadgetpedia	GadgetPedia Aksesoris & Audio	tpl-gadget	Kevin Wijaya	081765432109	Bank Mandiri	1420098231041	Kevin Wijaya	Surabaya	0.00	0.00	2026-10-22 03:16:06.588718	owner@gadgetpedia.com	$2b$10$0KNlcuFDZAsCdwK5B1gNqOMhIJAaSFPegGQ48d7JshRqiNIVvoiPa
8	kebunkita	Kebun Kita Florist & Tanaman	tpl-florist	Indah Lestari	081239847192	BNI	0982319201	Indah Lestari	Bogor	0.00	0.00	2026-10-22 03:16:06.588718	owner@kebunkita.com	$2b$10$0KNlcuFDZAsCdwK5B1gNqOMhIJAaSFPegGQ48d7JshRqiNIVvoiPa
9	tokoberkah	Toko Berkah Nusantara	tpl-kuliner	Ahmad Fauzi	081298765432	BCA	5210982341	Ahmad Fauzi	Jakarta Selatan	0.00	0.00	2026-10-22 03:24:05.716906	ahmad@tokoberkah.com	$2b$10$fBhcctH/KouIVyIsKu5hPORhBjdhKwn9aaiTS12/c1Mp/f2NHmpwC
10	tokoberka	Toko Berkah Nusantara	tpl-kuliner	Ahmad Fauzi	081298765432	BCA	5210982341	Ahmad Fauzi	Jakarta Selatan	0.00	0.00	2026-10-22 03:42:55.796708	fauzi@toko.com	$2b$10$0mbnjbXF4s4we2GwW4BsdODsglsAtLkJ0ehRLw.3koyC0Y5/NhQXC
4	butikaisyah	Butik Aisyah Modest Wear	tpl-fashion	Siti Nur Aisyah	081398765432	Bank Mandiri	1310088921021	Siti Nur Aisyah	Bandung	97000.00	0.00	2026-10-22 03:16:06.588718	owner@butikaisyah.com	$2b$10$0KNlcuFDZAsCdwK5B1gNqOMhIJAaSFPegGQ48d7JshRqiNIVvoiPa
11	tokober	Toko Berkah Nusantara	tpl-kuliner	Ahmad Fauzi	081298765432	BCA	5210982341	Ahmad Fauzi	Jakarta Selatan	0.00	0.00	2026-10-22 03:57:18.068331	ahmad@tokoberkah.com	$2b$10$ncndA7PCxYGMqoRbv0fduu0pe3jqpxo1F8fksl6bdw.DBFuZLoXV2
12	tokoberk	Toko Berkah Nusantara	tpl-kuliner	Ahmad Fauzi	081298765432	BCA	5210982341	Ahmad Fauzi	Jakarta Selatan	0.00	0.00	2026-10-22 03:58:55.77931	ahmad@tokoberkah.com	$2b$10$AUg9zuEZASqotlq7c.tC8OPbbE0.yvM8laK3fJ.ARWIeD5uO2v8zq
13	toko16753	Toko Berkah Nusantara	tpl-kuliner	Ahmad Fauzi	081298765432	BCA	5210982341	Ahmad Fauzi	Jakarta Selatan	0.00	0.00	2026-10-22 04:05:54.554389	ahmad@tokoberkah.com	$2b$10$HBVM6A8c7j4VAHbY0oOBp.h7R/UCFD5hk8ZhvEmBqEnRRcIlyC5fG
14	tokob	Toko Berkah Nusantara	tpl-kuliner	Ahmad Fauzi	081298765432	BCA	5210982341	Ahmad Fauzi	Jakarta Selatan	0.00	0.00	2026-10-22 04:18:56.5029	ahmad@tokoberkah.com	$2b$10$KFKftUQd.H88m/nJs3teIOgqpwcMCOgX3h/03iAhlFYmJ797OPTaG
\.


--
-- Name: admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: buana_admin
--

SELECT pg_catalog.setval('public.admins_id_seq', 1, true);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: buana_admin
--

SELECT pg_catalog.setval('public.customers_id_seq', 1, false);


--
-- Name: escrow_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: buana_admin
--

SELECT pg_catalog.setval('public.escrow_records_id_seq', 4, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: buana_admin
--

SELECT pg_catalog.setval('public.orders_id_seq', 4, true);


--
-- Name: payout_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: buana_admin
--

SELECT pg_catalog.setval('public.payout_requests_id_seq', 2, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: buana_admin
--

SELECT pg_catalog.setval('public.products_id_seq', 48, true);


--
-- Name: tenants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: buana_admin
--

SELECT pg_catalog.setval('public.tenants_id_seq', 16, true);


--
-- Name: admins admins_email_key; Type: CONSTRAINT; Schema: public; Owner: buana_admin
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_email_key UNIQUE (email);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: buana_admin
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: admins admins_username_key; Type: CONSTRAINT; Schema: public; Owner: buana_admin
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_username_key UNIQUE (username);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: buana_admin
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: customers customers_tenant_id_email_key; Type: CONSTRAINT; Schema: public; Owner: buana_admin
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_tenant_id_email_key UNIQUE (tenant_id, email);


--
-- Name: escrow_records escrow_records_pkey; Type: CONSTRAINT; Schema: public; Owner: buana_admin
--

ALTER TABLE ONLY public.escrow_records
    ADD CONSTRAINT escrow_records_pkey PRIMARY KEY (id);


--
-- Name: orders orders_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: buana_admin
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_invoice_number_key UNIQUE (invoice_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: buana_admin
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payout_requests payout_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: buana_admin
--

ALTER TABLE ONLY public.payout_requests
    ADD CONSTRAINT payout_requests_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: buana_admin
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: templates templates_pkey; Type: CONSTRAINT; Schema: public; Owner: buana_admin
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: buana_admin
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_subdomain_key; Type: CONSTRAINT; Schema: public; Owner: buana_admin
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_subdomain_key UNIQUE (subdomain);


--
-- Name: customers customers_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: buana_admin
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: escrow_records escrow_records_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: buana_admin
--

ALTER TABLE ONLY public.escrow_records
    ADD CONSTRAINT escrow_records_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: escrow_records escrow_records_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: buana_admin
--

ALTER TABLE ONLY public.escrow_records
    ADD CONSTRAINT escrow_records_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: buana_admin
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: orders orders_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: buana_admin
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: payout_requests payout_requests_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: buana_admin
--

ALTER TABLE ONLY public.payout_requests
    ADD CONSTRAINT payout_requests_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: products products_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: buana_admin
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: tenants tenants_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: buana_admin
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.templates(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 5zBVzBWVk7HlDYXc0NHkxLQnaXg719EMwlpDaJ8UgjJVVb4yKrnb1uOQfWy1VvO

