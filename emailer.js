import { Resend } from 'resend';

export async function sendEmail(subject, htmlContent, config) {
  const resend = new Resend(config.apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: config.from || 'Publix BOGO Monitor <onboarding@resend.dev>',
      to: [config.to],
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    console.log('Email sent successfully:', data.id);
    return true;
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error;
  }
}
