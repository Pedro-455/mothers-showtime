// © 2026 LINQR — linqr.global — All Rights Reserved
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const LINQR_SUPABASE_URL = "https://odnjkxgsgevuvjutqdmi.supabase.co";
const LINQR_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kbmpreGdzZ2V2dXZqdXRxZG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxOTY0NzksImV4cCI6MjA5NTc3MjQ3OX0.tuf7P4I1xTNUMqnNLBkxAfVi-Ny4vjlWQzIX3AgTFoE";

const OLD_EDGE_URL = "https://sfymjnjpqvgtoxofndzx.supabase.co/functions/v1/send-sellsheet-email";

export default function CallbackRequest() {
  const { slug } = useParams();
  const [listing, setListing] = useState(null);
  const [dealer, setDealer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { loadListing(); }, [slug]);

  async function loadListing() {
    try {
      // Load listing by slug
      const lRes = await fetch(
        `${LINQR_SUPABASE_URL}/rest/v1/listings?slug=eq.${slug}&select=*`,
        { headers: { apikey: LINQR_ANON_KEY, Authorization: `Bearer ${LINQR_ANON_KEY}` } }
      );
      const lData = await lRes.json();
      const l = lData?.[0];
      if (!l) { setLoading(false); return; }
      setListing(l);

      // Load dealer
      const dRes = await fetch(
        `${LINQR_SUPABASE_URL}/rest/v1/dealers?id=eq.${l.dealer_id}&select=*`,
        { headers: { apikey: LINQR_ANON_KEY, Authorization: `Bearer ${LINQR_ANON_KEY}` } }
      );
      const dData = await dRes.json();
      setDealer(dData?.[0] || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!mobile.trim()) { setError("Please enter your mobile number."); return; }
    if (!name.trim()) { setError("Please enter your name."); return; }
    setError("");
    setSending(true);
    try {
      const listingName = listing?.listing_type === "property"
        ? listing?.address || slug
        : `${listing?.year || ""} ${listing?.make || ""} ${listing?.model || ""}`.trim() || slug;

      const res = await fetch(OLD_EDGE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "callback",
          name,
          mobile: mobile.trim(),
          carName: listingName,
          carUrl: `https://linqr.global/${slug}`,
          dealerEmail: dealer?.leads_email || dealer?.email || "",
          dealerName: dealer?.name || "",
        }),
      });
      if (!res.ok) throw new Error("Send failed");
      setSent(true);
    } catch (e) {
      console.error(e);
      setError("Something went wrong — please try again.");
    } finally {
      setSending(false);
    }
  }

  const brandColour = dealer?.brand_colour || "#1B6157";
  const isLight = dealer?.brand_colour
    ? (() => { const c = dealer.brand_colour.replace('#',''); const r=parseInt(c.substring(0,2),16),g=parseInt(c.substring(2,4),16),b=parseInt(c.substring(4,6),16); return (r*299+g*587+b*114)/1000 > 160; })()
    : false;
  const btnText = isLight ? "#000" : "#fff";

  const listingName = listing?.listing_type === "property"
    ? listing?.address || slug
    : `${listing?.year || ""} ${listing?.make || ""} ${listing?.model || ""}`.trim() || slug;

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#0a0a0a", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ color:"#888", fontFamily:"Georgia, serif", fontSize:16 }}>Loading...</p>
    </div>
  );

  if (!listing) return (
    <div style={{ minHeight:"100vh", background:"#0a0a0a", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ color:"#888", fontFamily:"Georgia, serif", fontSize:16 }}>Listing not found.</p>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#f0f2f5", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px 16px" }}>
      <div style={{ width:"100%", maxWidth:420, background:"#fff", borderRadius:16, boxShadow:"0 4px 24px rgba(0,0,0,0.10)", overflow:"hidden" }}>

        {/* Header */}
        <div style={{ background:brandColour, padding:"28px 28px 24px", textAlign:"center" }}>
          <img src="/LINQR-logo.png" alt="LINQR" style={{ height:32, width:"auto", opacity:0.9, marginBottom:16 }}/>
          <p style={{ fontSize:13, color: isLight?"rgba(0,0,0,0.6)":"rgba(255,255,255,0.75)", margin:"0 0 6px", letterSpacing:1, textTransform:"uppercase", fontFamily:"Georgia, serif" }}>
            📞 Request a Callback
          </p>
          <p style={{ fontSize:18, fontWeight:700, color: isLight?"#000":  "#fff", margin:0, fontFamily:"Georgia, serif", lineHeight:1.3 }}>
            {listingName}
          </p>
          {dealer?.name && (
            <p style={{ fontSize:13, color: isLight?"rgba(0,0,0,0.5)":"rgba(255,255,255,0.6)", margin:"8px 0 0", fontFamily:"Georgia, serif" }}>
              {dealer.name}
            </p>
          )}
        </div>

        {/* Body */}
        <div style={{ padding:"28px" }}>
          {!sent ? (
            <>
              <p style={{ fontSize:15, color:"#444", lineHeight:1.7, margin:"0 0 24px", fontFamily:"Georgia, serif", textAlign:"center" }}>
                Enter your details below and the team will call you back as soon as possible.
              </p>

              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:12, color:"#888", letterSpacing:0.5, textTransform:"uppercase", display:"block", marginBottom:6, fontFamily:"Georgia, serif" }}>Your Name</label>
                <input
                  type="text"
                  placeholder="Jane Smith"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ width:"100%", border:"2px solid #e5e7eb", borderRadius:8, padding:"13px 14px", fontSize:15, fontFamily:"Georgia, serif", color:"#111", boxSizing:"border-box", outline:"none" }}
                />
              </div>

              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:12, color:"#888", letterSpacing:0.5, textTransform:"uppercase", display:"block", marginBottom:6, fontFamily:"Georgia, serif" }}>Your Mobile Number</label>
                <input
                  type="tel"
                  placeholder="021 123 4567"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  style={{ width:"100%", border:"2px solid #e5e7eb", borderRadius:8, padding:"13px 14px", fontSize:15, fontFamily:"Georgia, serif", color:"#111", boxSizing:"border-box", outline:"none" }}
                />
              </div>

              {error && (
                <p style={{ fontSize:13, color:"#dc2626", margin:"0 0 14px", fontFamily:"Georgia, serif" }}>{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={sending}
                style={{ width:"100%", background:sending?'#9ca3af':brandColour, color:btnText, border:"none", borderRadius:10, padding:"16px", fontSize:16, fontWeight:700, cursor:sending?'not-allowed':'pointer', fontFamily:"Georgia, serif", transition:"background 0.2s" }}
              >
                {sending ? "Sending..." : "📞 Call Me Back →"}
              </button>

              <p style={{ fontSize:11, color:"#d1d5db", textAlign:"center", margin:"16px 0 0", fontFamily:"Georgia, serif" }}>
                Your number is sent directly to the dealer — no spam, ever.
              </p>
            </>
          ) : (
            // Success state
            <div style={{ textAlign:"center", padding:"20px 0" }}>
              <div style={{ fontSize:56, marginBottom:16 }}>✅</div>
              <p style={{ fontSize:22, fontWeight:700, color:brandColour, margin:"0 0 12px", fontFamily:"Georgia, serif" }}>
                Request Sent!
              </p>
              <p style={{ fontSize:15, color:"#555", lineHeight:1.7, margin:"0 0 24px", fontFamily:"Georgia, serif" }}>
                The team at <strong>{dealer?.name}</strong> will be in touch shortly on <strong>{mobile}</strong>.
              </p>
              <a
                href={`https://linqr.global/${slug}`}
                style={{ display:"inline-block", background:brandColour, color:btnText, borderRadius:8, padding:"12px 24px", fontSize:14, fontWeight:700, textDecoration:"none", fontFamily:"Georgia, serif" }}
              >
                View Listing →
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop:"1px solid #f3f4f6", padding:"16px 28px", textAlign:"center" }}>
          <p style={{ fontSize:11, color:"#d1d5db", margin:0, fontFamily:"Georgia, serif" }}>
            Callback powered by © LINQR · linqr.global
          </p>
        </div>

      </div>
    </div>
  );
}
