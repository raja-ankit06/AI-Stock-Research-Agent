import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Loader2, Search } from 'lucide-react';
import { api } from '../../services/api';
import { StockSearchResult } from '../../types';

interface StockSearchBarProps {
  onSelectStock?: (symbol: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const StockSearchBar: React.FC<StockSearchBarProps> = ({
  onSelectStock,
  placeholder = 'Search US (NVDA, AAPL) or Indian (RELIANCE.NS, TCS.NS) stocks...',
  autoFocus = false,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.searchStocks(query.trim(), 8);
        setResults(data);
        setIsOpen(data.length > 0);
        setSelectedIndex(0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (symbol: string) => {
    setIsOpen(false);
    setQuery('');
    if (onSelectStock) {
      onSelectStock(symbol);
    } else {
      navigate(`/stock/${encodeURIComponent(symbol)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex].symbol);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full bg-[#111827] border border-[#1F293D] focus:border-blue-500 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition shadow-sm"
        />
        {loading && (
          <Loader2 className="w-4 h-4 text-blue-400 animate-spin absolute right-3.5" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#111827] border border-[#1F293D] rounded-lg shadow-2xl overflow-hidden z-50">
          <div className="px-3 py-1.5 bg-[#1F2937]/50 border-b border-[#1F293D] text-[10px] uppercase font-mono text-gray-400 flex items-center justify-between">
            <span>Matching Equities</span>
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" /> Global Market Search
            </span>
          </div>
          <ul className="max-h-72 overflow-y-auto divide-y divide-[#1F293D]/50">
            {results.map((item, index) => (
              <li
                key={item.symbol}
                onClick={() => handleSelect(item.symbol)}
                className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition ${
                  index === selectedIndex ? 'bg-blue-600/10 text-white' : 'hover:bg-gray-800/60 text-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-blue-400 min-w-16">
                    {item.symbol}
                  </span>
                  <span className="text-xs text-gray-200 line-clamp-1">{item.company_name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                    {item.exchange}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                      item.market === 'IN'
                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {item.market}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

