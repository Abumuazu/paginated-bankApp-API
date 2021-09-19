//creating a schema (mongose)
import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

export interface ScType {
  name: string;
  email: string;
  password: string;
  tokens: { [key: string]: string }[];
}

const userSchema = new mongoose.Schema<ScType>({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid email'],
    unique: true,
  },

  password: {
    type: String,
    required: [true, 'password is required'],
    minLength: 7,
    select: false,
  },

  tokens: [
    {
      token: String,
    },
  ],
});

userSchema.pre('save', async function (next: () => void) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
const User = mongoose.model('User', userSchema);
export default User;
