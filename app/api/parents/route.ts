import dbConnect from '@/lib/dbConnect';
import Parent from '@/models/Parent';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    const { name, email, phone, children, schoolId } = body;

    if (!schoolId) {
      return NextResponse.json({ error: "schoolId est requis dans le corps de la requête" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
    }

    const defaultPassword = "password123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: 'PARENT',
      schoolId: schoolId,
      isActive: true
    });

    const parentData = {
      name,
      email: email.toLowerCase(),
      phone,
      children,
      schoolId,
      password: hashedPassword,
      userId: newUser._id
    };

    const newParent = await Parent.create(parentData);

    return NextResponse.json({ parent: newParent, user: newUser }, { status: 201 });
  } catch (error: any) {
    console.error("Erreur POST Parent:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get('schoolId');

    if (!schoolId) {
      return NextResponse.json({ error: "schoolId est requis" }, { status: 400 });
    }

    const parents = await Parent.find({ schoolId })
      .populate({
        path: 'children',
        populate: { path: 'class', select: 'name' }
      })
      .sort({ name: 1 }); 

    return NextResponse.json(parents);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}