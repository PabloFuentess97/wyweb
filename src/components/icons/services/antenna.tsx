type Props = React.SVGAttributes<SVGSVGElement> & {
  title?: string;
};

export function AntennaIcon({ title = 'Antena · radio', ...props }: Props) {
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
      <path d="M12 12 L12 21" />
      <path d="M9 21 L15 21" />
      <circle cx="12" cy="11" r="1" fill="currentColor" stroke="none" />
      <path d="M9 8 A5 5 0 0 1 15 8" />
      <path d="M6.5 5.5 A8.5 8.5 0 0 1 17.5 5.5" />
      <path d="M4 3 A12 12 0 0 1 20 3" />
    </svg>
  );
}
