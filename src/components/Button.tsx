import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  glassmorphic?: boolean;
  animated?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  glassmorphic = false,
  animated = true,
  className = '',
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 relative overflow-hidden focus:outline-none group";
  
  const variants = {
    primary: "bg-accent hover:bg-accent/90 text-white shadow-lg hover:shadow-accent/30 hover:shadow-lg focus:ring-2 focus:ring-accent/50",
    secondary: "bg-[#333] hover:bg-[#444] text-white shadow-lg hover:shadow-black/30 hover:shadow-lg focus:ring-2 focus:ring-white/20",
    outline: "bg-transparent border-2 border-accent text-accent hover:bg-accent/10 focus:ring-2 focus:ring-accent/30",
    ghost: "bg-transparent hover:bg-white/10 text-text-primary hover:text-accent focus:ring-2 focus:ring-white/20",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-600/30 hover:shadow-lg focus:ring-2 focus:ring-red-600/50"
  };
  
  const sizes = {
    xs: "px-2.5 py-1 text-xs",
    sm: "px-3.5 py-1.5 text-sm",
    md: "px-4.5 py-2.5 text-base",
    lg: "px-6.5 py-3.5 text-lg"
  };
  
  const widthClass = fullWidth ? "w-full" : "";
  const glassClass = glassmorphic ? "backdrop-blur-sm bg-opacity-80 border border-white/10" : "";
  const disabledClass = props.disabled ? "opacity-50 cursor-not-allowed" : "hover:translate-y-[-2px] active:translate-y-[1px]";
  const animatedClass = animated ? "transition-transform duration-300" : "";

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${glassClass} ${disabledClass} ${animatedClass} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {/* Enhanced gradient hover effect */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent 
                      -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none opacity-0 group-hover:opacity-100" 
            aria-hidden="true" />
                      
      {/* Futuristic corner accents */}
      {animated && (
        <>
          <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current opacity-0 group-hover:opacity-80 transition-opacity" />
          <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current opacity-0 group-hover:opacity-80 transition-opacity" />
        </>
      )}
      
      {/* Subtle glow effect */}
      <span className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 group-hover:animate-pulse
                     transition-opacity duration-300 bg-gradient-to-r from-transparent via-current/5 to-transparent 
                     pointer-events-none" />
      
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading...</span>
        </div>
      ) : (
        <div className={`flex items-center ${iconPosition === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
          {icon && (
            <span className={`transition-transform duration-300 ${iconPosition === 'left' ? 'mr-2.5 group-hover:translate-x-0.5' : 'ml-2.5 group-hover:-translate-x-0.5'}`}>
              {icon}
            </span>
          )}
          <span className="relative">
            {children}
            {variant === 'primary' && animated && (
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white/60 group-hover:w-full transition-all duration-300" />
            )}
          </span>
        </div>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;