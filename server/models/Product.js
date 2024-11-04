import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type : String},
    discounts: [{
      type: { type: String },
      value: Number,
      conditions: mongoose.Schema.Types.Mixed
    }]
  });  

  export default mongoose.model('Product',productSchema)
