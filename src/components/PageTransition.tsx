import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

interface PageTransitionProps {
  children: React.ReactNode;
}

const pageTransitions = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
  },
  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.05, opacity: 0 },
  },
};

const transitionConfig = {
  duration: 0.3,
  ease: [0.43, 0.13, 0.23, 0.96],
};

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const { pageTransition } = useTheme();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={pageTransitions[pageTransition].initial}
        animate={pageTransitions[pageTransition].animate}
        exit={pageTransitions[pageTransition].exit}
        transition={transitionConfig}
        className="min-h-[calc(100vh-4rem)]"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}