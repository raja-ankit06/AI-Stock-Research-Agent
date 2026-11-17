import {
  OHLCVPoint,
  ResearchListItem,
  ResearchReport,
  StockOverview,
  StockSearchResult,
  User,
  UserPreference,
  Watchlist,
} from '../types';

const API_BASE = '/api/v1';

class ApiClient {
  // Shared promise so several requests that hit a 401 at the same time trigger ONE refresh.
  // (Refresh tokens are single-use: refreshing twice with the same token would fail.)
  private refreshPromise: Promise<boolean> | null = null;

  private getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private clearSession() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  /** Exchange the stored refresh token for a new access + refresh token. */
  private refreshAccessToken(): Promise<boolean> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;
      try {
        const response = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (!response.ok) return false;
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        return true;
      } catch {
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, isRetry = false): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    // These endpoints return 401 for "wrong credentials / bad token", not "access token expired"
    const noRefreshEndpoints = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];
    if (response.status === 401 && !noRefreshEndpoints.includes(endpoint)) {
      // Access token expired -> try to get a new one once, then repeat the original request
      if (!isRetry && (await this.refreshAccessToken())) {
        return this.request<T>(endpoint, options, true);
      }
      // Refresh failed -> session is really over
      this.clearSession();
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      let errorMsg = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMsg = errorData.detail || errorData.error?.message || response.statusText;
      } catch {
        errorMsg = response.statusText;
      }
      throw new Error(errorMsg);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Authentication
  async register(data: { email: string; password: string; full_name: string }) {
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    const res = await this.request<{
      access_token: string;
      token_type: string;
      refresh_token: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    localStorage.setItem('access_token', res.access_token);
    localStorage.setItem('refresh_token', res.refresh_token);
    return res;
  }

  async getCurrentUser() {
    return this.request<User>('/auth/me');
  }

  async logout() {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      // Tell the backend to revoke the refresh token so it cannot be reused
      await this.request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch {
      // Even if the server call fails, the local session must still be cleared
    } finally {
      this.clearSession();
    }
  }

  // User Profile & Preferences
  async getPreferences() {
    return this.request<UserPreference>('/users/preferences');
  }

  async updatePreferences(pref: Partial<UserPreference>) {
    return this.request<UserPreference>('/users/preferences', {
      method: 'PUT',
      body: JSON.stringify(pref),
    });
  }

  // Stock Market Data
  async searchStocks(query: string, limit = 10) {
    const res = await this.request<{ query: string; count: number; results: StockSearchResult[] }>(
      `/stocks/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    return res.results;
  }

  async getStockOverview(symbol: string) {
    return this.request<StockOverview>(`/stocks/${encodeURIComponent(symbol)}`);
  }

  async getStockHistory(symbol: string, timeframe = '1Y') {
    const res = await this.request<{ symbol: string; timeframe: string; series: OHLCVPoint[] }>(
      `/stocks/${encodeURIComponent(symbol)}/history?timeframe=${timeframe}`
    );
    return res.series;
  }

  // Multi-Agent Research
  async triggerResearch(symbol: string) {
    return this.request<{
      research_id: string;
      symbol: string;
      company_name: string;
      status: string;
      stream_url: string;
    }>('/research', {
      method: 'POST',
      body: JSON.stringify({ symbol }),
    });
  }

  async listResearchHistory(page = 1, symbol?: string) {
    let url = `/research?page=${page}&page_size=20`;
    if (symbol) url += `&symbol=${encodeURIComponent(symbol)}`;
    return this.request<{
      items: ResearchListItem[];
      total: number;
      page: number;
      page_size: number;
    }>(url);
  }

  async getResearchSession(researchId: string) {
    return this.request<{
      research_id: string;
      symbol: string;
      company_name: string;
      status: string;
      report_id?: string;
    }>(`/research/${researchId}`);
  }

  async deleteResearchSession(researchId: string) {
    return this.request(`/research/${researchId}`, { method: 'DELETE' });
  }

  // Reports
  async getReport(reportId: string) {
    return this.request<ResearchReport>(`/reports/${reportId}`);
  }

  getDownloadUrl(reportId: string, format = 'markdown') {
    return `${API_BASE}/reports/${reportId}/download?format=${format}`;
  }

  // Watchlists
  async listWatchlists() {
    return this.request<Watchlist[]>('/watchlists');
  }

  async createWatchlist(data: { name: string; description?: string }) {
    return this.request<Watchlist>('/watchlists', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteWatchlist(watchlistId: string) {
    return this.request(`/watchlists/${watchlistId}`, { method: 'DELETE' });
  }

  async addStockToWatchlist(watchlistId: string, symbol: string) {
    return this.request(`/watchlists/${watchlistId}/stocks`, {
      method: 'POST',
      body: JSON.stringify({ symbol }),
    });
  }

  async removeStockFromWatchlist(watchlistId: string, symbol: string) {
    return this.request(`/watchlists/${watchlistId}/stocks/${encodeURIComponent(symbol)}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();

