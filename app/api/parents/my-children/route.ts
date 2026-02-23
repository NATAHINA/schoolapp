import dbConnect from '@/lib/dbConnect';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Import des modèles pour s'assurer qu'ils sont enregistrés dans Mongoose
import '@/models/Student';
import '@/models/Class';
import '@/models/Parent';
import '@/models/Report';
import '@/models/Annee';

const Parent = mongoose.models.Parent;
const Report = mongoose.models.Report;
const Annee = mongoose.models.Annee; // Modèle de l'année scolaire

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "ID Utilisateur invalide" }, { status: 400 });
    }

    // 1. Récupérer l'année scolaire active (ex: celle qui a un champ status: 'active' ou 'current')
    // Adaptez le filtre selon votre schéma Annee
    const currentYear = await Annee.findOne({ status: 'En cours' }) || await Annee.findOne().sort({ createdAt: -1 });

    // 2. Trouver le parent et ses enfants
    const parent = await Parent.findOne({ userId }).populate({
      path: 'children',
      populate: { path: 'class', select: 'name' }
    });

    if (!parent) return NextResponse.json({ error: "Profil parent introuvable" }, { status: 404 });

    // 3. Récupérer les stats pour chaque enfant
    const childrenWithStats = await Promise.all(parent.children.map(async (child: any) => {
      const lastReport = await Report.findOne({ 
        student: child._id,
        status: 'Validé' 
      }).sort({ createdAt: -1 });

      return {
        ...child.toObject(),
        stats: {
          average: lastReport?.average || null,
          rank: lastReport?.rank || null,
          period: lastReport?.period || null,
          classSize: lastReport?.classSize || null,
          subjectsDetails: lastReport?.subjectsDetails || []
        }
      };
    }));

    return NextResponse.json({
      name: parent.name,
      academicYear: currentYear?.label || currentYear?.name || "Année non définie",
      children: childrenWithStats
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}