/**
 * Framer Motion variants — Tasky Design System
 * Import: import { fadeIn, slideIn, scaleIn } from '@tasky/ui/animations'
 */

import type { Variants, Transition } from "framer-motion";

const ease = [0.4, 0, 0.2, 1] as const;
const easeOut = [0, 0, 0.2, 1] as const;

export const baseTransition: Transition = {
  duration: 0.2,
  ease,
};

/** Fade — opacity only */
export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: easeOut } },
  exit:    { opacity: 0, transition: { duration: 0.15, ease } },
};

/** Slide up + fade */
export const slideIn: Variants = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: easeOut } },
  exit:    { opacity: 0, y: 4,  transition: { duration: 0.15, ease } },
};

/** Slide down (for dropdowns) */
export const slideDown: Variants = {
  hidden:  { opacity: 0, y: -8, scaleY: 0.95 },
  visible: { opacity: 1, y: 0,  scaleY: 1,   transition: { duration: 0.2, ease: easeOut } },
  exit:    { opacity: 0, y: -4, scaleY: 0.97, transition: { duration: 0.15, ease } },
};

/** Scale + fade (for modals) */
export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1,    transition: { duration: 0.22, ease: easeOut } },
  exit:    { opacity: 0, scale: 0.97, transition: { duration: 0.15, ease } },
};

/** Slide in from right (for sheets/drawers) */
export const slideInRight: Variants = {
  hidden:  { opacity: 0, x: "100%" },
  visible: { opacity: 1, x: 0, transition: { duration: 0.28, ease: easeOut } },
  exit:    { opacity: 0, x: "100%", transition: { duration: 0.2, ease } },
};

/** Backdrop */
export const backdrop: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
};

/** Stagger container for list items */
export const staggerContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export const staggerItem: Variants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: easeOut } },
};
