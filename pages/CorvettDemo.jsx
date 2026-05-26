import { useState } from "react";

export default function CorvetteDemo() {
  const [formData, setFormData] = useState({ name: "", mobile: "", email: "", interest: "" });
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
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
    <div style={styles.page}>
      <style>{css}</style>

      {/* HERO */}
      <div style={styles.hero}>
        <img src="/corvette-z06.jpg" alt="Corvette Z06" style={styles.heroImg} />
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

      {/* HEADLINE STATS */}
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

        {/* STORY */}
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
          <h2 style={styles.sectionTitle}>Z07 Performance Package</h2>
          <div style={styles.featureGrid}>
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

        {/* DETAILING NOTE */}
        <div style={styles.detailBox}>
          <div style={styles.detailBoxInner}>
            <p style={styles.detailBoxTitle}>✨ Detailed with Mothers California Gold</p>
            <p style={styles.detailBoxText}>
              This vehicle was professionally detailed using Mothers California Gold ceramic products — the same products trusted by Corvette enthusiasts and show car owners worldwide. The finish you see is achievable on your own vehicle.
            </p>
          </div>
        </div>

        {/* LEAD CAPTURE */}
        {!submitted ? (
          <div style={styles.leadSection}>
            {!showForm ? (
              <div style={styles.leadButtons}>
                <h2 style={styles.leadTitle}>Interested in this vehicle?</h2>
                <p style={styles.leadSub}>Get in touch with our team for pricing, availability, and test drive bookings.</p>
                <button style={styles.leadBtn} onClick={() => setShowForm(true)} className="lead-btn">
                  Request More Information →
                </button>
                <button style={styles.testDriveBtn} onClick={() => setShowForm(true)} className="test-btn">
                  Book a Test Drive
                </button>
              </div>
            ) : (
              <div style={styles.formWrap}>
                <h2 style={styles.leadTitle}>Get in Touch</h2>
                <p style={styles.leadSub}>Our team will contact you within 24 hours.</p>
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
                        value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="form-input" />
                    </div>
                  </div>
                  <div style={styles.fieldWrap}>
                    <label style={styles.label}>I'm interested in...</label>
                    <select style={styles.input} value={formData.interest}
                      onChange={(e) => setFormData({...formData, interest: e.target.value})}
                      className="form-input">
                      <option value="">Select an option</option>
                      <option value="purchase">Purchasing this vehicle</option>
                      <option value="testdrive">Test drive</option>
                      <option value="finance">Finance options</option>
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
            <p style={styles.thankYouText}>Our team will be in touch within 24 hours.</p>
          </div>
        )}

        {/* MOTHERS FOOTER */}
        <div style={styles.footer}>
          <div style={styles.footerDivider} />
          <p style={styles.footerPowered}>Vehicle profile powered by</p>
          <img src="/Mothers Logo Red.png" alt="Mothers Polish" style={styles.footerLogo} />
          <p style={styles.footerSub}>The Detailer's Choice Since 1972 · mothersgarage.co.nz</p>
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Georgia', serif", color: "#f0f0f0" },

  // Hero
  hero: { position: "relative", height: "70vw", maxHeight: 600, minHeight: 300, overflow: "hidden" },
  heroImg: { width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%", display: "block" },
  heroOverlay: { position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)" },
  heroBadge: { position: "absolute", top: 20, left: 20, background: "#CC0000", padding: "6px 14px", borderRadius: 4 },
  heroBadgeText: { fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: 2 },
  heroContent: { position: "absolute", bottom: 32, left: 0, right: 0, padding: "0 24px" },
  heroEyebrow: { fontSize: 12, letterSpacing: 4, color: "#D4AF37", margin: "0 0 8px", textTransform: "uppercase" },
  heroTitle: { fontSize: "clamp(36px, 8vw, 72px)", fontWeight: 900, color: "#fff", margin: "0 0 8px", lineHeight: 1 },
  heroSub: { fontSize: 16, color: "#ccc", margin: 0 },

  // Stats bar
  statsBar: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", background: "#CC0000", padding: "20px 24px" },
  statItem: { textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.2)" },
  statValue: { fontSize: "clamp(20px, 4vw, 32px)", fontWeight: 900, color: "#fff", margin: "0 0 4px" },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.8)", letterSpacing: 2, textTransform: "uppercase", margin: 0 },

  // Content
  content: { maxWidth: 800, margin: "0 auto", padding: "0 24px" },
  section: { padding: "40px 0", borderBottom: "1px solid #1a1a1a" },
  sectionTitle: { fontSize: 24, fontWeight: 700, color: "#D4AF37", margin: "0 0 20px" },
  bodyText: { fontSize: 16, lineHeight: 1.8, color: "#ccc", marginBottom: 16 },

  // Specs
  specsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#1a1a1a", border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden" },
  specItem: { background: "#111", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  specLabel: { fontSize: 13, color: "#888", margin: 0 },
  specValue: { fontSize: 15, fontWeight: 700, color: "#fff", margin: 0, textAlign: "right" },

  // Features
  featureGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  featureItem: { display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#ccc" },
  featureDot: { color: "#CC0000", fontSize: 8, flexShrink: 0 },

  // Detail box
  detailBox: { margin: "32px 0", background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 12, padding: "24px" },
  detailBoxInner: {},
  detailBoxTitle: { fontSize: 16, fontWeight: 700, color: "#D4AF37", margin: "0 0 10px" },
  detailBoxText: { fontSize: 14, color: "#aaa", lineHeight: 1.7, margin: 0 },

  // Lead capture
  leadSection: { padding: "40px 0" },
  leadButtons: { textAlign: "center" },
  leadTitle: { fontSize: 24, fontWeight: 700, color: "#fff", margin: "0 0 10px" },
  leadSub: { fontSize: 15, color: "#888", margin: "0 0 28px" },
  leadBtn: { display: "block", width: "100%", background: "#CC0000", color: "#fff", border: "none", borderRadius: 10, padding: "18px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif", marginBottom: 12, textAlign: "center" },
  testDriveBtn: { display: "block", width: "100%", background: "transparent", color: "#D4AF37", border: "2px solid #D4AF37", borderRadius: 10, padding: "16px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif", textAlign: "center" },

  // Form
  formWrap: {},
  form: { display: "flex", flexDirection: "column", gap: 16 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  fieldWrap: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 12, fontWeight: 700, color: "#D4AF37", letterSpacing: 1, textTransform: "uppercase" },
  input: { background: "#e8e8e8", border: "2px solid #ccc", borderRadius: 8, padding: "14px 16px", fontSize: 15, color: "#111", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "'Georgia', serif" },
  submitBtn: { background: "#CC0000", color: "#fff", border: "none", borderRadius: 10, padding: "18px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif", marginTop: 8 },

  // Thank you
  thankYou: { textAlign: "center", padding: "60px 0" },
  thankYouIcon: { width: 64, height: 64, borderRadius: "50%", background: "#CC0000", color: "#fff", fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" },
  thankYouTitle: { fontSize: 28, fontWeight: 900, color: "#fff", margin: "0 0 12px" },
  thankYouText: { fontSize: 16, color: "#888" },

  // Footer
  footer: { textAlign: "center", padding: "40px 0 48px", borderTop: "1px solid #1a1a1a", marginTop: 20 },
  footerDivider: { width: 48, height: 2, background: "#CC0000", margin: "0 auto 24px", borderRadius: 2 },
  footerPowered: { fontSize: 12, color: "#555", margin: "0 0 10px", letterSpacing: 1 },
  footerLogo: { width: 120, height: "auto", opacity: 0.75, display: "block", margin: "0 auto 12px" },
  footerSub: { fontSize: 12, color: "#444", margin: 0 },
};

const css = `
  .lead-btn:hover { background: #aa0000 !important; }
  .test-btn:hover { background: rgba(212,175,55,0.1) !important; }
  .form-input:focus { border-color: #CC0000 !important; box-shadow: 0 0 0 3px rgba(204,0,0,0.15) !important; background: #fff !important; }
  @media (max-width: 600px) {
    .grid2 { grid-template-columns: 1fr !important; }
    .specs-grid { grid-template-columns: 1fr !important; }
    .feature-grid { grid-template-columns: 1fr !important; }
    .stats-bar { grid-template-columns: repeat(2, 1fr) !important; }
  }
`;

