import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as api from '../api';

export default function IncomingForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const todayStr = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    stock: '',
    unit: '',
    type: 'asset',
    source: '',
    vendor: '',
    notes: '',
    date: todayStr,
  });
  const [fundingSources, setFundingSources] = useState([]);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    api.getCategories().then(data => {
      setCategories(data);
      if (data.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: data[0].name }));
      }
    }).catch(err => console.error('Error fetching categories:', err));

    api.getUnits().then(data => {
      setUnits(data);
      if (data.length > 0 && !formData.unit) {
        setFormData(prev => ({ ...prev, unit: data[0].name }));
      }
    }).catch(err => console.error('Error fetching units:', err));
    
    // Fetch funding sources
    api.getFundingSources().then(data => {
      setFundingSources(data);
      if (data.length > 0 && !formData.source) {
        setFormData(prev => ({ ...prev, source: data[0].name }));
      }
    }).catch(err => console.error('Error fetching funding sources:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const existingInventory = await api.fetchInventory();
      const duplicate = existingInventory.find(item => item.name.toLowerCase() === formData.name.toLowerCase());
      
      if (duplicate) {
        setError('Nama barang sudah ada');
        return;
      }
      
      const stockQty = parseInt(formData.stock);
      if (isNaN(stockQty) || stockQty < 0) {
        setError('Jumlah stok tidak valid');
        return;
      }
      const newItem = {
        id: `${formData.category.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`,
        name: formData.name,
        category: formData.category,
        stock: stockQty,
        status: stockQty > 20 ? 'Tersedia' : stockQty > 5 ? 'Hampir Habis' : stockQty === 0 ? 'Habis' : 'Kritis',
        type: formData.type,
        unit: formData.unit,
      };

      await api.addInventory(newItem);
      const d = formData.date ? new Date(formData.date + 'T12:00:00') : new Date();
      const formattedDate = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      const userName = user ? `${user.first_name} ${user.last_name}`.trim() : 'Admin';
      await api.addTransaction({
        type: 'Masuk',
        item: `${stockQty} ${formData.name}`,
        date: formattedDate,
        user_name: userName,
        category: 'Restock',
        item_id: newItem.id,
        quantity: stockQty,
      });
      
      addToast('Barang berhasil ditambahkan!', 'success');
      setFormData({
        name: '',
        category: categories.length > 0 ? categories[0].name : '',
        stock: '',
        unit: units.length > 0 ? units[0].name : '',
        type: 'asset',
        source: 'BOS',
        vendor: '',
        notes: '',
      });
    } catch (err) {
      console.error('Error:', err);
      addToast('Gagal menambah barang', 'error');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-h1 text-h1 text-primary">Form Pemasukan Barang</h2>
        <p className="text-slate-500 mt-1">Tambah stok barang baru atau existing ke dalam inventaris.</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Barang</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="Masukkan nama barang"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            {error && (
              <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal</label>
            <input
              type="date"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Kategori</label>
              <select
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                {categories.map(cat => <option key={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Jumlah Stok</label>
              <input
                type="number"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="0"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Satuan</label>
              {units.length > 0 ? (
                <select
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                >
                  {units.map(unit => <option key={unit.id}>{unit.name}</option>)}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="Unit, pcs, box, dll"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Barang</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="type" 
                    value="asset" 
                    checked={formData.type === 'asset'} 
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  />
                  <span className="text-sm">Aset</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="type" 
                    value="consumable" 
                    checked={formData.type === 'consumable'} 
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  />
                  <span className="text-sm">Habis Pakai</span>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
<div>
  <label className="block text-sm font-semibold text-slate-700 mb-2">Sumber Dana</label>
  <select
    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm"
    value={formData.source}
    onChange={(e) => setFormData({...formData, source: e.target.value})}
  >
    <option value="">-- Pilih Sumber Dana --</option>
    {fundingSources.map(source => <option key={source.id}>{source.name}</option>)}
  </select>
</div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Vendor/Supplier</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="Nama vendor"
                value={formData.vendor}
                onChange={(e) => setFormData({...formData, vendor: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Catatan</label>
            <textarea
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              rows="3"
              placeholder="Catatan tambahan..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            ></textarea>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="flex-1 bg-primary text-white py-2.5 rounded-lg font-bold text-sm hover:brightness-110 transition-all"
            >
              Simpan Barang
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 bg-white border border-slate-200 py-2.5 rounded-lg font-bold text-sm text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
