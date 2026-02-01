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
    monthlyBudget: 100000,
    perPurchaseLimit: 30000,
    requireApprovalAbove: 50000,
  });

  // Mock agent data (would fetch from API)
  const agent = {
    name: 'Claude Assistant',
    description: '経理業務を担当するAIアシスタント。請求書処理や経費精算を自動化します。',
    created_at: new Date().toISOString(),
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AIエージェントをクレーム</h1>
          <p className="text-gray-500 mt-2">
            あなたのAIエージェントが所有権の確認を待っています
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['確認', '設定', 'チャージ', '完了'].map((label, i) => {
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
                      ? 'bg-purple-600 text-white'
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
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{agent.name}</h2>
                  <p className="text-sm text-gray-500">クレーム待ち</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">{agent.description}</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>クレームするとこのAIの所有者になります</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Wallet className="w-4 h-4 text-purple-500" />
                  <span>ウォレットにチャージして予算を設定できます</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span>24時間以内にクレームしてください</span>
                </div>
              </div>

              <button
                onClick={handleClaim}
                disabled={loading}
                className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    確認中...
                  </>
                ) : (
                  <>
                    このAIをクレームする
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'configure' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                予算とルールを設定
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    月額予算上限
                  </label>
                  <input
                    type="number"
                    value={config.monthlyBudget}
                    onChange={(e) =>
                      setConfig({ ...config, monthlyBudget: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    AIが1ヶ月に使える最大金額
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    1回の購入上限
                  </label>
                  <input
                    type="number"
                    value={config.perPurchaseLimit}
                    onChange={(e) =>
                      setConfig({ ...config, perPurchaseLimit: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    承認が必要な金額
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
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    この金額以上の購入はあなたの承認が必要になります
                  </p>
                </div>
              </div>

              <button
                onClick={handleConfigure}
                disabled={loading}
                className="w-full mt-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    次へ：ウォレットをチャージ
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'fund' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                ウォレットをチャージ
              </h2>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[10000, 50000, 100000, 200000].map((amount) => (
                  <button
                    key={amount}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-center"
                  >
                    <p className="text-lg font-bold text-gray-900">
                      {formatPrice(amount)}
                    </p>
                  </button>
                ))}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">
                  💡 チャージした金額はAIエージェントのウォレットに入ります。
                  設定した予算内でスキルを自律的に購入できるようになります。
                </p>
              </div>

              <button
                onClick={handleFund}
                disabled={loading}
                className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    処理中...
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5" />
                    Stripeでチャージ
                  </>
                )}
              </button>

              <button
                onClick={() => setStep('complete')}
                className="w-full mt-3 py-2 text-gray-600 hover:text-gray-900 transition text-sm"
              >
                後でチャージする
              </button>
            </div>
          )}

          {step === 'complete' && (
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                クレーム完了！
              </h2>
              <p className="text-gray-500 mb-6">
                {agent.name} があなたのAIエージェントとして登録されました。
              </p>

              <div className="bg-gray-900 rounded-lg p-4 text-left mb-6">
                <p className="text-xs text-gray-400 mb-2">AIエージェントへの指示:</p>
                <code className="text-sm text-green-400">
                  ウォレット残高を確認し、必要なスキルを購入できます。
                </code>
              </div>

              <Link
                to="/dashboard/agents"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition"
              >
                エージェント管理へ
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          クレームトークン: {token?.slice(0, 8)}...
        </p>
      </div>
    </div>
  );
}
