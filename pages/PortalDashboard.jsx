// © 2026 LINQR — linqr.global — All Rights Reserved
import { useState, useEffect, useRef } from "react";

const LINQR_SUPABASE_URL = "https://odnjkxgsgevuvjutqdmi.supabase.co";
const LINQR_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kbmpreGdzZ2V2dXZqdXRxZG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxOTY0NzksImV4cCI6MjA5NTc3MjQ3OX0.tuf7P4I1xTNUMqnNLBkxAfVi-Ny4vjlWQzIX3AgTFoE";

const OLD_SUPABASE_URL = "https://sfymjnjpqvgtoxofndzx.supabase.co";
const OLD_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmeW1qbmpwcXZndG94b2ZuZHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NzI1MTAsImV4cCI6MjA3MzE0ODUxMH0.RqBItIZ-Iz_XhKcJNsJSR6e3n5jxW_YKHWGHO5j1z2c";

// Parse a CSV string into array of objects — handles multi-line quoted fields and #NAME? corruption
function parseCSV(text) {
  const normalised = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  function tokenise(str) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (ch === '"') {
        if (inQuotes && str[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (ch === "," && !inQuotes) {
        row.push(field.trim()); field = "";
      } else if (ch === "\n" && !inQuotes) {
        row.push(field.trim());
        if (row.some(v => v !== "")) rows.push(row);
        row = []; field = "";
      } else { field += ch; }
    }
    row.push(field.trim());
    if (row.some(v => v !== "")) rows.push(row);
    return rows;
  }
  const rows = tokenise(normalised);
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.replace(/^"|"$/g, "").trim());
  return rows.slice(1).map(values => {
    const row = {};
    headers.forEach((h, i) => {
      let val = (values[i] || "").replace(/^"|"$/g, "").replace(/#NAME\?/g, "").trim();
      row[h] = val;
    });
    return row;
  }).filter(row => row.stock_number && row.stock_number.match(/^\d+$/));
}

// Map AHD CSV row to LINQR listing fields
function mapCSVToListing(row, dealerId) {
  const stockNum = (row.stock_number || "").toString().toLowerCase().trim();
  const make = (row.make || "").trim();
  const modelName = (row.model_name || "").trim();
  const modelCode = (row.model_code || "").trim();
  const model = modelName || modelCode;
  const year = (row.year || "").toString().trim();
  const colour = (row.colour || "").trim();
  const orcRaw = (row.orc_status || "").replace(/#NAME?/g, "").trim();
  const orc = orcRaw === "+ORC" ? "+ORC" : orcRaw;
  const priceNum = row.price ? Number(row.price) : null;
  const price = priceNum ? `$${priceNum.toLocaleString("en-NZ")} ${orc}`.trim() : "";
  const financePerWeek = row.price_per_week ? Number(row.price_per_week) : null;
  const keyPoints = (row.key_points || "").replace(/^[\s\-]+/, "").trim();
  const features = [
    row.condition ? `Condition: ${row.condition}` : null,
    colour ? `Colour: ${colour}` : null,
    keyPoints ? keyPoints : null,
  ].filter(Boolean).join("\n");
  const engineCC = row.engine_cc ? row.engine_cc.toString().trim() : null;
  const kms = row.kms ? Number(row.kms) : null;
  return {
    dealer_id: dealerId,
    listing_type: "vehicle",
    stock_number: row.stock_number.toString().trim(),
    slug: `ahd-${stockNum}`,
    year, make, model,
    model_code: modelCode || null,
    colour, price,
    engine: engineCC ? `${engineCC}cc` : null,
    odometer: kms ? `${kms.toLocaleString("en-NZ")} km` : null,
    features,
    image_url: row.image_url || null,
    finance: financePerWeek ? `From $${financePerWeek.toFixed(2)}/week` : null,
    listing_url: row.stock_url || null,
    published: true,
  };
}

// ─── QR LABEL PDF GENERATOR ───────────────────────────────────────────────────
// Avery 99.1 x 67.7mm, 8 per sheet (2 cols x 4 rows)
// Uses jsPDF + qrcode library loaded dynamically

async function generateLabelPDF(listings, dealer) {
  // Load jsPDF
  await new Promise((resolve, reject) => {
    if (window.jspdf) return resolve();
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });

  // Load QRCode
  await new Promise((resolve, reject) => {
    if (window.QRCode) return resolve();
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });

  const { jsPDF } = window.jspdf;

  // A4 page dimensions in mm
  const pageW = 210;
  const pageH = 297;

  // Avery label dimensions
  const labelW = 99.1;
  const labelH = 67.7;
  const cols = 2;
  const rows = 4;

  // Page margins (centre the grid on A4)
  const marginLeft = (pageW - (cols * labelW)) / 2;
  const marginTop = (pageH - (rows * labelH)) / 2;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Colours
  const GREEN = [27, 97, 87];       // #1B6157
  const BLACK = [17, 17, 17];       // #111111
  const WHITE = [255, 255, 255];
  const LIGHTGREY = [245, 245, 245];
  const MIDGREY = [136, 136, 136];

  const publishedListings = listings.filter(l => l.published);
  let labelIndex = 0;

  // Generate QR code as data URL for a given URL
  async function getQRDataURL(url) {
    return new Promise(resolve => {
      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.left = '-9999px';
      document.body.appendChild(div);
      const qr = new window.QRCode(div, {
        text: url,
        width: 256, height: 256,
        colorDark: '#1B6157',
        colorLight: '#ffffff',
        correctLevel: window.QRCode.CorrectLevel.H,
      });
      setTimeout(() => {
        const img = div.querySelector('img') || div.querySelector('canvas');
        let dataUrl = '';
        if (img && img.tagName === 'IMG') dataUrl = img.src;
        else if (img && img.tagName === 'CANVAS') dataUrl = img.toDataURL();
        document.body.removeChild(div);
        resolve(dataUrl);
      }, 300);
    });
  }

  for (let i = 0; i < publishedListings.length; i++) {
    const listing = publishedListings[i];

    // New page when needed
    if (labelIndex > 0 && labelIndex % (cols * rows) === 0) {
      doc.addPage();
    }

    const posOnPage = labelIndex % (cols * rows);
    const col = posOnPage % cols;
    const row = Math.floor(posOnPage / cols);

    const x = marginLeft + col * labelW;
    const y = marginTop + row * labelH;

    // ── ROTATED PORTRAIT LAYOUT — manual coordinate maths, no matrix transform ──
    // The physical label cell is labelW(99.1) wide × labelH(67.7) tall on the page.
    // We draw our portrait design (dW=67.7 wide × dH=99.1 tall) rotated 90° CW
    // by converting portrait design coords (dx from left, dy from top) to page coords:
    //   pageX = x + dy * (labelW / dH)   — scale dy along page width
    //   pageY = y + labelH - dx * (labelH / dW)  — flip dx along page height
    // Since dW == labelH and dH == labelW the scale factors are both 1.0, simplifying to:
    //   pageX = x + dy
    //   pageY = y + labelH - dx
    // Rectangles: portrait rect(dx, dy, rw, rh) → page rect(x+dy, y+labelH-dx-rw, rh, rw)

    const dW = labelH;   // 67.7mm — portrait design width
    const dH = labelW;   // 99.1mm — portrait design height

    // Shorthand converters
    const rx = (dy) => x + dy;
    const ry = (dx, rw) => y + labelH - dx - rw;

    const headerH = 12;
    const qrSize = 52;

    // ── LABEL BACKGROUND ──
    doc.setFillColor(...WHITE);
    doc.rect(rx(0), y, labelW, labelH, 'F');

    // ── BLACK HEADER BAR — portrait top strip, now on the right side ──
    // portrait rect(0, 0, dW, headerH) → page rect(x, y+labelH-dW, headerH, dW)
    doc.setFillColor(...BLACK);
    doc.rect(x, y, headerH, labelH, 'F');

    // ── GREEN accent stripe (3mm) — far left of black bar ──
    doc.setFillColor(...GREEN);
    doc.rect(x, y, 3, labelH, 'F');

    // ── TAGLINE — rotated 90° text, reads bottom-to-top up the black bar ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...WHITE);
    // jsPDF angle: degrees CCW. To read bottom-to-top, use angle=90
    doc.text('Scan Me  ·  Save Me  ·  Share Me', x + 9, y + labelH - 4, { angle: 90 });

    // ── QR CODE — centred in the remaining space ──
    const qrUrl = `https://linqr.global/${listing.slug}`;
    const qrDataUrl = await getQRDataURL(qrUrl);
    // QR sits in the area from x+headerH to x+headerH+qrSize, centred vertically
    const qrX = x + headerH + 3;
    const qrY = y + (labelH - qrSize) / 2;
    if (qrDataUrl) {
      doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    }

    // ── LINQR logo overlay in centre of QR ──
    try {
      const logoW = qrSize * 0.28;
      const logoH = qrSize * 0.11;
      const logoX = qrX + (qrSize - logoW) / 2;
      const logoY = qrY + (qrSize - logoH) / 2;
      const padX = 2, padY = 2;
      doc.setFillColor(...GREEN);
      doc.roundedRect(logoX - padX, logoY - padY, logoW + padX * 2, logoH + padY * 2, 1.2, 1.2, 'F');
      doc.setDrawColor(...WHITE);
      doc.setLineWidth(0.5);
      doc.roundedRect(logoX - padX, logoY - padY, logoW + padX * 2, logoH + padY * 2, 1.2, 1.2, 'S');
      const logoDataUrl = await new Promise(resolve => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width; canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(null);
        img.src = '/LINQR-logo.png';
      });
      if (logoDataUrl) {
        doc.addImage(logoDataUrl, 'PNG', logoX, logoY, logoW, logoH);
      }
    } catch(e) { /* logo overlay optional */ }

    // ── GREEN vertical divider between QR and text ──
    const textX = qrX + qrSize + 3;
    doc.setDrawColor(...GREEN);
    doc.setLineWidth(0.4);
    doc.line(textX - 1, y + 4, textX - 1, y + labelH - 4);

    // ── TEXT ZONE — right of QR ──
    const textW = labelW - headerH - qrSize - 10;
    const midY = y + labelH / 2;

    // Dealer name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...BLACK);
    doc.text(dealer.name || '', textX, midY - 10, { maxWidth: textW });

    // Thin green rule under dealer name
    doc.setDrawColor(...GREEN);
    doc.setLineWidth(0.3);
    doc.line(textX, midY - 7, textX + textW, midY - 7);

    // Vehicle name
    const vehicleName = listing.listing_type === 'property'
      ? (listing.address || '')
      : `${listing.year || ''} ${listing.make || ''} ${listing.model || ''}`.trim();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...GREEN);
    doc.text(vehicleName, textX, midY - 1, { maxWidth: textW });

    // Stock number
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...MIDGREY);
    const stockLine = listing.listing_type === 'property'
      ? `ID: ${listing.property_id || ''}`
      : `Stock #${listing.stock_number}`;
    doc.text(stockLine, textX, midY + 7, { maxWidth: textW });

    // Copyright
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5);
    doc.setTextColor(...MIDGREY);
    doc.text('© LINQR 2026  ·  linqr.global', textX, y + labelH - 2, { maxWidth: textW });

    labelIndex++;
  }

  doc.save(`${dealer.code}-QR-Labels.pdf`);
}
// ─────────────────────────────────────────────────────────────────────────────


export default function PortalDashboard({ dealer, onLogout, onAddNew, onAddProperty, onEdit }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leadDays, setLeadDays] = useState(7);
  const [downloadingLeads, setDownloadingLeads] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const [generatingLabels, setGeneratingLabels] = useState(false);
  const [stockSearch, setStockSearch] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => { fetchListings(); }, []);

  async function fetchListings() {
    try {
      const res = await fetch(`${LINQR_SUPABASE_URL}/rest/v1/listings?dealer_id=eq.${dealer.id}&order=created_at.desc&select=*`, {
        headers: { "apikey": LINQR_ANON_KEY, "Authorization": `Bearer ${LINQR_ANON_KEY}` }
      });
      const data = await res.json();
      setListings(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
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

  async function handlePrintLabels() {
    const published = listings.filter(l => l.published);
    if (published.length === 0) {
      alert("No live listings to print labels for.");
      return;
    }
    setGeneratingLabels(true);
    try {
      await generateLabelPDF(listings, dealer);
    } catch (e) {
      console.error(e);
      alert("Label generation failed: " + e.message);
    } finally {
      setGeneratingLabels(false);
    }
  }

  // --- CSV IMPORT ---
  async function handleCSVUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length === 0) {
        setImportResult({ error: "No valid rows found in CSV." });
        setImporting(false);
        return;
      }
      const existingRes = await fetch(
        `${LINQR_SUPABASE_URL}/rest/v1/listings?dealer_id=eq.${dealer.id}&select=*`,
        { headers: { "apikey": LINQR_ANON_KEY, "Authorization": `Bearer ${LINQR_ANON_KEY}` } }
      );
      const existing = await existingRes.json();
      const existingByStock = {};
      (existing || []).forEach(l => {
        if (l.stock_number) existingByStock[l.stock_number.toString().trim()] = l;
      });
      let added = 0, updated = 0, unchanged = 0;
      const updateDetails = [];
      for (const row of rows) {
        const mapped = mapCSVToListing(row, dealer.id);
        const stockNum = row.stock_number.toString().trim();
        const existing = existingByStock[stockNum];
        if (!existing) {
          await fetch(`${LINQR_SUPABASE_URL}/rest/v1/listings`, {
            method: "POST",
            headers: { "apikey": LINQR_ANON_KEY, "Authorization": `Bearer ${LINQR_ANON_KEY}`, "Content-Type": "application/json", "Prefer": "return=minimal" },
            body: JSON.stringify(mapped)
          });
          added++;
        } else {
          const changed = [];
          if (existing.price !== mapped.price) changed.push(`price: ${existing.price} → ${mapped.price}`);
          if (existing.colour !== mapped.colour) changed.push(`colour: ${existing.colour} → ${mapped.colour}`);
          if (existing.model !== mapped.model) changed.push(`model: ${existing.model} → ${mapped.model}`);
          if (existing.year !== mapped.year) changed.push(`year: ${existing.year} → ${mapped.year}`);
          if (existing.features !== mapped.features) changed.push(`specs updated`);
          if (existing.image_url !== mapped.image_url) changed.push(`image updated`);
          if (existing.listing_url !== mapped.listing_url) changed.push(`listing URL updated`);
          if (existing.model_code !== mapped.model_code) changed.push(`model code updated`);
          if (existing.engine !== mapped.engine) changed.push(`engine: ${existing.engine} → ${mapped.engine}`);
          if (existing.odometer !== mapped.odometer) changed.push(`odometer: ${existing.odometer} → ${mapped.odometer}`);
          if (changed.length > 0) {
            await fetch(`${LINQR_SUPABASE_URL}/rest/v1/listings?id=eq.${existing.id}`, {
              method: "PATCH",
              headers: { "apikey": LINQR_ANON_KEY, "Authorization": `Bearer ${LINQR_ANON_KEY}`, "Content-Type": "application/json" },
              body: JSON.stringify(mapped)
            });
            updated++;
            updateDetails.push(`Stock #${stockNum} — ${changed.join(", ")}`);
          } else { unchanged++; }
        }
      }
      await fetchListings();
      setImportResult({ added, updated, unchanged, updateDetails });
    } catch (err) {
      console.error(err);
      setImportResult({ error: "Import failed: " + err.message });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function downloadLeads() {
    setDownloadingLeads(true);
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - leadDays);
      const fromISO = fromDate.toISOString();
      const slugs = listings.map(l => l.slug);
      const dealerCode = dealer.code.toLowerCase();
      if (slugs.length === 0) { alert("No listings found for this dealer."); setDownloadingLeads(false); return; }
      const res = await fetch(
        `${OLD_SUPABASE_URL}/rest/v1/sellsheet_contacts?created_at=gte.${fromISO}&order=created_at.desc&select=*`,
        { headers: { "apikey": OLD_ANON_KEY, "Authorization": `Bearer ${OLD_ANON_KEY}` } }
      );
      const allLeads = await res.json();
      const excludeEmails = ["pe@mothers.co.nz", "pemothersnz@gmail.com", dealer.email].filter(Boolean).map(e => e.toLowerCase());
      const dealerLeads = (allLeads || []).filter(lead => {
        if (!lead.car_url) return false;
        if (excludeEmails.includes((lead.email || "").toLowerCase())) return false;
        return slugs.some(slug => lead.car_url.includes(slug)) || lead.car_url.includes(`/${dealerCode}-`);
      });
      if (dealerLeads.length === 0) {
        alert(`No leads found in the last ${leadDays} days.\n\n(Your own test emails are excluded from the report)`);
        setDownloadingLeads(false);
        return;
      }
      const headers = ["Name", "Email", "Listing", "Reference", "Date"];
      const rows = dealerLeads.map(lead => {
        const matchedListing = listings.find(l => lead.car_url && lead.car_url.includes(l.slug));
        const listingName = matchedListing
          ? (matchedListing.listing_type === "property" ? matchedListing.address : `${matchedListing.year || ""} ${matchedListing.make} ${matchedListing.model}`.trim())
          : (lead.car_name || "");
        const reference = matchedListing
          ? (matchedListing.listing_type === "property" ? matchedListing.property_id : `Stock #${matchedListing.stock_number}`)
          : "";
        const date = lead.created_at
          ? new Date(lead.created_at).toLocaleDateString("en-NZ", { day: "2-digit", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
          : "";
        return [`"${lead.name || ""}"`, `"${lead.email || ""}"`, `"${listingName}"`, `"${reference}"`, `"${date}"`].join(",");
      });
      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${dealer.code}-leads-last-${leadDays}-days.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Something went wrong downloading leads.");
    } finally { setDownloadingLeads(false); }
  }

  const isRayWhite = dealer?.brand_colour === '#FFCD00';
  const isPropertyDealer = dealer?.dealer_type === 'property';
  const brandColour = dealer?.brand_colour || '#1B6157';
  const headerTextColour = isRayWhite ? '#000000' : '#ffffff';

  const filteredListings = stockSearch.trim()
    ? listings.filter(l => l.stock_number && l.stock_number.toString().includes(stockSearch.trim()))
    : listings;

  const AddButtons = () => (
    <div style={styles.addButtons}>
      {!isPropertyDealer && (
        <button style={{ ...styles.addBtn, background: brandColour, color: headerTextColour }} onClick={onAddNew}>
          🚗 Add Vehicle
        </button>
      )}
      {isPropertyDealer && (
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
              : dealer?.logo_url
                ? <img src={dealer.logo_url} alt={dealer.name} style={{ height: 40, width: 'auto' }} />
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

        {/* LEADS DOWNLOAD BAR */}
        <div style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#333', fontFamily: 'Georgia, serif' }}>📥 Download Leads</div>
          <select
            value={leadDays}
            onChange={e => setLeadDays(Number(e.target.value))}
            style={{ border: '1px solid #ddd', borderRadius: 6, padding: '6px 10px', fontSize: 13, fontFamily: 'Georgia, serif', color: '#333', cursor: 'pointer' }}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={downloadLeads}
            disabled={downloadingLeads}
            style={{ background: brandColour, color: isRayWhite ? '#000' : '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Georgia, serif' }}
          >
            {downloadingLeads ? 'Downloading...' : '⬇️ Download CSV'}
          </button>
          <span style={{ fontSize: 12, color: '#aaa', fontFamily: 'Georgia, serif' }}>Name · Email · Listing · Reference · Date</span>
        </div>

        {/* IMPORT STOCK BAR */}
        <div style={{ background: '#f9f9f9', borderBottom: '1px solid #eee', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#333', fontFamily: 'Georgia, serif' }}>📂 Import Stock</div>
          <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCSVUpload} />
          <button
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            disabled={importing}
            style={{ background: importing ? '#aaa' : '#111', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: importing ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif' }}
          >
            {importing ? 'Importing...' : '⬆️ Upload CSV'}
          </button>
          <span style={{ fontSize: 12, color: '#aaa', fontFamily: 'Georgia, serif' }}>Upload your stock CSV — new listings added, changes updated, unchanged skipped</span>
        </div>

        {/* PRINT LABELS BAR */}
        <div style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#333', fontFamily: 'Georgia, serif' }}>🏷️ Print QR Labels</div>
          <button
            onClick={handlePrintLabels}
            disabled={generatingLabels}
            style={{ background: generatingLabels ? '#aaa' : '#1B6157', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: generatingLabels ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif' }}
          >
            {generatingLabels ? 'Generating PDF...' : '🖨️ Print All Labels'}
          </button>
          <span style={{ fontSize: 12, color: '#aaa', fontFamily: 'Georgia, serif' }}>
            Avery 99.1 × 67.7mm · 8 per sheet · {listings.filter(l => l.published).length} live listings · {Math.ceil(listings.filter(l => l.published).length / 8)} sheet{Math.ceil(listings.filter(l => l.published).length / 8) !== 1 ? 's' : ''}
          </span>
        </div>

        {/* IMPORT RESULT */}
        {importResult && (
          <div style={{ background: importResult.error ? '#fff3f3' : '#f0fff4', borderBottom: '1px solid #eee', padding: '16px 24px' }}>
            {importResult.error ? (
              <p style={{ color: '#cc0000', fontSize: 13, margin: 0, fontFamily: 'Georgia, serif' }}>⚠️ {importResult.error}</p>
            ) : (
              <>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: '0 0 6px', fontFamily: 'Georgia, serif' }}>
                  ✅ Import complete — {importResult.added} added · {importResult.updated} updated · {importResult.unchanged} unchanged
                </p>
                {importResult.updateDetails.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    {importResult.updateDetails.map((d, i) => (
                      <p key={i} style={{ fontSize: 12, color: '#555', margin: '2px 0', fontFamily: 'Georgia, serif' }}>↻ {d}</p>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* CONTENT */}
        <div style={styles.content}>
          <div style={styles.contentHeader}>
            <h2 style={styles.contentTitle}>Your Listings</h2>
            <AddButtons />
          </div>

          {/* STOCK SEARCH */}
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="text"
              placeholder="🔍  Search by stock number..."
              value={stockSearch}
              onChange={e => setStockSearch(e.target.value)}
              style={{ border: '1px solid #ddd', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontFamily: 'Georgia, serif', color: '#333', width: 260, outline: 'none' }}
            />
            {stockSearch && (
              <button onClick={() => setStockSearch("")} style={{ background: 'none', border: 'none', fontSize: 13, color: '#888', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
                ✕ Clear
              </button>
            )}
            {stockSearch && (
              <span style={{ fontSize: 13, color: '#888', fontFamily: 'Georgia, serif' }}>
                {filteredListings.length} result{filteredListings.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {loading && <p style={styles.loadingText}>Loading your listings...</p>}

          {!loading && listings.length === 0 && (
            <div style={styles.emptyState}>
              <p style={styles.emptyIcon}>{isPropertyDealer ? '🏡' : '🚗'}</p>
              <p style={styles.emptyTitle}>No listings yet</p>
              <p style={styles.emptySub}>Add your first {isPropertyDealer ? 'property' : 'vehicle'} to get started</p>
              <AddButtons />
            </div>
          )}

          {!loading && stockSearch && filteredListings.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 24px', color: '#888', fontFamily: 'Georgia, serif', fontSize: 14 }}>
              No listing found for stock number "{stockSearch}"
            </div>
          )}

          {filteredListings.map(listing => (
            <div key={listing.id} style={styles.listingCard}>
              <div style={styles.listingLeft}>
                {listing.image_url
                  ? <img src={listing.image_url} alt={listing.model} style={styles.listingImg} />
                  : <div style={styles.listingImgPlaceholder}>📷</div>
                }
              </div>
              <div style={styles.listingInfo}>
                <p style={styles.listingTitle}>
                  {listing.listing_type === 'property' ? listing.address : `${listing.year} ${listing.make} ${listing.model}`}
                </p>
                <p style={styles.listingMeta}>
                  {listing.listing_type === 'property'
                    ? `${listing.suburb || ''} · ${listing.sale_method || ''} · ID: ${listing.property_id || ''}`
                    : [listing.colour, listing.engine, listing.odometer, `Stock #${listing.stock_number}`].filter(Boolean).join(' · ')}
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
