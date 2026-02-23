import dbConnect from '@/lib/dbConnect';
import School from '@/models/School';
import { NextResponse } from 'next/server';


export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('schoolId');

    if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

    const school = await School.findById(id);
    return NextResponse.json(school);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { _id, ...updateData } = body;

    const updatedSchool = await School.findByIdAndUpdate(_id, updateData, { new: true });
    return NextResponse.json(updatedSchool);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}