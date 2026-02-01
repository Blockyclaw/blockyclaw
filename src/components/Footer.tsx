import { Link } from 'react-router-dom';
import { Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-xl text-white">SkillsMP Trade</span>
            </Link>
            <p className="mt-4 text-gray-400 max-w-md">
              Claude Code スキルの有料マーケットプレイス。
              業務効率を上げるスキルをワンクリックで購入・導入できます。
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">マーケットプレイス</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/skills" className="text-gray-400 hover:text-white transition">
                  スキル一覧
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-gray-400 hover:text-white transition">
                  特集
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-400 hover:text-white transition">
                  カテゴリ
                </Link>
              </li>
              <li>
                <Link to="/sellers" className="text-gray-400 hover:text-white transition">
                  出品者になる
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">サポート</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/docs" className="text-gray-400 hover:text-white transition">
                  ドキュメント
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition">
                  よくある質問
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition">
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition">
                  利用規約
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition">
                  プライバシーポリシー
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; 2025 SkillsMP Trade. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
