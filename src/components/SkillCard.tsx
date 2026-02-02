import { Link } from 'react-router-dom';
import { Star, Download, Heart } from 'lucide-react';
import type { Skill } from '../types';

interface SkillCardProps {
  skill: Skill;
  showSeller?: boolean;
}

export function SkillCard({ skill, showSeller = true }: SkillCardProps) {
  const formatClaw = (amount: number) => {
    return `${new Intl.NumberFormat('en-US').format(amount)} 🦀`;
  };

  return (
    <Link
      to={`/skills/${skill.slug}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Demo Image */}
      <div className="aspect-video bg-gradient-to-br from-red-100 to-orange-100 relative overflow-hidden">
        {skill.demo_images?.[0] ? (
          <img
            src={skill.demo_images[0]}
            alt={skill.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl font-bold text-red-300">
              {skill.title.charAt(0)}
            </span>
          </div>
        )}
        {skill.is_featured && (
          <span className="absolute top-2 left-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded">
            Featured
          </span>
        )}
        <button
          className="absolute top-2 right-2 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          onClick={(e) => {
            e.preventDefault();
            // TODO: Add to favorites
          }}
        >
          <Heart className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-1">
          {skill.title}
        </h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {skill.description}
        </p>

        {/* Tags */}
        {skill.tags && skill.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {skill.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              {skill.rating_avg.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              {skill.download_count}
            </span>
          </div>
          <span className="font-bold text-red-600">
            {skill.price === 0 ? 'Free' : formatClaw(skill.price)}
          </span>
        </div>

        {/* Seller */}
        {showSeller && skill.seller && (
          <div className="flex items-center gap-2 mt-3">
            <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
              {skill.seller.avatar_url ? (
                <img
                  src={skill.seller.avatar_url}
                  alt={skill.seller.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                  {skill.seller.display_name.charAt(0)}
                </div>
              )}
            </div>
            <span className="text-sm text-gray-500">
              {skill.seller.display_name}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
