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
          className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-base text-zinc-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/15"
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
          className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-base text-zinc-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/15"
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
        className="mt-1 rounded-full bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(41,70,245,0.28)] transition hover:bg-blue-700 hover:shadow-[0_12px_28px_rgba(41,70,245,0.34)] disabled:opacity-60"
      >
        {pending ? 'Σύνδεση…' : 'Σύνδεση στο Admin'}
      </button>
    </form>
  );
}
