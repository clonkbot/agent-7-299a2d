import { useConvexAuth } from "convex/react";
import { AuthScreen } from "./components/AuthScreen";
import { Dashboard } from "./components/Dashboard";
import "./styles.css";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-container">
          <div className="hex-grid">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="hex" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
          <div className="loading-text">
            <span className="glitch" data-text="AGENT 7">AGENT 7</span>
            <div className="loading-bar">
              <div className="loading-progress" />
            </div>
            <p className="loading-status">Establishing neural link...</p>
          </div>
        </div>
        <div className="scanlines" />
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="noise-overlay" />
      <div className="scanlines" />
      {!isAuthenticated ? <AuthScreen /> : <Dashboard />}
    </div>
  );
}
