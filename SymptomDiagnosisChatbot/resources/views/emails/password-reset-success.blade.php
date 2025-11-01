<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Password Reset Successful</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
        .icon { font-size: 48px; margin-bottom: 10px; }
        .header h1 { font-size: 24px; margin: 0; }
        .body { padding: 40px 30px; }
        .greeting { font-size: 18px; color: #1f2937; margin-bottom: 20px; }
        .message { color: #4b5563; font-size: 15px; margin-bottom: 20px; line-height: 1.6; }
        .success-box { background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border: 2px solid #10b981; border-radius: 12px; padding: 20px; text-align: center; margin: 30px 0; }
        .success-icon { font-size: 48px; margin-bottom: 10px; }
        .success-text { color: #065f46; font-size: 18px; font-weight: bold; }
        .info-box { background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .info-label { color: #6b7280; font-size: 14px; }
        .info-value { color: #1f2937; font-size: 14px; font-weight: 600; }
        .warning-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; margin: 25px 0; border-radius: 6px; }
        .warning-box p { color: #92400e; font-size: 14px; margin: 0; }
        .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
        .footer { background-color: #f9fafb; padding: 25px 30px; text-align: center; color: #6b7280; font-size: 13px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="icon">✅</div>
            <h1>Password Reset Successful</h1>
        </div>
        <div class="body">
            <p class="greeting">Hi {{ $userName }},</p>
            
            <div class="success-box">
                <div class="success-icon">🎉</div>
                <div class="success-text">Your password has been successfully reset!</div>
            </div>

            <p class="message">
                Your PiKrus account password was changed successfully. You can now log in with your new password.
            </p>

            <div class="info-box">
                <div class="info-row">
                    <span class="info-label">Time:</span>
                    <span class="info-value">{{ $resetTime }}</span>
                </div>
                <div class="info-row" style="border-bottom: none;">
                    <span class="info-label">Action:</span>
                    <span class="info-value">Password Reset</span>
                </div>
            </div>

            <div style="text-align: center;">
                <a href="{{ config('app.url') }}/login" class="button">Log In to Your Account</a>
            </div>

            <div class="warning-box">
                <p>
                    ⚠️ <strong>Security Alert:</strong> If you did not make this change, please contact our support team immediately.
                </p>
            </div>
        </div>
        <div class="footer">
            <p>© {{ date('Y') }} PiKrus. All rights reserved.</p>
            <p>This is an automated security notification.</p>
        </div>
    </div>
</body>
</html>