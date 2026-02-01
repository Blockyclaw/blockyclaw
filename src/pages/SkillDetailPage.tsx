import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Download,
  Heart,
  Share2,
  Check,
  Github,
  Play,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import type { Skill, Review } from '../types';
import { createCheckoutSession } from '../lib/stripe';

// TODO: Fetch from Supabase
const mockSkill: Skill = {
  id: '1',
  seller_id: '1',
  title: '経理自動化スキル',
  slug: 'accounting-automation',
  description: '請求書処理、経費精算、仕訳作成を自動化するスキルパック',
  long_description: `
## 概要

このスキルは、日々の経理業務を大幅に効率化します。

### 主な機能

- **請求書処理**: PDFの請求書を自動で読み取り、仕訳データを生成
- **経費精算**: レシート画像から経費明細を抽出
- **仕訳作成**: 取引内容から適切な勘定科目を推定

### 使用例

\`\`\`
# 請求書を処理
/accounting invoice process /path/to/invoice.pdf

# 経費精算
/accounting expense /path/to/receipt.jpg
\`\`\`

### 対応フォーマット

- PDF, PNG, JPG (請求書・レシート)
- CSV (明細データ)
- 弥生会計、freee対応形式でエクスポート可能
  `,
  price: 9800,
  license_type: 'personal',
  team_price: 29800,
  enterprise_price: 98000,
  github_repo_url: 'https://github.com/example/accounting-skill',
  demo_video_url: 'https://example.com/demo.mp4',
  demo_images: [
    'https://via.placeholder.com/800x450',
    'https://via.placeholder.com/800x450',
    'https://via.placeholder.com/800x450',
  ],
  skill_md_content: '# Accounting Skill\n...',
  version: '1.2.0',
  claude_code_version_min: '1.0.0',
  claude_code_version_max: null,
  category_id: 'finance',
  tags: ['経理', '自動化', '請求書', '経費精算', '仕訳'],
  is_published: true,
  is_featured: true,
  download_count: 234,
  rating_avg: 4.8,
  rating_count: 45,
  created_at: '2024-01-15',
  updated_at: '2024-03-10',
  seller: {
    id: '1',
    email: 'seller@example.com',
    display_name: '経理プロ',
    avatar_url: null,
    bio: '経理業務の自動化を専門とするエンジニア。10年以上の経理システム開発経験あり。',
    github_username: 'keiri-pro',
    stripe_account_id: null,
    is_seller: true,
    created_at: '',
  },
};

const mockReviews: Review[] = [
  {
    id: '1',
    skill_id: '1',
    buyer_id: '1',
    rating: 5,
    title: '業務時間が半分になりました',
    content:
      '毎月の請求書処理に3時間かかっていましたが、このスキルを導入してから1.5時間で終わるようになりました。',
    is_verified_purchase: true,
    created_at: '2024-03-01',
    updated_at: '2024-03-01',
    buyer: {
      id: '1',
      email: 'buyer@example.com',
      display_name: '田中太郎',
      avatar_url: null,
      bio: null,
      github_username: null,
      stripe_account_id: null,
      is_seller: false,
      created_at: '',
    },
  },
  {
    id: '2',
    skill_id: '1',
    buyer_id: '2',
    rating: 4,
    title: '概ね満足',
    content: 'freeeへのエクスポートがスムーズで助かっています。マネーフォワード対応も希望。',
    is_verified_purchase: true,
    created_at: '2024-02-15',
    updated_at: '2024-02-15',
    buyer: {
      id: '2',
      email: 'buyer2@example.com',
      display_name: '山田花子',
      avatar_url: null,
      bio: null,
      github_username: null,
      stripe_account_id: null,
      is_seller: false,
      created_at: '',
    },
  },
];

export function SkillDetailPage() {
  const { slug: _slug } = useParams();
  // TODO: Fetch skill by _slug from Supabase
  const skill = mockSkill;

  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (licenseType: 'personal' | 'team' | 'enterprise') => {
    setPurchasing(licenseType);
    setError(null);

    const result = await createCheckoutSession(skill.id, licenseType);

    if ('error' in result) {
      setError(result.error);
      setPurchasing(null);
      return;
    }

    // Redirect to Stripe Checkout
    window.location.href = result.url;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-700">
              ホーム
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/skills" className="hover:text-gray-700">
              スキル一覧
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{skill.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Demo Video/Images */}
            <div className="bg-white rounded-xl overflow-hidden border">
              <div className="aspect-video bg-gray-900 relative">
                {skill.demo_video_url ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <button className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition">
                      <Play className="w-8 h-8 text-purple-600 ml-1" />
                    </button>
                  </div>
                ) : (
                  <img
                    src={skill.demo_images[0]}
                    alt={skill.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              {skill.demo_images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {skill.demo_images.map((img, i) => (
                    <button
                      key={i}
                      className="w-24 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 border-transparent hover:border-purple-500"
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Meta */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {skill.title}
                </h1>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-red-500 transition">
                    <Heart className="w-6 h-6" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition">
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-gray-600">{skill.description}</p>

              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{skill.rating_avg}</span>
                  <span className="text-gray-500">
                    ({skill.rating_count}件のレビュー)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Download className="w-5 h-5" />
                  {skill.download_count} ダウンロード
                </div>
                <span className="text-gray-500">v{skill.version}</span>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {skill.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/skills?tag=${tag}`}
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                詳細説明
              </h2>
              <div className="prose prose-purple max-w-none">
                {/* TODO: Render markdown */}
                <pre className="whitespace-pre-wrap text-sm text-gray-600">
                  {skill.long_description}
                </pre>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  レビュー ({skill.rating_count})
                </h2>
                <button className="text-purple-600 hover:text-purple-700">
                  レビューを書く
                </button>
              </div>

              <div className="space-y-6">
                {mockReviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-gray-100 last:border-0 pb-6 last:pb-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-600 font-medium">
                          {review.buyer?.display_name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {review.buyer?.display_name}
                          </span>
                          {review.is_verified_purchase && (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                              <ShieldCheck className="w-3 h-3" />
                              購入済み
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-500 ml-2">
                            {new Date(review.created_at).toLocaleDateString(
                              'ja-JP'
                            )}
                          </span>
                        </div>
                        {review.title && (
                          <h4 className="font-medium text-gray-900 mt-2">
                            {review.title}
                          </h4>
                        )}
                        {review.content && (
                          <p className="text-gray-600 mt-1">{review.content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Purchase Card */}
              <div className="bg-white rounded-xl border p-6">
                <div className="text-3xl font-bold text-gray-900">
                  {formatPrice(skill.price)}
                </div>
                <p className="text-sm text-gray-500 mt-1">個人ライセンス</p>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  onClick={() => handlePurchase('personal')}
                  disabled={purchasing !== null}
                  className="w-full mt-4 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {purchasing === 'personal' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      処理中...
                    </>
                  ) : (
                    '購入する'
                  )}
                </button>

                <div className="mt-4 space-y-2">
                  {skill.team_price && (
                    <button
                      onClick={() => handlePurchase('team')}
                      disabled={purchasing !== null}
                      className="w-full px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {purchasing === 'team' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          処理中...
                        </>
                      ) : (
                        <>チームライセンス {formatPrice(skill.team_price)}</>
                      )}
                    </button>
                  )}
                  {skill.enterprise_price && (
                    <button
                      onClick={() => handlePurchase('enterprise')}
                      disabled={purchasing !== null}
                      className="w-full px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {purchasing === 'enterprise' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          処理中...
                        </>
                      ) : (
                        <>企業ライセンス {formatPrice(skill.enterprise_price)}</>
                      )}
                    </button>
                  )}
                </div>

                <ul className="mt-6 space-y-3 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    ワンクリックインストール
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    無期限アップデート
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    7日間返金保証
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    法人請求書対応
                  </li>
                </ul>
              </div>

              {/* Seller Info */}
              <div className="bg-white rounded-xl border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">出品者</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-600 font-medium text-lg">
                      {skill.seller?.display_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <Link
                      to={`/sellers/${skill.seller_id}`}
                      className="font-medium text-gray-900 hover:text-purple-600"
                    >
                      {skill.seller?.display_name}
                    </Link>
                    {skill.seller?.github_username && (
                      <a
                        href={`https://github.com/${skill.seller.github_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                      >
                        <Github className="w-4 h-4" />
                        {skill.seller.github_username}
                      </a>
                    )}
                  </div>
                </div>
                {skill.seller?.bio && (
                  <p className="mt-4 text-sm text-gray-600">
                    {skill.seller.bio}
                  </p>
                )}
              </div>

              {/* Version Info */}
              <div className="bg-white rounded-xl border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">バージョン情報</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">バージョン</dt>
                    <dd className="text-gray-900">v{skill.version}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">最終更新</dt>
                    <dd className="text-gray-900">
                      {new Date(skill.updated_at).toLocaleDateString('ja-JP')}
                    </dd>
                  </div>
                  {skill.claude_code_version_min && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">対応バージョン</dt>
                      <dd className="text-gray-900">
                        {skill.claude_code_version_min}〜
                      </dd>
                    </div>
                  )}
                </dl>
                <button className="flex items-center gap-2 mt-4 text-sm text-purple-600 hover:text-purple-700">
                  <RefreshCw className="w-4 h-4" />
                  更新履歴を見る
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
