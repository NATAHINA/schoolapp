import mongoose, { Schema, model, models } from 'mongoose';

const TeacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  subjects: [{ type: String }],
  assignedClasses: [{ type: String }],
  schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
  status: { type: String, default: 'Actif' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Teacher || mongoose.model('Teacher', TeacherSchema);