const express = require('express');
const morgan = require('morgan');
const globalErrorHandler = require('./Controllers/errorController');
const booksRouter = require('./Routes/booksRoutes');
const userRouter = require('./Routes/userRoutes');
const AppError = require('./utils/appError');

const app = express();

// 1) middleware
app.use(express.json());
//express does not support body on the req so we use middleware
app.use(express.static(`${__dirname}/public`));
// 1.1) custom middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//always use mounting after the declare the variable ⬇️
app.use('/api/v1/books', booksRouter);
app.use('/api/v1/users', userRouter);

//for routes not define
app.all('*', (req, res, next) =>
  next(new AppError(`can't find ${req.originalUrl} on server`, 404))
);
app.use(globalErrorHandler);
module.exports = app;
