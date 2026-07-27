"use client";

import Link from "next/link";
import React, { useState } from "react";
import { usePathname } from "next/navigation";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname(); // Чтобы подсвечивать активную страницу

  const navLinks = [
    { href: "/", label: "Ачык сынактар" },
    { href: "/closed-competiton", label: "Жабык конкурстар" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Логотип */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group transition-transform active:scale-98"
        >
          <img
            src="/logo.png"
            alt="Окуу Китеби"
            className="h-9 w-9 rounded-full object-cover ring-2 ring-brand/10 transition group-hover:ring-brand/30"
          />
          <span className="text-base font-bold tracking-tight text-text sm:text-lg bg-gradient-to-r from-text to-slate-700 bg-clip-text">
            Kitepkura
          </span>
        </Link>

        {/* Десктоп-навигация */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 text-sm font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-brand after:transition-transform after:duration-200 hover:after:origin-bottom-left hover:after:scale-x-100 ${
                  isActive
                    ? "text-brand after:scale-x-100"
                    : "text-slate-600 hover:text-text"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <Link
            href={"/"}
            className="ml-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-sm shadow-brand/20 transition-all duration-200 hover:bg-brand-hover hover:shadow-md hover:shadow-brand/30 active:scale-95"
          >
            Арыз берүү
          </Link>
        </nav>

        {/* Мобильная кнопка-гамбургер */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Меню"
          aria-expanded={menuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 md:hidden active:scale-90"
        >
          {menuOpen ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="animate-in fade-in zoom-in-75 duration-150"
            >
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="animate-in fade-in zoom-in-75 duration-150"
            >
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Мобильное меню (Плавающая панель) */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full border-b border-border bg-white px-4 py-4 md:hidden shadow-lg shadow-slate-100/50 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand/5 text-brand"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <hr className="my-2 border-border/60" />
            <Link
              href={"/"}
              onClick={() => setMenuOpen(false)}
              className="rounded-xl bg-brand py-3 text-center text-sm font-semibold text-brand-foreground shadow-sm transition hover:bg-brand-hover"
            >
              Арыз берүү
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
