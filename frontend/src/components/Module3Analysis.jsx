import React, { useState } from "react";
import { runModule3Analysis } from "../api";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export default function Module3Analysis({ stockData }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("fundamental");

  if (!stockData) return null;

  const ticker =
    stockData?.source_metadata?.ticker || stockData?.ticker || "UNKNOWN";
  const ohlcv = stockData?.ohlcv_data || stockData?.historical_prices || [];
  const financials = stockData?.financial_data || stockData?.financials || {};

  const handleRunAgents = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await runModule3Analysis(ticker, ohlcv, financials);
      setAnalysis(result);
    } catch (err) {
      setError(err.message || "Error running AI agents");
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    background: "rgba(15, 23, 30, 0.85)",
    border: "1px solid rgba(0, 230, 118, 0.25)",
    borderRadius: "14px",
    padding: "20px",
    marginTop: "20px",
    color: "#e2e8f0",
  };

  const tabBtn = (tab) => ({
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid rgba(0, 230, 118, 0.3)",
    background: activeTab === tab ? "#00e676" : "rgba(255,255,255,0.05)",
    color: activeTab === tab ? "#0a0f14" : "#cbd5e1",
    fontWeight: "600",
    cursor: "pointer",
  });

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <span style={{ fontSize: "12px", color: "#00e676", fontWeight: "700", letterSpacing: "1px" }}>
            MODULE 3 • MULTI-AGENT ENGINE
          </span>
          <h3 style={{ margin: "4px 0 0 0", color: "#fff" }}>
            AI Financial Analysis ({ticker})
          </h3>
        </div>
        <button
          onClick={handleRunAgents}
          disabled={loading}
          style={{
            background: "#00e676",
            color: "#0a0f14",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: "700",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Running 4 AI Agents..." : "⚡ Run AI Agents Analysis"}
        </button>
      </div>

      {error && <p style={{ color: "#ff5252", marginTop: "12px" }}>{error}</p>}

      {analysis && (
        <div style={{ marginTop: "20px" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
            <button style={tabBtn("fundamental")} onClick={() => setActiveTab("fundamental")}>
              1. Fundamental
            </button>
            <button style={tabBtn("technical")} onClick={() => setActiveTab("technical")}>
              2. Technical & Chart
            </button>
            <button style={tabBtn("news")} onClick={() => setActiveTab("news")}>
              3. News & Sentiment
            </button>
            <button style={tabBtn("risk")} onClick={() => setActiveTab("risk")}>
              4. Risk Assessment
            </button>
          </div>

          {activeTab === "fundamental" && (
            <div>
              <p style={{ color: "#94a3b8", marginBottom: "14px" }}>{analysis.fundamental_agent.summary}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div style={metricBox}><span>Revenue</span><strong>{analysis.fundamental_agent.revenue_trend}</strong></div>
                <div style={metricBox}><span>Profitability</span><strong>{analysis.fundamental_agent.profitability_status}</strong></div>
                <div style={metricBox}><span>Debt Status</span><strong>{analysis.fundamental_agent.debt_status}</strong></div>
                <div style={metricBox}><span>P/E Ratio</span><strong>{analysis.fundamental_agent.ratios?.["P/E"] ?? "N/A"}</strong></div>
                <div style={metricBox}><span>P/B Ratio</span><strong>{analysis.fundamental_agent.ratios?.["P/B"] ?? "N/A"}</strong></div>
                <div style={metricBox}><span>ROE</span><strong>{analysis.fundamental_agent.ratios?.["ROE"] ?? "N/A"}</strong></div>
              </div>
            </div>
          )}

          {activeTab === "technical" && (
            <div>
              <p style={{ color: "#94a3b8", marginBottom: "14px" }}>{analysis.technical_agent.summary}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "20px" }}>
                <div style={metricBox}><span>Trend Signal</span><strong style={{ color: "#00e676" }}>{analysis.technical_agent.trend_signal}</strong></div>
                <div style={metricBox}><span>Latest Close</span><strong>{analysis.technical_agent.latest_close ?? "N/A"}</strong></div>
                <div style={metricBox}><span>SMA (20)</span><strong>{analysis.technical_agent.sma_20 ?? "N/A"}</strong></div>
                <div style={metricBox}><span>EMA (20)</span><strong>{analysis.technical_agent.ema_20 ?? "N/A"}</strong></div>
                <div style={metricBox}><span>RSI (14)</span><strong>{analysis.technical_agent.rsi_14 ?? "N/A"}</strong></div>
                <div style={metricBox}><span>MACD</span><strong>{analysis.technical_agent.macd ?? "N/A"}</strong></div>
              </div>

              {analysis.technical_agent.chart_data?.length > 0 && (
                <div style={{ width: "100%", height: 280, background: "rgba(0,0,0,0.25)", padding: "12px", borderRadius: "10px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analysis.technical_agent.chart_data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="trading_date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#94a3b8" domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #00e676" }} />
                      <Legend />
                      <Line type="monotone" dataKey="Close" stroke="#00e676" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="SMA_20" stroke="#38bdf8" strokeWidth={1.5} dot={false} />
                      <Line type="monotone" dataKey="EMA_20" stroke="#facc15" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {activeTab === "news" && (
            <div>
              <p style={{ color: "#94a3b8", marginBottom: "14px" }}>
                Overall Sentiment: <strong style={{ color: "#00e676" }}>{analysis.news_agent.overall_sentiment}</strong> — {analysis.news_agent.summary}
              </p>
              {analysis.news_agent.articles.length === 0 ? (
                <p>No recent verified articles found.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {analysis.news_agent.articles.map((item, idx) => (
                    <div key={idx} style={{ ...metricBox, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                      <div>
                        <a href={item.url} target="_blank" rel="noreferrer" style={{ color: "#38bdf8", textDecoration: "none", fontWeight: "600" }}>
                          {item.title}
                        </a>
                        <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                          {item.source} • {item.published_at}
                        </div>
                      </div>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "700",
                        background: item.sentiment === "Positive" ? "rgba(0,230,118,0.15)" : item.sentiment === "Negative" ? "rgba(255,82,82,0.15)" : "rgba(148,163,184,0.15)",
                        color: item.sentiment === "Positive" ? "#00e676" : item.sentiment === "Negative" ? "#ff5252" : "#cbd5e1",
                      }}>
                        {item.sentiment}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "risk" && (
            <div>
              <p style={{ color: "#94a3b8", marginBottom: "14px" }}>{analysis.risk_agent.summary}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "16px" }}>
                <div style={metricBox}><span>Risk Level</span><strong style={{ color: "#facc15" }}>{analysis.risk_agent.risk_level}</strong></div>
                <div style={metricBox}><span>Max Drawdown</span><strong>{analysis.risk_agent.max_drawdown_pct ?? "N/A"}%</strong></div>
                <div style={metricBox}><span>Volatility (Annual)</span><strong>{analysis.risk_agent.historical_volatility ?? "N/A"}%</strong></div>
              </div>

              {analysis.risk_agent.conflicting_findings?.length > 0 && (
                <div style={{ ...metricBox, borderColor: "rgba(250, 204, 21, 0.4)", marginBottom: "10px" }}>
                  <strong style={{ color: "#facc15" }}>⚠️ Conflicting Findings Across Agents:</strong>
                  <ul style={{ margin: "8px 0 0 18px", padding: 0 }}>
                    {analysis.risk_agent.conflicting_findings.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}

              {analysis.risk_agent.financial_risks?.length > 0 && (
                <div style={{ ...metricBox, borderColor: "rgba(255, 82, 82, 0.4)" }}>
                  <strong style={{ color: "#ff5252" }}>Financial Risks:</strong>
                  <ul style={{ margin: "8px 0 0 18px", padding: 0 }}>
                    {analysis.risk_agent.financial_risks.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const metricBox = {
  background: "rgba(255, 255, 255, 0.03)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "10px",
  padding: "12px",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};