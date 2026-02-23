import mongoose, { Schema, model, models } from 'mongoose';

const AnneeSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  schoolId: { 
    type: Schema.Types.ObjectId, 
    ref: 'School', 
    required: true 
  },
  isCurrent: { type: Boolean, default: false },
  startDate: Date,
  endDate: Date,
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default models.Annee || model('Annee', AnneeSchema);