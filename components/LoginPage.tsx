import React, { useState } from 'react';
import { Lock, ArrowRight, Loader2, Mail, ShieldCheck } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simula delay de rede
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess();
    }, 1500);
  };

  return (
    // Usando font-inter para um visual profissional de SaaS (Pé no chão)
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden font-inter">
      
      {/* Background Grid Sutil */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      
      {/* Container Principal */}
      <div className="w-full max-w-md relative z-30">
        
        {/* Logo - Versão Limpa */}
        <div className="text-center mb-10">
           <div className="inline-flex items-center justify-center gap-3 mb-3">
             <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-900/20">
                G
             </div>
             <span className="text-2xl font-bold text-white tracking-tight">Gôndola.ai</span>
           </div>
           <p className="text-zinc-500 text-sm font-medium">Sistema de Gestão de Validade</p>
        </div>

        {/* Wrapper do Card */}
        <div className="relative group">
            
            {/* O BRILHO VERDE (Exatamente igual ao Hero) */}
            {/* glow params: from-brand-500/10, blur-2xl, rotate-6 */}
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/10 to-transparent blur-2xl transform rotate-6 scale-100 -z-10 rounded-3xl transition-all duration-700 group-hover:scale-105 group-hover:from-brand-500/15"></div>

            {/* Card de Login */}
            <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 shadow-2xl rounded-2xl overflow-hidden p-8">
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-white">Bem-vindo de volta</h2>
                  <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                    Entre com suas credenciais corporativas para acessar o painel de controle.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">Email</label>
                        <div className="relative group/input">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within/input:text-brand-500 transition-colors" size={18} />
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-zinc-950/50 border border-zinc-700/50 text-white pl-11 pr-4 py-3 rounded-lg focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 transition-all placeholder:text-zinc-700 font-medium"
                                placeholder="seunome@empresa.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                         <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">Senha</label>
                            <a href="#" className="text-xs text-brand-500 hover:text-brand-400 font-medium transition-colors">Esqueceu a senha?</a>
                         </div>
                        <div className="relative group/input">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within/input:text-brand-500 transition-colors" size={18} />
                            <input 
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-zinc-950/50 border border-zinc-700/50 text-white pl-11 pr-4 py-3 rounded-lg focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 transition-all placeholder:text-zinc-700 font-medium"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-900/20 hover:shadow-brand-500/20 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Autenticando...
                            </>
                        ) : (
                            <>
                                Acessar Plataforma
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>
                
                <div className="mt-8 pt-6 border-t border-zinc-800/50 text-center">
                    <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 uppercase font-medium tracking-wider">
                        <ShieldCheck size={12} />
                        Ambiente Seguro & Criptografado
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-10 flex justify-center gap-8 text-xs text-zinc-600 font-medium">
            <a href="#" className="hover:text-zinc-400 transition-colors">Termos</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Suporte</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;