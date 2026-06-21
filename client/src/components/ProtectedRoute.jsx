import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Still checking auth — show nothing (avoid flash of redirect)
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background)',
      }}>
        <div style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>
          Loading...
        </div>
      </div>
    );
  }

  // Not logged in — redirect to landing
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Logged in — render the page
  return children;
}