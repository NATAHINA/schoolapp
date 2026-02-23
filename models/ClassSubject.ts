import mongoose, { Schema, model, models } from 'mongoose';

const ClassSubjectSchema = new Schema({
  classId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Class', 
    required: [true, "La classe est obligatoire"] 
  },
  subjectId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Subject', 
    required: [true, "La matière est obligatoire"] 
  },
  teacherId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Teacher',
    required: [true, "L'enseignant est obligatoire"] 
  },
  schoolId: { 
    type: Schema.Types.ObjectId, 
    ref: 'School', 
    required: true 
  },
  hoursPerWeek: { 
    type: Number, 
    default: 1 
  },
  room: { 
    type: String, 
    trim: true 
  }
});

// Empêche d'attribuer deux fois la même matière à la même classe
ClassSubjectSchema.index({ classId: 1, subjectId: 1 }, { unique: true });

export default models.ClassSubject || model('ClassSubject', ClassSubjectSchema);