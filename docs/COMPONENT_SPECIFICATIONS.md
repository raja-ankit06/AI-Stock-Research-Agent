# COMPONENT SPECIFICATIONS: Frontend and Backend Catalogs
**Project Title:** AI-Powered Multi-Agent System for Market Analysis and Research  
**Document Identifier:** COMP-SPEC-MASRA-V1.0  
**Status:** Approved Architectural Specification  
**Classification:** Reusable Component Contracts & System Subsystems  

---

## 1. Frontend Component Catalog

Every frontend component adheres to strict TypeScript interface typing, responsive layout behaviors, accessibility conventions (ARIA), and deterministic state rendering.

---

### 1.1 Layout & Navigation Components

#### 1. `AppLayout`
- **Purpose:** Primary application shell wrapping all authenticated views with a responsive sidebar, sticky top header, and main content area.
- **Responsibilities:** Renders the structural grid, tracks mobile navigation toggle state, manages viewport scrolling restoration.
- **TypeScript Props:**
  ```typescript
  interface AppLayoutProps {
    children: React.ReactNode;
  }
  ```
- **Data Requirements:** Current authenticated user profile (via `useAuth` hook).
- **Events & Interactions:** Sidebar collapse/expand toggle on mobile drawer; global keyboard shortcut (`Cmd/Ctrl + K`) to focus search.
- **Responsive Behavior:** Fixed sidebar on `lg` screens (1024px+); transforms to slide-out drawer on `< 1024px`.

#### 2. `SidebarNav`
- **Purpose:** Collapsible left-hand navigation menu providing links to main application workspaces.
- **Responsibilities:** Displays navigation items with active route highlighting, shows user watchlist count badge, provides collapse toggle.
- **TypeScript Props:**
  ```typescript
  interface SidebarNavProps {
    isCollapsed: boolean;
    onToggleCollapse: () => void;
  }
  ```
- **Data Requirements:** Active router path (`useLocation`), watchlist count query (`useWatchlists`).
- **Events & Interactions:** Link click navigates via React Router; toggle button expands/contracts width from `240px` to `64px`.
- **Loading & Error States:** Non-blocking fallback; links remain clickable even if metadata badges are loading.

#### 3. `TopNav`
- **Purpose:** Sticky header bar housing global stock search, market status pill, theme switcher, and user profile avatar menu.
- **Responsibilities:** Hosts `StockSearchBar`, renders real-time market open/closed indicator, opens user settings dropdown.
- **TypeScript Props:**
  ```typescript
  interface TopNavProps {
    onOpenMobileMenu?: () => void;
  }
  ```
- **Data Requirements:** Market hours status (NYSE/NASDAQ open/closed), authenticated user details.
- **Events & Interactions:** Click avatar opens dropdown (Profile, Settings, Sign Out); click hamburger opens mobile drawer.

---

### 1.2 Authentication Components

#### 4. `LoginForm`
- **Purpose:** Secure credential entry form for user authentication.
- **Responsibilities:** Collects email and password, executes Zod client validation, calls `POST /api/v1/auth/login`, handles token storage.
- **TypeScript Props:**
  ```typescript
  interface LoginFormProps {
    onSuccessRedirect?: string;
  }
  ```
- **Validation (Zod Schema):**
  - `email`: Valid RFC 5322 email string.
  - `password`: Minimum 8 characters.
- **Loading & Error States:** Submit button displays loading spinner and disables while pending; inline alert displays invalid credential error.

#### 5. `RegisterForm`
- **Purpose:** New user registration form.
- **Responsibilities:** Collects full name, email, password, and password confirmation; verifies password complexity rules.
- **TypeScript Props:**
  ```typescript
  interface RegisterFormProps {
    onRegistrationSuccess: () => void;
  }
  ```
- **Validation (Zod Schema):**
  - `password`: Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character.
  - `confirmPassword`: Matches `password`.

---

### 1.3 Stock Exploration & Financial Metric Components

#### 6. `StockSearchBar`
- **Purpose:** Real-time debounced typeahead autocomplete search input for finding stock symbols.
- **Responsibilities:** Debounces user keystrokes (250ms), queries `/api/v1/stocks/search`, renders dropdown matches, manages keyboard focus.
- **TypeScript Props:**
  ```typescript
  interface StockSearchBarProps {
    placeholder?: string;
    onSelectStock: (symbol: string) => void;
    autoFocus?: boolean;
    className?: string;
  }
  ```
- **Events & Interactions:** Keyboard navigation (`ArrowDown`, `ArrowUp`, `Enter`, `Escape`); mouse hover highlights result; clicking result triggers `onSelectStock`.
- **Loading State:** Subtle spinner inside the input field while debounced query is in-flight.

#### 7. `StockHeader`
- **Purpose:** Top summary panel displaying active stock symbol, company name, exchange, real-time price, and daily change.
- **Responsibilities:** Displays primary quote metrics, colors percentage change based on bullish/bearish direction, houses "Run AI Research" trigger button and "Add to Watchlist" star toggle.
- **TypeScript Props:**
  ```typescript
  interface StockHeaderProps {
    stock: {
      symbol: string;
      companyName: string;
      exchange: string;
      currentPrice: number;
      changeAmount: number;
      changePercent: number;
      currency: string;
      lastUpdated: string;
    };
    isWatchlisted: boolean;
    onToggleWatchlist: () => void;
    onTriggerResearch: () => void;
    isResearchRunning: boolean;
  }
  ```
- **Responsive Behavior:** Stacks price and CTA buttons vertically on mobile screens.

#### 8. `MetricCard`
- **Purpose:** Compact card rendering a single financial metric or ratio with context.
- **Responsibilities:** Displays title, tabular formatted value, subtext or comparison benchmark, and optional trend icon.
- **TypeScript Props:**
  ```typescript
  interface MetricCardProps {
    title: string;
    value: string | number;
    changePercent?: number;
    benchmark?: string;
    tooltip?: string;
    variant?: 'neutral' | 'bullish' | 'bearish' | 'warning';
  }
  ```
- **Validation:** Safely formats `null` or `undefined` values as `N/A`.

#### 9. `FinancialRatioGrid`
- **Purpose:** High-density 4-column responsive grid displaying key fundamental valuation and solvency ratios.
- **Responsibilities:** Groups ratios into Valuation (P/E, P/B, EV/EBITDA), Profitability (Gross Margin, Operating Margin, ROE), and Solvency (Current Ratio, Debt/Equity, Free Cash Flow).
- **TypeScript Props:**
  ```typescript
  interface FinancialRatioGridProps {
    metrics: {
      peRatio: number | null;
      pbRatio: number | null;
      evToEbitda: number | null;
      grossMargin: number | null;
      operatingMargin: number | null;
      roe: number | null;
      currentRatio: number | null;
      debtToEquity: number | null;
      freeCashFlow: number | null;
    };
    isLoading?: boolean;
  }
  ```
- **Loading State:** Renders 9 matching `LoadingSkeleton` boxes during data fetch.

---

### 1.4 Interactive Charting Components

#### 10. `PriceCandlestickChart`
- **Purpose:** High-performance TradingView Lightweight Chart rendering historical OHLCV candlesticks and volume.
- **Responsibilities:** Mounts HTML5 canvas chart, renders candlestick series, volume histogram, and handles crosshairs and tooltips.
- **TypeScript Props:**
  ```typescript
  interface PriceCandlestickChartProps {
    data: Array<{
      time: string; // YYYY-MM-DD
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }>;
    timeframe: '1M' | '3M' | '6M' | '1Y' | '5Y';
    onTimeframeChange: (tf: '1M' | '3M' | '6M' | '1Y' | '5Y') => void;
    showSMA20?: boolean;
    showSMA50?: boolean;
    showSMA200?: boolean;
  }
  ```
- **Events & Interactions:** Crosshair move updates floating price badge; mouse wheel/pinch zooms time axis.

#### 11. `ChartControls`
- **Purpose:** Toolbar docked above the candlestick chart for toggling timeframes and technical indicators.
- **Responsibilities:** Renders timeframe buttons (`1M`, `3M`, `6M`, `1Y`, `ALL`) and technical indicator toggle switches (SMA 20/50/200, Volume, Bollinger Bands).
- **TypeScript Props:**
  ```typescript
  interface ChartControlsProps {
    activeTimeframe: string;
    onSelectTimeframe: (tf: string) => void;
    activeIndicators: {
      sma20: boolean;
      sma50: boolean;
      sma200: boolean;
      volume: boolean;
    };
    onToggleIndicator: (key: 'sma20' | 'sma50' | 'sma200' | 'volume') => void;
  }
  ```

---

### 1.5 Multi-Agent Execution & Telemetry Components

#### 12. `AgentExecutionPipeline`
- **Purpose:** Real-time visual progress stepper displaying the live status of the LangGraph multi-agent pipeline.
- **Responsibilities:** Subscribes to Server-Sent Events (SSE), renders progress bars and status badges for the 5 agents, displays real-time execution timer.
- **TypeScript Props:**
  ```typescript
  interface AgentExecutionPipelineProps {
    researchId: string;
    onComplete: (reportData: any) => void;
    onError: (error: string) => void;
  }
  ```
- **Interactions:** Live animated status indicators (idle, pulsing amber for active, emerald check for completed, red for failed).

#### 13. `AgentProgressCard`
- **Purpose:** Individual status card representing one agent within the execution pipeline.
- **Responsibilities:** Displays agent title, persona badge, current step description, execution duration, and live progress percentage.
- **TypeScript Props:**
  ```typescript
  interface AgentProgressCardProps {
    agentName: 'supervisor' | 'fundamental' | 'technical' | 'news' | 'risk';
    displayName: string;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'DEGRADED' | 'FAILED';
    currentTask?: string;
    durationMs?: number;
  }
  ```

---

### 1.6 News, Sentiment & Risk Components

#### 14. `SentimentGauge`
- **Purpose:** Semi-circular gauge visualizing composite news and market sentiment.
- **Responsibilities:** Maps sentiment score (-1.0 to +1.0) to a needle gauge with color zones: Deep Red (Bearish), Amber (Neutral), Green (Bullish).
- **TypeScript Props:**
  ```typescript
  interface SentimentGaugeProps {
    score: number; // -1.00 to +1.00
    label: string; // e.g., "Moderately Bullish"
    sampleSize: number; // e.g., 20 articles
  }
  ```

#### 15. `NewsList` & `NewsCard`
- **Purpose:** Feed of recent financial news articles analyzed by the News & Sentiment Agent.
- **Responsibilities:** Renders article headline, publisher, relative timestamp, sentiment polarity badge, and executive summary bullet.
- **TypeScript Props:**
  ```typescript
  interface NewsCardProps {
    headline: string;
    publisher: string;
    publishedAt: string;
    url: string;
    sentimentScore: number;
    sentimentLabel: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
    summary: string;
    impactLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  }
  ```

#### 16. `RiskMatrix` & `ConflictAlertBanner`
- **Purpose:** Surfaces cross-domain risk factors and conflicting signals identified by the Risk Analysis Agent.
- **Responsibilities:** Visualizes risk breakdown across Market, Financial, and Valuation domains; displays prominent alert banners when contradictions occur (e.g., Bullish price vs. High Debt).
- **TypeScript Props:**
  ```typescript
  interface ConflictAlertBannerProps {
    contradictions: Array<{
      title: string;
      description: string;
      severity: 'WARNING' | 'CRITICAL';
    }>;
  }
  ```

---

### 1.7 Report Viewer & Export Components

#### 17. `ReportViewer`
- **Purpose:** Comprehensive interactive dossier presenting the complete synthesized multi-agent research report.
- **Responsibilities:** Houses Executive Summary, overall rating badge, confidence meter, tabbed agent deep-dives, source attribution footer, and export buttons.
- **TypeScript Props:**
  ```typescript
  interface ReportViewerProps {
    report: {
      researchId: string;
      symbol: string;
      companyName: string;
      overallRating: 'Bullish' | 'Cautiously Bullish' | 'Neutral' | 'Cautiously Bearish' | 'Bearish';
      confidenceScore: number;
      executiveSummary: string;
      fundamentalData: any;
      technicalData: any;
      sentimentData: any;
      riskData: any;
      generatedAt: string;
    };
    onDownloadMarkdown: () => void;
    onDownloadPdf: () => void;
  }
  ```

#### 18. `ReportExecutiveSummary`
- **Purpose:** Top section of the report viewer highlighting the synthesis, key drivers, and rating.
- **Responsibilities:** Displays overall rating chip, confidence gauge, bulleted investment thesis, and key catalysts.
- **TypeScript Props:**
  ```typescript
  interface ReportExecutiveSummaryProps {
    overallRating: string;
    confidenceScore: number;
    summaryText: string;
    keyCatalysts: string[];
  }
  ```

---

### 1.8 Workspace Tables & Utility Components

#### 19. `WatchlistTable`
- **Purpose:** Interactive tabular view of all equities saved to the user's active watchlist.
- **Responsibilities:** Displays ticker, company, real-time quote, daily change %, last research date, and action buttons (Run Research, Remove).
- **TypeScript Props:**
  ```typescript
  interface WatchlistTableProps {
    items: Array<{
      id: string;
      symbol: string;
      companyName: string;
      currentPrice: number;
      changePercent: number;
      lastResearchDate: string | null;
    }>;
    onSelectStock: (symbol: string) => void;
    onRemoveStock: (symbol: string) => void;
    onTriggerResearch: (symbol: string) => void;
    isLoading?: boolean;
  }
  ```

#### 20. `ResearchHistoryTable`
- **Purpose:** Historical log of all research runs triggered by the user.
- **Responsibilities:** Supports sorting, pagination, filtering by ticker, and clicking to reopen past reports.
- **TypeScript Props:**
  ```typescript
  interface ResearchHistoryTableProps {
    records: Array<{
      researchId: string;
      symbol: string;
      companyName: string;
      rating: string;
      createdAt: string;
      durationSeconds: number;
    }>;
    onViewReport: (researchId: string) => void;
    onDeleteReport: (researchId: string) => void;
  }
  ```

#### 21. `LoadingSkeleton` & `EmptyState`
- **Purpose:** Generic UI feedback states maintaining layout stability during network transactions.
- **TypeScript Props:**
  ```typescript
  interface LoadingSkeletonProps {
    className?: string;
    lines?: number;
  }

  interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
  }
  ```

---

## 2. Backend Component Catalog

The backend services, repositories, routers, and agent nodes enforce modular separation of concerns.

---

### 2.1 Backend API Routers

| Router Name | Prefix | Purpose | Key Endpoints |
| :--- | :--- | :--- | :--- |
| **`AuthRouter`** | `/api/v1/auth` | User authentication & session lifecycle | `register`, `login`, `refresh`, `logout`, `me` |
| **`UserRouter`** | `/api/v1/users` | Profile and workspace preferences | `get/update profile`, `get/update preferences` |
| **`StockRouter`** | `/api/v1/stocks` | Stock search, quotes, and historical OHLCV | `search`, `quote`, `history` |
| **`ResearchRouter`** | `/api/v1/research` | Multi-agent research execution and streaming | `create session`, `list sessions`, `stream SSE` |
| **`WatchlistRouter`** | `/api/v1/watchlists` | Watchlist CRUD operations | `list`, `create`, `delete`, `add item`, `remove item` |
| **`ReportRouter`** | `/api/v1/reports` | Report retrieval and artifact export | `get report`, `download pdf`, `download md` |

---

### 2.2 Backend Service Layer

#### 1. `AuthService`
- **Responsibilities:** Hashes passwords with Argon2id; validates credentials; encodes and decodes JWT tokens; registers refresh tokens in PostgreSQL and revocation lists in Redis.

#### 2. `MarketDataService`
- **Responsibilities:** Abstracted gateway interacting with external financial market data providers (Alpha Vantage, Polygon.io, Yahoo Finance). Implements 15-minute Redis caching for quotes and 24-hour caching for historical balance sheets.

#### 3. `TechnicalCalcService`
- **Responsibilities:** Pure deterministic Python math engine using `numpy` and `pandas`. Calculates SMA (20, 50, 200), EMA (12, 26), RSI (14), MACD (12, 26, 9), Bollinger Bands, and support/resistance pivot points. Contains zero LLM dependencies.

#### 4. `ResearchOrchestratorService`
- **Responsibilities:** Initializes LangGraph `StateGraph`, passes user parameters, attaches async SSE streaming queues, handles node transition events, and persists completed research records into the database.

#### 5. `ReportService`
- **Responsibilities:** Compiles verified agent payloads into clean GitHub-flavored Markdown strings and generates formatted PDF documents with styling and headers.

---

### 2.3 Backend Repository Layer

| Repository Name | Target Entity | Core Operations |
| :--- | :--- | :--- |
| **`UserRepository`** | `User`, `RefreshToken` | `get_by_email`, `create_user`, `store_refresh_token`, `revoke_token` |
| **`ResearchRepository`** | `ResearchSession`, `AgentLog`| `create_session`, `update_status`, `get_by_id`, `list_by_user` |
| **`ReportRepository`** | `ResearchReport` | `save_report`, `get_report_by_session_id`, `delete_report` |
| **`WatchlistRepository`**| `Watchlist`, `WatchlistItem` | `get_user_watchlists`, `add_symbol`, `remove_symbol` |

---

### 2.4 LangGraph Multi-Agent Nodes

```
+-----------------------------------------------------------------------------------+
| LANGGRAPH AGENT NODES CATALOG                                                     |
+----------------------+--------------------+---------------------------------------+
| Node Identifier      | Execution Phase    | Primary Transformation & Tool Call    |
+----------------------+--------------------+---------------------------------------+
| **SupervisorNode**   | Initiation & Final | Validates symbol, initializes state;  |
|                      |                    | synthesizes multi-agent outlook.      |
| **FundamentalNode**  | Parallel Step 1    | Calls financial statement parsing,    |
|                      |                    | generates strengths/weaknesses DTO.   |
| **TechnicalNode**    | Parallel Step 2    | Invokes TechnicalCalcService;         |
|                      |                    | outputs momentum & trend DTO.         |
| **NewsSentimentNode**| Parallel Step 3    | Ingests 20 articles, executes LLM     |
|                      |                    | sentiment classification DTO.         |
| **RiskAuditNode**    | Sequential Step 4  | Cross-examines nodes 1-3, computes    |
|                      |                    | Beta/MDD, flags contradictions.       |
| **ReportCompilerNode**| Sequential Step 5 | Compiles final JSON report payload    |
|                      |                    | and marks graph state complete.       |
+----------------------+--------------------+---------------------------------------+
```

