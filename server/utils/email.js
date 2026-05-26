const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = 'Streak+ <onboarding@resend.dev>'

function welcomeHtml(firstName) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Welcome to Streak+</title>
</head>
<body style="margin:0;padding:0;background:#f4f1eb;font-family:Arial,sans-serif;color:#1a1a1a;">
  <div style="max-width:480px;margin:0 auto;padding:40px 20px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-flex;width:64px;height:64px;background:linear-gradient(135deg,#EAC775,#DBAD28);border-radius:18px;align-items:center;justify-content:center;font-size:32px;margin-bottom:16px;">
        🔥
      </div>
      <h1 style="margin:0;font-size:26px;font-weight:700;color:#1a1a1a;letter-spacing:-0.5px;">
        Welcome, ${firstName}!
      </h1>
      <p style="margin:8px 0 0;color:#6b6b6b;font-size:14px;">Your streak starts today.</p>
    </div>

    <!-- Hero card -->
    <div style="background:#ffffff;border-radius:20px;padding:24px;margin-bottom:20px;border:1px solid #e5e0d8;">
      <p style="margin:0 0 12px;font-size:15px;line-height:1.65;color:#2a2a2a;">
        You've taken the first step — and that matters more than you think.
      </p>
      <p style="margin:0;font-size:13px;line-height:1.65;color:#888;font-style:italic;border-left:3px solid #DBAD28;padding-left:12px;">
        "Identity is built one small action at a time. Every habit you protect today becomes the person you are tomorrow."
      </p>
    </div>

    <!-- Steps -->
    <div style="background:#ffffff;border-radius:20px;padding:24px;margin-bottom:24px;border:1px solid #e5e0d8;">
      <p style="margin:0 0 16px;font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Get started in 3 steps</p>

      ${[
        ['🔥', 'Add your first habit', 'Tap the + button and pick one small thing to do daily.'],
        ['✓',  'Mark it done today',   "One tap. That's all it takes to start your streak."],
        ['🏆', 'Unlock milestones',    'Hit 7, 14, 21, 30 days and earn achievement badges.'],
      ].map(([icon, title, desc], i) => `
      <div style="display:flex;gap:14px;align-items:flex-start;${i < 2 ? 'margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid #f0ede8;' : ''}">
        <div style="width:38px;height:38px;background:#fdf6e3;border-radius:12px;font-size:17px;display:flex;align-items:center;justify-content:center;flex-shrink:0;text-align:center;line-height:38px;">
          ${icon}
        </div>
        <div>
          <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#1a1a1a;">${title}</p>
          <p style="margin:0;font-size:12px;color:#888;line-height:1.5;">${desc}</p>
        </div>
      </div>`).join('')}
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${process.env.APP_URL || 'https://streak-plus.onrender.com'}"
         style="display:inline-block;background:#DBAD28;color:#1a0f00;text-decoration:none;font-weight:700;font-size:15px;padding:14px 40px;border-radius:14px;letter-spacing:-0.2px;">
        Open Streak+ →
      </a>
    </div>

    <!-- Streak counter preview -->
    <div style="background:#1a1208;border-radius:16px;padding:20px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:36px;font-weight:700;color:#DBAD28;">0</p>
      <p style="margin:0;font-size:13px;color:#71717a;">day streak — start today 🔥</p>
    </div>

    <!-- Footer -->
    <p style="text-align:center;color:#bbb;font-size:11px;margin:0;line-height:1.6;">
      You received this because you signed up for Streak+.<br/>
      Don't break the chain.
    </p>

  </div>
</body>
</html>`
}

async function sendWelcomeEmail(email, firstName) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping welcome email')
    return { ok: true, skipped: true }
  }

  const { data, error } = await resend.emails.send({
    from:    FROM,
    to:      [email],
    subject: `Welcome to Streak+, ${firstName} 🔥`,
    html:    welcomeHtml(firstName),
  })

  if (error) {
    console.error('[email] Resend error:', error)
    throw new Error(error.message || 'Email send failed')
  }

  console.log('[email] Welcome sent:', data.id)
  return { ok: true, id: data.id }
}

module.exports = { sendWelcomeEmail }
