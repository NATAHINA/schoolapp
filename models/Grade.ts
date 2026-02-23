import mongoose, { Schema, model, models } from 'mongoose';

const GradeSchema = new Schema({
  student: { 
    type: Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  subject: { 
    type: Schema.Types.ObjectId, 
    ref: 'Subject', 
    required: true 
  },
  academicYear: { type: Schema.Types.ObjectId, ref: 'Annee', required: true },
  class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  value: { 
    type: Number, 
    required: true,
    min: 0,
    max: 20 
  },
  period: { 
    type: String, 
    required: true
  },
  schoolId: { 
    type: Schema.Types.ObjectId, 
    ref: 'School', 
    required: true 
  },
  examDate: { type: Date, default: Date.now },
  comment: { type: String, trim: true }
});

// Un élève ne peut avoir qu'une seule note par matière et par période
GradeSchema.index({ student: 1, subject: 1, period: 1 }, { unique: true });

export default models.Grade || model('Grade', GradeSchema);