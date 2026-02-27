import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

// Importez tous les modèles nécessaires
import Student from '@/models/Student';
import Parent from '@/models/Parent';
import Grade from '@/models/Grade';
import Annee from '@/models/Annee';
import School from '@/models/School';
import Subject from '@/models/Subject';
import Class from '@/models/Class';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const schoolId = searchParams.get('schoolId');
    let academicYearId = searchParams.get('academicYearId');

    if (!userId) return NextResponse.json({ error: "ID Utilisateur manquant" }, { status: 400 });

    const school = await School.findById(schoolId).select('name address phone email logo').lean();

    if (!academicYearId || academicYearId === 'undefined') {
      const currentYear = await Annee.findOne({ isCurrent: true }) || await Annee.findOne();
      academicYearId = currentYear?._id.toString();
    }
    const yearDoc = await Annee.findById(academicYearId).select('name').lean();

    // 3. Parent
    const parent = await Parent.findOne({ userId }).lean();
    if (!parent) return NextResponse.json({ error: "Parent non trouvé" }, { status: 404 });

    const gradesReport = await Promise.all(parent.children.map(async (childId: any) => {
      const student = await Student.findById(childId)
      .populate({ path: 'class', select: 'name' })
      .lean();

      const classNameDisplay = student?.class?.name || 'N/A';
      
      const grades = await Grade.find({ 
        student: childId, 
        academicYear: academicYearId 
      }).populate({ path: 'subject', model: Subject }).lean();

      let totalPoints = 0;
      let totalCoefficients = 0;

      const formattedGrades = grades.map(g => {
        const coef = g.subject?.coeff || 1;
        const val = g.value || 0;
        totalPoints += (val * coef);
        totalCoefficients += coef;

        return {
          _id: g._id,
          subjectName: g.subject?.name || 'Matière inconnue',
          value: val,
          coefficient: coef,
          period: g.period,
          comment: g.comment
        };
      });

      const average = totalCoefficients > 0 ? (totalPoints / totalCoefficients) : 0;

      const classmates = await Student.find({ class: student?.class?._id || student?.class })
      .select('_id').lean();

      const classmatesIds = classmates.map(c => c._id);

      const allClassGrades = await Grade.find({ 
        student: { $in: classmatesIds }, 
        academicYear: academicYearId 
      }).populate({ path: 'subject', model: Subject }).lean();

      const averagesMap: Record<string, number> = {};
      classmatesIds.forEach(id => {
        const sGrades = allClassGrades.filter(g => g.student.toString() === id.toString());
        let p = 0, c = 0;
        sGrades.forEach(g => {
          const co = g.subject?.coeff || 1;
          p += (g.value * co);
          c += co;
        });
        averagesMap[id.toString()] = c > 0 ? p / c : 0;
      });

      const allAverages = Object.values(averagesMap);
      const sortedAverages = [...allAverages].sort((a, b) => b - a);
      const rank = sortedAverages.indexOf(average) + 1;

      return {
        studentId: childId,
        studentName: student?.name || 'Élève inconnu',
        className: classNameDisplay, 
        academicYearName: yearDoc?.name || "N/A", 
        average: average.toFixed(2),
        rank,
        classSize: classmates.length,
        grades: formattedGrades,
        classStats: {
          min: Math.min(...allAverages).toFixed(2),
          max: Math.max(...allAverages).toFixed(2),
          avg: (allAverages.reduce((a, b) => a + b, 0) / allAverages.length).toFixed(2)
        }
      };
    }));

    return NextResponse.json({ gradesReport, schoolInfo: school });

  } catch (error: any) {
    console.error("Erreur API:", error);
    return NextResponse.json({ error: error.message, gradesReport: [] }, { status: 500 });
  }
}