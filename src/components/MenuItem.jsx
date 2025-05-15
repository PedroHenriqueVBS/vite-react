import React from 'react';

const MenuItem = ({ item, onAddToCart, category }) => (
  <div className="menu-item">
    {item.image && (
      <div className="menu-item-image">
        <img src={item.image} alt={item.name} />
      </div>
    )}
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
