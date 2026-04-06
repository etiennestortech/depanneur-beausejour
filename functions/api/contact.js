export async function onRequestPost(context) {
  const { request, env } = context;

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const { prenom, nom, courriel, telephone, sujet, message, lang } = data;

  if (!prenom || !nom || !courriel || !message) {
    return json({ error: 'Missing required fields.' }, 400);
  }

  const isEn = lang === 'en';
  const subjectLabels = {
    generale:     isEn ? 'General question'  : 'Question générale',
    'pret-a-manger': isEn ? 'Ready-to-Eat'  : 'Prêt-à-manger',
    'lave-auto':  isEn ? 'Car Wash'          : 'Lave-auto',
    autre:        isEn ? 'Other'             : 'Autre',
  };
  const subjectLabel = subjectLabels[sujet] || sujet || (isEn ? 'Contact form' : 'Formulaire de contact');

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
      <h2 style="margin-bottom:4px">${isEn ? 'New contact message' : 'Nouveau message de contact'}</h2>
      <p style="color:#666;margin-top:0">${isEn ? 'via groupebeausejour.com' : 'via groupebeausejour.com'}</p>
      <table style="width:100%;border-collapse:collapse;margin-top:24px">
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;width:140px">${isEn ? 'Name' : 'Nom'}</td><td style="padding:10px 0;border-bottom:1px solid #eee">${prenom} ${nom}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666">${isEn ? 'Email' : 'Courriel'}</td><td style="padding:10px 0;border-bottom:1px solid #eee"><a href="mailto:${courriel}">${courriel}</a></td></tr>
        ${telephone ? `<tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666">${isEn ? 'Phone' : 'Téléphone'}</td><td style="padding:10px 0;border-bottom:1px solid #eee">${telephone}</td></tr>` : ''}
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666">${isEn ? 'Subject' : 'Sujet'}</td><td style="padding:10px 0;border-bottom:1px solid #eee">${subjectLabel}</td></tr>
        <tr><td style="padding:10px 0;color:#666;vertical-align:top">${isEn ? 'Message' : 'Message'}</td><td style="padding:10px 0;white-space:pre-wrap">${message}</td></tr>
      </table>
    </div>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Site web <noreply@groupebeausejour.com>',
      to: ['info@groupebeausejour.com'],
      reply_to: courriel,
      subject: `[${isEn ? 'Contact' : 'Contact'}] ${subjectLabel} — ${prenom} ${nom}`,
      html,
    }),
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
