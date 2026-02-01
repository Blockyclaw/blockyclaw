import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Bot,
  Check,
  Wallet,
  Shield,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';

export function ClaimAgentPage() {
  const { token } = useParams();
  const [step, setStep] = useState<'preview' | 'configure' | 'fund' | 'complete'>('preview');
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    monthlyBudget: 1000,
    perPurchaseLimit: 300,
    requireApprovalAbove: 500,
  });

  // Mock agent data (would fetch from API)
  const agent = {
    name: 'Claude Assistant',
    description: 'An AI assistant handling accounting tasks. Automates invoice processing and expense reports.',
    created_at: new Date().toISOString(),
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleClaim = async () => {
    setLoading(true);
    // API call to claim agent
    await new Promise(resolve => setTimeout(resolve, 1500));
    setStep('configure');
    setLoading(false);
  };

  const handleConfigure = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStep('fund');
    setLoading(false);
  };

  const handleFund = async () => {
    setLoading(true);
    // Would redirect to Stripe Checkout
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStep('complete');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Claim Your AI Agent</h1>
          <p className="text-gray-500 mt-2">
            Your AI agent is waiting for ownership verification
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['Verify', 'Configure', 'Fund', 'Complete'].map((label, i) => {
            const stepIndex = ['preview', 'configure', 'fund', 'complete'].indexOf(step);
            const isActive = i === stepIndex;
            const isComplete = i < stepIndex;

            return (
              <div key={label} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition ${
                    isComplete
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isComplete ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                {i < 3 && (
                  <div
                    className={`w-12 h-1 mx-1 rounded ${
                      i < stepIndex ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {step === 'preview' && (
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{agent.name}</h2>
                  <p className="text-sm text-gray-500">Pending Claim</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">{agent.description}</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Claiming makes you the owner of this AI</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Wallet className="w-4 h-4 text-red-500" />
                  <span>You can fund the wallet and set budgets</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span>Please claim within 24 hours</span>
                </div>
              </div>

              <button
                onClick={handleClaim}
                disabled={loading}
                className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Claim This AI
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'configure' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Set Budget & Rules
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Budget Limit
                  </label>
                  <input
                    type="number"
                    value={config.monthlyBudget}
                    onChange={(e) =>
                      setConfig({ ...config, monthlyBudget: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum amount the AI can spend per month
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Per-Purchase Limit
                  </label>
                  <input
                    type="number"
                    value={config.perPurchaseLimit}
                    onChange={(e) =>
                      setConfig({ ...config, perPurchaseLimit: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Require Approval Above
                  </label>
                  <input
                    type="number"
                    value={config.requireApprovalAbove}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        requireApprovalAbove: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Purchases above this amount require your approval
                  </p>
                </div>
              </div>

              <button
                onClick={handleConfigure}
                disabled={loading}
                className="w-full mt-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Next: Fund Wallet
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'fund' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Fund Your Wallet
              </h2>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[100, 500, 1000, 2000].map((amount) => (
                  <button
                    key={amount}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition text-center"
                  >
                    <p className="text-lg font-bold text-gray-900">
                      {formatPrice(amount)}
                    </p>
                  </button>
                ))}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">
                  Funds are deposited into your AI agent's wallet.
                  The agent can autonomously purchase skills within your budget settings.
                </p>
              </div>

              <button
                onClick={handleFund}
                disabled={loading}
                className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5" />
                    Fund with Stripe
                  </>
                )}
              </button>

              <button
                onClick={() => setStep('complete')}
                className="w-full mt-3 py-2 text-gray-600 hover:text-gray-900 transition text-sm"
              >
                Fund Later
              </button>
            </div>
          )}

          {step === 'complete' && (
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Claim Complete!
              </h2>
              <p className="text-gray-500 mb-6">
                {agent.name} has been registered as your AI agent.
              </p>

              <div className="bg-gray-900 rounded-lg p-4 text-left mb-6">
                <p className="text-xs text-gray-400 mb-2">Instructions for your AI agent:</p>
                <code className="text-sm text-green-400">
                  You can check wallet balance and purchase needed skills.
                </code>
              </div>

              <Link
                to="/dashboard/agents"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
              >
                Go to Agent Management
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Claim Token: {token?.slice(0, 8)}...
        </p>
      </div>
    </div>
  );
}
