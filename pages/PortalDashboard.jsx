// © 2026 LINQR — linqr.global — All Rights Reserved
import { useState, useEffect, useRef } from "react";

const LINQR_SUPABASE_URL = "https://odnjkxgsgevuvjutqdmi.supabase.co";
const LINQR_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kbmpreGdzZ2V2dXZqdXRxZG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxOTY0NzksImV4cCI6MjA5NTc3MjQ3OX0.tuf7P4I1xTNUMqnNLBkxAfVi-Ny4vjlWQzIX3AgTFoE";

const OLD_SUPABASE_URL = "https://sfymjnjpqvgtoxofndzx.supabase.co";
const OLD_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmeW1qbmpwcXZndG94b2ZuZHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NzI1MTAsImV4cCI6MjA3MzE0ODUxMH0.RqBItIZ-Iz_XhKcJNsJSR6e3n5jxW_YKHWGHO5j1z2c";

function parseCSV(text) {
  const normalised = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  function tokenise(str) {
    const rows = []; let row = []; let field = ""; let inQuotes = false;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (ch === '"') { if (inQuotes && str[i+1]==='"') { field+='"'; i++; } else { inQuotes=!inQuotes; } }
      else if (ch==="," && !inQuotes) { row.push(field.trim()); field=""; }
      else if (ch==="\n" && !inQuotes) { row.push(field.trim()); if(row.some(v=>v!=="")) rows.push(row); row=[]; field=""; }
      else { field+=ch; }
    }
    row.push(field.trim()); if(row.some(v=>v!=="")) rows.push(row); return rows;
  }
  const rows = tokenise(normalised); if(rows.length<2) return [];
  const headers = rows[0].map(h=>h.replace(/^"|"$/g,"").trim());
  return rows.slice(1).map(values=>{
    const row={};
    headers.forEach((h,i)=>{ let val=(values[i]||"").replace(/^"|"$/g,"").replace(/#NAME\?/g,"").trim(); row[h]=val; });
    return row;
  }).filter(row=>row.stock_number&&row.stock_number.match(/^\d+$/));
}

function mapCSVToListing(row, dealerId) {
  const stockNum=(row.stock_number||"").toString().toLowerCase().trim();
  const make=(row.make||"").trim();
  const modelName=(row.model_name||"").trim();
  const modelCode=(row.model_code||"").trim();
  const model=modelName||modelCode;
  const year=(row.year||"").toString().trim();
  const colour=(row.colour||"").trim();
  const orcRaw=(row.orc_status||"").replace(/#NAME?/g,"").trim();
  const orc=orcRaw==="+ORC"?"+ORC":orcRaw;
  const priceNum=row.price?Number(row.price):null;
  const price=priceNum?`$${priceNum.toLocaleString("en-NZ")} ${orc}`.trim():"";
  const financePerWeek=row.price_per_week?Number(row.price_per_week):null;
  const keyPoints=(row.key_points||"").replace(/^[\s\-]+/,"").trim();
  const features=[row.condition?`Condition: ${row.condition}`:null,colour?`Colour: ${colour}`:null,keyPoints?keyPoints:null].filter(Boolean).join("\n");
  const engineCC=row.engine_cc?row.engine_cc.toString().trim():null;
  const kms=row.kms?Number(row.kms):null;
  return {
    dealer_id:dealerId, listing_type:"vehicle",
    stock_number:row.stock_number.toString().trim(),
    slug:`ahd-${stockNum}`, year, make, model,
    model_code:modelCode||null, colour, price,
    engine:engineCC?`${engineCC}cc`:null,
    odometer:kms?`${kms.toLocaleString("en-NZ")} km`:null,
    features, image_url:row.image_url||null,
    finance:financePerWeek?`From $${financePerWeek.toFixed(2)}/week`:null,
    listing_url:row.stock_url||null, published:true,
  };
}
// ─── QR LABEL PDF GENERATOR ───────────────────────────────────────────────────
// Avery 938207 — 99.1mm × 67.7mm — A4 portrait — 2 cols × 4 rows = 8 labels

async function generateLabelPDF(listings, dealer, singleListing = null) {

  // Load jsPDF
  await new Promise((resolve, reject) => {
    if (window.jspdf) return resolve();
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

  // Load QRCode library
  await new Promise((resolve, reject) => {
    if (window.QRCode) return resolve();
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

  const { jsPDF } = window.jspdf;

  // ── Dimensions ─────────────────────────────────────────────────────────────
  const LW = 99.1;
  const LH = 67.7;
  const COLS = 2;
  const ROWS = 4;

  const PAGE_W = 210;
  const PAGE_H = 297;

  const MARGIN_LEFT = (PAGE_W - COLS * LW) / 2;
  const MARGIN_TOP = 13;

  // ── Colours ───────────────────────────────────────────────────────────────
  const GREEN = [29, 107, 74];
  const BLACK = [26, 26, 26];
  const WHITE = [255, 255, 255];
  const DKGREY = [26, 26, 26];
  const GREY = [90, 90, 90];
  const LGREY = [120, 120, 120];

  // ── QR helper ─────────────────────────────────────────────────────────────
  async function getQRDataURL(url) {
    return new Promise(resolve => {
      const div = document.createElement('div');
      div.style.cssText = 'position:absolute;left:-9999px;top:-9999px;';
      document.body.appendChild(div);

      new window.QRCode(div, {
        text: url,
        width: 256,
        height: 256,
        colorDark: '#1D6B4A',
        colorLight: '#ffffff',
        correctLevel: window.QRCode.CorrectLevel.H
      });

      setTimeout(() => {
        const el = div.querySelector('canvas') || div.querySelector('img');
        const dataUrl = el
          ? (el.tagName === 'CANVAS' ? el.toDataURL('image/png') : el.src)
          : '';
        document.body.removeChild(div);
        resolve(dataUrl);
      }, 200);
    });
  }

  async function getLogoDataURL() {
    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        c.getContext('2d').drawImage(img, 0, 0);
        resolve(c.toDataURL('image/png'));
      };
      img.onerror = () => resolve(null);
      img.src = '/LINQR-logo.png';
    });
  }

  const logoDataUrl = await getLogoDataURL();

  // ── Determine listings to print ───────────────────────────────────────────
  const publishedListings = singleListing
    ? [singleListing]
    : listings.filter(l => l.published);

  // ── Create PDF ────────────────────────────────────────────────────────────
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  let labelIndex = 0;

  for (let i = 0; i < publishedListings.length; i++) {
    const listing = publishedListings[i];

    if (labelIndex > 0 && labelIndex % (COLS * ROWS) === 0) doc.addPage();

    const pos = labelIndex % (COLS * ROWS);
    const col = pos % COLS;
    const row = Math.floor(pos / COLS);

    const lx = MARGIN_LEFT + col * LW;
    const ly = MARGIN_TOP + row * LH;

    // ── Tuned Layout ────────────────────────────────────────────────────────
    const GREEN_BAR_H = 2.8;
    const BLACK_BAR_H = 10.5;
    const QR_PADDING = 2.8;

    const QR_SIZE = LH - GREEN_BAR_H * 2 - BLACK_BAR_H - QR_PADDING * 2;

    const QR_X = lx + QR_PADDING;
    const QR_Y = ly + GREEN_BAR_H + BLACK_BAR_H + QR_PADDING;

    const TEXT_X = lx + QR_SIZE + QR_PADDING * 3;
    const TEXT_W = LW - QR_SIZE - QR_PADDING * 4;

    const BODY_Y = ly + GREEN_BAR_H + BLACK_BAR_H;
    const BODY_H = LH - GREEN_BAR_H * 2 - BLACK_BAR_H;

    // Background
    doc.setFillColor(...WHITE);
    doc.rect(lx, ly, LW, LH, 'F');

    // Full‑bleed bars (drawn FIRST)
    doc.setFillColor(...GREEN);
    doc.rect(0, ly, PAGE_W, GREEN_BAR_H, 'F');

    doc.setFillColor(...BLACK);
    doc.rect(0, ly + GREEN_BAR_H, PAGE_W, BLACK_BAR_H, 'F');

    doc.setFillColor(...GREEN);
    doc.rect(0, ly + LH - GREEN_BAR_H, PAGE_W, GREEN_BAR_H, 'F');

    // Scan Me text (must be AFTER bars)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(...WHITE);
    doc.text(
      'Scan Me · Save Me · Share Me',
      lx + LW / 2,
      ly + GREEN_BAR_H + BLACK_BAR_H / 2,
      { align: 'center', baseline: 'middle' }
    );

    // QR code
    const qrUrl = `https://linqr.global/${listing.slug}`;
    const qrDataUrl = await getQRDataURL(qrUrl);
    if (qrDataUrl) {
      doc.addImage(qrDataUrl, 'PNG', QR_X, QR_Y, QR_SIZE, QR_SIZE);
    }

    // LINQR badge
    try {
      const badgeW = QR_SIZE * 0.55;
      const badgeH = QR_SIZE * 0.18;
      const badgeX = QR_X + (QR_SIZE - badgeW) / 2;
      const badgeY = QR_Y + (QR_SIZE - badgeH) / 2;

      doc.setFillColor(...GREEN);
      doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1.2, 1.2, 'F');

      doc.setDrawColor(...WHITE);
      doc.setLineWidth(0.3);
      doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1.2, 1.2, 'S');

      if (logoDataUrl) {
        const logoW = badgeW * 0.75;
        const logoH = badgeH * 0.65;
        doc.addImage(
          logoDataUrl,
          'PNG',
          badgeX + (badgeW - logoW) / 2,
          badgeY + (badgeH - logoH) / 2,
          logoW,
          logoH
        );
      } else {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(5);
        doc.setTextColor(...WHITE);
        doc.text('®LINQR™', badgeX + badgeW / 2, badgeY + badgeH / 2, {
          align: 'center',
          baseline: 'middle'
        });
      }
    } catch (e) {}

    // Dealer name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...DKGREY);

    const dealerLines = doc.splitTextToSize(dealer.name || '', TEXT_W);
    doc.text(dealerLines, TEXT_X, BODY_Y + BODY_H * 0.22);

    // Vehicle name
    const vehicleName =
      listing.listing_type === 'property'
        ? listing.address || ''
        : `${listing.year || ''} ${listing.make || ''} ${listing.model || ''}`.trim();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...GREEN);

    const vehicleLines = doc.splitTextToSize(vehicleName, TEXT_W);
    doc.text(vehicleLines, TEXT_X, BODY_Y + BODY_H * 0.48);

    // Stock / ID
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.4);
    doc.setTextColor(...GREY);

    const stockLine =
      listing.listing_type === 'property'
        ? `ID: ${listing.property_id || ''}`
        : `Stock #${listing.stock_number}`;

    doc.text(
      stockLine,
      TEXT_X + TEXT_W / 2,
      BODY_Y + BODY_H * 0.82,
      { align: 'center' }
    );

    // Copyright
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...LGREY);
    doc.text(
      '© LINQR 2026 · linqr.global',
      TEXT_X + TEXT_W / 2,
      BODY_Y + BODY_H * 0.93,
      { align: 'center' }
    );

    labelIndex++;
  }

  const filename = singleListing
    ? `${dealer.code}-label-${singleListing.stock_number || singleListing.property_id}.pdf`
    : `${dealer.code}-QR-Labels-8up.pdf`;

  doc.save(filename);
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

  useEffect(()=>{ fetchListings(); },[]);

  async function fetchListings() {
    try {
      const res=await fetch(`${LINQR_SUPABASE_URL}/rest/v1/listings?dealer_id=eq.${dealer.id}&order=created_at.desc&select=*`,{ headers:{"apikey":LINQR_ANON_KEY,"Authorization":`Bearer ${LINQR_ANON_KEY}`} });
      const data=await res.json(); setListings(data||[]);
    } catch(e){ console.error(e); } finally{ setLoading(false); }
  }

  async function togglePublished(listing) {
    await fetch(`${LINQR_SUPABASE_URL}/rest/v1/listings?id=eq.${listing.id}`,{ method:"PATCH", headers:{"apikey":LINQR_ANON_KEY,"Authorization":`Bearer ${LINQR_ANON_KEY}`,"Content-Type":"application/json"}, body:JSON.stringify({published:!listing.published}) });
    fetchListings();
  }

  async function deleteListing(id) {
    if(!confirm("Delete this listing?")) return;
    await fetch(`${LINQR_SUPABASE_URL}/rest/v1/listings?id=eq.${id}`,{ method:"DELETE", headers:{"apikey":LINQR_ANON_KEY,"Authorization":`Bearer ${LINQR_ANON_KEY}`} });
    fetchListings();
  }

  async function handlePrintLabels() {
    const published=listings.filter(l=>l.published);
    if(published.length===0){ alert("No live listings to print labels for."); return; }
    setGeneratingLabels(true);
    try { await generateLabelPDF(listings, dealer); }
    catch(e){ console.error(e); alert("Label generation failed: "+e.message); }
    finally{ setGeneratingLabels(false); }
  }

  async function handlePrintSingleLabel(listing) {
    setGeneratingLabels(true);
    try { await generateLabelPDF(listings, dealer, listing); }
    catch(e){ console.error(e); alert("Label generation failed: "+e.message); }
    finally{ setGeneratingLabels(false); }
  }

  async function handleCSVUpload(e) {
    const file=e.target.files[0]; if(!file) return;
    setImporting(true); setImportResult(null);
    try {
      const text=await file.text(); const rows=parseCSV(text);
      if(rows.length===0){ setImportResult({error:"No valid rows found in CSV."}); setImporting(false); return; }
      const existingRes=await fetch(`${LINQR_SUPABASE_URL}/rest/v1/listings?dealer_id=eq.${dealer.id}&select=*`,{ headers:{"apikey":LINQR_ANON_KEY,"Authorization":`Bearer ${LINQR_ANON_KEY}`} });
      const existing=await existingRes.json();
      const existingByStock={};
      (existing||[]).forEach(l=>{ if(l.stock_number) existingByStock[l.stock_number.toString().trim()]=l; });
      let added=0,updated=0,unchanged=0; const updateDetails=[];
      for(const row of rows) {
        const mapped=mapCSVToListing(row,dealer.id);
        const stockNum=row.stock_number.toString().trim();
        const ex=existingByStock[stockNum];
        if(!ex){
          await fetch(`${LINQR_SUPABASE_URL}/rest/v1/listings`,{ method:"POST", headers:{"apikey":LINQR_ANON_KEY,"Authorization":`Bearer ${LINQR_ANON_KEY}`,"Content-Type":"application/json","Prefer":"return=minimal"}, body:JSON.stringify(mapped) });
          added++;
        } else {
          const changed=[];
          if(ex.price!==mapped.price) changed.push(`price: ${ex.price} → ${mapped.price}`);
          if(ex.colour!==mapped.colour) changed.push(`colour: ${ex.colour} → ${mapped.colour}`);
          if(ex.model!==mapped.model) changed.push(`model: ${ex.model} → ${mapped.model}`);
          if(ex.year!==mapped.year) changed.push(`year: ${ex.year} → ${mapped.year}`);
          if(ex.features!==mapped.features) changed.push(`specs updated`);
          if(ex.image_url!==mapped.image_url) changed.push(`image updated`);
          if(ex.listing_url!==mapped.listing_url) changed.push(`listing URL updated`);
          if(ex.model_code!==mapped.model_code) changed.push(`model code updated`);
          if(ex.engine!==mapped.engine) changed.push(`engine: ${ex.engine} → ${mapped.engine}`);
          if(ex.odometer!==mapped.odometer) changed.push(`odometer: ${ex.odometer} → ${mapped.odometer}`);
          if(changed.length>0){
            await fetch(`${LINQR_SUPABASE_URL}/rest/v1/listings?id=eq.${ex.id}`,{ method:"PATCH", headers:{"apikey":LINQR_ANON_KEY,"Authorization":`Bearer ${LINQR_ANON_KEY}`,"Content-Type":"application/json"}, body:JSON.stringify(mapped) });
            updated++; updateDetails.push(`Stock #${stockNum} — ${changed.join(", ")}`);
          } else { unchanged++; }
        }
      }
      await fetchListings(); setImportResult({added,updated,unchanged,updateDetails});
    } catch(err){ console.error(err); setImportResult({error:"Import failed: "+err.message}); }
    finally{ setImporting(false); if(fileInputRef.current) fileInputRef.current.value=""; }
  }

  async function downloadLeads() {
    setDownloadingLeads(true);
    try {
      const fromDate=new Date(); fromDate.setDate(fromDate.getDate()-leadDays); const fromISO=fromDate.toISOString();
      const dealerCode=dealer.code.toLowerCase();
      if(listings.length===0){ alert("No listings found for this dealer."); setDownloadingLeads(false); return; }
      const res=await fetch(`${OLD_SUPABASE_URL}/rest/v1/sellsheet_contacts?created_at=gte.${fromISO}&order=created_at.desc&select=*`,{ headers:{"apikey":OLD_ANON_KEY,"Authorization":`Bearer ${OLD_ANON_KEY}`} });
      const allLeads=await res.json();
      const excludeEmails=["pe@mothers.co.nz","pemothersnz@gmail.com",dealer.email].filter(Boolean).map(e=>e.toLowerCase());
      const dealerLeads=(allLeads||[]).filter(lead=>{
        if(!lead.car_url) return false;
        if(excludeEmails.includes((lead.email||"").toLowerCase())) return false;
        return lead.car_url.includes(`/${dealerCode}-`);
      });
      if(dealerLeads.length===0){ alert(`No leads found in the last ${leadDays} days.`); setDownloadingLeads(false); return; }
      const headers=["Name","Email","Listing","Reference","Date"];
      const rows=dealerLeads.map(lead=>{
        const matchedListing=listings.find(l=>lead.car_url&&lead.car_url.includes(l.slug));
        const listingName=matchedListing?(matchedListing.listing_type==="property"?matchedListing.address:`${matchedListing.year||""} ${matchedListing.make} ${matchedListing.model}`.trim()):(lead.car_name||"");
        const reference=matchedListing?(matchedListing.listing_type==="property"?matchedListing.property_id:`Stock #${matchedListing.stock_number}`):"";
        const date=lead.created_at?new Date(lead.created_at).toLocaleDateString("en-NZ",{day:"2-digit",month:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"}):"";
        return [`"${lead.name||""}"`,`"${lead.email||""}"`,`"${listingName}"`,`"${reference}"`,`"${date}"`].join(",");
      });
      const csv=[headers.join(","),...rows].join("\n");
      const blob=new Blob([csv],{type:"text/csv"}); const url=URL.createObjectURL(blob);
      const a=document.createElement("a"); a.href=url; a.download=`${dealer.code}-leads-last-${leadDays}-days.csv`; a.click(); URL.revokeObjectURL(url);
    } catch(e){ console.error(e); alert("Something went wrong downloading leads."); }
    finally{ setDownloadingLeads(false); }
  }

  const isRayWhite=dealer?.brand_colour==='#FFCD00';
  const isPropertyDealer=dealer?.dealer_type==='property';
  const brandColour=dealer?.brand_colour||'#1B6157';
  const headerTextColour=isRayWhite?'#000000':'#ffffff';
  const filteredListings=stockSearch.trim()?listings.filter(l=>l.stock_number&&l.stock_number.toString().includes(stockSearch.trim())):listings;

  const AddButtons=()=>(
    <div style={styles.addButtons}>
      {!isPropertyDealer&&(<button style={{...styles.addBtn,background:brandColour,color:headerTextColour}} onClick={onAddNew}>🚗 Add Vehicle</button>)}
      {isPropertyDealer&&(<button style={{...styles.addBtn,background:isRayWhite?'#111':brandColour,color:isRayWhite?'#FFCD00':'#fff'}} onClick={onAddProperty}>🏡 Add Property</button>)}
    </div>
  );

  return (
    <div style={styles.outer}><div style={styles.page}>

      <div style={{...styles.header,background:brandColour}}>
        <div>
          {isRayWhite?<div style={{fontWeight:900,fontSize:22,color:'#000',letterSpacing:1}}>RAY WHITE</div>
            :dealer?.logo_url?<img src={dealer.logo_url} alt={dealer.name} style={{height:40,width:'auto'}}/>
            :<img src="/LINQR-logo.png" alt="LINQR" style={styles.logo}/>}
        </div>
        <div style={styles.headerRight}>
          <p style={{...styles.dealerName,color:headerTextColour}}>{dealer.name}</p>
          <button style={{...styles.logoutBtn,color:headerTextColour}} onClick={onLogout}>Sign Out</button>
        </div>
      </div>

      <div style={styles.statsBar}>
        <div style={styles.statItem}><p style={{...styles.statValue,color:brandColour}}>{listings.length}</p><p style={styles.statLabel}>Total Listings</p></div>
        <div style={styles.statItem}><p style={{...styles.statValue,color:brandColour}}>{listings.filter(l=>l.published).length}</p><p style={styles.statLabel}>Live</p></div>
        <div style={styles.statItem}><p style={{...styles.statValue,color:brandColour}}>{listings.filter(l=>!l.published).length}</p><p style={styles.statLabel}>Draft</p></div>
        <div style={styles.statItem}><p style={{...styles.statValue,color:brandColour}}>{dealer.code}</p><p style={styles.statLabel}>Dealer Code</p></div>
      </div>

      <div style={{background:'#fff',borderBottom:'1px solid #eee',padding:'14px 24px',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
        <div style={{fontSize:13,fontWeight:700,color:'#333',fontFamily:'Georgia, serif'}}>📥 Download Leads</div>
        <select value={leadDays} onChange={e=>setLeadDays(Number(e.target.value))} style={{border:'1px solid #ddd',borderRadius:6,padding:'6px 10px',fontSize:13,fontFamily:'Georgia, serif',color:'#333',cursor:'pointer'}}>
          <option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option>
        </select>
        <button onClick={downloadLeads} disabled={downloadingLeads} style={{background:brandColour,color:isRayWhite?'#000':'#fff',border:'none',borderRadius:6,padding:'8px 18px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'Georgia, serif'}}>
          {downloadingLeads?'Downloading...':'⬇️ Download CSV'}
        </button>
        <span style={{fontSize:12,color:'#aaa',fontFamily:'Georgia, serif'}}>Name · Email · Listing · Reference · Date</span>
      </div>

      <div style={{background:'#f9f9f9',borderBottom:'1px solid #eee',padding:'14px 24px',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
        <div style={{fontSize:13,fontWeight:700,color:'#333',fontFamily:'Georgia, serif'}}>📂 Import Stock</div>
        <input ref={fileInputRef} type="file" accept=".csv" style={{display:'none'}} onChange={handleCSVUpload}/>
        <button onClick={()=>fileInputRef.current&&fileInputRef.current.click()} disabled={importing} style={{background:importing?'#aaa':'#111',color:'#fff',border:'none',borderRadius:6,padding:'8px 18px',fontSize:13,fontWeight:700,cursor:importing?'not-allowed':'pointer',fontFamily:'Georgia, serif'}}>
          {importing?'Importing...':'⬆️ Upload CSV'}
        </button>
        <span style={{fontSize:12,color:'#aaa',fontFamily:'Georgia, serif'}}>Upload your stock CSV — new listings added, changes updated, unchanged skipped</span>
      </div>

      <div style={{background:'#fff',borderBottom:'1px solid #eee',padding:'14px 24px',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
        <div style={{fontSize:13,fontWeight:700,color:'#333',fontFamily:'Georgia, serif'}}>🏷️ Print QR Labels</div>
        <button onClick={handlePrintLabels} disabled={generatingLabels} style={{background:generatingLabels?'#aaa':'#1B6157',color:'#fff',border:'none',borderRadius:6,padding:'8px 18px',fontSize:13,fontWeight:700,cursor:generatingLabels?'not-allowed':'pointer',fontFamily:'Georgia, serif'}}>
          {generatingLabels?'Generating PDF...':'🖨️ Print All Labels'}
        </button>
        <span style={{fontSize:12,color:'#aaa',fontFamily:'Georgia, serif'}}>
          Avery 938207 · 99.1×67.7mm · 8 per sheet · {listings.filter(l=>l.published).length} live listings · {Math.ceil(listings.filter(l=>l.published).length/8)} sheet{Math.ceil(listings.filter(l=>l.published).length/8)!==1?'s':''}
        </span>
      </div>

      {importResult&&(
        <div style={{background:importResult.error?'#fff3f3':'#f0fff4',borderBottom:'1px solid #eee',padding:'16px 24px'}}>
          {importResult.error
            ?<p style={{color:'#cc0000',fontSize:13,margin:0,fontFamily:'Georgia, serif'}}>⚠️ {importResult.error}</p>
            :<><p style={{fontSize:14,fontWeight:700,color:'#111',margin:'0 0 6px',fontFamily:'Georgia, serif'}}>✅ Import complete — {importResult.added} added · {importResult.updated} updated · {importResult.unchanged} unchanged</p>
              {importResult.updateDetails.length>0&&<div style={{marginTop:8}}>{importResult.updateDetails.map((d,i)=>(<p key={i} style={{fontSize:12,color:'#555',margin:'2px 0',fontFamily:'Georgia, serif'}}>↻ {d}</p>))}</div>}</>
          }
        </div>
      )}

      <div style={styles.content}>
        <div style={styles.contentHeader}><h2 style={styles.contentTitle}>Your Listings</h2><AddButtons/></div>

        <div style={{marginBottom:16,display:'flex',alignItems:'center',gap:10}}>
          <input type="text" placeholder="🔍  Search by stock number..." value={stockSearch} onChange={e=>setStockSearch(e.target.value)}
            style={{border:'1px solid #ddd',borderRadius:8,padding:'10px 14px',fontSize:13,fontFamily:'Georgia, serif',color:'#333',width:260,outline:'none'}}/>
          {stockSearch&&<button onClick={()=>setStockSearch("")} style={{background:'none',border:'none',fontSize:13,color:'#888',cursor:'pointer',fontFamily:'Georgia, serif'}}>✕ Clear</button>}
          {stockSearch&&<span style={{fontSize:13,color:'#888',fontFamily:'Georgia, serif'}}>{filteredListings.length} result{filteredListings.length!==1?'s':''}</span>}
        </div>

        {loading&&<p style={styles.loadingText}>Loading your listings...</p>}
        {!loading&&listings.length===0&&(<div style={styles.emptyState}><p style={styles.emptyIcon}>{isPropertyDealer?'🏡':'🚗'}</p><p style={styles.emptyTitle}>No listings yet</p><p style={styles.emptySub}>Add your first {isPropertyDealer?'property':'vehicle'} to get started</p><AddButtons/></div>)}
        {!loading&&stockSearch&&filteredListings.length===0&&(<div style={{textAlign:'center',padding:'40px 24px',color:'#888',fontFamily:'Georgia, serif',fontSize:14}}>No listing found for stock number "{stockSearch}"</div>)}

        {filteredListings.map(listing=>(
          <div key={listing.id} style={styles.listingCard}>
            <div style={styles.listingLeft}>
              {listing.image_url?<img src={listing.image_url} alt={listing.model} style={styles.listingImg}/>:<div style={styles.listingImgPlaceholder}>📷</div>}
            </div>
            <div style={styles.listingInfo}>
              <p style={styles.listingTitle}>{listing.listing_type==='property'?listing.address:`${listing.year} ${listing.make} ${listing.model}`}</p>
              <p style={styles.listingMeta}>{listing.listing_type==='property'?`${listing.suburb||''} · ${listing.sale_method||''} · ID: ${listing.property_id||''}`:[listing.colour,listing.engine,listing.odometer,`Stock #${listing.stock_number}`].filter(Boolean).join(' · ')}</p>
              <p style={{...styles.listingPrice,color:brandColour}}>{listing.price}</p>
              <div style={styles.listingUrl}>
                <span style={styles.urlText}>linqr.global/{listing.slug}</span>
                <a href={`https://linqr.global/${listing.slug}`} target="_blank" rel="noopener noreferrer" style={{...styles.viewLink,color:brandColour}}>View →</a>
              </div>
            </div>
            <div style={styles.listingActions}>
              <div style={{...styles.statusBadge,background:listing.published?"#d4edda":"#fff3cd",color:listing.published?"#155724":"#856404"}}>{listing.published?"● Live":"○ Draft"}</div>
              <button style={styles.actionBtn} onClick={()=>togglePublished(listing)}>{listing.published?"Unpublish":"Publish"}</button>
              <button style={styles.actionBtn} onClick={()=>onEdit(listing)}>Edit</button>
              <button style={{...styles.actionBtn,color:'#1B6157',fontWeight:700}} onClick={()=>handlePrintSingleLabel(listing)}>🏷️ Label</button>
              <button style={{...styles.actionBtn,color:"#cc0000"}} onClick={()=>deleteListing(listing.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.footer}><p style={styles.footerText}>© LINQR 2026 · linqr.global</p></div>
    </div></div>
  );
}

const styles = {
  outer:{minHeight:"100vh",background:"#f5f5f5"},
  page:{maxWidth:900,margin:"0 auto",padding:"0 0 40px"},
  header:{padding:"16px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"},
  logo:{height:36,width:"auto"},
  headerRight:{display:"flex",alignItems:"center",gap:16},
  dealerName:{fontSize:14,fontWeight:700,margin:0},
  logoutBtn:{background:"rgba(0,0,0,0.1)",border:"none",borderRadius:6,padding:"8px 16px",fontSize:13,cursor:"pointer",fontFamily:"Georgia, serif"},
  statsBar:{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",background:"#fff",borderBottom:"1px solid #eee",padding:"20px 24px"},
  statItem:{textAlign:"center"},
  statValue:{fontSize:28,fontWeight:900,margin:"0 0 4px",fontFamily:"Georgia, serif"},
  statLabel:{fontSize:11,color:"#888",margin:0,letterSpacing:1,textTransform:"uppercase"},
  content:{padding:"24px"},
  contentHeader:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20},
  contentTitle:{fontSize:20,fontWeight:700,color:"#111",margin:0,fontFamily:"Georgia, serif"},
  addButtons:{display:"flex",gap:10},
  addBtn:{border:"none",borderRadius:8,padding:"12px 20px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"Georgia, serif"},
  loadingText:{textAlign:"center",color:"#888",padding:40},
  emptyState:{textAlign:"center",padding:"60px 24px",background:"#fff",borderRadius:12,border:"2px dashed #e0e0e0"},
  emptyIcon:{fontSize:48,margin:"0 0 16px"},
  emptyTitle:{fontSize:20,fontWeight:700,color:"#111",margin:"0 0 8px",fontFamily:"Georgia, serif"},
  emptySub:{fontSize:14,color:"#888",margin:"0 0 24px"},
  listingCard:{background:"#fff",borderRadius:12,padding:"16px",marginBottom:12,display:"flex",gap:16,alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"},
  listingLeft:{flexShrink:0},
  listingImg:{width:100,height:70,objectFit:"cover",borderRadius:8},
  listingImgPlaceholder:{width:100,height:70,background:"#f0f0f0",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24},
  listingInfo:{flex:1},
  listingTitle:{fontSize:16,fontWeight:700,color:"#111",margin:"0 0 4px",fontFamily:"Georgia, serif"},
  listingMeta:{fontSize:13,color:"#888",margin:"0 0 4px"},
  listingPrice:{fontSize:15,fontWeight:700,margin:"0 0 6px"},
  listingUrl:{display:"flex",alignItems:"center",gap:8},
  urlText:{fontSize:12,color:"#888",background:"#f5f5f5",padding:"4px 8px",borderRadius:4},
  viewLink:{fontSize:12,fontWeight:700,textDecoration:"none"},
  listingActions:{display:"flex",flexDirection:"column",gap:8,alignItems:"flex-end",flexShrink:0},
  statusBadge:{fontSize:12,fontWeight:700,padding:"4px 10px",borderRadius:20},
  actionBtn:{background:"transparent",border:"1px solid #ddd",borderRadius:6,padding:"6px 12px",fontSize:12,cursor:"pointer",fontFamily:"Georgia, serif",color:"#444"},
  footer:{textAlign:"center",padding:24},
  footerText:{fontSize:11,color:"#bbb",margin:0},
};
