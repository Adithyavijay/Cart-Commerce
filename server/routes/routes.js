import express from 'express';
import authController from '../controllers/auth-controller.js';
import productController from '../controllers/product-controller.js';
import CartController from '../controllers/cart-controller.js';
import discountController from '../controllers/discount-controller.js';


const router = express.Router(); 

// authentication routes
router.post('/signup',authController.signup) ;
router.post('/login', authController.login) ; 

// product routes 

router.get('/products', productController.getAllProducts) 
router.get('/product/:id',productController.getProductById) 

// cart routes 

router.get('/:userId', CartController.getCart);
// Add item to cart
router.post('/add', CartController.addToCart);
// Remove item from cart
router.post('/remove', CartController.removeFromCart);
// Update item quantity
router.put('/update-quantity', CartController.updateQuantity);

// Calculate discounts and final price
router.post('/calculate-total', discountController.calculateTotal);





export default  router;