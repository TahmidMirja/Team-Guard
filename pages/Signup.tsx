
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface SignupProps {
  onSignup: (name: string, email: string, password?: string) => Promise<boolean>;
}

const Signup: React.FC<SignupProps> = ({ onSignup }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 4) {
      setError('Password must be at least 4 characters for security.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const success = await onSignup(name, email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Email already exists in system database.');
      }
    } catch (err) {
      setError('Could not connect to registration server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 px-4 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md p-10 bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] shadow-2xl relative animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-3xl shadow-xl shadow-indigo-500/20 mb-6 transform hover:-rotate-6 transition-transform">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Initialize</h1>
          <p className="text-slate-400 mt-2 font-medium tracking-wide">Registering with Cloud Node...</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Full Identity Name</label>
            <input 
              type="text" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full px-5 py-4 bg-slate-950/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-white placeholder-slate-700 font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Work Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@team.com"
              className="w-full px-5 py-4 bg-slate-950/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-white placeholder-slate-700 font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Security Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 4 characters"
              className="w-full px-5 py-4 bg-slate-950/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-white placeholder-slate-700 font-medium"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-950/20 transform transition-all active:scale-95 uppercase tracking-widest text-sm ${loading ? 'opacity-50' : 'hover:from-indigo-500 hover:to-purple-500'}`}
          >
            {loading ? 'Registering...' : 'Create Security Identity'}
          </button>
        </form>

        <p className="mt-10 text-center text-slate-500 text-sm font-medium">
          Identity exists? <Link to="/login" className="text-indigo-400 font-black hover:text-indigo-300 transition-colors uppercase tracking-widest text-xs">Login Protocol</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
