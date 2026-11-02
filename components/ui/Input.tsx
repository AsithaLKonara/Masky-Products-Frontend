import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, helperText, required, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label className="font-poppins font-medium text-xs uppercase tracking-wider text-muted">
            {label} {required && <span className="text-accent">*</span>}
          </label>
        )}
        
        <input
          ref={ref}
          className={`w-full h-[54px] px-[20px] border rounded-full bg-surface font-poppins text-sm text-primary outline-none transition-all placeholder:text-muted/70
            ${error 
              ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500" 
              : "border-border focus:border-accent focus:ring-1 focus:ring-accent"
            }
            ${className}`}
          required={required}
          {...props}
        />
        
        {(error || helperText) && (
          <span className={`font-poppins text-xs ${error ? "text-red-500" : "text-muted"}`}>
            {error || helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
