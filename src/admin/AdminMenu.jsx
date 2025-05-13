import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function AdminMenu({ menu, addMenuItem, removeMenuItem }) {
  const [category, setCategory] = useState('entradas');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name || !description || !price) return;
    let formattedPrice = price.trim();
    if (!/^R\$/.test(formattedPrice)) {
      formattedPrice = 'R$ ' + formattedPrice;
    }
    addMenuItem(category, { name, description, price: formattedPrice });
    setName(''); setDescription(''); setPrice('');
  };

  return (
    <div className="admin-panel">
      <h2>Administração do Cardápio</h2>
      <form className="admin-form" onSubmit={handleAdd}>
        <div className="admin-form-row">
          <label>Categoria:
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="entradas">Entradas</option>
              <option value="pratosPrincipais">Pratos Principais</option>
              <option value="sobremesas">Sobremesas</option>
              <option value="bebidas">Bebidas</option>
            </select>
          </label>
          <label>Nome:
            <input value={name} onChange={e => setName(e.target.value)} required />
          </label>
        </div>
        <div className="admin-form-row">
          <label>Descrição:
            <input value={description} onChange={e => setDescription(e.target.value)} required />
          </label>
          <label>Preço:
            <input value={price} onChange={e => setPrice(e.target.value)} required placeholder="R$ 00,00" />
          </label>
        </div>
        <button type="submit" className="admin-add-btn">Adicionar Item</button>
      </form>
      <h3>Itens do Cardápio</h3>
      <div className="admin-menu-list">
        {Object.entries(menu).map(([cat, items]) => (
          <div key={cat} className="admin-menu-category">
            <div className="admin-category-title">{cat.charAt(0).toUpperCase() + cat.slice(1)}</div>
            <ul>
              {items.map(item => (
                <li key={item.id} className="admin-menu-item">
                  <div>
                    <span className="admin-item-name">{item.name}</span>
                    <span className="admin-item-price">{item.price}</span>
                  </div>
                  <div className="admin-item-desc">{item.description}</div>
                  <button onClick={() => removeMenuItem(cat, item.id)} className="admin-remove-btn">Remover</button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Link to="/" className="admin-back-link">Voltar para o site</Link>
    </div>
  );
}

export default AdminMenu;