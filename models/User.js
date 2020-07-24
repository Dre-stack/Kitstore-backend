const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const addressSchema = new mongoose.Schema({
  alias: String,
  firstname: String,
  lastname: String,
  address: { type: String },
  apartment: String,
  city: String,
  country: String,
  region: String,
  phone: String,
});

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    trim: true,
    required: [true, 'Please enter your firstname'],
  },
  lastname: {
    type: String,
    trim: true,
    required: [true, 'Please enter your lastname'],
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    required: [true, 'Please enter your email'],
    validate: [validator.isEmail, ' Please enter a valid email'],
  },
  role: {
    type: String,
    default: 'user',
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: true,
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  address: {
    type: [addressSchema],
  },
  cart: {
    type: Array,
    default: [],
  },
  photo: String,
  passwordChangedAt: Date,
  jwt: String,
  prt: String,
  prtExpires: Date,
  isSignedOut: Boolean,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  this.isSignedOut = false;
  next();
});

userSchema.methods.comparePassword = async (
  candidatePassword,
  userPassword
) => {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfterTokenIssued = function (
  jwtTimestamp
) {
  if (this.passwordChangedAt) {
    const time = this.passwordChangedAt.getTime() / 1000;
    return jwtTimestamp < time;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.prt = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  this.prtExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
