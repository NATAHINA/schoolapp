import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Annee from '@/models/Annee';

// Récupérer toutes les Anneees
export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get('schoolId');

    if (!schoolId) {
      return NextResponse.json({ error: "School ID manquant" }, { status: 400 });
    }

    const annees = await Annee.find({ schoolId }).sort({ createdAt: -1 });

    return NextResponse.json(annees || []);
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Créer une nouvelle Anneee
export async function POST(req: Request) {
  
  try {
    await dbConnect();
    const body = await req.json();
    const { name, isCurrent, schoolId } = body;

    if (!name || !schoolId) {
      return NextResponse.json(
        { error: "Le nom et l'ID de l'école sont requis" }, 
        { status: 400 }
      );
    }

    if (isCurrent === true) {
      await Annee.updateMany({ schoolId }, { isCurrent: false });
    }

    const nouvelleAnnee = await Annee.create({
      name,
      isCurrent,
      schoolId
    });

    return NextResponse.json(nouvelleAnnee, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Ce nom d'année existe déjà" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 400 });
  }
}