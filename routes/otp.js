const express = require('express');
const router = express.Router();
const otpService = require('../services/otpService');

// Send OTP for registration
router.post('/send-otp', async (req, res) => {
    try {
        const { email, type = 'registration' } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        const result = await otpService.sendOTP(email, type);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'OTP sent to your email address'
            });
        } else {
            res.status(500).json({
                success: false,
                message: result.message
            });
        }

    } catch (error) {
        console.error('Error in send-otp route:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        const result = otpService.verifyOTP(email, otp);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'OTP verified successfully'
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }

    } catch (error) {
        console.error('Error in verify-otp route:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
    try {
        const { email, type = 'registration' } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Clear existing OTP first
        otpService.clearOTP(email);

        const result = await otpService.sendOTP(email, type);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'New OTP sent to your email address'
            });
        } else {
            res.status(500).json({
                success: false,
                message: result.message
            });
        }

    } catch (error) {
        console.error('Error in resend-otp route:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Check OTP status
router.post('/check-otp-status', (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const isVerified = otpService.isEmailVerified(email);
        
        res.json({
            success: true,
            verified: isVerified
        });

    } catch (error) {
        console.error('Error in check-otp-status route:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Verify account for forgot password
router.post('/verify-account', async (req, res) => {
    try {
        const { username, email, mobile } = req.body;

        if (!username || !email || !mobile) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, and mobile number are required'
            });
        }

        // Import User model to access MongoDB data
        const User = require('../models/User');

        // Find user with matching credentials in MongoDB
        const user = await User.findOne({
            username: { $regex: new RegExp(`^${username}$`, 'i') }, // Case insensitive
            email: { $regex: new RegExp(`^${email}$`, 'i') }, // Case insensitive
            phone: mobile
        });

        if (user) {
            res.json({
                success: true,
                message: 'Account verified successfully'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Account details do not match our records'
            });
        }

    } catch (error) {
        console.error('Error in verify-account route:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { username, email, newPassword } = req.body;

        if (!username || !email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, and new password are required'
            });
        }

        // Skip OTP verification for direct password reset

        // Import User model to access MongoDB data
        const User = require('../models/User');

        // Find and update user in MongoDB
        const user = await User.findOne({
            username: { $regex: new RegExp(`^${username}$`, 'i') }, // Case insensitive
            email: { $regex: new RegExp(`^${email}$`, 'i') } // Case insensitive
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update password in MongoDB
        user.password = newPassword;
        await user.save();

        // Clear OTP after successful password reset
        otpService.clearOTP(email);

        res.json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('Error in reset-password route:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
