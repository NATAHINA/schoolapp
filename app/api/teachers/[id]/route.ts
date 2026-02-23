import dbConnect from '@/lib/dbConnect';
import Teacher from '@/models/Teacher';
import { NextResponse } from 'next/server';

// --- SUPPRESSION ---
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    await dbConnect();
    const { id } = await params; 

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    const deletedTeacher = await Teacher.findByIdAndDelete(id);

    if (!deletedTeacher) {
      return NextResponse.json({ error: "Professeur non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ message: "Supprimé avec succès" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- MISE À JOUR ---
export async function PUT(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedTeacher) {
      return NextResponse.json({ error: "Professeur non trouvé" }, { status: 404 });
    }

    return NextResponse.json(updatedTeacher);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}