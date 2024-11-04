import connectDb from "./config/db.js";
import Product from "./models/Product.js";
import products from "./data/products.js";

const importData = async ()=>{
    try { 
        await connectDb()
        const createdProducts = await Product.insertMany(products)
        console.log('Data imported')
        process.exit()
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
} 

importData();
const destroyData = async()=>{

    try{
        await connectDb();
        await Product.deleteMany();
       

       
        process.exit();

    }catch(error){

        console.error(error);
        process.exit(1)
    }
}  
// destroyData()
