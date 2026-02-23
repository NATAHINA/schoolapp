import mongoose, { Schema, model, models } from 'mongoose';

const SubjectSchema = new Schema({
  name: { 
    type: String, 
    required: [true, "Le nom de la matière est obligatoire"],
    trim: true
  },
  code: { 
    type: String, 
    description: "Ex: MATH, PHYS, FRAN",
    trim: true 
  },
  coeff: { 
    type: Number, 
    required: [true, "Le coefficient est obligatoire"],
    default: 1,
    min: [0, "Le coefficient ne peut pas être négatif"]
  },
  schoolId: { 
    type: Schema.Types.ObjectId, 
    ref: 'School', 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['Scientifique', 'Littéraire', 'Artistique', 'Sportive', 'Autre'],
    default: 'Autre'
  },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

SubjectSchema.index({ name: 1, schoolId: 1 }, { unique: true });

export default models.Subject || model('Subject', SubjectSchema);