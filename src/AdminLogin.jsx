import { useState } from 'react';
import { supabase } from './supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError('Credenciales incorrectas');
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen bg-zinc-950 flex items-center justify-center p-4"
      style={{ fontFamily: "'DM Sans',sans-serif" }}
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-px bg-orange-500" />
          <span className="text-[9px] tracking-[0.3em] uppercase text-orange-500 font-bold">
            Admin Panel
          </span>
        </div>
        <h1
          className="text-3xl font-black text-white mb-6"
          style={{
            fontFamily: "'Barlow Condensed',sans-serif",
            letterSpacing: '0.04em',
          }}
        >
          PRIME MOTORING
        </h1>
        {error && (
          <p className="text-red-400 text-xs mb-4 bg-red-500/10 px-3 py-2 rounded-xl">
            {error}
          </p>
        )}
        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-orange-500/50"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-orange-500/50"
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="py-3 bg-orange-500 hover:bg-orange-400 text-black font-black text-sm rounded-xl uppercase tracking-wider transition-all shadow-[0_0_16px_rgba(249,115,22,0.3)]"
          >
            {loading ? 'Entrando...' : 'Entrar →'}
          </button>
        </div>
      </div>
    </div>
  );
}
