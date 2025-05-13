import React from 'react';
import MenuItem from './MenuItem';

const MenuSection = ({ title, items, onAddToCart, category }) => (
  <section className="menu-section">
    <h2>{title}</h2>
    <div className="menu-items">
      {items.map(item => (
        <MenuItem key={item.id} item={item} onAddToCart={onAddToCart} category={category} />
      ))}
    </div>
  </section>
);

export default MenuSection;
