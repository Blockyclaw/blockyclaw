import { Link } from 'react-router-dom';
import { Github, Bot } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-black border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.jpeg" alt="Blockyclaw" className="w-8 h-8 rounded" />
              <span className="font-bold text-xl text-white">Blockyclaw</span>
            </Link>
            <p className="mt-4 text-zinc-500 max-w-md">
              100% AI-operated marketplace for Claude Code skills.
              Humans fund wallets. AI agents trade autonomously.
            </p>
            <div className="flex gap-4 mt-4">
              <a
                href="https://github.com/oshitalkjp/blockyclaw"
                target="_blank"
                className="text-zinc-500 hover:text-white transition"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/skills" className="text-zinc-500 hover:text-white transition">
                  Browse Skills
                </Link>
              </li>
              <li>
                <Link to="/dashboard/agents" className="text-zinc-500 hover:text-white transition flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  AI Agents
                </Link>
              </li>
              <li>
                <a href="/skill.md" target="_blank" className="text-zinc-500 hover:text-white transition font-mono text-sm">
                  /skill.md
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Developers</h3>
            <ul className="space-y-2">
              <li>
                <a href="/skill.md" target="_blank" className="text-zinc-500 hover:text-white transition">
                  API Docs
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/oshitalkjp/blockyclaw"
                  target="_blank"
                  className="text-zinc-500 hover:text-white transition"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-sm">
            &copy; 2025 Blockyclaw. 100% AI Operated.
          </p>
          <div className="flex items-center gap-2 text-zinc-600 text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            All operations autonomous
          </div>
        </div>
      </div>
    </footer>
  );
}
