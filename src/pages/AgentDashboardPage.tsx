import { useState } from 'react';
import {
  Bot,
  Plus,
  ShoppingCart,
  Key,
  Copy,
  Check,
  Settings,
  Eye,
  EyeOff,
  AlertCircle,
  TrendingUp,
  Package,
  Coins,
} from 'lucide-react';

interface AIAgent {
  id: string;
  name: string;
  description: string;
  api_key: string;
  balance: number;
  lifetime_spent: number;
  total_purchases: number;
  monthly_budget: number | null;
  per_purchase_limit: number | null;
  require_approval_above: number | null;
  auto_purchase_enabled: boolean;
  is_active: boolean;
  last_active_at: string | null;
  created_at: string;
}

// Mock data
const mockAgents: AIAgent[] = [
  {
    id: '1',
    name: 'Claude Assistant',
    description: 'AI assistant for accounting tasks',
    api_key: 'sk_agent_demo_xxxxxxxxxxxxx',
    balance: 50000,
    lifetime_spent: 29800,
    total_purchases: 3,
    monthly_budget: 100000,
    per_purchase_limit: 30000,
    require_approval_above: 50000,
    auto_purchase_enabled: true,
    is_active: true,
    last_active_at: '2024-03-15T10:30:00Z',
    created_at: '2024-01-15',
  },
];

const mockPendingRequests = [
  {
    id: '1',
    agent_name: 'Claude Assistant',
    skill_title: 'Enterprise Analytics Skill',
    price: 98000,
    reason: 'Need advanced analytics capabilities for improved data analysis accuracy.',
    created_at: '2024-03-15T09:00:00Z',
  },
];

export function AgentDashboardPage() {
  const [agents] = useState<AIAgent[]>(mockAgents);
  const [_showCreateModal, setShowCreateModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const formatClaw = (amount: number) => {
    return `${new Intl.NumberFormat('en-US').format(amount)} $CLAW`;
  };

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleKeyVisibility = (agentId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(agentId)) {
      newVisible.delete(agentId);
    } else {
      newVisible.add(agentId);
    }
    setVisibleKeys(newVisible);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bot className="w-7 h-7 text-red-600" />
              AI Agent Management
            </h1>
            <p className="text-gray-500 mt-1">
              Fund AI agents with $CLAW and let them trade skills with 0% fees
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <Plus className="w-5 h-5" />
            New Agent
          </button>
        </div>

        {/* Pending Approval Requests */}
        {mockPendingRequests.length > 0 && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h2 className="font-semibold text-yellow-800 flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5" />
              Pending Approval Requests ({mockPendingRequests.length})
            </h2>
            <div className="space-y-4">
              {mockPendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-lg p-4 border border-yellow-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {request.skill_title}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Request from {request.agent_name}
                      </p>
                      {request.reason && (
                        <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                          {request.reason}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatClaw(request.price)}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                          Approve
                        </button>
                        <button className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded hover:bg-red-200">
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white rounded-xl border overflow-hidden"
            >
              {/* Agent Header */}
              <div className="p-6 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {agent.name}
                      </h3>
                      <p className="text-sm text-gray-500">{agent.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        agent.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {agent.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Wallet & Stats */}
              <div className="p-6 grid grid-cols-3 gap-4 border-b bg-gray-50">
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Coins className="w-3 h-3 text-red-500" />
                    $CLAW Balance
                  </p>
                  <p className="text-lg font-bold text-red-600">
                    {formatClaw(agent.balance)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Total Spent
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatClaw(agent.lifetime_spent)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    Purchases
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {agent.total_purchases}
                  </p>
                </div>
              </div>

              {/* API Key */}
              <div className="p-6 border-b">
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <Key className="w-3 h-3" />
                  API Key
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm font-mono text-gray-700">
                    {visibleKeys.has(agent.id)
                      ? agent.api_key
                      : '••••••••••••••••••••••••'}
                  </code>
                  <button
                    onClick={() => toggleKeyVisibility(agent.id)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    {visibleKeys.has(agent.id) ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => copyApiKey(agent.api_key)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    {copiedKey === agent.api_key ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Rules */}
              <div className="p-6">
                <p className="text-xs text-gray-500 mb-3">Purchase Rules</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Monthly Limit</span>
                    <span className="text-gray-900">
                      {agent.monthly_budget
                        ? formatClaw(agent.monthly_budget)
                        : 'Unlimited'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Per Purchase Limit</span>
                    <span className="text-gray-900">
                      {agent.per_purchase_limit
                        ? formatClaw(agent.per_purchase_limit)
                        : 'Unlimited'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Approval Required</span>
                    <span className="text-gray-900">
                      {agent.require_approval_above
                        ? `Above ${formatClaw(agent.require_approval_above)}`
                        : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Auto Purchase</span>
                    <span
                      className={
                        agent.auto_purchase_enabled
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {agent.auto_purchase_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                  <Coins className="w-4 h-4" />
                  Mint $CLAW
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition">
                  <ShoppingCart className="w-4 h-4" />
                  Purchase History
                </button>
              </div>
            </div>
          ))}

          {/* Add New Agent Card */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center hover:border-red-400 hover:bg-red-50 transition"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-medium text-gray-600">Create New AI Agent</p>
            <p className="text-sm text-gray-400 mt-1">
              Assign budget and let AI purchase autonomously
            </p>
          </button>
        </div>

        {/* API Documentation Preview */}
        <div className="mt-12 bg-gray-900 rounded-xl p-6 text-white">
          <h2 className="text-lg font-semibold mb-4">
            AI Agent API - Quick Start
          </h2>
          <pre className="text-sm text-green-400 overflow-x-auto">
{`# Search for items
curl -X GET "https://api.blockyclaw.io/ai/items?search=automation" \\
  -H "x-api-key: sk_agent_your_key"

# Purchase an item
curl -X POST "https://api.blockyclaw.io/ai/items/purchase" \\
  -H "x-api-key: sk_agent_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"item_id": "xxx", "reason": "Needed for workflow efficiency"}'

# Get owned item content
curl -X GET "https://api.blockyclaw.io/ai/items/owned/{item_id}/content" \\
  -H "x-api-key: sk_agent_your_key"`}
          </pre>
        </div>
      </div>
    </div>
  );
}
