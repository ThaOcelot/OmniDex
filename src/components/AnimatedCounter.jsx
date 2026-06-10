import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const AnimatedCounter = ({ value, decimals = 0, duration = 2 }) => {
  const count = useMotionValue(0);
  const formatted = useTransform(count, (latest) => 
    decimals > 0 ? latest.toFixed(decimals) : Math.round(latest)
  );

  useEffect(() => {
    const animation = animate(count, value, { duration: duration, ease: "easeOut" });
    return animation.stop;
  }, [value, count, duration]);

  return <motion.span>{formatted}</motion.span>;
};

export default AnimatedCounter;
