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
    if (view === "success" && successListing?.published && qrRef.current) {
      qrRef.current.innerHTML = "";
      const url = `https://linqr.global/${successListing.slug}`;
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
      script.onload = () => {
        new window.QRCode(qrRef.current, {
          text: url,
          width: 260,
          height: 260,
          colorDark: "#1B6157",
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
  function handleEdit(listing) { setEditListing(listing); setView("add"); }
  function handleSuccess(listing, published) { setSuccessListing({ ...listing, published }); setView("success"); }

  function handlePrint() {
    window.print();
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

  if (view === "success" && successListing) {
    const dealerName = dealer.name;
    const modelName = `${successListing.year} ${successListing.make} ${successListing.model}`;
    const stockNum = successListing.stock_number;
    const liveUrl = `linqr.global/${successListing.slug}`;

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

          {/* TOP ACTIONS */}
          <div style={s.successHeader}>
            <img src="/LINQR-logo.png" alt="LINQR" style={s.logo} />
          </div>

          <div style={s.successBody}>
            <p style={s.successEmoji}>🚀</p>
            <h2 style={s.successTitle}>You're Live!</h2>
            <p style={s.successSub}>Your listing is now live at:</p>
            <div style={s.urlBox}>
              <p style={s.urlText}>{liveUrl}</p>
            </div>
            <a href={`https://${liveUrl}`} target="_blank" rel="noopener noreferrer" style={s.viewBtn}>
              View Live Page →
            </a>
          </div>

          {/* QR CARD */}
          <div style={s.qrSection}>
            <h3 style={s.qrSectionTitle}>Your LINQR QR Code</h3>
            <p style={s.qrSectionSub}>Print and attach to the vehicle</p>

            <div id="qr-print-card" style={s.qrCard}>

              {/* QR CODE with LINQR overlay */}
              <div style={s.qrWrapper}>
                <div ref={qrRef} style={s.qrCode} />
                {/* LINQR logo overlay in centre */}
                <div style={s.qrLogoOverlay}>
                  <img src="/LINQR-logo.png" alt="LINQR" style={s.qrLogoImg} />
                </div>
              </div>

              {/* DIVIDER */}
              <div style={s.qrDivider} />

              {/* DEALER & VEHICLE INFO */}
              <p style={s.qrDealerName}>{dealerName}</p>
              <p style={s.qrModelName}>{successListing.make} {successListing.model}</p>
              <p style={s.qrStockNum}>Stock #{stockNum}</p>
              <p style={s.qrCopyright}>© LINQR 2026 · linqr.global</p>

            </div>

            {/* PRINT & DOWNLOAD BUTTONS */}
            <div style={s.qrActions}>
              <button style={s.printBtn} onClick={handlePrint}>
                🖨️ Print QR Code
              </button>
            </div>
          </div>

          {/* BOTTOM NAVIGATION */}
          <div style={s.bottomActions}>
            <button style={s.dashBtn} onClick={() => setView("dashboard")}>
              ← Back to Dashboard
            </button>
            <button style={s.addAnotherBtn} onClick={handleAddNew}>
              + Add Another Vehicle
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
      onEdit={handleEdit}
    />
  );
}

const s = {
  outer: { minHeight: "100vh", background: "#f5f5f5" },
  successPage: { maxWidth: 520, margin: "0 auto", paddingBottom: 60 },

  successHeader: { background: "#1B6157", padding: "16px 24px", display: "flex", justifyContent: "center" },
  logo: { height: 36, width: "auto" },

  successBody: { background: "#fff", margin: "0 16px", padding: "32px 24px", textAlign: "center", borderBottom: "1px solid #f0f0f0" },
  successEmoji: { fontSize: 48, margin: "0 0 12px" },
  successTitle: { fontSize: 28, fontWeight: 900, color: "#111", margin: "0 0 8px", fontFamily: "Georgia, serif" },
  successSub: { fontSize: 14, color: "#888", margin: "0 0 16px" },
  urlBox: { background: "#f0faf7", border: "2px solid #1B6157", borderRadius: 8, padding: "12px 20px", marginBottom: 16, display: "inline-block" },
  urlText: { fontSize: 15, fontWeight: 700, color: "#1B6157", margin: 0, fontFamily: "Georgia, serif" },
  viewBtn: { display: "inline-block", background: "#1B6157", color: "#fff", borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 700, textDecoration: "none", fontFamily: "Georgia, serif" },

  // QR SECTION
  qrSection: { background: "#fff", margin: "16px 16px 0", padding: "28px 24px", borderRadius: 0, textAlign: "center" },
  qrSectionTitle: { fontSize: 18, fontWeight: 700, color: "#111", margin: "0 0 4px", fontFamily: "Georgia, serif" },
  qrSectionSub: { fontSize: 13, color: "#888", margin: "0 0 24px" },

  // THE QR CARD — this is what gets printed
  qrCard: { display: "inline-block", background: "#fff", border: "2px solid #e0e0e0", borderRadius: 16, padding: "24px 28px 20px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },

  qrWrapper: { position: "relative", display: "inline-block", marginBottom: 16 },
  qrCode: { display: "block" },
  qrLogoOverlay: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "#1B6157", borderRadius: 8, padding: "6px 10px", border: "3px solid #fff" },
  qrLogoImg: { height: 22, width: "auto", display: "block" },

  qrDivider: { width: "100%", height: 2, background: "#1B6157", margin: "0 0 14px", borderRadius: 1 },
  qrDealerName: { fontSize: 15, fontWeight: 900, color: "#111", margin: "0 0 4px", fontFamily: "Georgia, serif", letterSpacing: 0.5 },
  qrModelName: { fontSize: 13, fontWeight: 700, color: "#444", margin: "0 0 4px", fontFamily: "Georgia, serif" },
  qrStockNum: { fontSize: 12, color: "#888", margin: "0 0 10px", fontFamily: "Georgia, serif" },
  qrCopyright: { fontSize: 10, color: "#bbb", margin: 0, letterSpacing: 1 },

  qrActions: { marginTop: 20, display: "flex", gap: 12, justifyContent: "center" },
  printBtn: { background: "#1B6157", color: "#fff", border: "none", borderRadius: 8, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" },

  bottomActions: { display: "flex", gap: 12, margin: "16px 16px 0", flexDirection: "column" },
  dashBtn: { background: "#fff", color: "#1B6157", border: "2px solid #1B6157", borderRadius: 8, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" },
  addAnotherBtn: { background: "#f5f5f5", color: "#666", border: "none", borderRadius: 8, padding: "14px", fontSize: 15, cursor: "pointer", fontFamily: "Georgia, serif" },

  footer: { textAlign: "center", padding: 24 },
  footerText: { fontSize: 11, color: "#bbb", margin: 0 },
};
