import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api';

export default function InventoryList() {
  const [inventory, setInventory] = useState([]);
  const [filter, setFilter] = useState('Semua Kategori');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = ['Semua Kategori', 'Elektronik', 'Mebel', 'Alat Olahraga', 'Buku & Pustaka', 'Laboratorium', 'Alat Tulis Kantor'];

  useEffect(() => {
    api.fetchInventory().then(data => {
      setInventory(data);
      setLoading(false);
    }).catch(err => {
      console.error('Error:', err);
      setLoading(false);
    });
  }, []);

  const filteredInventory = inventory.filter(item => {
    const matchCategory = filter === 'Semua Kategori' || item.category === filter;
    const matchSearch = search === '' || item.name.toLowerCase().includes(search.toLowerCase()) || item.id.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const getStatusClass = (status) => {
    switch(status) {
      case 'Tersedia': return 'text-emerald-700 bg-emerald-100';
      case 'Hampir Habis': return 'text-amber-600 bg-amber-100';
      case 'Kritis': return 'text-red-700 bg-red-100';
      case 'Habis': return 'text-error bg-error-container';
      default: return 'text-slate-700 bg-slate-100';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-h1 text-h1 text-primary">Daftar Inventaris Aset</h2>
          <p className="text-slate-500 mt-1">Kelola dan pantau seluruh aset fisik sekolah secara real-time.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50">
            <span className="material-symbols-outlined text-lg">file_download</span>
            Export PDF
          </button>
          <Link to="/incoming" className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:brightness-110 shadow-sm">
            <span className="material-symbols-outlined text-lg">add_box</span>
            Tambah Aset Baru
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 font-label-caps text-label-caps uppercase">Total Barang</span>
            <span className="text-3xl font-h1 text-primary mt-2 block">{inventory.length}</span>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 font-label-caps text-label-caps uppercase">Kategori Aktif</span>
            <span className="text-3xl font-h1 text-primary mt-2 block">12</span>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 font-label-caps text-label-caps uppercase">Hampir Habis</span>
            <span className="text-3xl font-h1 text-amber-600 mt-2 block">
              {inventory.filter(i => i.status === 'Hampir Habis').length}
            </span>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 font-label-caps text-label-caps uppercase">Status Habis</span>
            <span className="text-3xl font-h1 text-error mt-2 block">
              {inventory.filter(i => i.status === 'Habis' || i.status === 'Kritis').length}
            </span>
          </div>
        </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px] relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            placeholder="Cari berdasarkan nama barang, kode, atau kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {categories.map(cat => <option key={cat}>{cat}</option>)}
        </select>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 font-label-caps text-label-caps text-slate-500 uppercase">Nama Barang</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-slate-500 uppercase">Kategori</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-slate-500 uppercase">Kode Aset</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-slate-500 uppercase">Stok</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-slate-500 uppercase">Status</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-slate-500 uppercase text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInventory.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors h-table-row-height">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-400">inventory_2</span>
                    </div>
                    <span className="font-semibold text-blue-900">{item.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">{item.category}</span>
                </td>
                <td className="px-6 py-4 text-slate-500 font-mono text-xs">{item.id}</td>
                <td className="px-6 py-4 text-slate-700 font-medium">{item.stock} Unit</td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1.5 font-status-badge text-status-badge ${getStatusClass(item.status)} rounded-full px-2.5 py-1 w-fit`}>
                    <span className="w-2 h-2 rounded-full"></span>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-between items-center">
          <span className="text-xs text-slate-500">Menampilkan {filteredInventory.length} dari {state.inventory.length} barang</span>
        </div>
      </div>
    </div>
  );
}
