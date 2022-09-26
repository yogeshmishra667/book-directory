const Book = require('../Model/booksModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

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
  const searchedField = req.query.title;
  const book = await Book.find({
    title: { $regex: searchedField, $options: '$i' },
  });

  res.status(201).send({
    data: {
      book,
    },
  });
});

exports.getAllBooks = catchAsync(async (req, res) => {
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

exports.createBooks = catchAsync(async (req, res) => {
  const newBook = await Book.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      book: newBook,
    },
  });
});

exports.getBooks = catchAsync(async (req, res) => {
  const book = await Book.findById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: {
      book,
    },
  });
});

exports.updateBooks = catchAsync(async (req, res) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      book,
    },
  });
});

exports.deleteBooks = catchAsync(async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  res.json({
    status: 'the book is deleted successfully',
    data: {
      book,
    },
  });
});

//aggregation pipeline
exports.getBookStats = catchAsync(async (req, res) => {
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
