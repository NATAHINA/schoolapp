import mongoose, { Schema, model, models } from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  class: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Class', 
    required: true 
  },
  academicYear: { type: Schema.Types.ObjectId, ref: 'Annee', required: true },
  schoolId: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  status: { 
    type: String, 
    enum: ['Present', 'Absent', 'Late', 'Retard'], 
    default: 'Present' 
  },
  period: { 
    type: String, 
    enum: ['Matin', 'Après-midi'], 
    default: 'Matin' 
  },
  teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  smsSent: { 
    type: Boolean, 
    default: false 
  },
  arrivalTime: { type: String },
  isJustified: { type: Boolean, default: false },
  justificationReason: { type: String },
}, { timestamps: true }); 

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);