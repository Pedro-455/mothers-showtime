import { useState, useCallback } from "react";
import { supabase } from "../supabaseClient";

const SHOW_ID = "57941103-3567-415d-b068-7b76263b068e"; // CHROME Showcase

async function compressImage(file, maxSizeKB = 900) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        const maxDim = 1920;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round((height * maxDim) / width); width = maxDim; }
          else { width = Math.round((width * maxDim) / height); height = maxDim; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        let quality = 0.85;
        const tryCompress = () => {
          canvas.toBlob((blob) => {
            if (blob.size / 1024 > maxSizeKB && quality > 0.3) {
              quality -= 0.1;
              tryCompress();
            } else {
              resolve(new File([blob], file.name, { type: "image/jpeg" }));
            }
          }, "image/jpeg", quality);
        };
        tryCompress();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function Register() {
  const [form, setForm] = useState({
    make: "", model: "", year: "", color: "",
    full_name: "", mobile: "", email: "", story: "",
  });
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const addPhotos = useCallback((files) => {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const remaining = 10 - photos.length;
    const toAdd = validFiles.slice(0, remaining);
    setPhotos((p) => [...p, ...toAdd]);
    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => setPreviews((p) => [...p, e.target.result]);
      reader.readAsDataURL(file);
    });
  }, [photos]);

  function removePhoto(index) {
    setPhotos((p) => p.filter((_, i) => i !== index));
    setPreviews((p) => p.filter((_, i) => i !== index));
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    addPhotos(e.dataTransfer.files);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (photos.length === 0) { setError("Please upload at least one photo of your vehicle."); return; }
    setUploading(true);

    try {
      // 1. Create profile first
      setProgress("Saving your details...");
      const { data: profile } = await supabase
        .from("profiles")
        .insert({
          full_name: form.full_name,
          email: form.email,
          phone: form.mobile,
        })
        .select()
        .single();

      // 2. Create vehicle entry linked to profile
      const { data: vehicle, error: vehicleError } = await supabase
        .from("vehicles")
        .insert({
          make: form.make,
          model: form.model,
          year: parseInt(form.year),
          color: form.color,
          story: form.story,
          user_id: profile ? profile.id : null,
        })
        .select()
        .single();

      if (vehicleError) throw vehicleError;

      // 3. Link to show
      await supabase.from("vehicle_show_links").insert({
        vehicle_id: vehicle.id,
        show_id: SHOW_ID,
      });

      // 3. Upload and compress photos
      const photoUrls = [];
      for (let i = 0; i < photos.length; i++) {
        setProgress(`Compressing and uploading photo ${i + 1} of ${photos.length}...`);
        const compressed = await compressImage(photos[i]);
        const fileName = `${vehicle.id}/${Date.now()}-${i}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("vehicle-photos")
          .upload(fileName, compressed, { contentType: "image/jpeg" });
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("vehicle-photos").getPublicUrl(fileName);
          photoUrls.push({ vehicle_id: vehicle.id, url: urlData.publicUrl, path: fileName });
        }
      }

      // 4. Insert photo records
      if (photoUrls.length > 0) {
        await supabase.from("photos").insert(photoUrls);
        // Set first photo as main
        await supabase.from("vehicles").update({ main_photo_url: photoUrls[0].url }).eq("id", vehicle.id);
      }

      setSubmitted(true);
    } catch (err) {
      setError("Something went wrong. Please try again or contact us.");
      console.error(err);
    } finally {
      setUploading(false);
      setProgress("");
    }
  }

  // ── CONGRATULATIONS SCREEN ──
  if (submitted) {
    return (
      <div style={styles.page}>
        <div style={styles.successCard}>
          <div style={styles.trophyWrap}>
            <div style={styles.trophyRing}>
              <span style={styles.trophyIcon}>🏆</span>
            </div>
          </div>
          <h1 style={styles.successTitle}>You're In!</h1>
          <p style={styles.successSub}>Congratulations — your entry has been received.</p>
          <div style={styles.successDivider} />
          <p style={styles.successBody}>
            Welcome to <strong style={{ color: "#CC0000" }}>Mothers Showtime</strong>. Your vehicle has been registered and our team will review your entry shortly.
          </p>
          <p style={styles.successBody}>
            Your QR code will be sent to you before the show. Place it on your vehicle so judges and the public can view your build story and photos.
          </p>
          <div style={styles.successBadge}>
            <span style={{ color: "#CC0000", fontWeight: 700, letterSpacing: 2, fontSize: 13 }}>CHROME SHOWCASE · AUCKLAND SHOWGROUNDS · SEPTEMBER 2025</span>
          </div>
          <p style={styles.successFooter}>Presented by <strong>Mothers Polish</strong> — The Detailer's Choice Since 1972</p>
        </div>
      </div>
    );
  }

  // ── REGISTRATION FORM ──
  return (
    <div style={styles.page}>
      <style>{css}</style>

      {/* HERO */}
      <div style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <div style={styles.logoMark}>M</div>
          <p style={styles.heroEyebrow}>MOTHERS POLISH · INVITE ONLY</p>
          <h1 style={styles.heroTitle}>Mothers Showtime</h1>
          <p style={styles.heroSub}>CHROME Showcase · Auckland Showgrounds · September 2025</p>
          <div style={styles.heroDivider} />
          <p style={styles.heroBody}>You've been personally selected to enter one of New Zealand's most prestigious vehicle shows. Complete your registration below — our judges and the public will see your story and photos on the day.</p>
        </div>
      </div>

      {/* FORM CARD */}
      <div style={styles.formWrap}>
        <form onSubmit={handleSubmit} style={styles.form}>

          {/* OWNER DETAILS */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNum}>01</span>
              <div>
                <h2 style={styles.sectionTitle}>Your Details</h2>
                <p style={styles.sectionNote}>Your contact information — not shown to the public</p>
              </div>
            </div>
            <div style={styles.grid2}>
              <div style={styles.fieldWrap}>
                <label style={styles.label}>Full Name <span style={styles.req}>*</span></label>
                <input style={styles.input} placeholder="e.g. John Smith" value={form.full_name}
                  onChange={(e) => updateField("full_name", e.target.value)} required className="mothers-input" />
              </div>
              <div style={styles.fieldWrap}>
                <label style={styles.label}>Mobile Number <span style={styles.req}>*</span></label>
                <input style={styles.input} placeholder="e.g. 021 234 5678" value={form.mobile}
                  onChange={(e) => updateField("mobile", e.target.value)} required className="mothers-input" />
              </div>
            </div>
            <div style={styles.fieldWrap}>
              <label style={styles.label}>Email Address <span style={styles.req}>*</span></label>
              <input style={styles.input} type="email" placeholder="e.g. john@email.com" value={form.email}
                onChange={(e) => updateField("email", e.target.value)} required className="mothers-input" />
            </div>
          </div>

          {/* VEHICLE DETAILS */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNum}>02</span>
              <div>
                <h2 style={styles.sectionTitle}>Your Vehicle</h2>
                <p style={styles.sectionNote}>Judges and the public will see this information</p>
              </div>
            </div>
            <div style={styles.grid4}>
              <div style={styles.fieldWrap}>
                <label style={styles.label}>Year <span style={styles.req}>*</span></label>
                <input style={styles.input} placeholder="e.g. 1969" value={form.year}
                  onChange={(e) => updateField("year", e.target.value)} required className="mothers-input" maxLength={4} />
              </div>
              <div style={styles.fieldWrap}>
                <label style={styles.label}>Make <span style={styles.req}>*</span></label>
                <input style={styles.input} placeholder="e.g. Chevrolet" value={form.make}
                  onChange={(e) => updateField("make", e.target.value)} required className="mothers-input" />
              </div>
              <div style={styles.fieldWrap}>
                <label style={styles.label}>Model <span style={styles.req}>*</span></label>
                <input style={styles.input} placeholder="e.g. Camaro" value={form.model}
                  onChange={(e) => updateField("model", e.target.value)} required className="mothers-input" />
              </div>
              <div style={styles.fieldWrap}>
                <label style={styles.label}>Colour</label>
                <input style={styles.input} placeholder="e.g. Rally Red" value={form.color}
                  onChange={(e) => updateField("color", e.target.value)} className="mothers-input" />
              </div>
            </div>
          </div>

          {/* STORY */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNum}>03</span>
              <div>
                <h2 style={styles.sectionTitle}>Your Build Story</h2>
                <p style={styles.sectionNote}>Judges and the public will read this — make it interesting!</p>
              </div>
            </div>
            <div style={styles.fieldWrap}>
              <textarea style={{ ...styles.input, ...styles.textarea }}
                placeholder="How did you acquire this vehicle? What work have you done? What makes it special? Tell us everything..."
                value={form.story} onChange={(e) => updateField("story", e.target.value)}
                className="mothers-input" rows={6} />
            </div>
          </div>

          {/* PHOTOS */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNum}>04</span>
              <div>
                <h2 style={styles.sectionTitle}>Vehicle Photos</h2>
                <p style={styles.sectionNote}>Upload 1–10 photos · All photos are automatically compressed for web</p>
              </div>
            </div>

            {/* Drop Zone */}
            {photos.length < 10 && (
              <div
                style={{ ...styles.dropZone, ...(dragOver ? styles.dropZoneActive : {}) }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById("photoInput").click()}
                className="drop-zone"
              >
                <div style={styles.dropIcon}>📷</div>
                <p style={styles.dropTitle}>Drop your photos here</p>
                <p style={styles.dropSub}>or click to browse · JPG, PNG, WEBP · Max 10 photos · Auto-compressed</p>
                <input id="photoInput" type="file" multiple accept="image/*" style={{ display: "none" }}
                  onChange={(e) => addPhotos(e.target.files)} />
              </div>
            )}

            {/* Preview Grid */}
            {previews.length > 0 && (
              <div style={styles.previewGrid}>
                {previews.map((src, i) => (
                  <div key={i} style={styles.previewItem}>
                    <img src={src} alt={`Photo ${i + 1}`} style={styles.previewImg} />
                    {i === 0 && <div style={styles.mainBadge}>MAIN</div>}
                    <button type="button" style={styles.removeBtn}
                      onClick={() => removePhoto(i)}>✕</button>
                  </div>
                ))}
              </div>
            )}

            <p style={styles.photoCount}>
              {photos.length === 0
                ? "No photos added yet — at least 1 required"
                : `${photos.length} of 10 photos added`}
            </p>
          </div>

          {/* ERROR */}
          {error && <div style={styles.errorBox}>{error}</div>}

          {/* PROGRESS */}
          {uploading && progress && (
            <div style={styles.progressBox}>
              <div style={styles.spinner} className="spinner" />
              <span>{progress}</span>
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={uploading}
            style={{ ...styles.submitBtn, ...(uploading ? styles.submitDisabled : {}) }}
            className="submit-btn"
          >
            {uploading ? "Submitting..." : "Complete My Registration →"}
          </button>

          <p style={styles.formFooter}>
            By submitting you agree that your vehicle information and photos may be displayed to judges and the public at Mothers Showtime events.
          </p>
        </form>
      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        <p style={styles.footerText}>© 2025 Mothers Polish New Zealand · Presented with pride</p>
      </div>
    </div>
  );
}

// ── STYLES ──
const styles = {
  page: { minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Georgia', serif", color: "#f0f0f0" },

  // Hero
  hero: { position: "relative", background: "#0a0a0a", borderBottom: "3px solid #CC0000", overflow: "hidden", padding: "80px 24px 60px" },
  heroOverlay: { position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(204,0,0,0.15) 0%, transparent 70%)", pointerEvents: "none" },
  heroContent: { position: "relative", maxWidth: 680, margin: "0 auto", textAlign: "center" },
  logoMark: { width: 64, height: 64, borderRadius: "50%", background: "#CC0000", color: "#fff", fontSize: 32, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 0 40px rgba(204,0,0,0.4)" },
  heroEyebrow: { fontSize: 11, letterSpacing: 4, color: "#B8860B", textTransform: "uppercase", marginBottom: 16, fontFamily: "'Georgia', serif" },
  heroTitle: { fontSize: "clamp(36px, 7vw, 64px)", fontWeight: 900, color: "#fff", margin: "0 0 12px", letterSpacing: -1, lineHeight: 1.05, fontFamily: "'Georgia', serif" },
  heroSub: { fontSize: 14, letterSpacing: 3, color: "#999", textTransform: "uppercase", marginBottom: 32 },
  heroDivider: { width: 60, height: 2, background: "#CC0000", margin: "0 auto 28px" },
  heroBody: { fontSize: 16, lineHeight: 1.7, color: "#ccc", maxWidth: 560, margin: "0 auto" },

  // Form
  formWrap: { maxWidth: 760, margin: "0 auto", padding: "40px 24px 20px" },
  form: { display: "flex", flexDirection: "column", gap: 0 },

  // Sections
  section: { background: "#111", border: "1px solid #222", borderRadius: 12, padding: "32px 28px", marginBottom: 20 },
  sectionHeader: { display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 28 },
  sectionNum: { fontSize: 11, fontWeight: 700, color: "#CC0000", letterSpacing: 2, background: "rgba(204,0,0,0.1)", border: "1px solid rgba(204,0,0,0.3)", borderRadius: 4, padding: "4px 8px", marginTop: 2, flexShrink: 0 },
  sectionTitle: { fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 4px", fontFamily: "'Georgia', serif" },
  sectionNote: { fontSize: 13, color: "#666", margin: 0 },

  // Fields
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 },
  grid4: { display: "grid", gridTemplateColumns: "1fr 1.5fr 1.5fr 1fr", gap: 12 },
  fieldWrap: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 12, fontWeight: 600, color: "#aaa", letterSpacing: 1, textTransform: "uppercase" },
  req: { color: "#CC0000" },
  input: { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "14px 16px", fontSize: 15, color: "#fff", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "'Georgia', serif", transition: "border-color 0.2s" },
  textarea: { resize: "vertical", minHeight: 140, lineHeight: 1.6 },

  // Photos
  dropZone: { border: "2px dashed #333", borderRadius: 12, padding: "48px 24px", textAlign: "center", cursor: "pointer", transition: "all 0.2s", marginBottom: 16, background: "#0d0d0d" },
  dropZoneActive: { borderColor: "#CC0000", background: "rgba(204,0,0,0.05)" },
  dropIcon: { fontSize: 36, marginBottom: 12 },
  dropTitle: { fontSize: 16, color: "#ccc", fontWeight: 600, margin: "0 0 8px" },
  dropSub: { fontSize: 13, color: "#555", margin: 0 },
  previewGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12, marginBottom: 12 },
  previewItem: { position: "relative", borderRadius: 8, overflow: "hidden", aspectRatio: "1", border: "1px solid #222" },
  previewImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  mainBadge: { position: "absolute", top: 6, left: 6, background: "#CC0000", color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: "3px 6px", borderRadius: 3 },
  removeBtn: { position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.7)", border: "none", color: "#fff", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" },
  photoCount: { fontSize: 13, color: "#555", textAlign: "center", marginTop: 4 },

  // Feedback
  errorBox: { background: "rgba(204,0,0,0.1)", border: "1px solid rgba(204,0,0,0.4)", borderRadius: 8, padding: "14px 18px", color: "#ff6666", fontSize: 14, marginBottom: 16 },
  progressBox: { display: "flex", alignItems: "center", gap: 12, background: "#111", border: "1px solid #222", borderRadius: 8, padding: "14px 18px", color: "#aaa", fontSize: 14, marginBottom: 16 },
  spinner: { width: 18, height: 18, border: "2px solid #333", borderTop: "2px solid #CC0000", borderRadius: "50%", flexShrink: 0 },

  // Submit
  submitBtn: { background: "#CC0000", color: "#fff", border: "none", borderRadius: 10, padding: "20px 32px", fontSize: 17, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5, transition: "all 0.2s", fontFamily: "'Georgia', serif", marginTop: 8 },
  submitDisabled: { background: "#444", cursor: "not-allowed" },
  formFooter: { fontSize: 12, color: "#444", textAlign: "center", marginTop: 16, lineHeight: 1.6 },

  // Success
  successCard: { maxWidth: 560, margin: "80px auto", background: "#111", border: "1px solid #222", borderRadius: 16, padding: "60px 48px", textAlign: "center" },
  trophyWrap: { marginBottom: 32 },
  trophyRing: { width: 88, height: 88, borderRadius: "50%", border: "2px solid #B8860B", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", background: "rgba(184,134,11,0.08)", boxShadow: "0 0 40px rgba(184,134,11,0.2)" },
  trophyIcon: { fontSize: 40 },
  successTitle: { fontSize: 42, fontWeight: 900, color: "#fff", margin: "0 0 12px", fontFamily: "'Georgia', serif" },
  successSub: { fontSize: 16, color: "#999", marginBottom: 32 },
  successDivider: { width: 48, height: 2, background: "#CC0000", margin: "0 auto 32px" },
  successBody: { fontSize: 15, color: "#bbb", lineHeight: 1.7, marginBottom: 16 },
  successBadge: { background: "rgba(204,0,0,0.08)", border: "1px solid rgba(204,0,0,0.2)", borderRadius: 8, padding: "14px 20px", margin: "32px 0 24px" },
  successFooter: { fontSize: 13, color: "#555" },

  // Footer
  footer: { borderTop: "1px solid #1a1a1a", padding: "24px", textAlign: "center", marginTop: 20 },
  footerText: { fontSize: 13, color: "#444" },
};

// ── CSS ANIMATIONS & FOCUS STATES ──
const css = `
  .mothers-input:focus { border-color: #CC0000 !important; box-shadow: 0 0 0 3px rgba(204,0,0,0.1); }
  .drop-zone:hover { border-color: #CC0000 !important; background: rgba(204,0,0,0.03) !important; }
  .submit-btn:hover:not(:disabled) { background: #aa0000 !important; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(204,0,0,0.3); }
  .spinner { animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (max-width: 600px) {
    .grid4 { grid-template-columns: 1fr 1fr !important; }
    .grid2 { grid-template-columns: 1fr !important; }
  }
`;
