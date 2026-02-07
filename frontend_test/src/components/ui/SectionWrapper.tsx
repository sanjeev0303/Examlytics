"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionWrapperProps extends HTMLMotionProps<"section"> {
  children: React.ReactNode;
  perspective?: boolean;
}

export const SectionWrapper = ({
  children,
  className,
  perspective = false,
  ...props
}: SectionWrapperProps) => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0, 1, 1, 0]);

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      className={cn(
        "relative w-full min-h-screen flex items-center justify-center py-20 px-6",
        perspective && "perspective-1000",
        className
      )}
      {...props}
    >
      <div className="container mx-auto max-w-7xl relative z-10">
        {children}
      </div>

      {/* Background Glow - Generic for all sections, can be overridden */}
      <div className="absolute inset-0 bg-brand-deep/50 -z-10 pointer-events-none" />
    </motion.section>
  );
};
