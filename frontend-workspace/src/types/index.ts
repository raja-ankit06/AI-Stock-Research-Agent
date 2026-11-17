export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface UserPreference {
  theme: 'dark' | 'light';
  default_market: 'US' | 'IN' | 'GLOBAL';
  default_timeframe: '1M' | '3M' | '6M' | '1Y' | '5Y';
  default_risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  enable_alerts: boolean;
  updated_at: string;
}

export interface StockSearchResult {
  symbol: string;
  company_name: string;
  exchange: string;
  asset_type: string;
  currency: string;
  market: 'US' | 'IN' | 'GLOBAL';
}

export interface StockOverview {
  symbol: string;
  company_name: string;
  exchange: string;
  currency: string;
  current_price: number;
  change_amount: number;
  change_percent: number;
  market_cap?: number;
  pe_ratio?: number;
  high_52w?: number;
  low_52w?: number;
  volume?: number;
  source: string;
  timestamp: string;
}

export interface OHLCVPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface FundamentalAnalysisPayload {
  pe_ratio?: number;
  pb_ratio?: number;
  gross_margin?: number;
  operating_margin?: number;
  net_margin?: number;
  debt_to_equity?: number;
  current_ratio?: number;
  free_cash_flow?: number;
  revenue_growth_3y?: number;
  strengths: string[];
  weaknesses: string[];
  summary: string;
}

export interface TechnicalAnalysisPayload {
  trend: string;
  sma_20?: number;
  sma_50?: number;
  sma_200?: number;
  rsi_14?: number;
  macd_status: string;
  bollinger_position: string;
  support_level?: number;
  resistance_level?: number;
  momentum_summary: string;
}

export interface NewsItemDTO {
  headline: string;
  publisher: string;
  published_at: string;
  url?: string;
  sentiment_score: number;
  sentiment_label: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  summary: string;
}

export interface SentimentAnalysisPayload {
  composite_score: number;
  sentiment_label: string;
  articles_analyzed: number;
  top_catalysts: string[];
  news_items: NewsItemDTO[];
}

export interface ContradictionItem {
  title: string;
  description: string;
  severity: 'WARNING' | 'CRITICAL';
}

export interface RiskAnalysisPayload {
  overall_risk_level: string;
  beta?: number;
  max_drawdown_1y?: number;
  volatility_30d?: number;
  detected_contradictions: ContradictionItem[];
  key_risk_factors: string[];
  limitations: string[];
}

export interface ResearchReport {
  report_id: string;
  research_id: string;
  symbol: string;
  company_name: string;
  overall_rating: 'Bullish' | 'Cautiously Bullish' | 'Neutral' | 'Cautiously Bearish' | 'Bearish';
  confidence_score: number;
  executive_summary: string;
  fundamental_payload: FundamentalAnalysisPayload;
  technical_payload: TechnicalAnalysisPayload;
  sentiment_payload: SentimentAnalysisPayload;
  risk_payload: RiskAnalysisPayload;
  disclaimer: string;
  generated_at: string;
}

export interface ResearchListItem {
  research_id: string;
  symbol: string;
  company_name: string;
  rating?: string;
  confidence_score?: number;
  status: string;
  duration_seconds?: number;
  created_at: string;
}

export interface WatchlistItem {
  id: string;
  watchlist_id: string;
  symbol: string;
  company_name?: string;
  current_price?: number;
  change_percent?: number;
  added_at: string;
}

export interface Watchlist {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  items: WatchlistItem[];
}

export interface AgentStatusEvent {
  step: string;
  agent: string;
  progress: number;
  status: string;
  message: string;
}

