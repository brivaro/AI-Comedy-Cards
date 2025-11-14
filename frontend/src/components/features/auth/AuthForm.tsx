import React, { useState } from 'react';
import { SignIn, UserPlus, User as UserIcon, Lock } from 'phosphor-react';

interface AuthFormProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (username: string, password: string) => Promise<void>;
  isLoading: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onLogin, onRegister, isLoading }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username.length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      if (isRegistering) {
        await onRegister(username, password);
      } else {
        await onLogin(username, password);
      }
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center w-full px-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="glass-strong p-8 rounded-3xl border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
          {/* Header del formulario */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 mb-5 shadow-2xl shadow-cyan-500/40 relative overflow-hidden">
              {/* Efecto de brillo animado */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
              {isRegistering ? (
                <UserPlus className="w-10 h-10 text-white relative z-10" weight="bold" />
              ) : (
                <SignIn className="w-10 h-10 text-white relative z-10" weight="bold" />
              )}
            </div>
            <h2 className="text-4xl font-black text-transparent bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text mb-3">
              {isRegistering ? 'Crear Cuenta' : 'Bienvenido'}
            </h2>
            <p className="text-gray-300 text-base font-medium">
              {isRegistering 
                ? 'Únete a la diversión ahora' 
                : 'Inicia sesión para continuar'}
            </p>
          </div>

          {/* Formulario */}
          <div className="space-y-5">
            {/* Input de usuario */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-200 ml-1">
                Nombre de usuario
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400">
                  <UserIcon className="w-5 h-5" weight="bold" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Tu nombre de usuario"
                  className="w-full bg-slate-900/90 backdrop-blur-xl border-2 border-slate-600/50 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300"
                  required
                  minLength={3}
                />
              </div>
            </div>

            {/* Input de contraseña */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-200 ml-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400">
                  <Lock className="w-5 h-5" weight="bold" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña segura"
                  className="w-full bg-slate-900/90 backdrop-blur-xl border-2 border-slate-600/50 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300"
                  required
                  minLength={8}
                />
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="glass-card p-4 rounded-xl border-2 border-red-500/50 bg-red-500/10 animate-pop-in">
                <p className="text-red-300 text-sm text-center font-semibold">{error}</p>
              </div>
            )}

            {/* Botón de submit */}
            <button
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-cyan-500/30 border border-cyan-500/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isRegistering ? (
                    <UserPlus className="w-6 h-6" weight="bold" />
                  ) : (
                    <SignIn className="w-6 h-6" weight="bold" />
                  )}
                  {isRegistering ? 'Registrarse' : 'Iniciar Sesión'}
                </>
              )}
            </button>
          </div>

          {/* Cambiar entre login/registro */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-cyan-300 hover:text-cyan-200 text-sm font-bold transition-colors underline underline-offset-4 decoration-2 decoration-cyan-500/50 hover:decoration-cyan-400"
            >
              {isRegistering 
                ? '¿Ya tienes cuenta? Inicia sesión' 
                : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Agregar animación de shimmer al CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;
document.head.appendChild(style);