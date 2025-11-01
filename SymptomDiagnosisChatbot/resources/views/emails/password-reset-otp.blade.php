<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - PiKrus</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f3f4f6;
            padding: 20px;
            line-height: 1.6;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .email-header {
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            color: #ffffff;
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            font-size: 36px;
            margin-bottom: 10px;
        }
        .email-header h1 {
            font-size: 24px;
            font-weight: 600;
            margin: 0;
        }
        .email-body {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 20px;
        }
        .message {
            color: #4b5563;
            font-size: 15px;
            margin-bottom: 30px;
        }
        .otp-container {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border: 2px solid #3b82f6;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        .otp-label {
            color: #1e40af;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
        }
        .otp-code {
            font-size: 42px;
            font-weight: bold;
            color: #1e40af;
            letter-spacing: 8px;
            font-family: 'Courier New', Courier, monospace;
            margin: 10px 0;
        }
        .otp-expiry {
            color: #dc2626;
            font-size: 13px;
            font-weight: 600;
            margin-top: 15px;
        }
        .warning-box {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px 20px;
            margin: 25px 0;
            border-radius: 6px;
        }
        .warning-box p {
            color: #92400e;
            font-size: 14px;
            margin: 0;
        }
        .security-notice {
            color: #6b7280;
            font-size: 14px;
            margin-top: 25px;
            padding: 15px;
            background-color: #f9fafb;
            border-radius: 8px;
        }
        .email-footer {
            background-color: #f9fafb;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer-text {
            color: #6b7280;
            font-size: 13px;
            margin: 5px 0;
        }
        .footer-link {
            color: #3b82f6;
            text-decoration: none;
        }
        .footer-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <div class="logo">🏠</div>
            <h1>PiKrus Password Reset</h1>
        </div>

        <!-- Body -->
        <div class="email-body">
            <p class="greeting">Hi {{ $userName }},</p>
            
            <p class="message">
                We received a request to reset your password. To proceed with the password reset, 
                please use the verification code below:
            </p>

            <!-- OTP Code -->
            <div class="otp-container">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">{{ $otpCode }}</div>
                <div class="otp-expiry">⏱️ This code expires in 10 minutes</div>
            </div>

            <!-- Warning Box -->
            <div class="warning-box">
                <p>
                    ⚠️ <strong>Security Notice:</strong> Never share this code with anyone. 
                    PiKrus staff will never ask for your verification code.
                </p>
            </div>

            <!-- Security Notice -->
            <div class="security-notice">
                <p>
                    <strong>Didn't request this?</strong><br>
                    If you didn't request a password reset, please ignore this email or contact 
                    our support team if you have concerns about your account security.
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div class="email-footer">
            <p class="footer-text">
                © {{ date('Y') }} PiKrus. All rights reserved.
            </p>
            <p class="footer-text">
                This is an automated email. Please do not reply.
            </p>
            <p class="footer-text" style="margin-top: 15px;">
                Need help? <a href="mailto:support@pikrus.com" class="footer-link">Contact Support</a>
            </p>
        </div>
    </div>
</body>
</html>