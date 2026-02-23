import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Class from '@/models/Class';

// Récupérer toutes les classes
export async function GET() {
  await dbConnect();
  
  try {
    const classes = await Class.find({}).sort({ name: 1 });
    return NextResponse.json(classes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Créer une nouvelle classe
export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const newClass = await Class.create(body);
    return NextResponse.json(newClass, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}