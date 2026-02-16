"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { AntigravityButton } from "@/components/ui/AntigravityButton";

export const HeroCTA = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start will-change-transform"
    >
      <Link href="/register">
        <AntigravityButton size="lg" className="group">
          Start Free Assessment
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </AntigravityButton>
      </Link>
      <Link href="/demo">
        <AntigravityButton variant="glass" size="lg" className="group">
          <Play className="mr-2 w-5 h-5 fill-white" />
          View Live Demo
        </AntigravityButton>
      </Link>
    </motion.div>
  );
};
