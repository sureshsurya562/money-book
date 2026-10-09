import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import { api, type Category, type Holding, type Pillar, type Summary } from '../lib/api';
import { useAuth } from './AuthContext';

type PortfolioContextValue = {
  holdings: Holding[];
  summary: Summary | null;
  categories: Category[];
  pillars: Pillar[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
};

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!user) {
      setHoldings([]);
      setSummary(null);
      setCategories([]);
      setPillars([]);
      setLoading(false);
      setError('');
      return;
    }
    try {
      setError('');
      const data = await api.getPortfolio();
      setHoldings(data.holdings);
      setSummary(data.summary);
      setCategories(data.categories);
      setPillars(data.pillars);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fresh load on login and whenever you open a different page
  useEffect(() => {
    if (!user) {
      setLoading(false);
      setHoldings([]);
      setSummary(null);
      return;
    }
    setLoading(true);
    void refresh();
  }, [user, location.pathname, refresh]);

  // Also refresh when you come back to this browser tab
  useEffect(() => {
    if (!user) return;
    const onFocus = () => {
      void refresh();
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') onFocus();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [user, refresh]);

  return (
    <PortfolioContext.Provider
      value={{ holdings, summary, categories, pillars, loading, error, refresh }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used within PortfolioProvider');
  return ctx;
}
