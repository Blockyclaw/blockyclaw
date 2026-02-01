// User
export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  github_username: string | null;
  stripe_account_id: string | null;
  is_seller: boolean;
  created_at: string;
}

// Category
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  parent_id: string | null;
}

// Skill
export interface Skill {
  id: string;
  seller_id: string;
  title: string;
  slug: string;
  description: string;
  long_description: string | null;
  price: number; // cents
  license_type: 'personal' | 'team' | 'enterprise';
  team_price: number | null;
  enterprise_price: number | null;
  github_repo_url: string | null;
  demo_video_url: string | null;
  demo_images: string[];
  skill_md_content: string;
  version: string;
  claude_code_version_min: string | null;
  claude_code_version_max: string | null;
  category_id: string | null;
  tags: string[];
  is_published: boolean;
  is_featured: boolean;
  download_count: number;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
  // Relations
  seller?: User;
  category?: Category;
}

// Skill Version History
export interface SkillVersion {
  id: string;
  skill_id: string;
  version: string;
  changelog: string | null;
  skill_md_content: string;
  created_at: string;
}

// Bundle
export interface Bundle {
  id: string;
  seller_id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discount_percent: number;
  skill_ids: string[];
  is_published: boolean;
  created_at: string;
}

// Purchase
export interface Purchase {
  id: string;
  buyer_id: string;
  skill_id: string | null;
  bundle_id: string | null;
  license_type: 'personal' | 'team' | 'enterprise';
  price_paid: number;
  stripe_payment_intent_id: string;
  status: 'completed' | 'refunded' | 'disputed';
  created_at: string;
  // Relations
  skill?: Skill;
  bundle?: Bundle;
}

// Subscription
export interface Subscription {
  id: string;
  buyer_id: string;
  skill_id: string;
  stripe_subscription_id: string;
  status: 'active' | 'canceled' | 'past_due';
  current_period_start: string;
  current_period_end: string;
  created_at: string;
}

// Review
export interface Review {
  id: string;
  skill_id: string;
  buyer_id: string;
  rating: number; // 1-5
  title: string | null;
  content: string | null;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  buyer?: User;
}

// Favorite
export interface Favorite {
  id: string;
  user_id: string;
  skill_id: string;
  created_at: string;
}

// Case Study
export interface CaseStudy {
  id: string;
  skill_id: string;
  company_name: string;
  company_logo_url: string | null;
  title: string;
  content: string;
  is_approved: boolean;
  created_at: string;
}

// Custom Request
export interface CustomRequest {
  id: string;
  requester_id: string;
  skill_id: string | null;
  seller_id: string | null;
  title: string;
  description: string;
  budget_min: number | null;
  budget_max: number | null;
  status: 'open' | 'in_progress' | 'completed' | 'canceled';
  created_at: string;
}

// Feature
export interface Feature {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url: string | null;
  skill_ids: string[];
  is_published: boolean;
  display_order: number;
  created_at: string;
}
