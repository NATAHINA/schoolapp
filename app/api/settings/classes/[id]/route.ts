import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Class from '@/models/Class';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    
    const { id } = await params; 
    const body = await req.json();
    
    const updatedClass = await Class.findByIdAndUpdate(id, body, { new: true });
    
    if (!updatedClass) {
      return NextResponse.json({ error: "Classe non trouvée" }, { status: 404 });
    }

    return NextResponse.json(updatedClass);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const deletedClass = await Class.findByIdAndDelete(id);

    if (!deletedClass) {
      return NextResponse.json({ error: "Classe non trouvée" }, { status: 404 });
    }

    return NextResponse.json({ message: "Supprimé avec succès" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}