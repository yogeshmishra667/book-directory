const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const helmet = require('helmet');
const globalErrorHandler = require('./Controllers/errorController');
const booksRouter = require('./Routes/booksRoutes');
const userRouter = require('./Routes/userRoutes');
const AppError = require('./utils/appError');

const app = express();

const corsOptions = {
  origin: '*',
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

// 1) middleware
// 1.1) custom middleware/ GLOBAL MIDDLEWARE

//set security HTTP headers
app.use(helmet());

//development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//limit request from same API
const limiter = rateLimit({
  max: 50,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

//body-parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb' })); //set body limit 10kb

//express does not support body on the req so we use middleware
//serving static file
app.use(express.static(`${__dirname}/public`));

//for handle CORS origin error
app.use(cors(corsOptions)); // Use this after the variable declaration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

//Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.headers);
  next();
});

//2) ROUTES
//always use mounting after the declare the variable ⬇️
app.use('/api/v1/books', booksRouter);
app.use('/api/v1/users', userRouter);

//for routes not define
app.all('*', (req, res, next) =>
  next(new AppError(`can't find ${req.originalUrl} on server`, 404))
);

//GLOBAL ERROR HANDLER
app.use(globalErrorHandler);
module.exports = app;
