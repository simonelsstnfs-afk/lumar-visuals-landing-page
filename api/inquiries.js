import nodemailer from 'nodemailer';

function clean(value) {
  return String(value ?? '').replace(/[<>]/g, '').trim();
}

function validateLead(body) {
  const lead = {
    name: clean(body.name),
    email: clean(body.email),
    phone: clean(body.phone),
    instagram: clean(body.instagram),
    service: clean(body.service),
    location: clean(body.location),
    preferredDate: clean(body.preferredDate),
    budget: clean(body.budget),
    meetingPreference: clean(body.meetingPreference),
    projectBrief: clean(body.projectBrief),
    consent: Boolean(body.consent),
    createdAt: new Date().toISOString(),
    source: 'lumar-visuals-landing'
  };

  const required = ['name', 'email', 'service', 'projectBrief', 'meetingPreference', 'consent'];
  const missing = required.filter((field) => field === 'consent' ? !lead.consent : !lead[field]);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) missing.push('validEmail');
  return { lead, missing };
}

function makeEmailText(lead) {
  return `Nueva solicitud de consulta para LUMAR Visuals\n\nNombre: ${lead.name}\nEmail: ${lead.email}\nTeléfono / WhatsApp: ${lead.phone || 'No indicado'}\nInstagram / web: ${lead.instagram || 'No indicado'}\nServicio solicitado: ${lead.service}\nUbicación: ${lead.location || 'No indicada'}\nFecha orientativa: ${lead.preferredDate || 'No indicada'}\nPresupuesto estimado: ${lead.budget || 'No indicado'}\nPreferencia de reunión: ${lead.meetingPreference}\n\nBrief del proyecto:\n${lead.projectBrief}\n\nConsentimiento: ${lead.consent ? 'Aceptado' : 'No aceptado'}\nFecha: ${lead.createdAt}\nOrigen: ${lead.source}\n`;
}

async function sendLeadEmail(lead) {
  const target = process.env.LUMAR_INQUIRY_EMAIL;
  const smtpReady = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && target;

  if (!smtpReady) {
    return {
      sent: false,
      reason: 'SMTP_NOT_CONFIGURED',
      message: 'Configura SMTP_HOST, SMTP_USER, SMTP_PASS y LUMAR_INQUIRY_EMAIL en Vercel para enviar emails reales.'
    };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: target,
    replyTo: lead.email,
    subject: `Nueva consulta LUMAR: ${lead.service} de ${lead.name}`,
    text: makeEmailText(lead)
  });

  return { sent: true, messageId: info.messageId };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });

  try {
    const { lead, missing } = validateLead(req.body || {});
    if (missing.length) return res.status(400).json({ ok: false, error: 'VALIDATION_ERROR', missing });

    const mail = await sendLeadEmail(lead);
    return res.status(mail.sent ? 200 : 202).json({ ok: true, emailSent: mail.sent, email: mail });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR', message: error.message });
  }
}
