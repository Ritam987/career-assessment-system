/**
 * ============================================================================
 * NODEMAILER EMAIL SERVICE UTILITY (mailer.js)
 * ============================================================================
 * Purpose: Configures Nodemailer transporter for sending 6-digit OTP codes via
 * HTML emails over SSL Port 465 with forced IPv4 (family: 4) resolution to prevent
 * ENETUNREACH IPv6 connection errors on cloud hosts like Railway.
 * ============================================================================
 */

const nodemailer = require('nodemailer');

// Initialize Nodemailer transporter instance based on environment configuration
const createTransporter = () => {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpUser && smtpPass) {
        return nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465, // true for SSL port 465
            auth: {
                user: smtpUser,
                pass: smtpPass
            },
            family: 4 // Force IPv4 resolution to prevent ENETUNREACH IPv6 errors on cloud servers
        });
    }

    // Fallback: Return null to trigger console log delivery in dev mode
    return null;
};

const transporter = createTransporter();

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

    const mailOptions = {
        from: process.env.EMAIL_FROM || '"REACH INDIA Portal" <no-reply@reachindia.org>',
        to: to,
        subject: emailSubject,
        html: htmlTemplate
    };

    if (transporter) {
        try {
            await transporter.sendMail(mailOptions);
            console.log(`[Mailer] OTP Email dispatched via SSL SMTP (Port 465 IPv4) to ${to}`);
            return true;
        } catch (err) {
            console.error(`[Mailer] SMTP Delivery Error for ${to}:`, err.message);
        }
    }

    // Local Development Fallback Log
    console.log(`===========================================================`);
    console.log(`📩 [DEV MAILER FALLBACK] Email to: ${to}`);
    console.log(`🔑 Purpose: ${purpose} | OTP Code: ${otpCode}`);
    console.log(`===========================================================`);
    return true;
};
