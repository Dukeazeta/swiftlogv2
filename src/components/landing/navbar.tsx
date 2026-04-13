"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-50 w-full bg-transparent">
      <nav className="max-w-[1200px] mx-auto flex items-center justify-between px-6 h-16">
        <Link
          href="/"
          className="font-display font-bold text-[17px] text-near-black tracking-[-0.02em]"
        >
          SwiftLogNG
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[15px] font-medium text-gray-700 hover:text-near-black transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-[14px] font-medium text-gray-700 hover:text-near-black transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/login"
            className="bg-webflow-blue text-white rounded-md px-5 py-2.5 text-[14px] font-medium shadow-sm hover:bg-blue-hover hover:translate-y-[2px] transition-all duration-200"
          >
            Get Started
          </Link>
        </div>

        <button
          className="md:hidden w-10 h-10 flex items-center justify-center"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {isOpen && (
        <div className="md:hidden bg-canvas/80 backdrop-blur-xl">
          <div className="px-6 py-4 space-y-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block text-[15px] font-medium text-gray-700 hover:text-near-black transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <Link
                href="/login"
                className="text-[14px] font-medium text-gray-700 hover:text-near-black transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/login"
                className="bg-webflow-blue text-white rounded-md px-5 py-2.5 text-[14px] font-medium text-center hover:bg-blue-hover transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
