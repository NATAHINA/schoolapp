import mongoose, { Schema, model, models } from 'mongoose';

const StudentSchema = new Schema({
  matricule: { type: String },
  name: { type: String, required: true },
  email: { type: String },
  class: { 
    type: Schema.Types.ObjectId, 
    ref: 'Class', 
    required: true 
  },
  date_naissance: {type: Date },
  lieu_naissance: {type: String },
  academicYear: { type: Schema.Types.ObjectId, ref: 'Annee', required: true },
  gender: { type: String, enum: ['M', 'F'], required: true },
  parentName: { type: String, required: true },
  parentPhone: { type: String, required: true }, // Crucial pour l'envoi de SMS
  schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
  status: { type: String, default: 'Actif' },
  createdAt: { type: Date, default: Date.now },
});

export default models.Student || model('Student', StudentSchema);