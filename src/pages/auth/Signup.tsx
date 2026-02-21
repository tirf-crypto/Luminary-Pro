import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Ticket, ArrowRight } from 'lucide-react';
import { AuthLayout } from '@/components/layout';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, validateInviteCode } = useAuthStore();
  const [step, setStep] = useState<'invite' | 'details'>('invite');
  const [inviteCode, setInviteCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const isValid = await validateInviteCode(inviteCode);
      if (isValid) {
        setStep('details');
      } else {
        setError('Invalid or expired invite code');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to validate invite code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signUp(email, password, fullName, inviteCode);
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">
          {step === 'invite' ? 'Enter Invite Code' : 'Create Account'}
        </h1>
        <p className="text-zinc-400">
          {step === 'invite'
            ? 'Luminary is invite-only during beta'
            : 'Fill in your details to get started'}
        </p>
      </div>

      {step === 'invite' ? (
        <form onSubmit={handleValidateInvite} className="space-y-4">
          <Input
            label="Invite Code"
            placeholder="Enter your invite code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            leftIcon={<Ticket className="w-4 h-4" />}
            required
          />

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Continue
          </Button>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-amber-400 hover:underline"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            required
          />

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
            placeholder="Create a strong password"
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

          <p className="text-xs text-zinc-500">
            Password must be at least 8 characters with uppercase, lowercase, and a number.
          </p>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create Account
          </Button>

          <button
            type="button"
            onClick={() => setStep('invite')}
            className="w-full text-sm text-zinc-400 hover:text-zinc-300"
          >
            Back to invite code
          </button>
        </form>
      )}
    </AuthLayout>
  );
};
