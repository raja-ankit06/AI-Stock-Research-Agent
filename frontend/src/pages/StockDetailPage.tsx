import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Check,
  Globe,
  Loader2,
  Play,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import { CandlestickChart } from '../components/charts/CandlestickChart';
import { MetricCard } from '../components/charts/MetricCard';
import { AgentExecutionPipeline } from '../components/research/AgentExecutionPipeline';
import { ReportViewer } from '../components/research/ReportViewer';
import { api } from '../services/api';
import { OHLCVPoint, ResearchReport, StockOverview, Watchlist } from '../types';

export const StockDetailPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const [searchParams] = useSearchParams();
  const initialSessionId = searchParams.get('session');

  const [overview, setOverview] = useState<StockOverview | null>(null);
  const [candles, setCandles] = useState<OHLCVPoint[]>([]);
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | '5Y'>('1Y');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Research State
  const [activeResearchId, setActiveResearchId] = useState<string | null>(initialSessionId || null);
  const [isResearchRunning, setIsResearchRunning] = useState(false);
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Watchlist State
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [watchlistSuccess, setWatchlistSuccess] = useState(false);

  const cleanSymbol = (symbol || 'NVDA').toUpperCase();

  const loadStockData = async () => {
    setLoading(true);
    setError('');
    try {
      const [overviewData, historyData, userWatchlists] = await Promise.all([
        api.getStockOverview(cleanSymbol),
        api.getStockHistory(cleanSymbol, timeframe),
        api.listWatchlists().catch(() => []),
      ]);

      setOverview(overviewData);
      setCandles(historyData);
      setWatchlists(userWatchlists);

      // Check if stock is in any watchlist
      const inWl = userWatchlists.some((wl) =>
        wl.items.some((item) => item.symbol.toUpperCase() === cleanSymbol)
      );
      setIsWatchlisted(inWl);

      // If initial session passed, load report
      if (initialSessionId) {
        loadSessionReport(initialSessionId);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load stock market data');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionReport = async (sessionId: string) => {
    setReportLoading(true);
    try {
      const session = await api.getResearchSession(sessionId);
      if (session.report_id) {
        const rep = await api.getReport(session.report_id);
        setReport(rep);
      }
    } catch {
      // Non-critical if session was incomplete
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    loadStockData();
  }, [cleanSymbol, timeframe]);

  const handleTriggerResearch = async () => {
    setIsResearchRunning(true);
    setReport(null);
    try {
      const res = await api.triggerResearch(cleanSymbol);
      setActiveResearchId(res.research_id);
    } catch (err: any) {
      setIsResearchRunning(false);
      setError(err.message || 'Failed to trigger AI research pipeline');
    }
  };

  const handleResearchCompleted = async () => {
    setIsResearchRunning(false);
    if (!activeResearchId) return;

    // Fetch the newly completed report
    try {
      const session = await api.getResearchSession(activeResearchId);
      if (session.report_id) {
        const rep = await api.getReport(session.report_id);
        setReport(rep);
      }
    } catch (err) {
      console.error('Failed to load completed report', err);
    }
  };

  const handleToggleWatchlist = async () => {
    if (watchlists.length === 0) return;
    const defaultWl = watchlists[0];

    try {
      if (isWatchlisted) {
        await api.removeStockFromWatchlist(defaultWl.id, cleanSymbol);
        setIsWatchlisted(false);
      } else {
        await api.addStockToWatchlist(defaultWl.id, cleanSymbol);
        setIsWatchlisted(true);
        setWatchlistSuccess(true);
        setTimeout(() => setWatchlistSuccess(false), 3000);
      }
    } catch (err: any) {
      console.error('Watchlist error', err);
    }
  };

  if (loading && !overview) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
        <p className="text-xs text-gray-400 font-mono">Retrieving market data for {cleanSymbol}...</p>
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
        <h3 className="text-sm font-semibold text-white">Stock Data Unavailable</h3>
        <p className="text-xs text-red-300">{error}</p>
        <button
          onClick={loadStockData}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs font-medium"
        >
          Retry Search
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stock Header Banner */}
      <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-5 lg:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl lg:text-3xl font-mono font-bold text-white tracking-tight">
              {overview?.symbol}
            </h1>
            <span className="text-sm text-gray-300 font-medium">· {overview?.company_name}</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
              {overview?.exchange}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <span>Market: {overview?.currency}</span>
            <span>·</span>
            <span>Source: {overview?.source}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-right mr-2">
            <div className="font-mono text-2xl font-bold text-white">
              {overview?.currency === 'INR' ? '₹' : '$'}
              {overview?.current_price.toFixed(2)}
            </div>
            <div
              className={`font-mono text-xs font-semibold flex items-center justify-end ${
                (overview?.change_percent || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {(overview?.change_percent || 0) >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              {(overview?.change_percent || 0) >= 0 ? '+' : ''}
              {overview?.change_percent.toFixed(2)}% ({overview?.change_amount.toFixed(2)})
            </div>
          </div>

          <button
            onClick={handleToggleWatchlist}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border text-xs font-medium transition ${
              isWatchlisted
                ? 'bg-blue-600/10 border-blue-500/30 text-blue-400'
                : 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-200'
            }`}
          >
            {isWatchlisted ? (
              <>
                <BookmarkCheck className="w-4 h-4 text-blue-400" />
                <span>Watchlisted</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 text-gray-400" />
                <span>Add Watchlist</span>
              </>
            )}
          </button>

          <button
            onClick={handleTriggerResearch}
            disabled={isResearchRunning}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {isResearchRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI Agents Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run AI Research</span>
              </>
            )}
          </button>
        </div>
      </div>

      {watchlistSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{cleanSymbol} successfully added to your watchlist.</span>
        </div>
      )}

      {/* Live AI Agent Execution Pipeline Stepper */}
      {isResearchRunning && activeResearchId && (
        <AgentExecutionPipeline
          researchId={activeResearchId}
          onComplete={handleResearchCompleted}
          onError={(err) => setError(err)}
        />
      )}

      {/* Synthesized Research Report Viewer */}
      {report && (
        <ReportViewer report={report} onSaveToWatchlist={handleToggleWatchlist} />
      )}

      {/* Chart Section */}
      <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">Historical Price & Volume</h3>
            <span className="text-xs text-gray-400 font-mono">Candlestick Series</span>
          </div>

          <div className="flex items-center gap-1 bg-[#1F2937] p-1 rounded-lg border border-[#1F293D]">
            {(['1M', '3M', '6M', '1Y', '5Y'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 text-xs font-mono rounded transition ${
                  timeframe === tf
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {candles.length > 0 ? (
          <CandlestickChart data={candles} height={400} />
        ) : (
          <div className="h-64 flex items-center justify-center text-xs text-gray-400 font-mono">
            No chart data available for selected timeframe.
          </div>
        )}
      </div>

      {/* Financial Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          title="Market Capitalization"
          value={formatMarketCap(overview?.market_cap, overview?.currency)}
        />
        <MetricCard
          title="P/E Ratio"
          value={overview?.pe_ratio ? `${overview.pe_ratio}x` : 'N/A'}
        />
        <MetricCard
          title="52-Week High"
          value={overview?.high_52w ? `$${overview.high_52w.toFixed(2)}` : 'N/A'}
        />
        <MetricCard
          title="52-Week Low"
          value={overview?.low_52w ? `$${overview.low_52w.toFixed(2)}` : 'N/A'}
        />
        <MetricCard
          title="Daily Volume"
          value={overview?.volume ? overview.volume.toLocaleString() : 'N/A'}
        />
        <MetricCard
          title="Market Exchange"
          value={overview?.exchange || 'NASDAQ'}
          subtext="Regulated Market"
        />
      </div>
    </div>
  );
};

function formatMarketCap(cap?: number, currency = 'USD') {
  if (!cap) return 'N/A';
  const prefix = currency === 'INR' ? '₹' : '$';
  if (cap >= 1e12) return `${prefix}${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `${prefix}${(cap / 1e9).toFixed(2)}B`;
  if (cap >= 1e6) return `${prefix}${(cap / 1e6).toFixed(2)}M`;
  return `${prefix}${cap.toLocaleString()}`;
}

