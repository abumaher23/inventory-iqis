import { NavLink, useLocation, Outlet } from 'react-router-dom';
import { useState } from 'react';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', icon: 'dashboard', label: 'Dashboard' },
    { path: '/inventory', icon: 'inventory_2', label: 'Inventaris' },
    { path: '/transactions', icon: 'receipt_long', label: 'Log Transaksi' },
    { path: '/borrowing', icon: 'assignment_return', label: 'Peminjaman' },
    { path: '/withdrawal', icon: 'output', label: 'Pengambilan' },
  ];

  const getPageTitle = () => {
    const item = navItems.find(item => item.path === location.pathname);
    return item ? item.label : 'Dashboard';
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className={`fixed left-0 top-0 h-full w-sidebar-width border-r border-slate-200 bg-white flex flex-col py-6 px-4 gap-2 z-40 ${sidebarOpen ? 'block' : 'hidden'} md:flex`}>
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-white" style={{fontVariationSettings: "'FILL' 1"}}>school</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-blue-900 leading-tight">IQIS</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Manajemen Aset Sekolah</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive ? 'bg-blue-50 text-blue-900 border-r-4 border-blue-800' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-800'}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100 space-y-1">
          <NavLink
            to="/incoming"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-white font-semibold text-sm hover:brightness-110 transition-all"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Tambah Barang
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive ? 'bg-slate-100 text-blue-800' : 'text-slate-600 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span className="text-sm font-medium">Pengaturan</span>
          </NavLink>
          <NavLink to="/help" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive ? 'bg-slate-100 text-blue-800' : 'text-slate-600 hover:bg-slate-50'}`}>
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
            <div className="hidden md:flex relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Cari..." type="text"/>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
              </button>
              <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
                <span className="material-symbols-outlined">help_outline</span>
              </button>
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right">
                <p className="text-xs font-bold text-on-background">Admin Sekolah</p>
                <p className="text-[10px] text-slate-500 uppercase">Super Admin</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white font-bold text-xs">
                AD
              </div>
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
