import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import SearchableSelect from '../components/SearchableSelect';
import * as api from '../api';

export default function BorrowForm() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [inventory, setInventory] = useState([]);
  const todayStr = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    borrower: '',
    borrowerId: '',
    itemId: '',
    borrowDate: todayStr,
    dueDate: '',
    date: todayStr,
  });

  useEffect(() => {
    api.fetchInventory().then(data => setInventory(data)).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const inventory = await api.fetchInventory();
      const item = inventory.find(i => i.id === formData.itemId);
      if (!item) return addToast('Barang tidak ditemukan', 'error');

      const newStock = item.stock - 1;
      if (newStock < 0) {
        return addToast('Stok barang tidak mencukupi untuk dipinjam', 'error');
      }

      const updatedItem = {
        ...item,
        stock: newStock,
        status: newStock === 0 ? 'Habis' : newStock <= 3 ? 'Kritis' : newStock <= 10 ? 'Hampir Habis' : 'Tersedia',
      };
      await api.updateInventory(updatedItem);

      const newBorrowing = {
        borrower: formData.borrower,
        borrower_id: formData.borrowerId,
        item: item.name,
        item_id: item.id,
        borrow_date: new Date(formData.borrowDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        due_date: new Date(formData.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: new Date(formData.dueDate) < new Date() ? 'Terlambat' : 'Dipinjam',
      };

      await api.addBorrowing(newBorrowing);
      const d = formData.date ? new Date(formData.date + 'T12:00:00') : new Date();
      const formattedDate = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      await api.addTransaction({
        type: 'Keluar',
        item: item.name,
        date: formattedDate,
        user_name: formData.borrower,
        category: 'Peminjaman',
        item_id: item.id,
        quantity: 1,
      });

      addToast('Peminjaman berhasil dicatat!', 'success');
      navigate('/borrowing');
    } catch (err) {
      console.error('Error:', err);
      addToast('Gagal mencatat peminjaman', 'error');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-h1 text-h1 text-primary">Form Peminjaman Barang</h2>
        <p className="text-slate-500 mt-1">Catat barang yang dipinjam dengan jatuh tempo.</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Peminjam</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="Nama lengkap"
                value={formData.borrower}
                onChange={(e) => setFormData({...formData, borrower: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">ID Peminjam</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="Contoh: GURU-08221"
                value={formData.borrowerId}
                onChange={(e) => setFormData({...formData, borrowerId: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Pilih Barang</label>
            <SearchableSelect
              items={inventory}
              value={formData.itemId}
              onChange={(id) => setFormData({...formData, itemId: id})}
              placeholder="Pilih barang..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Transaksi</label>
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
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Pinjam</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                value={formData.borrowDate}
                onChange={(e) => setFormData({...formData, borrowDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Jatuh Tempo</label>
              <input
                type="date"
                required
                min={formData.borrowDate}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>
          </div>

          <div className="bg-primary-fixed/30 border border-primary-fixed rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary">info</span>
              <p className="text-sm text-primary">
                Barang harus dikembalikan sebelum tanggal jatuh tempo. Keterlambatan akan dicatat otomatis.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="flex-1 bg-primary text-white py-2.5 rounded-lg font-bold text-sm hover:brightness-110 transition-all"
            >
              Proses Peminjaman
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
