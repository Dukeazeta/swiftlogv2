"use client";

import { useEffect, useRef } from "react";

interface ScrollCarouselProps {
  children: React.ReactNode;
  /** Pixels of horizontal travel per pixel of vertical scroll */
  speed?: number;
}

export function ScrollCarousel({ children, speed = 0.5 }: ScrollCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    function onScroll() {
      const delta = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      // Scrolling down → move left (negative), scrolling up → move right (positive)
      offset.current -= delta * speed;

      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(${offset.current}px, 0, 0)`;
        }
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [speed]);

  return (
    <div className="overflow-hidden w-full">
      <div
        ref={trackRef}
        className="flex items-center gap-6 sm:gap-8 w-max will-change-transform"
        style={{ transform: "translate3d(0, 0, 0)" }}
      >
        {children}
      </div>
    </div>
  );
}
