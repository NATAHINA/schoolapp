import dbConnect from '@/lib/dbConnect';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

import Parent from '@/models/Parent';
import Attendance from '@/models/Attendance';
import Student from '@/models/Student';
import Subject from '@/models/Subject';
import Teacher from '@/models/Teacher';
import Annee from '@/models/Annee';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    let academicYearId = searchParams.get('academicYearId');
    const period = searchParams.get('period');
    const query: any = {}; 

    if (!userId) {
      return NextResponse.json({ error: "UserId manquant" }, { status: 400 });
    }

    if (!academicYearId || academicYearId === 'undefined') {
      const currentYear = await Annee.findOne({ status: 'En cours' });
      academicYearId = currentYear?._id;
    }

    if (period && period !== 'Toutes') {
      query.period = period;
    }

    const parent = await Parent.findOne({ userId }).lean();
    if (!parent) return NextResponse.json({ error: "Parent non trouvé" }, { status: 404 });

    const childrenWithAttendance = await Promise.all(
      parent.children.map(async (childId: string) => {
        const student = await Student.findById(childId).select('name').lean();
        
        const records = await Attendance.find({ 
          studentId: childId,
          ...(academicYearId && { academicYear: academicYearId }),
          status: { $in: ['Absent', 'Late', 'Retard'] }
        })
        .populate({ path: 'subjectId', select: 'name' })
        .populate({ path: 'teacherId', select: 'name' })
        .sort({ date: -1 })
        .lean();
        
        return {
          _id: childId,
          name: student?.name || 'Élève inconnu',
          absences: records || [],
          stats: {
            totalAbsences: records.filter((r: any) => r.status === 'Absent').length,
            totalLate: records.filter((r: any) => r.status === 'Late' || r.status === 'Retard').length,
            totalJustified: records.filter((r: any) => r.isJustified).length,
          }
        };
      })
    );

    return NextResponse.json(childrenWithAttendance);

  } catch (error: any) {
    console.error("Erreur API Attendance:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
