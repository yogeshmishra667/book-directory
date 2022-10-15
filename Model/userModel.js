const mongoose = require('mongoose');
const validator = require('validator'); //validator is a package for validation
const bcrypt = require('bcryptjs'); //for password encryption
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
});

userSchema.pre('save', async function (next) {
  //only run this function is password was actually modified
  if (!this.isModified('password')) return next();

  //hash the password with the cost of 14
  this.password = await bcrypt.hash(this.password, 12);

  //delete the confirmPassword value
  //we set undefined because is field set required
  this.confirmPassword = undefined;

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
  //here basically we compare password
};

const User = mongoose.model('User', userSchema);

module.exports = User;
