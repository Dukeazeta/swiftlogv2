import Link from "next/link";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;

const LOG_PREVIEWS = [
  "Resumed work and synced with supervisor on weekly priorities.",
  "Integrated payment gateway API and resolved CORS issue.",
  "Attended standup, presented progress, and fixed two bugs.",
  "Wrote unit tests for the new module and updated docs.",
  "Deployed staging build and wrapped up weekly report.",
];

export default function HomePage() {
  return (
    <div className="bg-cloud-gray font-sans overflow-x-hidden selection:bg-expo-black/10 selection:text-expo-black">
      {/* ═══════ HERO — locked to viewport ═══════ */}
      <section className="relative w-full h-[100dvh] min-h-[560px] max-h-[1200px] flex flex-col">
        {/* ── Nav ── */}
        <header className="shrink-0 w-full px-5 sm:px-8 lg:px-12 pt-5 sm:pt-6">
          <nav className="max-w-[1120px] mx-auto flex items-center justify-between">
            <Link
              href="/"
              className="font-bold text-expo-black text-[17px] tracking-[-0.02em] hover:opacity-70 transition-opacity"
            >
              SwiftLogNG
            </Link>

            <div className="flex items-center gap-3 sm:gap-5">
              <Link
                href="/login"
                className="text-[14px] font-medium text-slate-gray hover:text-expo-black transition-colors hidden sm:block"
              >
                Log in
              </Link>
              <Link
                href="/login"
                className="bg-expo-black text-white rounded-[9999px] px-5 py-[9px] text-[13px] sm:text-[14px] font-medium hover:scale-[1.03] active:scale-[0.97] transition-transform"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </header>

        {/* ── Center Block ── */}
        <div className="flex-1 flex flex-col justify-center items-center text-center px-5 sm:px-8">
          {/* Pill badge */}
          <div className="animate-fade-up mb-5 sm:mb-6 inline-flex items-center gap-2 px-3.5 py-[6px] rounded-[9999px] border border-subtle-border bg-white shadow-whisper">
            <span className="w-[6px] h-[6px] rounded-full bg-link-cobalt" />
            <span className="text-slate-gray text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.06em]">
              AI logbook assistant
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up [animation-delay:120ms] font-display font-bold text-expo-black text-[clamp(2.25rem,7.5vw,4.5rem)] leading-[1.08] tracking-[-0.035em] max-w-[720px]">
            Your <span className="text-link-cobalt">logbook</span>, sorted before Monday.
          </h1>

          {/* Sub copy */}
          <p className="animate-fade-up [animation-delay:260ms] mt-4 sm:mt-5 text-[clamp(14px,2.5vw,17px)] text-slate-gray leading-[1.55] max-w-[440px] font-normal">
            Summarise your week in one sentence. AI writes five tailored daily entries — matched to your role, company, and department.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up [animation-delay:400ms] mt-7 sm:mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-expo-black text-white rounded-[9999px] px-7 py-3 text-[15px] font-medium shadow-elevated hover:-translate-y-[2px] active:translate-y-0 transition-all duration-300"
            >
              Start Writing
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-0.5">
                <path d="M4.5 11.5L11.5 4.5" />
                <path d="M5 4.5H11.5V11" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-[9999px] px-7 py-3 text-[15px] font-medium text-near-black bg-white border border-subtle-border shadow-whisper hover:border-input-border hover:shadow-elevated transition-all duration-300"
            >
              See how it works
            </Link>
          </div>
        </div>

        {/* ── Bottom Log Strip — always visible, never overflows ── */}
        <div className="shrink-0 w-full px-5 sm:px-8 lg:px-12 pb-6 sm:pb-8 animate-fade-up [animation-delay:600ms]">
          <div className="max-w-[1120px] mx-auto">
            {/* Label */}
            <p className="text-[11px] font-semibold text-silver uppercase tracking-[0.08em] mb-3 text-center sm:text-left">
              Sample generated week
            </p>

            {/* Log cards row */}
            <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-none sm:overflow-visible sm:grid sm:grid-cols-5">
              {DAYS.map((day, i) => (
                <div
                  key={day}
                  className="snap-start shrink-0 w-[72vw] sm:w-auto bg-white border border-subtle-border rounded-[10px] p-4 sm:p-3.5 lg:p-4 flex flex-col gap-2 hover:shadow-whisper transition-shadow duration-300"
                >
                  <span className="text-[11px] font-bold text-silver uppercase tracking-[0.05em]">
                    {day}
                  </span>
                  <p className="text-[13px] sm:text-[12px] lg:text-[13px] text-near-black leading-[1.45] line-clamp-3">
                    {LOG_PREVIEWS[i]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
