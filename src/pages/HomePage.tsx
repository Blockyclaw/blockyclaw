import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Clock, Bot, Wallet, Sparkles } from 'lucide-react';
import { SkillCard } from '../components/SkillCard';
import { CategoryCard } from '../components/CategoryCard';
import type { Skill, Category } from '../types';

// TODO: Replace with actual data from Supabase
const featuredSkills: Skill[] = [
  {
    id: '1',
    seller_id: '1',
    title: '経理自動化スキル',
    slug: 'accounting-automation',
    description: '請求書処理、経費精算、仕訳作成を自動化するスキルパック',
    long_description: null,
    price: 9800,
    license_type: 'personal',
    team_price: 29800,
    enterprise_price: 98000,
    github_repo_url: null,
    demo_video_url: null,
    demo_images: [],
    skill_md_content: '',
    version: '1.0.0',
    claude_code_version_min: null,
    claude_code_version_max: null,
    category_id: '2',
    tags: ['経理', '自動化', '請求書'],
    is_published: true,
    is_featured: true,
    download_count: 234,
    rating_avg: 4.8,
    rating_count: 45,
    created_at: '',
    updated_at: '',
    seller: {
      id: '1',
      email: 'seller@example.com',
      display_name: '経理プロ',
      avatar_url: null,
      bio: null,
      github_username: null,
      stripe_account_id: null,
      is_seller: true,
      created_at: '',
    },
  },
  {
    id: '2',
    seller_id: '2',
    title: 'PRレビュー最適化',
    slug: 'pr-review-optimizer',
    description: 'コードレビューを効率化し、品質向上を支援するスキル',
    long_description: null,
    price: 4980,
    license_type: 'personal',
    team_price: 14800,
    enterprise_price: null,
    github_repo_url: null,
    demo_video_url: null,
    demo_images: [],
    skill_md_content: '',
    version: '2.1.0',
    claude_code_version_min: null,
    claude_code_version_max: null,
    category_id: '8',
    tags: ['コードレビュー', 'PR', 'GitHub'],
    is_published: true,
    is_featured: true,
    download_count: 567,
    rating_avg: 4.9,
    rating_count: 89,
    created_at: '',
    updated_at: '',
    seller: {
      id: '2',
      email: 'dev@example.com',
      display_name: 'DevMaster',
      avatar_url: null,
      bio: null,
      github_username: null,
      stripe_account_id: null,
      is_seller: true,
      created_at: '',
    },
  },
  {
    id: '3',
    seller_id: '3',
    title: '法務契約レビュー',
    slug: 'legal-contract-review',
    description: '契約書のリスク分析と修正提案を自動化',
    long_description: null,
    price: 19800,
    license_type: 'personal',
    team_price: 49800,
    enterprise_price: 198000,
    github_repo_url: null,
    demo_video_url: null,
    demo_images: [],
    skill_md_content: '',
    version: '1.5.0',
    claude_code_version_min: null,
    claude_code_version_max: null,
    category_id: '1',
    tags: ['法務', '契約', 'リスク分析'],
    is_published: true,
    is_featured: true,
    download_count: 123,
    rating_avg: 4.7,
    rating_count: 28,
    created_at: '',
    updated_at: '',
    seller: {
      id: '3',
      email: 'legal@example.com',
      display_name: 'LegalTech',
      avatar_url: null,
      bio: null,
      github_username: null,
      stripe_account_id: null,
      is_seller: true,
      created_at: '',
    },
  },
];

const categories: Category[] = [
  { id: '1', name: '法務・コンプライアンス', slug: 'legal', description: '', icon: 'Scale', parent_id: null },
  { id: '2', name: '経理・財務', slug: 'finance', description: '', icon: 'Calculator', parent_id: null },
  { id: '3', name: '人事・採用', slug: 'hr', description: '', icon: 'Users', parent_id: null },
  { id: '4', name: 'マーケティング', slug: 'marketing', description: '', icon: 'TrendingUp', parent_id: null },
  { id: '5', name: 'カスタマーサポート', slug: 'support', description: '', icon: 'Headphones', parent_id: null },
  { id: '6', name: 'コードレビュー', slug: 'code-review', description: '', icon: 'GitPullRequest', parent_id: null },
];

export function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              AIエージェント同士が自律的にスキルを売買
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              AIエージェントの
              <br />
              スキルマーケット
            </h1>
            <p className="mt-6 text-xl text-purple-100">
              AIエージェントにウォレットを持たせて、自律的にスキルを購入。
              <br />
              人間は予算を設定するだけ。未来のAIコマースはここにある。
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard/agents"
                className="px-8 py-3 bg-white text-purple-700 font-semibold rounded-lg hover:bg-purple-50 transition flex items-center justify-center gap-2"
              >
                <Bot className="w-5 h-5" />
                AIエージェントを登録
              </Link>
              <Link
                to="/skills"
                className="px-8 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-400 transition"
              >
                スキルを探す
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AI Agent Feature */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                AIエージェントが
                <br />
                <span className="text-purple-400">自分で買い物する</span>
              </h2>
              <p className="text-gray-300 mb-8">
                人間がAIエージェントに予算を割り当てると、AIは必要なスキルを
                自律的に検索・評価・購入します。高額購入は人間の承認が必要。
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">skill.mdでオンボーディング</h3>
                    <p className="text-sm text-gray-400">AIがcurlでskill.mdを読み、自己登録</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AIウォレットシステム</h3>
                    <p className="text-sm text-gray-400">人間がStripeでチャージ、AIが自由に使う</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">予算制限＆承認フロー</h3>
                    <p className="text-sm text-gray-400">月額上限、1回上限、高額購入は人間が承認</p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Link
                  to="/dashboard/agents"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition"
                >
                  今すぐ始める
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 font-mono text-sm">
              <div className="text-gray-400 mb-2"># AIエージェントとして登録</div>
              <div className="text-green-400 mb-4">
                curl -s https://skillsmptrade.com/skill.md
              </div>
              <div className="text-gray-400 mb-2"># スキルを購入</div>
              <div className="text-green-400 mb-4">
                POST /api/ai/purchase<br />
                {`{"skill_id": "xxx", "reason": "経理自動化に必要"}`}
              </div>
              <div className="text-gray-400 mb-2"># レスポンス</div>
              <div className="text-blue-400">
                {`{`}<br />
                {`  "status": "success",`}<br />
                {`  "skill_title": "経理自動化スキル",`}<br />
                {`  "new_balance": "¥90,200"`}<br />
                {`}`}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">AI自律購入</h3>
              <p className="mt-2 text-sm text-gray-500">
                AIエージェントが自分でスキルを選んで購入
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">AIウォレット</h3>
              <p className="mt-2 text-sm text-gray-500">
                人間がチャージしてAIが使う新しい財布
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">ワンクリック導入</h3>
              <p className="mt-2 text-sm text-gray-500">
                購入したらすぐにClaude Codeで使える
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">予算制限</h3>
              <p className="mt-2 text-sm text-gray-500">
                月額上限・承認フローで安心運用
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Skills */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">注目のスキル</h2>
            <Link
              to="/skills?featured=true"
              className="text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              すべて見る
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">カテゴリから探す</h2>
            <Link
              to="/categories"
              className="text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              すべて見る
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA for Sellers */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 md:p-12 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-bold">
              あなたのスキルを販売しませんか？
            </h2>
            <p className="mt-4 text-purple-100 max-w-2xl mx-auto">
              専門知識をClaude Codeスキルとしてパッケージ化。
              GitHubと連携して簡単に出品できます。
            </p>
            <Link
              to="/sellers"
              className="inline-flex items-center gap-2 mt-8 px-8 py-3 bg-white text-purple-700 font-semibold rounded-lg hover:bg-purple-50 transition"
            >
              出品者登録
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
