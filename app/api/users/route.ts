import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    
    const role = searchParams.get('role');
    const schoolId = searchParams.get('schoolId');

    const query: any = {};
    if (role) query.role = role;
    if (schoolId) query.schoolId = schoolId;
    
    const users = await User.find(query)
      .select('_id name email role schoolId')
      .sort({ name: 1 })
      .lean();

    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

