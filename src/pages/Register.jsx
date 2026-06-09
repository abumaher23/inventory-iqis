import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';

export default function Register() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    instansi: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirm_password) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setLoading(true);

    try {
      const response = await api.register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        instansi: formData.instansi,
        email: formData.email,
        password: formData.password,
      });
      login(response.user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Pendaftaran gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-surface rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="font-h1 text-on-surface">IQIS</h1>
          <p className="font-body-md text-on-surface-variant mt-2">
            Daftar Akun Baru
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-body-md text-on-surface mb-2">
                Nama Depan
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-background border border-outline rounded-xl
                           text-on-surface focus:outline-none focus:border-primary"
                placeholder="Nama depan"
                required
              />
            </div>
            <div>
              <label className="block font-body-md text-on-surface mb-2">
                Nama Belakang
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-background border border-outline rounded-xl
                           text-on-surface focus:outline-none focus:border-primary"
                placeholder="Nama belakang"
              />
            </div>
          </div>

          <div>
            <label className="block font-body-md text-on-surface mb-2">
              Instansi
            </label>
            <input
              type="text"
              name="instansi"
              value={formData.instansi}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-background border border-outline rounded-xl
                         text-on-surface focus:outline-none focus:border-primary"
              placeholder="Nama sekolah/instansi"
              required
            />
          </div>

          <div>
            <label className="block font-body-md text-on-surface mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-background border border-outline rounded-xl
                         text-on-surface focus:outline-none focus:border-primary"
              placeholder="Masukkan email"
              required
            />
          </div>

          <div>
            <label className="block font-body-md text-on-surface mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-background border border-outline rounded-xl
                         text-on-surface focus:outline-none focus:border-primary"
              placeholder="Minimal 6 karakter"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block font-body-md text-on-surface mb-2">
              Konfirmasi Password
            </label>
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-background border border-outline rounded-xl
                         text-on-surface focus:outline-none focus:border-primary"
              placeholder="Ulangi password"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-error-container text-on-error-container rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-on-primary rounded-xl font-body-md
                       hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-on-surface-variant">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
