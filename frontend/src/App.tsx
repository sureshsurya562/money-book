import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Holdings from './pages/Holdings';
import HoldingForm from './pages/HoldingForm';
import HoldingDetail from './pages/HoldingDetail';
import ShareSettings from './pages/ShareSettings';
import PublicShare from './pages/PublicShare';
import RequestAccess from './pages/RequestAccess';
import AccessRequests from './pages/AccessRequests';

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Opening Money Book…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/p/:token" element={<PublicShare />} />
      <Route path="/request-access" element={<RequestAccess />} />

      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/holdings" element={<Holdings />} />
        <Route path="/holdings/new" element={<HoldingForm />} />
        <Route path="/holdings/:id" element={<HoldingDetail />} />
        <Route path="/holdings/:id/edit" element={<HoldingForm />} />
        <Route path="/share" element={<ShareSettings />} />
        <Route path="/access-requests" element={<AccessRequests />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
