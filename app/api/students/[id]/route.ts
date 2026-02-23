import dbConnect from '@/lib/dbConnect';
import Student from '@/models/Student';
import Parent from '@/models/Parent';
import { NextResponse } from 'next/server';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params;

    const student = await Student.findById(id).populate('class');

    if (!student) {
      return NextResponse.json({ error: "Élève non trouvé" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params; 

    const deletedStudent = await Student.findByIdAndDelete(id);
    if (!deletedStudent) {
      return NextResponse.json({ error: "Élève non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ message: "Supprimé avec succès" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params; 
    const body = await req.json();

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('class');

    if (!updatedStudent) {
      return NextResponse.json({ error: "Élève non trouvé" }, { status: 404 });
    }

    if (body.parentPhone) {
      await Parent.findOneAndUpdate(
        { phone: body.parentPhone, schoolId: updatedStudent.schoolId },
        { 
          $set: { 
            name: body.parentName, 
            email: body.parentEmail 
          },
          $addToSet: { children: updatedStudent._id } 
        },
        { upsert: true }
      );
    }

    return NextResponse.json(updatedStudent);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}