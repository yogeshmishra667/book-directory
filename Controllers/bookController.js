const Book = require('../Model/booksModel');

exports.getAllBooks = async (req, res) => {
  try {
    const book = await Book.find();
    res.status(200).json({
      status: 'success',
      data: {
        book,
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
