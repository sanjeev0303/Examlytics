"use client";

import { motion } from "framer-motion";
import { Target, TrendingUp, CheckCircle } from "lucide-react";

const SOLUTION_ITEMS = [
  { icon: Target, text: "Pinpoint Weak Topics", color: "text-brand-accent" },
  { icon: TrendingUp, text: "Adaptive Difficulty Scaling", color: "text-brand-secondary" },
  { icon: CheckCircle, text: "Predicted Rank & Score", color: "text-green-400" },
];

export const SolutionList = () => {
  return (
    <div className="space-y-4">
      {SOLUTION_ITEMS.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.2 }}
          className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
        >
          <item.icon className={`w-5 h-5 ${item.color}`} />
          <span className="font-medium text-white/90">{item.text}</span>
        </motion.div>
      ))}
    </div>
  );
};
