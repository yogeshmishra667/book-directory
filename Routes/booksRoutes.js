const express = require('express');
const bookController = require('../Controllers/bookController');

const Router = express.Router();
// Router.param('id', bookController.checkID);

//for aggregation pipeline
Router.route('/book-stats').get(bookController.getBookStats);
//aliasing
Router.route('/top-5-books').get(
  bookController.getTopFive,
  bookController.getAllBooks
);
Router.route('/top-5-author').get(
  bookController.getTopFiveAuthor,
  bookController.getAllBooks
);
Router.route('/latest-book').get(
  bookController.getLatestBook,
  bookController.getAllBooks
);

Router.route('/')
  .get(bookController.getAllBooks)
  .post(bookController.createBooks);
Router.route('/:id')
  .get(bookController.getBooks)
  .patch(bookController.updateBooks)
  .delete(bookController.deleteBooks);

module.exports = Router;
