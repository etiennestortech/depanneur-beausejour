export async function onRequestPost(context) {
  const { request, env } = context;

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const nom        = formData.get('nom') || '';
  const courriel   = formData.get('courriel') || '';
  const telephone  = formData.get('telephone') || '';
  const succursale = formData.get('succursale') || '';
  const message    = formData.get('message') || '';
  const poste      = formData.get('poste') || '';
  const lang       = formData.get('lang') || 'fr';
  const cvFile     = formData.get('cv');

  if (!nom || !courriel) {
    return json({ error: 'Missing required fields.' }, 400);
  }

  const isEn = lang === 'en';

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
      <h2 style="margin-bottom:4px">${isEn ? 'New job application' : 'Nouvelle candidature'}</h2>
      <p style="color:#666;margin-top:0">via groupebeausejour.com</p>
      <table style="width:100%;border-collapse:collapse;margin-top:24px">
        ${poste ? `<tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;width:160px">${isEn ? 'Position' : 'Poste'}</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${poste}</td></tr>` : ''}
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666">${isEn ? 'Name' : 'Nom'}</td><td style="padding:10px 0;border-bottom:1px solid #eee">${nom}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666">${isEn ? 'Email' : 'Courriel'}</td><td style="padding:10px 0;border-bottom:1px solid #eee"><a href="mailto:${courriel}">${courriel}</a></td></tr>
        ${telephone ? `<tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666">${isEn ? 'Phone' : 'Téléphone'}</td><td style="padding:10px 0;border-bottom:1px solid #eee">${telephone}</td></tr>` : ''}
        ${succursale ? `<tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666">${isEn ? 'Preferred location' : 'Emplacement souhaité'}</td><td style="padding:10px 0;border-bottom:1px solid #eee">${succursale}</td></tr>` : ''}
        ${message ? `<tr><td style="padding:10px 0;color:#666;vertical-align:top">${isEn ? 'Message' : 'Message'}</td><td style="padding:10px 0;white-space:pre-wrap">${message}</td></tr>` : ''}
      </table>
    </div>
  `;

  const emailPayload = {
    from: 'Site web <noreply@groupebeausejour.com>',
    to: ['rh@groupebeausejour.com'],
    reply_to: courriel,
    subject: `[${isEn ? 'Careers' : 'Carrières'}] ${poste ? poste + ' — ' : ''}${nom}`,
    html,
  };

  // Attach CV if provided
  if (cvFile && cvFile.size > 0) {
    const buffer = await cvFile.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    emailPayload.attachments = [{
      filename: cvFile.name,
      content: base64,
    }];
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailPayload),
  });

  if (!res.ok) {
    console.error('Resend error:', await res.text());
    return json({ error: 'Failed to send email.' }, 500);
  }

  return json({ ok: true });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
