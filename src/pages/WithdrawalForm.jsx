import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SearchableSelect from '../components/SearchableSelect';
import * as api from '../api';

export default function WithdrawalForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [inventory, setInventory] = useState([]);
  const todayStr = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    itemId: '',
    quantity: '',
    department: '',
    reason: '',
    notes: '',
    date: todayStr,
  });
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    api.fetchInventory().then(data => setInventory(data)).catch(console.error);
    
    // Fetch departments
    api.getDepartments().then(data => {
      setDepartments(data);
    }).catch(err => console.error('Error fetching departments:', err));
  }, []);

  const consumables = inventory.filter(item => item.type === 'consumable' || item.category === 'Alat Tulis Kantor');

  const refreshInventory = async () => {
    try {
      const data = await api.fetchInventory();
      setInventory(data);
    } catch (err) {
      console.error('Error refreshing inventory:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const freshInventory = await api.fetchInventory();
      const item = freshInventory.find(i => i.id === formData.itemId);
      if (!item) return addToast('Barang tidak ditemukan', 'error');

      const qty = parseInt(formData.quantity);
      if (isNaN(qty) || qty < 1) return addToast('Jumlah tidak valid', 'error');
      const newStock = item.stock - qty;
      if (newStock < 0) return addToast('Stok tidak mencukupi (sisa: ' + item.stock + ')', 'error');
      const updatedItem = {
        ...item,
        stock: newStock,
        status: newStock === 0 ? 'Habis' : newStock <= 3 ? 'Kritis' : newStock <= 10 ? 'Hampir Habis' : 'Tersedia',
      };

      setInventory(freshInventory);
      await api.updateInventory(updatedItem);
      const d = formData.date ? new Date(formData.date + 'T12:00:00') : new Date();
      const formattedDate = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      const userName = user ? `${user.first_name} ${user.last_name}`.trim() : formData.department;
      await api.addTransaction({
        type: 'Keluar',
        item: `${qty} ${item.name}`,
        date: formattedDate,
        user_name: `${userName} (${formData.department})`,
        category: 'Pengambilan',
        item_id: item.id,
        quantity: qty,
      });

      addToast('Pengambilan barang berhasil dicatat!', 'success');
      navigate('/transactions');
    } catch (err) {
      console.error('Error:', err);
      addToast('Gagal memproses pengambilan', 'error');
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
            <div className="flex gap-2">
              <SearchableSelect
                items={consumables}
                value={formData.itemId}
                onChange={(id) => setFormData({...formData, itemId: id})}
                placeholder="Pilih barang habis pakai..."
              />
              <button
                type="button"
                onClick={refreshInventory}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                title="Muat ulang stok"
              >
                <span className="material-symbols-outlined text-lg">refresh</span>
              </button>
            </div>
            {formData.itemId && (
              <div className="mt-2 text-xs text-slate-500">
                Stok tersedia: <span className="font-bold text-slate-800">{inventory.find(i => i.id === formData.itemId)?.stock ?? '?'}</span>
              </div>
            )}
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
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
<div>
  <label className="block text-sm font-semibold text-slate-700 mb-2">Unit Kerja/Dept</label>
  <select
    required
    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm"
    value={formData.department}
    onChange={(e) => setFormData({...formData, department: e.target.value})}
  >
    <option value="">-- Pilih Dept --</option>
    {departments.map(dept => <option key={dept.id}>{dept.name}</option>)}
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
