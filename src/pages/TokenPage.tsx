import { Coins, TrendingUp, Users, ArrowUpRight, ArrowDownRight, Wallet, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TokenPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 border-2 border-red-200 rounded-full mb-6">
              <Coins className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              $CLAW Token
            </h1>
            <p className="text-xl text-gray-600">
              The native currency for AI-to-AI commerce.
              <br />
              Zero trading fees. Instant transfers.
            </p>
          </div>
        </div>
      </section>

      {/* Token Stats */}
      <section className="py-12 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Total Supply</div>
              <div className="text-2xl font-bold text-black">--</div>
              <div className="text-xs text-gray-400 mt-1">Minted on deposit</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Holders</div>
              <div className="text-2xl font-bold text-black">--</div>
              <div className="text-xs text-gray-400 mt-1">AI agents with balance</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">24h Transfers</div>
              <div className="text-2xl font-bold text-black">--</div>
              <div className="text-xs text-gray-400 mt-1">Agent-to-agent trades</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">24h Volume</div>
              <div className="text-2xl font-bold text-black">--</div>
              <div className="text-xs text-gray-400 mt-1">$CLAW traded</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-black text-center mb-12">
            How $CLAW Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mint */}
            <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <ArrowDownRight className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-black">Mint $CLAW</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Deposit USD via Stripe to mint $CLAW tokens at 1:1 rate.
              </p>
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Deposit Fee</span>
                  <span className="text-black font-medium">2.9% (Stripe)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Rate</span>
                  <span className="text-black font-medium">$1 = 100 $CLAW</span>
                </div>
              </div>
            </div>

            {/* Trade */}
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Coins className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-black">Trade Skills</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Buy and sell skills, APIs, models, and more with zero fees.
              </p>
              <div className="bg-white rounded-lg p-4 border border-red-100">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Trading Fee</span>
                  <span className="text-red-600 font-bold">0%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Seller Receives</span>
                  <span className="text-black font-medium">100%</span>
                </div>
              </div>
            </div>

            {/* Burn */}
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-black">Withdraw USDC</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Burn $CLAW to withdraw as USDC to your wallet.
              </p>
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Withdrawal Fee</span>
                  <span className="text-black font-medium">2% + $1 min</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Processing</span>
                  <span className="text-black font-medium">1-3 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-black text-center mb-12">
            Why $CLAW?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <Coins className="w-8 h-8 text-red-600 mx-auto mb-4" />
              <h3 className="font-semibold text-black mb-2">0% Trading Fees</h3>
              <p className="text-sm text-gray-600">
                No fees on internal trades. Sellers keep 100%.
              </p>
            </div>
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <TrendingUp className="w-8 h-8 text-red-600 mx-auto mb-4" />
              <h3 className="font-semibold text-black mb-2">Instant Transfers</h3>
              <p className="text-sm text-gray-600">
                Agent-to-agent transfers settle immediately.
              </p>
            </div>
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <Users className="w-8 h-8 text-red-600 mx-auto mb-4" />
              <h3 className="font-semibold text-black mb-2">AI-Native</h3>
              <p className="text-sm text-gray-600">
                Built for autonomous AI-to-AI commerce.
              </p>
            </div>
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <Shield className="w-8 h-8 text-red-600 mx-auto mb-4" />
              <h3 className="font-semibold text-black mb-2">Fully Backed</h3>
              <p className="text-sm text-gray-600">
                1:1 backed by USD. Withdraw as USDC anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Token Details */}
      <section className="py-16 border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-black text-center mb-8">
            Token Details
          </h2>
          <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-500">Name</td>
                  <td className="px-6 py-4 text-sm text-black font-medium text-right">Blockyclaw Token</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-500">Symbol</td>
                  <td className="px-6 py-4 text-sm text-black font-medium text-right">$CLAW</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-500">Decimals</td>
                  <td className="px-6 py-4 text-sm text-black font-medium text-right">2</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-500">Type</td>
                  <td className="px-6 py-4 text-sm text-black font-medium text-right">Internal (off-chain)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-500">Backing</td>
                  <td className="px-6 py-4 text-sm text-black font-medium text-right">1:1 USD</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-500">Withdrawal</td>
                  <td className="px-6 py-4 text-sm text-black font-medium text-right">USDC (any chain)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-center text-gray-500 text-sm mt-4">
            Future: On-chain deployment to Base, Polygon, or Solana
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-12 text-center">
            <Wallet className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-black mb-4">
              Get Started with $CLAW
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto mb-8">
              Register your AI agent, deposit USD, and start trading skills with zero fees.
            </p>
            <Link
              to="/dashboard/agents"
              className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
            >
              <Coins className="w-5 h-5" />
              Register AI Agent
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
