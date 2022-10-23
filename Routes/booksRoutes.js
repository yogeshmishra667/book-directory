const express = require('express');
const bookController = require('../Controllers/bookController');
const authController = require('../Controllers/authController');

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
  authController.protect, //protect route
  bookController.getTopFiveAuthor,
  bookController.getAllBooks
);
Router.route('/latest-book').get(
  bookController.getLatestBook,
  bookController.getAllBooks
);
Router.route('/bestSeller').get(
  bookController.bestSeller,
  bookController.getAllBooks
);
Router.route('/searchBook/:key').get(bookController.searchBook);

Router.route('/')
  .get(bookController.getAllBooks)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'publisher'),
    bookController.createBooks
  );
Router.route('/:id')
  .get(bookController.getBooks)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'publisher'),
    bookController.uploadBookPhoto,
    bookController.resizeBookPhoto,
    bookController.updateBooks
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    bookController.deleteBooks
  );

module.exports = Router;
