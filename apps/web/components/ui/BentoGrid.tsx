import React, { type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BentoGridProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  className?: string;
}

interface BentoCardProps extends ComponentPropsWithoutRef<"div"> {
  name?: string;
  className?: string;
  background?: ReactNode;
  Icon?: React.ElementType;
  description?: string;
  href?: string;
  cta?: string;
  children?: ReactNode;
}

export const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 md:grid-cols-3 gap-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  children,
  ...props
}: BentoCardProps) => (
  <div
    className={cn(
      "group relative flex flex-col justify-between overflow-hidden rounded-[12px] border border-[#23252a] bg-[#0f1011] p-6 transition-all duration-200 hover:border-[#2e3138]",
      className
    )}
    {...props}
  >
    {background && <div className="absolute inset-0 pointer-events-none -z-10">{background}</div>}
    
    {children ? (
      children
    ) : (
      <>
        <div>
          {Icon && (
            <div className="mb-4 inline-flex p-2 rounded-[6px] bg-[#161718] border border-[#23252a] text-[#d0d6e0]">
              <Icon className="h-5 w-5" />
            </div>
          )}
          {name && <h3 className="text-base font-semibold text-[#f7f8f8] mb-1">{name}</h3>}
          {description && <p className="text-xs text-[#8a8f98] leading-relaxed">{description}</p>}
        </div>

        {cta && href && (
          <div className="mt-6 pt-3 border-t border-[#23252a] flex items-center justify-between text-xs text-[#8a8f98] group-hover:text-white transition-colors">
            <span>{cta}</span>
            <span>→</span>
          </div>
        )}
      </>
    )}
  </div>
);
