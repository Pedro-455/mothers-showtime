import { useState } from "react";
import { supabase } from "../supabaseClient";

const PINS = ["2746"];
const EXPORT_PIN = "3500";
const SHOW_ID = "637da564-ed16-4d81-ac33-5652ceda1f89";

export default function Dashboard() {
  const [pin, setPin] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, photos: 0 });

  function handlePinSubmit() {
    if (PINS.includes(pin)) {
      setLoggedIn(true);
      setPinError(false);
      loadEntries();
    } else {
      setPinError(true);
      setPin("");
    }
  }

  async function loadEntries() {
    setLoading(true);
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("show_id", SHOW_ID)
      .order("judging_number", { ascending: true });

    if (error) { console.error(error); setLoading(false); return; }

    const cars = data || [];
    setEntries(cars);

    const total = cars.length;
    const approved = cars.filter(c => c.status === "approved").length;
    const rejected = cars.filter(c => c.status === "rejected").length;
    const pending = cars.filter(c => c.status === "pending").length;
    const photos = cars.reduce((acc, c) => {
      const urls = typeof c.photo_urls === "string" ? JSON.parse(c.photo_urls || "[]") : (c.photo_urls || []);
      return acc + (urls.length > 0 ? urls.length : c.photo_url ? 1 : 0);
    }, 0);
    setStats({ total, approved, rejected, pending, photos });
    setLoading(false);
  }

  async function updateStatus(carId, status) {
    await supabase.from("cars").update({ status }).eq("id", carId);
    loadEntries();
  }

  async function deleteEntry(carId) {
    if (!window.confirm("Delete this entry? This cannot be undone.")) return;
    await supabase.from("cars").delete().eq("id", carId);
    loadEntries();
  }

  function exportCSV() {
    const exportPin = window.prompt("Enter export PIN:");
    if (exportPin !== EXPORT_PIN) {
      alert("Incorrect PIN — export cancelled.");
      return;
    }
    const headers = ["Car #","Name","Email","Phone","Year","Make","Model","Colour","Engine","Transmission","Status","Photos"];
    const rows = entries.map(car => {
      const urls = typeof car.photo_urls === "string" ? JSON.parse(car.photo_urls || "[]") : (car.photo_urls || []);
      const photoCount = urls.length > 0 ? urls.length : car.photo_url ? 1 : 0;
      return [
        car.judging_number || "",
        car.entrant_name || car.owner_name || "",
        car.registration_email || "",
        car.registration_phone || "",
        car.year || "",
        car.make || "",
        car.model || "",
        car.color || "",
        car.engine || "",
        car.transmission || "",
        car.status || "",
        photoCount,
      ].map(v => JSON.stringify(String(v))).join(",");
    });
    const csvContent = headers.join(",") + "\r\n" + rows.join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Chrome26-Entries.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── PIN SCREEN ──
  if (!loggedIn) {
    return (
      <div style={styles.pinPage}>
        <style>{css}</style>
        <div style={styles.pinCard}>
          <div style={styles.pinLogo}>M</div>
          <h1 style={styles.pinTitle}>Mothers Showtime</h1>
          <p style={styles.pinSub}>Dashboard Access</p>
          <div style={styles.pinDivider} />
          <p style={styles.pinLabel}>Enter your 4-digit PIN</p>
          <input
            style={{ ...styles.pinInput, ...(pinError ? styles.pinInputError : {}) }}
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => { setPin(e.target.value); setPinError(false); }}
            onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
            placeholder="••••"
            className="pin-input"
            autoFocus
          />
          {pinError && <p style={styles.pinError}>Incorrect PIN — try again</p>}
          <button style={styles.pinBtn} onClick={handlePinSubmit} className="red-btn">
            Access Dashboard
          </button>
          <p style={styles.pinFooter}>Your PIN is the last 4 digits of your mobile number</p>
        </div>
      </div>
    );
  }

  // ── PHOTO / DETAIL VIEWER ──
  if (selectedEntry) {
    const rawUrls = selectedEntry.photo_urls;
    const photos = rawUrls
      ? (typeof rawUrls === "string" ? JSON.parse(rawUrls) : rawUrls)
      : (selectedEntry.photo_url ? [selectedEntry.photo_url] : []);
    return (
      <div style={styles.page}>
        <style>{css}</style>
        <div style={styles.photoViewerHeader}>
          <button style={styles.backBtn} onClick={() => setSelectedEntry(null)} className="back-btn">
            ← Back to Dashboard
          </button>
          <div>
            <h2 style={styles.photoViewerTitle}>
              {selectedEntry.year} {selectedEntry.make} {selectedEntry.model}
            </h2>
            <p style={styles.photoViewerSub}>
              {selectedEntry.color && selectedEntry.color + " · "}
              {selectedEntry.entrant_name} · {selectedEntry.registration_phone}
            </p>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <select
              style={{
                ...styles.statusSelect,
                background: selectedEntry.status === "approved" ? "#166534" :
                            selectedEntry.status === "rejected" ? "#7f1d1d" : "#713f12",
                fontSize: 15, padding: "10px 16px"
              }}
              value={selectedEntry.status || "pending"}
              onChange={(e) => { updateStatus(selectedEntry.id, e.target.value); setSelectedEntry({...selectedEntry, status: e.target.value}); }}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div style={styles.detailGrid}>
          {selectedEntry.judging_number && (
            <div style={styles.detailCard}>
              <p style={styles.detailLabel}>CAR NUMBER</p>
              <p style={styles.detailValue}>#{selectedEntry.judging_number}</p>
            </div>
          )}
          {selectedEntry.engine && (
            <div style={styles.detailCard}>
              <p style={styles.detailLabel}>ENGINE</p>
              <p style={styles.detailValue}>{selectedEntry.engine}</p>
            </div>
          )}
          {selectedEntry.transmission && (
            <div style={styles.detailCard}>
              <p style={styles.detailLabel}>TRANSMISSION</p>
              <p style={styles.detailValue}>{selectedEntry.transmission}</p>
            </div>
          )}
          {selectedEntry.registration_email && (
            <div style={styles.detailCard}>
              <p style={styles.detailLabel}>EMAIL</p>
              <p style={styles.detailValue}>{selectedEntry.registration_email}</p>
            </div>
          )}
        </div>

        {(selectedEntry.story || selectedEntry.car_story) && (
          <div style={styles.storyBox}>
            <p style={styles.storyLabel}>BUILD STORY</p>
            <p style={styles.storyText}>{selectedEntry.story || selectedEntry.car_story}</p>
          </div>
        )}

        <div style={styles.photoGrid}>
          {photos.map((url, i) => (
            <div key={i} style={styles.photoItem}>
              <img src={url} alt={"Photo " + (i + 1)} style={styles.photoImg}
                onClick={() => window.open(url, "_blank")} />
              {i === 0 && <div style={styles.mainBadge}>MAIN</div>}
            </div>
          ))}
        </div>

        {photos.length === 0 && (
          <p style={{ color: "#666", textAlign: "center", padding: 40 }}>No photos uploaded</p>
        )}
      </div>
    );
  }

  // ── MAIN DASHBOARD ──
  return (
    <div style={styles.page}>
      <style>{css}</style>

      {/* POWERED BY MOTHERS */}
      <div style={styles.poweredBy}>
        <span style={styles.poweredByText}>Powered by</span>
        <img src="/Mothers Logo Red.png" alt="Mothers Polish" style={styles.poweredByLogo} />
      </div>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>Chrome 26</h1>
          <p style={styles.headerSub}>Auckland Showgrounds · October 2026</p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.refreshBtn} onClick={loadEntries} className="refresh-btn">↻ Refresh</button>
          <button style={styles.exportBtn} onClick={exportCSV} className="export-btn">⬇ Export CSV</button>
          <button style={styles.logoutBtn} onClick={() => setLoggedIn(false)} className="red-btn">Logout</button>
        </div>
      </div>

      {/* STATS */}
      <div style={styles.statsGrid}>
        {[
          { label: "Total Entries", value: stats.total, color: "#fff" },
          { label: "Pending", value: stats.pending, color: "#f0a500" },
          { label: "Approved", value: stats.approved, color: "#22c55e" },
          { label: "Rejected", value: stats.rejected, color: "#CC0000" },
          { label: "Total Photos", value: stats.photos, color: "#60a5fa" },
        ].map((s) => (
          <div key={s.label} style={styles.statCard}>
            <p style={styles.statLabel}>{s.label}</p>
            <p style={{ ...styles.statValue, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* TABLE */}
      {loading ? (
        <p style={{ color: "#666", textAlign: "center", padding: 60 }}>Loading entries...</p>
      ) : entries.length === 0 ? (
        <p style={{ color: "#666", textAlign: "center", padding: 60 }}>No entries yet for this show.</p>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeadRow}>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Entrant</th>
                <th style={styles.th}>Vehicle</th>
                <th style={styles.th}>Photos</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((car) => {
                const urls = typeof car.photo_urls === "string" ? JSON.parse(car.photo_urls || "[]") : (car.photo_urls || []);
                const photoCount = urls.length > 0 ? urls.length : car.photo_url ? 1 : 0;
                return (
                  <tr key={car.id} style={styles.tableRow} className="table-row">
                    <td style={styles.td}>{car.judging_number || "—"}</td>
                    <td style={styles.td}>
                      <p style={styles.entrantName}>{car.entrant_name || car.owner_name || "—"}</p>
                      <p style={styles.entrantDetail}>{car.registration_email || "—"}</p>
                      <p style={styles.entrantDetail}>{car.registration_phone || "—"}</p>
                    </td>
                    <td style={styles.td}>
                      <p style={styles.vehicleName}>{car.year} {car.make} {car.model}</p>
                      {car.color && <p style={styles.vehicleDetail}>{car.color}</p>}
                      {(car.story || car.car_story) && (
                        <p style={styles.vehicleStory}>
                          {(car.story || car.car_story).length > 60
                            ? (car.story || car.car_story).slice(0, 60) + "..."
                            : (car.story || car.car_story)}
                        </p>
                      )}
                    </td>
                    <td style={styles.td}>
                      <button style={styles.photoBtn} onClick={() => setSelectedEntry(car)} className="photo-btn">
                        📷 {photoCount}
                      </button>
                    </td>
                    <td style={styles.td}>
                      <select
                        style={{
                          ...styles.statusSelect,
                          background: car.status === "approved" ? "#166534" :
                                      car.status === "rejected" ? "#7f1d1d" : "#713f12",
                        }}
                        value={car.status || "pending"}
                        onChange={(e) => updateStatus(car.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td style={styles.td}>
                      <button style={styles.deleteBtn} onClick={() => deleteEntry(car.id)} className="delete-btn">
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={styles.footer}>
        <p style={styles.footerText}>Mothers Showtime Dashboard · Chrome 26 · October 2026</p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Georgia', serif", color: "#f0f0f0", padding: "0 0 40px" },
  pinPage: { minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia', serif" },
  pinCard: { background: "#141414", border: "2px solid #D4AF37", borderRadius: 16, padding: "52px 48px", textAlign: "center", width: "100%", maxWidth: 400, boxShadow: "0 0 60px rgba(212,175,55,0.1)" },
  pinLogo: { width: 72, height: 72, borderRadius: "50%", background: "#CC0000", color: "#fff", fontSize: 34, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 0 50px rgba(204,0,0,0.4)" },
  pinTitle: { fontSize: 28, fontWeight: 900, color: "#fff", margin: "0 0 6px" },
  pinSub: { fontSize: 12, color: "#D4AF37", margin: 0, letterSpacing: 3, textTransform: "uppercase" },
  pinDivider: { width: 48, height: 3, background: "#CC0000", margin: "20px auto", borderRadius: 2 },
  pinLabel: { fontSize: 13, color: "#888", marginBottom: 12 },
  pinInput: { background: "#e8e8e8", border: "2px solid #ccc", borderRadius: 8, padding: "14px", fontSize: 28, color: "#111", width: "100%", boxSizing: "border-box", textAlign: "center", letterSpacing: 10, marginBottom: 8, outline: "none", fontFamily: "'Georgia', serif" },
  pinInputError: { borderColor: "#CC0000" },
  pinError: { color: "#CC0000", fontSize: 13, marginBottom: 12 },
  pinBtn: { background: "#CC0000", color: "#fff", border: "3px solid #CC0000", borderRadius: 8, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%", marginTop: 8, fontFamily: "'Georgia', serif", textTransform: "uppercase", letterSpacing: 2 },
  pinFooter: { fontSize: 12, color: "#555", marginTop: 20 },
  poweredBy: { background: "#0a0a0a", padding: "16px 24px 8px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, borderBottom: "1px solid #1a1a1a" },
  poweredByText: { fontSize: 12, color: "#555", letterSpacing: 1 },
  poweredByLogo: { height: 28, width: "auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 32px", borderBottom: "3px solid #CC0000", background: "#0a0a0a" },
  headerTitle: { fontSize: 32, fontWeight: 900, color: "#fff", margin: "0 0 4px" },
  headerSub: { fontSize: 13, color: "#D4AF37", margin: 0, letterSpacing: 2, textTransform: "uppercase" },
  headerActions: { display: "flex", gap: 12 },
  refreshBtn: { background: "#141414", color: "#D4AF37", border: "1px solid #D4AF37", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer", fontFamily: "'Georgia', serif" },
  exportBtn: { background: "#D4AF37", color: "#000", border: "3px solid #D4AF37", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif" },
  logoutBtn: { background: "#CC0000", color: "#fff", border: "3px solid #CC0000", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, padding: "24px 32px" },
  statCard: { background: "#141414", border: "1px solid #D4AF37", borderRadius: 10, padding: "20px 16px", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" },
  statLabel: { fontSize: 11, color: "#D4AF37", margin: "0 0 8px", letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 },
  statValue: { fontSize: 36, fontWeight: 900, margin: 0 },
  tableWrap: { margin: "0 32px", background: "#141414", border: "1px solid #D4AF37", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHeadRow: { background: "#CC0000" },
  th: { padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: 2, textTransform: "uppercase" },
  tableRow: { borderBottom: "1px solid #1e1e1e" },
  td: { padding: "16px", verticalAlign: "top" },
  entrantName: { fontWeight: 700, color: "#fff", margin: "0 0 4px", fontSize: 15 },
  entrantDetail: { fontSize: 12, color: "#888", margin: "0 0 2px" },
  vehicleName: { fontWeight: 700, color: "#fff", margin: "0 0 4px", fontSize: 15 },
  vehicleDetail: { fontSize: 12, color: "#D4AF37", margin: "0 0 4px" },
  vehicleStory: { fontSize: 12, color: "#666", margin: 0, fontStyle: "italic" },
  photoBtn: { background: "#1a1a1a", border: "1px solid #D4AF37", color: "#D4AF37", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 13, fontFamily: "'Georgia', serif" },
  statusSelect: { border: "none", borderRadius: 6, padding: "6px 10px", color: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "'Georgia', serif" },
  deleteBtn: { background: "transparent", border: "1px solid #444", color: "#CC0000", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 13, fontFamily: "'Georgia', serif" },
  photoViewerHeader: { display: "flex", alignItems: "center", gap: 24, padding: "24px 32px", borderBottom: "3px solid #CC0000", flexWrap: "wrap", background: "#0a0a0a" },
  backBtn: { background: "#141414", border: "1px solid #D4AF37", color: "#D4AF37", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 14, fontFamily: "'Georgia', serif", whiteSpace: "nowrap" },
  photoViewerTitle: { fontSize: 24, fontWeight: 900, color: "#fff", margin: "0 0 4px" },
  photoViewerSub: { fontSize: 13, color: "#D4AF37", margin: 0 },
  detailGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, padding: "24px 32px 0" },
  detailCard: { background: "#141414", border: "1px solid #D4AF37", borderRadius: 8, padding: "16px" },
  detailLabel: { fontSize: 11, color: "#D4AF37", letterSpacing: 2, fontWeight: 700, margin: "0 0 8px" },
  detailValue: { fontSize: 15, color: "#fff", margin: 0 },
  storyBox: { margin: "24px 32px", background: "#141414", border: "1px solid #D4AF37", borderRadius: 10, padding: "20px 24px" },
  storyLabel: { fontSize: 11, color: "#D4AF37", letterSpacing: 2, fontWeight: 700, margin: "0 0 10px" },
  storyText: { fontSize: 15, color: "#ccc", lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" },
  photoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, padding: "24px 32px" },
  photoItem: { position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "4/3", border: "2px solid #D4AF37" },
  photoImg: { width: "100%", height: "100%", objectFit: "cover", cursor: "pointer", display: "block" },
  mainBadge: { position: "absolute", top: 10, left: 10, background: "#CC0000", color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: "4px 8px", borderRadius: 4 },
  footer: { borderTop: "1px solid #1a1a1a", padding: "20px 32px", marginTop: 40 },
  footerText: { fontSize: 12, color: "#444", textAlign: "center" },
};

const css = `
  .pin-input:focus { border-color: #CC0000 !important; box-shadow: 0 0 0 4px rgba(204,0,0,0.15) !important; background: #fff !important; }
  .red-btn:hover { background: #aa0000 !important; border-color: #aa0000 !important; }
  .refresh-btn:hover { background: #CC0000 !important; border-color: #CC0000 !important; color: #fff !important; }
  .export-btn:hover { background: #c9a227 !important; border-color: #c9a227 !important; }
  .table-row:hover { background: #1a1a1a !important; }
  .photo-btn:hover { background: #D4AF37 !important; color: #000 !important; }
  .delete-btn:hover { background: rgba(204,0,0,0.15) !important; border-color: #CC0000 !important; }
  .back-btn:hover { background: #D4AF37 !important; color: #000 !important; }
`;
