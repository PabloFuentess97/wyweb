'use client';

import { createContext, forwardRef, useContext, useId } from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

type FieldContextValue = {
  id: string;
  descriptionId: string;
  errorId: string;
  invalid: boolean;
};

const FieldContext = createContext<FieldContextValue | null>(null);

function useFieldContext() {
  return useContext(FieldContext);
}

type FieldProps = React.HTMLAttributes<HTMLDivElement> & {
  invalid?: boolean;
};

export function Field({ className, invalid = false, children, ...props }: FieldProps) {
  const id = useId();
  const value: FieldContextValue = {
    id,
    descriptionId: `${id}-description`,
    errorId: `${id}-error`,
    invalid,
  };
  return (
    <FieldContext.Provider value={value}>
      <div className={cn('flex flex-col gap-1.5', className)} {...props}>
        {children}
      </div>
    </FieldContext.Provider>
  );
}

type LabelProps = React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
  required?: boolean;
};

export const FieldLabel = forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, required, children, htmlFor, ...props }, ref) => {
  const ctx = useFieldContext();
  return (
    <LabelPrimitive.Root
      ref={ref}
      htmlFor={htmlFor ?? ctx?.id}
      className={cn(
        'font-mono text-[11px] uppercase tracking-[0.08em] font-medium text-[var(--color-fg-muted)] leading-none',
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="text-[var(--color-danger)] ml-1" aria-hidden>
          *
        </span>
      )}
    </LabelPrimitive.Root>
  );
});
FieldLabel.displayName = 'FieldLabel';

export const FieldDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const ctx = useFieldContext();
  return (
    <p
      ref={ref}
      id={ctx?.descriptionId}
      className={cn('text-xs text-[var(--color-fg-muted)] leading-snug', className)}
      {...props}
    />
  );
});
FieldDescription.displayName = 'FieldDescription';

export const FieldError = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const ctx = useFieldContext();
  if (!children) return null;
  return (
    <p
      ref={ref}
      id={ctx?.errorId}
      role="alert"
      className={cn(
        'text-xs text-[var(--color-danger)] leading-snug font-medium',
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
});
FieldError.displayName = 'FieldError';

export function useFieldIds() {
  const ctx = useFieldContext();
  if (!ctx) return null;
  return {
    id: ctx.id,
    'aria-describedby': ctx.invalid ? ctx.errorId : ctx.descriptionId,
    'aria-invalid': ctx.invalid || undefined,
  };
}
