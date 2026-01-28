
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface LoginProps {
  onLogin: (email: string, password?: string) => Promise<boolean>;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 animate-in">
      <div className="w-full max-w-sm premium-card p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-emerald-500 text-xl font-black">TG</div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">TeamGuard</h1>
          <p className="text-[10px] text-zinc-600 font-black uppercase mt-2 tracking-[0.3em]">Authorized Access</p>
        </div>

        <form onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          setError('');
          const ok = await onLogin(email, password);
          if (!ok) { 
            setError('Verification failed. Use correct credentials.'); 
            setLoading(false); 
          }
        }} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase ml-1 tracking-widest">Work Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@team.com" className="w-full bg-zinc-950 border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-emerald-500 transition-all text-white placeholder-zinc-800" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase ml-1 tracking-widest">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-zinc-950 border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-emerald-500 transition-all text-white placeholder-zinc-800" />
          </div>
          {error && <p className="text-rose-500 text-[10px] text-center font-black uppercase tracking-widest animate-pulse">{error}</p>}
          <button disabled={loading} className="btn-emerald w-full py-4 rounded-xl text-xs uppercase tracking-widest mt-2">{loading ? 'Verifying...' : 'Authenticate'}</button>
        </form>

        <p className="text-center text-[10px] text-zinc-600 mt-10 font-bold uppercase tracking-widest">New Agent? <Link to="/signup" className="text-emerald-500">Initialize Identity</Link></p>
      </div>
    </div>
  );
};

export default Login;
