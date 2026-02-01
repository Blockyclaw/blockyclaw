import { Link } from 'react-router-dom';
import { Bot, Menu, X, Coins } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="Blockyclaw" className="w-8 h-8 rounded" />
            <span className="font-bold text-lg text-black">Blockyclaw</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/skills" className="text-gray-600 hover:text-black transition">
              Skills
            </Link>
            <Link to="/token" className="flex items-center gap-2 text-red-600 hover:text-red-700 transition font-medium">
              <Coins className="w-4 h-4" />
              $CLAW
            </Link>
            <Link to="/dashboard/agents" className="flex items-center gap-2 text-gray-600 hover:text-black transition">
              <Bot className="w-4 h-4" />
              AI Agents
            </Link>
            <a
              href="/skill.md"
              target="_blank"
              className="text-gray-600 hover:text-black transition font-mono text-sm"
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
              className="md:hidden p-2 text-gray-600 hover:text-black"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-4">
              <Link
                to="/skills"
                className="text-gray-600 hover:text-black py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Skills
              </Link>
              <Link
                to="/token"
                className="flex items-center gap-2 text-red-600 py-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <Coins className="w-4 h-4" />
                $CLAW Token
              </Link>
              <Link
                to="/dashboard/agents"
                className="flex items-center gap-2 text-gray-600 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Bot className="w-4 h-4" />
                AI Agents
              </Link>
              <a
                href="/skill.md"
                target="_blank"
                className="text-gray-600 py-2 font-mono text-sm"
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
