import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      await signIn("password", formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnonymous = async () => {
    setIsSubmitting(true);
    try {
      await signIn("anonymous");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Anonymous sign-in failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-background">
        <div className="grid-floor" />
        <div className="floating-shapes">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="shape"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="auth-container">
        <div className="auth-header">
          <div className="logo-container">
            <div className="logo-ring" />
            <div className="logo-ring delay-1" />
            <div className="logo-ring delay-2" />
            <span className="logo-text">7</span>
          </div>
          <h1 className="auth-title">
            <span className="glitch" data-text="AGENT 7">AGENT 7</span>
          </h1>
          <p className="auth-subtitle">VIBE CODE NEURAL INTERFACE</p>
          <div className="auth-tagline">
            <span className="tag">CLAUDE</span>
            <span className="divider">+</span>
            <span className="tag">GROK</span>
            <span className="divider">+</span>
            <span className="tag">GPT</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label">
              <span className="label-text">EMAIL_ADDR</span>
              <span className="label-icon">▸</span>
            </label>
            <input
              name="email"
              type="email"
              placeholder="operator@network.sys"
              className="cyber-input"
              required
            />
            <div className="input-glow" />
          </div>

          <div className="input-group">
            <label className="input-label">
              <span className="label-text">ACCESS_KEY</span>
              <span className="label-icon">▸</span>
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••••••"
              className="cyber-input"
              required
            />
            <div className="input-glow" />
          </div>

          <input name="flow" type="hidden" value={flow} />

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="cyber-button primary"
            disabled={isSubmitting}
          >
            <span className="button-bg" />
            <span className="button-text">
              {isSubmitting ? "PROCESSING..." : flow === "signIn" ? "AUTHENTICATE" : "REGISTER"}
            </span>
            <span className="button-glitch" />
          </button>

          <button
            type="button"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            className="cyber-button secondary"
          >
            <span className="button-text">
              {flow === "signIn" ? "CREATE NEW IDENTITY" : "EXISTING OPERATOR"}
            </span>
          </button>

          <div className="divider-line">
            <span>OR</span>
          </div>

          <button
            type="button"
            onClick={handleAnonymous}
            className="cyber-button ghost"
            disabled={isSubmitting}
          >
            <span className="button-text">ENTER AS GHOST</span>
          </button>
        </form>

        <div className="auth-footer">
          <div className="status-line">
            <span className="status-dot" />
            <span>NEURAL NETWORK ONLINE</span>
          </div>
        </div>
      </div>

      <footer className="app-footer">
        Requested by @web-user · Built by @clonkbot
      </footer>
    </div>
  );
}
