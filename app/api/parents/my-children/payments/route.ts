import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Parent from '@/models/Parent';
import Payment from '@/models/Payment';
import Student from '@/models/Student';
import Annee from '@/models/Annee';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const academicYearId = searchParams.get('academicYearId');

    if (!userId) return NextResponse.json({ error: "ID Utilisateur manquant" }, { status: 400 });

    const parent = await Parent.findOne({ userId }).lean();
    if (!parent) return NextResponse.json({ error: "Parent non trouvé" }, { status: 404 });

    const paymentData = await Promise.all(parent.children.map(async (childId: any) => {
      const student = await Student.findById(childId).select('name level').lean();
      
      // Récupérer tous les paiements de l'enfant pour l'année
      const payments = await Payment.find({ 
        student: childId, 
        academicYear: academicYearId 
      }).sort({ date: -1 }).lean();

      const balancesByType: Record<string, number> = {};
      const typesRencontres = new Set(payments.map(p => p.type));

      typesRencontres.forEach(type => {
        // Le premier paiement trouvé pour ce type est le plus récent (grâce au sort date: -1)
        const lastPaymentOfType = payments.find(p => p.type === type);
        balancesByType[type] = lastPaymentOfType?.remainingAfter || 0;
      });

      // Calculer le total payé
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      
      // On récupère le dernier "remainingAfter" pour savoir ce qu'il reste à payer
      // const lastPayment = payments[0]; // Car trié par date DESC
      // const balance = lastPayment ? lastPayment.remainingAfter : 0;

      return {
        studentId: childId,
        studentName: student?.name || 'Élève inconnu',
        totalPaid,
        balance: balancesByType || {},
        history: payments || []
      };
    }));

    return NextResponse.json(paymentData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}