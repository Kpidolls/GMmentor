import React, { MutableRefObject, useEffect, useRef, useState } from 'react';

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
    <div
      ref={rootRef}
      className="lazy-div"
      style={{
        opacity: hasShown ? 1 : 0,
        transform: hasShown ? 'translateX(0) translateZ(0)' : 'translateX(-50px) translateZ(0)',
        transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
      }}
    >
      {children}
    </div>
  );
};

export default LazyShow;
