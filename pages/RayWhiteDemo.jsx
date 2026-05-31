// © 2026 LINQR — linqr.global — All Rights Reserved
import { useState, useEffect } from "react";

const SUPABASE_URL = "https://sfymjnjpqvgtoxofndzx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmeW1qbmpwcXZndG94b2ZuZHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NzI1MTAsImV4cCI6MjA3MzE0ODUxMH0.RqBItIZ-Iz_XhKcJNsJSR6e3n5jxW_YKHWGHO5j1z2c";

const RW_YELLOW = "#FFCD00";
const RW_BLACK = "#111111";

export default function RayWhiteDemo() {
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
        body: JSON.stringify({
          name, email, optIn,
          carName: "36 Derbyshire Lane, Karaka",
          carUrl: "https://mothers-showtime.vercel.app/ray-white-karaka",
        }),
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
        body: JSON.stringify({
          name, email, optIn: false,
          carName: "36 Derbyshire Lane, Karaka",
          carUrl: "https://mothers-showtime.vercel.app/ray-white-karaka",
        }),
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
    { label: "Bedrooms", value: "4" },
    { label: "Bathrooms", value: "5" },
    { label: "Land", value: "1.04 ha / 2.57 acres" },
    { label: "Zoning", value: "Residential" },
    { label: "Property Type", value: "Lifestyle · Waterfront" },
    { label: "School", value: "ACG Strathallan (walking)" },
    { label: "Location", value: "Karaka, Auckland" },
    { label: "Price", value: "By Negotiation" },
  ];

  return (
    <div style={styles.pageOuter}>
      <div style={styles.page}>
        <style>{css}</style>

        {/* RAY WHITE HEADER */}
        <div style={styles.rwHeader}>
          <div style={styles.rwLogoBox}>
            <span style={styles.rwLogoText}>RAY WHITE</span>
            <span style={styles.rwBranch}>Botany · Franklin</span>
          </div>
          <div style={styles.rwTagline}>Five AM Realty Limited Licensed (REAA 2008)</div>
        </div>

        {/* HERO */}
        <div style={styles.hero}>
          <img src="/36-Derbyshire-Lane.jpg" alt="36 Derbyshire Lane Karaka" style={styles.heroImg} />
          <div style={styles.heroOverlay} />
          <div style={styles.heroBadge}>
            <span style={styles.heroBadgeText}>LIFESTYLE PROPERTY · KARAKA</span>
          </div>
          <div style={styles.heroContent}>
            <p style={styles.heroEyebrow}>36 DERBYSHIRE LANE</p>
            <h1 style={styles.heroTitle}>Karaka</h1>
            <p style={styles.heroSub}>Prestigious Waterfront Lifestyle Estate · 1Ha Residential Zoned</p>
          </div>
        </div>

        {/* HEADLINE STATS */}
        <div style={styles.statsBar}>
          {[
            { value: "4", label: "Bedrooms" },
            { value: "5", label: "Bathrooms" },
            { value: "1.04ha", label: "Land Area" },
            { value: "POA", label: "Price" },
          ].map((s) => (
            <div key={s.label} style={styles.statItem}>
              <p style={styles.statValue}>{s.value}</p>
              <p style={styles.statLabel}>{s.label}</p>
            </div>
          ))}
        </div>

        <div style={styles.content}>

          {/* DESCRIPTION */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>A Rare Karaka Waterfront Estate</h2>
            <p style={styles.bodyText}>
              An extraordinary opportunity to acquire one of Karaka's most prestigious waterfront lifestyle properties. Set on over 1 hectare of beautifully landscaped grounds — zoned residential — this architecturally designed home offers a scale and quality rarely seen in the Auckland market.
            </p>
            <p style={styles.bodyText}>
              The sweeping pool terrace, expansive outdoor entertaining areas, and generous garaging complement a home designed for those who demand the very best. Walking distance to ACG Strathallan Private School, with residential development potential and services across the road.
            </p>
            <a href="https://rwbotany.co.nz/properties/residential-for-sale/franklin/karaka-2580/lifestyle-property/3448503" target="_blank" rel="noopener noreferrer" style={styles.learnMore}>
              View full listing & all photos at Ray White →
            </a>
          </div>

          {/* SPECS */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Property Details</h2>
            <div style={styles.specsGrid} className="specs-grid">
              {specs.map((spec) => (
                <div key={spec.label} style={styles.specItem}>
                  <p style={styles.specLabel}>{spec.label}</p>
                  <p style={styles.specValue}>{spec.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FEATURES */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Property Highlights</h2>
            <div style={styles.featureGrid} className="feature-grid">
              {[
                "Architecturally Designed Home",
                "Heated Swimming Pool & Spa",
                "Expansive Pool Terrace",
                "Massive Garage & Workshed",
                "Sunroom & Family Room",
                "Study & Home Office",
                "Heat Pump & Ventilation System",
                "ACG Strathallan — Walking Distance",
                "1Ha Residentially Zoned Land",
                "Prestigious Waterfront Location",
                "Residential Development Potential",
                "Services Across the Road",
              ].map((f) => (
                <div key={f} style={styles.featureItem}>
                  <span style={styles.featureDot}>●</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA BUTTONS */}
          <div style={styles.actionSection}>
            <a href="https://rwbotany.co.nz/properties/residential-for-sale/franklin/karaka-2580/lifestyle-property/3448503" target="_blank" rel="noopener noreferrer" style={styles.primaryBtn} className="primary-btn">
              View Full Listing & All Photos →
            </a>
            <a href="https://rwbotany.co.nz/properties/residential-for-sale/franklin/karaka-2580/lifestyle-property/3448503" target="_blank" rel="noopener noreferrer" style={styles.secondaryBtn} className="secondary-btn">
              Request a Private Viewing
            </a>
          </div>

          {/* EMAIL CAPTURE */}
          <div style={styles.saveSection}>
            {!showEmailForm && !sent && !remembered && (
              <button style={styles.saveBtn} onClick={() => setShowEmailForm(true)} className="save-btn">
                📧 Email This Property to Yourself
              </button>
            )}

            {!sent && remembered && (
              <div style={styles.quickSendBox}>
                <p style={styles.quickSendTitle}>📧 Send to {email}?</p>
                <button style={styles.quickSendBtn} onClick={handleQuickSend} disabled={sending} className="quick-send-btn">
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
                <p style={styles.emailTitle}>📧 Save This Property to Your Inbox</p>
                <p style={styles.emailSub}>We'll send you the full details instantly — yours to keep, revisit, and share.</p>
                <input style={styles.input} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="form-input" />
                <input style={styles.input} placeholder="Your email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" />
                <div style={styles.optInRow}>
                  <input type="checkbox" id="optin" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} style={styles.checkbox} />
                  <label htmlFor="optin" style={styles.optInLabel}>Keep me updated on similar properties and new listings</label>
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
                <p style={styles.successText}>Check your inbox — 36 Derbyshire Lane details are headed to {email}</p>
              </div>
            )}
          </div>

          {/* AGENT BOX */}
          <div style={styles.agentBox}>
            <div style={styles.agentYellowBar} />
            <div style={styles.agentInfo}>
              <p style={styles.agentBranch}>Ray White Botany</p>
              <p style={styles.agentLicense}>Five AM Realty Limited Licensed (REAA 2008)</p>
              <a href="https://rwbotany.co.nz" target="_blank" rel="noopener noreferrer" style={styles.agentLink}>rwbotany.co.nz</a>
            </div>
          </div>

          {/* FOOTER */}
          <div style={styles.footer}>
            <div style={styles.footerDivider} />
            <p style={styles.footerPowered}>Property profile powered by</p>
            <img src="/LINQR-logo.png" alt="LINQR" style={styles.footerLogo} />
            <p style={styles.footerSub}>© LINQR 2026 · linqr.global</p>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  pageOuter: { minHeight: "100vh", background: "#FFCD00", padding: "16px", display: "flex", justifyContent: "center", alignItems: "flex-start" },
  page: { width: "100%", maxWidth: 820, background: "#fff", fontFamily: "'Georgia', serif", color: "#111", borderRadius: 12, overflow: "hidden", boxShadow: "0 8px 48px rgba(0,0,0,0.2)" },

  rwHeader: { background: "#FFCD00", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  rwLogoBox: { display: "flex", flexDirection: "column" },
  rwLogoText: { fontSize: 26, fontWeight: 900, color: "#111", letterSpacing: 3, fontFamily: "'Georgia', serif" },
  rwBranch: { fontSize: 12, color: "#333", letterSpacing: 1 },
  rwTagline: { fontSize: 10, color: "#555", textAlign: "right", maxWidth: 180, lineHeight: 1.4 },

  hero: { position: "relative", height: "70vw", maxHeight: 520, minHeight: 280, overflow: "hidden", background: "#f0f0f0" },
  heroImg: { width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%", display: "block" },
  heroOverlay: { position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 20%, rgba(0,0,0,0.85) 100%)" },
  heroBadge: { position: "absolute", top: 20, left: 20, background: "#FFCD00", padding: "6px 14px", borderRadius: 4 },
  heroBadgeText: { fontSize: 11, fontWeight: 700, color: "#111", letterSpacing: 2 },
  heroContent: { position: "absolute", bottom: 28, left: 0, right: 0, padding: "0 24px" },
  heroEyebrow: { fontSize: 12, letterSpacing: 3, color: "#FFCD00", margin: "0 0 6px", textTransform: "uppercase" },
  heroTitle: { fontSize: "clamp(40px, 9vw, 80px)", fontWeight: 900, color: "#fff", margin: "0 0 8px", lineHeight: 1, letterSpacing: 2 },
  heroSub: { fontSize: 14, color: "#eee", margin: 0 },

  statsBar: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", background: "#111", padding: "20px 16px" },
  statItem: { textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.15)" },
  statValue: { fontSize: "clamp(18px, 4vw, 30px)", fontWeight: 900, color: "#FFCD00", margin: "0 0 4px" },
  statLabel: { fontSize: 10, color: "rgba(255,255,255,0.7)", letterSpacing: 2, textTransform: "uppercase", margin: 0 },

  content: { padding: "0 24px" },
  section: { padding: "32px 0", borderBottom: "1px solid #f0f0f0" },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: "#111", margin: "0 0 16px", letterSpacing: 1, textTransform: "uppercase" },
  bodyText: { fontSize: 15, lineHeight: 1.8, color: "#444", marginBottom: 16 },
  learnMore: { display: "inline-block", color: "#111", fontSize: 14, fontWeight: 700, textDecoration: "none", borderBottom: "2px solid #FFCD00", paddingBottom: 2 },

  specsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#f0f0f0", border: "1px solid #f0f0f0", borderRadius: 8, overflow: "hidden" },
  specItem: { background: "#fff", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  specLabel: { fontSize: 12, color: "#888", margin: 0 },
  specValue: { fontSize: 14, fontWeight: 700, color: "#111", margin: 0, textAlign: "right" },

  featureGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  featureItem: { display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#444", lineHeight: 1.5 },
  featureDot: { color: "#FFCD00", fontSize: 10, flexShrink: 0, marginTop: 3 },

  actionSection: { padding: "28px 0", display: "flex", flexDirection: "column", gap: 12 },
  primaryBtn: { display: "block", background: "#FFCD00", color: "#111", borderRadius: 8, padding: "18px 24px", fontSize: 16, fontWeight: 700, textAlign: "center", textDecoration: "none", fontFamily: "'Georgia', serif" },
  secondaryBtn: { display: "block", background: "transparent", color: "#111", border: "2px solid #111", borderRadius: 8, padding: "16px 24px", fontSize: 15, fontWeight: 700, textAlign: "center", textDecoration: "none", fontFamily: "'Georgia', serif" },

  saveSection: { paddingBottom: 32 },
  saveBtn: { width: "100%", background: "#003087", border: "2px solid #002070", borderRadius: 8, padding: "18px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif", color: "#fff" },
  quickSendBox: { textAlign: "center" },
  quickSendTitle: { fontSize: 16, fontWeight: 700, color: "#111", margin: "0 0 12px" },
  quickSendBtn: { width: "100%", background: "#003087", color: "#fff", border: "none", borderRadius: 8, padding: "18px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif", marginBottom: 8 },
  notMeBtn: { display: "block", width: "100%", background: "transparent", border: "none", color: "#888", fontSize: 13, cursor: "pointer", padding: "12px 0", fontFamily: "'Georgia', serif" },
  emailForm: { background: "#f9f9f9", border: "1px solid #e0e0e0", borderRadius: 12, padding: "24px" },
  emailTitle: { fontSize: 18, fontWeight: 700, color: "#111", margin: "0 0 8px" },
  emailSub: { fontSize: 14, color: "#666", lineHeight: 1.6, margin: "0 0 20px" },
  input: { width: "100%", background: "#fff", border: "2px solid #ddd", borderRadius: 8, padding: "14px 16px", fontSize: 15, color: "#111", fontFamily: "'Georgia', serif", boxSizing: "border-box", marginBottom: 12, display: "block" },
  optInRow: { display: "flex", alignItems: "flex-start", gap: 10, margin: "4px 0 16px" },
  checkbox: { marginTop: 3, flexShrink: 0 },
  optInLabel: { fontSize: 13, color: "#666", lineHeight: 1.5 },
  sendBtn: { width: "100%", background: "#111", color: "#FFCD00", border: "none", borderRadius: 8, padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif" },
  privacyText: { fontSize: 11, color: "#aaa", textAlign: "center", margin: "12px 0 0" },
  errorText: { fontSize: 13, color: "#cc0000", margin: "0 0 12px" },
  successBox: { background: "#fffde6", border: "2px solid #FFCD00", borderRadius: 12, padding: "32px 24px", textAlign: "center" },
  successIcon: { fontSize: 32, color: "#111", margin: "0 0 8px" },
  successTitle: { fontSize: 22, fontWeight: 700, color: "#111", margin: "0 0 8px" },
  successText: { fontSize: 14, color: "#666", lineHeight: 1.6, margin: 0 },

  agentBox: { background: "#f9f9f9", border: "1px solid #e0e0e0", borderRadius: 10, padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16 },
  agentYellowBar: { width: 6, height: 60, background: "#FFCD00", borderRadius: 3, flexShrink: 0 },
  agentInfo: {},
  agentBranch: { fontSize: 16, fontWeight: 700, color: "#111", margin: "0 0 4px" },
  agentLicense: { fontSize: 12, color: "#888", margin: "0 0 6px" },
  agentLink: { fontSize: 13, fontWeight: 700, color: "#111", textDecoration: "none", borderBottom: "1px solid #FFCD00" },

  footer: { textAlign: "center", padding: "24px 0 40px" },
  footerDivider: { width: 40, height: 3, background: "#FFCD00", margin: "0 auto 20px", borderRadius: 2 },
  footerPowered: { fontSize: 11, color: "#aaa", margin: "0 0 8px", letterSpacing: 1 },
  footerLogo: { width: 120, height: "auto", display: "block", margin: "0 auto 8px" },
  footerSub: { fontSize: 11, color: "#bbb", margin: 0 },
};

const css = `
  .primary-btn:hover { background: #e6b800 !important; }
  .secondary-btn:hover { background: #111 !important; color: #FFCD00 !important; }
  .save-btn:hover { background: #002070 !important; }
  .send-btn:hover { background: #333 !important; }
  .quick-send-btn:hover { background: #002070 !important; }
  .form-input:focus { border-color: #FFCD00 !important; outline: none; }
  @media (max-width: 600px) {
    .specs-grid { grid-template-columns: 1fr !important; }
    .feature-grid { grid-template-columns: 1fr !important; }
  }
`;
