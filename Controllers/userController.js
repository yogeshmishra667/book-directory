const User = require('../Model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  //we create a new object and we add only allowed fields to this object and return it to user object ⬇
  const newObj = {};
  //Object.keys(obj) return an array of keys of object [name,email,role] ⬇
  Object.keys(obj).forEach((el) => {
    //if allowedFields array include el then we add this el to newObj object  ⬇
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //1) Create error if user POSTs password data
  //we can't update password from here because we have separate route for update password  ⬇
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  //2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  //3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
  });
});

//User Route
exports.getAllUsers = catchAsync(async (req, res) => {
  const user = await User.find();

  res.status(200).json({
    result: user.length,
    status: 'success',
    data: {
      user,
    },
  });
});

exports.createUser = (req, res) => {
  res.json({
    status: 'Error',
    data: {
      message: 'this route can not define',
    },
  });
};

exports.getUser = (req, res) => {
  res.json({
    status: 'Error',
    data: {
      message: 'this route can not define',
    },
  });
};

exports.updateUser = (req, res) => {
  res.json({
    status: 'Error',
    data: {
      message: 'this route can not define',
    },
  });
};

exports.deleteUser = (req, res) => {
  res.json({
    status: 'Error',
    data: {
      message: 'this route can not define',
    },
  });
};
