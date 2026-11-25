**AI-Powered Multi-Agent Stock Research Analyst**

A full-stack stock research web application built with **FastAPI**, **SQLAlchemy**, and **React (Vite)**. Instead of checking price charts, financial ratios, news headlines, and risk metrics across multiple tabs, this project brings everything into one streamlined dark-mode workspace powered by four specialized AI agents.

---

This application works in three connected stages:

1. **Authentication & Personal Research Workspace (Module 1)**
   - Users can register and log in securely (JWT authentication).
   - Stores default market (`NSE`, `BSE`, `NYSE`, `NASDAQ`) and time period (`1mo`, `3mo`, `6mo`, `1y`, `5y`) preferences, a personal watchlist, and automatic search history using **SQLAlchemy**.

2. **Stock Search & Market Data Collection (Module 2)**
   - Search any company name or ticker symbol to fetch historical **OHLCV** (Open, High, Low, Close, Volume) price data and financial metrics via `yfinance`.
   - Validates and structures the collected market data using **Pydantic** before passing it to the analysis layer.

3. **Multi-Agent AI Analysis Engine (Module 3)**
   - Runs four independent Python agents on the fetched stock data and displays results in a tabbed **React + Recharts** dashboard:
     - **Fundamental Agent:** Evaluates revenue trends, profitability, debt position, and key ratios (`P/E`, `P/B`, `ROE`).
     - **Technical & Chart Agent:** Computes `SMA (20)`, `EMA (20)`, `RSI (14)`, and `MACD`, identifies trend signals, and renders an interactive price & moving-average chart.
     - **News & Sentiment Agent:** Surfaces recent company news with sentiment tags (`Positive`, `Negative`, `Neutral`), dates, and source references.
     - **Risk Assessment Agent:** Computes annualized historical volatility and maximum drawdown, flags financial/sector risks, and highlights conflicting signals across agents.

---

## System Requirements

Before cloning and running the project, make sure these are installed on your system:

- **Git** (to clone the repository)
- **Python 3.10+** (with `pip` and `venv`)
- **Node.js (v18+) & npm** (to run the React + Vite frontend)
- **Active Internet Connection** (required by `yfinance` to fetch live/historical market data)

---

## How to Clone & Run on Your System

Follow these steps in your terminal to set up and run the complete project locally.

### Step 1: Clone the Repository

```bash
git clone [https://github.com/raja-ankit06/AI-Stock-Research-Agent.git](https://github.com/raja-ankit06/AI-Stock-Research-Agent.git)
cd AI-Stock-Research-Agent
---

### Step 2: Set Up & Run the Backend
cd Backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
pip install fastapi uvicorn sqlalchemy pydantic pandas numpy yfinance
uvicorn main:app --reload
---

### Step 3: Set Up & Run the Frontend
cd frontend
npm install
npm install recharts lucide-react framer-motion
npm run dev
---

Structure of the project:-

AI-Stock-Research-Agent/
├── Backend/
│   ├── agents/
│   │   ├── fundamental_agent.py
│   │   ├── technical_agent.py
│   │   ├── news_agent.py
│   │   ├── risk_agent.py
│   │   └── schemas.py
│   ├── main.py
│   ├── market_service.py
│   ├── models.py
│   ├── database.py
│   ├── auth.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Module3Analysis.jsx
    │   ├── api.js
    │   └── App.jsx
    └── package.json
