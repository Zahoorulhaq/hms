// app/login/page.tsx
'use client';

import { useState, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type FormData = {
  email: string;
  password: string;
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  // Already logged in → redirect
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/');
    }
  }, [status, router]);

  // Show error from NextAuth redirect (?error=CredentialsSignin)
  useEffect(() => {
    const error = searchParams?.get('error');
    if (error) {
      setServerError('Invalid email or password.');
    }
  }, [searchParams]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    setServerError('');

    const result = await signIn('credentials', {
      email: data.email.toLowerCase(),
      password: data.password,
      redirect: false, // handle redirect manually
    });

    if (result?.error) {
      // result.error contains the message we threw in authorize()
      setServerError(
        result.error === 'CredentialsSignin' ? 'Invalid email or password.' : result.error
      );
      setLoading(false);
      return;
    }

    if (result?.ok) {
      router.replace('/'); // success → go to dashboard
    }
  };

  if (status === 'loading') {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="auth-container d-flex justify-content-center">
      <div className="auth-wrapper row w-100 p-3">
        {/* Left decorative panel */}
        <div className="auth-image col-md-3 d-none d-md-flex justify-content-center align-items-center" />

        {/* Form */}
        <div className="auth-form-section col-md-6 d-flex flex-column align-items-center p-0">
          <div className="form-class w-100">
            <form onSubmit={handleSubmit(onSubmit)} className="w-75 mx-auto pb-5">
              <h3 className="text-center mb-4">Login</h3>

              {/* Server error banner */}
              {serverError && (
                <div className="alert alert-danger py-2" role="alert">
                  {serverError}
                </div>
              )}

              {/* Email */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-semibold">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoFocus
                  placeholder="Enter your email address"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email address',
                    },
                  })}
                />
                {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
              </div>

              {/* Password */}
              <div className="mb-3">
                <label htmlFor="password" className="form-label fw-semibold">
                  Password
                </label>
                <div className="position-relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    {...register('password', { required: 'Password is required' })}
                  />
                  <span
                    onClick={() => setShowPassword((p) => !p)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      cursor: 'pointer',
                    }}>
                    <Image
                      src={showPassword ? '/show.svg' : '/Hide.svg'}
                      alt="toggle password"
                      width={18}
                      height={15}
                    />
                  </span>
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password.message}</div>
                  )}
                </div>
              </div>

              {/* Remember me + forgot */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <label className="form-check-label d-flex align-items-center gap-2">
                  <input type="checkbox" className="form-check-input m-0" />
                  Remember me
                </label>
                <Link href="/forgot-password">Forgot password?</Link>
              </div>

              {/* Submit */}
              <button type="submit" className="btn btn-primary w-100 fw-bold" disabled={loading}>
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" />
                ) : (
                  'Login'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right decorative panel */}
        <div className="auth-image col-md-3 d-none d-md-flex justify-content-center align-items-center" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback="">
      <LoginForm />
    </Suspense>
  );
}
