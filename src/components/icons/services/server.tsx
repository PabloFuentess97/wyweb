type Props = React.SVGAttributes<SVGSVGElement> & {
  title?: string;
};

export function ServerIcon({ title = 'Servidores · racks', ...props }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>{title}</title>
      <rect x="3" y="3.5" width="18" height="6" rx="1" />
      <rect x="3" y="14.5" width="18" height="6" rx="1" />
      <path d="M6.5 6.5 L6.5 6.5" />
      <circle cx="6.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
      <path d="M9 6.5 L13 6.5" />
      <path d="M16.5 6.5 L18.5 6.5" />
      <circle cx="6.5" cy="17.5" r="0.6" fill="currentColor" stroke="none" />
      <path d="M9 17.5 L13 17.5" />
      <path d="M16.5 17.5 L18.5 17.5" />
    </svg>
  );
}
