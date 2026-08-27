'use client';

function osmEmbedUrl(lat: number, lng: number) {
  const delta = 0.0035;
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta]
    .map((n) => n.toFixed(6))
    .join('%2C');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export function BookingMap({
  address,
  lat,
  lng,
}: {
  address: string;
  lat: number | null;
  lng: number | null;
}) {
  const hasPin =
    lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);
  const mapsHref = hasPin
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const directionsHref = hasPin
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  return (
    <div className="overflow-hidden rounded-2xl bg-zinc-50 ring-1 ring-black/5">
      {hasPin ? (
        <iframe
          title={`Χάρτης: ${address}`}
          src={osmEmbedUrl(lat, lng)}
          className="h-40 w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <iframe
          title={`Χάρτης: ${address}`}
          src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=16&output=embed`}
          className="h-40 w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <p className="min-w-0 flex-1 text-[11px] leading-snug text-zinc-500">{address}</p>
        <div className="flex gap-2">
          <a
            href={mapsHref}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-accent-dark ring-1 ring-zinc-200 transition hover:bg-accent-soft"
          >
            Χάρτης
          </a>
          <a
            href={directionsHref}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-zinc-800"
          >
            Οδηγίες
          </a>
        </div>
      </div>
    </div>
  );
}
