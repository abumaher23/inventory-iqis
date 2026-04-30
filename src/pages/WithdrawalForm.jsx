import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api';

export default function WithdrawalForm() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [formData, setFormData] = useState({
    itemId: '',
    quantity: '',
    department: '',
    reason: '',
    notes: '',
  });

  useEffect(() => {
    api.fetchInventory().then(data => setInventory(data)).catch(console.error);
  }, []);

  const consumables = inventory.filter(item => item.type === 'consumable' || item.category === 'Alat Tulis Kantor');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const item = inventory.find(i => i.id === formData.itemId);
      if (!item) return alert('Barang tidak ditemukan');

      const newStock = item.stock - parseInt(formData.quantity);
      const updatedItem = {
        ...item,
        stock: newStock,
        status: newStock === 0 ? 'Habis' : newStock <= 3 ? 'Kritis' : newStock <= 10 ? 'Hampir Habis' : 'Tersedia',
      };

      await api.updateInventory(updatedItem);
      await api.addTransaction({
        type: 'Keluar',
        item: `${formData.quantity} ${item.name}`,
        date: 'Baru Saja',
        user_name: formData.department,
        category: 'Pengambilan',
      });

      alert('Pengambilan barang berhasil dicatat!');
      navigate('/transactions');
    } catch (err) {
      console.error('Error:', err);
      alert('Gagal memproses pengambilan');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-h1 text-h1 text-primary">Form Pengambilan Barang</h2>
        <p className="text-slate-500 mt-1">Khusus untuk barang habis pakai (kertas, tinta, dll).</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Pilih Barang</label>
            <select
              required
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm"
              value={formData.itemId}
              onChange={(e) => setFormData({...formData, itemId: e.target.value})}
            >
              <option value="">-- Pilih Barang Habis Pakai --</option>
              {consumables.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} (Stok: {item.stock})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Jumlah</label>
              <input
                type="number"
                required
                min="1"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="0"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Unit Kerja/Dept</label>
              <select
                required
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              >
                <option value="">-- Pilih Dept --</option>
                {['Tata Usaha', 'Laboratorium', 'Perpustakaan', 'Guru BK', 'Kesiswaan', 'Kurikulum', 'Lainnya'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Alasan Pengambilan</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="Contoh: Untuk kebutuhan rapat guru"
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
            />
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

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-orange-600">warning</span>
              <p className="text-sm text-orange-800">
                <strong>Perhatian:</strong> Pengambilan barang habis pakai akan mengurangi stok secara permanen tanpa fitur pengembalian.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="flex-1 bg-primary text-white py-2.5 rounded-lg font-bold text-sm hover:brightness-110 transition-all"
            >
              Proses Pengambilan
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
