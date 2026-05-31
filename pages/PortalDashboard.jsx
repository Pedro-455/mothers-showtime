// © 2026 LINQR — linqr.global — All Rights Reserved
import { useState, useEffect } from "react";

const LINQR_SUPABASE_URL = "https://odnjkxgsgevuvjutqdmi.supabase.co";
const LINQR_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kbmpreGdzZ2V2dXZqdXRxZG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxOTY0NzksImV4cCI6MjA5NTc3MjQ3OX0.tuf7P4I1xTNUMqnNLBkxAfVi-Ny4vjlWQzIX3AgTFoE";

export default function PortalDashboard({ dealer, onLogout, onAddNew, onAddProperty, onEdit }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchListings(); }, []);

  async function fetchListings() {
    try {
      const res = await fetch(`${LINQR_SUPABASE_URL}/rest/v1/listings?dealer_id=eq.${dealer.id}&order=created_at.desc&select=*`, {
        headers: { "apikey": LINQR_ANON_KEY, "Authorization": `Bearer ${LINQR_ANON_KEY}` }
      });
      const data = await res.json();
      setListings(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function togglePublished(listing) {
    await fetch(`${LINQR_SUPABASE_URL}/rest/v1/listings?id=eq.${listing.id}`, {
      method: "PATCH",
      headers: { "apikey": LINQR_ANON_KEY, "Authorization": `Bearer ${LINQR_ANON_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ published: !listing.published })
    });
    fetchListings();
  }

  async function deleteListing(id) {
    if (!confirm("Delete this listing?")) return;
    await fetch(`${LINQR_SUPABASE_URL}/rest/v1/listings?id=eq.${id}`, {
      method: "DELETE",
      headers: { "apikey": LINQR_ANON_KEY, "Authorization": `Bearer ${LINQR_ANON_KEY}` }
    });
    fetchListings();
  }

  const isRayWhite = dealer?.brand_colour === '#FFCD00';
  const brandColour = dealer?.brand_colour || '#1B6157';
  const headerTextColour = isRayWhite ? '#000000' : '#ffffff';

  const AddButtons = () => (
    <div style={styles.addButtons}>
      {!isRayWhite && (
        <button style={{ ...styles.addBtn, background: brandColour, color: headerTextColour }} onClick={onAddNew}>
          🚗 Add Vehicle
        </button>
      )}
      {onAddProperty && (
        <button style={{ ...styles.addBtn, background: isRayWhite ? '#111' : brandColour, color: isRayWhite ? '#FFCD00' : '#fff' }} onClick={onAddProperty}>
          🏡 Add Property
        </button>
      )}
    </div>
  );

  return (
    <div style={styles.outer}>
      <div style={styles.page}>
        {/* HEADER */}
        <div style={{ ...styles.header, background: brandColour }}>
          <div>
            {isRayWhite
              ? <div style={{ fontWeight: 900, fontSize: 22, color: '#000', letterSpacing: 1 }}>RAY WHITE</div>
              : <img src="/LINQR-logo.png" alt="LINQR" style={styles.logo} />
            }
          </div>
          <div style={styles.headerRight}>
            <p style={{ ...styles.dealerName, color: headerTextColour }}>{dealer.name}</p>
            <button style={{ ...styles.logoutBtn, color: headerTextColour }} onClick={onLogout}>Sign Out</button>
          </div>
        </div>

        {/* STATS */}
        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <p style={{ ...styles.statValue, color: brandColour }}>{listings.length}</p>
            <p style={styles.statLabel}>Total Listings</p>
          </div>
          <div style={styles.statItem}>
            <p style={{ ...styles.statValue, color: brandColour }}>{listings.filter(l => l.published).length}</p>
            <p style={styles.statLabel}>Live</p>
          </div>
          <div style={styles.statItem}>
            <p style={{ ...styles.statValue, color: brandColour }}>{listings.filter(l => !l.published).length}</p>
            <p style={styles.statLabel}>Draft</p>
          </div>
          <div style={styles.statItem}>
            <p style={{ ...styles.statValue, color: brandColour }}>{dealer.code}</p>
            <p style={styles.statLabel}>Dealer Code</p>
          </div>
        </div>

        {/* CONTENT */}
        <div style={styles.content}>
          <div style={styles.contentHeader}>
            <h2 style={styles.contentTitle}>Your Listings</h2>
            <AddButtons />
          </div>

          {loading && <p style={styles.loadingText}>Loading your listings...</p>}

          {!loading && listings.length === 0 && (
            <div style={styles.emptyState}>
              <p style={styles.emptyIcon}>{isRayWhite ? '🏡' : '🏍️'}</p>
              <p style={styles.emptyTitle}>No listings yet</p>
              <p style={styles.emptySub}>Add your first {isRayWhite ? 'property' : 'vehicle'} to get started</p>
              <AddButtons />
            </div>
          )}

          {listings.map(listing => (
            <div key={listing.id} style={styles.listingCard}>
              <div style={styles.listingLeft}>
                {listing.image_url && (
                  <img src={listing.image_url} alt={listing.model} style={styles.listingImg} />
                )}
                {!listing.image_url && <div style={styles.listingImgPlaceholder}>📷</div>}
              </div>
              <div style={styles.listingInfo}>
                <p style={styles.listingTitle}>
                  {listing.listing_type === 'property'
                    ? listing.address
                    : `${listing.year} ${listing.make} ${listing.model}`}
                </p>
                <p style={styles.listingMeta}>
                  {listing.listing_type === 'property'
                    ? `${listing.suburb || ''} · ${listing.sale_method || ''} · ID: ${listing.property_id || ''}`
                    : `${listing.colour} · ${listing.engine} · Stock #${listing.stock_number}`}
                </p>
                <p style={{ ...styles.listingPrice, color: brandColour }}>{listing.price}</p>
                <div style={styles.listingUrl}>
                  <span style={styles.urlText}>linqr.global/{listing.slug}</span>
                  <a href={`https://linqr.global/${listing.slug}`} target="_blank" rel="noopener noreferrer" style={{ ...styles.viewLink, color: brandColour }}>View →</a>
                </div>
              </div>
              <div style={styles.listingActions}>
                <div style={{ ...styles.statusBadge, background: listing.published ? "#d4edda" : "#fff3cd", color: listing.published ? "#155724" : "#856404" }}>
                  {listing.published ? "● Live" : "○ Draft"}
                </div>
                <button style={styles.actionBtn} onClick={() => togglePublished(listing)}>
                  {listing.published ? "Unpublish" : "Publish"}
                </button>
                <button style={styles.actionBtn} onClick={() => onEdit(listing)}>Edit</button>
                <button style={{ ...styles.actionBtn, color: "#cc0000" }} onClick={() => deleteListing(listing.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.footer}>
          <p style={styles.footerText}>© LINQR 2026 · linqr.global</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  outer: { minHeight: "100vh", background: "#f5f5f5" },
  page: { maxWidth: 900, margin: "0 auto", padding: "0 0 40px" },
  header: { padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  logo: { height: 36, width: "auto" },
  headerRight: { display: "flex", alignItems: "center", gap: 16 },
  dealerName: { fontSize: 14, fontWeight: 700, margin: 0 },
  logoutBtn: { background: "rgba(0,0,0,0.1)", border: "none", borderRadius: 6, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontFamily: "Georgia, serif" },
  statsBar: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", background: "#fff", borderBottom: "1px solid #eee", padding: "20px 24px" },
  statItem: { textAlign: "center" },
  statValue: { fontSize: 28, fontWeight: 900, margin: "0 0 4px", fontFamily: "Georgia, serif" },
  statLabel: { fontSize: 11, color: "#888", margin: 0, letterSpacing: 1, textTransform: "uppercase" },
  content: { padding: "24px" },
  contentHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  contentTitle: { fontSize: 20, fontWeight: 700, color: "#111", margin: 0, fontFamily: "Georgia, serif" },
  addButtons: { display: "flex", gap: 10 },
  addBtn: { border: "none", borderRadius: 8, padding: "12px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" },
  loadingText: { textAlign: "center", color: "#888", padding: 40 },
  emptyState: { textAlign: "center", padding: "60px 24px", background: "#fff", borderRadius: 12, border: "2px dashed #e0e0e0" },
  emptyIcon: { fontSize: 48, margin: "0 0 16px" },
  emptyTitle: { fontSize: 20, fontWeight: 700, color: "#111", margin: "0 0 8px", fontFamily: "Georgia, serif" },
  emptySub: { fontSize: 14, color: "#888", margin: "0 0 24px" },
  listingCard: { background: "#fff", borderRadius: 12, padding: "16px", marginBottom: 12, display: "flex", gap: 16, alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  listingLeft: { flexShrink: 0 },
  listingImg: { width: 100, height: 70, objectFit: "cover", borderRadius: 8 },
  listingImgPlaceholder: { width: 100, height: 70, background: "#f0f0f0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 },
  listingInfo: { flex: 1 },
  listingTitle: { fontSize: 16, fontWeight: 700, color: "#111", margin: "0 0 4px", fontFamily: "Georgia, serif" },
  listingMeta: { fontSize: 13, color: "#888", margin: "0 0 4px" },
  listingPrice: { fontSize: 15, fontWeight: 700, margin: "0 0 6px" },
  listingUrl: { display: "flex", alignItems: "center", gap: 8 },
  urlText: { fontSize: 12, color: "#888", background: "#f5f5f5", padding: "4px 8px", borderRadius: 4 },
  viewLink: { fontSize: 12, fontWeight: 700, textDecoration: "none" },
  listingActions: { display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 },
  statusBadge: { fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 20 },
  actionBtn: { background: "transparent", border: "1px solid #ddd", borderRadius: 6, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif", color: "#444" },
  footer: { textAlign: "center", padding: 24 },
  footerText: { fontSize: 11, color: "#bbb", margin: 0 },
};
