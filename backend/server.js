/* ═══════════════════════════════════════════════════════════
   PORTFOLIO — CYBERPUNK CONTACT TERMINAL BACKEND
   Node.js + Express | Nodemailer (Gmail SMTP)
   Rate Limiting | Validation
   ═══════════════════════════════════════════════════════════ */

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');

const app  = express();
const PORT = process.env.PORT || 5000;

/* ── Trust Render's reverse proxy — MUST be set before any middleware ── */
app.set('trust proxy', 1);

/* ── CORS ─────────────────────────────────────────────────── */
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost,http://127.0.0.1')
  .split(',').map(o => o.trim());

/* ── CORS (Permissive origin mirror - guarantees no CORS blockage) ── */
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  credentials: true
}));
app.options('*', cors());

app.use(express.json({ limit: '20kb' }));

/* ── Root & Health Check Endpoints ───────────────────────── */
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Sahoo-Tech Cyberpunk Contact API',
    endpoints: {
      health: 'GET /api/health',
      contact: 'POST /api/contact'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'online', timestamp: new Date().toISOString() });
});

app.get('/api/test-email', async (req, res) => {
  const resendKey = (process.env.RESEND_API_KEY || '').trim();
  if (resendKey) {
    return res.json({
      success: true,
      mode: 'resend',
      message: 'Resend HTTP API key configured (Bypasses SMTP port blocking).',
      resendKeySet: true
    });
  }
  try {
    const tp = createSmtpTransporter();
    await tp.verify();
    res.json({
      success: true,
      mode: 'smtp',
      message: 'SMTP credentials & Gmail connection verified successfully!',
      user: process.env.SMTP_USER ? process.env.SMTP_USER.trim() : 'NOT SET'
    });
  } catch (err) {
    res.status(200).json({
      success: false,
      mode: 'smtp',
      error: err.message,
      userConfigured: !!process.env.SMTP_USER,
      passConfigured: !!process.env.SMTP_PASS
    });
  }
});

/* ── Rate Limiting ───────────────────────────────────────── */
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                     // max 10 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many transmission attempts. Please wait 15 minutes.' }
});

/* ── Email Dispatch (Resend HTTP API or Nodemailer Gmail SMTP) ── */

async function sendViaResend(to, subject, html, replyTo) {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  if (!apiKey) throw new Error('RESEND_API_KEY is missing');
  const from = process.env.RESEND_FROM || 'Sahoo-Tech Command Center <onboarding@resend.dev>';
  const body = { from, to, subject, html };
  if (replyTo) body.reply_to = replyTo;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || JSON.stringify(data));
  }
  return data;
}

// ── Create a fresh SMTP transporter per email ──
function createSmtpTransporter() {
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
  if (!user || !pass) {
    throw new Error('SMTP credentials missing (SMTP_USER or SMTP_PASS not set in environment)');
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
}

async function sendViaSMTP(to, subject, html, from, replyTo) {
  const tp  = createSmtpTransporter();
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const msgId = `<${Date.now()}.${Math.random().toString(36).slice(2)}@sahoo-tech.com>`;
  const opts = {
    from:       from || `"Sahoo-Tech Command Center" <${smtpUser}>`,
    to,
    subject,
    html,
    messageId:  msgId,
    headers: {
      'X-Mailer':        'Sahoo-Tech Contact Terminal v2.0',
      'X-Priority':      '3',
      'X-MS-Exchange-Organization-SCL': '-1',
      'Precedence':      'bulk',
      'Auto-Submitted':  'auto-generated'
    }
  };
  if (replyTo) opts.replyTo = replyTo;
  try {
    const result = await tp.sendMail(opts);
    return result;
  } finally {
    tp.close();
  }
}

// ── Primary sendEmail function ──
async function sendEmail({ to, subject, html, replyTo }) {
  const resendKey = (process.env.RESEND_API_KEY || '').trim();
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

  if (resendKey) {
    try {
      console.log(`[EMAIL] Attempting Resend HTTP API dispatch → ${to}`);
      return await sendViaResend(to, subject, html, replyTo);
    } catch (resendErr) {
      console.warn(`[EMAIL] Resend HTTP API failed: ${resendErr.message}`);
      if (user && pass) {
        console.log(`[EMAIL] Falling back to SMTP → ${to}`);
        return await sendViaSMTP(to, subject, html, `"Sahoo-Tech Command Center" <${user}>`, replyTo);
      }
      throw resendErr;
    }
  }

  if (user && pass) {
    console.log(`[EMAIL] Attempting SMTP dispatch → ${to}`);
    return await sendViaSMTP(to, subject, html, `"Sahoo-Tech Command Center" <${user}>`, replyTo);
  }

  throw new Error('No email dispatch mechanism configured (RESEND_API_KEY or SMTP_USER/SMTP_PASS missing in environment)');
}

/* ── HTML Email Templates ────────────────────────────────── */

// Email to YOU (portfolio owner)
function buildOwnerEmail(data) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>New Transmission — ${data.txId}</title>
</head>
<body style="margin:0;padding:0;background-color:#05070A;font-family:'Courier New',Courier,monospace;color:#00F5FF;">
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#05070A;padding:24px 12px;">
  <tr>
    <td align="center">
      <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#0D1117;border:1px solid #00F5FF;border-radius:12px;padding:24px;">
        
        <!-- Header -->
        <tr>
          <td align="center" style="padding-bottom:20px;border-bottom:1px solid #00F5FF;">
            <div style="display:inline-block;background-color:rgba(0,245,255,0.15);border:1px solid #00F5FF;border-radius:4px;padding:4px 14px;font-size:11px;color:#00F5FF;letter-spacing:2px;font-weight:bold;margin-bottom:12px;">
              INCOMING TRANSMISSION
            </div>
            <h1 style="margin:8px 0 0 0;font-size:22px;color:#00F5FF !important;letter-spacing:3px;">NEW MESSAGE RECEIVED</h1>
            <p style="font-size:11px;color:#50D0FF !important;margin:6px 0 0 0;letter-spacing:1px;">SAHOO-TECH COMMAND CENTER · SECURE CHANNEL</p>
          </td>
        </tr>

        <!-- Space -->
        <tr><td height="20"></td></tr>

        <!-- Transmission Metadata Table -->
        <tr>
          <td>
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#090E17;border:1px solid #00F5FF;border-radius:8px;padding:16px;">
              <tr>
                <td style="padding:8px 0;font-size:11px;color:#50D0FF !important;font-weight:bold;letter-spacing:1px;width:35%;">TRANSMISSION ID</td>
                <td style="padding:8px 0;font-size:13px;color:#00F5FF !important;text-align:right;font-weight:bold;">${data.txId}</td>
              </tr>
              <tr><td colspan="2" style="border-bottom:1px solid rgba(0,245,255,0.2);"></td></tr>
              <tr>
                <td style="padding:8px 0;font-size:11px;color:#50D0FF !important;font-weight:bold;letter-spacing:1px;">DATE &amp; TIME</td>
                <td style="padding:8px 0;font-size:12px;color:#00F5FF !important;text-align:right;">${new Date().toUTCString()}</td>
              </tr>
              <tr><td colspan="2" style="border-bottom:1px solid rgba(0,245,255,0.2);"></td></tr>
              <tr>
                <td style="padding:8px 0;font-size:11px;color:#50D0FF !important;font-weight:bold;letter-spacing:1px;">SENDER NAME</td>
                <td style="padding:8px 0;font-size:13px;color:#00F5FF !important;text-align:right;font-weight:bold;">${escHtml(data.name)}</td>
              </tr>
              <tr><td colspan="2" style="border-bottom:1px solid rgba(0,245,255,0.2);"></td></tr>
              <tr>
                <td style="padding:8px 0;font-size:11px;color:#50D0FF !important;font-weight:bold;letter-spacing:1px;">EMAIL</td>
                <td style="padding:8px 0;font-size:13px;text-align:right;"><a href="mailto:${escHtml(data.email)}" style="color:#00F5FF !important;text-decoration:underline;">${escHtml(data.email)}</a></td>
              </tr>
              <tr><td colspan="2" style="border-bottom:1px solid rgba(0,245,255,0.2);"></td></tr>
              <tr>
                <td style="padding:8px 0;font-size:11px;color:#50D0FF !important;font-weight:bold;letter-spacing:1px;">ORGANIZATION</td>
                <td style="padding:8px 0;font-size:12px;color:#00F5FF !important;text-align:right;">${escHtml(data.organization) || '—'}</td>
              </tr>
              <tr><td colspan="2" style="border-bottom:1px solid rgba(0,245,255,0.2);"></td></tr>
              <tr>
                <td style="padding:8px 0;font-size:11px;color:#50D0FF !important;font-weight:bold;letter-spacing:1px;">CATEGORY</td>
                <td style="padding:8px 0;font-size:12px;color:#00F5FF !important;text-align:right;font-weight:bold;">${escHtml(data.category)}</td>
              </tr>
              <tr><td colspan="2" style="border-bottom:1px solid rgba(0,245,255,0.2);"></td></tr>
              <tr>
                <td style="padding:8px 0;font-size:11px;color:#50D0FF !important;font-weight:bold;letter-spacing:1px;">SUBJECT</td>
                <td style="padding:8px 0;font-size:12px;color:#00F5FF !important;text-align:right;">${escHtml(data.subject)}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Space -->
        <tr><td height="16"></td></tr>

        <!-- Transmission Payload Box (Second Box) -->
        <tr>
          <td>
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#090E17;border:1px solid #00F5FF;border-radius:8px;padding:16px;">
              <tr>
                <td style="padding-bottom:10px;font-size:11px;color:#00F5FF !important;font-weight:bold;letter-spacing:2px;">
                  [ TRANSMISSION PAYLOAD ]
                </td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#00F5FF !important;line-height:1.7;white-space:pre-wrap;word-break:break-word;background-color:#05070A;border:1px solid rgba(0,245,255,0.3);border-radius:6px;padding:14px;">
                  ${escHtml(data.message)}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Space -->
        <tr><td height="16"></td></tr>

        <!-- Status Bar Below Second Box -->
        <tr>
          <td>
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#05070A;border:1px solid #28CA41;border-radius:6px;padding:12px 16px;">
              <tr>
                <td width="16" style="vertical-align:middle;">
                  <div style="width:10px;height:10px;background-color:#28CA41;border-radius:50%;"></div>
                </td>
                <td style="font-size:11px;color:#28CA41 !important;letter-spacing:1px;font-weight:bold;padding-left:8px;">
                  TRANSMISSION DELIVERED · ENCRYPTION: AES-256 · STATUS: RECEIVED
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Space -->
        <tr><td height="20"></td></tr>

        <!-- Footer Below Second Box -->
        <tr>
          <td align="center" style="font-size:11px;font-family:'Courier New',Courier,monospace;color:#00F5FF;letter-spacing:1px;line-height:1.6;border-top:1px solid #00F5FF;padding-top:16px;">
            <p style="margin:0 0 4px 0;color:#00F5FF !important;font-weight:bold;">SAYANTAN SAHOO PORTFOLIO · CYBERPUNK CONTACT TERMINAL</p>
            <p style="margin:0;color:#50D0FF !important;">This message was transmitted through your secure portfolio contact system.</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// Confirmation email to SENDER
function buildSenderEmail(data) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Transmission Confirmed — ${data.txId}</title>
</head>
<body style="margin:0;padding:0;background-color:#05070A;font-family:'Courier New',Courier,monospace;color:#00F5FF;">
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#05070A;padding:24px 12px;">
  <tr>
    <td align="center">
      <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#0D1117;border:1px solid #00F5FF;border-radius:12px;padding:24px;">
        
        <!-- Header -->
        <tr>
          <td align="center" style="padding-bottom:20px;border-bottom:1px solid #00F5FF;">
            <div style="display:inline-block;background-color:rgba(40,202,65,0.15);border:1px solid #28CA41;border-radius:4px;padding:4px 14px;font-size:11px;color:#28CA41 !important;letter-spacing:2px;font-weight:bold;margin-bottom:12px;">
              ✓ TRANSMISSION CONFIRMED
            </div>
            <div style="font-size:36px;margin:8px 0;color:#00F5FF !important;">📡</div>
            <h1 style="margin:4px 0 0 0;font-size:20px;color:#00F5FF !important;letter-spacing:3px;">SECURE CHANNEL ESTABLISHED</h1>
            <p style="font-size:13px;color:#50D0FF !important;margin:10px 0 0 0;line-height:1.6;">
              Hello <strong style="color:#00F5FF !important;text-decoration:underline;">${escHtml(data.name)}</strong>,<br>
              Your transmission has been successfully logged in the command center.<br>
              A response will be dispatched to your email address shortly.
            </p>
          </td>
        </tr>

        <!-- Space -->
        <tr><td height="20"></td></tr>

        <!-- Confirmation Receipt Details Table (Box 1) -->
        <tr>
          <td>
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#090E17;border:1px solid #00F5FF;border-radius:8px;padding:16px;">
              <tr>
                <td style="padding:8px 0;font-size:11px;color:#50D0FF !important;font-weight:bold;letter-spacing:1px;width:40%;">TRANSMISSION ID</td>
                <td style="padding:8px 0;font-size:13px;color:#00F5FF !important;text-align:right;font-weight:bold;">${data.txId}</td>
              </tr>
              <tr><td colspan="2" style="border-bottom:1px solid rgba(0,245,255,0.2);"></td></tr>
              <tr>
                <td style="padding:8px 0;font-size:11px;color:#50D0FF !important;font-weight:bold;letter-spacing:1px;">CATEGORY</td>
                <td style="padding:8px 0;font-size:12px;color:#00F5FF !important;text-align:right;">${escHtml(data.category)}</td>
              </tr>
              <tr><td colspan="2" style="border-bottom:1px solid rgba(0,245,255,0.2);"></td></tr>
              <tr>
                <td style="padding:8px 0;font-size:11px;color:#50D0FF !important;font-weight:bold;letter-spacing:1px;">SUBJECT</td>
                <td style="padding:8px 0;font-size:12px;color:#00F5FF !important;text-align:right;">${escHtml(data.subject)}</td>
              </tr>
              <tr><td colspan="2" style="border-bottom:1px solid rgba(0,245,255,0.2);"></td></tr>
              <tr>
                <td style="padding:8px 0;font-size:11px;color:#50D0FF !important;font-weight:bold;letter-spacing:1px;">DELIVERY STATUS</td>
                <td style="padding:8px 0;font-size:12px;color:#28CA41 !important;text-align:right;font-weight:bold;">● DELIVERED</td>
              </tr>
              <tr><td colspan="2" style="border-bottom:1px solid rgba(0,245,255,0.2);"></td></tr>
              <tr>
                <td style="padding:8px 0;font-size:11px;color:#50D0FF !important;font-weight:bold;letter-spacing:1px;">CHANNEL</td>
                <td style="padding:8px 0;font-size:12px;color:#00F5FF !important;text-align:right;">ENCRYPTED · AES-256</td>
              </tr>
              <tr><td colspan="2" style="border-bottom:1px solid rgba(0,245,255,0.2);"></td></tr>
              <tr>
                <td style="padding:8px 0;font-size:11px;color:#50D0FF !important;font-weight:bold;letter-spacing:1px;">ESTIMATED RESPONSE</td>
                <td style="padding:8px 0;font-size:12px;color:#00F5FF !important;text-align:right;font-weight:bold;">24–48 Business Hours</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Space -->
        <tr><td height="16"></td></tr>

        <!-- Copy of Submitted Message (Box 2) -->
        <tr>
          <td>
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#090E17;border:1px solid #00F5FF;border-radius:8px;padding:16px;">
              <tr>
                <td style="padding-bottom:8px;font-size:11px;color:#00F5FF !important;font-weight:bold;letter-spacing:2px;">
                  [ YOUR TRANSMISSION COPY ]
                </td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#50D0FF !important;line-height:1.7;white-space:pre-wrap;word-break:break-word;background-color:#05070A;border:1px solid rgba(0,245,255,0.3);border-radius:6px;padding:14px;">
                  ${escHtml(data.message)}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Space -->
        <tr><td height="16"></td></tr>

        <!-- Transmission Protocol Information Box (Below Second Box) -->
        <tr>
          <td>
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#090E17;border:1px solid #00F5FF;border-radius:8px;padding:16px;">
              <tr>
                <td style="padding-bottom:10px;font-size:11px;color:#00F5FF !important;font-weight:bold;letter-spacing:2px;">
                  [ TRANSMISSION PROTOCOL ]
                </td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#00F5FF !important;line-height:1.7;background-color:#05070A;border:1px solid rgba(0,245,255,0.3);border-radius:6px;padding:16px;">
                  <p style="margin:0 0 12px 0;color:#50D0FF !important;">
                    Thank you for reaching out through the Sahoo-Tech command center. Your message has been <strong style="color:#00F5FF !important;text-decoration:underline;">securely encrypted and delivered</strong>.
                  </p>
                  <p style="margin:0 0 12px 0;color:#50D0FF !important;">
                    Please retain your Transmission ID <strong style="color:#00F5FF !important;background-color:rgba(0,245,255,0.15);border:1px solid #00F5FF;padding:2px 8px;border-radius:4px;">${data.txId}</strong> for future reference.
                  </p>
                  <p style="margin:0 0 12px 0;color:#50D0FF !important;">
                    Sayantan will personally review your transmission and respond within <strong style="color:#00F5FF !important;">24–48 business hours</strong>.
                  </p>
                  <p style="margin:0;color:#50D0FF !important;">
                    For urgent matters, you may reach out directly at: 
                    <a href="mailto:ss9830872697@gmail.com" style="color:#00F5FF !important;font-weight:bold;text-decoration:underline;">ss9830872697@gmail.com</a>.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Space -->
        <tr><td height="16"></td></tr>

        <!-- Status Bar -->
        <tr>
          <td>
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#05070A;border:1px solid #28CA41;border-radius:6px;padding:12px 16px;">
              <tr>
                <td width="16" style="vertical-align:middle;">
                  <div style="width:10px;height:10px;background-color:#28CA41;border-radius:50%;"></div>
                </td>
                <td style="font-size:11px;color:#28CA41 !important;letter-spacing:1px;font-weight:bold;padding-left:8px;">
                  STATUS: CONFIRMED · ENCRYPTION: AES-256 · LOGGED IN COMMAND CENTER
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Space -->
        <tr><td height="20"></td></tr>

        <!-- Action Button -->
        <tr>
          <td align="center">
            <table border="0" cellspacing="0" cellpadding="0" align="center">
              <tr>
                <td align="center" style="background-color:#00F5FF;border-radius:6px;padding:12px 28px;">
                  <a href="https://github.com/sahoo-tech" style="font-size:12px;font-family:'Courier New',Courier,monospace;font-weight:bold;color:#05070A !important;text-decoration:none;letter-spacing:2px;display:inline-block;">
                    VISIT COMMAND CENTER &rarr;
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Space -->
        <tr><td height="20"></td></tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="font-size:11px;font-family:'Courier New',Courier,monospace;color:#00F5FF;letter-spacing:1px;line-height:1.6;border-top:1px solid #00F5FF;padding-top:16px;">
            <p style="margin:0 0 4px 0;color:#00F5FF !important;font-weight:bold;">SAYANTAN SAHOO PORTFOLIO · CYBERPUNK CONTACT TERMINAL</p>
            <p style="margin:0;color:#50D0FF !important;">You are receiving this confirmation because you submitted a contact transmission at sahoo-tech's portfolio.</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/* ── HTML Escape ─────────────────────────────────────────── */
function escHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ── Validation Rules ────────────────────────────────────── */
const VALID_CATEGORIES = [
  'General Inquiry','Internship Opportunity','Job Opportunity',
  'Collaboration','Freelance','Open Source','Speaking','Other'
];

const contactValidators = [
  body('txId').trim().notEmpty().isLength({ max: 60 }).withMessage('Invalid txId'),
  body('name').trim().notEmpty().isLength({ max: 100 }).withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email required'),
  body('organization').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 150 }),
  body('category').trim().isIn(VALID_CATEGORIES).withMessage('Invalid category'),
  body('subject').trim().notEmpty().isLength({ max: 200 }).withMessage('Subject is required'),
  body('message').trim().notEmpty().isLength({ max: 2000 }).withMessage('Message is required (max 2000 chars)')
];

/* ── Contact Route ───────────────────────────────────────── */
app.post('/api/contact', contactLimiter, contactValidators, async (req, res) => {
  // Validate
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: 'Validation failed', details: errors.array() });
  }

  const { name, email, organization, category, subject, message, txId } = req.body;
  const data = { name, email, organization, category, subject, message, txId };

  // Console log (dev / server-side audit)
  console.log('\n═══ INCOMING TRANSMISSION ═══');
  console.log(`TX-ID       : ${txId}`);
  console.log(`Date        : ${new Date().toISOString()}`);
  console.log(`From        : ${name} <${email}>`);
  console.log(`Org         : ${organization || '—'}`);
  console.log(`Category    : ${category}`);
  console.log(`Subject     : ${subject}`);
  console.log(`Message     : ${message.slice(0, 80)}${message.length > 80 ? '…' : ''}`);
  console.log('═════════════════════════════\n');

  // Send emails
  try {
    const ownerEmail = (process.env.OWNER_EMAIL || process.env.SMTP_USER || '').trim();

    let ownerSuccess  = false;
    let ownerErrorMsg = '';

    // 1. Notify owner
    try {
      await sendEmail({
        to:      ownerEmail,
        subject: `[TX: ${txId}] ${category} — ${subject}`,
        html:    buildOwnerEmail(data),
        replyTo: email
      });
      ownerSuccess = true;
      console.log(`[✓] Owner notification sent to: ${ownerEmail}`);
    } catch (ownerErr) {
      ownerErrorMsg = ownerErr.message;
      console.error(`[✗] Owner email failed:`, ownerErr.message);
    }

    // 2. Confirm to sender
    let senderSuccess = false;
    try {
      await sendEmail({
        to:      email,
        subject: `Transmission Confirmed — ${txId}`,
        html:    buildSenderEmail(data)
      });
      senderSuccess = true;
      console.log(`[✓] Confirmation sent to sender: ${email}`);
    } catch (senderErr) {
      console.error(`[✗] Sender confirmation failed:`, senderErr.message);
    }

    if (!ownerSuccess && !senderSuccess) {
      return res.status(500).json({
        error: 'Email dispatch failed: ' + (ownerErrorMsg || 'Unknown error'),
        txId
      });
    }

    return res.status(200).json({ success: true, txId, ownerDelivered: ownerSuccess, senderDelivered: senderSuccess });

  } catch (err) {
    console.error(`[✗] Email transport error for ${txId}:`, err);
    return res.status(500).json({ error: 'Email dispatch failed: ' + err.message });
  }
});



/* ── 404 ─────────────────────────────────────────────────── */
app.use((_, res) => res.status(404).json({ error: 'Route not found' }));

/* ── Global Error Handler ────────────────────────────────── */
app.use((err, _, res, __) => {
  console.error(err.message);
  res.status(500).json({ error: 'Internal server error' });
});

/* ── Start ───────────────────────────────────────────────── */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n╔══════════════════════════════════════╗`);
    console.log(`║  SAHOO-TECH CONTACT BACKEND ONLINE   ║`);
    console.log(`║  Port : ${PORT.toString().padEnd(28)}║`);
    console.log(`║  Mode : ${(process.env.NODE_ENV || 'development').padEnd(28)}║`);
    console.log(`╚══════════════════════════════════════╝\n`);
  });
}

module.exports = app;
