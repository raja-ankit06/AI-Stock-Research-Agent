import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Clock,
  ExternalLink,
  History,
  Loader2,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { api } from '../services/api';
import { ResearchListItem } from '../types';

export const ResearchHistoryPage: React.FC = () => {
  const [items, setItems] = useState<ResearchListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [symbolFilter, setSymbolFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await api.listResearchHistory(page, symbolFilter.trim() || undefined);
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadHistory();
  };

  const handleDelete = async (researchId: string) => {
    if (!confirm('Delete this research session record?')) return;
    try {
      await api.deleteResearchSession(researchId);
      setItems((prev) => prev.filter((item) => item.research_id !== researchId));
    } catch (err) {
      console.error('Failed to delete research session', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F293D] pb-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" /> Research History
          </h1>
          <p className="text-xs text-gray-400 mt-1">Archive of all past autonomous AI equity research dossiers.</p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={symbolFilter}
              onChange={(e) => setSymbolFilter(e.target.value)}
              placeholder="Filter by symbol..."
              className="bg-[#111827] border border-[#1F293D] focus:border-blue-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none w-48"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-medium border border-gray-700 transition"
          >
            Filter
          </button>
        </form>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center text-xs text-gray-400 space-y-2 bg-[#111827] border border-[#1F293D] rounded-xl">
          <p>No research history found.</p>
          <p className="text-[11px] text-gray-400">Trigger AI research on any stock to populate your historical archive.</p>
        </div>
      ) : (
        <div className="bg-[#111827] border border-[#1F293D] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0E1420] text-gray-400 uppercase font-mono text-[10px] tracking-wider border-b border-[#1F293D]">
                <tr>
                  <th className="py-3 px-4">Symbol</th>
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Synthesized Signal</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F293D]/50 text-gray-200">
                {items.map((item) => (
                  <tr
                    key={item.research_id}
                    onClick={() => navigate(`/stock/${encodeURIComponent(item.symbol)}?session=${item.research_id}`)}
                    className="hover:bg-gray-800/40 transition cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{item.symbol}</td>
                    <td className="py-3.5 px-4 text-gray-300">{item.company_name}</td>
                    <td className="py-3.5 px-4 font-mono">
                      {item.rating ? (
                        <span className="px-2 py-0.5 rounded font-semibold text-[11px] bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          {item.rating} ({Math.round((item.confidence_score || 0.75) * 100)}%)
                        </span>
                      ) : (
                        <span className="text-gray-400">{item.status}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-400">
                      {item.duration_seconds ? `${item.duration_seconds}s` : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-400">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td
                      className="py-3.5 px-4 text-right flex items-center justify-end gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => navigate(`/stock/${encodeURIComponent(item.symbol)}?session=${item.research_id}`)}
                        className="px-2.5 py-1 rounded bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 text-xs font-medium border border-blue-500/20 transition flex items-center gap-1"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.research_id)}
                        className="p-1 text-gray-400 hover:text-red-400 rounded transition"
                        title="Delete research record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

