import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { SkillCard } from '../components/SkillCard';
import type { Skill } from '../types';

// TODO: Replace with actual data from Supabase
const mockSkills: Skill[] = [
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
    category_id: 'finance',
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
    category_id: 'code-review',
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
];

const categories = [
  { slug: 'legal', name: '法務・コンプライアンス' },
  { slug: 'finance', name: '経理・財務' },
  { slug: 'hr', name: '人事・採用' },
  { slug: 'marketing', name: 'マーケティング' },
  { slug: 'support', name: 'カスタマーサポート' },
  { slug: 'code-review', name: 'コードレビュー' },
  { slug: 'docs', name: 'ドキュメント生成' },
  { slug: 'data-analysis', name: 'データ分析' },
  { slug: 'automation', name: '自動化・効率化' },
  { slug: 'security', name: 'セキュリティ' },
  { slug: 'testing', name: 'テスト・QA' },
];

const sortOptions = [
  { value: 'popular', label: '人気順' },
  { value: 'newest', label: '新着順' },
  { value: 'price-low', label: '価格が安い順' },
  { value: 'price-high', label: '価格が高い順' },
  { value: 'rating', label: '評価順' },
];

export function SkillListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const selectedCategory = searchParams.get('category');
  const selectedSort = searchParams.get('sort') || 'popular';
  const priceMin = searchParams.get('price_min');
  const priceMax = searchParams.get('price_max');

  const updateParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams('q', searchQuery || null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">スキル一覧</h1>

          <div className="flex items-center gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="スキルを検索..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
              />
            </form>

            {/* Sort */}
            <select
              value={selectedSort}
              onChange={(e) => updateParams('sort', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 md:hidden"
            >
              <SlidersHorizontal className="w-5 h-5" />
              フィルター
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside
            className={`${
              showFilters ? 'fixed inset-0 z-50 bg-white p-6' : 'hidden'
            } md:block md:relative md:w-64 md:flex-shrink-0`}
          >
            {showFilters && (
              <button
                onClick={() => setShowFilters(false)}
                className="absolute top-4 right-4 md:hidden"
              >
                <X className="w-6 h-6" />
              </button>
            )}

            <div className="space-y-6">
              {/* Categories */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">カテゴリ</h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => updateParams('category', null)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition ${
                        !selectedCategory
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      すべて
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.slug}>
                      <button
                        onClick={() => updateParams('category', cat.slug)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition ${
                          selectedCategory === cat.slug
                            ? 'bg-purple-100 text-purple-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">価格帯</h3>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="¥0"
                    value={priceMin || ''}
                    onChange={(e) => updateParams('price_min', e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <span className="text-gray-500">〜</span>
                  <input
                    type="number"
                    placeholder="¥100,000"
                    value={priceMax || ''}
                    onChange={(e) => updateParams('price_max', e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* License Type */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">ライセンス</h3>
                <div className="space-y-2">
                  {['personal', 'team', 'enterprise'].map((type) => (
                    <label key={type} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span className="text-gray-600 capitalize">
                        {type === 'personal'
                          ? '個人'
                          : type === 'team'
                          ? 'チーム'
                          : '企業'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1">
            <p className="text-sm text-gray-500 mb-4">
              {mockSkills.length}件のスキルが見つかりました
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockSkills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
