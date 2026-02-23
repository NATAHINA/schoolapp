import dbConnect from '@/lib/dbConnect';
import TeacherAttendance from '@/models/TeacherAttendance';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get('schoolId');
    const month = parseInt(searchParams.get('month') || '0'); // 0 = Janvier
    const year = parseInt(searchParams.get('year') || '2026');

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

    const stats = await TeacherAttendance.aggregate([
      { 
        $match: { 
          schoolId: new mongoose.Types.ObjectId(schoolId!),
          date: { $gte: startOfMonth, $lte: endOfMonth }
        } 
      },
      {
        $group: {
          _id: { teacherId: "$teacherId", status: "$status" },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "teachers", // Assurez-vous que le nom de la collection est correct
          localField: "_id.teacherId",
          foreignField: "_id",
          as: "teacherInfo"
        }
      },
      { $unwind: "$teacherInfo" },
      {
        $group: {
          _id: "$_id.teacherId",
          name: { $first: "$teacherInfo.name" },
          Présent: { $sum: { $cond: [{ $eq: ["$_id.status", "Présent"] }, "$count", 0] } },
          Absent: { $sum: { $cond: [{ $eq: ["$_id.status", "Absent"] }, "$count", 0] } },
          Retard: { $sum: { $cond: [{ $eq: ["$_id.status", "En retard"] }, "$count", 0] } }
        }
      }
    ]);

    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}