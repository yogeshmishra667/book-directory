const express = require('express');
const bookController = require('../Controllers/bookController');

const Router = express.Router();
// Router.param('id', bookController.checkID);

//aliasing

Router.route('/')
  .get(bookController.getAllBooks)
  .post(bookController.createBooks);
Router.route('/:id')
  .get(bookController.getBooks)
  .patch(bookController.updateBooks)
  .delete(bookController.deleteBooks);

module.exports = Router;
