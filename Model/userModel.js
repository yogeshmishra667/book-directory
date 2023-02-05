const mongoose = require('mongoose');
const validator = require('validator'); //validator is a package for validation
const bcrypt = require('bcryptjs'); //for password encryption
const crypto = require('crypto');

//mongoose schema and schema type
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please tell us your name'],
  },
  email: {
    type: String,
    unique: true, //unique email
    lowercase: true,
    required: [true, 'please provide your email'],
    validate: [validator.isEmail, 'please provide your valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    unique: true, //we can't use unique with select:false
    minlength: 8, //password length
    select: false, //this is not show password in response
  },
  confirmPassword: {
    type: String,
    required: [true, 'please confirm your password'],
    validate: {
      //this only work on create and save.
      //we can't use arrow function because we need to access this..
      //it only works on save() to we also need to use save on update.
      validator: function (el) {
        return el === this.password;
      },
      message: 'password does not matched',
    },
  },
  passwordChangedAt: Date, //we need to know when password changed
  passwordResetToken: String, //we need to know when password reset token created
  passwordResetExpires: Date, //we need to know when password reset token expires
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  active: {
    type: Boolean,
    default: true,
    select: false, //we don't want to show active in response
  },
});

userSchema.pre(/^find/, function (next) {
  //this points to current query
  this.find({ active: { $ne: false } }); //we don't want to show inactive users
  next();
});

userSchema.pre('save', async function (next) {
  //only run this function is password was actually modified
  if (!this.isModified('password')) return next();

  //hash the password with the cost of 12
  this.password = await bcrypt.hash(this.password, 12); //we hash password with bcrypt.hash() method and we pass password and cost of 12

  //delete the confirmPassword value
  //we set undefined because is field set required
  this.confirmPassword = undefined; //we don't need to save confirmPassword in database so we set undefined value

  next();
});

userSchema.pre('save', function (next) {
  //we need to know when password changed
  //we check if password is modified or it is new user then we return next()
  if (!this.isModified('password') || this.isNew) return next();

  //we need to set passwordChangedAt 1 second before the token was issued
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword); //true or false //we compare candidatePassword and userPassword and return true or false value
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  //here we check if password changed after token issued
  //if password changed after token issued then we need to re-login again
  //we need to check if password changed after token issued
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      //we convert date to timestamp for compare with token timestamp (JWTTimestamp)
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    //it convert to seconds from milliseconds and we need to convert to integer because we get float value  from getTime()  method and we need to compare with JWTTimestamp which is integer  value so we need to convert to integer  value from float value using parseInt() method and we need to convert to integer value because we need to compare with JWTTimestamp which is integer value

    // console.log(JWTTimestamp);
    return JWTTimestamp < changedTimestamp; //100 < 200 //true
  }
  //false means not changed

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  //we need to create password reset token
  const resetToken = crypto.randomBytes(32).toString('hex'); //we create random token using crypto.randomBytes() method and we pass 32 bytes and we convert it to hex string using toString() method

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)

    .digest('hex'); //we create hash using crypto.createHash() method and we pass sha256 and we update it with resetToken and we convert it to hex string using digest() method

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //we set password reset expires time using Date.now() method and we add 10 minutes in milliseconds

  return resetToken; //we return resetToken
};

const User = mongoose.model('User', userSchema);

module.exports = User;
