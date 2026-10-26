import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../Context/AuthContext";

function TempLogin() {
  const { login, isAuthenticated, isLoading,isLoggingIn } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  

  const successMessage = location.state?.message;

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <aside className="auth-showcase">
          <Link to="/login" className="auth-brand">
            <span className="auth-brand-mark">JI</span>
            <span>Job Intelligence</span>
          </Link>

          <div className="auth-showcase-content">
            <p className="auth-eyebrow">YOUR CAREER, IN ONE PLACE</p>

            <h1>Make your next career move a smarter one.</h1>

            <p className="auth-showcase-description">
              Organize your applications, track your progress, and find
              opportunities that move you forward.
            </p>

            <div className="auth-feature">
              <span>✓</span>
              Keep your job applications organized
            </div>

            <div className="auth-feature">
              <span>✓</span>
              Track your progress in one dashboard
            </div>

            <div className="auth-feature">
              <span>✓</span>
              Prepare for smarter job discovery
            </div>
          </div>

          <p className="auth-showcase-footer">
            Built to help you take the next step.
          </p>
        </aside>

        <div className="auth-form-side">
          <div className="auth-form-heading">
            <p className="auth-eyebrow auth-eyebrow-dark">WELCOME BACK</p>
            <h2>Sign in to your account</h2>
            <p>Enter your details to continue.</p>
          </div>

          {successMessage && (
            <div className="auth-success" role="status">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              Email address
              <input
                type="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label>
              Password

              <div className="auth-password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((previous) => !previous)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <button
              type="submit"
              className="auth-primary-button"
              disabled={submitting || isLoading}
            >
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default TempLogin;