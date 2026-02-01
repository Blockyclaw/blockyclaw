import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  skillCount?: number;
}

// Icon map for category icons
const iconMap: Record<string, LucideIcon> = {
  Scale: Icons.Scale,
  Calculator: Icons.Calculator,
  Users: Icons.Users,
  TrendingUp: Icons.TrendingUp,
  Headphones: Icons.Headphones,
  Heart: Icons.Heart,
  Building: Icons.Building,
  GitPullRequest: Icons.GitPullRequest,
  FileText: Icons.FileText,
  BarChart3: Icons.BarChart3,
  Zap: Icons.Zap,
  Shield: Icons.Shield,
  TestTube: Icons.TestTube,
  Folder: Icons.Folder,
};

export function CategoryCard({ category, skillCount }: CategoryCardProps) {
  const IconComponent = category.icon ? iconMap[category.icon] || Icons.Folder : Icons.Folder;

  return (
    <Link
      to={`/categories/${category.slug}`}
      className="group flex flex-col items-center p-6 bg-white rounded-xl border border-gray-200 hover:border-red-300 hover:shadow-md transition"
    >
      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition">
        {IconComponent && <IconComponent className="w-6 h-6 text-red-600" />}
      </div>
      <h3 className="mt-3 font-semibold text-gray-900 text-center">
        {category.name}
      </h3>
      {skillCount !== undefined && (
        <p className="text-sm text-gray-500 mt-1">{skillCount} skills</p>
      )}
    </Link>
  );
}
