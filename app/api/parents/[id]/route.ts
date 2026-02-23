import dbConnect from '@/lib/dbConnect';
import Parent from '@/models/Parent';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await dbConnect();
    
    const { id } = await params; 

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    const deletedParent = await Parent.findByIdAndDelete(id);

    if (!deletedParent) {
      return NextResponse.json({ error: "Parent non trouvé en base de données" }, { status: 404 });
    }

    return NextResponse.json({ message: "Supprimé avec succès" }, { status: 200 });
  } catch (error: any) {
    console.error("Erreur DELETE:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await dbConnect();
    const body = await req.json();

    const updatedParent = await Parent.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('children'); 

    if (!updatedParent) {
      return NextResponse.json({ error: "Parent non trouvé" }, { status: 404 });
    }

    const data = updatedParent.toObject();
    data.children = data.children; 

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}