type Props = React.SVGAttributes<SVGSVGElement> & {
  title?: string;
};

export function MarkerWyweb({ title = 'Wyweb', ...props }: Props) {
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
      <path d="M5 8 L2.5 12 L5 16" />
      <path d="M19 8 L21.5 12 L19 16" />
      <path d="M14.5 6 L9.5 18" />
    </svg>
  );
}
