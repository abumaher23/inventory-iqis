import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api';

export default function BorrowForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    borrower: '',
    borrowerId: '',
    itemId: '',
    borrowDate: new Date().toISOString().split('T')[0],
    dueDate: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const inventory = await api.fetchInventory();
      const item = inventory.find(i => i.id === formData.itemId);
      if (!item) return alert('Barang tidak ditemukan');

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
      await api.addTransaction({
        type: 'Keluar',
        item: item.name,
        date: 'Baru Saja',
        user_name: formData.borrower,
        category: 'Peminjaman',
      });

      alert('Peminjaman berhasil dicatat!');
      navigate('/borrowing');
    } catch (err) {
      console.error('Error:', err);
      alert('Gagal mencatat peminjaman');
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
            <select
              required
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm"
              value={formData.itemId}
              onChange={(e) => setFormData({...formData, itemId: e.target.value})}
            >
              <option value="">-- Pilih Barang --</option>
            </select>
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

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-600">info</span>
              <p className="text-sm text-blue-800">
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
