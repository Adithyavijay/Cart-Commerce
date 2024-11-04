class DiscountController {
  calculateItemDiscounts(items) {
    let discounts = [];
    
    items.forEach(item => {
      let discount = 0;
      
      // buy one get one
      if (item.code === 'PF1') {
        const freeItems = Math.floor(item.quantity / 2);
        discount += freeItems * item.price;
      }
      
      // bilk
      if (item.code === 'PF2' && item.quantity >= 3) {
        discount += item.quantity * (80 - 75); // 
      }
      
      // combo of first and 3 rd
      if (this.hasComboItems(items, 'PF1', 'PF3')) {
        if (item.code === 'PF3') {
          discount += 10; 
        }
      }
      
      // Limited Time Discount for Armani Code pf4
      if (item.code === 'PF4') {
        discount += item.price * item.quantity * 0.15;
      }
      
      //  Tiered Discount for Gucci Bloom (pf5)
      if (item.code === 'PF5') {
        if (item.quantity >= 4) {
          discount += item.price * item.quantity * 0.20;
        } else if (item.quantity >= 2) {
          discount += item.price * item.quantity * 0.10;
        }
      }
      
      // max discount cap at 30%
      const maxDiscount = item.price * item.quantity * 0.3;
      discounts.push(Math.min(discount, maxDiscount));
    });
    
    return discounts;
  }
  
  hasComboItems(items, code1, code2) {
    return items.some(item => item.code === code1) && 
           items.some(item => item.code === code2);
  }
  
  async calculateTotal(req, res) {
    try {
      const { cart } = req.body;
      
      if (!cart || !cart.items || cart.items.length === 0) {
        return res.status(400).json({ 
          status: false, 
          message: 'Cart is empty' 
        });
      }
      
      
      const itemDiscounts = this.calculateItemDiscounts(cart.items);
      
     
      const subtotal = cart.items.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0);
      
      const totalDiscount = itemDiscounts.reduce((sum, discount) => 
        sum + discount, 0);
      
      const final = subtotal - totalDiscount;
      
      // indivdual discount
      const itemsWithDiscounts = cart.items.map((item, index) => ({
        ...item,
        discount: itemDiscounts[index],
        finalPrice: (item.price * item.quantity) - itemDiscounts[index]
      }));
      
      return res.status(200).json({
        status: true,
        data: {
          items: itemsWithDiscounts,
          subtotal,
          totalDiscount,
          finalPrice: final
        }
      });
      
    } catch (error) {
      console.error('Error calculating discounts:', error);
      return res.status(500).json({ 
        status: false, 
        message: 'Error calculating discounts', 
        error: error.message 
      });
    }
  }
}

export default new DiscountController();