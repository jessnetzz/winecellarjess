import { SVGProps } from 'react';

export type IconName =
  | 'analytics'
  | 'bottle'
  | 'cellar'
  | 'collection'
  | 'dashboard'
  | 'glass'
  | 'plus'
  | 'search'
  | 'settings'
  | 'sparkle'
  | 'star'
  | 'trash'
  | 'user';

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
}

const paths: Record<IconName, string[]> = {
  analytics: ['M4 19V9', 'M10 19V5', 'M16 19v-7', 'M22 19H2'],
  bottle: ['M10 2h4', 'M11 2v5l-2 3v10a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V10l-2-3V2', 'M9 14h6'],
  cellar: ['M3 21V9l9-6 9 6v12', 'M7 21v-7h10v7', 'M9 11h6'],
  collection: ['M4 5h16', 'M4 12h16', 'M4 19h16', 'M8 3v4', 'M16 10v4', 'M12 17v4'],
  dashboard: ['M4 13h7V4H4z', 'M13 20h7V4h-7z', 'M4 20h7v-5H4z'],
  glass: ['M7 3h10l-1 8a4 4 0 0 1-8 0z', 'M12 15v6', 'M8 21h8'],
  plus: ['M12 5v14', 'M5 12h14'],
  search: ['m21 21-4.3-4.3', 'M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z'],
  settings: ['M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z', 'M19.4 15a1.8 1.8 0 0 0 .36 2l.05.05-2 3.46-.08-.02a1.8 1.8 0 0 0-1.92.74l-.04.06h-4l-.04-.06a1.8 1.8 0 0 0-1.92-.74l-.08.02-2-3.46.05-.05a1.8 1.8 0 0 0 .36-2l-.03-.08-3.05-1.76V9.16l3.05-1.76.03-.08a1.8 1.8 0 0 0-.36-2l-.05-.05 2-3.46.08.02a1.8 1.8 0 0 0 1.92-.74l.04-.06h4l.04.06a1.8 1.8 0 0 0 1.92.74l.08-.02 2 3.46-.05.05a1.8 1.8 0 0 0-.36 2l.03.08 3.05 1.76v3.68z'],
  sparkle: ['M12 2l1.5 5.2L19 9l-5.5 1.8L12 16l-1.5-5.2L5 9l5.5-1.8z', 'M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7z'],
  star: ['m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z'],
  trash: ['M4 7h16', 'M10 11v6', 'M14 11v6', 'M6 7l1 14h10l1-14', 'M9 7V4h6v3'],
  user: ['M20 21a8 8 0 0 0-16 0', 'M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10z'],
};

export default function Icon({ name, className = 'h-5 w-5', ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      {...props}
    >
      {paths[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
