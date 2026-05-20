import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    car: "",
    story: "",
  });

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function updateField(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    // Check if mobile already exists
    const { data: existing } = await supabase
      .from("entries")
      .select("mobile")
      .eq("mobile", form.mobile)
      .maybeSingle();

    if (existing) {
      setLoading(false);
      setMessage("This mobile number is already registered.");
      return;
    }

    // Upload photos
    const photoUrls = [];

    for (let i = 0; i < photos.length; i++) {
      const file = photos[i];
      const fileName = `${form.mobile}_${Date.now()}_${i}.jpg`;

      const { data: upload, error: uploadError } = await supabase.storage
        .from("photos")
        .upload(fileName, file);

      if (uploadError) {
        setLoading(false);
        setMessage("Photo upload failed.");
        return;
      }

      const publicUrl = supabase.storage
        .from("photos")
        .getPublicUrl(fileName).data.publicUrl;

      photoUrls.push(publicUrl);
    }

    // Insert entry
    const { error } = await supabase.from("entries").insert([
      {
        name: form.name,
        mobile: form.mobile,
        email: form.email,
        car: form.car,
        story: form.story,
        photos: photoUrls,
      },
    ]);

    setLoading(false);

    if (error) {
      setMessage("Something went wrong. Please try again.");
    } else {
      setMessage("Registration complete. Thank you!");
      setForm({ name: "", mobile: "", email: "", car: "", story: "" });
      setPhotos([]);
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h2>Mothers Showtime Registration</h2>

      {message && (
        <div style={{ marginBottom: 20, color: "red" }}>{message}</div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Full name"
          value={form.name}
          onChange={updateField}
          required
        />

        <input
          name="mobile"
          placeholder="Mobile number"
          value={form.mobile}
          onChange={updateField}
          required
        />

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={updateField}
        />

        <input
          name="car"
          placeholder="Car make/model"
          value={form.car}
          onChange={updateField}
          required
        />

        <textarea
          name="story"
          placeholder="Tell us about your car"
          value={form.story}
          onChange={updateField}
        />

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setPhotos([...e.target.files])}
        />

        <button disabled={loading}>
          {loading ? "Submitting..." : "Submit Entry"}
        </button>
      </form>
    </div>
  );
}
