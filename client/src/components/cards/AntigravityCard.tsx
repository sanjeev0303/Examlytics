"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface AntigravityCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  variant?: "glass" | "solid" | "neon";
  elevated?: boolean;
}

export const AntigravityCard = React.memo(React.forwardRef<HTMLDivElement, AntigravityCardProps>(
  ({ children, className, variant = "glass", elevated = false, ...props }, ref) => {
    const variants = {
      glass: "glass-panel bg-white/5 border-white/10",
      solid: "bg-brand-dark/90 border-white/5",
      neon: "bg-brand-primary/10 border-brand-primary/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]",
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, boxShadow: "0 10px 40px -10px rgba(99,102,241,0.3)" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl border",
          variants[variant],
          elevated && "shadow-xl shadow-black/20",
          className
        )}
        {...props}
      >
        {children}
        <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </motion.div>
    );
  }
));

AntigravityCard.displayName = "AntigravityCard";
