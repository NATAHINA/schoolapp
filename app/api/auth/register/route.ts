import dbConnect from '@/lib/dbConnect';
import School from '@/models/School';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { schoolName, schoolEmail, schoolPhone,  adminName, adminPassword } = await req.json();

    // 1. Vérifier si l'école ou l'admin existe déjà
    const existingSchool = await School.findOne({ email: schoolEmail });
    if (existingSchool) {
      return NextResponse.json({ error: "Cet email d'école est déjà utilisé" }, { status: 400 });
    }

    // 2. Créer l'école
    const newSchool = await School.create({
      name: schoolName,
      email: schoolEmail,
      phone: schoolPhone
    });

    // 3. Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // 4. Créer l'utilisateur admin lié à cette école
    await User.create({
      name: adminName,
      email: schoolEmail, // Ou un email différent si vous ajoutez un champ
      password: hashedPassword,
      role: 'ADMIN',
      schoolId: newSchool._id,
    });

    return NextResponse.json({ message: "Inscription réussie !" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}