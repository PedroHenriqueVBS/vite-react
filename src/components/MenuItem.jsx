import React from 'react';

const MenuItem = ({ item, onAddToCart, category }) => (
  <div className="menu-item">
    <div className="menu-item-header">
      <h3>{item.name}</h3>
      <span className="price">{item.price}</span>
    </div>
    <p className="description">{item.description}</p>
    <button 
      className="add-to-cart-button"
      onClick={() => onAddToCart(item, category)}
    >
      Adicionar ao Pedido
    </button>
  </div>
);

export default MenuItem;
