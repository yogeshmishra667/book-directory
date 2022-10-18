//we can't added authentication related on userController we add new authController
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const User = require('../Model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

//we need to create a token for user when user signup or login
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (req, res) => {
  //const newUser = await User.create(req.body); ⬇️
  //is this way to create user have security flow because anyone create user as a admin and change data from DB
  // this is better way for security ⬇
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  //create token
  const token = signToken(newUser._id);
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1) check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  //2) check if user exist && password is correct
  const user = await User.findOne({ email }).select('+password');
  //we expectedly add password fields on data [+password]

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  //3) if everything ok, send token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});
exports.protect = catchAsync(async (req, res, next) => {
  //1) getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  //2) verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); //promisify is a function which convert callback function to promise
  //console.log(decoded);
  //3) check if user still exist
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }
  //4) check if user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }
  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser; //we can access user data from req.user in any route which is protected
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    //roles ['admin']. role='user'
    if (!roles.includes(req.user.role)) {
      //if role is not admin then it will return true and go to next middleware else it will return false and go to error middleware and send error message
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }
  //2) Generate the random reset token
  const resetToken = user.createPasswordResetToken(); //this function is in userModel and it will create resetToken and save it in DB and also return resetToken to us so we can send it to user email  ⬇
  await user.save({ validateBeforeSave: false });
  //we don't want to validate password and confirmPassword

  //3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }

  next();
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on the token
  //we are hashing token which we got from url and compare it with hashed token which is in DB ⬇
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    //we want to find user whose passwordResetExpires is greater than current time ⬇
    //we also want to find user whose passwordResetToken is equal to hashedToken ⬇
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password; //we are setting new password
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  //we are saving new password in DB ⬇
  await user.save();
  //3) Update changedPasswordAt property for the user

  //4) Log the user in, send JWT
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');
  //we are getting user from DB and also adding password field in data
  //because we want to check if password is correct or not ⬇

  //2) Check if POSTed current password is correct
  //we are checking if password which we got from req.body is correct or not ⬇
  //we are using correctPassword function which we created in userModel ⬇
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }
  //3) If so, update password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  //User.findByIdAndUpdate will NOT work as intended!

  //4) Log user in, send JWT
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});
