const multer = require('multer');
const sharp = require('sharp');
const User = require('../Model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//FOR UPLOAD IMAGES
//TODO- IF YOU DO NOT WANT TO CROP IMG THEN USE THESE WAY ⬇

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

//TODO- IF YOU WANT TO CROP IMG THEN USE THESE WAY ⬇
//we need  buffer on req.file for sharp to work on it but buffer only show when we use multer.memoryStorage() ⬇
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadUserPhoto = upload.single('photo');

//RESIZE AND COMPRESS IMAGES USING SHARP
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

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
  if (req.file) filteredBody.photo = req.file.filename;

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
