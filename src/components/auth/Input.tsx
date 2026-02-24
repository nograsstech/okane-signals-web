import { forwardRef, type InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1">
        {label && (
          <Label
            htmlFor={inputId}
            className="text-foreground/60 font-mono text-xs tracking-widest uppercase"
          >
            {label}
          </Label>
        )}
        <Input
          id={inputId}
          ref={ref}
          className={cn(
            "bg-background/50 h-auto px-4 py-3 font-mono",
            "placeholder:text-foreground/30",
            error && "border-destructive/50 aria-invalid:border-destructive",
            className,
          )}
          aria-invalid={!!error}
          {...props}
        />
        {error && (
          <span className="text-destructive font-mono text-xs">{error}</span>
        )}
      </div>
    );
  },
);

AuthInput.displayName = "AuthInput";

export { AuthInput };
