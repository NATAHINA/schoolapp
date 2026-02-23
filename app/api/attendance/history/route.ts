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
    
    const matchQuery: any = {};
    
    if (schoolId && schoolId !== "undefined") {
      matchQuery.schoolId = schoolId; 
    }

    if (academicYear && mongoose.Types.ObjectId.isValid(academicYear)) {
      matchQuery.academicYear = new mongoose.Types.ObjectId(academicYear);
    }

    matchQuery.status = { $in: ['Absent', 'Retard', 'Late'] };

    const history = await Attendance.aggregate([
      { $match: matchQuery },
      
      {
        $lookup: {
          from: 'classes',
          localField: 'class',
          foreignField: '_id',
          as: 'classDetails'
        }
      },

      {
        $lookup: {
          from: 'students', 
          localField: 'studentId', 
          foreignField: '_id',
          as: 'studentDetails'
        }
      },

      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            classId: "$class"
          },
          className: { $first: { $arrayElemAt: ["$classDetails.name", 0] } },
          records: { 
            $push: { 
              name: { $arrayElemAt: ["$studentDetails.name", 0] },
              status: "$status",
              arrivalTime: "$arrivalTime",
              justification: "$justificationReason"
            } 
          },
          rawDate: { $first: "$date" }
        }
      },
      { $sort: { rawDate: -1 } }
    ]);

    const formattedHistory = history.map((group) => ({
      _id: `${group._id.date}-${group._id.classId}`,
      date: group.rawDate,
      class: group.className || "Classe inconnue",
      absents: group.records.filter((r: any) => r.status === 'Absent'),
      retards: group.records.filter((r: any) => r.status === 'Retard' || r.status === 'Late'),
      allRecords: group.records,
      academicYear: { 
        name: group.academicYearName || "2025-2026"
      }
    }));

    return NextResponse.json(formattedHistory);
  } catch (error: any) {
    console.error("ERREUR API HISTORY:", error);
    return NextResponse.json([]);
  }
}