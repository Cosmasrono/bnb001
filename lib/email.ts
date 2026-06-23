import nodemailer from "nodemailer";

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

function getTransport() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  const port = Number(SMTP_PORT) || 587;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465, // true for 465, false for 587/STARTTLS
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function sendVerificationEmail(to: string, name: string, verifyUrl: string) {
  const subject = "Verify your email — Isavo Estates";
  const text =
    `Hi ${name},\n\n` +
    `Welcome to Isavo Estates! Please verify your email address to activate your account:\n` +
    `${verifyUrl}\n\n` +
    `This link expires in 24 hours.\n\n` +
    `If you didn't create an account, you can safely ignore this email.`;

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111">
      <h1 style="color:#FF385C;font-size:20px;margin:0 0 16px">Isavo Estates</h1>
      <p style="font-size:15px;line-height:1.5">Hi ${name},</p>
      <p style="font-size:15px;line-height:1.5">Welcome aboard! Please confirm your email address to activate your account.</p>
      <p style="margin:24px 0">
        <a href="${verifyUrl}" style="display:inline-block;background:#FF385C;color:#fff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:10px">Verify my email</a>
      </p>
      <p style="font-size:13px;color:#666;line-height:1.5">Or paste this link into your browser:<br>${verifyUrl}</p>
      <p style="font-size:13px;color:#666">This link expires in 24 hours. If you didn't sign up, you can ignore this email.</p>
    </div>`;

  const transport = getTransport();

  if (!transport) {
    // Dev fallback: SMTP isn't configured, so log the link to the server console.
    console.log("\n========== EMAIL (dev fallback — SMTP not configured) ==========");
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Verify:  ${verifyUrl}`);
    console.log("================================================================\n");
    return;
  }

  await transport.sendMail({
    from: SMTP_FROM || `Isavo Estates <${SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
}
