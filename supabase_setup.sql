-- USERS TABLE
create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text,
  postal_code text,
  life_stage text, -- e.g., 'new_parent', 'young_professional', etc.
  created_at timestamptz default now()
);

-- CIRCLES TABLE
create table circles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  location_radius_km int default 5,
  created_at timestamptz default now()
);

-- USER <-> CIRCLE RELATIONSHIP
create table circle_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  circle_id uuid references circles(id) on delete cascade,
  joined_at timestamptz default now(),
  is_active boolean default true
);

-- CHALLENGES TABLE
create table challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  reward_amount numeric(10, 2),
  reward_type text check (reward_type in ('cash', 'credit')),
  goal_type text, -- e.g., 'spend_total', 'item_count', etc.
  goal_target numeric,
  start_date date,
  end_date date,
  created_at timestamptz default now()
);

-- CHALLENGE PARTICIPATION
create table challenge_participants (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid references challenges(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  circle_id uuid references circles(id) on delete cascade,
  joined_at timestamptz default now(),
  completed boolean default false,
  earned_reward numeric(10, 2) default 0
);

-- DEALS TABLE
create table group_deals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  product_category text,
  discount_percentage numeric(5, 2),
  min_participants int,
  active boolean default true,
  valid_until date,
  created_at timestamptz default now()
);

-- USER <-> DEAL PARTICIPATION
create table deal_participants (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references group_deals(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  circle_id uuid references circles(id) on delete cascade,
  joined_at timestamptz default now()
);

-- REWARDS TABLE (Log of past rewards)
create table rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  challenge_id uuid references challenges(id),
  reward_type text check (reward_type in ('cash', 'credit')),
  amount numeric(10, 2),
  issued_at timestamptz default now()
);

-- Optional: PRODUCT PREFERENCES (for clustering/AI insights)
create table user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  preference_key text,
  preference_value text
);

-- Add test circle
insert into circles (name, description) values ('Kensington New Parents', 'Circle of new parents in the Kensington area');

-- Add test user
insert into users (email, full_name, postal_code, life_stage) values 
('mark@example.com', 'Mark Johnson', 'M5V2T6', 'new_parent');
