import mongoose, { Schema, model, models } from 'mongoose';

const ParentSchema = new Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    lowercase: true,
    trim: true,
    default: null
  },
  password: { type: String, required: true, select: false },
  phone: { type: String, required: true },
  children: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
  createdAt: { type: Date, default: Date.now },
  userId: {
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  }
});

export default models.Parent || model('Parent', ParentSchema);