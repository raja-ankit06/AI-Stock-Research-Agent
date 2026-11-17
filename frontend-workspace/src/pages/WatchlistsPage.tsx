import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowUpRight,
  Bookmark,
  ExternalLink,
  FolderPlus,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
import { api } from '../services/api';
import { Watchlist } from '../types';

export const WatchlistsPage: React.FC = () => {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [activeWatchlistId, setActiveWatchlistId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWlName, setNewWlName] = useState('');
  const [newWlDesc, setNewWlDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();

  const loadWatchlists = async () => {
    try {
      const data = await api.listWatchlists();
      setWatchlists(data);
      if (data.length > 0 && !activeWatchlistId) {
        setActiveWatchlistId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load watchlists', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWatchlists();
  }, []);

  const handleCreateWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWlName.trim()) return;

    setCreating(true);
    try {
      const created = await api.createWatchlist({ name: newWlName.trim(), description: newWlDesc.trim() });
      setWatchlists((prev) => [...prev, created]);
      setActiveWatchlistId(created.id);
      setShowCreateModal(false);
      setNewWlName('');
      setNewWlDesc('');
    } catch (err) {
      console.error('Failed to create watchlist', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteWatchlist = async (id: string) => {
    if (!confirm('Are you sure you want to delete this watchlist?')) return;
    try {
      await api.deleteWatchlist(id);
      setWatchlists((prev) => prev.filter((wl) => wl.id !== id));
      if (activeWatchlistId === id) {
        setActiveWatchlistId(watchlists[0]?.id || null);
      }
    } catch (err) {
      console.error('Failed to delete watchlist', err);
    }
  };

  const handleRemoveStock = async (wlId: string, symbol: string) => {
    try {
      await api.removeStockFromWatchlist(wlId, symbol);
      setWatchlists((prev) =>
        prev.map((wl) => {
          if (wl.id === wlId) {
            return {
              ...wl,
              items: wl.items.filter((item) => item.symbol !== symbol),
            };
          }
          return wl;
        })
      );
    } catch (err) {
      console.error('Failed to remove stock', err);
    }
  };

  const activeWatchlist = watchlists.find((wl) => wl.id === activeWatchlistId) || watchlists[0];

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F293D] pb-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-blue-400" /> Watchlists
          </h1>
          <p className="text-xs text-gray-400 mt-1">Track equities and re-run multi-agent research on demand.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition self-start"
        >
          <Plus className="w-4 h-4" />
          <span>New Watchlist</span>
        </button>
      </div>

      {/* Watchlist Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {watchlists.map((wl) => (
          <button
            key={wl.id}
            onClick={() => setActiveWatchlistId(wl.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap flex items-center gap-2 border ${
              activeWatchlist?.id === wl.id
                ? 'bg-blue-600/10 border-blue-500/30 text-blue-400'
                : 'bg-gray-900 border-[#1F293D] text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>{wl.name}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-gray-800 text-gray-400">
              {wl.items?.length || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Active Watchlist Items Table */}
      {activeWatchlist && (
        <div className="bg-[#111827] border border-[#1F293D] rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#1F293D] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">{activeWatchlist.name}</h3>
              {activeWatchlist.description && (
                <p className="text-xs text-gray-400 mt-0.5">{activeWatchlist.description}</p>
              )}
            </div>

            {watchlists.length > 1 && (
              <button
                onClick={() => handleDeleteWatchlist(activeWatchlist.id)}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete List</span>
              </button>
            )}
          </div>

          {activeWatchlist.items.length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-400 space-y-2">
              <p>No equities in this watchlist yet.</p>
              <p className="text-[11px] text-gray-400">Search for any ticker and click "Add to Watchlist" to save it here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0E1420] text-gray-400 uppercase font-mono text-[10px] tracking-wider border-b border-[#1F293D]">
                  <tr>
                    <th className="py-3 px-4">Symbol</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4 text-right">Current Price</th>
                    <th className="py-3 px-4 text-right">Daily Change</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F293D]/50 text-gray-200">
                  {activeWatchlist.items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-800/40 transition cursor-pointer"
                      onClick={() => navigate(`/stock/${encodeURIComponent(item.symbol)}`)}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-blue-400">{item.symbol}</td>
                      <td className="py-3 px-4 text-gray-300">{item.company_name || item.symbol}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        {item.current_price !== undefined && item.current_price !== null
                          ? `$${item.current_price.toFixed(2)}`
                          : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {item.change_percent !== undefined && item.change_percent !== null ? (
                          <span
                            className={`inline-flex items-center font-semibold ${
                              item.change_percent >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {item.change_percent >= 0 ? '+' : ''}
                            {item.change_percent.toFixed(2)}%
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td
                        className="py-3 px-4 text-right"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <button
                          onClick={() => handleRemoveStock(activeWatchlist.id, item.symbol)}
                          className="p-1 text-gray-400 hover:text-red-400 rounded transition"
                          title="Remove from watchlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Watchlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create New Watchlist</h3>
            <form onSubmit={handleCreateWatchlist} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Watchlist Name</label>
                <input
                  type="text"
                  required
                  value={newWlName}
                  onChange={(e) => setNewWlName(e.target.value)}
                  placeholder="e.g. High-Conviction Tech"
                  className="w-full bg-[#1F2937] border border-[#1F293D] focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={newWlDesc}
                  onChange={(e) => setNewWlDesc(e.target.value)}
                  placeholder="Portfolio notes or investment strategy..."
                  className="w-full bg-[#1F2937] border border-[#1F293D] focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-white outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium"
                >
                  {creating ? 'Creating...' : 'Create Watchlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

