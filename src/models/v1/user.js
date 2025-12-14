import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      masLength: [20, 'Username cannot exceed 20 characters'],
      unique: [true, 'Username must be unique'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      maxLength: [50, 'Email cannot exceed 50 characters'],
      unique: [true, 'Email must be unique'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ['admin', 'user'],
        message: '{VALUE} is not a valid role',
      },
      default: 'user',
    },
    firstName: {
      type: String,
      maxLength: [20, 'First name cannot exceed 20 characters'],
    },
    lastName: {
      type: String,
      maxLength: [20, 'Last name cannot exceed 20 characters'],
    },
    socialLinks: {
      website: {
        type: String,
        maxLength: [100, 'Website URL cannot exceed 100 characters'],
      },
      linkedin: {
        type: String,
        maxLength: [100, 'LinkedIn URL cannot exceed 100 characters'],
      },
      facebook: {
        type: String,
        maxLength: [100, 'Facebook URL cannot exceed 100 characters'],
      },
      instagram: {
        type: String,
        maxLength: [100, 'Instagram URL cannot exceed 100 characters'],
      },
      x: {
        type: String,
        maxLength: [100, 'X URL cannot exceed 100 characters'],
      },
      youtube: {
        type: String,
        maxLength: [100, 'YouTube URL cannot exceed 100 characters'],
      },
    },
  },
  { timestamps: true },
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

export default model('User', userSchema);
