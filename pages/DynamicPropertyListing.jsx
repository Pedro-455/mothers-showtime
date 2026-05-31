// DynamicPropertyListing.jsx
// This handles property listings from the portal (listing_type === 'property')
// Drop this logic INTO DynamicListing.jsx — see integration notes below

// ─── INTEGRATION NOTE ────────────────────────────────────────────────────────
// In DynamicListing.jsx, after fetching the listing, check:
//   if (listing.listing_type === 'property') return <PropertyListing listing={listing} dealer={dealer} />
// ─────────────────────────────────────────────────────────────────────────────

export default function PropertyListing({ listing, dealer }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [remembered, setRemembered] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const isRayWhite = dealer?.brand_colour === '#FFCD00' || dealer?.code?.startsWith('RW');
  const brandColour = dealer?.brand_colour || '#FFCD00';
  const textOnBrand = isRayWhite ? '#000000' : '#FFFFFF';

  useEffect(() => {
    const n = localStorage.getItem('ms_name');
    const e = localStorage.getItem('ms_email');
    if (n && e) { setName(n); setEmail(e); setRemembered(true); }
  }, []);

  const features = listing.features
    ? listing.features.split('\n').filter(f => f.trim())
    : [];

  const handleSend = async () => {
    if (!name || !email) return;
    setSending(true);
    localStorage.setItem('ms_name', name);
    localStorage.setItem('ms_email', email);
    try {
      await fetch('https://sfymjnjpqvgtoxofndzx.supabase.co/functions/v1/send-sellsheet-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmeW1qbmpwcXZndG94b2ZuZHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NzI1MTAsImV4cCI6MjA3MzE0ODUxMH0.RqBItIZ-Iz_XhKcJNsJSR6e3n5jxW_YKHWGHO5j1z2c` },
        body: JSON.stringify({
          name, email,
          car_name: `${listing.address}${listing.suburb ? ', ' + listing.suburb : ''}`,
          car_url: `https://linqr.global/${listing.slug}`,
          opt_in: true,
          source: 'property-portal'
        })
      });
      setSent(true);
    } catch (e) { console.error(e); }
    setSending(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f0', fontFamily: 'Georgia, serif' }}>
      {/* Ray White Header */}
      <div style={{ background: brandColour, padding: '0' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: '900', fontSize: '22px', color: textOnBrand, letterSpacing: '1px' }}>RAY WHITE</div>
            <div style={{ fontSize: '13px', color: isRayWhite ? '#333' : 'rgba(255,255,255,0.8)' }}>{dealer?.name || 'Real Estate'}</div>
          </div>
          <div style={{ fontSize: '11px', color: isRayWhite ? '#333' : 'rgba(255,255,255,0.7)', textAlign: 'right' }}>
            <div>PROPERTY PROFILE</div>
            <div style={{ fontWeight: 'bold' }}>{listing.property_id}</div>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      {listing.image_url && (
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <img src={listing.image_url} alt={listing.address} style={{ width: '100%', maxHeight: '380px', objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 16px 40px' }}>

        {/* Address & Price */}
        <div style={{ background: 'white', borderRadius: '0 0 12px 12px', padding: '20px', marginBottom: '16px', borderTop: `4px solid ${brandColour}` }}>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#111', marginBottom: '4px' }}>{listing.address}</div>
          {listing.suburb && <div style={{ fontSize: '16px', color: '#555', marginBottom: '16px' }}>{listing.suburb}</div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {listing.price && (
              <div style={{ background: brandColour, color: textOnBrand, padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', fontSize: '18px' }}>
                {listing.sale_method !== 'Price' ? listing.sale_method + ': ' : ''}{listing.price}
              </div>
            )}
            {listing.cv && <div style={{ fontSize: '14px', color: '#666' }}>CV: {listing.cv}</div>}
          </div>
        </div>

        {/* Stats Bar */}
        <div style={{ background: '#111', borderRadius: '10px', padding: '16px', marginBottom: '16px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', textAlign: 'center' }}>
          {[
            { label: 'Bed', value: listing.bedrooms || '—' },
            { label: 'Bath', value: listing.bathrooms || '—' },
            { label: 'Garage', value: listing.garages || '—' },
            { label: 'Floor', value: listing.floor_area ? listing.floor_area + 'm²' : '—' },
            { label: 'Land', value: listing.land_area ? listing.land_area + 'm²' : '—' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ color: brandColour, fontWeight: 'bold', fontSize: '18px' }}>{s.value}</div>
              <div style={{ color: '#aaa', fontSize: '11px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        {listing.description && (
          <div style={{ background: 'white', borderRadius: '10px', padding: '20px', marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '15px', color: '#111', borderBottom: `2px solid ${brandColour}`, paddingBottom: '8px' }}>About This Property</h3>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.7', color: '#333' }}>{listing.description}</p>
          </div>
        )}

        {/* Features */}
        {features.length > 0 && (
          <div style={{ background: 'white', borderRadius: '10px', padding: '20px', marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '15px', color: '#111', borderBottom: `2px solid ${brandColour}`, paddingBottom: '8px' }}>Key Features</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#333' }}>
                  <span style={{ color: brandColour, fontWeight: 'bold' }}>✓</span> {f}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agent */}
        {(listing.agent_name || listing.agent_phone) && (
          <div style={{ background: 'white', borderRadius: '10px', padding: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '2px' }}>YOUR AGENT</div>
              <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#111' }}>{listing.agent_name}</div>
              {listing.agent_phone && <div style={{ fontSize: '14px', color: '#555' }}>{listing.agent_phone}</div>}
            </div>
            {listing.agent_phone && (
              <a href={`tel:${listing.agent_phone}`} style={{ background: brandColour, color: textOnBrand, padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>📞 Call</a>
            )}
          </div>
        )}

        {/* Email Capture */}
        <div style={{ background: 'white', borderRadius: '10px', padding: '20px', marginBottom: '16px', border: `2px solid ${brandColour}` }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '16px', color: '#111' }}>📋 Request More Information</h3>
          <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#666' }}>Send yourself this property profile</p>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#1B6157', fontWeight: 'bold' }}>
              ✅ Sent! Check your inbox.
            </div>
          ) : (
            <>
              {remembered && (
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>
                  Sending as <strong>{name}</strong> · <button onClick={() => { setRemembered(false); setName(''); setEmail(''); localStorage.removeItem('ms_name'); localStorage.removeItem('ms_email'); }} style={{ background: 'none', border: 'none', color: '#c00', cursor: 'pointer', fontSize: '13px' }}>Not me</button>
                </div>
              )}
              {!remembered && (
                <div style={{ display: 'grid', gap: '10px', marginBottom: '12px' }}>
                  <input style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
                  <input style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email" type="email" />
                </div>
              )}
              <button onClick={handleSend} disabled={sending || !name || !email} style={{ width: '100%', padding: '12px', background: '#111', color: brandColour, border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
                {sending ? 'Sending...' : '✉️ Send Me This Property'}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: '12px', color: '#999', marginTop: '20px' }}>
          <img src="/LINQR-logo.png" alt="LINQR" style={{ height: '28px', marginBottom: '6px' }} />
          <div>© LINQR™ 2026 · linqr.global</div>
        </div>
      </div>
    </div>
  );
}
