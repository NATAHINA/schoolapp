import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Ce compte est désactivé" }, { status: 403 });
    }

    const sessionToken = "session_" + Math.random().toString(36).substr(2);

    return NextResponse.json({
      message: "Connexion réussie",
      token: sessionToken,
      name: user.name,
      schoolId: user.schoolId.toString(),
      role: user.role, // ESSENTIEL : On renvoie le rôle (ADMIN, PARENT, TEACHER)
      userId: user._id.toString()
    });

  } catch (error: any) {
    console.error("Erreur Login:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}