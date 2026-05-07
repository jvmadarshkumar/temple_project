import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  role: { type: String, enum: ['admin', 'viewer'], default: 'viewer' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  password: { type: String }, // Plain text as requested by admin
  isDisabled: { type: Boolean, default: false },
  canAddTransactions: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

UserSchema.index({ status: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);
