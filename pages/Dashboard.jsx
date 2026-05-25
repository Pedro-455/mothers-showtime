import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const PINS = ["2746"]; // Add more PINs here for show owners
const SHOW_ID = "57941103-3567-415d-b068-7b76263b068e"; // CHROME Showcase

export default function Dashboard() {
  const [pin, setPin] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState(null); // { vehicleId, photos, vehicle }
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
    // Get all vehicles linked to this show
    const { data: links } = await supabase
      .from("vehicle_show_links")
      .select("vehicle_id")
      .eq("show_id", SHOW_ID);

    if (!links || links.length === 0) {
      setEntries([]);
      setLoading(false);
      return;
    }

    const vehicleIds = links.map((l) => l.vehicle_id);

    // Get vehicles with profiles
    const { data: vehicles } = await supabase
      .from("vehicles")
      .select("*, profiles(full_name, email, phone)")
      .in("id", vehicleIds)
      .order("created_at", { ascending: false });

    // Get photo counts
    const { data: photos } = await supabase
      .from("photos")
      .select("vehicle_id")
      .in("vehicle_id", vehicleIds);

    // Attach photo counts
    const withCounts = (vehicles || []).map((v) => ({
      ...v,
      photoCount: photos ? photos.filter((p) => p.vehicle_id === v.id).length : 0,
      status: v.show_in_american_showcase === true ? "approved" :
              v.show_in_american_showcase === false && v.updated_at !== v.created_at ? "rejected" : "pending",
    }));

    setEntries(withCounts);

    // Stats
    const total = withCounts.length;
    const approved = withCounts.filter((v) => v.status === "approved").length;
    const rejected = withCounts.filter((v) => v.status === "rejected").length;
    const pending = withCounts.filter((v) => v.status === "pending").length;
    const photoTotal = photos ? photos.length : 0;
    setStats({ total, approved, rejected, pending, photos: photoTotal });
    setLoading(false);
  }

  async function loadPhotos(vehicle) {
    const { data } = await supabase
      .from("photos")
      .select("*")
      .eq("vehicle_id", vehicle.id)
      .order("created_at");
    setSelectedPhotos({ vehicle, photos: data || [] });
  }

  async function updateStatus(vehicleId, status) {
    await supabase
      .from("vehicles")
      .update({
        show_in_american_showcase: status === "approved" ? true : false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", vehicleId);
    loadEntries();
  }

  async function deleteEntry(vehicleId) {
    if (!window.confirm("Delete this entry? This cannot be undone.")) return;
    await supabase.from("photos").delete().eq("vehicle_id", vehicleId);
    await supabase.from("vehicle_show_links").delete().eq("vehicle_id", vehicleId);
    await supabase.from("vehicles").delete().eq("id", vehicleId);
    loadEntries();
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

  // ── PHOTO VIEWER ──
  if (selectedPhotos) {
    const { vehicle, photos } = selectedPhotos;
    return (
      <div style={styles.page}>
        <style>{css}</style>
        <div style={styles.photoViewerHeader}>
          <button style={styles.backBtn} onClick={() => setSelectedPhotos(null)} className="back-btn">
            ← Back to Dashboard
          </button>
          <div>
            <h2 style={styles.photoViewerTitle}>{vehicle.year} {vehicle.make} {vehicle.model}</h2>
            <p style={styles.photoViewerSub}>{vehicle.color} · {photos.length} photo{photos.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {vehicle.story && (
          <div style={styles.storyBox}>
            <p style={styles.storyLabel}>BUILD STORY</p>
            <p style={styles.storyText}>{vehicle.story}</p>
          </div>
        )}

        <div style={styles.photoGrid}>
          {photos.map((photo, i) => (
            <div key={photo.id} style={styles.photoItem}>
              <img src={photo.url} alt={`Photo ${i + 1}`} style={styles.photoImg}
                onClick={() => window.open(photo.url, "_blank")} />
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

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>Chrome Showcase</h1>
          <p style={styles.headerSub}>Auckland Showgrounds · September 2025</p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.refreshBtn} onClick={loadEntries} className="refresh-btn">
            ↻ Refresh
          </button>
          <button style={styles.logoutBtn} onClick={() => setLoggedIn(false)} className="red-btn">
            Logout
          </button>
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
              {entries.map((entry, i) => {
                const profile = entry.profiles;
                const name = profile?.full_name || entry.handle || "—";
                const email = profile?.email || "—";
                const phone = profile?.phone || "—";
                return (
                  <tr key={entry.id} style={styles.tableRow} className="table-row">
                    <td style={styles.td}>{i + 1}</td>
                    <td style={styles.td}>
                      <p style={styles.entrantName}>{name}</p>
                      <p style={styles.entrantDetail}>{email}</p>
                      <p style={styles.entrantDetail}>{phone}</p>
                    </td>
                    <td style={styles.td}>
                      <p style={styles.vehicleName}>{entry.year} {entry.make} {entry.model}</p>
                      {entry.color && <p style={styles.vehicleDetail}>{entry.color}</p>}
                      {entry.story && (
                        <p style={styles.vehicleStory}>
                          {entry.story.length > 60 ? entry.story.slice(0, 60) + "..." : entry.story}
                        </p>
                      )}
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.photoBtn}
                        onClick={() => loadPhotos(entry)}
                        className="photo-btn"
                      >
                        📷 {entry.photoCount}
                      </button>
                    </td>
                    <td style={styles.td}>
                      <select
                        style={{
                          ...styles.statusSelect,
                          background: entry.status === "approved" ? "#166534" :
                                      entry.status === "rejected" ? "#7f1d1d" : "#713f12",
                        }}
                        value={entry.status}
                        onChange={(e) => updateStatus(entry.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.deleteBtn}
                        onClick={() => deleteEntry(entry.id)}
                        className="delete-btn"
                      >
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

      {/* FOOTER */}
      <div style={styles.footer}>
        <p style={styles.footerText}>Mothers Showtime Dashboard · Chrome Showcase 2025</p>
      </div>
    </div>
  );
}

// ── STYLES ──
const styles = {
  page: { minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Georgia', serif", color: "#f0f0f0", padding: "0 0 40px" },
  pinPage: { minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia', serif" },

  // PIN
  pinCard: { background: "#111", border: "1px solid #222", borderRadius: 16, padding: "52px 48px", textAlign: "center", width: "100%", maxWidth: 380 },
  pinLogo: { width: 56, height: 56, borderRadius: "50%", background: "#CC0000", color: "#fff", fontSize: 26, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 0 30px rgba(204,0,0,0.3)" },
  pinTitle: { fontSize: 26, fontWeight: 900, color: "#fff", margin: "0 0 6px" },
  pinSub: { fontSize: 13, color: "#666", margin: 0, letterSpacing: 2, textTransform: "uppercase" },
  pinDivider: { width: 40, height: 2, background: "#CC0000", margin: "20px auto" },
  pinLabel: { fontSize: 13, color: "#888", marginBottom: 12 },
  pinInput: { background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: "14px", fontSize: 24, color: "#fff", width: "100%", boxSizing: "border-box", textAlign: "center", letterSpacing: 8, marginBottom: 8, outline: "none" },
  pinInputError: { borderColor: "#CC0000" },
  pinError: { color: "#CC0000", fontSize: 13, marginBottom: 12 },
  pinBtn: { background: "#CC0000", color: "#fff", border: "none", borderRadius: 8, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%", marginTop: 8, fontFamily: "'Georgia', serif" },
  pinFooter: { fontSize: 12, color: "#444", marginTop: 20 },

  // Header
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "28px 32px", borderBottom: "1px solid #1a1a1a" },
  headerTitle: { fontSize: 28, fontWeight: 900, color: "#fff", margin: "0 0 4px" },
  headerSub: { fontSize: 13, color: "#666", margin: 0, letterSpacing: 1 },
  headerActions: { display: "flex", gap: 12 },
  refreshBtn: { background: "#1a1a1a", color: "#aaa", border: "1px solid #333", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer", fontFamily: "'Georgia', serif" },
  logoutBtn: { background: "#CC0000", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif" },

  // Stats
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, padding: "24px 32px" },
  statCard: { background: "#111", border: "1px solid #1a1a1a", borderRadius: 10, padding: "20px 16px" },
  statLabel: { fontSize: 12, color: "#666", margin: "0 0 8px", letterSpacing: 1, textTransform: "uppercase" },
  statValue: { fontSize: 32, fontWeight: 900, margin: 0 },

  // Table
  tableWrap: { margin: "0 32px", background: "#111", border: "1px solid #1a1a1a", borderRadius: 12, overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHeadRow: { background: "#CC0000" },
  th: { padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: 1, textTransform: "uppercase" },
  tableRow: { borderBottom: "1px solid #1a1a1a" },
  td: { padding: "16px", verticalAlign: "top" },
  entrantName: { fontWeight: 700, color: "#fff", margin: "0 0 4px", fontSize: 15 },
  entrantDetail: { fontSize: 12, color: "#666", margin: "0 0 2px" },
  vehicleName: { fontWeight: 700, color: "#fff", margin: "0 0 4px", fontSize: 15 },
  vehicleDetail: { fontSize: 12, color: "#888", margin: "0 0 4px" },
  vehicleStory: { fontSize: 12, color: "#555", margin: 0, fontStyle: "italic" },
  photoBtn: { background: "#1a1a1a", border: "1px solid #333", color: "#aaa", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 13, fontFamily: "'Georgia', serif" },
  statusSelect: { border: "none", borderRadius: 6, padding: "6px 10px", color: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "'Georgia', serif" },
  deleteBtn: { background: "transparent", border: "1px solid #333", color: "#CC0000", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 13, fontFamily: "'Georgia', serif" },

  // Photo viewer
  photoViewerHeader: { display: "flex", alignItems: "center", gap: 24, padding: "24px 32px", borderBottom: "1px solid #1a1a1a" },
  backBtn: { background: "#1a1a1a", border: "1px solid #333", color: "#aaa", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 14, fontFamily: "'Georgia', serif", whiteSpace: "nowrap" },
  photoViewerTitle: { fontSize: 22, fontWeight: 900, color: "#fff", margin: "0 0 4px" },
  photoViewerSub: { fontSize: 13, color: "#666", margin: 0 },
  storyBox: { margin: "24px 32px", background: "#111", border: "1px solid #1a1a1a", borderRadius: 10, padding: "20px 24px" },
  storyLabel: { fontSize: 11, color: "#CC0000", letterSpacing: 2, fontWeight: 700, margin: "0 0 10px" },
  storyText: { fontSize: 15, color: "#ccc", lineHeight: 1.7, margin: 0 },
  photoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, padding: "24px 32px" },
  photoItem: { position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "4/3", border: "1px solid #1a1a1a" },
  photoImg: { width: "100%", height: "100%", objectFit: "cover", cursor: "pointer", display: "block" },
  mainBadge: { position: "absolute", top: 10, left: 10, background: "#CC0000", color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: "4px 8px", borderRadius: 4 },

  // Footer
  footer: { borderTop: "1px solid #1a1a1a", padding: "20px 32px", marginTop: 40 },
  footerText: { fontSize: 12, color: "#333", textAlign: "center" },
};

const css = `
  .pin-input:focus { border-color: #CC0000 !important; box-shadow: 0 0 0 3px rgba(204,0,0,0.1); }
  .red-btn:hover { background: #aa0000 !important; }
  .refresh-btn:hover { border-color: #CC0000 !important; color: #fff !important; }
  .table-row:hover { background: #111 !important; }
  .photo-btn:hover { border-color: #CC0000 !important; color: #fff !important; }
  .delete-btn:hover { background: rgba(204,0,0,0.1) !important; }
  .back-btn:hover { border-color: #CC0000 !important; color: #fff !important; }
  @media (max-width: 768px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .table-wrap { margin: 0 16px !important; }
  }
`;
