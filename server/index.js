import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env') });

const app = express();
const port = Number(process.env.PORT || 8787);

app.use(cors({ origin: true }));
app.use(express.json({ limit: '80kb' }));

const requiredFields = ['name', 'email', 'service', 'projectBrief', 'meetingPreference', 'consent'];

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

  const missing = requiredFields.filter((field) => {
    if (field === 'consent') return !lead.consent;
    return !lead[field];
  });

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email);
  if (!emailOk) missing.push('validEmail');

  return { lead, missing };
}

function makeEmailText(lead) {
  return `Nueva solicitud de consulta para LUMAR Visuals

Nombre: ${lead.name}
Email: ${lead.email}
Teléfono / WhatsApp: ${lead.phone || 'No indicado'}
Instagram / web: ${lead.instagram || 'No indicado'}
Servicio solicitado: ${lead.service}
Ubicación: ${lead.location || 'No indicada'}
Fecha orientativa: ${lead.preferredDate || 'No indicada'}
Presupuesto estimado: ${lead.budget || 'No indicado'}
Preferencia de reunión: ${lead.meetingPreference}

Brief del proyecto:
${lead.projectBrief}

Consentimiento: ${lead.consent ? 'Aceptado' : 'No aceptado'}
Fecha: ${lead.createdAt}
Origen: ${lead.source}
`;
}

async function persistLead(lead) {
  const dir = path.join(rootDir, 'leads');
  await fs.mkdir(dir, { recursive: true });
  const stamp = lead.createdAt.replace(/[:.]/g, '-');
  const file = path.join(dir, `${stamp}-${lead.email.replace(/[^a-z0-9]/gi, '_')}.json`);
  await fs.writeFile(file, JSON.stringify(lead, null, 2), 'utf8');
  return file;
}

async function sendLeadEmail(lead) {
  const target = process.env.LUMAR_INQUIRY_EMAIL;
  const smtpReady = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && target;

  if (!smtpReady) {
    return {
      sent: false,
      reason: 'SMTP_NOT_CONFIGURED',
      message: 'Lead guardado localmente. Configura SMTP y LUMAR_INQUIRY_EMAIL para enviar emails reales.'
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

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'lumar-landing-api' });
});

app.post('/api/inquiries', async (req, res) => {
  try {
    const { lead, missing } = validateLead(req.body || {});
    if (missing.length) {
      return res.status(400).json({ ok: false, error: 'VALIDATION_ERROR', missing });
    }

    const savedTo = await persistLead(lead);
    const mail = await sendLeadEmail(lead);

    return res.status(mail.sent ? 200 : 202).json({
      ok: true,
      saved: true,
      savedTo,
      emailSent: mail.sent,
      email: mail
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR', message: error.message });
  }
});

app.listen(port, () => {
  console.log(`LUMAR inquiry API listening on http://localhost:${port}`);
});
