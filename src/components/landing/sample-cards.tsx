"use client";

import { useScrollReveal } from "@/lib/hooks";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;

const LOG_PREVIEWS = [
  "Resumed work and synced with supervisor on weekly priorities.",
  "Integrated payment gateway API and resolved CORS issue.",
  "Attended standup, presented progress, and fixed two bugs.",
  "Wrote unit tests for the new module and updated docs.",
  "Deployed staging build and wrapped up weekly report.",
];

function Card({
  day,
  text,
  delay,
}: {
  day: string;
  text: string;
  delay: number;
}) {
  const { ref, isVisible } = useScrollReveal(0.1);

  return (
    <div
      ref={ref}
      className="snap-start shrink-0 w-[68vw] sm:w-auto bg-canvas border border-border-gray rounded-lg p-4 flex flex-col gap-2 hover:shadow-card transition-shadow duration-300"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s cubic-bezier(0.32,0.72,0,1) ${delay}ms, transform 0.6s cubic-bezier(0.32,0.72,0,1) ${delay}ms`,
      }}
    >
      <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-[1px]">
        {day}
      </span>
      <p className="text-[13px] text-near-black leading-[1.45] line-clamp-3">
        {text}
      </p>
    </div>
  );
}

export function SampleCards() {
  return (
    <div className="mt-16 w-full max-w-[900px]">
      <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-[1.5px] mb-3">
        Sample Generated Week
      </p>
      <div className="flex gap-2.5 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-none sm:grid sm:grid-cols-5 sm:gap-3 sm:overflow-visible">
        {DAYS.map((day, i) => (
          <Card key={day} day={day} text={LOG_PREVIEWS[i]} delay={i * 100} />
        ))}
      </div>
    </div>
  );
}
