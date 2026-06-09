// © 2026 LINQR — linqr.global — All Rights Reserved
import PortalAddProperty from './PortalAddProperty';
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
  function handleAddProperty() { setEditListing(null); setView("add-property"); }
  function handleEdit(listing) {
    setEditListing(listing);
    setView(listing.listing_type === 'property' ? "add-property" : "add");
  }
  function handleSuccess(listing) { setSuccessListing(listing); setView("success"); }

  if (!dealer) return <PortalLogin onLogin={handleLogin} />;

  const isRayWhite = dealer?.brand_colour === '#FFCD00';
  const brandColour = dealer?.brand_colour || '#1B6157';
  const headerTextColour = isRayWhite ? '#000' : '#fff';
  const accentColour = brandColour;

  if (view === "add") return (
    <PortalAddVehicle
      dealer={dealer}
      onBack={() => setView("dashboard")}
      onSuccess={handleSuccess}
      editListing={editListing}
    />
  );

  if (view === "add-property") return (
    <PortalAddProperty
      dealer={dealer}
      onBack={() => setView("dashboard")}
      onSuccess={handleSuccess}
      editListing={editListing}
    />
  );

  if (view === "success" && successListing) {
    const liveUrl = `linqr.global/${successListing.slug}`;
    const isProperty = successListing.listing_type === 'property' || successListing.address;
    const urlBoxBg = isRayWhite ? '#FFFBEA' : '#f0faf7';
    const urlBoxBorder = isRayWhite ? '#FFCD00' : '#1B6157';
    const dashBtnBorder = isRayWhite ? '#FFCD00' : '#1B6157';
    const dashBtnColour = isRayWhite ? '#000' : '#1B6157';

    return (
      <div style={s.outer}>
        <div style={s.successPage}>

          {/* HEADER */}
          <div style={{ ...s.successHeader, background: brandColour }}>
            {isRayWhite
              ? <div style={{ fontWeight: 900, fontSize: 22, color: '#000', letterSpacing: 1 }}>RAY WHITE</div>
              : dealer?.logo_url
                ? <img src={dealer.logo_url} alt={dealer.name} style={{ height: 36, width: 'auto' }} />
                : <img src="/LINQR-logo.png" alt="LINQR" style={s.logo} />
            }
          </div>

          {/* SUCCESS BODY */}
          <div style={s.successBody}>
            <p style={s.successEmoji}>🚀</p>
            <h2 style={s.successTitle}>You're Live!</h2>
            <p style={s.successSub}>Your {isProperty ? 'property' : 'listing'} is now live at:</p>
            <div style={{ ...s.urlBox, background: urlBoxBg, border: `2px solid ${urlBoxBorder}` }}>
              <p style={{ ...s.urlText, color: accentColour }}>{liveUrl}</p>
            </div>
            <a href={`https://${liveUrl}`} target="_blank" rel="noopener noreferrer"
              style={{ ...s.viewBtn, background: accentColour, color: '#fff' }}>
              View Live Page →
            </a>
          </div>

          {/* PRINT PROMPT — replaces QR section */}
          <div style={s.printPrompt}>
            <p style={s.printPromptIcon}>🏷️</p>
            <p style={s.printPromptTitle}>Ready to print your label?</p>
            <p style={s.printPromptSub}>
              Head back to the dashboard to print your QR label in standard (8-up) or large (4-up) format.
            </p>
          </div>

          {/* BOTTOM NAVIGATION */}
          <div style={s.bottomActions}>
            <button
              style={{ ...s.dashBtn, border: `2px solid ${dashBtnBorder}`, color: dashBtnColour }}
              onClick={() => setView("dashboard")}>
              ← Back to Dashboard
            </button>
            <button style={s.addAnotherBtn} onClick={isProperty ? handleAddProperty : handleAddNew}>
              + Add Another {isProperty ? 'Property' : 'Vehicle'}
            </button>
          </div>

          <div style={s.footer}>
            <p style={s.footerText}>© LINQR 2026 · linqr.global</p>
          </div>

        </div>
      </div>
    );
  }

  return (
    <PortalDashboard
      dealer={dealer}
      onLogout={handleLogout}
      onAddNew={handleAddNew}
      onAddProperty={handleAddProperty}
      onEdit={handleEdit}
    />
  );
}

const s = {
  outer: { minHeight: "100vh", background: "#f5f5f5" },
  successPage: { maxWidth: 520, margin: "0 auto", paddingBottom: 60 },

  successHeader: { padding: "16px 24px", display: "flex", justifyContent: "center" },
  logo: { height: 36, width: "auto" },

  successBody: { background: "#fff", margin: "0 16px", padding: "32px 24px", textAlign: "center", borderBottom: "1px solid #f0f0f0" },
  successEmoji: { fontSize: 48, margin: "0 0 12px" },
  successTitle: { fontSize: 28, fontWeight: 900, color: "#111", margin: "0 0 8px", fontFamily: "Georgia, serif" },
  successSub: { fontSize: 14, color: "#888", margin: "0 0 16px" },
  urlBox: { borderRadius: 8, padding: "12px 20px", marginBottom: 16, display: "inline-block" },
  urlText: { fontSize: 15, fontWeight: 700, margin: 0, fontFamily: "Georgia, serif" },
  viewBtn: { display: "inline-block", borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 700, textDecoration: "none", fontFamily: "Georgia, serif" },

  printPrompt: { background: "#fff", margin: "16px 16px 0", padding: "28px 24px", textAlign: "center", borderRadius: 12, border: "2px dashed #e5e7eb" },
  printPromptIcon: { fontSize: 36, margin: "0 0 10px" },
  printPromptTitle: { fontSize: 17, fontWeight: 700, color: "#111", margin: "0 0 8px", fontFamily: "Georgia, serif" },
  printPromptSub: { fontSize: 14, color: "#888", margin: 0, lineHeight: 1.6, fontFamily: "Georgia, serif" },

  bottomActions: { display: "flex", gap: 12, margin: "16px 16px 0", flexDirection: "column" },
  dashBtn: { background: "#fff", borderRadius: 8, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" },
  addAnotherBtn: { background: "#f5f5f5", color: "#666", border: "none", borderRadius: 8, padding: "14px", fontSize: 15, cursor: "pointer", fontFamily: "Georgia, serif" },

  footer: { textAlign: "center", padding: 24 },
  footerText: { fontSize: 11, color: "#bbb", margin: 0 },
};
