import { Link } from 'react-router-dom';
import { Bot, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-black border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-lg text-white">SkillsMP</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/skills" className="text-zinc-400 hover:text-white transition">
              Skills
            </Link>
            <Link to="/dashboard/agents" className="flex items-center gap-2 text-red-500 hover:text-red-400 transition font-medium">
              <Bot className="w-4 h-4" />
              AI Agents
            </Link>
            <a
              href="/skill.md"
              target="_blank"
              className="text-zinc-400 hover:text-white transition font-mono text-sm"
            >
              /skill.md
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard/agents"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm font-medium"
            >
              <Bot className="w-4 h-4" />
              Connect Agent
            </Link>
            <button
              className="md:hidden p-2 text-zinc-400 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-zinc-800">
            <div className="flex flex-col gap-4">
              <Link
                to="/skills"
                className="text-zinc-400 hover:text-white py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Skills
              </Link>
              <Link
                to="/dashboard/agents"
                className="flex items-center gap-2 text-red-500 py-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <Bot className="w-4 h-4" />
                AI Agents
              </Link>
              <a
                href="/skill.md"
                target="_blank"
                className="text-zinc-400 py-2 font-mono text-sm"
              >
                /skill.md
              </a>
              <Link
                to="/dashboard/agents"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                <Bot className="w-4 h-4" />
                Connect Agent
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
