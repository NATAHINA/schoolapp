import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() } // MongoDB compare l'UTC de la DB avec l'UTC de new Date()
    });

    const hashedPassword = await bcrypt.hash(password, 10);


    if (!user) {
      return NextResponse.json(
        { error: "Le jeton de réinitialisation est invalide ou a expiré." },
        { status: 400 }
      );
    }

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: "Mot de passe mis à jour avec succès" 
    });

  } catch (error: any) {
    console.error("Erreur Reset Password:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}