import mongoose, { Schema, model, models } from 'mongoose';

const ClassSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  schoolId: { 
    type: Schema.Types.ObjectId, 
    ref: 'School', 
    required: true 
  },
  createdAt: { type: Date, default: Date.now }
});

export default models.Class || model('Class', ClassSchema);