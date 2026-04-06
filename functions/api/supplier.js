export async function onRequestPost(context) {
  const { request, env } = context;

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const { entreprise, personne, courriel, telephone, 'type-produit': typeProduit, description, lang } = data;

  if (!entreprise || !personne || !courriel) {
    return json({ error: 'Missing required fields.' }, 400);
  }

  const isEn = lang === 'en';
  const categoryLabels = {
    alimentation:     isEn ? 'Food'            : 'Alimentation',
    boissons:         isEn ? 'Beverages'        : 'Boissons',
    'pret-a-manger':  isEn ? 'Ready-to-Eat'    : 'Prêt-à-manger',
    'produits-generaux': isEn ? 'General Products' : 'Produits généraux',
    autre:            isEn ? 'Other'            : 'Autre',
  };
  const categoryLabel = categoryLabels[typeProduit] || typeProduit || '—';

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
      <h2 style="margin-bottom:4px">${isEn ? 'New supplier application' : 'Nouvelle demande fournisseur'}</h2>
      <p style="color:#666;margin-top:0">via groupebeausejour.com</p>
      <table style="width:100%;border-collapse:collapse;margin-top:24px">
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;width:160px">${isEn ? 'Business name' : 'Entreprise'}</td><td style="padding:10px 0;border-bottom:1px solid #eee">${entreprise}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666">${isEn ? 'Contact person' : 'Personne-ressource'}</td><td style="padding:10px 0;border-bottom:1px solid #eee">${personne}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666">${isEn ? 'Email' : 'Courriel'}</td><td style="padding:10px 0;border-bottom:1px solid #eee"><a href="mailto:${courriel}">${courriel}</a></td></tr>
        ${telephone ? `<tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666">${isEn ? 'Phone' : 'Téléphone'}</td><td style="padding:10px 0;border-bottom:1px solid #eee">${telephone}</td></tr>` : ''}
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666">${isEn ? 'Product type' : 'Type de produit'}</td><td style="padding:10px 0;border-bottom:1px solid #eee">${categoryLabel}</td></tr>
        ${description ? `<tr><td style="padding:10px 0;color:#666;vertical-align:top">${isEn ? 'Description' : 'Description'}</td><td style="padding:10px 0;white-space:pre-wrap">${description}</td></tr>` : ''}
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
      subject: `[${isEn ? 'Supplier' : 'Fournisseur'}] ${entreprise} — ${categoryLabel}`,
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
