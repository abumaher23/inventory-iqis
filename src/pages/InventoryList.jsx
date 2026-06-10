import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as api from '../api';

export default function InventoryList() {
  const [inventory, setInventory] = useState([]);
  const [filter, setFilter] = useState('Semua Kategori');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', category: '', stock: '', type: 'asset', unit: 'Unit' });
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });
  const [restockModal, setRestockModal] = useState({ show: false, item: null, quantity: '', date: new Date().toISOString().split('T')[0] });

  const categories = ['Semua Kategori'];
  const [dbCategories, setDbCategories] = useState([]);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    api.fetchInventory().then(data => {
      setInventory(data);
      setLoading(false);
    }).catch(err => {
      console.error('Error:', err);
      setLoading(false);
    });

    if (user?.role === 'Super Admin') {
      api.getCategories().then(data => {
        setDbCategories(data);
      }).catch(err => console.error('Error fetching categories:', err));

      api.getUnits().then(data => {
        setUnits(data);
      }).catch(err => console.error('Error fetching units:', err));
    }
  }, []);

  const getAllCategories = () => {
    const cats = [...categories, ...(user?.role === 'Super Admin' ? [] : [])];
    return cats;
  };

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

  const openEditForm = (item) => {
    setEditItem(item);
    setEditForm({
      name: item.name,
      category: item.category,
      stock: item.stock.toString(),
      type: item.type || 'asset',
      unit: item.unit || 'Unit',
    });
    setActionMenuOpen(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatedItem = {
        ...editItem,
        name: editForm.name,
        category: editForm.category,
        stock: parseInt(editForm.stock),
        status: parseInt(editForm.stock) > 20 ? 'Tersedia' : parseInt(editForm.stock) > 5 ? 'Hampir Habis' : parseInt(editForm.stock) === 0 ? 'Habis' : 'Kritis',
        type: editForm.type,
        unit: editForm.unit,
      };
      await api.updateInventory(updatedItem);
      setInventory(inventory.map(item => item.id === editItem.id ? updatedItem : item));
      setEditItem(null);
      addToast('Barang berhasil diupdate', 'success');
    } catch (err) {
      addToast(err.message || 'Gagal mengupdate barang', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    setDeleteModal({ show: true, id, name });
  };

  const confirmDelete = async () => {
    try {
      await api.deleteInventory(deleteModal.id);
      setInventory(inventory.filter(item => item.id !== deleteModal.id));
      addToast('Barang berhasil dihapus', 'success');
      setDeleteModal({ show: false, id: null, name: '' });
    } catch (err) {
      addToast('Gagal menghapus barang', 'error');
    }
  };

  const openRestock = (item) => {
    setRestockModal({ show: true, item, quantity: '', date: new Date().toISOString().split('T')[0] });
    setActionMenuOpen(null);
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    const { item, quantity, date } = restockModal;
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) return addToast('Jumlah tidak valid', 'error');

    try {
      const newStock = item.stock + qty;
      const updatedItem = {
        ...item,
        stock: newStock,
        status: newStock > 20 ? 'Tersedia' : newStock > 5 ? 'Hampir Habis' : newStock === 0 ? 'Habis' : 'Kritis',
      };
      await api.updateInventory(updatedItem);
      const d = date ? new Date(date + 'T12:00:00') : new Date();
      await api.addTransaction({
        type: 'Masuk',
        item: `${qty} ${item.name}`,
        date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        user_name: user ? `${user.first_name} ${user.last_name}`.trim() : 'Admin',
        category: 'Restock',
        item_id: item.id,
        quantity: qty,
      });
      setInventory(inventory.map(i => i.id === item.id ? updatedItem : i));
      setRestockModal({ show: false, item: null, quantity: '' });
      addToast(`Stok ${item.name} berhasil ditambah ${qty}`, 'success');
    } catch (err) {
      addToast(err.message || 'Gagal menambah stok', 'error');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-h1 text-h1 text-primary">Daftar Inventaris Aset</h2>
          <p className="text-slate-500 mt-1">Kelola dan pantau seluruh aset fisik sekolah secara real-time.</p>
        </div>
        {user?.role === 'Super Admin' && (
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 cursor-pointer">
              <span className="material-symbols-outlined text-lg">file_download</span>
              Export PDF
            </button>
            <Link to="/incoming" className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:brightness-110 shadow-sm cursor-pointer">
              <span className="material-symbols-outlined text-lg">add_box</span>
              Tambah Aset Baru
            </Link>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 font-label-caps text-label-caps uppercase">Total Barang</span>
          <span className="text-3xl font-h1 text-primary mt-2 block">{inventory.length}</span>
        </div>
<div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
  <span className="text-slate-500 font-label-caps text-label-caps uppercase">Kategori Aktif</span>
  <span className="text-3xl font-h1 text-primary mt-2 block">{dbCategories.length}</span>
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
              {user?.role === 'Super Admin' && (
                <th className="px-6 py-4 font-label-caps text-label-caps text-slate-500 uppercase text-right">Aksi</th>
              )}
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
                    <span className="font-semibold text-primary">{item.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-primary-fixed text-primary px-3 py-1 rounded-full text-xs font-semibold">{item.category}</span>
                </td>
                <td className="px-6 py-4 text-slate-500 font-mono text-xs">{item.id}</td>
                <td className="px-6 py-4 text-slate-700 font-medium">{item.stock} {item.unit || 'Unit'}</td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1.5 font-status-badge text-status-badge ${getStatusClass(item.status)} rounded-full px-2.5 py-1 w-fit`}>
                    <span className="w-2 h-2 rounded-full"></span>
                    {item.status}
                  </span>
                </td>
                {user?.role === 'Super Admin' && (
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      className="action-button p-2 text-slate-400 hover:text-primary transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActionMenuOpen(actionMenuOpen === item.id ? null : item.id);
                      }}
                    >
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                      {actionMenuOpen === item.id && (
                      <div 
                        className="action-menu absolute right-6 top-8 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[140px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-emerald-50 text-emerald-700 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            openRestock(item);
                          }}
                        >
                          + Tambah Stok
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-700 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditForm(item);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id, item.name);
                          }}
                        >
                          Hapus
                        </button>
                      </div>
                      )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-between items-center">
          <span className="text-xs text-slate-500">Menampilkan {filteredInventory.length} dari {inventory.length} barang</span>
        </div>
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditItem(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-h3 text-h3 text-primary mb-4">Edit Barang</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Barang</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Kategori</label>
                <select
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm"
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                >
                  {categories.map(cat => <option key={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Stok</label>
                <input
                  type="number"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  value={editForm.stock}
                  onChange={(e) => setEditForm({...editForm, stock: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Satuan</label>
                {units.length > 0 ? (
                  <select
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm"
                    value={editForm.unit}
                    onChange={(e) => setEditForm({...editForm, unit: e.target.value})}
                  >
                    {units.map(unit => <option key={unit.id}>{unit.name}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    value={editForm.unit}
                    onChange={(e) => setEditForm({...editForm, unit: e.target.value})}
                    placeholder="Unit, pcs, box, dll"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Barang</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="editType" 
                      value="asset" 
                      checked={editForm.type === 'asset'} 
                      onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                    />
                    <span className="text-sm">Aset</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="editType" 
                      value="consumable" 
                      checked={editForm.type === 'consumable'} 
                      onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                    />
                    <span className="text-sm">Habis Pakai</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2.5 rounded-lg font-bold text-sm hover:brightness-110"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="flex-1 bg-white border border-slate-200 py-2.5 rounded-lg font-bold text-sm text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setRestockModal({ show: false, item: null, quantity: '' })}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-h3 text-h3 text-primary mb-4">Tambah Stok</h3>
            <p className="text-sm text-slate-600 mb-4">
              <span className="font-semibold">{restockModal.item?.name}</span> — Stok saat ini: <span className="font-bold">{restockModal.item?.stock} {restockModal.item?.unit || 'Unit'}</span>
            </p>
            <form onSubmit={handleRestock}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Jumlah tambahan</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="Contoh: 10"
                  value={restockModal.quantity}
                  onChange={(e) => setRestockModal({ ...restockModal, quantity: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  value={restockModal.date}
                  onChange={(e) => setRestockModal({ ...restockModal, date: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2.5 rounded-lg font-bold text-sm hover:brightness-110 cursor-pointer"
                >
                  Tambah Stok
                </button>
                <button
                  type="button"
                  onClick={() => setRestockModal({ show: false, item: null, quantity: '' })}
                  className="flex-1 bg-white border border-slate-200 py-2.5 rounded-lg font-bold text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-h3 text-h3 text-primary mb-4">Konfirmasi Hapus</h3>
            <p className="text-sm text-slate-600 mb-6">Yakin ingin menghapus barang {deleteModal.name}?</p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-error text-white py-2.5 rounded-lg font-bold text-sm hover:brightness-110"
              >
                Hapus
              </button>
              <button
                onClick={() => setDeleteModal({ show: false, id: null, name: '' })}
                className="flex-1 bg-white border border-slate-200 py-2.5 rounded-lg font-bold text-sm text-slate-700 hover:bg-slate-50"
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
