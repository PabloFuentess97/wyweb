import { cn } from '@/lib/utils';

type Props = React.SVGAttributes<SVGSVGElement> & {
  className?: string;
};

export function Spinner({ className, ...props }: Props) {
  return (
    <svg
      className={cn('h-4 w-4 animate-spin text-current', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="status"
      aria-label="Cargando"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
      />
    </svg>
  );
}
