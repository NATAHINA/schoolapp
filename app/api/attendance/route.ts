import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Attendance from '@/models/Attendance';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json().catch(() => null);
    if (!body || !body.records || body.records.length === 0) {
      return NextResponse.json({ error: "Données invalides ou vides" }, { status: 400 });
    }

    const { records } = body;
    const first = records[0];

    const requiredFields = ['schoolId', 'academicYear', 'class', 'period', 'teacherId', 'subjectId'];
    for (const field of requiredFields) {
      if (!first[field]) {
        return NextResponse.json({ error: `Le champ ${field} est manquant dans les données.` }, { status: 400 });
      }
    }

    const attendanceDate = new Date(first.date || new Date());
    const startOfDay = new Date(attendanceDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(attendanceDate);
    endOfDay.setHours(23, 59, 59, 999);

    await Attendance.deleteMany({
      class: first.class,
      schoolId: first.schoolId,
      subjectId: first.subjectId,
      period: first.period,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    const formattedRecords = records.map((rec: any) => ({
      ...rec,
      date: attendanceDate,
      isJustified: !!rec.justificationReason,
    }));

    await Attendance.insertMany(formattedRecords);

    return NextResponse.json({ 
      success: true, 
      message: "Appel enregistré avec succès." 
    });

  } catch (error: any) {
    console.error("CRASH API ATTENDANCE:", error);
    return NextResponse.json({ 
      error: "Erreur serveur interne", 
      details: error.message 
    }, { status: 500 });
  }
}


// import { NextResponse } from 'next/server';
// import dbConnect from '@/lib/dbConnect';
// import Attendance from '@/models/Attendance';

// export async function POST(req: Request) {
//   try {
//     await dbConnect();

//     const body = await req.json();
//     const { records } = body;

//     if (!records || records.length === 0) {
//       return NextResponse.json({ error: "Aucun enregistrement reçu" }, { status: 400 });
//     }

//     const firstRecord = records[0];
//     const { 
//       schoolId, 
//       academicYear, 
//       class: classId, 
//       period, 
//       teacherId, 
//       subjectId, 
//       date 
//     } = firstRecord;

//     if (!schoolId || !academicYear || !subjectId || !teacherId) {
//       return NextResponse.json({ 
//         error: "Données manquantes (école, année, matière ou enseignant)" 
//       }, { status: 400 });
//     }

//     const attendanceDate = new Date(date || new Date());
//     const startOfDay = new Date(attendanceDate);
//     startOfDay.setHours(0, 0, 0, 0);
//     const endOfDay = new Date(attendanceDate);
//     endOfDay.setHours(23, 59, 59, 999);

//     await Attendance.deleteMany({
//       class: classId,
//       schoolId: schoolId,
//       subjectId: subjectId,
//       period: period,
//       date: { $gte: startOfDay, $lte: endOfDay }
//     });

//     await Attendance.insertMany(records);

//     return NextResponse.json({ 
//       success: true, 
//       message: `Présence enregistrée avec succès pour le cours.` 
//     });

//   } catch (error: any) {
//     console.error("Erreur Attendance API:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }