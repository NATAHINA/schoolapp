import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import School from '@/models/School';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await dbConnect();
    const school = await School.findById(id);
    if (!school) return NextResponse.json({ error: "École non trouvée" }, { status: 404 });
    
    return NextResponse.json(school);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}