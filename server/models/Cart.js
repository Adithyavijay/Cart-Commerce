import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    code: String,
    quantity: {
      type: Number,
      default: 1
    },
    price: Number,
    name: String
  }],
  totalPrice: {
    type: Number,
    default: 0
  }
});

export default mongoose.model('Cart',cartSchema);