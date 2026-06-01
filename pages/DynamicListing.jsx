// © 2026 LINQR — linqr.global — All Rights Reserved
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const LINQR_SUPABASE_URL = "https://odnjkxgsgevuvjutqdmi.supabase.co";
const LINQR_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kbmpreGdzZ2V2dXZqdXRxZG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxOTY0NzksImV4cCI6MjA5NTc3MjQ3OX0.tuf7P4I1xTNUMqnNLBkxAfVi-Ny4vjlWQzIX3AgTFoE";

const OLD_SUPABASE_URL = "https://sfymjnjpqvgtoxofndzx.supabase.co";
const OLD_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmeW1qbmpwcXZndG94b2ZuZHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NzI1MTAsImV4cCI6MjA3MzE0ODUxMH0.RqBItIZ-Iz_XhKcJNsJSR6e3n5jxW_YKHWGHO5j1z2c";

// Safe parser — handles text (one per line) OR legacy array
function parseFeatures(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(f => f && f.trim());
  if (typeof raw === "string") return raw.split("\n").map(f => f.trim()).filter(Boolean);
  return [];
}

// ─── PROPERTY LISTING VIEW ────────────────────────────────────────────────────
function PropertyListing({ listing, dealer, slug }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [remembered, setRemembered] = useState(false);

  useEffect(() => {
    const n = localStorage.getItem("ms_name");
    const e = localStorage.getItem("ms_email");
    if (n && e) { setName(n); setEmail(e); setRemembered(true); }
  }, []);

  const brandColour = dealer?.brand_colour || "#FFCD00";
  const isRayWhite = brandColour === "#FFCD00";
  const textOnBrand = isRayWhite ? "#000000" : "#ffffff";
  const features = parseFeatures(listing.features);

  async function handleSend() {
    setSending(true);
    localStorage.setItem("ms_name", name);
    localStorage.setItem("ms_email", email);
    try {
      const res = await fetch(`${OLD_SUPABASE_URL}/functions/v1/send-sellsheet-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OLD_ANON_KEY}` },
        body: JSON.stringify({
          name,
          email,
          carName: `${listing.address}${listing.suburb ? ", " + listing.suburb : ""}`,
          carUrl: `https://linqr.global/${slug}`,
          optIn: true,
          source: "property-portal"
        })
      });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
    } catch (e) {
      console.error(e);
    }
    setSending(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f0", fontFamily: "Georgia, serif" }}>

      {/* RAY WHITE HEADER */}
      <div style={{ background: brandColour }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 22, color: textOnBrand, letterSpacing: 1 }}>RAY WHITE</div>
            <div style={{ fontSize: 13, color: isRayWhite ? "#333" : "rgba(255,255,255,0.8)" }}>{dealer?.name || "Real Estate"}</div>
          </div>
          <div style={{ fontSize: 11, color: isRayWhite ? "#555" : "rgba(255,255,255,0.7)", textAlign: "right" }}>
            <div>PROPERTY PROFILE</div>
            <div style={{ fontWeight: "bold" }}>{listing.property_id}</div>
          </div>
        </div>
      </div>

      {/* HERO IMAGE */}
      {listing.image_url && (
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <img src={listing.image_url} alt={listing.address} style={{ width: "100%", maxHeight: 380, objectFit: "cover", display: "block" }} />
        </div>
      )}

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 16px 40px" }}>

        {/* ADDRESS & PRICE */}
        <div style={{ background: "white", borderRadius: "0 0 12px 12px", padding: 20, marginBottom: 16, borderTop: `4px solid ${brandColour}` }}>
          <div style={{ fontSize: 22, fontWeight: "bold", color: "#111", marginBottom: 4 }}>{listing.address}</div>
          {listing.suburb && <div style={{ fontSize: 16, color: "#555", marginBottom: 16 }}>{listing.suburb}</div>}
          {(listing.sale_method || listing.price || listing.cv) && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              {(listing.sale_method || listing.price) && (
                <div style={{ background: brandColour, color: textOnBrand, padding: "8px 16px", borderRadius: 6, fontWeight: "bold", fontSize: 18 }}>
                  {listing.sale_method && listing.sale_method !== "Price" && listing.price ? `${listing.sale_method}: ${listing.price}` : listing.sale_method && listing.sale_method !== "Price" ? listing.sale_method : listing.price || ""}
                </div>
              )}
              {listing.cv && <div style={{ fontSize: 14, color: "#666" }}>CV: {listing.cv}</div>}
            </div>
          )}
        </div>

        {/* STATS BAR */}
        <div style={{ background: "#111", borderRadius: 10, padding: 16, marginBottom: 16, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, textAlign: "center" }}>
          {[
            { label: "Bed", value: listing.bedrooms || "—" },
            { label: "Bath", value: listing.bathrooms || "—" },
            { label: "Car Spaces", value: listing.garages || "—" },
            { label: "Floor", value: listing.floor_area ? `${listing.floor_area}m²` : "—" },
            { label: "Land", value: listing.land_area ? `${listing.land_area}m²` : "—" },
          ].map(s => (
            <div key={s.label}>
              <div style={{ color: brandColour, fontWeight: "bold", fontSize: 18 }}>{s.value}</div>
              <div style={{ color: "#aaa", fontSize: 11 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* DESCRIPTION */}
        {listing.description && (
          <div style={{ background: "white", borderRadius: 10, padding: 20, marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, color: "#111", borderBottom: `2px solid ${brandColour}`, paddingBottom: 8 }}>About This Property</h3>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: "#333" }}>{listing.description}</p>
          </div>
        )}

        {/* FEATURES */}
        {features.length > 0 && (
          <div style={{ background: "white", borderRadius: 10, padding: 20, marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, color: "#111", borderBottom: `2px solid ${brandColour}`, paddingBottom: 8 }}>Key Features</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {features.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#333" }}>
                  <span style={{ color: brandColour, fontWeight: "bold" }}>✓</span> {f}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AGENTS */}
        {(listing.agent_name || listing.agent2_name) && (
          <div style={{ background: "white", borderRadius: 10, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
              {listing.agent2_name ? "Your Agents" : "Your Agent"}
            </div>
            {listing.agent_name && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: listing.agent2_name ? 14 : 0 }}>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: 16, color: "#111" }}>{listing.agent_name}</div>
                  {listing.agent_phone && <div style={{ fontSize: 14, color: "#555" }}>{listing.agent_phone}</div>}
                </div>
                {listing.agent_phone && (
                  <a href={`tel:${listing.agent_phone}`} style={{ background: brandColour, color: textOnBrand, padding: "10px 18px", borderRadius: 8, textDecoration: "none", fontWeight: "bold", fontSize: 14 }}>📞 Call</a>
                )}
              </div>
            )}
            {listing.agent2_name && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f0f0f0", paddingTop: 14 }}>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: 16, color: "#111" }}>{listing.agent2_name}</div>
                  {listing.agent2_phone && <div style={{ fontSize: 14, color: "#555" }}>{listing.agent2_phone}</div>}
                </div>
                {listing.agent2_phone && (
                  <a href={`tel:${listing.agent2_phone}`} style={{ background: brandColour, color: textOnBrand, padding: "10px 18px", borderRadius: 8, textDecoration: "none", fontWeight: "bold", fontSize: 14 }}>📞 Call</a>
                )}
              </div>
            )}
          </div>
        )}

        {/* EMAIL CAPTURE */}
        <div style={{ background: "white", borderRadius: 10, padding: 20, marginBottom: 16, border: `2px solid ${brandColour}` }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 16, color: "#111" }}>✉️ Send Me This Property</h3>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "#666" }}>Send yourself this property profile</p>
          {sent ? (
            <div style={{ textAlign: "center", padding: 20, color: "#1B6157", fontWeight: "bold" }}>✅ Sent! Check your inbox.</div>
          ) : (
            <>
              {remembered && (
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "#111", margin: "0 0 12px" }}>📧 Send to {email}?</p>
                  <button onClick={handleSend} disabled={sending}
                    style={{ width: "100%", background: "#FFD700", border: "2px solid #F0C000", borderRadius: 8, padding: 18, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif", color: "#111", marginBottom: 8 }}>
                    {sending ? "Sending..." : "Yes — Send It to Me →"}
                  </button>
                  <button onClick={() => { setRemembered(false); setName(""); setEmail(""); localStorage.removeItem("ms_name"); localStorage.removeItem("ms_email"); }}
                    style={{ display: "block", width: "100%", background: "transparent", border: "none", color: "#888", fontSize: 13, cursor: "pointer", padding: "12px 0", fontFamily: "Georgia, serif" }}>
                    Not me — use a different email
                  </button>
                </div>
              )}
              {!remembered && (
                <>
                  <div style={{ display: "grid", gap: 10, marginBottom: 12 }}>
                    <input style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 6, fontSize: 14, boxSizing: "border-box", fontFamily: "Georgia, serif" }}
                      value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
                    <input style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 6, fontSize: 14, boxSizing: "border-box", fontFamily: "Georgia, serif" }}
                      value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email" type="email" />
                  </div>
                  <button onClick={handleSend} disabled={sending || !name || !email}
                    style={{ width: "100%", padding: 12, background: "#111", color: brandColour, border: "none", borderRadius: 8, fontSize: 15, fontWeight: "bold", cursor: "pointer", fontFamily: "Georgia, serif" }}>
                    {sending ? "Sending..." : "✉️ Send Me This Property"}
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {/* FOOTER */}
        <div style={{ textAlign: "center", fontSize: 12, color: "#999", marginTop: 20 }}>
          <img src="/LINQR-logo.png" alt="LINQR" style={{ height: 28, marginBottom: 6, opacity: 0.6 }} />
          <div>© LINQR™ 2026 · linqr.global</div>
        </div>

      </div>
    </div>
  );
}

// ─── MAIN DYNAMIC LISTING ─────────────────────────────────────────────────────
export default function DynamicListing() {
  const { slug } = useParams();
  const [listing, setListing] = useState(null);
  const [dealer, setDealer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [remembered, setRemembered] = useState(false);

  useEffect(() => {
    fetchListing();
    const savedName = localStorage.getItem("ms_name");
    const savedEmail = localStorage.getItem("ms_email");
    if (savedName && savedEmail) { setName(savedName); setEmail(savedEmail); setRemembered(true); }
  }, [slug]);

  async function fetchListing() {
    try {
      const res = await fetch(`${LINQR_SUPABASE_URL}/rest/v1/listings?slug=eq.${slug}&published=eq.true&select=*`, {
        headers: { "apikey": LINQR_ANON_KEY, "Authorization": `Bearer ${LINQR_ANON_KEY}` }
      });
      const data = await res.json();
      if (!data || data.length === 0) { setNotFound(true); setLoading(false); return; }
      setListing(data[0]);

      const dRes = await fetch(`${LINQR_SUPABASE_URL}/rest/v1/dealers?id=eq.${data[0].dealer_id}&select=*`, {
        headers: { "apikey": LINQR_ANON_KEY, "Authorization": `Bearer ${LINQR_ANON_KEY}` }
      });
      const dData = await dRes.json();
      if (dData && dData.length > 0) setDealer(dData[0]);
    } catch (e) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  async function sendEmail(quickSend) {
    setSending(true);
    setError("");
    try {
      localStorage.setItem("ms_name", name);
      localStorage.setItem("ms_email", email);
      const res = await fetch(`${OLD_SUPABASE_URL}/functions/v1/send-sellsheet-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OLD_ANON_KEY}` },
        body: JSON.stringify({
          name,
          email,
          optIn: quickSend ? false : optIn,
          carName: `${listing.year || ""} ${listing.make} ${listing.model}`.trim(),
          carUrl: `https://linqr.global/${slug}`,
        }),
      });
      if (!res.ok) throw new Error("Failed to send");
      setSent(true);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
      <p style={{ color: "#888", fontFamily: "Georgia, serif" }}>Loading...</p>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 48 }}>🔍</p>
        <p style={{ fontSize: 20, fontWeight: 700, fontFamily: "Georgia, serif", color: "#111" }}>Listing not found</p>
        <p style={{ color: "#888" }}>This listing may no longer be available.</p>
      </div>
    </div>
  );

  // ── ROUTE TO PROPERTY VIEW IF NEEDED ────────────────────────────────────────
  if (listing?.listing_type === "property") {
    return <PropertyListing listing={listing} dealer={dealer} slug={slug} />;
  }

  // ── VEHICLE VIEW ─────────────────────────────────────────────────────────────
  const brandColour = dealer?.brand_colour || "#1B6157";
  const features = parseFeatures(listing.features);

  const specs = [
    { label: "Make", value: listing.make },
    { label: "Model", value: listing.model },
    { label: "Year", value: listing.year },
    { label: "Colour", value: listing.colour },
    { label: "Engine", value: listing.engine },
    { label: "Transmission", value: listing.transmission },
    { label: "Odometer", value: listing.odometer },
    { label: "Price", value: listing.price },
  ].filter(s => s.value);

  return (
    <div style={{ minHeight: "100vh", background: brandColour, padding: 16, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
      <div style={{ width: "100%", maxWidth: 820, background: "#fff", fontFamily: "Georgia, serif", color: "#111", borderRadius: 12, overflow: "hidden", boxShadow: "0 8px 48px rgba(0,0,0,0.2)" }}>
        <style>{`
          .specs-grid { display: grid; grid-template-columns: 1fr 1fr; }
          .feature-grid { display: grid; grid-template-columns: 1fr 1fr; }
          @media (max-width: 600px) {
            .specs-grid { grid-template-columns: 1fr !important; }
            .feature-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* DEALER HEADER */}
        <div style={{ background: brandColour, padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            {dealer?.logo_url
              ? <img src={dealer.logo_url} alt={dealer.name} style={{ height: 40, width: "auto" }} />
              : <p style={{ color: "#fff", fontSize: 20, fontWeight: 900, margin: 0, letterSpacing: 2 }}>{dealer?.name}</p>
            }
          </div>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, margin: 0, textAlign: "right" }}>{dealer?.address}</p>
        </div>

        {/* HERO */}
        <div style={{ position: "relative", height: "70vw", maxHeight: 520, minHeight: 260, overflow: "hidden", background: "#111" }}>
          {listing.image_url
            ? <img src={listing.image_url} alt={`${listing.year} ${listing.make} ${listing.model}`} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#222" }}>
                <p style={{ color: "#666", fontSize: 48 }}>🚗</p>
              </div>
          }
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)" }} />
          <div style={{ position: "absolute", bottom: 24, left: 0, right: 0, padding: "0 24px" }}>
            <p style={{ fontSize: 11, letterSpacing: 3, color: "#FFD700", margin: "0 0 8px", textTransform: "uppercase" }}>{listing.year} · {listing.make}</p>
            <h1 style={{ fontSize: "clamp(36px, 8vw, 72px)", fontWeight: 900, color: "#fff", margin: "0 0 8px", lineHeight: 1 }}>{listing.model}</h1>
            <p style={{ fontSize: 14, color: "#ddd", margin: 0 }}>{listing.colour} · {listing.engine}</p>
          </div>
        </div>

        {/* STATS BAR */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", background: brandColour, padding: "20px 16px" }}>
          {[
            { value: listing.year, label: "Year" },
            { value: listing.engine?.split(" ")[0] || listing.engine, label: "Engine" },
            { value: listing.odometer || "New", label: "Odometer" },
            { value: listing.price, label: "Price" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.2)" }}>
              <p style={{ fontSize: "clamp(14px, 3vw, 22px)", fontWeight: 900, color: "#fff", margin: "0 0 4px" }}>{s.value}</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div style={{ padding: "0 24px" }}>

          {/* DESCRIPTION */}
          {listing.description && (
            <div style={{ padding: "32px 0", borderBottom: "1px solid #f0f0f0" }}>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "#444", margin: 0 }}>{listing.description}</p>
            </div>
          )}

          {/* SPECS */}
          <div style={{ padding: "32px 0", borderBottom: "1px solid #f0f0f0" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: brandColour, margin: "0 0 20px", letterSpacing: 1, textTransform: "uppercase" }}>Key Details</h2>
            <div className="specs-grid" style={{ gap: 1, background: "#f0f0f0", border: "1px solid #f0f0f0", borderRadius: 8, overflow: "hidden" }}>
              {specs.map(spec => (
                <div key={spec.label} style={{ background: "#fff", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontSize: 12, color: "#888", margin: 0 }}>{spec.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#111", margin: 0, textAlign: "right" }}>{spec.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FEATURES */}
          {features.length > 0 && (
            <div style={{ padding: "32px 0", borderBottom: "1px solid #f0f0f0" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: brandColour, margin: "0 0 20px", letterSpacing: 1, textTransform: "uppercase" }}>Features</h2>
              <div className="feature-grid" style={{ gap: 10 }}>
                {features.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#444", lineHeight: 1.4 }}>
                    <span style={{ color: brandColour, fontSize: 8, flexShrink: 0, marginTop: 4 }}>●</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FINANCE */}
          {listing.finance && (
            <div style={{ margin: "24px 0", background: "#f9f9f9", border: "1px solid #e0e0e0", borderRadius: 12, padding: 24 }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: brandColour, margin: "0 0 8px" }}>💰 Finance Available</p>
              <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7, margin: 0 }}>{listing.finance}</p>
            </div>
          )}

          {/* EMAIL CAPTURE */}
          <div style={{ paddingBottom: 32 }}>
            {!showEmailForm && !sent && !remembered && (
              <button style={{ width: "100%", background: "#FFD700", border: "2px solid #F0C000", borderRadius: 8, padding: 18, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif", color: "#111" }}
                onClick={() => setShowEmailForm(true)}>
                📧 Email This to Yourself
              </button>
            )}

            {!sent && remembered && (
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#111", margin: "0 0 12px" }}>📧 Send to {email}?</p>
                <button style={{ width: "100%", background: "#FFD700", border: "2px solid #F0C000", borderRadius: 8, padding: 18, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif", color: "#111", marginBottom: 8 }}
                  onClick={() => sendEmail(true)} disabled={sending}>
                  {sending ? "Sending..." : "Yes — Send It to Me →"}
                </button>
                <button onClick={() => { setRemembered(false); setShowEmailForm(true); }}
                  style={{ display: "block", width: "100%", background: "transparent", border: "none", color: "#888", fontSize: 13, cursor: "pointer", padding: "12px 0", fontFamily: "Georgia, serif" }}>
                  Not me — use a different email
                </button>
                {error && <p style={{ fontSize: 13, color: "#cc0000", margin: "0 0 12px" }}>{error}</p>}
              </div>
            )}

            {showEmailForm && !sent && !remembered && (
              <div style={{ background: "#f9f9f9", border: "1px solid #e0e0e0", borderRadius: 12, padding: 24 }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: "0 0 8px" }}>📧 Save This to Your Inbox</p>
                <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6, margin: "0 0 20px" }}>We'll send you the full details instantly.</p>
                <input style={{ width: "100%", background: "#fff", border: "2px solid #ddd", borderRadius: 8, padding: "14px 16px", fontSize: 15, color: "#111", fontFamily: "Georgia, serif", boxSizing: "border-box", marginBottom: 12, display: "block" }}
                  placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
                <input style={{ width: "100%", background: "#fff", border: "2px solid #ddd", borderRadius: 8, padding: "14px 16px", fontSize: 15, color: "#111", fontFamily: "Georgia, serif", boxSizing: "border-box", marginBottom: 12, display: "block" }}
                  placeholder="Your email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, margin: "4px 0 16px" }}>
                  <input type="checkbox" id="optin" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} style={{ marginTop: 3 }} />
                  <label htmlFor="optin" style={{ fontSize: 13, color: "#666", lineHeight: 1.5 }}>Keep me updated on new vehicles and offers</label>
                </div>
                {error && <p style={{ fontSize: 13, color: "#cc0000", margin: "0 0 12px" }}>{error}</p>}
                <button style={{ width: "100%", background: brandColour, color: "#fff", border: "none", borderRadius: 8, padding: 16, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}
                  onClick={() => sendEmail(false)} disabled={sending}>
                  {sending ? "Sending..." : "Send It to Me →"}
                </button>
                <p style={{ fontSize: 11, color: "#aaa", textAlign: "center", margin: "12px 0 0" }}>Your privacy matters. One email, no spam.</p>
              </div>
            )}

            {sent && (
              <div style={{ background: "#f0faf7", border: `2px solid ${brandColour}`, borderRadius: 12, padding: "32px 24px", textAlign: "center" }}>
                <p style={{ fontSize: 32, color: brandColour, margin: "0 0 8px" }}>✓</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: brandColour, margin: "0 0 8px" }}>On Its Way!</p>
                <p style={{ fontSize: 14, color: "#666", margin: 0 }}>Check your inbox — details headed to {email}</p>
              </div>
            )}
          </div>

          {/* DEALER BOX */}
          <div style={{ background: "#f9f9f9", border: "1px solid #e0e0e0", borderRadius: 10, padding: 24, textAlign: "center", marginBottom: 24 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#111", margin: "0 0 6px" }}>{dealer?.name}</p>
            <p style={{ fontSize: 13, color: "#888", margin: "0 0 10px" }}>{dealer?.address}</p>
            {dealer?.phone && <a href={`tel:${dealer.phone}`} style={{ fontSize: 15, fontWeight: 700, color: brandColour, textDecoration: "none", display: "block", marginBottom: 6 }}>{dealer.phone}</a>}
            {dealer?.website && <a href={`https://${dealer.website}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#888", textDecoration: "none" }}>{dealer.website}</a>}
          </div>

          {/* FOOTER */}
          <div style={{ textAlign: "center", padding: "24px 0 40px" }}>
            <div style={{ width: 40, height: 2, background: brandColour, margin: "0 auto 20px", borderRadius: 2 }} />
            <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 8px", letterSpacing: 1 }}>Digital profile powered by</p>
            <img src="/LINQR-logo.png" alt="LINQR" style={{ width: 100, height: "auto", opacity: 0.6, display: "block", margin: "0 auto 8px" }} />
            <p style={{ fontSize: 11, color: "#bbb", margin: 0 }}>© LINQR 2026 · linqr.global</p>
          </div>

        </div>
      </div>
    </div>
  );
}
