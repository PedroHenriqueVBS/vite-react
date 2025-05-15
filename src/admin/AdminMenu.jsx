import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function AdminMenu({ menu, addMenuItem, removeMenuItem, garcom, setGarcom, numeroCozinha, setNumeroCozinha }) {
  const [category, setCategory] = useState('entradas');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Garantir que temos um menu válido (caso venha undefined ou null)
  const safeMenu = menu || { entradas: [], pratosPrincipais: [], sobremesas: [], bebidas: [] };
  
  // Verificar se numeroCozinha está definido
  useEffect(() => {
    if (!numeroCozinha && garcom) {
      const telefones = {
        Clayton: '5583996985997',
        Thiago: '5583996985997',
        Maciel: '5583996985997'
      };
      setNumeroCozinha(telefones[garcom] || '');
    }
  }, [garcom, numeroCozinha, setNumeroCozinha]);

  // Simplificação da função handleImageChange
  const handleImageChange = (e) => {
    try {
      const file = e.target.files[0];
      if (!file) {
        setImageFile(null);
        setImagePreview('');
        return;
      }
      
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Erro ao processar imagem:", err);
      setError("Erro ao processar a imagem selecionada");
    }
  };

  // Função simplificada para upload
  const uploadImage = async (file) => {
    if (!file) return null;
    
    try {
      // Primeiro criar o preview em base64 como fallback
      const reader = new FileReader();
      const base64Image = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
      
      // Tentar fazer o upload para o servidor
      const formData = new FormData();
      formData.append('image', file);
      
      // Usar apenas base64 por enquanto para evitar problemas
      return base64Image;
      
      /* Comentado para usar apenas base64 enquanto servidor está com problemas
      try {
        const response = await fetch('https://menu-backend-production-350b.up.railway.app/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`Falha no upload: ${response.status}`);
        }
        
        const data = await response.json();
        return data.imageUrl;
      } catch (error) {
        console.warn("Usando base64 como fallback:", error);
        return base64Image;
      }
      */
    } catch (error) {
      console.error("Erro no processamento da imagem:", error);
      return null;
    }
  };

  // Função para adicionar item
  const handleAdd = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (!name || !description || !price) {
        setError("Preencha todos os campos obrigatórios");
        return;
      }
      
      setUploading(true);
      
      // Formatar preço
      let formattedPrice = price.trim();
      if (!/^R\$/.test(formattedPrice)) {
        formattedPrice = 'R$ ' + formattedPrice;
      }
      
      // Processar imagem
      let imageData = '';
      if (imageFile) {
        imageData = await uploadImage(imageFile);
      }
      
      // Adicionar ao menu
      addMenuItem(category, { 
        name, 
        description, 
        price: formattedPrice,
        image: imageData
      });
      
      // Limpar formulário
      setName('');
      setDescription('');
      setPrice('');
      setImageFile(null);
      setImagePreview('');
      
      // Limpar input de arquivo
      const fileInput = document.getElementById('dishImageInput');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error("Erro ao adicionar item:", err);
      setError("Erro ao adicionar item. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-panel">
      <h2>Administração do Cardápio</h2>
      
      {error && (
        <div className="admin-error-message">
          {error}
        </div>
      )}
      
      <div className="admin-form-row">
        <label>Garçom:
          <select value={garcom || 'Clayton'} onChange={e => setGarcom(e.target.value)}>
            <option value="Clayton">Clayton</option>
            <option value="Thiago">Thiago</option>
            <option value="Maciel">Maciel</option>
          </select>
        </label>
        <label>Número da Cozinha:
          <input 
            value={numeroCozinha || ''} 
            readOnly 
            style={{width: 140, backgroundColor: 'var(--dark-grey)'}} 
          />
        </label>
      </div>
      
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
        <div className="admin-form-row">
          <label className="admin-image-upload">
            Imagem do Prato:
            <input 
              type="file" 
              id="dishImageInput"
              accept="image/*" 
              onChange={handleImageChange} 
              className="admin-image-input"
              disabled={uploading}
            />
            <span className="admin-image-note">Imagens menores que 5MB recomendadas</span>
          </label>
        </div>
        
        {imagePreview && (
          <div className="admin-image-preview">
            <img src={imagePreview} alt="Preview" />
            <button 
              type="button" 
              className="admin-clear-image" 
              onClick={() => {
                setImageFile(null);
                setImagePreview('');
                const fileInput = document.getElementById('dishImageInput');
                if (fileInput) fileInput.value = '';
              }}
              disabled={uploading}
            >
              Remover Imagem
            </button>
          </div>
        )}
        
        <button 
          type="submit" 
          className="admin-add-btn" 
          disabled={uploading}
        >
          {uploading ? 'Enviando...' : 'Adicionar Item'}
        </button>
      </form>
      
      <h3>Itens do Cardápio</h3>
      <div className="admin-menu-list">
        {Object.entries(safeMenu).map(([cat, items]) => (
          <div key={cat} className="admin-menu-category">
            <div className="admin-category-title">{cat.charAt(0).toUpperCase() + cat.slice(1)}</div>
            <ul>
              {Array.isArray(items) ? items.map(item => (
                <li key={item.id} className="admin-menu-item">
                  <div className="admin-item-details">
                    <div>
                      <span className="admin-item-name">{item.name}</span>
                      <span className="admin-item-price">{item.price}</span>
                    </div>
                    <div className="admin-item-desc">{item.description}</div>
                    <button 
                      onClick={() => removeMenuItem(cat, item.id)} 
                      className="admin-remove-btn"
                    >
                      Remover
                    </button>
                  </div>
                  {item.image && (
                    <div className="admin-item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                  )}
                </li>
              )) : <li>Nenhum item encontrado</li>}
            </ul>
          </div>
        ))}
      </div>
      <Link to="/" className="admin-back-link">Voltar para o site</Link>
    </div>
  );
}

export default AdminMenu;