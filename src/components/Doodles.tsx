import { motion } from 'framer-motion';

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { delay: i * 0.15, type: 'spring' as const, duration: 1.2, bounce: 0 },
      opacity: { delay: i * 0.15, duration: 0.01 },
    },
  }),
};

export function SparkleDoodle({ className, delay = 0, style }: { className?: string; delay?: number; style?: React.CSSProperties }) {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className={className}
      initial="hidden"
      animate="visible"
      style={{ display: 'inline-block', ...style }}
    >
      <motion.path
        d="M50 0 C50 30 70 50 100 50 C70 50 50 70 50 100 C50 70 30 50 0 50 C30 50 50 30 50 0 Z"
        fill="currentColor"
        initial={{ scale: 0, rotate: -30, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ delay, duration: 0.6, type: 'spring' }}
      />
    </motion.svg>
  );
}

export function CurvedArrow({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.svg
      viewBox="0 0 200 100"
      className={className}
      initial="hidden"
      animate="visible"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <motion.path
        d="M10,80 C60,20 140,20 180,70"
        variants={draw}
        custom={delay + 1}
      />
      <motion.path
        d="M165,65 L182,72 L185,52"
        variants={draw}
        custom={delay + 2}
      />
    </motion.svg>
  );
}

export function UnderlineHighlight({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 300 20"
      className={className}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.9, ease: 'easeOut', delay: 0.4 }}
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
    >
      <motion.path d="M5,12 Q 75,18 150,11 T 295,14" />
    </motion.svg>
  );
}
