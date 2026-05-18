type Props = React.SVGAttributes<SVGSVGElement> & {
  title?: string;
};

export function NetworkIcon({ title = 'Conectividad', ...props }: Props) {
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
      <circle cx="12" cy="12" r="2.5" />
      <circle cx="4.5" cy="5" r="1.75" />
      <circle cx="19.5" cy="5" r="1.75" />
      <circle cx="4.5" cy="19" r="1.75" />
      <circle cx="19.5" cy="19" r="1.75" />
      <path d="M5.7 6.2 L9.8 10.3" />
      <path d="M18.3 6.2 L14.2 10.3" />
      <path d="M5.7 17.8 L9.8 13.7" />
      <path d="M18.3 17.8 L14.2 13.7" />
    </svg>
  );
}
