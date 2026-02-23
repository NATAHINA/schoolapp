import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Subject from '@/models/Subject';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    
    const { id } = await params; 
    const body = await req.json();
    
    const updatedSubject = await Subject.findByIdAndUpdate(id, body, { new: true });
    
    if (!updatedSubject) {
      return NextResponse.json({ error: "Subjecte non trouvée" }, { status: 404 });
    }

    return NextResponse.json(updatedSubject);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const deletedSubject = await Subject.findByIdAndDelete(id);

    if (!deletedSubject) {
      return NextResponse.json({ error: "Subjecte non trouvée" }, { status: 404 });
    }

    return NextResponse.json({ message: "Supprimé avec succès" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}