import { useState, useEffect } from "react";

const SUPABASE_URL = "https://sfymjnjpqvgtoxofndzx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmeW1qbmpwcXZndG94b2ZuZHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NzI1MTAsImV4cCI6MjA3MzE0ODUxMH0.RqBItIZ-Iz_XhKcJNsJSR6e3n5jxW_YKHWGHO5j1z2c";

export default function AstonDBX707() {
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
        body: JSON.stringify({ name, email, optIn, carName: "Aston Martin DBX 707", carUrl: "https://mothers-showtime.vercel.app/aston-dbx707" }),
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
        body: JSON.stringify({ name, email, optIn: false, carName: "Aston Martin DBX 707", carUrl: "https://mothers-showtime.vercel.app/aston-dbx707" }),
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
    { label: "Power", value: "697 bhp" },
    { label: "Engine", value: "4.0L Twin-Turbo V8" },
    { label: "0–100km/h", value: "3.3 seconds" },
    { label: "Top Speed", value: "310 km/h" },
    { label: "Transmission", value: "9-Speed Automatic" },
    { label: "Drive", value: "All-Wheel Drive" },
    { label: "Odometer", value: "15,400 km" },
    { label: "Exterior", value: "Golden Saffron" },
    { label: "Interior", value: "Black Metallic Aniline" },
    { label: "NZ Price", value: "NZ$299,000" },
  ];

  return (
    <div style={styles.pageOuter}>
      <div style={styles.page}>
        <style>{css}</style>

        <div style={styles.amHeader}>
          <img src="/aston-logo-black.png" alt="Aston Martin" style={styles.amLogo} />
          <p style={styles.amDealer}>Auckland · 119 Great North Road, Grey Lynn</p>
        </div>

        <div style={styles.hero}>
          <img src="/DBX707.JPG" alt="Aston Martin DBX707" style={styles.heroImg} />
          <div style={styles.heroOverlay} />
          <div style={styles.heroContent}>
            <p style={styles.heroEyebrow}>2023 · PRE-OWNED</p>
            <h1 style={styles.heroTitle}>DBX 707</h1>
            <p style={styles.heroSub}>Golden Saffron · The World's Most Powerful Luxury SUV</p>
          </div>
        </div>

        <div style={styles.statsBar}>
          {[
            { value: "697", label: "BHP" },
            { value: "3.3s", label: "0–100km/h" },
            { value: "310", label: "km/h Top Speed" },
            { value: "$299K", label: "NZD" },
          ].map((s) => (
            <div key={s.label} style={styles.statItem}>
              <p style={styles.statValue}>{s.value}</p>
              <p style={styles.statLabel}>{s.label}</p>
            </div>
          ))}
        </div>

        <div style={styles.content}>

          <div style={styles.section}>
            <p style={styles.bodyText}>
              Supreme confidence, whatever the terrain. This stunning Golden Saffron DBX707 combines the presence of an Aston Martin with the performance of a supercar — all in the space and practicality of a luxury SUV. Highly optioned with 23" textured black alloy wheels, black brake calipers, privacy glass, and premium audio. The 4.0 litre twin-turbo V8 produces 697 bhp and 900Nm of torque — making this the world's most powerful luxury SUV.
            </p>
            <p style={styles.bodyText}>
              First registered September 2023, 15,400km. Presented in exceptional condition at Aston Martin Auckland.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Key Details</h2>
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
            <h2 style={styles.sectionTitle}>Custom Features</h2>
            <div style={styles.featureGrid} className="feature-grid">
              {[
                "Signature Metallic Paint — Golden Saffron",
                "23\" Alloy Wheels in Textured Black",
                "Black Brake Calipers",
                "Front Grille in Dark Finish",
                "Tail Lights in Smoked Finish",
                "Privacy Glass with Acoustic Sound Reduction",
                "Front & Rear Ventilated Seating",
                "Fascia Veneer in Twill Carbon",
                "Interior Pack — Dark Chrome & Carbon",
                "Contrast Stitching",
                "Panoramic Glass Roof",
                "Premium Audio System",
              ].map((f) => (
                <div key={f} style={styles.featureItem}>
                  <span style={styles.featureDot}>●</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.actionSection}>
            <a href="https://www.astonmartin.com/en/enquiry?dealercode=DB027086" target="_blank" rel="noopener noreferrer" style={styles.primaryBtn} className="primary-btn">
              Enquire About This Vehicle
            </a>
            <a href="https://www.astonmartin.com/en/enquiry?dealercode=DB027086" target="_blank" rel="noopener noreferrer" style={styles.secondaryBtn} className="secondary-btn">
              Request a Test Drive
            </a>
            <a href="https://preowned.astonmartin.com/vdp/25389305-" target="_blank" rel="noopener noreferrer" style={styles.ghostBtn} className="ghost-btn">
              View Full Details at Aston Martin →
            </a>
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
                <p style={styles.successText}>Check your inbox — the DBX 707 details are headed to {email}</p>
              </div>
            )}
          </div>

          <div style={styles.dealerBox}>
            <img src="/aston-logo-black.png" alt="Aston Martin" style={styles.dealerLogoSmall} />
            <p style={styles.dealerName}>Aston Martin Auckland</p>
            <p style={styles.dealerAddress}>119 Great North Road, Grey Lynn, Auckland 1021</p>
            <a href="tel:+6499758080" style={styles.dealerPhone}>+64 9 975 8080</a>
          </div>

          <div style={styles.footer}>
            <div style={styles.footerDivider} />
            <p style={styles.footerPowered}>Digital profile powered by</p>
            <img src="/Mothers Logo Red.png" alt="Mothers Polish" style={styles.footerLogo} />
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  pageOuter: { minHeight: "100vh", background: "#1B6157", padding: "16px", display: "flex", justifyContent: "center", alignItems: "flex-start" },
  page: { width: "100%", maxWidth: 820, background: "#fff", fontFamily: "'Georgia', serif", color: "#111", borderRadius: 12, overflow: "hidden", boxShadow: "0 8px 48px rgba(0,0,0,0.15)" },
  amHeader: { background: "#fff", borderBottom: "1px solid #e0e0e0", padding: "20px 24px", textAlign: "center" },
  amLogo: { height: 40, width: "auto", margin: "0 auto 8px", display: "block" },
  amDealer: { fontSize: 12, color: "#888", letterSpacing: 1, margin: 0 },
  hero: { position: "relative", height: "70vw", maxHeight: 520, minHeight: 260, overflow: "hidden", background: "#f0f0f0" },
  heroImg: { width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 50%", display: "block" },
  heroOverlay: { position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.8) 100%)" },
  heroContent: { position: "absolute", bottom: 24, left: 0, right: 0, padding: "0 24px" },
  heroEyebrow: { fontSize: 11, letterSpacing: 3, color: "#D4AF37", margin: "0 0 8px", textTransform: "uppercase" },
  heroTitle: { fontSize: "clamp(40px, 9vw, 80px)", fontWeight: 900, color: "#fff", margin: "0 0 8px", lineHeight: 1, letterSpacing: 2 },
  heroSub: { fontSize: 14, color: "#ddd", margin: 0 },
  statsBar: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", background: "#1B6157", padding: "20px 16px" },
  statItem: { textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.2)" },
  statValue: { fontSize: "clamp(18px, 4vw, 30px)", fontWeight: 900, color: "#fff", margin: "0 0 4px" },
  statLabel: { fontSize: 10, color: "rgba(255,255,255,0.8)", letterSpacing: 2, textTransform: "uppercase", margin: 0 },
  content: { padding: "0 24px" },
  section: { padding: "32px 0", borderBottom: "1px solid #f0f0f0" },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: "#1B6157", margin: "0 0 20px", letterSpacing: 1, textTransform: "uppercase" },
  bodyText: { fontSize: 15, lineHeight: 1.8, color: "#444", marginBottom: 16 },
  specsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#f0f0f0", border: "1px solid #f0f0f0", borderRadius: 8, overflow: "hidden" },
  specItem: { background: "#fff", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  specLabel: { fontSize: 12, color: "#888", margin: 0 },
  specValue: { fontSize: 14, fontWeight: 700, color: "#111", margin: 0, textAlign: "right" },
  featureGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  featureItem: { display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#444", lineHeight: 1.4 },
  featureDot: { color: "#1B6157", fontSize: 8, flexShrink: 0, marginTop: 4 },
  actionSection: { padding: "32px 0", display: "flex", flexDirection: "column", gap: 12 },
  primaryBtn: { display: "block", background: "#1B6157", color: "#fff", borderRadius: 8, padding: "18px 24px", fontSize: 16, fontWeight: 700, textAlign: "center", textDecoration: "none", fontFamily: "'Georgia', serif" },
  secondaryBtn: { display: "block", background: "transparent", color: "#1B6157", border: "2px solid #1B6157", borderRadius: 8, padding: "16px 24px", fontSize: 15, fontWeight: 700, textAlign: "center", textDecoration: "none", fontFamily: "'Georgia', serif" },
  ghostBtn: { display: "block", color: "#888", fontSize: 13, textAlign: "center", textDecoration: "none", padding: "8px 0" },
  saveSection: { paddingBottom: 32 },
  saveBtn: { width: "100%", background: "#FFD700", border: "2px solid #F0C000", borderRadius: 8, padding: "18px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif", color: "#111" },
  quickSendBox: { textAlign: "center" },
  quickSendTitle: { fontSize: 16, fontWeight: 700, color: "#111", margin: "0 0 12px" },
  notMeBtn: { display: "block", width: "100%", background: "transparent", border: "none", color: "#888", fontSize: 13, cursor: "pointer", padding: "12px 0", fontFamily: "'Georgia', serif" },
  emailForm: { background: "#f9f9f9", border: "1px solid #e0e0e0", borderRadius: 12, padding: "24px" },
  emailTitle: { fontSize: 18, fontWeight: 700, color: "#111", margin: "0 0 8px" },
  emailSub: { fontSize: 14, color: "#666", lineHeight: 1.6, margin: "0 0 20px" },
  input: { width: "100%", background: "#fff", border: "2px solid #ddd", borderRadius: 8, padding: "14px 16px", fontSize: 15, color: "#111", fontFamily: "'Georgia', serif", boxSizing: "border-box", marginBottom: 12, display: "block" },
  optInRow: { display: "flex", alignItems: "flex-start", gap: 10, margin: "4px 0 16px" },
  checkbox: { marginTop: 3, flexShrink: 0 },
  optInLabel: { fontSize: 13, color: "#666", lineHeight: 1.5 },
  sendBtn: { width: "100%", background: "#1B6157", color: "#fff", border: "none", borderRadius: 8, padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif" },
  privacyText: { fontSize: 11, color: "#aaa", textAlign: "center", margin: "12px 0 0" },
  errorText: { fontSize: 13, color: "#cc0000", margin: "0 0 12px" },
  successBox: { background: "#f0faf7", border: "2px solid #1B6157", borderRadius: 12, padding: "32px 24px", textAlign: "center" },
  successIcon: { fontSize: 32, color: "#1B6157", margin: "0 0 8px" },
  successTitle: { fontSize: 22, fontWeight: 700, color: "#1B6157", margin: "0 0 8px" },
  successText: { fontSize: 14, color: "#666", lineHeight: 1.6, margin: 0 },
  dealerBox: { background: "#f9f9f9", border: "1px solid #e0e0e0", borderRadius: 10, padding: "24px", textAlign: "center", marginBottom: 24 },
  dealerLogoSmall: { height: 30, width: "auto", margin: "0 auto 12px", display: "block" },
  dealerName: { fontSize: 16, fontWeight: 700, color: "#111", margin: "0 0 6px" },
  dealerAddress: { fontSize: 13, color: "#888", margin: "0 0 10px" },
  dealerPhone: { fontSize: 15, fontWeight: 700, color: "#1B6157", textDecoration: "none", display: "block" },
  footer: { textAlign: "center", padding: "24px 0 40px" },
  footerDivider: { width: 40, height: 2, background: "#1B6157", margin: "0 auto 20px", borderRadius: 2 },
  footerPowered: { fontSize: 11, color: "#aaa", margin: "0 0 8px", letterSpacing: 1 },
  footerLogo: { width: 100, height: "auto", opacity: 0.6, display: "block", margin: "0 auto" },
};

const css = `
  .primary-btn:hover { background: #144d43 !important; }
  .secondary-btn:hover { background: #1B6157 !important; color: #fff !important; }
  .save-btn:hover { background: #F0C000 !important; }
  .send-btn:hover { background: #144d43 !important; }
  .ghost-btn:hover { color: #1B6157 !important; }
  .form-input:focus { border-color: #1B6157 !important; outline: none; }
  @media (max-width: 600px) {
    .specs-grid { grid-template-columns: 1fr !important; }
    .feature-grid { grid-template-columns: 1fr !important; }
  }
`;
