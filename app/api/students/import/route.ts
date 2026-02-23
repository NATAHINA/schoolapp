
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Student from '@/models/Student';
import Class from '@/models/Class';
import Parent from '@/models/Parent';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { students, schoolId, academicYear } = await req.json();

    if (!students || !Array.isArray(students) || !schoolId || !academicYear) {
      return NextResponse.json({ error: "Données manquantes (Vérifiez l'école et l'année scolaire)" }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const defaultPass = await bcrypt.hash("password123", salt);
    
    const results = { imported: 0, classesCreated: 0, parentsCreated: 0 };

    for (const row of students) {
      const studentMatricule = row["Matricule"] || row["matricule"];
      const studentName = row["Nom"] || row["name"];
      const className = (row["Classe"] || row["class"])?.toString().trim();
      
      const rawDate = row["Date Naissance"] || row["date_naissance"];
      const lieuNaissance = row["Lieu Naissance"] || row["lieu_naissance"] || "";

      const parentPhone = String(row["Telephone"] || row["parentPhone"] || "").trim();
      const parentName = row["Parent"] || row["parentName"] || "Parent de " + studentName;
      const parentEmail = (row["Email"] || row["parentEmail"] || "").toLowerCase().trim();

      if (!studentName || !className) continue;

      // 1. GESTION DE LA CLASSE (Trouver ou Créer)
      let schoolClass = await Class.findOne({ 
        name: { $regex: new RegExp(`^${className}$`, 'i') }, 
        schoolId 
      });

      let dateNaissance = null;
      if (rawDate) {
        dateNaissance = new Date(rawDate);
        if (isNaN(dateNaissance.getTime())) dateNaissance = null; 
      }

      if (!schoolClass) {
        schoolClass = await Class.create({ name: className, schoolId });
        results.classesCreated++;
      }

      // 2. CRÉATION DE L'ÉLÈVE
      const newStudent = await Student.create({
        matricule: studentMatricule,
        name: studentName,
        gender: (row["Genre"] || "M").toUpperCase().charAt(0),
        date_naissance: dateNaissance,
        lieu_naissance: lieuNaissance,
        class: schoolClass._id,
        academicYear,
        parentName,
        parentPhone,
        parentEmail,
        schoolId
      });

      // 3. GESTION DU COMPTE UTILISATEUR (Pour l'accès mobile/web du parent)
      let parentUserId = null;
      if (parentEmail) {
        let existingUser = await User.findOne({ email: parentEmail });
        
        if (!existingUser) {
          existingUser = await User.create({
            name: parentName,
            email: parentEmail,
            password: defaultPass,
            phone: parentPhone,
            role: 'PARENT',
            schoolId,
            isActive: true
          });
        }
        parentUserId = existingUser._id;
      }

      await Parent.findOneAndUpdate(
        { phone: parentPhone, schoolId },
        { 
          $set: { 
            name: parentName, 
            email: parentEmail,
            userId: parentUserId
          },
          $addToSet: { children: newStudent._id },
          $setOnInsert: { password: defaultPass }
        },
        { upsert: true }
      );

      results.imported++;
    }

    return NextResponse.json({ success: true, ...results });

  } catch (error: any) {
    console.error("Erreur Import:", error);
    return NextResponse.json({ error: "Erreur lors de l'importation" }, { status: 500 });
  }
}