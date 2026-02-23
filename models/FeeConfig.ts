import mongoose, { Schema, model, models } from 'mongoose';

const feeConfigSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  name: { type: String, required: true },
  feeType: { 
    type: String, 
    enum: ['Inscription', 'Écolage', 'Examen', 'Droit', 'Matériel', 'Autre'],
    required: true
  },
  amount: { type: Number, required: true },
  category: { type: String, enum: ['Mensuel', 'Unique'] } 
}, { timestamps: true });

feeConfigSchema.index({ schoolId: 1, academicYear: 1, feeType: 1, classId: 1 }, { unique: true });

export default models.FeeConfig || model('FeeConfig', feeConfigSchema);