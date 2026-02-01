import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, Mail } from 'lucide-react';

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement auth
  };

  const handleGitHubLogin = async () => {
    // TODO: Implement GitHub OAuth
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">B</span>
            </div>
            <span className="font-bold text-2xl text-gray-900">Blockyclaw</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            {isLogin ? 'ログイン' : 'アカウント作成'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isLogin
              ? 'スキルを購入・管理するにはログインしてください'
              : '無料でアカウントを作成してスキルを購入'}
          </p>
        </div>

        <div className="bg-white rounded-xl border p-8">
          {/* GitHub Login */}
          <button
            onClick={handleGitHubLogin}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
          >
            <Github className="w-5 h-5" />
            GitHubでログイン
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">または</span>
            </div>
          </div>

          {/* Email Login */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                メールアドレス
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="text-sm text-gray-600">ログイン状態を保持</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  パスワードを忘れた
                </Link>
              </div>
            )}

            <button
              type="submit"
              className="w-full px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition"
            >
              {isLogin ? 'ログイン' : 'アカウント作成'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {isLogin ? (
              <>
                アカウントをお持ちでない方は
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-purple-600 hover:text-purple-700 font-medium ml-1"
                >
                  新規登録
                </button>
              </>
            ) : (
              <>
                すでにアカウントをお持ちの方は
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-purple-600 hover:text-purple-700 font-medium ml-1"
                >
                  ログイン
                </button>
              </>
            )}
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          ログインすることで、
          <Link to="/terms" className="text-purple-600 hover:underline">
            利用規約
          </Link>
          と
          <Link to="/privacy" className="text-purple-600 hover:underline">
            プライバシーポリシー
          </Link>
          に同意したものとみなされます。
        </p>
      </div>
    </div>
  );
}
