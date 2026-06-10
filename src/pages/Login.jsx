import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.login(email, password);
      login(response.user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left — Branding Area */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-[#0a3560] relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white rounded-full" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white rounded-full" />
          <div className="absolute top-1/3 -left-10 w-40 h-40 bg-white/20 rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-white/10 rounded-full" />
        </div>
        <div className="relative text-center px-12">
          <img src="/favicon.svg" alt="IQIS" className="block mx-auto w-24 h-24 mb-6" />
          <h1 className="text-white text-4xl font-bold mb-3" style={{fontFamily: "'Public Sans', system-ui"}}>IQIS</h1>
          <p className="text-white/80 text-lg max-w-sm mx-auto leading-relaxed">
            Sistem Manajemen Inventaris Sekolah — Kelola barang, peminjaman, dan pengambilan dalam satu platform terpadu.
          </p>
          <div className="mt-10 flex items-center justify-center gap-8 text-white/60 text-sm">
            <div className="text-center">
              <span className="material-symbols-outlined text-white/80 text-3xl block mb-1" style={{fontVariationSettings: "'FILL' 1"}}>inventory</span>
              <span>Barang</span>
            </div>
            <div className="text-center">
              <span className="material-symbols-outlined text-white/80 text-3xl block mb-1" style={{fontVariationSettings: "'FILL' 1"}}>assignment_return</span>
              <span>Peminjaman</span>
            </div>
            <div className="text-center">
              <span className="material-symbols-outlined text-white/80 text-3xl block mb-1" style={{fontVariationSettings: "'FILL' 1"}}>output</span>
              <span>Pengambilan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <img src="/favicon.svg" alt="IQIS" className="block mx-auto w-16 h-16 mb-3" />
            <h1 className="text-primary text-2xl font-bold" style={{fontFamily: "'Public Sans', system-ui"}}>IQIS</h1>
            <p className="text-on-surface-variant text-sm mt-1">Sistem Manajemen Inventaris Sekolah</p>
          </div>

          <div className="bg-surface border border-surface-variant rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-1" style={{fontFamily: "'Public Sans', system-ui"}}>Selamat Datang</h2>
            <p className="text-sm text-on-surface-variant mb-8">Masuk ke akun Anda untuk melanjutkan</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">Email</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">mail</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-outline rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm"
                    placeholder="admin@sekolah.sch.id"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">lock</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-outline rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  <span className="material-symbols-outlined text-lg">error</span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-lg animate-spin">refresh</span>
                    Memproses...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">login</span>
                    Masuk
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            Belum punya akun?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
