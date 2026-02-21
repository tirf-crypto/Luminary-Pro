import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { AuthLayout } from '@/components/layout';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">
          Welcome back
        </h1>
        <p className="text-zinc-400">
          Sign in to continue your journey
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          type={showPassword ? 'text' : 'password'}
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-zinc-500 hover:text-zinc-300"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
          required
        />

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500"
            />
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="text-amber-400 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-zinc-400">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-amber-400 font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>

      {/* Invite-only notice */}
      <div className="mt-6 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
        <p className="text-sm text-amber-400/80 text-center">
          Luminary is currently in private beta. You'll need an invite code to sign up.
        </p>
      </div>
    </AuthLayout>
  );
};
