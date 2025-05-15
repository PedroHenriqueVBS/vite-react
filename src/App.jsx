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
  // Estado para o garçom ativo
  const [garcom, setGarcom] = useState('Clayton');

  // Carrega o menu do backend ao iniciar
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        console.log('Carregando menu...');
        const res = await fetch('https://menu-backend-production-350b.up.railway.app/api/menu');
        
        if (!res.ok) {
          throw new Error(`Erro ao carregar menu: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('Menu carregado:', data);
        setMenu(data);
      } catch (error) {
        console.error('Erro ao carregar menu:', error);
        // Dados de menu de fallback caso o backend falhe
        setMenu({
          entradas: [
            { id: 1, name: "Bruschetta Tradicional", description: "Pão italiano tostado com tomates, alho e manjericão", price: "R$ 18,90" },
            { id: 2, name: "Carpaccio", description: "Finas fatias de carne com molho especial e parmesão", price: "R$ 29,90" }
          ],
          pratosPrincipais: [
            { id: 1, name: "Filé Mignon ao Molho Madeira", description: "Filé mignon grelhado com molho madeira", price: "R$ 62,90" }
          ],
          sobremesas: [
            { id: 1, name: "Petit Gateau", description: "Bolo quente de chocolate com sorvete", price: "R$ 22,90" }
          ],
          bebidas: [
            { id: 1, name: "Água Mineral", description: "Com ou sem gás (500ml)", price: "R$ 6,90" }
          ]
        });
      }
    };

    fetchMenu();
  }, []);

  // Atualiza o menu no backend sempre que mudar
  const updateMenuOnServer = (newMenu) => {
    fetch('https://menu-backend-production-350b.up.railway.app/api/menu', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMenu)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Falha ao atualizar o menu');
      }
      return response.json();
    })
    .then(data => {
      console.log('Menu atualizado com sucesso');
    })
    .catch(error => {
      console.error('Erro ao atualizar menu:', error);
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
        <Link to="/admin" style={{ color: 'var(--pastel-dark-blue)', fontWeight: 600 }}>Admin</Link>
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
              {menu ? (
                <>
                  {menu.entradas && menu.entradas.length > 0 && (
                    <MenuSection 
                      title="Entradas" 
                      items={menu.entradas} 
                      onAddToCart={addToCart} 
                      category="entradas" 
                    />
                  )}
                  {menu.pratosPrincipais && menu.pratosPrincipais.length > 0 && (
                    <MenuSection 
                      title="Pratos Principais" 
                      items={menu.pratosPrincipais} 
                      onAddToCart={addToCart} 
                      category="pratosPrincipais" 
                    />
                  )}
                  {menu.sobremesas && menu.sobremesas.length > 0 && (
                    <MenuSection 
                      title="Sobremesas" 
                      items={menu.sobremesas} 
                      onAddToCart={addToCart} 
                      category="sobremesas" 
                    />
                  )}
                  {menu.bebidas && menu.bebidas.length > 0 && (
                    <MenuSection 
                      title="Bebidas" 
                      items={menu.bebidas} 
                      onAddToCart={addToCart} 
                      category="bebidas" 
                    />
                  )}
                </>
              ) : (
                <div className="loading-menu">
                  <p>Carregando cardápio...</p>
                </div>
              )}
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
          />
        ) : <div className="loading-admin">Carregando painel administrativo...</div>} />
      </Routes>
    </Router>
  );
}

export default App;
