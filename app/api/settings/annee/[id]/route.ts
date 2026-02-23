import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Annee from '@/models/Annee';


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
