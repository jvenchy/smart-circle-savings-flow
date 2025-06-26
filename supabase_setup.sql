-- Drop existing table if it exists (with incorrect schema)

DROP TABLE IF EXISTS public.transactions CASCADE;



-- Create transactions table for Supabase (corrected for line items)

CREATE TABLE public.transactions (

id uuid NOT NULL DEFAULT gen_random_uuid(),

user_id uuid NOT NULL,

transaction_id text NOT NULL,

timestamp timestamp with time zone NOT NULL,

product_name text NOT NULL,

category text NOT NULL,

quantity integer NOT NULL DEFAULT 1,

price numeric(10,2) NOT NULL,

store_id text NOT NULL,

life_stage text,

created_at timestamp with time zone DEFAULT now(),

updated_at timestamp with time zone DEFAULT now(),

CONSTRAINT transactions_pkey PRIMARY KEY (id),

CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,

CONSTRAINT transactions_quantity_positive CHECK (quantity > 0),

CONSTRAINT transactions_price_positive CHECK (price >= 0),

-- Optional: Prevent duplicate products within the same transaction

CONSTRAINT unique_transaction_product UNIQUE (transaction_id, product_name)

);



-- Create indexes for better query performance

CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);

CREATE INDEX idx_transactions_transaction_id ON public.transactions(transaction_id);

CREATE INDEX idx_transactions_timestamp ON public.transactions(timestamp);

CREATE INDEX idx_transactions_category ON public.transactions(category);

CREATE INDEX idx_transactions_store_id ON public.transactions(store_id);

CREATE INDEX idx_transactions_life_stage ON public.transactions(life_stage);

CREATE INDEX idx_transactions_user_timestamp ON public.transactions(user_id, timestamp);



-- Create updated_at trigger function if it doesn't exist

CREATE OR REPLACE FUNCTION public.handle_updated_at()

RETURNS TRIGGER AS $$

BEGIN

NEW.updated_at = now();

RETURN NEW;

END;

$$ language 'plpgsql';



-- Create trigger to automatically update updated_at column

CREATE TRIGGER set_updated_at

BEFORE UPDATE ON public.transactions

FOR EACH ROW

EXECUTE FUNCTION public.handle_updated_at();



-- Enable Row Level Security (RLS)

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;



-- Create RLS policies (adjust based on your security requirements)

-- Policy to allow users to see only their own transactions

CREATE POLICY "Users can view own transactions" ON public.transactions

FOR SELECT USING (auth.uid() = user_id);



-- Policy to allow users to insert their own transactions

CREATE POLICY "Users can insert own transactions" ON public.transactions

FOR INSERT WITH CHECK (auth.uid() = user_id);



-- Policy to allow users to update their own transactions

CREATE POLICY "Users can update own transactions" ON public.transactions

FOR UPDATE USING (auth.uid() = user_id);



-- Optional: Add some useful views for analytics



-- View for category-level summaries (line item level)

CREATE VIEW public.category_summary AS

SELECT

user_id,

category,

COUNT(*) as line_item_count,

SUM(quantity) as total_quantity,

SUM(price * quantity) as total_amount,

AVG(price) as avg_price_per_item,

MIN(timestamp) as first_purchase,

MAX(timestamp) as last_purchase

FROM public.transactions

GROUP BY user_id, category;



-- View for transaction-level summaries (grouped by transaction_id)

CREATE VIEW public.transaction_summary AS

SELECT

user_id,

transaction_id,

timestamp,

store_id,

life_stage,

COUNT(*) as items_in_transaction,

SUM(quantity) as total_items,

SUM(price * quantity) as transaction_total,

AVG(price) as avg_item_price,

STRING_AGG(DISTINCT category, ', ') as categories

FROM public.transactions

GROUP BY user_id, transaction_id, timestamp, store_id, life_stage;



-- View for monthly transaction summaries (actual transactions, not line items)

CREATE VIEW public.monthly_transaction_summary AS

SELECT

t.user_id,

DATE_TRUNC('month', t.timestamp) as month,

COUNT(DISTINCT t.transaction_id) as transaction_count,

COUNT(*) as total_line_items,

SUM(t.price * t.quantity) as total_amount,

AVG(tt.transaction_total) as avg_transaction_amount,

COUNT(DISTINCT t.category) as unique_categories,

COUNT(DISTINCT t.store_id) as unique_stores

FROM public.transactions t

JOIN (

SELECT transaction_id, SUM(price * quantity) as transaction_total

FROM public.transactions

GROUP BY transaction_id

) as tt ON t.transaction_id = tt.transaction_id

GROUP BY t.user_id, DATE_TRUNC('month', t.timestamp)

ORDER BY t.user_id, month;