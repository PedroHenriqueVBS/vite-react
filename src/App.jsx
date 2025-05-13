import { useState } from 'react';
import './App.css';
import MenuSection from './components/MenuSection';
import Cart from './components/Cart';
import { calculateTotal } from './utils/cartUtils';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function AdminMenu({ menu, addMenuItem, removeMenuItem }) {
  const [category, setCategory] = useState('entradas');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name || !description || !price) return;
    // Garante que o valor já seja inserido como BRL
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

function App() {
  const menuItems = {
    entradas: [
      { id: 1, name: 'Bruschetta Tradicional', description: 'Pão italiano tostado com tomates, alho e manjericão', price: 'R$ 18,90' },
      { id: 2, name: 'Carpaccio', description: 'Finas fatias de carne com molho especial e parmesão', price: 'R$ 29,90' },
      { id: 3, name: 'Camarão Empanado', description: 'Camarões empanados com molho tártaro', price: 'R$ 32,90' },
    ],
    pratosPrincipais: [
      { id: 1, name: 'Filé Mignon ao Molho Madeira', description: 'Filé mignon grelhado coberto com molho madeira e cogumelos', price: 'R$ 62,90' },
      { id: 2, name: 'Risoto de Camarão', description: 'Arroz arbóreo cremoso com camarões e ervas finas', price: 'R$ 58,90' },
      { id: 3, name: 'Feijoada Completa', description: 'Tradicional feijoada com acompanhamentos', price: 'R$ 49,90' },
      { id: 4, name: 'Salmão Grelhado', description: 'Filé de salmão grelhado com molho de ervas e legumes', price: 'R$ 64,90' },
    ],
    sobremesas: [
      { id: 1, name: 'Petit Gateau', description: 'Bolo quente de chocolate com sorvete de creme', price: 'R$ 22,90' },
      { id: 2, name: 'Pudim de Leite', description: 'Pudim caseiro com calda de caramelo', price: 'R$ 16,90' },
      { id: 3, name: 'Cheesecake', description: 'Torta de cream cheese com calda de frutas vermelhas', price: 'R$ 19,90' },
    ],
    bebidas: [
      { id: 1, name: 'Água Mineral', description: 'Com ou sem gás (500ml)', price: 'R$ 6,90' },
      { id: 2, name: 'Refrigerante', description: 'Diversos sabores (lata)', price: 'R$ 7,90' },
      { id: 3, name: 'Suco Natural', description: 'Laranja, abacaxi, maracujá ou limão', price: 'R$ 12,90' },
      { id: 4, name: 'Taça de Vinho', description: 'Tinto, branco ou rosé', price: 'R$ 22,90' },
    ]
  };

  // Estado para gerenciar os itens no carrinho
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  // Estado para gerenciar os itens do menu (dinâmico)
  const [menu, setMenu] = useState(menuItems);

  // Função para adicionar item ao carrinho
  const addToCart = (item, category) => {
    const existingItem = cartItems.find(
      cartItem => cartItem.id === item.id && cartItem.category === category
    );

    if (existingItem) {
      setCartItems(
        cartItems.map(cartItem =>
          cartItem.id === item.id && cartItem.category === category
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1, category }]);
    }
    setIsCartOpen(true);
  };

  // Função para remover item do carrinho
  const removeFromCart = (id, category) => {
    setCartItems(cartItems.filter(
      item => !(item.id === id && item.category === category)
    ));
  };

  // Função para ajustar quantidade do item no carrinho
  const adjustQuantity = (id, category, amount) => {
    setCartItems(
      cartItems.map(item => {
        if (item.id === id && item.category === category) {
          const newQuantity = item.quantity + amount;
          return newQuantity > 0 
            ? { ...item, quantity: newQuantity }
            : null;
        }
        return item;
      }).filter(Boolean)
    );
  };

  // Função para limpar o carrinho
  const clearCart = () => {
    setCartItems([]);
  };

  // Função para montar mensagem do pedido para o WhatsApp
  const buildOrderMessage = () => {
    if (cartItems.length === 0) return '';
    let message = '*Novo pedido para a cozinha*%0A';
    cartItems.forEach(item => {
      message += `- ${item.quantity}x ${item.name} (${item.category}) - ${item.price}%0A`;
    });
    message += `%0ATotal: R$ ${calculateTotal(cartItems)}`;
    return message;
  };

  // Função para confirmar pedido e redirecionar para WhatsApp
  const handleConfirmOrder = () => {
    const phone = '5583996985997'; // Substitua pelo número da cozinha (com DDI e DDD, sem +)
    const message = buildOrderMessage();
    const url = `https://wa.me/${phone}?text=${message}`;
    window.open(url, '_blank');
  };

  // Rota para adicionar item ao menu
  const addMenuItem = (category, newItem) => {
    setMenu(prev => ({
      ...prev,
      [category]: [...prev[category], { ...newItem, id: Date.now() }]
    }));
  };

  // Rota para remover item do menu
  const removeMenuItem = (category, id) => {
    setMenu(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item.id !== id)
    }));
  };

  return (
    <Router>
      <nav style={{ background: 'var(--pastel-blue)', padding: 8, textAlign: 'center' }}>
        <Link to="/" style={{ marginRight: 16, color: 'var(--pastel-dark-blue)', fontWeight: 600 }}>Cardápio</Link>
        {/* <Link to="/admin" style={{ color: 'var(--pastel-dark-blue)', fontWeight: 600 }}>Admin</Link> */}
      </nav>
      <Routes>
        <Route path="/" element={
          <div className="App">
            <header className="restaurant-header">
              <h1>Boteco Bate Papo</h1>
              <p>Gastronomia de qualidade desde 1998</p>
              <button 
                className="cart-button"
                onClick={() => setIsCartOpen(!isCartOpen)}
              >
                🛒 Carrinho ({cartItems.length === 0 ? '0' : cartItems.reduce((acc, item) => acc + item.quantity, 0)})
              </button>
            </header>
            <Cart 
              cartItems={cartItems}
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              onAdjustQuantity={adjustQuantity}
              onRemove={removeFromCart}
              onClear={clearCart}
              onConfirm={handleConfirmOrder}
              calculateTotal={() => calculateTotal(cartItems)}
            />
            <main className="menu-container">
              <MenuSection 
                title="Entradas" 
                items={menu.entradas} 
                onAddToCart={addToCart} 
                category="entradas" 
              />
              <MenuSection 
                title="Pratos Principais" 
                items={menu.pratosPrincipais} 
                onAddToCart={addToCart} 
                category="pratosPrincipais" 
              />
              <MenuSection 
                title="Sobremesas" 
                items={menu.sobremesas} 
                onAddToCart={addToCart} 
                category="sobremesas" 
              />
              <MenuSection 
                title="Bebidas" 
                items={menu.bebidas} 
                onAddToCart={addToCart} 
                category="bebidas" 
              />
            </main>
          </div>
        } />
        <Route path="/admin" element={<AdminMenu menu={menu} addMenuItem={addMenuItem} removeMenuItem={removeMenuItem} />} />
      </Routes>
    </Router>
  );
}

export default App;
