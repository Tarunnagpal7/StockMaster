const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // Or use host/port from env if not gmail
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOTP = async (email, otp) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #2563eb;">StockMaster</h2>
        </div>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="color: #1e293b; margin-top: 0;">Password Reset Request</h3>
            <p style="color: #64748b;">You requested to reset your password. Use the code below to proceed:</p>
            <div style="background-color: #ffffff; border: 1px dashed #2563eb; padding: 15px; margin: 20px 0; font-size: 24px; font-weight: bold; color: #2563eb; letter-spacing: 5px;">
                ${otp}
            </div>
            <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes.</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
            <p>If you didn't request this, please ignore this email.</p>
        </div>
    </div>
    `;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'StockMaster - Password Reset OTP',
        html: html
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${email}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = { sendOTP };
