import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Student from '@/models/Student';
import Class from '@/models/Class';
import Attendance from '@/models/Attendance';
import Payment from '@/models/Payment';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const schoolId = searchParams.get('schoolId');
    const academicYear = searchParams.get('academicYear');

    if (
      !schoolId || schoolId === 'null' || 
      !academicYear || academicYear === 'null' ||
      !mongoose.Types.ObjectId.isValid(schoolId) || 
      !mongoose.Types.ObjectId.isValid(academicYear)
    ) {
      return NextResponse.json({ 
        totalStudents: 0, 
        totalRevenue: 0, 
        absencesToday: 0, 
        totalClasses: 0,
        chartData: [],
        revenueData: [],
        collectionRate: 0,
        recentActivities: []
      });
    }

    const sId = new mongoose.Types.ObjectId(schoolId);
    const aId = new mongoose.Types.ObjectId(academicYear);

    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.$gte = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }

    const [totalStudents, totalClasses, filteredPayments, studentChart] = await Promise.all([
      Student.countDocuments({ schoolId: sId, academicYear: aId }),
      Class.countDocuments({ schoolId: sId }),
      Payment.find({ 
        schoolId: sId, 
        academicYear: aId,
        ...(startDate && endDate ? { date: dateFilter } : {}) 
      }),
      
      Student.aggregate([
        { $match: { schoolId: sId, academicYear: aId } },
        {
          $group: {
            _id: { $dateToString: { format: "%d/%m", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } },
        { $limit: 7 }
      ])
    ]);

    
    const totalRevenue = filteredPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const absencesToday = await Attendance.countDocuments({
      schoolId: sId,
      academicYear: aId,
      date: { $gte: startOfToday },
      status: 'Absent'
    });

    const revenueChart = await Payment.aggregate([
      { $match: { schoolId: sId, academicYear: aId } },
      {
        $group: {
          _id: { $month: "$date" },
          amount: { $sum: "$amount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
    
    const paidStudentsCount = (await Payment.distinct('student', { 
      schoolId: sId, 
      academicYear: aId, 
      type: 'Écolage' 
    })).length;

    const recentActivitiesRaw = await Payment.find({ 
        schoolId: sId, 
        academicYear: aId,
        ...(startDate && endDate ? { date: dateFilter } : {})
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('student', 'name');

    return NextResponse.json({
      totalStudents,
      totalClasses,
      absencesToday,
      totalRevenue,
      collectionRate: totalStudents > 0 ? Math.round((paidStudentsCount / totalStudents) * 100) : 0,
      chartData: studentChart.map(item => ({ name: item._id, students: item.count })),
      revenueData: revenueChart.map(item => ({
        month: monthNames[item._id - 1] || `M${item._id}`,
        amount: item.amount
      })),
      recentActivities: recentActivitiesRaw.map(p => ({
        type: 'Paiement',
        description: `Paiement de ${p.amount?.toLocaleString()} Ar - ${p.student?.name || 'Élève'}`,
        time: new Date(p.createdAt).toLocaleDateString('fr-FR', { 
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
        })
      }))
    });

  } catch (error: any) {
    console.error("Erreur API Stats:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}




// import { NextResponse } from 'next/server';
// import dbConnect from '@/lib/dbConnect';
// import Student from '@/models/Student';
// import Class from '@/models/Class';
// import Attendance from '@/models/Attendance';
// import Payment from '@/models/Payment';
// import mongoose from 'mongoose';

// export async function GET(req: Request) {
//   try {
//     await dbConnect();
//     const { searchParams } = new URL(req.url);
//     const schoolId = searchParams.get('schoolId');
//     const academicYear = searchParams.get('academicYear');

//     if (
//       !schoolId || schoolId === 'null' || 
//       !academicYear || academicYear === 'null' ||
//       !mongoose.Types.ObjectId.isValid(schoolId) || 
//       !mongoose.Types.ObjectId.isValid(academicYear)
//     ) {
      
//     return Response.json({ 
//       totalStudents: 0, 
//       totalRevenue: 0, 
//       absencesToday: 0, 
//       totalClasses: 0,
//       chartData: [],
//       revenueData: [],
//       collectionRate: 0,
//       recentActivities: []
//     });
//     }

//     const sId = new mongoose.Types.ObjectId(schoolId);
//     const aId = new mongoose.Types.ObjectId(academicYear);

//     const [totalStudents, totalClasses, payments] = await Promise.all([
//       Student.countDocuments({ schoolId: sId, academicYear: aId }),
//       Class.countDocuments({ schoolId: sId }),
//       Payment.find({ schoolId: sId, academicYear: aId })
//     ]);

//     const startOfToday = new Date();
//     startOfToday.setHours(0, 0, 0, 0);
//     const absencesToday = await Attendance.countDocuments({
//       schoolId: sId,
//       academicYear: aId,
//       date: { $gte: startOfToday },
//       status: 'Absent'
//     });

//     const totalRevenue = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

//     const studentChart = await Student.aggregate([
//       { $match: { schoolId: sId, academicYear: aId } },
//       {
//         $group: {
//           _id: { $dateToString: { format: "%d/%m", date: "$createdAt" } },
//           count: { $sum: 1 }
//         }
//       },
//       { $sort: { "_id": 1 } },
//       { $limit: 7 }
//     ]);

//     const revenueChart = await Payment.aggregate([
//       { $match: { schoolId: sId, academicYear: aId } },
//       {
//         $group: {
//           _id: { $month: "$date" },
//           amount: { $sum: "$amount" }
//         }
//       },
//       { $sort: { "_id": 1 } }
//     ]);

//     const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
    
//     const paidStudentsCount = (await Payment.distinct('student', { 
//       schoolId: sId, 
//       academicYear: aId, 
//       type: 'Écolage' 
//     })).length;

//     return NextResponse.json({
//       totalStudents,
//       totalClasses,
//       absencesToday,
//       totalRevenue,
//       collectionRate: totalStudents > 0 ? Math.round((paidStudentsCount / totalStudents) * 100) : 0,
//       chartData: studentChart.map(item => ({ name: item._id, students: item.count })),
//       revenueData: revenueChart.map(item => ({
//         month: monthNames[item._id - 1] || `M${item._id}`,
//         amount: item.amount
//       })),
//       recentActivities: (await Payment.find({ schoolId: sId, academicYear: aId }) // Filtre ICI
//         .sort({ createdAt: -1 })
//         .limit(5)
//         .populate('student', 'name'))
//         .map(p => ({
//           type: 'Paiement',
//           description: `Reçu de ${p.amount?.toLocaleString()} Ar - ${p.student?.name || 'Inconnu'}`,
//           time: new Date(p.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
//         }))
//     });

//   } catch (error: any) {
//     console.error("Erreur Stats:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }