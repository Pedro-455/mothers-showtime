// © 2026 LINQR — linqr.global — All Rights Reserved
import { useState } from "react";

const LINQR_SUPABASE_URL = "https://odnjkxgsgevuvjutqdmi.supabase.co";
const LINQR_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kbmpreGdzZ2V2dXZqdXRxZG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxOTY0NzksImV4cCI6MjA5NTc3MjQ3OX0.tuf7P4I1xTNUMqnNLBkxAfVi-Ny4vjlWQzIX3AgTFoE";

export default function PortalAddVehicle({ dealer, onBack, onSuccess, editListing }) {
  const [form, setForm] = useState({
    stock_number: editListing?.stock_number || "",
    make: editListing?.make || "",
    model: editListing?.model || "",
    year: editListing?.year || "",
    colour: editListing?.colour || "",
    engine: editListing?.engine || "",
    transmission: editListing?.transmission || "",
    odometer: editListing?.odometer || "",
    price: editListing?.price || "",
    finance: editListing?.finance || "",
    description: editListing?.description || "",
    features: editListing?.features?.join("\n") || "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(editListing?.image_url || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage(file, slug) {
    const ext = file.name.split('.').pop();
    const path = `${slug}.${ext}`;
    const res = await fetch(`${LINQR_SUPABASE_URL}/storage/v1/object/vehicle-images/${path}`, {
      method: "POST",
      headers: {
        "apikey": LINQR_ANON_KEY,
        "Authorization": `Bearer ${LINQR_ANON_KEY}`,
        "Content-Type": file.type,
      },
      body: file,
    });
    if (!res.ok) throw new Error("Image upload failed");
    return `${LINQR_SUPABASE_URL}/storage/v1/object/public/vehicle-images/${path}`;
  }

  async function handleSave(publish) {
    if (!form.stock_number || !form.make || !form.model || !form.year) {
      setError("Please fill in Stock Number, Make, Model and Year.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const slug = `${dealer.code.toLowerCase()}-${form.stock_number}`;
      let imageUrl = editListing?.image_url || null;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile, slug);
      }

      const featuresArray = form.features.split("\n").map(f => f.trim()).filter(Boolean);

      const payload = {
        dealer_id: dealer.id,
        stock_number: form.stock_number,
        slug,
        make: form.make,
        model: form.model,
        year: form.year,
        colour: form.colour,
        engine: form.engine,
        transmission: form.transmission,
        odometer: form.odometer,
        price: form.price,
        finance: form.finance,
        description: form.description,
        features: featuresArray,
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

  const F = ({ label, field, placeholder, type = "text" }) => (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>{label}</label>
      <input
        style={styles.input}
        type={type}
        placeholder={placeholder}
        value={form[field]}
        onChange={(e) => handleChange(field, e.target.value)}
      />
    </div>
  );

  return (
    <div style={styles.outer}>
      <div style={styles.page}>
        <div style={styles.header}>
          <img src="/LINQR-logo.png" alt="LINQR" style={styles.logo} />
          <p style={styles.dealerName}>{dealer.name}</p>
        </div>

        <div style={styles.content}>
          <div style={styles.topBar}>
            <button style={styles.backBtn} onClick={onBack}>← Back to Dashboard</button>
            <h2 style={styles.pageTitle}>{editListing ? "Edit Vehicle" : "Add New Vehicle"}</h2>
          </div>

          <div style={styles.formGrid}>

            {/* LEFT COLUMN */}
            <div style={styles.column}>
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Vehicle Identity</h3>
                <F label="Stock Number *" field="stock_number" placeholder="e.g. 23270" />
                <F label="Make *" field="make" placeholder="e.g. Harley-Davidson" />
                <F label="Model *" field="model" placeholder="e.g. Breakout 117" />
                <F label="Year *" field="year" placeholder="e.g. 2026" />
                <F label="Colour" field="colour" placeholder="e.g. Iron Horse Metallic" />
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Specifications</h3>
                <F label="Engine" field="engine" placeholder="e.g. 1926cc Milwaukee-Eight 117" />
                <F label="Transmission" field="transmission" placeholder="e.g. 6-Speed Manual" />
                <F label="Odometer" field="odometer" placeholder="e.g. 0km (New) or 5,400km" />
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Pricing</h3>
                <F label="Price" field="price" placeholder="e.g. $41,740" />
                <F label="Finance" field="finance" placeholder="e.g. From $210/week with 10% deposit" />
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={styles.column}>
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Hero Photo</h3>
                <div style={styles.imageUpload} onClick={() => document.getElementById('imgInput').click()}>
                  {imagePreview
                    ? <img src={imagePreview} alt="Preview" style={styles.imagePreview} />
                    : <div style={styles.imagePlaceholder}>
                        <p style={styles.imagePlaceholderIcon}>📷</p>
                        <p style={styles.imagePlaceholderText}>Click to upload photo</p>
                        <p style={styles.imagePlaceholderSub}>JPG or PNG recommended</p>
                      </div>
                  }
                </div>
                <input id="imgInput" type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
                {imagePreview && <button style={styles.changePhotoBtn} onClick={() => document.getElementById('imgInput').click()}>Change Photo</button>}
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Description</h3>
                <textarea
                  style={styles.textarea}
                  placeholder="Describe this vehicle — what makes it special, condition, history..."
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={5}
                />
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Key Features</h3>
                <p style={styles.featuresHint}>One feature per line</p>
                <textarea
                  style={styles.textarea}
                  placeholder={"24 Months Factory Warranty\nRoadside Assistance\nHOG Membership\nNationwide Delivery"}
                  value={form.features}
                  onChange={(e) => handleChange("features", e.target.value)}
                  rows={6}
                />
              </div>
            </div>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <div style={styles.actions}>
            <button style={styles.draftBtn} onClick={() => handleSave(false)} disabled={saving}>
              {saving ? "Saving..." : "Save as Draft"}
            </button>
            <button style={styles.publishBtn} onClick={() => handleSave(true)} disabled={saving}>
              {saving ? "Publishing..." : "Publish — Go Live! 🚀"}
            </button>
          </div>
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
  sectionTitle: { fontSize: 14, fontWeight: 700, color: "#1B6157", margin: "0 0 16px", letterSpacing: 1, textTransform: "uppercase" },
  fieldWrap: { marginBottom: 12 },
  label: { display: "block", fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 6, letterSpacing: 0.5 },
  input: { width: "100%", border: "2px solid #e0e0e0", borderRadius: 8, padding: "12px 14px", fontSize: 14, color: "#111", fontFamily: "Georgia, serif", boxSizing: "border-box", outline: "none" },
  textarea: { width: "100%", border: "2px solid #e0e0e0", borderRadius: 8, padding: "12px 14px", fontSize: 14, color: "#111", fontFamily: "Georgia, serif", boxSizing: "border-box", outline: "none", resize: "vertical" },
  featuresHint: { fontSize: 12, color: "#aaa", margin: "0 0 8px" },
  imageUpload: { border: "2px dashed #e0e0e0", borderRadius: 12, cursor: "pointer", overflow: "hidden", minHeight: 160, display: "flex", alignItems: "center", justifyContent: "center" },
  imagePreview: { width: "100%", height: 200, objectFit: "cover", display: "block" },
  imagePlaceholder: { textAlign: "center", padding: 24 },
  imagePlaceholderIcon: { fontSize: 40, margin: "0 0 8px" },
  imagePlaceholderText: { fontSize: 15, fontWeight: 700, color: "#555", margin: "0 0 4px" },
  imagePlaceholderSub: { fontSize: 12, color: "#aaa", margin: 0 },
  changePhotoBtn: { width: "100%", background: "transparent", border: "1px solid #ddd", borderRadius: 6, padding: "8px", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif", color: "#666", marginTop: 8 },
  error: { fontSize: 13, color: "#cc0000", margin: "12px 0", textAlign: "center" },
  actions: { display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 },
  draftBtn: { background: "transparent", color: "#1B6157", border: "2px solid #1B6157", borderRadius: 8, padding: "14px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" },
  publishBtn: { background: "#1B6157", color: "#fff", border: "none", borderRadius: 8, padding: "14px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" },
  footer: { textAlign: "center", padding: 24 },
  footerText: { fontSize: 11, color: "#bbb", margin: 0 },
};
