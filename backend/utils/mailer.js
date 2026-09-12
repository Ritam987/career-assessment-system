/**
 * ============================================================================
 * BREVO (SENDINBLUE) EMAIL SERVICE UTILITY (mailer.js)
 * ============================================================================
 * Purpose: Sends 6-digit OTP codes via HTML emails using Brevo Transactional REST API
 * (HTTPS Port 443). Bypasses custom SMTP port blocks (465/587) on cloud platforms like Railway.
 * Allows sending emails to ANY recipient email address without requiring a custom domain.
 * ============================================================================
 */

/**
 * Sends a 6-digit OTP verification email to specified recipient address.
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.otpCode - 6-digit numeric OTP code
 * @param {string} options.purpose - 'signup' | 'password_reset' | 'verification'
 * @returns {Promise<boolean>} True if email was dispatched or logged successfully
 */
exports.sendOTPEmail = async ({ to, otpCode, purpose = 'signup' }) => {
    const emailSubject = purpose === 'password_reset'
        ? '🔑 Password Reset Request - REACH INDIA Portal'
        : '✉️ Email Verification Code - REACH INDIA Portal';

    const purposeTitle = purpose === 'password_reset'
        ? 'Reset Your Password'
        : 'Verify Your Email Address';

    const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; margin: 0; padding: 0; }
                .email-card { max-width: 520px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e5e7eb; }
                .email-header { background: linear-gradient(135deg, #4f46e5, #2563eb); color: #ffffff; padding: 28px 24px; text-align: center; }
                .email-header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
                .email-header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.1em; }
                .email-body { padding: 32px 28px; text-align: center; color: #1f2937; }
                .email-body h2 { font-size: 18px; color: #111827; margin: 0 0 12px; }
                .email-body p { font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0 0 24px; }
                .otp-badge { display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 0.25em; color: #4f46e5; background: #eef2ff; padding: 14px 28px; border-radius: 12px; border: 1px dashed #6366f1; margin: 10px 0 24px; }
                .email-footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
            </style>
        </head>
        <body>
            <div class="email-card">
                <div class="email-header">
                    <h1>REACH INDIA</h1>
                    <p>Career Assessment Portal</p>
                </div>
                <div class="email-body">
                    <h2>${purposeTitle}</h2>
                    <p>Use the following 6-digit verification code to complete your request. This code will expire in <strong>10 minutes</strong>.</p>
                    <div class="otp-badge">${otpCode}</div>
                    <p style="font-size: 12px; color: #6b7280;">If you did not request this verification code, please ignore this message.</p>
                </div>
                <div class="email-footer">
                    &copy; ${new Date().getFullYear()} REACH INDIA Assessment Portal. All rights reserved.
                </div>
            </div>
        </body>
        </html>
    `;

    const brevoApiKey = process.env.BREVO_API_KEY;

    if (brevoApiKey && brevoApiKey !== 'your_brevo_api_key_here') {
        try {
            const senderEmail = process.env.SENDER_EMAIL || 'ritamchatterjee987@gmail.com';
            const senderName = process.env.SENDER_NAME || 'REACH INDIA Portal';

            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': brevoApiKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: { name: senderName, email: senderEmail },
                    to: [{ email: to }],
                    subject: emailSubject,
                    htmlContent: htmlTemplate
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error(`[Mailer] Brevo API Error for ${to}:`, data);
                return false;
            }

            console.log(`[Mailer] OTP Email dispatched via Brevo API to ${to} (Message ID: ${data.messageId})`);
            return true;
        } catch (err) {
            console.error(`[Mailer] Brevo Exception for ${to}:`, err.message);
        }
    }

    // Local Development Fallback Log
    console.log(`===========================================================`);
    console.log(`📩 [DEV MAILER FALLBACK] Email to: ${to}`);
    console.log(`🔑 Purpose: ${purpose} | OTP Code: ${otpCode}`);
    console.log(`===========================================================`);
    return true;
};
