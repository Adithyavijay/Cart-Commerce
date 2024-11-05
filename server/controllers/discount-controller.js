class DiscountController {  
  calculateItemDiscounts(items, user = null) { 
    let discounts = [];
    let appliedOffers = []; 
    let uniqueItems = new Set(items.map(item => item.code)).size;
    
    items.forEach(item => {
      let discount = 0;
      let itemTotal = item.price * item.quantity;
      let itemOffers = [];

      // Category-based discounts 
      if (item.code === 'PF1') {
        const freeItems = Math.floor(item.quantity / 2);
        discount += freeItems * item.price;
        if (freeItems > 0) {
          itemOffers.push({
            type: 'BOGO',
            description: `Buy One Get One Free on Cool Water - ${freeItems} free items`,
            savings: freeItems * item.price
          });
        }
      }
      
      if (item.code === 'PF2' && item.quantity >= 3) {
        const priceReduction = 5;
        discount += item.quantity * priceReduction;
        itemOffers.push({
          type: 'BULK_DISCOUNT',
          description: `Bulk purchase discount on Lataffa - $5 off per unit`,
          savings: item.quantity * priceReduction
        });
      }
      
      if (this.hasComboItems(items, 'PF1', 'PF3') && item.code === 'PF3') {
        discount += 10;
        itemOffers.push({
          type: 'COMBO_DISCOUNT',
          description: 'Combo discount - $10 off CK when bought with Cool Water',
          savings: 10
        });
      }
      
      if (item.code === 'PF4') {
        const isValidTimeRange = this.checkLimitedTimeValidity();
        if (isValidTimeRange) {
          const timeDiscount = itemTotal * 0.15;
          discount += timeDiscount;
          itemOffers.push({
            type: 'LIMITED_TIME',
            description: '15% off Armani Code - Limited Time Offer',
            savings: timeDiscount
          });
        }
      }
      
      if (item.code === 'PF5') {
        if (item.quantity >= 4) {
          const tierDiscount = itemTotal * 0.20;
          discount += tierDiscount;
          itemOffers.push({
            type: 'TIERED_DISCOUNT',
            description: '20% off Gucci Bloom - 4 or more units',
            savings: tierDiscount
          });
        } else if (item.quantity >= 2) {
          const tierDiscount = itemTotal * 0.10;
          discount += tierDiscount;
          itemOffers.push({
            type: 'TIERED_DISCOUNT',
            description: '10% off Gucci Bloom - 2-3 units',
            savings: tierDiscount
          });
        }
      }
      
      if (item.code === 'PF6' && this.hasInCart(items, 'PF4')) {
        const seasonalDiscount = itemTotal * 0.25;
        discount += seasonalDiscount;
        itemOffers.push({
          type: 'SEASONAL_DISCOUNT',
          description: '25% off Chanel No. 5 when bought with Armani Code',
          savings: seasonalDiscount
        });
      }

      // Cart-wide percentage discounts
      if (uniqueItems >= 6) {
        const varietyDiscount = itemTotal * 0.15;
        discount += varietyDiscount;
        itemOffers.push({
          type: 'VARIETY_DISCOUNT',
          description: '15% off - Cart has 6 different perfumes',
          savings: varietyDiscount
        });
      } else if (uniqueItems >= 5) {
        const varietyDiscount = itemTotal * 0.10;
        discount += varietyDiscount;
        itemOffers.push({
          type: 'VARIETY_DISCOUNT',
          description: '10% off - Cart has 5 different perfumes',
          savings: varietyDiscount
        });
      }
      
      if (user?.purchaseCount >= 5) {
        const loyaltyDiscount = itemTotal * 0.05;
        discount += loyaltyDiscount;
        itemOffers.push({
          type: 'LOYALTY_DISCOUNT',
          description: '5% off - Loyalty Program Discount',
          savings: loyaltyDiscount
        });
      }

      // Apply cap after all discounts
      const maxDiscount = itemTotal * 0.3;
      const finalDiscount = Math.min(discount, maxDiscount);
      
      if (discount > maxDiscount) {
        itemOffers.push({
          type: 'DISCOUNT_CAP',
          description: 'Maximum 30% discount cap applied',
          savings: maxDiscount - discount
        });
      }
      
      discounts.push(finalDiscount);
      if (itemOffers.length > 0) {
        appliedOffers.push({
          itemCode: item.code,
          itemName: item.name,
          offers: itemOffers
        });
      }
    });
    
    return { discounts, appliedOffers };
  }


  
  checkLimitedTimeValidity() {
   
    const currentDate = new Date();
    const startDate = new Date('2024-01-01'); // Example date
    const endDate = new Date('2024-12-31');   // Example date
    
    return currentDate >= startDate && currentDate <= endDate;
  }
  
  // Check account anniversary
  checkAnniversary(user) {
    if (!user?.createdAt) return false;
    
    const createdAt = new Date(user.createdAt);
    const today = new Date();
    
    return (
      createdAt.getDate() === today.getDate() &&
      createdAt.getMonth() === today.getMonth() &&
      createdAt.getFullYear() !== today.getFullYear()
    );
  }
  
  calculateCartWideDiscounts(subtotal, user = null, cart) {
    let cartDiscount = 0; 
    if (subtotal > 500) {
      cartDiscount += subtotal * 0.05;
    }
    
   
    if (user && this.checkAnniversary(user)) {
      cartDiscount += subtotal * 0.20;
    }
    
    //  Complex loyalty combo
    if (user?.purchaseCount >= 5 && subtotal > 500) {
      cartDiscount += subtotal * 0.02;
    }
    
    return cartDiscount;
  }

  hasComboItems(items, code1, code2) {
    return items.some(item => item.code === code1) && 
           items.some(item => item.code === code2);
  }

  hasInCart(items, code) {
    return items.some(item => item.code === code);
  }
  
  async calculateTotal(req, res) {
    try {
      const { cart, user } = req.body;
      
      if (!cart?.items?.length) {
        return res.status(400).json({ 
          status: false, 
          message: 'Cart is empty' 
        });
      }

      //  discounts based on priority
      const itemDiscounts = this.calculateItemDiscounts(cart.items, user);
      const subtotal = cart.items.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0);
      
      const cartDiscount = this.calculateCartWideDiscounts(subtotal, user, cart);
      const totalItemDiscounts = itemDiscounts.reduce((sum, d) => sum + d, 0);
      const finalDiscount = totalItemDiscounts + cartDiscount;

      
      const itemsWithDiscounts = cart.items.map((item, index) => ({
        ...item,
        discount: itemDiscounts[index],
        finalPrice: (item.price * item.quantity) - itemDiscounts[index]
      }));

      const response = {
        status: true,
        data: {
          items: itemsWithDiscounts,
          subtotal,
          totalDiscount: finalDiscount,
          finalPrice: subtotal - finalDiscount,
          discountBreakdown: {
            itemLevelDiscounts: totalItemDiscounts,
            cartWideDiscounts: cartDiscount,
            isAnniversaryApplied: user ? this.checkAnniversary(user) : false,
            isLoyaltyApplied: user?.purchaseCount >= 5,
            appliedOffers: appliedOffers 
          }
        }
      };

      return res.status(200).json(response);
      
    } catch (error) {
      console.error('Discount calculation error:', error);
      return res.status(500).json({ 
        status: false, 
        message: 'Failed to calculate discounts', 
        error: error.message 
      });
    }
  }
}

export default new DiscountController();