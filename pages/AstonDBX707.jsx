import { useState } from "react";

export default function AstonDBX707() {
  const [showSaveInfo, setShowSaveInfo] = useState(false);
  const [formData, setFormData] = useState({ name: "", mobile: "", email: "" });
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
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

        {/* ASTON MARTIN HEADER */}
        <div style={styles.amHeader}>
          <img src="/aston-logo-black.png" alt="Aston Martin" style={styles.amLogo} />
          <p style={styles.amDealer}>Auckland · 119 Great North Road, Grey Lynn</p>
        </div>

        {/* HERO */}
        <div style={styles.hero}>
          <img src="/DBX707.JPG" alt="Aston Martin DBX707" style={styles.heroImg} />
          <div style={styles.heroOverlay} />
          <div style={styles.heroContent}>
            <p style={styles.heroEyebrow}>2023 · PRE-OWNED</p>
            <h1 style={styles.heroTitle}>DBX 707</h1>
            <p style={styles.heroSub}>Golden Saffron · The World's Most Powerful Luxury SUV</p>
          </div>
        </div>

        {/* HEADLINE STATS */}
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

          {/* DESCRIPTION */}
          <div style={styles.section}>
            <p style={styles.bodyText}>
              Supreme confidence, whatever the terrain. This stunning Golden Saffron DBX707 combines the presence of an Aston Martin with the performance of a supercar — all in the space and practicality of a luxury SUV. Highly optioned with 23" textured black alloy wheels, black brake calipers, privacy glass, and premium audio. The 4.0 litre twin-turbo V8 produces 697 bhp and 900Nm of torque — making this the world's most powerful luxury SUV.
            </p>
            <p style={styles.bodyText}>
              First registered September 2023, 15,400km. Presented in exceptional condition at Aston Martin Auckland.
            </p>
          </div>

          {/* SPECS */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Key Details</h2>
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
            <h2 style={styles.sectionTitle}>Custom Features</h2>
            <div style={styles.featureGrid}>
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

          {/* ACTION BUTTONS */}
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

          {/* SAVE TO PHONE */}
          <div style={styles.saveSection}>
            <button style={styles.saveBtn} onClick={() => setShowSaveInfo(!showSaveInfo)} className="save-btn">
              📱 Save This Page to Your Phone
            </button>
            {showSaveInfo && (
              <div style={styles.saveInfo}>
                <p style={styles.saveInfoTitle}>How to save:</p>
                <p style={styles.saveInfoText}>
                  <strong>iPhone (Safari):</strong> Tap the Share button ↑ then "Add to Home Screen"
                </p>
                <p style={styles.saveInfoText}>
                  <strong>Android (Chrome):</strong> Tap the menu ⋮ then "Add to Home Screen"
                </p>
                <p style={styles.saveInfoText}>
                  The page will appear as an app icon on your phone — tap it anytime to come back.
                </p>
              </div>
            )}
          </div>

          {/* DEALER INFO */}
          <div style={styles.dealerBox}>
            <img src="/aston-logo-black.png" alt="Aston Martin" style={styles.dealerLogoSmall} />
            <p style={styles.dealerName}>Aston Martin Auckland</p>
            <p style={styles.dealerAddress}>119 Great North Road, Grey Lynn, Auckland 1021</p>
            <a href="tel:+6499758080" style={styles.dealerPhone}>+64 9 975 8080</a>
          </div>

          {/* FOOTER */}
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
  pageOuter: { minHeight: "100vh", background: "#B8780A", padding: "16px", display: "flex", justifyContent: "center", alignItems: "flex-start" },
  page: { width: "100%", maxWidth: 820, background: "#fff", fontFamily: "'Georgia', serif", color: "#111", borderRadius: 12, overflow: "hidden", boxShadow: "0 8px 48px rgba(0,0,0,0.15)" },

  // Aston Martin header - clean white with their branding
  amHeader: { background: "#fff", borderBottom: "1px solid #e0e0e0", padding: "20px 24px", textAlign: "center" },
  amLogo: { height: 40, width: "auto", margin: "0 auto 8px", display: "block" },
  amDealer: { fontSize: 12, color: "#888", letterSpacing: 1, margin: 0 },

  // Hero
  hero: { position: "relative", height: "70vw", maxHeight: 520, minHeight: 260, overflow: "hidden", background: "#f0f0f0" },
  heroImg: { width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 50%", display: "block" },
  heroOverlay: { position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.8) 100%)" },
  heroContent: { position: "absolute", bottom: 24, left: 0, right: 0, padding: "0 24px" },
  heroEyebrow: { fontSize: 11, letterSpacing: 3, color: "#D4AF37", margin: "0 0 8px", textTransform: "uppercase" },
  heroTitle: { fontSize: "clamp(40px, 9vw, 80px)", fontWeight: 900, color: "#fff", margin: "0 0 8px", lineHeight: 1, letterSpacing: 2 },
  heroSub: { fontSize: 14, color: "#ddd", margin: 0 },

  // Stats bar - Aston Martin green
  statsBar: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", background: "#1B6157", padding: "20px 16px" },
  statItem: { textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.2)" },
  statValue: { fontSize: "clamp(18px, 4vw, 30px)", fontWeight: 900, color: "#fff", margin: "0 0 4px" },
  statLabel: { fontSize: 10, color: "rgba(255,255,255,0.8)", letterSpacing: 2, textTransform: "uppercase", margin: 0 },

  // Content
  content: { padding: "0 24px" },
  section: { padding: "32px 0", borderBottom: "1px solid #f0f0f0" },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: "#1B6157", margin: "0 0 20px", letterSpacing: 1, textTransform: "uppercase" },
  bodyText: { fontSize: 15, lineHeight: 1.8, color: "#444", marginBottom: 16 },

  // Specs
  specsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#f0f0f0", border: "1px solid #f0f0f0", borderRadius: 8, overflow: "hidden" },
  specItem: { background: "#fff", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  specLabel: { fontSize: 12, color: "#888", margin: 0 },
  specValue: { fontSize: 14, fontWeight: 700, color: "#111", margin: 0, textAlign: "right" },

  // Features
  featureGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  featureItem: { display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#444", lineHeight: 1.4 },
  featureDot: { color: "#1B6157", fontSize: 8, flexShrink: 0, marginTop: 4 },

  // Action buttons
  actionSection: { padding: "32px 0", display: "flex", flexDirection: "column", gap: 12 },
  primaryBtn: { display: "block", background: "#1B6157", color: "#fff", borderRadius: 8, padding: "18px 24px", fontSize: 16, fontWeight: 700, textAlign: "center", textDecoration: "none", fontFamily: "'Georgia', serif" },
  secondaryBtn: { display: "block", background: "transparent", color: "#1B6157", border: "2px solid #1B6157", borderRadius: 8, padding: "16px 24px", fontSize: 15, fontWeight: 700, textAlign: "center", textDecoration: "none", fontFamily: "'Georgia', serif" },
  ghostBtn: { display: "block", color: "#888", fontSize: 13, textAlign: "center", textDecoration: "none", padding: "8px 0" },

  // Save to phone
  saveSection: { paddingBottom: 24 },
  saveBtn: { width: "100%", background: "#f5f5f5", border: "2px solid #ddd", borderRadius: 8, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif", color: "#444" },
  saveInfo: { background: "#f9f9f9", border: "1px solid #e0e0e0", borderRadius: 8, padding: "16px", marginTop: 12 },
  saveInfoTitle: { fontSize: 13, fontWeight: 700, color: "#1B6157", margin: "0 0 10px" },
  saveInfoText: { fontSize: 13, color: "#666", lineHeight: 1.6, margin: "0 0 8px" },

  // Dealer box
  dealerBox: { background: "#f9f9f9", border: "1px solid #e0e0e0", borderRadius: 10, padding: "24px", textAlign: "center", marginBottom: 24 },
  dealerLogoSmall: { height: 30, width: "auto", margin: "0 auto 12px", display: "block" },
  dealerName: { fontSize: 16, fontWeight: 700, color: "#111", margin: "0 0 6px" },
  dealerAddress: { fontSize: 13, color: "#888", margin: "0 0 10px" },
  dealerPhone: { fontSize: 15, fontWeight: 700, color: "#1B6157", textDecoration: "none", display: "block" },

  // Footer
  footer: { textAlign: "center", padding: "24px 0 40px" },
  footerDivider: { width: 40, height: 2, background: "#1B6157", margin: "0 auto 20px", borderRadius: 2 },
  footerPowered: { fontSize: 11, color: "#aaa", margin: "0 0 8px", letterSpacing: 1 },
  footerLogo: { width: 100, height: "auto", opacity: 0.6, display: "block", margin: "0 auto" },
};

const css = `
  .primary-btn:hover { background: #144d43 !important; }
  .secondary-btn:hover { background: #1B6157 !important; color: #fff !important; }
  .save-btn:hover { border-color: #1B6157 !important; color: #1B6157 !important; }
  .ghost-btn:hover { color: #1B6157 !important; }
  @media (max-width: 600px) {
    .feature-grid { grid-template-columns: 1fr !important; }
    .specs-grid { grid-template-columns: 1fr !important; }
  }
`;
