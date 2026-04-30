import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api';

export default function IncomingForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Elektronik',
    stock: '',
    type: 'asset',
    source: 'BOS',
    vendor: '',
    notes: '',
  });

  const categories = ['Elektronik', 'Mebel', 'Alat Olahraga', 'Buku & Pustaka', 'Laboratorium', 'Alat Tulis Kantor'];
  const sources = ['BOS', 'Hibah', 'APBD', 'Komite Sekolah', 'Lainnya'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newItem = {
        id: `${formData.category.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`,
        name: formData.name,
        category: formData.category,
        stock: parseInt(formData.stock),
        status: parseInt(formData.stock) > 20 ? 'Tersedia' : parseInt(formData.stock) > 5 ? 'Hampir Habis' : parseInt(formData.stock) === 0 ? 'Habis' : 'Kritis',
        type: formData.type,
      };

      await api.addInventory(newItem);
      await api.addTransaction({
        type: 'Masuk',
        item: `${formData.stock} ${formData.name}`,
        date: 'Baru Saja',
        user_name: 'Admin',
        category: 'Restock',
      });
      
      alert('Barang berhasil ditambahkan!');
      navigate('/inventory');
    } catch (err) {
      console.error('Error:', err);
      alert('Gagal menambah barang');
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Kategori</label>
              <select
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                {categories.map(cat => <option key={cat}>{cat}</option>)}
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

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Barang</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="type" value="asset" checked={formData.type === 'asset'} onChange={(e) => setFormData({...formData, type: e.target.value})}/>
                <span className="text-sm">Aset (Dapat Dipinjam)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="type" value="consumable" checked={formData.type === 'consumable'} onChange={(e) => setFormData({...formData, type: e.target.value})}/>
                <span className="text-sm">Barang Habis Pakai</span>
              </label>
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
                {sources.map(s => <option key={s}>{s}</option>)}
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
