import nodemailer from 'nodemailer';

export async function sendEmail(subject, htmlContent, config) {
  const transporter = nodemailer.createTransport({
    service: config.service || 'gmail',
    auth: {
      user: config.user,
      pass: config.password
    }
  });

  const mailOptions = {
    from: config.user,
    to: config.to,
    subject: subject,
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error;
  }
}
