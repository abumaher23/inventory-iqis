import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api';

export default function Dashboard() {
  const [inventory, setInventory] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [inv, bor, trans] = await Promise.all([
          api.fetchInventory(),
          api.fetchBorrowings(),
          api.fetchTransactions()
        ]);
        setInventory(inv);
        setBorrowings(bor);
        setTransactions(trans);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalAssets = inventory.length;
  const lowStockItems = inventory.filter(item => item.status === 'Hampir Habis' || item.status === 'Kritis');
  const lowStock = lowStockItems.length;
  const activeBorrowings = borrowings.filter(b => b.status !== 'Dikembalikan');
  const recentTransactions = [...transactions].sort((a, b) => b.id - a.id).slice(0, 4);

  // Calculate stats by category for chart
  const categoryCounts = {};
  inventory.forEach(item => {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-h1 text-h1 text-primary">Dashboard Utama</h1>
        <p className="font-body-md text-slate-500">Selamat datang kembali, Admin. Berikut ringkasan operasional aset hari ini.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-primary rounded-lg">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>inventory_2</span>
            </div>
          </div>
          <h3 className="font-label-caps text-slate-500 uppercase">Total Aset</h3>
          <p className="text-h1 font-h1 text-blue-900">{totalAssets}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-red-50 text-error rounded-lg">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
            </div>
          </div>
          <h3 className="font-label-caps text-slate-500 uppercase">Stok Menipis</h3>
          <p className="text-h1 font-h1 text-red-700">{lowStock}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-50 text-tertiary-container rounded-lg">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>assignment_return</span>
            </div>
          </div>
          <h3 className="font-label-caps text-slate-500 uppercase">Peminjaman Aktif</h3>
          <p className="text-h1 font-h1 text-primary">{activeBorrowings.length}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-slate-50 text-slate-700 rounded-lg">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>output</span>
            </div>
          </div>
          <h3 className="font-label-caps text-slate-500 uppercase">Pengambilan Terbaru</h3>
          <p className="text-h1 font-h1 text-blue-900">{transactions.filter(t => t.type === 'Masuk').length}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Chart Area - Category Breakdown */}
        <div className="lg:col-span-8 space-y-gutter">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="font-h3 text-h3 text-primary">Distribusi Inventaris per Kategori</h2>
            </div>
            <div className="p-6">
                <div className="h-64 flex items-end justify-between px-4 pb-4 gap-4">
                  {topCategories.length > 0 ? (
                    <>
                      {topCategories.map(([cat, count], idx) => {
                        const maxCount = Math.max(...topCategories.map(([, c]) => c));
                        return (
                          <div key={cat} className="flex flex-col items-center gap-2 flex-1">
                            <div 
                              className="w-full bg-primary/20 hover:bg-primary/30 rounded-t-sm transition-all" 
                              style={{height: `${Math.max(20, (count / (maxCount || 1)) * 40)}px`}}
                            ></div>
                            <span className="text-[10px] font-bold text-slate-400 truncate w-full text-center">{cat.substring(0, 3).toUpperCase()}</span>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <div className="w-full text-center text-slate-400 text-sm">Belum ada data inventaris</div>
                  )}
                </div>
               <div className="flex gap-6 mt-4 justify-center">
                 {topCategories.map(([cat]) => (
                   <div key={cat} className="flex items-center gap-2">
                     <span className="w-3 h-3 bg-primary/20 rounded-full"></span>
                     <span className="text-xs text-slate-500 font-medium">{cat}</span>
                   </div>
                 ))}
               </div>
             </div>
          </div>

          {/* Low Stock Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-h3 text-h3 text-primary">Peringatan Stok Menipis</h2>
              <Link to="/inventory" className="text-xs font-bold text-secondary hover:underline cursor-pointer">Lihat Semua</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 font-label-caps text-slate-500">Nama Barang</th>
                    <th className="px-6 py-4 font-label-caps text-slate-500">Kategori</th>
                    <th className="px-6 py-4 font-label-caps text-slate-500">Sisa Stok</th>
                    <th className="px-6 py-4 font-label-caps text-slate-500">Status</th>
                    <th className="px-6 py-4 font-label-caps text-slate-500">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStockItems.slice(0, 5).map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-table-row-height">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-slate-400 text-sm">inventory_2</span>
                          </div>
                          <span className="font-medium text-slate-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-table-row-height">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">{item.category}</span>
                      </td>
                      <td className="px-6 py-table-row-height text-slate-900 font-bold">{item.stock} {item.unit || 'Unit'}</td>
                      <td className="px-6 py-table-row-height">
                        <span className={`px-2.5 py-1 rounded text-status-badge font-status-badge ${
                          item.status === 'Kritis' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-table-row-height">
                        <Link to="/incoming" className="text-primary hover:text-primary-container font-semibold text-xs cursor-pointer">Restock</Link>
                      </td>
                    </tr>
                  ))}
                  {lowStockItems.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-400 text-sm">
                        Tidak ada barang dengan stok menipis
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-gutter">
          {/* Activity Feed */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="font-h3 text-h3 text-primary">Aktivitas Terkini</h2>
            </div>
            <div className="p-6 space-y-6">
              {recentTransactions.length > 0 ? recentTransactions.map((trans, idx) => (
                <div key={trans.id || idx} className="flex gap-4">
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      trans.type === 'Masuk' ? 'bg-emerald-100 text-emerald-700' : 
                      trans.type === 'Keluar' ? 'bg-orange-100 text-orange-700' : 
                      'bg-blue-100 text-blue-700'
                    }`}>
                      <span className="material-symbols-outlined text-sm">
                        {trans.type === 'Masuk' ? 'login' : trans.type === 'Keluar' ? 'logout' : 'check_circle'}
                      </span>
                    </div>
                    {idx < recentTransactions.length - 1 && (
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-full bg-slate-100"></div>
                    )}
                  </div>
                  <div className="pb-2">
                    <p className="text-sm text-slate-900 font-medium">
                      {trans.user_name || 'Admin'} {trans.type === 'Masuk' ? 'menambahkan' : trans.type === 'Keluar' ? 'mengambil' : 'mengembalikan'}{' '}
                      <span className="font-bold">{trans.item}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">{trans.date}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center text-slate-400 text-sm py-4">
                  Belum ada aktivitas
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Card */}
          <div className="bg-primary text-white rounded-xl shadow-lg p-6 relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-[160px]">inventory</span>
            </div>
            <h3 className="text-lg font-bold mb-2">Butuh Bantuan Cepat?</h3>
            <p className="text-blue-100 text-sm mb-6">Gunakan menu yang tersedia untuk mengelola inventaris.</p>
            <Link to="/incoming" className="inline-block bg-white text-primary px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-blue-50 transition-colors cursor-pointer">
              Tambah Barang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
