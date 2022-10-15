//we can't added authentication related on userController we add new authController
const User = require('../Model/userModel');
const catchAsync = require('../utils/catchAsync');

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});
