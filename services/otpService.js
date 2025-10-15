const nodemailer = require('nodemailer');
const crypto = require('crypto');

// In-memory storage for OTPs (in production, use Redis or database)
const otpStorage = new Map();

class OTPService {
    constructor() {
        // Load development mode from environment variables
        this.developmentMode = process.env.DEVELOPMENT_MODE === 'true';
        
        // Configure your email transporter
        this.transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    // Generate 6-digit OTP
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Send OTP via email
    async sendOTP(email, type = 'registration') {
        try {
            const otp = this.generateOTP();
            const expiryTime = Date.now() + (5 * 60 * 1000); // 5 minutes expiry

            // Store OTP with email as key
            otpStorage.set(email, {
                otp,
                expiryTime,
                type,
                verified: false
            });

            const subject = type === 'registration' ? 
                'Email Verification - Registration OTP' : 
                'Password Reset - OTP Verification';

            const htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Email Verification</h2>
                    <p>Hello,</p>
                    <p>Your OTP for ${type} is:</p>
                    <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px;">${otp}</span>
                    </div>
                    <p>This OTP will expire in 5 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <hr style="margin: 30px 0;">
                    <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
                </div>
            `;

            // In development mode, skip email sending and just log the OTP
            if (this.developmentMode) {
                console.log(`\n🔥 DEVELOPMENT MODE - OTP for ${email}: ${otp}`);
                console.log(`📧 Subject: ${subject}`);
                console.log(`⏱️  Expires in 5 minutes\n`);
                return { success: true, message: 'OTP sent successfully (Development Mode)' };
            }

            // Production mode - send actual email
            const mailOptions = {
                from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                to: email,
                subject: subject,
                html: htmlContent
            };

            await this.transporter.sendMail(mailOptions);
            
            console.log(`OTP sent to ${email}: ${otp}`); // For development - remove in production
            return { success: true, message: 'OTP sent successfully' };

        } catch (error) {
            console.error('Error sending OTP:', error);
            return { success: false, message: 'Failed to send OTP' };
        }
    }

    // Verify OTP
    verifyOTP(email, inputOTP) {
        const otpData = otpStorage.get(email);
        
        if (!otpData) {
            return { success: false, message: 'OTP not found or expired' };
        }

        if (Date.now() > otpData.expiryTime) {
            otpStorage.delete(email);
            return { success: false, message: 'OTP has expired' };
        }

        if (otpData.otp !== inputOTP) {
            return { success: false, message: 'Invalid OTP' };
        }

        // Mark as verified
        otpData.verified = true;
        otpStorage.set(email, otpData);

        return { success: true, message: 'OTP verified successfully' };
    }

    // Check if email is verified
    isEmailVerified(email) {
        const otpData = otpStorage.get(email);
        return otpData && otpData.verified;
    }

    // Clean up verified OTP
    clearOTP(email) {
        otpStorage.delete(email);
    }

    // For development - get all OTPs (remove in production)
    getAllOTPs() {
        return Array.from(otpStorage.entries());
    }
}

module.exports = new OTPService();
