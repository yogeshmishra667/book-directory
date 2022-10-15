const express = require('express');
const userController = require('../Controllers/userController');
const authController = require('../Controllers/authController');

const Router = express.Router();

//authentication is user related but we add separate routes for auth.
//it not related to 100% to user but it follow restFul api rule
//we can't remove user routes we also use later
Router.route('/signup').post(authController.signup);
Router.route('/login').post(authController.login);

//users route
Router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
Router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = Router;
