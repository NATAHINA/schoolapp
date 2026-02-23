import dbConnect from '@/lib/dbConnect';
import TeacherAttendance from '@/models/TeacherAttendance';
import { NextResponse } from 'next/server';


  export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await dbConnect();
    await TeacherAttendance.findByIdAndDelete(id);
    return NextResponse.json({ message: "Enregistrement supprimé" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}