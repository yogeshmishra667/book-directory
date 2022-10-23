const multer = require('multer');
const sharp = require('sharp');
const Book = require('../Model/booksModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//FOR UPLOAD IMAGES
//IF YOU DO NOT WANT TO CROP IMG THEN USE THESE WAY

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

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
exports.uploadBookPhoto = upload.single('bookCover');

//RESIZE AND COMPRESS IMAGES USING SHARP
exports.resizeBookPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `book-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/books/${req.file.filename}`);

  next();
});

//Additional features
exports.getTopFive = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'title,ISBN,price,summary';
  next();
};
//2)
exports.getTopFiveAuthor = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'Author,publisher,publishedDate';
  next();
};
exports.getLatestBook = (req, res, next) => {
  req.query.limit = '2';
  req.query.sort = '-publishedDate';
  req.query.fields = 'title,Author,publisher,publishedDate';
  next();
};
exports.bestSeller = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-soldCopies';
  req.query.fields = 'title,Author,publisher, soldCopies, price';
  next();
};
exports.searchBook = catchAsync(async (req, res) => {
  const book = await Book.find({
    $or: [
      { title: { $regex: /req.params.key/ }, $options: 'ix' },
      { Author: { $regex: /req.params.key/ }, $options: 'ix' },
      { publisher: { $regex: /req.params.key/ }, $options: 'ix' },
    ],
  });

  res.status(201).send({
    data: {
      book,
    },
  });
});

exports.getAllBooks = catchAsync(async (req, res, next) => {
  //Execute the Query
  const features = new APIFeatures(Book.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const books = await features.query;
  // const book = await Book.find();
  res.status(200).json({
    result: books.length,
    status: 'success',
    data: {
      book: books,
    },
  });
});

exports.createBooks = catchAsync(async (req, res, next) => {
  const newBook = await Book.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      book: newBook,
    },
  });
});

exports.getBooks = catchAsync(async (req, res, next) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    return next(new AppError('No book found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      book,
    },
  });
});

exports.updateBooks = catchAsync(async (req, res, next) => {
  const book = await Book.findByIdAndUpdate(
    req.params.id,
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    { ...req.body, bookCover: req.file.filename },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({
    status: 'success',
    data: {
      book,
    },
  });
});

exports.deleteBooks = catchAsync(async (req, res, next) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  res.json({
    status: 'the book is deleted successfully',
    data: {
      book,
    },
  });
});

//aggregation pipeline
exports.getBookStats = catchAsync(async (req, res, next) => {
  const stats = await Book.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$format',
        numBooks: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
  ]);

  res.status(201).send({
    data: {
      stats,
    },
  });
});
