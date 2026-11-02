import React from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "lg", isLoading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-poppins font-semibold uppercase tracking-widest transition-colors rounded-full focus:outline-none disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-primary text-background hover:bg-primary-hover disabled:bg-border",
      secondary: "bg-surface-elevated text-primary hover:bg-border",
      outline: "bg-transparent border border-primary text-primary hover:bg-surface-elevated",
      ghost: "bg-transparent text-primary hover:bg-surface-elevated",
      danger: "bg-red-500 text-white hover:bg-red-600",
    };
    
    const sizes = {
      sm: "h-[36px] px-6 text-xs",
      md: "h-[48px] px-8 text-sm",
      lg: "h-[54px] px-10 text-sm",
      icon: "h-10 w-10",
    };

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
      <button ref={ref} className={classes} disabled={disabled || isLoading} {...props}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
