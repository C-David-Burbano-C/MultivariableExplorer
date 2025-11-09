import type { SVGProps } from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className, width = 28, height = 28 }: LogoProps) {
  return (
    <Image
      src="/ME.png"
      alt="Multivariable Explorer Logo"
      width={width}
      height={height}
      className={`rounded-md ${className || ''}`}
    />
  );
}
