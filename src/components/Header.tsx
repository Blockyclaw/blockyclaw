import { Link } from 'react-router-dom';
import { Search, Heart, User, ShoppingCart, Menu, Bot } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-xl text-gray-900">SkillsMP Trade</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="スキルを検索..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/skills" className="text-gray-600 hover:text-gray-900">
              スキル一覧
            </Link>
            <Link to="/dashboard/agents" className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium">
              <Bot className="w-4 h-4" />
              AIエージェント
            </Link>
            <Link to="/dashboard/seller" className="text-gray-600 hover:text-gray-900">
              出品する
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <ShoppingCart className="w-5 h-5" />
            </button>
            <Link
              to="/login"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <User className="w-4 h-4" />
              ログイン
            </Link>
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="スキルを検索..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <Link to="/skills" className="text-gray-600 hover:text-gray-900 py-2">
                スキル一覧
              </Link>
              <Link to="/dashboard/agents" className="flex items-center gap-2 text-purple-600 py-2 font-medium">
                <Bot className="w-4 h-4" />
                AIエージェント
              </Link>
              <Link to="/dashboard/seller" className="text-gray-600 hover:text-gray-900 py-2">
                出品する
              </Link>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg"
              >
                <User className="w-4 h-4" />
                ログイン
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
