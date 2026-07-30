import { redirect } from 'next/navigation';
import { BrandLogo } from '@/components/brand-logo';
import { getAdminProfile } from '@/lib/auth';
import { LoginForm } from './login-form';

export default async function LoginPage() {
  const profile = await getAdminProfile();
  if (profile) {
    redirect('/bookings');
  }

  return (
    <main className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden px-6 py-16">
      {/* Atmosphere */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#dbe4ff_0%,_#f4f6fb_45%,_#eef1f8_100%)]" />
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-[#0B0C10]/08 blur-3xl" />

      <div className="animate-fade-up relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 rounded-[28px] bg-white px-6 py-5 shadow-[0_18px_50px_rgba(16,18,24,0.08)] ring-1 ring-black/5">
            <BrandLogo height={86} priority />
          </div>
          <p className="text-xs font-bold tracking-[0.18em] text-blue-600">
            ADMIN PANEL
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900">
            Καλώς ήρθες
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">
            Διαχείριση κρατήσεων, αποδοχή αιτημάτων και υποστήριξη πελατών.
          </p>
        </div>

        <div className="rounded-[28px] bg-white p-7 shadow-[0_18px_50px_rgba(16,18,24,0.08)] ring-1 ring-black/5">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
