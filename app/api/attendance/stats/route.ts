import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Attendance from '@/models/Attendance';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get('schoolId');
    const academicYear = searchParams.get('academicYear');
    const range = searchParams.get('range');

    const query: any = { status: 'Absent', schoolId };
    
    // Filtre de Date
    if (range && range !== 'all') {
      const now = new Date();
      const startDate = new Date();
      if (range === 'week') startDate.setDate(now.getDate() - 7);
      if (range === 'month') startDate.setMonth(now.getMonth() - 1);
      query.date = { $gte: startDate };
    }

    if (academicYear && academicYear !== 'undefined') {
      query.academicYear = new mongoose.Types.ObjectId(academicYear);
    }

    const stats = await Attendance.aggregate([
      { $match: query },
      { $lookup: { from: 'students', localField: 'studentId', foreignField: '_id', as: 'student' } },
      { $lookup: { from: 'teachers', localField: 'teacherId', foreignField: '_id', as: 'teacher' } },
      { $lookup: { from: 'subjects', localField: 'subjectId', foreignField: '_id', as: 'subject' } },
      { $lookup: { from: 'classes', localField: 'class', foreignField: '_id', as: 'classDetails' } },
      { $project: {
        studentName: { $arrayElemAt: ["$student.name", 0] },
        teacherName: { $arrayElemAt: ["$teacher.name", 0] },
        subjectName: { $arrayElemAt: ["$subject.name", 0] },
        className: { $arrayElemAt: ["$classDetails.name", 0] },
        date: 1,
        isJustified: 1,
        justificationReason: "$justificationReason", 
        arrivalTime: "$arrivalTime"
      }},
      { $sort: { date: -1 } }
    ]);

    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}