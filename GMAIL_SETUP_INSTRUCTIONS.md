# Gmail App Password Setup Instructions

## Step 1: Enable 2-Factor Authentication

1. Go to your **Google Account** settings: https://myaccount.google.com
2. Click on **Security** in the left sidebar
3. Under "How you sign in to Google", click on **2-Step Verification**
4. Follow the steps to enable 2-Factor Authentication if not already enabled

## Step 2: Generate App Password

1. Go back to **Security** settings
2. Under "How you sign in to Google", click on **App passwords**
3. You may need to sign in again
4. Select app: **Mail**
5. Select device: **Other (custom name)**
6. Enter name: **Feedback Portal OTP**
7. Click **Generate**
8. **Copy the 16-character password** that appears (spaces don't matter)

## Step 3: Update Your Configuration

1. Open `services/otpService.js`
2. Find this line: `pass: 'your-app-password-here'`
3. Replace `your-app-password-here` with the 16-character App Password you copied

Example:
```javascript
auth: {
    user: 'kunalsahujpr@gmail.com',
    pass: 'abcd efgh ijkl mnop' // Your actual app password
}
```

## Step 4: Test the System

1. Restart your server: `npm start`
2. Try registering with a real email address
3. Check your email for the OTP
4. Test the forgot password functionality

## Important Notes:

- **Never use your regular Gmail password** - only use the App Password
- **Keep your App Password secure** - treat it like a password
- **App Passwords bypass 2FA** for the specific application
- **Remove the App Password** if you no longer need it

## If You Have Issues:

1. **Double-check the App Password** - make sure it's correct
2. **Check spam folder** - OTP emails might go to spam initially
3. **Wait a few minutes** - App Password activation might take time
4. **Try a different email service** if Gmail doesn't work

## Alternative Email Services:

If Gmail doesn't work, you can use other email services:

### Outlook/Hotmail:
```javascript
service: 'outlook',
auth: {
    user: 'your-email@outlook.com',
    pass: 'your-password'
}
```

### Yahoo:
```javascript
service: 'yahoo',
auth: {
    user: 'your-email@yahoo.com',
    pass: 'your-app-password'
}
```
