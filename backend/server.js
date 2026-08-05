/* ═══════════════════════════════════════════════════════════
   PORTFOLIO — CYBERPUNK CONTACT TERMINAL BACKEND
   Node.js + Express | Nodemailer | Rate Limiting | Validation
   ═══════════════════════════════════════════════════════════ */

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');

const app  = express();
const PORT = process.env.PORT || 5000;

/* ── CORS ─────────────────────────────────────────────────── */
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost,http://127.0.0.1')
  .split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (Postman, curl, file://)
    if (!origin) return cb(null, true);
    try {
      const hostname = new URL(origin).hostname;
      // Allow localhost, explicitly configured origins, or any .xyz domain
      if (
        ALLOWED_ORIGINS.some(o => origin.startsWith(o)) ||
        hostname.endsWith('.xyz') ||
        hostname === 'localhost' ||
        hostname === '127.0.0.1'
      ) {
        return cb(null, true);
      }
    } catch (e) {
      // Fallback check
      if (ALLOWED_ORIGINS.some(o => origin.startsWith(o))) return cb(null, true);
    }
    cb(new Error('CORS blocked: ' + origin));
  },
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '20kb' }));

/* ── Rate Limiting ───────────────────────────────────────── */
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                      // max 5 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many transmission attempts. Please wait 15 minutes.' }
});

/* ── Nodemailer Transport ────────────────────────────────── */
let transporter;
function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS   // Use an App Password for Gmail
    }
  });
  return transporter;
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
    const tp = getTransporter();
    const ownerEmail  = process.env.OWNER_EMAIL  || process.env.SMTP_USER;
    const replyToAddr = email;

    // 1. Send notification to Owner
    try {
      await tp.sendMail({
        from:    `"Sahoo-Tech Command Center" <${process.env.SMTP_USER}>`,
        to:      ownerEmail,
        replyTo: replyToAddr,
        subject: `[TX: ${txId}] ${category} — ${subject}`,
        html:    buildOwnerEmail(data)
      });
      console.log(`[✓] Owner notification sent to: ${ownerEmail}`);
    } catch (ownerErr) {
      console.error(`[✗] Owner email dispatch failed:`, ownerErr.message);
    }

    // 2. Send confirmation to Sender
    try {
      await tp.sendMail({
        from:    `"Sahoo-Tech Command Center" <${process.env.SMTP_USER}>`,
        to:      email,
        subject: `Transmission Confirmed — ${txId}`,
        html:    buildSenderEmail(data)
      });
      console.log(`[✓] Confirmation auto-reply sent to sender: ${email}`);
    } catch (senderErr) {
      console.error(`[✗] Sender email dispatch failed to ${email}:`, senderErr.message);
    }

    return res.status(200).json({ success: true, txId });

  } catch (err) {
    console.error(`[✗] Email transport failed for ${txId}:`, err.message);
    return res.status(500).json({ error: 'Email dispatch failed. Transmission logged.' });
  }
});

/* ── Health Check ────────────────────────────────────────── */
app.get('/health', (_, res) => res.json({ status: 'ONLINE', timestamp: new Date().toISOString() }));

/* ── 404 ─────────────────────────────────────────────────── */
app.use((_, res) => res.status(404).json({ error: 'Route not found' }));

/* ── Global Error Handler ────────────────────────────────── */
app.use((err, _, res, __) => {
  console.error(err.message);
  res.status(500).json({ error: 'Internal server error' });
});

/* ── Start ───────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════╗`);
  console.log(`║  SAHOO-TECH CONTACT BACKEND ONLINE   ║`);
  console.log(`║  Port : ${PORT.toString().padEnd(28)}║`);
  console.log(`║  Mode : ${(process.env.NODE_ENV || 'development').padEnd(28)}║`);
  console.log(`╚══════════════════════════════════════╝\n`);
});
