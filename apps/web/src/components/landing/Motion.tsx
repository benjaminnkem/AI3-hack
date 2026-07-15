'use client';

import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

export const easeOutExpo = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: easeOutExpo },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.55, ease: easeOutExpo },
  },
};

export const stagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.06,
    },
  },
};

export function Reveal({
  children,
  className,
  delay = 0,
  ...props
}: HTMLMotionProps<'div'> & { delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      variants={{
        hidden: { opacity: 0, y: 28 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.65, ease: easeOutExpo, delay },
        },
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className,
  ...props
}: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={stagger}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  ...props
}: HTMLMotionProps<'div'>) {
  return (
    <motion.div variants={fadeUp} className={cn(className)} {...props}>
      {children}
    </motion.div>
  );
}
