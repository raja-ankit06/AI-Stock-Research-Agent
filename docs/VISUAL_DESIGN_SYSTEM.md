# VISUAL DESIGN SYSTEM: Financial Terminal Design Language
**Project Title:** AI-Powered Multi-Agent System for Market Analysis and Research  
**Document Identifier:** DESIGN-SYS-MASRA-V1.0  
**Status:** Approved Design Specification  
**Design Lead:** Principal Product Designer & Design Systems Lead  

---

## 1. Design Philosophy & Aesthetic Foundation

The visual design system of the **Multi-Agent Stock Research Analyst** is engineered around the concept of the **Modern Financial Intelligence Terminal**. It bridges the rigorous, high-density data clarity of institutional trading consoles (e.g., Bloomberg Terminal, Refinitiv Eikon) with the refined, minimalist craftsmanship of modern SaaS interfaces (e.g., Linear, Vercel, Stripe).

### Core Principles
1. **High Information Density Without Visual Clutter:** Present deep financial metrics, multi-timeframe charts, and multi-agent reasoning clearly without overwhelming the analyst's visual field.
2. **Tabular Numerics First:** Numbers drive decisions. All financial figures, percentages, dates, and currency values must utilize tabular lining figures (`font-variant-numeric: tabular-nums`) and monospace typography to guarantee vertical alignment.
3. **Semantic Financial Color Discipline:** Colors carry definitive financial meaning. Green is strictly reserved for positive returns, profit margins, and bullish signals; red is strictly reserved for losses, downward momentum, and critical risks. Colors must never be used purely for decoration.
4. **Restrained, Professional Dark Theme by Default:** Long research sessions require low eye strain. A calibrated deep slate/neutral palette provides contrast and legibility during extended analysis.
5. **Deterministic State Signaling:** Visual micro-states (loading skeletons, agent progress pulses, confidence meters) communicate real-time progress transparently.

---

## 2. Color Palette Specification

The system employs a carefully calibrated semantic color hierarchy with strict contrast ratios exceeding **WCAG 2.1 AA** (minimum 4.5:1 for body copy and 3.0:1 for graphical UI elements).

### 2.1 Dark Mode Palette (Default System Experience)

| Token Name | HEX Code | CSS Variable | Semantic Usage |
| :--- | :--- | :--- | :--- |
| **Background Base** | `#0B0F17` | `--color-bg-base` | Deep canvas canvas background |
| **Surface Level 1** | `#111827` | `--color-surface-1` | Navigation bars, primary cards, sidebar |
| **Surface Level 2** | `#1F2937` | `--color-surface-2` | Nested cards, table headers, modal surfaces |
| **Surface Level 3** | `#374151` | `--color-surface-3` | Active item highlight, hover states, pill badges |
| **Border Subtle** | `#1F293D` | `--color-border-subtle` | Card borders, subtle divider lines |
| **Border Strong** | `#374151` | `--color-border-strong` | Input outlines, active table borders, modal outlines |
| **Text Primary** | `#F9FAFB` | `--color-text-primary` | Main titles, key financial values, primary labels |
| **Text Secondary** | `#9CA3AF` | `--color-text-secondary` | Body explanations, metadata, secondary metrics |
| **Text Muted** | `#6B7280` | `--color-text-muted` | Form helpers, timestamps, subtle footnotes |
| **Brand Primary** | `#3B82F6` | `--color-brand-primary` | Primary action buttons, active navigation, focus rings |
| **Brand Accent** | `#60A5FA` | `--color-brand-accent` | Interactive link hover, highlight pings |
| **Financial Bullish** | `#10B981` | `--color-bullish` | Positive price change, net profit, bullish sentiment |
| **Financial Bearish** | `#EF4444` | `--color-bearish` | Negative price change, net loss, bearish sentiment |
| **Financial Warning** | `#F59E0B` | `--color-warning` | Moderate risk, debt cautions, missing historical data |
| **Financial Info** | `#06B6D4` | `--color-info` | Neutral announcements, general filings, informational badges |

### 2.2 Light Mode Palette (Adaptive Clean SaaS Experience)

| Token Name | HEX Code | CSS Variable | Semantic Usage |
| :--- | :--- | :--- | :--- |
| **Background Base** | `#F8FAFC` | `--color-bg-base` | Clean off-white canvas |
| **Surface Level 1** | `#FFFFFF` | `--color-surface-1` | Crisp white cards, navigation, sidebar |
| **Surface Level 2** | `#F1F5F9` | `--color-surface-2` | Secondary containers, table header row |
| **Surface Level 3** | `#E2E8F0` | `--color-surface-3` | Pill badges, input backgrounds, active hover |
| **Border Subtle** | `#E2E8F0` | `--color-border-subtle` | Subtle card dividers |
| **Border Strong** | `#CBD5E1` | `--color-border-strong` | Input boundaries, active card borders |
| **Text Primary** | `#0F172A` | `--color-text-primary` | High-contrast headers, primary values |
| **Text Secondary** | `#475569` | `--color-text-secondary` | Body prose, secondary labels |
| **Text Muted** | `#94A3B8` | `--color-text-muted` | Footnotes, captions, timestamps |
| **Brand Primary** | `#2563EB` | `--color-brand-primary` | Primary buttons, active indicators |
| **Brand Accent** | `#1D4ED8` | `--color-brand-accent` | Button press, high-contrast links |
| **Financial Bullish** | `#059669` | `--color-bullish` | Positive earnings, gains |
| **Financial Bearish** | `#DC2626` | `--color-bearish` | Losses, downside risk |
| **Financial Warning** | `#D97706` | `--color-warning` | Financial leverage flags |
| **Financial Info** | `#0891B2` | `--color-info` | Metadata and context tags |

### 2.3 Agent Identity Color Mapping

Each specialized agent carries a distinct identifying accent color to provide instant visual attribution in live telemetry and report tabs:

```
+---------------------------------------------------------------------------------+
| AGENT IDENTITY COLOR ASSIGNMENTS                                                |
+--------------------------+-----------+------------+-----------------------------+
| Agent Role               | Color     | HEX Code   | Badge Background (Dark Mode)|
+--------------------------+-----------+------------+-----------------------------+
| Supervisor Agent         | Indigo    | `#6366F1`  | `rgba(99, 102, 241, 0.15)`  |
| Fundamental Agent        | Emerald   | `#10B981`  | `rgba(16, 185, 129, 0.15)`  |
| Technical Agent          | Cyan      | `#06B6D4`  | `rgba(6, 182, 212, 0.15)`   |
| News & Sentiment Agent   | Violet    | `#8B5CF6`  | `rgba(139, 92, 246, 0.15)`  |
| Risk Analysis Agent      | Amber     | `#F59E0B`  | `rgba(245, 158, 11, 0.15)`  |
+--------------------------+-----------+------------+-----------------------------+
```

---

## 3. Typography System

The typography system uses a clean sans-serif for UI labels and narrative analysis, paired with a specialized monospace font for ticker symbols, prices, ratios, and tabular figures.

### 3.1 Font Families
- **Primary Interface Font:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, `Roboto`, `sans-serif`
- **Tabular & Financial Data Font:** `JetBrains Mono`, `ui-monospace`, `SFMono-Regular`, `Menlo`, `Monaco`, `monospace`

### 3.2 Type Scale and Hierarchy

| Level | Size (rem / px) | Line Height | Weight | Letter Spacing | CSS Utility / Tailwind |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display 1** | `2.25rem` (36px) | `2.75rem` (44px) | Bold (700) | `-0.025em` | `text-4xl font-bold tracking-tight` |
| **Heading 1** | `1.875rem` (30px) | `2.25rem` (36px) | SemiBold (600) | `-0.02em` | `text-3xl font-semibold` |
| **Heading 2** | `1.5rem` (24px) | `2.0rem` (32px) | SemiBold (600) | `-0.015em` | `text-2xl font-semibold` |
| **Heading 3** | `1.25rem` (20px) | `1.75rem` (28px) | Medium (500) | `-0.01em` | `text-xl font-medium` |
| **Subtitle / Subhead**| `1.0rem` (16px) | `1.5rem` (24px) | Medium (500) | `0.0em` | `text-base font-medium` |
| **Body Regular** | `0.875rem` (14px) | `1.375rem` (22px) | Regular (400) | `0.0em` | `text-sm font-normal` |
| **Body Small / Meta**| `0.75rem` (12px) | `1.0rem` (16px) | Regular (400) | `+0.01em` | `text-xs font-normal text-muted` |
| **Tabular Numbers** | `0.875rem` (14px) | `1.25rem` (20px) | Medium (500) | `0.0em` | `font-mono tabular-nums text-sm` |
| **Key Metric Display**| `1.75rem` (28px) | `2.0rem` (32px) | Bold (700) | `-0.02em` | `font-mono text-2xl font-bold` |

---

## 4. Spatial System & Layout Tokens

The design uses an **8-point spatial grid** for margins, padding, and layout dimensions, supplemented by a 4px half-unit for tight data-density components.

### 4.1 Spacing Scale

| Token Name | Size (px) | Size (rem) | Primary Usage |
| :--- | :--- | :--- | :--- |
| `space-1` | 4px | 0.25rem | Badge padding, micro table cell spacing |
| `space-2` | 8px | 0.5rem | Button inner vertical padding, input padding |
| `space-3` | 12px | 0.75rem | Button horizontal padding, card content gaps |
| `space-4` | 16px | 1.0rem | Standard card internal padding, grid gaps |
| `space-5` | 20px | 1.25rem | Modal header padding, table header height |
| `space-6` | 24px | 1.5rem | Section spacing, container padding |
| `space-8` | 32px | 2.0rem | Major dashboard column gutters |
| `space-12` | 48px | 3.0rem | Page section vertical margins |

### 4.2 Border Radius & Elevation Tokens

```css
/* Border Radius */
--radius-xs: 2px;    /* Financial indicator tags */
--radius-sm: 4px;    /* Input fields, small buttons, badges */
--radius-md: 6px;    /* Standard cards, dropdown menus, modals */
--radius-lg: 10px;   /* Major dashboard container cards */
--radius-full: 9999px; /* Rounded pill chips, circular status lights */

/* Elevation Shadows (Dark Mode Adjusted) */
--shadow-subtle: 0 1px 2px 0 rgba(0, 0, 0, 0.4);
--shadow-card:   0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5);
--shadow-modal:  0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.7);
--shadow-glow:   0 0 15px rgba(59, 130, 246, 0.25); /* Focus & agent active pulse */
```

---

## 5. Component Styling Specifications

### 5.1 Button Hierarchy

1. **Primary Action Button:**
   - Background: `--color-brand-primary` (`#3B82F6`)
   - Text: High-contrast white (`#FFFFFF`), Weight: SemiBold (600), Radius: `4px`
   - Hover: Brightness increase (`#2563EB`), Transition: 150ms ease-in-out
   - Usage: "Run AI Research", "Save Watchlist", "Export PDF"
2. **Secondary Button:**
   - Background: `--color-surface-2` (`#1F2937`), Border: 1px solid `--color-border-strong`
   - Text: `--color-text-primary`, Weight: Medium (500)
   - Hover: Background `--color-surface-3`
   - Usage: "Cancel", "Filter History", "Reset Chart"
3. **Ghost / Icon Button:**
   - Background: Transparent; Text: `--color-text-secondary`
   - Hover: Background `rgba(255, 255, 255, 0.05)`, Text: `--color-text-primary`
   - Usage: Star ticker to watchlist, minimize section, copy markdown

### 5.2 Form Inputs & Stock Search Bar
- **Input Dimensions:** Height `38px` (compact) or `44px` (hero search), font size `14px`.
- **States:**
  - *Default:* Background `--color-surface-1`, Border 1px solid `--color-border-subtle`.
  - *Focus:* Border 1px solid `--color-brand-primary`, Box-shadow `0 0 0 2px rgba(59, 130, 246, 0.25)`.
  - *Error:* Border 1px solid `--color-bearish`, helper text rendered in `--color-bearish`.
- **Typeahead Dropdown:** Fixed max-height `320px`, scrollable, backdrop blur `8px`, item hover highlight with `--color-surface-3`.

### 5.3 Financial Data Tables
- **Header:** Sticky top, Background `--color-surface-2`, Text uppercase tracking-wider `11px`, `--color-text-muted`.
- **Rows:** Alternating subtle zebra striping (`rgba(255, 255, 255, 0.015)`), row height `40px`.
- **Alignment Rules:** Text and symbols left-aligned; all numbers, percentages, and currencies strictly right-aligned with tabular figures (`tabular-nums`).
- **Dividers:** 1px horizontal borders in `--color-border-subtle`; no vertical column dividers to maintain a modern aesthetic.

### 5.4 Financial Charts & Visualizations
- **Candlestick Colors:**
  - Up Candle (Close > Open): Fill `--color-bullish` (`#10B981`), Border & Wick `--color-bullish`.
  - Down Candle (Close < Open): Fill `--color-bearish` (`#EF4444`), Border & Wick `--color-bearish`.
- **Moving Average Overlays:**
  - 20-day SMA: Light Amber (`#FBBF24`), solid 1.5px.
  - 50-day SMA: Sky Blue (`#38BDF8`), solid 1.5px.
  - 200-day SMA: Violet (`#A855F7`), solid 2.0px.
- **Crosshair & Gridlines:** Subtle dotted gray (`rgba(156, 163, 175, 0.15)`).

---

## 6. Layout Architecture & Breakpoints

The application follows a flexible multi-panel workspace layout:
- **Left Navigation Sidebar:** Fixed width `240px` (collapsible to `64px` icon-only mode).
- **Top Navigation Bar:** Height `56px`, containing stock search input, quick stats, notification bell, and user avatar.
- **Main Workspace Canvas:** Dynamic width, centered content with maximum container width of `1600px` for high-density multi-column terminal dashboards.

### Responsive Breakpoints

| Breakpoint | Minimum Width | Layout Adaptations |
| :--- | :--- | :--- |
| **Mobile (`sm`)** | 640px | Single-column stacked cards; sidebar transforms into bottom nav or slide drawer. |
| **Tablet (`md`)** | 768px | 2-column metric cards; chart displays 6-month view with touch pinch zoom. |
| **Desktop (`lg`)** | 1024px | Full 3-column dashboard; multi-agent live progress displays as a side rail. |
| **Wide Terminal (`xl`)** | 1280px | Full dual-panel layout: chart & metrics on left (60%), agent report on right (40%). |
| **Ultra-Wide (`2xl`)** | 1536px | Maximum content container (`1600px`), optimized for 4K and ultra-wide analyst monitors. |

---

## 7. State Presentation: Loading, Empty, Success, and Error

```
+---------------------------------------------------------------------------------+
| UI STATE PRESENTATION SPECIFICATION                                             |
+---------------+-----------------------------------------------------------------+
| State         | Visual Representation                                           |
+---------------+-----------------------------------------------------------------+
| **Loading**   | Subtle horizontal animated shimmer skeletons; zero generic      |
|               | spinning wheels. Pulsing agent badges with percentage meters.   |
| **Empty**     | Clean slate illustration with muted icon (e.g., FolderSearch);   |
|               | contextual action button ("Search your first stock ticker").    |
| **Success**   | Soft green toast banner (`#10B981`) with auto-dismiss (4 sec)   |
|               | and subtle checkmark icon.                                      |
| **Error**     | Non-destructive red alert callout (`#EF4444`) with clear       |
|               | explanation of the failure and an immediate "Retry" button.     |
| **Degraded**  | Amber badge (`#F59E0B`) indicating which specific provider      |
|               | timed out, while preserving all successfully generated data.   |
+---------------+-----------------------------------------------------------------+
```

---

## 8. Master CSS Design Tokens (`globals.css`)

```css
:root {
  /* Light Mode Base Tokens */
  --color-bg-base: #F8FAFC;
  --color-surface-1: #FFFFFF;
  --color-surface-2: #F1F5F9;
  --color-surface-3: #E2E8F0;
  --color-border-subtle: #E2E8F0;
  --color-border-strong: #CBD5E1;
  --color-text-primary: #0F172A;
  --color-text-secondary: #475569;
  --color-text-muted: #94A3B8;

  --color-brand-primary: #2563EB;
  --color-brand-accent: #1D4ED8;
  --color-bullish: #059669;
  --color-bearish: #DC2626;
  --color-warning: #D97706;
  --color-info: #0891B2;

  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 10px;
  --radius-full: 9999px;

  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, Menlo, Monaco, monospace;
}

.dark {
  /* Dark Mode Financial Terminal Tokens (Default) */
  --color-bg-base: #0B0F17;
  --color-surface-1: #111827;
  --color-surface-2: #1F2937;
  --color-surface-3: #374151;
  --color-border-subtle: #1F293D;
  --color-border-strong: #374151;
  --color-text-primary: #F9FAFB;
  --color-text-secondary: #9CA3AF;
  --color-text-muted: #6B7280;

  --color-brand-primary: #3B82F6;
  --color-brand-accent: #60A5FA;
  --color-bullish: #10B981;
  --color-bearish: #EF4444;
  --color-warning: #F59E0B;
  --color-info: #06B6D4;

  /* Agent Identity Tokens */
  --color-agent-supervisor: #6366F1;
  --color-agent-fundamental: #10B981;
  --color-agent-technical: #06B6D4;
  --color-agent-news: #8B5CF6;
  --color-agent-risk: #F59E0B;
}
```

