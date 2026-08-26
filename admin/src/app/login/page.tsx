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
    <main className="grid min-h-full flex-1 lg:grid-cols-[minmax(280px,42%)_1fr]">
      <section className="relative hidden overflow-hidden bg-ink px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-10 h-80 w-80 rounded-full bg-accent-dark/40 blur-3xl" />
        <div className="relative z-10">
          <div className="inline-flex rounded-2xl bg-white px-4 py-3">
            <BrandLogo height={52} priority />
          </div>
          <p className="mt-10 text-xs font-bold tracking-[0.22em] text-accent">
            ADMIN PANEL
          </p>
          <h1 className="mt-3 max-w-sm text-4xl font-extrabold leading-tight tracking-tight">
            Κρατήσεις, πελάτες, εγκρίσεις — σε ένα μέρος.
          </h1>
        </div>
        <p className="relative z-10 max-w-sm text-sm leading-relaxed text-white/65">
          Το ίδιο brand με την εφαρμογή: ink, turquoise, καθαρή ροή για την ομάδα
          υποστήριξης.
        </p>
      </section>

      <section className="relative flex items-center justify-center overflow-hidden px-6 py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#d4f4f4_0%,_#f7fcfc_48%,_#eef7f7_100%)]" />
        <div className="pointer-events-none absolute -right-16 bottom-8 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />

        <div className="animate-fade-up relative z-10 w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="mb-5 rounded-[28px] bg-white px-6 py-5 shadow-[0_18px_50px_rgba(16,22,22,0.08)] ring-1 ring-black/5 lg:hidden">
              <BrandLogo height={72} priority />
            </div>
            <p className="text-xs font-bold tracking-[0.18em] text-accent-dark">
              ADMIN PANEL
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">
              Καλώς ήρθες
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">
              Συνδέσου για να δεις νέες κρατήσεις και να τις εγκρίνεις ή να τις
              απορρίψεις.
            </p>
          </div>

          <div className="rounded-[28px] bg-white p-7 shadow-[0_18px_50px_rgba(16,22,22,0.08)] ring-1 ring-black/5">
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
