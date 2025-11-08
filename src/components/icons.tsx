import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 4h16v16H4z" opacity="0.1" />
      <path d="M4 4l16 16" />
      <path d="M4 12c4.418 0 8-3.582 8-8" />
      <path d="M20 12c-4.418 0-8 3.582-8 8" />
    </svg>
  );
}
