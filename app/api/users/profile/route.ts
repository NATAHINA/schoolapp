import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Parent from '@/models/Parent';
import Teacher from '@/models/Teacher';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });

    let profileData = null;

    if (user.role === 'ADMIN') {
      profileData = { phone: user.phone || "" }; 
    } else if (user.role === 'PARENT') {
      profileData = await Parent.findOne({ userId: userId });
    } else if (user.role === 'TEACHER') {
      profileData = await Teacher.findOne({ userId: userId });
    }

    return NextResponse.json({ user, profile: profileData });
  } catch (error: any) {
    console.error("Erreur Profile GET:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const { userId, name, phone, currentPassword, newPassword, type } = await req.json();

    const user = await User.findById(userId).select('+password');
    if (!user) return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });

    if (type === 'PASSWORD') {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 });
      
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      return NextResponse.json({ message: "Mot de passe modifié" });
    }

    if (type === 'GENERAL') {
      user.name = name || user.name;
      if (user.role === 'ADMIN') user.phone = phone || user.phone;
      await user.save();

      const updatePayload = { name, phone };
      if (user.role === 'PARENT') await Parent.findOneAndUpdate({ userId }, updatePayload);
      if (user.role === 'TEACHER') await Teacher.findOneAndUpdate({ userId }, updatePayload);
      
      return NextResponse.json({ message: "Informations mises à jour" });
    }

    return NextResponse.json({ error: "Type de mise à jour invalide" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// export async function PUT(req: Request) {
//   try {
//     await dbConnect();
//     const body = await req.json();
//     const { userId, name, email, phone, currentPassword, newPassword } = body;

//     const user = await User.findById(userId).select('+password');
//     if (!user) return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });

//     if (newPassword) {
//       if (!currentPassword) {
//         return NextResponse.json({ error: "Mot de passe actuel requis" }, { status: 400 });
//       }
//       const isMatch = await bcrypt.compare(currentPassword, user.password);
//       if (!isMatch) {
//         return NextResponse.json({ error: "L'ancien mot de passe est incorrect" }, { status: 400 });
//       }
//       user.password = await bcrypt.hash(newPassword, 10);
//     }

//     user.name = name || user.name;
//     if (user.role === 'ADMIN') {
//         user.phone = phone || user.phone;
//     }
    
//     await user.save();

//     const updatePayload = { name, phone }; 

//     if (user.role === 'PARENT') {
//       await Parent.findOneAndUpdate({ userId: userId }, updatePayload);
//     } else if (user.role === 'TEACHER') {
//       await Teacher.findOneAndUpdate({ userId: userId }, updatePayload);
//     }

//     return NextResponse.json({ message: "Profil mis à jour avec succès" });
//   } catch (error: any) {
//     console.error("Erreur Profile PUT:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }