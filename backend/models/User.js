const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['candidate', 'recruiter', 'admin'],
        message: 'Role must be candidate, recruiter, or admin',
      },
      default: 'candidate',
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    bio: {
      type: String,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    location: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    avatar: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
      set: (skills) => skills.map((s) => s.trim().toLowerCase()),
    },
    experience: {
      type: String,
      enum: ['', '0-1', '1-3', '3-5', '5-8', '8+'],
      default: '',
    },
    education: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    companyName: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    portfolio: {
      type: String,
      trim: true,
      default: '',
    },
    linkedIn: {
      type: String,
      trim: true,
      default: '',
    },
    github: {
      type: String,
      trim: true,
      default: '',
    },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+', ''],
      default: '',
    },
    companyWebsite: {
      type: String,
      trim: true,
    },
    companyDescription: {
      type: String,
      maxlength: 1000,
    },
    isApproved: {
      type: Boolean,
      default: function () {
        return this.role !== 'recruiter';
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpires: {
      type: Date,
      select: false,
    },
    otpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    savedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
      },
    ],
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ isApproved: 1, role: 1 });
userSchema.index({ createdAt: -1 });

userSchema.virtual('profileStrength').get(function () {
  let strength = 0;
  const weights = {
    name: 10,
    email: 10,
    phone: 10,
    bio: 15,
    location: 10,
    skills: 20,
    experience: 10,
    education: 10,
    resumeUrl: 5,
  };

  if (this.name) strength += weights.name;
  if (this.email) strength += weights.email;
  if (this.phone) strength += weights.phone;
  if (this.bio && this.bio.length >= 20) strength += weights.bio;
  if (this.location) strength += weights.location;
  if (this.skills && this.skills.length >= 3) strength += weights.skills;
  else if (this.skills && this.skills.length > 0) strength += weights.skills / 2;
  if (this.experience && this.experience !== '') strength += weights.experience;
  if (this.education) strength += weights.education;
  if (this.resumeUrl) strength += weights.resumeUrl;

  return Math.min(strength, 100);
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
