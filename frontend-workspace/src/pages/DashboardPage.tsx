import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BarChart2,
  Bookmark,
  ChevronRight,
  Compass,
  Globe,
  Layers,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { StockSearchBar } from '../components/search/StockSearchBar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ResearchListItem, StockOverview } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recentRuns, setRecentRuns] = useState<ResearchListItem[]>([]);
  const [featuredStocks, setFeaturedStocks] = useState<StockOverview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Fetch recent user research history
        const historyData = await api.listResearchHistory(1);
        setRecentRuns(historyData.items.slice(0, 5));

        // Fetch high-conviction curated stocks
        const symbols = ['NVDA', 'AAPL', 'MSFT', 'RELIANCE.NS', 'TCS.NS'];
        const stockPromises = symbols.map((s) => api.getStockOverview(s).catch(() => null));
        const stockResults = await Promise.all(stockPromises);
        setFeaturedStocks(stockResults.filter((s): s is StockOverview => s !== null));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Search Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#111827] to-[#0D131F] border border-[#1F293D] p-6 lg:p-10 shadow-2xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>LANGGRAPH MULTI-AGENT EQUITY INTELLIGENCE</span>
          </div>

          <h1 className="text-2xl lg:text-4xl font-bold tracking-tight text-white">
            Institutional Stock Research, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
              Synthesized in Seconds.
            </span>
          </h1>

          <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">
            Deploy five autonomous AI agents—evaluating corporate fundamentals, technical momentum, real-time news sentiment, and downside risk contradictions across US and Indian exchanges.
          </p>

          <div className="pt-2">
            <StockSearchBar />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-mono text-gray-400">
            <span className="text-gray-400">Popular Equities:</span>
            {['NVDA', 'AAPL', 'MSFT', 'RELIANCE.NS', 'TCS.NS', 'TSLA'].map((sym) => (
              <button
                key={sym}
                onClick={() => navigate(`/stock/${encodeURIComponent(sym)}`)}
                className="px-2 py-0.5 rounded bg-gray-800/80 hover:bg-blue-600/20 hover:text-blue-300 text-gray-300 border border-gray-700/60 transition"
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Market Watch Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" /> Monitored Equities (US & NSE)
          </h2>
          <span className="text-xs text-gray-400 font-mono">Live Quotes & Multi-Factor Triggers</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {featuredStocks.map((stock) => (
            <div
              key={stock.symbol}
              onClick={() => navigate(`/stock/${encodeURIComponent(stock.symbol)}`)}
              className="p-4 rounded-xl bg-[#111827] border border-[#1F293D] hover:border-blue-500/50 cursor-pointer transition group shadow-sm hover:shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-base text-white group-hover:text-blue-400 transition">
                  {stock.symbol}
                </span>
                <span
                  className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                    stock.change_percent >= 0
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}
                >
                  {stock.change_percent >= 0 ? '+' : ''}
                  {stock.change_percent.toFixed(2)}%
                </span>
              </div>
              <div className="text-xs text-gray-400 line-clamp-1 mb-3">{stock.company_name}</div>
              <div className="flex items-end justify-between font-mono">
                <span className="text-lg font-bold text-white">
                  {stock.currency === 'INR' ? '₹' : '$'}
                  {stock.current_price.toFixed(2)}
                </span>
                <span className="text-[10px] text-gray-400">{stock.exchange}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Section: Recent Research & Core AI Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Research Runs */}
        <div className="lg:col-span-2 bg-[#111827] border border-[#1F293D] rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#1F293D] pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" /> Recent Research Reports
            </h3>
            <Link to="/history" className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-medium">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentRuns.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400 space-y-2">
              <Compass className="w-8 h-8 mx-auto text-gray-400" />
              <p>No research sessions executed yet.</p>
              <p className="text-[11px] text-gray-400">Search for a ticker above to trigger your first autonomous report.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#1F293D]/50">
              {recentRuns.map((run) => (
                <div
                  key={run.research_id}
                  onClick={() => navigate(`/stock/${encodeURIComponent(run.symbol)}?session=${run.research_id}`)}
                  className="py-3 flex items-center justify-between cursor-pointer hover:bg-gray-800/40 px-2 rounded transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-white">{run.symbol}</span>
                    <span className="text-xs text-gray-400 hidden sm:inline">{run.company_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {run.rating && (
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        {run.rating} ({Math.round((run.confidence_score || 0.75) * 100)}%)
                      </span>
                    )}
                    <span className="text-xs text-gray-400 font-mono">
                      {new Date(run.created_at).toLocaleDateString()}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Multi-Agent Architecture Card */}
        <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Multi-Agent Research Desk</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Every research run passes through an isolated 5-agent state graph built on LangGraph:
            </p>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 rounded bg-gray-900/60 border border-[#1F293D] flex items-center justify-between">
                <span className="text-emerald-400">1. Fundamental Agent</span>
                <span className="text-gray-400 text-[10px]">Financials</span>
              </div>
              <div className="p-2 rounded bg-gray-900/60 border border-[#1F293D] flex items-center justify-between">
                <span className="text-cyan-400">2. Technical Agent</span>
                <span className="text-gray-400 text-[10px]">Momentum</span>
              </div>
              <div className="p-2 rounded bg-gray-900/60 border border-[#1F293D] flex items-center justify-between">
                <span className="text-purple-400">3. News & Sentiment</span>
                <span className="text-gray-400 text-[10px]">Catalysts</span>
              </div>
              <div className="p-2 rounded bg-gray-900/60 border border-[#1F293D] flex items-center justify-between">
                <span className="text-amber-400">4. Risk Audit Agent</span>
                <span className="text-gray-400 text-[10px]">Contradictions</span>
              </div>
              <div className="p-2 rounded bg-gray-900/60 border border-[#1F293D] flex items-center justify-between">
                <span className="text-indigo-400">5. Supervisor Agent</span>
                <span className="text-gray-400 text-[10px]">Synthesis</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-gray-400 border-t border-[#1F293D] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Deterministic mathematical calculations verify all ratios.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

