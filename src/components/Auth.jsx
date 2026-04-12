import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "./Auth.css";

export default function Auth({ onClose }) {
  const [showSignUp, setShowSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  function switchMode(toSignUp) {
    setShowSignUp(toSignUp);
    setEmail("");
    setPassword("");
    setUsername("");
    setError(null);
    setMessage(null);
  }

  async function handleSignIn(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
    else if (onClose) onClose();
    setLoading(false);
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: username } },
    });
    if (error) setError(error.message);
    else setMessage("Account created!");
    setLoading(false);
  }

  return (
    <div className="auth-dropdown">
      <div className="auth-header">
        <span className="auth-title">
          {showSignUp ? "Create Account" : "Sign In"}
        </span>
        {onClose && (
          <button className="auth-close-btn" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      {message ? (
        <div className="auth-success-box">
          <p className="auth-success-msg">{message}</p>
          <button
            className="auth-primary-btn auth-back-btn"
            onClick={() => switchMode(false)}
          >
            Back to Sign In
          </button>
        </div>
      ) : (
        <form
          onSubmit={showSignUp ? handleSignUp : handleSignIn}
          className="auth-form"
        >
          {showSignUp && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="auth-input"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />
          <input
            type="password"
            placeholder={
              showSignUp ? "Password (min 6 characters)" : "Password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={showSignUp ? 6 : undefined}
            className="auth-input"
          />

          {error && <p className="auth-error-text">{error}</p>}

          <button type="submit" className="auth-primary-btn" disabled={loading}>
            {loading ? "..." : showSignUp ? "Create Account" : "Sign In"}
          </button>

          <button
            type="button"
            className="auth-switch-btn"
            onClick={() => switchMode(!showSignUp)}
          >
            {showSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>
        </form>
      )}
    </div>
  );
}
