import type { ReactNode } from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';
import { logout } from '@/app/login/actions';

export function AdminHeader({
  title,
  email,
  extra,
}: {
  title: string;
  email: string | null;
  extra?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-ink text-white shadow-[0_12px_40px_rgba(14,20,20,0.28)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-white px-3 py-2 shadow-sm">
            <BrandLogo height={42} priority />
          </div>
          <div>
            <p className="text-[11px] font-bold tracking-[0.16em] text-accent">ADMIN PANEL</p>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight">{title}</h1>
              {extra}
            </div>
            <nav className="mt-1 flex gap-3 text-xs font-bold">
              <Link className="text-white/70 transition hover:text-accent" href="/bookings">
                Κρατήσεις
              </Link>
              <Link className="text-white/70 transition hover:text-accent" href="/slots">
                Ώρες
              </Link>
            </nav>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 sm:block">
            {email}
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full bg-white px-4 py-2 text-xs font-bold text-ink transition hover:bg-accent-soft active:scale-[0.98]"
            >
              Αποσύνδεση
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
