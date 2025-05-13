export const calculateTotal = (cartItems) => {
  return cartItems.reduce((total, item) => {
    const price = parseFloat(item.price.replace('R$ ', '').replace(',', '.'));
    return total + price * item.quantity;
  }, 0).toFixed(2).replace('.', ',');
};
