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

  // Mapeamento dos garçons para seus números de telefone
  const telefones = {
    Clayton: '5583996985997',
    Thiago: '5583996985997',
    Maciel: '5583996985997'
  };

  // Atualizar o número da cozinha quando mudar o garçom
  useEffect(() => {
    setNumeroCozinha(telefones[garcom] || '');
  }, [garcom, setNumeroCozinha]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImageFile(null);
      setImagePreview('');
      return;
    }
    
    // Validar o tipo de arquivo
    if (!file.type.match('image.*')) {
      alert('Por favor, selecione uma imagem válida');
      e.target.value = '';
      return;
    }
    
    setImageFile(file);
    
    // Criar preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Função para fazer upload da imagem para o backend
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    setUploading(true);
    
    try {
      const response = await fetch('https://menu-backend-production-350b.up.railway.app/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Falha ao enviar imagem');
      }
      
      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      alert('Falha ao enviar imagem. Tente novamente.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name || !description || !price) return;
    
    // Desabilitar botão durante o upload
    setUploading(true);
    
    let formattedPrice = price.trim();
    if (!/^R\$/.test(formattedPrice)) {
      formattedPrice = 'R$ ' + formattedPrice;
    }
    
    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
          setUploading(false);
          return; // Interrompe se o upload falhar
        }
      }

      // Adicionar item com a URL da imagem
      addMenuItem(category, { 
        name, 
        description, 
        price: formattedPrice,
        image: imageUrl // URL da imagem no servidor
      });
      
      // Limpar campos
      setName(''); 
      setDescription(''); 
      setPrice('');
      setImageFile(null);
      setImagePreview('');
      
      // Limpar input de arquivo
      const fileInput = document.getElementById('dishImageInput');
      if (fileInput) fileInput.value = '';
      
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-panel">
      <h2>Administração do Cardápio</h2>
      <div className="admin-form-row">
        <label>Garçom:
          <select value={garcom} onChange={e => setGarcom(e.target.value)}>
            <option value="Clayton">Clayton</option>
            <option value="Thiago">Thiago</option>
            <option value="Maciel">Maciel</option>
          </select>
        </label>
        <label>Número da Cozinha:
          <input 
            value={numeroCozinha} 
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
        {Object.entries(menu).map(([cat, items]) => (
          <div key={cat} className="admin-menu-category">
            <div className="admin-category-title">{cat.charAt(0).toUpperCase() + cat.slice(1)}</div>
            <ul>
              {items.map(item => (
                <li key={item.id} className="admin-menu-item">
                  <div className="admin-item-details">
                    <div>
                      <span className="admin-item-name">{item.name}</span>
                      <span className="admin-item-price">{item.price}</span>
                    </div>
                    <div className="admin-item-desc">{item.description}</div>
                    <button onClick={() => removeMenuItem(cat, item.id)} className="admin-remove-btn">Remover</button>
                  </div>
                  {item.image && (
                    <div className="admin-item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                  )}
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