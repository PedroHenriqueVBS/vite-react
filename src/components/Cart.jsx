import React from 'react';

const Cart = ({ cartItems, isOpen, onClose, onAdjustQuantity, onRemove, onClear, onConfirm, calculateTotal }) => {
  if (!isOpen) return null;
  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Seu Pedido</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      {cartItems.length === 0 ? (
        <p className="empty-cart">Seu carrinho está vazio</p>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => (
              <div className="cart-item" key={`${item.category}-${item.id}`}>
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <p className="item-price">{item.price}</p>
                </div>
                <div className="quantity-controls">
                  <button onClick={() => onAdjustQuantity(item.id, item.category, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => onAdjustQuantity(item.id, item.category, 1)}>+</button>
                  <button 
                    className="remove-button"
                    onClick={() => onRemove(item.id, item.category)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-footer">
            <div className="total">
              <span>Total:</span>
              <span className="total-price">R$ {calculateTotal()}</span>
            </div>
            <div className="cart-actions">
              <button className="clear-cart" onClick={onClear}>Limpar Pedido</button>
              <button className="confirm-order" onClick={onConfirm}>Confirmar Pedido</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
