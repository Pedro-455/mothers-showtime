// © 2026 LINQR — linqr.global — All Rights Reserved
import { useState, useEffect, useRef } from "react";

const LINQR_SUPABASE_URL = "https://odnjkxgsgevuvjutqdmi.supabase.co";
const LINQR_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kbmpreGdzZ2V2dXZqdXRxZG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxOTY0NzksImV4cCI6MjA5NTc3MjQ3OX0.tuf7P4I1xTNUMqnNLBkxAfVi-Ny4vjlWQzIX3AgTFoE";

const OLD_SUPABASE_URL = "https://sfymjnjpqvgtoxofndzx.supabase.co";
const OLD_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmeW1qbmpwcXZndG94b2ZuZHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NzI1MTAsImV4cCI6MjA3MzE0ODUxMH0.RqBItIZ-Iz_XhKcJNsJSR6e3n5jxW_YKHWGHO5j1z2c";

// ─── COLOUR HELPERS ───────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return [parseInt(clean.substring(0,2),16), parseInt(clean.substring(2,4),16), parseInt(clean.substring(4,6),16)];
}
function brightness(hex) {
  const [r,g,b] = hexToRgb(hex);
  return (r*299 + g*587 + b*114) / 1000;
}
function getLabelColours(brandHex) {
  const LINQR_GREEN = [29,107,74];
  const BLACK = [26,26,26];
  const WHITE = [255,255,255];
  const brandRgb = hexToRgb(brandHex);
  const isLight = brightness(brandHex) > 160;
  return {
    stripe: brandRgb, qrDark: isLight ? BLACK : brandRgb,
    vehicleText: isLight ? BLACK : brandRgb, badge: LINQR_GREEN,
    black: BLACK, white: WHITE, grey: [90,90,90], lgrey: [120,120,120], dkgrey: BLACK,
  };
}

// ─── CSV PARSER ───────────────────────────────────────────────────────────────
function parseCSV(text) {
  const normalised = text.replace(/\r\n/g,"\n").replace(/\r/g,"\n");
  function tokenise(str) {
    const rows=[]; let row=[]; let field=""; let inQuotes=false;
    for (let i=0;i<str.length;i++) {
      const ch=str[i];
      if(ch==='"'){if(inQuotes&&str[i+1]==='"'){field+='"';i++;}else{inQuotes=!inQuotes;}}
      else if(ch===","&&!inQuotes){row.push(field.trim());field="";}
      else if(ch==="\n"&&!inQuotes){row.push(field.trim());if(row.some(v=>v!==""))rows.push(row);row=[];field="";}
      else{field+=ch;}
    }
    row.push(field.trim());if(row.some(v=>v!==""))rows.push(row);return rows;
  }
  const rows=tokenise(normalised);if(rows.length<2)return[];
  const headers=rows[0].map(h=>h.replace(/^"|"$/g,"").trim());
  return rows.slice(1).map(values=>{
    const row={};
    headers.forEach((h,i)=>{let val=(values[i]||"").replace(/^"|"$/g,"").replace(/#NAME\?/g,"").trim();row[h]=val;});
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

// ─── SHARED HELPERS ───────────────────────────────────────────────────────────
async function loadJsPDF() {
  return new Promise((resolve,reject)=>{
    if(window.jspdf)return resolve();
    const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload=resolve;s.onerror=reject;document.head.appendChild(s);
  });
}
async function loadQRCode() {
  return new Promise((resolve,reject)=>{
    if(window.QRCode)return resolve();
    const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    s.onload=resolve;s.onerror=reject;document.head.appendChild(s);
  });
}
async function getQRDataURL(url, C) {
  const qrColour=`rgb(${C.qrDark[0]},${C.qrDark[1]},${C.qrDark[2]})`;
  return new Promise(resolve=>{
    const div=document.createElement('div');
    div.style.cssText='position:absolute;left:-9999px;top:-9999px;';
    document.body.appendChild(div);
    new window.QRCode(div,{text:url,width:256,height:256,colorDark:qrColour,colorLight:'#ffffff',correctLevel:window.QRCode.CorrectLevel.H});
    setTimeout(()=>{
      const el=div.querySelector('canvas')||div.querySelector('img');
      const dataUrl=el?(el.tagName==='CANVAS'?el.toDataURL('image/png'):el.src):'';
      document.body.removeChild(div);resolve(dataUrl);
    },200);
  });
}
async function getImageDataURL(src) {
  return new Promise(resolve=>{
    const img=new Image();img.crossOrigin='anonymous';
    img.onload=()=>{const c=document.createElement('canvas');c.width=img.width;c.height=img.height;c.getContext('2d').drawImage(img,0,0);resolve(c.toDataURL('image/png'));};
    img.onerror=()=>resolve(null);
    img.src=src;
  });
}

// ─── 8-UP LABEL PDF — Avery 938207 — 99.1×67.7mm ─────────────────────────────
// LANDSCAPE LABEL — QR left, text right
// DO NOT MODIFY THIS FUNCTION — working perfectly
async function generateLabelPDF(listings, dealer, singleListing = null) {
  await loadJsPDF(); await loadQRCode();
  const {jsPDF}=window.jspdf;
  const brandHex=dealer.brand_colour||'#1D6B4A';
  const C=getLabelColours(brandHex);
  const LW=99.1, LH=67.7, COLS=2, ROWS=4, PAGE_W=210;
  const MARGIN_LEFT=(PAGE_W-COLS*LW)/2, MARGIN_TOP=13;

  const linqrLogoUrl=await getImageDataURL('/LINQR-logo.png');
  const dealerLogoUrl=dealer.logo_url?await getImageDataURL(dealer.logo_url):null;
  const publishedListings=singleListing?[singleListing]:listings.filter(l=>l.published);
  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
  let labelIndex=0;

  for(let i=0;i<publishedListings.length;i++){
    const listing=publishedListings[i];
    if(labelIndex>0&&labelIndex%(COLS*ROWS)===0)doc.addPage();
    const pos=labelIndex%(COLS*ROWS);
    const col=pos%COLS, row=Math.floor(pos/COLS);
    const lx=MARGIN_LEFT+col*LW, ly=MARGIN_TOP+row*LH;

    const GREEN_BAR_H=2.8, BLACK_BAR_H=10.5, QR_PADDING=2.8;
    const QR_SIZE=LH-GREEN_BAR_H*2-BLACK_BAR_H-QR_PADDING*2;
    const QR_X=lx+QR_PADDING, QR_Y=ly+GREEN_BAR_H+BLACK_BAR_H+QR_PADDING;
    const TEXT_X=lx+QR_SIZE+QR_PADDING*3, TEXT_W=LW-QR_SIZE-QR_PADDING*4;
    const BODY_Y=ly+GREEN_BAR_H+BLACK_BAR_H, BODY_H=LH-GREEN_BAR_H*2-BLACK_BAR_H;

    doc.setFillColor(...C.white);doc.rect(lx,ly,LW,LH,'F');
    doc.setFillColor(...C.stripe);
    doc.rect(0,ly,PAGE_W,GREEN_BAR_H,'F');
    doc.rect(0,ly+LH-GREEN_BAR_H,PAGE_W,GREEN_BAR_H,'F');
    doc.setFillColor(...C.black);
    doc.rect(lx-4,ly+GREEN_BAR_H,LW+8,BLACK_BAR_H,'F');
    doc.setFont('helvetica','bold');doc.setFontSize(15);doc.setTextColor(...C.white);
    doc.text('Scan Me · Save Me · Share Me',lx+LW/2,ly+GREEN_BAR_H+BLACK_BAR_H/2,{align:'center',baseline:'middle'});

    const qrDataUrl=await getQRDataURL(`https://linqr.global/${listing.slug}`,C);
    if(qrDataUrl)doc.addImage(qrDataUrl,'PNG',QR_X,QR_Y,QR_SIZE,QR_SIZE);

    try {
      const badgeW=QR_SIZE*0.55, badgeH=QR_SIZE*0.18;
      const badgeX=QR_X+(QR_SIZE-badgeW)/2, badgeY=QR_Y+(QR_SIZE-badgeH)/2;
      doc.setFillColor(...C.qrDark);
      doc.roundedRect(badgeX-1,badgeY-1,badgeW+2,badgeH+2,1.4,1.4,'F');
      doc.setFillColor(...C.badge);
      doc.roundedRect(badgeX,badgeY,badgeW,badgeH,1.2,1.2,'F');
      doc.setDrawColor(...C.white);doc.setLineWidth(0.3);
      doc.roundedRect(badgeX,badgeY,badgeW,badgeH,1.2,1.2,'S');
      if(linqrLogoUrl){
        const logoW=badgeW*0.75,logoH=badgeH*0.65;
        doc.addImage(linqrLogoUrl,'PNG',badgeX+(badgeW-logoW)/2,badgeY+(badgeH-logoH)/2,logoW,logoH);
      } else {
        doc.setFont('helvetica','bold');doc.setFontSize(5);doc.setTextColor(...C.white);
        doc.text('®LINQR™',badgeX+badgeW/2,badgeY+badgeH/2,{align:'center',baseline:'middle'});
      }
    } catch(e){}

    if(dealerLogoUrl){
      try{doc.addImage(dealerLogoUrl,'JPEG',TEXT_X,BODY_Y+BODY_H*0.06,TEXT_W,BODY_H*0.28,undefined,'FAST');}
      catch(e){
        doc.setFont('helvetica','bold');doc.setFontSize(11);doc.setTextColor(...C.dkgrey);
        doc.text(doc.splitTextToSize(dealer.name||'',TEXT_W),TEXT_X,BODY_Y+BODY_H*0.22);
      }
    } else {
      doc.setFont('helvetica','bold');doc.setFontSize(11);doc.setTextColor(...C.dkgrey);
      doc.text(doc.splitTextToSize(dealer.name||'',TEXT_W),TEXT_X,BODY_Y+BODY_H*0.22);
    }

    const vehicleName=listing.listing_type==='property'?listing.address||'':
      `${listing.year||''} ${listing.make||''} ${listing.model||''}`.trim();
    doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(...C.vehicleText);
    doc.text(doc.splitTextToSize(vehicleName,TEXT_W),TEXT_X,BODY_Y+BODY_H*(dealerLogoUrl?0.52:0.48));

    const stockLine=listing.listing_type==='property'?`ID: ${listing.property_id||''}`:`Stock #${listing.stock_number}`;
    doc.setFont('helvetica','normal');doc.setFontSize(8.4);doc.setTextColor(...C.grey);
    doc.text(stockLine,TEXT_X+TEXT_W/2,BODY_Y+BODY_H*0.82,{align:'center'});

    doc.setFont('helvetica','normal');doc.setFontSize(7);doc.setTextColor(...C.lgrey);
    doc.text('© LINQR 2026 · linqr.global',TEXT_X+TEXT_W/2,BODY_Y+BODY_H*0.93,{align:'center'});

    labelIndex++;
  }

  const filename=singleListing
    ?`${dealer.code}-label-${singleListing.stock_number||singleListing.property_id}.pdf`
    :`${dealer.code}-QR-Labels-8up.pdf`;
  doc.save(filename);
}

// ─── 4-UP LARGE LABEL PDF — Avery L7169 — 99.1×139mm ────────────────────────
// PORTRAIT STACKED layout — top to bottom:
//   Brand stripe | Black Scan Me bar | QR code (large, centred) |
//   Dealer logo (centred) | Vehicle name | Stock # | LINQR copyright | Brand stripe
async function generateLargeLabelPDF(listings, dealer, singleListing = null) {
  await loadJsPDF(); await loadQRCode();
  const {jsPDF}=window.jspdf;
  const brandHex=dealer.brand_colour||'#1D6B4A';
  const C=getLabelColours(brandHex);

  // L7169 spec from Avery official template
  const LW=99.1, LH=139.0, COLS=2, ROWS=2, PAGE_W=210;
  const MARGIN_LEFT=4.62, MARGIN_TOP=9.5, H_GAP=2.54;

  const linqrLogoUrl=await getImageDataURL('/LINQR-logo.png');
  const dealerLogoUrl=dealer.logo_url?await getImageDataURL(dealer.logo_url):null;
  const publishedListings=singleListing?[singleListing]:listings.filter(l=>l.published);
  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
  let labelIndex=0;

  for(let i=0;i<publishedListings.length;i++){
    const listing=publishedListings[i];
    if(labelIndex>0&&labelIndex%(COLS*ROWS)===0)doc.addPage();
    const pos=labelIndex%(COLS*ROWS);
    const col=pos%COLS, row=Math.floor(pos/ROWS);
    const lx=MARGIN_LEFT+col*(LW+H_GAP);
    const ly=MARGIN_TOP+row*LH;

    // ── Stacked portrait layout constants ──────────────────────────────────
    const STRIPE_H   = 4.5;    // brand colour stripe top & bottom
    const BAR_H      = 14.0;   // black Scan Me bar
    const PADDING    = 4.0;    // general padding
    const QR_SIZE    = LW - PADDING * 2;  // QR nearly full width ~91mm
    const CX         = lx + LW / 2;      // horizontal centre of label

    // Vertical positions top to bottom
    const stripeTopY  = ly;
    const barY        = ly + STRIPE_H;
    const qrY         = barY + BAR_H + PADDING;
    const afterQR     = qrY + QR_SIZE;

    // Remaining space below QR for logo + text
    const stripeBottomY = ly + LH - STRIPE_H;
    const textZoneH     = stripeBottomY - afterQR - PADDING;
    const textZoneY     = afterQR + PADDING;

    // ── White background ──────────────────────────────────────────────────
    doc.setFillColor(...C.white);
    doc.rect(lx,ly,LW,LH,'F');

    // ── Brand colour stripes — full page width ────────────────────────────
    doc.setFillColor(...C.stripe);
    doc.rect(0,stripeTopY,PAGE_W,STRIPE_H,'F');
    doc.rect(0,stripeBottomY,PAGE_W,STRIPE_H,'F');

    // ── Black Scan Me bar — per label, 4mm bleed ──────────────────────────
    doc.setFillColor(...C.black);
    doc.rect(lx-4,barY,LW+8,BAR_H,'F');
    doc.setFont('helvetica','bold');doc.setFontSize(18);doc.setTextColor(...C.white);
    doc.text('Scan Me · Save Me · Share Me',CX,barY+BAR_H/2,{align:'center',baseline:'middle'});

    // ── QR code — large, centred ──────────────────────────────────────────
    const qrX = lx + PADDING;
    const qrDataUrl=await getQRDataURL(`https://linqr.global/${listing.slug}`,C);
    if(qrDataUrl)doc.addImage(qrDataUrl,'PNG',qrX,qrY,QR_SIZE,QR_SIZE);

    // ── LINQR badge — centred on QR ───────────────────────────────────────
    try {
      const badgeW=QR_SIZE*0.38, badgeH=QR_SIZE*0.12;
      const badgeX=qrX+(QR_SIZE-badgeW)/2, badgeY=qrY+(QR_SIZE-badgeH)/2;
      doc.setFillColor(...C.qrDark);
      doc.roundedRect(badgeX-1.5,badgeY-1.5,badgeW+3,badgeH+3,2,2,'F');
      doc.setFillColor(...C.badge);
      doc.roundedRect(badgeX,badgeY,badgeW,badgeH,1.5,1.5,'F');
      doc.setDrawColor(...C.white);doc.setLineWidth(0.4);
      doc.roundedRect(badgeX,badgeY,badgeW,badgeH,1.5,1.5,'S');
      if(linqrLogoUrl){
        const logoW=badgeW*0.75,logoH=badgeH*0.65;
        doc.addImage(linqrLogoUrl,'PNG',badgeX+(badgeW-logoW)/2,badgeY+(badgeH-logoH)/2,logoW,logoH);
      } else {
        doc.setFont('helvetica','bold');doc.setFontSize(7);doc.setTextColor(...C.white);
        doc.text('®LINQR™',badgeX+badgeW/2,badgeY+badgeH/2,{align:'center',baseline:'middle'});
      }
    } catch(e){}

    // ── Text zone — dealer logo | vehicle name | stock | copyright ────────
    // Divide text zone into sections
    const logoZoneH   = textZoneH * 0.38;
    const nameZoneY   = textZoneY + logoZoneH + PADDING * 0.5;
    const stockY      = textZoneY + textZoneH * 0.72;
    const copyrightY  = textZoneY + textZoneH * 0.88;

    // Dealer logo (if set) or dealer name text
    if(dealerLogoUrl){
      const dLogoH = logoZoneH * 0.85;
      const dLogoW = Math.min(LW - PADDING * 2, dLogoH * 3.5); // max aspect ratio
      try {
        doc.addImage(dealerLogoUrl,'JPEG',CX-dLogoW/2,textZoneY,dLogoW,dLogoH,undefined,'FAST');
      } catch(e){
        doc.setFont('helvetica','bold');doc.setFontSize(14);doc.setTextColor(...C.dkgrey);
        doc.text(doc.splitTextToSize(dealer.name||'',LW-PADDING*2),CX,textZoneY+logoZoneH*0.5,{align:'center',baseline:'middle'});
      }
    } else {
      doc.setFont('helvetica','bold');doc.setFontSize(14);doc.setTextColor(...C.dkgrey);
      doc.text(doc.splitTextToSize(dealer.name||'',LW-PADDING*2),CX,textZoneY+logoZoneH*0.5,{align:'center',baseline:'middle'});
    }

    // Vehicle / property name
    const vehicleName=listing.listing_type==='property'?listing.address||'':
      `${listing.year||''} ${listing.make||''} ${listing.model||''}`.trim();
    doc.setFont('helvetica','bold');doc.setFontSize(13);doc.setTextColor(...C.vehicleText);
    doc.text(doc.splitTextToSize(vehicleName,LW-PADDING*2),CX,nameZoneY,{align:'center'});

    // Stock / ID
    const stockLine=listing.listing_type==='property'?`ID: ${listing.property_id||''}`:`Stock #${listing.stock_number}`;
    doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setTextColor(...C.grey);
    doc.text(stockLine,CX,stockY,{align:'center'});

    // Copyright
    doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(...C.lgrey);
    doc.text('© LINQR 2026 · linqr.global',CX,copyrightY,{align:'center'});

    labelIndex++;
  }

  const filename=singleListing
    ?`${dealer.code}-label-large-${singleListing.stock_number||singleListing.property_id}.pdf`
    :`${dealer.code}-QR-Labels-4up-large.pdf`;
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
  const [generatingLargeLabels, setGeneratingLargeLabels] = useState(false);
  const [stockSearch, setStockSearch] = useState("");
  const [leadsEmail, setLeadsEmail] = useState(dealer?.leads_email || "");
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(()=>{ fetchListings(); },[]);

  async function fetchListings() {
    try {
      const res=await fetch(`${LINQR_SUPABASE_URL}/rest/v1/listings?dealer_id=eq.${dealer.id}&order=created_at.desc&select=*`,{headers:{"apikey":LINQR_ANON_KEY,"Authorization":`Bearer ${LINQR_ANON_KEY}`}});
      const data=await res.json();setListings(data||[]);
    } catch(e){console.error(e);} finally{setLoading(false);}
  }

  async function saveLeadsEmail() {
    if(!leadsEmail.trim())return;
    setSavingEmail(true);setEmailSaved(false);
    try {
      await fetch(`${LINQR_SUPABASE_URL}/rest/v1/dealers?id=eq.${dealer.id}`,{
        method:"PATCH",
        headers:{"apikey":LINQR_ANON_KEY,"Authorization":`Bearer ${LINQR_ANON_KEY}`,"Content-Type":"application/json"},
        body:JSON.stringify({leads_email:leadsEmail.trim()})
      });
      setEmailSaved(true);setTimeout(()=>setEmailSaved(false),3000);
    } catch(e){console.error(e);}
    finally{setSavingEmail(false);}
  }

  async function togglePublished(listing) {
    await fetch(`${LINQR_SUPABASE_URL}/rest/v1/listings?id=eq.${listing.id}`,{method:"PATCH",headers:{"apikey":LINQR_ANON_KEY,"Authorization":`Bearer ${LINQR_ANON_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({published:!listing.published})});
    fetchListings();
  }

  async function deleteListing(id) {
    if(!confirm("Delete this listing?"))return;
    await fetch(`${LINQR_SUPABASE_URL}/rest/v1/listings?id=eq.${id}`,{method:"DELETE",headers:{"apikey":LINQR_ANON_KEY,"Authorization":`Bearer ${LINQR_ANON_KEY}`}});
    fetchListings();
  }

  async function handlePrintLabels() {
    const published=listings.filter(l=>l.published);
    if(published.length===0){alert("No live listings to print labels for.");return;}
    setGeneratingLabels(true);
    try{await generateLabelPDF(listings,dealer);}
    catch(e){console.error(e);alert("Label generation failed: "+e.message);}
    finally{setGeneratingLabels(false);}
  }

  async function handlePrintLargeLabels() {
    const published=listings.filter(l=>l.published);
    if(published.length===0){alert("No live listings to print labels for.");return;}
    setGeneratingLargeLabels(true);
    try{await generateLargeLabelPDF(listings,dealer);}
    catch(e){console.error(e);alert("Label generation failed: "+e.message);}
    finally{setGeneratingLargeLabels(false);}
  }

  async function handlePrintSingleLabel(listing) {
    setGeneratingLabels(true);
    try{await generateLabelPDF(listings,dealer,listing);}
    catch(e){console.error(e);alert("Label generation failed: "+e.message);}
    finally{setGeneratingLabels(false);}
  }

  async function handlePrintSingleLargeLabel(listing) {
    setGeneratingLargeLabels(true);
    try{await generateLargeLabelPDF(listings,dealer,listing);}
    catch(e){console.error(e);alert("Label generation failed: "+e.message);}
    finally{setGeneratingLargeLabels(false);}
  }

  async function handleCSVUpload(e) {
    const file=e.target.files[0];if(!file)return;
    setImporting(true);setImportResult(null);
    try {
      const text=await file.text();const rows=parseCSV(text);
      if(rows.length===0){setImportResult({error:"No valid rows found in CSV."});setImporting(false);return;}
      const existingRes=await fetch(`${LINQR_SUPABASE_URL}/rest/v1/listings?dealer_id=eq.${dealer.id}&select=*`,{headers:{"apikey":LINQR_ANON_KEY,"Authorization":`Bearer ${LINQR_ANON_KEY}`}});
      const existing=await existingRes.json();
      const existingByStock={};
      (existing||[]).forEach(l=>{if(l.stock_number)existingByStock[l.stock_number.toString().trim()]=l;});
      let added=0,updated=0,unchanged=0;const updateDetails=[];
      for(const row of rows){
        const mapped=mapCSVToListing(row,dealer.id);
        const stockNum=row.stock_number.toString().trim();
        const ex=existingByStock[stockNum];
        if(!ex){
          await fetch(`${LINQR_SUPABASE_URL}/rest/v1/listings`,{method:"POST",headers:{"apikey":LINQR_ANON_KEY,"Authorization":`Bearer ${LINQR_ANON_KEY}`,"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify(mapped)});
          added++;
        } else {
          const changed=[];
          if(ex.price!==mapped.price)changed.push(`price: ${ex.price} → ${mapped.price}`);
          if(ex.colour!==mapped.colour)changed.push(`colour: ${ex.colour} → ${mapped.colour}`);
          if(ex.model!==mapped.model)changed.push(`model: ${ex.model} → ${mapped.model}`);
          if(ex.year!==mapped.year)changed.push(`year: ${ex.year} → ${mapped.year}`);
          if(ex.features!==mapped.features)changed.push(`specs updated`);
          if(ex.image_url!==mapped.image_url)changed.push(`image updated`);
          if(ex.listing_url!==mapped.listing_url)changed.push(`listing URL updated`);
          if(ex.model_code!==mapped.model_code)changed.push(`model code updated`);
          if(ex.engine!==mapped.engine)changed.push(`engine: ${ex.engine} → ${mapped.engine}`);
          if(ex.odometer!==mapped.odometer)changed.push(`odometer: ${ex.odometer} → ${mapped.odometer}`);
          if(changed.length>0){
            await fetch(`${LINQR_SUPABASE_URL}/rest/v1/listings?id=eq.${ex.id}`,{method:"PATCH",headers:{"apikey":LINQR_ANON_KEY,"Authorization":`Bearer ${LINQR_ANON_KEY}`,"Content-Type":"application/json"},body:JSON.stringify(mapped)});
            updated++;updateDetails.push(`Stock #${stockNum} — ${changed.join(", ")}`);
          } else{unchanged++;}
        }
      }
      await fetchListings();setImportResult({added,updated,unchanged,updateDetails});
    } catch(err){console.error(err);setImportResult({error:"Import failed: "+err.message});}
    finally{setImporting(false);if(fileInputRef.current)fileInputRef.current.value="";}
  }

  async function downloadLeads() {
    setDownloadingLeads(true);
    try {
      const fromDate=new Date();fromDate.setDate(fromDate.getDate()-leadDays);const fromISO=fromDate.toISOString();
      const dealerCode=dealer.code.toLowerCase();
      if(listings.length===0){alert("No listings found for this dealer.");setDownloadingLeads(false);return;}
      const res=await fetch(`${OLD_SUPABASE_URL}/rest/v1/sellsheet_contacts?created_at=gte.${fromISO}&order=created_at.desc&select=*`,{headers:{"apikey":OLD_ANON_KEY,"Authorization":`Bearer ${OLD_ANON_KEY}`}});
      const allLeads=await res.json();
      const excludeEmails=["pe@mothers.co.nz","pemothersnz@gmail.com",dealer.email].filter(Boolean).map(e=>e.toLowerCase());
      const dealerLeads=(allLeads||[]).filter(lead=>{
        if(!lead.car_url)return false;
        if(excludeEmails.includes((lead.email||"").toLowerCase()))return false;
        return lead.car_url.includes(`/${dealerCode}-`);
      });
      if(dealerLeads.length===0){alert(`No leads found in the last ${leadDays} days.`);setDownloadingLeads(false);return;}
      const headers=["Name","Email","Listing","Reference","Date"];
      const rows=dealerLeads.map(lead=>{
        const matchedListing=listings.find(l=>lead.car_url&&lead.car_url.includes(l.slug));
        const listingName=matchedListing?(matchedListing.listing_type==="property"?matchedListing.address:`${matchedListing.year||""} ${matchedListing.make} ${matchedListing.model}`.trim()):(lead.car_name||"");
        const reference=matchedListing?(matchedListing.listing_type==="property"?matchedListing.property_id:`Stock #${matchedListing.stock_number}`):"";
        const date=lead.created_at?new Date(lead.created_at).toLocaleDateString("en-NZ",{day:"2-digit",month:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"}):"";
        return[`"${lead.name||""}"`,`"${lead.email||""}"`,`"${listingName}"`,`"${reference}"`,`"${date}"`].join(",");
      });
      const csv=[headers.join(","),...rows].join("\n");
      const blob=new Blob([csv],{type:"text/csv"});const url=URL.createObjectURL(blob);
      const a=document.createElement("a");a.href=url;a.download=`${dealer.code}-leads-last-${leadDays}-days.csv`;a.click();URL.revokeObjectURL(url);
    } catch(e){console.error(e);alert("Something went wrong downloading leads.");}
    finally{setDownloadingLeads(false);}
  }

  const isRayWhite=dealer?.brand_colour==='#FFCD00';
  const isPropertyDealer=dealer?.dealer_type==='property';
  const brandColour=dealer?.brand_colour||'#1B6157';
  const headerTextColour=isRayWhite?'#000000':'#ffffff';
  const isLight=brightness(brandColour)>160;
  const btnTextColour=isLight?'#000000':'#ffffff';
  const filteredListings=stockSearch.trim()?listings.filter(l=>l.stock_number&&l.stock_number.toString().includes(stockSearch.trim())):listings;
  const liveCount=listings.filter(l=>l.published).length;
  const sheetCount8=Math.ceil(liveCount/8);
  const sheetCount4=Math.ceil(liveCount/4);
  const cardAccent=brandColour;

  const AddButtons=()=>(
    <div style={{display:"flex",gap:10}}>
      {!isPropertyDealer&&(<button style={{background:brandColour,color:btnTextColour,border:"none",borderRadius:8,padding:"12px 20px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"Georgia, serif"}} onClick={onAddNew}>🚗 Add Vehicle</button>)}
      {isPropertyDealer&&(<button style={{background:isRayWhite?'#111':brandColour,color:isRayWhite?'#FFCD00':'#fff',border:"none",borderRadius:8,padding:"12px 20px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"Georgia, serif"}} onClick={onAddProperty}>🏡 Add Property</button>)}
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#f0f2f5"}}>
      <div style={{maxWidth:960,margin:"0 auto",padding:"0 0 60px"}}>

        {/* ── Header ── */}
        <div style={{background:brandColour,padding:"16px 32px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            {isRayWhite
              ?<div style={{fontWeight:900,fontSize:22,color:'#000',letterSpacing:1}}>RAY WHITE</div>
              :dealer?.logo_url
                ?<img src={dealer.logo_url} alt={dealer.name} style={{height:40,width:'auto'}}/>
                :<img src="/LINQR-logo.png" alt="LINQR" style={{height:36,width:'auto'}}/>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <p style={{fontSize:14,fontWeight:700,margin:0,color:headerTextColour}}>{dealer.name}</p>
            <button style={{background:"rgba(0,0,0,0.15)",border:"none",borderRadius:6,padding:"8px 16px",fontSize:13,cursor:"pointer",fontFamily:"Georgia, serif",color:headerTextColour}} onClick={onLogout}>Sign Out</button>
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"20px 32px"}}>
          {[
            {value:listings.length,label:"Total Listings"},
            {value:liveCount,label:"Live"},
            {value:listings.filter(l=>!l.published).length,label:"Draft"},
            {value:dealer.code,label:"Dealer Code"},
          ].map((s,i)=>(
            <div key={i} style={{textAlign:"center"}}>
              <p style={{fontSize:28,fontWeight:900,margin:"0 0 4px",fontFamily:"Georgia, serif",color:brandColour}}>{s.value}</p>
              <p style={{fontSize:11,color:"#9ca3af",margin:0,letterSpacing:1,textTransform:"uppercase"}}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Control cards 2×2 grid ── */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,padding:"24px 24px 8px"}}>

          {/* Card 1 — Download Leads */}
          <div style={{background:"#fff",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",overflow:"hidden"}}>
            <div style={{height:4,background:cardAccent,borderRadius:"12px 12px 0 0"}}/>
            <div style={{padding:"20px 24px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <span style={{fontSize:20}}>📥</span>
                <span style={{fontSize:14,fontWeight:700,color:"#111",fontFamily:"Georgia, serif"}}>Download Leads</span>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                <select value={leadDays} onChange={e=>setLeadDays(Number(e.target.value))} style={{border:"1px solid #e5e7eb",borderRadius:6,padding:"8px 10px",fontSize:13,fontFamily:"Georgia, serif",color:"#333",cursor:"pointer",flex:1,minWidth:100}}>
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
                <button onClick={downloadLeads} disabled={downloadingLeads} style={{background:brandColour,color:btnTextColour,border:"none",borderRadius:6,padding:"8px 16px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"Georgia, serif",whiteSpace:"nowrap"}}>
                  {downloadingLeads?'Downloading...':'⬇️ Download CSV'}
                </button>
              </div>
              <p style={{fontSize:11,color:"#9ca3af",margin:"10px 0 0",fontFamily:"Georgia, serif"}}>Name · Email · Listing · Reference · Date</p>
            </div>
          </div>

          {/* Card 2 — Import Stock */}
          <div style={{background:"#fff",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",overflow:"hidden"}}>
            <div style={{height:4,background:cardAccent,borderRadius:"12px 12px 0 0"}}/>
            <div style={{padding:"20px 24px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <span style={{fontSize:20}}>📂</span>
                <span style={{fontSize:14,fontWeight:700,color:"#111",fontFamily:"Georgia, serif"}}>Import Stock</span>
              </div>
              <input ref={fileInputRef} type="file" accept=".csv" style={{display:'none'}} onChange={handleCSVUpload}/>
              <button onClick={()=>fileInputRef.current&&fileInputRef.current.click()} disabled={importing} style={{background:importing?'#9ca3af':'#111',color:'#fff',border:'none',borderRadius:6,padding:'8px 16px',fontSize:13,fontWeight:700,cursor:importing?'not-allowed':'pointer',fontFamily:'Georgia, serif',width:'100%'}}>
                {importing?'Importing...':'⬆️ Upload CSV'}
              </button>
              <p style={{fontSize:11,color:"#9ca3af",margin:"10px 0 0",fontFamily:"Georgia, serif"}}>New listings added · changes updated · unchanged skipped</p>
            </div>
          </div>

          {/* Card 3 — Print QR Labels */}
          <div style={{background:"#fff",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",overflow:"hidden"}}>
            <div style={{height:4,background:cardAccent,borderRadius:"12px 12px 0 0"}}/>
            <div style={{padding:"20px 24px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <span style={{fontSize:20}}>🏷️</span>
                <span style={{fontSize:14,fontWeight:700,color:"#111",fontFamily:"Georgia, serif"}}>Print QR Labels</span>
              </div>
              <button onClick={handlePrintLabels} disabled={generatingLabels||generatingLargeLabels} style={{background:generatingLabels?'#9ca3af':brandColour,color:btnTextColour,border:'none',borderRadius:6,padding:'8px 16px',fontSize:13,fontWeight:700,cursor:(generatingLabels||generatingLargeLabels)?'not-allowed':'pointer',fontFamily:'Georgia, serif',width:'100%',marginBottom:8}}>
                {generatingLabels?'Generating PDF...':'🖨️ Print All — Standard (8-up)'}
              </button>
              <p style={{fontSize:11,color:"#9ca3af",margin:"0 0 10px",fontFamily:"Georgia, serif"}}>Avery 938207 · 99.1×67.7mm · {liveCount} listing{liveCount!==1?'s':''} · {sheetCount8} sheet{sheetCount8!==1?'s':''}</p>
              <button onClick={handlePrintLargeLabels} disabled={generatingLabels||generatingLargeLabels} style={{background:generatingLargeLabels?'#9ca3af':'#111',color:'#fff',border:'none',borderRadius:6,padding:'8px 16px',fontSize:13,fontWeight:700,cursor:(generatingLabels||generatingLargeLabels)?'not-allowed':'pointer',fontFamily:'Georgia, serif',width:'100%',marginBottom:8}}>
                {generatingLargeLabels?'Generating PDF...':'🖨️ Print All — Large (4-up)'}
              </button>
              <p style={{fontSize:11,color:"#9ca3af",margin:0,fontFamily:"Georgia, serif"}}>Avery L7169 · 99.1×139mm · {liveCount} listing{liveCount!==1?'s':''} · {sheetCount4} sheet{sheetCount4!==1?'s':''}</p>
            </div>
          </div>

          {/* Card 4 — Leads & Callback Email */}
          <div style={{background:"#fff",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",overflow:"hidden"}}>
            <div style={{height:4,background:cardAccent,borderRadius:"12px 12px 0 0"}}/>
            <div style={{padding:"20px 24px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <span style={{fontSize:20}}>📧</span>
                <span style={{fontSize:14,fontWeight:700,color:"#111",fontFamily:"Georgia, serif"}}>Leads & Callback Email</span>
              </div>
              <div style={{display:"flex",gap:8}}>
                <input type="email" placeholder="sales@yourdealer.co.nz" value={leadsEmail}
                  onChange={e=>setLeadsEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&saveLeadsEmail()}
                  style={{flex:1,border:"1px solid #e5e7eb",borderRadius:6,padding:"8px 10px",fontSize:13,fontFamily:"Georgia, serif",color:"#333",outline:"none"}}/>
                <button onClick={saveLeadsEmail} disabled={savingEmail} style={{background:emailSaved?'#16a34a':brandColour,color:btnTextColour,border:'none',borderRadius:6,padding:'8px 14px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'Georgia, serif',whiteSpace:'nowrap',transition:'background 0.3s'}}>
                  {emailSaved?'✓ Saved':savingEmail?'Saving...':'Save'}
                </button>
              </div>
              <p style={{fontSize:11,color:"#9ca3af",margin:"10px 0 0",fontFamily:"Georgia, serif"}}>Leads CSV and callback requests go here</p>
            </div>
          </div>

        </div>

        {/* ── Import result ── */}
        {importResult&&(
          <div style={{margin:"0 24px",background:importResult.error?'#fef2f2':'#f0fdf4',borderRadius:10,border:`1px solid ${importResult.error?'#fecaca':'#bbf7d0'}`,padding:'14px 20px'}}>
            {importResult.error
              ?<p style={{color:'#dc2626',fontSize:13,margin:0,fontFamily:'Georgia, serif'}}>⚠️ {importResult.error}</p>
              :<>
                <p style={{fontSize:13,fontWeight:700,color:'#111',margin:'0 0 4px',fontFamily:'Georgia, serif'}}>✅ Import complete — {importResult.added} added · {importResult.updated} updated · {importResult.unchanged} unchanged</p>
                {importResult.updateDetails.length>0&&<div style={{marginTop:6}}>{importResult.updateDetails.map((d,i)=>(<p key={i} style={{fontSize:12,color:'#555',margin:'2px 0',fontFamily:'Georgia, serif'}}>↻ {d}</p>))}</div>}
              </>
            }
          </div>
        )}

        {/* ── Listings ── */}
        <div style={{padding:"24px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <h2 style={{fontSize:20,fontWeight:700,color:"#111",margin:0,fontFamily:"Georgia, serif"}}>Your Listings</h2>
            <AddButtons/>
          </div>

          <div style={{marginBottom:16,display:'flex',alignItems:'center',gap:10}}>
            <input type="text" placeholder="🔍  Search by stock number..." value={stockSearch} onChange={e=>setStockSearch(e.target.value)}
              style={{border:'1px solid #e5e7eb',borderRadius:8,padding:'10px 14px',fontSize:13,fontFamily:'Georgia, serif',color:'#333',width:260,outline:'none',background:'#fff'}}/>
            {stockSearch&&<button onClick={()=>setStockSearch("")} style={{background:'none',border:'none',fontSize:13,color:'#9ca3af',cursor:'pointer',fontFamily:'Georgia, serif'}}>✕ Clear</button>}
            {stockSearch&&<span style={{fontSize:13,color:'#9ca3af',fontFamily:'Georgia, serif'}}>{filteredListings.length} result{filteredListings.length!==1?'s':''}</span>}
          </div>

          {loading&&<p style={{textAlign:'center',color:'#9ca3af',padding:40,fontFamily:'Georgia, serif'}}>Loading your listings...</p>}
          {!loading&&listings.length===0&&(
            <div style={{textAlign:'center',padding:'60px 24px',background:'#fff',borderRadius:12,border:'2px dashed #e5e7eb'}}>
              <p style={{fontSize:48,margin:'0 0 16px'}}>{isPropertyDealer?'🏡':'🚗'}</p>
              <p style={{fontSize:20,fontWeight:700,color:'#111',margin:'0 0 8px',fontFamily:'Georgia, serif'}}>No listings yet</p>
              <p style={{fontSize:14,color:'#9ca3af',margin:'0 0 24px'}}>Add your first {isPropertyDealer?'property':'vehicle'} to get started</p>
              <AddButtons/>
            </div>
          )}
          {!loading&&stockSearch&&filteredListings.length===0&&(
            <div style={{textAlign:'center',padding:'40px 24px',color:'#9ca3af',fontFamily:'Georgia, serif',fontSize:14}}>No listing found for stock number "{stockSearch}"</div>
          )}

          {filteredListings.map(listing=>(
            <div key={listing.id} style={{background:'#fff',borderRadius:12,padding:'16px',marginBottom:12,display:'flex',gap:16,alignItems:'center',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
              <div style={{flexShrink:0}}>
                {listing.image_url
                  ?<img src={listing.image_url} alt={listing.model} style={{width:100,height:70,objectFit:'cover',borderRadius:8}}/>
                  :<div style={{width:100,height:70,background:'#f3f4f6',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>📷</div>}
              </div>
              <div style={{flex:1}}>
                <p style={{fontSize:16,fontWeight:700,color:'#111',margin:'0 0 4px',fontFamily:'Georgia, serif'}}>
                  {listing.listing_type==='property'?listing.address:`${listing.year} ${listing.make} ${listing.model}`}
                </p>
                <p style={{fontSize:13,color:'#9ca3af',margin:'0 0 4px'}}>
                  {listing.listing_type==='property'
                    ?`${listing.suburb||''} · ${listing.sale_method||''} · ID: ${listing.property_id||''}`
                    :[listing.colour,listing.engine,listing.odometer,`Stock #${listing.stock_number}`].filter(Boolean).join(' · ')}
                </p>
                <p style={{fontSize:15,fontWeight:700,margin:'0 0 6px',color:brandColour}}>{listing.price}</p>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:12,color:'#9ca3af',background:'#f3f4f6',padding:'4px 8px',borderRadius:4}}>linqr.global/{listing.slug}</span>
                  <a href={`https://linqr.global/${listing.slug}`} target="_blank" rel="noopener noreferrer" style={{fontSize:12,fontWeight:700,textDecoration:'none',color:brandColour}}>View →</a>
                </div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:8,alignItems:'flex-end',flexShrink:0}}>
                <div style={{fontSize:12,fontWeight:700,padding:'4px 10px',borderRadius:20,background:listing.published?'#dcfce7':'#fef9c3',color:listing.published?'#15803d':'#854d0e'}}>
                  {listing.published?'● Live':'○ Draft'}
                </div>
                <button style={{background:'transparent',border:'1px solid #e5e7eb',borderRadius:6,padding:'6px 12px',fontSize:12,cursor:'pointer',fontFamily:'Georgia, serif',color:'#444'}} onClick={()=>togglePublished(listing)}>{listing.published?'Unpublish':'Publish'}</button>
                <button style={{background:'transparent',border:'1px solid #e5e7eb',borderRadius:6,padding:'6px 12px',fontSize:12,cursor:'pointer',fontFamily:'Georgia, serif',color:'#444'}} onClick={()=>onEdit(listing)}>Edit</button>
                <button style={{background:'transparent',border:'1px solid #e5e7eb',borderRadius:6,padding:'6px 12px',fontSize:12,cursor:'pointer',fontFamily:'Georgia, serif',color:brandColour,fontWeight:700}} onClick={()=>handlePrintSingleLabel(listing)}>🏷️ Std</button>
                <button style={{background:'transparent',border:'1px solid #e5e7eb',borderRadius:6,padding:'6px 12px',fontSize:12,cursor:'pointer',fontFamily:'Georgia, serif',color:'#111',fontWeight:700}} onClick={()=>handlePrintSingleLargeLabel(listing)}>🏷️ Lrg</button>
                <button style={{background:'transparent',border:'1px solid #e5e7eb',borderRadius:6,padding:'6px 12px',fontSize:12,cursor:'pointer',fontFamily:'Georgia, serif',color:'#dc2626'}} onClick={()=>deleteListing(listing.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{textAlign:'center',padding:24}}>
          <p style={{fontSize:11,color:'#d1d5db',margin:0}}>© LINQR 2026 · linqr.global</p>
        </div>

      </div>
    </div>
  );
}
