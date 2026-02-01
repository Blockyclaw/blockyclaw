-- SkillsMP Trade Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- Users (extends Supabase auth.users)
-- =====================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  github_username TEXT,
  stripe_account_id TEXT, -- Stripe Connect account for sellers
  is_seller BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- Categories
-- =====================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT, -- Lucide icon name
  parent_id UUID REFERENCES public.categories(id),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- Skills
-- =====================
CREATE TYPE license_type AS ENUM ('personal', 'team', 'enterprise');

CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL, -- Short description
  long_description TEXT, -- Markdown content
  price INTEGER NOT NULL DEFAULT 0, -- Price in JPY
  license_type license_type DEFAULT 'personal',
  team_price INTEGER, -- Price for team license
  enterprise_price INTEGER, -- Price for enterprise license
  github_repo_url TEXT,
  demo_video_url TEXT,
  demo_images TEXT[] DEFAULT '{}',
  skill_md_content TEXT NOT NULL, -- The actual SKILL.md content
  version TEXT DEFAULT '1.0.0',
  claude_code_version_min TEXT,
  claude_code_version_max TEXT,
  category_id UUID REFERENCES public.categories(id),
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  download_count INTEGER DEFAULT 0,
  rating_avg NUMERIC(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_skills_seller ON public.skills(seller_id);
CREATE INDEX idx_skills_category ON public.skills(category_id);
CREATE INDEX idx_skills_published ON public.skills(is_published);
CREATE INDEX idx_skills_featured ON public.skills(is_featured);
CREATE INDEX idx_skills_rating ON public.skills(rating_avg DESC);

-- =====================
-- Skill Versions (for update history)
-- =====================
CREATE TABLE public.skill_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  changelog TEXT,
  skill_md_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_skill_versions_skill ON public.skill_versions(skill_id);

-- =====================
-- Bundles
-- =====================
CREATE TABLE public.bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  discount_percent INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.bundle_skills (
  bundle_id UUID REFERENCES public.bundles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
  PRIMARY KEY (bundle_id, skill_id)
);

-- =====================
-- Purchases
-- =====================
CREATE TYPE purchase_status AS ENUM ('completed', 'refunded', 'disputed');

CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES public.skills(id) ON DELETE SET NULL,
  bundle_id UUID REFERENCES public.bundles(id) ON DELETE SET NULL,
  license_type license_type NOT NULL,
  price_paid INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  status purchase_status DEFAULT 'completed',
  invoice_number TEXT, -- For business invoice
  invoice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT purchase_item_check CHECK (skill_id IS NOT NULL OR bundle_id IS NOT NULL)
);

CREATE INDEX idx_purchases_buyer ON public.purchases(buyer_id);
CREATE INDEX idx_purchases_skill ON public.purchases(skill_id);

-- =====================
-- Subscriptions (for subscription-based skills)
-- =====================
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL,
  status subscription_status DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ, -- 7 days free trial
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_buyer ON public.subscriptions(buyer_id);

-- =====================
-- Reviews
-- =====================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(skill_id, buyer_id)
);

CREATE INDEX idx_reviews_skill ON public.reviews(skill_id);

-- =====================
-- Favorites
-- =====================
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

CREATE INDEX idx_favorites_user ON public.favorites(user_id);

-- =====================
-- Case Studies (導入事例)
-- =====================
CREATE TABLE public.case_studies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_logo_url TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- Custom Requests (カスタマイズ依頼)
-- =====================
CREATE TYPE request_status AS ENUM ('open', 'in_progress', 'completed', 'canceled');

CREATE TABLE public.custom_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES public.skills(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget_min INTEGER,
  budget_max INTEGER,
  status request_status DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- Features (特集)
-- =====================
CREATE TABLE public.features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  skill_ids UUID[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- Row Level Security
-- =====================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_requests ENABLE ROW LEVEL SECURITY;

-- Users: Read own profile, update own profile
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public can read seller profiles" ON public.users FOR SELECT USING (is_seller = TRUE);

-- Skills: Public can read published, sellers can manage own
CREATE POLICY "Public can read published skills" ON public.skills FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Sellers can read own skills" ON public.skills FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can insert own skills" ON public.skills FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update own skills" ON public.skills FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can delete own skills" ON public.skills FOR DELETE USING (auth.uid() = seller_id);

-- Purchases: Buyers can read own purchases
CREATE POLICY "Buyers can read own purchases" ON public.purchases FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Sellers can read purchases of their skills" ON public.purchases FOR SELECT
  USING (skill_id IN (SELECT id FROM public.skills WHERE seller_id = auth.uid()));

-- Reviews: Public can read, buyers can manage own
CREATE POLICY "Public can read reviews" ON public.reviews FOR SELECT USING (TRUE);
CREATE POLICY "Buyers can insert own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Buyers can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = buyer_id);
CREATE POLICY "Buyers can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = buyer_id);

-- Favorites: Users can manage own
CREATE POLICY "Users can read own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions: Users can read own
CREATE POLICY "Users can read own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = buyer_id);

-- Custom Requests: Public can read open, users can manage own
CREATE POLICY "Public can read open requests" ON public.custom_requests FOR SELECT USING (status = 'open');
CREATE POLICY "Users can read own requests" ON public.custom_requests FOR SELECT USING (auth.uid() = requester_id);
CREATE POLICY "Users can insert own requests" ON public.custom_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update own requests" ON public.custom_requests FOR UPDATE USING (auth.uid() = requester_id);

-- Categories and Features: Public read
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read categories" ON public.categories FOR SELECT USING (TRUE);
CREATE POLICY "Public can read published features" ON public.features FOR SELECT USING (is_published = TRUE);

-- =====================
-- Functions
-- =====================

-- Update rating when review is added
CREATE OR REPLACE FUNCTION update_skill_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.skills
  SET
    rating_avg = (SELECT AVG(rating)::NUMERIC(2,1) FROM public.reviews WHERE skill_id = NEW.skill_id),
    rating_count = (SELECT COUNT(*) FROM public.reviews WHERE skill_id = NEW.skill_id)
  WHERE id = NEW.skill_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_skill_rating
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_skill_rating();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================
-- Seed Data: Categories
-- =====================
INSERT INTO public.categories (name, slug, description, icon) VALUES
('法務・コンプライアンス', 'legal', '契約書レビュー、法務調査など', 'Scale'),
('経理・財務', 'finance', '経費精算、請求書処理など', 'Calculator'),
('人事・採用', 'hr', '採用管理、評価など', 'Users'),
('マーケティング', 'marketing', 'コンテンツ作成、分析など', 'TrendingUp'),
('カスタマーサポート', 'support', 'FAQ作成、対応など', 'Headphones'),
('医療・ヘルスケア', 'healthcare', '医療文書、分析など', 'Heart'),
('不動産', 'real-estate', '物件管理、契約など', 'Building'),
('コードレビュー', 'code-review', 'PRレビュー、品質管理', 'GitPullRequest'),
('ドキュメント生成', 'docs', 'README、API仕様など', 'FileText'),
('データ分析', 'data-analysis', 'レポート生成、可視化', 'BarChart3'),
('自動化・効率化', 'automation', 'ワークフロー自動化', 'Zap'),
('セキュリティ', 'security', '脆弱性診断、監査', 'Shield'),
('テスト・QA', 'testing', 'テスト生成、品質保証', 'TestTube');
