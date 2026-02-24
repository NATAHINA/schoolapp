import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Class from '@/models/Class';

export async function GET(req: Request) {
  await dbConnect();
  
  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get('schoolId');

  if (!schoolId) {
    return NextResponse.json({ error: "schoolId manquant" }, { status: 400 });
  }

  try {
    const classes = await Class.find({ schoolId }).sort({ name: 1 });
    return NextResponse.json(classes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const newClass = await Class.create(body);
    return NextResponse.json(newClass, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}