// © 2026 LINQR — linqr.global — All Rights Reserved
import { useState } from "react";

const LINQR_SUPABASE_URL = "https://odnjkxgsgevuvjutqdmi.supabase.co";
const LINQR_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kbmpreGdzZ2V2dXZqdXRxZG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxOTY0NzksImV4cCI6MjA5NTc3MjQ3OX0.tuf7P4I1xTNUMqnNLBkxAfVi-Ny4vjlWQzIX3AgTFoE";

export default function PortalLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${LINQR_SUPABASE_URL}/rest/v1/dealers?email=eq.${encodeURIComponent(email)}&password=eq.${encodeURIComponent(password)}&select=*`, {
        headers: {
          "apikey": LINQR_ANON_KEY,
          "Authorization": `Bearer ${LINQR_ANON_KEY}`,
        }
      });
      const data = await res.json();
      if (data && data.length > 0) {
        localStorage.setItem("linqr_dealer", JSON.stringify(data[0]));
        onLogin(data[0]);
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.outer}>
      <div style={styles.card}>
        <div style={styles.header}>
          <img src="/LINQR-logo.png" alt="LINQR" style={styles.logo} />
          <p style={styles.tagline}>Dealer Portal</p>
        </div>
        <div style={styles.form}>
          <p style={styles.title}>Welcome back</p>
          <p style={styles.sub}>Sign in to manage your listings</p>
          <input
            style={styles.input}
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.btn} onClick={handleLogin} disabled={loading}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>
          <p style={styles.help}>Need access? Contact <a href="mailto:hello@linqr.global" style={styles.link}>hello@linqr.global</a></p>
        </div>
        <div style={styles.footer}>
          <p style={styles.footerText}>© LINQR 2026 · linqr.global</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  outer: { minHeight: "100vh", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  card: { width: "100%", maxWidth: 440, background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 48px rgba(0,0,0,0.12)" },
  header: { background: "#1B6157", padding: "32px 40px", textAlign: "center" },
  logo: { height: 48, width: "auto", display: "block", margin: "0 auto 8px" },
  tagline: { color: "rgba(255,255,255,0.8)", fontSize: 14, margin: 0, letterSpacing: 2 },
  form: { padding: "40px 40px 24px" },
  title: { fontSize: 24, fontWeight: 700, color: "#111", margin: "0 0 8px", fontFamily: "Georgia, serif" },
  sub: { fontSize: 14, color: "#888", margin: "0 0 28px" },
  input: { width: "100%", border: "2px solid #e0e0e0", borderRadius: 8, padding: "14px 16px", fontSize: 15, color: "#111", fontFamily: "Georgia, serif", boxSizing: "border-box", marginBottom: 12, display: "block", outline: "none" },
  error: { fontSize: 13, color: "#cc0000", margin: "0 0 12px" },
  btn: { width: "100%", background: "#1B6157", color: "#fff", border: "none", borderRadius: 8, padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" },
  help: { fontSize: 12, color: "#aaa", textAlign: "center", margin: "20px 0 0" },
  link: { color: "#1B6157", textDecoration: "none" },
  footer: { background: "#f9f9f9", padding: "16px", textAlign: "center", borderTop: "1px solid #eee" },
  footerText: { fontSize: 11, color: "#bbb", margin: 0 },
};
