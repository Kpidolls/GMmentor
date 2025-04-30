import React, { MutableRefObject, useEffect, useRef, useState } from 'react';
import { motion, MotionProps, useAnimation } from 'framer-motion';


const MotionDiv = motion(
  React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & MotionProps>(
    (props, ref) => <div ref={ref} {...props} />
  )
);

function useOnScreen(
  ref: MutableRefObject<HTMLDivElement | null>,
  rootMargin = '0px'
) {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
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

const LazyShow = ({ children }: { children: React.ReactNode }) => {
  const controls = useAnimation();
  const rootRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(rootRef);

  useEffect(() => {
    if (onScreen) {
      controls.start({
        x: 0,
        opacity: 1,
        transition: {
          duration: 0.5,
          ease: 'easeOut',
        },
      });
    }
  }, [onScreen, controls]);

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
