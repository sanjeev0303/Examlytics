"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  depth?: number; // Simulated depth for parallax
}

export const FloatingElement = ({
  children,
  className,
  delay = 0,
  depth = 1,
}: FloatingElementProps) => {
  return (
    <motion.div
      animate={{
        y: [0, -10 * depth, 0],
        rotate: [0, 1 * depth, -1 * depth, 0],
      }}
      transition={{
        duration: 5 + Math.random() * 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay: delay,
      }}
      className={cn("absolute", className)}
    >
      {children}
    </motion.div>
  );
};
