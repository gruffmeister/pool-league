'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import ResetPasswordForm from './reset-password-form';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function ResetPasswordPage() {
  

  return (
    <div><Header />
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    <Footer />
    </div>
  );
}
