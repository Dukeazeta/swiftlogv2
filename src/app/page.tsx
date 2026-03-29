import Link from "next/link";

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="9" fill="#292524" />
      <path
        d="M9 10.5C9 9.67 9.67 9 10.5 9H18.5C19.33 9 20 9.67 20 10.5V22.5C20 23.33 19.33 24 18.5 24H10.5C9.67 24 9 23.33 9 22.5V10.5Z"
        fill="#FAF7F2"
        fillOpacity="0.9"
      />
      <path d="M12 13H17" stroke="#292524" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M12 15.5H16" stroke="#292524" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M12 18H15" stroke="#292524" strokeWidth="1.2" strokeLinecap="round" />
      <path
        d="M21 12L23.5 14.5L21 17"
        stroke="#FAF7F2"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
    </svg>
  );
}

function ArrowUpRight({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 11.5L11.5 4.5" />
      <path d="M5 4.5H11.5V11" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 8.5L6.5 11.5L12.5 4.5" />
    </svg>
  );
}

const DAY_CARDS = [
  {
    day: "Monday",
    content: "Resumed work and had a brief sync with my supervisor about this week's priorities.",
    position: "top-0 left-0 md:left-2",
    rotate: "-rotate-2",
    delay: "[animation-delay:0.4s]",
    accent: "bg-amber-50 border-amber-100",
    dot: "bg-amber-300",
  },
  {
    day: "Tuesday",
    content: "Worked on the payment gateway API integration and resolved a CORS issue on staging.",
    position: "top-22 right-0 md:right-0",
    rotate: "rotate-2",
    delay: "[animation-delay:0.6s]",
    accent: "bg-emerald-50 border-emerald-100",
    dot: "bg-emerald-300",
  },
  {
    day: "Wednesday",
    content: "Attended the team standup and presented progress. Fixed two bugs reported by QA.",
    position: "top-44 left-2 md:left-6",
    rotate: "-rotate-1",
    delay: "[animation-delay:0.8s]",
    accent: "bg-sky-50 border-sky-100",
    dot: "bg-sky-300",
  },
  {
    day: "Thursday",
    content: "Started writing unit tests for the new module and updated the project documentation.",
    position: "top-[16.5rem] right-0 md:right-4",
    rotate: "rotate-1",
    delay: "[animation-delay:1s]",
    accent: "bg-violet-50 border-violet-100",
    dot: "bg-violet-300",
  },
  {
    day: "Friday",
    content: "Deployed the staging build and ran final checks. Wrapped up the week's progress report.",
    position: "top-[21.5rem] left-0 md:left-2",
    rotate: "rotate-2",
    delay: "[animation-delay:1.2s]",
    accent: "bg-rose-50 border-rose-100",
    dot: "bg-rose-300",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-[100dvh] bg-background font-sans overflow-x-hidden">
      {/* ─── Floating Pill Navbar (sticky) ─── */}
      <header className="sticky top-0 z-50 w-full pt-4 pb-2 px-4">
        <nav className="max-w-[820px] mx-auto flex items-center justify-between bg-white/80 backdrop-blur-xl rounded-full px-5 py-2.5 shadow-warm ring-1 ring-stone-200/40">
          <Link href="/" className="flex items-center gap-2 group">
            <LogoMark />
            <span className="font-semibold text-[15px] tracking-tight text-stone-800">
              SwiftLog<span className="text-stone-400 font-normal">NG</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            <a
              href="#how-it-works"
              className="text-[13px] font-medium text-stone-400 hover:text-stone-700 transition-colors duration-300"
            >
              How it works
            </a>
            <a
              href="#features"
              className="text-[13px] font-medium text-stone-400 hover:text-stone-700 transition-colors duration-300"
            >
              Features
            </a>
          </div>

          <Link
            href="/login"
            className="group inline-flex items-center gap-1.5 bg-stone-800 text-white rounded-full px-4 py-2 text-[13px] font-medium hover:bg-stone-700 active:scale-[0.97] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
          >
            Get started
            <span className="w-[18px] h-[18px] rounded-full bg-white/15 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-[1px] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
              <ArrowUpRight size={10} />
            </span>
          </Link>
        </nav>
      </header>

      {/* ─── Hero ─── */}
      <section className="pt-16 pb-24 md:pt-24 md:pb-32 lg:pt-32 lg:pb-40">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* ─ Left: Copy ─ */}
            <div className="flex flex-col pt-4 lg:pt-8">
              {/* Headline */}
              <h1
                className="animate-fade-up font-display text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[1.06] tracking-tight text-stone-900 mb-6"
              >
                Your logbook, sorted
                <br />
                <span className="text-stone-400">before Monday morning.</span>
              </h1>

              {/* Subtitle */}
              <p
                className="animate-fade-up [animation-delay:120ms] text-[15px] md:text-base text-stone-500 leading-relaxed max-w-[46ch] mb-10"
              >
                Drop a quick summary of your week and let AI write your daily
                entries — tailored to your role, company, and department.
              </p>

              {/* CTA group */}
              <div className="animate-fade-up [animation-delay:240ms] flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-3 bg-stone-800 text-white rounded-full px-7 py-3.5 text-sm font-medium hover:bg-stone-700 active:scale-[0.97] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                >
                  Start writing
                  <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-[1px] group-hover:scale-105 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                    <ArrowUpRight size={13} />
                  </span>
                </Link>
                <span className="text-[13px] text-stone-400 flex items-center gap-1.5">
                  <CheckIcon />
                  Free to use · No credit card
                </span>
              </div>
            </div>

            {/* ─ Right: Floating day cards ─ */}
            <div className="relative min-h-[420px] hidden lg:block">
              {DAY_CARDS.map((card) => (
                <div
                  key={card.day}
                  className={`absolute w-[280px] animate-fade-up ${card.delay} ${card.position} ${card.rotate} hover:rotate-0 hover:scale-[1.03] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-default`}
                >
                  <div className={`rounded-2xl ${card.accent} border p-4 shadow-warm`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${card.dot}`} />
                      <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-[0.1em]">
                        {card.day}
                      </span>
                    </div>
                    <p className="text-[13px] text-stone-600 leading-relaxed">
                      {card.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ─ Mobile: Stacked day cards ─ */}
            <div className="flex flex-col gap-3 lg:hidden">
              {DAY_CARDS.slice(0, 3).map((card) => (
                <div
                  key={card.day}
                  className={`animate-fade-up ${card.delay}`}
                >
                  <div className={`rounded-2xl ${card.accent} border p-4 shadow-warm`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${card.dot}`} />
                      <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-[0.1em]">
                        {card.day}
                      </span>
                    </div>
                    <p className="text-[13px] text-stone-600 leading-relaxed">
                      {card.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
