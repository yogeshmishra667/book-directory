const mongoose = require('mongoose');
const slugify = require('slugify');
//mongoose schema and schema-type
const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: [
        50,
        'A book title must have less or equal then 50 characters',
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
        values: ['Ebooks', 'PDF', 'Kindly', 'EPUB'],
        message: 'format is either: ebooks, pdf, kindly, EPUB',
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
      required: [true, 'A books must have a price'],
    },
    soldCopies: {
      type: Number,
      required: [true, 'A books must have a soldCopies'],
    },
    priceDiscount: {
      type: Number,
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A books must have a description'],
    },
    pageCount: {
      type: Number,
    },
    bookCover: {
      type: String,
      required: [true, 'A books must have a cover image'],
    },
    language: {
      type: String,
    },
    genre: {
      type: String,
      required: [true, 'A books must have a genre'],
      enum: {
        values: [
          'Quest',
          'adventure',
          'fantasy',
          'Biography',
          'Dystopia',
          'Non-fiction',
        ],
        message:
          'genre is either: Quest, adventure, fantasy, Biography, Dystopia, Non-fiction',
      },
    },
  }
  // {
  //   toJSON: { virtuals: true },
  //   toObject: { virtuals: true },
  // }
);
// DOCUMENT MIDDLEWARE: runs before .save() and .create()
bookSchema.pre('save', function (next) {
  console.log(this.title);
  this.slug = slugify(this.title, { lower: true });
  next();
});
//mongoose model of the schema
const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
