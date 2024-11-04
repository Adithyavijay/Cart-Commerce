import Product from '../models/Product.js';
import bcrypt from 'bcrypt';
/**
 * Controller for handling dashboard-related operations
 */
class  ProductController{
// get all products
  async getAllProducts ( req,res ){
    try{
        const products = await Product.find({}) 
        console.log(products)
       res.status(200).json({ status : true , message : "data fetched successfully", products}) 
    }catch(error){
        console.log(error)
        res.json({status : false , message : "products not avaiable", error : error.message})
    }
  } 
// get product by id
  async getProductById(req,res){
    try{
      const { id } = req.body ;
      const product = await Product.findById(id) 
      if(!product){
        throw new Error("product not available")
      }
      res.json({status : true , message:"product fetched successfully" , data : product })
    }catch(err){
      console.log(error)
    }
  }

}

export default new ProductController();