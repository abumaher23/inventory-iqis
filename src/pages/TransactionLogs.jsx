import { useState, useEffect } from 'react';

export default function TransactionLogs() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/transactions')
      .then(res => res.json())
      .then(data => {
        setTransactions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  const getTransactionIcon = (type) => {
    switch(type) {
      case 'Masuk': return { icon: 'login', bg: 'bg-emerald-100', color: 'text-emerald-700' };
      case 'Keluar': return { icon: 'logout', bg: 'bg-orange-100', color: 'text-orange-700' };
      case 'Kembali': return { icon: 'check_circle', bg: 'bg-blue-100', color: 'text-blue-700' };
      default: return { icon: 'info', bg: 'bg-slate-100', color: 'text-slate-700' };
    }
  };

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-h1 text-h1 text-primary">Log Transaksi</h2>
          <p className="text-slate-500 mt-1">Riwayat mutasi barang masuk dan keluar secara lengkap.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50">
          <span className="material-symbols-outlined text-lg">download</span>
          Export PDF
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-emerald-600 text-2xl">login</span>
            <span className="text-label-caps text-slate-500 uppercase">Barang Masuk</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {transactions.filter(t => t.type === 'Masuk').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-orange-600 text-2xl">logout</span>
            <span className="text-label-caps text-slate-500 uppercase">Barang Keluar</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {transactions.filter(t => t.type === 'Keluar').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-blue-600 text-2xl">check_circle</span>
            <span className="text-label-caps text-slate-500 uppercase">Pengembalian</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {transactions.filter(t => t.type === 'Kembali').length}
          </p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-h3 text-h3 text-primary">Riwayat Transaksi</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {transactions.map((trans) => {
            const { icon, bg, color } = getTransactionIcon(trans.type);
            return (
              <div key={trans.id} className="p-6 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bg} ${color}`}>
                  <span className="material-symbols-outlined">{icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    <span className="font-bold">{trans.user_name}</span>
                    {' '}
                    {trans.category === 'Restock' ? 'menambahkan' : trans.category === 'Peminjaman' ? 'meminjam' : 'mengembalikan'}
                    {' '}
                    <span className="font-bold text-primary">{trans.item}</span>
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${trans.type === 'Masuk' ? 'bg-emerald-100 text-emerald-700' : trans.type === 'Keluar' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                      {trans.type}
                    </span>
                    <span className="text-[11px] text-slate-400">{trans.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{trans.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
