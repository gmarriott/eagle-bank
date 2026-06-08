import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { FormAlert } from './FormAlert';
import { loginSchema, type LoginValues } from './schemas';
import { useAuth } from './AuthContext';
import { Button, TextField } from '@/components/ui';
import { HttpError } from '@/lib/api/client';

type LocationState = {
  from?: { pathname: string };
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    setFormError(null);
    try {
      await login(values);
      const dest = (location.state as LocationState)?.from?.pathname ?? '/dashboard';
      navigate(dest, { replace: true });
    } catch (err) {
      setFormError(err instanceof HttpError ? err.message : 'Unable to sign in. Try again.');
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your accounts."
      footer={
        <>
          New to Eagle Bank? <Link to="/register">Create an account</Link>
        </>
      }
    >
      {formError && <FormAlert message={formError} />}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
        <p className="text-xs text-text-muted text-center [&_code]:font-mono [&_code]:bg-surface-sunken [&_code]:px-[5px] [&_code]:py-[1px] [&_code]:rounded-[4px]">
          Demo login: <code>george@eaglebank.test</code> / <code>password123</code>
        </p>
      </form>
    </AuthLayout>
  );
}
