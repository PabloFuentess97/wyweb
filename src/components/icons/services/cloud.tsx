type Props = React.SVGAttributes<SVGSVGElement> & {
  title?: string;
};

export function CloudIcon({ title = 'Cloud', ...props }: Props) {
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
      <path d="M7 18.5 A4.5 4.5 0 0 1 6.5 9.5 A6 6 0 0 1 18 9.5 A4 4 0 0 1 18 18.5 Z" />
    </svg>
  );
}
