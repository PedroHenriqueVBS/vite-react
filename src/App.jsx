import { useState, useEffect } from 'react';
import './App.css';
import MenuSection from './components/MenuSection';
import Cart from './components/Cart';
import { calculateTotal } from './utils/cartUtils';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AdminMenu from './admin/AdminMenu';

function App() {
  // Estado para gerenciar os itens no carrinho
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  // Estado para gerenciar os itens do menu (dinâmico)
  const [menu, setMenu] = useState(null);
  // Estado para identificar a mesa
  const [selectedTable, setSelectedTable] = useState('');
  // Estado para o garçom ativo e número da cozinha
  const [garcom, setGarcom] = useState('Clayton');
  const [numeroCozinha, setNumeroCozinha] = useState('1');

  // Carrega o menu do backend ao iniciar
  useEffect(() => {
    fetch('https://menu-backend-production-350b.up.railway.app/api/menu')
      .then(res => res.json())
      .then(data => setMenu(data));
  }, []);

  // Atualiza o número da cozinha baseado no garçom
  useEffect(() => {
    if (garcom === 'Clayton') setNumeroCozinha('1');
    else if (garcom === 'Thiago') setNumeroCozinha('2');
    else if (garcom === 'Maciel') setNumeroCozinha('3');
  }, [garcom]);

  // Atualiza o menu no backend sempre que mudar
  const updateMenuOnServer = (newMenu) => {
    fetch('https://menu-backend-production-350b.up.railway.app/api/menu', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMenu)
    });
  };

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
    let message = `*Novo pedido para a cozinha*%0AMesa: ${selectedTable || 'NÃO INFORMADA'}%0A`;
    cartItems.forEach(item => {
      message += `- ${item.quantity}x ${item.name} (${item.category}) - ${item.price}%0A`;
    });
    message += `%0ATotal: R$ ${calculateTotal(cartItems)}`;
    return message;
  };

  // Função para confirmar pedido e redirecionar para WhatsApp
  const handleConfirmOrder = () => {
    // Telefones dos garçons
    const telefones = {
      Clayton: '5583996985997',
      Thiago: '5583996985997',
      Maciel: '5583996985997'
    };
    const phone = telefones[garcom] || '5583996985997';
    const message = buildOrderMessage();
    const url = `https://wa.me/${phone}?text=${message}`;
    window.open(url, '_blank');
  };

  // Rota para adicionar item ao menu
  const addMenuItem = (category, newItem) => {
    setMenu(prev => {
      const updated = {
        ...prev,
        [category]: [...prev[category], { ...newItem, id: Date.now() }]
      };
      updateMenuOnServer(updated);
      return updated;
    });
  };

  // Rota para remover item do menu
  const removeMenuItem = (category, id) => {
    setMenu(prev => {
      const updated = {
        ...prev,
        [category]: prev[category].filter(item => item.id !== id)
      };
      updateMenuOnServer(updated);
      return updated;
    });
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
              selectedTable={selectedTable}
              setSelectedTable={setSelectedTable}
            />
            <main className="menu-container">
              {menu && <MenuSection 
                title="Entradas" 
                items={menu.entradas} 
                onAddToCart={addToCart} 
                category="entradas" 
              />}
              {menu && <MenuSection 
                title="Pratos Principais" 
                items={menu.pratosPrincipais} 
                onAddToCart={addToCart} 
                category="pratosPrincipais" 
              />}
              {menu && <MenuSection 
                title="Sobremesas" 
                items={menu.sobremesas} 
                onAddToCart={addToCart} 
                category="sobremesas" 
              />}
              {menu && <MenuSection 
                title="Bebidas" 
                items={menu.bebidas} 
                onAddToCart={addToCart} 
                category="bebidas" 
              />}
            </main>
          </div>
        } />
        <Route path="/admin" element={menu ? (
          <AdminMenu 
            menu={menu} 
            addMenuItem={addMenuItem} 
            removeMenuItem={removeMenuItem}
            garcom={garcom}
            setGarcom={setGarcom}
            numeroCozinha={numeroCozinha}
            setNumeroCozinha={setNumeroCozinha}
          />
        ) : null} />
      </Routes>
    </Router>
  );
}

export default App;
