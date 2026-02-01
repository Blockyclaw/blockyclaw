import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Heart,
  Clock,
  Download,
  Star,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  CreditCard,
  FileText,
} from 'lucide-react';
import type { Skill, Purchase } from '../types';

// Mock data
const mockPurchases: (Purchase & { skill: Skill })[] = [
  {
    id: '1',
    buyer_id: '1',
    skill_id: '1',
    bundle_id: null,
    license_type: 'team',
    price_paid: 29800,
    stripe_payment_intent_id: 'pi_xxx',
    status: 'completed',
    created_at: '2024-03-10',
    skill: {
      id: '1',
      seller_id: '1',
      title: 'Accounting Automation',
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
      skill_md_content: '# Accounting Skill...',
      version: '1.2.0',
      claude_code_version_min: null,
      claude_code_version_max: null,
      category_id: 'finance',
      tags: ['accounting', 'automation'],
      is_published: true,
      is_featured: true,
      download_count: 234,
      rating_avg: 4.8,
      rating_count: 45,
      created_at: '2024-01-15',
      updated_at: '2024-03-10',
    },
  },
];

const mockFavorites: Skill[] = [
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
    tags: ['code-review'],
    is_published: true,
    is_featured: false,
    download_count: 567,
    rating_avg: 4.9,
    rating_count: 89,
    created_at: '',
    updated_at: '',
  },
];

export function BuyerDashboardPage() {
  const [activeTab, setActiveTab] = useState<'purchases' | 'favorites' | 'billing'>('purchases');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price / 100);
  };

  const copyInstallCommand = (skillSlug: string) => {
    const command = `/plugin install ${skillSlug}@blockyclaw`;
    navigator.clipboard.writeText(command);
    setCopiedId(skillSlug);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage and install purchased skills</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { key: 'purchases', label: 'Purchased', icon: Package },
            { key: 'favorites', label: 'Favorites', icon: Heart },
            { key: 'billing', label: 'Billing', icon: CreditCard },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
                activeTab === key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Purchases Tab */}
        {activeTab === 'purchases' && (
          <div className="space-y-6">
            {mockPurchases.map((purchase) => (
              <div key={purchase.id} className="bg-white rounded-xl border overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-red-600 font-bold text-xl">
                          {purchase.skill.title.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <Link
                          to={`/skills/${purchase.skill.slug}`}
                          className="font-semibold text-gray-900 hover:text-red-600 flex items-center gap-1"
                        >
                          {purchase.skill.title}
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          {purchase.skill.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-gray-500">
                            v{purchase.skill.version}
                          </span>
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded capitalize">
                            {purchase.license_type} license
                          </span>
                          <span className="flex items-center gap-1 text-gray-500">
                            <Clock className="w-4 h-4" />
                            {new Date(purchase.created_at).toLocaleDateString('en-US')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(purchase.price_paid)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Install Section */}
                <div className="bg-gray-50 px-6 py-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Install Command
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-4 py-2 bg-gray-900 text-green-400 rounded-lg text-sm font-mono">
                      /plugin install {purchase.skill.slug}@blockyclaw
                    </code>
                    <button
                      onClick={() => copyInstallCommand(purchase.skill.slug)}
                      className="p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                    >
                      {copiedId === purchase.skill.slug ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <button className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700">
                      <Download className="w-4 h-4" />
                      Manual Download
                    </button>
                    <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-700">
                      <RefreshCw className="w-4 h-4" />
                      Check for Updates
                    </button>
                    <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-700">
                      <Star className="w-4 h-4" />
                      Write a Review
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {mockPurchases.length === 0 && (
              <div className="bg-white rounded-xl border p-12 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="mt-4 font-medium text-gray-900">
                  No purchased skills yet
                </h3>
                <p className="mt-2 text-gray-500">
                  Purchased skills will appear here
                </p>
                <Link
                  to="/skills"
                  className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Browse Skills
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockFavorites.map((skill) => (
              <div key={skill.id} className="bg-white rounded-xl border overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
                  <span className="text-4xl font-bold text-red-300">
                    {skill.title.charAt(0)}
                  </span>
                </div>
                <div className="p-4">
                  <Link
                    to={`/skills/${skill.slug}`}
                    className="font-semibold text-gray-900 hover:text-red-600"
                  >
                    {skill.title}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {skill.description}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm text-gray-600">{skill.rating_avg}</span>
                    </div>
                    <span className="font-semibold text-red-600">
                      {formatPrice(skill.price)}
                    </span>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                    Purchase
                  </button>
                </div>
              </div>
            ))}

            {mockFavorites.length === 0 && (
              <div className="col-span-full bg-white rounded-xl border p-12 text-center">
                <Heart className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="mt-4 font-medium text-gray-900">
                  No favorites yet
                </h3>
                <p className="mt-2 text-gray-500">
                  Add skills to your favorites
                </p>
              </div>
            )}
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            {/* Payment Method */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Payment Method</h2>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">VISA</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">**** **** **** 4242</p>
                  <p className="text-sm text-gray-500">Expires: 12/25</p>
                </div>
                <button className="ml-auto text-sm text-red-600 hover:text-red-700">
                  Change
                </button>
              </div>
            </div>

            {/* Invoices */}
            <div className="bg-white rounded-xl border">
              <div className="p-6 border-b">
                <h2 className="font-semibold text-gray-900">Invoices & Receipts</h2>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                      Date
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                      Description
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                      Amount
                    </th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">
                      Documents
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500">2024/03/10</td>
                    <td className="px-6 py-4 text-gray-900">
                      Accounting Automation (Team License)
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {formatPrice(29800)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700">
                          <FileText className="w-4 h-4" />
                          Receipt
                        </button>
                        <button className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700">
                          <FileText className="w-4 h-4" />
                          Invoice
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
