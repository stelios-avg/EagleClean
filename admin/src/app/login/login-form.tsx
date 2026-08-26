'use client';

import { useActionState } from 'react';
import { login, type LoginState } from './actions';

const initial: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initial);

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-zinc-700">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-base text-ink outline-none transition focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/20"
          placeholder="admin@example.com"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-zinc-700">
        Κωδικός
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-base text-ink outline-none transition focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/20"
          placeholder="••••••••"
        />
      </label>
      {state.error ? (
        <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-full bg-gradient-to-br from-[#5EE0E0] to-[#1A8F8F] px-5 py-3.5 text-sm font-bold text-[#072424] shadow-[0_10px_24px_rgba(48,204,204,0.35)] transition hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? 'Σύνδεση…' : 'Σύνδεση στο Admin'}
      </button>
    </form>
  );
}
