import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import crypto from 'crypto';
import { sendResetEmail } from '@/lib/mail';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "Si cet email existe, un lien a été envoyé." });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const now = new Date();
    
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(now.getTime() + 3600000); 
    await user.save();
    
    const domain = process.env.NEXT_PUBLIC_APP_URL;
    const resetUrl = `${domain}/auth/reset-password/${resetToken}`;
    
    await sendResetEmail(user.email, resetUrl);

    return NextResponse.json({ success: true, message: "E-mail envoyé avec succès" });
  } catch (error: any) {
    console.error("Erreur Mail:", error);
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'e-mail" }, { status: 500 });
  }
}