import dbConnect from '@/lib/dbConnect';
import Teacher from '@/models/Teacher';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get('schoolId');

    const query = schoolId ? { schoolId } : {};

    const teachers = await Teacher.find(query)
      .sort({ name: 1 })
      .lean();

    return NextResponse.json(teachers);
  } catch (error: any) {
    console.error("Erreur GET Teachers:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();

    if (!body.name || !body.schoolId) {
      return NextResponse.json(
        { error: "Le nom et l'ID de l'école sont obligatoires" }, 
        { status: 400 }
      );
    }

    const newTeacher = await Teacher.create(body);
    return NextResponse.json(newTeacher, { status: 201 });
  } catch (error: any) {
    console.error("Erreur insertion prof:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}