import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export const sendResetEmail = async (email: string, resetUrl: string) => {
  const mailOptions = {
    from: `"Gestion Scolaire" <${process.env.EMAIL_SERVER_USER}>`,
    to: email,
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #0CA678; text-align: center;">Réinitialisation de mot de passe</h2>
        <p>Bonjour,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte de gestion scolaire.</p>
        <p>Veuillez cliquer sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien est valide pendant 1 heure.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #0CA678; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Changer mon mot de passe
          </a>
        </div>
        <p style="font-size: 12px; color: #888;">Si vous n'avez pas demandé ce changement, vous pouvez ignorer cet e-mail en toute sécurité.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};