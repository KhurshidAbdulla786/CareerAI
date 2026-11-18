import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const AnimatedButton = ({ children, className = '', ...props }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      {...props}
      whileHover={shouldReduceMotion ? undefined : { y: -1 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
      className={`inline-flex items-center justify-center gap-2 ${className}`}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton;
