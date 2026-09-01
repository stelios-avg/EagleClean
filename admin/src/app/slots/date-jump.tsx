'use client';

import { useRouter } from 'next/navigation';

export function DateJump({ date }: { date: string }) {
  const router = useRouter();
  return (
    <input
      type="date"
      value={date}
      onChange={(e) => {
        const next = e.target.value;
        router.push(next ? `/slots?date=${next}` : '/slots');
      }}
      className="rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-bold text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/25"
    />
  );
}
