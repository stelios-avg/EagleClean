import Image from 'next/image';

const LOGO_ASPECT = 1014 / 720;

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
      alt="Eagle Watch Cleaning Services"
      height={height}
      width={Math.round(height * LOGO_ASPECT)}
      priority={priority}
      className="object-contain"
    />
  );
}
