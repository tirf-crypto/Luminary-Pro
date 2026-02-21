// ═══════════════════════════════════════════════════════════════════════════════
// LUMINARY PRO — TYPESCRIPT TYPES
// Complete type definitions for the wellness operating system
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// CORE USER TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type PersonaType = 
  | 'athlete' 
  | 'entrepreneur' 
  | 'freelancer' 
  | 'burnout_recovery' 
  | 'menopause_wellness' 
  | 'optimizer'
  | 'parent'
  | 'student';

export type BiologicalSex = 'female' | 'male' | 'non_binary' | 'prefer_not_to_say';

export type TrainingPreference = 'morning' | 'midday' | 'afternoon' | 'evening';

export type SubscriptionTier = 'free' | 'premium' | 'founder';

export type Theme = 'dark' | 'light' | 'auto';

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  avatar_emoji: string;
  biological_sex: BiologicalSex | null;
  date_of_birth: string | null;
  timezone: string;
  locale: string;
  active_personas: PersonaType[];
  primary_persona: PersonaType;
  goals: string[];
  why_statement: string | null;
  vision_board: VisionBoardItem[];
  wake_time: string;
  sleep_time: string;
  work_start: string;
  work_end: string;
  training_preference: TrainingPreference;
  currency: string;
  monthly_income: number;
  monthly_savings_goal: number;
  theme: Theme;
  notifications_enabled: boolean;
  haptics_enabled: boolean;
  sounds_enabled: boolean;
  subscription_tier: SubscriptionTier;
  subscription_status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  total_xp: number;
  level: number;
  streak_days: number;
  longest_streak: number;
  perfect_days: number;
  is_onboarded: boolean;
  is_active: boolean;
  last_active_at: string;
  created_at: string;
  updated_at: string;
}

export interface VisionBoardItem {
  id: string;
  image_url: string;
  caption: string;
  order: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTHENTICATION TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface InviteCode {
  id: string;
  code: string;
  created_by: string | null;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  used_by: string[];
  note: string | null;
  created_at: string;
}

export interface AdminUser {
  id: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'content_manager';
  permissions: string[];
  granted_by: string | null;
  granted_at: string;
  revoked_at: string | null;
  is_active: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DAILY WELLNESS TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface DailyCheckin {
  id: string;
  user_id: string;
  date: string;
  energy_score: number;
  mood_score: number;
  focus_score: number;
  stress_score: number;
  sleep_quality: number;
  average_score: number;
  day_word: string | null;
  journal_entry: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type DayMode = 'recovery' | 'balanced' | 'performance' | 'flow';

export type BlockType = 
  | 'wake' 
  | 'light' 
  | 'cold_exposure' 
  | 'breathwork' 
  | 'meal' 
  | 'training' 
  | 'focus' 
  | 'deep_work' 
  | 'admin' 
  | 'break' 
  | 'care' 
  | 'reading' 
  | 'personal' 
  | 'transition' 
  | 'sleep' 
  | 'milestone';

export type EnergyLevel = 'low' | 'medium' | 'high';

export interface DayBlock {
  id: string;
  plan_id: string;
  block_order: number;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  type: BlockType;
  title: string;
  description: string | null;
  icon: string | null;
  energy_required: EnergyLevel;
  personas: PersonaType[];
  science_note: string | null;
  pro_tip: string | null;
  is_completed: boolean;
  completed_at: string | null;
  is_skipped: boolean;
  skipped_at: string | null;
  skip_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface HybridDayPlan {
  id: string;
  user_id: string;
  date: string;
  blocks: DayBlock[];
  completion_percentage: number;
  day_mode: DayMode;
  generation_context: Record<string, unknown>;
  ai_insights: string | null;
  ai_recommendations: AIRecommendation[];
  generated_at: string;
  updated_at: string;
}

export interface AIRecommendation {
  id: string;
  type: 'habit' | 'supplement' | 'protocol' | 'mindset';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

// ═══════════════════════════════════════════════════════════════════════════════
// HABIT TRACKING TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type HabitFrequency = 'daily' | 'weekly' | 'custom';

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string;
  category: string | null;
  persona: PersonaType | null;
  frequency: HabitFrequency;
  target_days: number[];
  target_time: string | null;
  reminder_time: string | null;
  target_count: number;
  unit: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  streak_days: number;
  longest_streak: number;
  total_completions: number;
  created_at: string;
  updated_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  completed_at: string;
  count: number;
  notes: string | null;
  mood_at_completion: number | null;
  energy_at_completion: number | null;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FINANCIAL WELLNESS TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface IncomeEntry {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  source: string;
  description: string | null;
  category: string | null;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  date: string;
  received_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  emoji: string;
  color: string;
  target_amount: number;
  current_amount: number;
  currency: string;
  target_date: string | null;
  started_at: string;
  completed_at: string | null;
  is_active: boolean;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavingsEntry {
  id: string;
  user_id: string;
  goal_id: string | null;
  amount: number;
  currency: string;
  account_name: string;
  note: string | null;
  source: string | null;
  date: string;
  created_at: string;
}

export interface SpendingCategory {
  id: string;
  user_id: string | null;
  name: string;
  icon: string | null;
  color: string | null;
  is_wellness: boolean;
  is_essential: boolean;
  monthly_budget: number | null;
  is_system: boolean;
  created_at: string;
}

export interface SpendingEntry {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  currency: string;
  description: string | null;
  merchant_name: string | null;
  merchant_category: string | null;
  is_wellness: boolean;
  wellness_tags: string[];
  receipt_url: string | null;
  date: string;
  transaction_at: string | null;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// WELLNESS LIBRARY TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type EvidenceLevel = 'strong' | 'moderate' | 'limited' | 'anecdotal';

export interface Herb {
  id: string;
  name: string;
  latin_name: string | null;
  slug: string;
  description: string;
  short_description: string | null;
  category: string[];
  benefits: string[];
  uses: string[];
  evidence_level: EvidenceLevel;
  research_summary: string | null;
  studies: Study[];
  dosage: string;
  dosage_details: Record<string, unknown>;
  cautions: string[];
  contraindications: string[];
  side_effects: string[];
  interactions: string[];
  image_url: string | null;
  icon: string | null;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Study {
  title: string;
  authors: string;
  journal: string;
  year: number;
  url: string;
  findings: string;
}

export interface SavedHerb {
  id: string;
  user_id: string;
  herb_id: string;
  notes: string | null;
  personal_dosage: string | null;
  reminder_enabled: boolean;
  reminder_time: string | null;
  saved_at: string;
  herb?: Herb;
}

export interface Protocol {
  id: string;
  name: string;
  slug: string;
  description: string;
  steps: ProtocolStep[];
  duration: string | null;
  frequency: string | null;
  category: string | null;
  benefits: string[];
  personas: PersonaType[];
  evidence_level: EvidenceLevel | null;
  research_summary: string | null;
  image_url: string | null;
  icon: string | null;
  video_url: string | null;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProtocolStep {
  order: number;
  title: string;
  description: string;
  duration: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOCATION DISCOVERY TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type PlaceType = 
  | 'sauna' 
  | 'cold_plunge' 
  | 'gym' 
  | 'pool' 
  | 'yoga_studio' 
  | 'meditation_center'
  | 'wellness_center'
  | 'therapist'
  | 'herbal_store'
  | 'cryotherapy'
  | 'float_tank'
  | 'massage';

export interface Place {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  address: string;
  city: string;
  state: string | null;
  country: string;
  postal_code: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  email: string | null;
  website: string | null;
  types: PlaceType[];
  amenities: string[];
  hours: Record<string, string>;
  pricing: Record<string, number>;
  images: string[];
  average_rating: number;
  review_count: number;
  is_verified: boolean;
  is_active: boolean;
  source: string;
  external_id: string | null;
  submitted_by: string | null;
  verified_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavedPlace {
  id: string;
  user_id: string;
  place_id: string;
  notes: string | null;
  personal_rating: number | null;
  visit_count: number;
  last_visited_at: string | null;
  list_name: string;
  saved_at: string;
  place?: Place;
}

export interface PlaceReview {
  id: string;
  place_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string;
  cleanliness_rating: number | null;
  staff_rating: number | null;
  facilities_rating: number | null;
  value_rating: number | null;
  photos: string[];
  is_verified_visit: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHOP/MARKETPLACE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type ProductStatus = 'draft' | 'active' | 'archived';

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string;
  short_description: string | null;
  category: string;
  subcategory: string | null;
  tags: string[];
  related_herbs: string[];
  price: number;
  compare_at_price: number | null;
  cost_per_serving: number | null;
  currency: string;
  inventory_quantity: number;
  inventory_policy: string;
  has_variants: boolean;
  options: ProductOption[];
  images: string[];
  featured_image: string | null;
  weight: number | null;
  weight_unit: string;
  requires_shipping: boolean;
  meta_title: string | null;
  meta_description: string | null;
  status: ProductStatus;
  published_at: string | null;
  vendor: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  title: string;
  sku: string | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  price: number;
  compare_at_price: number | null;
  inventory_quantity: number;
  image_url: string | null;
  is_active: boolean;
}

export interface Cart {
  id: string;
  user_id: string | null;
  session_id: string | null;
  items: CartItem[];
  subtotal: number;
  tax_total: number;
  shipping_total: number;
  discount_total: number;
  total: number;
  currency: string;
  status: 'active' | 'converted' | 'abandoned';
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  price: number;
  product?: Product;
  variant?: ProductVariant;
}

export type OrderStatus = 'open' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
export type FulfillmentStatus = 'unfulfilled' | 'partial' | 'fulfilled' | 'cancelled';

export interface Order {
  id: string;
  user_id: string | null;
  order_number: string;
  items: OrderItem[];
  subtotal: number;
  tax_total: number;
  shipping_total: number;
  discount_total: number;
  total: number;
  currency: string;
  shipping_address: ShippingAddress | null;
  shipping_method: string | null;
  tracking_number: string | null;
  payment_status: PaymentStatus;
  payment_method: string | null;
  stripe_payment_intent_id: string | null;
  fulfillment_status: FulfillmentStatus;
  fulfilled_at: string | null;
  status: OrderStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  variant_id: string | null;
  name: string;
  quantity: number;
  price: number;
  total: number;
  product?: Product;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI COACH TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface CoachConversation {
  id: string;
  user_id: string;
  title: string | null;
  context: Record<string, unknown>;
  summary: string | null;
  key_insights: string[];
  action_items: ActionItem[];
  is_active: boolean;
  is_pinned: boolean;
  message_count: number;
  last_message_at: string | null;
  created_at: string;
}

export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
  due_date: string | null;
}

export interface CoachMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model: string | null;
  tokens_used: number | null;
  processing_time_ms: number | null;
  context_snapshot: Record<string, unknown> | null;
  user_feedback: 'helpful' | 'not_helpful' | null;
  created_at: string;
}

export interface CoachMemory {
  id: string;
  user_id: string;
  category: string;
  key: string;
  value: string;
  confidence: number;
  source_message_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMMUNITY TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type PostStatus = 'draft' | 'published' | 'hidden' | 'removed';
export type ReactionType = 'fire' | 'heart' | 'clap' | 'insightful' | 'supportive';

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  content_html: string | null;
  images: string[];
  view_count: number;
  is_pinned: boolean;
  is_featured: boolean;
  status: PostStatus;
  published_at: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
  reactions?: PostReaction[];
  comments?: PostComment[];
  reaction_counts?: Record<ReactionType, number>;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  is_edited: boolean;
  status: PostStatus;
  created_at: string;
  updated_at: string;
  author?: Profile;
  replies?: PostComment[];
}

export interface PostReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATION TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type NotificationType = 
  | 'habit_reminder' 
  | 'streak_milestone' 
  | 'coach_message' 
  | 'community_mention' 
  | 'community_reply'
  | 'goal_achieved'
  | 'daily_checkin'
  | 'weekly_review'
  | 'place_nearby'
  | 'herb_reminder'
  | 'order_update'
  | 'subscription'
  | 'system';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  action_url: string | null;
  action_type: string | null;
  action_data: Record<string, unknown> | null;
  is_read: boolean;
  read_at: string | null;
  delivered_at: string | null;
  delivery_method: string[];
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUOTES & MOTIVATION TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface Quote {
  id: string;
  text: string;
  author: string | null;
  author_title: string | null;
  categories: string[];
  personas: PersonaType[];
  background_image: string | null;
  is_featured: boolean;
  is_published: boolean;
  save_count: number;
  share_count: number;
  created_by: string | null;
  created_at: string;
}

export interface SavedQuote {
  id: string;
  user_id: string;
  quote_id: string;
  notes: string | null;
  saved_at: string;
  quote?: Quote;
}

// ═══════════════════════════════════════════════════════════════════════════════
// WEEKLY INTENTIONS TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface WeeklyIntention {
  id: string;
  user_id: string;
  week_start: string;
  priority: string | null;
  protect: string | null;
  body_care: string | null;
  gratitude: string | null;
  goals: WeeklyGoal[];
  week_review: string | null;
  wins: string[];
  learnings: string[];
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface WeeklyGoal {
  id: string;
  text: string;
  category: string;
  is_completed: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ActivityLog {
  id: string;
  user_id: string | null;
  activity_type: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UI/UX TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string | null;
  duration: number;
  action?: { label: string; onClick: () => void } | null;
}

export interface ModalState {
  isOpen: boolean;
  title: string | null;
  content: React.ReactNode | null;
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ═══════════════════════════════════════════════════════════════════════════════
// API RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  meta?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details: Record<string, string[]> | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ═══════════════════════════════════════════════════════════════════════════════
// ADDITIONAL TYPES FOR HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

export interface FinanceSummary {
  monthlyIncome: number;
  monthlySpending: number;
  monthlySavings: number;
  totalSaved: number;
  totalGoalsTarget: number;
  spendingByCategory: {
    category: SpendingCategory;
    spent: number;
    budget: number;
    percentage: number;
  }[];
  availableToSpend: number;
  savingsRate: number;
}

export interface ProfileUpdate {
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  biological_sex?: string;
  wake_time?: string;
  work_start?: string;
  work_end?: string;
  training_preference?: string;
  personas?: string[];
  goals?: string[];
  why?: string;
  settings?: Record<string, any>;
}

export interface CheckinCreate {
  energy: number;
  clarity: number;
  body: number;
  mood: string;
  notes?: string;
}
