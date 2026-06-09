import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as api from '../api';

export default function Settings() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    schoolName: 'SMP Negeri 01',
    address: 'Jl. Pendidikan No. 123',
    phone: '021-1234567',
    lowStock: '10',
    criticalStock: '3',
  });
  const [settingsLoading, setSettingsLoading] = useState(false);

  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '', type: '' });

  useEffect(() => {
    if (user?.role === 'Super Admin') {
      loadCategories();
      loadUnits();
      loadSettings();
    }
  }, [user]);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
      setLoading(false);
    } catch (err) {
      addToast('Gagal memuat kategori', 'error');
      setLoading(false);
    }
  };

  const loadUnits = async () => {
    try {
      const data = await api.getUnits();
      setUnits(data);
    } catch (err) {
      console.error('Error loading units:', err);
    }
  };

  const handleSettingsChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    });
  };

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      // Check if the data has the required fields
      if (data && 
          data.school_name !== undefined && 
          data.address !== undefined && 
          data.phone !== undefined && 
          data.low_stock_threshold !== undefined && 
          data.critical_stock_threshold !== undefined) {
        // Map database fields to state fields
        setSettings({
          schoolName: data.school_name,
          address: data.address,
          phone: data.phone,
          lowStock: data.low_stock_threshold.toString(),
          criticalStock: data.critical_stock_threshold.toString(),
        });
      } else {
        // If the data is not in the expected format, use defaults and show a warning
        console.warn('Settings data is missing some fields, using defaults');
        setSettings({
          schoolName: 'SMP Negeri 01',
          address: 'Jl. Pendidikan No. 123',
          phone: '021-1234567',
          lowStock: '10',
          criticalStock: '3',
        });
        addToast('Format data pengaturan tidak sesuai, menggunakan nilai default', 'warning');
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      addToast('Gagal memuat pengaturan', 'error');
    }
  };

  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    try {
      await api.updateSettings({
        school_name: settings.schoolName,
        address: settings.address,
        phone: settings.phone,
        low_stock_threshold: parseInt(settings.lowStock),
        critical_stock_threshold: parseInt(settings.criticalStock),
      });
      addToast('Pengaturan berhasil disimpan', 'success');
    } catch (err) {
      addToast(err.message || 'Gagal menyimpan pengaturan', 'error');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      const result = await api.addCategory(newCategory);
      setCategories([...categories, result]);
      setNewCategory('');
      addToast('Kategori berhasil ditambahkan', 'success');
    } catch (err) {
      addToast(err.message || 'Gagal menambah kategori', 'error');
    }
  };

  const handleDeleteCategory = (id, name) => {
    setDeleteModal({ show: true, id, name, type: 'category' });
  };

  const confirmDeleteCategory = async () => {
    try {
      await api.deleteCategory(deleteModal.id);
      setCategories(categories.filter(cat => cat.id !== deleteModal.id));
      addToast('Kategori berhasil dihapus', 'success');
      setDeleteModal({ show: false, id: null, name: '', type: '' });
    } catch (err) {
      addToast('Gagal menghapus kategori', 'error');
    }
  };

  const handleAddUnit = async (e) => {
    e.preventDefault();
    if (!newUnit.trim()) return;

    try {
      const result = await api.addUnit(newUnit);
      setUnits([...units, result]);
      setNewUnit('');
      addToast('Satuan berhasil ditambahkan', 'success');
    } catch (err) {
      addToast(err.message || 'Gagal menambah satuan', 'error');
    }
  };

  const handleDeleteUnit = (id, name) => {
    setDeleteModal({ show: true, id, name, type: 'unit' });
  };

  const confirmDeleteUnit = async () => {
    try {
      await api.deleteUnit(deleteModal.id);
      setUnits(units.filter(unit => unit.id !== deleteModal.id));
      addToast('Satuan berhasil dihapus', 'success');
      setDeleteModal({ show: false, id: null, name: '', type: '' });
    } catch (err) {
      addToast('Gagal menghapus unit kerja', 'error');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-h1 text-h1 text-primary">Pengaturan</h2>
        <p className="text-slate-500 mt-1">Kelola konfigurasi sistem IQIS.</p>
      </div>

      <div className="space-y-6 max-w-4xl">
        {/* Profile Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-h3 text-h3 text-primary mb-4">Profil Sekolah</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Sekolah</label>
              <input 
                type="text" 
                name="schoolName"
                value={settings.schoolName} 
                onChange={handleSettingsChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Alamat</label>
                <input 
                  type="text" 
                  name="address"
                  value={settings.address} 
                  onChange={handleSettingsChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Telepon</label>
                <input 
                  type="text" 
                  name="phone"
                  value={settings.phone} 
                  onChange={handleSettingsChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Category Management - Only for Super Admin */}
        {user?.role === 'Super Admin' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-h3 text-h3 text-primary mb-4">Kelola Kategori Barang</h3>
            
            <form onSubmit={handleAddCategory} className="mb-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="Nama kategori baru"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:brightness-110"
                >
                  Tambah
                </button>
              </div>
            </form>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Daftar Kategori</h4>
              {loading ? (
                <p className="text-sm text-slate-500">Memuat...</p>
              ) : categories.length === 0 ? (
                <p className="text-sm text-slate-500">Belum ada kategori</p>
              ) : (
                categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Unit Management - Only for Super Admin */}
        {user?.role === 'Super Admin' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mt-6">
            <h3 className="font-h3 text-h3 text-primary mb-4">Kelola Satuan Barang</h3>
            
            <form onSubmit={handleAddUnit} className="mb-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="Nama satuan baru (contoh: botol, pcs, lembar)"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:brightness-110"
                >
                  Tambah
                </button>
              </div>
            </form>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Daftar Satuan</h4>
              {units.length === 0 ? (
                <p className="text-sm text-slate-500">Belum ada satuan</p>
              ) : (
                units.map(unit => (
                  <div key={unit.id} className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">{unit.name}</span>
                    <button
                      onClick={() => handleDeleteUnit(unit.id, unit.name)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Notification Settings */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-h3 text-h3 text-primary mb-4">Pengaturan Notifikasi</h3>
          <div className="space-y-3">
            {['Email untuk keterlambatan', 'Reminder jatuh tempo', 'Laporan mingguan'].map((item, idx) => (
              <label key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 cursor-pointer">
                <span className="text-sm text-slate-700">{item}</span>
                <input type="checkbox" defaultChecked className="toggle" />
              </label>
            ))}
          </div>
        </div>

        {/* Low Stock Threshold */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-h3 text-h3 text-primary mb-4">Batas Stok Minimum</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Peringatan (Hampir Habis)</label>
              <input 
                type="number" 
                name="lowStock"
                value={settings.lowStock} 
                onChange={handleSettingsChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Kritis</label>
              <input 
                type="number" 
                name="criticalStock"
                value={settings.criticalStock} 
                onChange={handleSettingsChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleSaveSettings}
          className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:brightness-110"
        >
          Simpan Pengaturan
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-h3 text-h3 text-primary mb-4">Konfirmasi Hapus</h3>
            <p className="text-sm text-slate-600 mb-6">Yakin ingin menghapus {deleteModal.type === 'unit' ? 'satuan' : 'kategori'} {deleteModal.name}?</p>
            <div className="flex gap-3">
              <button
                onClick={deleteModal.type === 'unit' ? confirmDeleteUnit : confirmDeleteCategory}
                className="flex-1 bg-error text-white py-2.5 rounded-lg font-bold text-sm hover:brightness-110"
              >
                Hapus
              </button>
              <button
                onClick={() => setDeleteModal({ show: false, id: null, name: '', type: '' })}
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
