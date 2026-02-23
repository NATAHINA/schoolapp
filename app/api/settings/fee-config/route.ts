import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import FeeConfig from '@/models/FeeConfig';
import Class from '@/models/Class';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get('schoolId');
    const academicYear = searchParams.get('academicYear');

    if (!schoolId || schoolId === 'null' || !academicYear || academicYear === 'null') {
      return NextResponse.json([]); 
    }

    const filter: any = { schoolId, academicYear };
    
    const classId = searchParams.get('classId');
    if (classId && classId !== 'null') filter.classId = classId;

    const configs = await FeeConfig.find(filter)
      .populate('classId', 'name') 
      .sort({ feeType: 1 });
      
    return NextResponse.json(configs);
  } catch (error: any) {
    console.error("Erreur GET FeeConfig:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.classId || !body.feeType || !body.amount) {
      return NextResponse.json({ error: "Champs obligatoires manquants (Classe, Type ou Montant)." }, { status: 400 });
    }
    
    const existing = await FeeConfig.findOne({
      schoolId: body.schoolId,
      academicYear: body.academicYear,
      feeType: body.feeType,
      classId: body.classId
    });

    if (existing) {
      return NextResponse.json({ error: "Un tarif existe déjà pour ce type de frais cette année." }, { status: 400 });
    }

    const config = await FeeConfig.create(body);
    const populatedConfig = await config.populate('classId', 'name');
    
    return NextResponse.json(populatedConfig);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
