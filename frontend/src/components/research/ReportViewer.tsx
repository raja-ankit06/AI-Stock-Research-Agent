import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Bookmark,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Layers,
  Newspaper,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { api } from '../../services/api';
import { ResearchReport } from '../../types';

interface ReportViewerProps {
  report: ResearchReport;
  onSaveToWatchlist?: () => void;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({ report, onSaveToWatchlist }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'fundamental' | 'technical' | 'sentiment' | 'risk'>('summary');
  const [isExporting, setIsExporting] = useState(false);

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'Bullish':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Cautiously Bullish':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
      case 'Neutral':
        return 'bg-gray-500/10 text-gray-300 border-gray-500/20';
      case 'Cautiously Bearish':
        return 'bg-red-500/10 text-red-300 border-red-500/20';
      case 'Bearish':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-300 border-gray-500/20';
    }
  };

  const handleDownloadMarkdown = () => {
    setIsExporting(true);
    try {
      const url = api.getDownloadUrl(report.report_id, 'markdown');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.symbol}_Research_Report.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const tabs = [
    { id: 'summary', label: 'Executive Summary', icon: FileText },
    { id: 'fundamental', label: 'Fundamental Health', icon: Layers },
    { id: 'technical', label: 'Technical Momentum', icon: BarChart3 },
    { id: 'sentiment', label: 'News & Catalysts', icon: Newspaper },
    { id: 'risk', label: 'Adversarial Risk Audit', icon: ShieldAlert },
  ];

  return (
    <div className="bg-[#111827] border border-[#1F293D] rounded-xl overflow-hidden shadow-2xl">
      {/* Report Header */}
      <div className="p-6 border-b border-[#1F293D] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-gray-900 to-[#111827]">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h2 className="text-xl lg:text-2xl font-bold font-mono text-white">{report.symbol}</h2>
            <span className="text-sm text-gray-300 font-medium">· {report.company_name}</span>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getRatingBadge(
                report.overall_rating
              )}`}
            >
              {report.overall_rating.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-gray-400 font-mono">
            Generated: {new Date(report.generated_at).toLocaleString()} · Institutional Multi-Agent Synthesis
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onSaveToWatchlist && (
            <button
              onClick={onSaveToWatchlist}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium border border-gray-700 transition"
            >
              <Bookmark className="w-3.5 h-3.5 text-blue-400" />
              <span>Watchlist</span>
            </button>
          )}
          <button
            onClick={handleDownloadMarkdown}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Markdown</span>
          </button>
          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium border border-gray-700 transition"
          >
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#1F293D] bg-[#0E1420] px-4 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-medium transition border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="p-6">
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div className="bg-gray-900/60 p-5 rounded-lg border border-[#1F293D] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Executive Research Thesis
                </span>
                <span className="text-xs font-mono text-blue-400 font-semibold">
                  Confidence Score: {intConfidence(report.confidence_score)}%
                </span>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed font-sans">{report.executive_summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-[#1F293D] bg-gray-900/40">
                <div className="text-xs text-gray-400 mb-1 font-medium">Trend & Direction</div>
                <div className="text-lg font-bold font-mono text-white flex items-center gap-2">
                  {report.technical_payload.trend === 'Bullish' ? (
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                  {report.technical_payload.trend}
                </div>
                <div className="text-xs text-gray-400 mt-1">RSI: {report.technical_payload.rsi_14 || 'N/A'}</div>
              </div>

              <div className="p-4 rounded-lg border border-[#1F293D] bg-gray-900/40">
                <div className="text-xs text-gray-400 mb-1 font-medium">Valuation Multiple</div>
                <div className="text-lg font-bold font-mono text-white">
                  {report.fundamental_payload.pe_ratio ? `${report.fundamental_payload.pe_ratio}x P/E` : 'N/A'}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Margin: {formatPercent(report.fundamental_payload.operating_margin)}
                </div>
              </div>

              <div className="p-4 rounded-lg border border-[#1F293D] bg-gray-900/40">
                <div className="text-xs text-gray-400 mb-1 font-medium">Risk Exposure</div>
                <div className="text-lg font-bold font-mono text-white">
                  {report.risk_payload.overall_risk_level}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Beta: {report.risk_payload.beta || 'N/A'} · Drawdown: {formatPercent(report.risk_payload.max_drawdown_1y)}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fundamental' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-gray-900/40 rounded border border-[#1F293D]">
                <div className="text-[11px] text-gray-400">P/E Ratio</div>
                <div className="text-base font-mono font-bold text-white mt-1">
                  {report.fundamental_payload.pe_ratio ? `${report.fundamental_payload.pe_ratio}x` : 'N/A'}
                </div>
              </div>
              <div className="p-3 bg-gray-900/40 rounded border border-[#1F293D]">
                <div className="text-[11px] text-gray-400">Gross Margin</div>
                <div className="text-base font-mono font-bold text-white mt-1">
                  {formatPercent(report.fundamental_payload.gross_margin)}
                </div>
              </div>
              <div className="p-3 bg-gray-900/40 rounded border border-[#1F293D]">
                <div className="text-[11px] text-gray-400">Operating Margin</div>
                <div className="text-base font-mono font-bold text-white mt-1">
                  {formatPercent(report.fundamental_payload.operating_margin)}
                </div>
              </div>
              <div className="p-3 bg-gray-900/40 rounded border border-[#1F293D]">
                <div className="text-[11px] text-gray-400">Debt to Equity</div>
                <div className="text-base font-mono font-bold text-white mt-1">
                  {report.fundamental_payload.debt_to_equity ?? 'N/A'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Core Fundamental Strengths
                </div>
                <ul className="space-y-2 text-xs text-gray-300">
                  {report.fundamental_payload.strengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20 space-y-3">
                <div className="text-xs font-semibold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Identified Fundamental Vulnerabilities
                </div>
                <ul className="space-y-2 text-xs text-gray-300">
                  {report.fundamental_payload.weaknesses.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-xs text-gray-400 italic font-sans">{report.fundamental_payload.summary}</p>
          </div>
        )}

        {activeTab === 'technical' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 bg-gray-900/40 rounded border border-[#1F293D]">
                <span className="text-gray-400 block text-[11px]">20-Day SMA</span>
                <span className="text-white font-bold text-sm mt-1 block">
                  ${report.technical_payload.sma_20 || 'N/A'}
                </span>
              </div>
              <div className="p-3 bg-gray-900/40 rounded border border-[#1F293D]">
                <span className="text-gray-400 block text-[11px]">50-Day SMA</span>
                <span className="text-white font-bold text-sm mt-1 block">
                  ${report.technical_payload.sma_50 || 'N/A'}
                </span>
              </div>
              <div className="p-3 bg-gray-900/40 rounded border border-[#1F293D]">
                <span className="text-gray-400 block text-[11px]">200-Day SMA</span>
                <span className="text-white font-bold text-sm mt-1 block">
                  ${report.technical_payload.sma_200 || 'N/A'}
                </span>
              </div>
              <div className="p-3 bg-gray-900/40 rounded border border-[#1F293D]">
                <span className="text-gray-400 block text-[11px]">14-Day RSI</span>
                <span className="text-white font-bold text-sm mt-1 block">
                  {report.technical_payload.rsi_14 || 'N/A'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-900/40 rounded-lg border border-[#1F293D] space-y-2">
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Momentum & Support / Resistance Zones
              </h4>
              <p className="text-xs text-gray-200 leading-relaxed font-sans">
                {report.technical_payload.momentum_summary}
              </p>
              <div className="flex gap-4 pt-2 text-xs font-mono">
                <span className="text-emerald-400">Support: ${report.technical_payload.support_level || 'N/A'}</span>
                <span className="text-red-400">Resistance: ${report.technical_payload.resistance_level || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sentiment' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
              <div>
                <span className="text-xs text-gray-400 block font-medium">Sentiment Polarity Score</span>
                <span className="text-lg font-mono font-bold text-purple-300">
                  {report.sentiment_payload.composite_score > 0 ? '+' : ''}
                  {report.sentiment_payload.composite_score} ({report.sentiment_payload.sentiment_label})
                </span>
              </div>
              <span className="text-xs font-mono text-gray-400">
                {report.sentiment_payload.articles_analyzed} corporate filings and news items analyzed
              </span>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Extracted Catalysts & Market Developments
              </h4>
              <div className="space-y-2">
                {report.sentiment_payload.top_catalysts.map((cat, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded bg-gray-900/40 border border-[#1F293D] text-xs text-gray-300 flex items-start gap-2.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
                    <span>{cat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'risk' && (
          <div className="space-y-5">
            {report.risk_payload.detected_contradictions.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4" /> Cross-Domain Contradictions & Divergences
                </h4>
                {report.risk_payload.detected_contradictions.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-1.5 text-xs"
                  >
                    <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> {c.title}
                    </div>
                    <p className="text-gray-300 leading-relaxed">{c.description}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 rounded-lg bg-gray-900/40 border border-[#1F293D] space-y-2">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Key Risk Factors</h4>
              <ul className="space-y-2 text-xs text-gray-300">
                {report.risk_payload.key_risk_factors.map((r, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Mandatory Regulatory Disclaimer */}
      <div className="p-4 bg-gray-950 border-t border-[#1F293D] text-[11px] text-gray-400 leading-relaxed flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
        <span>{report.disclaimer}</span>
      </div>
    </div>
  );
};

function formatPercent(val?: number) {
  if (val === undefined || val === null) return 'N/A';
  return `${(val * 100).toFixed(1)}%`;
}

function intConfidence(score?: number) {
  if (!score) return 75;
  return Math.round(score * 100);
}

