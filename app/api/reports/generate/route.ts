

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Grade from '@/models/Grade';
import Report from '@/models/Report';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { classId, period, schoolId, academicYear } = await req.json();

    if (!academicYear) {
      return NextResponse.json({ error: "L'année académique est requise" }, { status: 400 });
    }

    // 1. Récupérer les notes
    const allGrades = await Grade.find({ class: classId, period, schoolId, academicYear }).populate('subject');
    console.log("Nombre de notes pour cette classe :", allGrades.length);

    if (!allGrades || allGrades.length === 0) {
      return NextResponse.json({ error: "Aucune note trouvée pour cette sélection" }, { status: 404 });
    }

    // 2. Grouper les notes par élève
    const studentData: any = {};
    allGrades.forEach(g => {
      const sId = g.student._id ? g.student._id.toString() : g.student.toString();

      if (!studentData[sId]) {
        studentData[sId] = { points: 0, coeffs: 0, details: [] };
      }
      
      const coeff = g.subject?.coeff || 1; // Fallback si coeff manquant
      const weighted = (g.value || 0) * coeff;
      
      studentData[sId].points += weighted;
      studentData[sId].coeffs += coeff;
      studentData[sId].details.push({
        subject: g.subject?._id,
        subjectName: g.subject?.name || "Matière inconnue",
        grade: g.value,
        coeff: coeff,
        weightedGrade: weighted
      });
    });

    // 3. Créer la liste des rapports (calcul moyennes)
    let reportList = Object.keys(studentData).map(studentId => ({
      studentId,
      average: studentData[studentId].points / studentData[studentId].coeffs,
      ...studentData[studentId]
    }));

    reportList.sort((a, b) => b.average - a.average);
    reportList = reportList.map((rep, index) => ({ ...rep, rank: index + 1 }));

    const classSize = reportList.length;
    const classSumAverages = reportList.reduce((acc, curr) => acc + curr.average, 0);
    const classAverage = classSize > 0 ? classSumAverages / classSize : 0;

    // 6. Préparer le Bulk Write
    const bulkOps = reportList.map(rep => ({
      updateOne: {
        filter: { student: rep.studentId, period, schoolId, academicYear },
        update: { 
          $set: { 
            average: rep.average, 
            rank: rep.rank, 
            subjectsDetails: rep.details,
            totalWeightedPoints: rep.points,
            totalCoeffs: rep.coeffs,
            class: classId,
            student: rep.studentId, // Important pour l'upsert
            schoolId: schoolId,      // Important pour l'upsert
            academicYear: academicYear,
            classSize: classSize,
            classAverage: classAverage,
            status: 'Validé'
          }
        },
        upsert: true
      }
    }));

    const result = await Report.bulkWrite(bulkOps);

    return NextResponse.json({ 
      success: true, 
      count: reportList.length,
      modified: result.modifiedCount,
      upserted: result.upsertedCount 
    });

  } catch (error: any) {
    console.error("ERREUR GENERATION:", error);
    return NextResponse.json({ error: error.message || "Erreur de calcul" }, { status: 500 });
  }
}