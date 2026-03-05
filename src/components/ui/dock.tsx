"use client";

import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import React, { useRef, useState, useEffect } from "react";

export type DockItemData = {
  icon: React.ReactNode;
  label?: React.ReactNode;
  onClick: () => void;
  active?: boolean;
};

export type DockProps = {
  items?: DockItemData[];
  className?: string;
  distance?: number;
  panelHeight?: number;
  baseItemSize?: number;
  magnification?: number;
  activeIndex?: number;
};

type DockItemProps = DockItemData & {
  mouseX: MotionValue<number>;
  magnification: number;
  distance: number;
  baseItemSize: number;
};

export default function Dock({
  items = [],
  activeIndex = -1,
  className = "",
  magnification = 72,
  distance = 150,
  panelHeight = 80,
  baseItemSize = 56,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [hidden, setHidden] = useState(false);
  const lastScroll = useRef(0);

  // Hide dock when scrolling down
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;

      if (y > lastScroll.current && y > 50) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      lastScroll.current = y;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto center active item
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    if (activeIndex < 0) return;

    const item = container.children[activeIndex] as HTMLElement | undefined;
    if (!item) return;

    const left =
      item.offsetLeft - container.clientWidth / 2 + item.clientWidth / 2;

    container.scrollTo({
      left,
      behavior: "smooth",
    });
  }, [activeIndex]);

  return (
    <motion.div
      animate={{ y: hidden ? 120 : 0 }}
      transition={{ duration: 0.25 }}
      className={`fixed bottom-4 left-0 right-0 flex justify-center z-50 lg:hidden ${className}`}
    >
      <div
        className="
            relative
            flex items-center
            overflow-hidden
            rounded-[999px]
            border border-border
            bg-background/60
            backdrop-blur-xl
            shadow-xl
            px-4
            max-w-[92vw]
            "
        style={{ height: panelHeight }}
      >
        {/* Scroll edge blur */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent" />

        <motion.div
          ref={scrollRef}
          onMouseMove={(e) => mouseX.set(e.pageX)}
          onMouseLeave={() => mouseX.set(Infinity)}
          className="
                flex items-center gap-6
                overflow-x-auto
                scrollbar-none
                snap-x snap-mandatory
                touch-pan-x
                scroll-smooth
            "
          style={{ height: "100%" }}
        >
          {items.map((item, index) => (
            <DockItem
              key={index}
              {...item}
              mouseX={mouseX}
              magnification={magnification}
              distance={distance}
              baseItemSize={baseItemSize}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

function DockItem({
  icon,
  onClick,
  active,
  mouseX,
  magnification,
  distance,
  baseItemSize,
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const mouseDistance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return 0;
    return val - rect.left - rect.width / 2;
  });

  const scale = useSpring(
    useTransform(
      mouseDistance,
      [-distance, 0, distance],
      [1, magnification / baseItemSize, 1],
    ),
    { stiffness: 200, damping: 20 },
  );

  const translateY = useTransform(scale, [1, 1.4], [0, -10]);

  return (
    <motion.div
      ref={ref}
      style={{
        width: baseItemSize,
        height: baseItemSize,
        scale,
        y: translateY,
      }}
      onClick={onClick}
      className="
        relative
        flex items-center justify-center
        cursor-pointer
        shrink-0
        snap-center
      "
    >
      {icon}

      {/* Active indicator */}
      {active && (
        <span className="absolute -bottom-1 w-1.5 h-1.5 bg-emerald-400 rounded-[999px]" />
      )}
    </motion.div>
  );
}
