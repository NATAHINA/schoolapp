import dbConnect from '@/lib/dbConnect';
import Student from '@/models/Student';
import Parent from '@/models/Parent';
import User from '@/models/User';
import Class from '@/models/Class';
import Annee from '@/models/Annee';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { schoolId, academicYear } = body;

    if (!schoolId || !academicYear) {
      return NextResponse.json({ error: "Identifiant d'école ou d'année manquant." }, { status: 400 });
    }

    const newStudent = await Student.create({
      matricule: body.matricule,
      name: body.name,
      class: body.class,
      gender: body.gender,
      date_naissance: body.date_naissance,
      lieu_naissance: body.lieu_naissance,
      parentName: body.parentName,
      parentPhone: body.parentPhone,
      schoolId: schoolId,
      academicYear: academicYear
    });

    const cleanEmail = body.parentEmail?.trim().toLowerCase() || null;
    let assignedUserId = null;

    if (cleanEmail) {
      let user = await User.findOne({ email: cleanEmail });
      
      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password123", salt);

        user = await User.create({
          name: body.parentName,
          email: cleanEmail,
          password: hashedPassword,
          phone: body.parentPhone,
          role: 'PARENT',
          schoolId: schoolId,
          isActive: true
        });
      }
      assignedUserId = user._id;
    }

    const salt = await bcrypt.genSalt(10);
    const defaultHashedPassword = await bcrypt.hash("password123", salt);

    await Parent.findOneAndUpdate(
      { phone: body.parentPhone, schoolId: schoolId },
      { 
        $set: { 
          name: body.parentName,
          userId: assignedUserId,
          ...(cleanEmail && { email: cleanEmail })
        },
        $addToSet: { children: newStudent._id },
        $setOnInsert: { password: defaultHashedPassword } 
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error: any) {
    console.error("Erreur POST Student:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}


export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const academicYear = searchParams.get('academicYear');
    const schoolId = searchParams.get('schoolId');

    if (!schoolId) {
       return NextResponse.json({ error: "schoolId manquant" }, { status: 400 });
    }
    
    const query: any = { schoolId: schoolId };

    if (academicYear && academicYear !== 'null') {
      query.academicYear = academicYear;
    }

    if (classId && classId !== 'null') {
      query.class = classId;
    }

    const students = await Student.find(query)
      .populate('class', 'name')
      .populate('academicYear', 'name')
      .sort({ name: 1 })
      .lean();

    return NextResponse.json(students);
  } catch (error: any) {
    console.error("DEBUG API ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
