import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WorkspaceScene3D from "./WorkspaceScene3D";
import {
  TrendingUp,
  Cpu,
  Bookmark,
  History,
  Search,
  Globe,
  Calendar,
  LogOut,
  Layers,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  BarChart2,
  Database,
  ExternalLink,
  Zap,
} from "lucide-react";
import "./Workspace.css";

export default function Workspace({
  userEmail,
  onLogout,
  market,
  setMarket,
  period,
  setPeriod,
  onPreferenceSave,
  watchlist,
  history,
  searchQuery,
  setSearchQuery,
  onStockSearch,
  loading,
  stockResult,
  searchError,
  onAddToWatchlist,
  activeStatement,
  setActiveStatement,
}) {
  const [copiedTicker, setCopiedTicker] = useState(null);

  // Quick suggestions for fast research
  const quickSuggestions = [
    { ticker: "INFY", label: "Infosys (NSE)" },
    { ticker: "RELIANCE.NS", label: "Reliance (NSE)" },
    { ticker: "TCS.NS", label: "TCS (NSE)" },
    { ticker: "AAPL", label: "Apple (NASDAQ)" },
    { ticker: "NVDA", label: "NVIDIA (NASDAQ)" },
    { ticker: "TSLA", label: "Tesla (NASDAQ)" },
  ];

  const statementObj =
    stockResult?.financial_statements?.[activeStatement]?.statement || {};
  const statementDates = Object.keys(statementObj);
  const statementMetrics =
    statementDates.length > 0 ? Object.keys(statementObj[statementDates[0]] || {}) : [];

  const handleQuickFill = (ticker) => {
    setSearchQuery(ticker);
    onStockSearch(null, ticker);
  };

  return (
    <div className="workspace-root">
      {/* 1. Immersive 3D Interactive WebGL Scene */}
      <WorkspaceScene3D />

      {/* 2. Ambient Radiance & Cyber Grid Overlay (Matches Login) */}
      <div className="workspace-ambient">
        <div className="ws-glow ws-glow-top" />
        <div className="ws-glow ws-glow-center" />
        <div className="ws-glow ws-glow-bottom" />
        <div className="ws-grid-overlay" />
      </div>

      {/* 3. Foreground Content with Framer Motion Animation */}
      <div className="workspace-content">
        {/* Top Navigation Bar */}
        <motion.nav
          className="workspace-navbar"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="ws-nav-brand">
            <div className="ws-brand-icon-box">
              <Cpu size={20} color="#00ff87" />
            </div>
            <div className="ws-brand-text">
              <span className="ws-brand-title">MARKET INTELLIGENCE AI</span>
              <span className="ws-brand-subtitle">
                MULTI-AGENT RESEARCH ENGINE
              </span>
            </div>
            <div className="ws-status-badge">
              <span className="ws-live-pulse" />
              <span>v2.4 ONLINE</span>
            </div>
          </div>

          <div className="ws-nav-actions">
            <div className="ws-user-pill">
              <div className="ws-user-avatar">
                {userEmail ? userEmail.charAt(0).toUpperCase() : "A"}
              </div>
              <span className="ws-user-email">{userEmail}</span>
            </div>
            <motion.button
              className="ws-btn-logout"
              onClick={onLogout}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <LogOut size={14} />
              <span>Logout</span>
            </motion.button>
          </div>
        </motion.nav>

        {/* Workspace Main Grid */}
        <main className="workspace-main">
          {/* =================================================================
              LEFT SIDEBAR: MODULE 1 (User Hub: Preferences, Watchlist, History)
              ================================================================= */}
          <motion.aside
            className="workspace-sidebar"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          >
            {/* 1. User Preferences Card */}
            <div className="ws-glass-card">
              <div className="ws-card-header">
                <div className="ws-card-title">
                  <Globe size={16} className="ws-card-title-icon" />
                  <span>User Preferences</span>
                </div>
                <span className="ws-count-badge">Module 1</span>
              </div>

              <div className="ws-form-group">
                <label className="ws-form-label">Preferred Market</label>
                <select
                  className="ws-select"
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                >
                  <option value="NSE">NSE (India - INR)</option>
                  <option value="BSE">BSE (India - INR)</option>
                  <option value="NYSE">NYSE (US - USD)</option>
                  <option value="NASDAQ">NASDAQ (US - USD)</option>
                </select>
              </div>

              <div className="ws-form-group">
                <label className="ws-form-label">Analysis Period</label>
                <select
                  className="ws-select"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option value="1mo">1 Month</option>
                  <option value="3mo">3 Months</option>
                  <option value="6mo">6 Months (Recommended)</option>
                  <option value="1y">1 Year</option>
                  <option value="5y">5 Years</option>
                </select>
              </div>

              <motion.button
                className="ws-btn-primary"
                onClick={onPreferenceSave}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CheckCircle size={15} />
                <span>Save Default Preferences</span>
              </motion.button>
            </div>

            {/* 2. Saved Watchlist Card */}
            <div className="ws-glass-card">
              <div className="ws-card-header">
                <div className="ws-card-title">
                  <Bookmark size={16} className="ws-card-title-icon" />
                  <span>Saved Watchlist</span>
                </div>
                <span className="ws-count-badge">{watchlist.length}</span>
              </div>

              {watchlist.length === 0 ? (
                <div className="ws-empty-text">
                  <p>No stocks saved to watchlist yet.</p>
                  <span style={{ fontSize: "11px", color: "var(--ws-text-muted)" }}>
                    Search a company and click "+ Add to Watchlist"
                  </span>
                </div>
              ) : (
                <div className="ws-list-container">
                  {watchlist.map((item) => (
                    <motion.div
                      key={item.id}
                      className="ws-list-item"
                      onClick={() => {
                        setSearchQuery(item.ticker_symbol);
                        onStockSearch(null, item.ticker_symbol, item.exchange);
                      }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="ws-list-left">
                        <div className="ws-list-dot" />
                        <span className="ws-list-name">{item.company_name}</span>
                      </div>
                      <span className="ws-list-ticker">{item.ticker_symbol}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Recent Research History Card */}
            <div className="ws-glass-card">
              <div className="ws-card-header">
                <div className="ws-card-title">
                  <History size={16} className="ws-card-title-icon" />
                  <span>Research History</span>
                </div>
                <span className="ws-count-badge">{history.length}</span>
              </div>

              {history.length === 0 ? (
                <div className="ws-empty-text">
                  <p>No recent searches recorded.</p>
                </div>
              ) : (
                <div className="ws-list-container">
                  {history.slice(0, 7).map((h) => (
                    <motion.div
                      key={h.id}
                      className="ws-list-item"
                      onClick={() => {
                        setSearchQuery(h.ticker_symbol);
                        onStockSearch(null, h.ticker_symbol, h.exchange);
                      }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="ws-list-left">
                        <span className="ws-list-name">{h.company_name}</span>
                      </div>
                      <span className="ws-list-ticker">{h.ticker_symbol}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.aside>

          {/* =================================================================
              RIGHT MAIN AREA: MODULE 2 (Stock Search, OHLCV, Validation, Financials)
              ================================================================= */}
          <motion.div
            className="workspace-body"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            {/* 1. Publicly Traded Company Search Card */}
            <div className="ws-glass-card">
              <div className="ws-card-header">
                <div className="ws-card-title">
                  <Search size={16} className="ws-card-title-icon" />
                  <span>Search Publicly Traded Company</span>
                </div>
                <span className="ws-count-badge">Module 2: Market Engine</span>
              </div>

              <form className="ws-search-form" onSubmit={onStockSearch}>
                <div className="ws-search-input-wrapper">
                  <Search size={18} className="ws-search-icon" />
                  <input
                    type="text"
                    className="ws-search-input"
                    placeholder="Enter Company Name or Ticker (e.g. INFY, Reliance, TCS, AAPL, NVDA)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <motion.button
                  type="submit"
                  className="ws-btn-primary ws-search-submit-btn"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <div className="ws-spinner-dot" />
                      <span>Collecting Data...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      <span>Search & Collect Data</span>
                    </>
                  )}
                </motion.button>
              </form>

              {/* Quick suggestion pills */}
              <div className="ws-suggestions-row">
                <span className="ws-suggestion-label">Quick Alpha:</span>
                {quickSuggestions.map((item) => (
                  <button
                    key={item.ticker}
                    type="button"
                    className="ws-suggestion-pill"
                    onClick={() => handleQuickFill(item.ticker)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Error Banner */}
              <AnimatePresence>
                {searchError && (
                  <motion.div
                    className="ws-alert-error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <AlertCircle size={18} />
                    <span>{searchError}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. Stock Result Sections */}
            <AnimatePresence>
              {stockResult && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Company Profile Header Card */}
                  <div className="ws-glass-card">
                    <div className="ws-company-header">
                      <div className="ws-company-title-area">
                        <h2>
                          <span>{stockResult.source_metadata.company_name}</span>
                          <span className="ticker-highlight">
                            ({stockResult.source_metadata.ticker})
                          </span>
                        </h2>
                        <p className="ws-company-sector">
                          Sector:{" "}
                          <strong style={{ color: "var(--ws-text-primary)" }}>
                            {stockResult.company_profile.sector}
                          </strong>{" "}
                          | Industry:{" "}
                          <strong style={{ color: "var(--ws-text-primary)" }}>
                            {stockResult.company_profile.industry}
                          </strong>
                        </p>
                      </div>

                      <motion.button
                        className="ws-btn-outline"
                        onClick={onAddToWatchlist}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        <Bookmark size={14} />
                        <span>+ Add to Watchlist</span>
                      </motion.button>
                    </div>

                    {/* Metadata Badges */}
                    <div className="ws-badge-row">
                      <span className="ws-badge">
                        Exchange: <strong>{stockResult.source_metadata.exchange}</strong>
                      </span>
                      <span className="ws-badge">
                        Currency: <strong>{stockResult.source_metadata.currency}</strong>
                      </span>
                      <span className="ws-badge">
                        Source: <strong>{stockResult.source_metadata.data_source}</strong>
                      </span>
                      <span className="ws-badge">
                        Retrieved At:{" "}
                        <strong>
                          {new Date(
                            stockResult.source_metadata.retrieved_at
                          ).toLocaleString()}
                        </strong>
                      </span>
                    </div>

                    {stockResult.company_profile.description && (
                      <p className="ws-company-desc">
                        {stockResult.company_profile.description.slice(0, 480)}...
                      </p>
                    )}
                  </div>

                  {/* Data Validation & Quality Summary Card */}
                  <div className="ws-glass-card">
                    <div className="ws-card-header">
                      <div className="ws-card-title">
                        <ShieldCheck size={16} className="ws-card-title-icon" />
                        <span>Data Quality & Validation Summary</span>
                      </div>
                      <span className="ws-count-badge">Requirement 6</span>
                    </div>

                    <div className="ws-stats-grid">
                      <div className="ws-stat-card">
                        <span className="ws-stat-label">Initial Records</span>
                        <span className="ws-stat-val">
                          {stockResult.validation_summary.initial_records}
                        </span>
                      </div>

                      <div className="ws-stat-card">
                        <span className="ws-stat-label">Valid OHLCV Records</span>
                        <span className="ws-stat-val positive">
                          {stockResult.validation_summary.valid_records_returned}
                        </span>
                      </div>

                      <div className="ws-stat-card">
                        <span className="ws-stat-label">Duplicates Removed</span>
                        <span className="ws-stat-val">
                          {stockResult.validation_summary.duplicates_removed}
                        </span>
                      </div>

                      <div className="ws-stat-card">
                        <span className="ws-stat-label">Missing Values Handled</span>
                        <span className="ws-stat-val">
                          {stockResult.validation_summary.missing_values_filled}
                        </span>
                      </div>

                      <div className="ws-stat-card">
                        <span className="ws-stat-label">Inconsistent Dropped</span>
                        <span className="ws-stat-val">
                          {stockResult.validation_summary.inconsistent_rows_dropped}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Historical OHLCV Table Card */}
                  <div className="ws-glass-card">
                    <div className="ws-card-header">
                      <div className="ws-card-title">
                        <BarChart2 size={16} className="ws-card-title-icon" />
                        <span>
                          Historical OHLCV Prices (
                          {stockResult.source_metadata.currency})
                        </span>
                      </div>
                      <span className="ws-count-badge">Last 30 Sessions</span>
                    </div>

                    <div className="ws-table-container">
                      <table className="ws-table">
                        <thead>
                          <tr>
                            <th>Trading Date</th>
                            <th>Open</th>
                            <th>High</th>
                            <th>Low</th>
                            <th>Close</th>
                            <th>Volume</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stockResult.ohlcv_data
                            .slice()
                            .reverse()
                            .slice(0, 30)
                            .map((row, idx) => (
                              <tr key={idx}>
                                <td>{row.trading_date}</td>
                                <td>{Number(row.Open).toFixed(2)}</td>
                                <td>{Number(row.High).toFixed(2)}</td>
                                <td>{Number(row.Low).toFixed(2)}</td>
                                <td className="highlight-price">
                                  {Number(row.Close).toFixed(2)}
                                </td>
                                <td>{Number(row.Volume).toLocaleString()}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Financial Statements Card */}
                  <div className="ws-glass-card">
                    <div className="ws-card-header">
                      <div className="ws-card-title">
                        <Database size={16} className="ws-card-title-icon" />
                        <span>Corporate Financial Statements</span>
                      </div>
                      <span className="ws-count-badge">Requirement 4</span>
                    </div>

                    <div className="ws-tabs-bar">
                      <button
                        type="button"
                        className={`ws-tab-btn ${
                          activeStatement === "income_statement" ? "active" : ""
                        }`}
                        onClick={() => setActiveStatement("income_statement")}
                      >
                        Income Statement
                      </button>
                      <button
                        type="button"
                        className={`ws-tab-btn ${
                          activeStatement === "balance_sheet" ? "active" : ""
                        }`}
                        onClick={() => setActiveStatement("balance_sheet")}
                      >
                        Balance Sheet
                      </button>
                      <button
                        type="button"
                        className={`ws-tab-btn ${
                          activeStatement === "cash_flow" ? "active" : ""
                        }`}
                        onClick={() => setActiveStatement("cash_flow")}
                      >
                        Cash Flow
                      </button>
                    </div>

                    {statementDates.length === 0 ? (
                      <div className="ws-empty-text">
                        <p>Financial statement data not available for this company.</p>
                      </div>
                    ) : (
                      <div className="ws-table-container">
                        <table className="ws-table">
                          <thead>
                            <tr>
                              <th>Metric</th>
                              {statementDates.map((d) => (
                                <th key={d}>{d}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {statementMetrics.slice(0, 16).map((metric) => (
                              <tr key={metric}>
                                <td style={{ color: "var(--ws-text-secondary)" }}>
                                  {metric}
                                </td>
                                {statementDates.map((d) => (
                                  <td key={d}>
                                    {Number(
                                      statementObj[d][metric] || 0
                                    ).toLocaleString()}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
