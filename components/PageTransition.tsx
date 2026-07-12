"use client";

import { motion } from "framer-motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 15, filter: "blur(4px)" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex-1 flex flex-col w-full h-full"
    >
      {children}
    </motion.div>
  );
}
