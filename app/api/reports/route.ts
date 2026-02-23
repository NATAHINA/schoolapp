


import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Report from '@/models/Report';
import Student from '@/models/Student';
import School from '@/models/School';
import Class from '@/models/Class';

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const period = searchParams.get('period');
    const schoolId = searchParams.get('schoolId');
    const academicYear = searchParams.get('academicYear');

    if (!classId || !period || !schoolId || !academicYear) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const reports = await Report.find({
      class: classId,
      period: period,
      schoolId: schoolId,
      academicYear: academicYear
    })
    .populate('student', 'name gender')
    .populate('class', 'name')
    .populate('schoolId')
    .populate('academicYear')
    .sort({ rank: 1 });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Erreur GET Reports:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}