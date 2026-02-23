import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ClassSubject from '@/models/ClassSubject';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await dbConnect();

    const deleted = await ClassSubject.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Attribution non trouvée" }, { status: 404 });
    }

    return NextResponse.json({ message: "Liaison supprimée avec succès" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}