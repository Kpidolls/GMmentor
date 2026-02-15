import React, { MutableRefObject, useEffect, useRef, useState } from 'react';
import { motion, MotionProps, useAnimation } from 'framer-motion';


const MotionDivBase = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & MotionProps
>(function MotionDivBase(props, ref) {
  return <div ref={ref} {...props} />;
});
MotionDivBase.displayName = 'MotionDivBase';

const MotionDiv = motion(MotionDivBase);
MotionDiv.displayName = 'MotionDiv';

function useOnScreen(
  ref: MutableRefObject<HTMLDivElement | null>,
  rootMargin = '0px'
) {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIntersecting(entry.isIntersecting);
        }
      },
      { rootMargin }
    );
  
    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
  
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, rootMargin]);

  return isIntersecting;
}

interface LazyShowProps {
  children: React.ReactNode;
  deferRender?: boolean;
  rootMargin?: string;
}

const LazyShow = ({ children, deferRender = false, rootMargin = '0px' }: LazyShowProps) => {
  const controls = useAnimation();
  const rootRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(rootRef, rootMargin);
  const [hasShown, setHasShown] = useState(false);

  const parsedRootMargin = Number.parseInt(rootMargin, 10);
  const placeholderMinHeight = Number.isNaN(parsedRootMargin)
    ? 180
    : Math.max(parsedRootMargin, 180);

  useEffect(() => {
    if (onScreen) {
      setHasShown(true);
    }
  }, [onScreen]);

  useEffect(() => {
    if (hasShown) {
      controls.start({
        x: 0,
        opacity: 1,
        transition: {
          duration: 0.5,
          ease: 'easeOut',
        },
      });
    }
  }, [hasShown, controls]);

  useEffect(() => {
    if (!deferRender || hasShown) {
      return;
    }

    const fallbackTimer = window.setTimeout(() => {
      setHasShown(true);
    }, 3000);

    return () => {
      window.clearTimeout(fallbackTimer);
    };
  }, [deferRender, hasShown]);

  if (deferRender && !hasShown) {
    return (
      <div
        ref={rootRef}
        className="lazy-div"
        style={{ minHeight: `${placeholderMinHeight}px` }}
        aria-hidden="true"
      />
    );
  }

  return (
    <MotionDiv
      ref={rootRef}
      className="lazy-div"
      initial={{ opacity: 0, x: -50 }}
      animate={controls}
    >
      {children}
    </MotionDiv>
  );
};

export default LazyShow;
