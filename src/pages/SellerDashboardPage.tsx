import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  BarChart3,
  Package,
  DollarSign,
  TrendingUp,
  Download,
  Star,
  Eye,
  Edit,
  Trash2,
  Github,
} from 'lucide-react';
import type { Skill } from '../types';

// Mock data
const mockStats = {
  totalRevenue: 458000,
  totalSales: 47,
  totalDownloads: 892,
  averageRating: 4.7,
  revenueChange: 23.5,
  salesChange: 12.3,
};

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
    github_repo_url: 'https://github.com/example/accounting-skill',
    demo_video_url: null,
    demo_images: [],
    skill_md_content: '',
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
  {
    id: '2',
    seller_id: '1',
    title: 'Contract Review Skill',
    slug: 'contract-review',
    description: 'Risk analysis and revision suggestions for contracts',
    long_description: null,
    price: 19800,
    license_type: 'personal',
    team_price: 49800,
    enterprise_price: null,
    github_repo_url: null,
    demo_video_url: null,
    demo_images: [],
    skill_md_content: '',
    version: '1.0.0',
    claude_code_version_min: null,
    claude_code_version_max: null,
    category_id: 'legal',
    tags: ['legal', 'contract'],
    is_published: false,
    is_featured: false,
    download_count: 0,
    rating_avg: 0,
    rating_count: 0,
    created_at: '2024-03-01',
    updated_at: '2024-03-01',
  },
];

export function SellerDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'sales'>('overview');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price / 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage your skills and view sales</p>
          </div>
          <Link
            to="/dashboard/seller/skills/new"
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <Plus className="w-5 h-5" />
            New Skill
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'skills', label: 'Skills', icon: Package },
            { key: 'sales', label: 'Sales', icon: DollarSign },
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    +{mockStats.revenueChange}%
                  </span>
                </div>
                <p className="mt-4 text-2xl font-bold text-gray-900">
                  {formatPrice(mockStats.totalRevenue)}
                </p>
                <p className="text-sm text-gray-500">Total Revenue</p>
              </div>

              <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    +{mockStats.salesChange}%
                  </span>
                </div>
                <p className="mt-4 text-2xl font-bold text-gray-900">
                  {mockStats.totalSales}
                </p>
                <p className="text-sm text-gray-500">Total Sales</p>
              </div>

              <div className="bg-white rounded-xl border p-6">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-red-600" />
                </div>
                <p className="mt-4 text-2xl font-bold text-gray-900">
                  {mockStats.totalDownloads}
                </p>
                <p className="text-sm text-gray-500">Total Downloads</p>
              </div>

              <div className="bg-white rounded-xl border p-6">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="mt-4 text-2xl font-bold text-gray-900">
                  {mockStats.averageRating}
                </p>
                <p className="text-sm text-gray-500">Average Rating</p>
              </div>
            </div>

            {/* Recent Skills */}
            <div className="bg-white rounded-xl border">
              <div className="p-6 border-b">
                <h2 className="font-semibold text-gray-900">Listed Skills</h2>
              </div>
              <div className="divide-y">
                {mockSkills.map((skill) => (
                  <div key={skill.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-red-600 font-bold">
                          {skill.title.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{skill.title}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>{formatPrice(skill.price)}</span>
                          <span className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            {skill.download_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400" />
                            {skill.rating_avg || '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          skill.is_published
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {skill.is_published ? 'Published' : 'Draft'}
                      </span>
                      <Link
                        to={`/dashboard/seller/skills/${skill.id}`}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="bg-white rounded-xl border">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">All Skills</h2>
              <Link
                to="/dashboard/seller/skills/new"
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
              >
                <Plus className="w-4 h-4" />
                New Skill
              </Link>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                    Skill
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                    Price
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                    Sales
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                    Rating
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mockSkills.map((skill) => (
                  <tr key={skill.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-red-600 font-bold text-sm">
                            {skill.title.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{skill.title}</p>
                          <p className="text-sm text-gray-500">v{skill.version}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {formatPrice(skill.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          skill.is_published
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {skill.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {skill.download_count}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-gray-900">
                          {skill.rating_avg || '-'}
                        </span>
                        <span className="text-gray-500 text-sm">
                          ({skill.rating_count})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/skills/${skill.slug}`}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="Preview"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link
                          to={`/dashboard/seller/skills/${skill.id}`}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        {skill.github_repo_url && (
                          <a
                            href={skill.github_repo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-gray-600"
                            title="GitHub"
                          >
                            <Github className="w-5 h-5" />
                          </a>
                        )}
                        <button
                          className="p-2 text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Sales Chart</h2>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                Chart Area (Coming Soon)
              </div>
            </div>

            <div className="bg-white rounded-xl border">
              <div className="p-6 border-b">
                <h2 className="font-semibold text-gray-900">Transaction History</h2>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                      Date
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                      Skill
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                      License
                    </th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500">2024/03/10 14:32</td>
                    <td className="px-6 py-4 text-gray-900">Accounting Automation Skill</td>
                    <td className="px-6 py-4 text-gray-900">Team</td>
                    <td className="px-6 py-4 text-right text-gray-900 font-medium">
                      {formatPrice(29800)}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500">2024/03/09 10:15</td>
                    <td className="px-6 py-4 text-gray-900">Accounting Automation Skill</td>
                    <td className="px-6 py-4 text-gray-900">Personal</td>
                    <td className="px-6 py-4 text-right text-gray-900 font-medium">
                      {formatPrice(9800)}
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
