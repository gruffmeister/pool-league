'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res.ok && !res.error) {
      router.push('/');
    } else {
      setError('Invalid login credentials');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold text-center">Login</h2>

        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button type="submit" className="w-full bg-green-700 text-white p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}
