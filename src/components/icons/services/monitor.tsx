type Props = React.SVGAttributes<SVGSVGElement> & {
  title?: string;
};

export function MonitorIcon({ title = 'Monitorización', ...props }: Props) {
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
      <rect x="2.5" y="4" width="19" height="13" rx="1.5" />
      <path d="M9 21 L15 21" />
      <path d="M12 17 L12 21" />
      <path d="M5.5 13 L8.5 10 L11 12.5 L14.5 8.5 L18.5 8.5" />
    </svg>
  );
}
