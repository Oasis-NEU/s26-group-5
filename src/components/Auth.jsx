import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Auth({ onClose }) {
  const [showSignUp, setShowSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  function switchMode(toSignUp) {
    setShowSignUp(toSignUp);
    setEmail("");
    setPassword("");
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
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else setMessage("Account created! Check your email to confirm.");
    setLoading(false);
  }

  return (
    <div style={styles.dropdown}>
      <div style={styles.header}>
        <span style={styles.title}>
          {showSignUp ? "Create Account" : "Sign In"}
        </span>
        {onClose && (
          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      {message ? (
        <div style={styles.successBox}>
          <p style={{ margin: 0, fontSize: 13 }}>{message}</p>
          <button
            style={{ ...styles.primaryBtn, marginTop: 12 }}
            onClick={() => switchMode(false)}
          >
            Back to Sign In
          </button>
        </div>
      ) : (
        <form
          onSubmit={showSignUp ? handleSignUp : handleSignIn}
          style={styles.form}
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
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
            style={styles.input}
          />

          {error && <p style={styles.errorText}>{error}</p>}

          <button type="submit" style={styles.primaryBtn} disabled={loading}>
            {loading ? "..." : showSignUp ? "Create Account" : "Sign In"}
          </button>

          <button
            type="button"
            style={styles.switchBtn}
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

const styles = {
  dropdown: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    width: 300,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    padding: 20,
    zIndex: 200,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontWeight: 700,
    fontSize: 15,
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 16,
    cursor: "pointer",
    color: "#9ca3af",
    padding: "0 2px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  input: {
    padding: "9px 12px",
    fontSize: 14,
    border: "1px solid #d1d5db",
    borderRadius: 6,
    outline: "none",
  },
  primaryBtn: {
    padding: "9px 0",
    fontSize: 14,
    fontWeight: 600,
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  switchBtn: {
    background: "none",
    border: "none",
    fontSize: 12,
    color: "#6b7280",
    cursor: "pointer",
    textAlign: "center",
    padding: 0,
  },
  errorText: {
    color: "#dc2626",
    margin: 0,
    fontSize: 13,
  },
  successBox: {
    background: "#f0fdf4",
    border: "1px solid #86efac",
    borderRadius: 8,
    padding: 12,
  },
};
