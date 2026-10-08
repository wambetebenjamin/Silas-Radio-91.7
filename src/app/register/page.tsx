import type { Metadata } from 'next';
import Link from 'next/link';

import { SectionHead } from '@/components/SectionHead';
import { RegisterForm } from '@/components/RegisterForm';

export const metadata: Metadata = {
  title: 'Create a listener account',
  description:
    'Register a Silas Radio 91.7 listener account to save shows, sync favourite podcasts and enter contests. Protected by reCAPTCHA v3 with server-side verification.',
  alternates: { canonical: '/register' },
  robots: { index: false, follow: true },
};

export default function RegisterPage() {
  return (
    <div className="spad" style={{ background: '#fff' }}>
      <div className="sr-container max-w-[720px]">
        <SectionHead as="h1" eyebrow="Listeners" ghost="ACCOUNT" title="Create a listener account" />
        <p className="sr-lead mb-6">
          Accounts will keep your favourite shows, saved episodes and contest history in one place.
          Registration is protected by reCAPTCHA v3 with server-side verification, and your data is
          handled under the Kenya Data Protection Act 2019 — see the{' '}
          <Link className="underline" href="/legal/privacy-policy">
            Privacy Policy
          </Link>
          .
        </p>
        <RegisterForm />
      </div>
    </div>
  );
}
