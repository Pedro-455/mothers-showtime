// © 2026 LINQR — linqr.global — All Rights Reserved
import { useState, useEffect } from "react";
import PortalLogin from "./PortalLogin.jsx";
import PortalDashboard from "./PortalDashboard.jsx";
import PortalAddVehicle from "./PortalAddVehicle.jsx";

export default function Portal() {
  const [dealer, setDealer] = useState(null);
  const [view, setView] = useState("dashboard");
  const [editListing, setEditListing] = useState(null);
  const [successListing, setSuccessListing] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("linqr_dealer");
    if (saved) setDealer(JSON.parse(saved));
  }, []);

  function handleLogin(d) { setDealer(d); setView("dashboard"); }
  function handleLogout() { localStorage.removeItem("linqr_dealer"); setDealer(null); }
  function handleAddNew() { setEditListing(null); setView("add"); }
  function handleEdit(listing) { setEditListing(listing); setView("add"); }

  function handleSuccess(listing, published) {
    setSuccessListing({ ...listing, published });
    setView("success");
  }

  if (!dealer) return <PortalLogin onLogin={handleLogin} />;

  if (view === "add") return (
    <PortalAddVehicle
      dealer={dealer}
      onBack={() => setView("dashboard")}
      onSuccess={handleSuccess}
      editListing={editListing}
    />
  );

  if (view === "success") return (
    <div style={styles.outer}>
      <div style={styles.card}>
        <div style={styles.header}>
          <img src="/LINQR-logo.png" alt="LINQR" style={styles.logo} />
        </div>
        <div style={styles.successContent}>
          <p style={styles.successIcon}>{successListing?.published ? "🚀" : "📝"}</p>
          <h2 style={styles.successTitle}>
            {successListing?.published ? "You're Live!" : "Saved as Draft"}
          </h2>
          <p style={styles.successSub}>
            {successListing?.published
              ? `Your listing is now live at:`
              : `Your listing has been saved. Publish when ready.`}
          </p>
          {successListing?.published && (
            <>
              <div style={styles.urlBox}>
                <p style={styles.urlText}>linqr.global/{successListing?.slug}</p>
              </div>
              <a
                href={`https://linqr.global/${successListing?.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.viewBtn}
              >
                View Live Page →
              </a>
            </>
          )}
          <button style={styles.dashBtn} onClick={() => setView("dashboard")}>
            ← Back to Dashboard
          </button>
          <button style={styles.addAnotherBtn} onClick={handleAddNew}>
            + Add Another Vehicle
          </button>
        </div>
        <div style={styles.footer}>
          <p style={styles.footerText}>© LINQR 2026 · linqr.global</p>
        </div>
      </div>
    </div>
  );

  return (
    <PortalDashboard
      dealer={dealer}
      onLogout={handleLogout}
      onAddNew={handleAddNew}
      onEdit={handleEdit}
    />
  );
}

const styles = {
  outer: { minHeight: "100vh", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  card: { width: "100%", maxWidth: 500, background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 48px rgba(0,0,0,0.12)" },
  header: { background: "#1B6157", padding: "24px", textAlign: "center" },
  logo: { height: 40, width: "auto", display: "block", margin: "0 auto" },
  successContent: { padding: "40px 40px 24px", textAlign: "center" },
  successIcon: { fontSize: 56, margin: "0 0 16px" },
  successTitle: { fontSize: 28, fontWeight: 900, color: "#111", margin: "0 0 8px", fontFamily: "Georgia, serif" },
  successSub: { fontSize: 15, color: "#666", margin: "0 0 24px" },
  urlBox: { background: "#f0faf7", border: "2px solid #1B6157", borderRadius: 8, padding: "16px", marginBottom: 16 },
  urlText: { fontSize: 16, fontWeight: 700, color: "#1B6157", margin: 0, fontFamily: "Georgia, serif" },
  viewBtn: { display: "block", background: "#1B6157", color: "#fff", borderRadius: 8, padding: "16px 24px", fontSize: 16, fontWeight: 700, textAlign: "center", textDecoration: "none", fontFamily: "Georgia, serif", marginBottom: 12 },
  dashBtn: { display: "block", width: "100%", background: "transparent", color: "#1B6157", border: "2px solid #1B6157", borderRadius: 8, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif", marginBottom: 12 },
  addAnotherBtn: { display: "block", width: "100%", background: "#f5f5f5", color: "#666", border: "none", borderRadius: 8, padding: "14px", fontSize: 15, cursor: "pointer", fontFamily: "Georgia, serif" },
  footer: { background: "#f9f9f9", padding: 16, textAlign: "center", borderTop: "1px solid #eee" },
  footerText: { fontSize: 11, color: "#bbb", margin: 0 },
};
