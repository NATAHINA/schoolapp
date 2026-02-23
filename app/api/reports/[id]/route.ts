import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Report from '@/models/Report';


// 1. RÉCUPÉRER un bulletin détaillé
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await dbConnect();
    
    const report = await Report.findById(id)
      .populate('student')
      .populate('subjectsDetails.subject')
      .populate('class');

    if (!report) {
      return NextResponse.json({ error: "Bulletin introuvable" }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la récupération" }, { status: 500 });
  }
}

// 2. MODIFIER (ex: ajouter une observation globale du conseil de classe)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await dbConnect();
    const body = await req.json();

    const updatedReport = await Report.findByIdAndUpdate(
      id,
      { $set: body }, // Permet de modifier observations, status, etc.
      { new: true }
    );

    return NextResponse.json(updatedReport);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

// 3. SUPPRIMER
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await dbConnect();

    await Report.findByIdAndDelete(id);

    return NextResponse.json({ message: "Bulletin supprimé avec succès" });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}