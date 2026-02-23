import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import TeacherAttendance from '@/models/TeacherAttendance';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { schoolId, academicYear, date, period, attendanceData } = await req.json();

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const operations = attendanceData.map((item: any) => ({
      updateOne: {
        filter: { 
          teacherId: item.teacherId, 
          date: startOfDay, 
          period: period 
        },
        update: { 
          $set: { 
            status: item.status, 
            comment: item.comment,
            schoolId: schoolId,
            academicYear: academicYear
          } 
        },
        upsert: true
      }
    }));

    await TeacherAttendance.bulkWrite(operations);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get('schoolId');
    const date = searchParams.get('date');
    const period = searchParams.get('period');

    const startOfDay = new Date(date!);
    startOfDay.setHours(0,0,0,0);

    const attendances = await TeacherAttendance.find({
      schoolId,
      date: startOfDay,
      period
    }).lean();

    return NextResponse.json(attendances);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

