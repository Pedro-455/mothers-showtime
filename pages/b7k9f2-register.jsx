import { useState, useCallback } from "react";
import { supabase } from "../supabaseClient";
import heic2any from "heic2any";

const SHOW_ID = "637da564-ed16-4d81-ac33-5652ceda1f89"; // Chrome 26

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
    entrant_name: "", mobile: "", email: "",
    make: "", model: "", year: "", color: "",
    engine: "", transmission: "", story: "",
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

  async function convertIfHeic(file) {
    const isHeic = file.type === "image/heic" || file.type === "image/heif" ||
      file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif");
    if (isHeic) {
      try {
        const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 });
        return new File([converted], file.name.replace(/\.(heic|heif)$/i, ".jpg"), { type: "image/jpeg" });
      } catch (e) {
        console.warn("HEIC conversion failed, using original", e);
        return file;
      }
    }
    return file;
  }

  const addPhotos = useCallback(async (files) => {
    const allFiles = Array.from(files);
    const remaining = 10 - photos.length;
    const toProcess = allFiles.slice(0, remaining);
    
    const converted = await Promise.all(toProcess.map(convertIfHeic));
    const validFiles = converted.filter((f) => f.type.startsWith("image/"));
    
    setPhotos((p) => [...p, ...validFiles]);
    validFiles.forEach((file) => {
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
    if (uploading) return;
    setError("");
    if (photos.length === 0) { setError("Please upload at least one photo of your vehicle."); return; }
    setUploading(true);

    try {
      // 1. Insert into cars table — retry once if first attempt fails
      setProgress("Saving your details...");
      let car, carError;

      // First attempt
      ({ data: car, error: carError } = await supabase
        .from("cars")
        .insert({
          show_id: SHOW_ID,
          entrant_name: form.entrant_name,
          registration_email: form.email,
          registration_phone: form.mobile,
          make: form.make,
          model: form.model,
          year: form.year,
          color: form.color,
          engine: form.engine,
          transmission: form.transmission,
          story: form.story,
          car_story: form.story,
          status: "pending",
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single());

      // Auto-retry once if first attempt failed
      if (carError) {
        setProgress("Retrying...");
        await new Promise(r => setTimeout(r, 1000));
        ({ data: car, error: carError } = await supabase
          .from("cars")
          .insert({
            show_id: SHOW_ID,
            entrant_name: form.entrant_name,
            registration_email: form.email,
            registration_phone: form.mobile,
            make: form.make,
            model: form.model,
            year: form.year,
            color: form.color,
            engine: form.engine,
            transmission: form.transmission,
            story: form.story,
            car_story: form.story,
            status: "pending",
            submitted_at: new Date().toISOString(),
          })
          .select()
          .single());
      }

      if (carError) throw carError;

      // 2. Upload and compress photos
      const photoUrls = [];
      for (let i = 0; i < photos.length; i++) {
        setProgress(`Compressing and uploading photo ${i + 1} of ${photos.length}...`);
        const compressed = await compressImage(photos[i]);
        const fileName = `${car.id}/${Date.now()}-${i}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("car-photos")
          .upload(fileName, compressed, { contentType: "image/jpeg" });
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("car-photos").getPublicUrl(fileName);
          photoUrls.push(urlData.publicUrl);
        }
      }

      // 3. Update car with photo URLs
      if (photoUrls.length > 0) {
        setProgress("Finalising your entry...");
        await supabase
          .from("cars")
          .update({
            photo_url: photoUrls[0],
            photo_urls: photoUrls,
          })
          .eq("id", car.id);
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
            <span style={{ color: "#fff", fontWeight: 700, letterSpacing: 2, fontSize: 13 }}>
              CHROME 26 · AUCKLAND SHOWGROUNDS · JUNE 2026
            </span>
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
      <div style={styles.hero} className="hero">
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <p style={styles.heroEyebrow}>INVITE ONLY · VIP REGISTRATION</p>
          <h1 style={styles.heroTitle}>SHOWCASE</h1>
          <p style={styles.heroSub}>3–4 OCTOBER 2026 · AUCKLAND SHOWGROUNDS</p>
          <div style={styles.heroDivider} />
          <p style={styles.heroBody}>
            You've been personally selected to enter one of New Zealand's most prestigious vehicle shows. 
            Complete your registration below — our judges and the public will see your story and photos on the day.
          </p>
        </div>
      </div>

      {/* FORM CARD */}
      <div style={styles.formWrap} className="form-wrap">
        <form onSubmit={handleSubmit} style={styles.form}>

          {/* OWNER DETAILS */}
          <div style={styles.section} className="section">
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNum}>01</span>
              <div>
                <h2 style={styles.sectionTitle}>Your Details</h2>
                <p style={styles.sectionNote}>Your contact information — not shown to the public</p>
              </div>
            </div>
            <div style={styles.grid2} className="grid2">
              <div style={styles.fieldWrap}>
                <label style={styles.label}>Full Name <span style={styles.req}>*</span></label>
                <input style={styles.input} placeholder="e.g. John Smith" value={form.entrant_name}
                  onChange={(e) => updateField("entrant_name", e.target.value)} required className="mothers-input" />
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
          <div style={styles.section} className="section">
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNum}>02</span>
              <div>
                <h2 style={styles.sectionTitle}>Your Vehicle</h2>
                <p style={styles.sectionNote}>Judges and the public will see this information</p>
              </div>
            </div>
            <div style={styles.grid4} className="grid4">
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
            <div style={{ ...styles.grid2, marginTop: 16 }}>
              <div style={styles.fieldWrap}>
                <label style={styles.label}>Engine</label>
                <input style={styles.input} placeholder="e.g. 350ci V8" value={form.engine}
                  onChange={(e) => updateField("engine", e.target.value)} className="mothers-input" />
              </div>
              <div style={styles.fieldWrap}>
                <label style={styles.label}>Transmission</label>
                <input style={styles.input} placeholder="e.g. 4-Speed Manual" value={form.transmission}
                  onChange={(e) => updateField("transmission", e.target.value)} className="mothers-input" />
              </div>
            </div>
          </div>

          {/* STORY */}
          <div style={styles.section} className="section">
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
          <div style={styles.section} className="section">
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNum}>04</span>
              <div>
                <h2 style={styles.sectionTitle}>Vehicle Photos</h2>
                <p style={styles.sectionNote}>Upload 1–10 photos · All photos are automatically compressed for web</p>
              </div>
            </div>

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

            {previews.length > 0 && (
              <div style={styles.previewGrid} className="preview-grid">
                {previews.map((src, i) => (
                  <div key={i} style={styles.previewItem}>
                    <img src={src} alt={`Photo ${i + 1}`} style={styles.previewImg} />
                    {i === 0 && <div style={styles.mainBadge}>MAIN</div>}
                    <button type="button" style={styles.removeBtn} onClick={() => removePhoto(i)}>✕</button>
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

          {error && <div style={styles.errorBox}>{error}</div>}

          {uploading && progress && (
            <div style={styles.progressBox}>
              <div style={styles.spinner} className="spinner" />
              <span>{progress}</span>
            </div>
          )}

          <button type="submit" disabled={uploading}
            style={{ ...styles.submitBtn, ...(uploading ? styles.submitDisabled : {}) }}
            className="submit-btn">
            {uploading ? "Submitting..." : "Complete My Registration →"}
          </button>

          <p style={styles.formFooter}>
            By submitting you agree that your vehicle information and photos may be displayed to judges and the public at Mothers Showtime events.
          </p>
        </form>
      </div>

      <div style={styles.footer}>
        <div style={styles.footerInner}>
          <p style={styles.footerPowered}>Powered by</p>
          <img src="/Mothers Logo Red.png" alt="Mothers Polish" style={{ width: 120, height: "auto", opacity: 0.8 }} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Georgia', serif", color: "#f0f0f0" },

  // Hero — black with red glow
  hero: { position: "relative", background: "#0a0a0a", borderBottom: "3px solid #CC0000", overflow: "hidden", padding: "80px 24px 60px" },
  heroOverlay: { position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(204,0,0,0.2) 0%, transparent 70%)", pointerEvents: "none" },
  heroContent: { position: "relative", maxWidth: 680, margin: "0 auto", textAlign: "center" },
  logoMark: { width: 72, height: 72, borderRadius: "50%", background: "#CC0000", color: "#fff", fontSize: 36, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 0 50px rgba(204,0,0,0.5)" },
  heroEyebrow: { fontSize: 11, letterSpacing: 4, color: "#D4AF37", textTransform: "uppercase", marginBottom: 16, fontWeight: 600 },
  heroTitle: { fontSize: "clamp(40px, 7vw, 68px)", fontWeight: 900, color: "#fff", margin: "0 0 12px", letterSpacing: -1, lineHeight: 1.05 },
  heroSub: { fontSize: 14, letterSpacing: 3, color: "#aaa", textTransform: "uppercase", marginBottom: 32 },
  heroDivider: { width: 60, height: 3, background: "#CC0000", margin: "0 auto 28px", borderRadius: 2 },
  heroBody: { fontSize: 16, lineHeight: 1.8, color: "#ddd", maxWidth: 560, margin: "0 auto" },

  // Form
  formWrap: { maxWidth: 780, margin: "0 auto", padding: "40px 24px 20px" },
  form: { display: "flex", flexDirection: "column", gap: 0 },

  // Section cards — dark with gold border
  section: { background: "#141414", border: "1px solid #D4AF37", borderRadius: 14, padding: "32px 28px", marginBottom: 24, boxShadow: "0 4px 24px rgba(0,0,0,0.4)" },
  sectionHeader: { display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 28 },
  sectionNum: { fontSize: 11, fontWeight: 700, color: "#D4AF37", letterSpacing: 2, background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.4)", borderRadius: 4, padding: "4px 10px", marginTop: 2, flexShrink: 0 },
  sectionTitle: { fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 4px" },
  sectionNote: { fontSize: 13, color: "#888", margin: 0 },

  // Fields
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 },
  grid4: { display: "grid", gridTemplateColumns: "1fr 1.5fr 1.5fr 1fr", gap: 12 },
  fieldWrap: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 12, fontWeight: 700, color: "#D4AF37", letterSpacing: 1.5, textTransform: "uppercase" },
  req: { color: "#CC0000" },

  // Inputs — light grey with dark text, red focus
  input: { background: "#e8e8e8", border: "2px solid #ccc", borderRadius: 8, padding: "14px 16px", fontSize: 15, color: "#111", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "'Georgia', serif", transition: "border-color 0.2s, box-shadow 0.2s" },
  textarea: { resize: "vertical", minHeight: 140, lineHeight: 1.6 },

  // Photo upload
  dropZone: { border: "2px dashed #D4AF37", borderRadius: 12, padding: "48px 24px", textAlign: "center", cursor: "pointer", transition: "all 0.2s", marginBottom: 16, background: "#0d0d0d" },
  dropZoneActive: { borderColor: "#CC0000", background: "rgba(204,0,0,0.05)" },
  dropIcon: { fontSize: 40, marginBottom: 12 },
  dropTitle: { fontSize: 16, color: "#fff", fontWeight: 600, margin: "0 0 8px" },
  dropSub: { fontSize: 13, color: "#888", margin: 0 },
  previewGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12, marginBottom: 12 },
  previewItem: { position: "relative", borderRadius: 8, overflow: "hidden", aspectRatio: "1", border: "2px solid #D4AF37" },
  previewImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  mainBadge: { position: "absolute", top: 6, left: 6, background: "#CC0000", color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: "3px 6px", borderRadius: 3 },
  removeBtn: { position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.8)", border: "none", color: "#fff", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" },
  photoCount: { fontSize: 13, color: "#888", textAlign: "center", marginTop: 4 },

  // Feedback
  errorBox: { background: "rgba(204,0,0,0.12)", border: "1px solid rgba(204,0,0,0.5)", borderRadius: 8, padding: "14px 18px", color: "#ff8888", fontSize: 14, marginBottom: 16 },
  progressBox: { display: "flex", alignItems: "center", gap: 12, background: "#141414", border: "1px solid #D4AF37", borderRadius: 8, padding: "14px 18px", color: "#D4AF37", fontSize: 14, marginBottom: 16 },
  spinner: { width: 18, height: 18, border: "2px solid #333", borderTop: "2px solid #CC0000", borderRadius: "50%", flexShrink: 0 },

  // Submit button
  submitBtn: { background: "#CC0000", color: "#fff", border: "3px solid #CC0000", borderRadius: 10, padding: "20px 32px", fontSize: 18, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5, transition: "all 0.2s", fontFamily: "'Georgia', serif", marginTop: 8, textTransform: "uppercase", letterSpacing: 2 },
  submitDisabled: { background: "#444", border: "3px solid #444", cursor: "not-allowed" },
  formFooter: { fontSize: 12, color: "#555", textAlign: "center", marginTop: 16, lineHeight: 1.6 },

  // Success screen
  successCard: { maxWidth: 580, margin: "80px auto", background: "#141414", border: "2px solid #D4AF37", borderRadius: 16, padding: "60px 48px", textAlign: "center", boxShadow: "0 0 60px rgba(212,175,55,0.15)" },
  trophyWrap: { marginBottom: 32 },
  trophyRing: { width: 96, height: 96, borderRadius: "50%", border: "3px solid #D4AF37", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", background: "rgba(212,175,55,0.08)", boxShadow: "0 0 50px rgba(212,175,55,0.25)" },
  trophyIcon: { fontSize: 44 },
  successTitle: { fontSize: 48, fontWeight: 900, color: "#fff", margin: "0 0 12px" },
  successSub: { fontSize: 16, color: "#aaa", marginBottom: 32 },
  successDivider: { width: 60, height: 3, background: "#CC0000", margin: "0 auto 32px", borderRadius: 2 },
  successBody: { fontSize: 15, color: "#ccc", lineHeight: 1.8, marginBottom: 16 },
  successBadge: { background: "#CC0000", borderRadius: 8, padding: "16px 20px", margin: "32px 0 24px" },
  successFooter: { fontSize: 13, color: "#666" },

  // Footer
  footer: { borderTop: "1px solid #1a1a1a", padding: "24px", textAlign: "center", marginTop: 20 },
  footerText: { fontSize: 13, color: "#555" },
};

const css = `
  .mothers-input:focus { border-color: #CC0000 !important; border-width: 2px !important; box-shadow: 0 0 0 4px rgba(204,0,0,0.15) !important; background: #fff !important; }
  .mothers-input::placeholder { color: #999 !important; }
  .drop-zone:hover { border-color: #CC0000 !important; background: rgba(204,0,0,0.04) !important; }
  .submit-btn:hover:not(:disabled) { background: #aa0000 !important; border-color: #aa0000 !important; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(204,0,0,0.4) !important; }
  .spinner { animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (max-width: 600px) {
    .grid4 { grid-template-columns: 1fr 1fr !important; }
    .grid2 { grid-template-columns: 1fr !important; }
    .section { padding: 24px 16px !important; }
    .form-wrap { padding: 20px 12px !important; }
    .hero-content { padding: 0 16px !important; }
    .mothers-input { font-size: 16px !important; padding: 16px !important; }
    .submit-btn { font-size: 16px !important; padding: 18px 24px !important; }
  }
`;
