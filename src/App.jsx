import { useState } from 'react';
import './App.css';
import MenuSection from './components/MenuSection';
import Cart from './components/Cart';
import { calculateTotal } from './utils/cartUtils';

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
          items={menuItems.entradas} 
          onAddToCart={addToCart} 
          category="entradas" 
        />
        <MenuSection 
          title="Pratos Principais" 
          items={menuItems.pratosPrincipais} 
          onAddToCart={addToCart} 
          category="pratosPrincipais" 
        />
        <MenuSection 
          title="Sobremesas" 
          items={menuItems.sobremesas} 
          onAddToCart={addToCart} 
          category="sobremesas" 
        />
        <MenuSection 
          title="Bebidas" 
          items={menuItems.bebidas} 
          onAddToCart={addToCart} 
          category="bebidas" 
        />
      </main>
    </div>
  )
}

export default App
