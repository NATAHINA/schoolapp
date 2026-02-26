import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Annee from '@/models/Annee';
import mongoose from 'mongoose';


export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    
    const { id } = await params; 
    const body = await req.json();
    
    if (body.isCurrent === true) {
      const current = await Annee.findById(id);
      if (current) {
        await Annee.updateMany(
          { schoolId: current.schoolId, _id: { $ne: id } }, 
          { isCurrent: false }
        );
      }
    }

    const updatedAnnee = await Annee.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    
    if (!updatedAnnee) {
      return NextResponse.json({ error: "Année non trouvée" }, { status: 404 });
    }

    return NextResponse.json(updatedAnnee);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    
  try {
    await dbConnect();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Format d'ID invalide" }, { status: 400 });
    }

    const annee = await Annee.findById(id);
    if (!annee) return NextResponse.json({ error: "Année non trouvée" }, { status: 404 });
    
    return NextResponse.json(annee);
  } catch (error) {
    console.error("Erreur GET Annee:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}