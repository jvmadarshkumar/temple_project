import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  role: { type: String, enum: ['admin', 'viewer'], default: 'viewer' },
  status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
  password: { type: String }, // Plain text as requested by admin
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
