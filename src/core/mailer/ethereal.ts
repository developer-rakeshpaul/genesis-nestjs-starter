import { ISendMailOptions } from '@nest-modules/mailer';
import nodemailer from 'nodemailer';

export async function sendWithTestAccount(mailOptions: ISendMailOptions) {
  try {
    const account = await nodemailer.createTestAccount();
    console.log('Credentials obtained, sending message...');
    // Create a SMTP transporter object
    const transporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });

    const info = await transporter.sendMail(mailOptions);

    console.log('Message sent: %s', info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Failed to create a testing account. ' + error.message);
  }
}
