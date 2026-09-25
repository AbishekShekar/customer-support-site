import { useState } from "react";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  ArrowLeft,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

export default function Signup({ onBackToLogin }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (form.password !== form.password_confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data.username) {
          setError(
            Array.isArray(data.username)
              ? data.username[0]
              : data.username
          );
        } else if (data.email) {
          setError(
            Array.isArray(data.email)
              ? data.email[0]
              : data.email
          );
        } else if (data.password) {
          setError(
            Array.isArray(data.password)
              ? data.password[0]
              : data.password
          );
        } else if (data.password_confirm) {
          setError(
            Array.isArray(data.password_confirm)
              ? data.password_confirm[0]
              : data.password_confirm
          );
        } else if (data.detail) {
          setError(data.detail);
        } else {
          setError("Registration failed. Please check your details.");
        }

        return;
      }

      setSuccess(
        "Account created successfully. You can now sign in."
      );

      setForm({
        username: "",
        email: "",
        password: "",
        password_confirm: "",
      });

    } catch (error) {
      console.error("Signup failed:", error);

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">

      {/* LEFT SIDE */}

      <section className="login-showcase">
        <div className="login-showcase-content">

          <div className="brand login-brand">
            <span className="brand-mark">r</span>
            resolvedesk
          </div>

          <div className="showcase-main">

            <p className="eyebrow">
              CUSTOMER SUPPORT PLATFORM
            </p>

            <h1>
              Resolve issues.
              <br />
              <span>Faster.</span>
            </h1>

            <p className="showcase-copy">
              Create your account and manage support
              requests, track tickets, and connect with
              your support team from one simple workspace.
            </p>

            <div className="login-features">

              <div className="login-feature">
                <span>✓</span>

                <div>
                  <strong>Track your tickets</strong>
                  <small>
                    Stay updated on every support request.
                  </small>
                </div>
              </div>

              <div className="login-feature">
                <span>✓</span>

                <div>
                  <strong>Chat with support</strong>
                  <small>
                    Get direct help from the support team.
                  </small>
                </div>
              </div>

              <div className="login-feature">
                <span>✓</span>

                <div>
                  <strong>Real-time updates</strong>
                  <small>
                    Follow the progress of your issues.
                  </small>
                </div>
              </div>

            </div>
          </div>

          <div className="login-showcase-footer">
            <span>© 2026 ResolveDesk</span>
            <span>Secure customer support portal</span>
          </div>

        </div>
      </section>

      {/* RIGHT SIDE */}

      <section className="login-form-section">

        <div className="login-card">

          <button
            type="button"
            className="back-button"
            onClick={onBackToLogin}
          >
            <ArrowLeft size={17} />
            Back to login
          </button>

          <div className="mobile-login-brand">
            <div className="brand">
              <span className="brand-mark">r</span>
              resolvedesk
            </div>
          </div>

          <div className="login-heading">

            <p className="eyebrow">
              CUSTOMER PORTAL
            </p>

            <h2>
              Create your account
            </h2>

            <p>
              Sign up to manage your support requests.
            </p>

          </div>

          {error && (
            <div className="login-error">
              <span>!</span>

              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="signup-success">
              <span>✓</span>

              <p>{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* USERNAME */}

            <label className="login-label">

              <span>
                Username
              </span>

              <div className="login-input-wrapper">

                <User size={17} />

                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  autoComplete="username"
                  required
                />

              </div>

            </label>

            {/* EMAIL */}

            <label className="login-label">

              <span>
                Email
              </span>

              <div className="login-input-wrapper">

                <Mail size={17} />

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />

              </div>

            </label>

            {/* PASSWORD */}

            <label className="login-label">

              <span>
                Password
              </span>

              <div className="login-input-wrapper">

                <Lock size={17} />

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />

              </div>

            </label>

            {/* CONFIRM PASSWORD */}

            <label className="login-label">

              <span>
                Confirm password
              </span>

              <div className="login-input-wrapper">

                <Lock size={17} />

                <input
                  type="password"
                  name="password_confirm"
                  value={form.password_confirm}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />

              </div>

            </label>

            <button
              className="primary login-button"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="login-spinner" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus size={17} />
                  Create account
                </>
              )}
            </button>

          </form>

          <div className="login-security">
            <span className="security-dot" />
            Secure customer registration
          </div>

          <div className="signup-prompt">
            <span>Already have an account?</span>

            <button
              type="button"
              onClick={onBackToLogin}
            >
              Sign in
            </button>
          </div>

        </div>

      </section>

    </div>
  );
}