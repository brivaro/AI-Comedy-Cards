import React, { useState } from 'react';
import { SignIn, UserPlus, User as UserIcon, Lock } from 'phosphor-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Card } from '../../ui/Card';

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
    <div className="w-full max-w-md animate-fade-in">
      <Card className="glass-strong p-8 border border-white/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 mb-4 shadow-lg shadow-purple-500/30">
            {isRegistering ? (
              <UserPlus className="w-8 h-8 text-white" weight="bold" />
            ) : (
              <SignIn className="w-8 h-8 text-white" weight="bold" />
            )}
          </div>
          <h2 className="text-3xl font-black text-white mb-2">
            {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h2>
          <p className="text-gray-400 text-sm">
            {isRegistering 
              ? 'Únete a la diversión' 
              : 'Bienvenido de vuelta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername((e.target as HTMLInputElement).value)}
            placeholder="Nombre de usuario"
            icon={<UserIcon className="w-5 h-5" weight="bold" />}
            required
            minLength={3}
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
            placeholder="Contraseña"
            icon={<Lock className="w-5 h-5" weight="bold" />}
            required
            minLength={8}
          />

          {error && (
            <div className="glass-card p-3 rounded-xl border border-red-500/30 bg-red-500/10">
              <p className="text-red-400 text-sm text-center font-medium">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
            icon={isRegistering ? <UserPlus weight="bold" /> : <SignIn weight="bold" />}
          >
            {isRegistering ? 'Registrarse' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors"
          >
            {isRegistering 
              ? '¿Ya tienes cuenta? Inicia sesión' 
              : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </Card>
    </div>
  );
};