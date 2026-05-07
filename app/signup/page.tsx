'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // Automatically sign in
      const signInRes = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (signInRes?.error) {
        throw new Error(signInRes.error);
      } else {
        router.push('/');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: string) => {
    signIn(provider, { callbackUrl: '/' });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 relative overflow-hidden" style={{ background: '#09090b' }}>
      <div className="animated-bg" />
      
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-15 animate-pulse" style={{ background: 'linear-gradient(to right, #ec4899, #8b5cf6)' }} />
        <div className="absolute -bottom-[20%] -right-[10%] w-[40vw] h-[40vw] rounded-full blur-[100px] opacity-20" style={{ background: 'linear-gradient(to right, #7c6bff, #4f46e5)' }} />
      </div>

      <div className="w-full max-w-md p-8 md:p-10 rounded-3xl shadow-2xl z-10 relative overflow-hidden" style={{ 
        background: 'rgba(24, 24, 27, 0.4)', 
        border: '1px solid rgba(255, 255, 255, 0.08)', 
        backdropFilter: 'blur(24px)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}>
        {/* Subtle top border glow */}
        <div className="absolute top-0 left-0 w-full h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(236, 72, 153, 0.8), transparent)' }} />
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6 shadow-lg" style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(139, 92, 246, 0.2))', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
               <path d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z" />
               <path d="M5.5 20c.6-2.5 3-4.5 6.5-4.5s5.9 2 6.5 4.5" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, #fff, #a1a1aa)' }}>Join Chat Ai</h1>
          <p className="text-sm font-medium" style={{ color: '#a1a1aa' }}>Create an account to get started</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl text-sm flex items-start gap-2" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-8">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#a1a1aa' }}>Name</label>
            <div className="relative flex items-center">
              <div className="absolute left-4 pointer-events-none flex items-center justify-center text-gray-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="w-full rounded-xl border transition-all duration-300 outline-none" 
                style={{ 
                  background: 'rgba(0, 0, 0, 0.3)', 
                  borderColor: 'rgba(255, 255, 255, 0.1)', 
                  color: 'white',
                  padding: '0.875rem 1rem 0.875rem 2.75rem',
                  fontSize: '0.95rem'
                }}
                placeholder="Your Name"
                onFocus={(e) => {
                  e.target.style.borderColor = '#ec4899';
                  e.target.style.background = 'rgba(0, 0, 0, 0.5)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.background = 'rgba(0, 0, 0, 0.3)';
                }}
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#a1a1aa' }}>Email</label>
            <div className="relative flex items-center">
              <div className="absolute left-4 pointer-events-none flex items-center justify-center text-gray-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
              </div>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="w-full rounded-xl border transition-all duration-300 outline-none" 
                style={{ 
                  background: 'rgba(0, 0, 0, 0.3)', 
                  borderColor: 'rgba(255, 255, 255, 0.1)', 
                  color: 'white',
                  padding: '0.875rem 1rem 0.875rem 2.75rem',
                  fontSize: '0.95rem'
                }}
                placeholder="you@example.com"
                onFocus={(e) => {
                  e.target.style.borderColor = '#ec4899';
                  e.target.style.background = 'rgba(0, 0, 0, 0.5)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.background = 'rgba(0, 0, 0, 0.3)';
                }}
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#a1a1aa' }}>Password</label>
            <div className="relative flex items-center">
              <div className="absolute left-4 pointer-events-none flex items-center justify-center text-gray-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="w-full rounded-xl border transition-all duration-300 outline-none" 
                style={{ 
                  background: 'rgba(0, 0, 0, 0.3)', 
                  borderColor: 'rgba(255, 255, 255, 0.1)', 
                  color: 'white',
                  padding: '0.875rem 1rem 0.875rem 2.75rem',
                  fontSize: '0.95rem'
                }}
                placeholder="••••••••"
                onFocus={(e) => {
                  e.target.style.borderColor = '#ec4899';
                  e.target.style.background = 'rgba(0, 0, 0, 0.5)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.background = 'rgba(0, 0, 0, 0.3)';
                }}
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-3 py-3 rounded-xl font-bold transition-all duration-300 flex justify-center items-center gap-2 hover:scale-[1.02] active:scale-95 shadow-lg relative overflow-hidden group"
            style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', color: 'white', opacity: loading ? 0.7 : 1 }}
          >
            <div className="absolute inset-0 w-full h-full bg-white/20 blur-md scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out" />
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Creating...
              </>
            ) : 'Create Account'}
          </button>
        </form>

        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px" style={{ background: 'rgba(255, 255, 255, 0.1)' }}></div>
          <span className="text-xs font-bold tracking-widest text-gray-500">OR CONTINUE WITH</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255, 255, 255, 0.1)' }}></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => handleOAuth('google')} className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:bg-white/5 active:scale-95" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white' }}>
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/><path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 01-6.723-4.823l-4.04 3.067A11.965 11.965 0 0012 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987z"/><path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21z"/><path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 014.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 000 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067z"/></svg>
            Google
          </button>
          <button onClick={() => handleOAuth('github')} className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:bg-white/5 active:scale-95" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white' }}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            GitHub
          </button>
        </div>

        <p className="text-center text-sm mt-10 font-medium" style={{ color: '#a1a1aa' }}>
          Already have an account? <Link href="/login" className="text-white hover:text-[#ec4899] transition-colors duration-200">Sign in securely</Link>
        </p>
      </div>
    </div>
  );
}
