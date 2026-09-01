import Image from 'next/image';

const LOGO_ASPECT = 908 / 613;

export function BrandLogo({
  height = 48,
  priority = false,
}: {
  height?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo.png"
      alt="Cleanovox"
      height={height}
      width={Math.round(height * LOGO_ASPECT)}
      priority={priority}
      className="object-contain"
    />
  );
}
