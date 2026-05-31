// © 2026 LINQR — linqr.global — All Rights Reserved
import PortalAddProperty from './PortalAddProperty';
import { useState, useEffect, useRef } from "react";
import PortalLogin from "./PortalLogin.jsx";
import PortalDashboard from "./PortalDashboard.jsx";
import PortalAddVehicle from "./PortalAddVehicle.jsx";

export default function Portal() {
  const [dealer, setDealer] = useState(null);
  const [view, setView] = useState("dashboard");
  const [editListing, setEditListing] = useState(null);
  const [successListing, setSuccessListing] = useState(null);
  const qrRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("linqr_dealer");
    if (saved) setDealer(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (view === "success" && successListing && qrRef.current) {
      qrRef.current.innerHTML = "";
      const url = `https://linqr.global/${successListing.slug}`;
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
      script.onload = () => {
        new window.QRCode(qrRef.current, {
          text: url,
          width: 260,
          height: 260,
          colorDark: isRayWhite ? "#000000" : "#1B6157",
          colorLight: "#ffffff",
          correctLevel: window.QRCode.CorrectLevel.H,
        });
      };
      document.head.appendChild(script);
    }
  }, [view, successListing]);

  function handleLogin(d) { setDealer(d); setView("dashboard"); }
  function handleLogout() { localStorage.removeItem("linqr_dealer"); setDealer(null); }
  function handleAddNew() { setEditListing(null); setView("add"); }
  function handleAddProperty() { setEditListing(null); setView("add-property"); }
  function handleEdit(listing) {
    setEditListing(listing);
    setView(listing.listing_type === 'property' ? "add-property" : "add");
  }
  function handleSuccess(listing) { setSuccessListing(listing); setView("success"); }
  function handlePrint() { window.print(); }

  if (!dealer) return <PortalLogin onLogin={handleLogin} />;

  const isRayWhite = dealer?.brand_colour === '#FFCD00';

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

    // What to show on the QR card
    const qrLine1 = isProperty ? successListing.address : `${successListing.year || ''} ${successListing.make} ${successListing.model}`;
    const qrLine2 = isProperty ? (successListing.suburb || '') : '';
    const qrLine3 = isProperty ? `ID: ${successListing.propertyId || successListing.property_id || ''}` : `Stock #${successListing.stock_number}`;

    // Branding
    const headerBg = isRayWhite ? '#FFCD00' : '#1B6157';
    const headerTextColour = isRayWhite ? '#000' : '#fff';
    const accentColour = isRayWhite ? '#000' : '#1B6157';
    const urlBoxBg = isRayWhite ? '#FFFBEA' : '#f0faf7';
    const urlBoxBorder = isRayWhite ? '#FFCD00' : '#1B6157';
    const printBtnBg = isRayWhite ? '#FFCD00' : '#1B6157';
    const printBtnColour = isRayWhite ? '#000' : '#fff';
    const dashBtnBorder = isRayWhite ? '#FFCD00' : '#1B6157';
    const dashBtnColour = isRayWhite ? '#000' : '#1B6157';
    const qrDividerColour = isRayWhite ? '#FFCD00' : '#1B6157';

    return (
      <div style={s.outer}>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #qr-print-card, #qr-print-card * { visibility: visible; }
            #qr-print-card { position: fixed; top: 0; left: 0; width: 100%; display: flex; justify-content: center; align-items: center; height: 100vh; }
          }
        `}</style>

        <div style={s.successPage}>

          {/* HEADER */}
          <div style={{ ...s.successHeader, background: headerBg }}>
            {isRayWhite
              ? <div style={{ fontWeight: 900, fontSize: 22, color: '#000', letterSpacing: 1 }}>RAY WHITE</div>
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
              style={{ ...s.viewBtn, background: accentColour, color: isRayWhite ? '#fff' : '#fff' }}>
              View Live Page →
            </a>
          </div>

          {/* QR SECTION */}
          <div style={s.qrSection}>
            <h3 style={s.qrSectionTitle}>Your LINQR QR Code</h3>
            <p style={s.qrSectionSub}>Print and attach to the {isProperty ? 'property' : 'vehicle'}</p>

            <div id="qr-print-card" style={s.qrCard}>
              <div style={s.qrWrapper}>
                <div ref={qrRef} style={s.qrCode} />
                <div style={{ ...s.qrLogoOverlay, background: accentColour }}>
                  <img src="/LINQR-logo.png" alt="LINQR" style={s.qrLogoImg} />
                </div>
              </div>
              <div style={{ ...s.qrDivider, background: qrDividerColour }} />
              <p style={s.qrDealerName}>{dealer.name}</p>
              <p style={s.qrModelName}>{qrLine1}</p>
              {qrLine2 && <p style={s.qrModelName}>{qrLine2}</p>}
              <p style={s.qrStockNum}>{qrLine3}</p>
              <p style={s.qrCopyright}>© LINQR 2026 · linqr.global</p>
            </div>

            <div style={s.qrActions}>
              <button style={{ ...s.printBtn, background: printBtnBg, color: printBtnColour }} onClick={handlePrint}>
                🖨️ Print QR Code
              </button>
            </div>
          </div>

          {/* BOTTOM NAVIGATION */}
          <div style={s.bottomActions}>
            <button style={{ ...s.dashBtn, border: `2px solid ${dashBtnBorder}`, color: dashBtnColour }} onClick={() => setView("dashboard")}>
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

  qrSection: { background: "#fff", margin: "16px 16px 0", padding: "28px 24px", textAlign: "center" },
  qrSectionTitle: { fontSize: 18, fontWeight: 700, color: "#111", margin: "0 0 4px", fontFamily: "Georgia, serif" },
  qrSectionSub: { fontSize: 13, color: "#888", margin: "0 0 24px" },

  qrCard: { display: "inline-block", background: "#fff", border: "2px solid #e0e0e0", borderRadius: 16, padding: "24px 28px 20px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
  qrWrapper: { position: "relative", display: "inline-block", marginBottom: 16 },
  qrCode: { display: "block" },
  qrLogoOverlay: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", borderRadius: 8, padding: "6px 10px", border: "3px solid #fff" },
  qrLogoImg: { height: 22, width: "auto", display: "block" },

  qrDivider: { width: "100%", height: 2, margin: "0 0 14px", borderRadius: 1 },
  qrDealerName: { fontSize: 15, fontWeight: 900, color: "#111", margin: "0 0 4px", fontFamily: "Georgia, serif", letterSpacing: 0.5 },
  qrModelName: { fontSize: 13, fontWeight: 700, color: "#444", margin: "0 0 4px", fontFamily: "Georgia, serif" },
  qrStockNum: { fontSize: 12, color: "#888", margin: "0 0 10px", fontFamily: "Georgia, serif" },
  qrCopyright: { fontSize: 10, color: "#bbb", margin: 0, letterSpacing: 1 },

  qrActions: { marginTop: 20, display: "flex", gap: 12, justifyContent: "center" },
  printBtn: { border: "none", borderRadius: 8, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" },

  bottomActions: { display: "flex", gap: 12, margin: "16px 16px 0", flexDirection: "column" },
  dashBtn: { background: "#fff", borderRadius: 8, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" },
  addAnotherBtn: { background: "#f5f5f5", color: "#666", border: "none", borderRadius: 8, padding: "14px", fontSize: 15, cursor: "pointer", fontFamily: "Georgia, serif" },

  footer: { textAlign: "center", padding: 24 },
  footerText: { fontSize: 11, color: "#bbb", margin: 0 },
};
