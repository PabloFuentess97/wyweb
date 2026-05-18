type Props = React.SVGAttributes<SVGSVGElement> & {
  title?: string;
};

export function CpuIcon({ title = 'IoT · sensórica', ...props }: Props) {
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
      <rect x="5" y="5" width="14" height="14" rx="1.5" />
      <rect x="9" y="9" width="6" height="6" rx="0.5" />
      <path d="M9 2 L9 5" />
      <path d="M15 2 L15 5" />
      <path d="M9 19 L9 22" />
      <path d="M15 19 L15 22" />
      <path d="M2 9 L5 9" />
      <path d="M2 15 L5 15" />
      <path d="M19 9 L22 9" />
      <path d="M19 15 L22 15" />
    </svg>
  );
}
