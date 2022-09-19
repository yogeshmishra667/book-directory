const mongoose = require('mongoose');
//const slugify = require('slugify');
//mongoose schema and schema-type
const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: [
        40,
        'A book title must have less or equal then 40 characters',
      ],
      minlength: [
        10,
        'A book title must have more or equal then 10 characters',
      ],
    },
    slug: String,
    Author: {
      type: String,
      required: [true, 'A book must have a author'],
    },
    ISBN: {
      type: Number,
      required: [true, 'A book must have a ISBN'],
    },
    publisher: {
      type: String,
      required: [true, 'A book must have a publisher'],
    },
    publishedDate: {
      type: Date,
      required: [true, 'A book must have a publishedDate'],
    },
    format: {
      type: String,
      required: [true, 'A book must have a format'],
      enum: {
        values: ['Ebooks', 'PDF', 'Kindly'],
        message: 'format is either: ebooks, pdf, kindly',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    pageCount: {
      type: Number,
    },
    bookCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    language: {
      type: String,
    },
    genre: {
      type: String,
      required: [true, 'A book must have a genre'],
      enum: {
        values: ['Quest', 'adventure', 'fantasy'],
        message: 'genre is either: Quest, adventure, fantasy',
      },
    },
  }
  // {
  //   toJSON: { virtuals: true },
  //   toObject: { virtuals: true },
  // }
);

//mongoose model of the schema
const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
