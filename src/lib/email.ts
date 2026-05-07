import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOtpEmail(to: string, otp: string) {
  const mailOptions = {
    from: `"Temple Finance Tracker" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Temple Finance Tracker Registration</h2>
        <p>Your OTP code is:</p>
        <h1 style="color: #4f46e5; letter-spacing: 5px;">${otp}</h1>
        <p>It is valid for 10 minutes.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
