"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  animationType?: string;
}

interface ScrollAnimationResult {
  ref: React.RefObject<any>;
  isVisible: boolean;
  animationClass: string;
}

export const useScrollAnimation = ({
  threshold = 0.1,
  rootMargin = "0px",
  animationType = "fade-up",
}: ScrollAnimationOptions = {}): ScrollAnimationResult => {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        root: null,
        rootMargin,
        threshold,
      }
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
  }, [threshold, rootMargin]);

  const animationClass = !isVisible
    ? getInitialClass(animationType)
    : getAnimatedClass(animationType);

  return { ref, isVisible, animationClass };
};

const getInitialClass = (type: string): string => {
  switch (type) {
    case "fade-up":
      return "opacity-0 translate-y-16";
    case "fade-down":
      return "opacity-0 -translate-y-16";
    case "fade-left":
      return "opacity-0 translate-x-16";
    case "fade-right":
      return "opacity-0 -translate-x-16";
    case "zoom-in":
      return "opacity-0 scale-95";
    case "zoom-out":
      return "opacity-0 scale-105";
    case "fade-in":
      return "opacity-0";
    default:
      return "opacity-0";
  }
};

const getAnimatedClass = (type: string): string => {
  return "opacity-100 translate-y-0 translate-x-0 scale-100 transition-all duration-1000 ease-out";
};

export default useScrollAnimation;
