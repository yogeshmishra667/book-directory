const Book = require('../Model/booksModel');
const APIFeatures = require('../utils/apiFeatures');

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

exports.getAllBooks = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      Error: error,
    });
  }
};

exports.createBooks = async (req, res) => {
  try {
    const newBook = await Book.create(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        book: newBook,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      Error: error,
    });
  }
};

exports.getBooks = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        book,
      },
    });
  } catch (error) {
    res.status(404).send({
      status: 'fail',
      Error: error,
    });
  }
};

exports.updateBooks = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        book,
      },
    });
  } catch (error) {
    res.status(400).send({
      status: 'fail',
      Error: error,
    });
  }
};

exports.deleteBooks = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    res.json({
      status: 'the book is deleted successfully',
      data: {
        book,
      },
    });
  } catch (error) {
    res.send({
      status: 'fail',
      Error: error,
    });
  }
};

//aggregation pipeline
exports.getBookStats = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(404).send({
      message: 'aggregation not working properly',
    });
  }
};
