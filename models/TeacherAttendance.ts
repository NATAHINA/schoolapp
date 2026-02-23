import mongoose, { Schema, model, models } from 'mongoose';

const TeacherAttendanceSchema = new Schema({
  teacherId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Teacher', 
    required: true 
  },
  academicYear: { type: Schema.Types.ObjectId, ref: 'Annee', required: true },
  schoolId: { 
    type: Schema.Types.ObjectId, 
    ref: 'School', 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Présent', 'Absent', 'En retard', 'Congé'], 
    default: 'Présent' 
  },
  arrivalTime: { type: String },
  period: { 
    type: String, 
    enum: ['Matin', 'Après-midi', 'Journée'], 
    default: 'Matin' 
  },
  comment: { type: String, trim: true }
}, { timestamps: true });


TeacherAttendanceSchema.index({ teacherId: 1, date: 1, period: 1 }, { unique: true });

export default models.TeacherAttendance || model('TeacherAttendance', TeacherAttendanceSchema);

