import { useState, useEffect } from "react";

const SUPABASE_URL = "https://sfymjnjpqvgtoxofndzx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmeW1qbmpwcXZndG94b2ZuZHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NzI1MTAsImV4cCI6MjA3MzE0ODUxMH0.RqBItIZ-Iz_XhKcJNsJSR6e3n5jxW_YKHWGHO5j1z2c";

export default function CorvetteDemo() {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [remembered, setRemembered] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem("ms_name");
    const savedEmail = localStorage.getItem("ms_email");
    if (savedName && savedEmail) {
      setName(savedName);
      setEmail(savedEmail);
      setRemembered(true);
    }
  }, []);

  async function handleSendEmail() {
    if (!name || !email) { setError("Please enter your name and email."); return; }
    setSending(true);
    setError("");
    try {
      localStorage.setItem("ms_name", name);
      localStorage.setItem("ms_email", email);
      const res = await fetch(`${SUPABASE_URL}/functions/v1/send-sellsheet-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ name, email, optIn, carName: "Chevrolet Corvette Z06", carUrl: "https://mothers-showtime.vercel.app/corvette-z06" }),
      });
      if (!res.ok) throw new Error("Failed to send");
      setSent(true);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function handleQuickSend() {
    setSending(true);
    setError("");
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/send-sellsheet-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ name, email, optIn: false, carName: "Chevrolet Corvette Z06", carUrl: "https://mothers-showtime.vercel.app/corvette-z06" }),
      });
      if (!res.ok) throw new Error("Failed to send");
      setSent(true);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const specs = [
    { label: "Engine", value: "5.5L LT6 V8 Flat-Plane Crank" },
    { label: "Power", value: "475kW (670hp)" },
    { label: "Torque", value: "595Nm" },
    { label: "Redline", value: "8,600 RPM" },
    { label: "0–100km/h", value: "2.6 seconds" },
    { label: "Top Speed", value: "315km/h+" },
    { label: "Transmission", value: "8-Speed Dual-Clutch" },
    { label: "Drive", value: "Rear-Wheel Drive" },
    { label: "Brakes", value: "Brembo 6-Piston Front" },
    { label: "NZ Price", value: "From $346,000" },
  ];

  return (
    <div style={styles.pageOuter}>
      <div style={styles.page}>
        <style>{css}</style>

        <div style={styles.hero}>
          <img src="/corvette-z06.JPG" alt="Corvette Z06" style={styles.heroImg} />
          <div style={styles.heroOverlay} />
          <div style={styles.heroBadge}>
            <span style={styles.heroBadgeText}>CORVETTE NEW ZEALAND</span>
          </div>
          <div style={styles.heroContent}>
            <p style={styles.heroEyebrow}>2024 CHEVROLET</p>
            <h1 style={styles.heroTitle}>Corvette Z06</h1>
            <p style={styles.heroSub}>Rapid Blue · Z07 Performance Package</p>
          </div>
        </div>

        <div style={styles.statsBar}>
          {[
            { value: "475kW", label: "Power" },
            { value: "2.6s", label: "0–100km/h" },
            { value: "8,600", label: "RPM Redline" },
            { value: "$346K", label: "From NZD" },
          ].map((s) => (
            <div key={s.label} style={styles.statItem}>
              <p style={styles.statValue}>{s.value}</p>
              <p style={styles.statLabel}>{s.label}</p>
            </div>
          ))}
        </div>

        <div style={styles.content}>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>The Legend Evolved</h2>
            <p style={styles.bodyText}>
              The Corvette Z06 is America's most sophisticated supercar — a track-focused, road-legal weapon built around one of the world's most extraordinary naturally aspirated engines. The hand-assembled 5.5L LT6 V8 with its flat-plane crankshaft produces a sound unlike anything else on the road, screaming to an 8,600 RPM redline with 475kW of pure, unassisted power.
            </p>
            <p style={styles.bodyText}>
              This Rapid Blue example — finished to showroom perfection using Mothers California Gold detailing products — represents the pinnacle of what the C8 generation has to offer. The Z07 Performance Package adds carbon ceramic Brembo brakes, carbon fibre aero components, and Michelin Pilot Sport Cup 2 R tyres, transforming an already exceptional car into a true circuit weapon.
            </p>
            <p style={styles.bodyText}>
              Available now at GMSV New Zealand dealers. A very limited number of allocation units remain.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Specifications</h2>
            <div style={styles.specsGrid} className="specs-grid">
              {specs.map((spec) => (
                <div key={spec.label} style={styles.specItem}>
                  <p style={styles.specLabel}>{spec.label}</p>
                  <p style={styles.specValue}>{spec.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Z07 Performance Package</h2>
            <div style={styles.featureGrid} className="feature-grid">
              {[
                "Carbon Ceramic Brembo Brakes",
                "Carbon Fibre Front Splitter",
                "Carbon Fibre Rear Wing",
                "Michelin Pilot Sport Cup 2 R Tyres",
                "333kg Downforce at 300km/h",
                "Magnetic Selective Ride Control",
                "Performance Traction Management",
                "Electronic Limited Slip Differential",
              ].map((f) => (
                <div key={f} style={styles.featureItem}>
                  <span style={styles.featureDot}>●</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* EMAIL CAPTURE */}
          <div style={styles.saveSection}>
            {!showEmailForm && !sent && !remembered && (
              <button style={styles.saveBtn} onClick={() => setShowEmailForm(true)} className="save-btn">
                📧 Email This Car to Yourself
              </button>
            )}

            {!sent && remembered && (
              <div style={styles.quickSendBox}>
                <p style={styles.quickSendTitle}>📧 Send to {email}?</p>
                <button style={styles.saveBtn} onClick={handleQuickSend} disabled={sending} className="save-btn">
                  {sending ? "Sending..." : "Yes — Send It to Me →"}
                </button>
                <button onClick={() => { setRemembered(false); setShowEmailForm(true); }} style={styles.notMeBtn}>
                  Not me — use a different email
                </button>
                {error && <p style={styles.errorText}>{error}</p>}
              </div>
            )}

            {showEmailForm && !sent && !remembered && (
              <div style={styles.emailForm}>
                <p style={styles.emailTitle}>📧 Save This Car to Your Inbox</p>
                <p style={styles.emailSub}>We'll send you the full details instantly — yours to keep, revisit, and share.</p>
                <input style={styles.input} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="form-input" />
                <input style={styles.input} placeholder="Your email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" />
                <div style={styles.optInRow}>
                  <input type="checkbox" id="optin" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} style={styles.checkbox} />
                  <label htmlFor="optin" style={styles.optInLabel}>Keep me updated on new vehicles and offers</label>
                </div>
                {error && <p style={styles.errorText}>{error}</p>}
                <button style={styles.sendBtn} onClick={handleSendEmail} disabled={sending} className="send-btn">
                  {sending ? "Sending..." : "Send It to Me →"}
                </button>
                <p style={styles.privacyText}>Your privacy matters. One email, no spam. Unsubscribe anytime.</p>
              </div>
            )}

            {sent && (
              <div style={styles.successBox}>
                <p style={styles.successIcon}>✓</p>
                <p style={styles.successTitle}>On Its Way!</p>
                <p style={styles.successText}>Check your inbox — the Corvette Z06 details are headed to {email}</p>
              </div>
            )}
          </div>

          <div style={styles.footer}>
            <div style={styles.footerDivider} />
            <p style={styles.footerPowered}>Vehicle profile powered by</p>
            <img src="/Mothers Logo Red.png" alt="Mothers Polish" style={styles.footerLogo} />
            <p style={styles.footerSub}>The Detailer's Choice Since 1972 · mothersgarage.co.nz</p>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  pageOuter: { minHeight: "100vh", background: "#1a1a1a", padding: "16px", display: "flex", justifyContent: "center", alignItems: "flex-start" },
  page: { width: "100%", maxWidth: 820, background: "#0a0a0a", fontFamily: "'Georgia', serif", color: "#f0f0f0", borderRadius: 12, overflow: "hidden", boxShadow: "0 8px 48px rgba(0,0,0,0.8)" },
  hero: { position: "relative", height: "70vw", maxHeight: 600, minHeight: 300, overflow: "hidden" },
  heroImg: { width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%", display: "block" },
  heroOverlay: { position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)" },
  heroBadge: { position: "absolute", top: 20, left: 20, background: "#CC0000", padding: "6px 14px", borderRadius: 4 },
  heroBadgeText: { fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: 2 },
  heroContent: { position: "absolute", bottom: 32, left: 0, right: 0, padding: "0 24px" },
  heroEyebrow: { fontSize: 12, letterSpacing: 4, color: "#D4AF37", margin: "0 0 8px", textTransform: "uppercase" },
  heroTitle: { fontSize: "clamp(36px, 8vw, 72px)", fontWeight: 900, color: "#fff", margin: "0 0 8px", lineHeight: 1 },
  heroSub: { fontSize: 16, color: "#ccc", margin: 0 },
  statsBar: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", background: "#CC0000", padding: "20px 24px" },
  statItem: { textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.2)" },
  statValue: { fontSize: "clamp(20px, 4vw, 32px)", fontWeight: 900, color: "#fff", margin: "0 0 4px" },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.8)", letterSpacing: 2, textTransform: "uppercase", margin: 0 },
  content: { maxWidth: 800, margin: "0 auto", padding: "0 24px" },
  section: { padding: "40px 0", borderBottom: "1px solid #1a1a1a" },
  sectionTitle: { fontSize: 24, fontWeight: 700, color: "#D4AF37", margin: "0 0 20px" },
  bodyText: { fontSize: 16, lineHeight: 1.8, color: "#ccc", marginBottom: 16 },
  specsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#1a1a1a", border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden" },
  specItem: { background: "#111", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  specLabel: { fontSize: 13, color: "#888", margin: 0 },
  specValue: { fontSize: 15, fontWeight: 700, color: "#fff", margin: 0, textAlign: "right" },
  featureGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  featureItem: { display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#ccc" },
  featureDot: { color: "#CC0000", fontSize: 8, flexShrink: 0 },
  saveSection: { padding: "40px 0" },
  saveBtn: { width: "100%", background: "#FFD700", border: "2px solid #F0C000", borderRadius: 8, padding: "18px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif", color: "#111" },
  quickSendBox: { textAlign: "center" },
  quickSendTitle: { fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 12px" },
  notMeBtn: { display: "block", width: "100%", background: "transparent", border: "none", color: "#888", fontSize: 13, cursor: "pointer", padding: "12px 0", fontFamily: "'Georgia', serif" },
  emailForm: { background: "#111", border: "1px solid #222", borderRadius: 12, padding: "24px" },
  emailTitle: { fontSize: 18, fontWeight: 700, color: "#fff", margin: "0 0 8px" },
  emailSub: { fontSize: 14, color: "#888", lineHeight: 1.6, margin: "0 0 20px" },
  input: { width: "100%", background: "#e8e8e8", border: "2px solid #ccc", borderRadius: 8, padding: "14px 16px", fontSize: 15, color: "#111", fontFamily: "'Georgia', serif", boxSizing: "border-box", marginBottom: 12, display: "block" },
  optInRow: { display: "flex", alignItems: "flex-start", gap: 10, margin: "4px 0 16px" },
  checkbox: { marginTop: 3, flexShrink: 0 },
  optInLabel: { fontSize: 13, color: "#888", lineHeight: 1.5 },
  sendBtn: { width: "100%", background: "#CC0000", color: "#fff", border: "none", borderRadius: 8, padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif" },
  privacyText: { fontSize: 11, color: "#555", textAlign: "center", margin: "12px 0 0" },
  errorText: { fontSize: 13, color: "#ff4444", margin: "0 0 12px" },
  successBox: { background: "rgba(204,0,0,0.1)", border: "2px solid #CC0000", borderRadius: 12, padding: "32px 24px", textAlign: "center" },
  successIcon: { fontSize: 32, color: "#CC0000", margin: "0 0 8px" },
  successTitle: { fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 8px" },
  successText: { fontSize: 14, color: "#888", lineHeight: 1.6, margin: 0 },
  footer: { textAlign: "center", padding: "40px 0 48px", borderTop: "1px solid #1a1a1a", marginTop: 20 },
  footerDivider: { width: 48, height: 2, background: "#CC0000", margin: "0 auto 24px", borderRadius: 2 },
  footerPowered: { fontSize: 12, color: "#555", margin: "0 0 10px", letterSpacing: 1 },
  footerLogo: { width: 120, height: "auto", opacity: 0.75, display: "block", margin: "0 auto 12px" },
  footerSub: { fontSize: 12, color: "#444", margin: 0 },
};

const css = `
  .save-btn:hover { background: #F0C000 !important; }
  .send-btn:hover { background: #aa0000 !important; }
  .form-input:focus { border-color: #CC0000 !important; outline: none; }
  @media (max-width: 600px) {
    .specs-grid { grid-template-columns: 1fr !important; }
    .feature-grid { grid-template-columns: 1fr !important; }
  }
`;
