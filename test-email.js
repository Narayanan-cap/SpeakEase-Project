require('dotenv').config();
const otpService = require('./services/otpService');

async function testEmail() {
    console.log('🧪 Testing Email Configuration...\n');
    
    // Check environment variables
    console.log('📋 Environment Variables:');
    console.log(`EMAIL_SERVICE: ${process.env.EMAIL_SERVICE}`);
    console.log(`EMAIL_USER: ${process.env.EMAIL_USER}`);
    console.log(`EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '[SET]' : '[NOT SET]'}`);
    console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM}`);
    console.log(`DEVELOPMENT_MODE: ${process.env.DEVELOPMENT_MODE}`);
    console.log('');
    
    // Test with a sample email (replace with your test email)
    const testEmail = 'test@example.com'; // REPLACE WITH YOUR TEST EMAIL
    
    if (process.env.DEVELOPMENT_MODE === 'true') {
        console.log('⚠️  DEVELOPMENT_MODE is enabled - OTP will only show in console');
    } else {
        console.log('✅ DEVELOPMENT_MODE is disabled - OTP will be sent via email');
    }
    
    console.log(`📧 Sending test OTP to: ${testEmail}\n`);
    
    try {
        const result = await otpService.sendOTP(testEmail, 'registration');
        
        if (result.success) {
            console.log('✅ SUCCESS:', result.message);
            
            if (process.env.DEVELOPMENT_MODE !== 'true') {
                console.log('📬 Check your email inbox (and spam folder) for the OTP');
            }
        } else {
            console.log('❌ FAILED:', result.message);
        }
    } catch (error) {
        console.log('💥 ERROR:', error.message);
        
        if (error.message.includes('Invalid login')) {
            console.log('\n🔑 This error usually means:');
            console.log('   1. Gmail App Password is not set correctly');
            console.log('   2. 2-Factor Authentication is not enabled on Gmail');
            console.log('   3. App Password contains spaces or is incorrect');
        }
    }
    
    console.log('\n📚 Next Steps:');
    console.log('1. Follow the instructions in GMAIL_APP_PASSWORD_SETUP.md');
    console.log('2. Update EMAIL_PASSWORD in .env with your Gmail App Password');
    console.log('3. Make sure DEVELOPMENT_MODE=false in .env');
    console.log('4. Restart your server');
}

// Run the test
testEmail();
