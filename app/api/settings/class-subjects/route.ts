import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ClassSubject from '@/models/ClassSubject';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const assignment = await ClassSubject.create(body);

    return NextResponse.json(assignment, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Cette matière est déjà configurée pour cette classe." }, 
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const schoolId = searchParams.get('schoolId'); // Récupération du schoolId

    const query: any = {};
    if (classId) query.classId = classId;
    if (schoolId) query.schoolId = schoolId;

    const assignments = await ClassSubject.find(query)
      .populate('classId', 'name')
      .populate('subjectId', 'name coeff')
      .populate('teacherId', 'name')
      .lean();

    return NextResponse.json(assignments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}