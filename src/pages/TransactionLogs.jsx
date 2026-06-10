import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import * as api from '../api';

export default function TransactionLogs() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    api.fetchTransactions().then(data => {
      setTransactions(data);
      setLoading(false);
    }).catch(err => {
      console.error('Error:', err);
      setLoading(false);
    });
  }, []);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      const result = await api.cancelTransaction(cancelTarget.id);
      addToast('Transaksi berhasil dibatalkan, stok dikembalikan', 'success');
      setTransactions(transactions.map(t =>
        t.id === cancelTarget.id ? { ...t, category: 'Dibatalkan' } : t
      ));
      setCancelTarget(null);
    } catch (err) {
      addToast(err.message || 'Gagal membatalkan transaksi', 'error');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  const getTransactionStyle = (trans) => {
    if (trans.category === 'Dibatalkan') {
      return { icon: 'cancel', bg: 'bg-slate-100', color: 'text-slate-400' };
    }
    switch(trans.type) {
      case 'Masuk': return { icon: 'login', bg: 'bg-emerald-100', color: 'text-emerald-700' };
      case 'Keluar': return { icon: 'logout', bg: 'bg-orange-100', color: 'text-orange-700' };
      case 'Kembali': return { icon: 'check_circle', bg: 'bg-primary-fixed', color: 'text-primary' };
      default: return { icon: 'info', bg: 'bg-slate-100', color: 'text-slate-700' };
    }
  };

  const canCancel = (trans) => {
    return trans.category !== 'Dibatalkan' && trans.item_id && trans.quantity > 0;
  };

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-h1 text-h1 text-primary">Log Transaksi</h2>
          <p className="text-slate-500 mt-1">Riwayat mutasi barang masuk dan keluar secara lengkap.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-emerald-600 text-2xl">login</span>
            <span className="text-label-caps text-slate-500 uppercase">Barang Masuk</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {transactions.filter(t => t.type === 'Masuk' && t.category !== 'Dibatalkan').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-orange-600 text-2xl">logout</span>
            <span className="text-label-caps text-slate-500 uppercase">Barang Keluar</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {transactions.filter(t => t.type === 'Keluar' && t.category !== 'Dibatalkan').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-slate-400 text-2xl">cancel</span>
            <span className="text-label-caps text-slate-500 uppercase">Dibatalkan</span>
          </div>
          <p className="text-2xl font-bold text-slate-400">
            {transactions.filter(t => t.category === 'Dibatalkan').length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-h3 text-h3 text-primary">Riwayat Transaksi</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {transactions.map((trans) => {
            const { icon, bg, color } = getTransactionStyle(trans);
            const isCancelled = trans.category === 'Dibatalkan';
            return (
              <div key={trans.id} className={`p-6 flex items-center gap-4 transition-colors ${isCancelled ? 'opacity-50' : 'hover:bg-slate-50/50'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bg} ${color}`}>
                  <span className="material-symbols-outlined">{icon}</span>
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isCancelled ? 'text-slate-400' : 'text-slate-900'}`}>
                    {isCancelled ? (
                      <>
                        <span className="font-bold">{trans.user_name}</span> membatalkan{' '}
                        <span className="font-bold text-slate-500 line-through">{trans.item}</span>
                      </>
                    ) : (
                      <>
                        <span className="font-bold">{trans.user_name}</span>
                        {' '}
                        {trans.category === 'Restock' ? 'menambahkan' : trans.category === 'Peminjaman' ? 'meminjam' : trans.category === 'Pengambilan' ? 'mengambil' : 'mengembalikan'}
                        {' '}
                        <span className="font-bold text-primary">{trans.item}</span>
                      </>
                    )}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isCancelled ? 'bg-slate-100 text-slate-400' :
                      trans.type === 'Masuk' ? 'bg-emerald-100 text-emerald-700' :
                      trans.type === 'Keluar' ? 'bg-orange-100 text-orange-700' :
                      'bg-primary-fixed text-primary'
                    }`}>
                      {isCancelled ? 'Dibatalkan' : trans.type}
                    </span>
                    {!isCancelled && <span className="text-[11px] text-slate-400">{trans.category}</span>}
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{trans.date}</p>
                  </div>
                  {canCancel(trans) && (
                    <button
                      onClick={() => setCancelTarget(trans)}
                      className="px-3 py-1.5 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Batalkan
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {cancelTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-h3 text-h3 text-primary mb-4">Konfirmasi Pembatalan</h3>
            <p className="text-sm text-slate-600 mb-2">
              Yakin ingin membatalkan transaksi <strong>{cancelTarget.type}</strong> ini?
            </p>
            <p className="text-sm text-slate-600 mb-6">
              Stok barang <strong>{cancelTarget.item}</strong> akan dikembalikan seperti sebelum transaksi.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 bg-error text-white py-2.5 rounded-lg font-bold text-sm hover:brightness-110 cursor-pointer"
              >
                Ya, Batalkan
              </button>
              <button
                onClick={() => setCancelTarget(null)}
                className="flex-1 bg-white border border-slate-200 py-2.5 rounded-lg font-bold text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
