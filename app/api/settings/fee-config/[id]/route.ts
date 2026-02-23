import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import FeeConfig from '@/models/FeeConfig';
import Class from '@/models/Class';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    
    const resolvedParams = await params;
    const targetId = resolvedParams.id;

    const { id, _id, ...updateData } = await req.json();
    
    const updated = await FeeConfig.findByIdAndUpdate(
      targetId, 
      updateData,
      { new: true, runValidators: true }
    ).populate('classId', 'name');

    if (!updated) {
      console.log("Échec : Aucun document trouvé pour l'ID", targetId);
      return NextResponse.json({ error: "Tarif introuvable dans la base de données" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Erreur PUT FeeConfig:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();

    const resolvedParams = await params;
    const targetId = resolvedParams.id;

    const deleted = await FeeConfig.findByIdAndDelete(targetId);
    
    if (!deleted) return NextResponse.json({ error: "Tarif introuvable" }, { status: 404 });

    return NextResponse.json({ message: "Supprimé avec succès" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}