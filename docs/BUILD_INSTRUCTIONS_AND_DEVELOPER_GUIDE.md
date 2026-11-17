# BUILD INSTRUCTIONS AND DEVELOPER GUIDE
**Project Title:** AI-Powered Multi-Agent System for Market Analysis and Research  
**Document Identifier:** DEV-GUIDE-MASRA-V1.0  
**Status:** Approved Engineering Guide  
**Target Audience:** Full-Stack Engineers, DevOps & QA Teams  

---

## 1. Prerequisites & Required Software

Ensure your local development environment meets the following minimum requirements before setting up the application:

| Software / Runtime | Minimum Version | Recommended Version | Verification Command |
| :--- | :--- | :--- | :--- |
| **Operating System** | Windows 10/11, macOS 13+, Ubuntu 22.04+ | Windows 11 / macOS 14+ | `systeminfo` / `uname -a` |
| **Node.js** | 20.12.0 LTS | 20.14.0 LTS | `node --version` |
| **Package Manager** | npm 10.5+ (or pnpm 9.0+) | pnpm 9.2+ | `npm --version` / `pnpm --version` |
| **Python** | 3.11.0 | 3.11.9 or 3.12.3 | `python --version` / `python3 --version` |
| **PostgreSQL** | 15.0 | 16.2+ | `psql --version` |
| **Redis** | 7.0 | 7.2+ | `redis-cli --version` |
| **Docker & Compose** | Docker 24.0+ | Docker Desktop 26.1+ | `docker --version` & `docker compose version` |
| **Git** | 2.40+ | 2.44+ | `git --version` |

---

## 2. Repository Layout & Workspace Architecture

The repository is structured as a clean monorepo separating presentation, backend services, tests, and configuration:

```text
multi-agent-stock-research-analyst/
│
├── docs/                                # Official project documentation suite
│   ├── PROJECT_OVERVIEW.md
│   ├── PRODUCT_REQUIREMENTS_DOCUMENT.md
│   ├── FLOW_AND_USER_STORIES.md
│   ├── TECHNICAL_STACK_SPECIFICATION.md
│   ├── VISUAL_DESIGN_SYSTEM.md
│   ├── COMPONENT_SPECIFICATIONS.md
│   ├── BUILD_INSTRUCTIONS_AND_DEVELOPER_GUIDE.md
│   ├── IMPLEMENTATION_PHASES_AND_MASTER_ROADMAP.md
│   └── API_AND_INTEGRATION_SPECIFICATION.md
│
├── frontend/                            # React 18+ Vite SPA
│   ├── src/                             # Application source code
│   ├── package.json                     # Frontend dependencies
│   ├── tsconfig.json                    # TypeScript compiler configuration
│   ├── vite.config.ts                   # Vite bundler & dev proxy config
│   ├── tailwind.config.js               # Tailwind design system tokens
│   └── .env.example                     # Frontend environment variables template
│
├── backend/                             # FastAPI Python 3.11+ application
│   ├── app/                             # Core application package
│   │   ├── api/                         # REST endpoints & dependencies
│   │   ├── core/                        # Config, security, database engine
│   │   ├── models/                      # SQLAlchemy 2.0 ORM entities
│   │   ├── schemas/                     # Pydantic v2 DTOs
│   │   ├── services/                    # Business & market data logic
│   │   └── agents/                      # LangGraph multi-agent nodes & graph
│   ├── alembic/                         # Alembic database migration scripts
│   ├── alembic.ini                      # Alembic environment configuration
│   ├── requirements.txt                 # Backend Python dependencies
│   ├── pyproject.toml                   # Tooling config (Ruff, Black, Mypy)
│   └── .env.example                     # Backend environment variables template
│
├── infrastructure/                      # Deployment & container configurations
│   ├── docker-compose.yml               # Local multi-container development setup
│   ├── docker-compose.prod.yml          # Production container setup
│   ├── nginx/                           # Reverse proxy configuration
│   └── Dockerfile.backend               # Multi-stage Python backend container
│
├── tests/                               # Cross-cutting integration & e2e tests
│   ├── backend/                         # Pytest unit, service, & agent tests
│   └── frontend/                        # Vitest component & hook tests
│
├── scripts/                             # Operational automation & database seeders
│   ├── init_db.py                       # Initial database schema & seed data
│   └── run_dev.sh                       # Local unified development runner script
│
├── .env.example                         # Root environment variable template
├── .gitignore                           # Git ignore rules
└── README.md                            # Project entry point & documentation index
```

---

## 3. Environment Configuration & Secret Management

Create local environment files from the provided templates. **Never commit `.env` files to version control.**

### 3.1 Backend `.env` Specification (`backend/.env`)

```ini
# ==========================================
# BACKEND ENVIRONMENT CONFIGURATION (DEV)
# ==========================================

# Application Settings
ENVIRONMENT=development
PROJECT_NAME="Multi-Agent Stock Research Analyst"
DEBUG=true
API_V1_STR="/api/v1"
SECRET_KEY=change-this-to-a-secure-random-64-character-hex-string-for-jwt
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Database Connection (PostgreSQL 16)
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres_dev_password
POSTGRES_DB=stock_analyst_dev
DATABASE_URL=postgresql+asyncpg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_SERVER}:${POSTGRES_PORT}/${POSTGRES_DB}

# In-Memory Cache (Redis 7)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=""
REDIS_URL=redis://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}/0

# CORS Allowed Origins (Comma-separated)
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://localhost:3000","http://127.0.0.1:5173"]

# LLM Provider Configuration
# Supported providers: "openai", "anthropic", "gemini"
LLM_PROVIDER=openai
OPENAI_API_KEY=placeholder_openai_api_key
OPENAI_MODEL=gpt-4o

ANTHROPIC_API_KEY=placeholder_anthropic_api_key
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

GEMINI_API_KEY=placeholder_gemini_api_key
GEMINI_MODEL=gemini-1.5-pro

# External Financial Market Data APIs (Placeholder keys)
ALPHA_VANTAGE_API_KEY=placeholder_alpha_vantage_key
POLYGON_API_KEY=placeholder_polygon_key
FINNHUB_API_KEY=placeholder_finnhub_key

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
RESEARCH_RATE_LIMIT_PER_MINUTE=5
```

### 3.2 Frontend `.env` Specification (`frontend/.env`)

```ini
# ==========================================
# FRONTEND ENVIRONMENT CONFIGURATION (DEV)
# ==========================================
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_TITLE="AI Multi-Agent Stock Research Analyst"
VITE_ENABLE_ANALYTICS=false
```

---

## 4. Step-by-Step Installation & Setup

### 4.1 Step 1: Clone Repository & Create Virtual Environment

```bash
# Clone the repository
git clone https://github.com/your-org/multi-agent-stock-research-analyst.git
cd multi-agent-stock-research-analyst

# Setup Python virtual environment for backend
cd backend
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# macOS / Linux (bash/zsh):
source .venv/bin/activate

# Upgrade pip and install backend dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 4.2 Step 2: Setup Database & Redis Services

You can run PostgreSQL and Redis locally, or spin them up via Docker Compose:

```bash
# From repository root:
docker compose -f infrastructure/docker-compose.yml up -d postgres redis

# Verify services are healthy
docker compose -f infrastructure/docker-compose.yml ps
```

### 4.3 Step 3: Run Database Migrations (Alembic)

```bash
# Ensure virtual environment is active inside backend/
cd backend

# Execute database migrations to head revision
alembic upgrade head

# (Optional) Seed development database with initial test equities & admin user
python ../scripts/init_db.py
```

### 4.4 Step 4: Setup Frontend Application

```bash
# Open a new terminal session and navigate to frontend directory
cd frontend

# Install dependencies using npm or pnpm
npm install
# or: pnpm install

# Verify TypeScript compilation
npm run build -- --noEmit
```

---

## 5. Running the Application in Development

### 5.1 Starting the Backend Development Server
FastAPI features hot-reloading with Uvicorn:

```bash
cd backend
source .venv/bin/activate  # Or .venv\Scripts\Activate.ps1 on Windows
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Base URL: `http://localhost:8000`
- Interactive Swagger UI Documentation: `http://localhost:8000/docs`
- Alternative ReDoc Documentation: `http://localhost:8000/redoc`

### 5.2 Starting the Frontend Development Server
Vite provides instant Hot Module Replacement (HMR):

```bash
cd frontend
npm run dev
```
- Local Web Interface: `http://localhost:5173`

---

## 6. Running with Docker Compose (Full Stack)

To build and run all services (PostgreSQL, Redis, FastAPI Backend, React Frontend) in isolated Docker containers:

```bash
# Build and launch all containers in detached mode
docker compose -f infrastructure/docker-compose.yml up --build -d

# Stream real-time logs from backend and agents
docker compose -f infrastructure/docker-compose.yml logs -f backend

# Stop and tear down all containers
docker compose -f infrastructure/docker-compose.yml down
```

---

## 7. Testing Strategy and Execution

The platform mandates strict test-driven development for all deterministic mathematical functions and agent state transitions.

```
+---------------------------------------------------------------------------------+
| TESTING MATRIX & TOOLING                                                        |
+----------------------+--------------------+-------------------------------------+
| Test Category        | Tooling            | Target Coverage Scope               |
+----------------------+--------------------+-------------------------------------+
| **Unit Tests (Py)**  | pytest, pytest-cov | Math formulas (SMA, RSI, DCF), DTOs |
| **Agent Tests (Py)** | pytest-asyncio     | LangGraph State transitions, retries|
| **API Route Tests**  | httpx AsyncClient  | Auth flows, endpoints, rate limits  |
| **Frontend Tests**   | Vitest, RTL        | React UI components, forms, hooks   |
| **E2E Integration**  | Playwright         | End-to-end stock search & report    |
+----------------------+--------------------+-------------------------------------+
```

### 7.1 Running Backend Tests
```bash
cd backend
source .venv/bin/activate

# Run full test suite with coverage report
pytest tests/ -v --cov=app --cov-report=term-missing

# Run only agent orchestration tests
pytest tests/test_agents.py -v

# Run mathematical indicator calculation unit tests
pytest tests/test_technical_calc.py -v
```

### 7.2 Running Frontend Tests
```bash
cd frontend

# Run Vitest test runner
npm run test

# Run tests with coverage output
npm run test:coverage
```

---

## 8. Coding Standards, Linting & Formatting

### 8.1 Backend Python Standards
The project adheres to PEP 8 standards enforced by **Ruff**, **Black**, and **Mypy**:

```bash
cd backend

# Check linting with Ruff
ruff check .

# Automatically fix linting issues
ruff check --fix .

# Format code with Black
black .

# Static type checking with Mypy (Strict mode)
mypy app/
```

### 8.2 Frontend TypeScript Standards
The client application uses **ESLint** and **Prettier**:

```bash
cd frontend

# Run ESLint
npm run lint

# Format with Prettier
npm run format
```

### 8.3 Git Commit Conventions
Follow the **Conventional Commits** specification:
- `feat(agents)`: Add cross-domain contradiction checks to Risk Agent
- `fix(auth)`: Resolve refresh token rotation race condition
- `perf(charts)`: Optimize Candlestick canvas rendering on 5Y timeframe
- `docs(api)`: Update Swagger annotations for research streaming endpoint
- `test(indicators)`: Add unit tests for 14-period RSI edge conditions

---

## 9. Common Errors, Diagnostics, and Troubleshooting FAQ

### Q1: `ModuleNotFoundError: No module named 'app'`
- **Cause:** Python path does not include the `backend` directory.
- **Solution:** Execute commands from the `backend/` directory or export `PYTHONPATH`:
  ```bash
  export PYTHONPATH=$PYTHONPATH:$(pwd) # macOS/Linux
  $env:PYTHONPATH = (Get-Location).Path # Windows PowerShell
  ```

### Q2: `asyncpg.exceptions.InvalidCatalogNameError: database "stock_analyst_dev" does not exist`
- **Cause:** PostgreSQL service is running, but the database has not been initialized.
- **Solution:** Create the database using PostgreSQL CLI:
  ```bash
  psql -U postgres -h localhost -c "CREATE DATABASE stock_analyst_dev;"
  ```

### Q3: `LangGraph RecursionError / Maximum Node Steps Exceeded`
- **Cause:** A cyclic condition in the agent graph failed to transition to the terminal node.
- **Solution:** Verify `recursion_limit` in the graph execution config (default 25) and ensure conditional edges explicitly evaluate to `END` upon successful schema validation.

### Q4: CORS Policy Error in Browser Console (`Access-Control-Allow-Origin`)
- **Cause:** Frontend port does not match the origins defined in `BACKEND_CORS_ORIGINS`.
- **Solution:** Ensure `http://localhost:5173` is listed in `backend/.env` under `BACKEND_CORS_ORIGINS`.

