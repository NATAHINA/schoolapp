import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Grade from '@/models/Grade';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { grades, classId, subjectId, period, schoolId, academicYear } = await req.json();

    if (!classId || !academicYear) {
      return NextResponse.json({ error: "Données manquantes (Classe ou Année)" }, { status: 400 });
    }

    // const bulkOps = grades.map((g: any) => ({
    //   updateOne: {
    //     filter: { student: g.studentId, subject: subjectId, class: classId, period, schoolId, academicYear },
    //     update: { $set: { value: g.value, comment: g.comment } },
    //     upsert: true,
    //   },
    // }));

    const bulkOps = grades.map((g: any) => ({
      updateOne: {
        filter: { 
          student: g.studentId, 
          subject: subjectId, 
          class: classId, 
          period, 
          schoolId,
          academicYear
        },
        update: { 
          $set: { 
            value: g.value, 
            comment: g.comment,
            student: g.studentId, // On s'assure que les refs sont là pour l'upsert
            subject: subjectId,
            class: classId,
            schoolId,
            academicYear
          } 
        },
        upsert: true,
      },
    }));

    await Grade.bulkWrite(bulkOps);

    return NextResponse.json({ success: true, message: "Notes enregistrées" });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de l'enregistrement" }, { status: 500 });
  }
}