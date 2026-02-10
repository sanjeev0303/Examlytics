"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface AntigravityButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "ghost" | "glass";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const AntigravityButton = React.forwardRef<HTMLButtonElement, AntigravityButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const variants = {
      primary: "bg-brand-primary text-white hover:bg-brand-secondary shadow-[0_0_20px_rgba(99,102,241,0.4)] border-transparent",
      secondary: "bg-brand-dark border-white/10 hover:bg-white/5 text-white hover:border-brand-primary/50",
      ghost: "bg-transparent hover:bg-white/5 text-white/80 hover:text-white border-transparent",
      glass: "glass-button text-white border-white/10 hover:border-white/20 shadow-lg",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative inline-flex items-center justify-center rounded-full font-medium transition-colors border",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
        {variant === "primary" && (
          <div className="absolute inset-0 rounded-full bg-white/20 blur-md opacity-0 hover:opacity-100 transition-opacity duration-300" />
        )}
      </motion.button>
    );
  }
);

AntigravityButton.displayName = "AntigravityButton";
