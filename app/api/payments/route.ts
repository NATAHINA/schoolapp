import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Payment from '@/models/Payment';
import FeeConfig from '@/models/FeeConfig';
import Student from '@/models/Student';
import School from '@/models/School';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { student, schoolId, academicYear, type, month, amount } = body;

    const studentDoc = await Student.findById(student);
    if (!studentDoc || !studentDoc.class) {
      return NextResponse.json({ error: "L'élève n'est pas affecté à une classe." }, { status: 400 });
    }

    const config = await FeeConfig.findOne({ 
      schoolId, 
      academicYear, 
      name: type,
      classId: studentDoc.class 
    });

    if (!config) {
      return NextResponse.json({ error: `Tarif non configuré pour: ${type}` }, { status: 400 });
    }

    const isMonthly = config.feeType === 'Écolage' || config.category === 'Mensuel';

    const query: any = { student, schoolId, academicYear, type };
    if (isMonthly) query.month = month;

    const previousPayments = await Payment.find(query);
    const alreadyPaid = previousPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    
    const totalDue = config.amount;
    const remainingBefore = totalDue - alreadyPaid;

    if (remainingBefore <= 0) {
      return NextResponse.json({ error: "Ce frais a déjà été réglé en totalité." }, { status: 400 });
    }

    if (amount > remainingBefore) {
      return NextResponse.json({ 
        error: `Le montant dépasse le reste à payer (${remainingBefore.toLocaleString()} Ar).` 
      }, { status: 400 });
    }

    const count = await Payment.countDocuments({ schoolId });
    const reference = `REC-${new Date().getFullYear()}-${(count + 1).toString().padStart(5, '0')}`;

    const newPayment = await Payment.create({ 
      ...body, 
      reference,
      totalExpected: totalDue,
      remainingAfter: remainingBefore - amount,
      date: new Date()
    });

    const paymentFull = await Payment.findById(newPayment._id)
      .populate('student')
      .populate('schoolId')
      .populate('academicYear');

    return NextResponse.json({ success: true, data: paymentFull });
    
  } catch (error: any) {
    console.error("Erreur API Payment:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const schoolId = searchParams.get('schoolId');
    const academicYear = searchParams.get('academicYear');

    const filter: any = {};
    if (schoolId) filter.schoolId = schoolId;
    if (academicYear) filter.academicYear = academicYear;
    if (studentId) filter.student = studentId;

    const payments = await Payment.find(filter)
      .sort({ date: -1 })
      .populate('student')
      .populate('schoolId')
      .populate('academicYear');

    return NextResponse.json(payments);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


