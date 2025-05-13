import { useState } from 'react';
import './App.css'

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

  // Calcula o total do carrinho
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price.replace('R$ ', '').replace(',', '.'));
      return total + price * item.quantity;
    }, 0).toFixed(2).replace('.', ',');;
  };

  // Função para limpar o carrinho
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <div className="App">
      <header className="restaurant-header">
        <h1>Restaurante Sabor & Arte</h1>
        <p>Gastronomia de qualidade desde 1998</p>
        <button 
          className="cart-button"
          onClick={() => setIsCartOpen(!isCartOpen)}
        >
          🛒 Carrinho ({cartItems.length === 0 ? '0' : cartItems.reduce((acc, item) => acc + item.quantity, 0)})
        </button>
      </header>
      
      {isCartOpen && (
        <div className="cart-container">
          <div className="cart-header">
            <h2>Seu Pedido</h2>
            <button className="close-button" onClick={() => setIsCartOpen(false)}>×</button>
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
                      <button onClick={() => adjustQuantity(item.id, item.category, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => adjustQuantity(item.id, item.category, 1)}>+</button>
                      <button 
                        className="remove-button"
                        onClick={() => removeFromCart(item.id, item.category)}
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
                  <button className="clear-cart" onClick={clearCart}>Limpar Pedido</button>
                  <button className="confirm-order">Confirmar Pedido</button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      
      <main className="menu-container">
        <section className="menu-section">
          <h2>Entradas</h2>
          <div className="menu-items">
            {menuItems.entradas.map(item => (
              <div className="menu-item" key={item.id}>
                <div className="menu-item-header">
                  <h3>{item.name}</h3>
                  <span className="price">{item.price}</span>
                </div>
                <p className="description">{item.description}</p>
                <button 
                  className="add-to-cart-button"
                  onClick={() => addToCart(item, 'entradas')}
                >
                  Adicionar ao Pedido
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="menu-section">
          <h2>Pratos Principais</h2>
          <div className="menu-items">
            {menuItems.pratosPrincipais.map(item => (
              <div className="menu-item" key={item.id}>
                <div className="menu-item-header">
                  <h3>{item.name}</h3>
                  <span className="price">{item.price}</span>
                </div>
                <p className="description">{item.description}</p>
                <button 
                  className="add-to-cart-button"
                  onClick={() => addToCart(item, 'pratosPrincipais')}
                >
                  Adicionar ao Pedido
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="menu-section">
          <h2>Sobremesas</h2>
          <div className="menu-items">
            {menuItems.sobremesas.map(item => (
              <div className="menu-item" key={item.id}>
                <div className="menu-item-header">
                  <h3>{item.name}</h3>
                  <span className="price">{item.price}</span>
                </div>
                <p className="description">{item.description}</p>
                <button 
                  className="add-to-cart-button"
                  onClick={() => addToCart(item, 'sobremesas')}
                >
                  Adicionar ao Pedido
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="menu-section">
          <h2>Bebidas</h2>
          <div className="menu-items">
            {menuItems.bebidas.map(item => (
              <div className="menu-item" key={item.id}>
                <div className="menu-item-header">
                  <h3>{item.name}</h3>
                  <span className="price">{item.price}</span>
                </div>
                <p className="description">{item.description}</p>
                <button 
                  className="add-to-cart-button"
                  onClick={() => addToCart(item, 'bebidas')}
                >
                  Adicionar ao Pedido
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
