import { NavLink, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [inventory, setInventory] = useState([]);
  const notifRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    api.fetchInventory().then(setInventory).catch(console.error);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const alerts = inventory.filter(i => i.stock <= 5 && i.type === 'consumable');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: 'dashboard', label: 'Dashboard' },
    { path: '/inventory', icon: 'inventory_2', label: 'Inventaris' },
    { path: '/borrowing', icon: 'assignment_return', label: 'Peminjaman' },
    { path: '/withdrawal', icon: 'output', label: 'Pengambilan' },
    { path: '/reports', icon: 'bar_chart', label: 'Laporan' },
  ];

  const adminNavItems = [
    { path: '/transactions', icon: 'receipt_long', label: 'Log Transaksi' },
  ];

  const bottomNavItems = user?.role === 'Super Admin' 
    ? [
        { path: '/accounts', icon: 'manage_accounts', label: 'Akun' },
      ]
    : [];

  const getPageTitle = () => {
    const allNavItems = user?.role === 'Super Admin' 
      ? [...navItems, ...adminNavItems] 
      : navItems;
    const item = allNavItems.find(item => item.path === location.pathname);
    return item ? item.label : 'Dashboard';
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className={`fixed left-0 top-0 h-full w-sidebar-width border-r border-slate-200 bg-white flex flex-col py-6 px-4 gap-2 z-40 ${sidebarOpen ? 'block' : 'hidden'} md:flex`}>
          <div className="flex items-center gap-3 px-2 mb-8">
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
              <img src="/favicon.svg" alt="IQIS" className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-lg font-black text-primary leading-tight">IQIS</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Manajemen Aset Sekolah</p>
            </div>
          </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${isActive ? 'bg-primary-fixed text-primary border-r-4 border-primary' : 'text-slate-600 hover:bg-slate-50 hover:text-primary'}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          ))}
          {user?.role === 'Super Admin' && adminNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${isActive ? 'bg-primary-fixed text-primary border-r-4 border-primary' : 'text-slate-600 hover:bg-slate-50 hover:text-primary'}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100 space-y-1">
          {user?.role === 'Super Admin' && (
            <NavLink
              to="/incoming"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-white font-semibold text-sm hover:brightness-110 transition-all"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Tambah Barang
            </NavLink>
          )}
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive ? 'bg-slate-100 text-primary' : 'text-slate-600 hover:bg-slate-50'}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
          {user?.role === 'Super Admin' && (
            <NavLink to="/settings" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive ? 'bg-slate-100 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}>
              <span className="material-symbols-outlined text-[20px]">settings</span>
              <span className="text-sm font-medium">Pengaturan</span>
            </NavLink>
          )}
          <NavLink to="/help" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive ? 'bg-slate-100 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined text-[20px]">contact_support</span>
            <span className="text-sm font-medium">Bantuan</span>
          </NavLink>
        </div>
      </aside>

      <main className="flex-1 md:ml-sidebar-width min-h-screen">
        <header className="flex justify-between items-center w-full px-6 sticky top-0 z-30 h-16 bg-white border-b border-slate-200">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-50"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="font-h2 text-h2 text-primary">{getPageTitle()}</h2>
          </div>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 relative" ref={notifRef}>
                <button
                  className="p-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors relative cursor-pointer"
                  onClick={() => setNotifOpen(!notifOpen)}
                >
                  <span className="material-symbols-outlined">notifications</span>
                  {alerts.length > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50">
                    <div className="p-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-800">Pemberitahuan</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {alerts.length === 0 ? (
                        <div className="p-6 text-center text-sm text-slate-400">Tidak ada pemberitahuan</div>
                      ) : (
                        alerts.map(item => (
                          <div key={item.id} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 border-b border-slate-50 last:border-b-0">
                            <span className="material-symbols-outlined text-error text-lg">warning</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                              <p className="text-xs text-slate-500">Stok tersisa {item.stock} {item.unit || 'Unit'}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right">
                <p className="text-xs font-bold text-on-background">{user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Admin Sekolah'}</p>
                <p className="text-[10px] text-slate-500 uppercase">{user?.role || 'Super Admin'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                title="Logout"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                <span className="text-xs font-semibold">Keluar</span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-container-margin max-w-[1280px] w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
