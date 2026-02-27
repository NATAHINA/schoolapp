// models/User.ts
import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  name: { 
    type: String, 
    required: [true, "Le nom est obligatoire"] 
  },
  email: { 
    type: String, 
    required: [true, "L'email est obligatoire"], 
    unique: true, 
    lowercase: true 
  },
  password: { 
    type: String, 
    required: [true, "Le mot de passe est obligatoire"],
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  role: {
    type: String, 
    enum: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'SECRETARY','ACCOUNTANT','SURVEILLANT'], 
    default: 'ADMIN' 
  },
  schoolId: { 
    type: Schema.Types.ObjectId, 
    ref: 'School', 
    required: true 
  },
  phone: { 
    type: String 
  },
  image: { 
    type: String 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});


const User = models.User || model('User', UserSchema);

export default User;