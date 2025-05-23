import { useState, useEffect } from 'react';
import './App.css';
import MenuSection from './components/MenuSection';
import Cart from './components/Cart';
import { calculateTotal } from './utils/cartUtils';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AdminMenu from './admin/AdminMenu';

// Menu de fallback para quando o backend não estiver disponível
const FALLBACK_MENU = {
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
};

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
  // Estado para o número da cozinha (telefone)
  const [numeroCozinha, setNumeroCozinha] = useState('');
  // Estado para o modo offline
  const [isOffline, setIsOffline] = useState(false);
  // Estado para indicar carregamento
  const [loadingMenu, setLoadingMenu] = useState(true);
  
  // Carrega o menu do backend ao iniciar
  useEffect(() => {
    const fetchMenu = async () => {
      setLoadingMenu(true);
      
      // Implementar retry com backoff exponencial
      const fetchWithRetry = async (url, options, maxRetries = 3) => {
        let retries = 0;
        
        while (retries < maxRetries) {
          try {
            const response = await fetch(url, options);
            
            if (response.ok) {
              return response;
            } else if (response.status === 502) {
              // Bad Gateway - esperar e tentar novamente
              console.log(`Tentativa ${retries + 1} falhou com erro 502. Tentando novamente...`);
            } else {
              // Outros erros - lançar exceção
              throw new Error(`Erro HTTP: ${response.status}`);
            }
          } catch (error) {
            console.error(`Erro na tentativa ${retries + 1}:`, error);
            
            if (retries === maxRetries - 1) {
              throw error; // Re-lançar na última tentativa
            }
          }
          
          // Esperar antes de tentar novamente (backoff exponencial)
          const delay = Math.pow(2, retries) * 1000;
          console.log(`Aguardando ${delay}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          retries++;
        }
      };
      
      try {
        console.log('Carregando menu do backend...');
        
        // Tentar primeiro o endpoint de health para verificar se o servidor está online
        try {
          await fetch('https://menu-backend-production-350b.up.railway.app/health');
          console.log('Servidor respondendo ao healthcheck');
        } catch (healthError) {
          console.warn('Servidor não está respondendo ao healthcheck:', healthError);
        }
        
        // Tentar carregar o menu com retry
        const response = await fetchWithRetry(
          'https://menu-backend-production-350b.up.railway.app/api/menu',
          {
            headers: { 'Accept': 'application/json' },
            mode: 'cors'
          }
        );
        
        const data = await response.json();
        console.log('Menu carregado com sucesso');
        setMenu(data);
        setIsOffline(false);
      } catch (error) {
        console.error('Erro ao carregar menu após tentativas:', error);
        setMenu(FALLBACK_MENU);
        console.log('Usando menu de fallback');
        setIsOffline(true);
      } finally {
        setLoadingMenu(false);
      }
    };
    
    fetchMenu();
  }, []);
  
  // Atualiza o menu no backend sempre que mudar
  const updateMenuOnServer = (newMenu) => {
    if (isOffline) {
      console.log('Modo offline: alterações não serão salvas no servidor');
      return;
    }
    
    fetch('https://menu-backend-production-350b.up.railway.app/api/menu', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMenu)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erro ao atualizar menu: ${response.status}`);
      }
      return response.json();
    })
    .then(() => {
      console.log('Menu atualizado com sucesso no servidor');
    })
    .catch(error => {
      console.error('Erro ao atualizar menu no servidor:', error);
      setIsOffline(true);
      alert('Não foi possível conectar ao servidor. Modo offline ativado.');
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
      <nav style={{ 
        background: 'var(--dark-grey)', 
        padding: '12px', 
        textAlign: 'center',
        position: 'relative'
      }}>
        <Link to="/" style={{ marginRight: 16, color: 'var(--accent-orange)', fontWeight: 600 }}>Cardápio</Link>
        <Link to="/admin" style={{ color: 'var(--accent-orange)', fontWeight: 600 }}>Admin</Link>
        
        {isOffline && (
          <div style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#ff5252',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <span>Modo Offline</span>
          </div>
        )}
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
            
            {isOffline && (
              <div className="offline-warning">
                Você está no modo offline. Algumas funcionalidades podem estar indisponíveis.
              </div>
            )}
            
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
              {loadingMenu ? (
                <div className="loading-menu">
                  <p>Carregando cardápio...</p>
                </div>
              ) : menu ? (
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
                <div className="error-menu">
                  <p>Erro ao carregar cardápio. Por favor, atualize a página.</p>
                </div>
              )}
            </main>
          </div>
        } />
        <Route path="/admin" element={
          <div className="admin-container">
            {loadingMenu ? (
              <div className="loading-admin">
                <p>Carregando painel administrativo...</p>
              </div>
            ) : (
              <AdminMenu 
                menu={menu || FALLBACK_MENU} // Sempre fornecer um menu válido
                addMenuItem={addMenuItem} 
                removeMenuItem={removeMenuItem}
                garcom={garcom}
                setGarcom={setGarcom}
                numeroCozinha={numeroCozinha || ''} // Garantir valor default
                setNumeroCozinha={setNumeroCozinha}
              />
            )}
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
