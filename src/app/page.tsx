import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ScrollCarousel } from "@/components/scroll-carousel";
import { Navbar } from "@/components/landing/navbar";
import { SampleCards } from "@/components/landing/sample-cards";

const SCHOOLS = [
  "FUPRE", "UNILAG", "OAU", "FUTA", "UI", "LASU",
  "ABUAD", "Covenant", "UNN", "UNIBEN", "UNILORIN",
  "LAUTECH", "Babcock", "UNIPORT", "ABU", "FUNAAB",
  "DELSU", "UNICAL", "EKSU", "CRUTECH",
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Write your weekly summary",
    description: "Summarise what you did this week in a sentence or two. No formatting needed.",
  },
  {
    step: "02",
    title: "AI generates 5 daily entries",
    description: "Our AI splits your summary into Mon–Fri entries tailored to your role, company, and department.",
  },
  {
    step: "03",
    title: "Review, edit, and save",
    description: "Tweak any entry, save your week, and come back anytime. Previous versions are kept safe.",
  },
];

const FEATURES = [
  {
    tag: "AI Generation",
    title: "From summary to five daily entries in seconds",
    description: "Write one paragraph about your week. The AI does the heavy lifting — no staring at a blank page.",
    accent: "bg-webflow-blue/10 text-webflow-blue",
    span: "md:col-span-2",
  },
  {
    tag: "Role-Matched",
    title: "Entries that fit your actual work",
    description: "Your job title, department, and company are baked into every generation. No generic filler.",
    accent: "bg-accent-purple/10 text-accent-purple",
    span: "md:col-span-1",
  },
  {
    tag: "Version History",
    title: "Every edit saved automatically",
    description: "Made a change you regret? Revert to any previous version of your weekly log instantly.",
    accent: "bg-accent-green/10 text-accent-green",
    span: "md:col-span-1",
  },
  {
    tag: "Multiple AI Providers",
    title: "Choose your AI engine",
    description: "Switch between Mistral, Groq, and Gemini. Use whichever works best for you.",
    accent: "bg-accent-orange/10 text-accent-orange",
    span: "md:col-span-1",
  },
  {
    tag: "SIWES-Ready",
    title: "Built for Nigerian IT students",
    description: "Week numbering, date ranges, and formatting that match SIWES logbook requirements out of the box.",
    accent: "bg-accent-pink/10 text-accent-pink",
    span: "md:col-span-2",
  },
];

const TESTIMONIALS = [
  {
    quote: "SwiftLogNG turned my SIWES logbook from a weekly headache into a 2-minute task. The AI entries are scarily accurate.",
    name: "Adewale T.",
    school: "UNILAG",
    role: "IT Student, Computer Science",
  },
  {
    quote: "I used to copy-paste from my notes every Sunday. Now I just type a summary and the whole week is done. Game changer.",
    name: "Fatima B.",
    school: "ABU",
    role: "IT Student, Information Systems",
  },
  {
    quote: "My supervisor actually complimented my logbook detail this semester. All thanks to this tool.",
    name: "Emeka O.",
    school: "FUTA",
    role: "IT Student, Electrical Engineering",
  },
];

const DEMO_SUMMARY = "This week I worked on integrating a payment gateway, fixed two critical bugs in the checkout flow, and attended the weekly standup where I presented my progress to the team.";

const DEMO_ENTRIES = [
  { day: "Mon", content: "Started the week by reviewing payment gateway documentation and setting up the development environment for integration testing." },
  { day: "Tue", content: "Implemented the initial payment gateway API integration and began testing endpoint connectivity." },
  { day: "Wed", content: "Resolved two critical bugs in the checkout flow — one related to form validation and another affecting cart total calculations." },
  { day: "Thu", content: "Attended the weekly standup meeting and presented progress on the payment integration and bug fixes to the team." },
  { day: "Fri", content: "Conducted final testing on the checkout flow, documented the changes made, and prepared a summary report for the supervisor." },
];

function SchoolPill({ name, color = "black" }: { name: string; color?: "black" | "blue" }) {
  return (
    <span className={cn(
      "inline-block font-display font-bold text-[clamp(1.5rem,3.5vw,2.25rem)] leading-none tracking-[-0.03em] select-none whitespace-nowrap uppercase px-3",
      color === "blue" ? "text-webflow-blue/20" : "text-near-black/10"
    )}>
      {name}
    </span>
  );
}

export default function HomePage() {
  return (
    <div className="bg-canvas font-sans overflow-x-hidden selection:bg-webflow-blue/10 selection:text-near-black">
      {/* ═══════ HERO ═══════ */}
      <section className="relative w-full min-h-[90dvh] flex flex-col justify-center px-6 pt-24 pb-16 overflow-hidden">
        <Navbar />

        {/* Background image — faded, fades to white at bottom */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-bg.webp"
            alt=""
            fill
            priority
            className="object-cover object-center opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-canvas" />
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto w-full flex flex-col items-center text-center">
          <div className="animate-fade-up mb-6 inline-flex items-center gap-2 px-3.5 py-[6px] rounded-md border border-border-gray bg-canvas/90 backdrop-blur-sm shadow-sm">
            <span className="w-[6px] h-[6px] rounded-full bg-webflow-blue" />
            <span className="text-gray-700 text-[11px] font-semibold uppercase tracking-[1.5px]">
              AI Logbook Assistant
            </span>
          </div>

          <h1 className="animate-fade-up [animation-delay:120ms] font-display font-semibold text-[clamp(2.5rem,7vw,5rem)] leading-[1.04] tracking-[-0.04em] text-near-black max-w-[800px]">
            Your <span className="text-webflow-blue">logbook</span>, sorted before&nbsp;Monday.
          </h1>

          <p className="animate-fade-up [animation-delay:260ms] mt-5 text-[clamp(16px,2vw,20px)] text-gray-700 leading-[1.5] max-w-[520px]">
            Summarise your week in one sentence. AI writes five tailored daily entries&nbsp;&mdash; matched to your role, company, and&nbsp;department.
          </p>

          <div className="animate-fade-up [animation-delay:400ms] mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-webflow-blue text-white rounded-md px-7 py-3.5 text-[16px] font-medium shadow-sm hover:bg-blue-hover hover:translate-y-[2px] active:translate-y-0 transition-all duration-200"
            >
              Start Writing
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 11.5L11.5 4.5" />
                <path d="M5 4.5H11.5V11" />
              </svg>
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-md px-7 py-3.5 text-[16px] font-medium text-near-black bg-canvas/90 backdrop-blur-sm border border-border-gray shadow-sm hover:border-border-hover hover:translate-y-[2px] transition-all duration-200"
            >
              See how it works
            </a>
          </div>

          {/* Sample log strip — scroll-animated client component */}
          <SampleCards />
        </div>
      </section>

      {/* ═══════ TRUSTED BY — scroll-linked ═══════ */}
      <section className="py-20 space-y-6">
        <p className="text-center text-[10px] font-semibold text-gray-300 uppercase tracking-[1.5px]">
          Trusted by students from
        </p>

        <ScrollCarousel speed={0.4}>
          {[...SCHOOLS, ...SCHOOLS, ...SCHOOLS, ...SCHOOLS, ...SCHOOLS, ...SCHOOLS].map((school, i) => (
            <SchoolPill key={`r1-${i}`} name={school} color="black" />
          ))}
        </ScrollCarousel>

        <ScrollCarousel speed={-0.3}>
          {[...SCHOOLS.slice().reverse(), ...SCHOOLS.slice().reverse(), ...SCHOOLS.slice().reverse(), ...SCHOOLS.slice().reverse(), ...SCHOOLS.slice().reverse(), ...SCHOOLS.slice().reverse()].map((school, i) => (
            <SchoolPill key={`r2-${i}`} name={school} color="blue" />
          ))}
        </ScrollCarousel>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section id="how-it-works" className="py-24 px-6 bg-surface border-t border-border-gray">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-semibold text-webflow-blue uppercase tracking-[1.5px] mb-3">
              How It Works
            </p>
            <h2 className="font-display font-semibold text-[clamp(2rem,4vw,3.5rem)] leading-[1.04] tracking-[-0.03em] text-near-black">
              Three steps to a perfect logbook
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item) => (
              <div
                key={item.step}
                className="bg-canvas border border-border-gray rounded-lg p-8 hover:shadow-card transition-shadow duration-300"
              >
                <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-[1px]">
                  Step {item.step}
                </span>
                <h3 className="mt-4 font-display font-semibold text-[24px] leading-[1.3] text-near-black">
                  {item.title}
                </h3>
                <p className="mt-3 text-[16px] text-mid-gray leading-[1.6]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FEATURES — BENTO GRID ═══════ */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-semibold text-webflow-blue uppercase tracking-[1.5px] mb-3">
              Features
            </p>
            <h2 className="font-display font-semibold text-[clamp(2rem,4vw,3.5rem)] leading-[1.04] tracking-[-0.03em] text-near-black">
              Everything you need for&nbsp;SIWES
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.tag}
                className={`bg-canvas border border-border-gray rounded-lg p-8 hover:shadow-card transition-shadow duration-300 flex flex-col ${feature.span}`}
              >
                <span className={`inline-flex items-center self-start px-3 py-1 rounded text-[12px] font-semibold uppercase tracking-[0.5px] ${feature.accent}`}>
                  {feature.tag}
                </span>
                <h3 className="mt-5 font-display font-semibold text-[24px] leading-[1.3] text-near-black">
                  {feature.title}
                </h3>
                <p className="mt-3 text-[16px] text-mid-gray leading-[1.6]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ AI DEMO PREVIEW ═══════ */}
      <section className="py-24 px-6 bg-surface border-t border-border-gray">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-semibold text-webflow-blue uppercase tracking-[1.5px] mb-3">
              See It In Action
            </p>
            <h2 className="font-display font-semibold text-[clamp(2rem,4vw,3.5rem)] leading-[1.04] tracking-[-0.03em] text-near-black">
              One summary, five entries
            </h2>
          </div>

          <div className="max-w-[900px] mx-auto">
            {/* Input */}
            <div className="bg-canvas border border-border-gray rounded-lg p-6 mb-6">
              <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-[1px] mb-3">
                Your Summary
              </p>
              <p className="text-[16px] text-near-black leading-[1.6]">
                {DEMO_SUMMARY}
              </p>
              <div className="mt-4 flex justify-end">
                <span className="bg-webflow-blue text-white rounded-md px-4 py-2 text-[14px] font-medium shadow-sm">
                  Generate
                </span>
              </div>
            </div>

            {/* Output */}
            <div className="grid gap-3">
              {DEMO_ENTRIES.map((entry) => (
                <div
                  key={entry.day}
                  className="bg-canvas border border-border-gray rounded-lg px-6 py-4 flex items-start gap-4"
                >
                  <span className="shrink-0 w-12 text-[10px] font-semibold text-webflow-blue uppercase tracking-[1px] pt-0.5">
                    {entry.day}
                  </span>
                  <p className="text-[15px] text-gray-700 leading-[1.55]">
                    {entry.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="py-24 px-6 border-t border-border-gray">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-semibold text-webflow-blue uppercase tracking-[1.5px] mb-3">
              Testimonials
            </p>
            <h2 className="font-display font-semibold text-[clamp(2rem,4vw,3.5rem)] leading-[1.04] tracking-[-0.03em] text-near-black">
              Loved by IT students
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-canvas border border-border-gray rounded-lg p-8 hover:shadow-card transition-shadow duration-300 flex flex-col"
              >
                <p className="text-[16px] text-gray-700 leading-[1.6] flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 pt-6 border-t border-border-gray">
                  <p className="font-semibold text-[14px] text-near-black">{t.name}</p>
                  <p className="text-[13px] text-mid-gray mt-0.5">{t.school} &middot; {t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section id="pricing" className="py-24 px-6 bg-surface border-t border-border-gray">
        <div className="max-w-[700px] mx-auto text-center">
          <p className="text-[10px] font-semibold text-webflow-blue uppercase tracking-[1.5px] mb-3">
            Get Started Free
          </p>
          <h2 className="font-display font-semibold text-[clamp(2rem,4vw,3.5rem)] leading-[1.04] tracking-[-0.03em] text-near-black">
            Stop dreading your&nbsp;logbook
          </h2>
          <p className="mt-4 text-[18px] text-mid-gray leading-[1.5] max-w-[480px] mx-auto">
            4 free AI generations per month. No credit card required. Sign in with Google and start writing.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-webflow-blue text-white rounded-md px-8 py-4 text-[16px] font-medium shadow-sm hover:bg-blue-hover hover:translate-y-[2px] active:translate-y-0 transition-all duration-200"
            >
              Start Writing for Free
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 11.5L11.5 4.5" />
                <path d="M5 4.5H11.5V11" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="border-t border-border-gray py-12 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-display font-bold text-[16px] text-near-black">
              SwiftLogNG
            </span>
            <p className="text-[13px] text-mid-gray">
              AI-powered SIWES logbook for Nigerian IT students.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="text-[14px] font-medium text-mid-gray hover:text-near-black transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-[14px] font-medium text-mid-gray hover:text-near-black transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="text-[14px] font-medium text-mid-gray hover:text-near-black transition-colors">
              Pricing
            </a>
          </div>

          <p className="text-[12px] text-gray-300">
            &copy; {new Date().getFullYear()} SwiftLogNG. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
