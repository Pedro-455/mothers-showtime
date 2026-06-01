import { useState } from 'react';

const LINQR_URL = "https://odnjkxgsgevuvjutqdmi.supabase.co";
const LINQR_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kbmpreGdzZ2V2dXZqdXRxZG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxOTY0NzksImV4cCI6MjA5NTc3MjQ3OX0.tuf7P4I1xTNUMqnNLBkxAfVi-Ny4vjlWQzIX3AgTFoE";

export default function PortalAddProperty({ dealer, onBack, onSuccess, editListing }) {
  const [address, setAddress] = useState(editListing?.address || '');
  const [suburb, setSuburb] = useState(editListing?.suburb || '');
  const [bedrooms, setBedrooms] = useState(editListing?.bedrooms || '');
  const [bathrooms, setBathrooms] = useState(editListing?.bathrooms || '');
  const [carSpaces, setCarSpaces] = useState(editListing?.garages || '');
  const [floorArea, setFloorArea] = useState(editListing?.floor_area || '');
  const [landArea, setLandArea] = useState(editListing?.land_area || '');
  const [saleMethod, setSaleMethod] = useState(editListing?.sale_method || '');
  const [price, setPrice] = useState(editListing?.price || '');
  const [cv, setCv] = useState(editListing?.cv || '');
  const [description, setDescription] = useState(editListing?.description || '');
  const [features, setFeatures] = useState(editListing?.features || '');
  const [agent1Name, setAgent1Name] = useState(editListing?.agent_name || '');
  const [agent1Phone, setAgent1Phone] = useState(editListing?.agent_phone || '');
  const [agent2Name, setAgent2Name] = useState(editListing?.agent2_name || '');
  const [agent2Phone, setAgent2Phone] = useState(editListing?.agent2_phone || '');
  const [propertyId, setPropertyId] = useState(editListing?.property_id || '');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(editListing?.image_url || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async (publishStatus) => {
    if (!address) { setError('Property address is required'); return; }
    if (!propertyId) { setError('Property ID is required (e.g. HOW45015)'); return; }
    setSaving(true);
    setError('');

    try {
      const slug = `${dealer.code.toLowerCase()}-${propertyId.toLowerCase()}`;
      let imageUrl = editListing?.image_url || null;

      if (imageFile) {
        const ext = imageFile.name.split('.').pop().toLowerCase();
        const path = `${slug}.${ext}`;
        const uploadRes = await fetch(`${LINQR_URL}/storage/v1/object/vehicle-images/${path}`, {
          method: 'PUT',
          headers: {
            'apikey': LINQR_KEY,
            'Authorization': `Bearer ${LINQR_KEY}`,
            'x-upsert': 'true',
            'Content-Type': imageFile.type
          },
          body: imageFile
        });
        if (!uploadRes.ok) throw new Error('Image upload failed');
        imageUrl = `${LINQR_URL}/storage/v1/object/public/vehicle-images/${path}`;
      }

      const listing = {
        dealer_id: dealer.id,
        slug,
        listing_type: 'property',
        published: publishStatus === 'published',
        image_url: imageUrl,
        price: price || null,
        description,
        features,
        make: address,
        model: suburb || '',
        stock_number: propertyId.toUpperCase(),
        property_id: propertyId.toUpperCase(),
        address,
        suburb,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        garages: carSpaces ? parseInt(carSpaces) : null,
        floor_area: floorArea,
        land_area: landArea,
        sale_method: saleMethod || null,
        cv: cv || null,
        agent_name: agent1Name,
        agent_phone: agent1Phone,
        agent2_name: agent2Name || null,
        agent2_phone: agent2Phone || null,
      };

      if (editListing) {
        const res = await fetch(`${LINQR_URL}/rest/v1/listings?id=eq.${editListing.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': LINQR_KEY,
            'Authorization': `Bearer ${LINQR_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(listing)
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.message || errBody.details || `Update failed (${res.status})`);
        }
      } else {
        const res = await fetch(`${LINQR_URL}/rest/v1/listings`, {
          method: 'POST',
          headers: {
            'apikey': LINQR_KEY,
            'Authorization': `Bearer ${LINQR_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(listing)
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.message || errBody.details || `Insert failed (${res.status})`);
        }
      }

      if (publishStatus === 'published') {
        onSuccess({ slug, address, suburb, propertyId: propertyId.toUpperCase(), dealer, listing_type: 'property' });
      } else {
        onBack();
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1px solid #ddd',
    borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box',
    fontFamily: 'Georgia, serif', outline: 'none'
  };
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '13px', color: '#333' };
  const sectionStyle = { background: 'white', borderRadius: '10px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f0', fontFamily: 'Georgia, serif' }}>
      <div style={{ background: '#FFCD00', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBack} style={{ background: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>← Back</button>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#000' }}>RAY WHITE</div>
            <div style={{ fontSize: '12px', color: '#333' }}>{editListing ? 'Edit Property' : 'Add New Property'}</div>
          </div>
        </div>
        <div style={{ fontSize: '12px', color: '#333', textAlign: 'right' }}>
          <div style={{ fontWeight: 'bold' }}>{dealer.name}</div>
          <div>{dealer.code}</div>
        </div>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px 16px' }}>

        {error && (
          <div style={{ background: '#fee', border: '1px solid #fcc', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#c00', fontSize: '14px' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Property ID */}
        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 16px', fontSize: '15px', color: '#000', borderBottom: '2px solid #FFCD00', paddingBottom: '8px' }}>Property Reference</h3>
          <div>
            <label style={labelStyle}>Property ID * <span style={{ fontWeight: 'normal', color: '#666' }}>(e.g. HOW45015 — from your listing system)</span></label>
            <input style={inputStyle} value={propertyId} onChange={e => setPropertyId(e.target.value)} placeholder="HOW45015" />
            {propertyId && <div style={{ marginTop: '6px', fontSize: '12px', color: '#666' }}>Live URL: linqr.global/{dealer.code.toLowerCase()}-{propertyId.toLowerCase()}</div>}
          </div>
        </div>

        {/* Address */}
        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 16px', fontSize: '15px', color: '#000', borderBottom: '2px solid #FFCD00', paddingBottom: '8px' }}>Property Address</h3>
          <div style={{ display: 'grid', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Street Address *</label>
              <input style={inputStyle} value={address} onChange={e => setAddress(e.target.value)} placeholder="36 Derbyshire Lane" />
            </div>
            <div>
              <label style={labelStyle}>Suburb</label>
              <input style={inputStyle} value={suburb} onChange={e => setSuburb(e.target.value)} placeholder="Karaka, Auckland" />
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 16px', fontSize: '15px', color: '#000', borderBottom: '2px solid #FFCD00', paddingBottom: '8px' }}>Property Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Bedrooms</label>
              <input style={inputStyle} type="number" value={bedrooms} onChange={e => setBedrooms(e.target.value)} placeholder="4" />
            </div>
            <div>
              <label style={labelStyle}>Bathrooms</label>
              <input style={inputStyle} type="number" value={bathrooms} onChange={e => setBathrooms(e.target.value)} placeholder="2" />
            </div>
            <div>
              <label style={labelStyle}>Car Spaces</label>
              <input style={inputStyle} type="number" value={carSpaces} onChange={e => setCarSpaces(e.target.value)} placeholder="2" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Floor Area (m²)</label>
              <input style={inputStyle} value={floorArea} onChange={e => setFloorArea(e.target.value)} placeholder="220" />
            </div>
            <div>
              <label style={labelStyle}>Land Area (m²)</label>
              <input style={inputStyle} value={landArea} onChange={e => setLandArea(e.target.value)} placeholder="850" />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 16px', fontSize: '15px', color: '#000', borderBottom: '2px solid #FFCD00', paddingBottom: '8px' }}>Price & Sale Method <span style={{ fontWeight: 'normal', fontSize: '12px', color: '#888' }}>(only shown on sell sheet if filled in)</span></h3>
          <div style={{ display: 'grid', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Sale Method <span style={{ fontWeight: 'normal', color: '#888' }}>(optional)</span></label>
              <select style={inputStyle} value={saleMethod} onChange={e => setSaleMethod(e.target.value)}>
                <option value="">— Not specified —</option>
                <option>Price</option>
                <option>Deadline Sale</option>
                <option>Auction</option>
                <option>Tender</option>
                <option>Enquiries Over</option>
                <option>By Negotiation</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Asking Price / Guide <span style={{ fontWeight: 'normal', color: '#888' }}>(optional)</span></label>
                <input style={inputStyle} value={price} onChange={e => setPrice(e.target.value)} placeholder="$1,850,000" />
              </div>
              <div>
                <label style={labelStyle}>CV (Rateable Value) <span style={{ fontWeight: 'normal', color: '#888' }}>(optional)</span></label>
                <input style={inputStyle} value={cv} onChange={e => setCv(e.target.value)} placeholder="$1,650,000" />
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 16px', fontSize: '15px', color: '#000', borderBottom: '2px solid #FFCD00', paddingBottom: '8px' }}>Description & Features</h3>
          <div style={{ display: 'grid', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Property Description</label>
              <textarea style={{ ...inputStyle, height: '120px', resize: 'vertical' }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe this property..." />
            </div>
            <div>
              <label style={labelStyle}>Key Features <span style={{ fontWeight: 'normal', color: '#666' }}>(one per line)</span></label>
              <textarea style={{ ...inputStyle, height: '100px', resize: 'vertical' }} value={features} onChange={e => setFeatures(e.target.value)} placeholder={"Heated pool\nHome theatre\nDouble garage\nCity views"} />
            </div>
          </div>
        </div>

        {/* Agents */}
        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 16px', fontSize: '15px', color: '#000', borderBottom: '2px solid #FFCD00', paddingBottom: '8px' }}>Agent Details</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            {/* Agent 1 */}
            <div>
              <div style={{ fontSize: '12px', color: '#888', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Agent 1</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Name</label>
                  <input style={inputStyle} value={agent1Name} onChange={e => setAgent1Name(e.target.value)} placeholder="Sarah Thompson" />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input style={inputStyle} value={agent1Phone} onChange={e => setAgent1Phone(e.target.value)} placeholder="+64 21 123 456" />
                </div>
              </div>
            </div>
            {/* Agent 2 */}
            <div style={{ borderTop: '1px solid #eee', paddingTop: '16px' }}>
              <div style={{ fontSize: '12px', color: '#888', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Agent 2 <span style={{ fontWeight: 'normal', color: '#bbb' }}>(optional)</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Name</label>
                  <input style={inputStyle} value={agent2Name} onChange={e => setAgent2Name(e.target.value)} placeholder="James Wilson" />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input style={inputStyle} value={agent2Phone} onChange={e => setAgent2Phone(e.target.value)} placeholder="+64 21 789 012" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Photo */}
        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 16px', fontSize: '15px', color: '#000', borderBottom: '2px solid #FFCD00', paddingBottom: '8px' }}>Property Photo</h3>
          <input type="file" accept="image/*" onChange={handleImage} style={{ marginBottom: '12px' }} />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #FFCD00' }} />
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '40px' }}>
          <button onClick={() => handleSave('draft')} disabled={saving}
            style={{ padding: '14px', background: 'white', border: '2px solid #FFCD00', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
            {saving ? 'Saving...' : '💾 Save as Draft'}
          </button>
          <button onClick={() => handleSave('published')} disabled={saving}
            style={{ padding: '14px', background: '#FFCD00', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
            {saving ? 'Publishing...' : '🏡 Publish — Go Live!'}
          </button>
        </div>
      </div>
    </div>
  );
}
