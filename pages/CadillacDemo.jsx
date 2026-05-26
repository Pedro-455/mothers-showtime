import { useState } from "react";

export default function CadillacDemo() {
  const [formData, setFormData] = useState({ name: "", mobile: "", email: "", interest: "" });
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  const specs = [
    { label: "Powertrain", value: "All-Electric AWD" },
    { label: "Power", value: "388kW (520hp)" },
    { label: "Torque", value: "610Nm" },
    { label: "0–100km/h", value: "5.3 seconds" },
    { label: "Range", value: "530 km" },
    { label: "Battery", value: "102kWh Ultium" },
    { label: "Charge to 80%", value: "30 minutes" },
    { label: "Display", value: '33" Curved LED' },
    { label: "Audio", value: "AKG Studio 19-Speaker" },
    { label: "NZ Price", value: "From $95,000" },
  ];

  return (
    <div style={styles.page}>
      <style>{css}</style>

      {/* HERO */}
      <div style={styles.hero}>
        <img src="/cadillac-lyriq.png" alt="Cadillac Lyriq" style={styles.heroImg} />
        <div style={styles.heroOverlay} />
        <div style={styles.heroBadge}>
          <span style={styles.heroBadgeText}>CADILLAC NEW ZEALAND</span>
        </div>
        <div style={styles.heroContent}>
          <p style={styles.heroEyebrow}>2025 CADILLAC</p>
          <h1 style={styles.heroTitle}>LYRIQ</h1>
          <p style={styles.heroSub}>Argent Silver Metallic · Sport AWD · All-Electric</p>
        </div>
      </div>

      {/* HEADLINE STATS */}
      <div style={styles.statsBar}>
        {[
          { value: "388kW", label: "Power" },
          { value: "530km", label: "Range" },
          { value: "5.3s", label: "0–100km/h" },
          { value: "$95K", label: "From NZD" },
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
          <h2 style={styles.sectionTitle}>The Future of Luxury</h2>
          <p style={styles.bodyText}>
            The Cadillac LYRIQ represents a bold new chapter for one of the world's most iconic luxury brands. Designed and engineered as a pure electric vehicle from the ground up, LYRIQ combines the performance and refinement Cadillac is renowned for with cutting-edge GM Ultium battery technology delivering an outstanding 530km of real-world range.
          </p>
          <p style={styles.bodyText}>
            Available now in New Zealand in both Luxury and Sport variants, the LYRIQ Sport AWD offers dual-motor all-wheel drive, stunning Argent Silver Metallic with Black Painted Roof finish, and a driver-focused cabin centred around a breathtaking 33-inch curved LED display. With charging to 80% in just 30 minutes, the LYRIQ is as practical as it is extraordinary.
          </p>
          <a href="https://www.cadillacanz.com/nz-en/lyriq-electric-suv" target="_blank" rel="noopener noreferrer" style={styles.learnMore}>
            Explore all colours & options at Cadillac NZ →
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
          <h2 style={styles.sectionTitle}>Sport AWD Features</h2>
          <div style={styles.featureGrid}>
            {[
              '33" Curved Advanced LED Display',
              "AKG Studio 19-Speaker Audio",
              "Full Glass Panoramic Roof",
              "Nappa Leather Interior",
              "Tri-Zone Climate Control",
              "Ventilated & Massage Front Seats",
              "21\" Diamond Cut Alloy Wheels",
              "Super Cruise Driver Assistance",
            ].map((f) => (
              <div key={f} style={styles.featureItem}>
                <span style={styles.featureDot}>●</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CURRENT OFFER */}
        <div style={styles.offerBox}>
          <p style={styles.offerTitle}>🎯 Current New Zealand Offer</p>
          <p style={styles.offerText}>
            Pay zero GST — an automatic saving of approximately $16,000 on all current 2025 LYRIQ stock. Valid while stocks last. Est. delivery July 2026.
          </p>
          <a href="https://www.cadillacanz.com/nz-en/lyriq-electric-suv" target="_blank" rel="noopener noreferrer" style={styles.offerLink}>
            Configure & Order Online →
          </a>
        </div>

        {/* LEAD CAPTURE */}
        {!submitted ? (
          <div style={styles.leadSection}>
            {!showForm ? (
              <div style={styles.leadButtons}>
                <h2 style={styles.leadTitle}>Interested in the LYRIQ?</h2>
                <p style={styles.leadSub}>Speak with our team about pricing, test drives, and availability.</p>
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
                      <option value="purchase">Purchasing a LYRIQ</option>
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

        {/* FOOTER */}
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
  hero: { position: "relative", height: "70vw", maxHeight: 600, minHeight: 300, overflow: "hidden", background: "#111" },
  heroImg: { width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%", display: "block" },
  heroOverlay: { position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.75) 100%)" },
  heroBadge: { position: "absolute", top: 20, left: 20, background: "#111", border: "1px solid #D4AF37", padding: "6px 14px", borderRadius: 4 },
  heroBadgeText: { fontSize: 11, fontWeight: 700, color: "#D4AF37", letterSpacing: 2 },
  heroContent: { position: "absolute", bottom: 32, left: 0, right: 0, padding: "0 24px" },
  heroEyebrow: { fontSize: 12, letterSpacing: 4, color: "#D4AF37", margin: "0 0 8px", textTransform: "uppercase" },
  heroTitle: { fontSize: "clamp(48px, 10vw, 88px)", fontWeight: 900, color: "#fff", margin: "0 0 8px", lineHeight: 1, letterSpacing: 4 },
  heroSub: { fontSize: 16, color: "#ccc", margin: 0 },
  statsBar: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", background: "#111", borderBottom: "3px solid #D4AF37", padding: "20px 24px" },
  statItem: { textAlign: "center", borderRight: "1px solid #222" },
  statValue: { fontSize: "clamp(20px, 4vw, 32px)", fontWeight: 900, color: "#D4AF37", margin: "0 0 4px" },
  statLabel: { fontSize: 11, color: "#888", letterSpacing: 2, textTransform: "uppercase", margin: 0 },
  content: { maxWidth: 800, margin: "0 auto", padding: "0 24px" },
  section: { padding: "40px 0", borderBottom: "1px solid #1a1a1a" },
  sectionTitle: { fontSize: 24, fontWeight: 700, color: "#D4AF37", margin: "0 0 20px" },
  bodyText: { fontSize: 16, lineHeight: 1.8, color: "#ccc", marginBottom: 16 },
  learnMore: { display: "inline-block", color: "#CC0000", fontSize: 15, fontWeight: 700, textDecoration: "none", borderBottom: "2px solid #CC0000", paddingBottom: 2 },
  specsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#1a1a1a", border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden" },
  specItem: { background: "#111", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  specLabel: { fontSize: 13, color: "#888", margin: 0 },
  specValue: { fontSize: 15, fontWeight: 700, color: "#fff", margin: 0, textAlign: "right" },
  featureGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  featureItem: { display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#ccc" },
  featureDot: { color: "#D4AF37", fontSize: 8, flexShrink: 0 },
  offerBox: { margin: "32px 0", background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 12, padding: "24px" },
  offerTitle: { fontSize: 16, fontWeight: 700, color: "#D4AF37", margin: "0 0 10px" },
  offerText: { fontSize: 14, color: "#aaa", lineHeight: 1.7, margin: "0 0 16px" },
  offerLink: { display: "inline-block", color: "#CC0000", fontSize: 15, fontWeight: 700, textDecoration: "none", borderBottom: "2px solid #CC0000", paddingBottom: 2 },
  leadSection: { padding: "40px 0" },
  leadButtons: { textAlign: "center" },
  leadTitle: { fontSize: 24, fontWeight: 700, color: "#fff", margin: "0 0 10px" },
  leadSub: { fontSize: 15, color: "#888", margin: "0 0 28px" },
  leadBtn: { display: "block", width: "100%", background: "#CC0000", color: "#fff", border: "none", borderRadius: 10, padding: "18px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif", marginBottom: 12, textAlign: "center" },
  testDriveBtn: { display: "block", width: "100%", background: "transparent", color: "#D4AF37", border: "2px solid #D4AF37", borderRadius: 10, padding: "16px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif", textAlign: "center" },
  formWrap: {},
  form: { display: "flex", flexDirection: "column", gap: 16 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  fieldWrap: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 12, fontWeight: 700, color: "#D4AF37", letterSpacing: 1, textTransform: "uppercase" },
  input: { background: "#e8e8e8", border: "2px solid #ccc", borderRadius: 8, padding: "14px 16px", fontSize: 15, color: "#111", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "'Georgia', serif" },
  submitBtn: { background: "#CC0000", color: "#fff", border: "none", borderRadius: 10, padding: "18px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif", marginTop: 8 },
  thankYou: { textAlign: "center", padding: "60px 0" },
  thankYouIcon: { width: 64, height: 64, borderRadius: "50%", background: "#D4AF37", color: "#000", fontSize: 28, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" },
  thankYouTitle: { fontSize: 28, fontWeight: 900, color: "#fff", margin: "0 0 12px" },
  thankYouText: { fontSize: 16, color: "#888" },
  footer: { textAlign: "center", padding: "40px 0 48px", borderTop: "1px solid #1a1a1a", marginTop: 20 },
  footerDivider: { width: 48, height: 2, background: "#D4AF37", margin: "0 auto 24px", borderRadius: 2 },
  footerPowered: { fontSize: 12, color: "#555", margin: "0 0 10px", letterSpacing: 1 },
  footerLogo: { width: 120, height: "auto", opacity: 0.75, display: "block", margin: "0 auto 12px" },
  footerSub: { fontSize: 12, color: "#444", margin: 0 },
};

const css = `
  .lead-btn:hover { background: #aa0000 !important; }
  .test-btn:hover { background: rgba(212,175,55,0.1) !important; }
  .form-input:focus { border-color: #D4AF37 !important; box-shadow: 0 0 0 3px rgba(212,175,55,0.15) !important; background: #fff !important; }
  @media (max-width: 600px) {
    .grid2 { grid-template-columns: 1fr !important; }
  }
`;
