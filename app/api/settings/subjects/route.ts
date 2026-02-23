import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Subject from '@/models/Subject';

// Récupérer toutes les subjects
export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get('schoolId');

    const query = schoolId ? { schoolId } : {};
    const subjects = await Subject.find(query).sort({ name: 1 });
    return NextResponse.json(subjects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.name || !body.coeff || !body.schoolId) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const newSubject = await Subject.create(body);
    return NextResponse.json(newSubject, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Cette matière existe déjà dans votre établissement" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}