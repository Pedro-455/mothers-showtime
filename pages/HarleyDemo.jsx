import { useState, useEffect } from "react";

const SUPABASE_URL = "https://sfymjnjpqvgtoxofndzx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmeW1qbmpwcXZndG94b2ZuZHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NzI1MTAsImV4cCI6MjA3MzE0ODUxMH0.RqBItIZ-Iz_XhKcJNsJSR6e3n5jxW_YKHWGHO5j1z2c";

export default function HarleyDemo() {
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
        body: JSON.stringify({ name, email, optIn, carName: "Harley-Davidson Street Glide®", carUrl: "https://mothers-showtime.vercel.app/harley-street-glide" }),
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
        body: JSON.stringify({ name, email, optIn: false, carName: "Harley-Davidson Street Glide®", carUrl: "https://mothers-showtime.vercel.app/harley-street-glide" }),
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
    { label: "Engine", value: "Milwaukee-Eight® 117" },
    { label: "Displacement", value: "1,923cc" },
    { label: "Torque", value: "177Nm @ 3,250 RPM" },
    { label: "Cooling", value: "Liquid-Cooled Heads" },
    { label: "Transmission", value: "6-Speed Cruise Drive" },
    { label: "Drive", value: "Belt Drive" },
    { label: "Front Tyre", value: "130/60HB-19" },
    { label: "Rear Tyre", value: "180/55HB-18" },
    { label: "Finish", value: "Midnight Firestorm" },
    { label: "Stock #", value: "23106" },
  ];

  return (
    <div style={styles.pageOuter}>
      <div style={styles.page}>
        <style>{css}</style>

        <div style={styles.dealerHeader}>
          <img src="/ahd.png" alt="Auckland Harley Davidson" style={styles.dealerLogo} />
        </div>

        <div style={styles.hero}>
          <img src="/flhx.jpg" alt="2025 Harley-Davidson Street Glide" style={styles.heroImg} />
          <div style={styles.heroOverlay} />
          <div style={styles.heroContent}>
            <p style={styles.heroEyebrow}>2025 HARLEY-DAVIDSON</p>
            <h1 style={styles.heroTitle}>Street Glide®</h1>
            <p style={styles.heroSub}>FLHX · Midnight Firestorm · Milwaukee-Eight 117</p>
          </div>
        </div>

        <div style={styles.statsBar}>
          {[
            { value: "117", label: "Cubic Inches" },
            { value: "177Nm", label: "Torque" },
            { value: "1,923", label: "CC" },
            { value: "3.99%", label: "Finance Available" },
          ].map((s) => (
            <div key={s.label} style={styles.statItem}>
              <p style={styles.statValue}>{s.value}</p>
              <p style={styles.statLabel}>{s.label}</p>
            </div>
          ))}
        </div>

        <div style={styles.content}>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>History Rewritten</h2>
            <p style={styles.bodyText}>
              After nearly two decades on the open road, the Street Glide® redefines what a touring motorcycle can be. The all-new Milwaukee-Eight® 117 V-twin with liquid-cooled cylinder heads delivers big power without the heat — breathing easy through a high-flow intake and exhaling through an unmistakable exhaust note that announces your arrival long before you get there.
            </p>
            <p style={styles.bodyText}>
              This Midnight Firestorm example — finished in dramatic black with subtle ghost flame graphics — is one of the most striking Street Glides ever built. Hand-adjustable rear suspension, three pre-programmed ride modes, and a full touchscreen infotainment system make every mile effortless. Available now at Auckland Harley-Davidson on 3.99% Harley-Davidson Finance.
            </p>
            <a href="https://aucklandharleydavidson.co.nz" target="_blank" rel="noopener noreferrer" style={styles.learnMore}>
              View full inventory at Auckland Harley-Davidson →
            </a>
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
            <h2 style={styles.sectionTitle}>Street Glide Standard Features</h2>
            <div style={styles.featureGrid} className="feature-grid">
              {[
                "Liquid-Cooled Milwaukee-Eight 117",
                "Touchscreen Infotainment System",
                "200W 4-Channel Audio System",
                "Fairing-Mounted Speakers",
                "3 Ride Modes (Road/Sport/Rain)",
                "Cornering ABS & Traction Control",
                "Hand-Adjustable Rear Suspension",
                "Apple CarPlay Compatible",
                "LED Lighting Throughout",
                "Batwing Fairing with Windshield",
                "Hard Saddlebags",
                "Midnight Firestorm Ghost Flames",
              ].map((f) => (
                <div key={f} style={styles.featureItem}>
                  <span style={styles.featureDot}>●</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.offerBox}>
            <p style={styles.offerTitle}>💰 Special Finance Rate</p>
            <p style={styles.offerText}>
              This Street Glide is available on 3.99% Harley-Davidson Finance — making New Zealand's most iconic touring motorcycle more accessible than ever. Stock #23106. Contact Auckland Harley-Davidson for full terms and conditions.
            </p>
            <a href="https://aucklandharleydavidson.co.nz" target="_blank" rel="noopener noreferrer" style={styles.offerLink}>
              Enquire about finance at Auckland H-D →
            </a>
          </div>

          {/* EMAIL CAPTURE */}
          <div style={styles.saveSection}>
            {!showEmailForm && !sent && !remembered && (
              <button style={styles.saveBtn} onClick={() => setShowEmailForm(true)} className="save-btn">
                📧 Email This to Yourself
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
                <p style={styles.emailTitle}>📧 Save This to Your Inbox</p>
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
                <p style={styles.successText}>Check your inbox — the Street Glide details are headed to {email}</p>
              </div>
            )}
          </div>

          <div style={styles.footer}>
            <div style={styles.footerDivider} />
            <img src="/ahd.png" alt="Auckland Harley Davidson" style={{ height: 36, margin: "0 auto 16px", display: "block", opacity: 0.8 }} />
            <p style={styles.footerAddress}>aucklandharleydavidson.co.nz</p>
            <div style={styles.footerSeparator} />
            <p style={styles.footerPowered}>Digital profile powered by</p>
            <img src="/Mothers Logo Red.png" alt="Mothers Polish" style={styles.footerLogo} />
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  pageOuter: { minHeight: "100vh", background: "#1a1a1a", padding: "16px", display: "flex", justifyContent: "center", alignItems: "flex-start" },
  page: { width: "100%", maxWidth: 820, background: "#0a0a0a", fontFamily: "'Georgia', serif", color: "#f0f0f0", borderRadius: 12, overflow: "hidden", boxShadow: "0 8px 48px rgba(0,0,0,0.8)" },
  dealerHeader: { background: "#111", borderBottom: "3px solid #FF6600", padding: "16px 24px", display: "flex", justifyContent: "center", alignItems: "center" },
  dealerLogo: { height: 48, width: "auto" },
  hero: { position: "relative", height: "70vw", maxHeight: 580, minHeight: 280, overflow: "hidden", background: "#050505" },
  heroImg: { width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", display: "block", padding: "20px 0" },
  heroOverlay: { position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)" },
  heroContent: { position: "absolute", bottom: 24, left: 0, right: 0, padding: "0 24px" },
  heroEyebrow: { fontSize: 12, letterSpacing: 4, color: "#FF6600", margin: "0 0 8px", textTransform: "uppercase" },
  heroTitle: { fontSize: "clamp(36px, 8vw, 72px)", fontWeight: 900, color: "#fff", margin: "0 0 8px", lineHeight: 1 },
  heroSub: { fontSize: 15, color: "#ccc", margin: 0 },
  statsBar: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", background: "#FF6600", padding: "20px 24px" },
  statItem: { textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.2)" },
  statValue: { fontSize: "clamp(18px, 4vw, 30px)", fontWeight: 900, color: "#fff", margin: "0 0 4px" },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.85)", letterSpacing: 2, textTransform: "uppercase", margin: 0 },
  content: { maxWidth: 800, margin: "0 auto", padding: "0 24px" },
  section: { padding: "40px 0", borderBottom: "1px solid #1a1a1a" },
  sectionTitle: { fontSize: 24, fontWeight: 700, color: "#FF6600", margin: "0 0 20px" },
  bodyText: { fontSize: 16, lineHeight: 1.8, color: "#ccc", marginBottom: 16 },
  learnMore: { display: "inline-block", color: "#FF6600", fontSize: 15, fontWeight: 700, textDecoration: "none", borderBottom: "2px solid #FF6600", paddingBottom: 2 },
  specsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#1a1a1a", border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden" },
  specItem: { background: "#111", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  specLabel: { fontSize: 13, color: "#888", margin: 0 },
  specValue: { fontSize: 15, fontWeight: 700, color: "#fff", margin: 0, textAlign: "right" },
  featureGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  featureItem: { display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#ccc" },
  featureDot: { color: "#FF6600", fontSize: 8, flexShrink: 0 },
  offerBox: { margin: "32px 0", background: "rgba(255,102,0,0.06)", border: "1px solid rgba(255,102,0,0.3)", borderRadius: 12, padding: "24px" },
  offerTitle: { fontSize: 16, fontWeight: 700, color: "#FF6600", margin: "0 0 10px" },
  offerText: { fontSize: 14, color: "#aaa", lineHeight: 1.7, margin: "0 0 16px" },
  offerLink: { display: "inline-block", color: "#FF6600", fontSize: 15, fontWeight: 700, textDecoration: "none", borderBottom: "2px solid #FF6600", paddingBottom: 2 },
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
  sendBtn: { width: "100%", background: "#FF6600", color: "#fff", border: "none", borderRadius: 8, padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif" },
  privacyText: { fontSize: 11, color: "#555", textAlign: "center", margin: "12px 0 0" },
  errorText: { fontSize: 13, color: "#ff4444", margin: "0 0 12px" },
  successBox: { background: "rgba(255,102,0,0.08)", border: "2px solid #FF6600", borderRadius: 12, padding: "32px 24px", textAlign: "center" },
  successIcon: { fontSize: 32, color: "#FF6600", margin: "0 0 8px" },
  successTitle: { fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 8px" },
  successText: { fontSize: 14, color: "#888", lineHeight: 1.6, margin: 0 },
  footer: { textAlign: "center", padding: "40px 0 48px", borderTop: "1px solid #1a1a1a", marginTop: 20 },
  footerDivider: { width: 48, height: 2, background: "#FF6600", margin: "0 auto 24px", borderRadius: 2 },
  footerAddress: { fontSize: 13, color: "#666", margin: "0 0 24px" },
  footerSeparator: { width: 1, height: 32, background: "#222", margin: "0 auto 16px" },
  footerPowered: { fontSize: 12, color: "#555", margin: "0 0 10px", letterSpacing: 1 },
  footerLogo: { width: 120, height: "auto", opacity: 0.75, display: "block", margin: "0 auto" },
};

const css = `
  .save-btn:hover { background: #F0C000 !important; }
  .send-btn:hover { background: #e65c00 !important; }
  .form-input:focus { border-color: #FF6600 !important; outline: none; }
  @media (max-width: 600px) {
    .specs-grid { grid-template-columns: 1fr !important; }
    .feature-grid { grid-template-columns: 1fr !important; }
  }
`;
