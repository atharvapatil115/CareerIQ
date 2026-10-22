import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../Context/AuthContext";

const API = "http://127.0.0.1:8000";

function getApiError(data, fallback) {
  const detail = data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item.msg || String(item))
      .join(" ");
  }

  return fallback;
}

function Register() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API}/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          getApiError(data, "Registration failed. Please try again.")
        );
      }

      navigate("/login", {
        replace: true,
        state: {
          message: "Account created successfully. Please sign in.",
        },
      });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
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
            <p className="auth-eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>

            <h1>Turn your job search into a plan.</h1>

            <p className="auth-showcase-description">
              Create your account to organize applications today and
              discover relevant opportunities as we build out your job feed.
            </p>

            <div className="auth-feature">
              <span>✓</span>
              Keep track of your applications
            </div>

            <div className="auth-feature">
              <span>✓</span>
              See your application progress
            </div>

            <div className="auth-feature">
              <span>✓</span>
              Get ready for personalized job discovery
            </div>
          </div>

          <p className="auth-showcase-footer">
            One place for your career journey.
          </p>
        </aside>

        <div className="auth-form-side">
          <div className="auth-form-heading">
            <p className="auth-eyebrow auth-eyebrow-dark">GET STARTED</p>
            <h2>Create your account</h2>
            <p>Fill in your details to get started.</p>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              Full name
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                maxLength={100}
                required
              />
            </label>

            <label>
              Email address
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
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
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
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

            <label>
              Confirm password
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Enter your password again"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            <button
              type="submit"
              className="auth-primary-button"
              disabled={submitting || isLoading}
            >
              {submitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Register;