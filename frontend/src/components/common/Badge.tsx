import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "blue" | "green" | "grey" | "orange" | "purple" | "neutral";
  size?: "sm" | "md";
}

export function Badge({ children, variant = "neutral", size = "sm" }: BadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  let variantClasses = "bg-[#f2f3f3] text-[#545b64] border-[#d5dbdb]";

  if (variant === "blue") {
    variantClasses = "bg-[#f1faff] text-[#0972d3] border-[#0972d3]/30 font-medium";
  } else if (variant === "green") {
    variantClasses = "bg-[#ebf6ed] text-[#037f0c] border-[#037f0c]/30 font-medium";
  } else if (variant === "orange") {
    variantClasses = "bg-[#fff9e6] text-[#8d6605] border-[#8d6605]/30 font-medium";
  } else if (variant === "purple") {
    variantClasses = "bg-[#f4f1fb] text-[#4d27aa] border-[#4d27aa]/30 font-medium";
  } else if (variant === "grey") {
    variantClasses = "bg-[#f2f3f3] text-[#545b64] border-[#d5dbdb]";
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded border font-mono tracking-tight ${sizeClasses} ${variantClasses}`}
    >
      {children}
    </span>
  );
}
