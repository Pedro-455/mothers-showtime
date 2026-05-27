import { useState } from "react";

export default function HarleyDemo() {
  const [formData, setFormData] = useState({ name: "", mobile: "", email: "", interest: "" });
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
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
    <div style={styles.page}>
      <style>{css}</style>

      {/* HEADER WITH DEALER LOGO */}
      <div style={styles.dealerHeader}>
        <img src="/ahd.png" alt="Auckland Harley Davidson" style={styles.dealerLogo} />
      </div>

      {/* HERO */}
      <div style={styles.hero}>
        <img src="/flhx.jpg" alt="2025 Harley-Davidson Street Glide" style={styles.heroImg} />
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <p style={styles.heroEyebrow}>2025 HARLEY-DAVIDSON</p>
          <h1 style={styles.heroTitle}>Street Glide®</h1>
          <p style={styles.heroSub}>FLHX · Midnight Firestorm · Milwaukee-Eight 117</p>
        </div>
      </div>

      {/* HEADLINE STATS */}
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

        {/* STORY */}
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

        {/* SPECS */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Specifications</h2>
          <div style={styles.specsGrid}>
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
          <h2 style={styles.sectionTitle}>Street Glide Standard Features</h2>
          <div style={styles.featureGrid}>
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

        {/* FINANCE BOX */}
        <div style={styles.offerBox}>
          <p style={styles.offerTitle}>💰 Special Finance Rate</p>
          <p style={styles.offerText}>
            This Street Glide is available on 3.99% Harley-Davidson Finance — making New Zealand's most iconic touring motorcycle more accessible than ever. Stock #23106. Contact Auckland Harley-Davidson for full terms and conditions.
          </p>
          <a href="https://aucklandharleydavidson.co.nz" target="_blank" rel="noopener noreferrer" style={styles.offerLink}>
            Enquire about finance at Auckland H-D →
          </a>
        </div>

        {/* LEAD CAPTURE */}
        {!submitted ? (
          <div style={styles.leadSection}>
            {!showForm ? (
              <div style={styles.leadButtons}>
                <h2 style={styles.leadTitle}>Interested in this Street Glide?</h2>
                <p style={styles.leadSub}>Speak with the team at Auckland Harley-Davidson about a test ride or finance options.</p>
                <button style={styles.leadBtn} onClick={() => setShowForm(true)} className="lead-btn">
                  Request More Information →
                </button>
                <button style={styles.testDriveBtn} onClick={() => setShowForm(true)} className="test-btn">
                  Book a Test Ride
                </button>
              </div>
            ) : (
              <div style={styles.formWrap}>
                <h2 style={styles.leadTitle}>Get in Touch</h2>
                <p style={styles.leadSub}>The Auckland Harley-Davidson team will contact you within 24 hours.</p>
                <form onSubmit={handleSubmit} style={styles.form}>
                  <div style={styles.fieldWrap}>
                    <label style={styles.label}>Full Name *</label>
                    <input style={styles.input} placeholder="e.g. John Smith" required
                      value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="form-input" />
                  </div>
                  <div style={styles.grid2}>
                    <div style={styles.fieldWrap}>
                      <label style={styles.label}>Mobile *</label>
                      <input style={styles.input} placeholder="021 234 5678" required
                        value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                        className="form-input" />
                    </div>
                    <div style={styles.fieldWrap}>
                      <label style={styles.label}>Email *</label>
                      <input style={styles.input} type="email" placeholder="john@email.com" required
                        value={formData.email} onChange={(e) => setFormData({...formData, electric: e.target.value})}
                        className="form-input" />
                    </div>
                  </div>
                  <div style={styles.fieldWrap}>
                    <label style={styles.label}>I'm interested in...</label>
                    <select style={styles.input} value={formData.interest}
                      onChange={(e) => setFormData({...formData, interest: e.target.value})}
                      className="form-input">
                      <option value="">Select an option</option>
                      <option value="purchase">Purchasing this Street Glide</option>
                      <option value="testride">Test ride</option>
                      <option value="finance">3.99% finance options</option>
                      <option value="tradeIn">Trade-in enquiry</option>
                      <option value="info">General information</option>
                    </select>
                  </div>
                  <button type="submit" style={styles.submitBtn} className="lead-btn">
                    Send My Request →
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <div style={styles.thankYou}>
            <div style={styles.thankYouIcon}>✓</div>
            <h2 style={styles.thankYouTitle}>Thank You!</h2>
            <p style={styles.thankYouText}>The Auckland Harley-Davidson team will be in touch within 24 hours.</p>
            <img src="/ahd.png" alt="Auckland Harley Davidson" style={{ height: 40, margin: "24px auto 0", display: "block", opacity: 0.8 }} />
          </div>
        )}

        {/* FOOTER */}
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

  // Dealer header
  dealerHeader: { background: "#111", borderBottom: "3px solid #FF6600", padding: "16px 24px", display: "flex", justifyContent: "center", alignItems: "center" },
  dealerLogo: { height: 48, width: "auto" },

  // Hero
  hero: { position: "relative", height: "70vw", maxHeight: 580, minHeight: 280, overflow: "hidden", background: "#050505" },
  heroImg: { width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", display: "block", padding: "20px 0" },
  heroOverlay: { position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)" },
  heroContent: { position: "absolute", bottom: 24, left: 0, right: 0, padding: "0 24px" },
  heroEyebrow: { fontSize: 12, letterSpacing: 4, color: "#FF6600", margin: "0 0 8px", textTransform: "uppercase" },
  heroTitle: { fontSize: "clamp(36px, 8vw, 72px)", fontWeight: 900, color: "#fff", margin: "0 0 8px", lineHeight: 1 },
  heroSub: { fontSize: 15, color: "#ccc", margin: 0 },

  // Stats - orange Harley colour
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

  leadSection: { padding: "40px 0" },
  leadButtons: { textAlign: "center" },
  leadTitle: { fontSize: 24, fontWeight: 700, color: "#fff", margin: "0 0 10px" },
  leadSub: { fontSize: 15, color: "#888", margin: "0 0 28px" },
  leadBtn: { display: "block", width: "100%", background: "#FF6600", color: "#fff", border: "none", borderRadius: 10, padding: "18px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif", marginBottom: 12, textAlign: "center" },
  testDriveBtn: { display: "block", width: "100%", background: "transparent", color: "#FF6600", border: "2px solid #FF6600", borderRadius: 10, padding: "16px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif", textAlign: "center" },

  formWrap: {},
  form: { display: "flex", flexDirection: "column", gap: 16 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  fieldWrap: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 12, fontWeight: 700, color: "#FF6600", letterSpacing: 1, textTransform: "uppercase" },
  input: { background: "#e8e8e8", border: "2px solid #ccc", borderRadius: 8, padding: "14px 16px", fontSize: 15, color: "#111", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "'Georgia', serif" },
  submitBtn: { background: "#FF6600", color: "#fff", border: "none", borderRadius: 10, padding: "18px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif", marginTop: 8 },

  thankYou: { textAlign: "center", padding: "60px 0" },
  thankYouIcon: { width: 64, height: 64, borderRadius: "50%", background: "#FF6600", color: "#fff", fontSize: 28, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" },
  thankYouTitle: { fontSize: 28, fontWeight: 900, color: "#fff", margin: "0 0 12px" },
  thankYouText: { fontSize: 16, color: "#888" },

  footer: { textAlign: "center", padding: "40px 0 48px", borderTop: "1px solid #1a1a1a", marginTop: 20 },
  footerDivider: { width: 48, height: 2, background: "#FF6600", margin: "0 auto 24px", borderRadius: 2 },
  footerAddress: { fontSize: 13, color: "#666", margin: "0 0 24px" },
  footerSeparator: { width: 1, height: 32, background: "#222", margin: "0 auto 16px" },
  footerPowered: { fontSize: 12, color: "#555", margin: "0 0 10px", letterSpacing: 1 },
  footerLogo: { width: 120, height: "auto", opacity: 0.75, display: "block", margin: "0 auto" },
};

const css = `
  .lead-btn:hover { background: #e65c00 !important; }
  .test-btn:hover { background: rgba(255,102,0,0.1) !important; }
  .form-input:focus { border-color: #FF6600 !important; box-shadow: 0 0 0 3px rgba(255,102,0,0.15) !important; background: #fff !important; }
  @media (max-width: 600px) {
    .grid2 { grid-template-columns: 1fr !important; }
  }
`;
