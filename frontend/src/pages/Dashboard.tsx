import { Link, useNavigate } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import DashboardView from '../components/DashboardView';

export default function Dashboard() {
  const navigate = useNavigate();
  const { holdings, summary, loading, error, refresh } = usePortfolio();

  if (loading && !summary) return <div className="loading-screen">Loading your Money Book…</div>;
  if (error && !summary) return <div className="error-banner">{error}</div>;
  if (!summary) return null;

  return (
    <DashboardView
      holdings={holdings}
      summary={summary}
      onOpenHolding={(id) => navigate(`/holdings/${id}`)}
      toolbar={
        <>
          <button type="button" className="btn btn-ghost" onClick={() => void refresh()}>
            Refresh
          </button>
          <Link className="btn btn-primary" to="/holdings/new">
            Add money
          </Link>
          <Link className="btn btn-ghost" to="/share">
            Share book
          </Link>
        </>
      }
    />
  );
}
