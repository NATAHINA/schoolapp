
import mongoose, { Schema, model, models } from 'mongoose';

const ReportSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
  period: { type: String, required: true }, 
  academicYear: { type: Schema.Types.ObjectId, ref: 'Annee', required: true },
  subjectsDetails: [{
    subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
    subjectName: String,
    grade: Number,
    coeff: Number,
    weightedGrade: Number,
    teacherComment: String
  }],

  totalWeightedPoints: Number,
  totalCoeffs: Number,
  average: Number,
  rank: Number,
  status: { type: String, enum: ['Brouillon', 'Validé'], default: 'Brouillon' },
  createdAt: { type: Date, default: Date.now },
  classSize: { type: Number },
  classAverage: { type: Number }
});

ReportSchema.index({ student: 1, period: 1, schoolId: 1 }, { unique: true });

export default models.Report || model('Report', ReportSchema);