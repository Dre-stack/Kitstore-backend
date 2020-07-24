const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 30,
    },
  },
  {
    toJSON: {
      timestamps: true,
      virtuals: true,
    },
    toObject: { timestamps: true, virtuals: true },
    id: false,
  }
);

categorySchema.virtual('products', {
  ref: 'Product',
  foreignField: 'category',
  localField: '_id',
});

// categorySchema.pre('findOne', function (next) {
//   this.populate({ path: 'products', model: 'Product' });
//   next();
// });

const Catergory = mongoose.model('Category', categorySchema);

module.exports = Catergory;
