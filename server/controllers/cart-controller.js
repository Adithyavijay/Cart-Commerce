import Product from '../models/Product.js';
import bcrypt from 'bcrypt';
import Cart from '../models/Cart.js';
/**
 * Controller for handling dashboard-related operations
 */
class CartController {
  // Get cart for user
  async getCart(req, res) {
    try {
      const { userId } = req.params;
      const cart = await Cart.findOne({ userId }).populate('items.productId');
      
      if (!cart) {
        return res.status(404).json({
          status: false,
          message: 'Cart not found'
        });
      }

      return res.status(200).json({
        status: true,
        message: 'Cart fetched successfully',
        cart
      });
    } catch (error) {
      console.error('Error fetching cart:', error);
      return res.status(500).json({
        status: false,
        message: 'Error fetching cart',
        error: error.message
      });
    }
  }

  // Add item to cart
  async addToCart(req, res) {
    try {
      const { userId, productId, quantity = 1 } = req.body;

      let cart = await Cart.findOne({ userId });
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          status: false,
          message: 'Product not found'
        });
      }

      if (!cart) {
        cart = new Cart({
          userId,
          items: [],
          totalPrice: 0
        });
      }

      // Check if product already exists in cart
      const existingItemIndex = cart.items.findIndex(
        item => item.productId.toString() === productId
      );

      if (existingItemIndex > -1) {
        // Update quantity if product exists
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item if product doesn't exist
        cart.items.push({
          productId,
          code: product.code,
          quantity,
          price: product.price,
          name: product.name
        });
      }

      // Update total price
      cart.totalPrice = cart.items.reduce((total, item) => 
        total + (item.price * item.quantity), 0
      );

      await cart.save();

      return res.status(200).json({
        status: true,
        message: 'Product added to cart successfully',
        cart
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      return res.status(500).json({
        status: false,
        message: 'Error adding to cart',
        error: error.message
      });
    }
  }

  // Remove item from cart
  async removeFromCart(req, res) {
    try {
      const { userId, productId } = req.body;

      const cart = await Cart.findOne({ userId });

      if (!cart) {
        return res.status(404).json({
          status: false,
          message: 'Cart not found'
        });
      }

     
      cart.items = cart.items.filter(
        item => item.productId.toString() !== productId
      );

     
      cart.totalPrice = cart.items.reduce((total, item) => 
        total + (item.price * item.quantity), 0
      );

      await cart.save();

      return res.status(200).json({
        status: true,
        message: 'Product removed from cart successfully',
        cart
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      return res.status(500).json({
        status: false,
        message: 'Error removing from cart',
        error: error.message
      });
    }
  }

  // Update item quantity
  async updateQuantity(req, res) {
    try {
      const { userId, productId, quantity } = req.body;

      if (quantity < 0) {
        return res.status(400).json({
          status: false,
          message: 'Quantity cannot be negative'
        });
      }

      const cart = await Cart.findOne({ userId });

      if (!cart) {
        return res.status(404).json({
          status: false,
          message: 'Cart not found'
        });
      }

      const itemIndex = cart.items.findIndex(
        item => item.productId.toString() === productId
      );

      if (itemIndex === -1) {
        return res.status(404).json({
          status: false,
          message: 'Product not found in cart'
        });
      }

      if (quantity === 0) {
        // Remove item if quantity is 0
        cart.items.splice(itemIndex, 1);
      } else {
        // Update quantity
        cart.items[itemIndex].quantity = quantity;
      }

      // Update total price
      cart.totalPrice = cart.items.reduce((total, item) => 
        total + (item.price * item.quantity), 0
      );

      await cart.save();

      return res.status(200).json({
        status: true,
        message: 'Cart updated successfully',
        cart
      });
    } catch (error) {
      console.error('Error updating cart:', error);
      return res.status(500).json({
        status: false,
        message: 'Error updating cart',
        error: error.message
      });
    }
  }
}

export default new CartController();