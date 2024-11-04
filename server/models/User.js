import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String },
  password : { type : String , required : true }
});

export default mongoose.model('User', userSchema);  