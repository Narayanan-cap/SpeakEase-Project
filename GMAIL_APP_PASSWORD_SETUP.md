
# Gmail App Password Setup Instructions

## ⚠️ IMPORTANT: Your OTP emails are currently not working because you need to set up a Gmail App Password.

Currently, your system is configured to send OTPs to the terminal console instead of user emails because:
1. `DEVELOPMENT_MODE` was set to `true` 
2. Gmail App Password is not properly configured

## Steps to Fix Email Sending:

### Step 1: Enable 2-Factor Authentication on Gmail
1. Go to your Google Account settings: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "How you sign in to Google", click on "2-Step Verification"
4. Follow the prompts to set up 2-factor authentication (if not already enabled)

### Step 2: Generate Gmail App Password
1. Still in the "Security" section, look for "App passwords" (this option only appears after 2FA is enabled)
2. Click on "App passwords"
3. In the "Select app" dropdown, choose "Mail"
4. In the "Select device" dropdown, choose "Other (Custom name)"
5. Type "Feedback Portal OTP" as the custom name
6. Click "Generate"
7. **COPY THE 16-CHARACTER PASSWORD** that appears (it looks like: `abcd efgh ijkl mnop`)

### Step 3: Update Your .env File
1. Open your `.env` file in the project root
2. Replace `your_gmail_app_password_here` with the 16-character app password you just generated:
   ```
   EMAIL_PASSWORD=abcd efgh ijkl mnop
   ```
   (Replace with your actual app password - NO SPACES, all together: `abcdefghijklmnop`)

### Step 4: Verify Your Configuration
Your `.env` file should look like this:
```
EMAIL_SERVICE=gmail
EMAIL_USER=kunalsahu267@gmail.com
EMAIL_PASSWORD=your_actual_16_char_app_password
EMAIL_FROM=kunalsahu267@gmail.com
DEVELOPMENT_MODE=false
```

### Step 5: Restart Your Server
After updating the `.env` file, restart your Node.js server:
```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm start
```

## ✅ Testing the Fix

1. Try registering a new user
2. The OTP should now be sent to the user's email address instead of appearing in the terminal
3. Check the email inbox (and spam folder) for the OTP

## 🔒 Security Notes

- **NEVER share your app password** with anyone
- **NEVER commit your app password** to version control
- The app password is specific to your application
- You can revoke and regenerate app passwords anytime from Google Account settings

## 🐛 Troubleshooting

If emails still don't work:
1. Check that 2FA is enabled on your Gmail account
2. Verify the app password is correct (no spaces, all 16 characters)
3. Check your Gmail "Sent" folder to see if emails are being sent
4. Check the recipient's spam folder
5. Look at the server console for any error messages

## 📧 Current Email Template

Your OTP emails will be sent with:
- **Subject**: "Email Verification - Registration OTP" or "Password Reset - OTP Verification"
- **From**: kunalsahu267@gmail.com
- **Content**: Professional HTML template with the 6-digit OTP
- **Expiry**: 5 minutes

The issue has been fixed in the code - you just need to set up the Gmail App Password!

