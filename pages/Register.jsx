import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    car: "",
    story: "",
    photos: [],
  });

  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function uploadPhotos(files) {
    const uploadedUrls = [];

    for (const file of files) {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("photos")
        .upload(fileName, file);

      if (!error) {
        const url = supabase.storage.from("photos").getPublicUrl(fileName).data.publicUrl;
        uploadedUrls.push(url);
      }
    }

    return uploadedUrls;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setUploading(true);

    // Upload photos
    const photoFiles = form.photos;
    const photoUrls = await uploadPhotos(photoFiles);

    // Insert into Supabase using your REAL schema
    const { error } = await supabase.from("entries").insert({
      handle: form.name,
      mobile: form.mobile,
      email: form.email,
      information: form.car,
      story: form.story,
      photos: photoUrls,          // array
      photo_url: photoUrls[0] || null, // legacy single photo
    });

    setUploading(false);

    if (!error) {
      setSubmitted(true);
    } else {
      alert("Error submitting entry");
    }
  }

  if (submitted) {
    return <h2>Thanks! Your entry has been submitted.</h2>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: 20 }}>
      <h2>Register Your Car</h2>

      <input
        placeholder="Your Name"
        value={form.name}
        onChange={(e) => updateField("name", e.target.value)}
        required
      />

      <input
        placeholder="Mobile Number"
        value={form.mobile}
        onChange={(e) => updateField("mobile", e.target.value)}
        required
      />

      <input
        placeholder="Email Address"
        value={form.email}
        onChange={(e) => updateField("email", e.target.value)}
        required
      />

      <input
        placeholder="Car (Make / Model / Year)"
        value={form.car}
        onChange={(e) => updateField("car", e.target.value)}
        required
      />

      <textarea
        placeholder="Your Story"
        value={form.story}
        onChange={(e) => updateField("story", e.target.value)}
      />

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => updateField("photos", e.target.files)}
        required
      />

      <button disabled={uploading}>
        {uploading ? "Uploading..." : "Submit Entry"}
      </button>
    </form>
  );
}
