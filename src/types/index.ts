// ユーザー
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

// カテゴリ
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  parent_id: string | null;
}

// スキル
export interface Skill {
  id: string;
  seller_id: string;
  title: string;
  slug: string;
  description: string;
  long_description: string | null;
  price: number; // 円
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

// スキルバージョン履歴
export interface SkillVersion {
  id: string;
  skill_id: string;
  version: string;
  changelog: string | null;
  skill_md_content: string;
  created_at: string;
}

// バンドル
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

// 購入
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

// サブスクリプション
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

// レビュー
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

// お気に入り
export interface Favorite {
  id: string;
  user_id: string;
  skill_id: string;
  created_at: string;
}

// 導入事例
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

// カスタマイズ依頼
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

// 特集
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
