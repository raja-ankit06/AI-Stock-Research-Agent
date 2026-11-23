// import Module3Analysis from "./components/Module3Analysis";
// import React, { useState, useEffect, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import LoginPage from "./components/Login/LoginPage";
// import Workspace from "./components/Workspace/Workspace";
// import {
//   fetchWorkspace,
//   savePreferences,
//   addStockToWatchlist,
//   searchStockData,
// } from "./api";
// import { ChevronDown } from "lucide-react";
// import "./App.css";

// function App() {
//   // --- Auth State (Module 1) ---
//   const [token, setToken] = useState(localStorage.getItem("jwt_token") || "");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [authMessage, setAuthMessage] = useState({ type: "", text: "" });

//   // --- Transition State ---
//   const [isTransitioning, setIsTransitioning] = useState(false);
//   const [loginHidden, setLoginHidden] = useState(!!localStorage.getItem("jwt_token"));
//   const workspaceRef = useRef(null);

//   // --- Workspace State (Module 1) ---
//   const [userEmail, setUserEmail] = useState(localStorage.getItem("user_email") || "");
//   const [market, setMarket] = useState("NSE");
//   const [period, setPeriod] = useState("6mo");
//   const [watchlist, setWatchlist] = useState([]);
//   const [history, setHistory] = useState([]);

//   // --- Market Data State (Module 2) ---
//   const [searchQuery, setSearchQuery] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [stockResult, setStockResult] = useState(null);
//   const [searchError, setSearchError] = useState("");
//   const [activeStatement, setActiveStatement] = useState("income_statement");

//   // Load workspace data when user logs in
//   const loadUserWorkspace = async () => {
//     try {
//       const data = await fetchWorkspace();
//       if (data.preferences) {
//         setMarket(data.preferences.preferred_market || "NSE");
//         setPeriod(data.preferences.analysis_period || "6mo");
//       }
//       setWatchlist(data.watchlist || []);
//       setHistory(data.research_history || []);
//     } catch (err) {
//       handleLogout();
//     }
//   };

//   useEffect(() => {
//     if (token) {
//       loadUserWorkspace();
//     }
//   }, [token]);

//   // --- Smooth Scroll Transition Handler ---
//   const handleLoginSuccess = (jwtToken, loggedInEmail, loggedInUserId) => {
//     localStorage.setItem("jwt_token", jwtToken);
//     localStorage.setItem("user_email", loggedInEmail);
//     setUserEmail(loggedInEmail);
//     setToken(jwtToken);
//     setIsTransitioning(true);

//     // Allow workspace to render, then smooth-scroll to it
//     requestAnimationFrame(() => {
//       setTimeout(() => {
//         if (workspaceRef.current) {
//           workspaceRef.current.scrollIntoView({
//             behavior: "smooth",
//             block: "start",
//           });
//         }

//         // After scroll animation completes, hide the login section
//         setTimeout(() => {
//           setLoginHidden(true);
//           setIsTransitioning(false);
//           window.scrollTo({ top: 0, behavior: "instant" });
//         }, 1400);
//       }, 200);
//     });
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("jwt_token");
//     localStorage.removeItem("user_email");
//     setToken("");
//     setUserEmail("");
//     setStockResult(null);
//     setLoginHidden(false);
//     window.scrollTo({ top: 0, behavior: "instant" });
//   };

//   // --- Module 1: Save User Preferences ---
//   const handlePreferenceSave = async () => {
//     try {
//       await savePreferences(market, period);
//       alert(`Preferences saved: Market (${market}), Period (${period})`);
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   // --- Module 2: Search Stock & Collect Validated Data ---
//   const handleStockSearch = async (e, customQuery = null, customMarket = null) => {
//     if (e) e.preventDefault();
//     const q = customQuery || searchQuery;
//     const m = customMarket || market;
//     if (!q.trim()) return;

//     setLoading(true);
//     setSearchError("");
//     try {
//       const result = await searchStockData(q, m, period);
//       setStockResult(result);
//       loadUserWorkspace();
//     } catch (err) {
//       setSearchError(err.message);
//       setStockResult(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- Module 1: Add Current Stock to Watchlist ---
//   const handleAddToWatchlist = async () => {
//     if (!stockResult) return;
//     try {
//       const meta = stockResult.source_metadata;
//       await addStockToWatchlist(meta.ticker, meta.company_name, meta.exchange);
//       loadUserWorkspace();
//       alert(`${meta.company_name} added to your watchlist!`);
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   // ==========================================
//   // If already authenticated (page reload / returning user),
//   // show only the workspace directly
//   // ==========================================
//   if (loginHidden && token) {
//     return (
//       <Workspace
//         userEmail={userEmail}
//         onLogout={handleLogout}
//         market={market}
//         setMarket={setMarket}
//         period={period}
//         setPeriod={setPeriod}
//         onPreferenceSave={handlePreferenceSave}
//         watchlist={watchlist}
//         history={history}
//         searchQuery={searchQuery}
//         setSearchQuery={setSearchQuery}
//         onStockSearch={handleStockSearch}
//         loading={loading}
//         stockResult={stockResult}
//         searchError={searchError}
//         onAddToWatchlist={handleAddToWatchlist}
//         activeStatement={activeStatement}
//         setActiveStatement={setActiveStatement}
//       />
//     );
//   }

//   // ==========================================
//   // CINEMATIC SCROLL-DOWN TRANSITION LAYOUT
//   // Both Login + Workspace stacked vertically;
//   // After auth success, page scrolls down into workspace.
//   // ==========================================
//   return (
//     <div className="app-scroll-container">
//       {/* ===== SECTION 1: LOGIN (100vh) ===== */}
//       <section className="app-scroll-section">
//         <LoginPage onLoginSuccess={handleLoginSuccess} />
//       </section>

//       {/* ===== TRANSITION BANNER (shows during scroll) ===== */}
//       <AnimatePresence>
//         {isTransitioning && (
//           <motion.div
//             className="scroll-transition-banner"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 20 }}
//             transition={{ duration: 0.4 }}
//           >
//             <div className="scroll-pulse-dot" />
//             <span>Initializing Research Workspace</span>
//             <ChevronDown size={18} className="bounce-arrow" />
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* ===== SECTION 2: WORKSPACE (rendered when token exists) ===== */}
//       {token && (
//         <section ref={workspaceRef} className="app-scroll-section">
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.8, delay: 0.2 }}
//           >
//             <Workspace
//               userEmail={userEmail}
//               onLogout={handleLogout}
//               market={market}
//               setMarket={setMarket}
//               period={period}
//               setPeriod={setPeriod}
//               onPreferenceSave={handlePreferenceSave}
//               watchlist={watchlist}
//               history={history}
//               searchQuery={searchQuery}
//               setSearchQuery={setSearchQuery}
//               onStockSearch={handleStockSearch}
//               loading={loading}
//               stockResult={stockResult}
//               searchError={searchError}
//               onAddToWatchlist={handleAddToWatchlist}
//               activeStatement={activeStatement}
//               setActiveStatement={setActiveStatement}
//             />
//           </motion.div>
//         </section>
//       )}
//     </div>
//   );
// }

// export default App;


import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginPage from "./components/Login/LoginPage";
import Workspace from "./components/Workspace/Workspace";
import Module3Analysis from "./components/Module3Analysis";
import {
  fetchWorkspace,
  savePreferences,
  addStockToWatchlist,
  searchStockData,
} from "./api";
import { ChevronDown } from "lucide-react";
import "./App.css";

function App() {
  // --- Auth State (Module 1) ---
  const [token, setToken] = useState(localStorage.getItem("jwt_token") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState({ type: "", text: "" });

  // --- Transition State ---
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loginHidden, setLoginHidden] = useState(!!localStorage.getItem("jwt_token"));
  const workspaceRef = useRef(null);

  // --- Workspace State (Module 1) ---
  const [userEmail, setUserEmail] = useState(localStorage.getItem("user_email") || "");
  const [market, setMarket] = useState("NSE");
  const [period, setPeriod] = useState("6mo");
  const [watchlist, setWatchlist] = useState([]);
  const [history, setHistory] = useState([]);

  // --- Market Data State (Module 2) ---
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [stockResult, setStockResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [activeStatement, setActiveStatement] = useState("income_statement");

  // Load workspace data when user logs in
  const loadUserWorkspace = async () => {
    try {
      const data = await fetchWorkspace();
      if (data.preferences) {
        setMarket(data.preferences.preferred_market || "NSE");
        setPeriod(data.preferences.analysis_period || "6mo");
      }
      setWatchlist(data.watchlist || []);
      setHistory(data.research_history || []);
    } catch (err) {
      handleLogout();
    }
  };

  useEffect(() => {
    if (token) {
      loadUserWorkspace();
    }
  }, [token]);

  // --- Smooth Scroll Transition Handler ---
  const handleLoginSuccess = (jwtToken, loggedInEmail, loggedInUserId) => {
    localStorage.setItem("jwt_token", jwtToken);
    localStorage.setItem("user_email", loggedInEmail);
    setUserEmail(loggedInEmail);
    setToken(jwtToken);
    setIsTransitioning(true);

    // Allow workspace to render, then smooth-scroll to it
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (workspaceRef.current) {
          workspaceRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }

        // After scroll animation completes, hide the login section
        setTimeout(() => {
          setLoginHidden(true);
          setIsTransitioning(false);
          window.scrollTo({ top: 0, behavior: "instant" });
        }, 1400);
      }, 200);
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_email");
    setToken("");
    setUserEmail("");
    setStockResult(null);
    setLoginHidden(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // --- Module 1: Save User Preferences ---
  const handlePreferenceSave = async () => {
    try {
      await savePreferences(market, period);
      alert(`Preferences saved: Market (${market}), Period (${period})`);
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Module 2: Search Stock & Collect Validated Data ---
  const handleStockSearch = async (e, customQuery = null, customMarket = null) => {
    if (e) e.preventDefault();
    const q = customQuery || searchQuery;
    const m = customMarket || market;
    if (!q.trim()) return;

    setLoading(true);
    setSearchError("");
    try {
      const result = await searchStockData(q, m, period);
      setStockResult(result);
      loadUserWorkspace();
    } catch (err) {
      setSearchError(err.message);
      setStockResult(null);
    } finally {
      setLoading(false);
    }
  };

  // --- Module 1: Add Current Stock to Watchlist ---
  const handleAddToWatchlist = async () => {
    if (!stockResult) return;
    try {
      const meta = stockResult.source_metadata;
      await addStockToWatchlist(meta.ticker, meta.company_name, meta.exchange);
      loadUserWorkspace();
      alert(`${meta.company_name} added to your watchlist!`);
    } catch (err) {
      alert(err.message);
    }
  };

  // ==========================================
  // If already authenticated (page reload / returning user),
  // show only the workspace directly
  // ==========================================
  if (loginHidden && token) {
    return (
      <>
        <Workspace
          userEmail={userEmail}
          onLogout={handleLogout}
          market={market}
          setMarket={setMarket}
          period={period}
          setPeriod={setPeriod}
          onPreferenceSave={handlePreferenceSave}
          watchlist={watchlist}
          history={history}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onStockSearch={handleStockSearch}
          loading={loading}
          stockResult={stockResult}
          searchError={searchError}
          onAddToWatchlist={handleAddToWatchlist}
          activeStatement={activeStatement}
          setActiveStatement={setActiveStatement}
        />
        {stockResult && (
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px 40px" }}>
            <Module3Analysis stockData={stockResult} />
          </div>
        )}
      </>
    );
  }

  // ==========================================
  // CINEMATIC SCROLL-DOWN TRANSITION LAYOUT
  // Both Login + Workspace stacked vertically;
  // After auth success, page scrolls down into workspace.
  // ==========================================
  return (
    <div className="app-scroll-container">
      {/* ===== SECTION 1: LOGIN (100vh) ===== */}
      <section className="app-scroll-section">
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </section>

      {/* ===== TRANSITION BANNER (shows during scroll) ===== */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="scroll-transition-banner"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="scroll-pulse-dot" />
            <span>Initializing Research Workspace</span>
            <ChevronDown size={18} className="bounce-arrow" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== SECTION 2: WORKSPACE (rendered when token exists) ===== */}
      {token && (
        <section ref={workspaceRef} className="app-scroll-section">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Workspace
              userEmail={userEmail}
              onLogout={handleLogout}
              market={market}
              setMarket={setMarket}
              period={period}
              setPeriod={setPeriod}
              onPreferenceSave={handlePreferenceSave}
              watchlist={watchlist}
              history={history}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onStockSearch={handleStockSearch}
              loading={loading}
              stockResult={stockResult}
              searchError={searchError}
              onAddToWatchlist={handleAddToWatchlist}
              activeStatement={activeStatement}
              setActiveStatement={setActiveStatement}
            />
            {stockResult && (
              <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px 40px" }}>
                <Module3Analysis stockData={stockResult} />
              </div>
            )}
          </motion.div>
        </section>
      )}
    </div>
  );
}

export default App;