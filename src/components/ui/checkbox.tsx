'use client';

import { forwardRef } from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Checkbox = forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer h-[18px] w-[18px] shrink-0 rounded-[var(--radius-1)] border bg-[var(--color-surface)] transition-colors duration-150',
      'border-[var(--color-border-strong)] hover:border-[var(--color-fg-muted)]',
      'focus-visible:outline-none focus-visible:[box-shadow:var(--ring)]',
      'disabled:cursor-not-allowed disabled:opacity-45',
      'data-[state=checked]:bg-[var(--color-accent)] data-[state=checked]:border-[var(--color-accent)] data-[state=checked]:text-[var(--color-accent-fg)]',
      'data-[state=indeterminate]:bg-[var(--color-accent)] data-[state=indeterminate]:border-[var(--color-accent)] data-[state=indeterminate]:text-[var(--color-accent-fg)]',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
      {props.checked === 'indeterminate' ? (
        <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
      ) : (
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
