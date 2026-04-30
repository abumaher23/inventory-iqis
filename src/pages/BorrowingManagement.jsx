import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api';

export default function BorrowingManagement() {
  const [borrowings, setBorrowings] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const getDynamicStatus = (borrowing) => {
    if (borrowing.status === 'Dikembalikan') return 'Dikembalikan';
    const today = new Date();
    const dueDate = new Date(borrowing.due_date);
    return dueDate < today ? 'Terlambat' : 'Dipinjam';
  };

  useEffect(() => {
    api.fetchBorrowings().then(data => {
      setBorrowings(data);
      setLoading(false);
    }).catch(err => {
      console.error('Error:', err);
      setLoading(false);
    });
  }, []);

  const handleReturn = async (id) => {
    try {
      await api.updateBorrowing(id, { status: 'Dikembalikan' });
      setBorrowings(borrowings.map(b => b.id === id ? { ...b, status: 'Dikembalikan' } : b));
    } catch (err) {
      console.error('Error returning:', err);
    }
  };

  const filteredBorrowings = borrowings.filter(b => 
    search === '' || b.borrower.toLowerCase().includes(search.toLowerCase()) || b.item.toLowerCase().includes(search.toLowerCase())
  );

  const activeBorrowings = borrowings.filter(b => b.status !== 'Dikembalikan');

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  const getStatusBadge = (borrowing) => {
    const status = getDynamicStatus(borrowing);
    switch(status) {
      case 'Terlambat':
        return <span className="px-3 py-1 bg-error-container text-on-error-container text-status-badge rounded-full uppercase">Terlambat</span>;
      case 'Dipinjam':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-status-badge rounded-full uppercase border border-blue-300">Dipinjam</span>;
      case 'Dikembalikan':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-status-badge rounded-full uppercase">Dikembalikan</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-600 text-status-badge rounded-full">{status}</span>;
    }
  };

  return (
    <div>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <span className="material-symbols-outlined text-primary text-3xl">pending_actions</span>
          <p className="text-label-caps text-slate-500 uppercase">Total Dipinjam</p>
          <h3 className="text-h1 font-h1 text-primary">{activeBorrowings.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 border-l-4 border-l-error">
          <span className="material-symbols-outlined text-error text-3xl">running_with_errors</span>
          <p className="text-label-caps text-slate-500 uppercase">Terlambat</p>
          <h3 className="text-h1 font-h1 text-error">{activeBorrowings.filter(b => b.status === 'Terlambat').length}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <span className="material-symbols-outlined text-secondary text-3xl">event_repeat</span>
          <p className="text-label-caps text-slate-500 uppercase">Jatuh Tempo Hari Ini</p>
          <h3 className="text-h1 font-h1 text-secondary">09</h3>
        </div>
        <div className="bg-primary p-6 rounded-xl shadow-lg flex flex-col justify-center gap-3">
          <p className="text-white font-medium text-sm">Butuh Peminjaman Baru?</p>
          <Link to="/borrow-form" className="bg-white text-primary px-4 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-50">
            <span className="material-symbols-outlined text-sm">add</span>
            Tambah Pinjaman
          </Link>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="font-h3 text-h3 text-blue-900">Daftar Aktif Peminjaman</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">BARANG SEKOLAH</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">filter_list</span>
              Filter
            </button>
            <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">download</span>
              Ekspor PDF
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-label-caps text-slate-500 uppercase">Peminjam</th>
                <th className="px-6 py-4 text-label-caps text-slate-500 uppercase">Item</th>
                <th className="px-6 py-4 text-label-caps text-slate-500 uppercase">Tgl Pinjam</th>
                <th className="px-6 py-4 text-label-caps text-slate-500 uppercase">Jatuh Tempo</th>
                <th className="px-6 py-4 text-label-caps text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-label-caps text-slate-500 uppercase text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBorrowings.map(b => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors h-table-row-height">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                        {b.borrower.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-on-background">{b.borrower}</p>
                        <p className="text-[11px] text-slate-500">{b.borrower_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-primary">{b.item}</span>
                      <span className="text-[11px] text-slate-400">{b.item_id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-body-md">{b.borrow_date}</td>
                  <td className={`px-6 py-4 text-sm font-body-md ${getDynamicStatus(b) === 'Terlambat' ? 'text-error font-bold' : 'text-slate-600'}`}>
                    {b.due_date}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(b)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {b.status !== 'Dikembalikan' && (
                      <button
                        onClick={() => handleReturn(b.id)}
                        className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-primary-container"
                      >
                        Kembalikan
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-8 flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-white p-6 rounded-xl border border-slate-200 flex items-start gap-4 shadow-sm">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary">info</span>
          </div>
          <div>
            <h4 className="font-bold text-sm text-on-background mb-1">Kebijakan Pengembalian</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Barang yang terlambat lebih dari 3 hari akan otomatis mengirimkan notifikasi ke email peminjam dan atasan terkait.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
