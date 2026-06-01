// © 2026 LINQR — linqr.global — All Rights Reserved
import { useState } from "react";

const LINQR_SUPABASE_URL = "https://odnjkxgsgevuvjutqdmi.supabase.co";
const LINQR_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kbmpreGdzZ2V2dXZqdXRxZG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxOTY0NzksImV4cCI6MjA5NTc3MjQ3OX0.tuf7P4I1xTNUMqnNLBkxAfVi-Ny4vjlWQzIX3AgTFoE";

// Safe features parser — handles text (new) or legacy array
function parseFeatures(raw) {
  if (!raw) return "";
  if (Array.isArray(raw)) return raw.join("\n");
  return raw;
}

export default function PortalAddVehicle({ dealer, onBack, onSuccess, editListing }) {
  const [stockNumber, setStockNumber] = useState(editListing?.stock_number || "");
  const [make, setMake] = useState(editListing?.make || "");
  const [model, setModel] = useState(editListing?.model || "");
  const [year, setYear] = useState(editListing?.year || "");
  const [colour, setColour] = useState(editListing?.colour || "");
  const [engine, setEngine] = useState(editListing?.engine || "");
  const [transmission, setTransmission] = useState(editListing?.transmission || "");
  const [odometer, setOdometer] = useState(editListing?.odometer || "");
  const [price, setPrice] = useState(editListing?.price || "");
  const [finance, setFinance] = useState(editListing?.finance || "");
  const [description, setDescription] = useState(editListing?.description || "");
  const [features, setFeatures] = useState(parseFeatures(editListing?.features));
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(editListing?.image_url || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage(file, slug) {
    const ext = file.name.split('.').pop().toLowerCase();
    const path = `${slug}.${ext}`;
    const res = await fetch(`${LINQR_SUPABASE_URL}/storage/v1/object/vehicle-images/${path}`, {
      method: "PUT",
      headers: {
        "apikey": LINQR_ANON_KEY,
        "Authorization": `Bearer ${LINQR_ANON_KEY}`,
        "Content-Type": file.type,
        "x-upsert": "true",
      },
      body: file,
    });
    if (!res.ok) throw new Error("Image upload failed");
    return `${LINQR_SUPABASE_URL}/storage/v1/object/public/vehicle-images/${path}`;
  }

  async function handleSave(publish) {
    if (!stockNumber || !make || !model || !year) {
      setError("Please fill in Stock Number, Make, Model and Year.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const slug = `${dealer.code.toLowerCase()}-${stockNumber.toLowerCase()}`;
      let imageUrl = editListing?.image_url || null;
      if (imageFile) imageUrl = await uploadImage(imageFile, slug);

      const payload = {
        dealer_id: dealer.id,
        stock_number: stockNumber,
        slug,
        listing_type: 'vehicle',
        make, model, year, colour, engine, transmission, odometer, price, finance, description,
        features: features,
        image_url: imageUrl,
        published: publish,
      };

      let res;
      if (editListing) {
        res = await fetch(`${LINQR_SUPABASE_URL}/rest/v1/listings?id=eq.${editListing.id}`, {
          method: "PATCH",
          headers: { "apikey": LINQR_ANON_KEY, "Authorization": `Bearer ${LINQR_ANON_KEY}`, "Content-Type": "application/json", "Prefer": "return=representation" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${LINQR_SUPABASE_URL}/rest/v1/listings`, {
          method: "POST",
          headers: { "apikey": LINQR_ANON_KEY, "Authorization": `Bearer ${LINQR_ANON_KEY}`, "Content-Type": "application/json", "Prefer": "return=representation" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data));
      onSuccess(Array.isArray(data) ? data[0] : data, publish);
    } catch (e) {
      setError(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={s.outer}>
      <div style={s.page}>
        <div style={s.header}>
          <img src="/LINQR-logo.png" alt="LINQR" style={s.logo} />
          <p style={s.dealerName}>{dealer.name}</p>
        </div>

        <div style={s.content}>
          <div style={s.topBar}>
            <button style={s.backBtn} onClick={onBack}>← Back to Dashboard</button>
            <h2 style={s.pageTitle}>{editListing ? "Edit Vehicle" : "Add New Vehicle"}</h2>
          </div>

          <div style={s.formGrid}>

            {/* LEFT COLUMN */}
            <div style={s.column}>

              <div style={s.section}>
                <h3 style={s.sectionTitle}>Vehicle Identity</h3>

                <label style={s.label}>Stock Number *</label>
                <input style={s.input} placeholder="e.g. 23270" value={stockNumber} onChange={e => setStockNumber(e.target.value)} />

                <label style={s.label}>Make *</label>
                <input style={s.input} placeholder="e.g. Harley-Davidson" value={make} onChange={e => setMake(e.target.value)} />

                <label style={s.label}>Model *</label>
                <input style={s.input} placeholder="e.g. Breakout 117" value={model} onChange={e => setModel(e.target.value)} />

                <label style={s.label}>Year *</label>
                <input style={s.input} placeholder="e.g. 2026" value={year} onChange={e => setYear(e.target.value)} />

                <label style={s.label}>Colour</label>
                <input style={s.input} placeholder="e.g. Iron Horse Metallic" value={colour} onChange={e => setColour(e.target.value)} />
              </div>

              <div style={s.section}>
                <h3 style={s.sectionTitle}>Specifications</h3>

                <label style={s.label}>Engine</label>
                <input style={s.input} placeholder="e.g. 1926cc Milwaukee-Eight 117" value={engine} onChange={e => setEngine(e.target.value)} />

                <label style={s.label}>Transmission</label>
                <input style={s.input} placeholder="e.g. 6-Speed Manual" value={transmission} onChange={e => setTransmission(e.target.value)} />

                <label style={s.label}>Odometer</label>
                <input style={s.input} placeholder="e.g. 0km (New)" value={odometer} onChange={e => setOdometer(e.target.value)} />
              </div>

              <div style={s.section}>
                <h3 style={s.sectionTitle}>Pricing</h3>

                <label style={s.label}>Price</label>
                <input style={s.input} placeholder="e.g. $41,740" value={price} onChange={e => setPrice(e.target.value)} />

                <label style={s.label}>Finance</label>
                <input style={s.input} placeholder="e.g. From $210/week with 10% deposit" value={finance} onChange={e => setFinance(e.target.value)} />
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={s.column}>

              <div style={s.section}>
                <h3 style={s.sectionTitle}>Hero Photo</h3>
                <div style={s.imageUpload} onClick={() => document.getElementById('imgInput').click()}>
                  {imagePreview
                    ? <img src={imagePreview} alt="Preview" style={s.imagePreview} />
                    : <div style={s.imagePlaceholder}>
                        <p style={{ fontSize: 40, margin: "0 0 8px" }}>📷</p>
                        <p style={{ fontSize: 15, fontWeight: 700, color: "#555", margin: "0 0 4px" }}>Click to upload photo</p>
                        <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>JPG or PNG recommended</p>
                      </div>
                  }
                </div>
                <input id="imgInput" type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
                {imagePreview && (
                  <button style={s.changePhotoBtn} onClick={() => document.getElementById('imgInput').click()}>
                    Change Photo
                  </button>
                )}
              </div>

              <div style={s.section}>
                <h3 style={s.sectionTitle}>Description</h3>
                <textarea
                  style={s.textarea}
                  placeholder="Describe this vehicle — what makes it special..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={5}
                />
              </div>

              <div style={s.section}>
                <h3 style={s.sectionTitle}>Key Features</h3>
                <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 8px" }}>One feature per line</p>
                <textarea
                  style={s.textarea}
                  placeholder={"24 Months Factory Warranty\nRoadside Assistance\nHOG Membership\nNationwide Delivery"}
                  value={features}
                  onChange={e => setFeatures(e.target.value)}
                  rows={6}
                />
              </div>
            </div>
          </div>

          {error && <p style={s.error}>{error}</p>}

          <div style={s.actions}>
            <button style={s.draftBtn} onClick={() => handleSave(false)} disabled={saving}>
              {saving ? "Saving..." : "Save as Draft"}
            </button>
            <button style={s.publishBtn} onClick={() => handleSave(true)} disabled={saving}>
              {saving ? "Publishing..." : "Publish — Go Live! 🚀"}
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", padding: 24 }}>
          <p style={{ fontSize: 11, color: "#bbb", margin: 0 }}>© LINQR 2026 · linqr.global</p>
        </div>
      </div>
    </div>
  );
}

const s = {
  outer: { minHeight: "100vh", background: "#f5f5f5" },
  page: { maxWidth: 960, margin: "0 auto" },
  header: { background: "#1B6157", padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 },
  logo: { height: 36, width: "auto" },
  dealerName: { color: "#fff", fontSize: 14, fontWeight: 700, margin: 0 },
  content: { padding: 24 },
  topBar: { display: "flex", alignItems: "center", gap: 20, marginBottom: 24 },
  backBtn: { background: "transparent", border: "1px solid #ddd", borderRadius: 6, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontFamily: "Georgia, serif", color: "#666" },
  pageTitle: { fontSize: 22, fontWeight: 700, color: "#111", margin: 0, fontFamily: "Georgia, serif" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 },
  column: { display: "flex", flexDirection: "column", gap: 20 },
  section: { background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: "#1B6157", margin: "0 0 16px", letterSpacing: 1, textTransform: "uppercase" },
  label: { display: "block", fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 6, marginTop: 10 },
  input: { width: "100%", border: "2px solid #e0e0e0", borderRadius: 8, padding: "12px 14px", fontSize: 14, color: "#111", fontFamily: "Georgia, serif", boxSizing: "border-box", outline: "none", marginBottom: 4 },
  textarea: { width: "100%", border: "2px solid #e0e0e0", borderRadius: 8, padding: "12px 14px", fontSize: 14, color: "#111", fontFamily: "Georgia, serif", boxSizing: "border-box", outline: "none", resize: "vertical" },
  imageUpload: { border: "2px dashed #e0e0e0", borderRadius: 12, cursor: "pointer", overflow: "hidden", minHeight: 160, display: "flex", alignItems: "center", justifyContent: "center" },
  imagePreview: { width: "100%", height: 200, objectFit: "cover", display: "block" },
  imagePlaceholder: { textAlign: "center", padding: 24 },
  changePhotoBtn: { width: "100%", background: "transparent", border: "1px solid #ddd", borderRadius: 6, padding: 8, fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif", color: "#666", marginTop: 8 },
  error: { fontSize: 13, color: "#cc0000", margin: "12px 0", textAlign: "center" },
  actions: { display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 },
  draftBtn: { background: "transparent", color: "#1B6157", border: "2px solid #1B6157", borderRadius: 8, padding: "14px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" },
  publishBtn: { background: "#1B6157", color: "#fff", border: "none", borderRadius: 8, padding: "14px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" },
};
