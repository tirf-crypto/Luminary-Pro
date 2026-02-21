-- ═══════════════════════════════════════════════════════════════════════════════
-- LUMINARY PRO — PRODUCTION DATABASE SCHEMA
-- The most sophisticated wellness operating system ever built
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ═══════════════════════════════════════════════════════════════════════════════
-- CORE USER MANAGEMENT
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  
  -- Identity
  email TEXT NOT NULL,
  name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  avatar_emoji TEXT DEFAULT '✦',
  
  -- Demographics (for personalization)
  biological_sex TEXT CHECK (biological_sex IN ('female', 'male', 'non_binary', 'prefer_not_to_say')),
  date_of_birth DATE,
  timezone TEXT DEFAULT 'UTC',
  locale TEXT DEFAULT 'en-US',
  
  -- Personas (multi-dimensional identity)
  active_personas TEXT[] DEFAULT ARRAY['optimizer'],
  primary_persona TEXT DEFAULT 'optimizer',
  
  -- Goals & Vision
  goals TEXT[] DEFAULT ARRAY[]::TEXT[],
  why_statement TEXT,
  vision_board JSONB DEFAULT '[]'::JSONB,
  
  -- Schedule Anchors
  wake_time TIME DEFAULT '06:30',
  sleep_time TIME DEFAULT '22:30',
  work_start TIME DEFAULT '08:00',
  work_end TIME DEFAULT '18:00',
  training_preference TEXT DEFAULT 'morning' CHECK (training_preference IN ('morning', 'midday', 'afternoon', 'evening')),
  
  -- Financial Settings
  currency TEXT DEFAULT 'USD',
  monthly_income DECIMAL(12,2) DEFAULT 0,
  monthly_savings_goal DECIMAL(12,2) DEFAULT 0,
  
  -- Preferences
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'auto')),
  notifications_enabled BOOLEAN DEFAULT TRUE,
  haptics_enabled BOOLEAN DEFAULT TRUE,
  sounds_enabled BOOLEAN DEFAULT TRUE,
  
  -- Subscription & Billing
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'founder')),
  subscription_status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- Gamification
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  perfect_days INTEGER DEFAULT 0,
  
  -- Status
  is_onboarded BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invite System (Private Beta)
CREATE TABLE invite_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Usage tracking
  max_uses INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  
  -- Who used it
  used_by UUID[],
  
  -- Metadata
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Users
CREATE TABLE admin_users (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT DEFAULT 'moderator' CHECK (role IN ('super_admin', 'admin', 'moderator', 'content_manager')),
  permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
  granted_by UUID REFERENCES profiles(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- DAILY WELLNESS TRACKING
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE daily_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  
  -- Energy Scores (1-10)
  energy_score INTEGER CHECK (energy_score BETWEEN 1 AND 10),
  mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 10),
  focus_score INTEGER CHECK (focus_score BETWEEN 1 AND 10),
  stress_score INTEGER CHECK (stress_score BETWEEN 1 AND 10),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
  
  -- Context
  day_word TEXT,
  journal_entry TEXT,
  tags TEXT[],
  
  -- Calculated
  average_score DECIMAL(3,1) GENERATED ALWAYS AS (
    (COALESCE(energy_score, 5) + COALESCE(mood_score, 5) + COALESCE(focus_score, 5) + COALESCE(stress_score, 5) + COALESCE(sleep_quality, 5))::DECIMAL / 5
  ) STORED,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- Hybrid Day Plans (The Core Feature)
CREATE TABLE hybrid_day_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  
  -- Plan Configuration
  blocks JSONB NOT NULL DEFAULT '[]'::JSONB,
  completion_percentage INTEGER DEFAULT 0,
  day_mode TEXT DEFAULT 'balanced' CHECK (day_mode IN ('recovery', 'balanced', 'performance', 'flow')),
  
  -- Context used for generation
  generation_context JSONB DEFAULT '{}'::JSONB,
  
  -- AI Insights
  ai_insights TEXT,
  ai_recommendations JSONB DEFAULT '[]'::JSONB,
  
  -- Metadata
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- Day Blocks (Normalized for better querying)
CREATE TABLE day_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES hybrid_day_plans(id) ON DELETE CASCADE NOT NULL,
  
  -- Block Details
  block_order INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  
  -- Content
  type TEXT NOT NULL CHECK (type IN ('wake', 'light', 'cold_exposure', 'breathwork', 'meal', 'training', 'focus', 'deep_work', 'admin', 'break', 'care', 'reading', 'personal', 'transition', 'sleep', 'milestone')),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  
  -- Intelligence
  energy_required TEXT CHECK (energy_required IN ('low', 'medium', 'high')),
  personas TEXT[],
  science_note TEXT,
  pro_tip TEXT,
  
  -- Status
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  is_skipped BOOLEAN DEFAULT FALSE,
  skipped_at TIMESTAMPTZ,
  skip_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habit Tracking System
CREATE TABLE habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Habit Definition
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#F0A050',
  
  -- Categorization
  category TEXT,
  persona TEXT,
  
  -- Scheduling
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'custom')),
  target_days INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6], -- 0 = Sunday
  target_time TIME,
  reminder_time TIME,
  
  -- Tracking
  target_count INTEGER DEFAULT 1,
  unit TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE,
  end_date DATE,
  
  -- Gamification
  streak_days INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE habit_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Completion Details
  date DATE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  count INTEGER DEFAULT 1,
  notes TEXT,
  
  -- Context
  mood_at_completion INTEGER,
  energy_at_completion INTEGER,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(habit_id, date)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- FINANCIAL WELLNESS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE income_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Transaction Details
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'USD',
  source TEXT NOT NULL,
  description TEXT,
  
  -- Categorization
  category TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT,
  
  -- Date
  date DATE NOT NULL,
  received_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE savings_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Goal Details
  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '🎯',
  color TEXT DEFAULT '#C8A84A',
  
  -- Financial
  target_amount DECIMAL(12,2) NOT NULL CHECK (target_amount > 0),
  current_amount DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  
  -- Timeline
  target_date DATE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_completed BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE savings_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  goal_id UUID REFERENCES savings_goals(id) ON DELETE SET NULL,
  
  -- Transaction Details
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'USD',
  account_name TEXT DEFAULT 'Savings',
  
  -- Context
  note TEXT,
  source TEXT, -- e.g., 'manual', 'automatic', 'round_up'
  
  -- Date
  date DATE NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE spending_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Category Details
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  
  -- Type
  is_wellness BOOLEAN DEFAULT FALSE,
  is_essential BOOLEAN DEFAULT FALSE,
  
  -- Budgeting
  monthly_budget DECIMAL(12,2),
  
  -- System categories are shared (user_id is null)
  is_system BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE spending_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES spending_categories(id) ON DELETE SET NULL,
  
  -- Transaction Details
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'USD',
  description TEXT,
  
  -- Merchant Info
  merchant_name TEXT,
  merchant_category TEXT,
  
  -- Wellness Tracking
  is_wellness BOOLEAN DEFAULT FALSE,
  wellness_tags TEXT[],
  
  -- Receipt/Image
  receipt_url TEXT,
  
  -- Date
  date DATE NOT NULL,
  transaction_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- WELLNESS LIBRARY (HERBS & SUPPLEMENTS)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE herbs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Identity
  name TEXT NOT NULL,
  latin_name TEXT,
  slug TEXT UNIQUE NOT NULL,
  
  -- Content
  description TEXT NOT NULL,
  short_description TEXT,
  
  -- Classification
  category TEXT[],
  benefits TEXT[],
  uses TEXT[],
  
  -- Scientific
  evidence_level TEXT CHECK (evidence_level IN ('strong', 'moderate', 'limited', 'anecdotal')),
  research_summary TEXT,
  studies JSONB DEFAULT '[]'::JSONB,
  
  -- Dosage & Safety
  dosage TEXT,
  dosage_details JSONB DEFAULT '{}'::JSONB,
  cautions TEXT[],
  contraindications TEXT[],
  side_effects TEXT[],
  interactions TEXT[],
  
  -- Media
  image_url TEXT,
  icon TEXT,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Status
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  
  -- Metadata
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE saved_herbs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  herb_id UUID REFERENCES herbs(id) ON DELETE CASCADE NOT NULL,
  
  -- User Notes
  notes TEXT,
  personal_dosage TEXT,
  
  -- Reminders
  reminder_enabled BOOLEAN DEFAULT FALSE,
  reminder_time TIME,
  
  -- Metadata
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, herb_id)
);

CREATE TABLE protocols (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Identity
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  
  -- Content
  steps JSONB NOT NULL DEFAULT '[]'::JSONB,
  duration TEXT,
  frequency TEXT,
  
  -- Classification
  category TEXT,
  benefits TEXT[],
  personas TEXT[],
  
  -- Scientific
  evidence_level TEXT,
  research_summary TEXT,
  
  -- Media
  image_url TEXT,
  icon TEXT,
  video_url TEXT,
  
  -- Status
  is_published BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- LOCATION DISCOVERY (SAUNAS, ICE BATHS, GYMS, ETC.)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE places (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Identity
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  
  -- Location
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  
  -- Coordinates (PostGIS)
  location GEOGRAPHY(POINT, 4326),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Contact
  phone TEXT,
  email TEXT,
  website TEXT,
  
  -- Categorization
  types TEXT[] NOT NULL, -- e.g., ['sauna', 'cold_plunge', 'gym']
  amenities TEXT[],
  
  -- Details
  hours JSONB DEFAULT '{}'::JSONB,
  pricing JSONB DEFAULT '{}'::JSONB,
  
  -- Media
  images TEXT[],
  
  -- Ratings
  average_rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  
  -- Status
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Source
  source TEXT DEFAULT 'manual', -- 'manual', 'google_places', 'user_submitted'
  external_id TEXT, -- Google Places ID, etc.
  
  -- Metadata
  submitted_by UUID REFERENCES profiles(id),
  verified_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE saved_places (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE NOT NULL,
  
  -- User Data
  notes TEXT,
  personal_rating INTEGER CHECK (personal_rating BETWEEN 1 AND 5),
  visit_count INTEGER DEFAULT 0,
  last_visited_at TIMESTAMPTZ,
  
  -- Lists
  list_name TEXT DEFAULT 'Favorites',
  
  -- Metadata
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, place_id)
);

CREATE TABLE place_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Review Content
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  content TEXT,
  
  -- Specific Ratings
  cleanliness_rating INTEGER,
  staff_rating INTEGER,
  facilities_rating INTEGER,
  value_rating INTEGER,
  
  -- Media
  photos TEXT[],
  
  -- Status
  is_verified_visit BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(place_id, user_id)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- HERBAL SHOP / MARKETPLACE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Identity
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sku TEXT UNIQUE,
  
  -- Content
  description TEXT NOT NULL,
  short_description TEXT,
  
  -- Categorization
  category TEXT NOT NULL,
  subcategory TEXT,
  tags TEXT[],
  
  -- Related Herbs
  related_herbs UUID[],
  
  -- Pricing
  price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
  compare_at_price DECIMAL(12,2),
  cost_per_serving DECIMAL(8,2),
  currency TEXT DEFAULT 'USD',
  
  -- Inventory
  inventory_quantity INTEGER DEFAULT 0,
  inventory_policy TEXT DEFAULT 'deny' CHECK (inventory_policy IN ('deny', 'continue')),
  
  -- Variants
  has_variants BOOLEAN DEFAULT FALSE,
  options JSONB DEFAULT '[]'::JSONB,
  
  -- Media
  images TEXT[],
  featured_image TEXT,
  
  -- Shipping
  weight DECIMAL(8,2),
  weight_unit TEXT DEFAULT 'g',
  requires_shipping BOOLEAN DEFAULT TRUE,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  published_at TIMESTAMPTZ,
  
  -- Metadata
  vendor TEXT,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  
  -- Variant Details
  title TEXT NOT NULL,
  sku TEXT UNIQUE,
  
  -- Options
  option1 TEXT,
  option2 TEXT,
  option3 TEXT,
  
  -- Pricing
  price DECIMAL(12,2) NOT NULL,
  compare_at_price DECIMAL(12,2),
  
  -- Inventory
  inventory_quantity INTEGER DEFAULT 0,
  
  -- Media
  image_url TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE carts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Session cart (for non-logged in users)
  session_id TEXT,
  
  -- Contents
  items JSONB DEFAULT '[]'::JSONB,
  
  -- Totals
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax_total DECIMAL(12,2) DEFAULT 0,
  shipping_total DECIMAL(12,2) DEFAULT 0,
  discount_total DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  
  -- Currency
  currency TEXT DEFAULT 'USD',
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'converted', 'abandoned')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Order Number
  order_number TEXT UNIQUE NOT NULL,
  
  -- Contents
  items JSONB NOT NULL DEFAULT '[]'::JSONB,
  
  -- Financial
  subtotal DECIMAL(12,2) NOT NULL,
  tax_total DECIMAL(12,2) DEFAULT 0,
  shipping_total DECIMAL(12,2) DEFAULT 0,
  discount_total DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Shipping
  shipping_address JSONB,
  shipping_method TEXT,
  tracking_number TEXT,
  
  -- Payment
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
  payment_method TEXT,
  stripe_payment_intent_id TEXT,
  
  -- Fulfillment
  fulfillment_status TEXT DEFAULT 'unfulfilled' CHECK (fulfillment_status IN ('unfulfilled', 'partial', 'fulfilled', 'cancelled')),
  fulfilled_at TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'cancelled', 'completed')),
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- AI COACH SYSTEM
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE coach_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Conversation Details
  title TEXT,
  context JSONB DEFAULT '{}'::JSONB, -- User's state when conversation started
  
  -- Summary (for quick reference)
  summary TEXT,
  key_insights JSONB DEFAULT '[]'::JSONB,
  action_items JSONB DEFAULT '[]'::JSONB,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_pinned BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE coach_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES coach_conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Message Content
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  
  -- AI Metadata
  model TEXT,
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  
  -- Context (what the AI knew when responding)
  context_snapshot JSONB,
  
  -- Feedback
  user_feedback TEXT CHECK (user_feedback IN ('helpful', 'not_helpful', null)),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE coach_memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Memory Content
  category TEXT NOT NULL, -- e.g., 'preference', 'goal', 'insight', 'pattern'
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  confidence DECIMAL(3,2) DEFAULT 1.0,
  
  -- Source
  source_message_id UUID REFERENCES coach_messages(id),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, category, key)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- COMMUNITY & SOCIAL
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Content
  content TEXT NOT NULL,
  content_html TEXT,
  
  -- Media
  images TEXT[],
  
  -- Engagement
  view_count INTEGER DEFAULT 0,
  
  -- Status
  is_pinned BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'hidden', 'removed')),
  
  -- Metadata
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE, -- For nested comments
  
  -- Content
  content TEXT NOT NULL,
  
  -- Status
  is_edited BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'removed')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE post_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('fire', 'heart', 'clap', 'insightful', 'supportive')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(post_id, user_id, reaction_type)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- NOTIFICATIONS SYSTEM
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Content
  type TEXT NOT NULL, -- 'habit_reminder', 'streak_milestone', 'coach_message', 'community_mention', etc.
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  
  -- Deep Link
  action_url TEXT,
  action_type TEXT,
  action_data JSONB,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Delivery
  delivered_at TIMESTAMPTZ,
  delivery_method TEXT[], -- ['push', 'email', 'in_app']
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- QUOTES & MOTIVATION
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Content
  text TEXT NOT NULL,
  author TEXT,
  author_title TEXT,
  
  -- Categorization
  categories TEXT[],
  personas TEXT[],
  
  -- Media
  background_image TEXT,
  
  -- Status
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  
  -- Engagement
  save_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE saved_quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE NOT NULL,
  
  -- User Notes
  notes TEXT,
  
  -- Metadata
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, quote_id)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- WEEKLY INTENTIONS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE weekly_intentions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  
  -- Intentions
  priority TEXT,
  protect TEXT,
  body_care TEXT,
  gratitude TEXT,
  
  -- Goals for the week
  goals JSONB DEFAULT '[]'::JSONB,
  
  -- Review
  week_review TEXT,
  wins JSONB DEFAULT '[]'::JSONB,
  learnings JSONB DEFAULT '[]'::JSONB,
  
  -- Status
  is_completed BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, week_start)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- ACTIVITY LOG (For Analytics & AI Context)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Activity Details
  activity_type TEXT NOT NULL, -- 'page_view', 'habit_complete', 'checkin', 'purchase', etc.
  entity_type TEXT, -- 'habit', 'post', 'product', etc.
  entity_id UUID,
  
  -- Context
  metadata JSONB DEFAULT '{}'::JSONB,
  
  -- Device/Location
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- APP SETTINGS & CONFIGURATION
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE app_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES admin_users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- INDEXES FOR PERFORMANCE
-- ═══════════════════════════════════════════════════════════════════════════════

-- Profiles
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_subscription ON profiles(subscription_tier, subscription_status);

-- Checkins
CREATE INDEX idx_checkins_user_date ON daily_checkins(user_id, date DESC);
CREATE INDEX idx_checkins_date ON daily_checkins(date);

-- Day Plans
CREATE INDEX idx_day_plans_user_date ON hybrid_day_plans(user_id, date DESC);

-- Day Blocks
CREATE INDEX idx_day_blocks_plan ON day_blocks(plan_id, block_order);
CREATE INDEX idx_day_blocks_completed ON day_blocks(is_completed, completed_at);

-- Habits
CREATE INDEX idx_habits_user ON habits(user_id, is_active);

-- Habit Completions
CREATE INDEX idx_habit_completions_user_date ON habit_completions(user_id, date DESC);
CREATE INDEX idx_habit_completions_habit ON habit_completions(habit_id, date DESC);

-- Financial
CREATE INDEX idx_income_user_date ON income_entries(user_id, date DESC);
CREATE INDEX idx_savings_user ON savings_entries(user_id, date DESC);
CREATE INDEX idx_spending_user_date ON spending_entries(user_id, date DESC);
CREATE INDEX idx_spending_category ON spending_entries(category_id, date DESC);

-- Places (PostGIS)
CREATE INDEX idx_places_location ON places USING GIST(location);
CREATE INDEX idx_places_types ON places USING GIN(types);

-- Community
CREATE INDEX idx_posts_user ON community_posts(user_id, created_at DESC);
CREATE INDEX idx_posts_featured ON community_posts(is_featured, created_at DESC);
CREATE INDEX idx_comments_post ON post_comments(post_id, created_at DESC);

-- AI Coach
CREATE INDEX idx_coach_conversations_user ON coach_conversations(user_id, last_message_at DESC);
CREATE INDEX idx_coach_messages_conversation ON coach_messages(conversation_id, created_at);

-- Notifications
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

-- Activity Logs
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id, created_at DESC);
CREATE INDEX idx_activity_logs_type ON activity_logs(activity_type, created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE hybrid_day_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE spending_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE spending_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE herbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_herbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_intentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own, admins can read all
CREATE POLICY "profiles_user_own" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Invite Codes: Only admins can manage, but users can read to validate
CREATE POLICY "invite_codes_admin" ON invite_codes
  FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = TRUE));

CREATE POLICY "invite_codes_read" ON invite_codes
  FOR SELECT USING (TRUE);

-- Admin Users: Only super admins can manage
CREATE POLICY "admin_users_super" ON admin_users
  FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'super_admin'));

-- Daily Checkins: Users own their data
CREATE POLICY "checkins_user_own" ON daily_checkins
  FOR ALL USING (auth.uid() = user_id);

-- Day Plans: Users own their data
CREATE POLICY "day_plans_user_own" ON hybrid_day_plans
  FOR ALL USING (auth.uid() = user_id);

-- Day Blocks: Users own through plan
CREATE POLICY "day_blocks_user_own" ON day_blocks
  FOR ALL USING (EXISTS (SELECT 1 FROM hybrid_day_plans WHERE id = day_blocks.plan_id AND user_id = auth.uid()));

-- Habits: Users own their habits
CREATE POLICY "habits_user_own" ON habits
  FOR ALL USING (auth.uid() = user_id);

-- Habit Completions: Users own their completions
CREATE POLICY "habit_completions_user_own" ON habit_completions
  FOR ALL USING (auth.uid() = user_id);

-- Financial entries: Users own their data
CREATE POLICY "income_user_own" ON income_entries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "savings_goals_user_own" ON savings_goals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "savings_entries_user_own" ON savings_entries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "spending_categories_user_own" ON spending_categories
  FOR ALL USING (auth.uid() = user_id OR is_system = TRUE);

CREATE POLICY "spending_entries_user_own" ON spending_entries
  FOR ALL USING (auth.uid() = user_id);

-- Herbs: Public read, admin write
CREATE POLICY "herbs_public_read" ON herbs
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "herbs_admin_write" ON herbs
  FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = TRUE));

-- Saved Herbs: Users own
CREATE POLICY "saved_herbs_user_own" ON saved_herbs
  FOR ALL USING (auth.uid() = user_id);

-- Protocols: Public read, admin write
CREATE POLICY "protocols_public_read" ON protocols
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "protocols_admin_write" ON protocols
  FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = TRUE));

-- Places: Public read, verified users can submit
CREATE POLICY "places_public_read" ON places
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "places_user_submit" ON places
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "places_admin_manage" ON places
  FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = TRUE));

-- Saved Places: Users own
CREATE POLICY "saved_places_user_own" ON saved_places
  FOR ALL USING (auth.uid() = user_id);

-- Place Reviews: Public read, users own their reviews
CREATE POLICY "place_reviews_public_read" ON place_reviews
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY "place_reviews_user_own" ON place_reviews
  FOR ALL USING (auth.uid() = user_id);

-- Products: Public read, admin write
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (status = 'active');

CREATE POLICY "products_admin_write" ON products
  FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = TRUE));

-- Carts: Users own
CREATE POLICY "carts_user_own" ON carts
  FOR ALL USING (auth.uid() = user_id OR session_id = current_setting('app.session_id', TRUE));

-- Orders: Users own
CREATE POLICY "orders_user_own" ON orders
  FOR ALL USING (auth.uid() = user_id);

-- AI Coach: Users own their conversations
CREATE POLICY "coach_conversations_user_own" ON coach_conversations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "coach_messages_user_own" ON coach_messages
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "coach_memories_user_own" ON coach_memories
  FOR ALL USING (auth.uid() = user_id);

-- Community: Public read, users own their content
CREATE POLICY "community_posts_public_read" ON community_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "community_posts_user_own" ON community_posts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "post_comments_public_read" ON post_comments
  FOR SELECT USING (status = 'published');

CREATE POLICY "post_comments_user_own" ON post_comments
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "post_reactions_user_own" ON post_reactions
  FOR ALL USING (auth.uid() = user_id);

-- Notifications: Users own
CREATE POLICY "notifications_user_own" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- Quotes: Public read, admin write
CREATE POLICY "quotes_public_read" ON quotes
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "quotes_admin_write" ON quotes
  FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = TRUE));

-- Saved Quotes: Users own
CREATE POLICY "saved_quotes_user_own" ON saved_quotes
  FOR ALL USING (auth.uid() = user_id);

-- Weekly Intentions: Users own
CREATE POLICY "weekly_intentions_user_own" ON weekly_intentions
  FOR ALL USING (auth.uid() = user_id);

-- Activity Logs: Users own (for privacy)
CREATE POLICY "activity_logs_user_own" ON activity_logs
  FOR ALL USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checkins_updated_at BEFORE UPDATE ON daily_checkins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_day_plans_updated_at BEFORE UPDATE ON hybrid_day_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_day_blocks_updated_at BEFORE UPDATE ON day_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_updated_at BEFORE UPDATE ON income_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_savings_goals_updated_at BEFORE UPDATE ON savings_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spending_updated_at BEFORE UPDATE ON spending_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_herbs_updated_at BEFORE UPDATE ON herbs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_protocols_updated_at BEFORE UPDATE ON protocols
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON places
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_comments_updated_at BEFORE UPDATE ON post_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_intentions_updated_at BEFORE UPDATE ON weekly_intentions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, onboarding_done)
  VALUES (NEW.id, NEW.email, '', FALSE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Calculate streak for habits
CREATE OR REPLACE FUNCTION calculate_habit_streak(habit_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER := 0;
  current_date DATE := CURRENT_DATE;
  completion_record RECORD;
BEGIN
  FOR completion_record IN
    SELECT date FROM habit_completions
    WHERE habit_id = habit_uuid AND completed = TRUE
    ORDER BY date DESC
  LOOP
    IF completion_record.date = current_date OR completion_record.date = current_date - INTERVAL '1 day' THEN
      streak := streak + 1;
      current_date := completion_record.date - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;
  END LOOP;
  
  RETURN streak;
END;
$$ LANGUAGE plpgsql;

-- Update habit streak on completion
CREATE OR REPLACE FUNCTION update_habit_streak_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = TRUE THEN
    UPDATE habits
    SET streak_days = calculate_habit_streak(NEW.habit_id),
        total_completions = total_completions + 1,
        longest_streak = GREATEST(longest_streak, calculate_habit_streak(NEW.habit_id))
    WHERE id = NEW.habit_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_habit_completion
  AFTER INSERT OR UPDATE ON habit_completions
  FOR EACH ROW EXECUTE FUNCTION update_habit_streak_on_completion();

-- Update conversation message count and last message time
CREATE OR REPLACE FUNCTION update_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE coach_conversations
  SET message_count = message_count + 1,
      last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_coach_message
  AFTER INSERT ON coach_messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_stats();

-- Insert default spending categories for new users
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO spending_categories (user_id, name, icon, color, is_wellness, is_system) VALUES
    (NEW.id, 'Food & Groceries', '🥗', '#6DB89A', TRUE, FALSE),
    (NEW.id, 'Supplements', '💊', '#F0A050', TRUE, FALSE),
    (NEW.id, 'Gym & Fitness', '🏋️', '#9B8EF0', TRUE, FALSE),
    (NEW.id, 'Personal Care', '🛁', '#78B8E8', TRUE, FALSE),
    (NEW.id, 'Eating Out', '☕', '#E87878', FALSE, FALSE),
    (NEW.id, 'Transport', '🚗', '#686E7A', FALSE, FALSE),
    (NEW.id, 'Entertainment', '🎭', '#C8A84A', FALSE, FALSE),
    (NEW.id, 'Bills', '🏠', '#686E7A', FALSE, TRUE);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_default_categories();

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEED DATA
-- ═══════════════════════════════════════════════════════════════════════════════

-- System spending categories (available to all users)
INSERT INTO spending_categories (name, icon, color, is_wellness, is_system) VALUES
  ('Food & Groceries', '🥗', '#6DB89A', TRUE, TRUE),
  ('Supplements & Vitamins', '💊', '#F0A050', TRUE, TRUE),
  ('Health Foods', '🧃', '#6DB89A', TRUE, TRUE),
  ('Skincare & Beauty', '🧴', '#9B8EF0', TRUE, TRUE),
  ('Personal Care', '🛁', '#78B8E8', TRUE, TRUE),
  ('Gym & Fitness', '🏋️', '#9B8EF0', TRUE, TRUE),
  ('Classes & Studios', '🧘', '#C8A84A', TRUE, TRUE),
  ('Pool & Sauna', '🏊', '#78B8E8', TRUE, TRUE),
  ('Sports Equipment', '👟', '#F0A050', TRUE, TRUE),
  ('Therapy & Coaching', '🧠', '#9B8EF0', TRUE, TRUE),
  ('Medical & Dental', '🏥', '#E87878', TRUE, TRUE),
  ('Books & Learning', '📚', '#C8A84A', TRUE, TRUE),
  ('Retreats & Wellness', '🌿', '#6DB89A', TRUE, TRUE),
  ('Eating Out', '☕', '#E87878', FALSE, TRUE),
  ('Transport', '🚗', '#686E7A', FALSE, TRUE),
  ('Clothing', '👗', '#9B8EF0', FALSE, TRUE),
  ('Entertainment', '🎭', '#C8A84A', FALSE, TRUE),
  ('Subscriptions', '📱', '#686E7A', FALSE, TRUE),
  ('Bills & Utilities', '🏠', '#686E7A', FALSE, TRUE),
  ('Travel', '✈️', '#78B8E8', FALSE, TRUE),
  ('Software & Tools', '💻', '#9B8EF0', FALSE, TRUE),
  ('Marketing', '📣', '#F0A050', FALSE, TRUE),
  ('Other', '📦', '#686E7A', FALSE, TRUE);

-- Seed herbs
INSERT INTO herbs (name, latin_name, slug, description, short_description, category, benefits, uses, evidence_level, dosage, cautions, icon, is_published, published_at) VALUES
  ('Ashwagandha', 'Withania somnifera', 'ashwagandha', 'An ancient adaptogenic herb used in Ayurvedic medicine for over 3,000 years. Known for its ability to reduce stress, improve cognitive function, and support overall vitality.', 'Ancient adaptogen for stress and vitality', ARRAY['adaptogen', 'stress', 'cognitive'], ARRAY['stress reduction', 'anxiety relief', 'sleep support', 'cognitive enhancement', 'hormonal balance'], ARRAY['burnout', 'anxiety', 'sleep', 'cognitive'], 'strong', '300-600mg KSM-66 extract daily', ARRAY['Avoid during pregnancy', 'May interact with thyroid medications', 'Consult doctor if on sedatives'], '🌿', TRUE, NOW()),
  ('Magnesium Glycinate', 'Magnesium bisglycinate', 'magnesium-glycinate', 'A highly bioavailable form of magnesium that supports over 300 biochemical reactions in the body. Essential for muscle relaxation, sleep quality, and nervous system regulation.', 'Highly absorbable magnesium for sleep and recovery', ARRAY['mineral', 'sleep', 'recovery'], ARRAY['sleep quality', 'muscle recovery', 'anxiety relief', 'bone health', 'heart health'], ARRAY['sleep', 'recovery', 'anxiety', 'athlete'], 'strong', '200-400mg before bed', ARRAY['High doses may cause loose stools', 'Start with lower dose'], '🫚', TRUE, NOW()),
  ('Lion''s Mane', 'Hericium erinaceus', 'lions-mane', 'A unique medicinal mushroom that stimulates nerve growth factor (NGF) production. Supports cognitive function, memory, and neurological health.', 'Cognitive mushroom for brain health and focus', ARRAY['mushroom', 'cognitive', 'nootropic'], ARRAY['memory enhancement', 'focus', 'nerve regeneration', 'mood support', 'neuroprotection'], ARRAY['focus', 'memory', 'cognitive', 'entrepreneur'], 'moderate', '500-1000mg extract daily', ARRAY['May cause mild digestive discomfort', 'Avoid if allergic to mushrooms'], '🌱', TRUE, NOW()),
  ('Turmeric + Black Pepper', 'Curcuma longa', 'turmeric-black-pepper', 'A powerful anti-inflammatory combination. Curcumin from turmeric with piperine from black pepper for enhanced absorption.', 'Potent anti-inflammatory with enhanced absorption', ARRAY['anti-inflammatory', 'joint health', 'antioxidant'], ARRAY['inflammation reduction', 'joint pain relief', 'antioxidant support', 'digestive health', 'brain health'], ARRAY['inflammation', 'joint pain', 'recovery', 'athlete'], 'strong', '500-1000mg curcumin with 5-10mg piperine', ARRAY['Blood thinning at high doses', 'Caution with warfarin', 'Stop before surgery'], '🟡', TRUE, NOW()),
  ('Saffron', 'Crocus sativus', 'saffron', 'The world''s most expensive spice, backed by impressive research for mood, PMS, and menopausal symptoms.', 'Premium spice for mood and hormonal balance', ARRAY['mood', 'women health', 'antioxidant'], ARRAY['mood enhancement', 'PMS relief', 'menopause support', 'libido', 'eye health'], ARRAY['mood', 'PMS', 'menopause', 'women'], 'strong', '30mg daily (15mg twice daily)', ARRAY['Avoid during pregnancy', 'Expensive - use consistently'], '🌼', TRUE, NOW()),
  ('L-Theanine', 'L-Theanine', 'l-theanine', 'An amino acid found in green tea that promotes calm alertness without drowsiness. Perfect for focus and stress management.', 'Calm focus from green tea', ARRAY['amino acid', 'calm', 'focus'], ARRAY['calm alertness', 'focus enhancement', 'stress reduction', 'sleep quality', 'caffeine synergy'], ARRAY['focus', 'anxiety', 'sleep', 'entrepreneur'], 'strong', '100-200mg daily', ARRAY['Generally very safe', 'No significant interactions'], '💤', TRUE, NOW());

-- Seed quotes
INSERT INTO quotes (text, author, categories, is_published) VALUES
  ('You don''t have to be extreme, just consistent.', 'Unknown', ARRAY['consistency', 'motivation'], TRUE),
  ('The secret of getting ahead is getting started.', 'Mark Twain', ARRAY['action', 'motivation'], TRUE),
  ('Rest is not quitting. Rest is getting ready for the next move.', 'Unknown', ARRAY['rest', 'recovery'], TRUE),
  ('Discipline is choosing what you want most over what you want now.', 'Abraham Lincoln', ARRAY['discipline', 'focus'], TRUE),
  ('Progress, not perfection.', 'Unknown', ARRAY['growth', 'mindset'], TRUE),
  ('Take care of your body. It''s the only place you have to live.', 'Jim Rohn', ARRAY['health', 'wellness'], TRUE),
  ('You are enough. You have enough. You do enough.', 'Unknown', ARRAY['self-love', 'mindset'], TRUE),
  ('Small steps every day lead to big changes.', 'Unknown', ARRAY['consistency', 'growth'], TRUE),
  ('Your future self is watching you right now.', 'Unknown', ARRAY['accountability', 'vision'], TRUE),
  ('The only bad workout is the one that didn''t happen.', 'Unknown', ARRAY['fitness', 'action'], TRUE);

-- ═══════════════════════════════════════════════════════════════════════════════
-- COMPLETED
-- ═══════════════════════════════════════════════════════════════════════════════
