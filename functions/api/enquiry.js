export async function onRequestPost({ request, env }) {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return Response.json({ error: 'Invalid request.' }, { status: 415 });
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return Response.json({ error: 'Invalid form data.' }, { status: 400 });
  }

  // Honeypot: bots that fill this hidden field are rejected silently.
  if (String(data.website || '').trim()) {
    return Response.json({ ok: true });
  }

  const name = String(data.name || '').trim();
  const mobile = String(data.mobile || '').trim();
  const city = String(data.city || '').trim();
  const service = String(data.service || '').trim();
  const property = String(data.property || '').trim();
  const preferredDate = String(data.preferredDate || '').trim();
  const message = String(data.message || '').trim();

  if (!name || !mobile) {
    return Response.json({ error: 'Name and mobile number are required.' }, { status: 400 });
  }
  if (name.length > 100 || mobile.length > 30 || city.length > 100 || service.length > 120 || property.length > 50 || message.length > 2000) {
    return Response.json({ error: 'Please check the form fields.' }, { status: 400 });
  }

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'Email service is not configured yet.' }, { status: 503 });
  }

  const to = env.ENQUIRY_TO || 'css.serviceinfo@gmail.com';
  const from = env.ENQUIRY_FROM || 'CSS Service Solution <onboarding@resend.dev>';
  const subject = `New Pest Control Enquiry${city ? ` - ${city}` : ''}`;
  const safe = (v) => v.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#122033">
      <h2 style="color:#0756c9">New Pest Control Enquiry</h2>
      <table cellpadding="7" cellspacing="0" border="0">
        <tr><td><b>Name</b></td><td>${safe(name)}</td></tr>
        <tr><td><b>Mobile</b></td><td>${safe(mobile)}</td></tr>
        <tr><td><b>City</b></td><td>${safe(city || '-')}</td></tr>
        <tr><td><b>Service</b></td><td>${safe(service || '-')}</td></tr>
        <tr><td><b>Property</b></td><td>${safe(property || '-')}</td></tr>
        <tr><td><b>Preferred date</b></td><td>${safe(preferredDate || '-')}</td></tr>
        <tr><td><b>Message</b></td><td>${safe(message || '-')}</td></tr>
      </table>
      <p>Submitted from the CSS Service Solution website.</p>
    </div>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from, to: [to], subject, html })
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('Resend error:', detail);
    return Response.json({ error: 'Email delivery failed.' }, { status: 502 });
  }

  return Response.json({ ok: true });
}
