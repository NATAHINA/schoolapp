import mongoose, { Schema, model, models } from 'mongoose';

const paymentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'Annee', required: true },
  type: { type: String, required: true },
  month: {type: String, },
  amount: { type: Number, required: true },
  totalExpected: { type: Number },
  remainingAfter: { type: Number },
  reference: { type: String, unique: true },
  date: { type: Date, default: Date.now },
  method: { 
    type: String, 
    enum: ['Espèces', 'Chèque', 'Virement', 'Mobile Money', 'TPE', 'MVola', 'Airtel Money'], 
    default: 'Espèces' 
  },
  note: { type: String }
}, { timestamps: true });

paymentSchema.index({ student: 1, type: 1, month: 1, academicYear: 1 }, { 
  unique: true, 
  partialFilterExpression: { type: 'Écolage' } 
});

export default models.Payment || model('Payment', paymentSchema);