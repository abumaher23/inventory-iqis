import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <span className="material-symbols-outlined text-slate-300 text-8xl mb-4">search_off</span>
        <h2 className="font-h1 text-h1 text-slate-700 mb-2">404 - Halaman Tidak Ditemukan</h2>
        <p className="text-slate-500 mb-6">Halaman yang Anda cari tidak tersedia dalam sistem.</p>
        <Link to="/" className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:brightness-110">
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
