'use client';

import { useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailnorm = email;
    const res = await fetch('/api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailnorm }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage(data.message);
      router.push(data.link);
    } else {
      alert(`Team creation failed: ${data.message}`);
    }

    
  };

  return (
    <div>
        <Header />
        <div className="flex justify-center items-center min-h-screen px-4">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold text-center">Reset Password</h2>
            <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded"
            />
            <button type="submit" className="w-full bg-green-700 text-white p-2 rounded">
            Send Reset Link
            </button>
            {message && <p className="text-center text-sm text-green-600">{message}</p>}
        </form>
        </div>
        <Footer />
        </div>
  );
}
