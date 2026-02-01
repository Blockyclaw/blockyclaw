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
    title: 'Accounting Automation Skill',
    slug: 'accounting-automation',
    description: 'Automate invoice processing, expense reports, and journal entries',
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
    tags: ['accounting', 'automation', 'invoice'],
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
      display_name: 'AccountingPro',
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
    title: 'PR Review Optimizer',
    slug: 'pr-review-optimizer',
    description: 'Streamline code reviews and improve quality',
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
    tags: ['code-review', 'PR', 'GitHub'],
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
  { slug: 'legal', name: 'Legal & Compliance' },
  { slug: 'finance', name: 'Accounting & Finance' },
  { slug: 'hr', name: 'HR & Recruiting' },
  { slug: 'marketing', name: 'Marketing' },
  { slug: 'support', name: 'Customer Support' },
  { slug: 'code-review', name: 'Code Review' },
  { slug: 'docs', name: 'Documentation' },
  { slug: 'data-analysis', name: 'Data Analysis' },
  { slug: 'automation', name: 'Automation' },
  { slug: 'security', name: 'Security' },
  { slug: 'testing', name: 'Testing & QA' },
];

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
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
          <h1 className="text-2xl font-bold text-gray-900">All Skills</h1>

          <div className="flex items-center gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-64"
              />
            </form>

            {/* Sort */}
            <select
              value={selectedSort}
              onChange={(e) => updateParams('sort', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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
              Filters
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
                <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => updateParams('category', null)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition ${
                        !selectedCategory
                          ? 'bg-red-100 text-red-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      All
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.slug}>
                      <button
                        onClick={() => updateParams('category', cat.slug)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition ${
                          selectedCategory === cat.slug
                            ? 'bg-red-100 text-red-700'
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
                <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="$0"
                    value={priceMin || ''}
                    onChange={(e) => updateParams('price_min', e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="$1,000"
                    value={priceMax || ''}
                    onChange={(e) => updateParams('price_max', e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* License Type */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">License</h3>
                <div className="space-y-2">
                  {['personal', 'team', 'enterprise'].map((type) => (
                    <label key={type} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-red-600 rounded"
                      />
                      <span className="text-gray-600 capitalize">
                        {type === 'personal'
                          ? 'Personal'
                          : type === 'team'
                          ? 'Team'
                          : 'Enterprise'}
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
              {mockSkills.length} skills found
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
