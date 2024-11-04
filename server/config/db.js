import mongoose from "mongoose";

     const connectDb=async()=>{

        try{
            const conn = await mongoose.connect("mongodb+srv://adithya786:adithya@cluster0.7qcbp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
            console.log(`mongoose conntected`)

        }catch(error){
            console.log(error.message)
            process.exit(1)
        }
     }
     export default connectDb  
