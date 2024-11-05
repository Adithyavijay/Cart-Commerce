import User from "../models/User.js";
import bcrypt from 'bcrypt';
/**
 * Controller for handling dashboard-related operations
 */
class  AuthController{
// signup
  async signup(req, res) { 
    try{   
          const { email , password } = req.body;  
          if (!email || !password) {
            return res.status(400).json({ status: false,message: 'Email and password are required' });
          } 

          const user= await User.findOne({email : email})
          
          if(user){
            throw new Error("user already exists")
          } 
          const hashedPassword = await bcrypt.hash(password, 10);
          const newUser = new User({
            email : email ,
            password : hashedPassword 
          })   
          
          await newUser.save();
          res.json({ status : true , message : "User created successfully" , user : user})
    } catch (error) {
      console.log(error) 
      res.status(400).json({ status : false , message : error.message})
    } 
  }  
// login user
  async login(req,res) {
    try { 
      
        const { email, password } = req.body;
        // 1. Find user by email
        const user = await User.findOne({email : email})
        // 2. Check if user exists
        if (!user) {
            throw new Error("Invalid email or password");
        } 

        // 3. Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid email or password");
        } 
        return res.status(200).json({message : "user logged in successfully" , user : user })

    } catch (error) {
        console.error("Login controller error:", error);
        res.status(404).json({error : error.message})
    }
}

}

export default new AuthController();