import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Spinner } from './spinner';

const button = cva(
  'inline-flex items-center justify-center gap-2 font-medium leading-none whitespace-nowrap transition-[background-color,color,border-color,transform,filter] duration-200 ease-[var(--ease-out)] focus-visible:outline-none focus-visible:[box-shadow:var(--ring)] disabled:opacity-45 disabled:cursor-not-allowed disabled:[transform:none] [&_svg]:shrink-0 [touch-action:manipulation]',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--color-fg-strong)] text-[var(--color-bg)] border border-[var(--color-fg-strong)] hover:[transform:translateY(-1px)] active:[transform:translateY(0)]',
        secondary:
          'bg-[var(--color-surface)] text-[var(--color-fg-strong)] border border-[var(--color-border)] hover:bg-[var(--color-bg-subtle)] hover:border-[var(--color-fg-muted)]',
        ghost:
          'text-[var(--color-fg)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-fg-strong)]',
        accent:
          'bg-[var(--color-accent)] text-[var(--color-accent-fg)] border border-[var(--color-accent)] hover:[filter:brightness(1.05)] hover:[transform:translateY(-1px)]',
        destructive:
          'bg-[var(--color-danger)] text-white border border-[var(--color-danger)] hover:[filter:brightness(1.05)]',
        link:
          'text-[var(--color-accent)] underline-offset-4 hover:underline px-0 h-auto',
      },
      size: {
        sm: 'h-8 px-3 text-[13px] rounded-[var(--radius-button)]',
        md: 'h-10 px-5 text-sm rounded-[var(--radius-button)]',
        lg: 'h-12 px-6 text-base rounded-[var(--radius-button)]',
        icon: 'h-10 w-10 rounded-[var(--radius-button)] p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button> & {
    asChild?: boolean;
    loading?: boolean;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading, disabled, children, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(button({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <>
            <Spinner className="h-4 w-4" />
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { button as buttonVariants };
