import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  
  const { id } = await params;

  try {
    await dbConnect();
    const user = await User.findById(id);
    
    if (!user) return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });

    user.isActive = !user.isActive;
    await user.save();

    return NextResponse.json({ 
      message: user.isActive ? "Compte activé" : "Compte désactivé", 
      isActive: user.isActive 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await dbConnect();
    const body = await req.json();
    const { name, email, password, role, phone } = body;

    const updateData: any = { name, email, role, phone };

    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return NextResponse.json({ error: "Le mot de passe doit faire 6 caractères" }, { status: 400 });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      id, 
      { $set: updateData }, 
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ message: "Utilisateur mis à jour", user: updatedUser });

  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Cet email est déjà utilisé par un autre compte" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}